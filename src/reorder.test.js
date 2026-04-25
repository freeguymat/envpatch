import { reorder, formatReorder } from './reorder.js';

const env = {
  PORT: '3000',
  HOST: 'localhost',
  DB_URL: 'postgres://localhost/db',
  SECRET: 'abc123',
  NODE_ENV: 'development',
};

describe('reorder', () => {
  test('places preferred keys first', () => {
    const { result } = reorder(env, ['NODE_ENV', 'PORT', 'HOST']);
    const keys = Object.keys(result);
    expect(keys[0]).toBe('NODE_ENV');
    expect(keys[1]).toBe('PORT');
    expect(keys[2]).toBe('HOST');
  });

  test('appends remaining keys after ordered ones', () => {
    const { result } = reorder(env, ['NODE_ENV']);
    const keys = Object.keys(result);
    expect(keys[0]).toBe('NODE_ENV');
    expect(keys.slice(1)).toContain('PORT');
    expect(keys.slice(1)).toContain('DB_URL');
  });

  test('sorts remainder when sortRemainder is true', () => {
    const { result } = reorder(env, ['NODE_ENV'], { sortRemainder: true });
    const remainder = Object.keys(result).slice(1);
    expect(remainder).toEqual([...remainder].sort());
  });

  test('ignores order keys not present in env', () => {
    const { result, moved } = reorder(env, ['MISSING_KEY', 'PORT']);
    expect(moved).toEqual(['PORT']);
    expect(Object.keys(result)).not.toContain('MISSING_KEY');
  });

  test('preserves all values', () => {
    const { result } = reorder(env, ['SECRET', 'DB_URL']);
    for (const [k, v] of Object.entries(env)) {
      expect(result[k]).toBe(v);
    }
  });

  test('returns moved and appended arrays', () => {
    const { moved, appended } = reorder(env, ['PORT', 'HOST']);
    expect(moved).toEqual(['PORT', 'HOST']);
    expect(appended).toContain('DB_URL');
    expect(appended).not.toContain('PORT');
  });

  test('empty order returns all keys as appended', () => {
    const { moved, appended } = reorder(env, []);
    expect(moved).toHaveLength(0);
    expect(appended).toHaveLength(Object.keys(env).length);
  });
});

describe('formatReorder', () => {
  test('formats moved and appended keys', () => {
    const out = formatReorder(['NODE_ENV', 'PORT'], ['DB_URL', 'SECRET']);
    expect(out).toMatch('Reordered (2)');
    expect(out).toMatch('~ NODE_ENV');
    expect(out).toMatch('Appended remainder (2)');
    expect(out).toMatch('+ DB_URL');
  });

  test('shows no keys message when both arrays empty', () => {
    const out = formatReorder([], []);
    expect(out).toBe('No keys to reorder.');
  });

  test('shows only appended section when moved is empty', () => {
    const out = formatReorder([], ['A', 'B']);
    expect(out).not.toMatch('Reordered');
    expect(out).toMatch('Appended remainder (2)');
  });
});
