(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var SPECIES = [
    {
      id: "companion_chick",
      name: "ひよこ",
      displayOrder: 1,
      designVersion: 1,
      preferredWorldIds: ["world_secret_base", "world_forest", "world_island"],
      defaultColors: { body: "#FACC15", wing: "#FDE68A", beak: "#FB923C", leg: "#F59E0B" },
      viewBox: "0 0 160 140",
      outer: [
        "M78 22 C103 22 124 42 126 70 C128 101 105 122 77 122 C49 122 29 101 31 72 C33 45 53 24 78 22 Z"
      ],
      regions: [
        { id: "body", d: "M55 49 C72 34 103 42 112 68 C122 99 99 119 74 117 C45 114 34 88 44 64 C47 58 50 53 55 49 Z", fill: "#FACC15" },
        { id: "head", d: "M61 23 C80 14 101 25 105 46 C109 66 94 80 75 78 C56 76 46 60 51 43 C53 34 56 28 61 23 Z", fill: "#FDE68A" },
        { id: "wing", d: "M82 72 C100 70 110 81 108 97 C94 98 83 89 82 72 Z", fill: "#FBBF24" },
        { id: "beak", d: "M103 48 L124 55 L103 62 Z", fill: "#FB923C" },
        { id: "legs", d: "M64 117 L61 132 M88 117 L91 132", fill: "none" }
      ],
      inner: [
        "M82 72 C97 76 103 84 106 94",
        "M67 24 C63 17 66 12 73 9 M77 22 C79 15 85 12 91 15"
      ],
      face: '<circle cx="84" cy="45" r="4" fill="#1f2937"/><path d="M101 51 C96 55 91 55 87 52" fill="none" stroke="#8a5b20" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_duck",
      name: "あひる",
      displayOrder: 2,
      designVersion: 1,
      preferredWorldIds: ["world_sea", "world_island", "world_secret_base"],
      defaultColors: { body: "#FFF7D6", wing: "#FDE68A", beak: "#F97316", leg: "#FB923C" },
      viewBox: "0 0 180 140",
      outer: [
        "M62 45 C78 21 113 23 123 50 C145 50 166 62 168 84 C171 112 136 125 94 122 C52 119 25 101 31 78 C35 61 47 51 62 45 Z"
      ],
      regions: [
        { id: "body", d: "M48 62 C72 47 126 47 150 67 C170 84 158 112 119 118 C73 125 36 108 34 85 C33 75 38 68 48 62 Z", fill: "#FFF7D6" },
        { id: "head", d: "M66 28 C82 15 109 22 116 43 C123 65 105 78 84 74 C65 71 56 56 60 42 C61 36 63 31 66 28 Z", fill: "#FDE68A" },
        { id: "wing", d: "M91 75 C112 68 133 78 139 96 C121 106 98 99 91 75 Z", fill: "#FACC15" },
        { id: "beak", d: "M113 45 C128 39 145 42 151 50 C143 59 126 61 113 55 Z", fill: "#F97316" },
        { id: "feet", d: "M81 120 C75 126 66 128 59 124 M117 120 C126 126 136 127 143 123", fill: "none" }
      ],
      inner: [
        "M91 75 C108 82 121 88 135 96",
        "M53 93 C71 104 112 108 142 96"
      ],
      face: '<circle cx="93" cy="43" r="4" fill="#1f2937"/><path d="M117 51 C126 53 137 53 147 50" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_parrot",
      name: "オウム",
      displayOrder: 3,
      designVersion: 1,
      preferredWorldIds: ["world_island", "world_sky_island", "world_secret_base"],
      defaultColors: { head: "#EF4444", body: "#22C55E", wing: "#3B82F6", tail: "#FACC15", beak: "#FDE68A" },
      viewBox: "0 0 170 150",
      outer: [
        "M67 25 C89 15 112 28 118 50 C123 70 112 91 94 99 C85 112 77 130 62 141 C57 122 57 107 63 96 C45 87 38 66 45 48 C49 37 56 29 67 25 Z",
        "M93 94 C116 105 132 123 143 142 C119 140 99 128 82 107 Z"
      ],
      regions: [
        { id: "head", d: "M67 25 C88 15 110 28 115 48 C119 64 105 77 89 75 C70 73 58 61 60 45 C61 36 63 30 67 25 Z", fill: "#EF4444" },
        { id: "body", d: "M62 66 C83 60 106 74 108 96 C110 120 91 133 70 124 C51 115 46 89 57 72 C59 69 60 67 62 66 Z", fill: "#22C55E" },
        { id: "wing", d: "M78 77 C101 79 116 95 115 116 C94 116 79 101 78 77 Z", fill: "#3B82F6" },
        { id: "tail", d: "M77 117 C80 131 76 143 65 149 C61 136 62 125 68 116 Z M92 111 C112 119 131 132 145 148 C121 147 102 136 86 120 Z", fill: "#FACC15" },
        { id: "beak", d: "M112 47 C128 48 135 58 129 70 C121 65 116 59 112 47 Z", fill: "#FDE68A" },
        { id: "feet", d: "M63 126 C60 134 55 138 49 140 M74 128 C77 136 83 139 88 141", fill: "none" }
      ],
      inner: [
        "M78 77 C91 88 101 100 112 114",
        "M69 38 C74 30 86 29 94 36",
        "M61 123 C72 130 83 128 92 116"
      ],
      face: '<circle cx="91" cy="45" r="4" fill="#1f2937"/><path d="M114 58 C120 58 124 61 126 66" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_peacock",
      name: "くじゃく",
      displayOrder: 4,
      designVersion: 1,
      preferredWorldIds: ["world_castle", "world_sky_island", "world_island"],
      defaultColors: { body: "#2563EB", neck: "#38BDF8", tail: "#22C55E", eye: "#FACC15" },
      viewBox: "0 0 210 170",
      outer: [
        "M31 98 C35 47 77 16 105 39 C132 15 176 48 179 99 C154 78 128 80 111 102 C94 80 59 80 31 98 Z",
        "M96 47 C110 38 126 48 128 64 C130 82 119 96 105 96 C90 96 80 83 83 67 C84 58 88 51 96 47 Z"
      ],
      regions: [
        { id: "tail", d: "M31 98 C35 47 77 16 105 39 C132 15 176 48 179 99 C154 78 128 80 111 102 C94 80 59 80 31 98 Z", fill: "#22C55E" },
        { id: "body", d: "M86 76 C100 62 124 68 132 88 C143 114 122 135 101 131 C78 127 68 102 78 85 C80 81 83 78 86 76 Z", fill: "#2563EB" },
        { id: "neck", d: "M96 47 C108 40 122 49 123 64 C124 80 113 92 101 91 C88 90 83 77 87 64 C89 56 92 51 96 47 Z", fill: "#38BDF8" },
        { id: "crest", d: "M99 45 C94 34 96 28 103 22 M108 45 C111 34 116 29 123 27 M103 45 C103 33 108 27 112 21", fill: "none" },
        { id: "tail_eyes", d: "M62 73 C67 66 78 67 82 75 C78 83 67 84 62 73 Z M104 52 C110 45 121 47 125 55 C120 64 110 63 104 52 Z M147 73 C153 66 163 68 167 76 C162 84 151 84 147 73 Z", fill: "#FACC15" }
      ],
      inner: [
        "M105 39 C101 59 101 79 105 102",
        "M74 38 C88 58 96 78 104 101",
        "M142 39 C128 58 119 78 111 102",
        "M82 88 C95 98 116 100 131 90"
      ],
      face: '<circle cx="111" cy="61" r="3.5" fill="#1f2937"/><path d="M121 68 L134 72 L121 77 Z" fill="#FACC15"/>'
    },
    {
      id: "companion_owl",
      name: "ふくろう",
      displayOrder: 5,
      designVersion: 1,
      preferredWorldIds: ["world_forest", "world_secret_base", "world_castle"],
      defaultColors: { body: "#92400E", face: "#FDE68A", wing: "#A16207", beak: "#F59E0B" },
      viewBox: "0 0 170 150",
      outer: [
        "M52 31 C65 17 88 20 96 35 C107 20 130 21 140 39 C153 62 147 105 124 127 C104 146 69 144 49 125 C25 102 29 56 52 31 Z"
      ],
      regions: [
        { id: "body", d: "M48 49 C62 28 112 29 130 53 C150 80 137 128 94 134 C54 139 31 109 38 78 C40 66 43 56 48 49 Z", fill: "#92400E" },
        { id: "face", d: "M58 47 C70 33 87 39 94 52 C102 38 120 35 131 49 C128 70 112 83 94 79 C77 84 61 72 58 47 Z", fill: "#FDE68A" },
        { id: "wing_left", d: "M47 69 C61 79 67 99 61 119 C45 110 39 88 47 69 Z", fill: "#A16207" },
        { id: "wing_right", d: "M132 69 C119 80 113 101 121 120 C137 111 142 88 132 69 Z", fill: "#A16207" },
        { id: "beak", d: "M91 66 L100 66 L95 77 Z", fill: "#F59E0B" },
        { id: "feet", d: "M75 131 C70 138 64 140 58 139 M111 131 C116 138 123 140 129 139", fill: "none" }
      ],
      inner: [
        "M58 47 C70 59 82 62 94 52 C106 62 119 59 131 49",
        "M70 96 C82 104 105 104 119 96",
        "M47 69 C54 88 57 103 58 116",
        "M132 69 C125 88 122 103 124 117"
      ],
      face: '<circle cx="78" cy="59" r="6" fill="#1f2937"/><circle cx="111" cy="59" r="6" fill="#1f2937"/><circle cx="80" cy="57" r="2" fill="#fff"/><circle cx="113" cy="57" r="2" fill="#fff"/>'
    },
    {
      id: "companion_sparrow",
      name: "すずめ",
      displayOrder: 6,
      designVersion: 1,
      preferredWorldIds: ["world_forest", "world_secret_base", "world_sky_island"],
      defaultColors: { body: "#B45309", belly: "#FDE68A", wing: "#92400E", beak: "#D97706" },
      viewBox: "0 0 170 130",
      outer: [
        "M50 49 C65 23 105 23 122 50 C145 55 153 73 143 92 C130 117 80 119 51 101 C30 88 31 63 50 49 Z"
      ],
      regions: [
        { id: "body", d: "M48 55 C67 36 111 38 129 60 C146 83 124 109 88 109 C51 109 31 82 43 62 C44 59 46 57 48 55 Z", fill: "#B45309" },
        { id: "head", d: "M54 35 C69 21 95 25 105 43 C113 59 101 72 82 70 C62 68 47 55 50 43 C51 40 52 37 54 35 Z", fill: "#A16207" },
        { id: "belly", d: "M71 78 C88 72 112 76 124 91 C111 106 82 108 64 96 C61 88 63 82 71 78 Z", fill: "#FDE68A" },
        { id: "wing", d: "M88 58 C108 59 125 70 129 89 C110 93 93 81 88 58 Z", fill: "#92400E" },
        { id: "tail", d: "M128 67 L158 59 L143 82 Z", fill: "#7C2D12" },
        { id: "beak", d: "M103 48 L122 51 L104 58 Z", fill: "#D97706" },
        { id: "legs", d: "M77 108 L72 122 M101 108 L106 122", fill: "none" }
      ],
      inner: [
        "M88 58 C100 69 111 78 126 88",
        "M61 45 C72 37 88 38 98 47",
        "M72 122 C65 125 60 125 55 122 M106 122 C113 125 119 125 124 122"
      ],
      face: '<circle cx="85" cy="48" r="3.6" fill="#1f2937"/><path d="M65 65 C74 70 86 72 98 69" fill="none" stroke="#7c2d12" stroke-width="2" stroke-linecap="round"/>'
    }
  ];

  function cloneSpeciesData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function allSpecies() {
    return cloneSpeciesData(SPECIES).sort(function (a, b) {
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }

  function getSpecies(speciesId) {
    return allSpecies().filter(function (species) {
      return species.id === speciesId;
    })[0] || null;
  }

  function isValidSpeciesId(speciesId) {
    return Boolean(getSpecies(speciesId));
  }

  function companionHashString(value) {
    var hash = 0;
    var str = String(value || "");
    for (var i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function ensureCompanions(appData) {
    appData.companions = Array.isArray(appData.companions) ? appData.companions : [];
    appData.companions.forEach(function (companion) {
      if (!companion) return;
      companion.id = companion.id || companion.speciesId;
      companion.speciesId = companion.speciesId || companion.id;
      companion.hatchCount = Math.max(0, Number(companion.hatchCount || 0));
      companion.bondLevel = Math.max(0, Number(companion.bondLevel || 0));
      companion.isFavorite = Boolean(companion.isFavorite);
      companion.firstHatchedAt = companion.firstHatchedAt || companion.lastHatchedAt || null;
      companion.lastHatchedAt = companion.lastHatchedAt || companion.firstHatchedAt || null;
    });
    var favoriteSeen = false;
    appData.companions.forEach(function (companion) {
      if (!companion || !isValidSpeciesId(companion.speciesId) || !companion.isFavorite) return;
      if (favoriteSeen) companion.isFavorite = false;
      favoriteSeen = true;
    });
    return appData.companions;
  }

  function getCompanion(appData, speciesId) {
    return ensureCompanions(appData).filter(function (companion) {
      return companion && companion.speciesId === speciesId;
    })[0] || null;
  }

  function ownedSpeciesIds(appData) {
    return ensureCompanions(appData).filter(function (companion) {
      return companion && isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    }).map(function (companion) {
      return companion.speciesId;
    });
  }

  function pickCompanionSpeciesForEgg(egg, appData) {
    if (egg && egg.plannedSpeciesId && isValidSpeciesId(egg.plannedSpeciesId)) return egg.plannedSpeciesId;
    var data = appData || KA.state.getAppData();
    var owned = ownedSpeciesIds(data);
    var pool = allSpecies().filter(function (species) {
      return owned.indexOf(species.id) === -1;
    });
    if (!pool.length) pool = allSpecies();
    var seed = companionHashString((egg && egg.id) || "egg");
    return pool[seed % pool.length].id;
  }

  function recordHatch(appData, speciesId, hatchedAt) {
    if (!isValidSpeciesId(speciesId)) return null;
    var data = appData || KA.state.getAppData();
    var list = ensureCompanions(data);
    var companion = getCompanion(data, speciesId);
    if (!companion) {
      companion = {
        id: speciesId,
        speciesId: speciesId,
        firstHatchedAt: hatchedAt,
        lastHatchedAt: hatchedAt,
        hatchCount: 1,
        bondLevel: 1,
        isFavorite: false
      };
      list.push(companion);
    } else {
      companion.firstHatchedAt = companion.firstHatchedAt || hatchedAt;
      companion.lastHatchedAt = hatchedAt;
      companion.hatchCount = Math.max(0, Number(companion.hatchCount || 0)) + 1;
      companion.bondLevel = Math.max(0, Number(companion.bondLevel || 0)) + 1;
    }
    data.updatedAt = KA.date.localIsoString();
    return companion;
  }

  function setFavorite(speciesId, enabled) {
    var data = KA.state.getAppData();
    var target = getCompanion(data, speciesId);
    if (!target || !isValidSpeciesId(speciesId)) return false;
    ensureCompanions(data).forEach(function (companion) {
      if (!companion || !isValidSpeciesId(companion.speciesId)) return;
      companion.isFavorite = enabled && companion.speciesId === speciesId;
    });
    KA.state.saveAppData();
    return true;
  }

  function favoriteCompanion(appData) {
    return ensureCompanions(appData || KA.state.getAppData()).filter(function (companion) {
      return companion && companion.isFavorite && isValidSpeciesId(companion.speciesId);
    })[0] || null;
  }

  function pathList(paths, fill, stroke, attrs) {
    return (paths || []).map(function (d) {
      return '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" ' + (attrs || "") + '/>';
    }).join("");
  }

  function renderCompanion(speciesId, options) {
    var opts = options || {};
    var species = getSpecies(speciesId) || allSpecies()[0];
    if (opts.silhouette) {
      return [
        '<svg class="companion-svg companion-silhouette" viewBox="' + species.viewBox + '" aria-hidden="true" focusable="false">',
        pathList(species.outer, "#1f2937", "none"),
        '</svg>'
      ].join("");
    }
    return [
      '<svg class="companion-svg companion-' + species.id.replace("companion_", "") + '" viewBox="' + species.viewBox + '" aria-hidden="true" focusable="false">',
      '<g class="body-regions">',
      species.regions.map(function (region) {
        if (region.fill === "none") {
          return '<path d="' + region.d + '" fill="none" stroke="' + (species.defaultColors.leg || "#92400E") + '" stroke-width="4" stroke-linecap="round"/>';
        }
        return '<path d="' + region.d + '" fill="' + region.fill + '"/>';
      }).join(""),
      '</g>',
      '<g class="outer-outline" fill="none" stroke="#28312d" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round">',
      species.outer.map(function (d) { return '<path d="' + d + '"/>'; }).join(""),
      '</g>',
      '<g class="inner-lines" fill="none" stroke="#5b4631" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      species.inner.map(function (d) { return '<path d="' + d + '"/>'; }).join(""),
      '</g>',
      '<g class="face-details">',
      species.face,
      '</g>',
      '</svg>'
    ].join("");
  }

  KA.companions = {
    allSpecies: allSpecies,
    getSpecies: getSpecies,
    isValidSpeciesId: isValidSpeciesId,
    ensureCompanions: ensureCompanions,
    getCompanion: getCompanion,
    ownedSpeciesIds: ownedSpeciesIds,
    pickSpeciesForEgg: pickCompanionSpeciesForEgg,
    recordHatch: recordHatch,
    setFavorite: setFavorite,
    favoriteCompanion: favoriteCompanion,
    renderCompanion: renderCompanion,
    hashString: companionHashString
  };
})(window);
