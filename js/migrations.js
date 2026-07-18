(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeDeviceId() {
    return "device_" + KA.date.compactDateKey() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function withAuditDefaults(item) {
    var next = clone(item);
    var now = KA.date.localIsoString();
    next.profileId = next.profileId || KA.constants.PROFILE_ID;
    next.createdAt = next.createdAt || now;
    next.updatedAt = next.updatedAt || now;
    return next;
  }

  function createWorldFromDefinition(definition, now) {
    return {
      worldId: definition.id,
      id: definition.id,
      name: definition.name,
      title: definition.title,
      icon: definition.icon,
      description: definition.description,
      theme: definition.theme,
      unlocked: definition.unlocked,
      unlockedAt: definition.unlockedAt || now,
      designVersion: definition.designVersion,
      displayOrder: definition.displayOrder,
      unlockCondition: definition.unlockCondition || null,
      active: true,
      level: 1,
      stats: {
        totalArtworks: 0,
        totalCompletedDays: 0,
        totalLifetimeStarsAtLastUpdate: 0
      },
      placements: [],
      createdAt: now,
      updatedAt: now
    };
  }

  function createDefaultWorlds(now) {
    var worlds = {};
    KA.constants.WORLD_DEFINITIONS.forEach(function (definition) {
      worlds[definition.id] = createWorldFromDefinition(definition, now);
    });
    return worlds;
  }

  function createDefaultAppData() {
    var now = KA.date.localIsoString();
    var defaultWorlds = createDefaultWorlds(now);
    return {
      schemaVersion: KA.constants.SCHEMA_VERSION,
      appVersion: KA.constants.APP_VERSION,
      createdAt: now,
      updatedAt: now,
      deviceId: makeDeviceId(),
      profile: {
        profileId: KA.constants.PROFILE_ID,
        displayName: "結羽",
        createdAt: now,
        birthday: null,
        ageLabel: "4-8",
        avatar: "avatar_default_star",
        favoriteColor: "pink",
        activeWorldId: KA.constants.WORLD_ID,
        starTotals: {
          lifetimeStars: 0,
          spendableStars: 0
        }
      },
      settings: {
        soundEnabled: true,
        effectsEnabled: true,
        bgmEnabled: false,
        animationLevel: "normal",
        textSize: "normal",
        parentGate: {
          mode: "hold_confirm",
          holdMs: 2000,
          pinEnabled: false,
          pinHash: null,
          pinSalt: null
        },
        parentPinEnabled: false,
        parentPinHash: null,
        dataSafety: {
          autoBackupBeforeMigration: true,
          warnStorageUsageRatio: 0.8
        }
      },
      tasks: KA.constants.DEFAULT_TASKS.map(withAuditDefaults),
      jobSettings: KA.tasks && KA.tasks.defaultJobSettings ? KA.tasks.defaultJobSettings() : {
        dailyDisplayCount: Number(KA.constants.DEFAULT_JOB_DISPLAY_COUNT || 7),
        enabledJobIds: KA.constants.DEFAULT_TASKS.map(function (task) { return task.taskId; }),
        displayOrder: KA.constants.DEFAULT_TASKS.map(function (task) { return task.taskId; }),
        customJobs: [],
        dailySelectionsByDate: {}
      },
      dailyRecords: {},
      starLedger: [],
      eggInventory: [],
      eggSystem: {
        activeEggId: null,
        dailyActivity: {}
      },
      companions: [],
      kitchen: KA.kitchen ? KA.kitchen.defaultKitchen() : {
        currentCooking: null,
        recipeStats: {},
        cookingHistory: []
      },
      birdHouse: KA.birdHouse ? KA.birdHouse.defaultBirdHouse() : {
        unlockedItemIds: ["house_perch_basic", "house_nest_basic", "house_cushion_small", "house_food_table"],
        unlockedAtByItemId: {},
        unseenItemIds: [],
        placements: {
          wallLeft: null,
          wallRight: null,
          floorLeft: "house_cushion_small",
          floorRight: null,
          perchLeft: "house_perch_basic",
          perchRight: null,
          centerTable: "house_food_table",
          nestCorner: "house_nest_basic"
        },
        lastVisitedAt: null,
        lastInteractedCompanionId: null
      },
      outing: KA.outings ? KA.outings.defaultOuting() : {
        activeTrip: null,
        history: [],
        totalTripCount: 0,
        destinationStats: {},
        lastClaimedTripId: null,
        claimedTripIds: []
      },
      coloringSettings: {
        order: KA.constants.COLORING_TEMPLATES.slice().sort(function (a, b) {
          return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        }).map(function (template) { return template.templateId; }),
        starCosts: KA.constants.COLORING_TEMPLATES.reduce(function (costs, template) {
          costs[template.templateId] = Number(template.requiredStars || 0);
          return costs;
        }, {})
      },
      coloringTemplates: KA.constants.COLORING_TEMPLATES.map(withAuditDefaults),
      artworks: [],
      worlds: defaultWorlds,
      unlocks: {
        profileId: KA.constants.PROFILE_ID,
        coloringTemplateIds: [],
        worldIds: KA.constants.WORLD_DEFINITIONS.map(function (world) { return world.id; }),
        featureIds: []
      },
      migrations: []
    };
  }

  function createDefaultUiState() {
    return {
      schemaVersion: KA.constants.SCHEMA_VERSION,
      lastOpenedAt: KA.date.localIsoString(),
      lastRoute: "home",
      currentLocalDate: KA.date.localDateKey(),
      activeProfileId: KA.constants.PROFILE_ID,
      selectedColor: "#F472B6",
      coloringDrafts: {},
      parentMode: {
        activeTab: "overview"
      },
      animationLevel: "normal",
      soundEnabled: true,
      effectsEnabled: true,
      bgmEnabled: false,
      selectedWorldId: KA.constants.WORLD_ID,
      dismissedMessages: []
    };
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function ensureObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function toHalfWidthDigits(value) {
    return String(value == null ? "" : value).replace(/[０-９]/g, function (char) {
      return String.fromCharCode(char.charCodeAt(0) - 65248);
    });
  }

  function sortedColoringDefaults() {
    return KA.constants.COLORING_TEMPLATES.slice().sort(function (a, b) {
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
  }

  function coloringTemplateMap() {
    var map = {};
    KA.constants.COLORING_TEMPLATES.forEach(function (template) {
      map[template.templateId] = template;
    });
    return map;
  }

  function normalizeStarCost(value, fallback) {
    var raw = toHalfWidthDigits(value).trim();
    var numberValue;
    if (raw === "") return Number(fallback || 0);
    if (!/^\d+$/.test(raw)) return Number(fallback || 0);
    numberValue = Number(raw);
    if (!isFinite(numberValue) || numberValue < 0 || numberValue > 999) return Number(fallback || 0);
    return numberValue;
  }

  function normalizeColoringSettings(appData) {
    var settings = ensureObject(appData.coloringSettings);
    var orderInput = ensureArray(settings.order);
    var starInput = ensureObject(settings.starCosts);
    var defaults = sortedColoringDefaults();
    var known = coloringTemplateMap();
    var seen = {};
    var order = [];
    orderInput.forEach(function (templateId) {
      if (!known[templateId] || seen[templateId]) return;
      seen[templateId] = true;
      order.push(templateId);
    });
    defaults.forEach(function (template) {
      if (!seen[template.templateId]) {
        seen[template.templateId] = true;
        order.push(template.templateId);
      }
    });
    var starCosts = {};
    defaults.forEach(function (template) {
      starCosts[template.templateId] = normalizeStarCost(starInput[template.templateId], template.requiredStars);
    });
    appData.coloringSettings = {
      order: order,
      starCosts: starCosts
    };
  }

  function bootMark(stage) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.mark) {
      global.KodomoAdventureBoot.mark(stage);
    }
  }

  function mergeMissing(target, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (typeof target[key] === "undefined") {
        target[key] = clone(defaults[key]);
      } else if (
        target[key] &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key]) &&
        defaults[key] &&
        typeof defaults[key] === "object" &&
        !Array.isArray(defaults[key])
      ) {
        mergeMissing(target[key], defaults[key]);
      }
    });
    return target;
  }

  function ensureById(list, defaults, idKey) {
    defaults.forEach(function (item) {
      var exists = list.some(function (existing) {
        return existing && existing[idKey] === item[idKey];
      });
      if (!exists) list.push(withAuditDefaults(item));
    });
    return list;
  }

  function findById(list, idKey, id) {
    return list.filter(function (item) {
      return item && item[idKey] === id;
    })[0] || null;
  }

  function validWorldIds() {
    return KA.constants.WORLD_DEFINITIONS.map(function (world) { return world.id; });
  }

  function isKnownWorldId(worldId) {
    return validWorldIds().indexOf(worldId) >= 0;
  }

  function syncWorldMetadata(world, definition) {
    var before = JSON.stringify(world);
    world.worldId = definition.id;
    world.id = definition.id;
    world.name = definition.name;
    world.title = definition.title;
    world.icon = definition.icon;
    world.description = definition.description;
    world.theme = definition.theme;
    world.unlocked = definition.unlocked;
    world.unlockedAt = world.unlockedAt || definition.unlockedAt || KA.date.localIsoString();
    world.designVersion = definition.designVersion;
    world.displayOrder = definition.displayOrder;
    world.unlockCondition = definition.unlockCondition || null;
    world.active = typeof world.active === "undefined" ? true : world.active;
    world.stats = ensureObject(world.stats);
    mergeMissing(world.stats, {
      totalArtworks: 0,
      totalCompletedDays: 0,
      totalLifetimeStarsAtLastUpdate: 0
    });
    world.placements = ensureArray(world.placements);
    world.createdAt = world.createdAt || KA.date.localIsoString();
    if (before !== JSON.stringify(world)) world.updatedAt = KA.date.localIsoString();
  }

  function placementKey(placement) {
    return placement.placementId || (placement.artworkId ? "placement_" + placement.artworkId : "");
  }

  function syncWorlds(appData) {
    var worlds = ensureObject(appData.worlds);
    var ids = validWorldIds();
    KA.constants.WORLD_DEFINITIONS.forEach(function (definition) {
      if (!worlds[definition.id]) {
        worlds[definition.id] = createWorldFromDefinition(definition, KA.date.localIsoString());
      }
      syncWorldMetadata(worlds[definition.id], definition);
    });

    var gathered = [];
    Object.keys(worlds).forEach(function (worldId) {
      var containerWorld = worlds[worldId];
      if (!containerWorld || typeof containerWorld !== "object") {
        return;
      }
      containerWorld.placements = ensureArray(containerWorld.placements);
      containerWorld.placements.forEach(function (placement) {
        if (!placement) return;
        var key = placementKey(placement);
        if (!key) return;
        if (!placement.placementId) placement.placementId = key;
        if (!placement.worldId) {
          placement.worldId = isKnownWorldId(worldId) ? worldId : KA.constants.WORLD_ID;
        } else if (!isKnownWorldId(placement.worldId)) {
          placement.worldId = KA.constants.WORLD_ID;
        }
        gathered.push(placement);
      });
      containerWorld.placements = [];
    });

    var seen = {};
    gathered.forEach(function (placement) {
      var key = placementKey(placement);
      if (!key || seen[key]) return;
      seen[key] = true;
      var targetWorldId = isKnownWorldId(placement.worldId) ? placement.worldId : KA.constants.WORLD_ID;
      placement.worldId = targetWorldId;
      placement.updatedAt = placement.updatedAt || placement.createdAt || KA.date.localIsoString();
      worlds[targetWorldId].placements.push(placement);
    });

    appData.worlds = worlds;
    appData.unlocks = ensureObject(appData.unlocks);
    appData.unlocks.worldIds = ensureArray(appData.unlocks.worldIds);
    ids.forEach(function (worldId) {
      if (appData.unlocks.worldIds.indexOf(worldId) === -1) {
        appData.unlocks.worldIds.push(worldId);
      }
    });
  }

  function syncArtworkWorldFallback(appData) {
    appData.artworks.forEach(function (artwork) {
      if (!artwork || !artwork.placementId) return;
      var placement = null;
      Object.keys(appData.worlds || {}).forEach(function (worldId) {
        if (placement) return;
        if (!appData.worlds[worldId] || typeof appData.worlds[worldId] !== "object") return;
        var found = ensureArray(appData.worlds[worldId].placements).filter(function (item) {
          return item && item.placementId === artwork.placementId;
        })[0];
        if (found) placement = found;
      });
      if (!placement) return;
      if (!isKnownWorldId(placement.worldId)) placement.worldId = KA.constants.WORLD_ID;
    });
  }

  function syncBuiltInColoringTemplates(list) {
    KA.constants.COLORING_TEMPLATES.forEach(function (defaults) {
      var existing = findById(list, "templateId", defaults.templateId);
      if (!existing) return;
      var before = JSON.stringify(existing);
      existing.title = defaults.title;
      existing.kind = defaults.kind;
      existing.icon = defaults.icon;
      existing.requiredStars = defaults.requiredStars;
      existing.sortOrder = defaults.sortOrder;
      existing.active = defaults.active;
      existing.worldObjectType = defaults.worldObjectType;
      existing.designVersion = defaults.designVersion;
      existing.svgKey = defaults.svgKey;
      existing.viewBox = defaults.viewBox;
      existing.regionAliases = clone(defaults.regionAliases || {});
      existing.regionIds = clone(defaults.regionIds);
      existing.regions = clone(defaults.regions);
      existing.defaultUnlocked = defaults.defaultUnlocked;
      if (before !== JSON.stringify(existing)) existing.updatedAt = KA.date.localIsoString();
    });
    return list;
  }

  function normalizeRegionColorsForTemplate(template, regionColors) {
    var next = clone(regionColors || {});
    var aliases = template.regionAliases || {};
    (template.regionIds || []).forEach(function (regionId) {
      if (next[regionId]) return;
      var aliasList = aliases[regionId] || [];
      for (var i = 0; i < aliasList.length; i += 1) {
        if (next[aliasList[i]]) {
          next[regionId] = next[aliasList[i]];
          break;
        }
      }
    });
    return next;
  }

  function syncArtworkRegionColors(appData) {
    var changed = false;
    var templateMap = {};
    KA.constants.COLORING_TEMPLATES.forEach(function (template) {
      templateMap[template.templateId] = template;
    });
    appData.artworks.forEach(function (artwork) {
      var template = templateMap[artwork.templateId];
      if (!template) return;
      var before = JSON.stringify(artwork.regionColors || {});
      artwork.regionColors = normalizeRegionColorsForTemplate(template, artwork.regionColors);
      artwork.regionColorDesignVersion = template.designVersion;
      if (before !== JSON.stringify(artwork.regionColors || {})) {
        artwork.updatedAt = KA.date.localIsoString();
        changed = true;
      }
    });
    return changed;
  }

  function syncBuiltInTaskMetadata(list) {
    KA.constants.DEFAULT_TASKS.forEach(function (defaults) {
      var existing = findById(list, "taskId", defaults.taskId);
      if (!existing) return;
      var before = JSON.stringify(existing);
      existing.title = defaults.title;
      existing.description = defaults.description || "";
      existing.icon = defaults.icon;
      existing.iconKey = defaults.iconKey || null;
      existing.category = defaults.category;
      existing.sortOrder = defaults.sortOrder;
      existing.availableDays = clone(defaults.availableDays);
      existing.timeOfDay = defaults.timeOfDay;
      if (typeof existing.rewardStars === "undefined") existing.rewardStars = defaults.rewardStars;
      if (typeof existing.active === "undefined") existing.active = defaults.active;
      if (before !== JSON.stringify(existing)) existing.updatedAt = KA.date.localIsoString();
    });
    return list;
  }

  function markMigration(appData, migrationId) {
    var exists = appData.migrations.some(function (item) {
      return item && item.id === migrationId;
    });
    if (!exists) {
      appData.migrations.push({
        id: migrationId,
        appliedAt: KA.date.localIsoString(),
        appVersion: KA.constants.APP_VERSION
      });
    }
  }

  function recalculateStarTotalsIfMissing(appData) {
    if (!appData.profile.starTotals) {
      appData.profile.starTotals = { lifetimeStars: 0, spendableStars: 0 };
    }
    appData.profile.starTotals.lifetimeStars = Math.max(0, Number(appData.profile.starTotals.lifetimeStars || 0));
    appData.profile.starTotals.spendableStars = Math.max(0, Number(appData.profile.starTotals.spendableStars || 0));
  }

  function normalizeDailyRecords(appData) {
    appData.dailyRecords = ensureObject(appData.dailyRecords);
    Object.keys(appData.dailyRecords).forEach(function (dateKey) {
      var record = appData.dailyRecords[dateKey];
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        record = {};
        appData.dailyRecords[dateKey] = record;
      }
      record.recordId = record.recordId || ("daily_" + dateKey + "_" + (appData.profile.profileId || KA.constants.PROFILE_ID));
      record.profileId = record.profileId || appData.profile.profileId || KA.constants.PROFILE_ID;
      record.localDate = record.localDate || dateKey;
      record.createdAt = record.createdAt || KA.date.localIsoString();
      record.updatedAt = record.updatedAt || record.createdAt;
      record.completedTasks = ensureArray(record.completedTasks);
      record.earnedStarsToday = Math.max(0, Number(record.earnedStarsToday || 0));
      record.artworkIds = ensureArray(record.artworkIds);
      record.forestPlacementIds = ensureArray(record.forestPlacementIds);
      record.parentNotes = ensureObject(record.parentNotes);
      record.corrections = ensureArray(record.corrections);
    });
  }

  function ensureDataShape(appData) {
    var changed = false;
    var defaults = createDefaultAppData();
    if (!appData || typeof appData !== "object") {
      return { data: defaults, changed: true };
    }

    var before = JSON.stringify(appData);
    mergeMissing(appData, defaults);
    appData.schemaVersion = Number(appData.schemaVersion || KA.constants.SCHEMA_VERSION);
    appData.appVersion = KA.constants.APP_VERSION;
    appData.deviceId = appData.deviceId || makeDeviceId();
    appData.profile = ensureObject(appData.profile);
    mergeMissing(appData.profile, defaults.profile);
    appData.profile.profileId = appData.profile.profileId || KA.constants.PROFILE_ID;
    appData.profile.starTotals = ensureObject(appData.profile.starTotals);
    mergeMissing(appData.profile.starTotals, defaults.profile.starTotals);

    appData.settings = ensureObject(appData.settings);
    mergeMissing(appData.settings, defaults.settings);
    appData.tasks = syncBuiltInTaskMetadata(ensureById(ensureArray(appData.tasks), KA.constants.DEFAULT_TASKS, "taskId"));
    if (KA.tasks && KA.tasks.ensureJobSettings) KA.tasks.ensureJobSettings(appData);
    appData.coloringTemplates = syncBuiltInColoringTemplates(ensureById(ensureArray(appData.coloringTemplates), KA.constants.COLORING_TEMPLATES, "templateId"));
    normalizeColoringSettings(appData);
    appData.dailyRecords = ensureObject(appData.dailyRecords);
    normalizeDailyRecords(appData);
    appData.starLedger = ensureArray(appData.starLedger);
    appData.eggInventory = ensureArray(appData.eggInventory);
    appData.eggSystem = ensureObject(appData.eggSystem);
    mergeMissing(appData.eggSystem, defaults.eggSystem);
    appData.eggSystem.dailyActivity = ensureObject(appData.eggSystem.dailyActivity);
    appData.companions = ensureArray(appData.companions);
    if (KA.companions && KA.companions.ensureCompanions) {
      bootMark("COMPANIONS_INIT_STARTED");
      KA.companions.ensureCompanions(appData);
      bootMark("COMPANIONS_INIT_COMPLETED");
    }
    appData.kitchen = ensureObject(appData.kitchen);
    if (KA.kitchen && KA.kitchen.ensureKitchen) {
      KA.kitchen.ensureKitchen(appData);
    }
    appData.birdHouse = ensureObject(appData.birdHouse);
    if (KA.birdHouse && KA.birdHouse.ensureBirdHouse) {
      KA.birdHouse.ensureBirdHouse(appData);
    }
    appData.outing = ensureObject(appData.outing);
    if (KA.outings && KA.outings.ensureOuting) {
      KA.outings.ensureOuting(appData);
    }
    appData.artworks = ensureArray(appData.artworks);
    syncArtworkRegionColors(appData);
    appData.unlocks = ensureObject(appData.unlocks);
    mergeMissing(appData.unlocks, defaults.unlocks);
    appData.unlocks.coloringTemplateIds = ensureArray(appData.unlocks.coloringTemplateIds);
    appData.unlocks.worldIds = ensureArray(appData.unlocks.worldIds);
    appData.unlocks.featureIds = ensureArray(appData.unlocks.featureIds);
    syncWorlds(appData);
    syncArtworkWorldFallback(appData);
    appData.migrations = ensureArray(appData.migrations);
    markMigration(appData, "prototype2_default_tasks_and_coloring");
    markMigration(appData, "prototype20_home_jobs_settings");
    markMigration(appData, "prototype21_companion_outings");
    recalculateStarTotalsIfMissing(appData);
    if (KA.eggs && KA.eggs.syncEggInventory) {
      bootMark("EGGS_INIT_STARTED");
      KA.eggs.syncEggInventory(appData);
      bootMark("EGGS_INIT_COMPLETED");
    }
    if (KA.companions && KA.companions.ensureCompanions) {
      bootMark("COMPANIONS_INIT_STARTED");
      KA.companions.ensureCompanions(appData);
      bootMark("COMPANIONS_INIT_COMPLETED");
    }
    markMigration(appData, "prototype3_horse_and_eggs");
    markMigration(appData, "prototype4_audio_palette_svg");
    markMigration(appData, "prototype5_coloring_design_sync");
    markMigration(appData, "prototype6_svg_and_forest_placement");
    markMigration(appData, "prototype7_multi_worlds");
    markMigration(appData, "prototype8_artwork_background_and_coloring");
    markMigration(appData, "prototype9_adopted_layered_coloring");
    markMigration(appData, "prototype10_secret_base_world");
    markMigration(appData, "prototype11_apple_touch_icon");
    markMigration(appData, "prototype12_egg_companions");
    markMigration(appData, "prototype13_coloring_settings");
    markMigration(appData, "prototype14_egg_care_first_hatch");
    markMigration(appData, "prototype15_bird_companion_artwork");
    markMigration(appData, "prototype18_bird_kitchen");
    markMigration(appData, "prototype19_bird_house");
    appData.updatedAt = appData.updatedAt || KA.date.localIsoString();
    changed = before !== JSON.stringify(appData);
    return { data: appData, changed: changed };
  }

  function migrate(appData) {
    if (!appData || !appData.schemaVersion) return ensureDataShape(appData);
    if (appData.schemaVersion > KA.constants.SCHEMA_VERSION) {
      throw new Error("このデータは新しいバージョンで作られています。");
    }
    if (appData.schemaVersion < KA.constants.SCHEMA_VERSION) {
      KA.storage.saveBackup("before_migration", appData, null);
    }
    return ensureDataShape(appData);
  }

  KA.migrations = {
    createDefaultAppData: createDefaultAppData,
    createDefaultUiState: createDefaultUiState,
    ensureDataShape: ensureDataShape,
    migrate: migrate
  };
})(window);
