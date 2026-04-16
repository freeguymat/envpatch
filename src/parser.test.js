const { parse, serialize } = require('./parser');

describe('parse', () => {
  test('parses simple key=value pairs', () => {
    expect(parse('FOO=bar\nBAZ=qux')).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comments and blank lines', () => {
    const input = '# comment\n\nKEY=value';
    expect(parse(input)).toEqual({ KEY: 'value' });
  });

  test('strips inline comments', () => {
    expect(parse('KEY=value # inline')).toEqual({ KEY: 'value' });
  });

  test('handles double-quoted values', () => {
    expect(parse('KEY="hello world"')).toEqual({ KEY: 'hello world' });
  });

  test('handles single-quoted values', () => {
    expect(parse("KEY='hello world'")).toEqual({ KEY: 'hello world' });
  });

  test('handles empty value', () => {
    expect(parse('KEY=')).toEqual({ KEY: '' });
  });

  test('value with equals sign', () => {
    expect(parse('KEY=a=b')).toEqual({ KEY: 'a=b' });
  });
});

describe('serialize', () => {
  test('serializes map to env format', () => {
    const out = serialize({ FOO: 'bar' });
    expect(out).toBe('FOO=bar\n');
  });

  test('quotes values with spaces', () => {
    const out = serialize({ MSG: 'hello world' });
    expect(out).toContain('MSG="hello world"');
  });

  test('round-trips simple env', () => {
    const input = { A: '1', B: 'two' };
    expect(parse(serialize(input))).toEqual(input);
  });
});
