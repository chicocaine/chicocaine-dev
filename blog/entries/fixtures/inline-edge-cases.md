<!-- entry_91 -->
02-01-2026

# TITLE: Inline edge cases

Strong containing em: **a *b* c**.

Em containing strong: *a **b** c*.

Triple: ***x***.

Quadruple: ****y****.

Unclosed em is literal: *unclosed and a bare ** here.

Space delimited runs are literal: a * b * c.

Identifiers keep their underscores: snake_case_here stays literal, but
_emph_ works.

Escapes: \*not em\* and \_not em\_ and a literal \` backtick.

Code spans: `*` and ``a`b`` and `**strong**`.

Multibyte adjacency: 日本語*強調*テスト.

Braces and angles in text: {like} {this} and 5 > 3 and 2 < 4.

A literal ampersand and a quote: AT&T said "hello".
