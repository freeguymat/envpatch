const { filter, formatFilter } = require('./filter');

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
};

test('filter by string prefix', () => {
  const result = filter(env, 'DB_');
  expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  expect(result.DB_HOST).toBe('localhost');
});

test('filter prefix is case-insensitive', () => {
  const result = filter(env, 'app_');
  expect(Object.keys(result)).toHaveLength(2);
});

test('filter by regex', () => {
  const result = filter(env, /SECRET|KEY/);
  expect(Object.keys(result)).toContain('SECRET_KEY');
});

test('filter returns empty object when no match', () => {
  const result = filter(env, 'NOPE_');
  expect(result).toEqual({});
});

test('formatFilter shows matched keys', () => {
  const result = filter(env, 'DB_');
  const out = formatFilter(result, 'DB_');
  expect(out).toMatch('2 key(s)');
  expect(out).toMatch('DB_HOST=localhost');
});

test('formatFilter shows no match message', () => {
  const out = formatFilter({}, 'NOPE_');
  expect(out).toMatch('No keys matched');
});
