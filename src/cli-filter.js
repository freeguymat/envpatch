// cli-filter.js — CLI handler for filter command
const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { filter, formatFilter } = require('./filter');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(abs, 'utf8'));
}

function runFilter(argv) {
  const [filePath, patternArg, ...flags] = argv;
  if (!filePath) fatal('usage: envpatch filter <file> <pattern> [--regex] [--json]');
  if (!patternArg) fatal('pattern is required');

  const useRegex = flags.includes('--regex');
  const useJson = flags.includes('--json');

  const env = readEnv(filePath);
  const pattern = useRegex ? new RegExp(patternArg) : patternArg;
  const result = filter(env, pattern);

  if (useJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatFilter(result, patternArg));
  }
}

module.exports = { runFilter, fatal };
