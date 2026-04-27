// typecheck.js — validate env values against expected types

const TYPE_PATTERNS = {
  int: /^-?\d+$/,
  float: /^-?\d+(\.\d+)?$/,
  bool: /^(true|false|1|0|yes|no)$/i,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  port: (v) => Number.isInteger(+v) && +v > 0 && +v <= 65535,
  string: () => true,
};

function checkType(value, type) {
  if (!(type in TYPE_PATTERNS)) {
    return { ok: false, reason: `unknown type '${type}'` };
  }
  const rule = TYPE_PATTERNS[type];
  const ok = typeof rule === 'function' ? rule(value) : rule.test(value);
  return ok ? { ok: true } : { ok: false, reason: `expected type '${type}', got '${value}'` };
}

/**
 * typecheck(env, schema) — schema is { KEY: 'type' }
 * Returns array of { key, value, type, reason } for failures.
 */
function typecheck(env, schema) {
  const errors = [];
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in env)) continue; // missing keys handled by checkRequired
    const result = checkType(env[key], type);
    if (!result.ok) {
      errors.push({ key, value: env[key], type, reason: result.reason });
    }
  }
  return errors;
}

function formatTypecheck(errors) {
  if (errors.length === 0) return 'All type checks passed.';
  const lines = ['Type check failures:'];
  for (const e of errors) {
    lines.push(`  ${e.key}: ${e.reason}`);
  }
  return lines.join('\n');
}

module.exports = { typecheck, formatTypecheck, checkType };
