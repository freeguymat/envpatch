/**
 * lowercase.js — convert env keys and/or values to lowercase
 */

/**
 * @param {Record<string,string>} env
 * @param {{ keys?: boolean, values?: boolean }} opts
 * @returns {{ result: Record<string,string>, changed: Array<{key:string, oldKey?:string, oldValue?:string, newKey?:string, newValue?:string}> }}
 */
export function lowercase(env, opts = {}) {
  const { keys = false, values = false } = opts;
  const result = {};
  const changed = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = keys ? key.toLowerCase() : key;
    const newValue = values ? value.toLowerCase() : value;

    result[newKey] = newValue;

    const entry = {};
    let didChange = false;

    if (keys && newKey !== key) {
      entry.key = key;
      entry.oldKey = key;
      entry.newKey = newKey;
      didChange = true;
    } else {
      entry.key = key;
    }

    if (values && newValue !== value) {
      entry.oldValue = value;
      entry.newValue = newValue;
      didChange = true;
    }

    if (didChange) changed.push(entry);
  }

  return { result, changed };
}

/**
 * @param {Array<{key:string, oldKey?:string, oldValue?:string, newKey?:string, newValue?:string}>} changed
 * @returns {string}
 */
export function formatLowercase(changed) {
  if (changed.length === 0) return 'No changes.';

  const lines = changed.map((entry) => {
    const parts = [];
    if (entry.oldKey && entry.newKey) {
      parts.push(`key: ${entry.oldKey} → ${entry.newKey}`);
    }
    if (entry.oldValue !== undefined && entry.newValue !== undefined) {
      parts.push(`value: "${entry.oldValue}" → "${entry.newValue}"`);
    }
    return `  ${entry.key ?? entry.oldKey}: ${parts.join(', ')}`;
  });

  return `Lowercased ${changed.length} entr${changed.length === 1 ? 'y' : 'ies'}:\n${lines.join('\n')}`;
}
