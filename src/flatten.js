/**
 * flatten.js — flatten nested env-like objects into KEY_SUBKEY format
 * and expand flat keys back into nested objects
 */

/**
 * Flatten a nested object into dot/underscore-separated env keys.
 * @param {object} obj - nested object
 * @param {string} [prefix=''] - key prefix
 * @param {string} [sep='_'] - separator
 * @returns {object} flat key-value map
 */
function flatten(obj, prefix = '', sep = '_') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}${sep}${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey, sep));
    } else {
      result[fullKey.toUpperCase()] = String(value ?? '');
    }
  }
  return result;
}

/**
 * Expand flat env key-value pairs into a nested object.
 * @param {object} env - flat key-value map
 * @param {string} [sep='_'] - separator
 * @returns {object} nested object
 */
function expand(env, sep = '_') {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const parts = key.toLowerCase().split(sep);
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cursor[part] === undefined || typeof cursor[part] !== 'object') {
        cursor[part] = {};
      }
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Format flattened result as a human-readable summary.
 * @param {object} flat - flat key-value map
 * @returns {string}
 */
function formatFlatten(flat) {
  const lines = Object.entries(flat).map(([k, v]) => `  ${k}=${v}`);
  return `Flattened ${lines.length} key(s):\n${lines.join('\n')}`;
}

module.exports = { flatten, expand, formatFlatten };
