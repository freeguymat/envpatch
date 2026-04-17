const { parse } = require('./parser');
const { toJSON, toYAML } = require('./convert');
const fs = require('fs');

/**
 * Export an env object to a given format string.
 * Supported formats: 'env', 'json', 'yaml'
 */
function exportEnv(env, format = 'env') {
  switch (format.toLowerCase()) {
    case 'json':
      return toJSON(env);
    case 'yaml':
    case 'yml':
      return toYAML(env);
    case 'env':
      return serializeEnv(env);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function serializeEnv(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

function exportFile(inputPath, format, outputPath) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const env = parse(raw);
  const output = exportEnv(env, format);
  if (outputPath) {
    fs.writeFileSync(outputPath, output);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { exportEnv, exportFile, serializeEnv };
