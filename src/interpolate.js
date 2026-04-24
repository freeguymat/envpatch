// Interpolate variable references within .env values
// e.g. BASE_URL=https://${HOST}:${PORT} gets resolved

/**
 * Resolve variable references in env values.
 * Supports ${VAR} and $VAR syntax.
 * @param {Record<string,string>} env
 * @param {object} opts
 * @param {boolean} [opts.strict=false] throw on missing refs
 * @returns {Record<string,string>}
 */
export function interpolate(env, { strict = false } = {}) {
  const resolved = { ...env };

  for (const key of Object.keys(resolved)) {
    resolved[key] = resolveValue(resolved[key], resolved, strict, key);
  }

  return resolved;
}

function resolveValue(value, env, strict, sourceKey, seen = new Set()) {
  if (seen.has(sourceKey)) {
    throw new Error(`Circular reference detected for key: ${sourceKey}`);
  }
  seen.add(sourceKey);

  return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (match, braced, bare) => {
    const ref = braced || bare;
    if (ref in env) {
      return resolveValue(env[ref], env, strict, ref, new Set(seen));
    }
    if (strict) {
      throw new Error(`Undefined variable reference: ${ref} (in ${sourceKey})`);
    }
    return match;
  });
}

/**
 * Find all variable references used in an env object.
 * @param {Record<string,string>} env
 * @returns {Array<{key: string, refs: string[]}>}
 */
export function findRefs(env) {
  const result = [];
  for (const [key, value] of Object.entries(env)) {
    const refs = [];
    const pattern = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi;
    let m;
    while ((m = pattern.exec(value)) !== null) {
      refs.push(m[1] || m[2]);
    }
    if (refs.length > 0) {
      result.push({ key, refs });
    }
  }
  return result;
}
