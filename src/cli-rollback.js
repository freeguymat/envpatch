#!/usr/bin/env node
const path = require('path');
const { rollback, formatRollback } = require('./rollback');
const { listSnapshots } = require('./snapshot');

function fatal(msg) {
  console.error('Error:', msg);
  process.exit(1);
}

function runRollback(argv) {
  const args = argv.slice(2);
  const envPath = args[0];
  const snapshotDir = args[1];
  const snapshotName = args[2];

  if (!envPath || !snapshotDir) {
    fatal('Usage: rollback <envFile> <snapshotDir> [snapshotName]');
  }

  if (args.includes('--list')) {
    const snaps = listSnapshots(snapshotDir);
    if (!snaps.length) {
      console.log('No snapshots found.');
    } else {
      snaps.forEach(s => console.log(s));
    }
    return;
  }

  let result;
  try {
    result = rollback(path.resolve(envPath), path.resolve(snapshotDir), snapshotName);
  } catch (e) {
    fatal(e.message);
  }

  console.log(formatRollback(result));
}

if (require.main === module) {
  runRollback(process.argv);
}

module.exports = { runRollback };
