import { trim, formatTrim } from './trim.js';

describe('trim', () => {
  it('trims leading and trailing whitespace from all values', () => {
    const env = { FOO: '  hello  ', BAR: 'world', BAZ: '\ttest\n' };
    const { trimmed, changes } = trim(env);
    expect(trimmed.FOO).toBe('hello');
    expect(trimmed.BAR).toBe('world');
    expect(trimmed.BAZ).toBe('test');
    expect(changes).toHaveLength(2);
    expect(changes.map(c => c.key)).toEqual(expect.arrayContaining(['FOO', 'BAZ']));
  });

  it('only trims specified keys when keys array is provided', () => {
    const env = { FOO: '  hello  ', BAR: '  world  ' };
    const { trimmed, changes } = trim(env, ['FOO']);
    expect(trimmed.FOO).toBe('hello');
    expect(trimmed.BAR).toBe('  world  ');
    expect(changes).toHaveLength(1);
    expect(changes[0].key).toBe('FOO');
  });

  it('returns no changes when all values are already trimmed', () => {
    const env = { FOO: 'hello', BAR: 'world' };
    const { trimmed, changes } = trim(env);
    expect(trimmed).toEqual(env);
    expect(changes).toHaveLength(0);
  });

  it('ignores keys not present in env', () => {
    const env = { FOO: '  hi  ' };
    const { trimmed, changes } = trim(env, ['FOO', 'MISSING']);
    expect(trimmed.FOO).toBe('hi');
    expect(changes).toHaveLength(1);
  });

  it('does not mutate the original env', () => {
    const env = { FOO: '  hi  ' };
    trim(env);
    expect(env.FOO).toBe('  hi  ');
  });
});

describe('formatTrim', () => {
  it('returns a no-op message when no changes', () => {
    expect(formatTrim([])).toBe('No values needed trimming.');
  });

  it('formats changes with before/after', () => {
    const changes = [{ key: 'FOO', before: '  hi  ', after: 'hi' }];
    const out = formatTrim(changes);
    expect(out).toContain('Trimmed 1 value(s)');
    expect(out).toContain('FOO');
    expect(out).toContain('"  hi  "');
    expect(out).toContain('"hi"');
  });
});
