const fs = require('fs');
const os = require('os');
const path = require('path');
const { runSanitize } = require('./cli-sanitize');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `sanitize-test-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cli-sanitize', () => {
  let stdout;
  beforeEach(() => {
    stdout = [];
    jest.spyOn(process.stdout, 'write').mockImplementation(d => stdout.push(d));
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  test('prints no changes message when file is already clean', () => {
    const f = writeTmp('FOO=bar\nBAZ=qux\n');
    const logs = [];
    jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
    runSanitize([f]);
    expect(logs.join('\n')).toContain('No changes needed');
  });

  test('outputs sanitized content to stdout by default', () => {
    const f = writeTmp('FOO=  hello  \nBAR="world"\n');
    runSanitize([f, '--quiet']);
    const out = stdout.join('');
    expect(out).toContain('FOO=hello');
    expect(out).toContain('BAR=world');
  });

  test('--in-place rewrites the file', () => {
    const f = writeTmp('KEY=  spaced  \n');
    runSanitize([f, '--in-place', '--quiet']);
    const content = fs.readFileSync(f, 'utf8');
    expect(content).toContain('KEY=spaced');
    expect(content).not.toContain('  spaced  ');
  });

  test('--output= writes to a different file', () => {
    const src = writeTmp('X="quoted"\n');
    const dest = path.join(os.tmpdir(), `sanitize-out-${Date.now()}.env`);
    runSanitize([src, `--output=${dest}`, '--quiet']);
    const content = fs.readFileSync(dest, 'utf8');
    expect(content).toContain('X=quoted');
  });

  test('--collapse-whitespace collapses internal spaces', () => {
    const f = writeTmp('MSG=hello   world\n');
    runSanitize([f, '--collapse-whitespace', '--quiet']);
    const out = stdout.join('');
    expect(out).toContain('MSG=hello world');
  });

  test('exits on missing file', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runSanitize(['nonexistent.env'])).toThrow('exit');
    mockExit.mockRestore();
  });
});
