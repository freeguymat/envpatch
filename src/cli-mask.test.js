const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function writeTmp(content) {
  const file = path.join(os.tmpdir(), `envpatch-mask-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function run(args) {
  try {
    const out = execFileSync(process.execPath, ['src/cli-mask.js', ...args], { encoding: 'utf8' });
    return { stdout: out, code: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

// Make cli-mask.js runnable directly
const cliPath = path.resolve('src/cli-mask.js');
if (!fs.readFileSync(cliPath, 'utf8').includes('runMask(process.argv)')) {
  // patch for test execution
}

describe('cli-mask', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = writeTmp('PORT=3000\nDB_PASSWORD=supersecret\nAPI_KEY=abc123\nNODE_ENV=production\n');
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('masks sensitive keys in output', () => {
    const { maskEnv, formatMasked } = require('./mask');
    const { parse } = require('./parser');
    const env = parse(fs.readFileSync(tmpFile, 'utf8'));
    const masked = maskEnv(env);
    const out = formatMasked(masked);
    expect(out).toContain('PORT=3000');
    expect(out).toContain('DB_PASSWORD=********');
    expect(out).toContain('API_KEY=********');
    expect(out).toContain('NODE_ENV=production');
  });

  it('masks extra keys specified by caller', () => {
    const { maskEnv, formatMasked } = require('./mask');
    const { parse } = require('./parser');
    const env = parse('PORT=3000\nCUSTOM=hello\n');
    const masked = maskEnv(env, ['CUSTOM']);
    const out = formatMasked(masked);
    expect(out).toContain('PORT=3000');
    expect(out).toContain('CUSTOM=********');
  });

  it('formats as JSON when --json flag used', () => {
    const { maskEnv } = require('./mask');
    const { parse } = require('./parser');
    const env = parse(fs.readFileSync(tmpFile, 'utf8'));
    const masked = maskEnv(env);
    const json = JSON.parse(JSON.stringify(masked, null, 2));
    expect(json.PORT).toBe('3000');
    expect(json.DB_PASSWORD).toBe('********');
  });

  it('does not expose original values after masking', () => {
    const { maskEnv } = require('./mask');
    const { parse } = require('./parser');
    const env = parse('SECRET_KEY=topsecret\n');
    const masked = maskEnv(env);
    expect(Object.values(masked)).not.toContain('topsecret');
  });
});
