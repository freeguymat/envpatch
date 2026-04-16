// CLI subcommand: envpatch audit <base.env> <target.env> [--redact] [--json]

const fs = require('fs');
const { parse } = require('./parser');
const { diff } = require('./diff');
const { buildAuditLog, formatAuditLog } = require('./audit');

function fatal(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) fatal(`file not found: ${filePath}`);
  return parse(fs.readFileSync(filePath, 'utf8'));
}

function runAudit(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith('--')));
  const positional = args.filter(a => !a.startsWith('--'));

  if (positional.length < 2) {
    fatal('usage: envpatch audit <base.env> <target.env> [--redact] [--json]');
  }

  const [basePath, targetPath] = positional;
  const redactSensitive = flags.has('--redact');
  const jsonOutput = flags.has('--json');

  const baseEnv = readEnv(basePath);
  const targetEnv = readEnv(targetPath);

  const diffResult = diff(baseEnv, targetEnv);
  const log = buildAuditLog(diffResult, { redactSensitive });

  if (jsonOutput) {
    console.log(JSON.stringify(log, null, 2));
  } else {
    console.log(`Audit: ${basePath} -> ${targetPath}`);
    console.log(`Changes: ${log.length}`);
    console.log();
    console.log(formatAuditLog(log));
  }
}

if (require.main === module) {
  runAudit(process.argv);
}

module.exports = { runAudit };
