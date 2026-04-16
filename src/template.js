// Generate a .env template from an existing env (keys only, values blanked)
// Optionally include schema hints as comments

/**
 * @param {Record<string, string>} env - parsed env object
 * @param {Record<string, any>} [schema] - optional schema for comments
 * @returns {string} template string
 */
export function toTemplate(env, schema = {}) {
  const lines = [];
  for (const key of Object.keys(env)) {
    const meta = schema[key];
    if (meta) {
      if (meta.description) lines.push(`# ${meta.description}`);
      if (meta.required) lines.push(`# required: true`);
      if (meta.default !== undefined) lines.push(`# default: ${meta.default}`);
    }
    lines.push(`${key}=`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Fill a template with values from a source env.
 * Keys present in template but missing from source keep blank values.
 * @param {string} templateStr
 * @param {Record<string, string>} sourceEnv
 * @returns {string}
 */
export function fillTemplate(templateStr, sourceEnv) {
  return templateStr
    .split('\n')
    .map(line => {
      if (line.startsWith('#') || line.trim() === '') return line;
      const eq = line.indexOf('=');
      if (eq === -1) return line;
      const key = line.slice(0, eq).trim();
      const value = sourceEnv[key] !== undefined ? sourceEnv[key] : '';
      return `${key}=${value}`;
    })
    .join('\n');
}
