// mask.js — mask/unmask env values for safe display

const MASK = '********';

/**
 * Mask values in a parsed env object.
 * Keys matching the sensitive pattern are masked.
 * @param {Record<string, string>} env
 * @param {string[]} [extraKeys] additional keys to mask
 * @returns {Record<string, string>}
 */
function maskEnv(env, extraKeys = []) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = shouldMask(key, extraKeys) ? MASK : value;
  }
  return result;
}

/**
 * Mask a single value if the key is sensitive.
 * @param {string} key
 * @param {string} value
 * @param {string[]} [extraKeys]
 * @returns {string}
 */
function maskValue(key, value, extraKeys = []) {
  return shouldMask(key, extraKeys) ? MASK : value;
}

/**
 * Format a masked env for display.
 * @param {Record<string, string>} masked
 * @returns {string}
 */
function formatMasked(masked) {
  return Object.entries(masked)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

const SENSITIVE_RE = /secret|password|passwd|token|apikey|api_key|private|auth|credential|cert|seed|salt/i;

function shouldMask(key, extraKeys = []) {
  if (extraKeys.map(k => k.toLowerCase()).includes(key.toLowerCase())) return true;
  return SENSITIVE_RE.test(key);
}

module.exports = { maskEnv, maskValue, formatMasked, shouldMask, MASK };
