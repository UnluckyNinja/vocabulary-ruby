import { refineMatches, prepareSearchAsync } from 'dawg-search';

export interface MatchResult {
  start: number;
  end: number;
  translation: string;
}

export type Matcher = (text: string) => MatchResult[];

/**
 * Creates a matcher function from a dictionary.
 */
export async function createMatcher(dictionary: Map<string, string>): Promise<Matcher> {
  console.log('[VocabularyRuby] Matcher created with dictionary size:', dictionary.size);

  const { findWords } = await prepareSearchAsync([...dictionary.keys()])
  
  return (text: string) => {
    if (!text) return [];

    function getTranslation(start: number, end: number) {
      const word = text.slice(start, end)
      return dictionary.get(word)
    }

    return refineMatches(findWords(text)).map(it=>{
      return {
        start:it.start,
        end: it.end,
        translation: getTranslation(it.start, it.end) ?? ''
      }
    })
  }
}
