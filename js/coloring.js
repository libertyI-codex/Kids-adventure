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
      '<path class="color-region" data-region-id="petal_top" d="M120 14 C97 32 100 60 120 78 C140 60 143 32 120 14 Z" fill="' + c("petal_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_upper_left" d="M85 28 C58 35 50 62 78 80 C96 71 106 55 101 39 Z" fill="' + c("petal_upper_left", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_upper_right" d="M155 28 C182 35 190 62 162 80 C144 71 134 55 139 39 Z" fill="' + c("petal_upper_right", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_left" d="M62 78 C73 54 99 54 113 82 C94 102 69 101 62 78 Z" fill="' + c("petal_left", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_right" d="M178 78 C167 54 141 54 127 82 C146 102 171 101 178 78 Z" fill="' + c("petal_right", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="petal_bottom" d="M120 119 C96 105 94 82 120 70 C146 82 144 105 120 119 Z" fill="' + c("petal_bottom", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
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
      '<path class="color-region" data-region-id="tail" d="M48 116 C28 105 33 82 55 82 C72 84 79 103 68 116 C62 123 54 122 48 116 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M61 103 C75 68 129 57 169 78 C203 95 207 133 173 151 C132 171 75 151 60 121 C57 115 58 109 61 103 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg" d="M92 127 C72 134 65 157 85 166 L124 166 C132 151 119 130 92 127 Z" fill="' + c("back_leg", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M106 115 C123 134 153 136 177 119 C177 143 151 157 120 150 C104 146 96 132 106 115 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg" d="M160 124 L176 151 L159 156 L145 128 Z" fill="' + c("front_leg", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M154 70 C165 45 198 44 216 62 C232 78 222 103 199 108 C176 113 150 96 154 70 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="nose" d="M207 75 C225 74 233 84 224 94 C214 97 205 92 202 82 Z" fill="' + c("nose", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_outer" d="M162 60 C146 19 160 3 184 48 Z" fill="' + c("ear_left_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_left_inner" d="M165 49 C158 27 163 17 176 45 Z" fill="' + c("ear_left_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_outer" d="M184 58 C190 15 208 9 207 57 Z" fill="' + c("ear_right_outer", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="ear_right_inner" d="M188 50 C192 28 201 22 199 52 Z" fill="' + c("ear_right_inner", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="cheek" d="M183 88 C193 83 204 87 205 98 C194 105 183 101 183 88 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<circle cx="192" cy="69" r="4.5" fill="#202124"/><path d="M220 88 C216 92 211 92 207 89 M202 86 L193 83 M202 93 L193 95" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
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
      '<path class="color-region" data-region-id="tail_fluke_top" d="M42 82 C18 60 24 38 52 54 C61 35 83 39 78 65 Z" fill="' + c("tail_fluke_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="tail_fluke_bottom" d="M43 88 C20 104 27 127 55 110 C64 128 86 121 79 96 Z" fill="' + c("tail_fluke_bottom", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="tail_stem" d="M73 67 C96 67 109 75 119 88 C105 96 93 99 73 98 C80 88 80 77 73 67 Z" fill="' + c("tail_stem", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body_top" d="M102 87 C126 45 180 34 215 63 C224 70 231 75 237 76 C229 87 213 91 197 86 C181 96 160 118 128 126 C99 116 84 101 102 87 Z" fill="' + c("body_top", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="snout" d="M207 64 C222 57 237 61 239 72 C228 82 214 80 203 74 Z" fill="' + c("snout", c("body_top", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M112 96 C135 112 170 105 195 84 C178 113 149 132 121 123 C108 119 101 106 112 96 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="dorsal_fin" d="M142 57 C153 26 172 34 166 68 Z" fill="' + c("dorsal_fin", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="pectoral_fin" d="M150 103 C157 139 181 132 177 100 Z" fill="' + c("pectoral_fin", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="cheek" d="M196 78 C205 74 213 79 214 88 C205 94 195 90 196 78 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<circle cx="198" cy="66" r="4.5" fill="#202124"/><path d="M211 80 C217 84 224 83 230 77" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgDinosaur(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_dinosaur_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="きょうりゅう" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M78 110 C45 115 16 101 4 76 C36 78 65 88 91 99 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M72 89 C91 57 138 52 173 76 C207 99 199 148 160 162 C121 176 77 151 68 119 C65 107 66 97 72 89 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="neck" d="M150 81 C158 56 177 42 200 47 C196 70 184 88 165 99 Z" fill="' + c("neck", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M188 41 C211 28 237 39 237 62 C237 81 214 91 190 82 C172 75 171 51 188 41 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="jaw" d="M194 70 C209 78 228 75 236 62 C239 81 220 98 195 91 C185 87 185 76 194 70 Z" fill="' + c("jaw", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="belly" d="M96 111 C115 135 151 138 179 113 C181 142 151 160 117 151 C99 146 88 128 96 111 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="arm" d="M167 105 L188 118 L177 130 L155 114 Z" fill="' + c("arm", c("body", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg" d="M111 132 C98 146 99 165 115 173 L149 173 C154 151 139 132 111 132 Z" fill="' + c("back_leg", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="foot" d="M112 164 L153 164 L161 176 L103 176 Z" fill="' + c("foot", c("back_leg", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="back_spines" fill="' + c("back_spines", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"><path d="M85 82 L91 55 L105 79 Z"/><path d="M119 65 L130 38 L140 68 Z"/><path d="M154 71 L172 50 L172 82 Z"/></g>',
      '<path class="color-region" data-region-id="cheek" d="M204 72 C214 69 223 74 223 84 C212 90 203 84 204 72 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="body_mark" fill="' + c("body_mark", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="2.5"><path d="M96 91 L108 84 L116 96 L104 103 Z"/><path d="M134 86 L146 80 L155 93 L142 99 Z"/></g>',
      '<circle cx="207" cy="55" r="4.5" fill="#202124"/><path d="M215 77 C207 83 198 82 192 76" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
      '</svg>'
    ].join("");
  }

  function svgHorse(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_horse_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="うま" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M48 86 C18 77 12 46 41 50 C65 54 65 78 55 104 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="body" d="M54 80 C72 48 137 43 169 66 C184 77 182 112 158 129 C122 151 70 130 54 103 C49 94 49 87 54 80 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="neck" d="M151 68 C155 41 171 23 190 27 C203 30 207 46 197 62 C188 76 169 82 158 94 Z" fill="' + c("neck", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="head" d="M187 25 C207 12 231 25 229 47 C227 66 207 76 190 66 C178 59 176 34 187 25 Z" fill="' + c("head", c("neck", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="ears" fill="' + c("ears", c("head", "#FFFFFF")) + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"><path d="M187 29 L190 6 L203 27 Z"/><path d="M204 28 L219 10 L220 36 Z"/></g>',
      '<path class="color-region" data-region-id="mane" d="M154 72 C150 47 163 28 187 22 C176 47 180 66 164 91 Z" fill="' + c("mane", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg_far" d="M151 119 L159 153 L146 169 L132 169 L142 151 L136 121 Z" fill="' + c("front_leg_far", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="front_leg_near" d="M131 122 L126 154 L136 169 L119 169 L110 153 L118 121 Z" fill="' + c("front_leg_near", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg_far" d="M81 113 L75 142 L61 169 L45 169 L61 140 L64 109 Z" fill="' + c("back_leg_far", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<path class="color-region" data-region-id="back_leg_near" d="M101 119 L110 145 L101 169 L84 169 L94 146 L88 119 Z" fill="' + c("back_leg_near", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="5" stroke-linejoin="miter"/>',
      '<g class="color-region" data-region-id="hooves" fill="' + c("hooves", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="3" stroke-linejoin="miter"><path d="M43 166 L64 166 L68 176 L40 176 Z"/><path d="M82 166 L104 166 L108 176 L80 176 Z"/><path d="M118 166 L139 166 L143 176 L115 176 Z"/><path d="M145 166 L164 166 L168 176 L141 176 Z"/></g>',
      '<path class="color-region" data-region-id="muzzle" d="M215 45 C231 44 238 54 229 65 C217 70 204 64 204 52 Z" fill="' + c("muzzle", "#FFFFFF") + '" stroke="#3F3F46" stroke-width="4" stroke-linejoin="miter"/>',
      '<circle cx="205" cy="38" r="4.5" fill="#202124"/><path d="M217 61 C210 67 200 67 193 61" fill="none" stroke="#202124" stroke-width="3" stroke-linecap="butt"/>',
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
