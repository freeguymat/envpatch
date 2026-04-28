const { truncate, truncateValue, formatTruncate } = require('./truncate');

describe('truncateValue', () => {
  test('returns value unchanged if within limit', () => {
    expect(truncateValue('hello', 10)).toBe('hello');
  });

  test('truncates value exceeding maxLen', () => {
    const long = 'a'.repeat(100);
    const result = truncateValue(long, 20);
    expect(result.length).toBe(20);
    expect(result.endsWith('...')).toBe(true);
  });

  test('uses custom suffix', () => {
    const result = truncateValue('abcdefghij', 7, '--');
    expect(result).toBe('abcde--');
    expect(result.length).toBe(7);
  });

  test('returns non-string values unchanged', () => {
    expect(truncateValue(undefined, 10)).toBe(undefined);
  });
});

describe('truncate', () => {
  const env = {
    SHORT: 'hi',
    LONG: 'x'.repeat(200),
    MEDIUM: 'y'.repeat(80),
    OVER: 'z'.repeat(81),
  };

  test('truncates values over default maxLen', () => {
    const { result, truncated } = truncate(env);
    expect(result.SHORT).toBe('hi');
    expect(result.LONG.length).toBe(80);
    expect(result.LONG.endsWith('...')).toBe(true);
    expect(result.MEDIUM).toBe('y'.repeat(80));
    expect(result.OVER.length).toBe(80);
    expect(truncated).toEqual(expect.arrayContaining(['LONG', 'OVER']));
    expect(truncated).not.toContain('SHORT');
    expect(truncated).not.toContain('MEDIUM');
  });

  test('respects custom maxLen', () => {
    const { result, truncated } = truncate(env, { maxLen: 10 });
    expect(result.SHORT).toBe('hi');
    expect(result.LONG.length).toBe(10);
    expect(truncated.length).toBe(3);
  });

  test('only truncates specified keys', () => {
    const { result, truncated } = truncate(env, { keys: ['LONG'] });
    expect(result.LONG.length).toBe(80);
    expect(result.OVER).toBe('z'.repeat(81));
    expect(truncated).toEqual(['LONG']);
  });

  test('returns empty truncated list when nothing exceeds limit', () => {
    const { truncated } = truncate({ A: 'short' }, { maxLen: 100 });
    expect(truncated).toHaveLength(0);
  });
});

describe('formatTruncate', () => {
  test('reports no truncations', () => {
    expect(formatTruncate([], 80)).toBe('No values exceeded 80 characters.');
  });

  test('lists truncated keys', () => {
    const out = formatTruncate(['FOO', 'BAR'], 80);
    expect(out).toContain('Truncated 2 value(s)');
    expect(out).toContain('  - FOO');
    expect(out).toContain('  - BAR');
  });
});
