const { normalize, normalizeKey, normalizeValue, formatNormalize } = require('./normalize');

describe('normalizeKey', () => {
  test('uppercases a lowercase key', () => {
    expect(normalizeKey('db_host')).toBe('DB_HOST');
  });

  test('trims whitespace', () => {
    expect(normalizeKey('  API_KEY  ')).toBe('API_KEY');
  });

  test('leaves already-uppercase key unchanged', () => {
    expect(normalizeKey('PORT')).toBe('PORT');
  });
});

describe('normalizeValue', () => {
  test('trims surrounding whitespace', () => {
    expect(normalizeValue('  hello  ')).toBe('hello');
  });

  test('strips double quotes', () => {
    expect(normalizeValue('"my value"')).toBe('my value');
  });

  test('strips single quotes', () => {
    expect(normalizeValue("'my value'")).toBe('my value');
  });

  test('does not strip mismatched quotes', () => {
    expect(normalizeValue('"bad\')).toBe('"bad\'');
  });

  test('leaves plain value unchanged', () => {
    expect(normalizeValue('localhost')).toBe('localhost');
  });
});

describe('normalize', () => {
  test('normalizes keys and values', () => {
    const { env, changes } = normalize({ db_host: '"localhost"', port: '  3000  ' });
    expect(env).toEqual({ DB_HOST: 'localhost', PORT: '3000' });
    expect(changes).toHaveLength(2);
  });

  test('returns no changes for already-normalized env', () => {
    const { env, changes } = normalize({ HOST: 'localhost', PORT: '3000' });
    expect(env).toEqual({ HOST: 'localhost', PORT: '3000' });
    expect(changes).toHaveLength(0);
  });

  test('handles empty env', () => {
    const { env, changes } = normalize({});
    expect(env).toEqual({});
    expect(changes).toHaveLength(0);
  });
});

describe('formatNormalize', () => {
  test('reports no changes', () => {
    expect(formatNormalize([])).toMatch(/already normalized/);
  });

  test('lists changes', () => {
    const changes = [{ key: 'DB_HOST', from: 'db_host=localhost', to: 'DB_HOST=localhost' }];
    const out = formatNormalize(changes);
    expect(out).toMatch('Normalized 1 entry');
    expect(out).toMatch('db_host=localhost');
    expect(out).toMatch('DB_HOST=localhost');
  });
});
