const { patch } = require('./patch');

describe('patch', () => {
  const base = {
    APP_NAME: 'myapp',
    DEBUG: 'false',
    SECRET: 'abc123',
  };

  test('applies add entries', () => {
    const result = patch(base, [
      { key: 'NEW_KEY', type: 'add', newValue: 'hello' },
    ]);
    expect(result.NEW_KEY).toBe('hello');
    expect(result.APP_NAME).toBe('myapp');
  });

  test('applies remove entries', () => {
    const result = patch(base, [
      { key: 'DEBUG', type: 'remove', oldValue: 'false' },
    ]);
    expect('DEBUG' in result).toBe(false);
  });

  test('applies change entries', () => {
    const result = patch(base, [
      { key: 'SECRET', type: 'change', oldValue: 'abc123', newValue: 'xyz789' },
    ]);
    expect(result.SECRET).toBe('xyz789');
  });

  test('throws when adding existing key', () => {
    expect(() =>
      patch(base, [{ key: 'APP_NAME', type: 'add', newValue: 'other' }])
    ).toThrow(/already exists/);
  });

  test('throws when removing missing key', () => {
    expect(() =>
      patch(base, [{ key: 'MISSING', type: 'remove', oldValue: 'x' }])
    ).toThrow(/does not exist/);
  });

  test('throws when remove oldValue does not match', () => {
    expect(() =>
      patch(base, [{ key: 'DEBUG', type: 'remove', oldValue: 'true' }])
    ).toThrow(/does not match expected/);
  });

  test('throws when change oldValue does not match', () => {
    expect(() =>
      patch(base, [{ key: 'SECRET', type: 'change', oldValue: 'wrong', newValue: 'new' }])
    ).toThrow(/does not match expected/);
  });

  test('does not mutate base object', () => {
    const baseCopy = { ...base };
    patch(base, [{ key: 'NEW_KEY', type: 'add', newValue: '1' }]);
    expect(base).toEqual(baseCopy);
  });
});
