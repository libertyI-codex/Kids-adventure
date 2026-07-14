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
      '<path class="color-region" data-region-id="tail" d="M43 116 C25 114 22 94 39 86 C55 77 73 87 70 105 C66 118 55 123 43 116 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M62 106 C72 78 101 61 139 63 C169 65 190 83 194 108 C198 137 172 157 131 158 C93 158 61 137 58 116 C57 112 59 109 62 106 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg" d="M83 122 C68 130 61 151 75 162 C91 174 124 165 132 149 C137 137 120 126 101 128 C93 130 89 126 83 122 Z" fill="' + c("back_leg", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="belly" d="M112 110 C130 128 163 130 185 112 C184 135 158 149 128 146 C110 144 102 126 112 110 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_leg" d="M163 120 C173 128 178 141 174 154 C168 158 159 159 151 156 C158 143 154 132 145 124 Z" fill="' + c("front_leg", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="head" d="M154 72 C162 54 184 44 204 51 C223 57 232 75 225 91 C219 106 196 112 174 103 C158 96 149 84 154 72 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="nose" d="M218 76 C231 75 237 83 232 91 C226 97 214 94 207 87 C208 81 212 78 218 76 Z" fill="' + c("nose", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ear_left_outer" d="M161 62 C148 31 156 9 176 45 C180 55 174 63 161 62 Z" fill="' + c("ear_left_outer", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ear_left_inner" d="M164 54 C158 33 162 22 174 47 C175 53 171 56 164 54 Z" fill="' + c("ear_left_inner", "#FFFFFF") + '" stroke="#374151" stroke-width="2.8" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ear_right_outer" d="M184 58 C183 24 199 8 210 47 C209 60 198 66 184 58 Z" fill="' + c("ear_right_outer", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ear_right_inner" d="M190 51 C190 31 199 21 204 48 C202 54 196 55 190 51 Z" fill="' + c("ear_right_inner", "#FFFFFF") + '" stroke="#374151" stroke-width="2.8" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="cheek" d="M185 86 C196 82 207 87 207 98 C197 104 186 99 185 86 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<circle cx="195" cy="69" r="3.6" fill="#202124"/><path d="M224 90 C218 94 212 93 207 88 M205 86 L195 84 M205 94 L195 97" fill="none" stroke="#202124" stroke-width="2.6" stroke-linecap="round"/>',
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
      '<path class="color-region" data-region-id="tail_fluke_top" d="M39 76 C18 55 28 35 58 52 C65 35 86 40 85 63 C70 67 54 71 39 76 Z" fill="' + c("tail_fluke_top", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="tail_fluke_bottom" d="M39 84 C16 100 25 122 57 107 C64 126 86 118 84 95 C69 91 54 87 39 84 Z" fill="' + c("tail_fluke_bottom", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="tail_stem" d="M78 64 C101 66 119 73 134 84 C118 94 101 99 78 96 C85 86 86 74 78 64 Z" fill="' + c("tail_stem", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body_top" d="M117 82 C138 53 172 42 201 51 C219 57 227 68 235 70 C224 81 206 85 191 80 C174 96 151 113 123 119 C101 110 96 95 117 82 Z" fill="' + c("body_top", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="snout" d="M204 58 C220 52 235 57 236 68 C225 76 212 76 199 68 C199 63 201 60 204 58 Z" fill="' + c("snout", c("body_top", "#FFFFFF")) + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="belly" d="M120 94 C143 106 169 100 191 81 C177 108 149 125 123 118 C111 115 108 102 120 94 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="dorsal_fin" d="M149 58 C158 33 178 35 173 69 C163 68 155 64 149 58 Z" fill="' + c("dorsal_fin", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="pectoral_fin" d="M151 101 C157 128 178 129 177 100 C168 96 158 97 151 101 Z" fill="' + c("pectoral_fin", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="cheek" d="M190 73 C200 70 209 76 209 85 C200 91 190 86 190 73 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<circle cx="197" cy="63" r="3.6" fill="#202124"/><path d="M208 77 C216 81 224 79 230 73" fill="none" stroke="#202124" stroke-width="2.6" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgDinosaur(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_dinosaur_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="きょうりゅう" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M79 112 C50 126 22 119 5 101 C34 91 61 94 92 105 C92 112 87 116 79 112 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M73 92 C92 68 128 59 162 73 C190 84 199 116 180 140 C158 167 111 164 84 140 C67 124 63 104 73 92 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="neck" d="M154 76 C164 57 184 47 201 51 C197 70 184 87 165 97 C157 94 151 86 154 76 Z" fill="' + c("neck", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="head" d="M190 45 C207 34 230 40 237 56 C241 69 232 82 214 84 C193 87 176 76 178 61 C179 54 184 49 190 45 Z" fill="' + c("head", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="jaw" d="M194 70 C209 75 225 72 236 64 C237 78 222 90 200 88 C188 86 185 76 194 70 Z" fill="' + c("jaw", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="belly" d="M95 111 C116 130 148 133 176 113 C177 136 153 151 123 148 C103 146 90 129 95 111 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="arm" d="M163 99 C174 101 184 107 187 116 C180 121 168 119 158 112 C158 106 160 102 163 99 Z" fill="' + c("arm", c("body", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg" d="M104 128 C91 140 91 160 107 169 L131 169 C137 149 128 133 104 128 Z M145 124 C132 138 135 157 151 166 L174 166 C177 146 168 128 145 124 Z" fill="' + c("back_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="foot" d="M103 160 L136 160 C144 165 145 172 139 176 L96 176 C94 170 97 164 103 160 Z M151 157 L178 157 C187 162 190 169 184 173 L146 173 C144 166 146 161 151 157 Z" fill="' + c("foot", c("back_leg", "#FFFFFF")) + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_spines" d="M93 80 C105 68 118 64 131 64 C124 72 113 78 103 85 C99 84 96 82 93 80 Z M145 67 C157 66 168 70 178 77 C168 80 158 79 148 73 C147 71 146 69 145 67 Z" fill="' + c("back_spines", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="cheek" d="M203 70 C212 67 221 72 222 81 C213 86 203 81 203 70 Z" fill="' + c("cheek", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body_mark" d="M96 92 C104 86 114 87 121 96 C113 103 102 102 96 92 Z M131 86 C141 82 151 86 156 96 C146 101 136 98 131 86 Z" fill="' + c("body_mark", "#FFFFFF") + '" stroke="#374151" stroke-width="2.5" stroke-linejoin="round"/>',
      '<circle cx="207" cy="56" r="3.6" fill="#202124"/><path d="M214 75 C207 81 198 80 191 74" fill="none" stroke="#202124" stroke-width="2.6" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgHorse(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_horse_001", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="うま" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M48 80 C25 72 18 48 38 43 C58 39 70 56 63 82 C58 100 48 112 38 124 C39 105 41 91 48 80 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M58 78 C78 58 129 52 165 66 C184 74 190 94 180 113 C164 136 116 142 79 129 C55 120 45 95 58 78 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="neck" d="M154 69 C159 46 177 28 194 28 C207 29 212 43 205 57 C195 72 174 81 160 98 Z" fill="' + c("neck", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="head" d="M189 28 C205 15 225 19 234 36 C238 54 226 69 205 66 C187 63 179 43 189 28 Z" fill="' + c("head", c("neck", "#FFFFFF")) + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<g class="color-region" data-region-id="ears" fill="' + c("ears", c("head", "#FFFFFF")) + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"><path d="M190 30 C189 20 194 12 204 27 Z"/><path d="M206 28 C211 18 220 14 222 34 Z"/></g>',
      '<path class="color-region" data-region-id="mane" d="M157 73 C156 53 171 34 192 28 C184 45 181 65 166 94 Z" fill="' + c("mane", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_leg_far" d="M155 111 C164 124 168 142 159 166 L144 166 C151 143 147 127 139 113 Z" fill="' + c("front_leg_far", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_leg_near" d="M130 116 C129 133 134 148 143 166 L126 166 C116 148 113 132 119 115 Z" fill="' + c("front_leg_near", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg_far" d="M77 108 C75 128 66 147 54 166 L39 166 C53 145 58 126 62 106 Z" fill="' + c("back_leg_far", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg_near" d="M100 113 C112 127 115 145 106 166 L90 166 C96 145 94 130 87 115 Z" fill="' + c("back_leg_near", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<g class="color-region" data-region-id="hooves" fill="' + c("hooves", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"><path d="M38 164 L58 164 L62 174 L36 174 Z"/><path d="M88 164 L108 164 L112 174 L86 174 Z"/><path d="M124 164 L144 164 L148 174 L122 174 Z"/><path d="M142 164 L162 164 L166 174 L140 174 Z"/></g>',
      '<path class="color-region" data-region-id="muzzle" d="M216 43 C231 42 237 51 232 61 C224 69 208 64 204 54 C207 49 211 45 216 43 Z" fill="' + c("muzzle", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<circle cx="207" cy="38" r="3.6" fill="#202124"/><path d="M219 60 C212 65 202 65 195 59" fill="none" stroke="#202124" stroke-width="2.6" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgLion(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_lion", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="ライオン" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="tail" d="M48 91 C27 80 25 56 45 55 C62 57 62 77 52 93 Z" fill="' + c("tail", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="tail_tip" d="M36 52 C26 42 33 30 47 34 C58 37 59 51 48 57 C44 58 40 56 36 52 Z" fill="' + c("tail_tip", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M61 78 C82 58 130 55 162 70 C183 80 189 106 174 126 C154 148 111 149 78 132 C55 120 47 95 61 78 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="chest" d="M146 83 C160 99 159 120 141 133 C129 121 128 98 146 83 Z" fill="' + c("chest", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg" d="M83 119 C76 135 69 149 59 166 L43 166 C57 145 61 128 64 111 Z" fill="' + c("back_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_leg" d="M149 114 C157 128 158 145 150 166 L134 166 C140 145 137 129 130 114 Z" fill="' + c("front_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="paw" d="M42 164 L62 164 L66 174 L39 174 Z M132 164 L153 164 L158 174 L130 174 Z" fill="' + c("paw", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="mane" d="M154 42 C167 24 194 29 201 48 C220 52 226 75 211 89 C214 109 192 122 176 111 C158 119 139 105 142 85 C126 73 135 50 154 42 Z" fill="' + c("mane", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ears" d="M157 50 C154 37 164 31 174 43 C174 52 166 55 157 50 Z M191 45 C199 33 211 38 211 52 C202 57 194 54 191 45 Z" fill="' + c("ears", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="face" d="M161 54 C178 44 200 51 206 69 C211 86 198 101 179 101 C159 101 148 86 153 70 C154 63 157 58 161 54 Z" fill="' + c("face", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="nose" d="M186 76 C197 75 203 82 198 90 C190 96 180 91 179 82 C181 79 183 77 186 76 Z" fill="' + c("nose", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<circle cx="174" cy="68" r="3.4" fill="#202124"/><path d="M190 91 C184 96 175 96 169 90" fill="none" stroke="#202124" stroke-width="2.5" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgPanda(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_panda", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="パンダ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="ear_left" d="M75 49 C63 32 76 17 94 25 C104 36 96 50 75 49 Z" fill="' + c("ear_left", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="ear_right" d="M146 25 C164 17 177 33 164 50 C144 50 136 36 146 25 Z" fill="' + c("ear_right", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body" d="M73 99 C82 73 110 63 140 70 C168 77 181 103 173 132 C164 162 126 174 94 160 C71 150 62 123 73 99 Z" fill="' + c("body", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_legs" d="M69 135 C55 143 55 166 77 171 L105 171 C105 149 91 135 69 135 Z M169 136 C184 145 182 166 160 171 L132 171 C132 150 147 136 169 136 Z" fill="' + c("back_legs", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_legs" d="M84 98 C70 112 69 134 83 146 C94 139 98 119 94 102 Z M157 99 C171 112 172 134 158 146 C147 139 143 119 147 102 Z" fill="' + c("front_legs", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="belly" d="M96 103 C109 92 133 93 145 105 C154 122 146 148 121 151 C96 148 87 121 96 103 Z" fill="' + c("belly", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="face" d="M78 47 C92 28 149 28 162 48 C178 74 159 104 120 104 C82 104 62 74 78 47 Z" fill="' + c("face", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="eye_patch_left" d="M88 61 C94 49 111 50 114 65 C111 78 94 81 88 68 C87 66 87 63 88 61 Z" fill="' + c("eye_patch_left", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="eye_patch_right" d="M126 65 C129 50 146 49 153 61 C157 75 140 83 129 74 C126 72 125 69 126 65 Z" fill="' + c("eye_patch_right", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="nose" d="M113 77 C119 72 128 74 131 80 C127 89 116 89 111 81 C111 79 112 78 113 77 Z" fill="' + c("nose", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<circle cx="103" cy="64" r="3" fill="#202124"/><circle cx="138" cy="64" r="3" fill="#202124"/><path d="M121 88 C115 93 106 91 101 85 M121 88 C127 93 136 91 141 85" fill="none" stroke="#202124" stroke-width="2.4" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function svgGrasshopper(colors, className) {
    var colorsForTemplate = normalizeRegionColors("coloring_grasshopper", colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="0 0 240 180" role="img" aria-label="バッタ" class="' + (className || "") + '">',
      '<path class="color-region" data-region-id="antennae" d="M169 55 C191 30 211 22 230 24 M169 59 C193 45 214 44 235 54" fill="none" stroke="' + c("antennae", "#374151") + '" stroke-width="4" stroke-linecap="round"/>',
      '<path class="color-region" data-region-id="abdomen" d="M49 82 C75 57 119 55 150 79 C143 104 110 119 75 112 C55 108 43 96 49 82 Z" fill="' + c("abdomen", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="thorax" d="M135 78 C151 62 174 65 184 83 C181 103 156 111 138 97 C133 91 132 84 135 78 Z" fill="' + c("thorax", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="head" d="M178 70 C193 58 215 65 219 83 C219 99 203 109 186 103 C172 98 168 80 178 70 Z" fill="' + c("head", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="wing" d="M74 73 C101 52 136 63 152 85 C125 93 97 92 74 73 Z" fill="' + c("wing", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="back_leg" d="M83 108 C68 132 50 151 29 166 L17 153 C39 136 57 116 70 92 C82 94 91 100 83 108 Z M72 92 C94 127 114 145 142 163 L132 175 C103 158 78 134 59 102 Z" fill="' + c("back_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="4" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="middle_leg" d="M132 98 C121 118 114 135 112 155 L99 155 C101 133 109 112 123 94 Z" fill="' + c("middle_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="front_leg" d="M170 100 C164 119 164 135 171 151 L158 154 C149 135 150 116 160 98 Z" fill="' + c("front_leg", "#FFFFFF") + '" stroke="#374151" stroke-width="3.5" stroke-linejoin="round"/>',
      '<path class="color-region" data-region-id="body_segments" d="M73 86 C83 97 95 103 109 107 M98 75 C106 90 120 98 137 100 M128 76 C137 88 150 94 164 95" fill="none" stroke="' + c("body_segments", "#374151") + '" stroke-width="4" stroke-linecap="round"/>',
      '<path class="color-region" data-region-id="eye" d="M197 75 C204 72 211 77 211 84 C204 89 196 85 197 75 Z" fill="' + c("eye", "#FFFFFF") + '" stroke="#374151" stroke-width="3" stroke-linejoin="round"/>',
      '<circle cx="203" cy="80" r="2.8" fill="#202124"/>',
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
    if (templateId === "coloring_lion") return svgLion(regionColors, className);
    if (templateId === "coloring_panda") return svgPanda(regionColors, className);
    if (templateId === "coloring_grasshopper") return svgGrasshopper(regionColors, className);
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
