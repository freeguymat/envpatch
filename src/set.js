// set.js — set or update key-value pairs in a parsed env object

/**
 * Set one or more keys in an env object.
 * Returns a new object with the keys applied.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} updates
 * @returns {Record<string,string>}
 */
export function setKeys(env, updates) {
  return { ...env, ...updates };
}

/**
 * Remove one or more keys from an env object.
 * @param {Record<string,string>} env
 * @param {string[]} keys
 * @returns {Record<string,string>}
 */
export function unsetKeys(env, keys) {
  const result = { ...env };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Format a summary of what was set/unset.
 * @param {string[]} set
 * @param {string[]} unset
 * @returns {string}
 */
export function formatSet(set, unset) {
  const lines = [];
  for (const k of set) lines.push(`  set   ${k}`);
  for (const k of unset) lines.push(`  unset ${k}`);
  return lines.length ? lines.join('\n') : '  (no changes)';
}
