const { stats, formatStats } = require('./stats');

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_PASSWORD: 'secret123',
  API_KEY: '',
  API_URL: 'https://api.example.com',
  APP_NAME: 'myapp',
  APP_ENV: 'production',
  TIMEOUT: '30',
};

test('total count', () => {
  expect(stats(env).total).toBe(8);
});

test('empty count', () => {
  expect(stats(env).empty).toBe(1);
});

test('numeric count', () => {
  const s = stats(env);
  expect(s.numeric).toBe(2); // 5432, 30
});

test('urls count', () => {
  expect(stats(env).urls).toBe(1);
});

test('secrets count', () => {
  const s = stats(env);
  expect(s.secrets).toBeGreaterThanOrEqual(2); // DB_PASSWORD, API_KEY
});

test('longest value', () => {
  expect(stats(env).longest).toBe('https://api.example.com'.length);
});

test('prefixes', () => {
  const s = stats(env);
  expect(s.prefixes['DB']).toBe(3);
  expect(s.prefixes['API']).toBe(2);
  expect(s.prefixes['APP']).toBe(2);
});

test('formatStats returns string', () => {
  const out = formatStats(stats(env));
  expect(typeof out).toBe('string');
  expect(out).toContain('Total keys');
  expect(out).toContain('Top prefixes');
});

test('empty env', () => {
  const s = stats({});
  expect(s.total).toBe(0);
  expect(s.empty).toBe(0);
});
