const { search, formatSearch } = require('./search');

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret123',
  API_URL: 'https://api.example.com',
  DEBUG: 'true',
};

test('returns all entries when no filter given', () => {
  expect(search(env).length).toBe(5);
});

test('filters by key substring', () => {
  const r = search(env, { key: 'DB_' });
  expect(r.map(x => x.key)).toEqual(['DB_HOST', 'DB_PORT']);
});

test('filters by value substring', () => {
  const r = search(env, { value: 'localhost' });
  expect(r).toEqual([{ key: 'DB_HOST', value: 'localhost' }]);
});

test('filters by both key and value', () => {
  const r = search(env, { key: 'API', value: 'secret' });
  expect(r).toEqual([{ key: 'API_KEY', value: 'secret123' }]);
});

test('regex key match', () => {
  const r = search(env, { key: '^DB', regex: true });
  expect(r.length).toBe(2);
});

test('regex value match', () => {
  const r = search(env, { value: '^https?://', regex: true });
  expect(r).toEqual([{ key: 'API_URL', value: 'https://api.example.com' }]);
});

test('returns empty array when no match', () => {
  expect(search(env, { key: 'NOPE' })).toEqual([]);
});

test('formatSearch with results', () => {
  const r = search(env, { key: 'DEBUG' });
  expect(formatSearch(r)).toBe('DEBUG=true');
});

test('formatSearch with no results', () => {
  expect(formatSearch([])).toBe('No matches found.');
});
