import { loadConfig, saveConfig } from './index';
import { DictionarySource, generateId, UserConfig } from './configType';

export function createDictionarySource(): DictionarySource {
  return {
    id: generateId(),
    name: 'New Dictionary',
    isRemote: false,
    updateURL: '',
    content: '',
  }
}

export function addDictionaryToConfig(configID: string, dictionary?: DictionarySource): UserConfig {
  if (!dictionary) {
    dictionary = createDictionarySource()
  }
  
  const config = loadConfig(configID)

  if (!config) {
    throw new Error(`Can't found config with id '${configID}'`)
  }

  while (config.localDictionaries.find(dict => dict.id === dictionary.id)) {
    dictionary.id = generateId()
  }

  config.localDictionaries.push(dictionary);
  saveConfig(config.id, config)
  return config
}