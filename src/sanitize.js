// sanitize.js — strip, normalize, and fix common .env value issues

/**
 * Sanitize a single value:
 * - trim surrounding whitespace
 * - remove mismatched or unnecessary quotes
 * - normalize line endings
 * - collapse internal whitespace (optional)
 */
function sanitizeValue(value, opts = {}) {
  let v = value.replace(/\r\n|\r/g, '\n').trim();

  // Strip matching outer quotes if present
  const quoted =
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"));
  if (quoted && v.length >= 2) {
    v = v.slice(1, -1);
  }

  if (opts.collapseWhitespace) {
    v = v.replace(/[ \t]+/g, ' ');
  }

  return v;
}

/**
 * Sanitize all values in a parsed env object.
 * Returns { result, changes } where changes is an array of
 * { key, before, after } for every modified entry.
 */
function sanitize(env, opts = {}) {
  const result = {};
  const changes = [];

  for (const [key, value] of Object.entries(env)) {
    const after = sanitizeValue(value, opts);
    result[key] = after;
    if (after !== value) {
      changes.push({ key, before: value, after });
    }
  }

  return { result, changes };
}

/**
 * Format sanitize changes for CLI output.
 */
function formatSanitize(changes) {
  if (changes.length === 0) return 'No changes needed.';
  const lines = [`Sanitized ${changes.length} value(s):\n`];
  for (const { key, before, after } of changes) {
    lines.push(`  ${key}`);
    lines.push(`    before: ${JSON.stringify(before)}`);
    lines.push(`    after:  ${JSON.stringify(after)}`);
  }
  return lines.join('\n');
}

module.exports = { sanitize, sanitizeValue, formatSanitize };
