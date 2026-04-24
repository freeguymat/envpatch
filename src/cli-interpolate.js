import fs from 'fs';
import path from 'path';
import { parse, serialize } from './parser.js';
import { interpolate, findRefs } from './interpolate.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function runInterpolate(argv) {
  const args = argv.slice(2);
  const strict = args.includes('--strict');
  const listRefs = args.includes('--list-refs');
  const inPlace = args.includes('--in-place');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length === 0) {
    fatal('usage: envpatch interpolate <file> [--strict] [--list-refs] [--in-place]');
  }

  const filePath = path.resolve(files[0]);

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    fatal(`cannot read file: ${filePath}`);
  }

  const env = parse(raw);

  if (listRefs) {
    const refs = findRefs(env);
    if (refs.length === 0) {
      console.log('No variable references found.');
    } else {
      for (const { key, refs: r } of refs) {
        console.log(`${key} -> ${r.join(', ')}`);
      }
    }
    return;
  }

  let resolved;
  try {
    resolved = interpolate(env, { strict });
  } catch (err) {
    fatal(err.message);
  }

  const output = serialize(resolved);

  if (inPlace) {
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`Interpolated and wrote ${filePath}`);
  } else {
    process.stdout.write(output);
  }
}
