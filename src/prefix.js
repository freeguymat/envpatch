// prefix.js — add, remove, or replace key prefixes in .env files

/**
 * Add a prefix to all keys (or keys matching a filter)
 * @param {Record<string,string>} env
 * @param {string} prefix
 * @param {string[]} [only] - if provided, only these keys get prefixed
 * @returns {Record<string,string>}
 */
function addPrefix(env, prefix, only) {
  const result = {};
  for (const [key, val] of Object.entries(env)) {
    if (!only || only.includes(key)) {
      result[`${prefix}${key}`] = val;
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Remove a prefix from all matching keys
 * @param {Record<string,string>} env
 * @param {string} prefix
 * @returns {Record<string,string>}
 */
function removePrefix(env, prefix) {
  const result = {};
  for (const [key, val] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = val;
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Replace one prefix with another on all matching keys
 * @param {Record<string,string>} env
 * @param {string} from
 * @param {string} to
 * @returns {Record<string,string>}
 */
function replacePrefix(env, from, to) {
  const result = {};
  for (const [key, val] of Object.entries(env)) {
    if (key.startsWith(from)) {
      result[`${to}${key.slice(from.length)}`] = val;
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Format a summary of prefix changes
 * @param {Record<string,string>} before
 * @param {Record<string,string>} after
 * @returns {string}
 */
function formatPrefix(before, after) {
  const lines = [];
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);
  const added = afterKeys.filter(k => !beforeKeys.includes(k));
  const removed = beforeKeys.filter(k => !afterKeys.includes(k));
  for (const k of removed) lines.push(`- ${k}`);
  for (const k of added) lines.push(`+ ${k}`);
  return lines.length ? lines.join('\n') : '(no changes)';
}

module.exports = { addPrefix, removePrefix, replacePrefix, formatPrefix };
