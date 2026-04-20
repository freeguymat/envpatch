/**
 * defaults.js — fill missing keys in an env from a defaults map
 */

/**
 * Fill missing keys in `env` using `defaults`.
 * Returns a new object; does not mutate inputs.
 *
 * @param {Record<string,string>} env
 * @param {Record<string,string>} defaults
 * @returns {{ result: Record<string,string>, filled: string[] }}
 */
export function applyDefaults(env, defaults) {
  const result = { ...env };
  const filled = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in result) || result[key] === '') {
      result[key] = value;
      filled.push(key);
    }
  }

  return { result, filled };
}

/**
 * Format a human-readable summary of applied defaults.
 *
 * @param {string[]} filled
 * @returns {string}
 */
export function formatDefaults(filled) {
  if (filled.length === 0) {
    return 'No defaults applied — all keys already present.';
  }
  const lines = filled.map((k) => `  + ${k}`);
  return `Applied ${filled.length} default(s):\n${lines.join('\n')}`;
}
