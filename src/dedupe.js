// Remove duplicate keys from a parsed env object, keeping last occurrence by default

/**
 * @param {Array<{key:string,value:string,comment?:string}>} entries
 * @param {'first'|'last'} keep
 * @returns {{ entries: Array, duplicates: Array<{key:string,lines:number[]}> }}
 */
function dedupe(entries, keep = 'last') {
  const seen = new Map(); // key -> [indices]

  entries.forEach((entry, i) => {
    if (!entry.key) return;
    if (!seen.has(entry.key)) seen.set(entry.key, []);
    seen.get(entry.key).push(i);
  });

  const duplicates = [];
  const removeIndices = new Set();

  for (const [key, indices] of seen.entries()) {
    if (indices.length < 2) continue;
    duplicates.push({ key, count: indices.length });
    const toRemove = keep === 'last' ? indices.slice(0, -1) : indices.slice(1);
    toRemove.forEach(i => removeIndices.add(i));
  }

  const deduped = entries.filter((_, i) => !removeIndices.has(i));

  return { entries: deduped, duplicates };
}

/**
 * @param {Array<{key:string,duplicates:number}>} duplicates
 * @returns {string}
 */
function formatDedupe(duplicates) {
  if (!duplicates.length) return 'No duplicate keys found.';
  const lines = ['Duplicate keys removed:'];
  for (const { key, count } of duplicates) {
    lines.push(`  ${key} (${count} occurrences)`);
  }
  return lines.join('\n');
}

module.exports = { dedupe, formatDedupe };
