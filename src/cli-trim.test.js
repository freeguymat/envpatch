import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-trim-${Date.now()}.env`);
  fs.writeFileSync(p, content);
  return p;
}

function run(args) {
  try {
    const out = execFileSync(process.execPath, ['--experimental-vm-modules', 'node_modules/.bin/jest', '--testPathPattern=NONE'], { encoding: 'utf8' });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

import { runTrim } from './cli-trim.js';

test('runTrim prints changes', () => {
  const p = writeTmp('A=  hello  \nB=world\n');
  const logs = [];
  const orig = console.log;
  console.log = m => logs.push(m);
  runTrim(['node', 'cli', p]);
  console.log = orig;
  expect(logs.join('\n')).toContain('A');
  fs.unlinkSync(p);
});

test('runTrim --write updates file', () => {
  const p = writeTmp('KEY=  value  \n');
  const orig = console.log;
  console.log = () => {};
  runTrim(['node', 'cli', p, '--write']);
  console.log = orig;
  const content = fs.readFileSync(p, 'utf8');
  expect(content).toContain('KEY=value');
  expect(content).not.toContain('  value  ');
  fs.unlinkSync(p);
});

test('runTrim exits on missing file', () => {
  const orig = process.exit;
  let code;
  process.exit = c => { code = c; throw new Error('exit'); };
  try { runTrim(['node', 'cli', '/no/such/file.env']); } catch {}
  process.exit = orig;
  expect(code).toBe(1);
});
