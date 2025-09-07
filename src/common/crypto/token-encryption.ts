import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { SESSION_ENCRYPTION_KEY } from '../env';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
}

export async function encryptToken(token: string): Promise<string | null> {
  if (!token || !SESSION_ENCRYPTION_KEY) {
    return null;
  }

  try {
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    const key = await deriveKey(SESSION_ENCRYPTION_KEY, salt);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('token'));

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine salt, iv, authTag, and encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);

    return result.toString('base64');
  } catch (error) {
    console.error('Token encryption failed:', error);
    return null;
  }
}

export async function decryptToken(
  encryptedToken: string,
): Promise<string | null> {
  if (!encryptedToken || !SESSION_ENCRYPTION_KEY) {
    return null;
  }

  try {
    const combined = Buffer.from(encryptedToken, 'base64');

    if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
      throw new Error('Invalid encrypted token format');
    }

    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
    );
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = await deriveKey(SESSION_ENCRYPTION_KEY, salt);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('token'));

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}
