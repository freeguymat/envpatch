// Audit log: track changes made during patch/merge operations

const CHANGE_TYPES = ['added', 'removed', 'changed', 'redacted'];

/**
 * Creates an audit entry for a single key change.
 * @param {string} key
 * @param {'added'|'removed'|'changed'|'redacted'} type
 * @param {object} [meta]
 */
function createEntry(key, type, meta = {}) {
  if (!CHANGE_TYPES.includes(type)) {
    throw new Error(`Unknown audit change type: ${type}`);
  }
  return {
    key,
    type,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

/**
 * Builds a full audit log from a diff result.
 * @param {Array} diffResult - output from diff()
 * @param {object} [options]
 * @param {boolean} [options.redactSensitive] - mark sensitive keys
 * @returns {Array}
 */
function buildAuditLog(diffResult, options = {}) {
  const { redactSensitive = false } = options;
  return diffResult.map(({ key, type, from, to }) => {
    const meta = {};
    if (type === 'changed') {
      meta.from = redactSensitive ? '[redacted]' : from;
      meta.to = redactSensitive ? '[redacted]' : to;
    } else if (type === 'added') {
      meta.to = redactSensitive ? '[redacted]' : to;
    } else if (type === 'removed') {
      meta.from = redactSensitive ? '[redacted]' : from;
    }
    return createEntry(key, type, meta);
  });
}

/**
 * Formats an audit log as a human-readable string.
 * @param {Array} log
 * @returns {string}
 */
function formatAuditLog(log) {
  if (log.length === 0) return 'No changes.';
  return log
    .map(({ timestamp, type, key, from, to }) => {
      const time = timestamp.replace('T', ' ').replace('Z', '');
      if (type === 'added') return `[${time}] ADDED    ${key}=${to}`;
      if (type === 'removed') return `[${time}] REMOVED  ${key} (was ${from})`;
      if (type === 'changed') return `[${time}] CHANGED  ${key}: ${from} -> ${to}`;
      if (type === 'redacted') return `[${time}] REDACTED ${key}`;
      return `[${time}] ${type.toUpperCase()} ${key}`;
    })
    .join('\n');
}

module.exports = { createEntry, buildAuditLog, formatAuditLog };
