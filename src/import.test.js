const { importEnv, importMerge, detectFormat } = require('./import');

describe('detectFormat', () => {
  test('detects json by extension', () => {
    expect(detectFormat('config.json', '')).toBe('json');
  });
  test('detects yaml by extension', () => {
    expect(detectFormat('config.yml', '')).toBe('yaml');
    expect(detectFormat('config.yaml', '')).toBe('yaml');
  });
  test('detects env by extension', () => {
    expect(detectFormat('.env.production', '')).toBe('env');
  });
  test('sniffs json content', () => {
    expect(detectFormat('', '{"A":"1"}')).toBe('json');
  });
  test('sniffs yaml content', () => {
    expect(detectFormat('', 'A: 1\nB: 2')).toBe('yaml');
  });
  test('falls back to env', () => {
    expect(detectFormat('', 'A=1\nB=2')).toBe('env');
  });
});

describe('importEnv', () => {
  test('imports from .env string', () => {
    const result = importEnv('FOO=bar\nBAZ=qux', '.env');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('imports from JSON string', () => {
    const result = importEnv('{"FOO":"bar","BAZ":"qux"}', 'vars.json');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('imports from YAML string', () => {
    const result = importEnv('FOO: bar\nBAZ: qux', 'vars.yaml');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('sniffs env format with no filename', () => {
    const result = importEnv('X=1\nY=2');
    expect(result).toEqual({ X: '1', Y: '2' });
  });
});

describe('importMerge', () => {
  const base = { A: 'original', B: 'keep' };
  const incoming = { A: 'new', C: 'added' };

  test('does not overwrite by default', () => {
    const result = importMerge(base, incoming);
    expect(result.A).toBe('original');
    expect(result.C).toBe('added');
    expect(result.B).toBe('keep');
  });

  test('overwrites when flag is set', () => {
    const result = importMerge(base, incoming, { overwrite: true });
    expect(result.A).toBe('new');
    expect(result.C).toBe('added');
  });

  test('does not mutate base', () => {
    importMerge(base, incoming, { overwrite: true });
    expect(base.A).toBe('original');
  });
});
