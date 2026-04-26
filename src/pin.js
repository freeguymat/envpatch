/**
 * pin.js — pin/freeze specific env var values to prevent accidental changes
 *
 * Pinned keys are stored in a lockfile (.env.lock) alongside the env file.
 * When checking, pinned values are compared against the current env.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load the lockfile for a given env file path.
 * Returns an object mapping key -> pinned value.
 */
function loadLock(envPath) {
  const lockPath = envPath + '.lock';
  if (!fs.existsSync(lockPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Save the lockfile for a given env file path.
 */
function saveLock(envPath, pins) {
  const lockPath = envPath + '.lock';
  fs.writeFileSync(lockPath, JSON.stringify(pins, null, 2) + '\n', 'utf8');
}

/**
 * Pin specific keys from the given env object.
 * Merges with any existing pins.
 *
 * @param {string} envPath - path to the .env file
 * @param {Object} env - parsed env object
 * @param {string[]} keys - keys to pin
 * @returns {Object} updated pins
 */
function pin(envPath, env, keys) {
  const pins = loadLock(envPath);
  for (const key of keys) {
    if (!(key in env)) throw new Error(`Key not found in env: ${key}`);
    pins[key] = env[key];
  }
  saveLock(envPath, pins);
  return pins;
}

/**
 * Unpin specific keys, removing them from the lockfile.
 *
 * @param {string} envPath - path to the .env file
 * @param {string[]} keys - keys to unpin
 * @returns {Object} updated pins
 */
function unpin(envPath, keys) {
  const pins = loadLock(envPath);
  for (const key of keys) {
    delete pins[key];
  }
  saveLock(envPath, pins);
  return pins;
}

/**
 * Check the current env against pinned values.
 * Returns an array of violation objects { key, pinned, current }.
 *
 * @param {string} envPath - path to the .env file
 * @param {Object} env - parsed env object
 * @returns {{ key: string, pinned: string, current: string|undefined }[]}
 */
function checkPins(envPath, env) {
  const pins = loadLock(envPath);
  const violations = [];
  for (const [key, pinned] of Object.entries(pins)) {
    const current = env[key];
    if (current !== pinned) {
      violations.push({ key, pinned, current });
    }
  }
  return violations;
}

/**
 * Format violations for human-readable output.
 *
 * @param {{ key: string, pinned: string, current: string|undefined }[]} violations
 * @returns {string}
 */
function formatPinReport(violations) {
  if (violations.length === 0) return 'All pinned values match. ✓';
  const lines = ['Pinned value violations:'];
  for (const { key, pinned, current } of violations) {
    const cur = current === undefined ? '(missing)' : JSON.stringify(current);
    lines.push(`  ${key}: pinned=${JSON.stringify(pinned)}, current=${cur}`);
  }
  return lines.join('\n');
}

module.exports = { pin, unpin, checkPins, loadLock, saveLock, formatPinReport };
