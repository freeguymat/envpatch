/**
 * unique.js — find keys that exist in one env but not another
 */

/**
 * Returns keys unique to `a` (not in `b`) and unique to `b` (not in `a`).
 * @param {Record<string,string>} a
 * @param {Record<string,string>} b
 * @param {string} [labelA]
 * @param {string} [labelB]
 * @returns {{ onlyInA: string[], onlyInB: string[] }}
 */
export function unique(a, b) {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const onlyInA = [...keysA].filter((k) => !keysB.has(k));
  const onlyInB = [...keysB].filter((k) => !keysA.has(k));

  return { onlyInA, onlyInB };
}

/**
 * Format unique result as a human-readable string.
 * @param {{ onlyInA: string[], onlyInB: string[] }} result
 * @param {string} [labelA]
 * @param {string} [labelB]
 * @returns {string}
 */
export function formatUnique(result, labelA = 'A', labelB = 'B') {
  const lines = [];

  if (result.onlyInA.length === 0 && result.onlyInB.length === 0) {
    return 'No unique keys — both files share the same key set.';
  }

  if (result.onlyInA.length > 0) {
    lines.push(`Only in ${labelA} (${result.onlyInA.length}):`);
    for (const k of result.onlyInA) {
      lines.push(`  + ${k}`);
    }
  }

  if (result.onlyInB.length > 0) {
    lines.push(`Only in ${labelB} (${result.onlyInB.length}):`);
    for (const k of result.onlyInB) {
      lines.push(`  - ${k}`);
    }
  }

  return lines.join('\n');
}
