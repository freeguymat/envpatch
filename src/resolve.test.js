import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, resolveValue, formatResolve } from './resolve.js';

describe('resolveValue', () => {
  it('returns plain value unchanged', () => {
    const r = resolveValue('hello', {});
    assert.equal(r.value, 'hello');
    assert.deepEqual(r.missing, []);
  });

  it('substitutes known reference', () => {
    const r = resolveValue('${HOST}:5432', { HOST: 'localhost' });
    assert.equal(r.value, 'localhost:5432');
    assert.deepEqual(r.missing, []);
  });

  it('tracks missing references', () => {
    const r = resolveValue('${UNKNOWN}/path', {});
    assert.equal(r.value, '${UNKNOWN}/path');
    assert.deepEqual(r.missing, ['UNKNOWN']);
  });

  it('handles multiple references', () => {
    const r = resolveValue('${A}-${B}', { A: 'foo', B: 'bar' });
    assert.equal(r.value, 'foo-bar');
    assert.deepEqual(r.missing, []);
  });
});

describe('resolve', () => {
  it('resolves env using base', () => {
    const env = { DB_URL: '${DB_HOST}:${DB_PORT}' };
    const base = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const { resolved, unresolved } = resolve(env, base);
    assert.equal(resolved.DB_URL, 'localhost:5432');
    assert.deepEqual(unresolved, []);
  });

  it('falls back to own env for self-references', () => {
    const env = { HOST: 'myhost', URL: 'http://${HOST}/api' };
    const { resolved, unresolved } = resolve(env, {});
    assert.equal(resolved.URL, 'http://myhost/api');
    assert.deepEqual(unresolved, []);
  });

  it('reports unresolved references', () => {
    const env = { URL: 'http://${MISSING_HOST}/api' };
    const { resolved, unresolved } = resolve(env, {});
    assert.equal(resolved.URL, 'http://${MISSING_HOST}/api');
    assert.equal(unresolved.length, 1);
    assert.match(unresolved[0], /MISSING_HOST/);
  });

  it('returns empty for empty env', () => {
    const { resolved, unresolved } = resolve({}, {});
    assert.deepEqual(resolved, {});
    assert.deepEqual(unresolved, []);
  });
});

describe('formatResolve', () => {
  it('formats resolved pairs', () => {
    const out = formatResolve({ A: '1', B: '2' }, []);
    assert.match(out, /A=1/);
    assert.match(out, /B=2/);
  });

  it('includes warnings section when unresolved', () => {
    const out = formatResolve({ X: '${Y}' }, ['X references missing $Y']);
    assert.match(out, /Warnings:/);
    assert.match(out, /X references missing/);
  });
});
