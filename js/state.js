(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var appData = null;
  var uiState = null;
  var dataIssue = null;

  function initState() {
    var keys = KA.constants.STORAGE_KEYS;
    var loaded = KA.storage.loadJson(keys.appData);
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
        var result = KA.migrations.migrate(loaded.value);
        appData = result.data;
        if (result.changed) saveAppData();
      } catch (error) {
        dataIssue = error.message;
        appData = KA.migrations.createDefaultAppData();
      }
    }

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
      uiState.lastRoute = uiState.lastRoute || "home";
      uiState.currentLocalDate = KA.date.localDateKey();
      saveUiState();
    }

    ensureTodayRecord();
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

  function ensureTodayRecord() {
    var today = getTodayKey();
    if (!appData.dailyRecords[today]) {
      appData.dailyRecords[today] = makeDailyRecord(today);
      saveAppData();
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
