import fs from 'fs';
import path from 'path';
import { parse, serialize } from './parser.js';
import { trim, formatTrim } from './trim.js';

function fatal(msg) {
  console.error('error:', msg);
  process.exit(1);
}

export function runTrim(argv) {
  const args = argv.slice(2);
  const fileArg = args.find(a => !a.startsWith('--'));
  const write = args.includes('--write');
  const quiet = args.includes('--quiet');

  if (!fileArg) fatal('usage: envpatch trim <file> [--write] [--quiet]');

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);

  const raw = fs.readFileSync(filePath, 'utf8');
  const env = parse(raw);
  const result = trim(env);

  if (!quiet) console.log(formatTrim(result));

  if (write) {
    fs.writeFileSync(filePath, serialize(result.trimmed));
    if (!quiet) console.log(`wrote ${filePath}`);
  }
}
