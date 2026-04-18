import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';

function writeTmp(content) {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const file = join(dir, '.env');
  writeFileSync(file, content, 'utf8');
  return file;
}

function run(file, ...args) {
  const result = spawnSync(
    process.execPath,
    ['--experimental-vm-modules', 'src/cli-rename.js', file, ...args],
    { encoding: 'utf8' }
  );
  return result;
}

describe('cli-rename', () => {
  it('renames a key in place', () => {
    const file = writeTmp('FOO=bar\nBAZ=qux\n');
    const r = run(file, 'FOO=NEW_FOO');
    assert.equal(r.status, 0);
    const content = readFileSync(file, 'utf8');
    assert.match(content, /NEW_FOO=bar/);
    assert.doesNotMatch(content, /^FOO=/m);
  });

  it('renames multiple keys', () => {
    const file = writeTmp('A=1\nB=2\nC=3\n');
    const r = run(file, 'A=X', 'B=Y');
    assert.equal(r.status, 0);
    const content = readFileSync(file, 'utf8');
    assert.match(content, /X=1/);
    assert.match(content, /Y=2/);
    assert.match(content, /C=3/);
  });

  it('dry-run does not write file', () => {
    const file = writeTmp('FOO=bar\n');
    const original = readFileSync(file, 'utf8');
    const r = run(file, 'FOO=NEW_FOO', '--dry-run');
    assert.equal(r.status, 0);
    assert.equal(readFileSync(file, 'utf8'), original);
  });

  it('exits with error on missing file', () => {
    const r = run('/nonexistent/.env', 'FOO=BAR');
    assert.equal(r.status, 1);
    assert.match(r.stderr, /cannot read file/);
  });

  it('exits with error on bad mapping', () => {
    const file = writeTmp('FOO=bar\n');
    const r = run(file, 'BADMAPPING');
    assert.equal(r.status, 1);
    assert.match(r.stderr, /invalid mapping/);
  });

  it('reports no matching keys when key absent', () => {
    const file = writeTmp('FOO=bar\n');
    const r = run(file, 'MISSING=NEW');
    assert.equal(r.status, 0);
    assert.match(r.stdout, /no matching keys/);
  });
});
