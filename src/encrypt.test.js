import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, encryptEnv, decryptEnv } from './encrypt.js';

const KEY = 'super-secret-passphrase';

describe('encrypt / decrypt', () => {
  it('round-trips a plain string', () => {
    const cipher = encrypt('hello world', KEY);
    expect(cipher).not.toBe('hello world');
    expect(decrypt(cipher, KEY)).toBe('hello world');
  });

  it('produces different ciphertext each call (random IV)', () => {
    const a = encrypt('same', KEY);
    const b = encrypt('same', KEY);
    expect(a).not.toBe(b);
  });

  it('throws on wrong key', () => {
    const cipher = encrypt('secret', KEY);
    expect(() => decrypt(cipher, 'wrong-key')).toThrow();
  });
});

describe('encryptEnv', () => {
  const parsed = { DB_PASS: 'hunter2', APP_NAME: 'myapp', API_KEY: 'abc123' };
  const sensitive = ['DB_PASS', 'API_KEY'];

  it('encrypts only sensitive keys', () => {
    const result = encryptEnv(parsed, KEY, sensitive);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.DB_PASS).toMatch(/^enc:/);
    expect(result.API_KEY).toMatch(/^enc:/);
  });
});

describe('decryptEnv', () => {
  it('decrypts enc: prefixed values and leaves others alone', () => {
    const raw = { DB_PASS: 'enc:' + encrypt('hunter2', KEY), APP_NAME: 'myapp' };
    const result = decryptEnv(raw, KEY);
    expect(result.DB_PASS).toBe('hunter2');
    expect(result.APP_NAME).toBe('myapp');
  });

  it('round-trips encryptEnv -> decryptEnv', () => {
    const parsed = { SECRET: 'topsecret', NAME: 'envpatch' };
    const encrypted = encryptEnv(parsed, KEY, ['SECRET']);
    const decrypted = decryptEnv(encrypted, KEY);
    expect(decrypted).toEqual(parsed);
  });
});
