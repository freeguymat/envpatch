import { renameKeys, formatRename } from './rename.js';

const base = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

describe('renameKeys', () => {
  test('renames a key', () => {
    const { result, renamed, skipped } = renameKeys(base, { FOO: 'FOO_NEW' });
    expect(result.FOO_NEW).toBe('foo');
    expect(result.FOO).toBeUndefined();
    expect(renamed).toContain('FOO');
    expect(skipped).toHaveLength(0);
  });

  test('renames multiple keys', () => {
    const { result, renamed } = renameKeys(base, { FOO: 'A', BAR: 'B' });
    expect(result.A).toBe('foo');
    expect(result.B).toBe('bar');
    expect(renamed).toEqual(['FOO', 'BAR']);
  });

  test('skips missing keys', () => {
    const { skipped } = renameKeys(base, { MISSING: 'X' });
    expect(skipped).toContain('MISSING');
  });

  test('skips if target key exists and overwrite is false', () => {
    const { result, skipped } = renameKeys(base, { FOO: 'BAR' });
    expect(result.BAR).toBe('bar');
    expect(skipped).toContain('FOO');
  });

  test('overwrites if overwrite option is true', () => {
    const { result, renamed } = renameKeys(base, { FOO: 'BAR' }, { overwrite: true });
    expect(result.BAR).toBe('foo');
    expect(renamed).toContain('FOO');
  });

  test('does not mutate original env', () => {
    renameKeys(base, { FOO: 'FOO2' });
    expect(base.FOO).toBe('foo');
  });
});

describe('formatRename', () => {
  test('shows renamed and skipped', () => {
    const out = formatRename({ renamed: ['FOO'], skipped: ['BAR'] });
    expect(out).toContain('Renamed:');
    expect(out).toContain('FOO');
    expect(out).toContain('Skipped:');
    expect(out).toContain('BAR');
  });

  test('shows nothing message when empty', () => {
    const out = formatRename({ renamed: [], skipped: [] });
    expect(out).toBe('Nothing to rename.');
  });
});
