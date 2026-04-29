/**
 * uppercase.js — transform env keys or values to uppercase/lowercase
 */

/**
 * @param {Record<string,string>} env
 * @param {'keys'|'values'|'both'} target
 * @param {'upper'|'lower'} mode
 * @returns {{ result: Record<string,string>, changes: Array<{key:string, from:string, to:string, target:string}> }}
 */
export function uppercase(env, target = 'values', mode = 'upper') {
  const result = {};
  const changes = [];
  const transform = mode === 'upper' ? (s) => s.toUpperCase() : (s) => s.toLowerCase();

  for (const [key, value] of Object.entries(env)) {
    let newKey = key;
    let newValue = value;

    if (target === 'keys' || target === 'both') {
      newKey = transform(key);
      if (newKey !== key) {
        changes.push({ key, from: key, to: newKey, target: 'key' });
      }
    }

    if (target === 'values' || target === 'both') {
      newValue = transform(value);
      if (newValue !== value) {
        changes.push({ key, from: value, to: newValue, target: 'value' });
      }
    }

    // last write wins if key collision after transform
    result[newKey] = newValue;
  }

  return { result, changes };
}

/**
 * @param {Array<{key:string, from:string, to:string, target:string}>} changes
 * @returns {string}
 */
export function formatUppercase(changes) {
  if (changes.length === 0) return 'No changes.';
  const lines = changes.map((c) => {
    const label = c.target === 'key' ? 'key' : 'value';
    return `  ${c.key}  ${label}: "${c.from}" → "${c.to}"`;
  });
  return `${changes.length} change(s):\n${lines.join('\n')}`;
}
