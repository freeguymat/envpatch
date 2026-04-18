import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { detectFormat, importEnv, importMerge } from './import.js';
import { serialize } from './parser.js';
import { parse } from './parser.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readFile(filePath) {
  try {
    return readFileSync(resolve(filePath), 'utf8');
  } catch {
    fatal(`could not read file: ${filePath}`);
  }
}

export function runImport(argv) {
  const args = argv.slice(2);
  const mergeFlag = args.includes('--merge');
  const formatFlag = args.find(a => a.startsWith('--format='));
  const outputFlag = args.find(a => a.startsWith('--output='));
  const positional = args.filter(a => !a.startsWith('--'));

  if (positional.length < 1) {
    fatal('usage: envpatch import <input-file> [base-env] [--merge] [--format=json|yaml] [--output=file]');
  }

  const inputPath = positional[0];
  const basePath = positional[1];
  const inputContent = readFile(inputPath);
  const format = formatFlag ? formatFlag.split('=')[1] : detectFormat(inputPath);

  if (!format) {
    fatal(`could not detect format for: ${inputPath}. use --format=json or --format=yaml`);
  }

  let imported;
  try {
    imported = importEnv(inputContent, format);
  } catch (e) {
    fatal(`failed to parse input: ${e.message}`);
  }

  let result;
  if (mergeFlag && basePath) {
    const baseContent = readFile(basePath);
    const base = parse(baseContent);
    result = importMerge(base, imported);
  } else {
    result = imported;
  }

  const output = serialize(result);

  if (outputFlag) {
    const outPath = outputFlag.split('=')[1];
    try {
      writeFileSync(resolve(outPath), output);
      console.log(`written to ${outPath}`);
    } catch {
      fatal(`could not write to: ${outPath}`);
    }
  } else {
    process.stdout.write(output);
  }
}
