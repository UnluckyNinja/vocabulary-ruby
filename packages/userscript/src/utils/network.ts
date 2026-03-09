import { GM_xmlhttpRequest } from '$';

/**
 * Fetches content from a URL, avoids cors
 */
export async function fetchContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: (response) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.responseText);
        } else {
          reject(new Error(`Failed to fetch content: ${response.status} ${response.statusText}`));
        }
      },
      onerror: (err) => reject(err),
    });
  });
}