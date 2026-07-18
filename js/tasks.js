(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var MAX_CUSTOM_JOBS = 20;
  var MAX_DAILY_SELECTION_DAYS = 60;
  var ICON_KEYS = ["toybox", "broom", "dish", "clothes", "book", "plant", "bag", "star"];

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function unique(values) {
    var seen = {};
    return array(values).filter(function (value) {
      var key = String(value || "");
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function clampInteger(value, minimum, maximum, fallback) {
    var number = Number(value);
    if (!isFinite(number)) number = fallback;
    number = Math.floor(number);
    return Math.max(minimum, Math.min(maximum, number));
  }

  function cleanText(value, maximum) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "")
      .slice(0, maximum);
  }

  function standardIds() {
    return KA.constants.DEFAULT_TASKS.map(function (task) { return task.taskId; });
  }

  function standardIdMap() {
    var map = {};
    standardIds().forEach(function (id) { map[id] = true; });
    return map;
  }

  function defaultJobSettings() {
    return {
      dailyDisplayCount: clampInteger(KA.constants.DEFAULT_JOB_DISPLAY_COUNT, 1, 10, 7),
      enabledJobIds: standardIds(),
      displayOrder: standardIds(),
      customJobs: [],
      dailySelectionsByDate: {}
    };
  }

  function normalizeCustomJobs(value) {
    var official = standardIdMap();
    var used = {};
    var normalized = [];
    array(value).forEach(function (job) {
      if (!job || typeof job !== "object" || Array.isArray(job) || normalized.length >= MAX_CUSTOM_JOBS) return;
      var id = cleanText(job.id, 80);
      var name = cleanText(job.name, 20);
      if (!/^custom_job_[A-Za-z0-9_-]+$/.test(id) || official[id] || used[id] || !name) return;
      used[id] = true;
      normalized.push({
        id: id,
        name: name,
        description: cleanText(job.description, 60),
        iconKey: ICON_KEYS.indexOf(job.iconKey) >= 0 ? job.iconKey : "star",
        enabled: job.enabled !== false,
        createdAt: job.createdAt || KA.date.localIsoString(),
        updatedAt: job.updatedAt || job.createdAt || KA.date.localIsoString()
      });
    });
    return normalized;
  }

  function ensureJobSettings(appData) {
    var data = appData || (KA.state && KA.state.getAppData ? KA.state.getAppData() : {});
    var raw = data.jobSettings;
    var settings = object(raw);
    var hadSettings = raw && typeof raw === "object" && !Array.isArray(raw);
    var defaults = defaultJobSettings();
    var officialIds = standardIds();
    var validMap = standardIdMap();
    var customJobs = normalizeCustomJobs(settings.customJobs);
    customJobs.forEach(function (job) { validMap[job.id] = true; });

    var order = unique(settings.displayOrder).filter(function (id) { return validMap[id]; });
    officialIds.concat(customJobs.map(function (job) { return job.id; })).forEach(function (id) {
      if (order.indexOf(id) < 0) order.push(id);
    });

    var enabled;
    if (hadSettings && Array.isArray(settings.enabledJobIds)) {
      enabled = unique(settings.enabledJobIds).filter(function (id) { return validMap[id]; });
    } else {
      enabled = officialIds.concat(customJobs.filter(function (job) { return job.enabled !== false; }).map(function (job) { return job.id; }));
    }
    if (!enabled.length && order.length) enabled.push(order[0]);

    customJobs.forEach(function (job) {
      job.enabled = enabled.indexOf(job.id) >= 0;
    });

    var selections = {};
    var rawSelections = object(settings.dailySelectionsByDate);
    Object.keys(rawSelections).filter(function (dateKey) {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
    }).sort().slice(-MAX_DAILY_SELECTION_DAYS).forEach(function (dateKey) {
      selections[dateKey] = unique(rawSelections[dateKey]).filter(function (id) { return validMap[id]; });
    });

    data.jobSettings = {
      dailyDisplayCount: clampInteger(settings.dailyDisplayCount, 1, 10, defaults.dailyDisplayCount),
      enabledJobIds: enabled,
      displayOrder: order,
      customJobs: customJobs,
      dailySelectionsByDate: selections
    };

    array(data.tasks).forEach(function (task) {
      if (!task || !validMap[task.taskId] || !standardIdMap()[task.taskId]) return;
      task.active = enabled.indexOf(task.taskId) >= 0;
    });
    return data.jobSettings;
  }

  function customRuntimeTask(job) {
    return {
      taskId: job.id,
      title: job.name,
      description: job.description,
      icon: "",
      iconKey: job.iconKey,
      category: "custom",
      rewardStars: 1,
      active: job.enabled !== false,
      isCustom: true,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  function allTasks() {
    var data = KA.state.getAppData();
    var settings = ensureJobSettings(data);
    var map = {};
    array(data.tasks).forEach(function (task) {
      if (!task || standardIds().indexOf(task.taskId) < 0) return;
      task.isCustom = false;
      task.active = settings.enabledJobIds.indexOf(task.taskId) >= 0;
      map[task.taskId] = task;
    });
    settings.customJobs.forEach(function (job) {
      map[job.id] = customRuntimeTask(job);
    });
    return settings.displayOrder.map(function (id) { return map[id]; }).filter(Boolean);
  }

  function enabledTasks() {
    var settings = ensureJobSettings(KA.state.getAppData());
    return allTasks().filter(function (task) {
      return settings.enabledJobIds.indexOf(task.taskId) >= 0;
    });
  }

  function hashString(value) {
    var hash = 2166136261;
    var string = String(value || "");
    var index;
    for (index = 0; index < string.length; index += 1) {
      hash ^= string.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }

  function pruneSelections(settings) {
    var keys = Object.keys(settings.dailySelectionsByDate).filter(function (key) {
      return /^\d{4}-\d{2}-\d{2}$/.test(key);
    }).sort();
    while (keys.length > MAX_DAILY_SELECTION_DAYS) {
      delete settings.dailySelectionsByDate[keys.shift()];
    }
  }

  function dailyTasks(dateKey) {
    var data = KA.state.getAppData();
    var settings = ensureJobSettings(data);
    var selectionsBefore = JSON.stringify(settings.dailySelectionsByDate);
    var key = dateKey || (KA.state.getTodayKey ? KA.state.getTodayKey() : KA.date.localDateKey());
    var enabled = enabledTasks();
    var enabledMap = {};
    enabled.forEach(function (task) { enabledMap[task.taskId] = task; });
    var limit = Math.min(settings.dailyDisplayCount, enabled.length);
    var saved = unique(settings.dailySelectionsByDate[key]).filter(function (id) { return enabledMap[id]; }).slice(0, limit);
    if (saved.length < limit) {
      enabled.slice().sort(function (a, b) {
        var scoreA = hashString(key + "|" + a.taskId);
        var scoreB = hashString(key + "|" + b.taskId);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.taskId.localeCompare(b.taskId);
      }).forEach(function (task) {
        if (saved.length < limit && saved.indexOf(task.taskId) < 0) saved.push(task.taskId);
      });
    }
    settings.dailySelectionsByDate[key] = saved;
    pruneSelections(settings);
    if (selectionsBefore !== JSON.stringify(settings.dailySelectionsByDate) && KA.state && KA.state.saveAppData) {
      KA.state.saveAppData();
    }
    var selectedMap = {};
    saved.forEach(function (id) { selectedMap[id] = true; });
    return enabled.filter(function (task) { return selectedMap[task.taskId]; });
  }

  function activeTasks() {
    return dailyTasks();
  }

  function isCompleted(taskId, dateKey) {
    var record = KA.state.getDailyRecord(dateKey);
    return array(record.completedTasks).some(function (item) {
      return item.taskId === taskId && item.status === "completed";
    });
  }

  function completedToday() {
    var record = KA.state.getDailyRecord();
    return array(record.completedTasks).filter(function (item) {
      return item.status === "completed";
    });
  }

  function completedDailyTasks() {
    var selected = {};
    dailyTasks().forEach(function (task) { selected[task.taskId] = true; });
    return completedToday().filter(function (item) { return selected[item.taskId]; });
  }

  function completeTask(taskId) {
    var task = dailyTasks().filter(function (item) { return item.taskId === taskId; })[0];
    if (!task || task.active === false) return { ok: false, reason: "task_not_available" };
    if (isCompleted(taskId)) return { ok: false, reason: "already_completed" };

    var ledger = KA.stars.earnTask(task);
    var record = KA.state.getDailyRecord();
    record.completedTasks.push({
      taskId: task.taskId,
      taskTitle: task.title,
      taskIcon: task.icon || "",
      taskIconKey: task.iconKey || null,
      taskDescription: task.description || "",
      completedAt: KA.date.localIsoString(),
      rewardStars: Number(task.rewardStars || 0),
      ledgerId: ledger.id,
      status: "completed"
    });
    record.earnedStarsToday = Number(record.earnedStarsToday || 0) + Number(task.rewardStars || 0);
    record.updatedAt = KA.date.localIsoString();
    var eggGrowth = KA.eggs && KA.eggs.recordTaskBonusIfEligible ? KA.eggs.recordTaskBonusIfEligible() : null;
    KA.state.saveAppData();
    return { ok: true, task: task, ledger: ledger, eggGrowth: eggGrowth };
  }

  function undoTask(taskId) {
    var data = KA.state.getAppData();
    var task = allTasks().filter(function (item) { return item.taskId === taskId; })[0];
    var record = KA.state.getDailyRecord();
    var completion = array(record.completedTasks).filter(function (item) {
      return item.taskId === taskId && item.status === "completed";
    })[0];
    if (!completion) return { ok: false, reason: "not_completed" };
    task = task || {
      taskId: taskId,
      title: completion.taskTitle || "以前のおしごと",
      rewardStars: Number(completion.rewardStars || 0)
    };
    completion.status = "undone";
    completion.undoneAt = KA.date.localIsoString();
    var ledger = KA.stars.adjustUndoTask(task);
    record.earnedStarsToday = Math.max(0, Number(record.earnedStarsToday || 0) - Number(completion.rewardStars || task.rewardStars || 0));
    record.corrections = record.corrections || [];
    record.corrections.push({
      taskId: taskId,
      correctedAt: KA.date.localIsoString(),
      action: "undo_completion",
      reason: "親モードで訂正",
      ledgerId: ledger.id
    });
    record.updatedAt = KA.date.localIsoString();
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, task: task, ledger: ledger };
  }

  function setDailyDisplayCount(value) {
    var settings = ensureJobSettings(KA.state.getAppData());
    settings.dailyDisplayCount = clampInteger(value, 1, 10, settings.dailyDisplayCount);
    dailyTasks();
    KA.state.saveAppData();
    return settings.dailyDisplayCount;
  }

  function setJobEnabled(taskId, enabled) {
    var data = KA.state.getAppData();
    var settings = ensureJobSettings(data);
    if (settings.displayOrder.indexOf(taskId) < 0) return { ok: false, reason: "not_found" };
    var next = settings.enabledJobIds.slice();
    if (enabled && next.indexOf(taskId) < 0) next.push(taskId);
    if (!enabled) next = next.filter(function (id) { return id !== taskId; });
    if (!next.length) return { ok: false, reason: "minimum_one" };
    settings.enabledJobIds = next;
    settings.customJobs.forEach(function (job) {
      if (job.id === taskId) job.enabled = enabled;
    });
    array(data.tasks).forEach(function (task) {
      if (task && task.taskId === taskId) task.active = enabled;
    });
    dailyTasks();
    KA.state.saveAppData();
    return { ok: true };
  }

  function moveJob(taskId, direction) {
    var settings = ensureJobSettings(KA.state.getAppData());
    var from = settings.displayOrder.indexOf(taskId);
    var to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= settings.displayOrder.length) return false;
    var swap = settings.displayOrder[to];
    settings.displayOrder[to] = taskId;
    settings.displayOrder[from] = swap;
    KA.state.saveAppData();
    return true;
  }

  function validateCustomInput(input) {
    var name = cleanText(input && input.name, 20);
    var description = cleanText(input && input.description, 60);
    var iconKey = input && ICON_KEYS.indexOf(input.iconKey) >= 0 ? input.iconKey : "star";
    if (!name) return { ok: false, reason: "name_required" };
    return { ok: true, value: { name: name, description: description, iconKey: iconKey, enabled: !input || input.enabled !== false } };
  }

  function createCustomId(settings, name) {
    var base = "custom_job_" + String(Date.now()) + "_" + hashString(name + "|" + settings.customJobs.length).toString(36);
    var id = base;
    var suffix = 1;
    while (settings.displayOrder.indexOf(id) >= 0) {
      id = base + "_" + suffix;
      suffix += 1;
    }
    return id;
  }

  function addCustomJob(input) {
    var settings = ensureJobSettings(KA.state.getAppData());
    if (settings.customJobs.length >= MAX_CUSTOM_JOBS) return { ok: false, reason: "limit" };
    var validated = validateCustomInput(input);
    if (!validated.ok) return validated;
    var now = KA.date.localIsoString();
    var job = validated.value;
    job.id = createCustomId(settings, job.name);
    job.createdAt = now;
    job.updatedAt = now;
    settings.customJobs.push(job);
    settings.displayOrder.push(job.id);
    if (job.enabled) settings.enabledJobIds.push(job.id);
    dailyTasks();
    KA.state.saveAppData();
    return { ok: true, job: job };
  }

  function updateCustomJob(taskId, input) {
    var settings = ensureJobSettings(KA.state.getAppData());
    var job = settings.customJobs.filter(function (item) { return item.id === taskId; })[0];
    if (!job) return { ok: false, reason: "not_found" };
    var validated = validateCustomInput(input);
    if (!validated.ok) return validated;
    var enabledResult = setJobEnabled(taskId, validated.value.enabled);
    if (!enabledResult.ok) return enabledResult;
    settings = ensureJobSettings(KA.state.getAppData());
    job = settings.customJobs.filter(function (item) { return item.id === taskId; })[0];
    job.name = validated.value.name;
    job.description = validated.value.description;
    job.iconKey = validated.value.iconKey;
    job.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, job: job };
  }

  function deleteCustomJob(taskId) {
    var settings = ensureJobSettings(KA.state.getAppData());
    var exists = settings.customJobs.some(function (job) { return job.id === taskId; });
    if (!exists) return { ok: false, reason: "standard_or_missing" };
    settings.customJobs = settings.customJobs.filter(function (job) { return job.id !== taskId; });
    settings.displayOrder = settings.displayOrder.filter(function (id) { return id !== taskId; });
    settings.enabledJobIds = settings.enabledJobIds.filter(function (id) { return id !== taskId; });
    Object.keys(settings.dailySelectionsByDate).forEach(function (dateKey) {
      settings.dailySelectionsByDate[dateKey] = settings.dailySelectionsByDate[dateKey].filter(function (id) { return id !== taskId; });
    });
    if (!settings.enabledJobIds.length) settings.enabledJobIds.push(standardIds()[0]);
    dailyTasks();
    KA.state.saveAppData();
    return { ok: true };
  }

  function resetJobSettings(deleteCustom) {
    var settings = ensureJobSettings(KA.state.getAppData());
    var customJobs = deleteCustom ? [] : settings.customJobs;
    var enabledCustomIds = customJobs.filter(function (job) { return job.enabled !== false; }).map(function (job) { return job.id; });
    settings.dailyDisplayCount = clampInteger(KA.constants.DEFAULT_JOB_DISPLAY_COUNT, 1, 10, 7);
    settings.enabledJobIds = standardIds().concat(enabledCustomIds);
    settings.displayOrder = standardIds().concat(customJobs.map(function (job) { return job.id; }));
    settings.customJobs = customJobs;
    settings.dailySelectionsByDate = {};
    array(KA.state.getAppData().tasks).forEach(function (task) {
      if (task && standardIds().indexOf(task.taskId) >= 0) task.active = true;
    });
    dailyTasks();
    KA.state.saveAppData();
    return settings;
  }

  function updateTask(taskId, updates) {
    var task = allTasks().filter(function (item) { return item.taskId === taskId; })[0];
    if (!task) return false;
    if (typeof updates.active !== "undefined") {
      var result = setJobEnabled(taskId, Boolean(updates.active));
      if (!result.ok) return false;
    }
    if (typeof updates.rewardStars !== "undefined" && !task.isCustom) {
      task.rewardStars = Math.max(0, Number(updates.rewardStars || 0));
      task.updatedAt = KA.date.localIsoString();
      KA.state.saveAppData();
    }
    return true;
  }

  function allActiveCompleted() {
    var list = dailyTasks();
    return list.length > 0 && list.every(function (task) {
      return isCompleted(task.taskId);
    });
  }

  function iconSvg(iconKey) {
    var common = 'class="task-icon-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"';
    var svgs = {
      toybox: '<svg ' + common + '><path d="M10 25h44v27H10z" fill="#E8A35D"/><path d="M7 20h50v9H7z" fill="#F5C36B"/><path d="M17 17l8-9 7 12" fill="#66B8DB"/><circle cx="41" cy="14" r="8" fill="#F27676"/><path d="M28 36h8v16h-8z" fill="#C57842"/></svg>',
      broom: '<svg ' + common + '><path d="M42 6L24 40" stroke="#8A6745" stroke-width="6" stroke-linecap="round"/><path d="M13 38q12-7 24 5l-8 15H10z" fill="#F3C74F"/></svg>',
      dish: '<svg ' + common + '><ellipse cx="32" cy="35" rx="24" ry="15" fill="#8FD4E8"/><ellipse cx="32" cy="33" rx="15" ry="8" fill="#FFF9E8"/><path d="M10 49h44" stroke="#5E9FB8" stroke-width="4" stroke-linecap="round"/></svg>',
      clothes: '<svg ' + common + '><path d="M22 11l10 7 10-7 13 11-8 9-5-4v27H22V27l-5 4-8-9z" fill="#75BEE8"/><path d="M25 11q7 8 14 0" fill="none" stroke="#4E87A6" stroke-width="3"/></svg>',
      book: '<svg ' + common + '><path d="M7 14q14-5 25 4v36q-11-9-25-4z" fill="#F08A8A"/><path d="M57 14q-14-5-25 4v36q11-9 25-4z" fill="#7FC4E8"/><path d="M32 18v36" stroke="#7A6255" stroke-width="3"/></svg>',
      plant: '<svg ' + common + '><path d="M31 50V23" stroke="#50975C" stroke-width="4"/><path d="M31 29q-18-2-17-15 16-2 17 15M32 36q18-2 17-15-16-2-17 15" fill="#75BF70"/><path d="M17 45h30l-5 13H22z" fill="#E38B5B"/></svg>',
      bag: '<svg ' + common + '><path d="M11 22h42v34H11z" rx="6" fill="#F0A960"/><path d="M22 23v-7q0-8 10-8t10 8v7" fill="none" stroke="#8B684A" stroke-width="5"/><path d="M24 37h16" stroke="#FFF0C8" stroke-width="4"/></svg>',
      star: '<svg ' + common + '><path d="M32 5l8 17 19 2-14 13 4 19-17-9-17 9 4-19L5 24l19-2z" fill="#F5C84C"/><circle cx="27" cy="31" r="2" fill="#6A5833"/><circle cx="37" cy="31" r="2" fill="#6A5833"/><path d="M27 38q5 5 10 0" fill="none" stroke="#6A5833" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    return svgs[iconKey] || svgs.star;
  }

  function renderTaskIcon(task) {
    if (task && task.iconKey) return iconSvg(task.iconKey);
    return task && task.icon ? task.icon : iconSvg("star");
  }

  function iconPresets() {
    return ICON_KEYS.map(function (key) {
      var labels = { toybox: "おもちゃ箱", broom: "ほうき", dish: "お皿", clothes: "洋服", book: "本", plant: "植物", bag: "かばん", star: "星" };
      return { key: key, label: labels[key], svg: iconSvg(key) };
    });
  }

  KA.tasks = {
    MAX_CUSTOM_JOBS: MAX_CUSTOM_JOBS,
    defaultJobSettings: defaultJobSettings,
    ensureJobSettings: ensureJobSettings,
    allTasks: allTasks,
    enabledTasks: enabledTasks,
    dailyTasks: dailyTasks,
    activeTasks: activeTasks,
    isCompleted: isCompleted,
    completedToday: completedToday,
    completedDailyTasks: completedDailyTasks,
    completeTask: completeTask,
    undoTask: undoTask,
    updateTask: updateTask,
    setDailyDisplayCount: setDailyDisplayCount,
    setJobEnabled: setJobEnabled,
    moveJob: moveJob,
    addCustomJob: addCustomJob,
    updateCustomJob: updateCustomJob,
    deleteCustomJob: deleteCustomJob,
    resetJobSettings: resetJobSettings,
    renderTaskIcon: renderTaskIcon,
    iconPresets: iconPresets,
    allActiveCompleted: allActiveCompleted,
    hashString: hashString
  };
})(window);
