// compare two env files and produce a human-readable summary
const { parse } = require('./parser');
const { diff } = require('./diff');

/**
 * Compare two env strings and return a structured summary.
 * @param {string} baseContent
 * @param {string} targetContent
 * @returns {{ added: string[], removed: string[], changed: string[], unchanged: string[] }}
 */
function compare(baseContent, targetContent) {
  const base = parse(baseContent);
  const target = parse(targetContent);
  const changes = diff(base, target);

  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const change = changes.find(c => c.key === key);
    if (!change) {
      unchanged.push(key);
    } else if (change.type === 'add') {
      added.push(key);
    } else if (change.type === 'remove') {
      removed.push(key);
    } else if (change.type === 'change') {
      changed.push(key);
    }
  }

  return { added, removed, changed, unchanged };
}

/**
 * Format a compare summary as a readable string.
 * @param {{ added: string[], removed: string[], changed: string[], unchanged: string[] }} summary
 * @returns {string}
 */
function formatCompare(summary) {
  const lines = [];
  for (const key of summary.added)   lines.push(`+ ${key}`);
  for (const key of summary.removed)`);
  for (const key of summary.changed) lines.push(`~ ${key}`);
  for (const key of summary.unchanged) lines.push(`  ${key}`);
  return lines.join('\n');
}

module.exports = { compare, formatCompare };
