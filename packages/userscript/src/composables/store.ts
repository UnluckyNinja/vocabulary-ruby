import {
  GM_deleteValue,
  GM_deleteValues,
  GM_getValue,
  GM_getValues,
  GM_listValues,
  GM_setValue,
} from '$'
import { createGlobalState, useStorage } from '@vueuse/core'
import { ref } from 'vue'

export const useSettings = createGlobalState(() => {
  const showSettings = ref(false)
  const showCreateDictionary = ref(false)
  const showCreateWebsiteRule = ref(false)
  return {
    showSettings,
    showCreateDictionary,
    showCreateWebsiteRule,
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
}

export interface Dictionary {
  id: string
  name: string
  createTime: number
  modifiedTime: number
  type: 'local' | 'network'
  updateURL: string
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
  /**
   * @param options.content will be ignored
   */
  function updateDictionary(id: string, options: DictionaryOptions) {
    if (!dicts.value.has(id)) {
      throw new Error(`Can't update, dictionary with ID doesn't exist: ${id}`)
    }
    const dict = dicts.value.get(id)!
    dict.name = options.name
    dict.type = options.type
    if (options.type === 'network') {
      dict.updateURL = options.updateURL
    }
  }
  function updateDictionaryContent(id: string, content: string) {
    if (!dicts.value.has(id)) {
      throw new Error(`Can't update, dictionary with ID doesn't exist: ${id}`)
    }
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
