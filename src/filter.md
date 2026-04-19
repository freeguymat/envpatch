# filter

Filter keys from a `.env` file by prefix or regex pattern.

## Usage

```bash
envpatch filter <file> <pattern> [--regex] [--json]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `file` | Path to the `.env` file |
| `pattern` | String prefix or regex pattern to match keys |

## Flags

| Flag | Description |
|------|-------------|
| `--regex` | Treat pattern as a regular expression |
| `--json` | Output matched keys as JSON |

## Examples

```bash
# Filter keys starting with DB_
envpatch filter .env DB_

# Filter using a regex
envpatch filter .env "^(DB|APP)_" --regex

# Output as JSON
envpatch filter .env APP_ --json
```

## Output

Default output lists matched keys and their values:

```
Matched 2 key(s) for "DB_":
  DB_HOST=localhost
  DB_PORT=5432
```
