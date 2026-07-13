(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function getTemplate(templateId) {
    return KA.state.getAppData().coloringTemplates.filter(function (item) {
      return item.templateId === templateId;
    })[0] || null;
  }

  function getTemplates() {
    return KA.state.getAppData().coloringTemplates.slice().sort(function (a, b) {
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
  }

  function unlockedEntries() {
    return KA.state.getAppData().unlocks.coloringTemplateIds || [];
  }

  function isUnlocked(templateId) {
    return unlockedEntries().some(function (entry) {
      return entry && entry.templateId === templateId;
    });
  }

  function unlock(templateId) {
    var template = getTemplate(templateId);
    if (!template) return { ok: false, reason: "not_found" };
    if (isUnlocked(templateId)) return { ok: true, alreadyUnlocked: true };
    var spent = KA.stars.spendForColoring(template);
    if (!spent.ok) return spent;
    KA.state.getAppData().unlocks.coloringTemplateIds.push({
      templateId: templateId,
      unlockedAt: KA.date.localIsoString(),
      ledgerId: spent.entry.id
    });
    KA.state.saveAppData();
    return { ok: true, entry: spent.entry };
  }

  function colorFor(regionColors, regionId, fallback) {
    return (regionColors && regionColors[regionId]) || fallback || "#FFFFFF";
  }

  function svgButterfly(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="ちょうちょ" class="' + (className || "") + '">',
      '<defs><filter id="softShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#5f6f55" flood-opacity=".25"/></filter></defs>',
      '<path class="color-region" data-region-id="left_wing" d="M96 80 C58 10 10 28 35 82 C10 120 52 150 96 96 Z" fill="' + c("left_wing", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" filter="url(#softShadow)"/>',
      '<path class="color-region" data-region-id="right_wing" d="M104 80 C142 10 190 28 165 82 C190 120 148 150 104 96 Z" fill="' + c("right_wing", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" filter="url(#softShadow)"/>',
      '<g class="color-region" data-region-id="spots" fill="' + c("spots", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"><circle cx="58" cy="70" r="9"/><circle cx="73" cy="105" r="7"/><circle cx="142" cy="70" r="9"/><circle cx="127" cy="105" r="7"/></g>',
      '<ellipse class="color-region" data-region-id="body" cx="100" cy="88" rx="13" ry="42" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="antennae" d="M95 50 C84 34 72 31 63 24 M105 50 C116 34 128 31 137 24" fill="none" stroke="' + c("antennae", "#4B5563") + '" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M65 45 C90 30 111 30 136 45" fill="none" stroke="#fff" stroke-width="4" opacity=".32"/>',
      '</svg>'
    ].join("");
  }

  function svgFlower(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="おはな" class="' + (className || "") + '">',
      '<g class="color-region" data-region-id="petals" fill="' + c("petals", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4">',
      '<ellipse cx="100" cy="38" rx="22" ry="34"/><ellipse cx="100" cy="92" rx="22" ry="34"/><ellipse cx="72" cy="65" rx="34" ry="22"/><ellipse cx="128" cy="65" rx="34" ry="22"/><ellipse cx="80" cy="45" rx="27" ry="20" transform="rotate(-38 80 45)"/><ellipse cx="120" cy="45" rx="27" ry="20" transform="rotate(38 120 45)"/></g>',
      '<circle class="color-region" data-region-id="center" cx="100" cy="65" r="24" fill="' + c("center", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="stem" d="M101 88 C100 108 102 128 98 152" fill="none" stroke="' + c("stem", "#FFFFFF") + '" stroke-width="12" stroke-linecap="round"/>',
      '<path class="color-region" data-region-id="leaf_left" d="M96 119 C62 102 48 119 52 139 C73 142 87 134 96 119 Z" fill="' + c("leaf_left", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="leaf_right" d="M104 127 C137 108 154 125 147 145 C126 146 112 140 104 127 Z" fill="' + c("leaf_right", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '</svg>'
    ].join("");
  }

  function svgRabbit(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="うさぎ" class="' + (className || "") + '">',
      '<ellipse class="color-region" data-region-id="body" cx="100" cy="92" rx="48" ry="45" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="ear_left" d="M73 52 C52 8 70 -4 91 45 Z" fill="' + c("ear_left", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="ear_right" d="M127 52 C148 8 130 -4 109 45 Z" fill="' + c("ear_right", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<ellipse class="color-region" data-region-id="belly" cx="100" cy="108" rx="25" ry="22" fill="' + c("belly", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"/>',
      '<g class="color-region" data-region-id="cheeks" fill="' + c("cheeks", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"><circle cx="76" cy="91" r="9"/><circle cx="124" cy="91" r="9"/></g>',
      '<circle cx="86" cy="75" r="4" fill="#2f3135"/><circle cx="114" cy="75" r="4" fill="#2f3135"/><path d="M98 86 L102 86 L100 91 Z" fill="#2f3135"/><path d="M100 91 C95 98 90 98 86 94 M100 91 C105 98 110 98 114 94" fill="none" stroke="#2f3135" stroke-width="3" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgCat(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="ねこ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M142 105 C180 95 174 50 142 60 C126 66 133 88 151 82" fill="none" stroke="' + c("tail", "#FFFFFF") + '" stroke-width="15" stroke-linecap="round"/>',
      '<path class="color-region" data-region-id="body" d="M58 78 C58 40 142 40 142 78 L142 125 C142 145 58 145 58 125 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="ears" d="M62 55 L73 24 L93 52 M107 52 L127 24 L138 55" fill="' + c("ears", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<ellipse class="color-region" data-region-id="face" cx="100" cy="83" rx="34" ry="28" fill="' + c("face", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"/>',
      '<path class="color-region" data-region-id="collar" d="M70 111 C90 121 110 121 130 111" fill="none" stroke="' + c("collar", "#FFFFFF") + '" stroke-width="9" stroke-linecap="round"/>',
      '<circle cx="88" cy="79" r="4" fill="#2f3135"/><circle cx="112" cy="79" r="4" fill="#2f3135"/><path d="M99 89 L104 89 L101 94 Z" fill="#2f3135"/><path d="M78 91 L55 84 M78 98 L55 100 M122 91 L145 84 M122 98 L145 100" stroke="#2f3135" stroke-width="3" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgDolphin(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="イルカ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="wave" d="M20 126 C42 112 58 140 80 126 C102 112 118 140 140 126 C158 116 172 124 184 132" fill="none" stroke="' + c("wave", "#FFFFFF") + '" stroke-width="12" stroke-linecap="round"/>',
      '<path class="color-region" data-region-id="body" d="M34 86 C62 42 126 38 162 72 C145 78 126 91 109 113 C82 108 55 100 34 86 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="belly" d="M70 91 C91 98 114 97 136 82 C126 101 105 116 80 108 C72 105 67 99 70 91 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"/>',
      '<path class="color-region" data-region-id="fin_top" d="M92 52 C101 27 115 39 111 63 Z" fill="' + c("fin_top", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="fin_side" d="M100 96 C106 122 125 119 123 96 Z" fill="' + c("fin_side", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="tail" d="M35 86 C16 75 17 54 39 66 C45 48 66 55 55 78 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<circle cx="144" cy="71" r="4" fill="#2f3135"/><path d="M151 82 C158 87 166 86 172 80" fill="none" stroke="#2f3135" stroke-width="3" stroke-linecap="round"/>',
      '<path d="M72 62 C99 50 126 55 145 70" fill="none" stroke="#fff" stroke-width="5" opacity=".32"/>',
      '</svg>'
    ].join("");
  }

  function svgDinosaur(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="きょうりゅう" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M58 102 C28 105 15 92 8 73 C31 76 48 84 67 94 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M48 92 C54 58 91 41 125 55 C155 68 166 102 145 124 C122 145 76 137 56 118 C50 111 46 102 48 92 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="belly" d="M83 99 C102 113 124 112 142 95 C145 118 129 132 103 130 C84 128 73 116 83 99 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"/>',
      '<g class="color-region" data-region-id="spikes" fill="' + c("spikes", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3" stroke-linejoin="round"><path d="M70 65 L74 41 L88 62 Z"/><path d="M95 56 L104 32 L113 60 Z"/><path d="M122 62 L138 42 L139 72 Z"/></g>',
      '<g class="color-region" data-region-id="legs" fill="' + c("legs", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"><path d="M80 125 L72 151 L94 151 L96 128 Z"/><path d="M125 126 L121 151 L146 151 L142 123 Z"/></g>',
      '<g class="color-region" data-region-id="spots" fill="' + c("spots", "#FFFFFF") + '" stroke="#4B5563" stroke-width="2"><circle cx="82" cy="82" r="7"/><circle cx="111" cy="75" r="6"/><circle cx="132" cy="91" r="6"/></g>',
      '<circle cx="139" cy="72" r="4" fill="#2f3135"/><path d="M148 86 C139 91 130 90 124 84" fill="none" stroke="#2f3135" stroke-width="3" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgHorse(colors, className) {
    var c = function (id, fallback) { return colorFor(colors, id, fallback); };
    return [
      '<svg viewBox="0 0 200 160" role="img" aria-label="うま" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M50 92 C22 73 24 50 46 56 C63 61 62 78 51 93 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M49 85 C60 57 111 48 144 70 C158 81 154 113 132 123 C101 137 62 121 49 99 C47 95 47 90 49 85 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4"/>',
      '<path class="color-region" data-region-id="neck" d="M124 69 C125 44 139 25 160 24 C178 26 187 43 180 59 C172 75 149 76 136 88 Z" fill="' + c("neck", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="mane" d="M130 65 C124 48 132 31 151 22 C145 43 150 58 139 78 Z" fill="' + c("mane", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"/>',
      '<g class="color-region" data-region-id="legs" fill="' + c("legs", "#FFFFFF") + '" stroke="#4B5563" stroke-width="4" stroke-linejoin="round"><path d="M70 116 L62 151 L81 151 L85 121 Z"/><path d="M112 121 L108 151 L128 151 L130 120 Z"/><path d="M92 121 L84 151 L100 151 L106 123 Z"/></g>',
      '<g class="color-region" data-region-id="eye" fill="' + c("eye", "#FFFFFF") + '" stroke="#4B5563" stroke-width="3"><circle cx="165" cy="43" r="7"/></g>',
      '<circle cx="166" cy="43" r="3" fill="#2f3135"/><path d="M173 57 C167 64 157 64 151 58" fill="none" stroke="#2f3135" stroke-width="3" stroke-linecap="round"/>',
      '<path d="M69 70 C95 55 119 60 138 76" fill="none" stroke="#fff" stroke-width="5" opacity=".32"/>',
      '</svg>'
    ].join("");
  }

  function renderTemplate(templateId, regionColors, className) {
    if (templateId === "coloring_butterfly_001") return svgButterfly(regionColors, className);
    if (templateId === "coloring_flower_001") return svgFlower(regionColors, className);
    if (templateId === "coloring_rabbit_001") return svgRabbit(regionColors, className);
    if (templateId === "coloring_cat_001") return svgCat(regionColors, className);
    if (templateId === "coloring_dolphin_001") return svgDolphin(regionColors, className);
    if (templateId === "coloring_dinosaur_001") return svgDinosaur(regionColors, className);
    if (templateId === "coloring_horse_001") return svgHorse(regionColors, className);
    return "";
  }

  function paletteByValue(value) {
    var upper = String(value || "").toUpperCase();
    return KA.constants.COLOR_PALETTE.filter(function (color) {
      return color.value.toUpperCase() === upper;
    })[0] || null;
  }

  function analyze(regionColors, template) {
    var counts = {};
    var used = [];
    Object.keys(regionColors || {}).forEach(function (regionId) {
      var value = regionColors[regionId];
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
      if (used.indexOf(value) === -1) used.push(value);
    });
    var dominant = used[0] || "#FFFFFF";
    used.forEach(function (value) {
      if ((counts[value] || 0) > (counts[dominant] || 0)) dominant = value;
    });
    var palette = paletteByValue(dominant);
    var coloredCount = Object.keys(regionColors || {}).filter(function (key) { return regionColors[key]; }).length;
    var total = template.regionIds.length;
    var brightFamilies = ["yellow", "orange", "pink", "cyan", "white"];
    var family = palette ? palette.family : "other";
    return {
      dominantColor: dominant,
      dominantColorFamily: family,
      brightness: brightFamilies.indexOf(family) >= 0 ? "bright" : "calm",
      coloredRegionCount: coloredCount,
      totalRegionCount: total,
      completionRatio: total ? Math.round((coloredCount / total) * 100) / 100 : 0
    };
  }

  function getDraft(templateId) {
    var ui = KA.state.getUiState();
    ui.coloringDrafts = ui.coloringDrafts || {};
    if (!ui.coloringDrafts[templateId]) {
      ui.coloringDrafts[templateId] = {
        templateId: templateId,
        regionColors: {},
        undoStack: [],
        updatedAt: KA.date.localIsoString()
      };
    }
    return ui.coloringDrafts[templateId];
  }

  function saveDraft(templateId, draft) {
    var ui = KA.state.getUiState();
    ui.coloringDrafts = ui.coloringDrafts || {};
    ui.coloringDrafts[templateId] = draft;
    draft.updatedAt = KA.date.localIsoString();
    KA.state.saveUiState();
  }

  function clearDraft(templateId) {
    var ui = KA.state.getUiState();
    if (ui.coloringDrafts) {
      delete ui.coloringDrafts[templateId];
      KA.state.saveUiState();
    }
  }

  function createArtwork(templateId, regionColors) {
    var template = getTemplate(templateId);
    if (!template) return { ok: false, reason: "template_not_found" };
    var analysis = analyze(regionColors, template);
    if (analysis.coloredRegionCount < 1) return { ok: false, reason: "empty" };
    var data = KA.state.getAppData();
    var dateKey = KA.state.getTodayKey();
    var artworkId = "artwork_" + KA.date.compactDateKey(dateKey) + "_" + template.worldObjectType + "_" + Math.random().toString(36).slice(2, 6);
    var usedColors = [];
    Object.keys(regionColors).forEach(function (key) {
      if (regionColors[key] && usedColors.indexOf(regionColors[key]) === -1) usedColors.push(regionColors[key]);
    });
    var artwork = {
      artworkId: artworkId,
      profileId: data.profile.profileId,
      templateId: templateId,
      title: template.title,
      createdAt: KA.date.localIsoString(),
      completedAt: KA.date.localIsoString(),
      localDate: dateKey,
      status: "completed",
      regionColors: JSON.parse(JSON.stringify(regionColors)),
      usedColors: usedColors,
      analysis: analysis,
      magicResult: {
        outlineStyle: "soft_bold",
        shineLevel: analysis.brightness === "bright" ? 3 : 2,
        seed: artworkId
      },
      parentNote: "",
      favorite: false,
      placementId: null
    };
    data.artworks.push(artwork);
    var placement = KA.worlds.addArtworkPlacement(artwork);
    artwork.placementId = placement.placementId;
    var record = KA.state.getDailyRecord(dateKey);
    if (record.artworkIds.indexOf(artworkId) === -1) record.artworkIds.push(artworkId);
    if (record.forestPlacementIds.indexOf(placement.placementId) === -1) record.forestPlacementIds.push(placement.placementId);
    clearDraft(templateId);
    KA.state.saveAppData();
    return { ok: true, artwork: artwork, placement: placement };
  }

  function getArtwork(artworkId) {
    return KA.state.getAppData().artworks.filter(function (art) {
      return art.artworkId === artworkId;
    })[0] || null;
  }

  function recentArtworks() {
    return KA.state.getAppData().artworks.slice().sort(function (a, b) {
      return String(b.completedAt).localeCompare(String(a.completedAt));
    });
  }

  KA.coloring = {
    getTemplate: getTemplate,
    getTemplates: getTemplates,
    isUnlocked: isUnlocked,
    unlock: unlock,
    renderTemplate: renderTemplate,
    analyze: analyze,
    getDraft: getDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    createArtwork: createArtwork,
    getArtwork: getArtwork,
    recentArtworks: recentArtworks,
    paletteByValue: paletteByValue
  };
})(window);
