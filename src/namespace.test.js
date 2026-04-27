const { namespaceGroup, namespaceFlat, formatNamespace } = require('./namespace');

const env = {
  APP_HOST: 'localhost',
  APP_PORT: '3000',
  DB_HOST: 'db.local',
  DB_PORT: '5432',
  SECRET: 'abc123',
};

test('namespaceGroup splits by first underscore', () => {
  const grouped = namespaceGroup(env);
  expect(grouped['APP']).toEqual({ HOST: 'localhost', PORT: '3000' });
  expect(grouped['DB']).toEqual({ HOST: 'db.local', PORT: '5432' });
  expect(grouped['__root__']).toEqual({ SECRET: 'abc123' });
});

test('namespaceGroup with custom delimiter', () => {
  const e = { 'APP.HOST': 'localhost', 'APP.PORT': '3000', PLAIN: 'x' };
  const grouped = namespaceGroup(e, '.');
  expect(grouped['APP']).toEqual({ HOST: 'localhost', PORT: '3000' });
  expect(grouped['__root__']).toEqual({ PLAIN: 'x' });
});

test('namespaceFlat round-trips correctly', () => {
  const grouped = namespaceGroup(env);
  const flat = namespaceFlat(grouped);
  expect(flat).toEqual(env);
});

test('namespaceFlat with custom delimiter', () => {
  const grouped = { APP: { HOST: 'localhost' }, '__root__': { X: '1' } };
  const flat = namespaceFlat(grouped, '.');
  expect(flat).toEqual({ 'APP.HOST': 'localhost', X: '1' });
});

test('formatNamespace produces readable output', () => {
  const grouped = namespaceGroup(env);
  const out = formatNamespace(grouped);
  expect(out).toContain('[APP]');
  expect(out).toContain('  HOST=localhost');
  expect(out).toContain('[DB]');
  expect(out).toContain('  PORT=5432');
  expect(out).toContain('[root]');
  expect(out).toContain('  SECRET=abc123');
});

test('empty env returns empty grouped object', () => {
  expect(namespaceGroup({})).toEqual({});
  expect(namespaceFlat({})).toEqual({});
  expect(formatNamespace({})).toBe('');
});
