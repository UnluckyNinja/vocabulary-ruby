import { CompressedStorage } from '../utils/storage';
import { DictionarySource } from '../config/configType';
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
export async function processSources(sources: DictionarySource[]) {
  const combinedMap = new Map<string, string>();
  const failed: DictionarySource[] = []
  for (const source of sources) {
    try {
      let content = '';
      if (source.isRemote && source.updateURL) {
        content = await fetchContent(source.updateURL);
      } else if (!source.isRemote && source.content) {
        content = source.content;
      }

      if (content) {
        const map = parseContent(content);
        map?.forEach((value, key) => combinedMap.set(key, value));
      }
    } catch (error) {
      failed.push(source)
      console.error(`[VocabularyRuby] Error processing dictionary source "${source.name}":`, error);
    }
  }

  return {
    dicts: combinedMap,
    failed,
  };
}

/**
 * Saves the dictionary to storage.
 */
export function saveDictionary(key: string, dict: Map<string, string> | undefined) {
  if (!dict) {
    CompressedStorage.delete(STORAGE_PREFIX + key);
    console.info(`[VocabularyRuby] Dictionary of ID ${key} deleted.`);
    return
  }
  const dictObject = Object.fromEntries(dict);
  CompressedStorage.set(STORAGE_PREFIX + key, dictObject);
  console.info(`[VocabularyRuby] Saved ${dict.size} entries to storage.`);
}

/**
 * Loads the dictionary from storage.
 */
export function loadDictionary(key: string): Map<string, string> {
  const dictObject = CompressedStorage.get<Record<string, string>>(STORAGE_PREFIX+key);
  if (dictObject) {
    return new Map(Object.entries(dictObject))
  }
  return new Map()
}
