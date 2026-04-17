// import.js — import env vars from JSON, YAML, or .env format into a normalized object

const { parse } = require('./parser');
const { fromJSON, fromYAML } = require('./convert');

/**
 * Detect format from file extension or content hint
 */
function detectFormat(filename, content) {
  if (filename) {
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml';
    if (filename.endsWith('.env') || filename.startsWith('.env')) return 'env';
  }
  // sniff content
  const trimmed = content.trimStart();
  if (trimmed.startsWith('{')) return 'json';
  if (trimmed.startsWith('---') || /^\w+:\s/m.test(trimmed)) return 'yaml';
  return 'env';
}

/**
 * Import env vars from a string with optional filename hint.
 * Returns a plain key→value object.
 */
function importEnv(content, filename = '') {
  const format = detectFormat(filename, content);
  switch (format) {
    case 'json':
      return fromJSON(content);
    case 'yaml':
      return fromYAML(content);
    case 'env':
    default:
      return parse(content);
  }
}

/**
 * Merge imported env into a base env object.
 * By default existing keys are NOT overwritten unless overwrite=true.
 */
function importMerge(base, incoming, { overwrite = false } = {}) {
  const result = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (overwrite || !(key in result)) {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { importEnv, importMerge, detectFormat };
