const path = require('path');
const { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } = require('./snapshot');

const DEFAULT_SNAP_DIR = '.env-snapshots';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function runSnapshot(argv) {
  const [subcommand, ...args] = argv;

  if (subcommand === 'save') {
    const envPath = args[0];
    if (!envPath) fatal('usage: snapshot save <envfile> [snapshotDir]');
    const snapDir = args[1] || DEFAULT_SNAP_DIR;
    try {
      const snapPath = saveSnapshot(path.resolve(envPath), snapDir);
      console.log('snapshot saved:', snapPath);
    } catch (e) {
      fatal(e.message);
    }

  } else if (subcommand === 'list') {
    const envPath = args[0];
    if (!envPath) fatal('usage: snapshot list <envfile> [snapshotDir]');
    const snapDir = args[1] || DEFAULT_SNAP_DIR;
    const baseName = path.basename(envPath);
    const snaps = listSnapshots(snapDir, baseName);
    if (snaps.length === 0) {
      console.log('no snapshots found');
    } else {
      snaps.forEach(s => console.log(s));
    }

  } else if (subcommand === 'show') {
    const snapFile = args[0];
    if (!snapFile) fatal('usage: snapshot show <snapshotfile>');
    try {
      const parsed = loadSnapshot(path.resolve(snapFile));
      Object.entries(parsed).forEach(([k, v]) => console.log(`${k}=${v}`));
    } catch (e) {
      fatal(e.message);
    }

  } else if (subcommand === 'delete') {
    const snapFile = args[0];
    if (!snapFile) fatal('usage: snapshot delete <snapshotfile>');
    try {
      deleteSnapshot(path.resolve(snapFile));
      console.log('snapshot deleted');
    } catch (e) {
      fatal(e.message);
    }

  } else {
    fatal('unknown subcommand. use: save | list | show | delete');
  }
}

module.exports = { runSnapshot };
