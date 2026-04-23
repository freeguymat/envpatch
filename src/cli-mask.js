// cli-mask.js — CLI handler for `envpatch mask`

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { maskEnv, formatMasked } = require('./mask');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(abs, 'utf8'));
}

function runMask(argv) {
  const args = argv.slice(2);
  if (!args.length) fatal('usage: envpatch mask <file> [--keys KEY1,KEY2] [--json]');

  let file = null;
  let extraKeys = [];
  let asJson = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keys' && args[i + 1]) {
      extraKeys = args[++i].split(',').map(k => k.trim()).filter(Boolean);
    } else if (args[i] === '--json') {
      asJson = true;
    } else if (!file) {
      file = args[i];
    }
  }

  if (!file) fatal('no input file specified');

  const env = readEnv(file);
  const masked = maskEnv(env, extraKeys);

  if (asJson) {
    console.log(JSON.stringify(masked, null, 2));
  } else {
    console.log(formatMasked(masked));
  }
}

module.exports = { runMask, fatal };
