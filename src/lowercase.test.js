import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lowercase, formatLowercase } from './lowercase.js';

describe('lowercase', () => {
  it('lowercases keys', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const { result, changed } = lowercase(env, { keys: true });
    assert.deepEqual(result, { foo: 'bar', baz: 'qux' });
    assert.equal(changed.length, 2);
    assert.equal(changed[0].oldKey, 'FOO');
    assert.equal(changed[0].newKey, 'foo');
  });

  it('lowercases values', () => {
    const env = { FOO: 'BAR', BAZ: 'Qux' };
    const { result, changed } = lowercase(env, { values: true });
    assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    assert.equal(changed.length, 2);
    assert.equal(changed[0].oldValue, 'BAR');
    assert.equal(changed[0].newValue, 'bar');
  });

  it('lowercases both keys and values', () => {
    const env = { FOO: 'BAR' };
    const { result, changed } = lowercase(env, { keys: true, values: true });
    assert.deepEqual(result, { foo: 'bar' });
    assert.equal(changed.length, 1);
    assert.equal(changed[0].oldKey, 'FOO');
    assert.equal(changed[0].newValue, 'bar');
  });

  it('does not report unchanged entries', () => {
    const env = { foo: 'bar', baz: 'qux' };
    const { result, changed } = lowercase(env, { keys: true, values: true });
    assert.deepEqual(result, { foo: 'bar', baz: 'qux' });
    assert.equal(changed.length, 0);
  });

  it('returns original env when no options set', () => {
    const env = { FOO: 'BAR' };
    const { result, changed } = lowercase(env);
    assert.deepEqual(result, { FOO: 'BAR' });
    assert.equal(changed.length, 0);
  });

  it('handles empty env', () => {
    const { result, changed } = lowercase({}, { keys: true, values: true });
    assert.deepEqual(result, {});
    assert.equal(changed.length, 0);
  });
});

describe('formatLowercase', () => {
  it('returns no changes message for empty array', () => {
    assert.equal(formatLowercase([]), 'No changes.');
  });

  it('formats key changes', () => {
    const changed = [{ key: 'FOO', oldKey: 'FOO', newKey: 'foo' }];
    const out = formatLowercase(changed);
    assert.match(out, /Lowercased 1 entry/);
    assert.match(out, /FOO → foo/);
  });

  it('formats value changes', () => {
    const changed = [{ key: 'FOO', oldValue: 'BAR', newValue: 'bar' }];
    const out = formatLowercase(changed);
    assert.match(out, /"BAR" → "bar"/);
  });

  it('uses plural for multiple changes', () => {
    const changed = [
      { key: 'A', oldKey: 'A', newKey: 'a' },
      { key: 'B', oldKey: 'B', newKey: 'b' },
    ];
    const out = formatLowercase(changed);
    assert.match(out, /Lowercased 2 entries/);
  });
});
