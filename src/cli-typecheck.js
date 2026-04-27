#!/usr/bin/env node
// cli-typecheck.js — CLI for type-checking env values

const fs = require('fs');
const path = require('path');
const { parse } = require('./parser');
const { typecheck, formatTypecheck } = require('./typecheck');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  try {
    return parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    fatal(`could not read env file: ${filePath}`);
  }
}

function loadTypeSchema(schemaPath) {
  try {
    const raw = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    fatal(`could not read type schema: ${schemaPath}`);
  }
}

function runTypecheck(argv) {
  const args = argv.slice(2);
  if (args.length < 2) {
    console.error('usage: envpatch typecheck <envfile> <schema.json> [--strict]');
    process.exit(1);
  }

  const [envFile, schemaFile] = args;
  const strict = args.includes('--strict');

  const env = readEnv(envFile);
  const schema = loadTypeSchema(schemaFile);

  if (strict) {
    // in strict mode, every env key must appear in schema
    const untyped = Object.keys(env).filter(k => !(k in schema));
    if (untyped.length > 0) {
      fatal(`strict mode: untyped keys found: ${untyped.join(', ')}`);
    }
  }

  const errors = typecheck(env, schema);
  const output = formatTypecheck(errors);
  console.log(output);

  if (errors.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTypecheck(process.argv);
}

module.exports = { runTypecheck };
