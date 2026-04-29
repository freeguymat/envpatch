import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { uppercase, formatUppercase } from './uppercase.js';

const sample = {
  db_host: 'localhost',
  db_port: '5432',
  app_env: 'production',
};

describe('uppercase', () => {
  it('uppercases values by default', () => {
    const { result, changes } = uppercase(sample);
    assert.equal(result['db_host'], 'LOCALHOST');
    assert.equal(result['db_port'], '5432'); // numeric string unchanged visually but still uppercased
    assert.equal(result['app_env'], 'PRODUCTION');
    assert.ok(changes.some((c) => c.key === 'db_host' && c.target === 'value'));
  });

  it('lowercases values when mode=lower', () => {
    const env = { KEY: 'HELLO', OTHER: 'World' };
    const { result } = uppercase(env, 'values', 'lower');
    assert.equal(result['KEY'], 'hello');
    assert.equal(result['OTHER'], 'world');
  });

  it('uppercases keys when target=keys', () => {
    const { result, changes } = uppercase(sample, 'keys', 'upper');
    assert.ok('DB_HOST' in result);
    assert.ok('APP_ENV' in result);
    assert.ok(!('db_host' in result));
    assert.ok(changes.some((c) => c.target === 'key'));
  });

  it('transforms both keys and values when target=both', () => {
    const env = { db_host: 'localhost' };
    const { result, changes } = uppercase(env, 'both', 'upper');
    assert.ok('DB_HOST' in result);
    assert.equal(result['DB_HOST'], 'LOCALHOST');
    assert.equal(changes.length, 2);
  });

  it('returns no changes when already correct case', () => {
    const env = { KEY: 'VALUE' };
    const { changes } = uppercase(env, 'values', 'upper');
    assert.equal(changes.length, 0);
  });

  it('handles empty env', () => {
    const { result, changes } = uppercase({});
    assert.deepEqual(result, {});
    assert.deepEqual(changes, []);
  });
});

describe('formatUppercase', () => {
  it('returns no changes message for empty array', () => {
    assert.equal(formatUppercase([]), 'No changes.');
  });

  it('formats changes correctly', () => {
    const changes = [{ key: 'db_host', from: 'localhost', to: 'LOCALHOST', target: 'value' }];
    const out = formatUppercase(changes);
    assert.ok(out.includes('1 change(s)'));
    assert.ok(out.includes('db_host'));
    assert.ok(out.includes('localhost'));
    assert.ok(out.includes('LOCALHOST'));
  });
});
