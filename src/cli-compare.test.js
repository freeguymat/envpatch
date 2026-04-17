'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-test-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  try {
    const out = execFileSync(process.execPath, ['src/cli-compare.js', ...args], { encoding: 'utf8' });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

const envA = 'FOO=bar\nBAZ=qux\nSHARED=same\n';
const envB = 'FOO=changed\nNEW=key\nSHARED=same\n';

test('shows differences between two files', () => {
  const a = writeTmp(envA);
  const b = writeTmp(envB);
  const { stdout, code } = run([a, b]);
  expect(code).toBe(0);
  expect(stdout).toMatch(/FOO/);
});

test('reports no differences when files are identical', () => {
  const a = writeTmp(envA);
  const b = writeTmp(envA);
  const { stdout, code } = run([a, b]);
  expect(code).toBe(0);
  expect(stdout).toMatch(/no differences/);
});

test('--json flag outputs valid JSON', () => {
  const a = writeTmp(envA);
  const b = writeTmp(envB);
  const { stdout, code } = run([a, b, '--json']);
  expect(code).toBe(0);
  const parsed = JSON.parse(stdout);
  expect(parsed).toHaveProperty('changed');
  expect(parsed).toHaveProperty('onlyInA');
  expect(parsed).toHaveProperty('onlyInB');
});

test('--missing-only shows only missing keys in JSON', () => {
  const a = writeTmp(envA);
  const b = writeTmp(envB);
  const { stdout, code } = run([a, b, '--json', '--missing-only']);
  expect(code).toBe(0);
  const parsed = JSON.parse(stdout);
  expect(parsed).toHaveProperty('onlyInA');
  expect(parsed).toHaveProperty('onlyInB');
  expect(parsed).not.toHaveProperty('changed');
});

test('fails with no args', () => {
  const { code, stderr } = run([]);
  expect(code).not.toBe(0);
  expect(stderr).toMatch(/usage|error/);
});

test('fails if file not found', () => {
  const { code, stderr } = run(['/nonexistent.env', '/also-nonexistent.env']);
  expect(code).not.toBe(0);
  expect(stderr).toMatch(/not found|error/);
});
