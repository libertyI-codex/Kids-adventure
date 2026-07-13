(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function ensureInventory(appData) {
    appData.eggInventory = Array.isArray(appData.eggInventory) ? appData.eggInventory : [];
    return appData.eggInventory;
  }

  function hasEggForStars(inventory, earnedByStars) {
    return inventory.some(function (egg) {
      return egg && Number(egg.earnedByStars || 0) === earnedByStars;
    });
  }

  function normalizeEgg(egg, index) {
    var threshold = Number(egg.earnedByStars || ((index + 1) * 10));
    egg.id = egg.id || ("egg_stars_" + threshold);
    egg.createdAt = egg.createdAt || KA.date.localIsoString();
    egg.earnedByStars = threshold;
    egg.state = egg.state || "new";
    return egg;
  }

  function syncEggInventory(appData) {
    if (!appData || !appData.profile) return [];
    var inventory = ensureInventory(appData);
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
          state: "new"
        });
        changed = true;
      }
    }

    inventory.sort(function (a, b) {
      return Number(a.earnedByStars || 0) - Number(b.earnedByStars || 0);
    });
    if (changed) appData.updatedAt = KA.date.localIsoString();
    return inventory;
  }

  function getEggs() {
    return syncEggInventory(KA.state.getAppData()).slice();
  }

  function eggCount() {
    return getEggs().length;
  }

  function nextEggAt(appData) {
    var data = appData || KA.state.getAppData();
    var lifetime = Number((data.profile.starTotals || {}).lifetimeStars || 0);
    return (Math.floor(Math.max(0, lifetime) / 10) + 1) * 10;
  }

  KA.eggs = {
    syncEggInventory: syncEggInventory,
    getEggs: getEggs,
    eggCount: eggCount,
    nextEggAt: nextEggAt
  };
})(window);
