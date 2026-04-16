const fs = require('fs');
const path = require('path');
const { parse, serialize } = require('./parser');

function saveSnapshot(envPath, snapshotDir) {
  const content = fs.readFileSync(envPath, 'utf8');
  const parsed = parse(content);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = path.basename(envPath);
  const snapshotName = `${baseName}.${timestamp}.snap`;

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const snapshotPath = path.join(snapshotDir, snapshotName);
  fs.writeFileSync(snapshotPath, serialize(parsed), 'utf8');
  return snapshotPath;
}

function listSnapshots(snapshotDir, envName) {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs.readdirSync(snapshotDir)
    .filter(f => f.startsWith(envName) && f.endsWith('.snap'))
    .sort();
}

function loadSnapshot(snapshotPath) {
  const content = fs.readFileSync(snapshotPath, 'utf8');
  return parse(content);
}

function deleteSnapshot(snapshotPath) {
  fs.unlinkSync(snapshotPath);
}

module.exports = { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot };
