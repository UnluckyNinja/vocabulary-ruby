export type DictionaryType = 'remote' | 'manual';

export interface DictionarySource {
  id: string;
  name: string;
  type: DictionaryType;
  enabled: boolean;
  url?: string;      // Required if type is 'remote'
  content?: string;  // Required if type is 'manual' (Format: CSV or JSON string)
}

export type ConfigMode = 'local' | 'remote';

export interface UserConfig {
  id: string;
  name: string;
  mode: ConfigMode;
  // URL to fetch remote config from
  remoteUrl?: string;
  // Array of regex strings to match current page URL, true: include, false: exclude
  remoteSiteRegexes: string[];
  remoteDictionaries: DictionarySource[];
  localSiteRegexes: string[],
  localDictionaries: DictionarySource[];
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
  registry: ConfigInfo[];
  configs: Record<string, UserConfig>;
}

export const REGISTRY_KEY = 'vr_config_registry';
export const CONFIG_PREFIX = 'config:';

export function generateId() {
  return crypto.randomUUID();
}

export function storageConfigKey(id: string) {
  return `${CONFIG_PREFIX}${id}`
}