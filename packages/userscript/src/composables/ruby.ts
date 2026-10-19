import { ref } from 'vue'
import { createMatcher } from '../engine/matcher'
import { DOMObserver } from '../engine/observer'
import { createGlobalState, useStyleTag } from '@vueuse/core'
import { SiteRule, useDictStore } from './store'

export const useRuby = createGlobalState(() => {
  const observer = new DOMObserver()
  const preparing = ref(false)
  const { running } = observer.status
  const wordsMap = new Map<string, string>()

  const { getDictionaryContent } = useDictStore()
  const { css, load, unload, isLoaded } = useStyleTag('', { immediate: false, manual: true })

  let restartCallback = () => {}

  async function startWithRule(rule: SiteRule) {
    preparing.value = true
    if (running.value) {
      observer.stop()
    }
    wordsMap.clear()
    for (const id of rule.dictionaries) {
      const text = getDictionaryContent(id)
      const lines = text.value.trim().split(/\r?\n/)
      lines.forEach(line => {
        const pair = line.split(',')
        wordsMap.set(pair[0], pair[1])
      })
    }
    const lines = rule.inlineDictionary.trim().split(/\r?\n/)
    lines.forEach(line => {
      const pair = line.split(',')
      wordsMap.set(pair[0], pair[1])
    })
    const matcher = await createMatcher(wordsMap)
    // @TODO add style to page
    restartCallback = () => {
      observer.start(matcher, {
        rootSelector: rule.selector.root,
        targetSelector: rule.selector.target,
        ignoreSelector: rule.selector.ignore,
      })
    }
    css.value = rule.style
    load()
    restartCallback()
    preparing.value = false
  }
  async function startSimple(dictionaryIDs: string[], style: string) {
    preparing.value = true
    if (running.value) {
      observer.stop()
    }
    wordsMap.clear()
    for (const id of dictionaryIDs) {
      const text = getDictionaryContent(id)
      const lines = text.value.trim().split(/\r?\n/)
      lines.forEach(line => {
        const pair = line.split(',')
        wordsMap.set(pair[0], pair[1])
      })
    }
    const matcher = await createMatcher(wordsMap)
    // @TODO add style to page
    restartCallback = () => {
      observer.start(matcher)
    }
    css.value = style
    load()
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
    preparing,
    running,
    isCssLoaded: isLoaded,
    startWithRule,
    startSimple,
    restart,
    stop,
  }
})
