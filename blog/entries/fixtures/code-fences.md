<!-- entry_90 -->
01-01-2026

# TITLE: Code fences

A fence with a language, containing every character that has to be escaped
inside a template literal:

```c
int main(void) {
    printf("hi ${name}\n");
    char *s = "a ` backtick and a \\ backslash";
    return 0;
}
```

A fence with no language at all:

```
just text
with a } brace
```

Text after a closed fence is not swallowed.

```
$ alone is fine
```
