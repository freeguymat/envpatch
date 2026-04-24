// promote.js — copy env vars from one environment file to another, with conflict handling

/**
 * Promote keys from source env to target env.
 * @param {Object} source - parsed source env
 * @param {Object} target - parsed target env
 * @param {string[]} [keys] - specific keys to promote; if empty, promote all
 * @param {Object} [opts]
 * @param {boolean} [opts.overwrite=false] - overwrite existing keys in target
 * @returns {{ result: Object, promoted: string[], skipped: string[], added: string[] }}
 */
export function promote(source, target, keys = [], opts = {}) {
  const { overwrite = false } = opts;
  const candidates = keys.length > 0 ? keys : Object.keys(source);

  const promoted = [];
  const skipped = [];
  const added = [];
  const result = { ...target };

  for (const key of candidates) {
    if (!(key in source)) continue;

    if (key in target) {
      if (overwrite) {
        result[key] = source[key];
        promoted.push(key);
      } else {
        skipped.push(key);
      }
    } else {
      result[key] = source[key];
      added.push(key);
      promoted.push(key);
    }
  }

  return { result, promoted, skipped, added };
}

/**
 * Format a human-readable summary of a promote operation.
 */
export function formatPromote({ promoted, skipped, added }) {
  const lines = [];

  for (const key of added) {
    lines.push(`+ ${key}  (new)`);
  }

  const overwritten = promoted.filter(k => !added.includes(k));
  for (const key of overwritten) {
    lines.push(`~ ${key}  (overwritten)`);
  }

  for (const key of skipped) {
    lines.push(`= ${key}  (skipped, already exists)`);
  }

  if (lines.length === 0) return 'Nothing to promote.';

  const summary = `Promoted ${promoted.length} key(s), skipped ${skipped.length}.`;
  return [...lines, '', summary].join('\n');
}
