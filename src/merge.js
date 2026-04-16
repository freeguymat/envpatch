/**
 * Merge two parsed env objects, with optional conflict strategy.
 * @param {Object} base - base env key/value map
 * @param {Object} incoming - incoming env key/value map
 * @param {'ours'|'theirs'|'union'} strategy - conflict resolution
 * @returns {{ merged: Object, conflicts: Array }}
 */
export function merge(base, incoming, strategy = 'ours') {
  const merged = { ...base };
  const conflicts = [];

  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in base)) {
      // New key — always add
      merged[key] = value;
    } else if (base[key] !== value) {
      conflicts.push({ key, base: base[key], incoming: value });
      if (strategy === 'theirs') {
        merged[key] = value;
      } else if (strategy === 'union') {
        // Keep both as comment + value
        merged[key] = value;
      }
      // 'ours' — keep base value (already set)
    }
  }

  return { merged, conflicts };
}
