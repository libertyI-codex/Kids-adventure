(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var HISTORY_LIMIT = 100;

  var INGREDIENTS = [
    { id: "ingredient_apple", name: "りんご", category: "フルーツ", displayOrder: 1, colors: ["#EF4444", "#FDE68A"] },
    { id: "ingredient_strawberry", name: "いちご", category: "フルーツ", displayOrder: 2, colors: ["#F43F5E", "#FDE68A"] },
    { id: "ingredient_banana", name: "バナナ", category: "フルーツ", displayOrder: 3, colors: ["#FACC15", "#FEF3C7"] },
    { id: "ingredient_grape", name: "ぶどう", category: "フルーツ", displayOrder: 4, colors: ["#8B5CF6", "#A7F3D0"] },
    { id: "ingredient_bread", name: "パン", category: "主食・生地", displayOrder: 5, colors: ["#D97706", "#FDE68A"] },
    { id: "ingredient_noodles", name: "めん", category: "主食・生地", displayOrder: 6, colors: ["#FDE68A", "#F59E0B"] },
    { id: "ingredient_flour", name: "こむぎこ", category: "主食・生地", displayOrder: 7, colors: ["#F8FAFC", "#CBD5E1"] },
    { id: "ingredient_meat", name: "にく", category: "肉・卵", displayOrder: 8, colors: ["#EF4444", "#FCA5A5"] },
    { id: "ingredient_ham", name: "ハム", category: "肉・卵", displayOrder: 9, colors: ["#FB7185", "#FBCFE8"] },
    { id: "ingredient_egg", name: "たまご", category: "肉・卵", displayOrder: 10, colors: ["#FEF3C7", "#FACC15"] },
    { id: "ingredient_lettuce", name: "レタス", category: "野菜", displayOrder: 11, colors: ["#22C55E", "#BBF7D0"] },
    { id: "ingredient_tomato", name: "トマト", category: "野菜", displayOrder: 12, colors: ["#EF4444", "#FCA5A5"] },
    { id: "ingredient_onion", name: "たまねぎ", category: "野菜", displayOrder: 13, colors: ["#FDE68A", "#C084FC"] },
    { id: "ingredient_cheese", name: "チーズ", category: "乳製品・甘い素材", displayOrder: 14, colors: ["#FACC15", "#FEF3C7"] },
    { id: "ingredient_milk", name: "ミルク", category: "乳製品・甘い素材", displayOrder: 15, colors: ["#FFFFFF", "#BFDBFE"] },
    { id: "ingredient_ice_cream", name: "アイスクリーム", category: "乳製品・甘い素材", displayOrder: 16, colors: ["#FBCFE8", "#FFFFFF"] },
    { id: "ingredient_cornflakes", name: "コーンフレーク", category: "乳製品・甘い素材", displayOrder: 17, colors: ["#F59E0B", "#FDE68A"] }
  ];

  var RECIPES = [
    recipe("recipe_fruit_salad", "フルーツサラダ", 1, ["ingredient_apple", "ingredient_strawberry", "ingredient_banana", "ingredient_grape"], [
      step("cut", "くだものを きろう", "とん とん とん！"),
      step("mix", "くだものを まぜよう", "くるくる まぜよう！"),
      step("plate", "おさらに もりつけよう", "きれいに もりつけよう！")
    ]),
    recipe("recipe_sandwich", "サンドイッチ", 2, ["ingredient_bread", "ingredient_ham", "ingredient_lettuce", "ingredient_tomato", "ingredient_cheese"], [
      step("cut", "トマトを きろう", "とん とん とん！"),
      step("layer", "ざいりょうを かさねよう", "じゅんばんに のせよう！"),
      step("cut", "サンドイッチを きろう", "そっと きろう！"),
      step("plate", "おさらに もりつけよう", "できあがりに ちかづいたよ！")
    ]),
    recipe("recipe_hamburg_steak", "ハンバーグ", 3, ["ingredient_meat", "ingredient_onion", "ingredient_egg"], [
      step("cut", "たまねぎを きろう", "とん とん とん！"),
      step("mix", "ざいりょうを まぜよう", "くるくる まぜよう！"),
      step("knead", "こねこね しよう", "ぎゅっ ぎゅっ！"),
      step("shape", "かたちを つくろう", "まあるく しよう！"),
      step("grill", "フライパンで やこう", "こんがり やこう！"),
      step("plate", "おさらに もりつけよう", "よいしょっと！")
    ]),
    recipe("recipe_spaghetti", "スパゲティ", 4, ["ingredient_noodles", "ingredient_tomato", "ingredient_onion", "ingredient_meat"], [
      step("cut", "トマトと たまねぎを きろう", "とん とん とん！"),
      step("boil", "めんを ゆでよう", "ぐつぐつ まとう！"),
      step("fry", "にくと やさいを いためよう", "フライパンを うごかそう！"),
      step("mix", "めんと まぜよう", "くるくる まぜよう！"),
      step("plate", "おさらに もりつけよう", "くるんと のせよう！")
    ]),
    recipe("recipe_ramen", "ラーメン", 5, ["ingredient_noodles", "ingredient_egg"], [
      step("boil", "めんを ゆでよう", "ぐつぐつ まとう！"),
      step("cut", "たまごを きろう", "そっと きろう！"),
      step("plate", "スープへ もりつけよう", "あたたかく しあげよう！")
    ]),
    recipe("recipe_yakiniku", "やきにく", 6, ["ingredient_meat", "ingredient_onion", "ingredient_lettuce"], [
      step("cut", "たまねぎを きろう", "とん とん とん！"),
      step("grill", "にくと たまねぎを やこう", "じゅうじゅう！"),
      step("plate", "レタスと もりつけよう", "おさらに のせよう！")
    ]),
    recipe("recipe_shumai", "しゅうまい", 7, ["ingredient_flour", "ingredient_meat", "ingredient_onion"], [
      step("mix", "こむぎこを まぜよう", "くるくる まぜよう！"),
      step("shape", "かわを つくろう", "うすく のばそう！"),
      step("cut", "たまねぎを きろう", "とん とん とん！"),
      step("mix", "にくと たまねぎを まぜよう", "くるくる まぜよう！"),
      step("wrap", "かわで つつもう", "やさしく つつもう！"),
      step("steam", "しゅうまいを むそう", "ほかほかに しよう！"),
      step("plate", "おさらに もりつけよう", "ならべて みよう！")
    ]),
    recipe("recipe_hamburger", "ハンバーガー", 8, ["ingredient_bread", "ingredient_meat", "ingredient_lettuce", "ingredient_tomato", "ingredient_cheese"], [
      step("knead", "にくを こねよう", "こねこね しよう！"),
      step("shape", "かたちを つくろう", "まあるく しよう！"),
      step("grill", "にくを やこう", "こんがり やこう！"),
      step("cut", "トマトを きろう", "とん とん とん！"),
      step("layer", "ざいりょうを かさねよう", "たかく つみあげよう！")
    ]),
    recipe("recipe_cake", "ケーキ", 9, ["ingredient_flour", "ingredient_egg", "ingredient_milk", "ingredient_strawberry"], [
      step("mix", "ざいりょうを まぜよう", "くるくる まぜよう！"),
      step("bake", "オーブンで やこう", "ふんわり まとう！"),
      step("cut", "いちごを きろう", "そっと きろう！"),
      step("decorate", "かざりつけよう", "かわいく のせよう！")
    ]),
    recipe("recipe_parfait", "パフェ", 10, ["ingredient_ice_cream", "ingredient_cornflakes", "ingredient_strawberry", "ingredient_banana"], [
      step("cut", "いちごと バナナを きろう", "とん とん とん！"),
      step("layer", "コーンフレークを いれよう", "さくさく いれよう！"),
      step("layer", "アイスを かさねよう", "ひんやり のせよう！"),
      step("decorate", "くだものを かざろう", "きらきらに しよう！")
    ])
  ];

  function recipe(id, name, order, ingredientIds, steps) {
    return { id: id, name: name, displayOrder: order, ingredientIds: ingredientIds, steps: steps };
  }

  function step(type, title, instruction) {
    return { type: type, title: title, instruction: instruction };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function allIngredients() {
    return clone(INGREDIENTS).sort(function (a, b) {
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }

  function allRecipes() {
    return clone(RECIPES).sort(function (a, b) {
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }

  function getIngredient(id) {
    return allIngredients().filter(function (item) { return item.id === id; })[0] || null;
  }

  function getRecipe(id) {
    return allRecipes().filter(function (item) { return item.id === id; })[0] || null;
  }

  function contains(list, value) {
    return list.indexOf(value) >= 0;
  }

  function uniqueValidIngredients(ids) {
    var result = [];
    (Array.isArray(ids) ? ids : []).forEach(function (id) {
      if (getIngredient(id) && result.indexOf(id) === -1) result.push(id);
    });
    return result;
  }

  function defaultKitchen() {
    return {
      currentCooking: null,
      recipeStats: {},
      cookingHistory: []
    };
  }

  function safeNumber(value, fallback) {
    var numberValue = Number(value);
    return isFinite(numberValue) ? numberValue : fallback;
  }

  function createCookingId(recipeId) {
    return "cooking_" + KA.date.compactDateKey() + "_" + KA.companions.hashString(recipeId + "_" + KA.date.localIsoString()).toString(36);
  }

  function createMealId(recipeId, companionId) {
    return "meal_" + KA.date.compactDateKey() + "_" + KA.companions.hashString(recipeId + "_" + companionId + "_" + KA.date.localIsoString()).toString(36);
  }

  function normalizeStats(raw) {
    var stats = {};
    var input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    Object.keys(input).forEach(function (recipeId) {
      var recipe = getRecipe(recipeId);
      var item = input[recipeId];
      if (!recipe || !item || typeof item !== "object" || Array.isArray(item)) return;
      stats[recipeId] = {
        firstCookedAt: item.firstCookedAt || item.lastCookedAt || null,
        lastCookedAt: item.lastCookedAt || item.firstCookedAt || null,
        cookCount: Math.max(0, Math.floor(safeNumber(item.cookCount, 0))),
        fedCount: Math.max(0, Math.floor(safeNumber(item.fedCount, 0)))
      };
    });
    return stats;
  }

  function normalizeHistory(raw) {
    return (Array.isArray(raw) ? raw : []).filter(function (item) {
      return item && typeof item === "object" && getRecipe(item.recipeId);
    }).map(function (item) {
      var recipe = getRecipe(item.recipeId);
      return {
        id: item.id || createMealId(item.recipeId, item.fedCompanionId || ""),
        recipeId: item.recipeId,
        ingredientIds: uniqueValidIngredients(item.ingredientIds || recipe.ingredientIds),
        completedAt: item.completedAt || item.fedAt || KA.date.localIsoString(),
        fedCompanionId: item.fedCompanionId || null,
        fedAt: item.fedAt || item.completedAt || KA.date.localIsoString()
      };
    }).slice(-HISTORY_LIMIT);
  }

  function normalizeCurrentCooking(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    var recipe = getRecipe(raw.recipeId);
    if (!recipe) return null;
    var selected = uniqueValidIngredients(raw.selectedIngredientIds);
    var required = recipe.ingredientIds.slice();
    required.forEach(function (id) {
      if (selected.indexOf(id) === -1) selected.push(id);
    });
    var maxStep = recipe.steps.length;
    var index = Math.floor(safeNumber(raw.currentStepIndex, 0));
    if (index < 0) index = 0;
    if (index > maxStep) index = maxStep;
    return {
      id: raw.id || createCookingId(recipe.id),
      recipeId: recipe.id,
      selectedIngredientIds: selected,
      currentStepIndex: index,
      startedAt: raw.startedAt || KA.date.localIsoString(),
      updatedAt: raw.updatedAt || raw.startedAt || KA.date.localIsoString(),
      completedAt: raw.completedAt || (index >= maxStep ? KA.date.localIsoString() : null),
      statsRecorded: Boolean(raw.statsRecorded),
      preselectedCompanionId: raw.preselectedCompanionId || null
    };
  }

  function ensureKitchen(appData) {
    var data = appData || KA.state.getAppData();
    var kitchen = data.kitchen && typeof data.kitchen === "object" && !Array.isArray(data.kitchen) ? data.kitchen : defaultKitchen();
    kitchen.currentCooking = normalizeCurrentCooking(kitchen.currentCooking);
    kitchen.recipeStats = normalizeStats(kitchen.recipeStats);
    kitchen.cookingHistory = normalizeHistory(kitchen.cookingHistory);
    data.kitchen = kitchen;
    if (KA.companions && KA.companions.ensureCompanions) KA.companions.ensureCompanions(data);
    return kitchen;
  }

  function recordCookedStats(appData, cooking) {
    var data = appData || KA.state.getAppData();
    var kitchen = data.kitchen && typeof data.kitchen === "object" && !Array.isArray(data.kitchen) ? data.kitchen : ensureKitchen(data);
    if (!cooking || cooking.statsRecorded) return;
    var now = cooking.completedAt || KA.date.localIsoString();
    var stats = kitchen.recipeStats[cooking.recipeId] || {
      firstCookedAt: now,
      lastCookedAt: now,
      cookCount: 0,
      fedCount: 0
    };
    stats.firstCookedAt = stats.firstCookedAt || now;
    stats.lastCookedAt = now;
    stats.cookCount = Math.max(0, Number(stats.cookCount || 0)) + 1;
    stats.fedCount = Math.max(0, Number(stats.fedCount || 0));
    kitchen.recipeStats[cooking.recipeId] = stats;
    cooking.statsRecorded = true;
    if (kitchen.currentCooking && kitchen.currentCooking.id === cooking.id) {
      kitchen.currentCooking.statsRecorded = true;
    }
  }

  function startCooking(recipeId, selectedIngredientIds, preselectedCompanionId) {
    var data = KA.state.getAppData();
    var kitchen = ensureKitchen(data);
    var recipe = getRecipe(recipeId);
    var selected = uniqueValidIngredients(selectedIngredientIds);
    if (!recipe) return { ok: false, message: "りょうりが 見つかりません" };
    var missing = recipe.ingredientIds.filter(function (id) {
      return selected.indexOf(id) === -1;
    });
    if (missing.length) {
      return { ok: false, missingIngredientIds: missing, message: "たりない ざいりょうが あるよ" };
    }
    kitchen.currentCooking = {
      id: createCookingId(recipe.id),
      recipeId: recipe.id,
      selectedIngredientIds: selected,
      currentStepIndex: 0,
      startedAt: KA.date.localIsoString(),
      updatedAt: KA.date.localIsoString(),
      completedAt: null,
      statsRecorded: false,
      preselectedCompanionId: preselectedCompanionId || null
    };
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, cooking: kitchen.currentCooking, recipe: recipe };
  }

  function quitCooking() {
    var data = KA.state.getAppData();
    var kitchen = ensureKitchen(data);
    kitchen.currentCooking = null;
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
  }

  function completeCurrentStep() {
    var data = KA.state.getAppData();
    var kitchen = ensureKitchen(data);
    var cooking = kitchen.currentCooking;
    if (!cooking) return { ok: false, message: "りょうりが ありません" };
    var recipe = getRecipe(cooking.recipeId);
    if (!recipe) return { ok: false, message: "りょうりが 見つかりません" };
    if (cooking.currentStepIndex < recipe.steps.length) {
      cooking.currentStepIndex += 1;
      cooking.updatedAt = KA.date.localIsoString();
    }
    if (cooking.currentStepIndex >= recipe.steps.length) {
      cooking.currentStepIndex = recipe.steps.length;
      cooking.completedAt = cooking.completedAt || KA.date.localIsoString();
      recordCookedStats(data, cooking);
    }
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, completed: Boolean(cooking.completedAt), cooking: cooking, recipe: recipe };
  }

  function isCookingComplete(cooking) {
    var recipe = cooking && getRecipe(cooking.recipeId);
    return Boolean(recipe && cooking.completedAt && Number(cooking.currentStepIndex || 0) >= recipe.steps.length);
  }

  function feedCompletedCooking(speciesId) {
    var data = KA.state.getAppData();
    var kitchen = ensureKitchen(data);
    var cooking = kitchen.currentCooking;
    var companion = KA.companions.getCompanion(data, speciesId);
    var recipe = cooking && getRecipe(cooking.recipeId);
    if (!recipe || !isCookingComplete(cooking)) return { ok: false, message: "まだ できあがっていません" };
    if (!companion || Number(companion.hatchCount || 0) <= 0) return { ok: false, message: "なかまを えらんでね" };
    var now = KA.date.localIsoString();
    var today = KA.date.localDateKey();
    var levelUp = false;
    companion.mealCount = Math.max(0, Number(companion.mealCount || 0)) + 1;
    companion.lastFedAt = now;
    companion.bondMealProgress = Math.max(0, Number(companion.bondMealProgress || 0));
    if (companion.lastBondMealDate !== today) {
      companion.bondMealProgress += 1;
      companion.lastBondMealDate = today;
      if (companion.bondMealProgress >= 3) {
        companion.bondLevel = Math.max(0, Number(companion.bondLevel || 0)) + 1;
        companion.bondMealProgress = 0;
        levelUp = true;
      }
    }
    var stats = kitchen.recipeStats[recipe.id] || {
      firstCookedAt: cooking.completedAt || now,
      lastCookedAt: cooking.completedAt || now,
      cookCount: 0,
      fedCount: 0
    };
    stats.firstCookedAt = stats.firstCookedAt || cooking.completedAt || now;
    stats.lastCookedAt = stats.lastCookedAt || cooking.completedAt || now;
    stats.cookCount = Math.max(1, Number(stats.cookCount || 0));
    stats.fedCount = Math.max(0, Number(stats.fedCount || 0)) + 1;
    kitchen.recipeStats[recipe.id] = stats;
    kitchen.cookingHistory.push({
      id: createMealId(recipe.id, companion.speciesId),
      recipeId: recipe.id,
      ingredientIds: cooking.selectedIngredientIds.slice(),
      completedAt: cooking.completedAt || now,
      fedCompanionId: companion.speciesId,
      fedAt: now
    });
    kitchen.cookingHistory = kitchen.cookingHistory.slice(-HISTORY_LIMIT);
    kitchen.currentCooking = null;
    data.updatedAt = now;
    KA.state.saveAppData();
    return { ok: true, recipe: recipe, companion: companion, levelUp: levelUp };
  }

  function svgWrap(className, body, viewBox) {
    return '<svg class="' + className + '" viewBox="' + (viewBox || "0 0 100 100") + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function renderIngredient(ingredientId) {
    var ingredient = getIngredient(ingredientId) || INGREDIENTS[0];
    var a = ingredient.colors[0];
    var b = ingredient.colors[1];
    var body = {
      ingredient_apple: '<path d="M50 27 C67 17 83 31 78 52 C73 78 52 88 38 74 C20 55 30 31 47 35 C47 31 48 29 50 27 Z" fill="' + a + '"/><path d="M52 27 C55 18 63 13 72 15 C66 24 59 28 52 27 Z" fill="#22C55E"/><path d="M49 30 C46 22 47 17 52 12" fill="none" stroke="#92400E" stroke-width="5" stroke-linecap="round"/><path d="M45 39 C35 48 35 62 45 70" fill="none" stroke="' + b + '" stroke-width="5" stroke-linecap="round"/>',
      ingredient_strawberry: '<path d="M50 26 C70 31 79 45 71 66 C64 83 39 84 29 66 C18 46 29 30 50 26 Z" fill="' + a + '"/><path d="M34 28 L42 19 L50 28 L59 19 L67 30 C56 34 45 34 34 28 Z" fill="#22C55E"/><g fill="' + b + '"><circle cx="42" cy="44" r="3"/><circle cx="57" cy="47" r="3"/><circle cx="49" cy="60" r="3"/></g>',
      ingredient_banana: '<path d="M22 58 C46 74 73 64 84 35 C81 68 54 88 24 69 Z" fill="' + a + '"/><path d="M23 58 C50 66 70 53 84 35" fill="none" stroke="' + b + '" stroke-width="5" stroke-linecap="round"/>',
      ingredient_grape: '<g fill="' + a + '"><circle cx="44" cy="35" r="12"/><circle cx="59" cy="38" r="12"/><circle cx="36" cy="51" r="12"/><circle cx="52" cy="55" r="12"/><circle cx="67" cy="57" r="12"/><circle cx="45" cy="72" r="12"/></g><path d="M53 25 C58 17 66 14 75 17" fill="none" stroke="#22C55E" stroke-width="5" stroke-linecap="round"/>',
      ingredient_bread: '<path d="M24 44 C24 25 38 17 50 28 C62 17 77 25 77 44 L77 74 L24 74 Z" fill="' + a + '"/><path d="M31 47 L70 47 L70 68 L31 68 Z" fill="' + b + '"/>',
      ingredient_noodles: '<path d="M22 70 C35 82 70 82 82 70 L75 86 L29 86 Z" fill="#93C5FD"/><path d="M27 55 C39 65 50 45 63 55 C70 60 75 60 82 55" fill="none" stroke="' + a + '" stroke-width="6" stroke-linecap="round"/><path d="M27 66 C41 74 55 56 75 66" fill="none" stroke="' + b + '" stroke-width="5" stroke-linecap="round"/>',
      ingredient_flour: '<path d="M28 28 L72 28 L80 80 L20 80 Z" fill="' + a + '"/><path d="M33 43 C45 37 58 37 70 43 L69 72 L31 72 Z" fill="' + b + '"/>',
      ingredient_meat: '<path d="M26 56 C27 33 53 24 72 37 C91 50 76 78 51 78 C35 78 25 68 26 56 Z" fill="' + a + '"/><path d="M43 42 C54 48 62 52 73 52" fill="none" stroke="' + b + '" stroke-width="6" stroke-linecap="round"/>',
      ingredient_ham: '<path d="M24 58 C24 37 46 25 68 34 C86 41 83 70 61 78 C40 86 24 75 24 58 Z" fill="' + a + '"/><path d="M35 49 C48 43 65 47 73 58" fill="none" stroke="' + b + '" stroke-width="5" stroke-linecap="round"/>',
      ingredient_egg: '<path d="M51 19 C72 36 78 62 66 78 C55 92 32 87 25 70 C17 50 31 28 51 19 Z" fill="' + a + '"/><circle cx="50" cy="62" r="13" fill="' + b + '"/>',
      ingredient_lettuce: '<path d="M20 62 C28 34 48 46 50 25 C59 47 82 34 80 62 C68 57 60 76 50 61 C40 77 31 56 20 62 Z" fill="' + a + '"/><path d="M50 30 C48 44 49 58 50 74" fill="none" stroke="' + b + '" stroke-width="4" stroke-linecap="round"/>',
      ingredient_tomato: '<circle cx="50" cy="56" r="29" fill="' + a + '"/><path d="M38 31 L49 20 L60 31 L72 29 L62 42 L38 42 L28 29 Z" fill="#22C55E"/><path d="M39 49 C47 43 60 43 67 51" fill="none" stroke="' + b + '" stroke-width="5" stroke-linecap="round"/>',
      ingredient_onion: '<path d="M50 21 C68 35 78 50 72 68 C65 88 35 89 27 69 C20 50 34 35 50 21 Z" fill="' + a + '"/><path d="M48 25 C39 42 38 62 48 80 M55 28 C63 45 63 63 54 80" fill="none" stroke="' + b + '" stroke-width="4" stroke-linecap="round"/>',
      ingredient_cheese: '<path d="M22 37 L77 25 L77 75 L22 75 Z" fill="' + a + '"/><g fill="' + b + '"><circle cx="43" cy="52" r="5"/><circle cx="64" cy="43" r="4"/><circle cx="61" cy="66" r="5"/></g>',
      ingredient_milk: '<path d="M35 20 L65 20 L72 82 L28 82 Z" fill="' + a + '"/><path d="M35 20 L42 10 L64 10 L65 20 Z" fill="' + b + '"/><path d="M34 48 L70 48 L68 76 L31 76 Z" fill="#DBEAFE"/>',
      ingredient_ice_cream: '<path d="M33 46 C29 28 47 18 60 29 C76 31 78 55 62 61 C51 67 37 60 33 46 Z" fill="' + a + '"/><path d="M39 60 L67 60 L53 91 Z" fill="#D97706"/>',
      ingredient_cornflakes: '<path d="M23 69 C34 83 69 84 80 69 L73 88 L30 88 Z" fill="#FDE68A"/><g fill="' + a + '"><path d="M31 45 L44 39 L48 52 L36 57 Z"/><path d="M50 38 L65 42 L60 57 L47 52 Z"/><path d="M64 56 L78 61 L68 73 L57 66 Z"/></g>'
    }[ingredient.id] || '<circle cx="50" cy="50" r="30" fill="' + a + '"/>';
    return svgWrap("kitchen-svg ingredient-svg", body);
  }

  function renderRecipeDish(recipeId, options) {
    var opts = options || {};
    var recipe = getRecipe(recipeId) || RECIPES[0];
    var pale = opts.silhouette ? "#1f2937" : null;
    var bodyMap = {
      recipe_fruit_salad: '<ellipse cx="50" cy="70" rx="35" ry="16" fill="' + (pale || "#BFDBFE") + '"/><circle cx="34" cy="56" r="10" fill="' + (pale || "#EF4444") + '"/><circle cx="50" cy="51" r="10" fill="' + (pale || "#FACC15") + '"/><circle cx="65" cy="57" r="10" fill="' + (pale || "#8B5CF6") + '"/><circle cx="48" cy="65" r="9" fill="' + (pale || "#F43F5E") + '"/>',
      recipe_sandwich: '<path d="M22 63 L78 44 L84 62 L28 82 Z" fill="' + (pale || "#FDE68A") + '"/><path d="M25 54 L75 36 L81 50 L30 69 Z" fill="' + (pale || "#D97706") + '"/><path d="M29 58 C45 48 63 48 78 57" fill="' + (pale || "#22C55E") + '"/><path d="M32 62 L76 48" stroke="' + (pale || "#FB7185") + '" stroke-width="7" stroke-linecap="round"/>',
      recipe_hamburg_steak: '<ellipse cx="50" cy="73" rx="36" ry="13" fill="' + (pale || "#E0F2FE") + '"/><path d="M26 55 C30 36 70 34 77 55 C84 75 25 78 26 55 Z" fill="' + (pale || "#92400E") + '"/><path d="M36 50 C47 44 61 44 70 51" fill="none" stroke="' + (pale || "#FDE68A") + '" stroke-width="5" stroke-linecap="round"/>',
      recipe_spaghetti: '<ellipse cx="50" cy="72" rx="36" ry="14" fill="' + (pale || "#E0F2FE") + '"/><path d="M25 58 C38 70 50 43 66 58 C76 66 82 58 86 54" fill="none" stroke="' + (pale || "#FDE68A") + '" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="57" r="14" fill="' + (pale || "#EF4444") + '"/>',
      recipe_ramen: '<path d="M20 56 C27 82 73 82 80 56 Z" fill="' + (pale || "#93C5FD") + '"/><path d="M29 53 C42 61 58 45 72 54" fill="none" stroke="' + (pale || "#FDE68A") + '" stroke-width="7" stroke-linecap="round"/><path d="M38 42 C50 34 64 37 69 48" fill="' + (pale || "#FACC15") + '"/>',
      recipe_yakiniku: '<ellipse cx="50" cy="72" rx="38" ry="14" fill="' + (pale || "#BBF7D0") + '"/><path d="M27 50 C38 37 58 38 68 50 C58 65 38 65 27 50 Z" fill="' + (pale || "#B45309") + '"/><path d="M55 55 C64 45 76 48 82 59 C73 69 62 67 55 55 Z" fill="' + (pale || "#EF4444") + '"/>',
      recipe_shumai: '<ellipse cx="50" cy="75" rx="34" ry="12" fill="' + (pale || "#E0F2FE") + '"/><g fill="' + (pale || "#FDE68A") + '"><path d="M28 58 C29 42 45 39 50 52 C48 70 31 73 28 58 Z"/><path d="M47 54 C49 38 67 39 72 53 C69 71 51 72 47 54 Z"/></g><circle cx="50" cy="52" r="5" fill="' + (pale || "#F59E0B") + '"/>',
      recipe_hamburger: '<path d="M24 49 C29 27 72 27 78 49 Z" fill="' + (pale || "#D97706") + '"/><path d="M23 58 L78 58 L78 70 L23 70 Z" fill="' + (pale || "#92400E") + '"/><path d="M25 52 C43 44 61 44 77 52" fill="' + (pale || "#22C55E") + '"/><path d="M27 72 L76 72 L72 84 L31 84 Z" fill="' + (pale || "#FDE68A") + '"/>',
      recipe_cake: '<path d="M25 44 L75 44 L75 80 L25 80 Z" fill="' + (pale || "#FDE68A") + '"/><path d="M25 44 C38 32 62 32 75 44 Z" fill="' + (pale || "#FBCFE8") + '"/><circle cx="50" cy="37" r="8" fill="' + (pale || "#F43F5E") + '"/>',
      recipe_parfait: '<path d="M33 25 L67 25 L60 87 L40 87 Z" fill="' + (pale || "#BFDBFE") + '"/><path d="M37 66 L63 66 L60 82 L40 82 Z" fill="' + (pale || "#F59E0B") + '"/><circle cx="50" cy="43" r="14" fill="' + (pale || "#FBCFE8") + '"/><circle cx="39" cy="34" r="7" fill="' + (pale || "#F43F5E") + '"/><path d="M55 30 C65 36 67 47 60 56" fill="none" stroke="' + (pale || "#FACC15") + '" stroke-width="6" stroke-linecap="round"/>'
    };
    return svgWrap("kitchen-svg recipe-svg" + (opts.silhouette ? " kitchen-silhouette" : ""), bodyMap[recipe.id] || bodyMap.recipe_fruit_salad);
  }

  KA.kitchen = {
    allIngredients: allIngredients,
    getIngredient: getIngredient,
    allRecipes: allRecipes,
    getRecipe: getRecipe,
    defaultKitchen: defaultKitchen,
    ensureKitchen: ensureKitchen,
    startCooking: startCooking,
    quitCooking: quitCooking,
    completeCurrentStep: completeCurrentStep,
    isCookingComplete: isCookingComplete,
    feedCompletedCooking: feedCompletedCooking,
    renderIngredient: renderIngredient,
    renderRecipeDish: renderRecipeDish,
    stepTypes: ["cut", "mix", "knead", "shape", "grill", "boil", "steam", "bake", "fry", "wrap", "layer", "decorate", "plate"],
    deprecatedIngredientNames: ["しょくパン", "バンズ", "スパゲティのめん", "ラーメンのめん", "ひきにく", "やきにくのおにく", "ねぎ", "クリーム", "さとう", "のり", "しゅうまいのかわ"]
  };
})(window);
