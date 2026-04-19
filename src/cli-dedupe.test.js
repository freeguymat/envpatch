import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runDedupe } from './cli-dedupe.js';

function writeTmp(content) {
  const dir = mkdtempSync(join(tmpdir(), 'envpatch-'));
  const file = join(dir, '.env');
  writeFileSync(file, content, 'utf8');
  return file;
}

function run(args, file) {
  const logs = [];
  const errors = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errors.push(a.join(' '));
  let exited = false;
  const origExit = process.exit;
  process.exit = () => { exited = true; throw new Error('exit'); };
  try {
    runDedupe(['node', 'cli-dedupe.js', ...args, file]);
  } catch {}
  console.log = origLog;
  console.error = origErr;
  process.exit = origExit;
  return { logs, errors, exited };
}

describe('cli-dedupe', () => {
  it('reports no duplicates when env is clean', () => {
    const f = writeTmp('FOO=1\nBAR=2\n');
    const { logs } = run([], f);
    assert.ok(logs.some(l => l.includes('no duplicates')));
  });

  it('reports duplicates found', () => {
    const f = writeTmp('FOO=1\nBAR=2\nFOO=3\n');
    const { logs } = run([], f);
    assert.ok(logs.some(l => l.includes('FOO')));
  });

  it('writes deduped file with --in-place', () => {
    const f = writeTmp('FOO=1\nBAR=2\nFOO=3\n');
    run(['-i'], f);
    const out = readFileSync(f, 'utf8');
    const lines = out.split('\n').filter(Boolean);
    const fooLines = lines.filter(l => l.startsWith('FOO='));
    assert.equal(fooLines.length, 1);
  });

  it('exits on missing file arg', () => {
    const origExit = process.exit;
    let code;
    process.exit = (c) => { code = c; throw new Error('exit'); };
    try { runDedupe(['node', 'cli-dedupe.js']); } catch {}
    process.exit = origExit;
    assert.equal(code, 1);
  });
});
