/**
 * Parse .env file content into a key-value map
 */

/**
 * @param {string} content - raw .env file content
 * @returns {Record<string, string>}
 */
function parse(content) {
  const result = {};

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // strip inline comments (only if value is not quoted)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
    } else {
      // strip surrounding quotes
      value = value.replace(/^(["'])(.*?)\1$/, '$2');
    }

    if (key) result[key] = value;
  }

  return result;
}

/**
 * Serialize a key-value map back to .env file content
 * @param {Record<string, string>} env
 * @returns {string}
 */
function serialize(env) {
  return Object.entries(env)
    .map(([k, v]) => {
      const needsQuotes = /\s|#|"/.test(v);
      const val = needsQuotes ? `"${v.replace(/"/g, '\\"')}"` : v;
      return `${k}=${val}`;
    })
    .join('\n') + '\n';
}

module.exports = { parse, serialize };
