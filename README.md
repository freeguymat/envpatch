# envpatch

CLI tool to diff and patch .env files across environments safely.

## Installation

```bash
npm install -g envpatch
```

## Usage

Compare two `.env` files and apply missing or changed variables:

```bash
# Diff two env files
envpatch diff .env.example .env

# Patch your env file with updates from a source
envpatch patch .env.example .env

# Preview changes without applying them
envpatch patch .env.example .env --dry-run
```

**Example output:**

```
+ DB_HOST=localhost        (missing in target)
~ API_TIMEOUT=5000→10000  (value changed)
= SECRET_KEY              (unchanged)

2 changes found. Run without --dry-run to apply.
```

By default, `envpatch` will **never overwrite** existing values unless you pass the `--force` flag, keeping your secrets safe.

## Options

| Flag        | Description                          |
|-------------|--------------------------------------|
| `--dry-run` | Preview changes without writing      |
| `--force`   | Overwrite existing values in target  |
| `--silent`  | Suppress output                      |

## License

MIT © [envpatch contributors](https://github.com/envpatch/envpatch)