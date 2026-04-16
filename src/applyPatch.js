/**
 * High-level helper: read a .env file and a patch file (JSON diff),
 * apply the patch, and return the serialized result.
 */

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { patch } = require('./patch');

/**
 * @param {string} envPath - path to the .env file to patch
 * @param {string} patchPath - path to the JSON patch file
 * @param {object} [options]
 * @param {boolean} [options.dryRun=false] - if true, return result without writing
 * @returns {{ output: string, changed: boolean }}
 */
function applyPatch(envPath, patchPath, options = {}) {
  const { dryRun = false } = options;

  if (!fs.existsSync(envPath)) {
    throw new Error(`Env file not found: ${envPath}`);
  }
  if (!fs.existsSync(patchPath)) {
    throw new Error(`Patch file not found: ${patchPath}`);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const patchContent = fs.readFileSync(patchPath, 'utf8');

  let diffEntries;
  try {
    diffEntries = JSON.parse(patchContent);
  } catch (e) {
    throw new Error(`Invalid patch file JSON: ${e.message}`);
  }

  if (!Array.isArray(diffEntries)) {
    throw new Error('Patch file must contain a JSON array of diff entries');
  }

  const base = parse(envContent);
  const patched = patch(base, diffEntries);
  const output = serialize(patched);
  const changed = output !== envContent;

  if (!dryRun && changed) {
    fs.writeFileSync(envPath, output, 'utf8');
  }

  return { output, changed };
}

module.exports = { applyPatch };
