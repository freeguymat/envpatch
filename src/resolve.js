// resolve.js — resolve variable references against a base env
// e.g. DB_URL=${DB_HOST}:${DB_PORT}/mydb => resolved value

/**
 * Resolve all variable references in `env` using `base` as the source of truth.
 * Falls back to the value within `env` itself if not found in `base`.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} base
 * @returns {{ resolved: Record<string,string>, unresolved: string[] }}
 */
export function resolve(env, base = {}) {
  const source = { ...base, ...env };
  const resolved = {};
  const unresolved = [];

  for (const [key, value] of Object.entries(env)) {
    const result = resolveValue(value, source);
    resolved[key] = result.value;
    if (result.missing.length > 0) {
      unresolved.push(...result.missing.map(m => `${key} references missing $${m}`));
    }
  }

  return { resolved, unresolved };
}

/**
 * Resolve a single value string, substituting ${VAR} references.
 */
export function resolveValue(value, source) {
  const missing = [];
  const resolved = value.replace(/\$\{([^}]+)\}/g, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(source, name)) {
      return source[name];
    }
    missing.push(name);
    return `\${${name}}`;
  });
  return { value: resolved, missing };
}

/**
 * Format resolve results for CLI output.
 */
export function formatResolve(resolved, unresolved) {
  const lines = [];
  for (const [key, val] of Object.entries(resolved)) {
    lines.push(`${key}=${val}`);
  }
  if (unresolved.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const warn of unresolved) {
      lines.push(`  ! ${warn}`);
    }
  }
  return lines.join('\n');
}
