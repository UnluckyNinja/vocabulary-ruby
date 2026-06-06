import { matchRegexURL } from '../utils/regex';
import { CompressedStorage } from '../utils/storage';
import { SelectorConfig, SELECTORS_KEY } from './configType';

/**
 * Gets configs that match the current URL and are enabled.
 */
export function getActiveSelector(url: string): string {
  const selectors = loadSelectors()
  const enabledConfigs = selectors.filter(info => info.enabled);

  for (const config of enabledConfigs) {
    if (matchRegexURL(url, [config.siteRegex])) {
      return config.selector
    }
  }

  return '';
}

function loadSelectors() {
  return CompressedStorage.get<SelectorConfig[]>(SELECTORS_KEY) || []
}
