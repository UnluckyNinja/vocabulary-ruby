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
 * Define root selectors for websites
 */
export interface SelectorConfig {
  id: string
  name: string
  enabled: boolean
  siteRegex: string
  selector: string
}

/**
 * Define styling for websites
 */
export interface StyleConfig {
  id: string
  name: string
  enabled: boolean
  siteRegex: string
  style: string
}

/**
 * Structure for full backup and restore.
 */
export interface BackupData {
  registry: ConfigInfo[]
  configs: Record<string, DictConfig>
  selectors: Record<string, SelectorConfig>
  styles: Record<string, StyleConfig>
}

export const REGISTRY_KEY = 'vr_config_registry'
export const SELECTORS_KEY = 'vr_selector_config'
export const STYLES_KEY = 'vr_style_config'
export const CONFIG_PREFIX = 'config:'

export function generateId() {
  return crypto.randomUUID()
}

export function storageConfigKey(id: string) {
  return `${CONFIG_PREFIX}${id}`
}