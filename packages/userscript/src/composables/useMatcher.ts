import { ref } from 'vue'
import { createMatcher } from '../engine/matcher'
import { DOMObserver } from '../engine/observer'
import { createGlobalState } from '@vueuse/core'
import { SiteRule, useDictStore } from './store'

export const useRuby = createGlobalState(() => {
  const observer = new DOMObserver()
  const preparing = ref(false)
  const { running } = observer.status
  const wordsMap = new Map<string, string>()

  const { getDictionaryContent } = useDictStore()

  let restartCallback = () => {}

  async function startWithRule(rule: SiteRule) {
    if (running.value) {
      observer.stop()
    }
    preparing.value = true
    wordsMap.clear()
    for (const id of rule.dictionaries) {
      const text = getDictionaryContent(id)
      const lines = text.value.split(/\r?\n/)
      lines.forEach(line => {
        const pair = line.split(',')
        wordsMap.set(pair[0], pair[1])
      })
    }
    const lines = rule.inlineDictionary.split(/\r?\n/)
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
    restartCallback()
    preparing.value = false
  }
  async function startSimple(dictionaryIDs: string[], _style: string) {
    if (running.value) {
      observer.stop()
    }
    preparing.value = true
    wordsMap.clear()
    for (const id of dictionaryIDs) {
      const text = getDictionaryContent(id)
      const lines = text.value.split(/\r?\n/)
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
    restartCallback()
    preparing.value = false
  }
  function restart() {
    if (running.value) {
      observer.stop()
    }
    preparing.value = true
    restartCallback()
    preparing.value = false
  }
  function stop() {
    observer.stop()
  }
  return {
    preparing,
    running,
    startWithRule,
    startSimple,
    restart,
    stop,
  }
})
