// Clone an env file with optional key filtering/transformation

/**
 * Clone env vars from source, optionally picking or omitting keys
 * @param {Record<string,string>} env
 * @param {object} opts
 * @param {string[]} [opts.pick]   - only include these keys
 * @param {string[]} [opts.omit]   - exclude these keys
 * @param {string}   [opts.prefix] - add prefix to all keys
 * @param {string}   [opts.strip]  - strip prefix from keys
 * @returns {Record<string,string>}
 */
function cloneEnv(env, opts = {}) {
  const { pick, omit, prefix, strip } = opts;
  let keys = Object.keys(env);

  if (pick && pick.length) {
    keys = keys.filter(k => pick.includes(k));
  }
  if (omit && omit.length) {
    keys = keys.filter(k => !omit.includes(k));
  }

  const result = {};
  for (const k of keys) {
    let newKey = k;
    if (strip && newKey.startsWith(strip)) {
      newKey = newKey.slice(strip.length);
    }
    if (prefix) {
      newKey = prefix + newKey;
    }
    result[newKey] = env[k];
  }
  return result;
}

/**
 * Format a summary of what changed during clone
 */
function formatCloneSummary(original, cloned) {
  const origKeys = Object.keys(original);
  const clonedKeys = Object.keys(cloned);
  const kept = origKeys.length;
  const out = clonedKeys.length;
  const dropped = kept - origKeys.filter(k => {
    // find if this original key ended up anywhere
    return clonedKeys.some(ck => cloned[ck] === original[k]);
  }).length;
  return [
    `Original keys : ${origKeys.length}`,
    `Cloned keys   : ${clonedKeys.length}`,
    `Dropped       : ${origKeys.length - out}`,
  ].join('\n');
}

module.exports = { cloneEnv, formatCloneSummary };
