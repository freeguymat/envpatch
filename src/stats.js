// stats.js — summarize an env file

/**
 * @param {Record<string,string>} env
 * @returns {object}
 */
function stats(env) {
  const keys = Object.keys(env);
  const total = keys.length;
  const empty = keys.filter(k => env[k] === '').length;
  const numeric = keys.filter(k => env[k] !== '' && !isNaN(Number(env[k]))).length;
  const urls = keys.filter(k => /^https?:\/\//i.test(env[k])).length;
  const secrets = keys.filter(k => /secret|password|token|key|pwd/i.test(k)).length;
  const longest = keys.reduce((max, k) => Math.max(max, env[k].length), 0);
  const prefixes = {};
  for (const k of keys) {
    const parts = k.split('_');
    if (parts.length > 1) {
      const p = parts[0];
      prefixes[p] = (prefixes[p] || 0) + 1;
    }
  }
  return { total, empty, numeric, urls, secrets, longest, prefixes };
}

/**
 * @param {object} s
 * @returns {string}
 */
function formatStats(s) {
  const lines = [
    `Total keys   : ${s.total}`,
    `Empty values : ${s.empty}`,
    `Numeric      : ${s.numeric}`,
    `URLs         : ${s.urls}`,
    `Secrets      : ${s.secrets}`,
    `Longest value: ${s.longest} chars`,
  ];
  const topPrefixes = Object.entries(s.prefixes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topPrefixes.length) {
    lines.push('Top prefixes :');
    for (const [p, c] of topPrefixes) lines.push(`  ${p}_* (${c})`);
  }
  return lines.join('\n');
}

module.exports = { stats, formatStats };
