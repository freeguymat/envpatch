const { typecheck, formatTypecheck, checkType } = require('./typecheck');

describe('checkType', () => {
  test('validates int', () => {
    expect(checkType('42', 'int').ok).toBe(true);
    expect(checkType('-7', 'int').ok).toBe(true);
    expect(checkType('3.14', 'int').ok).toBe(false);
    expect(checkType('abc', 'int').ok).toBe(false);
  });

  test('validates float', () => {
    expect(checkType('3.14', 'float').ok).toBe(true);
    expect(checkType('42', 'float').ok).toBe(true);
    expect(checkType('abc', 'float').ok).toBe(false);
  });

  test('validates bool', () => {
    expect(checkType('true', 'bool').ok).toBe(true);
    expect(checkType('false', 'bool').ok).toBe(true);
    expect(checkType('1', 'bool').ok).toBe(true);
    expect(checkType('yes', 'bool').ok).toBe(true);
    expect(checkType('maybe', 'bool').ok).toBe(false);
  });

  test('validates url', () => {
    expect(checkType('https://example.com', 'url').ok).toBe(true);
    expect(checkType('http://foo.bar/baz', 'url').ok).toBe(true);
    expect(checkType('ftp://nope.com', 'url').ok).toBe(false);
    expect(checkType('not-a-url', 'url').ok).toBe(false);
  });

  test('validates port', () => {
    expect(checkType('8080', 'port').ok).toBe(true);
    expect(checkType('65535', 'port').ok).toBe(true);
    expect(checkType('0', 'port').ok).toBe(false);
    expect(checkType('99999', 'port').ok).toBe(false);
    expect(checkType('abc', 'port').ok).toBe(false);
  });

  test('validates email', () => {
    expect(checkType('user@example.com', 'email').ok).toBe(true);
    expect(checkType('bad-email', 'email').ok).toBe(false);
  });

  test('string always passes', () => {
    expect(checkType('anything goes', 'string').ok).toBe(true);
  });

  test('unknown type returns error', () => {
    const r = checkType('val', 'hex');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/unknown type/);
  });
});

describe('typecheck', () => {
  const env = {
    PORT: '3000',
    DEBUG: 'true',
    API_URL: 'https://api.example.com',
    TIMEOUT: 'thirty',
    RETRIES: '5',
  };

  test('returns empty array when all types match', () => {
    const schema = { PORT: 'port', DEBUG: 'bool', API_URL: 'url', RETRIES: 'int' };
    expect(typecheck(env, schema)).toEqual([]);
  });

  test('returns errors for mismatched types', () => {
    const schema = { TIMEOUT: 'int', PORT: 'bool' };
    const errors = typecheck(env, schema);
    expect(errors).toHaveLength(2);
    expect(errors.map(e => e.key)).toContain('TIMEOUT');
    expect(errors.map(e => e.key)).toContain('PORT');
  });

  test('skips keys not present in env', () => {
    const schema = { MISSING_KEY: 'int' };
    expect(typecheck(env, schema)).toEqual([]);
  });
});

describe('formatTypecheck', () => {
  test('shows pass message when no errors', () => {
    expect(formatTypecheck([])).toMatch(/passed/);
  });

  test('lists failures', () => {
    const errors = [{ key: 'PORT', value: 'abc', type: 'int', reason: "expected type 'int', got 'abc'" }];
    const out = formatTypecheck(errors);
    expect(out).toMatch(/PORT/);
    expect(out).toMatch(/int/);
  });
});
