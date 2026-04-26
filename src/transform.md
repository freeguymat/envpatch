# envpatch transform

Apply bulk key or value transformations to a `.env` file.

## Usage

```
envpatch transform <file> [--keys=<mode>] [--values=<mode>] [--in-place]
```

## Options

| Flag | Description |
|------|-------------|
| `--keys=<mode>` | Transform all key names. Modes: `uppercase`, `lowercase`, `snake`, `camel` |
| `--values=<mode>` | Transform all values. Modes: `uppercase`, `lowercase`, `trim` |
| `--in-place` | Write the result back to the source file instead of printing to stdout |

## Key modes

- **uppercase** — `foo_bar` → `FOO_BAR`
- **lowercase** — `FOO_BAR` → `foo_bar`
- **snake** — `fooBar` → `FOO_BAR` (camelCase → SCREAMING_SNAKE)
- **camel** — `FOO_BAR` → `fooBar` (SCREAMING_SNAKE → camelCase)

## Value modes

- **uppercase** — `hello` → `HELLO`
- **lowercase** — `HELLO` → `hello`
- **trim** — `  hello  ` → `hello`

## Examples

```bash
# Normalise all keys to SCREAMING_SNAKE_CASE
envpatch transform .env.dev --keys=uppercase

# Strip accidental whitespace from values, overwrite file
envpatch transform .env --values=trim --in-place

# Convert a camelCase env file to snake_case keys
envpatch transform .env.local --keys=snake --in-place
```

## Notes

- When `--in-place` is omitted the transformed content is written to **stdout**, leaving the original file untouched.
- If two keys collide after transformation (e.g. `fooBar` and `foo_bar` both become `FOO_BAR`) the last one wins — review the reported changes carefully.
