// trim.js — strip leading/trailing whitespace from env values

/**
 * Trim whitespace from values in a parsed env object.
 * @param {Record<string, string>} env
 * @param {string[]} [keys] - if provided, only trim these keys
 * @returns {{ trimmed: Record<string, string>, changes: Array<{key: string, before: string, after: string}> }}
 */
export function trim(env, keys) {
  const trimmed = { ...env };
  const changes = [];

  const targets = keys && keys.length > 0 ? keys : Object.keys(env);

  for (const key of targets) {
    if (!(key in env)) continue;
    const before = env[key];
    const after = before.trim();
    if (before !== after) {
      trimmed[key] = after;
      changes.push({ key, before, after });
    }
  }

  return { trimmed, changes };
}

/**
 * Format trim results for CLI output.
 * @param {Array<{key: string, before: string, after: string}>} changes
 * @returns {string}
 */
export function formatTrim(changes) {
  if (changes.length === 0) return 'No values needed trimming.';
  const lines = changes.map(
    ({ key, before, after }) =>
      `  ${key}: ${JSON.stringify(before)} → ${JSON.stringify(after)}`
  );
  return `Trimmed ${changes.length} value(s):\n${lines.join('\n')}`;
}
