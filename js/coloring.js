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

  function getBuiltInTemplate(templateId) {
    return KA.constants.COLORING_TEMPLATES.filter(function (item) {
      return item.templateId === templateId;
    })[0] || null;
  }

  function normalizeRegionColors(templateId, regionColors) {
    var template = getBuiltInTemplate(templateId);
    var next = JSON.parse(JSON.stringify(regionColors || {}));
    if (!template) return next;
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
    var colorsForTemplate = normalizeRegionColors("coloring_flower_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="おはな" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="stem" d="M120 96 C116 119 119 142 112 168 L127 168 C132 140 130 119 126 96 Z" fill="' + c("stem", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="leaf_left" d="M114 130 C88 110 58 113 47 136 C70 147 98 145 114 130 Z" fill="' + c("leaf_left", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="leaf_right" d="M126 142 C151 116 181 122 191 149 C165 157 141 156 126 142 Z" fill="' + c("leaf_right", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_top" d="M119 12 C101 31 104 57 119 74 C138 58 141 29 119 12 Z" fill="' + c("petal_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_upper_left" d="M85 26 C55 32 45 58 70 78 C88 90 105 75 107 55 C103 40 97 31 85 26 Z" fill="' + c("petal_upper_left", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_upper_right" d="M157 25 C187 31 197 59 171 78 C153 90 136 75 134 55 C138 39 145 30 157 25 Z" fill="' + c("petal_upper_right", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_left" d="M55 82 C67 61 92 58 111 82 C98 107 68 111 55 82 Z" fill="' + c("petal_left", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_right" d="M185 82 C173 61 148 58 129 82 C142 107 172 111 185 82 Z" fill="' + c("petal_right", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_bottom" d="M119 122 C96 110 93 84 117 72 C143 83 145 108 119 122 Z" fill="' + c("petal_bottom", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="center" d="M96 72 C100 53 140 53 144 72 C149 96 91 96 96 72 Z" fill="' + c("center", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path d="M70 133 C84 134 99 132 111 126 M132 141 C149 143 166 145 184 148" fill="none" stroke="#3F3F46" stroke-width="2.5" opacity=".36"/>',
      '</svg>'
    ].join("");
  }

  function svgRabbit(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_rabbit_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="うさぎ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M43 119 C23 110 27 88 48 82 C66 79 78 95 72 112 C68 125 54 128 43 119 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M62 102 C72 73 105 59 145 65 C180 70 199 92 196 121 C190 154 151 168 109 158 C73 150 51 128 62 102 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg" d="M89 124 C69 131 62 151 75 163 C85 172 117 171 130 160 C137 144 121 126 89 124 Z" fill="' + c("back_leg", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M114 112 C132 132 166 133 188 114 C188 138 162 153 131 149 C112 146 103 128 114 112 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg" d="M169 121 C178 130 184 143 181 156 L163 160 C166 147 160 136 151 126 Z" fill="' + c("front_leg", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M157 68 C168 48 195 42 215 55 C232 66 232 91 214 103 C191 117 160 105 154 82 C153 77 154 72 157 68 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="nose" d="M210 74 C226 70 238 78 234 90 C227 99 212 98 204 88 C203 82 205 77 210 74 Z" fill="' + c("nose", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_outer" d="M164 60 C145 24 153 4 181 43 C184 53 178 61 164 60 Z" fill="' + c("ear_left_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_inner" d="M166 50 C158 27 163 17 176 43 C177 49 173 52 166 50 Z" fill="' + c("ear_left_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_outer" d="M187 58 C187 18 203 4 213 48 C211 61 201 66 187 58 Z" fill="' + c("ear_right_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_inner" d="M192 50 C193 28 202 19 207 48 C205 54 199 55 192 50 Z" fill="' + c("ear_right_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="cheek" d="M184 87 C195 82 207 88 207 99 C196 106 184 101 184 87 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<circle cx="194" cy="68" r="4.5" fill="#202124"/><path d="M225 88 C220 92 214 92 209 88 M205 85 L194 82 M205 93 L194 96" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgCat(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_cat_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="ねこ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M154 128 C207 125 214 66 172 61 C150 58 141 83 160 91 C176 99 186 86 177 76" fill="none" stroke="' + c("tail", "#FFFFFF") + '" stroke-width="17" stroke-linecap="butt" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M76 79 C68 105 62 132 78 158 L161 158 C177 132 170 103 160 79 C139 58 96 58 76 79 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_legs" d="M70 137 C54 144 51 164 70 170 L103 170 C101 150 88 137 70 137 Z M170 137 C186 144 189 164 170 170 L137 170 C139 150 152 137 170 137 Z" fill="' + c("back_legs", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_legs" d="M98 111 L92 168 L113 168 L118 113 Z M122 113 L127 168 L148 168 L142 111 Z" fill="' + c("front_legs", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="chest" d="M102 101 C111 123 129 123 138 101 L142 154 L98 154 Z" fill="' + c("chest", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_outer" d="M79 55 L93 17 L113 59 Z" fill="' + c("ear_left_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_outer" d="M127 59 L147 17 L161 55 Z" fill="' + c("ear_right_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_inner" d="M91 50 L96 32 L106 54 Z" fill="' + c("ear_left_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_inner" d="M134 54 L144 32 L149 50 Z" fill="' + c("ear_right_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="face" d="M76 58 C86 38 154 38 164 58 C177 86 156 112 120 112 C84 112 63 86 76 58 Z" fill="' + c("face", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="muzzle" d="M99 87 C104 76 116 80 120 89 C124 80 136 76 141 87 C139 101 101 101 99 87 Z" fill="' + c("muzzle", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="collar" d="M82 104 C103 116 137 116 158 104 L154 119 C132 128 108 128 86 119 Z" fill="' + c("collar", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<circle cx="105" cy="74" r="4.5" fill="#202124"/><circle cx="135" cy="74" r="4.5" fill="#202124"/><path d="M118 88 L123 88 L120 94 Z M92 88 L63 81 M93 96 L65 99 M148 88 L177 81 M147 96 L175 99" stroke="#202124" stroke-width="3" fill="#202124" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgDolphin(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_dolphin_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="イルカ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail_fluke_top" d="M46 78 C23 52 31 31 60 51 C67 33 89 38 85 64 C73 69 59 73 46 78 Z" fill="' + c("tail_fluke_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="tail_fluke_bottom" d="M47 86 C22 102 28 126 58 110 C66 130 89 120 84 96 C71 92 59 89 47 86 Z" fill="' + c("tail_fluke_bottom", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="tail_stem" d="M78 66 C103 67 119 73 132 84 C118 96 101 101 78 98 C86 87 86 76 78 66 Z" fill="' + c("tail_stem", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body_top" d="M119 83 C139 48 183 39 214 56 C226 63 233 70 239 72 C231 84 211 88 195 82 C177 96 153 116 124 123 C100 113 97 96 119 83 Z" fill="' + c("body_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="snout" d="M210 58 C226 51 238 57 238 69 C228 79 215 78 202 69 C203 64 206 61 210 58 Z" fill="' + c("snout", c("body_top", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M121 94 C145 107 173 101 197 81 C181 110 151 129 123 121 C110 117 109 102 121 94 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="dorsal_fin" d="M150 56 C160 27 181 33 174 69 C164 69 156 64 150 56 Z" fill="' + c("dorsal_fin", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="pectoral_fin" d="M153 102 C158 135 182 134 180 99 C170 96 160 98 153 102 Z" fill="' + c("pectoral_fin", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="cheek" d="M194 75 C204 71 214 77 214 87 C204 94 194 89 194 75 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<circle cx="198" cy="64" r="4.5" fill="#202124"/><path d="M211 78 C218 83 226 81 232 74" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgDinosaur(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_dinosaur_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="きょうりゅう" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M77 108 C47 119 18 111 3 88 C30 80 59 84 91 99 C89 106 84 109 77 108 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M72 91 C91 62 136 53 171 71 C202 87 205 128 174 151 C143 173 94 163 74 132 C65 119 64 103 72 91 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="neck" d="M153 77 C162 55 179 45 197 50 C193 73 181 90 164 101 C156 97 151 88 153 77 Z" fill="' + c("neck", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M188 43 C207 30 233 35 238 56 C239 72 225 87 204 86 C182 84 171 68 177 54 C179 49 183 46 188 43 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="jaw" d="M193 70 C208 76 226 74 238 62 C240 78 224 94 199 91 C187 89 184 77 193 70 Z" fill="' + c("jaw", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M95 111 C116 133 148 137 178 115 C179 141 154 157 122 152 C101 149 88 129 95 111 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="arm" d="M164 101 L187 109 L181 123 L158 113 Z" fill="' + c("arm", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg" d="M103 131 C88 144 89 166 106 174 L132 174 C138 151 128 135 103 131 Z M145 126 C132 140 135 161 152 170 L175 170 C178 149 168 130 145 126 Z" fill="' + c("back_leg", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="foot" d="M102 164 L137 164 L145 176 L95 176 Z M150 161 L181 161 L190 172 L146 172 Z" fill="' + c("foot", c("back_leg", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="back_spines" fill="' + c("back_spines", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"><path d="M87 84 L96 57 L109 81 Z"/><path d="M121 66 L134 39 L144 70 Z"/><path d="M154 70 L172 50 L171 82 Z"/></g>',
      '<path class="color-region" data-region-id="cheek" d="M203 71 C213 67 224 72 225 83 C214 90 203 84 203 71 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="body_mark" fill="' + c("body_mark", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="2.5"><path d="M94 91 L107 84 L116 96 L102 104 Z"/><path d="M132 84 L146 79 L155 92 L141 99 Z"/></g>',
      '<circle cx="207" cy="55" r="4.5" fill="#202124"/><path d="M216 76 C208 82 198 81 191 75" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgHorse(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_horse_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="うま" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M49 85 C23 78 15 52 38 47 C58 43 70 62 61 91 C57 104 51 115 44 124 C42 106 43 94 49 85 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M57 79 C78 55 134 48 169 65 C184 72 190 93 181 112 C166 139 118 147 80 132 C54 121 44 95 57 79 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="neck" d="M156 67 C160 42 176 22 194 24 C207 26 211 42 202 58 C193 75 172 82 159 98 Z" fill="' + c("neck", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M189 24 C205 11 228 17 235 35 C238 55 224 72 202 67 C185 63 178 40 189 24 Z" fill="' + c("head", c("neck", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="ears" fill="' + c("ears", c("head", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"><path d="M190 27 L191 7 L205 26 Z"/><path d="M206 26 L220 9 L224 34 Z"/></g>',
      '<path class="color-region" data-region-id="mane" d="M158 72 C154 48 166 29 190 23 C182 43 181 63 166 93 Z" fill="' + c("mane", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg_far" d="M154 116 L165 144 L153 169 L138 169 L147 145 L139 119 Z" fill="' + c("front_leg_far", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg_near" d="M132 121 L128 149 L138 169 L120 169 L111 149 L119 119 Z" fill="' + c("front_leg_near", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg_far" d="M78 111 L74 140 L58 169 L42 169 L58 139 L62 108 Z" fill="' + c("back_leg_far", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg_near" d="M101 116 L112 143 L103 169 L86 169 L95 145 L88 117 Z" fill="' + c("back_leg_near", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="hooves" fill="' + c("hooves", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"><path d="M40 166 L63 166 L67 176 L38 176 Z"/><path d="M84 166 L106 166 L110 176 L82 176 Z"/><path d="M118 166 L140 166 L144 176 L115 176 Z"/><path d="M137 166 L158 166 L162 176 L134 176 Z"/></g>',
      '<path class="color-region" data-region-id="muzzle" d="M218 43 C233 42 238 52 233 63 C224 72 207 66 204 54 C207 49 212 45 218 43 Z" fill="' + c("muzzle", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<circle cx="207" cy="37" r="4.5" fill="#202124"/><path d="M219 60 C212 66 201 66 194 60" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
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
    var normalizedRegionColors = normalizeRegionColors(templateId, regionColors);
    var analysis = analyze(normalizedRegionColors, template);
    if (analysis.coloredRegionCount < 1) return { ok: false, reason: "empty" };
    var data = KA.state.getAppData();
    var dateKey = KA.state.getTodayKey();
    var artworkId = "artwork_" + KA.date.compactDateKey(dateKey) + "_" + template.worldObjectType + "_" + Math.random().toString(36).slice(2, 6);
    var usedColors = [];
    Object.keys(normalizedRegionColors).forEach(function (key) {
      if (normalizedRegionColors[key] && usedColors.indexOf(normalizedRegionColors[key]) === -1) usedColors.push(normalizedRegionColors[key]);
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
      regionColors: JSON.parse(JSON.stringify(normalizedRegionColors)),
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
    normalizeRegionColors: normalizeRegionColors,
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
