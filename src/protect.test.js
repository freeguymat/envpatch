const { protect, checkProtected, formatProtect } = require('./protect');

const base = { API_KEY: 'abc123', DB_URL: 'postgres://localhost', PORT: '3000' };

describe('protect', () => {
  test('returns protected key list and env copy', () => {
    const result = protect(base, ['API_KEY', 'DB_URL']);
    expect(result.protected).toEqual(['API_KEY', 'DB_URL']);
    expect(result.env).toEqual(base);
  });

  test('throws when protecting a missing key', () => {
    expect(() => protect(base, ['MISSING_KEY'])).toThrow(
      'Cannot protect missing keys: MISSING_KEY'
    );
  });

  test('does not mutate original env', () => {
    const env = { ...base };
    const result = protect(env, ['PORT']);
    result.env.PORT = '9999';
    expect(env.PORT).toBe('3000');
  });
});

describe('checkProtected', () => {
  test('returns no violations when protected keys unchanged', () => {
    const updated = { ...base };
    const { violations } = checkProtected(base, updated, ['API_KEY', 'DB_URL']);
    expect(violations).toHaveLength(0);
  });

  test('detects changed protected key', () => {
    const updated = { ...base, API_KEY: 'hacked' };
    const { violations } = checkProtected(base, updated, ['API_KEY']);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toEqual({ key: 'API_KEY', was: 'abc123', now: 'hacked' });
  });

  test('detects deleted protected key', () => {
    const updated = { DB_URL: 'postgres://localhost', PORT: '3000' };
    const { violations } = checkProtected(base, updated, ['API_KEY']);
    expect(violations[0].now).toBe('(unset)');
  });

  test('detects multiple violations', () => {
    const updated = { ...base, API_KEY: 'x', DB_URL: 'y' };
    const { violations } = checkProtected(base, updated, ['API_KEY', 'DB_URL', 'PORT']);
    expect(violations).toHaveLength(2);
  });
});

describe('formatProtect', () => {
  test('reports clean when no violations', () => {
    expect(formatProtect({ violations: [] })).toBe('No protected keys were modified.');
  });

  test('formats violations', () => {
    const result = { violations: [{ key: 'API_KEY', was: 'abc123', now: 'hacked' }] };
    const out = formatProtect(result);
    expect(out).toContain('Protected key violations:');
    expect(out).toContain('API_KEY');
    expect(out).toContain('abc123');
    expect(out).toContain('hacked');
  });
});
