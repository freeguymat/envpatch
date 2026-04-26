/**
 * scope.js — filter and manage env vars by environment scope
 *
 * Scopes let you tag keys with environment prefixes like APP_DEV_*, APP_PROD_*
 * and extract or promote them into a flat env for a given target environment.
 */

/**
 * Detect the scope prefix used in a set of keys.
 * Returns an array of unique scope names found (e.g. ['dev', 'prod', 'staging']).
 *
 * @param {Record<string, string>} env
 * @param {string} [delimiter='_'] - separator between scope and key name
 * @returns {string[]}
 */
function detectScopes(env, delimiter = '_') {
  const scopes = new Set();
  for (const key of Object.keys(env)) {
    const parts = key.split(delimiter);
    if (parts.length >= 2) {
      scopes.add(parts[0].toLowerCase());
    }
  }
  return Array.from(scopes).sort();
}

/**
 * Extract all keys belonging to a given scope, stripping the scope prefix.
 *
 * Example: scopeExtract({ DEV_PORT: '3000', PROD_PORT: '8080' }, 'dev')
 *   => { PORT: '3000' }
 *
 * @param {Record<string, string>} env
 * @param {string} scope
 * @param {string} [delimiter='_']
 * @returns {Record<string, string>}
 */
function scopeExtract(env, scope, delimiter = '_') {
  const prefix = scope.toUpperCase() + delimiter;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const stripped = key.slice(prefix.length);
      if (stripped.length > 0) {
        result[stripped] = value;
      }
    }
  }
  return result;
}

/**
 * Inject a flat env into a scoped env by adding the scope prefix to all keys.
 *
 * Example: scopeInject({ PORT: '3000' }, 'dev') => { DEV_PORT: '3000' }
 *
 * @param {Record<string, string>} env
 * @param {string} scope
 * @param {string} [delimiter='_']
 * @returns {Record<string, string>}
 */
function scopeInject(env, scope, delimiter = '_') {
  const prefix = scope.toUpperCase() + delimiter;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[prefix + key] = value;
  }
  return result;
}

/**
 * Remove all keys belonging to a given scope from an env object.
 *
 * @param {Record<string, string>} env
 * @param {string} scope
 * @param {string} [delimiter='_']
 * @returns {Record<string, string>}
 */
function scopeRemove(env, scope, delimiter = '_') {
  const prefix = scope.toUpperCase() + delimiter;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(prefix)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Format a scope report showing which keys exist per scope.
 *
 * @param {Record<string, string>} env
 * @param {string} [delimiter='_']
 * @returns {string}
 */
function formatScope(env, delimiter = '_') {
  const scopes = detectScopes(env, delimiter);
  if (scopes.length === 0) return 'No scoped keys found.\n';

  const lines = [];
  for (const scope of scopes) {
    const extracted = scopeExtract(env, scope, delimiter);
    const keys = Object.keys(extracted);
    lines.push(`[${scope}] (${keys.length} key${keys.length !== 1 ? 's' : ''})`);
    for (const key of keys) {
      lines.push(`  ${scope.toUpperCase()}${delimiter}${key}`);
    }
  }
  return lines.join('\n') + '\n';
}

module.exports = { detectScopes, scopeExtract, scopeInject, scopeRemove, formatScope };
