const { checkRequired, formatRequired } = require('./required');

describe('checkRequired', () => {
  const env = {
    DATABASE_URL: 'postgres://localhost/db',
    API_KEY: 'abc123',
    PORT: '3000',
    EMPTY_VAL: '',
  };

  test('all present', () => {
    const result = checkRequired(env, ['DATABASE_URL', 'API_KEY']);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(['DATABASE_URL', 'API_KEY']);
  });

  test('some missing', () => {
    const result = checkRequired(env, ['DATABASE_URL', 'SECRET_KEY']);
    expect(result.missing).toEqual(['SECRET_KEY']);
    expect(result.present).toEqual(['DATABASE_URL']);
  });

  test('all missing', () => {
    const result = checkRequired({}, ['FOO', 'BAR']);
    expect(result.missing).toEqual(['FOO', 'BAR']);
    expect(result.present).toEqual([]);
  });

  test('empty string value counts as missing', () => {
    const result = checkRequired(env, ['EMPTY_VAL']);
    expect(result.missing).toEqual(['EMPTY_VAL']);
  });

  test('empty required list', () => {
    const result = checkRequired(env, []);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual([]);
  });
});

describe('formatRequired', () => {
  test('all present message', () => {
    const out = formatRequired({ present: ['A', 'B'], missing: [] });
    expect(out).toContain('✓ A');
    expect(out).toContain('All required keys are present.');
    expect(out).not.toContain('Missing:');
  });

  test('some missing message', () => {
    const out = formatRequired({ present: ['A'], missing: ['B', 'C'] });
    expect(out).toContain('✓ A');
    expect(out).toContain('✗ B');
    expect(out).toContain('2 required key(s) missing.');
  });

  test('all missing message', () => {
    const out = formatRequired({ present: [], missing: ['X'] });
    expect(out).not.toContain('Present:');
    expect(out).toContain('✗ X');
    expect(out).toContain('1 required key(s) missing.');
  });
});
