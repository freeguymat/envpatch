const { split, formatSplit } = require('./split');

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  REDIS_URL: 'redis://localhost',
  REDIS_TTL: '3600',
  APP_NAME: 'myapp',
  SECRET_KEY: 'abc123',
};

test('split by single prefix', () => {
  const result = split(env, ['DB_']);
  expect(result['DB_']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  expect(result['__rest__']).toBeDefined();
  expect(result['__rest__']['REDIS_URL']).toBe('redis://localhost');
});

test('split by multiple prefixes', () => {
  const result = split(env, ['DB_', 'REDIS_']);
  expect(result['DB_']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  expect(result['REDIS_']).toEqual({ REDIS_URL: 'redis://localhost', REDIS_TTL: '3600' });
  expect(result['__rest__']).toEqual({ APP_NAME: 'myapp', SECRET_KEY: 'abc123' });
});

test('no rest group when all keys matched', () => {
  const small = { DB_HOST: 'localhost', DB_PORT: '5432' };
  const result = split(small, ['DB_']);
  expect(result['__rest__']).toBeUndefined();
});

test('empty env returns empty groups', () => {
  const result = split({}, ['DB_']);
  expect(Object.keys(result)).toHaveLength(0);
});

test('no matching prefix puts everything in rest', () => {
  const result = split(env, ['NOPE_']);
  expect(result['__rest__']).toEqual(env);
  expect(result['NOPE_']).toBeUndefined();
});

test('formatSplit produces readable output', () => {
  const result = split(env, ['DB_', 'REDIS_']);
  const output = formatSplit(result);
  expect(output).toContain('DB_');
  expect(output).toContain('REDIS_');
  expect(output).toContain('(unmatched)');
  expect(output).toContain('DB_HOST');
});

test('formatSplit singular key label', () => {
  const result = split({ DB_HOST: 'localhost' }, ['DB_']);
  const output = formatSplit(result);
  expect(output).toContain('1 key');
  expect(output).not.toContain('1 keys');
});
