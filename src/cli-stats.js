// cli-stats.js — CLI handler for the stats command
const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { stats, formatStats } = require('./stats');

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

function runStats(argv) {
  const file = argv[0];
  const jsonFlag = argv.includes('--json');

  if (!file) fatal('usage: envpatch stats <file> [--json]');
  if (!fs.existsSync(file)) fatal(`file not found: ${file}`);

  let src;
  try {
    src = fs.readFileSync(file, 'utf8');
  } catch (e) {
    fatal(`could not read file: ${e.message}`);
  }

  const env = parse(src);
  const result = stats(env);

  if (jsonFlag) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Stats for ${path.basename(file)}`);
    console.log('─'.repeat(30));
    console.log(formatStats(result));
  }
}

module.exports = { runStats, fatal };
