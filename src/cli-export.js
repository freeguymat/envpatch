#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exportFile } = require('./export');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function runExport(argv = process.argv.slice(2)) {
  let inputPath = null;
  let format = 'env';
  let outputPath = null;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--format' || argv[i] === '-f') {
      format = argv[++i];
    } else if (argv[i] === '--output' || argv[i] === '-o') {
      outputPath = argv[++i];
    } else if (!argv[i].startsWith('-')) {
      inputPath = argv[i];
    }
  }

  if (!inputPath) {
    fatal('usage: envpatch export <file.env> [--format env|json|yaml] [--output out]');
  }

  if (!fs.existsSync(inputPath)) {
    fatal(`file not found: ${inputPath}`);
  }

  const supported = ['env', 'json', 'yaml', 'yml'];
  if (!supported.includes(format.toLowerCase())) {
    fatal(`unsupported format "${format}". choose from: ${supported.join(', ')}`);
  }

  try {
    exportFile(inputPath, format, outputPath);
    if (outputPath) {
      console.log(`exported to ${outputPath}`);
    }
  } catch (err) {
    fatal(err.message);
  }
}

if (require.main === module) {
  runExport();
}

module.exports = { runExport };
