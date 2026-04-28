/**
 * normalize.js — normalize .env key/value formatting
 * - uppercase keys
 * - trim whitespace from values
 * - strip surrounding quotes from values
 * - remove empty lines
 */

/**
 * Normalize a single key: uppercase, trim
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  return key.trim().toUpperCase();
}

/**
 * Normalize a single value: trim, strip matching outer quotes
 * @param {string} value
 * @returns {string}
 */
function normalizeValue(value) {
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
}

/**
 * Normalize an entire parsed env object
 * @param {Record<string, string>} env
 * @returns {{ env: Record<string, string>, changes: Array<{key: string, from: string, to: string}> }}
 */
function normalize(env) {
  const result = {};
  const changes = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    const newKey = normalizeKey(rawKey);
    const newValue = normalizeValue(rawValue);

    if (newKey !== rawKey || newValue !== rawValue) {
      changes.push({ key: newKey, from: `${rawKey}=${rawValue}`, to: `${newKey}=${newValue}` });
    }

    result[newKey] = newValue;
  }

  return { env: result, changes };
}

/**
 * Format normalize changes for CLI output
 * @param {Array<{key: string, from: string, to: string}>} changes
 * @returns {string}
 */
function formatNormalize(changes) {
  if (changes.length === 0) return 'No changes — env is already normalized.';
  const lines = [`Normalized ${changes.length} entr${changes.length === 1 ? 'y' : 'ies'}:`];
  for (const c of changes) {
    lines.push(`  ${c.from}  →  ${c.to}`);
  }
  return lines.join('\n');
}

module.exports = { normalize, normalizeKey, normalizeValue, formatNormalize };
