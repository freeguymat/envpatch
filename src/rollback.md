# Rollback

The `rollback` module lets you restore a `.env` file to a previously saved snapshot.

## Usage

```bash
# Roll back to a specific snapshot
node src/cli-rollback.js .env snapshots/ snap-2024-01-01

# Roll back to the latest snapshot
node src/cli-rollback.js .env snapshots/

# List available snapshots
node src/cli-rollback.js .env snapshots/ --list
```

## API

### `rollback(envPath, snapshotDir, snapshotName?)`

Restores `envPath` to the state stored in the given snapshot (or the latest if none specified).

Returns `{ snapshot: string, changes: number }`.

### `formatRollback(result)`

Returns a human-readable summary string.

## Notes

- Snapshots are managed by `src/snapshot.js`.
- The rollback is computed as a diff between the current env and the snapshot, then applied via `applyPatch`.
- Original file is modified in place.
