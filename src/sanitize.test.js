const { sanitize, sanitizeValue, formatSanitize } = require('./sanitize');

describe('sanitizeValue', () => {
  test('trims surrounding whitespace', () => {
    expect(sanitizeValue('  hello  ')).toBe('hello');
  });

  test('strips matching double quotes', () => {
    expect(sanitizeValue('"hello world"')).toBe('hello world');
  });

  test('strips matching single quotes', () => {
    expect(sanitizeValue("'hello'")).toBe('hello');
  });

  test('does not strip mismatched quotes', () => {
    expect(sanitizeValue('"hello\'')).toBe('"hello\'');
  });

  test('normalizes windows line endings', () => {
    expect(sanitizeValue('foo\r\nbar')).toBe('foo\nbar');
  });

  test('collapseWhitespace option', () => {
    expect(sanitizeValue('foo   bar', { collapseWhitespace: true })).toBe('foo bar');
  });

  test('leaves clean values unchanged', () => {
    expect(sanitizeValue('cleanvalue')).toBe('cleanvalue');
  });
});

describe('sanitize', () => {
  test('sanitizes multiple values and reports changes', () => {
    const env = { A: '  hello  ', B: '"world"', C: 'clean' };
    const { result, changes } = sanitize(env);
    expect(result.A).toBe('hello');
    expect(result.B).toBe('world');
    expect(result.C).toBe('clean');
    expect(changes).toHaveLength(2);
    expect(changes.map(c => c.key)).toEqual(['A', 'B']);
  });

  test('returns empty changes when nothing to fix', () => {
    const env = { X: 'ok', Y: 'fine' };
    const { changes } = sanitize(env);
    expect(changes).toHaveLength(0);
  });

  test('passes opts through to sanitizeValue', () => {
    const env = { MSG: 'hello   world' };
    const { result } = sanitize(env, { collapseWhitespace: true });
    expect(result.MSG).toBe('hello world');
  });
});

describe('formatSanitize', () => {
  test('reports no changes', () => {
    expect(formatSanitize([])).toBe('No changes needed.');
  });

  test('formats changes list', () => {
    const changes = [{ key: 'FOO', before: '  bar  ', after: 'bar' }];
    const out = formatSanitize(changes);
    expect(out).toContain('FOO');
    expect(out).toContain('"  bar  "');
    expect(out).toContain('"bar"');
    expect(out).toContain('Sanitized 1 value(s)');
  });
});
