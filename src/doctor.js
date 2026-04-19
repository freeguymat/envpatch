// doctor.js — checks .env file for common issues and environment health

const REQUIRED_NODE_ENV = ['development', 'production', 'test', 'staging'];

/**
 * @typedef {{ level: 'error'|'warn'|'info', message: string }} DoctorIssue
 */

/**
 * Run health checks on a parsed env object.
 * @param {Record<string,string>} env
 * @param {object} [opts]
 * @param {string[]} [opts.requiredKeys]
 * @param {boolean} [opts.checkNodeEnv]
 * @returns {{ issues: DoctorIssue[], healthy: boolean }}
 */
export function doctor(env, opts = {}) {
  const { requiredKeys = [], checkNodeEnv = true } = opts;
  const issues = [];

  // Check required keys
  for (const key of requiredKeys) {
    if (!(key in env)) {
      issues.push({ level: 'error', message: `Missing required key: ${key}` });
    } else if (env[key].trim() === '') {
      issues.push({ level: 'warn', message: `Required key is empty: ${key}` });
    }
  }

  // Check NODE_ENV validity
  if (checkNodeEnv && 'NODE_ENV' in env) {
    if (!REQUIRED_NODE_ENV.includes(env.NODE_ENV)) {
      issues.push({ level: 'warn', message: `Unusual NODE_ENV value: "${env.NODE_ENV}"` });
    }
  }

  // Check for keys with whitespace in values
  for (const [key, value] of Object.entries(env)) {
    if (value !== value.trim()) {
      issues.push({ level: 'warn', message: `Value for ${key} has leading/trailing whitespace` });
    }
  }

  // Check for duplicate-looking keys (e.g. DB_URL and DB_URL_)
  const keys = Object.keys(env);
  for (const key of keys) {
    if (keys.includes(key + '_')) {
      issues.push({ level: 'info', message: `Possible duplicate: ${key} and ${key}_` });
    }
  }

  return { issues, healthy: issues.filter(i => i.level === 'error').length === 0 };
}

/**
 * Format doctor results for terminal output.
 * @param {{ issues: DoctorIssue[], healthy: boolean }} result
 * @returns {string}
 */
export function formatDoctor(result) {
  if (result.issues.length === 0) return '✅ No issues found.';
  const icons = { error: '❌', warn: '⚠️ ', info: 'ℹ️ ' };
  const lines = result.issues.map(i => `${icons[i.level]} [${i.level}] ${i.message}`);
  lines.push('');
  lines.push(result.healthy ? '✅ Healthy (warnings only)' : '❌ Unhealthy (errors found)');
  return lines.join('\n');
}
