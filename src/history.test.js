import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadHistory, saveHistory, clearHistory, formatHistory } from './history.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envpatch-hist-'));
}

describe('history', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  it('returns empty array if no history exists', () => {
    expect(loadHistory(dir)).toEqual([]);
  });

  it('saves and loads a history entry', () => {
    saveHistory({ action: 'patch', file: '.env', keys: ['FOO'] }, dir);
    const h = loadHistory(dir);
    expect(h).toHaveLength(1);
    expect(h[0].action).toBe('patch');
    expect(h[0].file).toBe('.env');
    expect(h[0].keys).toEqual(['FOO']);
    expect(h[0].timestamp).toBeDefined();
  });

  it('appends multiple entries', () => {
    saveHistory({ action: 'patch', file: '.env' }, dir);
    saveHistory({ action: 'redact', file: '.env.prod' }, dir);
    expect(loadHistory(dir)).toHaveLength(2);
  });

  it('clears history', () => {
    saveHistory({ action: 'patch', file: '.env' }, dir);
    clearHistory(dir);
    expect(loadHistory(dir)).toEqual([]);
  });

  it('formatHistory returns message when empty', () => {
    expect(formatHistory([])).toMatch(/no history/i);
  });

  it('formatHistory formats entries', () => {
    const entries = [
      { timestamp: '2024-01-01T00:00:00.000Z', action: 'patch', file: '.env', keys: ['FOO', 'BAR'] },
      { timestamp: '2024-01-02T00:00:00.000Z', action: 'redact', file: '.env.prod', note: 'test' },
    ];
    const out = formatHistory(entries);
    expect(out).toContain('patch');
    expect(out).toContain('FOO, BAR');
    expect(out).toContain('redact');
    expect(out).toContain('note: test');
  });
});
