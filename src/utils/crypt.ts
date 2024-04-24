import * as crypto from 'crypto-js';
import config from 'src/config';

const secretKey = config.CRYPTO_SECRET_KEY;

function encodeUrlSafe(text: string): string {
  return text.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function encrypt(text: string) {
  const encrypted = crypto.AES.encrypt(text, secretKey).toString();
  const urlSafeEncrypted = encodeUrlSafe(encrypted);
  return urlSafeEncrypted;
}

export function decrypt(encryptedText: string) {
  try {
    const urlUnsafeEncrypted = encryptedText
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddedEncrypted = urlUnsafeEncrypted + '==';

    const bytes = crypto.AES.decrypt(paddedEncrypted, secretKey);
    const decrypted = bytes.toString(crypto.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}
