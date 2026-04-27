// namespace.js — group keys by namespace prefix (e.g. APP_DB_HOST -> APP.DB.HOST)

/**
 * Split keys into a nested namespace map using a delimiter.
 * @param {Record<string,string>} env
 * @param {string} delimiter  default '_'
 * @returns {Record<string, Record<string,string>>}
 */
function namespaceGroup(env, delimiter = '_') {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(delimiter);
    if (idx === -1) {
      const ns = '__root__';
      result[ns] = result[ns] || {};
      result[ns][key] = value;
    } else {
      const ns = key.slice(0, idx);
      const rest = key.slice(idx + 1);
      result[ns] = result[ns] || {};
      result[ns][rest] = value;
    }
  }
  return result;
}

/**
 * Flatten a namespace map back to a flat env object.
 * @param {Record<string, Record<string,string>>} namespaced
 * @param {string} delimiter
 * @returns {Record<string,string>}
 */
function namespaceFlat(namespaced, delimiter = '_') {
  const result = {};
  for (const [ns, keys] of Object.entries(namespaced)) {
    for (const [key, value] of Object.entries(keys)) {
      const full = ns === '__root__' ? key : `${ns}${delimiter}${key}`;
      result[full] = value;
    }
  }
  return result;
}

/**
 * Format namespaced groups as a readable string.
 * @param {Record<string, Record<string,string>>} namespaced
 * @returns {string}
 */
function formatNamespace(namespaced) {
  const lines = [];
  for (const [ns, keys] of Object.entries(namespaced)) {
    const label = ns === '__root__' ? '[root]' : `[${ns}]`;
    lines.push(label);
    for (const [key, value] of Object.entries(keys)) {
      lines.push(`  ${key}=${value}`);
    }
  }
  return lines.join('\n');
}

module.exports = { namespaceGroup, namespaceFlat, formatNamespace };
