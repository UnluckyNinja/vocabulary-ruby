export interface DictionarySource {
  id: string
  name: string
  isRemote: boolean
  updateURL?: string // Required if isRemote is 'true' 
  content?: string  // Required if isRemote is 'false' (Format: CSV )
}

export type ConfigMode = 'local' | 'remote'

export interface DictConfig {
  id: string
  name: string
  mode: ConfigMode
  // URL to fetch remote config from
  remoteUrl?: string
  // Array of regex strings to match current page URL, true: include, false: exclude
  remoteSiteRegexes: string
  remoteDictionaries: DictionarySource[]
  localSiteRegexes: string,
  localDictionaries: DictionarySource[]
}

/**
 * Metadata for a configuration, stored in the central registry.
 */
export interface ConfigInfo {
  id: string
  name: string
  enabled: boolean
  isRemote: boolean
  lastUpdate?: number
}

/**
 * Structure for full backup and restore.
 */
export interface BackupData {
  registry: ConfigInfo[]
  configs: Record<string, DictConfig>
}

export const REGISTRY_KEY = 'vr_config_registry'
export const CONFIG_PREFIX = 'config:'

export function generateId() {
  return crypto.randomUUID()
}

export function storageConfigKey(id: string) {
  return `${CONFIG_PREFIX}${id}`
}