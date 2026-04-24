import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { group, formatGroup, listPrefixes } from './group.js';

describe('group', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    APP_NAME: 'envpatch',
    APP_ENV: 'test',
    SECRET: 'abc123',
  };

  it('groups keys by prefix', () => {
    const result = group(env);
    assert.deepEqual(Object.keys(result).sort(), ['APP', 'DB', 'REDIS', '__ungrouped__']);
    assert.deepEqual(result.DB, { DB_HOST: 'localhost', DB_PORT: '5432' });
    assert.deepEqual(result.APP, { APP_NAME: 'envpatch', APP_ENV: 'test' });
    assert.deepEqual(result.__ungrouped__, { SECRET: 'abc123' });
  });

  it('handles empty env', () => {
    assert.deepEqual(group({}), {});
  });

  it('uses custom separator', () => {
    const result = group({ 'DB.HOST': 'localhost', 'DB.PORT': '5432' }, '.');
    assert.ok(result['DB']);
    assert.equal(Object.keys(result['DB']).length, 2);
  });

  it('puts keys with no separator in __ungrouped__', () => {
    const result = group({ NOPREFIX: 'val' });
    assert.deepEqual(result.__ungrouped__, { NOPREFIX: 'val' });
  });
});

describe('formatGroup', () => {
  it('formats grouped env into readable sections', () => {
    const grouped = group({ DB_HOST: 'localhost', APP_NAME: 'test' });
    const output = formatGroup(grouped);
    assert.ok(output.includes('[APP]'));
    assert.ok(output.includes('[DB]'));
    assert.ok(output.includes('DB_HOST=localhost'));
    assert.ok(output.includes('APP_NAME=test'));
  });

  it('labels ungrouped keys as (no prefix)', () => {
    const grouped = group({ PLAIN: 'value' });
    const output = formatGroup(grouped);
    assert.ok(output.includes('(no prefix)'));
    assert.ok(output.includes('PLAIN=value'));
  });
});

describe('listPrefixes', () => {
  it('returns sorted unique prefixes', () => {
    const result = listPrefixes({ DB_HOST: '', APP_NAME: '', DB_PORT: '', PLAIN: '' });
    assert.deepEqual(result, ['APP', 'DB']);
  });

  it('returns empty array when no prefixed keys', () => {
    assert.deepEqual(listPrefixes({ PLAIN: 'x' }), []);
  });
});
