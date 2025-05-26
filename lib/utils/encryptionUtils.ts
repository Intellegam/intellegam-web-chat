// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class EncryptionUtil {
  static async encryptWithAESGCM(key: string, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedKey = encoder.encode(key);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encodedKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    );
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM recommends a 12-byte IV for performance and security
    const algorithm = { name: 'AES-GCM', iv };
    const encodedData = encoder.encode(data);
    const encrypted = await crypto.subtle.encrypt(
      algorithm,
      keyMaterial,
      encodedData,
    );
    const ivAndEncryptedData = new Uint8Array(iv.length + encrypted.byteLength);
    ivAndEncryptedData.set(iv);
    ivAndEncryptedData.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...ivAndEncryptedData));
  }

  static async decryptWithAESGCM(
    key: string,
    encryptedDataWithIv: string,
  ): Promise<string | undefined> {
    if (!key) {
      return undefined;
    }
    try {
      const data = Uint8Array.from(atob(encryptedDataWithIv), (c) =>
        c.charCodeAt(0),
      );
      const iv = data.slice(0, 12); // Adjusted for AES-GCM's 12-byte IV
      const encryptedData = data.slice(12);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(key),
        { name: 'AES-GCM' },
        false,
        ['decrypt'],
      );
      const algorithm = { name: 'AES-GCM', iv };
      const decrypted = await crypto.subtle.decrypt(
        algorithm,
        keyMaterial,
        encryptedData,
      );
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      return undefined;
    }
  }

  static async generateHMACSHA256Signature(
    key: string,
    message: string,
  ): Promise<string> {
    const encoder = new TextEncoder();
    const encodedKey = encoder.encode(key);
    const encodedMessage = encoder.encode(message);

    // Import the key for use in the HMAC algorithm
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encodedKey,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign'],
    );

    // Generate the HMAC signature
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encodedMessage,
    );

    // Convert the signature to a Base64-encoded string
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
}

export const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

export default EncryptionUtil;
