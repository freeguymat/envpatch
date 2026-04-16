const { diff } = require('./diff');

describe('diff', () => {
  const base = { A: '1', B: '2', C: '3' };

  test('detects added keys', () => {
    const result = diff(base, { ...base, D: '4' });
    expect(result).toContainEqual({ key: 'D', type: 'added', newValue: '4' });
  });

  test('detects removed keys', () => {
    const { C, ...target } = base;
    const result = diff(base, target);
    expect(result).toContainEqual({ key: 'C', type: 'removed', oldValue: '3' });
  });

  test('detects changed values', () => {
    const result = diff(base, { ...base, B: '99' });
    expect(result).toContainEqual({ key: 'B', type: 'changed', oldValue: '2', newValue: '99' });
  });

  test('returns empty array when identical', () => {
    expect(diff(base, { ...base })).toEqual([]);
  });

  test('results are sorted by key', () => {
    const result = diff({}, { Z: '1', A: '2', M: '3' });
    const keys = result.map(c => c.key);
    expect(keys).toEqual([...keys].sort());
  });

  test('handles empty base', () => {
    const result = diff({}, { X: 'y' });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('added');
  });

  test('handles empty target', () => {
    const result = diff({ X: 'y' }, {});
    expect(result[0].type).toBe('removed');
  });
});
