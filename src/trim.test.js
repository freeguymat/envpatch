import { trim, formatTrim } from './trim.js';

test('trims whitespace from values', () => {
  const env = { A: '  hello  ', B: 'world', C: '  ' };
  const result = trim(env);
  expect(result.trimmed).toEqual({ A: 'hello', B: 'world', C: '' });
  expect(result.changes).toEqual([{ key: 'A', before: '  hello  ', after: 'hello' }, { key: 'C', before: '  ', after: '' }]);
});

test('returns no changes when nothing to trim', () => {
  const env = { A: 'hello', B: 'world' };
  const result = trim(env);
  expect(result.changes).toHaveLength(0);
  expect(result.trimmed).toEqual(env);
});

test('handles empty env', () => {
  const result = trim({});
  expect(result.trimmed).toEqual({});
  expect(result.changes).toHaveLength(0);
});

test('formatTrim shows changes', () => {
  const result = trim({ KEY: '  val  ' });
  const out = formatTrim(result);
  expect(out).toContain('KEY');
  expect(out).toContain('val');
});

test('formatTrim shows no changes message', () => {
  const result = trim({ KEY: 'val' });
  const out = formatTrim(result);
  expect(out).toContain('No');
});
