import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';

function writeTmp(dir, name, content) {
  const p = join(dir, name);
  writeFileSync(p, content);
  return p;
}

function run(args) {
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', 'src/cli-import.js', ...args], {
    encoding: 'utf8',
    env: { ...process.env }
  });
  return result;
}

test('imports json file to stdout', () => {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const jsonFile = writeTmp(dir, 'vars.json', JSON.stringify({ FOO: 'bar', BAZ: '123' }));
  const result = run([jsonFile, '--format=json']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /FOO=bar/);
  assert.match(result.stdout, /BAZ=123/);
});

test('imports yaml file to output file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const yamlFile = writeTmp(dir, 'vars.yaml', 'FOO: bar\nBAZ: "123"\n');
  const outFile = join(dir, 'out.env');
  const result = run([yamlFile, '--format=yaml', `--output=${outFile}`]);
  assert.equal(result.status, 0);
  const content = readFileSync(outFile, 'utf8');
  assert.match(content, /FOO=bar/);
});

test('merge import with base env', () => {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const baseFile = writeTmp(dir, 'base.env', 'EXISTING=keep\nFOO=old\n');
  const jsonFile = writeTmp(dir, 'new.json', JSON.stringify({ FOO: 'new', EXTRA: 'yes' }));
  const result = run([jsonFile, baseFile, '--merge', '--format=json']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /FOO=new/);
  assert.match(result.stdout, /EXISTING=keep/);
  assert.match(result.stdout, /EXTRA=yes/);
});

test('exits with error when no args', () => {
  const result = run([]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /usage/);
});

test('exits with error on unknown format', () => {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const f = writeTmp(dir, 'vars.txt', 'FOO=bar');
  const result = run([f]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /format/);
});
