/**
 * trim.js — strip leading/trailing whitespace from .env values
 */

export function trim(env) {
  const trimmed = {};
  const changes = [];

  for (const [key, value] of Object.entries(env)) {
    const after = value.trim();
    trimmed[key] = after;
    if (after !== value) {
      changes.push({ key, before: value, after });
    }
  }

  return { trimmed, changes };
}

export function formatTrim({ changes }) {
  if (changes.length === 0) return 'No values needed trimming.';

  const lines = [`Trimmed ${changes.length} value(s):\n`];
  for (const { key, before, after } of changes) {
    lines.push(`  ${key}`);
    lines.push(`    before: ${JSON.stringify(before)}`);
    lines.push(`    after:  ${JSON.stringify(after)}`);
  }
  return lines.join('\n');
}
