const { extractComments, stripComments, injectComments } = require('./comment');

const sample = [
  '# Database host',
  'DB_HOST=localhost',
  '# Database port',
  'DB_PORT=5432',
  'SECRET=abc123 # keep this safe',
  'PLAIN=value',
].join('\n');

describe('extractComments', () => {
  test('extracts standalone comment above key', () => {
    const c = extractComments(sample);
    expect(c.DB_HOST).toBe('Database host');
    expect(c.DB_PORT).toBe('Database port');
  });

  test('extracts inline comment', () => {
    const c = extractComments(sample);
    expect(c.SECRET).toBe('keep this safe');
  });

  test('returns no comment for uncommented key', () => {
    const c = extractComments(sample);
    expect(c.PLAIN).toBeUndefined();
  });

  test('returns empty object for empty input', () => {
    expect(extractComments('')).toEqual({});
  });
});

describe('stripComments', () => {
  test('removes standalone comment lines', () => {
    const result = stripComments(sample);
    expect(result).not.toMatch(/# Database/);
  });

  test('removes inline comments', () => {
    const result = stripComments(sample);
    expect(result).not.toMatch(/keep this safe/);
  });

  test('preserves key=value lines', () => {
    const result = stripComments(sample);
    expect(result).toMatch(/DB_HOST=localhost/);
    expect(result).toMatch(/PLAIN=value/);
  });
});

describe('injectComments', () => {
  const base = 'DB_HOST=localhost\nDB_PORT=5432\nPLAIN=value';
  const comments = { DB_HOST: 'primary host', DB_PORT: 'default port' };

  test('injects comments above matching keys', () => {
    const result = injectComments(base, comments);
    expect(result).toMatch(/# primary host\nDB_HOST=localhost/);
    expect(result).toMatch(/# default port\nDB_PORT=5432/);
  });

  test('leaves keys without comments unchanged', () => {
    const result = injectComments(base, comments);
    const lines = result.split('\n');
    const plainIdx = lines.indexOf('PLAIN=value');
    expect(plainIdx).toBeGreaterThan(-1);
    expect(lines[plainIdx - 1]).not.toMatch(/^#/);
  });

  test('handles empty comments map', () => {
    expect(injectComments(base, {})).toBe(base);
  });
});
