const { rotate, formatRotate } = require('./rotate');

const baseEnv = {
  DB_HOST: 'localhost',
  DB_PASS: 'secret',
  API_KEY: 'abc123',
};

test('renames a key, preserving value', () => {
  const { result, applied, skipped } = rotate(baseEnv, [
    { from: 'DB_HOST', to: 'DATABASE_HOST' },
  ]);
  expect(result.DATABASE_HOST).toBe('localhost');
  expect(result.DB_HOST).toBeUndefined();
  expect(applied).toHaveLength(1);
  expect(skipped).toHaveLength(0);
});

test('renames and updates value', () => {
  const { result, applied } = rotate(baseEnv, [
    { from: 'DB_PASS', to: 'DATABASE_PASSWORD', value: 'newpass' },
  ]);
  expect(result.DATABASE_PASSWORD).toBe('newpass');
  expect(applied[0].oldValue).toBe('secret');
  expect(applied[0].newValue).toBe('newpass');
});

test('skips missing key', () => {
  const { applied, skipped } = rotate(baseEnv, [
    { from: 'MISSING_KEY', to: 'NEW_KEY' },
  ]);
  expect(applied).toHaveLength(0);
  expect(skipped[0].reason).toBe('key not found');
});

test('skips when target key already exists', () => {
  const { applied, skipped } = rotate(baseEnv, [
    { from: 'DB_HOST', to: 'API_KEY' },
  ]);
  expect(applied).toHaveLength(0);
  expect(skipped[0].reason).toBe('target key already exists');
});

test('handles multiple rotations', () => {
  const { result, applied } = rotate(baseEnv, [
    { from: 'DB_HOST', to: 'DATABASE_HOST' },
    { from: 'API_KEY', to: 'SERVICE_API_KEY', value: 'xyz789' },
  ]);
  expect(Object.keys(result)).toContain('DATABASE_HOST');
  expect(Object.keys(result)).toContain('SERVICE_API_KEY');
  expect(applied).toHaveLength(2);
});

test('formatRotate shows applied and skipped', () => {
  const report = rotate(baseEnv, [
    { from: 'DB_HOST', to: 'DATABASE_HOST' },
    { from: 'MISSING', to: 'WHATEVER' },
  ]);
  const out = formatRotate(report);
  expect(out).toMatch('✔ DB_HOST → DATABASE_HOST');
  expect(out).toMatch('✖ MISSING → WHATEVER: key not found');
});

test('formatRotate notes value update', () => {
  const report = rotate(baseEnv, [
    { from: 'DB_PASS', to: 'DB_PASS', value: 'rotated' },
  ]);
  const out = formatRotate(report);
  expect(out).toMatch('(value updated)');
});

test('formatRotate with no rotations', () => {
  const out = formatRotate({ applied: [], skipped: [] });
  expect(out).toBe('No rotations to apply.');
});
