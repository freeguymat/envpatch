import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-defaults-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function run(envFile, defaultsFile, extra = []) {
  try {
    const out = execFileSync(
      process.execPath,
      ['--experimental-vm-modules', 'src/cli-defaults.js', envFile, defaultsFile, ...extra],
      { encoding: 'utf8' }
    );
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status ?? 1 };
  }
}

describe('cli-defaults', () => {
  it('prints applied defaults summary', () => {
    const env = writeTmp('A=1\n');
    const defs = writeTmp('A=99\nB=2\n');
    const { stdout, code } = run(env, defs);
    expect(code).toBe(0);
    expect(stdout).toMatch(/1 default/);
    expect(stdout).toMatch(/\+ B/);
  });

  it('prints nothing-to-apply message when all keys present', () => {
    const env = writeTmp('A=1\nB=2\n');
    const defs = writeTmp('A=9\nB=8\n');
    const { stdout, code } = run(env, defs);
    expect(code).toBe(0);
    expect(stdout).toMatch(/No defaults applied/);
  });

  it('writes file in-place with --write', () => {
    const env = writeTmp('A=1\n');
    const defs = writeTmp('B=42\n');
    run(env, defs, ['--write']);
    const content = fs.readFileSync(env, 'utf8');
    expect(content).toMatch(/B=42/);
    expect(content).toMatch(/A=1/);
  });

  it('suppresses output with --quiet', () => {
    const env = writeTmp('A=1\n');
    const defs = writeTmp('B=2\n');
    const { stdout } = run(env, defs, ['--quiet']);
    expect(stdout.trim()).toBe('');
  });

  it('exits with error when files missing', () => {
    const { code } = run('/no/such/file.env', '/no/other.env');
    expect(code).not.toBe(0);
  });
});
