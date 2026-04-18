// rename.js — rename keys across a parsed env object

/**
 * Rename keys in an env object according to a map.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} renameMap - { oldKey: newKey }
 * @param {{ overwrite?: boolean }} options
 * @returns {{ result: Record<string, string>, renamed: string[], skipped: string[] }}
 */
export function renameKeys(env, renameMap, options = {}) {
  const { overwrite = false } = options;
  const result = { ...env };
  const renamed = [];
  const skipped = [];

  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (!(oldKey in result)) {
      skipped.push(oldKey);
      continue;
    }
    if (newKey in result && !overwrite) {
      skipped.push(oldKey);
      continue;
    }
    result[newKey] = result[oldKey];
    delete result[oldKey];
    renamed.push(oldKey);
  }

  return { result, renamed, skipped };
}

/**
 * Format rename summary for CLI output.
 */
export function formatRename({ renamed, skipped }) {
  const lines = [];
  if (renamed.length) {
    lines.push('Renamed:');
    renamed.forEach(k => lines.push(`  ${k}`));
  }
  if (skipped.length) {
    lines.push('Skipped:');
    skipped.forEach(k => lines.push(`  ${k}`));
  }
  if (!lines.length) lines.push('Nothing to rename.');
  return lines.join('\n');
}
