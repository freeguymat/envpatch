const { flatten, expand, formatFlatten } = require('./flatten');

describe('flatten', () => {
  it('flattens a simple nested object', () => {
    const input = { db: { host: 'localhost', port: '5432' } };
    expect(flatten(input)).toEqual({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
    });
  });

  it('flattens deeply nested objects', () => {
    const input = { aws: { s3: { bucket: 'my-bucket' } } };
    expect(flatten(input)).toEqual({ AWS_S3_BUCKET: 'my-bucket' });
  });

  it('handles top-level scalar values', () => {
    const input = { port: 3000, debug: true };
    const result = flatten(input);
    expect(result).toEqual({ PORT: '3000', DEBUG: 'true' });
  });

  it('uses custom separator', () => {
    const input = { db: { host: 'localhost' } };
    expect(flatten(input, '', '.')).toEqual({ 'DB.HOST': 'localhost' });
  });

  it('handles null values as empty string', () => {
    const input = { key: null };
    expect(flatten(input)).toEqual({ KEY: '' });
  });

  it('returns empty object for empty input', () => {
    expect(flatten({})).toEqual({});
  });
});

describe('expand', () => {
  it('expands flat keys into nested object', () => {
    const input = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const result = expand(input);
    expect(result.db.host).toBe('localhost');
    expect(result.db.port).toBe('5432');
  });

  it('handles deeply nested keys', () => {
    const input = { AWS_S3_BUCKET: 'my-bucket' };
    const result = expand(input);
    expect(result.aws.s3.bucket).toBe('my-bucket');
  });

  it('returns empty object for empty input', () => {
    expect(expand({})).toEqual({});
  });

  it('overwrites scalar with object when needed', () => {
    const input = { A_B: '1', A_B_C: '2' };
    const result = expand(input);
    expect(result.a.b.c).toBe('2');
  });
});

describe('formatFlatten', () => {
  it('formats flat map as summary string', () => {
    const flat = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const out = formatFlatten(flat);
    expect(out).toContain('Flattened 2 key(s)');
    expect(out).toContain('DB_HOST=localhost');
    expect(out).toContain('DB_PORT=5432');
  });

  it('handles empty map', () => {
    expect(formatFlatten({})).toContain('Flattened 0 key(s)');
  });
});
