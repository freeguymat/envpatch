import { describe, it, expect } from 'vitest';
import { promote, formatPromote } from './promote.js';

const source = { DB_HOST: 'prod-db', DB_PORT: '5432', API_KEY: 'secret', NEW_VAR: 'hello' };
const target = { DB_HOST: 'local-db', DB_PORT: '5432', LOG_LEVEL: 'debug' };

describe('promote', () => {
  it('adds new keys to target', () => {
    const { result, added } = promote(source, target, ['NEW_VAR']);
    expect(result.NEW_VAR).toBe('hello');
    expect(added).toContain('NEW_VAR');
  });

  it('skips existing keys when overwrite is false', () => {
    const { skipped, result } = promote(source, target, ['DB_HOST']);
    expect(skipped).toContain('DB_HOST');
    expect(result.DB_HOST).toBe('local-db');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const { promoted, result } = promote(source, target, ['DB_HOST'], { overwrite: true });
    expect(promoted).toContain('DB_HOST');
    expect(result.DB_HOST).toBe('prod-db');
  });

  it('promotes all source keys when no keys specified', () => {
    const { result, promoted, skipped } = promote(source, target);
    expect(result.NEW_VAR).toBe('hello');
    expect(result.API_KEY).toBe('secret');
    expect(skipped).toContain('DB_HOST');
    expect(promoted.length).toBeGreaterThan(0);
  });

  it('ignores keys not present in source', () => {
    const { promoted, skipped } = promote(source, target, ['NONEXISTENT']);
    expect(promoted).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });

  it('does not mutate target', () => {
    const original = { ...target };
    promote(source, target, ['DB_HOST'], { overwrite: true });
    expect(target).toEqual(original);
  });
});

describe('formatPromote', () => {
  it('shows added, overwritten, and skipped keys', () => {
    const out = promote(source, target, ['DB_HOST', 'NEW_VAR', 'API_KEY'], { overwrite: true });
    const text = formatPromote(out);
    expect(text).toMatch(/\+ NEW_VAR/);
    expect(text).toMatch(/~ DB_HOST/);
    expect(text).toMatch(/Promoted/);
  });

  it('shows skipped keys when overwrite is false', () => {
    const out = promote(source, target, ['DB_HOST']);
    const text = formatPromote(out);
    expect(text).toMatch(/= DB_HOST.*skipped/);
  });

  it('returns nothing message when nothing to promote', () => {
    const text = formatPromote({ promoted: [], skipped: [], added: [] });
    expect(text).toBe('Nothing to promote.');
  });
});
