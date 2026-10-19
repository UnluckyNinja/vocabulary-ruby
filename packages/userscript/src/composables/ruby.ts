import { ref } from 'vue'
import { createMatcher } from '../engine/matcher'
import { DOMObserver } from '../engine/observer'
import { createGlobalState, useStyleTag } from '@vueuse/core'
import { SiteRule, useDictStore } from './store'
import { csvParseRows } from 'd3-dsv'

export const useRuby = createGlobalState(() => {
  const observer = new DOMObserver()
  const preparing = ref(false)
  const { running } = observer.status
  const wordsMap = new Map<string, string>()
  const mode = ref<'simple' | 'rule'>('simple')

  const { getDictionaryContent } = useDictStore()
  const { css, load, unload, isLoaded } = useStyleTag('', { immediate: false, manual: true })

  let restartCallback = () => {}

  async function startWithRule(rule: SiteRule) {
    preparing.value = true
    mode.value = 'rule'
    if (running.value) {
      observer.stop()
    }

    // add style
    css.value = rule.style
    load()

    // collect words
    wordsMap.clear()
    for (const id of rule.dictionaries) {
      const text = getDictionaryContent(id)
      const words = csvParseRows(text.value)
      words.forEach(([key, value]) => {
        wordsMap.set(key, value)
      })
    }
    const words = csvParseRows(rule.inlineDictionary)
    words.forEach(([key, value]) => {
      wordsMap.set(key, value)
    })
    const matcher = await createMatcher(wordsMap)
    restartCallback = () => {
      observer.start(matcher, {
        rootSelector: rule.selector.root,
        targetSelector: rule.selector.target,
        ignoreSelector: rule.selector.ignore,
      })
    }
    restartCallback()
    preparing.value = false
  }
  async function startSimple(dictionaryIDs: string[], style: string) {
    preparing.value = true
    mode.value = 'simple'
    if (running.value) {
      observer.stop()
    }

    // add style
    css.value = style
    load()

    // collect words
    wordsMap.clear()
    for (const id of dictionaryIDs) {
      const text = getDictionaryContent(id)
      const words = csvParseRows(text.value)
      words.forEach(([key, value]) => {
        wordsMap.set(key, value)
      })
    }
    const matcher = await createMatcher(wordsMap)
    restartCallback = () => {
      observer.start(matcher)
    }
    restartCallback()
    preparing.value = false
  }
  function restart() {
    preparing.value = true
    if (running.value) {
      observer.stop()
    }
    load()
    restartCallback()
    preparing.value = false
  }
  function stop() {
    unload()
    css.value = ''
    observer.stop()
  }
  return {
    mode,
    preparing,
    running,
    isCssLoaded: isLoaded,
    startWithRule,
    startSimple,
    restart,
    stop,
  }
})
