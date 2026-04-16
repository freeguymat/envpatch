/**
 * Apply a diff to a parsed env object, producing a new env object.
 */

/**
 * @param {Record<string, string>} base - parsed env key/value pairs
 * @param {Array<{key: string, type: 'add'|'remove'|'change', oldValue?: string, newValue?: string}>} diffEntries
 * @returns {Record<string, string>} patched env
 */
function patch(base, diffEntries) {
  const result = { ...base };

  for (const entry of diffEntries) {
    switch (entry.type) {
      case 'add':
        if (entry.key in result) {
          throw new Error(`Cannot add key "${entry.key}": already exists`);
        }
        result[entry.key] = entry.newValue;
        break;

      case 'remove':
        if (!(entry.key in result)) {
          throw new Error(`Cannot remove key "${entry.key}": does not exist`);
        }
        if (result[entry.key] !== entry.oldValue) {
          throw new Error(
            `Cannot remove key "${entry.key}": current value does not match expected`
          );
        }
        delete result[entry.key];
        break;

      case 'change':
        if (!(entry.key in result)) {
          throw new Error(`Cannot change key "${entry.key}": does not exist`);
        }
        if (result[entry.key] !== entry.oldValue) {
          throw new Error(
            `Cannot change key "${entry.key}": current value does not match expected`
          );
        }
        result[entry.key] = entry.newValue;
        break;

      default:
        throw new Error(`Unknown diff entry type: "${entry.type}"`);
    }
  }

  return result;
}

module.exports = { patch };
