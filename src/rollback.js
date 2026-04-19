const { loadSnapshot, listSnapshots } = require('./snapshot');
const { applyPatch } = require('./applyPatch');
const { diff } = require('./diff');
const { parse } = require('./parser');
const fs = require('fs');

function rollback(envPath, snapshotDir, snapshotName) {
  const snapshots = listSnapshots(snapshotDir);
  if (!snapshots.length) throw new Error('No snapshots found');

  const target = snapshotName
    ? snapshots.find(s => s === snapshotName)
    : snapshots[snapshots.length - 1];

  if (!target) throw new Error(`Snapshot not found: ${snapshotName}`);

  const snapshotEnv = loadSnapshot(snapshotDir, target);
  const currentContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const currentEnv = parse(currentContent);

  const patch = diff(currentEnv, snapshotEnv);
  applyPatch(envPath, patch);

  return { snapshot: target, changes: patch.length };
}

function formatRollback({ snapshot, changes }) {
  return `Rolled back to snapshot "${snapshot}" with ${changes} change(s).`;
}

module.exports = { rollback, formatRollback };
