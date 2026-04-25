// required.js — check that required keys are present in an env object

/**
 * Check which required keys are missing from env.
 * @param {Record<string,string>} env
 * @param {string[]} requiredKeys
 * @returns {{ missing: string[], present: string[] }}
 */
function checkRequired(env, requiredKeys) {
  const missing = [];
  const present = [];

  for (const key of requiredKeys) {
    if (env[key] === undefined || env[key] === '') {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return { missing, present };
}

/**
 * Format the result of checkRequired into a human-readable string.
 * @param {{ missing: string[], present: string[] }} result
 * @returns {string}
 */
function formatRequired(result) {
  const lines = [];

  if (result.present.length > 0) {
    lines.push('Present:');
    for (const key of result.present) {
      lines.push(`  ✓ ${key}`);
    }
  }

  if (result.missing.length > 0) {
    lines.push('Missing:');
    for (const key of result.missing) {
      lines.push(`  ✗ ${key}`);
    }
  }

  if (result.missing.length === 0) {
    lines.push('All required keys are present.');
  } else {
    lines.push(`${result.missing.length} required key(s) missing.`);
  }

  return lines.join('\n');
}

module.exports = { checkRequired, formatRequired };
