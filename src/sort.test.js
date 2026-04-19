import { sort, formatSort } from './sort.js';

const env = { ZEBRA: '1', APPLE: '2', MANGO: '3', BANANA: '4' };

test('sorts keys alphabetically', () => {
  const { sorted } = sort(env);
  expect(Object.keys(sorted)).toEqual(['APPLE', 'BANANA', 'MANGO', 'ZEBRA']);
});

test('preserves values after sort', () => {
  const { sorted } = sort(env);
  expect(sorted.APPLE).toBe('2');
  expect(sorted.ZEBRA).toBe('1');
});

test('sorts descending', () => {
  const { sorted } = sort(env, { descending: true });
  expect(Object.keys(sorted)).toEqual(['ZEBRA', 'MANGO', 'BANANA', 'APPLE']);
});

test('sorts by explicit order', () => {
  const { sorted } = sort(env, { order: ['MANGO', 'ZEBRA', 'APPLE', 'BANANA'] });
  expect(Object.keys(sorted)).toEqual(['MANGO', 'ZEBRA', 'APPLE', 'BANANA']);
});

test('unmatched keys in explicit order go to end', () => {
  const { sorted } = sort(env, { order: ['ZEBRA'] });
  expect(Object.keys(sorted)[0]).toBe('ZEBRA');
});

test('reports moved keys', () => {
  const { moved } = sort(env);
  expect(moved.length).toBeGreaterThan(0);
  expect(moved[0]).toHaveProperty('key');
  expect(moved[0]).toHaveProperty('from');
  expect(moved[0]).toHaveProperty('to');
});

test('no moves when already sorted', () => {
  const sorted = { APPLE: '1', BANANA: '2' };
  const { moved } = sort(sorted);
  expect(moved).toHaveLength(0);
});

test('formatSort with no moves', () => {
  const result = { sorted: {}, moved: [] };
  expect(formatSort(result)).toBe('Keys are already in sorted order.');
});

test('formatSort with moves', () => {
  const { sorted, moved } = sort(env);
  const out = formatSort({ sorted, moved });
  expect(out).toMatch(/Reordered/);
  expect(out).toMatch(/→/);
});
