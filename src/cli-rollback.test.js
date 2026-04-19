const fs = require('fs');
const os = require('os');
const path = require('path');
const { runRollback } = require('./cli-rollback');
const { saveSnapshot } = require('./snapshot');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  const logs = [];
  const orig = console.log;
  console.log = (...a) => logs.push(a.join(' '));
  try {
    runRollback(['node', 'cli-rollback.js', ...args]);
  } finally {
    console.log = orig;
  }
  return logs;
}

test('lists snapshots with --list flag', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clirb-'));
  const envPath = writeTmp('clirb.env', 'A=1\n');
  saveSnapshot(dir, 'mysnap', { A: '1' });

  const out = run([envPath, dir, '--list']);
  expect(out.some(l => l.includes('mysnap'))).toBe(true);
});

test('rolls back env and prints message', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clirb2-'));
  const envPath = writeTmp('clirb2.env', 'A=changed\n');
  saveSnapshot(dir, 'snap1', { A: '1' });

  const out = run([envPath, dir, 'snap1']);
  expect(out.some(l => l.includes('snap1'))).toBe(true);
});

test('shows no snapshots message when list is empty', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clirb3-'));
  const envPath = writeTmp('clirb3.env', 'A=1\n');

  const out = run([envPath, dir, '--list']);
  expect(out.some(l => l.includes('No snapshots'))).toBe(true);
});
