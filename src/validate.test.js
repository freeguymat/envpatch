const { validate } = require('./validate');

describe('validate', () => {
  const env = {
    DATABASE_URL: 'postgres://localhost/mydb',
    PORT: '3000',
    SECRET: 'abc123',
  };

  test('passes when all required keys present (array schema)', () => {
    const result = validate(env, ['DATABASE_URL', 'PORT']);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails when required key is missing', () => {
    const result = validate(env, ['DATABASE_URL', 'MISSING_KEY']);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required key: MISSING_KEY');
  });

  test('fails when required key is empty string', () => {
    const result = validate({ ...env, PORT: '' }, ['PORT']);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required key: PORT');
  });

  test('passes pattern validation', () => {
    const result = validate(env, {
      PORT: { required: true, pattern: /^\d+$/ },
    });
    expect(result.valid).toBe(true);
  });

  test('fails pattern validation', () => {
    const result = validate(env, {
      PORT: { required: true, pattern: /^[a-z]+$/ },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/PORT/);
  });

  test('optional key with pattern skips if missing', () => {
    const result = validate({}, {
      OPTIONAL: { required: false, pattern: /^\d+$/ },
    });
    expect(result.valid).toBe(true);
  });

  test('optional key with pattern validates if present', () => {
    const result = validate({ OPTIONAL: 'not-a-number' }, {
      OPTIONAL: { required: false, pattern: /^\d+$/ },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/OPTIONAL/);
  });

  test('returns multiple errors', () => {
    const result = validate({}, ['KEY_A', 'KEY_B', 'KEY_C']);
    expect(result.errors).toHaveLength(3);
  });
});
