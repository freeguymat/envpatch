import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setKeys, unsetKeys, formatSet } from './set.js';

describe('setKeys', () => {
  it('adds a new key', () => {
    const result = setKeys({ A: '1' }, { B: '2' });
    assert.deepEqual(result, { A: '1', B: '2' });
  });

  it('overwrites an existing key', () => {
    const result = setKeys({ A: '1' }, { A: '99' });
    assert.equal(result.A, '99');
  });

  it('does not mutate original', () => {
    const orig = { A: '1' };
    setKeys(orig, { B: '2' });
    assert.equal(orig.B, undefined);
  });
});

describe('unsetKeys', () => {
  it('removes a key', () => {
    const result = unsetKeys({ A: '1', B: '2' }, ['A']);
    assert.equal(result.A, undefined);
    assert.equal(result.B, '2');
  });

  it('ignores missing keys', () => {
    const result = unsetKeys({ A: '1' }, ['Z']);
    assert.deepEqual(result, { A: '1' });
  });

  it('does not mutate original', () => {
    const orig = { A: '1', B: '2' };
    unsetKeys(orig, ['A']);
    assert.equal(orig.A, '1');
  });
});

describe('formatSet', () => {
  it('shows set and unset lines', () => {
    const out = formatSet(['FOO', 'BAR'], ['OLD']);
    assert.match(out, /set.*FOO/);
    assert.match(out, /unset.*OLD/);
  });

  it('returns no changes when both empty', () => {
    assert.match(formatSet([], []), /no changes/);
  });
});
