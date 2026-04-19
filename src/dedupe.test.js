const { dedupe, formatDedupe } = require('./dedupe');

const entries = (pairs) =>
  pairs.map(([key, value]) => ({ key, value }));

test('no duplicates returns same entries', () => {
  const input = entries([['A', '1'], ['B', '2']]);
  const { entries: out, duplicates } = dedupe(input);
  expect(out).toHaveLength(2);
  expect(duplicates).toHaveLength(0);
});

test('keeps last by default', () => {
  const input = entries([['A', '1'], ['B', '2'], ['A', '3']]);
  const { entries: out, duplicates } = dedupe(input);
  expect(out).toHaveLength(2);
  expect(out.find(e => e.key === 'A').value).toBe('3');
  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].key).toBe('A');
});

test('keeps first when specified', () => {
  const input = entries([['A', '1'], ['B', '2'], ['A', '3']]);
  const { entries: out } = dedupe(input, 'first');
  expect(out.find(e => e.key === 'A').value).toBe('1');
});

test('handles multiple duplicates', () => {
  const input = entries([['X', 'a'], ['X', 'b'], ['X', 'c']]);
  const { entries: out, duplicates } = dedupe(input);
  expect(out).toHaveLength(1);
  expect(out[0].value).toBe('c');
  expect(duplicates[0].count).toBe(3);
});

test('preserves comment-only lines (no key)', () => {
  const input = [{ key: null, value: null, comment: '# hi' }, { key: 'A', value: '1' }];
  const { entries: out } = dedupe(input);
  expect(out).toHaveLength(2);
});

test('formatDedupe with no duplicates', () => {
  expect(formatDedupe([])).toBe('No duplicate keys found.');
});

test('formatDedupe lists duplicates', () => {
  const result = formatDedupe([{ key: 'FOO', count: 2 }, { key: 'BAR', count: 3 }]);
  expect(result).toContain('FOO');
  expect(result).toContain('BAR');
  expect(result).toContain('3 occurrences');
});
