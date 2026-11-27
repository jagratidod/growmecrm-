import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/** AES-256-GCM sealing of secrets at rest, keyed by GROWME_CONNECTION_KEY (32 bytes, base64). */
export class MissingEncryptionKeyError extends Error {
  constructor() {
    super('Configure a 32-byte GROWME_CONNECTION_KEY on the server.');
    this.name = 'MissingEncryptionKeyError';
  }
}

function encryptionKey(): Buffer {
  const key = Buffer.from(process.env.GROWME_CONNECTION_KEY ?? '', 'base64');
  if (key.length !== 32) throw new MissingEncryptionKeyError();
  return key;
}

export const hasEncryptionKey = (): boolean => Buffer.from(process.env.GROWME_CONNECTION_KEY ?? '', 'base64').length === 32;

export function seal(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.');
}

export function open(value: string): string {
  const [iv, tag, data] = value.split('.').map((part) => Buffer.from(part, 'base64url'));
  const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString('utf8');
}

const PREFIX = 'enc:v1:';

/** True when the stored value is already an encrypted platform secret. */
export const isEncryptedSecret = (value: unknown): value is string => typeof value === 'string' && value.startsWith(PREFIX);

/** Encrypts a platform secret for storage. Empty values stay empty. */
export const encryptSecret = (value: string): string => (value ? PREFIX + seal(value) : '');

/** Decrypts a stored platform secret. Legacy plaintext values are returned as they are. */
export function decryptSecret(stored: string | undefined | null): string {
  if (!stored) return '';
  return isEncryptedSecret(stored) ? open(stored.slice(PREFIX.length)) : stored;
}
