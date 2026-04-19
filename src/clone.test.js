const { cloneEnv, formatCloneSummary } = require('./clone');

const base = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PASS: 'secret',
  DEBUG: 'true',
};

test('clone with no options returns full copy', () => {
  const result = cloneEnv(base);
  expect(result).toEqual(base);
  expect(result).not.toBe(base);
});

test('pick only selected keys', () => {
  const result = cloneEnv(base, { pick: ['APP_NAME', 'APP_PORT'] });
  expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_PORT']);
});

test('omit selected keys', () => {
  const result = cloneEnv(base, { omit: ['DB_PASS', 'DEBUG'] });
  expect(result).not.toHaveProperty('DB_PASS');
  expect(result).not.toHaveProperty('DEBUG');
  expect(result).toHaveProperty('APP_NAME');
});

test('add prefix to all keys', () => {
  const result = cloneEnv({ FOO: '1', BAR: '2' }, { prefix: 'TEST_' });
  expect(result).toHaveProperty('TEST_FOO', '1');
  expect(result).toHaveProperty('TEST_BAR', '2');
});

test('strip prefix from keys', () => {
  const result = cloneEnv({ APP_NAME: 'x', APP_PORT: '80' }, { strip: 'APP_' });
  expect(result).toHaveProperty('NAME', 'x');
  expect(result).toHaveProperty('PORT', '80');
});

test('strip and add prefix together', () => {
  const result = cloneEnv({ APP_FOO: 'bar' }, { strip: 'APP_', prefix: 'SVC_' });
  expect(result).toHaveProperty('SVC_FOO', 'bar');
});

test('pick then omit interaction — pick wins first', () => {
  const result = cloneEnv(base, { pick: ['APP_NAME', 'DEBUG'], omit: ['DEBUG'] });
  expect(Object.keys(result)).toEqual(['APP_NAME']);
});

test('formatCloneSummary shows counts', () => {
  const cloned = cloneEnv(base, { omit: ['DB_PASS'] });
  const summary = formatCloneSummary(base, cloned);
  expect(summary).toContain('Original keys : 5');
  expect(summary).toContain('Cloned keys   : 4');
  expect(summary).toContain('Dropped       : 1');
});
