const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function writeTmp(content) {
  const f = path.join(os.tmpdir(), `envpatch-transform-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(f, content, 'utf8');
  return f;
}

function run(args, opts = {}) {
  try {
    return {
      stdout: execFileSync(process.execPath, ['src/cli-transform.js', ...args], {
        encoding: 'utf8', ...opts,
      }),
      code: 0,
    };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

test('transforms keys to uppercase', () => {
  const f = writeTmp('foo=bar\nbaz=qux\n');
  const { stdout, code } = run([f, '--keys=uppercase']);
  expect(code).toBe(0);
  expect(stdout).toMatch('FOO=bar');
  expect(stdout).toMatch('BAZ=qux');
});

test('transforms values to uppercase', () => {
  const f = writeTmp('FOO=hello\n');
  const { stdout } = run([f, '--values=uppercase']);
  expect(stdout).toMatch('FOO=HELLO');
});

test('transforms values trim', () => {
  const f = writeTmp('FOO=  spaced  \n');
  const { stdout } = run([f, '--values=trim']);
  expect(stdout).toMatch('FOO=spaced');
});

test('--in-place writes back to file', () => {
  const f = writeTmp('foo=bar\n');
  const { code } = run([f, '--keys=uppercase', '--in-place']);
  expect(code).toBe(0);
  const written = fs.readFileSync(f, 'utf8');
  expect(written).toMatch('FOO=bar');
});

test('exits 1 on missing file', () => {
  const { code } = run(['/nonexistent/.env']);
  expect(code).toBe(1);
});

test('exits 1 on unknown --keys mode', () => {
  const f = writeTmp('FOO=bar\n');
  const { code, stderr } = run([f, '--keys=magic']);
  expect(code).toBe(1);
  expect(stderr).toMatch('unknown --keys mode');
});

test('exits 1 on no file argument', () => {
  const { code } = run([]);
  expect(code).toBe(1);
});

test('reports number of changes', () => {
  const f = writeTmp('foo=bar\nbaz=qux\n');
  const { stdout } = run([f, '--keys=uppercase']);
  expect(stdout).toMatch('2 entries');
});
