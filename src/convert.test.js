const { toJSON, fromJSON, toYAML, fromYAML } = require('./convert');

const sample = `# App config
DB_HOST=localhost
DB_PORT=5432
SECRET=
`;

describe('toJSON', () => {
  it('converts env to JSON object', () => {
    const result = JSON.parse(toJSON(sample));
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe('5432');
    expect(result.SECRET).toBe('');
  });

  it('omits comments and blanks from JSON', () => {
    const result = JSON.parse(toJSON(sample));
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT', 'SECRET']);
  });
});

describe('fromJSON', () => {
  it('converts JSON back to env format', () => {
    const json = JSON.stringify({ FOO: 'bar', BAZ: '123' });
    const result = fromJSON(json);
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=123');
  });

  it('throws on invalid JSON', () => {
    expect(() => fromJSON('not json')).toThrow('Invalid JSON');
  });

  it('throws on non-object JSON', () => {
    expect(() => fromJSON('[1,2,3]')).toThrow('flat object');
  });
});

describe('toYAML', () => {
  it('converts env to YAML', () => {
    const result = toYAML(sample);
    expect(result).toContain('DB_HOST: localhost');
    expect(result).toContain('DB_PORT: 5432');
    expect(result).toContain('# App config');
  });

  it('quotes values containing colons', () => {
    const result = toYAML('URL=http://example.com\n');
    expect(result).toContain('URL: "http://example.com"');
  });
});

describe('fromYAML', () => {
  it('converts YAML back to env format', () => {
    const yaml = 'FOO: bar\nBAZ: 123\n';
    const result = fromYAML(yaml);
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=123');
  });

  it('round-trips through YAML', () => {
    const yaml = toYAML(sample);
    const back = fromYAML(yaml);
    expect(back).toContain('DB_HOST=localhost');
    expect(back).toContain('DB_PORT=5432');
  });
});
