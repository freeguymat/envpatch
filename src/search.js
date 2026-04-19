// Search for keys or values across one or more parsed env objects

/**
 * Search entries in a parsed env object.
 * @param {Record<string,string>} env
 * @param {object} opts
 * @param {string} [opts.key]   - substring or regex pattern for key
 * @param {string} [opts.value] - substring or regex pattern for value
 * @param {boolean} [opts.regex] - treat patterns as regex
 * @returns {Array<{key:string,value:string}>}
 */
function search(env, { key, value, regex = false } = {}) {
  const match = (str, pattern) => {
    if (!pattern) return true;
    if (regex) return new RegExp(pattern).test(str);
    return str.includes(pattern);
  };

  return Object.entries(env)
    .filter(([k, v]) => match(k, key) && match(v, value))
    .map(([k, v]) => ({ key: k, value: v }));
}

/**
 * Format search results for CLI output.
 * @param {Array<{key:string,value:string}>} results
 * @returns {string}
 */
function formatSearch(results) {
  if (results.length === 0) return 'No matches found.';
  return results.map(({ key, value }) => `${key}=${value}`).join('\n');
}

module.exports = { search, formatSearch };
