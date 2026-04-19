// Sort .env keys alphabetically or by custom order

/**
 * Sort env keys alphabetically or by a provided key order.
 * @param {Record<string, string>} env
 * @param {object} options
 * @param {string[]} [options.order] - explicit key order (unmatched keys go to end)
 * @param {boolean} [options.descending] - reverse alphabetical
 * @returns {{ sorted: Record<string, string>, moved: Array<{key: string, from: number, to: number}> }}
 */
export function sort(env, options = {}) {
  const { order, descending = false } = options;
  const keys = Object.keys(env);

  let sortedKeys;
  if (order && order.length > 0) {
    const orderIndex = (k) => {
      const i = order.indexOf(k);
      return i === -1 ? Infinity : i;
    };
    sortedKeys = [...keys].sort((a, b) => orderIndex(a) - orderIndex(b));
  } else {
    sortedKeys = [...keys].sort((a, b) =>
      descending ? b.localeCompare(a) : a.localeCompare(b)
    );
  }

  const moved = [];
  sortedKeys.forEach((key, toIdx) => {
    const fromIdx = keys.indexOf(key);
    if (fromIdx !== toIdx) {
      moved.push({ key, from: fromIdx, to: toIdx });
    }
  });

  const sorted = {};
  for (const key of sortedKeys) {
    sorted[key] = env[key];
  }

  return { sorted, moved };
}

/**
 * Format sort result as human-readable summary.
 * @param {ReturnType<typeof sort>} result
 * @returns {string}
 */
export function formatSort(result) {
  if (result.moved.length === 0) {
    return 'Keys are already in sorted order.';
  }
  const lines = [`Reordered ${result.moved.length} key(s):`];
  for (const { key, from, to } of result.moved) {
    lines.push(`  ${key}: position ${from + 1} → ${to + 1}`);
  }
  return lines.join('\n');
}
