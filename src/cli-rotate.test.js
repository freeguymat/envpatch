const fs = require('fs');
const os = require('os');
const path = require('path');
const { runRotate } = require('./cli-rotate');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `rotate-test-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  const logs = [];
  const errors = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errors.push(a.join(' '));
  let exitCode = 0;
  const origExit = process.exit;
  process.exit = (c) => { exitCode = c; throw new Error('exit:' + c); };
  try {
    runRotate(['node', 'cli-rotate.js', ...args]);
  } catch (e) {
    if (!e.message.startsWith('exit:')) throw e;
  } finally {
    console.log = origLog;
    console.error = origErr;
    process.exit = origExit;
  }
  return { logs, errors, exitCode };
}

test('renames a key in file', () => {
  const tmp = writeTmp('DB_HOST=localhost\nDB_PASS=secret\n');
  const out = writeTmp('');
  const { logs } = run(['--file', tmp, '--out', out, 'DB_HOST:DATABASE_HOST']);
  expect(logs.join('\n')).toMatch('DB_HOST → DATABASE_HOST');
  const written = fs.readFileSync(out, 'utf8');
  expect(written).toMatch('DATABASE_HOST=localhost');
  expect(written).not.toMatch('DB_HOST=');
});

test('dry-run does not write file', () => {
  const tmp = writeTmp('API_KEY=abc\n');
  const before = fs.readFileSync(tmp, 'utf8');
  run(['--file', tmp, '--dry-run', 'API_KEY:SERVICE_API_KEY']);
  expect(fs.readFileSync(tmp, 'utf8')).toBe(before);
});

test('rotates value alongside key', () => {
  const tmp = writeTmp('DB_PASS=old\n');
  const out = writeTmp('');
  run(['--file', tmp, '--out', out, 'DB_PASS:DATABASE_PASSWORD=newpass']);
  const written = fs.readFileSync(out, 'utf8');
  expect(written).toMatch('DATABASE_PASSWORD=newpass');
});

test('reports skipped missing key', () => {
  const tmp = writeTmp('FOO=bar\n');
  const out = writeTmp('');
  const { logs } = run(['--file', tmp, '--out', out, 'MISSING:NEW']);
  expect(logs.join('\n')).toMatch('key not found');
});

test('exits when no specs provided', () => {
  const tmp = writeTmp('FOO=bar\n');
  const { exitCode } = run(['--file', tmp]);
  expect(exitCode).toBe(1);
});

test('exits when --file missing', () => {
  const { exitCode } = run(['FOO:BAR']);
  expect(exitCode).toBe(1);
});
