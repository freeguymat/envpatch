const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function writeTmp(content) {
  const f = path.join(os.tmpdir(), `envpatch-stats-${Date.now()}.env`);
  fs.writeFileSync(f, content);
  return f;
}

function run(args) {
  try {
    const out = execFileSync(process.execPath, [path.resolve(__dirname, '../src/cli-stats.js'), ...args], {
      encoding: 'utf8',
    });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

// Make cli-stats runnable directly
const cliPath = path.resolve(__dirname, 'cli-stats.js');
const origContent = fs.readFileSync(cliPath, 'utf8');
if (!origContent.includes("require.main === module")) {
  // patch for direct execution in tests
}

test('shows stats for valid env file', () => {
  const f = writeTmp('DB_HOST=localhost\nDB_PORT=5432\nAPI_KEY=\n');
  const { runStats } = require('./cli-stats');
  // just ensure it doesn't throw
  let out = '';
  const orig = console.log;
  console.log = (...a) => { out += a.join(' ') + '\n'; };
  runStats([f]);
  console.log = orig;
  expect(out).toContain('Total keys');
  fs.unlinkSync(f);
});

test('json flag outputs valid json', () => {
  const f = writeTmp('FOO=bar\nBAZ=123\n');
  const { runStats } = require('./cli-stats');
  let out = '';
  const orig = console.log;
  console.log = (...a) => { out += a.join(' ') + '\n'; };
  runStats([f, '--json']);
  console.log = orig;
  const parsed = JSON.parse(out);
  expect(parsed.total).toBe(2);
  fs.unlinkSync(f);
});

test('exits on missing file', () => {
  const { runStats, fatal } = require('./cli-stats');
  expect(() => runStats([])).toThrow();
});
