// Lint .env files for common issues

const VALID_KEY_RE = /^[A-Z_][A-Z0-9_]*$/;

/**
 * @typedef {{ line: number, key: string|null, message: string, severity: 'error'|'warn' }} LintIssue
 */

/**
 * Lint a parsed env object plus raw lines for style/correctness issues.
 * @param {Record<string, string>} env
 * @param {string} raw - original file content
 * @returns {LintIssue[]}
 */
function lint(env, raw) {
  const issues = [];
  const lines = raw.split('\n');
  const seenKeys = new Map();

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // skip blanks and comments
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      issues.push({ line: lineNum, key: null, message: 'Line has no "=" separator', severity: 'error' });
      return;
    }

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1);

    if (!VALID_KEY_RE.test(key)) {
      issues.push({ line: lineNum, key, message: `Key "${key}" should be UPPER_SNAKE_CASE`, severity: 'warn' });
    }

    if (seenKeys.has(key)) {
      issues.push({ line: lineNum, key, message: `Duplicate key "${key}" (first seen on line ${seenKeys.get(key)})`, severity: 'error' });
    } else {
      seenKeys.set(key, lineNum);
    }

    if (value.trim() === '') {
      issues.push({ line: lineNum, key, message: `Key "${key}" has an empty value`, severity: 'warn' });
    }

    if ((value.startsWith('"') && !value.endsWith('"')) ||
        (value.startsWith("'") && !value.endsWith("'"))) {
      issues.push({ line: lineNum, key, message: `Key "${key}" has unmatched quotes`, severity: 'error' });
    }
  });

  return issues;
}

/**
 * Format lint issues for console output.
 * @param {LintIssue[]} issues
 * @returns {string}
 */
function formatLint(issues) {
  if (issues.length === 0) return 'No issues found.';
  return issues
    .map(i => `[${i.severity.toUpperCase()}] line ${i.line}${i.key ? ` (${i.key})` : ''}: ${i.message}`)
    .join('\n');
}

module.exports = { lint, formatLint };
