import { CompressedStorage } from './storage';
import { UserConfig, BackupData, ConfigInfo, generateId, REGISTRY_KEY, storageConfigKey } from './configType';
import { GM_addValueChangeListener, GM_removeValueChangeListener, GmValueListenerId } from '$';
import { fetchContent } from './network';
import { type Ref, ref, watch } from 'vue';
import { tryOnScopeDispose } from '@vueuse/core';

/**
 * Retrieves the lightweight registry of all configurations.
 * @param [withWatchers=true] defaults to true
 */
export function loadRegistry(withWatchers = true): Ref<ConfigInfo[]> {

  const registry = ref<ConfigInfo[]>(CompressedStorage.get<ConfigInfo[]>(REGISTRY_KEY) || [])
  if (withWatchers) {
    const watcherHandle = watch(registry, (newVal)=>{
      saveRegistry(newVal)
    })

    const gmid = GM_addValueChangeListener(REGISTRY_KEY, (key, oldVal, newVal, remote)=>{
      if (!remote) {
        return
      }
      watcherHandle.pause()
      registry.value = newVal
      watcherHandle.resume()
    })

    tryOnScopeDispose(()=>{
      watcherHandle.stop()
      GM_removeValueChangeListener(gmid)
    })
  }

  return registry
}

/**
 * Automatically called by vue reactivity
 */
function saveRegistry(registry: ConfigInfo[] | undefined): void {
  if (registry) {
    CompressedStorage.set(REGISTRY_KEY, registry);
  } else {
    CompressedStorage.delete(REGISTRY_KEY)
  }
}

/**
 * For editing
 */
export function loadConfig(configID: string, withWatchers = true) {
  const config = ref(CompressedStorage.get<UserConfig>(storageConfigKey(configID)) || null)
  if (withWatchers) {
    const gmid = ref<GmValueListenerId | null>(null)

    const watcherHandle = watch(config, (newVal, oldVal)=>{
      // first remove local GM listener in case conflict editing
      if (gmid.value) {
        GM_removeValueChangeListener(gmid.value)
      }
      // if old -> null, delete old
      if (!newVal) {
        if (oldVal) {
          saveConfig(oldVal.id, undefined)
        }
        return
      }
      // if null -> new, save new
      if (!oldVal) {
        if (newVal) {
          saveConfig(newVal.id, newVal)
          watchGmValueChange(newVal.id)
        }
        return
      }
      // though this shouldn't happen, just in case
      if (newVal.id !== oldVal.id) {
        saveConfig(oldVal.id, undefined)
      }
      saveConfig(newVal.id, newVal)
      watchGmValueChange(newVal.id)
    })

    function watchGmValueChange(configID: string){
      gmid.value = GM_addValueChangeListener(storageConfigKey(configID), (key, oldVal, newVal, remote)=>{
        watcherHandle.pause()
        if (!newVal) {
          watcherHandle.stop()
          if (gmid.value) {
            GM_removeValueChangeListener(gmid.value)
          }
          config.value = null
          return
        }
        config.value = CompressedStorage.get<UserConfig>(storageConfigKey(configID))!
        watcherHandle.resume()
      })
    }
      
    tryOnScopeDispose(()=>{
      watcherHandle.stop()
      if (gmid.value) {
        GM_removeValueChangeListener(gmid.value)
      }
    })
  }

  return config
}

/**
 * Automatically called by vue reactivity
 */
function saveConfig(id: string, config: UserConfig | undefined): void {
  if (config) {
    CompressedStorage.set(storageConfigKey(id), config);
  } else {
    CompressedStorage.delete(storageConfigKey(id))
  }
}

/**
 * Adds a new configuration, will change config ID if found conflict
 */
export function createConfigInRegistry(registry: ConfigInfo[], config?: UserConfig): UserConfig {
  if (!config) {
    config = createEmptyConfig()
  }
  while (registry.find(info => info.id === config.id)) {
    config.id = generateId()
  }
  registry.push({
    id: config.id,
    name: config.name,
    enabled: false,
    isRemote: config.mode === 'remote',
    lastUpdate: Date.now(),
  });
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
export function getActiveConfigs(url: string, registry: ConfigInfo[]): UserConfig[] {
  const enabledConfigs = registry.filter(info => info.enabled);
  const activeConfigs: UserConfig[] = [];

  for (const info of enabledConfigs) {
    const config = loadConfig(info.id, false)
    if (!config.value) continue
    if (matchUserConfig(url, config.value)) {
      activeConfigs.push(config.value);
    }
  }

  return activeConfigs;
}

function matchUserConfig(url: string, config: UserConfig): boolean {
  const regexes = [...config.remoteSiteRegexes, ...config.localSiteRegexes]
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
    remoteSiteRegexes: [],
    remoteDictionaries: [],
    localSiteRegexes: [],
    localDictionaries: []
  };
}

/**
 * Exports a single configuration to a JSON string.
 */
export function exportConfig(config: UserConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Imports a single configuration.
 */
export function importConfig(json: string, registry: ConfigInfo[]): UserConfig | null {
  // @TODO add zod validation
  try {
    const config = JSON.parse(json) as UserConfig;

    config.id = generateId();
    createConfigInRegistry(registry, config)
    return config;
  } catch (e) {
    console.error('Failed to import config:', e);
    return null;
  }
}

/**
 * Imports a single configuration from url.
 */
export async function importRemoteConfig(url: string, registry: ConfigInfo[]): Promise<UserConfig | null> {
  // @TODO add zod validation
  try {
    const json = await fetchContent(url)
    const config = JSON.parse(json) as UserConfig;

    config.id = generateId();
    config.mode = 'remote'
    createConfigInRegistry(registry, config)
    return config;
  } catch (e) {
    console.error('Failed to import remote config:', e);
    return null;
  }
}
/**
 * Exports ALL configurations and the registry for backup.
 */
export function exportAll(): string {
  const registry = loadRegistry(false);
  const configs: Record<string, UserConfig> = {};

  registry.value.forEach(info => {
    const fullConfig = loadConfig(info.id, false);
    if (fullConfig.value) {
      configs[info.id] = fullConfig.value;
    }
  });

  const backup: BackupData = { registry: registry.value, configs };
  return JSON.stringify(backup, null, 2);
}


/**
 * Restores ALL configurations from a backup JSON.
 * Make sure to show a warning in UI!
 */
export function importAll(json: string): boolean {
  try {
    const data = JSON.parse(json) as BackupData;
    if (!Array.isArray(data.registry) || !data.configs) {
      throw new Error('Invalid backup format');
    }

    // Clear existing configs first
    const currentRegistry = loadRegistry(false);
    currentRegistry.value.forEach(info => CompressedStorage.delete(storageConfigKey(info.id)));

    // Save new registry and individual configs
    saveRegistry(data.registry);
    Object.entries(data.configs).forEach(([id, config]) => {
      saveConfig(id, config);
    });

    return true;
  } catch (e) {
    console.error('Failed to restore backup:', e);
    return false;
  }
}
