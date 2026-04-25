const { extract, formatExtract } = require('./extract');

describe('extract', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
    APP_NAME: 'myapp',
  };

  test('extracts requested keys that exist', () => {
    const { extracted, missing } = extract(env, ['DB_HOST', 'DB_PORT']);
    expect(extracted).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(missing).toEqual([]);
  });

  test('reports missing keys', () => {
    const { extracted, missing } = extract(env, ['DB_HOST', 'MISSING_KEY']);
    expect(extracted).toEqual({ DB_HOST: 'localhost' });
    expect(missing).toEqual(['MISSING_KEY']);
  });

  test('returns empty extracted when no keys match', () => {
    const { extracted, missing } = extract(env, ['FOO', 'BAR']);
    expect(extracted).toEqual({});
    expect(missing).toEqual(['FOO', 'BAR']);
  });

  test('handles empty keys array', () => {
    const { extracted, missing } = extract(env, []);
    expect(extracted).toEqual({});
    expect(missing).toEqual([]);
  });

  test('handles empty env', () => {
    const { extracted, missing } = extract({}, ['DB_HOST']);
    expect(extracted).toEqual({});
    expect(missing).toEqual(['DB_HOST']);
  });
});

describe('formatExtract', () => {
  test('formats extracted and missing keys', () => {
    const result = {
      extracted: { DB_HOST: 'localhost', DB_PORT: '5432' },
      missing: ['API_SECRET'],
    };
    const output = formatExtract(result);
    expect(output).toContain('Extracted (2):');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('DB_PORT=5432');
    expect(output).toContain('Missing (1):');
    expect(output).toContain('API_SECRET');
  });

  test('omits missing section when none missing', () => {
    const result = { extracted: { FOO: 'bar' }, missing: [] };
    const output = formatExtract(result);
    expect(output).not.toContain('Missing');
  });

  test('omits extracted section when none extracted', () => {
    const result = { extracted: {}, missing: ['GONE'] };
    const output = formatExtract(result);
    expect(output).not.toContain('Extracted');
    expect(output).toContain('Missing (1):');
  });
});
