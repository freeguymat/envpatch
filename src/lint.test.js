const { lint, formatLint } = require('./lint');

const good = `DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=abc123
`;

const bad = `db_host=localhost
DB_PORT=
DB_PORT=5432
BAD LINE
API_KEY="open
`;

describe('lint', () => {
  test('returns no issues for a clean file', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET_KEY: 'abc123' };
    const issues = lint(env, good);
    expect(issues).toHaveLength(0);
  });

  test('warns on lowercase key', () => {
    const issues = lint({}, bad);
    const warn = issues.find(i => i.key === 'db_host');
    expect(warn).toBeDefined();
    expect(warn.severity).toBe('warn');
  });

  test('warns on empty value', () => {
    const issues = lint({}, bad);
    const warn = issues.find(i => i.key === 'DB_PORT' && i.message.includes('empty'));
    expect(warn).toBeDefined();
  });

  test('errors on duplicate key', () => {
    const issues = lint({}, bad);
    const dup = issues.find(i => i.message.includes('Duplicate'));
    expect(dup).toBeDefined();
    expect(dup.severity).toBe('error');
  });

  test('errors on line without =', () => {
    const issues = lint({}, bad);
    const noEq = issues.find(i => i.message.includes('no "="'));
    expect(noEq).toBeDefined();
  });

  test('errors on unmatched quotes', () => {
    const issues = lint({}, bad);
    const q = issues.find(i => i.message.includes('unmatched quotes'));
    expect(q).toBeDefined();
    expect(q.severity).toBe('error');
  });

  test('each issue has a line number', () => {
    const issues = lint({}, bad);
    for (const issue of issues) {
      expect(typeof issue.line).toBe('number');
      expect(issue.line).toBeGreaterThan(0);
    }
  });
});

describe('formatLint', () => {
  test('returns friendly message when no issues', () => {
    expect(formatLint([])).toBe('No issues found.');
  });

  test('formats issues with severity and line', () => {
    const issues = lint({}, bad);
    const out = formatLint(issues);
    expect(out).toMatch(/\[ERROR\]/);
    expect(out).toMatch(/line \d+/);
  });
});
