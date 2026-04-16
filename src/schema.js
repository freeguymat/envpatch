const fs = require('fs');
const path = require('path');

/**
 * Load a schema from a .env.schema file.
 * Format: each line is either:
 *   KEY            -> required, no pattern
 *   KEY=<pattern>  -> required, with regex pattern
 *   KEY?           -> optional, no pattern
 *   KEY?=<pattern> -> optional, with regex pattern
 */
function loadSchema(filePath) {
  const abs = path.resolve(filePath);
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  const schema = {};

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const optional = line.includes('?');
    const [keyPart, patternStr] = line.replace('?', '').split('=');
    const key = keyPart.trim();
    if (!key) continue;

    schema[key] = {
      required: !optional,
      ...(patternStr ? { pattern: new RegExp(patternStr.trim()) } : {}),
    };
  }

  return schema;
}

/**
 * Serialize a schema object back to .env.schema format.
 */
function serializeSchema(schema) {
  return Object.entries(schema)
    .map(([key, rule]) => {
      const mark = rule.required ? '' : '?';
      const pat = rule.pattern ? `=${rule.pattern.source}` : '';
      return `${key}${mark}${pat}`;
    })
    .join('\n') + '\n';
}

module.exports = { loadSchema, serializeSchema };
