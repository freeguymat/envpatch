const { isPlaceholder, findPlaceholders, formatPlaceholders } = require('./placeholder');

describe('isPlaceholder', () => {
  test('empty string is placeholder', () => {
    expect(isPlaceholder('')).toBe(true);
  });

  test('CHANGEME variants', () => {
    expect(isPlaceholder('CHANGEME')).toBe(true);
    expect(isPlaceholder('changeme')).toBe(true);
  });

  test('TODO / FIXME', () => {
    expect(isPlaceholder('TODO')).toBe(true);
    expect(isPlaceholder('fixme')).toBe(true);
  });

  test('YOUR_ prefix', () => {
    expect(isPlaceholder('YOUR_API_KEY')).toBe(true);
    expect(isPlaceholder('your-secret')).toBe(true);
  });

  test('angle bracket patterns', () => {
    expect(isPlaceholder('<your-token>')).toBe(true);
    expect(isPlaceholder('[INSERT_VALUE]')).toBe(true);
  });

  test('xxx placeholder', () => {
    expect(isPlaceholder('xxxx')).toBe(true);
    expect(isPlaceholder('XXX')).toBe(true);
  });

  test('null / undefined / none', () => {
    expect(isPlaceholder('null')).toBe(true);
    expect(isPlaceholder('undefined')).toBe(true);
    expect(isPlaceholder('none')).toBe(true);
    expect(isPlaceholder('n/a')).toBe(true);
  });

  test('repeated digit placeholders', () => {
    expect(isPlaceholder('00000')).toBe(true);
    expect(isPlaceholder('11111')).toBe(true);
  });

  test('real values are not placeholders', () => {
    expect(isPlaceholder('mysecretkey123')).toBe(false);
    expect(isPlaceholder('https://example.com')).toBe(false);
    expect(isPlaceholder('production')).toBe(false);
    expect(isPlaceholder('true')).toBe(false);
    expect(isPlaceholder('42')).toBe(false);
  });
});

describe('findPlaceholders', () => {
  test('returns matching keys', () => {
    const env = { API_KEY: 'CHANGEME', DB_URL: 'postgres://real', SECRET: '' };
    const result = findPlaceholders(env);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.key)).toEqual(expect.arrayContaining(['API_KEY', 'SECRET']));
  });

  test('returns empty array when no placeholders', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    expect(findPlaceholders(env)).toEqual([]);
  });
});

describe('formatPlaceholders', () => {
  test('no findings message', () => {
    expect(formatPlaceholders([])).toBe('No placeholder values found.');
  });

  test('formats findings with count', () => {
    const findings = [{ key: 'API_KEY', value: 'CHANGEME' }, { key: 'SECRET', value: '' }];
    const out = formatPlaceholders(findings);
    expect(out).toMatch('Found 2 placeholder value(s)');
    expect(out).toMatch('API_KEY');
    expect(out).toMatch('(empty)');
  });
});
