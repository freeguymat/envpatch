const { transform, transformKey, transformValue, formatTransform } = require('./transform');

describe('transformKey', () => {
  test('uppercase', () => expect(transformKey('foo_bar', 'uppercase')).toBe('FOO_BAR'));
  test('lowercase', () => expect(transformKey('FOO_BAR', 'lowercase')).toBe('foo_bar'));
  test('snake from camel', () => expect(transformKey('fooBar', 'snake')).toBe('FOO_BAR'));
  test('camel from snake', () => expect(transformKey('FOO_BAR', 'camel')).toBe('fooBar'));
  test('unknown mode returns original', () => expect(transformKey('FOO', 'noop')).toBe('FOO'));
});

describe('transformValue', () => {
  test('uppercase', () => expect(transformValue('hello', 'uppercase')).toBe('HELLO'));
  test('lowercase', () => expect(transformValue('HELLO', 'lowercase')).toBe('hello'));
  test('trim', () => expect(transformValue('  hi  ', 'trim')).toBe('hi'));
  test('unknown mode returns original', () => expect(transformValue('hi', 'noop')).toBe('hi'));
});

describe('transform', () => {
  const env = { FOO_BAR: 'Hello', BAZ: '  world  ' };

  test('no opts returns unchanged env with no changes', () => {
    const { result, changes } = transform(env);
    expect(result).toEqual(env);
    expect(changes).toHaveLength(0);
  });

  test('keys lowercase', () => {
    const { result, changes } = transform(env, { keys: 'lowercase' });
    expect(result).toHaveProperty('foo_bar', 'Hello');
    expect(result).toHaveProperty('baz', '  world  ');
    expect(changes).toHaveLength(2);
  });

  test('values trim', () => {
    const { result, changes } = transform(env, { values: 'trim' });
    expect(result['BAZ']).toBe('world');
    expect(changes.some(c => c.oldKey === 'BAZ')).toBe(true);
  });

  test('both keys and values', () => {
    const { result, changes } = transform({ fooBar: '  val  ' }, { keys: 'snake', values: 'trim' });
    expect(result).toHaveProperty('FOO_BAR', 'val');
    expect(changes).toHaveLength(1);
  });

  test('no duplicate keys clobber — last write wins on collision', () => {
    const e = { fooBar: 'a', foo_bar: 'b' };
    const { result } = transform(e, { keys: 'snake' });
    expect(result['FOO_BAR']).toBe('b');
  });
});

describe('formatTransform', () => {
  test('no changes message', () => {
    expect(formatTransform([])).toMatch(/No transformations/);
  });

  test('shows key and value changes', () => {
    const changes = [{ oldKey: 'foo', newKey: 'FOO', oldVal: 'bar', newVal: 'BAR' }];
    const out = formatTransform(changes);
    expect(out).toMatch('foo → FOO');
    expect(out).toMatch('"bar" → "BAR"');
  });

  test('singular entry wording', () => {
    const changes = [{ oldKey: 'a', newKey: 'A', oldVal: 'x', newVal: 'X' }];
    expect(formatTransform(changes)).toMatch('1 entry');
  });
});
