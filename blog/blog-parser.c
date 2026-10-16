/*
 * blog-parser.c — markdown -> TSX generator for the blog.
 *
 * Usage:
 *   ./parser [options] <entry.md>
 *
 *     --outdir <dir>            output directory (default: <repo>/src/pages/blog)
 *     --stdout                  write the component to stdout instead of a file
 *     --date <DD-MM-YYYY>       override the date given in the entry
 *     --root <dir>              override project-root autodetection
 *     --wrap <n>                wrap column, 0 disables (default: 81)
 *     --no-footnote-heuristic   render a trailing italic P.S. as a normal paragraph
 *     --quiet                   suppress the per-entry progress line
 *
 * An entry is a markdown file whose first lines are:
 *
 *     <!-- entry_01 -->
 *     10-10-2026
 *
 *     # TITLE: The Cost of Efficiency
 *
 *     ...body...
 *
 * The entry id (entry_01) is the entry's identity: it names the output file
 * (entry_01.tsx), the route (/blog/entry_01), and the listing label
 * (entry_01.md).  The title is display-only, so retitling an entry never
 * moves its URL.
 *
 * Output is a TSX component exporting `meta` and a default component.  The
 * generated files are committed, so building the site never needs a C
 * compiler.
 *
 * Build:
 *   gcc -O2 -Wall -Wextra -std=c99 -pedantic -o parser blog-parser.c
 *
 * Dependencies:
 *   none
 */

/*
 * Must come before any include: -std=c99 turns off the POSIX declarations
 * that readlink/getcwd/access/dirname need.
 */
#ifndef _POSIX_C_SOURCE
#define _POSIX_C_SOURCE 200809L
#endif

#include <ctype.h>
#include <errno.h>
#include <libgen.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>

/* ---------- constants ---------- */

#define WRAP_DEFAULT 81
#define INDENT_BODY  10          /* indent of a block inside the space-y-4 div */
#define INDENT_STEP  2
#define MAX_DEPTH    8

#define DIVIDER \
    "─────────────────────────────"

#define MAIN_CLASS \
    "bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed"

#define LINK_CLASS "text-tertiary hover:text-primary transition-colors underline"
#define CODE_CLASS "bg-surface rounded px-1 text-text-bright"

/* ---------- growable buffer ---------- */

/*
 * Growth policy shared by the output buffer and every vector:
 *   new_cap = cap ? cap : 128;  while (new_cap < need) new_cap *= 2;
 * Doubling keeps appends amortised O(n).  An Obuf always keeps a NUL at
 * data[len] so data is usable as a C string; len never counts it.
 *
 * GROW expands to a `return -1` on allocation failure, so every function
 * using it returns int and the failure cannot be swallowed; -1 propagates
 * up to main's cleanup: label.
 */
#define GROW(ptr, cap, need, type)                                          \
    do {                                                                    \
        if ((need) > (cap)) {                                               \
            size_t grow_nc = (cap) ? (cap) : 128;                           \
            while (grow_nc < (need)) grow_nc *= 2;                          \
            type *grow_np = realloc((ptr), grow_nc * sizeof *grow_np);       \
            if (!grow_np) return -1;                                        \
            (ptr) = grow_np;                                                \
            (cap) = grow_nc;                                                \
        }                                                                   \
    } while (0)

typedef struct {
    char  *data;
    size_t len;
    size_t cap;
} Obuf;

static int obuf_reserve(Obuf *b, size_t need)
{
    size_t want = b->len + need + 1;
    GROW(b->data, b->cap, want, char);
    return 0;
}

static int obuf_init(Obuf *b, size_t cap)
{
    if (cap < 16) cap = 16;
    b->data = malloc(cap);
    if (!b->data) return -1;
    b->len = 0;
    b->cap = cap;
    b->data[0] = '\0';
    return 0;
}

static void obuf_free(Obuf *b)
{
    free(b->data);
    b->data = NULL;
    b->len = b->cap = 0;
}

static int obuf_putc(Obuf *b, char c)
{
    if (obuf_reserve(b, 1) != 0) return -1;
    b->data[b->len++] = c;
    b->data[b->len] = '\0';
    return 0;
}

static int obuf_putn(Obuf *b, const char *s, size_t n)
{
    if (n == 0) return 0;
    if (obuf_reserve(b, n) != 0) return -1;
    memcpy(b->data + b->len, s, n);
    b->len += n;
    b->data[b->len] = '\0';
    return 0;
}

static int obuf_puts(Obuf *b, const char *s)
{
    return obuf_putn(b, s, strlen(s));
}

static int obuf_printf(Obuf *b, const char *fmt, ...)
{
    va_list ap;
    int n;

    va_start(ap, fmt);
    n = vsnprintf(NULL, 0, fmt, ap);
    va_end(ap);
    if (n < 0) return -1;

    if (obuf_reserve(b, (size_t)n) != 0) return -1;
    va_start(ap, fmt);
    vsnprintf(b->data + b->len, (size_t)n + 1, fmt, ap);
    va_end(ap);
    b->len += (size_t)n;
    return 0;
}

/* ---------- slices and text ---------- */

typedef struct {
    const char *p;
    size_t      n;
} Slice;

static Slice slice_trim(Slice s)
{
    while (s.n > 0 && isspace((unsigned char)s.p[0])) { s.p++; s.n--; }
    while (s.n > 0 && isspace((unsigned char)s.p[s.n - 1])) s.n--;
    return s;
}

static int slice_eq(Slice s, const char *lit)
{
    size_t n = strlen(lit);
    return s.n == n && memcmp(s.p, lit, n) == 0;
}

static int slice_starts_with(Slice s, const char *lit)
{
    size_t n = strlen(lit);
    return s.n >= n && memcmp(s.p, lit, n) == 0;
}

static char *xstrndup(const char *p, size_t n)
{
    char *out = malloc(n + 1);
    if (!out) return NULL;
    memcpy(out, p, n);
    out[n] = '\0';
    return out;
}

/* Bytes in the UTF-8 sequence starting with byte c (1 if it is not a lead). */
static size_t utf8_len(unsigned char c)
{
    if (c < 0x80) return 1;
    if ((c & 0xE0) == 0xC0) return 2;
    if ((c & 0xF0) == 0xE0) return 3;
    if ((c & 0xF8) == 0xF0) return 4;
    return 1;
}

/*
 * The single place CRLF is handled.  Returns the next line as a Slice with
 * the newline and any \r stripped, advancing *pp past it.  Returns 0 when
 * *pp has reached end.
 */
static int next_line(const char **pp, const char *end, Slice *out)
{
    const char *p = *pp;
    const char *nl;

    if (p >= end) return 0;

    nl = memchr(p, '\n', (size_t)(end - p));
    if (nl) {
        out->p = p;
        out->n = (size_t)(nl - p);
        *pp = nl + 1;
    } else {
        out->p = p;
        out->n = (size_t)(end - p);
        *pp = end;
    }
    if (out->n > 0 && out->p[out->n - 1] == '\r') out->n--;
    return 1;
}

static int is_blank(Slice s)
{
    for (size_t i = 0; i < s.n; i++)
        if (!isspace((unsigned char)s.p[i])) return 0;
    return 1;
}

static size_t leading_spaces(Slice s)
{
    size_t i = 0;
    while (i < s.n && s.p[i] == ' ') i++;
    return i;
}

/* ---------- semantic class table ---------- */

static const struct {
    const char *name;
    const char *cls;
} SEM_CLASSES[] = {
    { "danger",     "text-danger font-bold" },
    { "success",    "text-success font-bold" },
    { "primary",    "text-primary font-bold" },
    { "muted",      "text-text-muted" },
    { "muted-bold", "text-text-muted font-bold" },
    { "tertiary",   "text-tertiary" },
    { "quaternary", "text-quaternary" },
    { "secondary",  "text-secondary" },
    { "bright",     "text-text-bright font-bold" },
    { NULL, NULL }
};

static const char *sem_lookup(const char *name, size_t n)
{
    for (size_t i = 0; SEM_CLASSES[i].name; i++) {
        if (strlen(SEM_CLASSES[i].name) == n &&
            memcmp(SEM_CLASSES[i].name, name, n) == 0)
            return SEM_CLASSES[i].cls;
    }
    return NULL;
}

/* ---------- inline tokens ---------- */

typedef enum {
    TOK_TEXT,
    TOK_CODE,
    TOK_EM_OPEN, TOK_EM_CLOSE,
    TOK_STRONG_OPEN, TOK_STRONG_CLOSE,
    TOK_LINK_OPEN, TOK_LINK_CLOSE,
    TOK_IMAGE,
    TOK_SEM_OPEN, TOK_SEM_CLOSE
} TokKind;

typedef struct {
    TokKind     kind;
    Obuf        text;    /* TEXT, CODE */
    char       *attr;    /* LINK_OPEN href, IMAGE src */
    char       *alt;     /* LINK_OPEN title, IMAGE alt */
    const char *klass;   /* SEM_OPEN: points into SEM_CLASSES */
} Tok;

typedef struct {
    Tok   *v;
    size_t n, cap;
} TokVec;

static int tokvec_push(TokVec *tv, Tok t)
{
    GROW(tv->v, tv->cap, tv->n + 1, Tok);
    tv->v[tv->n++] = t;
    return 0;
}

static int tok_text(TokVec *tv, const char *p, size_t n)
{
    Tok t;
    memset(&t, 0, sizeof t);
    t.kind = TOK_TEXT;
    if (obuf_init(&t.text, n + 1) != 0) return -1;
    if (obuf_putn(&t.text, p, n) != 0) { obuf_free(&t.text); return -1; }
    return tokvec_push(tv, t);
}

static int tok_marker(TokVec *tv, TokKind k)
{
    Tok t;
    memset(&t, 0, sizeof t);
    t.kind = k;
    return tokvec_push(tv, t);
}

static void toks_free(TokVec *tv)
{
    for (size_t i = 0; i < tv->n; i++) {
        obuf_free(&tv->v[i].text);
        free(tv->v[i].attr);
        free(tv->v[i].alt);
    }
    free(tv->v);
    tv->v = NULL;
    tv->n = tv->cap = 0;
}

static int tok_is_open(TokKind k)
{
    return k == TOK_EM_OPEN || k == TOK_STRONG_OPEN ||
           k == TOK_LINK_OPEN || k == TOK_SEM_OPEN;
}

static int tok_is_close(TokKind k)
{
    return k == TOK_EM_CLOSE || k == TOK_STRONG_CLOSE ||
           k == TOK_LINK_CLOSE || k == TOK_SEM_CLOSE;
}

/* ---------- inline parser ---------- */

#define MAX_INLINE_DEPTH 16

static int is_escapable(char c)
{
    return strchr("\\`*_[]()!<>{}#+-.", c) != NULL;
}

/* Past a code span opened at p, or p itself if there is none. */
static const char *skip_code_span(const char *p, const char *end)
{
    const char *q = p;
    size_t run = 0;

    while (q < end && *q == '`') { q++; run++; }
    while (q < end) {
        if (*q == '`') {
            const char *r = q;
            size_t n = 0;
            while (r < end && *r == '`') { r++; n++; }
            if (n == run) return r;
            q = r;
        } else {
            q++;
        }
    }
    return p;
}

static int parse_inline(const char *text_start, const char *p, const char *end,
                        TokVec *out, int depth);

static int is_punct_ch(unsigned char c)
{
    return ispunct(c) != 0;
}

/*
 * CommonMark flanking.  For '_' the intraword rule keeps snake_case_here
 * literal while letting _emphasis_ work — supporting '_' without the rule
 * would silently mangle any entry that mentions an identifier.
 */
static void flanking(const char *text_start, const char *end, const char *run,
                     size_t runlen, char ch, int *can_open, int *can_close)
{
    unsigned char before = 0, after = 0;
    int left, right;

    if (run > text_start) before = (unsigned char)run[-1];
    if (run + runlen < end) after = (unsigned char)run[runlen];

    left = (after != 0) && !isspace(after) &&
           !(is_punct_ch(after) && !(before == 0 || isspace(before) ||
                                     is_punct_ch(before)));
    right = (before != 0) && !isspace(before) &&
            !(is_punct_ch(before) && !(after == 0 || isspace(after) ||
                                       is_punct_ch(after)));

    if (ch == '_') {
        *can_open = left && (!right || is_punct_ch(before));
        *can_close = right && (!left || is_punct_ch(after));
    } else {
        *can_open = left;
        *can_close = right;
    }
}

/*
 * Nearest closer for a delimiter run of ch needing `need` characters,
 * searching from `from`.  Skips escapes and code spans, so a '*' inside
 * `code` never closes an emphasis, and tracks nesting depth so a run that
 * belongs to an inner pair is not mistaken for ours: in `*a **b** c*` the
 * `**` runs open and close an inner pair, and the outer em must keep looking
 * for the final `*`.  Returns NULL when there is no closer.
 */
static const char *find_closer(const char *text_start, const char *from,
                               const char *end, char ch, size_t need,
                               size_t *runlen_out)
{
    const char *q = from;
    int depth = 0;

    while (q < end) {
        const char *r;
        size_t n = 0;
        int co = 0, cc = 0;

        if (*q == '\\' && q + 1 < end) { q += 2; continue; }
        if (*q == '`') {
            r = skip_code_span(q, end);
            if (r != q) { q = r; continue; }
        }
        if (*q != ch) { q++; continue; }

        r = q;
        while (r < end && *r == ch) { r++; n++; }
        flanking(text_start, end, q, n, ch, &co, &cc);

        if (cc && depth == 0 && n >= need) {
            *runlen_out = n;
            return q;
        }
        /* An ambiguous run belongs to an inner pair rather than to ours. */
        if (co) depth++;
        else if (cc && depth > 0) depth--;

        q = r;
    }
    return NULL;
}

/* Read a code span at p; 1 if consumed, 0 if p is a literal backtick. */
static int try_code_span(const char *p, const char *end, const char **next,
                         TokVec *out)
{
    const char *q = p, *body, *body_end;
    size_t run = 0, n = 0;
    Tok t;

    while (q < end && *q == '`') { q++; run++; }
    body = q;
    while (q < end) {
        if (*q == '`') {
            const char *r = q;
            n = 0;
            while (r < end && *r == '`') { r++; n++; }
            if (n == run) break;
            q = r;
        } else {
            q++;
        }
    }
    if (q >= end || n != run) return 0;      /* unterminated */

    body_end = q;
    if (body_end - body >= 2 && body[0] == ' ' && body_end[-1] == ' ') {
        int all_space = 1;
        for (const char *s = body; s < body_end; s++) {
            if (*s != ' ') { all_space = 0; break; }
        }
        if (!all_space) { body++; body_end--; }
    }

    memset(&t, 0, sizeof t);
    t.kind = TOK_CODE;
    if (obuf_init(&t.text, (size_t)(body_end - body) + 1) != 0) return -1;
    if (obuf_putn(&t.text, body, (size_t)(body_end - body)) != 0) {
        obuf_free(&t.text);
        return -1;
    }
    if (tokvec_push(out, t) != 0) { obuf_free(&t.text); return -1; }

    *next = q + run;
    return 1;
}

/* Matching ']' for the bracket opened at p (p points at '['). */
static const char *find_bracket_close(const char *p, const char *end)
{
    int depth = 0;
    for (const char *q = p; q < end; q++) {
        if (*q == '\\' && q + 1 < end) { q++; continue; }
        if (*q == '`') {
            const char *r = skip_code_span(q, end);
            if (r != q) { q = r - 1; continue; }
        }
        if (*q == '[') depth++;
        else if (*q == ']') { depth--; if (depth == 0) return q; }
    }
    return NULL;
}

/* Matching ')' for the '(' at p, honouring <...> and backslash escapes. */
static const char *find_paren_close(const char *p, const char *end)
{
    int depth = 0, in_angle = 0;
    for (const char *q = p; q < end; q++) {
        if (*q == '\\' && q + 1 < end) { q++; continue; }
        if (*q == '<') in_angle = 1;
        else if (*q == '>') in_angle = 0;
        else if (!in_angle && *q == '(') depth++;
        else if (!in_angle && *q == ')') { depth--; if (depth == 0) return q; }
    }
    return NULL;
}

/* Split "dest" or "dest \"title\"" (or '<dest>' / \"'title'\"). */
static int parse_link_dest(const char *p, const char *end,
                           char **dest_out, char **title_out)
{
    Slice s;
    char *dest = NULL, *title = NULL;

    *dest_out = NULL;
    *title_out = NULL;

    s.p = p;
    s.n = (size_t)(end - p);
    s = slice_trim(s);
    if (s.n == 0) return 0;

    if (s.p[0] == '<') {
        size_t i = 1;
        while (i < s.n && s.p[i] != '>') i++;
        if (i >= s.n) return 0;
        dest = xstrndup(s.p + 1, i - 1);
        s.p += i + 1;
        s.n -= i + 1;
    } else {
        size_t i = 0;
        int angle = 0;
        while (i < s.n) {
            if (s.p[i] == '<') angle = 1;
            else if (s.p[i] == '>') angle = 0;
            else if (!angle && isspace((unsigned char)s.p[i])) break;
            i++;
        }
        dest = xstrndup(s.p, i);
        s.p += i;
        s.n -= i;
    }
    if (!dest) return -1;

    s = slice_trim(s);
    if (s.n > 0) {
        char open = s.p[0];
        char close = (open == '(') ? ')' : open;
        if ((open == '"' || open == '\'' || open == '(') &&
            s.n >= 2 && s.p[s.n - 1] == close) {
            title = xstrndup(s.p + 1, s.n - 2);
            if (!title) { free(dest); return -1; }
        }
    }

    *dest_out = dest;
    *title_out = title;
    return 1;
}

/*
 * Blank out a URL whose scheme is not http/https/mailto.  Entries are the
 * author's own today, but a javascript: URL in a markdown file that arrived
 * from anywhere else would be an XSS in a page with no other injection
 * surface.
 */
static void safe_url(char *url)
{
    size_t i = 0;
    while (url[i] && (isalnum((unsigned char)url[i]) ||
                      url[i] == '+' || url[i] == '-' || url[i] == '.'))
        i++;
    if (i == 0 || url[i] != ':') return;              /* no scheme */
    if (strncmp(url, "http:", 5) == 0) return;
    if (strncmp(url, "https:", 6) == 0) return;
    if (strncmp(url, "mailto:", 7) == 0) return;
    url[0] = '#';
    url[1] = '\0';
}

/*
 * [label](dest "title"), ![alt](src), or [text]{.class}.
 * Returns bytes consumed, 0 if this is not one of those, -1 on OOM.
 */
static int try_bracket(const char *text_start, const char *p, const char *end,
                       TokVec *out, int depth)
{
    int is_image = 0;
    const char *bstart = p, *bclose, *q;

    if (depth > MAX_INLINE_DEPTH) return 0;

    if (*p == '!') {
        if (p + 1 >= end || p[1] != '[') return 0;
        is_image = 1;
        bstart = p + 1;
    }
    if (*bstart != '[') return 0;

    bclose = find_bracket_close(bstart, end);
    if (!bclose) return 0;
    q = bclose + 1;

    if (!is_image && q < end && *q == '{') {
        const char *c = q + 1;
        const char *name = NULL;
        size_t namelen = 0;
        const char *cls;

        while (c < end && *c != '}') {
            if (*c == '.') {
                const char *s = c + 1;
                while (s < end && (isalnum((unsigned char)*s) || *s == '-')) s++;
                if (!name && s > c + 1) { name = c + 1; namelen = (size_t)(s - c - 1); }
                c = s;
            } else if (*c == ' ') {
                c++;
            } else {
                return 0;
            }
        }
        if (c >= end || *c != '}' || !name) return 0;
        cls = sem_lookup(name, namelen);
        if (!cls) return 0;                  /* unknown class: literal text */

        if (tok_marker(out, TOK_SEM_OPEN) != 0) return -1;
        out->v[out->n - 1].klass = cls;
        if (parse_inline(text_start, bstart + 1, bclose, out, depth + 1) != 0)
            return -1;
        if (tok_marker(out, TOK_SEM_CLOSE) != 0) return -1;
        return (int)(c + 1 - p);
    }

    if (q >= end || *q != '(') return 0;

    {
        const char *pclose = find_paren_close(q, end);
        char *dest = NULL, *title = NULL;
        int rc;

        if (!pclose) return 0;
        rc = parse_link_dest(q + 1, pclose, &dest, &title);
        if (rc <= 0) return rc;

        safe_url(dest);

        if (is_image) {
            Tok t;
            memset(&t, 0, sizeof t);
            t.kind = TOK_IMAGE;
            t.attr = dest;
            t.alt = xstrndup(bstart + 1, (size_t)(bclose - bstart - 1));
            free(title);
            if (!t.alt) { free(dest); return -1; }
            if (tokvec_push(out, t) != 0) { free(t.attr); free(t.alt); return -1; }
            return (int)(pclose + 1 - p);
        }

        if (tok_marker(out, TOK_LINK_OPEN) != 0) { free(dest); free(title); return -1; }
        out->v[out->n - 1].attr = dest;
        out->v[out->n - 1].alt = title;
        if (parse_inline(text_start, bstart + 1, bclose, out, depth + 1) != 0)
            return -1;
        if (tok_marker(out, TOK_LINK_CLOSE) != 0) return -1;
        return (int)(pclose + 1 - p);
    }
}

static int parse_inline(const char *text_start, const char *p, const char *end,
                        TokVec *out, int depth)
{
    const char *q = p;

    if (depth > MAX_INLINE_DEPTH) return tok_text(out, p, (size_t)(end - p));

    while (q < end) {
        unsigned char c = (unsigned char)*q;

        if (c == '\\' && q + 1 < end && is_escapable(q[1])) {
            if (tok_text(out, q + 1, 1) != 0) return -1;
            q += 2;
            continue;
        }
        if (c == '`') {
            const char *next = NULL;
            int rc = try_code_span(q, end, &next, out);
            if (rc < 0) return -1;
            if (rc > 0) { q = next; continue; }
            if (tok_text(out, q, 1) != 0) return -1;
            q++;
            continue;
        }
        if (c == '[' || (c == '!' && q + 1 < end && q[1] == '[')) {
            int rc = try_bracket(text_start, q, end, out, depth);
            if (rc < 0) return -1;
            if (rc > 0) { q += rc; continue; }
            if (tok_text(out, q, 1) != 0) return -1;
            q++;
            continue;
        }
        if (c == '*' || c == '_') {
            const char *run = q;
            const char *after;
            size_t runlen = 0, close_run = 0, use;
            int can_open = 0, can_close = 0;
            const char *closer;

            while (q < end && (unsigned char)*q == c) { q++; runlen++; }
            after = q;
            flanking(text_start, end, run, runlen, (char)c, &can_open, &can_close);

            /*
             * 1 -> em; >=2 -> strong when even, em when odd.  Taking one
             * character off an odd run leaves an even run inside, so
             * ***x*** nests as em(strong(x)) the way CommonMark does.
             */
            use = (runlen == 1) ? 1 : ((runlen % 2 == 0) ? 2 : 1);

            closer = can_open
                ? find_closer(text_start, after, end, (char)c, use, &close_run)
                : NULL;

            if (closer) {
                if (tok_marker(out, use == 2 ? TOK_STRONG_OPEN : TOK_EM_OPEN) != 0)
                    return -1;
                if (parse_inline(text_start, run + use,
                                 closer + close_run - use, out, depth + 1) != 0)
                    return -1;
                if (tok_marker(out, use == 2 ? TOK_STRONG_CLOSE : TOK_EM_CLOSE) != 0)
                    return -1;
                q = closer + close_run;
                continue;
            }

            /* No opener or no closer: the run is literal text. */
            if (tok_text(out, run, runlen) != 0) return -1;
            continue;
        }
        if (c >= 0x80) {
            size_t n = utf8_len(c);
            if (q + n > end) n = (size_t)(end - q);
            if (tok_text(out, q, n) != 0) return -1;
            q += n;
            continue;
        }

        {
            const char *s = q;
            while (q < end) {
                unsigned char d = (unsigned char)*q;
                if (d == '\\' || d == '`' || d == '[' || d == '*' ||
                    d == '_' || d == '!' || d >= 0x80)
                    break;
                q++;
            }
            if (q > s) {
                if (tok_text(out, s, (size_t)(q - s)) != 0) return -1;
            } else {
                if (tok_text(out, q, 1) != 0) return -1;   /* '!' alone */
                q++;
            }
        }
    }
    return 0;
}

/* ---------- blocks ---------- */

typedef enum {
    BLOCK_PARAGRAPH,
    BLOCK_HEADING,
    BLOCK_CODE,
    BLOCK_LIST_UL,
    BLOCK_LIST_OL,
    BLOCK_BLOCKQUOTE,
    BLOCK_HR
} BlockKind;

typedef struct Block Block;

struct Block {
    BlockKind  kind;
    int        level;         /* HEADING */
    char      *lang;          /* CODE */
    Obuf       raw;           /* CODE: verbatim body */
    TokVec     toks;          /* PARAGRAPH, HEADING */
    Block     *kids;          /* BLOCKQUOTE */
    Block    **items;         /* LIST_*: each item's own block list */
    size_t     nitems, itemcap;
    Block     *next;
};

static Block *block_new(BlockKind kind)
{
    Block *b = calloc(1, sizeof *b);
    if (!b) return NULL;
    b->kind = kind;
    if (obuf_init(&b->raw, 16) != 0) { free(b); return NULL; }
    return b;
}

static void block_free_list(Block *b)
{
    while (b) {
        Block *next = b->next;
        free(b->lang);
        obuf_free(&b->raw);
        toks_free(&b->toks);
        block_free_list(b->kids);
        for (size_t i = 0; i < b->nitems; i++) block_free_list(b->items[i]);
        free(b->items);
        free(b);
        b = next;
    }
}

static int list_push(Block *b, Block *item)
{
    GROW(b->items, b->itemcap, b->nitems + 1, Block *);
    b->items[b->nitems++] = item;
    return 0;
}

/* A marker at the start of a line (leading spaces allowed). */
static int match_list_marker(Slice s, size_t *marker_end, int *ordered)
{
    size_t i = leading_spaces(s);

    if (i >= s.n) return 0;

    if (s.p[i] == '-' || s.p[i] == '*' || s.p[i] == '+') {
        size_t j;
        if (i + 1 >= s.n || s.p[i + 1] != ' ') return 0;
        j = i + 1;
        while (j < s.n && s.p[j] == ' ') j++;
        *ordered = 0;
        *marker_end = j;
        return 1;
    }
    if (isdigit((unsigned char)s.p[i])) {
        size_t j = i;
        while (j < s.n && isdigit((unsigned char)s.p[j])) j++;
        if (j < s.n && (s.p[j] == '.' || s.p[j] == ')') &&
            j + 1 < s.n && s.p[j + 1] == ' ') {
            size_t k = j + 1;
            while (k < s.n && s.p[k] == ' ') k++;
            *ordered = 1;
            *marker_end = k;
            return 1;
        }
    }
    return 0;
}

static int is_hr_line(Slice s)
{
    size_t ws = leading_spaces(s);
    char c;
    size_t count = 0;

    if (ws >= s.n) return 0;
    c = s.p[ws];
    if (c != '-' && c != '*' && c != '_') return 0;
    for (size_t i = ws; i < s.n; i++) {
        if (s.p[i] == c) count++;
        else if (s.p[i] != ' ') return 0;
    }
    return count >= 3;
}

static int match_heading(Slice s, int *level_out, Slice *text_out)
{
    size_t i = leading_spaces(s), hashes = 0;

    while (i < s.n && s.p[i] == '#') { i++; hashes++; }
    if (hashes < 1 || hashes > 6) return 0;
    if (i >= s.n || s.p[i] != ' ') return 0;

    while (i < s.n && s.p[i] == ' ') i++;
    text_out->p = s.p + i;
    text_out->n = s.n - i;
    while (text_out->n > 0 && text_out->p[text_out->n - 1] == '#') text_out->n--;
    *text_out = slice_trim(*text_out);
    *level_out = (int)hashes;
    return 1;
}

static int match_fence(Slice s, Slice *lang_out, size_t *fence_len_out)
{
    size_t i = leading_spaces(s), n = 0;

    while (i < s.n && s.p[i] == '`') { i++; n++; }
    if (n < 3) return 0;
    *fence_len_out = n;
    while (i < s.n && s.p[i] == ' ') i++;
    lang_out->p = s.p + i;
    lang_out->n = s.n - i;
    *lang_out = slice_trim(*lang_out);
    return 1;
}

static int is_fence_close(Slice s, size_t fence_len)
{
    size_t i = leading_spaces(s), n = 0;
    while (i < s.n && s.p[i] == '`') { i++; n++; }
    if (n < fence_len) return 0;
    return is_blank((Slice){ s.p + i, s.n - i });
}

static int starts_block(Slice s)
{
    Slice lang;
    size_t fence = 0, marker = 0;
    int level = 0, ordered = 0;

    if (match_fence(s, &lang, &fence)) return 1;
    if (is_hr_line(s)) return 1;
    if (match_heading(s, &level, &lang)) return 1;
    if (match_list_marker(s, &marker, &ordered)) return 1;
    {
        size_t w = leading_spaces(s);
        if (w < s.n && s.p[w] == '>') return 1;
    }
    return 0;
}

static Block *parse_blocks(const char **pp, const char *end, int depth);

static Block *parse_blocks(const char **pp, const char *end, int depth)
{
    Block *head = NULL, **tail = &head;

    if (depth > MAX_DEPTH) return NULL;

    while (*pp < end) {
        Slice line;
        int level = 0;
        Slice htext;
        Slice lang;
        size_t fence_len = 0;

        if (!next_line(pp, end, &line)) break;
        if (is_blank(line)) continue;

        /* ---- fenced code ---- */
        if (match_fence(line, &lang, &fence_len)) {
            Block *b = block_new(BLOCK_CODE);
            if (!b) return head;
            if (lang.n > 0) {
                b->lang = xstrndup(lang.p, lang.n);
                if (!b->lang) { block_free_list(b); return head; }
            }
            for (;;) {
                const char *save = *pp;
                Slice raw;
                if (!next_line(pp, end, &raw)) break;
                if (is_fence_close(raw, fence_len)) break;
                *pp = save;
                if (!next_line(pp, end, &raw)) break;
                if (obuf_putn(&b->raw, raw.p, raw.n) != 0) break;
                if (obuf_putc(&b->raw, '\n') != 0) break;
            }
            /* the newline after the last code line is not part of the code */
            if (b->raw.len > 0 && b->raw.data[b->raw.len - 1] == '\n') {
                b->raw.len--;
                b->raw.data[b->raw.len] = '\0';
            }
            *tail = b;
            tail = &b->next;
            continue;
        }

        /* ---- horizontal rule ---- */
        if (is_hr_line(line)) {
            Block *b = block_new(BLOCK_HR);
            if (!b) return head;
            *tail = b;
            tail = &b->next;
            continue;
        }

        /* ---- heading ---- */
        if (match_heading(line, &level, &htext)) {
            Block *b = block_new(BLOCK_HEADING);
            if (!b) return head;
            b->level = level;
            if (parse_inline(htext.p, htext.p, htext.p + htext.n, &b->toks, 0) != 0) {
                block_free_list(b);
                return head;
            }
            *tail = b;
            tail = &b->next;
            continue;
        }

        /* ---- blockquote ---- */
        {
            size_t w = leading_spaces(line);
            if (w < line.n && line.p[w] == '>') {
                Block *b = block_new(BLOCK_BLOCKQUOTE);
                Obuf inner;
                const char *ip;

                if (!b) return head;
                if (obuf_init(&inner, 64) != 0) { free(b); return head; }

                for (;;) {
                    size_t cw = leading_spaces(line);
                    const char *c = line.p + cw + 1;
                    size_t n = line.n - cw - 1;

                    if (n > 0 && *c == ' ') { c++; n--; }
                    if (obuf_putn(&inner, c, n) != 0) break;
                    if (obuf_putc(&inner, '\n') != 0) break;

                    if (!next_line(pp, end, &line)) break;
                    /* A blank line ends the quote; a '>' line with nothing
                     * after it is not blank, and gives a paragraph break. */
                    if (is_blank(line)) break;
                    if (line.p[leading_spaces(line)] != '>') break;
                }

                ip = inner.data;
                b->kids = parse_blocks(&ip, inner.data + inner.len, depth + 1);
                obuf_free(&inner);
                *tail = b;
                tail = &b->next;
                continue;
            }
        }

        /* ---- list ---- */
        {
            size_t marker_end = 0;
            int ordered = 0;
            if (match_list_marker(line, &marker_end, &ordered)) {
                Block *b = block_new(ordered ? BLOCK_LIST_OL : BLOCK_LIST_UL);
                int done = 0;

                if (!b) return head;

                while (!done) {
                    Obuf body;
                    Block *item;
                    size_t cont;

                    if (!match_list_marker(line, &marker_end, &ordered)) break;
                    cont = marker_end;
                    if (obuf_init(&body, 64) != 0) break;
                    if (obuf_putn(&body, line.p + marker_end,
                                  line.n - marker_end) != 0) {
                        obuf_free(&body);
                        break;
                    }
                    if (obuf_putc(&body, '\n') != 0) { obuf_free(&body); break; }

                    for (;;) {
                        const char *save;
                        Slice next;
                        size_t me = 0;
                        int ord = 0;

                        save = *pp;
                        if (!next_line(pp, end, &next)) { done = 1; break; }

                        if (is_blank(next)) {
                            const char *save2 = *pp;
                            Slice peek;
                            if (next_line(pp, end, &peek) && !is_blank(peek) &&
                                leading_spaces(peek) >= cont) {
                                if (obuf_putc(&body, '\n') != 0) { done = 1; break; }
                                line = peek;
                                continue;
                            }
                            *pp = save2;
                            done = 1;
                            break;
                        }
                        if (match_list_marker(next, &me, &ord) && me <= cont) {
                            *pp = save;      /* next item, or the list ends */
                            break;
                        }
                        /* continuation: nested block, or a lazy text line */
                        if (leading_spaces(next) > cont) {
                            size_t strip = leading_spaces(next) - cont;
                            if (obuf_putn(&body, next.p + strip,
                                          next.n - strip) != 0) { done = 1; break; }
                        } else if (leading_spaces(next) >= 2) {
                            size_t strip = leading_spaces(next);
                            if (obuf_putn(&body, next.p + strip,
                                          next.n - strip) != 0) { done = 1; break; }
                        } else if (match_list_marker(next, &me, &ord)) {
                            *pp = save;
                            break;
                        } else if (ord != ordered) {
                            *pp = save;
                            break;
                        } else {
                            if (obuf_putn(&body, next.p, next.n) != 0) { done = 1; break; }
                        }
                        if (obuf_putc(&body, '\n') != 0) { done = 1; break; }
                    }

                    {
                        const char *bp = body.data;
                        item = parse_blocks(&bp, body.data + body.len, depth + 1);
                    }
                    obuf_free(&body);
                    if (list_push(b, item) != 0) { block_free_list(item); break; }

                    if (done) break;
                    if (!next_line(pp, end, &line)) break;
                    while (is_blank(line) || is_blank((Slice){ line.p, 0 })) {
                        (void)line;
                        break;
                    }
                    if (!match_list_marker(line, &marker_end, &ordered)) break;
                    if (ordered != (b->kind == BLOCK_LIST_OL)) break;
                }

                *tail = b;
                tail = &b->next;
                continue;
            }
        }

        /* ---- paragraph ---- */
        {
            Block *b = block_new(BLOCK_PARAGRAPH);
            Obuf text;

            if (!b) return head;
            if (obuf_init(&text, 128) != 0) { free(b); return head; }

            for (;;) {
                Slice peek;
                const char *save = *pp;

                if (obuf_putn(&text, slice_trim(line).p,
                              slice_trim(line).n) != 0) break;
                if (!next_line(pp, end, &peek)) break;
                if (is_blank(peek)) break;
                if (starts_block(peek)) { *pp = save; break; }
                if (obuf_putc(&text, '\n') != 0) break;
                line = peek;
            }

            if (parse_inline(text.data, text.data, text.data + text.len,
                             &b->toks, 0) != 0) {
                obuf_free(&text);
                block_free_list(b);
                return head;
            }
            obuf_free(&text);
            *tail = b;
            tail = &b->next;
        }
    }

    return head;
}

/* ---------- output emitter ---------- */

typedef struct {
    Obuf *out;
    int   indent;
    int   col;
    int   wrap;
} Emit;

static int em_raw(Emit *e, const char *s, size_t n)
{
    if (obuf_putn(e->out, s, n) != 0) return -1;
    for (size_t i = 0; i < n; i++) {
        if (s[i] == '\n') e->col = 0;
        else e->col++;
    }
    return 0;
}

static int em_str(Emit *e, const char *s)
{
    return em_raw(e, s, strlen(s));
}

static int em_nl(Emit *e, int indent)
{
    if (obuf_putc(e->out, '\n') != 0) return -1;
    for (int i = 0; i < indent; i++) {
        if (obuf_putc(e->out, ' ') != 0) return -1;
    }
    e->col = indent;
    return 0;
}

/*
 * One codepoint of JSX text, escaped to entities.  Entities rather than
 * {"..."} expressions because entity text stays JSXText, so the whitespace
 * and wrapping rules below apply uniformly, it reflows if the file is ever
 * reformatted, and it matches the idiom the hand-written page already uses.
 */
static int em_jsx_char(Emit *e, const char *p, size_t n)
{
    unsigned char c = (unsigned char)p[0];
    const char *rep = NULL;

    if (c == '&') rep = "&amp;";
    else if (c == '<') rep = "&lt;";
    else if (c == '>') rep = "&gt;";
    else if (c == '"') rep = "&quot;";
    else if (c == '{') rep = "&#123;";
    else if (c == '}') rep = "&#125;";
    else if (n == 3 && c == 0xE2 && (unsigned char)p[1] == 0x80) {
        unsigned char t = (unsigned char)p[2];
        if (t == 0x99) rep = "&rsquo;";
        else if (t == 0x9C) rep = "&ldquo;";
        else if (t == 0x9D) rep = "&rdquo;";
        else if (t == 0x93 || t == 0x94) rep = "&mdash;";
    }

    if (rep) {
        if (obuf_puts(e->out, rep) != 0) return -1;
    } else if (obuf_putn(e->out, p, n) != 0) {
        return -1;
    }
    e->col += 1;
    return 0;
}

/* Visible columns of a run of source text, one per codepoint. */
static int text_width(const char *p, size_t n)
{
    int w = 0;
    for (size_t i = 0; i < n; ) {
        size_t l = utf8_len((unsigned char)p[i]);
        if (i + l > n) l = n - i;
        w++;
        i += l;
    }
    return w;
}

static int em_jsx_text(Emit *e, const char *p, size_t n)
{
    for (size_t i = 0; i < n; ) {
        size_t l = utf8_len((unsigned char)p[i]);
        if (i + l > n) l = n - i;
        if (em_jsx_char(e, p + i, l) != 0) return -1;
        i += l;
    }
    return 0;
}

static int em_jsx_attr(Emit *e, const char *s)
{
    for (const char *p = s; *p; p++) {
        if (*p == '&') {
            if (obuf_puts(e->out, "&amp;") != 0) return -1;
        } else if (*p == '"') {
            if (obuf_puts(e->out, "&quot;") != 0) return -1;
        } else if (obuf_putc(e->out, *p) != 0) {
            return -1;
        }
    }
    return 0;
}

/*
 * Escape a run for a {`...`} template literal.  Order matters: backslash
 * first, or the backslashes inserted by the later rules double.
 */
static int em_template(Emit *e, const char *p, size_t n)
{
    for (size_t i = 0; i < n; i++) {
        char c = p[i];
        if (c == '\\') {
            if (obuf_puts(e->out, "\\\\") != 0) return -1;
        } else if (c == '`') {
            if (obuf_puts(e->out, "\\`") != 0) return -1;
        } else if (c == '$' && i + 1 < n && p[i + 1] == '{') {
            if (obuf_puts(e->out, "\\$") != 0) return -1;
        } else if (obuf_putc(e->out, c) != 0) {
            return -1;
        }
    }
    return 0;
}

/* ---------- atoms ---------- */

typedef struct {
    size_t off, len;      /* into AtomVec.src */
    int    width;         /* columns to advance by when vis */
    int    vis;           /* 1 = advance col by width, 0 = count bytes/newlines */
    int    gap;           /* source had whitespace before this atom */
    int    starts_tag, ends_tag;
} Atom;

typedef struct {
    Obuf  src;
    Atom *v;
    size_t n, cap;
} AtomVec;

static int atom_push(AtomVec *av, const char *src, size_t srclen, int width,
                     int vis, int gap, int stag, int etag)
{
    Atom a;

    if (obuf_putn(&av->src, src, srclen) != 0) return -1;
    a.off = av->src.len - srclen;
    a.len = srclen;
    a.width = width;
    a.vis = vis;
    a.gap = gap;
    a.starts_tag = stag;
    a.ends_tag = etag;
    GROW(av->v, av->cap, av->n + 1, Atom);
    av->v[av->n++] = a;
    return 0;
}

static void atoms_free(AtomVec *av)
{
    free(av->v);
    av->v = NULL;
    av->n = av->cap = 0;
    obuf_free(&av->src);
}

static int build_atoms(Emit *e, TokVec *t, size_t start, size_t end,
                       AtomVec *out);

static int emit_atoms(Emit *e, AtomVec *av)
{
    for (size_t i = 0; i < av->n; i++) {
        Atom *a = &av->v[i];
        int gap = (i == 0) ? 0 : a->gap;
        int prev_tag = (i == 0) ? 0 : av->v[i - 1].ends_tag;
        int brkable = (gap != 0) || prev_tag || a->starts_tag;

        /*
         * JSX strips the leading whitespace of every line and drops a line
         * break adjacent to a tag, so a space in the source only survives a
         * break if it is written as {" "}.
         */
        if (e->wrap > 0 && brkable && e->col + gap + a->width > e->wrap) {
            if (gap && (prev_tag || a->starts_tag)) {
                if (obuf_puts(e->out, "{\" \"}") != 0) return -1;
            }
            if (em_nl(e, e->indent) != 0) return -1;
        } else if (gap) {
            if (obuf_putc(e->out, ' ') != 0) return -1;
            e->col += 1;
        }

        if (a->len == 0) {
            e->col += a->width;
        } else if (a->vis) {
            if (obuf_putn(e->out, av->src.data + a->off, a->len) != 0) return -1;
            e->col += a->width;
        } else if (em_raw(e, av->src.data + a->off, a->len) != 0) {
            return -1;
        }
    }
    return 0;
}

static size_t matching_close(TokVec *t, size_t open, size_t limit)
{
    int depth = 0;
    for (size_t i = open; i < limit; i++) {
        if (tok_is_open(t->v[i].kind)) depth++;
        else if (tok_is_close(t->v[i].kind)) {
            depth--;
            if (depth == 0) return i;
        }
    }
    return limit;
}

/* Render [start,end) into dst with wrapping disabled. */
static int inline_flat(Emit *e, TokVec *t, size_t start, size_t end, Obuf *dst)
{
    Emit sub;
    AtomVec av;

    memset(&av, 0, sizeof av);
    if (obuf_init(&av.src, 64) != 0) return -1;
    sub.out = dst;
    sub.indent = e->indent;
    sub.col = e->col;
    sub.wrap = 0;
    if (build_atoms(&sub, t, start, end, &av) != 0 ||
        emit_atoms(&sub, &av) != 0) {
        atoms_free(&av);
        return -1;
    }
    atoms_free(&av);
    return 0;
}

static int push_built(AtomVec *out, Obuf *src, int width, int vis, int gap,
                      int stag, int etag)
{
    int rc = atom_push(out, src->data, src->len, width, vis, gap, stag, etag);
    return rc;
}

static int build_atoms(Emit *e, TokVec *t, size_t start, size_t end, AtomVec *out)
{
    int pending_space = 0;
    size_t i = start;

    while (i < end) {
        Tok *tk = &t->v[i];
        int gap = out->n ? pending_space : 0;

        if (tk->kind == TOK_TEXT) {
            const char *p = tk->text.data, *pe = p + tk->text.len;
            while (p < pe) {
                const char *w;
                Obuf esc;
                Emit sub;
                int width;

                if (isspace((unsigned char)*p)) { pending_space = 1; p++; continue; }
                w = p;
                while (p < pe && !isspace((unsigned char)*p)) p++;

                if (obuf_init(&esc, (size_t)(p - w) * 6 + 8) != 0) return -1;
                sub.out = &esc;
                sub.indent = 0;
                sub.col = 0;
                sub.wrap = 0;
                if (em_jsx_text(&sub, w, (size_t)(p - w)) != 0) {
                    obuf_free(&esc);
                    return -1;
                }
                width = sub.col;
                if (push_built(out, &esc, width, 1,
                               out->n ? pending_space : 0, 0, 0) != 0) {
                    obuf_free(&esc);
                    return -1;
                }
                obuf_free(&esc);
                pending_space = 0;
            }
            i++;
            continue;
        }

        if (tk->kind == TOK_CODE) {
            Obuf src;
            Emit sub;

            if (obuf_init(&src, tk->text.len + 64) != 0) return -1;
            if (obuf_puts(&src, "<code className=\"" CODE_CLASS "\">{`") != 0 ||
                (sub.out = &src, sub.indent = 0, sub.col = 0, sub.wrap = 0,
                 em_template(&sub, tk->text.data, tk->text.len)) != 0 ||
                obuf_puts(&src, "`}</code>") != 0) {
                obuf_free(&src);
                return -1;
            }
            if (push_built(out, &src, (int)src.len, 1, gap, 1, 1) != 0) {
                obuf_free(&src);
                return -1;
            }
            obuf_free(&src);
            pending_space = 0;
            i++;
            continue;
        }

        if (tk->kind == TOK_IMAGE) {
            Obuf src;
            Emit sub;

            if (obuf_init(&src, 128) != 0) return -1;
            sub.out = &src;
            sub.indent = 0;
            sub.col = 0;
            sub.wrap = 0;
            if (obuf_puts(&src, "<img src=\"") != 0 ||
                em_jsx_attr(&sub, tk->attr ? tk->attr : "") != 0 ||
                obuf_puts(&src, "\" alt=\"") != 0 ||
                em_jsx_text(&sub, tk->alt ? tk->alt : "",
                            tk->alt ? strlen(tk->alt) : 0) != 0 ||
                obuf_puts(&src, "\" className=\"my-2 max-w-full rounded "
                                "border border-border\" />") != 0) {
                obuf_free(&src);
                return -1;
            }
            if (push_built(out, &src, (int)src.len, 1, gap, 1, 1) != 0) {
                obuf_free(&src);
                return -1;
            }
            obuf_free(&src);
            pending_space = 0;
            i++;
            continue;
        }

        if (tok_is_open(tk->kind)) {
            size_t close = matching_close(t, i, end);
            Obuf inner, src;
            Emit sub;
            const char *close_tag;
            int iw, width;

            if (obuf_init(&inner, 64) != 0) return -1;
            if (inline_flat(e, t, i + 1, close, &inner) != 0) {
                obuf_free(&inner);
                return -1;
            }
            iw = text_width(inner.data, inner.len);

            if (obuf_init(&src, inner.len + 128) != 0) {
                obuf_free(&inner);
                return -1;
            }
            sub.out = &src;
            sub.indent = 0;
            sub.col = 0;
            sub.wrap = 0;

            switch (tk->kind) {
            case TOK_EM_OPEN:
                if (obuf_puts(&src, "<span className=\"text-text-muted italic\">") != 0)
                    goto elem_fail;
                close_tag = "</span>";
                break;
            case TOK_STRONG_OPEN:
                if (obuf_puts(&src, "<span className=\"font-bold text-text-bright\">") != 0)
                    goto elem_fail;
                close_tag = "</span>";
                break;
            case TOK_SEM_OPEN:
                if (obuf_printf(&src, "<span className=\"%s\">", tk->klass) != 0)
                    goto elem_fail;
                close_tag = "</span>";
                break;
            default: {                     /* TOK_LINK_OPEN */
                if (obuf_puts(&src, "<a href=\"") != 0 ||
                    em_jsx_attr(&sub, tk->attr ? tk->attr : "") != 0 ||
                    obuf_puts(&src, "\"") != 0) goto elem_fail;
                if (tk->alt && *tk->alt) {
                    if (obuf_puts(&src, " title=\"") != 0 ||
                        em_jsx_attr(&sub, tk->alt) != 0 ||
                        obuf_puts(&src, "\"") != 0) goto elem_fail;
                }
                if (obuf_printf(&src, " className=\"%s\">", LINK_CLASS) != 0)
                    goto elem_fail;
                close_tag = "</a>";
                break;
            }
            }

            if (obuf_putn(&src, inner.data, inner.len) != 0 ||
                obuf_puts(&src, close_tag) != 0)
                goto elem_fail;

            /* Width of the whole element: tags count, the content counts by
             * visible columns rather than by bytes. */
            width = (int)src.len - (int)inner.len + iw;
            obuf_free(&inner);

            if (push_built(out, &src, width, 1, gap, 1, 1) != 0) {
                obuf_free(&src);
                return -1;
            }
            obuf_free(&src);
            pending_space = 0;
            i = close + 1;
            continue;

elem_fail:
            obuf_free(&inner);
            obuf_free(&src);
            return -1;
        }

        i++;
    }
    return 0;
}

/* ---------- block emission ---------- */

static const char *HEAD_CLASS[7] = {
    NULL,
    "text-lg sm:text-xl text-text-bright mb-6",
    "text-sm text-quaternary",
    "text-sm text-tertiary",
    "text-sm text-secondary",
    "text-sm text-primary",
    "text-xs text-text-muted"
};

static const char *HEAD_PREFIX_CLASS[7] = {
    NULL,
    "text-tertiary select-none",
    "text-quaternary select-none",
    "text-tertiary select-none",
    "text-secondary select-none",
    "text-primary select-none",
    "text-text-muted select-none"
};

static int emit_inline(Emit *e, TokVec *t)
{
    AtomVec av;
    int rc;

    memset(&av, 0, sizeof av);
    if (obuf_init(&av.src, 128) != 0) return -1;
    rc = build_atoms(e, t, 0, t->n, &av);
    if (rc == 0) rc = emit_atoms(e, &av);
    atoms_free(&av);
    return rc;
}

static int emit_block(Emit *e, Block *b);

static int emit_code_block(Emit *e, Block *b)
{
    int ind = e->indent;
    int has_lang = b->lang && *b->lang;

    if (em_nl(e, ind) != 0) return -1;
    if (em_str(e, "<div className=\"border border-border rounded overflow-hidden\">") != 0)
        return -1;

    if (has_lang) {
        if (em_nl(e, ind + INDENT_STEP) != 0) return -1;
        if (em_str(e, "<p className=\"text-text-muted text-xs px-3 py-1 "
                      "border-b border-border select-none\">") != 0) return -1;
        if (em_jsx_text(e, b->lang, strlen(b->lang)) != 0) return -1;
        if (em_str(e, "</p>") != 0) return -1;
    }

    if (em_nl(e, ind + INDENT_STEP) != 0) return -1;
    if (em_str(e, "<pre className=\"bg-surface p-3 overflow-x-auto text-xs "
                  "leading-relaxed\"") != 0) return -1;
    if (has_lang) {
        if (em_str(e, " data-lang=\"") != 0 ||
            em_jsx_attr(e, b->lang) != 0 ||
            em_str(e, "\"") != 0) return -1;
    }
    if (em_str(e, "><code>{`") != 0) return -1;

    /*
     * The code body and its closing backtick sit at column 0: a template
     * literal carries its source indentation into the string, so indenting
     * these lines would indent the rendered code.
     */
    if (em_nl(e, 0) != 0) return -1;
    if (em_template(e, b->raw.data, b->raw.len) != 0) return -1;
    if (obuf_puts(e->out, "\n`}</code></pre>") != 0) return -1;
    e->col = 12;
    if (em_nl(e, ind) != 0) return -1;
    return em_str(e, "</div>");
}

static int emit_list(Emit *e, Block *b)
{
    const char *tag = (b->kind == BLOCK_LIST_OL) ? "ol" : "ul";
    int ind = e->indent;

    if (em_nl(e, ind) != 0) return -1;
    if (obuf_printf(e->out, "<%s className=\"space-y-1\">", tag) != 0) return -1;
    e->col = ind + (int)strlen(tag) + 18;

    for (size_t i = 0; i < b->nitems; i++) {
        Block *item = b->items[i];
        int simple = item && item->next == NULL &&
                     item->kind == BLOCK_PARAGRAPH;

        if (em_nl(e, ind + INDENT_STEP) != 0) return -1;
        if (em_str(e, "<li className=\"pl-6 -indent-6\">") != 0) return -1;
        if (em_str(e, "<span className=\"text-tertiary select-none\">") != 0) return -1;
        if (b->kind == BLOCK_LIST_OL) {
            if (obuf_printf(e->out, "%d. ", (int)(i + 1)) != 0) return -1;
        } else if (em_str(e, "- ") != 0) {
            return -1;
        }
        if (em_str(e, "</span>") != 0) return -1;

        {
            Emit sub = *e;
            Block *first = item;

            sub.indent = ind + INDENT_STEP;
            /*
             * The <li> and marker markup already overflow the wrap column, so
             * measure the item's own text from where it renders rather than
             * from the start of the source line.
             */
            sub.col = ind + INDENT_STEP;

            if (simple) {
                if (emit_inline(&sub, &item->toks) != 0) return -1;
            } else {
                /* A leading paragraph runs inline next to the marker. */
                if (first && first->kind == BLOCK_PARAGRAPH && first->next) {
                    if (emit_inline(&sub, &first->toks) != 0) return -1;
                    first = first->next;
                }
                for (Block *k = first; k; k = k->next) {
                    if (k->kind == BLOCK_PARAGRAPH) sub.col = ind + INDENT_STEP;
                    if (emit_block(&sub, k) != 0) return -1;
                }
            }
            e->col = sub.col;
        }
        if (em_str(e, "</li>") != 0) return -1;
    }

    if (em_nl(e, ind) != 0) return -1;
    return obuf_printf(e->out, "</%s>", tag);
}

static int emit_block(Emit *e, Block *b)
{
    switch (b->kind) {
    case BLOCK_PARAGRAPH:
        if (em_nl(e, e->indent) != 0) return -1;
        if (em_str(e, "<p>") != 0) return -1;
        if (em_nl(e, e->indent + INDENT_STEP) != 0) return -1;
        {
            Emit sub = *e;
            sub.indent = e->indent + INDENT_STEP;
            if (emit_inline(&sub, &b->toks) != 0) return -1;
            e->col = sub.col;
        }
        if (em_nl(e, e->indent) != 0) return -1;
        return em_str(e, "</p>");

    case BLOCK_HEADING:
        if (em_nl(e, e->indent) != 0) return -1;
        if (obuf_printf(e->out, "<p className=\"%s\">", HEAD_CLASS[b->level]) != 0)
            return -1;
        if (em_nl(e, e->indent + INDENT_STEP) != 0) return -1;
        if (obuf_printf(e->out, "<span className=\"%s\">",
                        HEAD_PREFIX_CLASS[b->level]) != 0) return -1;
        for (int i = 0; i < b->level; i++) {
            if (obuf_putc(e->out, '#') != 0) return -1;
        }
        if (em_str(e, " </span>") != 0) return -1;
        {
            Emit sub = *e;
            sub.indent = e->indent + INDENT_STEP;
            if (emit_inline(&sub, &b->toks) != 0) return -1;
            e->col = sub.col;
        }
        if (em_nl(e, e->indent) != 0) return -1;
        return em_str(e, "</p>");

    case BLOCK_HR:
        if (em_nl(e, e->indent) != 0) return -1;
        if (em_str(e, "<p className=\"text-text-muted select-none\">") != 0)
            return -1;
        if (em_str(e, DIVIDER) != 0) return -1;
        return em_str(e, "</p>");

    case BLOCK_CODE:
        return emit_code_block(e, b);

    case BLOCK_LIST_UL:
    case BLOCK_LIST_OL:
        return emit_list(e, b);

    case BLOCK_BLOCKQUOTE:
        if (em_nl(e, e->indent) != 0) return -1;
        if (em_str(e, "<blockquote className=\"border-l-2 border-border "
                      "pl-4 text-text-muted\">") != 0) return -1;
        {
            Emit sub = *e;
            sub.indent = e->indent + INDENT_STEP;
            for (Block *k = b->kids; k; k = k->next) {
                if (emit_block(&sub, k) != 0) return -1;
            }
            e->col = sub.col;
        }
        if (em_nl(e, e->indent) != 0) return -1;
        return em_str(e, "</blockquote>");
    }
    return 0;
}

/*
 * A trailing paragraph whose whole content is one italic span beginning
 * "P.S." renders as the muted footnote line, with the <em> dissolved, the
 * way the hand-written page has it.  --no-footnote-heuristic turns it off.
 */
static int is_ps_footnote(Block *b)
{
    Slice s;

    if (!b || b->kind != BLOCK_PARAGRAPH || b->next != NULL) return 0;
    if (b->toks.n != 3) return 0;
    if (b->toks.v[0].kind != TOK_EM_OPEN) return 0;
    if (b->toks.v[1].kind != TOK_TEXT) return 0;
    if (b->toks.v[2].kind != TOK_EM_CLOSE) return 0;

    s.p = b->toks.v[1].text.data;
    s.n = b->toks.v[1].text.len;
    if (s.n == 0) return 0;
    return slice_starts_with(s, "P.S.") || slice_starts_with(s, "Postscript");
}

static int emit_ps_footnote(Emit *e, Block *b)
{
    if (em_nl(e, e->indent) != 0) return -1;
    if (em_str(e, "<p className=\"text-text-muted text-xs italic pt-2\">") != 0)
        return -1;
    if (em_nl(e, e->indent + INDENT_STEP) != 0) return -1;
    {
        Emit sub = *e;
        sub.indent = e->indent + INDENT_STEP;
        if (em_jsx_text(&sub, b->toks.v[1].text.data,
                        b->toks.v[1].text.len) != 0) return -1;
        e->col = sub.col;
    }
    if (em_nl(e, e->indent) != 0) return -1;
    return em_str(e, "</p>");
}

/* ---------- header ---------- */

typedef struct {
    char *id;
    char *date;
    char *title;
    int   number;
} EntryMeta;

/* DD-MM-YYYY -> YYYYMMDD so dates compare correctly as integers. */
static int date_key(const char *d)
{
    int dd = (d[0] - '0') * 10 + (d[1] - '0');
    int mm = (d[3] - '0') * 10 + (d[4] - '0');
    int yy = (d[6] - '0') * 1000 + (d[7] - '0') * 100 +
             (d[8] - '0') * 10 + (d[9] - '0');
    return yy * 10000 + mm * 100 + dd;
}

/* Newest first, then by descending id, so the listing never has to sort. */
static int meta_cmp(const void *a, const void *b)
{
    const EntryMeta *x = a, *y = b;
    int kx = date_key(x->date), ky = date_key(y->date);

    if (kx != ky) return (kx > ky) - (kx < ky);
    return strcmp(y->id, x->id);
}

static void meta_free(EntryMeta *m)
{
    free(m->id);
    free(m->date);
    free(m->title);
    m->id = m->date = m->title = NULL;
}

/* mktime round-trip so 31-02-2026 is rejected rather than accepted. */
static int valid_date(const char *s)
{
    struct tm tm;
    int d, mo, y;

    if (strlen(s) != 10) return 0;
    if (s[2] != '-' || s[5] != '-') return 0;
    for (int i = 0; i < 10; i++) {
        if (i == 2 || i == 5) continue;
        if (!isdigit((unsigned char)s[i])) return 0;
    }
    d  = (s[0] - '0') * 10 + (s[1] - '0');
    mo = (s[3] - '0') * 10 + (s[4] - '0');
    y  = (s[6] - '0') * 1000 + (s[7] - '0') * 100 +
         (s[8] - '0') * 10 + (s[9] - '0');

    memset(&tm, 0, sizeof tm);
    tm.tm_mday = d;
    tm.tm_mon = mo - 1;
    tm.tm_year = y - 1900;
    tm.tm_isdst = -1;
    if (mktime(&tm) == (time_t)-1) return 0;
    return tm.tm_mday == d && tm.tm_mon == mo - 1 && tm.tm_year == y - 1900;
}

/* entry_01 -> id "entry_01", number 1 */
static int parse_entry_id(const char *s, char **id_out, int *number_out)
{
    const char *us = strchr(s, '_');
    const char *p;
    int n = 0;

    if (!us || us == s) return 0;
    for (const char *q = s; q < us; q++)
        if (!isalpha((unsigned char)*q)) return 0;
    p = us + 1;
    if (!isdigit((unsigned char)*p)) return 0;
    while (isdigit((unsigned char)*p)) {
        n = n * 10 + (*p - '0');
        p++;
    }
    if (*p != '\0') return 0;

    *id_out = xstrndup(s, strlen(s));
    if (!*id_out) return 0;
    *number_out = n;
    return 1;
}

/* entry_01 -> Entry01 */
static void component_name(const char *id, char *buf, size_t bufsz)
{
    size_t o = 0;
    int upper = 1;

    for (const char *p = id; *p && o + 1 < bufsz; p++) {
        if (*p == '_') { upper = 1; continue; }
        if (upper) {
            buf[o++] = (char)toupper((unsigned char)*p);
            upper = 0;
        } else {
            buf[o++] = *p;
        }
    }
    buf[o] = '\0';
    if (o == 0) snprintf(buf, bufsz, "Entry");
}

static int parse_header(const char *text, size_t len, const char *inpath,
                        EntryMeta *m, const char **body_start, int quiet,
                        const char *date_override)
{
    const char *p = text;
    const char *end = text + len;
    Slice line;
    int saw_title = 0;

    if (len >= 3 && (unsigned char)text[0] == 0xEF &&
        (unsigned char)text[1] == 0xBB && (unsigned char)text[2] == 0xBF)
        p += 3;

    if (!next_line(&p, end, &line)) {
        fprintf(stderr, "Error: empty entry: %s\n", inpath);
        return 1;
    }

    {
        Slice s = slice_trim(line);
        Slice inner;
        char *idbuf;
        int num = 0;

        if (s.n < 7 || memcmp(s.p, "<!--", 4) != 0 ||
            memcmp(s.p + s.n - 3, "-->", 3) != 0) {
            fprintf(stderr, "Error: %s: line 1 must be an entry id comment "
                            "like <!-- entry_01 -->\n", inpath);
            return 1;
        }
        inner = slice_trim((Slice){ s.p + 4, s.n - 7 });
        idbuf = xstrndup(inner.p, inner.n);
        if (!idbuf) {
            fprintf(stderr, "Error: out of memory\n");
            return 1;
        }
        if (!parse_entry_id(idbuf, &m->id, &num)) {
            fprintf(stderr, "Error: %s: '%s' is not a valid entry id "
                            "(expected entry_NN)\n", inpath, idbuf);
            free(idbuf);
            return 1;
        }
        m->number = num;
        free(idbuf);
    }

    if (!next_line(&p, end, &line)) {
        fprintf(stderr, "Error: %s: missing date line\n", inpath);
        return 1;
    }
    {
        Slice s = slice_trim(line);
        char *d = xstrndup(s.p, s.n);
        if (!d) { fprintf(stderr, "Error: out of memory\n"); return 1; }
        if (date_override) {
            free(d);
            d = xstrndup(date_override, strlen(date_override));
            if (!d) { fprintf(stderr, "Error: out of memory\n"); return 1; }
        }
        if (!valid_date(d)) {
            fprintf(stderr, "Error: %s: '%s' is not a valid DD-MM-YYYY date\n",
                    inpath, d);
            free(d);
            return 1;
        }
        m->date = d;
    }

    for (;;) {
        Slice s;
        const char *save = p;
        size_t i = 0, keyend;

        if (!next_line(&p, end, &s)) { p = end; break; }
        s = slice_trim(s);
        if (s.n == 0) continue;

        while (i < s.n && s.p[i] == '#') i++;
        while (i < s.n && s.p[i] == ' ') i++;
        keyend = i;
        while (keyend < s.n && (isupper((unsigned char)s.p[keyend]) ||
                                isdigit((unsigned char)s.p[keyend]) ||
                                s.p[keyend] == '_'))
            keyend++;

        if (keyend > i && keyend < s.n && s.p[keyend] == ':') {
            Slice key = { s.p + i, keyend - i };
            Slice val = slice_trim((Slice){ s.p + keyend + 1, s.n - keyend - 1 });
            if (slice_eq(key, "TITLE")) {
                free(m->title);
                m->title = xstrndup(val.p, val.n);
                if (!m->title) { fprintf(stderr, "Error: out of memory\n"); return 1; }
                saw_title = 1;
                continue;
            }
            if (!quiet)
                fprintf(stderr, "warning: %s: ignoring unknown metadata key "
                                "'%.*s'\n", inpath, (int)key.n, key.p);
            continue;
        }
        p = save;
        break;
    }

    if (!saw_title) {
        fprintf(stderr, "Error: %s: missing '# TITLE: ...' line\n", inpath);
        return 1;
    }

    while (p < end) {
        Slice s;
        const char *save = p;
        if (!next_line(&p, end, &s)) break;
        if (!is_blank(s)) { p = save; break; }
    }
    *body_start = p;
    return 0;
}

/* ---------- entry emission ---------- */

static int emit_entry(Emit *e, EntryMeta *m, Block *doc, const char *comp,
                      const char *srcpath, int heuristic)
{
    int ind = INDENT_BODY;

    if (obuf_printf(e->out,
        "/*\n"
        " * %s.tsx — GENERATED FILE, DO NOT EDIT BY HAND.\n"
        " *\n"
        " * Source:  %s\n"
        " * Command: make -C blog gen\n"
        " * Parser:  blog/blog-parser.c\n"
        " *\n"
        " * Edit the markdown and re-run `make -C blog gen`. Hand edits here\n"
        " * are overwritten. `make -C blog check` verifies this file is up to\n"
        " * date.\n"
        " */\n\n", m->id, srcpath) != 0) return -1;

    if (obuf_puts(e->out,
        "import Prompt from \"../../components/Prompt\";\n"
        "import { Link } from \"react-router-dom\";\n\n"
        "export const meta = {\n") != 0) return -1;

    if (obuf_printf(e->out, "  id: \"%s\",\n", m->id) != 0) return -1;
    if (em_str(e, "  title: \"") != 0) return -1;
    if (em_jsx_attr(e, m->title) != 0) return -1;
    if(em_str(e, "\",\n") != 0) return -1;
    if (obuf_printf(e->out, "  date: \"%s\",\n", m->date) != 0) return -1;
    if (obuf_printf(e->out, "  label: \"%s.md\",\n", m->id) != 0) return -1;
    if (obuf_puts(e->out, "} as const;\n\n") != 0) return -1;

    if (obuf_printf(e->out, "function %s() {\n", comp) != 0) return -1;
    if (obuf_puts(e->out, "  return (\n") != 0) return -1;
    if (obuf_printf(e->out, "    <main className=\"%s\">\n", MAIN_CLASS) != 0)
        return -1;

    if (obuf_puts(e->out,
        "      <p>\n"
        "        <Prompt>\n"
        "          <span className=\"text-text\">cat</span>{\" \"}\n"
        "          <span className=\"text-secondary\">~</span>\n"
        "          <span className=\"text-text-muted\">/blog/") != 0) return -1;
    if (obuf_printf(e->out, "%s.md</span>\n", m->id) != 0) return -1;
    if (obuf_puts(e->out, "        </Prompt>\n      </p>\n\n") != 0) return -1;

    if (obuf_puts(e->out,
        "      <div className=\"mt-6 pl-4 border-l-2 border-border max-w-2xl\">\n"
        "        <p className=\"text-text-muted text-xs mb-2\">\n"
        "          <span className=\"text-primary\">") != 0) return -1;
    if (obuf_printf(e->out, "%s</span>\n", m->id) != 0) return -1;
    if (obuf_puts(e->out,
        "          <span className=\"text-text-muted select-none\"> · </span>\n"
        "          <span className=\"text-quaternary\">") != 0) return -1;
    if (obuf_printf(e->out, "%s</span>\n", m->date) != 0) return -1;
    if (obuf_puts(e->out,
        "        </p>\n"
        "        <p className=\"text-text-muted select-none mb-4\">\n"
        "          ") != 0) return -1;
    if (em_str(e, DIVIDER) != 0) return -1;
    if (obuf_puts(e->out, "\n        </p>\n\n") != 0) return -1;

    if (obuf_puts(e->out,
        "        <p className=\"text-lg sm:text-xl text-text-bright mb-6\">\n"
        "          <span className=\"text-tertiary select-none\"># </span>\n"
        "          ") != 0) return -1;
    if (em_jsx_text(e, m->title, strlen(m->title)) != 0) return -1;
    if (obuf_puts(e->out, "\n        </p>\n\n") != 0) return -1;

    if (obuf_puts(e->out, "        <div className=\"text-text space-y-4\">") != 0)
        return -1;

    for (Block *b = doc; b; b = b->next) {
        Emit sub = *e;
        sub.indent = ind;
        if (heuristic && is_ps_footnote(b)) {
            if (emit_ps_footnote(&sub, b) != 0) return -1;
        } else if (emit_block(&sub, b) != 0) {
            return -1;
        }
        e->col = sub.col;
        if (b->next && obuf_putc(e->out, '\n') != 0) return -1;
    }

    if (obuf_puts(e->out, "\n        </div>\n\n") != 0) return -1;
    if (obuf_puts(e->out,
        "        <p className=\"text-text-muted select-none mt-6\">\n"
        "          ") != 0) return -1;
    if (em_str(e, DIVIDER) != 0) return -1;
    if (obuf_puts(e->out, "\n        </p>\n\n") != 0) return -1;

    if (obuf_puts(e->out,
        "        <Link\n"
        "          to=\"/blog\"\n"
        "          className=\"text-tertiary hover:text-primary "
        "transition-colors mt-2 inline-block\"\n"
        "        >\n"
        "          <span className=\"select-none\">&lt;- </span>\n"
        "          <span className=\"text-text-muted\">cd</span> ..\n"
        "        </Link>\n"
        "      </div>\n\n"
        "      <p className=\"pt-8\">\n"
        "        <Prompt>\n"
        "          <span className=\"inline-block w-3 h-5 bg-text align-middle "
        "animate-pulse\" />\n"
        "        </Prompt>\n"
        "      </p>\n"
        "    </main>\n"
        "  );\n"
        "}\n\n") != 0) return -1;

    return obuf_printf(e->out, "export default %s;\n", comp);
}

/*
 * The listing needs every entry's metadata but none of its component code.
 * Generating a manifest keeps the two apart, so a post's module is fetched
 * only when that post is opened.
 */
static int emit_manifest(Emit *e, EntryMeta *metas, size_t n)
{
    if (obuf_puts(e->out,
        "/*\n"
        " * index.ts — GENERATED FILE, DO NOT EDIT BY HAND.\n"
        " *\n"
        " * Built from blog/entries/*.md by blog/blog-parser.c, newest first.\n"
        " * Regenerate with `make -C blog gen`.\n"
        " *\n"
        " * Metadata only. The components next to this file are loaded on\n"
        " * demand by src/pages/BlogPost.tsx, so the listing does not pull\n"
        " * every post into the initial bundle.\n"
        " */\n\n"
        "import type { BlogMeta } from \"./types\";\n\n"
        "export const posts: BlogMeta[] = [\n") != 0) return -1;

    for (size_t i = 0; i < n; i++) {
        if (obuf_puts(e->out, "  {\n") != 0) return -1;
        if (obuf_printf(e->out, "    id: \"%s\",\n", metas[i].id) != 0) return -1;
        if (obuf_puts(e->out, "    title: \"") != 0) return -1;
        if (em_jsx_attr(e, metas[i].title) != 0) return -1;
        if (obuf_puts(e->out, "\",\n") != 0) return -1;
        if (obuf_printf(e->out, "    date: \"%s\",\n", metas[i].date) != 0)
            return -1;
        if (obuf_printf(e->out, "    label: \"%s.md\",\n", metas[i].id) != 0)
            return -1;
        if (obuf_puts(e->out, "  },\n") != 0) return -1;
    }
    return obuf_puts(e->out, "];\n");
}

/* ---------- files ---------- */

static char *read_whole_file(const char *path, size_t *out_len)
{
    FILE *f = fopen(path, "rb");
    char *buf = NULL;
    size_t len = 0, cap = 0;

    if (!f) {
        fprintf(stderr, "Error: cannot open %s: ", path);
        perror(NULL);
        return NULL;
    }
    for (;;) {
        size_t got;
        if (len + 65536 + 1 > cap) {
            size_t nc = cap ? cap * 2 : 131072;
            char *nb = realloc(buf, nc);
            if (!nb) {
                fprintf(stderr, "Error: out of memory\n");
                free(buf);
                fclose(f);
                return NULL;
            }
            buf = nb;
            cap = nc;
        }
        got = fread(buf + len, 1, 65536, f);
        len += got;
        if (got < 65536) {
            if (ferror(f)) {
                fprintf(stderr, "Error: read failed: ");
                perror(NULL);
                free(buf);
                fclose(f);
                return NULL;
            }
            break;
        }
    }
    if (!buf) {
        buf = malloc(1);
        if (!buf) {
            fclose(f);
            return NULL;
        }
    }
    buf[len] = '\0';
    fclose(f);
    *out_len = len;
    return buf;
}

static int mkdir_p(const char *path)
{
    char *tmp = xstrndup(path, strlen(path));
    if (!tmp) return -1;
    for (char *p = tmp + 1; *p; p++) {
        if (*p != '/') continue;
        *p = '\0';
        if (mkdir(tmp, 0755) != 0 && errno != EEXIST) {
            free(tmp);
            return -1;
        }
        *p = '/';
    }
    if (mkdir(tmp, 0755) != 0 && errno != EEXIST) {
        free(tmp);
        return -1;
    }
    free(tmp);
    return 0;
}

/* <repo root>, from the binary's own location. */
static void resolve_project_root(char *buf, size_t bufsz,
                                 const char *explicit_root)
{
    char exe[4096];
    ssize_t n;

    if (explicit_root) {
        snprintf(buf, bufsz, "%s", explicit_root);
        return;
    }

    n = readlink("/proc/self/exe", exe, sizeof exe - 1);
    if (n > 0) {
        char *d;
        exe[n] = '\0';
        d = dirname(exe);                     /* <root>/blog */
        if (d) {
            char *copy = xstrndup(d, strlen(d));
            if (copy) {
                char *d2 = dirname(copy);     /* <root> */
                if (d2) {
                    snprintf(buf, bufsz, "%s", d2);
                    free(copy);
                    return;
                }
                free(copy);
            }
        }
    }

    /* No /proc (macOS): walk upward looking for package.json. */
    {
        char cwd[4096];
        if (getcwd(cwd, sizeof cwd)) {
            char probe[4200];
            char *p = cwd + strlen(cwd);
            for (int i = 0; i < 8; i++) {
                snprintf(probe, sizeof probe, "%s/package.json", cwd);
                if (access(probe, F_OK) == 0) {
                    snprintf(buf, bufsz, "%s", cwd);
                    return;
                }
                while (p > cwd && *p != '/') p--;
                if (p == cwd) break;
                *p = '\0';
            }
            snprintf(buf, bufsz, "%s", cwd);
            return;
        }
    }
    snprintf(buf, bufsz, ".");
}

/* ---------- options ---------- */

typedef struct {
    const char **inputs;
    size_t       ninputs;
    const char  *outdir;
    const char  *date;
    const char  *root;
    int          to_stdout;
    int          wrap;
    int          heuristic;
    int          quiet;
    int          manifest;
} Options;

static void usage(void)
{
    fprintf(stderr,
        "Usage: parser [options] <entry.md> [more.md ...]\n"
        "  --outdir <dir>            output directory\n"
        "  --manifest                write index.ts (metadata for blog listing)\n"
        "                            instead of components\n"
        "  --stdout                  write to stdout instead of a file\n"
        "  --date <DD-MM-YYYY>       override the entry date\n"
        "  --root <dir>              override project-root autodetection\n"
        "  --wrap <n>                wrap column, 0 disables (default %d)\n"
        "  --no-footnote-heuristic   render a trailing P.S. as a normal paragraph\n"
        "  --quiet                   suppress progress output\n", WRAP_DEFAULT);
}

static int parse_flags(int argc, char **argv, Options *o)
{
    memset(o, 0, sizeof *o);
    o->wrap = WRAP_DEFAULT;
    o->heuristic = 1;
    o->inputs = calloc((size_t)argc + 1, sizeof *o->inputs);
    if (!o->inputs) {
        fprintf(stderr, "Error: out of memory\n");
        return 1;
    }

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--outdir") == 0 && i + 1 < argc) {
            o->outdir = argv[++i];
        } else if (strcmp(argv[i], "--date") == 0 && i + 1 < argc) {
            o->date = argv[++i];
        } else if (strcmp(argv[i], "--root") == 0 && i + 1 < argc) {
            o->root = argv[++i];
        } else if (strcmp(argv[i], "--wrap") == 0 && i + 1 < argc) {
            o->wrap = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--stdout") == 0) {
            o->to_stdout = 1;
        } else if (strcmp(argv[i], "--manifest") == 0) {
            o->manifest = 1;
        } else if (strcmp(argv[i], "--no-footnote-heuristic") == 0) {
            o->heuristic = 0;
        } else if (strcmp(argv[i], "--quiet") == 0) {
            o->quiet = 1;
        } else if (strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0) {
            usage();
            return 1;
        } else if (argv[i][0] == '-' && argv[i][1] != '\0') {
            fprintf(stderr, "Unknown flag: %s\n", argv[i]);
            return 1;
        } else {
            o->inputs[o->ninputs++] = argv[i];
        }
    }

    if (o->ninputs == 0) {
        usage();
        return 1;
    }
    return 0;
}

/* Resolve the output directory, then make sure it exists. */
static int prepare_outdir(const Options *o, char *outdir, size_t outsz)
{
    if (o->outdir) {
        snprintf(outdir, outsz, "%s", o->outdir);
    } else {
        char root[4096];
        resolve_project_root(root, sizeof root, o->root);
        snprintf(outdir, outsz, "%s/src/pages/blog", root);
    }
    if (mkdir_p(outdir) != 0) {
        fprintf(stderr, "Error: cannot create %s: ", outdir);
        perror(NULL);
        return -1;
    }
    return 0;
}

static int write_output(const Options *o, const char *inpath,
                        const char *outpath, Obuf *out)
{
    FILE *f;

    if (o->to_stdout) {
        if (fwrite(out->data, 1, out->len, stdout) != out->len) {
            fprintf(stderr, "Error: short write to stdout\n");
            return -1;
        }
        return 0;
    }

    f = fopen(outpath, "wb");
    if (!f) {
        fprintf(stderr, "Error: cannot write %s: ", outpath);
        perror(NULL);
        return -1;
    }
    if (fwrite(out->data, 1, out->len, f) != out->len) {
        fprintf(stderr, "Error: short write to %s\n", outpath);
        fclose(f);
        return -1;
    }
    if (fclose(f) != 0) {
        fprintf(stderr, "Error: cannot close %s\n", outpath);
        return -1;
    }
    if (!o->quiet) printf("%s -> %s\n", inpath, outpath);
    return 0;
}

/* ---------- main ---------- */

static int generate_entry(const Options *o, const char *inpath,
                          const char *outdir)
{
    char *text = NULL;
    size_t len = 0;
    const char *body = NULL;
    EntryMeta meta;
    Block *doc = NULL;
    Obuf out;
    Emit e;
    char comp[128];
    char outpath[4400];
    int rc = 1;

    memset(&meta, 0, sizeof meta);
    memset(&out, 0, sizeof out);

    text = read_whole_file(inpath, &len);
    if (!text) goto cleanup;

    if (parse_header(text, len, inpath, &meta, &body, o->quiet, o->date) != 0)
        goto cleanup;

    component_name(meta.id, comp, sizeof comp);
    doc = parse_blocks(&body, text + len, 0);

    if (obuf_init(&out, 8192) != 0) {
        fprintf(stderr, "Error: out of memory\n");
        goto cleanup;
    }

    e.out = &out;
    e.indent = 0;
    e.col = 0;
    e.wrap = o->wrap;

    if (emit_entry(&e, &meta, doc, comp, inpath, o->heuristic) != 0) {
        fprintf(stderr, "Error: out of memory\n");
        goto cleanup;
    }

    snprintf(outpath, sizeof outpath, "%s/%s.tsx", outdir, meta.id);
    rc = write_output(o, inpath, outpath, &out) == 0 ? 0 : 1;

cleanup:
    obuf_free(&out);
    block_free_list(doc);
    meta_free(&meta);
    free(text);
    return rc;
}

static int generate_manifest(const Options *o, const char *outdir)
{
    EntryMeta *metas;
    Obuf out;
    Emit e;
    char outpath[4400];
    size_t n = 0;
    int rc = 1;

    memset(&out, 0, sizeof out);
    metas = calloc(o->ninputs + 1, sizeof *metas);
    if (!metas) {
        fprintf(stderr, "Error: out of memory\n");
        return 1;
    }

    for (size_t i = 0; i < o->ninputs; i++) {
        char *text;
        size_t len = 0;
        const char *body = NULL;

        text = read_whole_file(o->inputs[i], &len);
        if (!text) goto cleanup;
        if (parse_header(text, len, o->inputs[i], &metas[n], &body,
                         o->quiet, o->date) != 0) {
            free(text);
            goto cleanup;
        }
        free(text);
        n++;
    }

    qsort(metas, n, sizeof *metas, meta_cmp);

    if (obuf_init(&out, 4096) != 0) {
        fprintf(stderr, "Error: out of memory\n");
        goto cleanup;
    }
    e.out = &out;
    e.indent = 0;
    e.col = 0;
    e.wrap = 0;
    if (emit_manifest(&e, metas, n) != 0) {
        fprintf(stderr, "Error: out of memory\n");
        goto cleanup;
    }

    snprintf(outpath, sizeof outpath, "%s/index.ts", outdir);
    rc = write_output(o, "index", outpath, &out) == 0 ? 0 : 1;

cleanup:
    obuf_free(&out);
    for (size_t i = 0; i <= o->ninputs; i++) meta_free(&metas[i]);
    free(metas);
    return rc;
}

int main(int argc, char **argv)
{
    Options o;
    char outdir[4200];
    int rc = 1;

    if (parse_flags(argc, argv, &o) != 0) {
        free(o.inputs);
        return 1;
    }

    if (o.to_stdout) {
        /* stdout needs no output directory; both paths skip this. */
        snprintf(outdir, sizeof outdir, ".");
    } else if (prepare_outdir(&o, outdir, sizeof outdir) != 0) {
        goto done;
    }

    if (o.manifest) {
        rc = generate_manifest(&o, outdir);
    } else {
        rc = 0;
        for (size_t i = 0; i < o.ninputs; i++) {
            if (generate_entry(&o, o.inputs[i], outdir) != 0) {
                rc = 1;
                break;
            }
        }
    }

done:
    free(o.inputs);
    return rc;
}
