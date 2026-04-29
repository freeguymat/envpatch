/**
 * placeholder.js
 * Find keys with empty or placeholder values in .env files.
 * Placeholders are values like: '', 'CHANGEME', 'TODO', 'YOUR_*', '<*>', 'xxx', etc.
 */

const PLACEHOLDER_PATTERNS = [
  /^$/,
  /^changeme$/i,
  /^todo$/i,
  /^fixme$/i,
  /^your[_-]/i,
  /^<.+>$/,
  /^\[.+\]$/,
  /^xxx+$/i,
  /^placeholder$/i,
  /^replace[_-]?me$/i,
  /^fill[_-]?in$/i,
  /^insert[_-]?here$/i,
  /^example$/i,
  /^sample$/i,
  /^n\/a$/i,
  /^none$/i,
  /^null$/i,
  /^undefined$/i,
  /^0{4,}$/,
  /^1{4,}$/,
];

/**
 * Check if a single value looks like a placeholder.
 * @param {string} value
 * @returns {boolean}
 */
function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return PLACEHOLDER_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Find all keys in an env object whose values look like placeholders.
 * @param {Record<string, string>} env
 * @returns {Array<{ key: string, value: string }>}
 */
function findPlaceholders(env) {
  return Object.entries(env)
    .filter(([, v]) => isPlaceholder(v))
    .map(([key, value]) => ({ key, value }));
}

/**
 * Format placeholder findings for CLI output.
 * @param {Array<{ key: string, value: string }>} findings
 * @returns {string}
 */
function formatPlaceholders(findings) {
  if (findings.length === 0) return 'No placeholder values found.';
  const lines = findings.map(({ key, value }) => {
    const display = value === '' ? '(empty)' : JSON.stringify(value);
    return `  ${key} = ${display}`;
  });
  return `Found ${findings.length} placeholder value(s):\n${lines.join('\n')}`;
}

module.exports = { isPlaceholder, findPlaceholders, formatPlaceholders };
