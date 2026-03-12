import { CompressedStorage } from '../utils/storage';
import { UserConfig, BackupData, ConfigInfo, generateId, REGISTRY_KEY, storageConfigKey } from './configType';
import { GM_addValueChangeListener, GM_removeValueChangeListener, GmValueListenerId } from '$';
import { fetchContent } from '../utils/network';
import { type Ref, watch, WritableComputedRef } from 'vue';
import { createEventHook, tryOnScopeDispose } from '@vueuse/core';

/**
 * Retrieves the lightweight registry of all configurations.
 * @param [withWatchers=true] defaults to true
 */
export function loadRegistry(): ConfigInfo[] {

  return CompressedStorage.get<ConfigInfo[]>(REGISTRY_KEY) || []
}

export function watchRegistryChange(registry: Ref<ConfigInfo[]> | WritableComputedRef<ConfigInfo[]>) {
  const watcherHandle = watch(registry, (newVal)=>{
      saveRegistry(newVal)
  }, { deep: true })

  const gmid = GM_addValueChangeListener(REGISTRY_KEY, (key, oldVal, newVal, remote)=>{
    watcherHandle.pause()
    registry.value = CompressedStorage.get<ConfigInfo[]>(REGISTRY_KEY) ?? []
    watcherHandle.resume()
  })

  function stop() {
    watcherHandle.stop()
    GM_removeValueChangeListener(gmid)
  }

  tryOnScopeDispose(()=>{
    stop()
  })

  return {
    stop,
  }
}

/**
 * Automatically called by vue reactivity
 */
export function saveRegistry(registry: ConfigInfo[] | undefined): void {
  if (registry) {
    CompressedStorage.set(REGISTRY_KEY, registry);
  } else {
    CompressedStorage.delete(REGISTRY_KEY)
  }
}

/**
 * For editing
 */
export function loadConfig(configID: string) {
  return CompressedStorage.get<UserConfig>(storageConfigKey(configID)) || null
}

export function watchConfigChange(config: Ref<UserConfig | null> | WritableComputedRef<UserConfig | null>) {

  const invalidate = createEventHook()

  let gmid: GmValueListenerId | null = null
  if (config.value?.id) {
    gmid = watchGmValueChange(config.value.id)
  }

  let watcherHandle = watchConfig()
  let lastConfigID: string = config.value?.id || ''
  function watchConfig(){
    return watch(config, (newVal)=>{
      if (!newVal || !lastConfigID) {
        if (lastConfigID) {
          watcherHandle.stop()
          if (gmid) {
            GM_removeValueChangeListener(gmid)
          }
        }
        if (newVal) {
          lastConfigID = newVal.id
          watcherHandle = watchConfig()
          gmid = watchGmValueChange(newVal.id)
        }
        return
      }
      if (gmid) {
        GM_removeValueChangeListener(gmid)
      }
      // though this shouldn't happen, just in case
      if (newVal.id !== lastConfigID) {
        console.warn(`Dangerous action detected: changing config's id from ${lastConfigID} to ${newVal.id}.`)
      } else {
        saveConfig(newVal.id, newVal)
        const registry = loadRegistry()
        const config = registry.find(it=>it.id === newVal.id)
        if (config) {
          config.name = newVal.name
          config.isRemote = newVal.mode === 'remote'
          saveRegistry(registry)
        }
      }
      lastConfigID = newVal.id
      gmid = watchGmValueChange(newVal.id)
    }, { deep: true })
  }
  function watchGmValueChange(configID: string){
    return GM_addValueChangeListener(storageConfigKey(configID), (key, oldVal, newVal, remote)=>{
      if (!newVal) {
        invalidate.trigger()
        stop()
        return
      }
      watcherHandle.pause()
      config.value = CompressedStorage.get<UserConfig>(storageConfigKey(configID))!
      watcherHandle.resume()
    })
  }
  function stop(){
    watcherHandle.stop()
    if (gmid) {
      GM_removeValueChangeListener(gmid)
    }
    invalidate.clear()
  }
    
  tryOnScopeDispose(()=>{
    stop()
  })

  return {
    stop,
    onInvalidate: invalidate.on
  }
}

/**
 * Automatically called by vue reactivity
 */
export function saveConfig(id: string, config: UserConfig | undefined): void {
  if (config) {
    CompressedStorage.set(storageConfigKey(id), config);
  } else {
    CompressedStorage.delete(storageConfigKey(id))
  }
}

/**
 * Adds a new configuration, will change config ID if found conflict
 */
export function addConfigToRegistry(config?: UserConfig): UserConfig {
  if (!config) {
    config = createEmptyConfig()
  }
  const registry = loadRegistry()
  while (registry.find(info => info.id === config.id)) {
    config.id = generateId()
  }
  registry.push({
    id: config.id,
    name: config.name,
    enabled: true,
    isRemote: config.mode === 'remote',
    lastUpdate: Date.now(),
  });
  saveRegistry(registry)
  saveConfig(config.id, config)

  return config
}

/**
 * Removes a configuration.
 */
export function deleteConfigFromRegistry(id: string, registry: ConfigInfo[]): void {
  const index = registry.findIndex(it=>it.id === id)
  registry.splice(index, 1)
  saveConfig(id, undefined)
}

/**
 * Gets configs that match the current URL and are enabled.
 */
export function getActiveConfigs(url: string): UserConfig[] {
  const registry = loadRegistry()
  const enabledConfigs = registry.filter(info => info.enabled);
  const activeConfigs: UserConfig[] = [];

  for (const info of enabledConfigs) {
    const config = loadConfig(info.id)
    if (!config) continue
    if (matchUserConfig(url, config)) {
      activeConfigs.push(config);
    }
  }

  return activeConfigs;
}

function matchUserConfig(url: string, config: UserConfig): boolean {

  const remoteStrings = config.remoteSiteRegexes.split('\r?\n').filter(it=>{
    return it && !it.startsWith('//')
  })
  const localStrings = config.localSiteRegexes.split('\r?\n').filter(it=>{
    return it && !it.startsWith('//')
  })

  const regexes = [...remoteStrings, ...localStrings]
  return regexes.reduce((result, regexStr) => {
    if (!regexStr) return false;
    let include = true
    if (regexStr.startsWith('!')) {
      include = false
      regexStr = regexStr.slice(1)
    }
    if (result === include) {
      return result
    }
    try {
      // support exclude pattern starting with "!"
      const regex = new RegExp('^' + regexStr);
      const test = regex.test(url)
      return include ? test : !test;
    } catch (e) {
      console.error(`Invalid regex: ${regexStr}`, e);
      return result;
    }
  }, false)
}

/**
 * Creates an empty local configuration.
 */
export function createEmptyConfig(name: string = 'New Configuration'): UserConfig {
  return {
    id: generateId(),
    name,
    mode: 'local',
    remoteUrl: '',
    remoteSiteRegexes: '',
    remoteDictionaries: [],
    localSiteRegexes: '',
    localDictionaries: []
  };
}
