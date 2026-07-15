(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var appData = null;
  var uiState = null;
  var dataIssue = null;

  function bootMark(stage) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.mark) {
      global.KodomoAdventureBoot.mark(stage);
    }
  }

  function initState() {
    var keys = KA.constants.STORAGE_KEYS;
    bootMark("STATE_INIT_STARTED");
    bootMark("STORAGE_READ_STARTED");
    var loaded = KA.storage.loadJson(keys.appData);
    bootMark("STORAGE_READ_COMPLETED");
    if (!loaded.ok) {
      dataIssue = "保存データを読み込めませんでした。初期データで起動しています。";
      KA.storage.saveBackup("corrupt_appData_parse", { raw: loaded.raw, error: String(loaded.error) }, null);
      appData = KA.migrations.createDefaultAppData();
      KA.storage.saveJson(keys.appData, appData);
    } else if (!loaded.value) {
      appData = KA.migrations.createDefaultAppData();
      KA.storage.saveJson(keys.appData, appData);
    } else {
      try {
        bootMark("MIGRATION_STARTED");
        var result = KA.migrations.migrate(loaded.value);
        bootMark("MIGRATION_COMPLETED");
        appData = result.data;
        if (result.changed) saveAppData();
      } catch (error) {
        dataIssue = error.message;
        appData = KA.migrations.createDefaultAppData();
      }
    }

    bootMark("UI_STATE_STARTED");
    var uiLoaded = KA.storage.loadJson(keys.uiState);
    if (!uiLoaded.ok || !uiLoaded.value) {
      uiState = KA.migrations.createDefaultUiState();
      KA.storage.saveJson(keys.uiState, uiState);
    } else {
      uiState = uiLoaded.value;
      uiState.schemaVersion = uiState.schemaVersion || KA.constants.SCHEMA_VERSION;
      uiState.activeProfileId = uiState.activeProfileId || KA.constants.PROFILE_ID;
      uiState.coloringDrafts = uiState.coloringDrafts || {};
      uiState.selectedColor = uiState.selectedColor || KA.constants.COLOR_PALETTE[1].value;
      uiState.selectedWorldId = uiState.selectedWorldId || KA.constants.WORLD_ID;
      if (KA.worlds && !KA.worlds.isValidWorldId(uiState.selectedWorldId)) {
        uiState.selectedWorldId = KA.constants.WORLD_ID;
      } else if (!KA.worlds) {
        var ids = (KA.constants.WORLD_DEFINITIONS || []).map(function (world) { return world.id; });
        if (ids.indexOf(uiState.selectedWorldId) < 0) uiState.selectedWorldId = KA.constants.WORLD_ID;
      }
      uiState.lastRoute = uiState.lastRoute || "home";
      uiState.currentLocalDate = KA.date.localDateKey();
      saveUiState();
    }
    bootMark("UI_STATE_COMPLETED");

    ensureTodayRecord();
    bootMark("STATE_INIT_COMPLETED");
    return { appData: appData, uiState: uiState, dataIssue: dataIssue };
  }

  function getAppData() {
    return appData;
  }

  function getUiState() {
    return uiState;
  }

  function saveAppData() {
    appData.updatedAt = KA.date.localIsoString();
    var result = KA.storage.saveJson(KA.constants.STORAGE_KEYS.appData, appData);
    return result;
  }

  function saveUiState() {
    uiState.lastOpenedAt = KA.date.localIsoString();
    return KA.storage.saveJson(KA.constants.STORAGE_KEYS.uiState, uiState);
  }

  function update(mutator) {
    mutator(appData, uiState);
    ensureTodayRecord();
    var appResult = saveAppData();
    var uiResult = saveUiState();
    return appResult.ok && uiResult.ok;
  }

  function getTodayKey() {
    return KA.date.localDateKey();
  }

  function makeDailyRecord(dateKey) {
    var key = dateKey || getTodayKey();
    return {
      recordId: "daily_" + key + "_" + appData.profile.profileId,
      profileId: appData.profile.profileId,
      localDate: key,
      createdAt: KA.date.localIsoString(),
      updatedAt: KA.date.localIsoString(),
      completedTasks: [],
      earnedStarsToday: 0,
      artworkIds: [],
      forestPlacementIds: [],
      parentNotes: {},
      corrections: []
    };
  }

  function normalizeDailyRecord(record, dateKey) {
    var defaults = makeDailyRecord(dateKey);
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return defaults;
    }
    record.recordId = record.recordId || defaults.recordId;
    record.profileId = record.profileId || defaults.profileId;
    record.localDate = record.localDate || defaults.localDate;
    record.createdAt = record.createdAt || defaults.createdAt;
    record.updatedAt = record.updatedAt || defaults.updatedAt;
    record.completedTasks = Array.isArray(record.completedTasks) ? record.completedTasks : [];
    record.earnedStarsToday = Number(record.earnedStarsToday || 0);
    record.artworkIds = Array.isArray(record.artworkIds) ? record.artworkIds : [];
    record.forestPlacementIds = Array.isArray(record.forestPlacementIds) ? record.forestPlacementIds : [];
    record.parentNotes = record.parentNotes && typeof record.parentNotes === "object" && !Array.isArray(record.parentNotes) ? record.parentNotes : {};
    record.corrections = Array.isArray(record.corrections) ? record.corrections : [];
    return record;
  }

  function ensureTodayRecord() {
    var today = getTodayKey();
    if (!appData.dailyRecords[today]) {
      appData.dailyRecords[today] = makeDailyRecord(today);
      saveAppData();
    } else {
      var before = JSON.stringify(appData.dailyRecords[today]);
      appData.dailyRecords[today] = normalizeDailyRecord(appData.dailyRecords[today], today);
      if (before !== JSON.stringify(appData.dailyRecords[today])) saveAppData();
    }
    if (uiState) {
      uiState.currentLocalDate = today;
    }
    return appData.dailyRecords[today];
  }

  function getDailyRecord(dateKey) {
    var key = dateKey || getTodayKey();
    if (!appData.dailyRecords[key]) {
      appData.dailyRecords[key] = makeDailyRecord(key);
      saveAppData();
    } else {
      var before = JSON.stringify(appData.dailyRecords[key]);
      appData.dailyRecords[key] = normalizeDailyRecord(appData.dailyRecords[key], key);
      if (before !== JSON.stringify(appData.dailyRecords[key])) saveAppData();
    }
    return appData.dailyRecords[key];
  }

  function resetAllData() {
    appData = KA.migrations.createDefaultAppData();
    uiState = KA.migrations.createDefaultUiState();
    saveAppData();
    saveUiState();
  }

  function replaceAllData(nextAppData, nextUiState) {
    var ensured = KA.migrations.ensureDataShape(nextAppData);
    appData = ensured.data;
    uiState = nextUiState || KA.migrations.createDefaultUiState();
    uiState.activeProfileId = appData.profile.profileId || KA.constants.PROFILE_ID;
    uiState.currentLocalDate = KA.date.localDateKey();
    ensureTodayRecord();
    saveAppData();
    saveUiState();
  }

  KA.state = {
    init: initState,
    getAppData: getAppData,
    getUiState: getUiState,
    saveAppData: saveAppData,
    saveUiState: saveUiState,
    update: update,
    getTodayKey: getTodayKey,
    getDailyRecord: getDailyRecord,
    ensureTodayRecord: ensureTodayRecord,
    resetAllData: resetAllData,
    replaceAllData: replaceAllData,
    getDataIssue: function () { return dataIssue; }
  };
})(window);
