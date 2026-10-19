import { createGlobalState } from '@vueuse/core'
import { shallowRef } from 'vue'
import { SiteRule, useSiteRuleStore } from './store'

export const useRuleMatch = createGlobalState(() => {
  const currentRule = shallowRef<SiteRule | undefined>(undefined)
  const { bus, listSiteRules } = useSiteRuleStore()
  bus.on(() => {
    reloadCurrentRule()
  })

  function reloadCurrentRule() {
    currentRule.value = getMatchingRule(window.location.href)
  }

  function getMatchingRule(url: string) {
    return listSiteRules().find(rule => {
      if (!rule.enabled) return false
      for (const regexStr of rule.urlRegex) {
        const regex = new RegExp('^' + regexStr)
        if (regex.test(url)) {
          return true
        }
      }
      return false
    })
  }
  return {
    currentRule,
    reloadCurrentRule,
    getMatchingRule,
  }
})
