// Unified Storage Helper
export function getStorage(keys) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, (res) => resolve(res));
    } else {
      const result = {};
      keys.forEach((k) => {
        const val = localStorage.getItem('po_ai_' + k);
        if (val) result[k] = JSON.parse(val);
      });
      resolve(result);
    }
  });
}

export function setStorage(obj) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj, () => resolve(true));
    } else {
      Object.entries(obj).forEach(([k, v]) => {
        localStorage.setItem('po_ai_' + k, JSON.stringify(v));
      });
      resolve(true);
    }
  });
}