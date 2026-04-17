const { exportEnv, serializeEnv } = require('./export');

const env = { API_KEY: 'abc123', PORT: '3000', DEBUG: 'true' };

describe('serializeEnv', () => {
  test('produces KEY=VALUE lines', () => {
    const out = serializeEnv(env);
    expect(out).toContain('API_KEY=abc123');
    expect(out).toContain('PORT=3000');
    expect(out).toContain('DEBUG=true');
  });

  test('ends with newline', () => {
    expect(serializeEnv(env)).toMatch(/\n$/);
  });
});

describe('exportEnv', () => {
  test('env format matches serializeEnv', () => {
    expect(exportEnv(env, 'env')).toBe(serializeEnv(env));
  });

  test('json format is valid JSON with correct values', () => {
    const out = exportEnv(env, 'json');
    const parsed = JSON.parse(out);
    expect(parsed.API_KEY).toBe('abc123');
    expect(parsed.PORT).toBe('3000');
  });

  test('yaml format contains keys', () => {
    const out = exportEnv(env, 'yaml');
    expect(out).toContain('API_KEY');
    expect(out).toContain('abc123');
  });

  test('yml alias works', () => {
    expect(() => exportEnv(env, 'yml')).not.toThrow();
  });

  test('unsupported format throws', () => {
    expect(() => exportEnv(env, 'toml')).toThrow('Unsupported export format: toml');
  });

  test('default format is env', () => {
    expect(exportEnv(env)).toBe(serializeEnv(env));
  });
});
