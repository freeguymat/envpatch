const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } = require('./snapshot');

function writeTmp(content, name = '.env') {
  const p = path.join(os.tmpdir(), `envpatch-snap-${Date.now()}-${name}`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('snapshot', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `envpatch-snapdir-${Date.now()}`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.readdirSync(tmpDir).forEach(f => fs.unlinkSync(path.join(tmpDir, f)));
      fs.rmdirSync(tmpDir);
    }
  });

  test('saveSnapshot creates a file in snapshotDir', () => {
    const envFile = writeTmp('FOO=bar\nBAZ=qux\n');
    const snapPath = saveSnapshot(envFile, tmpDir);
    expect(fs.existsSync(snapPath)).toBe(true);
    fs.unlinkSync(envFile);
  });

  test('listSnapshots returns matching snapshots sorted', () => {
    const envFile = writeTmp('FOO=1\n', '.env');
    saveSnapshot(envFile, tmpDir);
    saveSnapshot(envFile, tmpDir);
    const baseName = path.basename(envFile);
    const snaps = listSnapshots(tmpDir, baseName);
    expect(snaps.length).toBe(2);
    expect(snaps[0] <= snaps[1]).toBe(true);
    fs.unlinkSync(envFile);
  });

  test('loadSnapshot parses snapshot content', () => {
    const envFile = writeTmp('FOO=hello\nBAR=world\n');
    const snapPath = saveSnapshot(envFile, tmpDir);
    const parsed = loadSnapshot(snapPath);
    expect(parsed.FOO).toBe('hello');
    expect(parsed.BAR).toBe('world');
    fs.unlinkSync(envFile);
  });

  test('deleteSnapshot removes the file', () => {
    const envFile = writeTmp('X=1\n');
    const snapPath = saveSnapshot(envFile, tmpDir);
    deleteSnapshot(snapPath);
    expect(fs.existsSync(snapPath)).toBe(false);
    fs.unlinkSync(envFile);
  });

  test('listSnapshots returns empty array when dir missing', () => {
    const snaps = listSnapshots('/nonexistent/dir', '.env');
    expect(snaps).toEqual([]);
  });
});
