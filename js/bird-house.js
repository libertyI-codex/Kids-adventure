(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var SLOT_DEFINITIONS = [
    { id: "wallLeft", name: "左のかべ", type: "wall", x: 18, y: 22 },
    { id: "wallRight", name: "右のかべ", type: "wall", x: 82, y: 22 },
    { id: "floorLeft", name: "左のゆか", type: "floor", x: 22, y: 78 },
    { id: "floorRight", name: "右のゆか", type: "floor", x: 78, y: 78 },
    { id: "perchLeft", name: "左のとまり木", type: "perch", x: 28, y: 56 },
    { id: "perchRight", name: "右のとまり木", type: "perch", x: 72, y: 56 },
    { id: "centerTable", name: "まんなかテーブル", type: "table", x: 50, y: 73 },
    { id: "nestCorner", name: "すみっこの巣", type: "nest", x: 12, y: 84 }
  ];

  var INITIAL_ITEM_IDS = [
    "house_perch_basic",
    "house_nest_basic",
    "house_cushion_small",
    "house_food_table"
  ];

  var INITIAL_PLACEMENTS = {
    wallLeft: null,
    wallRight: null,
    floorLeft: "house_cushion_small",
    floorRight: null,
    perchLeft: "house_perch_basic",
    perchRight: null,
    centerTable: "house_food_table",
    nestCorner: "house_nest_basic"
  };

  var FURNITURE_ITEMS = [
    item("house_perch_basic", "基本の止まり木", 1, "perch", ["perch"], "最初からある、やさしい木の止まり木。", { type: "initial" }),
    item("house_nest_basic", "小さな巣", 2, "nest", ["nest"], "すみっこに置ける、ふかふかの巣。", { type: "initial" }),
    item("house_cushion_small", "小さなクッション", 3, "floor", ["floor"], "床に置ける小さなクッション。", { type: "initial" }),
    item("house_food_table", "ごはんテーブル", 4, "table", ["table"], "ごはんを置ける小さなテーブル。", { type: "initial" }),
    item("house_perch_large", "大きな止まり木", 5, "perch", ["perch"], "なかまが増えても使いやすい止まり木。", { type: "metric", metric: "acquiredSpeciesCount", target: 3, label: "とりを3しゅるい なかまにしよう" }),
    item("house_perch_rainbow", "虹の止まり木", 6, "perch", ["perch"], "6しゅるいの鳥が集まるとふえる虹色の止まり木。", { type: "metric", metric: "acquiredSpeciesCount", target: 6, label: "とりを6しゅるい なかまにしよう" }),
    item("house_table_wood", "木のテーブル", 7, "table", ["table"], "料理の思い出が増える木のテーブル。", { type: "metric", metric: "uniqueRecipeCount", target: 3, label: "ちがう料理を3しゅるい つくろう" }),
    item("house_kitchen_wagon", "キッチンワゴン", 8, "table", ["table"], "たくさん料理したしるしのワゴン。", { type: "metric", metric: "totalCookCount", target: 10, label: "りょうりを10かい つくろう" }),
    item("house_mobile_rainbow", "虹のモビール", 9, "wall", ["wall"], "ぬりえの作品がふえると飾れるモビール。", { type: "metric", metric: "completedArtworkCount", target: 3, label: "ぬりえ作品を3まい 完成させよう" }),
    item("house_bell_toy", "おもちゃのベル", 10, "wall-floor", ["wall", "floor"], "ごはんの時間が楽しくなるベル。", { type: "metric", metric: "totalMealCount", target: 5, label: "とりへ ごはんを5かい あげよう" }),
    item("house_cushion_star", "星のクッション", 11, "floor", ["floor"], "なかよしの鳥がいると使える星形クッション。", { type: "metric", metric: "maxBondLevel", target: 5, label: "なかよしレベル5の とりを1しゅるい 見つけよう" }),
    item("house_photo_frame", "思い出の写真立て", 12, "wall", ["wall"], "たくさん孵化した思い出を飾る写真立て。", { type: "metric", metric: "totalHatchCount", target: 8, label: "とりの合計孵化を8かいにしよう" }),
    item("house_trip_flower_wreath", "おはなのリース", 13, "wall", ["wall"], "はなのはらで見つける、丸いお花のリース。", { type: "outing", destinationId: "outing_flower_field", label: "はなのはらへ おでかけして みつけよう！" }),
    item("house_trip_flower_cushion", "おはなのクッション", 14, "floor", ["floor"], "お花の形をした、やわらかいクッション。", { type: "outing", destinationId: "outing_flower_field", label: "はなのはらへ おでかけして みつけよう！" }),
    item("house_trip_butterfly_mobile", "ちょうちょのモビール", 15, "wall", ["wall"], "ちょうちょがゆれる、明るいモビール。", { type: "outing", destinationId: "outing_flower_field", label: "はなのはらへ おでかけして みつけよう！" })
  ];

  function item(id, name, order, type, slots, description, unlockCondition) {
    return {
      id: id,
      name: name,
      displayOrder: order,
      type: type,
      compatibleSlotTypes: slots,
      unlockCondition: unlockCondition,
      description: description
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function allSlots() {
    return clone(SLOT_DEFINITIONS);
  }

  function allItems() {
    return clone(FURNITURE_ITEMS).sort(function (a, b) {
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }

  function getSlot(slotId) {
    return allSlots().filter(function (slot) { return slot.id === slotId; })[0] || null;
  }

  function getItem(itemId) {
    return allItems().filter(function (item) { return item.id === itemId; })[0] || null;
  }

  function isCompatible(itemId, slotId) {
    var item = getItem(itemId);
    var slot = getSlot(slotId);
    return Boolean(item && slot && item.compatibleSlotTypes.indexOf(slot.type) >= 0);
  }

  function uniqueValidItemIds(value) {
    var result = [];
    (Array.isArray(value) ? value : []).forEach(function (itemId) {
      if (getItem(itemId) && result.indexOf(itemId) === -1) result.push(itemId);
    });
    return result;
  }

  function defaultBirdHouse() {
    return {
      unlockedItemIds: INITIAL_ITEM_IDS.slice(),
      unlockedAtByItemId: {},
      unseenItemIds: [],
      placements: clone(INITIAL_PLACEMENTS),
      lastVisitedAt: null,
      lastInteractedCompanionId: null
    };
  }

  function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function ownedCompanions(appData) {
    if (!KA.companions || !KA.companions.ensureCompanions) return [];
    return KA.companions.ensureCompanions(appData).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    });
  }

  function getBirdHouseMetrics(appData) {
    var data = appData || KA.state.getAppData();
    var companions = ownedCompanions(data);
    var seenSpecies = {};
    var totalHatchCount = 0;
    var totalMealCount = 0;
    var maxBondLevel = 0;
    companions.forEach(function (companion) {
      seenSpecies[companion.speciesId] = true;
      totalHatchCount += Math.max(0, Number(companion.hatchCount || 0));
      totalMealCount += Math.max(0, Number(companion.mealCount || 0));
      maxBondLevel = Math.max(maxBondLevel, Math.max(0, Number(companion.bondLevel || 0)));
    });
    var kitchen = data.kitchen && typeof data.kitchen === "object" && !Array.isArray(data.kitchen) ? data.kitchen : {};
    var recipeStats = safeObject(kitchen.recipeStats);
    var uniqueRecipeCount = 0;
    var totalCookCount = 0;
    Object.keys(recipeStats).forEach(function (recipeId) {
      var stat = recipeStats[recipeId];
      var count = stat && typeof stat === "object" ? Math.max(0, Number(stat.cookCount || 0)) : 0;
      if (count > 0) uniqueRecipeCount += 1;
      totalCookCount += count;
    });
    var completedArtworkCount = (Array.isArray(data.artworks) ? data.artworks : []).filter(function (artwork) {
      return artwork && artwork.artworkId;
    }).length;
    return {
      acquiredSpeciesCount: Object.keys(seenSpecies).length,
      totalHatchCount: totalHatchCount,
      uniqueRecipeCount: uniqueRecipeCount,
      totalCookCount: totalCookCount,
      totalMealCount: totalMealCount,
      completedArtworkCount: completedArtworkCount,
      maxBondLevel: maxBondLevel
    };
  }

  function conditionMet(condition, metrics) {
    if (!condition || condition.type === "initial") return true;
    if (condition.type !== "metric") return false;
    return Number(metrics[condition.metric] || 0) >= Number(condition.target || 0);
  }

  function conditionProgress(item, metrics) {
    var condition = item.unlockCondition || {};
    if (condition.type === "initial") return { label: "最初から もっているよ", current: 1, target: 1, remaining: 0 };
    if (condition.type === "outing") return { label: condition.label || item.description, current: 0, target: 1, remaining: 1 };
    var current = Math.max(0, Number(metrics[condition.metric] || 0));
    var target = Math.max(0, Number(condition.target || 0));
    return {
      label: condition.label || item.description,
      current: current,
      target: target,
      remaining: Math.max(0, target - current)
    };
  }

  function defaultPlacementForSlot(slotId) {
    return Object.prototype.hasOwnProperty.call(INITIAL_PLACEMENTS, slotId) ? INITIAL_PLACEMENTS[slotId] : null;
  }

  function normalizePlacements(rawPlacements, unlockedIds) {
    var raw = safeObject(rawPlacements);
    var result = {};
    var used = {};
    allSlots().forEach(function (slot) {
      var itemId = raw[slot.id];
      if (typeof itemId === "undefined") itemId = defaultPlacementForSlot(slot.id);
      if (!itemId || unlockedIds.indexOf(itemId) < 0 || used[itemId] || !isCompatible(itemId, slot.id)) {
        result[slot.id] = null;
        return;
      }
      result[slot.id] = itemId;
      used[itemId] = true;
    });
    return result;
  }

  function ensureBirdHouse(appData) {
    var data = appData || KA.state.getAppData();
    var defaults = defaultBirdHouse();
    var house = safeObject(data.birdHouse);
    house.unlockedItemIds = uniqueValidItemIds(house.unlockedItemIds);
    INITIAL_ITEM_IDS.forEach(function (itemId) {
      if (house.unlockedItemIds.indexOf(itemId) === -1) house.unlockedItemIds.push(itemId);
    });
    house.unlockedAtByItemId = safeObject(house.unlockedAtByItemId);
    house.unseenItemIds = uniqueValidItemIds(house.unseenItemIds).filter(function (itemId) {
      return house.unlockedItemIds.indexOf(itemId) >= 0;
    });
    house.placements = normalizePlacements(house.placements || defaults.placements, house.unlockedItemIds);
    house.lastVisitedAt = house.lastVisitedAt || null;
    house.lastInteractedCompanionId = house.lastInteractedCompanionId || null;
    data.birdHouse = house;
    evaluateBirdHouseUnlocks(data);
    house.placements = normalizePlacements(house.placements, house.unlockedItemIds);
    return house;
  }

  function evaluateBirdHouseUnlocks(appData) {
    var data = appData || KA.state.getAppData();
    var house = data.birdHouse && typeof data.birdHouse === "object" && !Array.isArray(data.birdHouse) ? data.birdHouse : defaultBirdHouse();
    var metrics = getBirdHouseMetrics(data);
    house.unlockedItemIds = uniqueValidItemIds(house.unlockedItemIds);
    house.unseenItemIds = uniqueValidItemIds(house.unseenItemIds);
    house.unlockedAtByItemId = safeObject(house.unlockedAtByItemId);
    allItems().forEach(function (item) {
      if (!conditionMet(item.unlockCondition, metrics)) return;
      if (house.unlockedItemIds.indexOf(item.id) === -1) {
        house.unlockedItemIds.push(item.id);
        house.unlockedAtByItemId[item.id] = KA.date.localIsoString();
        if (INITIAL_ITEM_IDS.indexOf(item.id) === -1 && house.unseenItemIds.indexOf(item.id) === -1) {
          house.unseenItemIds.push(item.id);
        }
      }
    });
    data.birdHouse = house;
    return { house: house, metrics: metrics };
  }

  function markVisited(appData) {
    var data = appData || KA.state.getAppData();
    var house = ensureBirdHouse(data);
    house.lastVisitedAt = KA.date.localIsoString();
    return house;
  }

  function clearUnseen(appData) {
    var data = appData || KA.state.getAppData();
    var house = ensureBirdHouse(data);
    house.unseenItemIds = [];
    KA.state.saveAppData();
  }

  function placeItem(slotId, itemId, appData) {
    var data = appData || KA.state.getAppData();
    var house = ensureBirdHouse(data);
    if (!getSlot(slotId)) return false;
    if (itemId && (house.unlockedItemIds.indexOf(itemId) < 0 || !isCompatible(itemId, slotId))) return false;
    Object.keys(house.placements).forEach(function (key) {
      if (itemId && house.placements[key] === itemId) house.placements[key] = null;
    });
    house.placements[slotId] = itemId || null;
    house.placements = normalizePlacements(house.placements, house.unlockedItemIds);
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return true;
  }

  function compatibleUnlockedItems(slotId, appData) {
    var data = appData || KA.state.getAppData();
    var house = ensureBirdHouse(data);
    return allItems().filter(function (item) {
      return house.unlockedItemIds.indexOf(item.id) >= 0 && isCompatible(item.id, slotId);
    });
  }

  function companionLayout(appData, focusSpeciesId) {
    var data = appData || KA.state.getAppData();
    var owned = ownedCompanions(data);
    var awayId = KA.outings && KA.outings.travelingSpeciesId ? KA.outings.travelingSpeciesId(data) : null;
    if (awayId) owned = owned.filter(function (companion) { return companion.speciesId !== awayId; });
    var favorite = KA.companions && KA.companions.favoriteCompanion ? KA.companions.favoriteCompanion(data) : null;
    var focusId = focusSpeciesId || (favorite && favorite.speciesId) || (owned[0] && owned[0].speciesId) || null;
    owned.sort(function (a, b) {
      if (a.speciesId === focusId) return -1;
      if (b.speciesId === focusId) return 1;
      var speciesA = KA.companions.getSpecies(a.speciesId);
      var speciesB = KA.companions.getSpecies(b.speciesId);
      return Number((speciesA && speciesA.displayOrder) || 0) - Number((speciesB && speciesB.displayOrder) || 0);
    });
    var sets = {
      1: [{ x: 50, y: 61, scale: 1.04 }],
      2: [{ x: 42, y: 62, scale: 1 }, { x: 62, y: 64, scale: 0.96 }],
      3: [{ x: 50, y: 58, scale: 1 }, { x: 29, y: 68, scale: 0.9 }, { x: 72, y: 69, scale: 0.9 }],
      4: [{ x: 50, y: 56, scale: 0.92 }, { x: 26, y: 68, scale: 0.82 }, { x: 74, y: 69, scale: 0.82 }, { x: 48, y: 78, scale: 0.78 }],
      5: [{ x: 50, y: 56, scale: 0.88 }, { x: 23, y: 67, scale: 0.78 }, { x: 77, y: 68, scale: 0.78 }, { x: 38, y: 80, scale: 0.72 }, { x: 62, y: 80, scale: 0.72 }],
      6: [{ x: 50, y: 55, scale: 0.82 }, { x: 22, y: 65, scale: 0.72 }, { x: 78, y: 66, scale: 0.72 }, { x: 34, y: 80, scale: 0.68 }, { x: 62, y: 80, scale: 0.68 }, { x: 84, y: 80, scale: 0.64 }]
    };
    var positions = sets[Math.min(6, Math.max(1, owned.length))] || [];
    return owned.map(function (companion, index) {
      var species = KA.companions.getSpecies(companion.speciesId);
      var position = positions[index] || { x: 50, y: 70, scale: 0.75 };
      var scale = position.scale;
      if (companion.speciesId === "companion_peacock") scale *= 0.82;
      return {
        companion: companion,
        species: species,
        x: position.x,
        y: position.y,
        scale: scale,
        isFocus: companion.speciesId === focusId
      };
    });
  }

  function recordInteraction(speciesId, appData) {
    var data = appData || KA.state.getAppData();
    var house = ensureBirdHouse(data);
    house.lastInteractedCompanionId = speciesId || null;
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
  }

  function renderFurniture(itemId, options) {
    var opts = options || {};
    var item = getItem(itemId) || FURNITURE_ITEMS[0];
    var dark = opts.silhouette ? "#1f2937" : null;
    var fillA = dark || "#D97706";
    var fillB = dark || "#FDE68A";
    var svg = {
      house_perch_basic: '<path d="M18 62 C37 52 66 52 84 62" fill="none" stroke="' + fillA + '" stroke-width="9" stroke-linecap="round"/><path d="M34 63 L27 84 M68 63 L75 84" fill="none" stroke="' + fillA + '" stroke-width="6" stroke-linecap="round"/>',
      house_nest_basic: '<path d="M22 64 C30 42 70 42 79 64 C74 82 28 82 22 64 Z" fill="' + (dark || "#A16207") + '"/><path d="M31 61 C42 70 60 70 72 61" fill="none" stroke="' + fillB + '" stroke-width="5" stroke-linecap="round"/>',
      house_cushion_small: '<path d="M25 55 C22 34 76 34 75 55 C78 77 22 77 25 55 Z" fill="' + (dark || "#F9A8D4") + '"/><path d="M34 46 C47 55 58 55 69 46" fill="none" stroke="' + fillB + '" stroke-width="4" stroke-linecap="round"/>',
      house_food_table: '<path d="M26 47 L74 47 L80 60 L20 60 Z" fill="' + fillB + '"/><path d="M31 60 L27 82 M69 60 L73 82" fill="none" stroke="' + fillA + '" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="42" r="9" fill="' + (dark || "#7ACB77") + '"/>',
      house_perch_large: '<path d="M12 58 C35 43 66 43 88 58" fill="none" stroke="' + fillA + '" stroke-width="11" stroke-linecap="round"/><path d="M25 60 L18 87 M50 54 L50 88 M75 60 L82 87" fill="none" stroke="' + fillA + '" stroke-width="6" stroke-linecap="round"/>',
      house_perch_rainbow: '<path d="M14 62 C35 38 65 38 86 62" fill="none" stroke="' + (dark || "#EF4444") + '" stroke-width="13" stroke-linecap="round"/><path d="M18 62 C38 45 62 45 82 62" fill="none" stroke="' + (dark || "#FACC15") + '" stroke-width="8" stroke-linecap="round"/><path d="M24 62 C41 52 59 52 76 62" fill="none" stroke="' + (dark || "#22C55E") + '" stroke-width="4" stroke-linecap="round"/>',
      house_table_wood: '<path d="M22 43 L78 43 L75 60 L25 60 Z" fill="' + fillA + '"/><path d="M32 60 L27 86 M68 60 L73 86" fill="none" stroke="' + (dark || "#92400E") + '" stroke-width="7" stroke-linecap="round"/><path d="M30 50 L70 50" stroke="' + fillB + '" stroke-width="4" stroke-linecap="round"/>',
      house_kitchen_wagon: '<path d="M23 35 L77 35 L73 75 L27 75 Z" fill="' + (dark || "#93C5FD") + '"/><path d="M29 48 L71 48 M31 62 L69 62" stroke="' + fillB + '" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="81" r="6" fill="' + fillA + '"/><circle cx="66" cy="81" r="6" fill="' + fillA + '"/>',
      house_mobile_rainbow: '<path d="M50 12 L50 32" stroke="' + fillA + '" stroke-width="4" stroke-linecap="round"/><path d="M24 39 C36 21 64 21 76 39" fill="none" stroke="' + (dark || "#EF4444") + '" stroke-width="6" stroke-linecap="round"/><path d="M31 42 C40 31 60 31 69 42" fill="none" stroke="' + (dark || "#FACC15") + '" stroke-width="5" stroke-linecap="round"/><path d="M38 45 C45 39 55 39 62 45" fill="none" stroke="' + (dark || "#38BDF8") + '" stroke-width="5" stroke-linecap="round"/>',
      house_bell_toy: '<path d="M38 31 C39 18 61 18 62 31 L72 63 L28 63 Z" fill="' + (dark || "#FACC15") + '"/><path d="M32 64 L68 64" stroke="' + fillA + '" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="71" r="6" fill="' + fillA + '"/>',
      house_cushion_star: '<path d="M50 18 L59 39 L82 41 L64 56 L70 79 L50 66 L30 79 L36 56 L18 41 L41 39 Z" fill="' + (dark || "#FACC15") + '"/><path d="M40 50 C48 56 56 56 64 50" fill="none" stroke="' + fillB + '" stroke-width="4" stroke-linecap="round"/>',
      house_photo_frame: '<path d="M24 25 L76 25 L76 72 L24 72 Z" fill="' + fillA + '"/><path d="M31 32 L69 32 L69 64 L31 64 Z" fill="' + (dark || "#DBEAFE") + '"/><circle cx="44" cy="45" r="7" fill="' + (dark || "#F9A8D4") + '"/><path d="M35 62 C43 53 56 53 65 62" fill="none" stroke="' + (dark || "#7ACB77") + '" stroke-width="5" stroke-linecap="round"/>',
      house_trip_flower_wreath: '<circle cx="50" cy="52" r="28" fill="none" stroke="' + (dark || "#65A30D") + '" stroke-width="9"/><g fill="' + (dark || "#F9A8D4") + '"><circle cx="50" cy="22" r="9"/><circle cx="76" cy="39" r="9"/><circle cx="70" cy="70" r="9"/><circle cx="31" cy="72" r="9"/><circle cx="23" cy="42" r="9"/></g><g fill="' + (dark || "#FACC15") + '"><circle cx="50" cy="22" r="3"/><circle cx="76" cy="39" r="3"/><circle cx="70" cy="70" r="3"/><circle cx="31" cy="72" r="3"/><circle cx="23" cy="42" r="3"/></g>',
      house_trip_flower_cushion: '<g fill="' + (dark || "#F9A8D4") + '"><circle cx="50" cy="30" r="18"/><circle cx="72" cy="48" r="18"/><circle cx="64" cy="72" r="18"/><circle cx="36" cy="72" r="18"/><circle cx="28" cy="48" r="18"/></g><circle cx="50" cy="52" r="18" fill="' + (dark || "#FDE68A") + '"/><path d="M42 52 C47 57 54 57 59 52" fill="none" stroke="' + (dark || "#D97706") + '" stroke-width="4" stroke-linecap="round"/>',
      house_trip_butterfly_mobile: '<path d="M50 10 L50 30 M22 34 L78 34" fill="none" stroke="' + fillA + '" stroke-width="4" stroke-linecap="round"/><path d="M31 48 C18 35 14 57 29 61 C18 71 39 78 44 59 Z" fill="' + (dark || "#F9A8D4") + '"/><path d="M69 48 C82 35 86 57 71 61 C82 71 61 78 56 59 Z" fill="' + (dark || "#93C5FD") + '"/><path d="M32 35 L32 48 M68 35 L68 48" stroke="' + fillA + '" stroke-width="3"/>'
    }[item.id] || '<circle cx="50" cy="50" r="30" fill="' + fillA + '"/>';
    return '<svg class="bird-house-furniture-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + svg + '</svg>';
  }

  KA.birdHouse = {
    allSlots: allSlots,
    allItems: allItems,
    getSlot: getSlot,
    getItem: getItem,
    isCompatible: isCompatible,
    defaultBirdHouse: defaultBirdHouse,
    ensureBirdHouse: ensureBirdHouse,
    getBirdHouseMetrics: getBirdHouseMetrics,
    evaluateBirdHouseUnlocks: evaluateBirdHouseUnlocks,
    conditionProgress: conditionProgress,
    markVisited: markVisited,
    clearUnseen: clearUnseen,
    placeItem: placeItem,
    compatibleUnlockedItems: compatibleUnlockedItems,
    companionLayout: companionLayout,
    recordInteraction: recordInteraction,
    renderFurniture: renderFurniture,
    initialItemIds: INITIAL_ITEM_IDS.slice()
  };
})(window);
