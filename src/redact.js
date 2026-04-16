/**
 * Redact sensitive values from a parsed env object for safe logging/display.
 */

const DEFAULT_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private/i,
  /auth/i,
  /credential/i,
];

const REDACTED = '***';

/**
 * Redact sensitive keys from a parsed env map.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, string>}
 */
function redact(env, patterns = DEFAULT_PATTERNS) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const sensitive = patterns.some((re) => re.test(key));
    result[key] = sensitive ? REDACTED : value;
  }
  return result;
}

/**
 * Check if a key is considered sensitive.
 * @param {string} key
 * @param {RegExp[]} [patterns]
 * @returns {boolean}
 */
function isSensitive(key, patterns = DEFAULT_PATTERNS) {
  return patterns.some((re) => re.test(key));
}

module.exports = { redact, isSensitive, REDACTED, DEFAULT_PATTERNS };
