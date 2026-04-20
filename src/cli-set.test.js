import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

function writeTmp(content) {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const file = join(dir, '.env');
  writeFileSync(file, content);
  return file;
}

function run(args) {
  try {
    const out = execSync(`node src/cli.js ${args}`, { encoding: 'utf8' });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout, stderr: e.stderr, code: e.status };
  }
}

describe('cli set', () => {
  it('sets a new key', () => {
    const file = writeTmp('FOO=bar\n');
    run(`set ${file} BAZ=qux`);
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('BAZ=qux'));
  });

  it('updates an existing key', () => {
    const file = writeTmp('FOO=bar\n');
    run(`set ${file} FOO=newval`);
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('FOO=newval'));
    assert.ok(!content.includes('FOO=bar'));
  });

  it('sets multiple keys', () => {
    const file = writeTmp('FOO=bar\n');
    run(`set ${file} A=1 B=2`);
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('A=1'));
    assert.ok(content.includes('B=2'));
  });

  it('prints summary after set', () => {
    const file = writeTmp('FOO=bar\n');
    const { stdout } = run(`set ${file} NEW=val`);
    assert.ok(stdout.includes('NEW'));
  });
});

describe('cli unset', () => {
  it('removes a key', () => {
    const file = writeTmp('FOO=bar\nBAZ=qux\n');
    run(`unset ${file} FOO`);
    const content = readFileSync(file, 'utf8');
    assert.ok(!content.includes('FOO'));
    assert.ok(content.includes('BAZ=qux'));
  });

  it('removes multiple keys', () => {
    const file = writeTmp('A=1\nB=2\nC=3\n');
    run(`unset ${file} A B`);
    const content = readFileSync(file, 'utf8');
    assert.ok(!content.includes('A='));
    assert.ok(!content.includes('B='));
    assert.ok(content.includes('C=3'));
  });

  it('is a no-op for missing key', () => {
    const file = writeTmp('FOO=bar\n');
    const { code } = run(`unset ${file} MISSING`);
    assert.equal(code, 0);
    const content = readFileSync(file, 'utf8');
    assert.ok(content.includes('FOO=bar'));
  });
});
