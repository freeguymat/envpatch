// protect.js — mark keys as read-only and enforce them

/**
 * @param {Record<string,string>} env
 * @param {string[]} keys
 * @returns {{ protected: string[], env: Record<string,string> }}
 */
function protect(env, keys) {
  const missing = keys.filter(k => !(k in env));
  if (missing.length) {
    throw new Error(`Cannot protect missing keys: ${missing.join(', ')}`);
  }
  return {
    protected: keys,
    env: { ...env }
  };
}

/**
 * Check whether any protected keys differ between base and updated env.
 * @param {Record<string,string>} base
 * @param {Record<string,string>} updated
 * @param {string[]} protectedKeys
 * @returns {{ violations: Array<{key:string, was:string, now:string}> }}
 */
function checkProtected(base, updated, protectedKeys) {
  const violations = [];
  for (const key of protectedKeys) {
    const was = base[key];
    const now = updated[key];
    if (was !== now) {
      violations.push({ key, was: was ?? '(unset)', now: now ?? '(unset)' });
    }
  }
  return { violations };
}

/**
 * @param {{ violations: Array<{key:string, was:string, now:string}> }} result
 * @returns {string}
 */
function formatProtect(result) {
  if (result.violations.length === 0) {
    return 'No protected keys were modified.';
  }
  const lines = ['Protected key violations:'];
  for (const v of result.violations) {
    lines.push(`  ${v.key}: "${v.was}" → "${v.now}"`);
  }
  return lines.join('\n');
}

module.exports = { protect, checkProtected, formatProtect };
