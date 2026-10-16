#!/bin/sh
#
# Fixture checks for the blog parser.
#
#   - every entries/fixtures/*.md matches its committed golden in expected/
#   - malformed input exits 1 with a message on stderr
#   - hostile input never dies on a signal, under ASan or not
#
# Run from blog/ via `make check-fixtures`.  Set BIN to check a differently
# built parser, e.g. the sanitizer build:  BIN=./parser make check-fixtures

BIN=${BIN:-./parser}
FIXDIR=entries/fixtures
GOLD=expected
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT HUP INT TERM

fail=0

# ---- goldens ----------------------------------------------------------

for f in "$FIXDIR"/*.md; do
    name=$(basename "$f" .md)

    if [ ! -f "$GOLD/$name.tsx" ]; then
        echo "  FAIL $name: no golden at $GOLD/$name.tsx (run 'make goldens')"
        fail=1
        continue
    fi
    if ! "$BIN" --stdout --quiet "$f" > "$TMP/$name.tsx" 2> "$TMP/$name.err"; then
        echo "  FAIL $name: parser exited $?"
        sed 's/^/       /' "$TMP/$name.err"
        fail=1
        continue
    fi
    if cmp -s "$TMP/$name.tsx" "$GOLD/$name.tsx"; then
        echo "  ok   $name"
    else
        echo "  FAIL $name: output differs from $GOLD/$name.tsx"
        diff -u "$GOLD/$name.tsx" "$TMP/$name.tsx" | head -30
        fail=1
    fi
done

# ---- malformed input: exit 1 with an explanation ----------------------

expect_reject() {
    desc=$1
    printf '%s' "$2" > "$TMP/bad.md"
    if "$BIN" --stdout --quiet "$TMP/bad.md" > "$TMP/bad.out" 2> "$TMP/bad.err"; then
        echo "  FAIL $desc: accepted malformed input (exit 0)"
        fail=1
    elif [ ! -s "$TMP/bad.err" ]; then
        echo "  FAIL $desc: rejected but said nothing on stderr"
        fail=1
    else
        echo "  ok   rejects $desc"
    fi
}

expect_reject "a missing id comment" '10-10-2026

# TITLE: X
'
expect_reject "a missing date line" '<!-- entry_01 -->

# TITLE: X
'
expect_reject "an impossible date" '<!-- entry_01 -->
31-02-2026

# TITLE: X
'
expect_reject "a missing title" '<!-- entry_01 -->
10-10-2026

body
'
expect_reject "an id without a number" '<!-- entryone -->
10-10-2026

# TITLE: X
'
expect_reject "an empty file" ''

# ---- hostile input: never a signal ------------------------------------

printf '<!-- entry_01 -->\r\n10-10-2026\r\n\r\n# TITLE: BOM and CRLF\r\n\r\nbody text\r\n' > "$TMP/h-crlf.md"
printf '\357\273\277<!-- entry_01 -->\n10-10-2026\n\n# TITLE: BOM\n\nbody\n' > "$TMP/h-bom.md"
printf '<!-- entry_01 -->\n10-10-2026\n\n# TITLE: No body\n' > "$TMP/h-nobody.md"

# a long run of every delimiter, an unterminated bracket, a huge line
awk 'BEGIN{printf "<!-- entry_01 -->\n10-10-2026\n\n# TITLE: Runs\n\n";
           for(i=0;i<10000;i++) printf "*"; printf "\n";
           for(i=0;i<10000;i++) printf "["; printf "x\n";
           for(i=0;i<10000;i++) printf "`"; printf "\n";
           for(i=0;i<10000;i++) printf "> "; printf "\n"}' > "$TMP/h-runs.md"

# nested emphasis 2000 deep, to exercise the depth cap
awk 'BEGIN{printf "<!-- entry_01 -->\n10-10-2026\n\n# TITLE: Deep\n\n";
           for(i=0;i<2000;i++) printf "*a "; printf "\n"}' > "$TMP/h-deep.md"

# a fence that is never closed
printf '<!-- entry_01 -->\n10-10-2026\n\n# TITLE: Open fence\n\n```c\nint x = 1;\n' > "$TMP/h-fence.md"

for f in "$TMP"/h-*.md; do
    "$BIN" --stdout --quiet "$f" > /dev/null 2> "$TMP/h.err"
    rc=$?
    if [ "$rc" -ge 128 ]; then
        echo "  FAIL $(basename "$f"): killed by signal, exit $rc"
        sed 's/^/       /' "$TMP/h.err"
        fail=1
    else
        echo "  ok   survives $(basename "$f") (exit $rc)"
    fi
done

if [ "$fail" -ne 0 ]; then
    echo "check-fixtures: FAILED"
    exit 1
fi
echo "check-fixtures: all fixtures, rejections and hostile inputs ok"
