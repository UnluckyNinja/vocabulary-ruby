import { refineMatches, prepareSearchAsync } from 'dawg-search'

export interface MatchResult {
  start: number
  end: number
  translation: string
}

export type Matcher = (text: string, segments?: Intl.Segments) => MatchResult[]

/**
 * Creates a matcher function from a dictionary.
 */
export async function createMatcher(dictionary: Map<string, string>): Promise<Matcher> {
  console.debug('[VocabularyRuby] Matcher created with dictionary size:', dictionary.size)

  const { findWords } = await prepareSearchAsync([...dictionary.keys()])

  return (text: string, segments?: Intl.Segments) => {
    if (!text) return []

    function getTranslation(start: number, end: number) {
      const word = text.slice(start, end)
      return dictionary.get(word)
    }

    let results = findWords(text)
    if (segments) {
      results = segmentMatch(segments, results)
    }

    const words = refineMatches(results).map(it => {
      return {
        start: it.start,
        end: it.end,
        translation: getTranslation(it.start, it.end) ?? '',
      }
    })
    return words
  }
}

export function segmentMatch(segments: Intl.Segments, matches: { start: number; end: number }[]) {
  const indices = new Set<number>()
  for (const { index } of segments) {
    indices.add(index)
  }
  return matches.filter(item => indices.has(item.start))
}
