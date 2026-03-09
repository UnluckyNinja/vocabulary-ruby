import { CompressedStorage } from '../utils/storage';
import { DictionarySource } from '../utils/configType';
import { csvParseRows } from 'd3-dsv';
import { fetchContent } from '../utils/network';

const STORAGE_PREFIX = 'dict:'


/**
 * Parses content into a Map. Supports JSON (object) and CSV.
 */
export function parseContent(content: string): Map<string, string> | undefined {
  const trimmed = content.trim();

  // Check if it's JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const data = JSON.parse(trimmed);
      if (Array.isArray(data)) {
        const map = new Map(data)
        return map as Map<string, string>;
      } else if (typeof data === 'object' && data !== null) {
        // If it's an object, assume key-value pairs
        const map = new Map(Object.entries(data))
        return map as Map<string, string>;
      }
    } catch (e) {
      // Fallback to CSV if JSON parsing fails
      console.warn(e)
      console.warn('Trying to parse source as JSON failed.')
    }
  }

  // Default to CSV
  try {
    const map = new Map(csvParseRows(trimmed) as [string, string][])
    return map;
  } catch (e) {
    console.warn(e)
    console.warn('Trying to parse dictionary source as CSV failed.')
  }

  console.error('Parsing dictionary failed.')
  return
}

/**
 * Processes multiple dictionary sources, merges them.
 */
export async function processSources(sources: DictionarySource[]): Promise<Map<string, string>> {
  const combinedMap = new Map<string, string>();

  for (const source of sources) {
    if (!source.enabled) continue;

    try {
      let content = '';
      if (source.type === 'remote' && source.url) {
        content = await fetchContent(source.url);
      } else if (source.type === 'manual' && source.content) {
        content = source.content;
      }

      if (content) {
        const map = parseContent(content);
        map?.forEach((value, key) => combinedMap.set(key, value));
      }
    } catch (error) {
      console.error(`[VocabularyRuby] Error processing dictionary source "${source.name}":`, error);
    }
  }

  return combinedMap;
}

/**
 * Saves the dictionary to storage.
 */
export function saveDictionary(key: string, dict: Map<string, string>) {
  const dictObject = Object.fromEntries(dict);
  CompressedStorage.set(STORAGE_PREFIX + key, dictObject);
  console.log(`[VocabularyRuby] Saved ${dict.size} entries to storage.`);
}

/**
 * Loads the dictionary from storage.
 */
export function loadDictionary(key: string): Map<string, string> | null {
  const dictObject = CompressedStorage.get<Record<string, string>>(STORAGE_PREFIX+key);
  if (dictObject) {
    return new Map(Object.entries(dictObject))
  }
  return null
}
