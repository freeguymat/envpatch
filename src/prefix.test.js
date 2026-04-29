const { addPrefix, removePrefix, replacePrefix, formatPrefix } = require('./prefix');

const base = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };

describe('addPrefix', () => {
  test('adds prefix to all keys', () => {
    const result = addPrefix({ FOO: '1', BAR: '2' }, 'APP_');
    expect(result).toEqual({ APP_FOO: '1', APP_BAR: '2' });
  });

  test('adds prefix only to specified keys', () => {
    const result = addPrefix({ FOO: '1', BAR: '2' }, 'APP_', ['FOO']);
    expect(result).toEqual({ APP_FOO: '1', BAR: '2' });
  });

  test('preserves values', () => {
    const result = addPrefix(base, 'PROD_');
    expect(result['PROD_DB_HOST']).toBe('localhost');
    expect(result['PROD_APP_NAME']).toBe('myapp');
  });

  test('returns empty object for empty input', () => {
    expect(addPrefix({}, 'X_')).toEqual({});
  });
});

describe('removePrefix', () => {
  test('removes matching prefix from keys', () => {
    const result = removePrefix({ APP_FOO: '1', APP_BAR: '2' }, 'APP_');
    expect(result).toEqual({ FOO: '1', BAR: '2' });
  });

  test('leaves non-matching keys unchanged', () => {
    const result = removePrefix(base, 'DB_');
    expect(result).toMatchObject({ HOST: 'localhost', PORT: '5432', APP_NAME: 'myapp' });
  });

  test('handles prefix not present in any key', () => {
    const result = removePrefix({ FOO: '1' }, 'NOPE_');
    expect(result).toEqual({ FOO: '1' });
  });
});

describe('replacePrefix', () => {
  test('replaces prefix on matching keys', () => {
    const result = replacePrefix({ DEV_HOST: 'a', DEV_PORT: 'b', OTHER: 'c' }, 'DEV_', 'PROD_');
    expect(result).toEqual({ PROD_HOST: 'a', PROD_PORT: 'b', OTHER: 'c' });
  });

  test('no-op when prefix not found', () => {
    const result = replacePrefix({ FOO: '1' }, 'BAR_', 'BAZ_');
    expect(result).toEqual({ FOO: '1' });
  });
});

describe('formatPrefix', () => {
  test('shows added and removed keys', () => {
    const before = { FOO: '1' };
    const after = { APP_FOO: '1' };
    const out = formatPrefix(before, after);
    expect(out).toContain('- FOO');
    expect(out).toContain('+ APP_FOO');
  });

  test('returns no changes message when identical', () => {
    const out = formatPrefix({ FOO: '1' }, { FOO: '1' });
    expect(out).toBe('(no changes)');
  });
});
