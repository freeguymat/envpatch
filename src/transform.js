// transform.js — apply key/value transformations to env entries

/**
 * Apply a named transformation to all values (or keys) in an env object.
 * @param {Record<string,string>} env
 * @param {object} opts
 * @param {'uppercase'|'lowercase'|'trim'|'snake'|'camel'} opts.keys  - transform key names
 * @param {'uppercase'|'lowercase'|'trim'} opts.values               - transform values
 * @returns {{ result: Record<string,string>, changes: TransformChange[] }}
 */
function transform(env, opts = {}) {
  const changes = [];
  const result = {};

  for (const [k, v] of Object.entries(env)) {
    let newKey = k;
    let newVal = v;

    if (opts.keys) {
      newKey = transformKey(k, opts.keys);
    }
    if (opts.values) {
      newVal = transformValue(v, opts.values);
    }

    if (newKey !== k || newVal !== v) {
      changes.push({ oldKey: k, newKey, oldVal: v, newVal });
    }

    result[newKey] = newVal;
  }

  return { result, changes };
}

function transformKey(key, mode) {
  switch (mode) {
    case 'uppercase': return key.toUpperCase();
    case 'lowercase': return key.toLowerCase();
    case 'snake':     return key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    case 'camel':     return key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    default:          return key;
  }
}

function transformValue(val, mode) {
  switch (mode) {
    case 'uppercase': return val.toUpperCase();
    case 'lowercase': return val.toLowerCase();
    case 'trim':      return val.trim();
    default:          return val;
  }
}

function formatTransform(changes) {
  if (!changes.length) return 'No transformations applied.';
  const lines = changes.map(c => {
    const keyPart = c.oldKey !== c.newKey ? `${c.oldKey} → ${c.newKey}` : c.newKey;
    const valPart = c.oldVal !== c.newVal ? ` (value: "${c.oldVal}" → "${c.newVal}")` : '';
    return `  ${keyPart}${valPart}`;
  });
  return `Transformed ${changes.length} entr${changes.length === 1 ? 'y' : 'ies'}:\n${lines.join('\n')}`;
}

module.exports = { transform, transformKey, transformValue, formatTransform };
