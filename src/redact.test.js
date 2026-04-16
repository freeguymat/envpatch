const { redact, isSensitive, REDACTED } = require('./redact');

describe('isSensitive', () => {
  test('detects password keys', () => {
    expect(isSensitive('DB_PASSWORD')).toBe(true);
    expect(isSensitive('password')).toBe(true);
  });

  test('detects token keys', () => {
    expect(isSensitive('AUTH_TOKEN')).toBe(true);
    expect(isSensitive('API_TOKEN')).toBe(true);
  });

  test('detects secret keys', () => {
    expect(isSensitive('APP_SECRET')).toBe(true);
    expect(isSensitive('SECRET_KEY')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitive('API_KEY')).toBe(true);
    expect(isSensitive('APIKEY')).toBe(true);
  });

  test('does not flag safe keys', () => {
    expect(isSensitive('APP_NAME')).toBe(false);
    expect(isSensitive('PORT')).toBe(false);
    expect(isSensitive('NODE_ENV')).toBe(false);
  });
});

describe('redact', () => {
  const env = {
    APP_NAME: 'myapp',
    PORT: '3000',
    DB_PASSWORD: 'supersecret',
    AUTH_TOKEN: 'abc123',
    API_KEY: 'xyz789',
    NODE_ENV: 'production',
  };

  test('redacts sensitive values', () => {
    const result = redact(env);
    expect(result.DB_PASSWORD).toBe(REDACTED);
    expect(result.AUTH_TOKEN).toBe(REDACTED);
    expect(result.API_KEY).toBe(REDACTED);
  });

  test('preserves non-sensitive values', () => {
    const result = redact(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
    expect(result.NODE_ENV).toBe('production');
  });

  test('does not mutate original env', () => {
    const copy = { ...env };
    redact(copy);
    expect(copy.DB_PASSWORD).toBe('supersecret');
  });

  test('supports custom patterns', () => {
    const result = redact({ MY_CUSTOM: 'val', OTHER: 'ok' }, [/custom/i]);
    expect(result.MY_CUSTOM).toBe(REDACTED);
    expect(result.OTHER).toBe('ok');
  });
});
