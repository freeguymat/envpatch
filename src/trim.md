# envpatch trim

Strip leading and trailing whitespace from all values in a `.env` file.

## Usage

```sh
envpatch trim <file> [--write] [--quiet]
```

### Options

| Flag | Description |
|------|-------------|
| `--write` | Write trimmed values back to the file in place |
| `--quiet` | Suppress output |

## Example

```sh
# Preview what would be trimmed
envpatch trim .env

# Trim and save
envpatch trim .env --write
```

### Sample output

```
Trimmed 2 value(s):

  API_KEY
    before: "  abc123  "
    after:  "abc123"

  DB_HOST
    before: " localhost"
    after:  "localhost"
```

## Notes

- Only values are trimmed; keys are left unchanged.
- Empty values that consist only of whitespace become empty strings.
- Use `--write` carefully — it overwrites the original file.
