const fs = require('fs');
const os = require('os');
const path = require('path');
const { rollback, formatRollback } = require('./rollback');
const { saveSnapshot } = require('./snapshot');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content);
  return p;
}

test('rollback restores env from snapshot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-'));
  const envPath = writeTmp('rollback.env', 'A=1\nB=2\n');

  saveSnapshot(dir, 'snap1', { A: '1', B: '2' });
  fs.writeFileSync(envPath, 'A=changed\nB=2\nC=3\n');

  const result = rollback(envPath, dir, 'snap1');
  expect(result.snapshot).toBe('snap1');
  expect(result.changes).toBeGreaterThan(0);

  const restored = fs.readFileSync(envPath, 'utf8');
  expect(restored).toContain('A=1');
});

test('rollback uses latest snapshot if none specified', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb2-'));
  const envPath = writeTmp('rollback2.env', 'X=old\n');

  saveSnapshot(dir, 'snap1', { X: 'new' });
  const result = rollback(envPath, dir);
  expect(result.changes).toBeGreaterThanOrEqual(1);
});

test('throws if no snapshots exist', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb3-'));
  const envPath = writeTmp('rollback3.env', 'A=1\n');
  expect(() => rollback(envPath, dir)).toThrow('No snapshots found');
});

test('formatRollback returns readable string', () => {
  const msg = formatRollback({ snapshot: 'snap1', changes: 3 });
  expect(msg).toMatch('snap1');
  expect(msg).toMatch('3');
});
