const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadSchema, serializeSchema } = require('./schema');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `schema-${Date.now()}.env.schema`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('loadSchema', () => {
  test('parses required keys', () => {
    const p = writeTmp('DATABASE_URL\nPORT\n');
    const schema = loadSchema(p);
    expect(schema.DATABASE_URL).toEqual({ required: true });
    expect(schema.PORT).toEqual({ required: true });
  });

  test('parses optional key with ?', () => {
    const p = writeTmp('DEBUG?\n');
    const schema = loadSchema(p);
    expect(schema.DEBUG.required).toBe(false);
  });

  test('parses key with pattern', () => {
    const p = writeTmp('PORT=^\\d+$\n');
    const schema = loadSchema(p);
    expect(schema.PORT.pattern).toBeInstanceOf(RegExp);
    expect(schema.PORT.pattern.test('3000')).toBe(true);
    expect(schema.PORT.pattern.test('abc')).toBe(false);
  });

  test('ignores comments and blank lines', () => {
    const p = writeTmp('# comment\n\nKEY\n');
    const schema = loadSchema(p);
    expect(Object.keys(schema)).toEqual(['KEY']);
  });
});

describe('serializeSchema', () => {
  test('serializes required key', () => {
    const out = serializeSchema({ PORT: { required: true } });
    expect(out).toContain('PORT\n');
  });

  test('serializes optional key', () => {
    const out = serializeSchema({ DEBUG: { required: false } });
    expect(out).toContain('DEBUG?\n');
  });

  test('serializes key with pattern', () => {
    const out = serializeSchema({ PORT: { required: true, pattern: /^\d+$/ } });
    expect(out).toContain('PORT=^\\d+$');
  });
});
