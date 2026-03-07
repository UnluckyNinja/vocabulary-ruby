import { GM_getValue, GM_setValue } from '$';
import { strFromU8, strToU8, zlibSync, unzlibSync } from 'fflate';

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

      // GM_setValue typically handles strings well. We can store as Base64 string to be safe across engines,
      // or directly if the engine supports binary blobs. Base64 is safest.
      const base64 = unicodeToBase64(jsonString);
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

      const decompressed = base64ToUnicode(base64);
      return JSON.parse(decompressed) as T;
    } catch (error) {
      console.error(`[VocabularyRuby] Failed to load key "${key}":`, error);
      return null;
    }
  }
}

// Credits: https://github.com/vuejs/repl/blob/main/src/utils.ts
export function unicodeToBase64(text: string): string {
  const buffer = strToU8(text)
  const zipped = zlibSync(buffer, { level: 9 })
  const binary = strFromU8(zipped, true)
  return btoa(binary)
}

export function base64ToUnicode(base64: string): string {
  const binary = atob(base64)

  // zlib header (x78), level 9 (xDA)
  if (binary.startsWith('\x78\xDA')) {
    const buffer = strToU8(binary, true)
    const unzipped = unzlibSync(buffer)
    return strFromU8(unzipped)
  }

  // old unicode hacks for backward compatibility
  // https://base64.guru/developers/javascript/examples/unicode-strings
  return decodeURIComponent(escape(binary))
}
