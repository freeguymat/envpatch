const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-filter-${Date.now()}.env`);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  try {
    return {
      stdout: execFileSync(process.execPath, ['src/cli.js', 'filter', ...args], {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '..'),
      }),
      code: 0,
    };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

test('filter by prefix', () => {
  const f = writeTmp('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=myapp\n');
  const { stdout, code } = run([f, 'DB_']);
  expect(code).toBe(0);
  expect(stdout).toMatch('2 key(s)');
  expect(stdout).toMatch('DB_HOST=localhost');
});

test('filter --json output', () => {
  const f = writeTmp('APP_ENV=prod\nAPP_NAME=test\nSECRET=x\n');
  const { stdout, code } = run([f, 'APP_', '--json']);
  expect(code).toBe(0);
  const parsed = JSON.parse(stdout);
  expect(parsed).toHaveProperty('APP_ENV', 'prod');
  expect(parsed).not.toHaveProperty('SECRET');
});

test('filter --regex flag', () => {
  const f = writeTmp('FOO_1=a\nFOO_2=b\nBAR=c\n');
  const { stdout, code } = run([f, 'FOO_\\d', '--regex']);
  expect(code).toBe(0);
  expect(stdout).toMatch('2 key(s)');
});

test('filter no match', () => {
  const f = writeTmp('FOO=bar\n');
  const { stdout, code } = run([f, 'NOPE_']);
  expect(code).toBe(0);
  expect(stdout).toMatch('No keys matched');
});

test('missing file exits with error', () => {
  const { code, stderr } = run(['/tmp/no-such-file.env', 'DB_']);
  expect(code).not.toBe(0);
  expect(stderr).toMatch('error');
});
