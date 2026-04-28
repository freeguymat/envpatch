// truncate.js — truncate long env values to a max length

/**
 * Truncate a single value to maxLen characters.
 * @param {string} value
 * @param {number} maxLen
 * @param {string} suffix
 * @returns {string}
 */
function truncateValue(value, maxLen = 80, suffix = '...') {
  if (typeof value !== 'string' || value.length <= maxLen) return value;
  return value.slice(0, maxLen - suffix.length) + suffix;
}

/**
 * Truncate all values in an env object that exceed maxLen.
 * @param {Record<string, string>} env
 * @param {object} options
 * @param {number} [options.maxLen=80]
 * @param {string} [options.suffix='...']
 * @param {string[]} [options.keys] — if provided, only truncate these keys
 * @returns {{ result: Record<string, string>, truncated: string[] }}
 */
function truncate(env, { maxLen = 80, suffix = '...', keys } = {}) {
  const result = {};
  const truncated = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldProcess = !keys || keys.includes(key);
    if (shouldProcess && typeof value === 'string' && value.length > maxLen) {
      result[key] = truncateValue(value, maxLen, suffix);
      truncated.push(key);
    } else {
      result[key] = value;
    }
  }

  return { result, truncated };
}

/**
 * Format a human-readable summary of truncated keys.
 * @param {string[]} truncated
 * @param {number} maxLen
 * @returns {string}
 */
function formatTruncate(truncated, maxLen) {
  if (truncated.length === 0) {
    return `No values exceeded ${maxLen} characters.`;
  }
  const lines = [`Truncated ${truncated.length} value(s) to ${maxLen} chars:`];
  for (const key of truncated) {
    lines.push(`  - ${key}`);
  }
  return lines.join('\n');
}

module.exports = { truncate, truncateValue, formatTruncate };
