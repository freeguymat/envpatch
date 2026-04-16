/**
 * Validate a parsed env object against a schema (array of required keys or object with rules).
 */

/**
 * @param {Record<string, string>} env - parsed env object
 * @param {string[] | Record<string, { required?: boolean; pattern?: RegExp }>} schema
 * @returns {{ valid: boolean; errors: string[] }}
 */
function validate(env, schema) {
  const errors = [];

  const rules = Array.isArray(schema)
    ? Object.fromEntries(schema.map((k) => [k, { required: true }]))
    : schema;

  for (const [key, rule] of Object.entries(rules)) {
    const value = env[key];

    if (rule.required && (value === undefined || value === '')) {
      errors.push(`Missing required key: ${key}`);
      continue;
    }

    if (rule.pattern && value !== undefined) {
      if (!rule.pattern.test(value)) {
        errors.push(`Key "${key}" value "${value}" does not match pattern ${rule.pattern}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validate };
