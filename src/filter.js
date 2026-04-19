// filter.js — filter env keys by pattern or prefix

/**
 * Filter env entries by key pattern (string prefix or regex)
 * @param {Record<string,string>} env
 * @param {string|RegExp} pattern
 * @returns {Record<string,string>}
 */
function filter(env, pattern) {
  const keys = Object.keys(env);
  let matched;
  if (pattern instanceof RegExp) {
    matched = keys.filter(k => pattern.test(k));
  } else {
    const upper = String(pattern).toUpperCase();
    matched = keys.filter(k => k.toUpperCase().startsWith(upper));
  }
  return Object.fromEntries(matched.map(k => [k, env[k]]));
}

/**
 * Format filtered results for display
 * @param {Record<string,string>} filtered
 * @param {string|RegExp} pattern
 * @returns {string}
 */
function formatFilter(filtered, pattern) {
  const keys = Object.keys(filtered);
  if (keys.length === 0) {
    return `No keys matched pattern: ${pattern}`;
  }
  const lines = keys.map(k => `  ${k}=${filtered[k]}`);
  return `Matched ${keys.length} key(s) for "${pattern}":\n${lines.join('\n')}`;
}

module.exports = { filter, formatFilter };
