export interface MatchResult {
  start: number;
  end: number;
  translation: string;
}

export type Matcher = (text: string) => MatchResult[];

/**
 * Creates a matcher function from a dictionary.
 * Currently uses a placeholder implementation that the user must replace.
 */
export function createMatcher(dictionary: Record<string, string>): Matcher {
  // Placeholder implementation - User to replace this with efficient matching logic (e.g., Trie, Regex)
  // For now, let's provide a very simple implementation to allow testing the UI flow if needed, 
  // but explicitly mark it as "needs implementation".
  console.log('[VocabularyRuby] Matcher created with dictionary size:', Object.keys(dictionary).length);
  
  return (text: string) => {
    // TODO: Implement efficient text matching here.
    // This is a placeholder that returns empty matches.
    if (!text) return [];
    
    // Example logic (very inefficient for large dicts):
    // const results: MatchResult[] = [];
    // for (const [word, translation] of Object.entries(dictionary)) {
    //   let index = text.indexOf(word);
    //   while (index !== -1) {
    //     results.push({ start: index, end: index + word.length, translation });
    //     index = text.indexOf(word, index + 1);
    //   }
    // }
    // return results.sort((a, b) => a.start - b.start);

    return []; 
  };
}
