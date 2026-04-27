// rotate.js — key rotation: rename keys and update values in bulk

/**
 * Rotate (rename + optionally remap values for) keys in an env object.
 * @param {Record<string,string>} env
 * @param {Array<{from:string, to:string, value?:string}>} rotations
 * @returns {{ result: Record<string,string>, applied: Array, skipped: Array }}
 */
function rotate(env, rotations) {
  const result = { ...env };
  const applied = [];
  const skipped = [];

  for (const { from, to, value } of rotations) {
    if (!(from in env)) {
      skipped.push({ from, to, reason: 'key not found' });
      continue;
    }
    if (to in env && to !== from) {
      skipped.push({ from, to, reason: 'target key already exists' });
      continue;
    }

    const oldValue = result[from];
    const newValue = value !== undefined ? value : oldValue;

    delete result[from];
    result[to] = newValue;

    applied.push({ from, to, oldValue, newValue });
  }

  return { result, applied, skipped };
}

/**
 * Format rotation summary for CLI output.
 */
function formatRotate({ applied, skipped }) {
  const lines = [];

  if (applied.length === 0 && skipped.length === 0) {
    return 'No rotations to apply.';
  }

  for (const { from, to, oldValue, newValue } of applied) {
    const valueNote = oldValue !== newValue ? ` (value updated)` : '';
    lines.push(`✔ ${from} → ${to}${valueNote}`);
  }

  for (const { from, to, reason } of skipped) {
    lines.push(`✖ ${from} → ${to}: ${reason}`);
  }

  return lines.join('\n');
}

module.exports = { rotate, formatRotate };
