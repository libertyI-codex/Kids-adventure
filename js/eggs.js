(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var TARGET_GROWTH = 6;
  var VALID_STATES = ["waiting", "active", "warm", "glowing", "cracked", "ready", "hatched"];
  var GROWABLE_STATES = ["active", "warm", "glowing", "cracked"];

  function ensureInventory(appData) {
    appData.eggInventory = Array.isArray(appData.eggInventory) ? appData.eggInventory : [];
    return appData.eggInventory;
  }

  function ensureEggSystem(appData) {
    appData.eggSystem = appData.eggSystem && typeof appData.eggSystem === "object" ? appData.eggSystem : {};
    appData.eggSystem.activeEggId = typeof appData.eggSystem.activeEggId === "undefined" ? null : appData.eggSystem.activeEggId;
    appData.eggSystem.dailyActivity = appData.eggSystem.dailyActivity && typeof appData.eggSystem.dailyActivity === "object" ? appData.eggSystem.dailyActivity : {};
    return appData.eggSystem;
  }

  function todayKey() {
    return KA.date.localDateKey();
  }

  function todayActivity(appData, dateKey) {
    var system = ensureEggSystem(appData);
    var key = dateKey || todayKey();
    system.dailyActivity[key] = system.dailyActivity[key] || {};
    return system.dailyActivity[key];
  }

  function hasEggForStars(inventory, earnedByStars) {
    return inventory.some(function (egg) {
      return egg && Number(egg.earnedByStars || 0) === earnedByStars;
    });
  }

  function stateForGrowth(points) {
    var value = Math.max(0, Math.min(TARGET_GROWTH, Number(points || 0)));
    if (value >= 6) return "ready";
    if (value >= 5) return "cracked";
    if (value >= 3) return "glowing";
    if (value >= 1) return "warm";
    return "active";
  }

  function isFormalSpecies(speciesId) {
    return Boolean(KA.companions && KA.companions.isValidSpeciesId && KA.companions.isValidSpeciesId(speciesId));
  }

  function pickPlannedCompanionSpecies(egg, appData) {
    if (KA.companions && KA.companions.pickSpeciesForEgg) {
      return KA.companions.pickSpeciesForEgg(egg, appData);
    }
    return "companion_chick";
  }

  function normalizeEgg(egg, index) {
    var threshold = Number(egg.earnedByStars || ((index + 1) * 10));
    egg.id = egg.id || ("egg_stars_" + threshold);
    egg.createdAt = egg.createdAt || KA.date.localIsoString();
    egg.earnedByStars = threshold;
    if (egg.state === "new" || VALID_STATES.indexOf(egg.state) === -1) egg.state = "waiting";
    egg.targetGrowthPoints = Number(egg.targetGrowthPoints || TARGET_GROWTH);
    egg.growthPoints = Math.max(0, Math.min(egg.targetGrowthPoints, Number(egg.growthPoints || 0)));
    egg.activatedAt = egg.activatedAt || null;
    egg.readyAt = egg.readyAt || null;
    egg.hatchedAt = egg.hatchedAt || null;
    egg.plannedSpeciesId = egg.plannedSpeciesId || null;
    egg.companionId = egg.companionId || null;
    return egg;
  }

  function sortEggs(inventory) {
    inventory.sort(function (a, b) {
      var stars = Number(a.earnedByStars || 0) - Number(b.earnedByStars || 0);
      if (stars) return stars;
      return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    });
    return inventory;
  }

  function activeEgg(appData) {
    var data = appData || KA.state.getAppData();
    var system = ensureEggSystem(data);
    var inventory = ensureInventory(data);
    var found = inventory.filter(function (egg) {
      return egg && egg.id === system.activeEggId && egg.state !== "hatched";
    })[0];
    if (found) return found;
    return inventory.filter(function (egg) {
      return egg && ["active", "warm", "glowing", "cracked", "ready"].indexOf(egg.state) >= 0;
    })[0] || null;
  }

  function activateNextWaiting(appData) {
    var data = appData || KA.state.getAppData();
    var system = ensureEggSystem(data);
    var next = sortEggs(ensureInventory(data)).filter(function (egg) {
      return egg && egg.state === "waiting";
    })[0] || null;
    if (!next) {
      system.activeEggId = null;
      return null;
    }
    next.state = stateForGrowth(next.growthPoints);
    if (next.state === "ready" && !next.readyAt) next.readyAt = KA.date.localIsoString();
    next.activatedAt = next.activatedAt || KA.date.localIsoString();
    system.activeEggId = next.id;
    return next;
  }

  function normalizeActiveEggs(appData) {
    var data = appData || KA.state.getAppData();
    var system = ensureEggSystem(data);
    var inventory = sortEggs(ensureInventory(data));
    var activeLike = inventory.filter(function (egg) {
      return egg && ["active", "warm", "glowing", "cracked", "ready"].indexOf(egg.state) >= 0;
    });
    var keep = null;
    if (system.activeEggId) {
      keep = activeLike.filter(function (egg) { return egg.id === system.activeEggId; })[0] || null;
    }
    keep = keep || activeLike[0] || null;
    if (!keep) keep = activateNextWaiting(data);
    activeLike.forEach(function (egg) {
      if (keep && egg.id === keep.id) return;
      egg.state = "waiting";
    });
    if (keep) {
      keep.state = keep.state === "ready" ? "ready" : stateForGrowth(keep.growthPoints);
      keep.activatedAt = keep.activatedAt || KA.date.localIsoString();
      system.activeEggId = keep.id;
    } else {
      system.activeEggId = null;
    }
  }

  function syncPlannedSpecies(appData) {
    ensureInventory(appData).forEach(function (egg) {
      if (!egg) return;
      if (egg.state === "hatched") return;
      if (egg.plannedSpeciesId && !isFormalSpecies(egg.plannedSpeciesId)) {
        egg.plannedSpeciesId = egg.state === "ready" ? pickPlannedCompanionSpecies(egg, appData) : null;
      }
      if (egg.state === "ready" && !egg.plannedSpeciesId) {
        egg.plannedSpeciesId = pickPlannedCompanionSpecies(egg, appData);
      }
    });
  }

  function syncEggInventory(appData) {
    if (!appData || !appData.profile) return [];
    var inventory = ensureInventory(appData);
    ensureEggSystem(appData);
    for (var i = 0; i < inventory.length; i += 1) {
      normalizeEgg(inventory[i], i);
    }

    var lifetime = Number((appData.profile.starTotals || {}).lifetimeStars || 0);
    var targetCount = Math.floor(Math.max(0, lifetime) / 10);
    var changed = false;
    for (var count = 1; count <= targetCount; count += 1) {
      var threshold = count * 10;
      if (!hasEggForStars(inventory, threshold)) {
        inventory.push({
          id: "egg_stars_" + threshold,
          createdAt: KA.date.localIsoString(),
          earnedByStars: threshold,
          state: "waiting",
          growthPoints: 0,
          targetGrowthPoints: TARGET_GROWTH,
          activatedAt: null,
          readyAt: null,
          hatchedAt: null,
          plannedSpeciesId: null,
          companionId: null
        });
        changed = true;
      }
    }

    sortEggs(inventory);
    normalizeActiveEggs(appData);
    inventory.forEach(function (egg) {
      if (!egg || egg.state === "hatched" || egg.state === "waiting") return;
      var nextState = stateForGrowth(egg.growthPoints);
      if (egg.state !== "ready") egg.state = nextState;
      if (nextState === "ready") {
        egg.state = "ready";
        egg.readyAt = egg.readyAt || KA.date.localIsoString();
      }
    });
    syncPlannedSpecies(appData);
    if (changed) appData.updatedAt = KA.date.localIsoString();
    return inventory;
  }

  function getEggs() {
    return syncEggInventory(KA.state.getAppData()).slice();
  }

  function eggCount() {
    return getEggs().length;
  }

  function waitingCount(appData) {
    return syncEggInventory(appData || KA.state.getAppData()).filter(function (egg) {
      return egg.state === "waiting";
    }).length;
  }

  function hatchedCount(appData) {
    return syncEggInventory(appData || KA.state.getAppData()).filter(function (egg) {
      return egg.state === "hatched";
    }).length;
  }

  function nextEggAt(appData) {
    var data = appData || KA.state.getAppData();
    var lifetime = Number((data.profile.starTotals || {}).lifetimeStars || 0);
    return (Math.floor(Math.max(0, lifetime) / 10) + 1) * 10;
  }

  function growableActiveEgg(appData) {
    var egg = activeEgg(appData);
    return egg && GROWABLE_STATES.indexOf(egg.state) >= 0 ? egg : null;
  }

  function addGrowth(activityKey, message, appData, options) {
    var data = appData || KA.state.getAppData();
    var opts = options || {};
    syncEggInventory(data);
    var activity = todayActivity(data, opts.dateKey);
    if (activity[activityKey]) {
      return { ok: false, reason: "already_done", alreadyDone: true, activityKey: activityKey };
    }
    activity[activityKey] = true;
    var egg = growableActiveEgg(data);
    if (!egg) {
      if (!opts.skipSave && KA.state && KA.state.saveAppData) KA.state.saveAppData();
      return { ok: false, reason: "no_active_egg", activityKey: activityKey };
    }
    var before = Number(egg.growthPoints || 0);
    egg.growthPoints = Math.min(TARGET_GROWTH, before + 1);
    egg.state = stateForGrowth(egg.growthPoints);
    if (egg.state === "ready") {
      egg.readyAt = egg.readyAt || KA.date.localIsoString();
      egg.plannedSpeciesId = egg.plannedSpeciesId || pickPlannedCompanionSpecies(egg, data);
    }
    data.updatedAt = KA.date.localIsoString();
    if (!opts.skipSave && KA.state && KA.state.saveAppData) KA.state.saveAppData();
    return {
      ok: true,
      activityKey: activityKey,
      message: message,
      egg: egg,
      previousGrowthPoints: before,
      growthPoints: egg.growthPoints,
      state: egg.state,
      ready: egg.state === "ready"
    };
  }

  function petActiveEgg() {
    return addGrowth("petted", "あたたかくなったよ！");
  }

  function recordTaskBonusIfEligible() {
    var data = KA.state.getAppData();
    var dateKey = KA.state.getTodayKey();
    var activity = todayActivity(data, dateKey);
    if (activity.jobBonus) return { ok: false, reason: "already_done", alreadyDone: true, activityKey: "jobBonus" };
    var activeTasks = KA.tasks.activeTasks();
    if (!activeTasks.length) return { ok: false, reason: "no_active_tasks" };
    var completed = KA.tasks.completedToday().filter(function (item) {
      return item.status === "completed";
    });
    var threshold = Math.min(3, activeTasks.length);
    if (completed.length < threshold) return { ok: false, reason: "not_enough_tasks", completed: completed.length, threshold: threshold };
    return addGrowth("jobBonus", "おしごとを がんばったから たまごが そだったよ！");
  }

  function recordColoringBonus() {
    return addGrowth("coloringBonus", "ぬりえが できたから たまごが ひかったよ！");
  }

  function hatchReadyEgg(eggId) {
    var data = KA.state.getAppData();
    syncEggInventory(data);
    var egg = eggId ? ensureInventory(data).filter(function (item) { return item.id === eggId; })[0] : activeEgg(data);
    if (!egg || egg.state !== "ready") return { ok: false, reason: "not_ready" };
    egg.plannedSpeciesId = egg.plannedSpeciesId || pickPlannedCompanionSpecies(egg, data);
    if (!isFormalSpecies(egg.plannedSpeciesId)) egg.plannedSpeciesId = pickPlannedCompanionSpecies(egg, data);
    if (!KA.companions || !KA.companions.recordHatch) return { ok: false, reason: "companions_unavailable" };
    var hatchedAt = KA.date.localIsoString();
    var companion = KA.companions.recordHatch(data, egg.plannedSpeciesId, hatchedAt);
    egg.state = "hatched";
    egg.hatchedAt = hatchedAt;
    egg.companionId = companion.id;
    egg.growthPoints = TARGET_GROWTH;
    ensureEggSystem(data).activeEggId = null;
    activateNextWaiting(data);
    KA.state.saveAppData();
    return { ok: true, egg: egg, companion: companion, species: KA.companions.getSpecies(egg.plannedSpeciesId) };
  }

  function statusLabel(state) {
    if (state === "waiting") return "じゅんばんまち";
    if (state === "active") return "そだてているよ";
    if (state === "warm") return "あたたかい";
    if (state === "glowing") return "ひかっている";
    if (state === "cracked") return "ひびがはいった";
    if (state === "ready") return "うまれそう";
    if (state === "hatched") return "うまれた";
    return "たまご";
  }

  function renderEggSvg(egg, className) {
    var state = egg && egg.state || "active";
    var points = Math.max(0, Math.min(TARGET_GROWTH, Number((egg || {}).growthPoints || 0)));
    var cracks = state === "cracked" || state === "ready" || state === "hatched";
    return [
      '<svg class="egg-svg egg-svg-' + state + ' ' + (className || "") + '" viewBox="0 0 180 210" aria-hidden="true">',
      '<defs><radialGradient id="eggGlow' + points + '" cx="50%" cy="44%" r="58%"><stop offset="0" stop-color="#fffdf2"/><stop offset=".72" stop-color="#ffe8a3"/><stop offset="1" stop-color="#f4bf55"/></radialGradient></defs>',
      '<ellipse class="egg-aura" cx="90" cy="112" rx="' + (48 + points * 4) + '" ry="' + (62 + points * 5) + '" fill="#fff2a8" opacity="' + (points ? 0.18 + points * 0.07 : 0.08) + '"/>',
      '<path class="egg-shell" d="M90 20 C128 34 153 80 151 125 C149 176 121 199 90 199 C58 199 31 176 29 125 C27 80 52 34 90 20 Z" fill="url(#eggGlow' + points + ')" stroke="#c99736" stroke-width="5"/>',
      '<path d="M63 75 C70 69 78 69 84 75 M102 65 C109 59 118 61 124 69 M58 130 C66 136 76 136 83 130" fill="none" stroke="#e3b858" stroke-width="5" stroke-linecap="round" opacity=".55"/>',
      cracks ? '<path class="egg-crack" d="M92 64 L80 84 L95 96 L83 120 L101 136 L92 160" fill="none" stroke="#8b6427" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' : '',
      state === "ready" ? '<path class="egg-ready-light" d="M82 86 L96 98 L85 119 L102 135" fill="none" stroke="#fff9c7" stroke-width="10" stroke-linecap="round" opacity=".78"/>' : '',
      '<g class="egg-stars" fill="#fff7a8"><circle cx="45" cy="58" r="4"/><circle cx="138" cy="78" r="3"/><circle cx="128" cy="160" r="3.4"/></g>',
      '</svg>'
    ].join("");
  }

  KA.eggs = {
    TARGET_GROWTH: TARGET_GROWTH,
    syncEggInventory: syncEggInventory,
    ensureEggSystem: ensureEggSystem,
    getEggs: getEggs,
    activeEgg: activeEgg,
    activateNextWaiting: activateNextWaiting,
    eggCount: eggCount,
    waitingCount: waitingCount,
    hatchedCount: hatchedCount,
    nextEggAt: nextEggAt,
    stateForGrowth: stateForGrowth,
    addGrowth: addGrowth,
    petActiveEgg: petActiveEgg,
    recordTaskBonusIfEligible: recordTaskBonusIfEligible,
    recordColoringBonus: recordColoringBonus,
    hatchReadyEgg: hatchReadyEgg,
    statusLabel: statusLabel,
    todayActivity: todayActivity,
    renderEggSvg: renderEggSvg
  };
})(window);
