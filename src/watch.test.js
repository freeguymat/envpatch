import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { watchEnv } from './watch.js';

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch-watch-${Date.now()}.env`);
  fs.writeFileSync(p, content);
  return p;
}

describe('watchEnv', () => {
  let filePath;
  let watcher;

  afterEach(() => {
    if (watcher) watcher.stop();
    if (filePath) try { fs.unlinkSync(filePath); } catch {}
  });

  it('calls onChange when file content changes', async () => {
    filePath = writeTmp('A=1\nB=2\n');
    const events = [];
    watcher = watchEnv(filePath, (e) => events.push(e));

    fs.writeFileSync(filePath, 'A=1\nB=3\n');
    await new Promise((r) => setTimeout(r, 300));

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].changes.some((c) => c.key === 'B')).toBe(true);
  });

  it('does not call onChange when content is identical', async () => {
    filePath = writeTmp('A=1\n');
    const events = [];
    watcher = watchEnv(filePath, (e) => events.push(e));

    fs.writeFileSync(filePath, 'A=1\n');
    await new Promise((r) => setTimeout(r, 300));

    expect(events.length).toBe(0);
  });

  it('stop() prevents further callbacks', async () => {
    filePath = writeTmp('X=1\n');
    const events = [];
    watcher = watchEnv(filePath, (e) => events.push(e));
    watcher.stop();

    fs.writeFileSync(filePath, 'X=2\n');
    await new Promise((r) => setTimeout(r, 300));

    expect(events.length).toBe(0);
  });
});
