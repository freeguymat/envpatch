/**
 * Group env keys by prefix (e.g. DB_HOST, DB_PORT => { DB: [...] })
 */

/**
 * @param {Record<string,string>} env
 * @param {string} [separator]
 * @returns {Record<string, Record<string,string>>}
 */
export function group(env, separator = '_') {
  const groups = {};

  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(separator);
    const prefix = idx !== -1 ? key.slice(0, idx) : '__ungrouped__';

    if (!groups[prefix]) groups[prefix] = {};
    groups[prefix][key] = value;
  }

  return groups;
}

/**
 * @param {Record<string, Record<string,string>>} grouped
 * @returns {string}
 */
export function formatGroup(grouped) {
  const lines = [];

  for (const [prefix, keys] of Object.entries(grouped)) {
    const label = prefix === '__ungrouped__' ? '(no prefix)' : prefix;
    lines.push(`[${label}]`);
    for (const [key, value] of Object.entries(keys)) {
      lines.push(`  ${key}=${value}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/**
 * List all unique prefixes found in env keys.
 * @param {Record<string,string>} env
 * @param {string} [separator]
 * @returns {string[]}
 */
export function listPrefixes(env, separator = '_') {
  const prefixes = new Set();
  for (const key of Object.keys(env)) {
    const idx = key.indexOf(separator);
    if (idx !== -1) prefixes.add(key.slice(0, idx));
  }
  return [...prefixes].sort();
}
