(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var now = function () {
    return new Date().toISOString();
  };

  KA.constants = {
    APP_DISPLAY_NAME: "結羽ちゃんの冒険",
    PROJECT_NAME: "こどもの冒険",
    APP_VERSION: "1.0.0-prototype.7",
    VERSION_LABEL: "Ver.1.0 試作7",
    SCHEMA_VERSION: 1,
    PROFILE_ID: "profile_yuwa",
    WORLD_ID: "world_forest",
    STORAGE_KEYS: {
      appData: "kodomoAdventure.appData.v1",
      uiState: "kodomoAdventure.uiState.v1",
      backup: "kodomoAdventure.backup.v1"
    },
    DEFAULT_TASKS: [
      {
        taskId: "task_brush_teeth",
        title: "はみがき",
        icon: "🪥",
        category: "morning",
        rewardStars: 1,
        active: true,
        sortOrder: 10,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "morning"
      },
      {
        taskId: "task_get_dressed",
        title: "おきがえ",
        icon: "👕",
        category: "morning",
        rewardStars: 1,
        active: true,
        sortOrder: 20,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "morning"
      },
      {
        taskId: "task_picture_book",
        title: "えほん",
        icon: "📖",
        category: "learning",
        rewardStars: 1,
        active: true,
        sortOrder: 30,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "any"
      },
      {
        taskId: "task_piano",
        title: "ピアノ",
        icon: "🎹",
        category: "learning",
        rewardStars: 1,
        active: true,
        sortOrder: 40,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "any"
      },
      {
        taskId: "task_drill",
        title: "ドリル",
        icon: "✏️",
        category: "learning",
        rewardStars: 1,
        active: true,
        sortOrder: 50,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "any"
      },
      {
        taskId: "task_soroban",
        title: "そろばん",
        icon: "🧮",
        category: "learning",
        rewardStars: 1,
        active: true,
        sortOrder: 60,
        availableDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        timeOfDay: "any"
      }
    ],
    COLOR_PALETTE: [
      { id: "red", name: "あか", value: "#EF4444", family: "red" },
      { id: "pink", name: "ぴんく", value: "#F472B6", family: "pink" },
      { id: "orange", name: "おれんじ", value: "#FB923C", family: "orange" },
      { id: "yellow", name: "きいろ", value: "#FACC15", family: "yellow" },
      { id: "lime", name: "きみどり", value: "#A3E635", family: "green" },
      { id: "green", name: "みどり", value: "#22C55E", family: "green" },
      { id: "cyan", name: "みずいろ", value: "#38BDF8", family: "cyan" },
      { id: "blue", name: "あお", value: "#3B82F6", family: "blue" },
      { id: "purple", name: "むらさき", value: "#8B5CF6", family: "purple" },
      { id: "brown", name: "ちゃいろ", value: "#92400E", family: "brown" },
      { id: "black", name: "くろ", value: "#111827", family: "black" },
      { id: "white", name: "しろ", value: "#FFFFFF", family: "white" }
    ],
    COLORING_TEMPLATES: [
      {
        templateId: "coloring_butterfly_001",
        title: "ちょうちょ",
        kind: "creature",
        icon: "🦋",
        requiredStars: 4,
        sortOrder: 10,
        active: true,
        worldObjectType: "butterfly",
        designVersion: 5,
        svgKey: "butterfly_v5",
        viewBox: "0 0 200 160",
        regionAliases: {},
        regionIds: ["left_wing", "right_wing", "spots", "body", "antennae"],
        regions: [
          { id: "left_wing", label: "ひだりのはね" },
          { id: "right_wing", label: "みぎのはね" },
          { id: "spots", label: "もよう" },
          { id: "body", label: "からだ" },
          { id: "antennae", label: "しょっかく" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_flower_001",
        title: "おはな",
        kind: "plant",
        icon: "🌼",
        requiredStars: 8,
        sortOrder: 20,
        active: true,
        worldObjectType: "flower",
        designVersion: 6,
        svgKey: "flower_petals_v6",
        viewBox: "0 0 240 180",
        regionAliases: {
          petal_top: ["petals"],
          petal_upper_left: ["petals"],
          petal_upper_right: ["petals"],
          petal_left: ["petals"],
          petal_right: ["petals"],
          petal_bottom: ["petals"]
        },
        regionIds: ["petal_top", "petal_upper_left", "petal_upper_right", "petal_left", "petal_right", "petal_bottom", "center", "stem", "leaf_left", "leaf_right"],
        regions: [
          { id: "petal_top", label: "うえのはなびら" },
          { id: "petal_upper_left", label: "ひだりうえのはなびら" },
          { id: "petal_upper_right", label: "みぎうえのはなびら" },
          { id: "petal_left", label: "ひだりのはなびら" },
          { id: "petal_right", label: "みぎのはなびら" },
          { id: "petal_bottom", label: "したのはなびら" },
          { id: "center", label: "まんなか" },
          { id: "stem", label: "くき" },
          { id: "leaf_left", label: "ひだりのは" },
          { id: "leaf_right", label: "みぎのは" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_rabbit_001",
        title: "うさぎ",
        kind: "creature",
        icon: "🐰",
        requiredStars: 12,
        sortOrder: 30,
        active: true,
        worldObjectType: "rabbit",
        designVersion: 6,
        svgKey: "rabbit_side_v6",
        viewBox: "0 0 240 180",
        regionAliases: {
          ear_left_outer: ["ear_left"],
          ear_left_inner: ["ear_left"],
          ear_right_outer: ["ear_right"],
          ear_right_inner: ["ear_right"],
          cheek: ["cheeks", "cheek_left", "cheek_right"],
          front_leg: ["body"],
          back_leg: ["body"],
          nose: ["head", "cheeks"]
        },
        regionIds: ["head", "nose", "body", "belly", "tail", "ear_left_outer", "ear_left_inner", "ear_right_outer", "ear_right_inner", "front_leg", "back_leg", "cheek"],
        regions: [
          { id: "head", label: "かお" },
          { id: "nose", label: "はなさき" },
          { id: "body", label: "からだ" },
          { id: "belly", label: "おなか" },
          { id: "tail", label: "しっぽ" },
          { id: "ear_left_outer", label: "ひだりのみみ" },
          { id: "ear_left_inner", label: "ひだりのみみのなか" },
          { id: "ear_right_outer", label: "みぎのみみ" },
          { id: "ear_right_inner", label: "みぎのみみのなか" },
          { id: "front_leg", label: "まえあし" },
          { id: "back_leg", label: "うしろあし" },
          { id: "cheek", label: "ほっぺ" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_cat_001",
        title: "ねこ",
        kind: "creature",
        icon: "🐱",
        requiredStars: 16,
        sortOrder: 40,
        active: true,
        worldObjectType: "cat",
        designVersion: 5,
        svgKey: "cat_sitting_v5",
        viewBox: "0 0 240 180",
        regionAliases: {
          chest: ["belly"],
          ear_left_outer: ["ear_left", "ears"],
          ear_left_inner: ["ear_left", "ears"],
          ear_right_outer: ["ear_right", "ears"],
          ear_right_inner: ["ear_right", "ears"],
          front_legs: ["paws"],
          back_legs: ["paws"],
          tail: ["tail"],
          markings: ["stripes"]
        },
        regionIds: ["body", "chest", "tail", "ear_left_outer", "ear_left_inner", "ear_right_outer", "ear_right_inner", "face", "muzzle", "front_legs", "back_legs", "collar"],
        regions: [
          { id: "body", label: "からだ" },
          { id: "chest", label: "むね" },
          { id: "tail", label: "しっぽ" },
          { id: "ear_left_outer", label: "ひだりのみみ" },
          { id: "ear_left_inner", label: "ひだりのみみのなか" },
          { id: "ear_right_outer", label: "みぎのみみ" },
          { id: "ear_right_inner", label: "みぎのみみのなか" },
          { id: "face", label: "かお" },
          { id: "muzzle", label: "くちまわり" },
          { id: "front_legs", label: "まえあし" },
          { id: "back_legs", label: "うしろあし" },
          { id: "collar", label: "くびわ" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_dolphin_001",
        title: "イルカ",
        kind: "creature",
        icon: "🐬",
        requiredStars: 20,
        sortOrder: 50,
        active: true,
        worldObjectType: "dolphin",
        designVersion: 6,
        svgKey: "dolphin_streamline_v6",
        viewBox: "0 0 240 180",
        regionAliases: {
          body_top: ["body"],
          snout: ["nose", "body"],
          dorsal_fin: ["fin_top"],
          pectoral_fin: ["fin_side"],
          tail_stem: ["tail"],
          tail_fluke_top: ["tail"],
          tail_fluke_bottom: ["tail"]
        },
        regionIds: ["body_top", "belly", "snout", "dorsal_fin", "pectoral_fin", "tail_stem", "tail_fluke_top", "tail_fluke_bottom", "cheek"],
        regions: [
          { id: "body_top", label: "せなか" },
          { id: "belly", label: "おなか" },
          { id: "snout", label: "くちさき" },
          { id: "dorsal_fin", label: "せびれ" },
          { id: "pectoral_fin", label: "むなびれ" },
          { id: "tail_stem", label: "しっぽのつけね" },
          { id: "tail_fluke_top", label: "うえのおびれ" },
          { id: "tail_fluke_bottom", label: "したのおびれ" },
          { id: "cheek", label: "ほっぺ" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_dinosaur_001",
        title: "きょうりゅう",
        kind: "creature",
        icon: "🦖",
        requiredStars: 24,
        sortOrder: 60,
        active: true,
        worldObjectType: "dinosaur",
        designVersion: 6,
        svgKey: "trex_v6",
        viewBox: "0 0 240 180",
        regionAliases: {
          neck: ["body"],
          arm: ["legs"],
          back_leg: ["legs"],
          foot: ["claws", "legs"],
          back_spines: ["spikes"],
          body_mark: ["spots"]
        },
        regionIds: ["head", "jaw", "neck", "body", "belly", "arm", "back_leg", "foot", "tail", "back_spines", "cheek", "body_mark"],
        regions: [
          { id: "head", label: "かお" },
          { id: "jaw", label: "くちもと" },
          { id: "neck", label: "くび" },
          { id: "body", label: "からだ" },
          { id: "belly", label: "おなか" },
          { id: "arm", label: "まえあし" },
          { id: "back_leg", label: "うしろあし" },
          { id: "foot", label: "あしさき" },
          { id: "tail", label: "しっぽ" },
          { id: "back_spines", label: "せなかのとげ" },
          { id: "cheek", label: "ほっぺ" },
          { id: "body_mark", label: "もよう" }
        ],
        defaultUnlocked: false
      },
      {
        templateId: "coloring_horse_001",
        title: "うま",
        kind: "creature",
        icon: "🐴",
        requiredStars: 28,
        sortOrder: 70,
        active: true,
        worldObjectType: "horse",
        designVersion: 6,
        svgKey: "horse_standing_v6",
        viewBox: "0 0 240 180",
        regionAliases: {
          ears: ["head"],
          front_leg_near: ["legs"],
          front_leg_far: ["legs"],
          back_leg_near: ["legs"],
          back_leg_far: ["legs"],
          hooves: ["hooves", "legs"],
          muzzle: ["muzzle", "head"]
        },
        regionIds: ["head", "ears", "neck", "mane", "body", "tail", "front_leg_near", "front_leg_far", "back_leg_near", "back_leg_far", "hooves", "muzzle"],
        regions: [
          { id: "head", label: "かお" },
          { id: "ears", label: "みみ" },
          { id: "neck", label: "くび" },
          { id: "mane", label: "たてがみ" },
          { id: "body", label: "からだ" },
          { id: "tail", label: "しっぽ" },
          { id: "front_leg_near", label: "まえあし1" },
          { id: "front_leg_far", label: "まえあし2" },
          { id: "back_leg_near", label: "うしろあし1" },
          { id: "back_leg_far", label: "うしろあし2" },
          { id: "hooves", label: "ひづめ" },
          { id: "muzzle", label: "くちもと" }
        ],
        defaultUnlocked: false
      }
    ],
    WORLD_DEFINITIONS: [
      {
        id: "world_forest",
        worldId: "world_forest",
        name: "もり",
        title: "思い出の森",
        icon: "🌳",
        description: "木と草と池がある、いつもの思い出の森だよ。",
        theme: "forest",
        unlocked: true,
        unlockedAt: null,
        designVersion: 1,
        displayOrder: 1,
        unlockCondition: null
      },
      {
        id: "world_sea",
        worldId: "world_sea",
        name: "うみ",
        title: "きらきらの海",
        icon: "🌊",
        description: "あかるい海の中で、泡とサンゴがゆらゆらするよ。",
        theme: "sea",
        unlocked: true,
        unlockedAt: null,
        designVersion: 1,
        displayOrder: 2,
        unlockCondition: null
      },
      {
        id: "world_island",
        worldId: "world_island",
        name: "しま",
        title: "ぼうけんの島",
        icon: "🏝️",
        description: "砂浜と草地と小道がある、あかるい冒険の島だよ。",
        theme: "island",
        unlocked: true,
        unlockedAt: null,
        designVersion: 1,
        displayOrder: 3,
        unlockCondition: null
      },
      {
        id: "world_castle",
        worldId: "world_castle",
        name: "しろ",
        title: "にこにこ城",
        icon: "🏰",
        description: "旗がゆれる、こわくないお城の中庭だよ。",
        theme: "castle",
        unlocked: true,
        unlockedAt: null,
        designVersion: 1,
        displayOrder: 4,
        unlockCondition: null
      },
      {
        id: "world_sky_island",
        worldId: "world_sky_island",
        name: "そらじま",
        title: "ふわふわ空島",
        icon: "☁️",
        description: "雲の上に浮かぶ島と虹がある世界だよ。",
        theme: "sky_island",
        unlocked: true,
        unlockedAt: null,
        designVersion: 1,
        displayOrder: 5,
        unlockCondition: null
      }
    ],
    DEFAULT_WORLD: {
      worldId: "world_forest",
      id: "world_forest",
      name: "もり",
      title: "思い出の森",
      icon: "🌳",
      description: "木と草と池がある、いつもの思い出の森だよ。",
      unlocked: true,
      unlockedAt: null,
      designVersion: 1,
      displayOrder: 1,
      unlockCondition: null,
      active: true,
      level: 1,
      stats: {
        totalArtworks: 0,
        totalCompletedDays: 0,
        totalLifetimeStarsAtLastUpdate: 0
      },
      placements: []
    },
    createTimestamp: now
  };
})(window);
