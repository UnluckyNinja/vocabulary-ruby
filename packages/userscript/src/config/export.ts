import { addConfigToRegistry, loadRegistry, loadConfig, saveRegistry, saveConfig } from './index';
import { fetchContent } from '../utils/network';
import { CompressedStorage } from '../utils/storage';
import { generateId, BackupData, storageConfigKey, UserConfig } from './configType';

/**
 * Exports a single configuration to a JSON string.
 */
export function exportConfig(config: UserConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Imports a single configuration.
 */
export function importConfig(json: string): UserConfig | null {
  // @TODO add zod validation
  try {
    const config = JSON.parse(json) as UserConfig;

    config.id = generateId();
    addConfigToRegistry(config)
    return config;
  } catch (e) {
    console.error('Failed to import config:', e);
    return null;
  }
}

/**
 * Imports a single configuration from url.
 */
export async function importRemoteConfig(url: string): Promise<UserConfig | null> {
  // @TODO add zod validation
  try {
    const json = await fetchContent(url)
    const config = JSON.parse(json) as UserConfig;

    config.id = generateId();
    config.mode = 'remote'
    addConfigToRegistry(config)
    return config;
  } catch (e) {
    console.error('Failed to import remote config:', e);
    return null;
  }
}

/**
 * Imports a single configuration from url.
 */
export async function updateConfig(id: string): Promise<void> {
  // @TODO add zod validation
  try {
    const config = loadConfig(id)
    if (!config?.remoteUrl) {
      return
    }
    const json = await fetchContent(config.remoteUrl)
    const remoteConfig = JSON.parse(json) as UserConfig;
    config.remoteSiteRegexes = remoteConfig.remoteSiteRegexes
    config.remoteDictionaries = remoteConfig.remoteDictionaries

    saveConfig(id, config)
  } catch (e) {
    console.error('Failed to update config:' + id, e);
    return;
  }
}
/**
 * Exports ALL configurations and the registry for backup.
 */
export function exportAll(): string {
  const registry = loadRegistry();
  const configs: Record<string, UserConfig> = {};

  registry.forEach(info => {
    const fullConfig = loadConfig(info.id);
    if (fullConfig) {
      configs[info.id] = fullConfig;
    }
  });

  const backup: BackupData = { registry, configs };
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
    const currentRegistry = loadRegistry();
    currentRegistry.forEach(info => CompressedStorage.delete(storageConfigKey(info.id)));

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
