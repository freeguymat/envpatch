import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-sort-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function run(args) {
  try {
    const out = execSync(`node --experimental-vm-modules src/cli-sort.js ${args}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

describe('cli-sort', () => {
  it('sorts keys alphabetically and prints to stdout', () => {
    const tmp = writeTmp('ZEBRA=1\nAPPLE=2\nMIDDLE=3\n');
    const { stdout, code } = run(tmp);
    expect(code).toBe(0);
    const lines = stdout.trim().split('\n').filter(l => l && !l.startsWith('#'));
    const keys = lines.map(l => l.split('=')[0]);
    expect(keys).toEqual([...keys].sort());
    fs.unlinkSync(tmp);
  });

  it('sorts in-place with --in-place flag', () => {
    const tmp = writeTmp('Z=last\nA=first\nM=mid\n');
    const { code } = run(`${tmp} --in-place`);
    expect(code).toBe(0);
    const content = fs.readFileSync(tmp, 'utf8');
    const keys = content.trim().split('\n').filter(l => l).map(l => l.split('=')[0]);
    expect(keys).toEqual([...keys].sort());
    fs.unlinkSync(tmp);
  });

  it('exits with error when no file given', () => {
    const { code } = run('');
    expect(code).not.toBe(0);
  });

  it('exits with error when file not found', () => {
    const { code } = run('/nonexistent/path/.env');
    expect(code).not.toBe(0);
  });
});
