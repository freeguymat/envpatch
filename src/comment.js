// comment.js — utilities for preserving and manipulating comments in .env files

/**
 * Extract inline and standalone comments from parsed env lines.
 * Returns a map of key -> comment string (without leading #)
 */
function extractComments(raw) {
  const comments = {};
  const lines = raw.split(/\r?\n/);
  let pendingComment = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      pendingComment = trimmed.slice(1).trim();
      continue;
    }
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
    if (match) {
      const key = match[1];
      // inline comment takes priority
      const inlineMatch = trimmed.match(/#(.+)$/);
      if (inlineMatch) {
        comments[key] = inlineMatch[1].trim();
      } else if (pendingComment !== null) {
        comments[key] = pendingComment;
      }
    }
    pendingComment = null;
  }

  return comments;
}

/**
 * Strip all comments from a raw .env string.
 */
function stripComments(raw) {
  return raw
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#'))
    .map(line => line.replace(/\s+#.*$/, ''))
    .join('\n');
}

/**
 * Inject comments into a serialized .env string from a comments map.
 * Adds a line comment above each key that has an entry in the map.
 */
function injectComments(raw, comments) {
  return raw
    .split(/\r?\n/)
    .map(line => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
      if (match && comments[match[1]]) {
        return `# ${comments[match[1]]}\n${line}`;
      }
      return line;
    })
    .join('\n');
}

module.exports = { extractComments, stripComments, injectComments };
