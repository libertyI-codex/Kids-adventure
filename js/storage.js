(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function loadJson(key) {
    var raw = null;
    try {
      raw = global.localStorage.getItem(key);
      if (!raw) return { ok: true, value: null, raw: null };
      return { ok: true, value: JSON.parse(raw), raw: raw };
    } catch (error) {
      return { ok: false, value: null, raw: raw, error: error };
    }
  }

  function saveJson(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error };
    }
  }

  function remove(key) {
    global.localStorage.removeItem(key);
  }

  function estimateBytes(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch (error) {
      return JSON.stringify(value || {}).length * 2;
    }
  }

  function saveBackup(reason, appData, uiState) {
    var backup = {
      createdAt: KA.date.localIsoString(),
      reason: reason,
      appData: appData || null,
      uiState: uiState || null
    };
    return saveJson(KA.constants.STORAGE_KEYS.backup, backup);
  }

  KA.storage = {
    loadJson: loadJson,
    saveJson: saveJson,
    remove: remove,
    estimateBytes: estimateBytes,
    saveBackup: saveBackup
  };
})(window);
