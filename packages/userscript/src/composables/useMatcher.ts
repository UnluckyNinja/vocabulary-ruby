import { shallowRef } from 'vue';
import { getActiveConfigs } from '../config';
import { loadDictionary } from '../engine/loader';
import { createMatcher, Matcher } from '../engine/matcher';
import { DOMObserver } from '../engine/observer';

export function useMatcher() {


  const matcher = shallowRef<Matcher | null>(null)
  const observer = shallowRef<DOMObserver | null>(null);

  async function prepareMatcher(url: string) {
    // Find active configs for current site
    const activeConfigs = getActiveConfigs(url);

    if (activeConfigs.length === 0) {
      console.log('[Vocabulary Ruby] No active profiles match this site.');
      return;
    }

    // Aggregate dictionaries
    // const combinedMap = await processDictionaries(activeConfigs);
    const combinedMap = new Map()
    activeConfigs.forEach(it => {
      const dictCache = loadDictionary(it.id)
      dictCache.forEach((value, key) => {
        combinedMap.set(key, value)
      })
    });

    if (combinedMap.size === 0) {
      console.log('[VocabularyRuby] No entries found in active dictionaries.');
      return;
    }

    // Create matcher
    matcher.value = await createMatcher(combinedMap);
  }

  function toggleObserver(enable: boolean) {

    if (enable && matcher.value) {
      if (observer.value) {
        observer.value.stop();
        observer.value = null;
      }
      observer.value = new DOMObserver(matcher.value);
      observer.value.start();
      return true
    } else {
      if (observer.value) {
        observer.value.stop();
        observer.value = null;
      }
      return false
    }
  };
  return {
    matcher,
    observer,
    prepareMatcher,
    toggleObserver,
  }
}