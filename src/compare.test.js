const { compare, formatCompare } = require('./compare');

const base = `
DB_HOST=localhost
DB_PORT=5432
API_KEY=secret
DEBUG=true
`.trim();

const target = `
DB_HOST=localhost
DB_PORT=5433
NEW_VAR=hello
DEBUG=true
`.trim();

describe('compare', () => {
  let summary;

  beforeEach(() => {
    summary = compare(base, target);
  });

  test('detects added keys', () => {
    expect(summary.added).toContain('NEW_VAR');
  });

  test('detects removed keys', () => {
    expect(summary.removed).toContain('API_KEY');
  });

  test('detects changed keys', () => {
    expect(summary.changed).toContain('DB_PORT');
  });

  test('detects unchanged keys', () => {
    expect(summary.unchanged).toContain('DB_HOST');
    expect(summary.unchanged).toContain('DEBUG');
  });

  test('no false positives in unchanged', () => {
    expect(summary.unchanged).not.toContain('DB_PORT');
    expect(summary.unchanged).not.toContain('NEW_VAR');
  });
});

describe('formatCompare', () => {
  test('prefixes added with +', () => {
    const out = formatCompare({ added: ['FOO'], removed: [], changed: [], unchanged: [] });
    expect(out).toContain('+ FOO');
  });

  test('prefixes removed with -', () => {
    const out = formatCompare({ added: [], removed: ['BAR'], changed: [], unchanged: [] });
    expect(out).toContain('- BAR');
  });

  test('prefixes changed with ~', () => {
    const out = formatCompare({ added: [], removed: [], changed: ['BAZ'], unchanged: [] });
    expect(out).toContain('~ BAZ');
  });

  test('prefixes unchanged with space', () => {
    const out = formatCompare({ added: [], removed: [], changed: [], unchanged: ['QUX'] });
    expect(out).toContain('  QUX');
  });

  test('full compare output has all sections', () => {
    const summary = compare(base, target);
    const out = formatCompare(summary);
    expect(out).toContain('+ NEW_VAR');
    expect(out).toContain('- API_KEY');
    expect(out).toContain('~ DB_PORT');
    expect(out).toContain('  DB_HOST');
  });
});
