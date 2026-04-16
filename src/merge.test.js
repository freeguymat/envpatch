import { merge } from './merge.js';

describe('merge', () => {
  const base = { FOO: 'foo', BAR: 'bar', SHARED: 'base' };
  const incoming = { BAZ: 'baz', SHARED: 'incoming', FOO: 'foo' };

  test('adds new keys from incoming', () => {
    const { merged } = merge(base, incoming);
    expect(merged.BAZ).toBe('baz');
  });

  test('keeps identical values without conflict', () => {
    const { conflicts } = merge(base, incoming);
    expect(conflicts.find(c => c.key === 'FOO')).toBeUndefined();
  });

  test('detects conflicts on differing values', () => {
    const { conflicts } = merge(base, incoming);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toEqual({ key: 'SHARED', base: 'base', incoming: 'incoming' });
  });

  test('strategy ours keeps base value on conflict', () => {
    const { merged } = merge(base, incoming, 'ours');
    expect(merged.SHARED).toBe('base');
  });

  test('strategy theirs uses incoming value on conflict', () => {
    const { merged } = merge(base, incoming, 'theirs');
    expect(merged.SHARED).toBe('incoming');
  });

  test('strategy union uses incoming value on conflict', () => {
    const { merged } = merge(base, incoming, 'union');
    expect(merged.SHARED).toBe('incoming');
  });

  test('base keys not in incoming are preserved', () => {
    const { merged } = merge(base, incoming);
    expect(merged.BAR).toBe('bar');
  });

  test('empty incoming returns base unchanged', () => {
    const { merged, conflicts } = merge(base, {});
    expect(merged).toEqual(base);
    expect(conflicts).toHaveLength(0);
  });
});
