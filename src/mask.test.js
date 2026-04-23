const { maskEnv, maskValue, formatMasked, shouldMask, MASK } = require('./mask');

describe('shouldMask', () => {
  it('masks known sensitive patterns', () => {
    expect(shouldMask('DB_PASSWORD')).toBe(true);
    expect(shouldMask('API_KEY')).toBe(true);
    expect(shouldMask('AUTH_TOKEN')).toBe(true);
    expect(shouldMask('PRIVATE_KEY')).toBe(true);
    expect(shouldMask('APP_SECRET')).toBe(true);
  });

  it('does not mask non-sensitive keys', () => {
    expect(shouldMask('PORT')).toBe(false);
    expect(shouldMask('NODE_ENV')).toBe(false);
    expect(shouldMask('APP_NAME')).toBe(false);
  });

  it('masks extra keys provided by caller', () => {
    expect(shouldMask('MY_CUSTOM', ['MY_CUSTOM'])).toBe(true);
    expect(shouldMask('OTHER', ['MY_CUSTOM'])).toBe(false);
  });

  it('is case-insensitive for extra keys', () => {
    expect(shouldMask('my_custom', ['MY_CUSTOM'])).toBe(true);
  });
});

describe('maskEnv', () => {
  const env = {
    PORT: '3000',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    NODE_ENV: 'production',
  };

  it('masks sensitive keys and leaves others intact', () => {
    const result = maskEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.NODE_ENV).toBe('production');
    expect(result.DB_PASSWORD).toBe(MASK);
    expect(result.API_KEY).toBe(MASK);
  });

  it('masks extra keys', () => {
    const result = maskEnv({ PORT: '3000', CUSTOM: 'val' }, ['CUSTOM']);
    expect(result.PORT).toBe('3000');
    expect(result.CUSTOM).toBe(MASK);
  });

  it('does not mutate original', () => {
    maskEnv(env);
    expect(env.DB_PASSWORD).toBe('supersecret');
  });
});

describe('maskValue', () => {
  it('masks a sensitive key value', () => {
    expect(maskValue('DB_PASSWORD', 'secret')).toBe(MASK);
  });

  it('returns value for non-sensitive key', () => {
    expect(maskValue('PORT', '3000')).toBe('3000');
  });
});

describe('formatMasked', () => {
  it('formats masked env as KEY=VALUE lines', () => {
    const masked = { PORT: '3000', DB_PASSWORD: MASK };
    const out = formatMasked(masked);
    expect(out).toContain('PORT=3000');
    expect(out).toContain(`DB_PASSWORD=${MASK}`);
  });
});
