import { CompressedStorage } from '../utils/storage';

export class DictionaryLoader {
  private static STORAGE_KEY = 'vocabulary_ruby_dict';

  /**
   * Fetches a CSV file from a URL.
   */
  static async fetchCSV(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
          } else {
            reject(new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`));
          }
        },
        onerror: (err) => reject(err),
      });
    });
  }

  /**
   * Parses CSV content into a Map.
   * Assumes simple key-value pairs (key,value) per line.
   */
  static parseCSV(csvContent: string): Map<string, string> {
    const map = new Map<string, string>();
    const lines = csvContent.split(/\r?\n/);
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Simple split by first comma, handling potential commas in value slightly better?
      // Actually, for simple key-value dictionaries, let's assume standard CSV "key,value"
      // If quotes are involved, a regex or parser is better.
      // For now, let's stick to simple split, maybe user can improve if needed.
      const parts = trimmed.split(',');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(',').trim(); // Join rest in case value has commas
        if (key && value) {
          map.set(key, value);
        }
      }
    }
    return map;
  }

  /**
   * Processes multiple dictionary URLs, merges them, and saves to storage.
   */
  static async processDictionaries(urls: string[]): Promise<void> {
    const combinedMap = new Map<string, string>();

    for (const url of urls) {
      try {
        const content = await this.fetchCSV(url);
        const map = this.parseCSV(content);
        // Merge into combined map
        map.forEach((value, key) => combinedMap.set(key, value));
      } catch (error) {
        console.error(`[VocabularyRuby] Error processing dictionary from ${url}:`, error);
        // Continue processing other URLs? Or fail? Let's log and continue.
      }
    }

    // Convert Map to object for JSON serialization
    const dictObject = Object.fromEntries(combinedMap);
    await CompressedStorage.set(this.STORAGE_KEY, dictObject);
    console.log(`[VocabularyRuby] Saved ${combinedMap.size} entries to storage.`);
  }

  /**
   * Loads the dictionary from storage.
   */
  static async loadDictionary(): Promise<Map<string, string> | null> {
    const dictObject = await CompressedStorage.get<Record<string, string>>(this.STORAGE_KEY);
    if (dictObject) {
      return new Map(Object.entries(dictObject))
    }
    return null
  }
}
