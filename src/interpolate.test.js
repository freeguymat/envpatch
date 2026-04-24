import { describe, it, expect } from 'vitest';
import { interpolate, findRefs } from './interpolate.js';

describe('interpolate', () => {
  it('resolves ${VAR} syntax', () => {
    const env = { HOST: 'localhost', URL: 'http://${HOST}/api' };
    const result = interpolate(env);
    expect(result.URL).toBe('http://localhost/api');
    expect(result.HOST).toBe('localhost');
  });

  it('resolves $VAR syntax', () => {
    const env = { PORT: '3000', ADDR: '$PORT' };
    const result = interpolate(env);
    expect(result.ADDR).toBe('3000');
  });

  it('resolves chained references', () => {
    const env = { A: 'hello', B: '${A}_world', C: '${B}!' };
    const result = interpolate(env);
    expect(result.C).toBe('hello_world!');
  });

  it('leaves unresolved refs intact when not strict', () => {
    const env = { URL: 'http://${MISSING}/path' };
    const result = interpolate(env);
    expect(result.URL).toBe('http://${MISSING}/path');
  });

  it('throws on missing ref in strict mode', () => {
    const env = { URL: 'http://${MISSING}/path' };
    expect(() => interpolate(env, { strict: true })).toThrow('Undefined variable reference: MISSING');
  });

  it('throws on circular reference', () => {
    const env = { A: '${B}', B: '${A}' };
    expect(() => interpolate(env)).toThrow('Circular reference detected');
  });

  it('does not mutate original env', () => {
    const env = { HOST: 'x', URL: '${HOST}/y' };
    interpolate(env);
    expect(env.URL).toBe('${HOST}/y');
  });
});

describe('findRefs', () => {
  it('finds braced refs', () => {
    const env = { A: 'hello', B: 'http://${HOST}:${PORT}' };
    const refs = findRefs(env);
    expect(refs).toEqual([{ key: 'B', refs: ['HOST', 'PORT'] }]);
  });

  it('finds bare refs', () => {
    const env = { A: '$HOST/$PORT' };
    const refs = findRefs(env);
    expect(refs[0].refs).toContain('HOST');
    expect(refs[0].refs).toContain('PORT');
  });

  it('returns empty array when no refs', () => {
    const env = { A: 'hello', B: 'world' };
    expect(findRefs(env)).toEqual([]);
  });
});
