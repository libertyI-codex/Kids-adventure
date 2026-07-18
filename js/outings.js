(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var HISTORY_LIMIT = 100;
  var CLAIMED_ID_LIMIT = 200;
  var TRIP_FURNITURE_IDS = [
    "house_trip_flower_wreath",
    "house_trip_flower_cushion",
    "house_trip_butterfly_mobile"
  ];

  var DESTINATIONS = [
    {
      id: "outing_meadow",
      name: "はらっぱ",
      description: "みどりの はらっぱで\nきらきらした ほしを さがそう！",
      displayOrder: 1,
      rewardType: "stars",
      departureMessage: "きらきらを さがしているよ！",
      returnMessages: ["きらきらを みつけたよ！", "かぜが きもちよかったよ！", "いっぱい はしったよ！"]
    },
    {
      id: "outing_flower_field",
      name: "はなのはら",
      description: "きれいな おはなの なかで\nおへやの かざりを みつけよう！",
      displayOrder: 2,
      rewardType: "houseItem",
      departureMessage: "おへやの かざりを さがしているよ！",
      returnMessages: ["きれいな おはなが あったよ！", "おへやに にあいそうだね！", "ちょうちょと あそんだよ！"]
    },
    {
      id: "outing_sea",
      name: "うみ",
      description: "なみの おとを ききながら\nりょうりの そざいを さがそう！",
      displayOrder: 3,
      rewardType: "ingredients",
      departureMessage: "すなはまを おさんぽしているよ！",
      returnMessages: ["なみの おとが きこえたよ！", "おいしそうな ものを みつけたよ！", "すなはまを おさんぽしたよ！"]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniqueStrings(value, limit) {
    var result = [];
    array(value).forEach(function (item) {
      var id = String(item || "");
      if (id && result.indexOf(id) < 0 && (!limit || result.length < limit)) result.push(id);
    });
    return result;
  }

  function validDateKey(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function nextDateKey(dateKey) {
    var parts = String(dateKey || "").split("-");
    if (parts.length !== 3) return KA.date.localDateKey();
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + 1, 12, 0, 0, 0);
    return KA.date.localDateKey(date);
  }

  function hashString(value) {
    if (KA.tasks && KA.tasks.hashString) return KA.tasks.hashString(value);
    var hash = 2166136261;
    var text = String(value || "");
    var index;
    for (index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }

  function allDestinations() {
    return clone(DESTINATIONS).sort(function (a, b) { return a.displayOrder - b.displayOrder; });
  }

  function getDestination(destinationId) {
    return allDestinations().filter(function (item) { return item.id === destinationId; })[0] || null;
  }

  function defaultDestinationStats() {
    var result = {};
    DESTINATIONS.forEach(function (destination) {
      result[destination.id] = { tripCount: 0, lastTripDate: null };
    });
    return result;
  }

  function defaultOuting() {
    return {
      activeTrip: null,
      history: [],
      totalTripCount: 0,
      destinationStats: defaultDestinationStats(),
      lastClaimedTripId: null,
      claimedTripIds: []
    };
  }

  function validCompanion(data, speciesId) {
    if (!KA.companions || !KA.companions.getCompanion || !KA.companions.isValidSpeciesId(speciesId)) return null;
    var companion = KA.companions.getCompanion(data, speciesId);
    return companion && Number(companion.hatchCount || 0) > 0 ? companion : null;
  }

  function normalizeRewardPlan(raw, destinationId) {
    var plan = object(raw);
    if (plan.type === "stars") {
      var amount = Math.floor(Number(plan.amount));
      return { type: "stars", amount: amount >= 2 && amount <= 4 ? amount : 2 };
    }
    if (plan.type === "houseItem" && TRIP_FURNITURE_IDS.indexOf(plan.itemId) >= 0) {
      return { type: "houseItem", itemId: plan.itemId };
    }
    if (plan.type === "ingredients") {
      var items = array(plan.items).map(function (item) {
        var ingredient = item && KA.kitchen && KA.kitchen.getIngredient ? KA.kitchen.getIngredient(item.ingredientId) : null;
        var quantity = Math.max(1, Math.min(9, Math.floor(Number(item && item.quantity || 1))));
        return ingredient ? { ingredientId: ingredient.id, quantity: quantity } : null;
      }).filter(Boolean).slice(0, 2);
      if (items.length) return { type: "ingredients", items: items };
    }
    if (destinationId === "outing_flower_field" && plan.itemId && TRIP_FURNITURE_IDS.indexOf(plan.itemId) >= 0) {
      return { type: "houseItem", itemId: plan.itemId };
    }
    return { type: "stars", amount: 2 };
  }

  function normalizeTrip(raw, todayKey) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    var tripId = String(raw.tripId || "");
    var departed = String(raw.departedDateKey || "");
    if (!tripId || !validDateKey(departed)) return null;
    var destination = getDestination(raw.destinationId);
    var returnDate = validDateKey(raw.returnDateKey) ? raw.returnDateKey : nextDateKey(departed);
    var claimedAt = raw.claimedAt || null;
    var status = claimedAt ? "claimed" : (raw.status === "returned" || String(todayKey || KA.date.localDateKey()) >= returnDate ? "returned" : "traveling");
    return {
      tripId: tripId,
      companionId: String(raw.companionId || raw.speciesId || ""),
      speciesId: String(raw.speciesId || raw.companionId || ""),
      destinationId: destination ? destination.id : String(raw.destinationId || ""),
      departedDateKey: departed,
      returnDateKey: returnDate,
      status: status,
      rewardPlan: normalizeRewardPlan(raw.rewardPlan, raw.destinationId),
      createdAt: raw.createdAt || KA.date.localIsoString(),
      claimedAt: claimedAt
    };
  }

  function normalizeHistory(value, todayKey) {
    var byId = {};
    array(value).forEach(function (entry) {
      var trip = normalizeTrip(entry, todayKey);
      if (!trip || !trip.claimedAt || byId[trip.tripId]) return;
      trip.status = "claimed";
      byId[trip.tripId] = trip;
    });
    return Object.keys(byId).map(function (id) { return byId[id]; }).sort(function (a, b) {
      return String(a.claimedAt || a.createdAt).localeCompare(String(b.claimedAt || b.createdAt));
    }).slice(-HISTORY_LIMIT);
  }

  function ensureOuting(appData, todayKey) {
    var data = appData || (KA.state && KA.state.getAppData ? KA.state.getAppData() : {});
    var raw = object(data.outing);
    var key = todayKey || KA.date.localDateKey();
    var history = normalizeHistory(raw.history, key);
    var claimedIds = uniqueStrings(raw.claimedTripIds, CLAIMED_ID_LIMIT);
    history.forEach(function (trip) {
      if (claimedIds.indexOf(trip.tripId) < 0) claimedIds.push(trip.tripId);
    });
    claimedIds = claimedIds.slice(-CLAIMED_ID_LIMIT);
    var activeTrip = normalizeTrip(raw.activeTrip, key);
    if (activeTrip && activeTrip.status === "claimed") {
      if (!history.some(function (trip) { return trip.tripId === activeTrip.tripId; })) history.push(activeTrip);
      if (claimedIds.indexOf(activeTrip.tripId) < 0) claimedIds.push(activeTrip.tripId);
      activeTrip = null;
    }
    if (activeTrip && claimedIds.indexOf(activeTrip.tripId) >= 0) activeTrip = null;
    history = normalizeHistory(history, key).slice(-HISTORY_LIMIT);
    claimedIds = uniqueStrings(claimedIds, CLAIMED_ID_LIMIT).slice(-CLAIMED_ID_LIMIT);
    var statsRaw = object(raw.destinationStats);
    var stats = defaultDestinationStats();
    DESTINATIONS.forEach(function (destination) {
      var item = object(statsRaw[destination.id]);
      stats[destination.id] = {
        tripCount: Math.max(0, Math.floor(Number(item.tripCount || 0))),
        lastTripDate: validDateKey(item.lastTripDate) ? item.lastTripDate : null
      };
    });
    data.outing = {
      activeTrip: activeTrip,
      history: history,
      totalTripCount: Math.max(history.length, Math.max(0, Math.floor(Number(raw.totalTripCount || 0)))),
      destinationStats: stats,
      lastClaimedTripId: String(raw.lastClaimedTripId || "") || null,
      claimedTripIds: claimedIds
    };
    return data.outing;
  }

  function ownedCompanions(data) {
    if (!KA.companions || !KA.companions.ensureCompanions) return [];
    return KA.companions.ensureCompanions(data).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    });
  }

  function completedValidJob(data, dateKey) {
    var record = data.dailyRecords && object(data.dailyRecords[dateKey]);
    var completed = array(record && record.completedTasks).filter(function (item) { return item && item.status === "completed"; });
    var validIds = {};
    if (KA.tasks && KA.tasks.allTasks) {
      KA.tasks.allTasks().forEach(function (task) {
        if (task && task.active !== false) validIds[task.taskId] = true;
      });
    }
    return completed.some(function (item) { return validIds[item.taskId]; });
  }

  function directCareDone(data, dateKey) {
    var activity = data.eggSystem && object(data.eggSystem.dailyActivity) && object(data.eggSystem.dailyActivity[dateKey]);
    if (activity.petted === true || activity.warmed === true || activity.sang === true) return true;
    var activeEgg = KA.eggs && KA.eggs.activeEgg ? KA.eggs.activeEgg(data) : null;
    var canCare = activeEgg && ["active", "warm", "glowing", "cracked"].indexOf(activeEgg.state) >= 0;
    return !canCare && ownedCompanions(data).length > 0;
  }

  function fedToday(companion, dateKey) {
    return Boolean(companion && companion.lastFedAt && String(companion.lastFedAt).slice(0, 10) === dateKey);
  }

  function preparationStatus(appData, dateKey) {
    var data = appData || KA.state.getAppData();
    var key = dateKey || KA.date.localDateKey();
    var owned = ownedCompanions(data);
    var status = {
      dateKey: key,
      job: completedValidJob(data, key),
      care: directCareDone(data, key),
      food: owned.some(function (companion) { return fedToday(companion, key); })
    };
    status.count = [status.job, status.care, status.food].filter(Boolean).length;
    status.complete = status.count === 3 && owned.length > 0;
    return status;
  }

  function eligibleCompanions(appData, dateKey) {
    var data = appData || KA.state.getAppData();
    var key = dateKey || KA.date.localDateKey();
    var active = ensureOuting(data, key).activeTrip;
    var travelingId = active && active.status === "traveling" ? active.speciesId : null;
    return ownedCompanions(data).filter(function (companion) {
      return fedToday(companion, key) && companion.speciesId !== travelingId;
    }).sort(function (a, b) {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      var timeA = String(a.lastFedAt || "");
      var timeB = String(b.lastFedAt || "");
      if (timeA !== timeB) return timeB.localeCompare(timeA);
      var speciesA = KA.companions.getSpecies(a.speciesId);
      var speciesB = KA.companions.getSpecies(b.speciesId);
      return Number(speciesA && speciesA.displayOrder || 0) - Number(speciesB && speciesB.displayOrder || 0);
    });
  }

  function hasDepartedOnDate(outing, dateKey) {
    if (outing.activeTrip && outing.activeTrip.departedDateKey === dateKey) return true;
    return outing.history.some(function (trip) { return trip.departedDateKey === dateKey; });
  }

  function createTripId(dateKey, companionId, destinationId, count) {
    var seed = [dateKey, companionId, destinationId, count, Date.now()].join("|");
    return "outing_" + dateKey.replace(/-/g, "") + "_" + hashString(seed).toString(36);
  }

  function makeRewardPlan(destinationId, tripSeed, appData) {
    var seed = hashString(tripSeed);
    if (destinationId === "outing_meadow") return { type: "stars", amount: 2 + (seed % 3) };
    if (destinationId === "outing_flower_field") {
      var house = KA.birdHouse.ensureBirdHouse(appData);
      var remaining = TRIP_FURNITURE_IDS.filter(function (itemId) { return house.unlockedItemIds.indexOf(itemId) < 0; });
      return remaining.length ? { type: "houseItem", itemId: remaining[seed % remaining.length] } : { type: "stars", amount: 3 };
    }
    if (destinationId === "outing_sea") {
      var ingredients = KA.kitchen.allIngredients();
      if (!ingredients.length) return { type: "stars", amount: 2 };
      var first = seed % ingredients.length;
      var second = (first + 1 + (Math.floor(seed / ingredients.length) % Math.max(1, ingredients.length - 1))) % ingredients.length;
      return { type: "ingredients", items: [
        { ingredientId: ingredients[first].id, quantity: 1 },
        { ingredientId: ingredients[second].id, quantity: 1 }
      ] };
    }
    return { type: "stars", amount: 2 };
  }

  var departureLocked = false;
  function startTrip(companionId, destinationId) {
    if (departureLocked) return { ok: false, reason: "busy" };
    departureLocked = true;
    try {
      var data = KA.state.getAppData();
      var today = KA.date.localDateKey();
      var outing = ensureOuting(data, today);
      var companion = validCompanion(data, companionId);
      var destination = getDestination(destinationId);
      if (outing.activeTrip) return { ok: false, reason: "active_trip" };
      if (hasDepartedOnDate(outing, today)) return { ok: false, reason: "already_departed_today" };
      if (!preparationStatus(data, today).complete) return { ok: false, reason: "not_ready" };
      if (!companion || !fedToday(companion, today)) return { ok: false, reason: "companion_not_eligible" };
      if (!destination) return { ok: false, reason: "destination_not_found" };
      var tripId = createTripId(today, companion.speciesId, destination.id, outing.totalTripCount);
      outing.activeTrip = {
        tripId: tripId,
        companionId: companion.speciesId,
        speciesId: companion.speciesId,
        destinationId: destination.id,
        departedDateKey: today,
        returnDateKey: nextDateKey(today),
        status: "traveling",
        rewardPlan: makeRewardPlan(destination.id, [tripId, destination.id, companion.speciesId, today].join("|"), data),
        createdAt: KA.date.localIsoString(),
        claimedAt: null
      };
      outing.totalTripCount += 1;
      outing.destinationStats[destination.id].tripCount += 1;
      outing.destinationStats[destination.id].lastTripDate = today;
      data.updatedAt = KA.date.localIsoString();
      KA.state.saveAppData();
      return { ok: true, trip: outing.activeTrip };
    } finally {
      departureLocked = false;
    }
  }

  function syncTripStatus(appData, dateKey) {
    var data = appData || KA.state.getAppData();
    var previousStatus = data.outing && data.outing.activeTrip && data.outing.activeTrip.status;
    var outing = ensureOuting(data, dateKey);
    var trip = outing.activeTrip;
    if (trip && previousStatus === "traveling" && trip.status === "returned") return { changed: true, trip: trip };
    if (trip && trip.status === "traveling" && String(dateKey || KA.date.localDateKey()) >= trip.returnDateKey) {
      trip.status = "returned";
      return { changed: true, trip: trip };
    }
    return { changed: false, trip: trip };
  }

  function grantReward(data, trip) {
    var plan = normalizeRewardPlan(trip.rewardPlan, trip.destinationId);
    trip.rewardPlan = plan;
    if (plan.type === "stars") {
      KA.stars.addLedgerEntry({
        type: "earn_outing",
        reason: "おでかけの おみやげ",
        totalDelta: plan.amount,
        spendableDelta: plan.amount
      });
      return { type: "stars", amount: plan.amount };
    }
    if (plan.type === "houseItem") {
      var house = KA.birdHouse.ensureBirdHouse(data);
      if (house.unlockedItemIds.indexOf(plan.itemId) < 0) {
        house.unlockedItemIds.push(plan.itemId);
        house.unlockedAtByItemId[plan.itemId] = KA.date.localIsoString();
        if (house.unseenItemIds.indexOf(plan.itemId) < 0) house.unseenItemIds.push(plan.itemId);
        return { type: "houseItem", itemId: plan.itemId };
      }
      KA.stars.addLedgerEntry({ type: "earn_outing", reason: "おでかけの おみやげ", totalDelta: 3, spendableDelta: 3 });
      trip.rewardPlan = { type: "stars", amount: 3 };
      return { type: "stars", amount: 3 };
    }
    var validCount = 0;
    plan.items.forEach(function (item) {
      if (KA.kitchen.addIngredientInventory(item.ingredientId, item.quantity, data)) validCount += 1;
    });
    if (validCount) return clone(plan);
    KA.stars.addLedgerEntry({ type: "earn_outing", reason: "おでかけの おみやげ", totalDelta: 2, spendableDelta: 2 });
    trip.rewardPlan = { type: "stars", amount: 2 };
    return { type: "stars", amount: 2 };
  }

  var claimLocked = false;
  function claimOutingReward(tripId) {
    if (claimLocked) return { ok: false, reason: "busy" };
    claimLocked = true;
    try {
      var data = KA.state.getAppData();
      var today = KA.date.localDateKey();
      var outing = ensureOuting(data, today);
      var id = String(tripId || "");
      if (!id || outing.claimedTripIds.indexOf(id) >= 0 || outing.history.some(function (trip) { return trip.tripId === id; })) {
        return { ok: false, reason: "already_claimed" };
      }
      var trip = outing.activeTrip;
      if (!trip || trip.tripId !== id) return { ok: false, reason: "not_found" };
      if (trip.status !== "returned" || today < trip.returnDateKey) return { ok: false, reason: "not_returned" };
      var reward = grantReward(data, trip);
      trip.status = "claimed";
      trip.claimedAt = KA.date.localIsoString();
      outing.history.push(clone(trip));
      outing.history = normalizeHistory(outing.history, today).slice(-HISTORY_LIMIT);
      outing.lastClaimedTripId = trip.tripId;
      outing.claimedTripIds.push(trip.tripId);
      outing.claimedTripIds = uniqueStrings(outing.claimedTripIds, CLAIMED_ID_LIMIT).slice(-CLAIMED_ID_LIMIT);
      outing.activeTrip = null;
      data.updatedAt = trip.claimedAt;
      KA.state.saveAppData();
      return { ok: true, trip: trip, reward: reward };
    } finally {
      claimLocked = false;
    }
  }

  function travelingSpeciesId(appData) {
    var data = appData || KA.state.getAppData();
    var trip = ensureOuting(data).activeTrip;
    return trip && trip.status === "traveling" ? trip.speciesId : null;
  }

  function rewardLabel(rewardPlan) {
    var plan = normalizeRewardPlan(rewardPlan, "");
    if (plan.type === "stars") return "ほしを" + plan.amount + "こ";
    if (plan.type === "houseItem") {
      var item = KA.birdHouse && KA.birdHouse.getItem ? KA.birdHouse.getItem(plan.itemId) : null;
      return item ? item.name : "おへやの かざり";
    }
    return plan.items.map(function (entry) {
      var ingredient = KA.kitchen.getIngredient(entry.ingredientId);
      return (ingredient ? ingredient.name : "そざい") + " " + entry.quantity + "こ";
    }).join("、");
  }

  function returnMessage(trip) {
    var destination = trip && getDestination(trip.destinationId);
    var messages = destination ? destination.returnMessages : ["おみやげを みつけたよ！"];
    return messages[hashString(trip && trip.tripId) % messages.length];
  }

  function renderDestinationIcon(destinationId) {
    var body = {
      outing_meadow: '<path d="M0 68 C22 48 47 62 68 50 C82 42 94 47 100 51 L100 100 L0 100 Z" fill="#7ACB77"/><circle cx="76" cy="22" r="12" fill="#FACC15"/><g fill="#FFF7A8"><path d="M26 24 L30 34 L41 35 L32 42 L35 53 L26 47 L17 53 L20 42 L11 35 L22 34 Z"/></g>',
      outing_flower_field: '<path d="M0 66 C25 52 55 63 100 48 L100 100 L0 100 Z" fill="#8BD17E"/><g><circle cx="28" cy="50" r="10" fill="#F9A8D4"/><circle cx="68" cy="42" r="10" fill="#C4B5FD"/><circle cx="82" cy="66" r="9" fill="#FDE68A"/><g fill="#FACC15"><circle cx="28" cy="50" r="4"/><circle cx="68" cy="42" r="4"/><circle cx="82" cy="66" r="4"/></g></g>',
      outing_sea: '<path d="M0 55 C18 46 30 64 48 55 C66 46 79 64 100 53 L100 100 L0 100 Z" fill="#60A5FA"/><path d="M0 72 C20 61 32 78 52 69 C72 60 84 76 100 68" fill="none" stroke="#DBEAFE" stroke-width="7"/><circle cx="79" cy="22" r="11" fill="#FACC15"/>'
    }[destinationId] || '<circle cx="50" cy="50" r="30" fill="#7ACB77"/>';
    return '<svg class="outing-destination-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  KA.outings = {
    allDestinations: allDestinations,
    getDestination: getDestination,
    defaultOuting: defaultOuting,
    ensureOuting: ensureOuting,
    preparationStatus: preparationStatus,
    eligibleCompanions: eligibleCompanions,
    startTrip: startTrip,
    syncTripStatus: syncTripStatus,
    claimOutingReward: claimOutingReward,
    travelingSpeciesId: travelingSpeciesId,
    rewardLabel: rewardLabel,
    returnMessage: returnMessage,
    renderDestinationIcon: renderDestinationIcon,
    nextDateKey: nextDateKey,
    hashString: hashString,
    tripFurnitureIds: TRIP_FURNITURE_IDS.slice(),
    historyLimit: HISTORY_LIMIT
  };
})(window);
