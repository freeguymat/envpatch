import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findObsolete, removeObsolete, formatObsolete } from './obsolete.js';

const base = { DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: 'abc' };
const reference = { DB_HOST: 'localhost', DB_PORT: '5432' };

describe('findObsolete', () => {
  it('returns keys in env not present in reference', () => {
    const result = findObsolete(base, reference);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'API_KEY');
    assert.equal(result[0].value, 'abc');
  });

  it('returns empty array when no obsolete keys', () => {
    const result = findObsolete(reference, base);
    assert.deepEqual(result, []);
  });

  it('returns all keys when reference is empty', () => {
    const result = findObsolete(base, {});
    assert.equal(result.length, 3);
  });

  it('returns empty when env is empty', () => {
    const result = findObsolete({}, reference);
    assert.deepEqual(result, []);
  });
});

describe('removeObsolete', () => {
  it('strips keys not in reference', () => {
    const result = removeObsolete(base, reference);
    assert.deepEqual(result, { DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('returns same keys when nothing is obsolete', () => {
    const result = removeObsolete(reference, base);
    assert.deepEqual(result, reference);
  });

  it('returns empty object when reference is empty', () => {
    const result = removeObsolete(base, {});
    assert.deepEqual(result, {});
  });
});

describe('formatObsolete', () => {
  it('shows message when no obsolete keys', () => {
    const out = formatObsolete([]);
    assert.match(out, /No obsolete/);
  });

  it('lists obsolete keys with count', () => {
    const entries = [{ key: 'OLD_KEY', value: 'somevalue' }];
    const out = formatObsolete(entries);
    assert.match(out, /Obsolete keys \(1\)/);
    assert.match(out, /OLD_KEY=somevalue/);
  });

  it('truncates long values', () => {
    const long = 'x'.repeat(60);
    const entries = [{ key: 'BIG', value: long }];
    const out = formatObsolete(entries);
    assert.match(out, /\.\.\./);
  });
});
