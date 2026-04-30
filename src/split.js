/**
 * split.js — split a .env file into multiple files by prefix or pattern
 */

/**
 * Split an env record into groups by prefix.
 * Returns { [prefix]: { [key]: value } }
 */
function split(env, prefixes) {
  const groups = {};
  const rest = {};

  for (const [key, value] of Object.entries(env)) {
    let matched = false;
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        if (!groups[prefix]) groups[prefix] = {};
        groups[prefix][key] = value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      rest[key] = value;
    }
  }

  if (Object.keys(rest).length > 0) {
    groups['__rest__'] = rest;
  }

  return groups;
}

/**
 * Format a split summary for display.
 */
function formatSplit(groups) {
  const lines = [];
  for (const [group, keys] of Object.entries(groups)) {
    const count = Object.keys(keys).length;
    const label = group === '__rest__' ? '(unmatched)' : group;
    lines.push(`  ${label}: ${count} key${count !== 1 ? 's' : ''}`);
    for (const key of Object.keys(keys)) {
      lines.push(`    - ${key}`);
    }
  }
  return lines.join('\n');
}

module.exports = { split, formatSplit };
