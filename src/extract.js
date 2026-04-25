// extract.js — extract a subset of keys from an env object

/**
 * Extract specific keys from an env object.
 * @param {Record<string,string>} env
 * @param {string[]} keys
 * @returns {{ extracted: Record<string,string>, missing: string[] }}
 */
function extract(env, keys) {
  const extracted = {};
  const missing = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      extracted[key] = env[key];
    } else {
      missing.push(key);
    }
  }

  return { extracted, missing };
}

/**
 * Format extraction result as a human-readable summary.
 * @param {{ extracted: Record<string,string>, missing: string[] }} result
 * @returns {string}
 */
function formatExtract(result) {
  const lines = [];

  const extractedKeys = Object.keys(result.extracted);
  if (extractedKeys.length > 0) {
    lines.push(`Extracted (${extractedKeys.length}):`);
    for (const key of extractedKeys) {
      lines.push(`  ${key}=${result.extracted[key]}`);
    }
  }

  if (result.missing.length > 0) {
    lines.push(`Missing (${result.missing.length}):`);
    for (const key of result.missing) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

module.exports = { extract, formatExtract };
