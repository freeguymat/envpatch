import fs from 'fs';
import path from 'path';
import { parse } from './parser.js';
import { loadSchema } from './schema.js';
import { toTemplate, fillTemplate } from './template.js';

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function runTemplate(argv) {
  const cmd = argv[0];

  if (cmd === 'generate') {
    const envFile = argv[1];
    const schemaFile = argv[2]; // optional
    if (!envFile) fatal('usage: template generate <envfile> [schemafile]');
    if (!fs.existsSync(envFile)) fatal(`file not found: ${envFile}`);

    const env = parse(fs.readFileSync(envFile, 'utf8'));
    const schema = schemaFile && fs.existsSync(schemaFile)
      ? loadSchema(fs.readFileSync(schemaFile, 'utf8'))
      : {};

    const out = toTemplate(env, schema);
    const outFile = path.basename(envFile, path.extname(envFile)) + '.template.env';
    fs.writeFileSync(outFile, out, 'utf8');
    console.log(`template written to ${outFile}`);

  } else if (cmd === 'fill') {
    const templateFile = argv[1];
    const sourceFile = argv[2];
    const outFile = argv[3];
    if (!templateFile || !sourceFile) fatal('usage: template fill <templatefile> <sourcefile> [outfile]');
    if (!fs.existsSync(templateFile)) fatal(`file not found: ${templateFile}`);
    if (!fs.existsSync(sourceFile)) fatal(`file not found: ${sourceFile}`);

    const tmpl = fs.readFileSync(templateFile, 'utf8');
    const sourceEnv = parse(fs.readFileSync(sourceFile, 'utf8'));
    const filled = fillTemplate(tmpl, sourceEnv);

    const dest = outFile || 'filled.env';
    fs.writeFileSync(dest, filled, 'utf8');
    console.log(`filled template written to ${dest}`);

  } else {
    fatal('unknown subcommand. use: generate | fill');
  }
}
