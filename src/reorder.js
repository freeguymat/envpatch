/**
 * reorder.js — reorder keys in a .env file by a given list or alphabetically
 */

/**
 * Reorder keys in an env object according to a preferred order.
 * Keys not in the order list are appended at the end (sorted or as-is).
 *
 * @param {Object} env - parsed env object
 * @param {string[]} order - preferred key order
 * @param {Object} options
 * @param {boolean} [options.sortRemainder=false] - sort leftover keys alphabetically
 * @returns {{ result: Object, moved: string[], appended: string[] }}
 */
export function reorder(env, order = [], { sortRemainder = false } = {}) {
  const keys = Object.keys(env);
  const orderSet = new Set(order);

  const moved = order.filter((k) => k in env);
  let remainder = keys.filter((k) => !orderSet.has(k));

  if (sortRemainder) {
    remainder = remainder.slice().sort();
  }

  const appended = remainder;
  const finalKeys = [...moved, ...remainder];

  const result = {};
  for (const k of finalKeys) {
    result[k] = env[k];
  }

  return { result, moved, appended };
}

/**
 * Format a human-readable summary of the reorder operation.
 *
 * @param {string[]} moved
 * @param {string[]} appended
 * @returns {string}
 */
export function formatReorder(moved, appended) {
  const lines = [];

  if (moved.length > 0) {
    lines.push(`Reordered (${moved.length}):`);
    for (const k of moved) lines.push(`  ~ ${k}`);
  }

  if (appended.length > 0) {
    lines.push(`Appended remainder (${appended.length}):`);
    for (const k of appended) lines.push(`  + ${k}`);
  }

  if (lines.length === 0) {
    lines.push('No keys to reorder.');
  }

  return lines.join('\n');
}
