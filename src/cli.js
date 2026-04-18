#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');
const { diff } = require('./diff');
const { patch } = require('./patch');
const { applyPatch } = require('./applyPatch');
const { validate } = require('./validate');
const { loadSchema } = require('./schema');

const [,, command, ...args] = process.argv;

function readEnv(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    fatal(`file not found: ${filePath}`);
  }
  const content = fs.readFileSync(resolved, 'utf8');
  return parse(content);
}

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

switch (command) {
  case 'diff': {
    if (args.length < 2) fatal('usage: envpatch diff <base> <target>');
    const base = readEnv(args[0]);
    const target = readEnv(args[1]);
    const result = diff(base, target);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    break;
  }

  case 'patch': {
    if (args.length < 2) fatal('usage: envpatch patch <env> <patchfile>');
    const env = readEnv(args[0]);
    const patchPath = path.resolve(args[1]);
    if (!fs.existsSync(patchPath)) fatal(`file not found: ${args[1]}`);
    const patchData = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
    const patched = patch(env, patchData);
    process.stdout.write(serialize(patched));
    break;
  }

  case 'apply': {
    if (args.length < 2) fatal('usage: envpatch apply <env> <patchfile>');
    applyPatch(args[0], args[1]);
    console.log(`patched ${args[0]}`);
    break;
  }

  case 'validate': {
    if (args.length < 2) fatal('usage: envpatch validate <env> <schema>');
    const env = readEnv(args[0]);
    const schema = loadSchema(path.resolve(args[1]));
    const errors = validate(env, schema);
    if (errors.length === 0) {
      console.log('valid');
    } else {
      errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }
    break;
  }

  default:
    console.error('commands: diff, patch, apply, validate');
    process.exit(1);
}
