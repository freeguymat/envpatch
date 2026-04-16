const fs = require('fs');
const os = require('os');
const path = require('path');
const { applyPatch } = require('./applyPatch');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), `envpatch-test-${Date.now()}-${name}`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('applyPatch', () => {
  test('applies patch and writes file', () => {
    const envPath = writeTmp('.env', 'APP=hello\nDEBUG=false\n');
    const patchPath = writeTmp('patch.json', JSON.stringify([
      { key: 'DEBUG', type: 'change', oldValue: 'false', newValue: 'true' },
      { key: 'NEW_VAR', type: 'add', newValue: 'world' },
    ]));

    const { changed } = applyPatch(envPath, patchPath);
    expect(changed).toBe(true);

    const written = fs.readFileSync(envPath, 'utf8');
    expect(written).toContain('DEBUG=true');
    expect(written).toContain('NEW_VAR=world');
  });

  test('dry run does not write file', () => {
    const original = 'APP=hello\n';
    const envPath = writeTmp('.env', original);
    const patchPath = writeTmp('patch.json', JSON.stringify([
      { key: 'APP', type: 'change', oldValue: 'hello', newValue: 'changed' },
    ]));

    const { output, changed } = applyPatch(envPath, patchPath, { dryRun: true });
    expect(changed).toBe(true);
    expect(output).toContain('APP=changed');
    expect(fs.readFileSync(envPath, 'utf8')).toBe(original);
  });

  test('throws on missing env file', () => {
    expect(() =>
      applyPatch('/nonexistent/.env', '/nonexistent/patch.json')
    ).toThrow(/Env file not found/);
  });

  test('throws on invalid patch JSON', () => {
    const envPath = writeTmp('.env', 'A=1\n');
    const patchPath = writeTmp('patch.json', 'not json');
    expect(() => applyPatch(envPath, patchPath)).toThrow(/Invalid patch file JSON/);
  });

  test('throws if patch is not an array', () => {
    const envPath = writeTmp('.env', 'A=1\n');
    const patchPath = writeTmp('patch.json', '{"key":"A"}');
    expect(() => applyPatch(envPath, patchPath)).toThrow(/must contain a JSON array/);
  });
});
