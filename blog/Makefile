# blog/Makefile — build the markdown -> TSX parser and regenerate the entries.
#
#   make            build the parser and regenerate every entry
#   make gen        same
#   make check      determinism + drift + fixtures + typecheck
#   make asan       rebuild with ASan/UBSan, then run everything through it
#   make clean      remove the binary and scratch directories
#
# The generated .tsx files are committed, so `vite build` never needs a C
# compiler.

CC       ?= gcc
CFLAGS   ?= -O2 -Wall -Wextra -std=c99 -pedantic
TARGET   := parser
OUTDIR   ?= ../src/pages/blog

ENTRIES  := $(wildcard entries/*.md)
FIXTURES := $(wildcard entries/fixtures/*.md)

.PHONY: all gen goldens clean check check-stable check-drift check-fixtures check-tsx asan help

all: gen

# Components first, then the manifest the blog listing reads.  The listing
# deliberately does not glob the components: an eager glob would pull every
# post into the initial bundle and make the lazy route pointless.
gen: $(TARGET)
	@for e in $(ENTRIES); do ./$(TARGET) --quiet --outdir $(OUTDIR) $$e || exit 1; done
	@./$(TARGET) --quiet --manifest --outdir $(OUTDIR) $(ENTRIES)

$(TARGET): blog-parser.c
	$(CC) $(CFLAGS) -o $@ $<

# The inline scanner does hand-rolled pointer arithmetic; run the fixtures
# through the sanitizers before trusting it on a new entry.
asan: CFLAGS := -O1 -g -fsanitize=address,undefined -Wall -Wextra
asan: clean $(TARGET)
	@for e in $(ENTRIES) $(FIXTURES); do ./$(TARGET) --stdout --quiet $$e >/dev/null 2>&1; echo "  $$e (exit $$?)"; done

check: check-stable check-drift check-fixtures check-tsx

# Two runs must produce identical bytes.  This is what makes committing the
# generated files safe: no timestamps, no address-dependent ordering.
check-stable: $(TARGET)
	@rm -rf .check-a .check-b && mkdir -p .check-a .check-b
	@for e in $(ENTRIES); do ./$(TARGET) --quiet --outdir .check-a $$e || exit 1; done
	@for e in $(ENTRIES); do ./$(TARGET) --quiet --outdir .check-b $$e || exit 1; done
	@diff -r .check-a .check-b >/dev/null && echo "check-stable: deterministic" \
		|| { echo "check-stable: FAILED (non-deterministic output)"; exit 1; }

# Regenerate and compare against what is committed.  Catches a hand edit to a
# generated file (silently lost on the next gen) and a parser change whose
# regenerated output was never committed.
check-drift: $(TARGET)
	@rm -rf .check-a && mkdir -p .check-a
	@for e in $(ENTRIES); do ./$(TARGET) --quiet --outdir .check-a $$e || exit 1; done
	@./$(TARGET) --quiet --manifest --outdir .check-a $(ENTRIES)
	@for f in .check-a/*.tsx .check-a/index.ts; do \
		b=$$(basename $$f); \
		if ! cmp -s $$f $(OUTDIR)/$$b; then \
			echo "check-drift: $(OUTDIR)/$$b is stale — run 'make gen'"; \
			diff -u $(OUTDIR)/$$b $$f | head -40; \
			exit 1; \
		fi; \
	done
	@echo "check-drift: generated output matches what is committed"

# Regenerate the committed fixture goldens, then eyeball the diff.
goldens: $(TARGET)
	@mkdir -p expected
	@for f in $(FIXTURES); do \
		n=$$(basename $$f .md); \
		./$(TARGET) --stdout --quiet $$f > expected/$$n.tsx || exit 1; \
		echo "  expected/$$n.tsx"; \
	done

check-fixtures: $(TARGET)
	@sh scripts/check-fixtures.sh

check-tsx: gen
	@if [ ! -d ../node_modules ]; then \
		echo "check-tsx: skipped (no node_modules)"; \
	else \
		cd .. && pnpm exec tsc -b && echo "check-tsx: generated TSX typechecks"; \
	fi

clean:
	rm -f $(TARGET)
	rm -rf .check-a .check-b .check

help:
	@sed -n '2,12p' Makefile
