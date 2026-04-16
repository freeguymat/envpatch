'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CLI = path.resolve(__dirname, 'cli.js');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  return execSync(`node ${CLI} ${args}`, { encoding: 'utf8' });
}

test('diff outputs json', () => {
  const base = writeTmp('base.env', 'FOO=1\nBAR=2\n');
  const target = writeTmp('target.env', 'FOO=1\nBAR=3\nBAZ=4\n');
  const out = run(`diff ${base} ${target}`);
  const result = JSON.parse(out);
  expect(result).toEqual(expect.arrayContaining([
    expect.objectContaining({ key: 'BAR' }),
    expect.objectContaining({ key: 'BAZ' }),
  ]));
});

test('patch outputs patched env', () => {
  const base = writeTmp('patch_base.env', 'FOO=1\nBAR=2\n');
  const patchFile = writeTmp('my.patch.json', JSON.stringify([
    { op: 'set', key: 'BAR', value: '99' },
    { op: 'add', key: 'NEW', value: 'hello' },
  ]));
  const out = run(`patch ${base} ${patchFile}`);
  expect(out).toContain('BAR=99');
  expect(out).toContain('NEW=hello');
});

test('validate passes for valid env', () => {
  const env = writeTmp('valid.env', 'PORT=3000\nNODE_ENV=production\n');
  const schema = writeTmp('schema.json', JSON.stringify({
    PORT: { required: true },
    NODE_ENV: { required: true },
  }));
  const out = run(`validate ${env} ${schema}`);
  expect(out.trim()).toBe('valid');
});

test('validate fails for missing required key', () => {
  const env = writeTmp('invalid.env', 'PORT=3000\n');
  const schema = writeTmp('schema2.json', JSON.stringify({
    PORT: { required: true },
    SECRET: { required: true },
  }));
  expect(() => run(`validate ${env} ${schema}`)).toThrow();
});

test('unknown command exits non-zero', () => {
  expect(() => run('unknown')).toThrow();
});
