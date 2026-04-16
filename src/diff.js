/**
 * Compute the diff between two parsed env maps
 */

/**
 * @typedef {'added'|'removed'|'changed'} ChangeType
 * @typedef {{ key: string, type: ChangeType, oldValue?: string, newValue?: string }} Change
 */

/**
 * @param {Record<string, string>} base
 * @param {Record<string, string>} target
 * @returns {Change[]}
 */
function diff(base, target) {
  const changes = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (!inBase && inTarget) {
      changes.push({ key, type: 'added', newValue: target[key] });
    } else if (inBase && !inTarget) {
      changes.push({ key, type: 'removed', oldValue: base[key] });
    } else if (base[key] !== target[key]) {
      changes.push({ key, type: 'changed', oldValue: base[key], newValue: target[key] });
    }
  }

  return changes.sort((a, b) => a.key.localeCompare(b.key));
}

module.exports = { diff };
