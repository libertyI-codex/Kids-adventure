(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var now = function () {
    return new Date().toISOString();
  };

  KA.constants = {
    APP_DISPLAY_NAME: "結羽ちゃんの冒険",
    PROJECT_NAME: "こどもの冒険",
    APP_VERSION: "1.0.0-prototype.3",
    VERSION_LABEL: "Ver.1.0 試作3",
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
      { id: "green", name: "みどり", value: "#22C55E", family: "green" },
      { id: "cyan", name: "みずいろ", value: "#38BDF8", family: "blue" },
      { id: "blue", name: "あお", value: "#3B82F6", family: "blue" },
      { id: "purple", name: "むらさき", value: "#8B5CF6", family: "purple" },
      { id: "brown", name: "ちゃいろ", value: "#92400E", family: "brown" },
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
        regionIds: ["petals", "center", "stem", "leaf_left", "leaf_right"],
        regions: [
          { id: "petals", label: "はなびら" },
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
        regionIds: ["body", "ear_left", "ear_right", "cheeks", "belly"],
        regions: [
          { id: "body", label: "からだ" },
          { id: "ear_left", label: "ひだりのみみ" },
          { id: "ear_right", label: "みぎのみみ" },
          { id: "cheeks", label: "ほっぺ" },
          { id: "belly", label: "おなか" }
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
        regionIds: ["body", "tail", "ears", "face", "collar"],
        regions: [
          { id: "body", label: "からだ" },
          { id: "tail", label: "しっぽ" },
          { id: "ears", label: "みみ" },
          { id: "face", label: "かお" },
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
        regionIds: ["body", "belly", "fin_top", "fin_side", "tail", "wave"],
        regions: [
          { id: "body", label: "からだ" },
          { id: "belly", label: "おなか" },
          { id: "fin_top", label: "せびれ" },
          { id: "fin_side", label: "よこのひれ" },
          { id: "tail", label: "しっぽ" },
          { id: "wave", label: "なみ" }
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
        regionIds: ["body", "belly", "spikes", "tail", "legs", "spots"],
        regions: [
          { id: "body", label: "からだ" },
          { id: "belly", label: "おなか" },
          { id: "spikes", label: "せなか" },
          { id: "tail", label: "しっぽ" },
          { id: "legs", label: "あし" },
          { id: "spots", label: "もよう" }
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
        regionIds: ["mane", "body", "tail", "legs", "neck", "eye"],
        regions: [
          { id: "mane", label: "たてがみ" },
          { id: "body", label: "からだ" },
          { id: "tail", label: "しっぽ" },
          { id: "legs", label: "あし" },
          { id: "neck", label: "くび" },
          { id: "eye", label: "め" }
        ],
        defaultUnlocked: false
      }
    ],
    DEFAULT_WORLD: {
      worldId: "world_forest",
      title: "思い出の森",
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
