
export function matchRegexURL(url: string, regexes: string[]) {
  return regexes.reduce((result, regexStr) => {
    if (!regexStr) return result;
    let include = true
    // support exclude pattern starting with "!"
    if (regexStr.startsWith('!')) {
      include = false
      regexStr = regexStr.slice(1)
    }
    if (result === include) {
      return result
    }
    try {
      const regex = new RegExp('^' + regexStr);
      const test = regex.test(url)
      return include ? test : !test;
    } catch (e) {
      console.error(`Invalid regex: ${regexStr}`, e);
      return result;
    }
  }, false)
}