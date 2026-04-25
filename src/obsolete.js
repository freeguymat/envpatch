/**
 * obsolete.js — find keys that exist in env but not in a reference/schema
 */

/**
 * Find keys in `env` that are not present in `reference`.
 * @param {Record<string,string>} env - the environment to check
 * @param {Record<string,string>} reference - the reference env or schema keys
 * @returns {{ key: string, value: string }[]}
 */
export function findObsolete(env, reference) {
  const refKeys = new Set(Object.keys(reference));
  return Object.entries(env)
    .filter(([key]) => !refKeys.has(key))
    .map(([key, value]) => ({ key, value }));
}

/**
 * Remove obsolete keys from env, returning a cleaned copy.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} reference
 * @returns {Record<string,string>}
 */
export function removeObsolete(env, reference) {
  const refKeys = new Set(Object.keys(reference));
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => refKeys.has(key))
  );
}

/**
 * Format obsolete results for CLI output.
 * @param {{ key: string, value: string }[]} entries
 * @returns {string}
 */
export function formatObsolete(entries) {
  if (entries.length === 0) {
    return 'No obsolete keys found.';
  }
  const lines = entries.map(({ key, value }) => {
    const preview = value.length > 40 ? value.slice(0, 40) + '...' : value;
    return `  - ${key}=${preview}`;
  });
  return `Obsolete keys (${entries.length}):\n${lines.join('\n')}`;
}
