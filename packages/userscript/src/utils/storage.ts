import { strFromU8, strToU8, gzipSync, gunzipSync } from 'fflate';

/**
 * A wrapper around GM_storage that handles GZIP compression for large dictionary data.
 */
export class CompressedStorage {
  /**
   * Compresses and stores a value.
   * @param key The storage key.
   * @param value The value to store (will be JSON stringified).
   */
  static async set(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      const uint8Array = strToU8(jsonString);
      const compressed = gzipSync(uint8Array);
      
      // GM_setValue typically handles strings well. We can store as Base64 string to be safe across engines,
      // or directly if the engine supports binary blobs. Base64 is safest.
      const base64 = this.uint8ToBase64(compressed);
      await GM_setValue(key, base64);
    } catch (error) {
      console.error(`[VocabularyRuby] Failed to save key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Retrieves and decompresses a value.
   * @param key The storage key.
   * @returns The parsed value, or null if not found.
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const base64 = await GM_getValue(key, null);
      if (!base64) return null;

      const compressed = this.base64ToUint8(base64);
      const decompressed = gunzipSync(compressed);
      const jsonString = strFromU8(decompressed);
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`[VocabularyRuby] Failed to load key "${key}":`, error);
      return null;
    }
  }

  // --- Helpers for Base64 conversion (since Buffer is not available in browser/userscript env) ---

  private static uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private static base64ToUint8(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
