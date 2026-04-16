// Convert .env files to/from JSON or YAML format
const { parse, serialize } = require('./parser');

function toJSON(envContent) {
  const parsed = parse(envContent);
  const obj = {};
  for (const entry of parsed) {
    if (entry.type === 'entry') {
      obj[entry.key] = entry.value;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function fromJSON(jsonContent) {
  let obj;
  try {
    obj = JSON.parse(jsonContent);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
  if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
    throw new Error('JSON must be a flat object');
  }
  const entries = Object.entries(obj).map(([key, value]) => ({
    type: 'entry',
    key,
    value: String(value),
  }));
  return serialize(entries);
}

function toYAML(envContent) {
  const parsed = parse(envContent);
  const lines = [];
  for (const entry of parsed) {
    if (entry.type === 'comment') {
      lines.push('#' + entry.raw.replace(/^#/, ''));
    } else if (entry.type === 'entry') {
      const val = entry.value.includes(':') || entry.value.includes('#')
        ? `"${entry.value.replace(/"/g, '\\"')}"`
        : entry.value || '""';
      lines.push(`${entry.key}: ${val}`);
    } else if (entry.type === 'blank') {
      lines.push('');
    }
  }
  return lines.join('\n') + '\n';
}

function fromYAML(yamlContent) {
  const entries = [];
  for (const raw of yamlContent.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('#')) {
      entries.push({ type: 'comment', raw: line });
    } else if (line.trim() === '') {
      entries.push({ type: 'blank' });
    } else {
      const idx = line.indexOf(':');
      if (idx === -1) throw new Error(`Invalid YAML line: ${line}`);
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
      }
      entries.push({ type: 'entry', key, value });
    }
  }
  return serialize(entries);
}

module.exports = { toJSON, fromJSON, toYAML, fromYAML };
