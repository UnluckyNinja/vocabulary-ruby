import {
  GM_deleteValue,
  GM_deleteValues,
  GM_getValue,
  GM_getValues,
  GM_listValues,
  GM_setValue,
} from '$'
import { createGlobalState, useEventBus, useStorage } from '@vueuse/core'
import { ref } from 'vue'

export const defaultStyle = `
ruby {
  ruby-position: over;
}

rt {
  font-size: 0.875em;
  color: #888;
}
`

export const useSettings = createGlobalState(() => {
  const showSettings = ref(false)
  const showCreateDictionary = ref(false)
  const showCreateSiteRule = ref(false)
  const quickDicts = useStorage('quickDicts', [] as string[], GMStorage)
  const quickStyle = useStorage('quickStyle', defaultStyle, GMStorage)

  return {
    showSettings,
    showCreateDictionary,
    showCreateSiteRule,
    quickDicts,
    quickStyle,
  }
})

export const GMStorage = {
  get length() {
    return GM_listValues().length
  },
  clear: function (): void {
    GM_deleteValues(GM_getValues())
  },
  getItem: function (key: string): string | null {
    return GM_getValue(key)
  },
  key: function (index: number): string | null {
    return GM_getValues()[index]
  },
  removeItem: function (key: string): void {
    GM_deleteValue(key)
  },
  setItem: function (key: string, value: string): void {
    GM_setValue(key, value)
  },
} satisfies Storage

export interface DictionaryOptions {
  name: string
  type: 'local' | 'network'
  updateURL: string
  content: string
  filter: {
    minLength: number
  }
}

export interface Dictionary {
  id: string
  name: string
  createTime: number
  modifiedTime: number
  type: 'local' | 'network'
  updateURL: string
  filter: {
    minLength: number
  }
}

function toContentID(id: string) {
  return `contentID:${id}`
}

export const useDictStore = createGlobalState(() => {
  const dicts = useStorage('dictionary', new Map<string, Dictionary>(), GMStorage)

  function saveContent(id: string, content: string) {
    const contentID = toContentID(id)
    GMStorage.setItem(contentID, content)
  }

  function addDictionary(options: DictionaryOptions) {
    let id = ''
    while (!id || dicts.value.has(id)) {
      id = window.crypto.randomUUID()
    }
    const timestamp = Date.now()
    dicts.value.set(id, {
      id,
      name: options.name,
      createTime: timestamp,
      modifiedTime: timestamp,
      type: options.type,
      updateURL: options.type === 'network' ? options.updateURL : '',
      filter: {
        minLength: options.filter.minLength,
      },
    })
    saveContent(id, options.content)
    return id
  }

  function getDictionary(id: string) {
    return dicts.value.get(id)
  }
  function getDictionaryContent(id: string) {
    if (!dicts.value.has(id)) {
      throw new Error(`There is no dictionary with ID ${id}`)
    }
    return useStorage(toContentID(id), '', GMStorage)
  }
  function deleteDictionary(id: string) {
    return dicts.value.delete(id)
  }

  function updateDictionary(id: string, options: Partial<DictionaryOptions>) {
    if (!dicts.value.has(id)) {
      throw new Error(`Can't update, dictionary with ID doesn't exist: ${id}`)
    }
    const dict = dicts.value.get(id)!
    dict.name = options.name ?? dict.name
    dict.type = options.type ?? dict.type
    if (options.type === 'network') {
      dict.updateURL = options.updateURL ?? dict.updateURL
    }
    if (options.content !== undefined) {
      saveContent(id, options.content)
    }
    dict.filter.minLength = options.filter?.minLength ?? dict.filter.minLength
  }
  function updateDictionaryContent(id: string, content: string) {
    if (!dicts.value.has(id)) {
      throw new Error(`Can't update, dictionary with ID doesn't exist: ${id}`)
    }
    const dict = dicts.value.get(id)!
    dict.modifiedTime = Date.now()
    saveContent(id, content)
  }
  function listDictionaries() {
    return dicts.value.values()
  }
  return {
    addDictionary,
    getDictionary,
    getDictionaryContent,
    deleteDictionary,
    updateDictionary,
    updateDictionaryContent,
    listDictionaries,
  }
})

export interface SiteRuleOptions {
  name: string
  enabled: boolean
  urlRegex: string[]
  dictionaries: string[]
  inlineDictionary: string
  style: string
  selector: {
    root: string
    target: string
    ignore: string
  }
}

export interface SiteRule {
  // reason not using url as ID: to allow easy duplication
  id: string
  name: string
  enabled: boolean
  urlRegex: string[]
  createTime: number
  modifiedTime: number
  dictionaries: string[]
  inlineDictionary: string
  style: string
  selector: {
    root: string
    target: string
    ignore: string
  }
}
export const useSiteRuleStore = createGlobalState(() => {
  const rules = useStorage('site-rule', new Map<string, SiteRule>(), GMStorage)
  const bus = useEventBus('site-rule-change')

  function addSiteRule(options: SiteRuleOptions) {
    let id = ''
    while (!id || rules.value.has(id)) {
      id = window.crypto.randomUUID()
    }
    const timestamp = Date.now()
    const rule = {
      id,
      name: options.name,
      enabled: options.enabled,
      urlRegex: options.urlRegex,
      createTime: timestamp,
      modifiedTime: timestamp,
      dictionaries: options.dictionaries,
      inlineDictionary: options.inlineDictionary,
      selector: options.selector,
      style: options.style,
    }
    rules.value.set(id, rule)
    bus.emit('add', rule)
    return rule
  }

  function getSiteRule(id: string) {
    return rules.value.get(id)
  }
  function deleteSiteRule(id: string) {
    const rule = rules.value.get(id)
    bus.emit('delete', rule)
    return rules.value.delete(id)
  }

  function updateSiteRule(id: string, options: Partial<SiteRuleOptions>) {
    if (!rules.value.has(id)) {
      throw new Error(`Can't update, dictionary with ID doesn't exist: ${id}`)
    }
    const rule = rules.value.get(id)!
    rule.name = options.name ?? rule.name
    rule.enabled = options.enabled ?? rule.enabled
    rule.urlRegex = options.urlRegex ?? rule.urlRegex
    rule.modifiedTime = Date.now()
    rule.dictionaries = options.dictionaries ?? rule.dictionaries
    rule.inlineDictionary = options.inlineDictionary ?? rule.inlineDictionary
    rule.selector = options.selector ?? rule.selector
    rule.style = options.style ?? rule.style

    bus.emit('update', rule)
  }

  function listSiteRules() {
    return rules.value.values()
  }

  return {
    bus,
    addSiteRule,
    getSiteRule,
    deleteSiteRule,
    updateSiteRule,
    listSiteRules,
  }
})
