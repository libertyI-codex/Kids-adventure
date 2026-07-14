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

  var LAYERED_ANIMAL_SVG = {
      "coloring_rabbit_001": {
          "templateId": "coloring_rabbit_001",
          "viewBox": "0 0 240 180",
          "sourceLabel": "合格済み候補",
          "candidateVersion": 9,
          "designVersion": 9,
          "regions": [
              {
                  "id": "tail",
                  "d": "M48 121 C34 120 29 108 36 98 C45 86 64 88 69 103 C73 117 61 126 48 121 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "body",
                  "d": "M61 119 C63 92 91 72 126 75 C154 77 177 96 181 122 C185 148 159 164 118 161 C84 159 58 142 61 119 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_leg",
                  "d": "M84 124 C66 132 58 150 74 160 C94 173 127 160 139 140 C125 130 103 127 84 124 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "belly",
                  "d": "M109 114 C128 130 156 130 174 118 C173 139 148 151 120 146 C105 143 101 127 109 114 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "front_leg",
                  "d": "M149 120 C159 131 161 147 153 157 C145 158 139 155 135 151 C143 141 141 130 133 123 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "head",
                  "d": "M153 85 C158 68 174 58 193 62 C210 66 221 78 218 92 C214 106 195 113 176 106 C160 101 149 94 153 85 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "nose",
                  "d": "M212 84 C222 84 229 90 225 96 C219 101 210 97 207 90 C208 87 210 85 212 84 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "ear_left_outer",
                  "d": "M162 70 C150 39 152 12 168 7 C179 27 181 54 171 76 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "ear_left_inner",
                  "d": "M165 63 C158 39 160 22 168 16 C174 32 176 52 169 67 Z",
                  "fallback": "#F8D7E8"
              },
              {
                  "id": "ear_right_outer",
                  "d": "M181 68 C180 34 194 9 207 14 C209 43 201 66 187 77 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "ear_right_inner",
                  "d": "M187 62 C187 37 196 22 204 19 C204 41 199 58 189 67 Z",
                  "fallback": "#F8D7E8"
              },
              {
                  "id": "cheek",
                  "d": "M185 87 C195 83 204 88 205 98 C196 104 186 99 185 87 Z",
                  "fallback": "#FDE2E2"
              }
          ],
          "outer": [
              "M38 98 C47 86 64 88 70 102 C78 84 103 73 132 76 C144 77 157 82 168 91 C174 95 179 105 181 121 C185 148 159 164 118 161 C87 159 63 144 61 122 C56 125 48 125 40 121 C29 115 29 105 38 98 Z",
              "M153 85 C158 68 174 58 193 62 C210 66 221 78 218 92 C214 106 195 113 176 106 C160 101 149 94 153 85 Z",
              "M162 70 C150 39 152 12 168 7 C179 27 181 54 171 76 Z M181 68 C180 34 194 9 207 14 C209 43 201 66 187 77 Z"
          ],
          "inner": [
              {
                  "d": "M165 63 C158 39 160 22 168 16"
              },
              {
                  "d": "M187 62 C187 37 196 22 204 19"
              },
              {
                  "d": "M151 91 C144 93 137 93 130 91"
              },
              {
                  "d": "M109 114 C128 130 156 130 174 118"
              },
              {
                  "d": "M84 124 C104 127 125 130 139 140"
              },
              {
                  "d": "M149 120 C143 141 145 151 153 157"
              },
              {
                  "d": "M207 90 C213 95 220 97 225 96"
              }
          ],
          "face": "<circle cx=\"194\" cy=\"73\" r=\"2.7\" fill=\"#111827\"/><path d=\"M212 93 C207 96 201 95 197 91 M204 88 L194 86 M204 96 L195 99\" fill=\"none\" stroke=\"#111827\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
          "hitAreas": [
              "ear_left_outer",
              "ear_left_inner",
              "ear_right_outer",
              "ear_right_inner",
              "front_leg"
          ]
      },
      "coloring_dolphin_001": {
          "templateId": "coloring_dolphin_001",
          "viewBox": "0 0 240 180",
          "sourceLabel": "合格済み候補",
          "candidateVersion": 9,
          "designVersion": 9,
          "regions": [
              {
                  "id": "tail_fluke_top",
                  "d": "M51 79 C30 66 24 49 43 52 C56 55 62 66 56 79 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "tail_fluke_bottom",
                  "d": "M51 91 C28 103 29 121 49 119 C60 113 63 101 56 91 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "tail_stem",
                  "d": "M54 80 C77 78 95 82 110 90 C96 98 77 100 54 93 C60 89 60 84 54 80 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "body_top",
                  "d": "M101 88 C124 61 165 50 196 60 C212 65 222 73 236 76 C222 87 203 91 185 86 C167 102 139 116 106 112 C84 110 75 101 101 88 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "belly",
                  "d": "M102 96 C126 110 157 106 185 86 C171 111 138 124 107 112 C95 107 93 100 102 96 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "snout",
                  "d": "M196 63 C215 58 232 64 236 76 C221 82 207 80 194 72 C193 68 194 65 196 63 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "dorsal_fin",
                  "d": "M143 62 C151 40 170 38 174 67 C163 68 152 66 143 62 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "pectoral_fin",
                  "d": "M146 102 C154 126 174 127 178 101 C166 96 155 98 146 102 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "cheek",
                  "d": "M187 74 C196 72 204 77 204 86 C196 91 188 86 187 74 Z",
                  "fallback": "#DFF7FF"
              }
          ],
          "outer": [
              "M43 52 C56 55 62 66 56 79 C74 78 93 82 110 90 C134 62 169 51 196 60 C214 66 224 73 236 76 C221 88 203 91 185 86 C171 105 142 120 107 112 C91 107 78 101 56 93 C61 106 57 116 49 119 C29 121 28 103 51 91 C30 66 24 49 43 52 Z",
              "M143 62 C151 40 170 38 174 67",
              "M146 102 C154 126 174 127 178 101"
          ],
          "inner": [
              {
                  "d": "M102 96 C126 110 157 106 185 86"
              },
              {
                  "d": "M196 63 C215 58 232 64 236 76"
              },
              {
                  "d": "M54 80 C77 78 95 82 110 90"
              },
              {
                  "d": "M54 93 C77 100 96 98 110 90"
              },
              {
                  "d": "M202 78 C211 82 222 81 230 76"
              }
          ],
          "face": "<circle cx=\"195\" cy=\"67\" r=\"2.5\" fill=\"#111827\"/>",
          "hitAreas": [
              "tail_fluke_top",
              "tail_fluke_bottom",
              "tail_stem",
              "dorsal_fin",
              "pectoral_fin"
          ]
      },
      "coloring_horse_001": {
          "templateId": "coloring_horse_001",
          "viewBox": "0 0 240 180",
          "sourceLabel": "合格済み候補",
          "candidateVersion": 9,
          "designVersion": 9,
          "regions": [
              {
                  "id": "tail",
                  "d": "M55 86 C34 88 17 103 13 128 C31 122 50 103 64 88 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "body",
                  "d": "M56 84 C75 68 118 62 157 70 C181 75 193 88 187 105 C179 128 146 137 101 132 C71 129 47 108 56 84 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "neck",
                  "d": "M150 72 C157 50 174 35 190 30 C198 40 193 61 174 84 C164 84 156 80 150 72 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "head",
                  "d": "M185 29 C200 20 220 25 228 39 C227 55 213 68 193 66 C181 57 178 40 185 29 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "muzzle",
                  "d": "M207 43 C222 42 232 49 231 59 C221 65 210 62 201 55 C202 50 204 46 207 43 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "ears",
                  "d": "M183 32 C179 18 187 13 195 28 C193 34 188 36 183 32 Z M199 31 C204 16 214 17 214 33 C209 38 204 36 199 31 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "mane",
                  "d": "M154 42 C146 56 147 74 158 85 C165 69 169 50 164 35 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "front_leg_near",
                  "d": "M144 104 C153 122 154 143 149 169 L137 169 C139 147 135 127 127 108 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "front_leg_far",
                  "d": "M161 106 C170 123 173 143 168 168 L157 168 C160 145 156 127 149 109 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_leg_near",
                  "d": "M78 108 C70 124 65 145 56 169 L44 169 C49 143 57 121 68 104 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_leg_far",
                  "d": "M97 112 C111 126 116 145 110 168 L98 168 C101 148 95 132 84 116 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "hooves",
                  "d": "M42 166 L59 166 L63 172 L41 172 Z M96 166 L112 166 L115 172 L94 172 Z M135 166 L152 166 L155 172 L133 172 Z M155 165 L171 165 L174 171 L153 171 Z",
                  "fallback": "#FFFFFF"
              }
          ],
          "outer": [
              "M13 128 C31 122 50 103 64 88 C76 68 118 62 150 72 C157 50 174 35 183 32 C179 18 187 13 195 28 C204 16 214 17 214 33 C224 36 229 46 228 55 C226 67 211 70 193 66 C185 76 176 83 158 85 C178 91 190 100 187 115 C181 134 146 138 101 132 C72 129 47 108 56 84",
              "M68 104 C57 121 49 143 44 169 L56 169 C65 145 70 124 78 108 M84 116 C95 132 101 148 98 168 L110 168 C116 145 111 126 97 112 M127 108 C135 127 139 147 137 169 L149 169 C154 143 153 122 144 104 M149 109 C156 127 160 145 157 168 L168 168 C173 143 170 123 161 106",
              "M183 32 C179 18 187 13 195 28 M199 31 C204 16 214 17 214 33"
          ],
          "inner": [
              {
                  "d": "M150 72 C158 79 163 83 158 85"
              },
              {
                  "d": "M154 42 C146 56 147 74 158 85"
              },
              {
                  "d": "M201 55 C210 62 221 65 231 59"
              },
              {
                  "d": "M56 84 C79 95 122 98 158 85"
              },
              {
                  "d": "M78 108 C73 124 75 136 82 146"
              },
              {
                  "d": "M144 104 C137 123 138 148 149 169"
              },
              {
                  "d": "M55 86 C42 96 32 112 18 125"
              }
          ],
          "face": "<circle cx=\"202\" cy=\"43\" r=\"2.5\" fill=\"#111827\"/><path d=\"M215 59 C211 61 207 61 203 59\" fill=\"none\" stroke=\"#111827\" stroke-width=\"1.7\" stroke-linecap=\"round\"/>",
          "hitAreas": [
              "tail",
              "front_leg_near",
              "front_leg_far",
              "back_leg_near",
              "back_leg_far",
              "hooves"
          ]
      },
      "coloring_dinosaur_001": {
          "templateId": "coloring_dinosaur_001",
          "viewBox": "0 0 240 180",
          "sourceLabel": "D案",
          "candidateVersion": 9,
          "designVersion": 9,
          "regions": [
              {
                  "id": "tail",
                  "d": "M82 94 C55 84 25 86 4 99 C30 108 58 108 87 101 C88 98 86 96 82 94 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "body",
                  "d": "M84 82 C108 69 145 70 169 82 C188 92 191 111 178 126 C158 144 122 141 94 122 C80 112 74 93 84 82 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "belly",
                  "d": "M98 106 C121 119 151 119 174 105 C170 123 148 134 120 130 C104 128 96 118 98 106 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "neck",
                  "d": "M163 80 C172 67 190 62 206 67 C201 81 185 92 169 96 C164 92 161 86 163 80 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "head",
                  "d": "M200 60 C217 52 234 57 239 70 C231 82 210 83 194 76 C190 70 193 64 200 60 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "jaw",
                  "d": "M193 74 C207 80 226 78 238 70 C237 83 219 91 199 86 C191 83 187 78 193 74 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "arm",
                  "d": "M164 98 C173 100 179 105 180 112 C173 116 164 114 158 109 C158 104 160 100 164 98 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_leg",
                  "d": "M108 119 C98 132 94 149 101 168 L86 168 C79 148 84 130 96 116 Z M146 118 C158 130 161 148 153 168 L137 168 C145 149 139 134 130 124 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "foot",
                  "d": "M83 165 C96 163 107 165 115 171 L106 177 L80 177 Z M134 165 C148 163 160 165 169 171 L160 177 L132 177 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_spines",
                  "d": "M104 74 C112 69 119 71 122 79 C113 77 108 76 104 74 Z",
                  "fallback": "#DDF7D4"
              },
              {
                  "id": "cheek",
                  "d": "M208 67 C216 65 223 69 224 75 C216 79 208 76 208 67 Z",
                  "fallback": "#FDE2E2"
              },
              {
                  "id": "body_mark",
                  "d": "M119 85 C128 83 136 86 142 91 C134 95 125 94 119 85 Z",
                  "fallback": "#DDF7D4"
              }
          ],
          "outer": [
              "M4 99 C30 108 58 108 87 101 C104 70 145 70 169 82 C174 68 190 62 206 67 C217 52 234 57 239 70 C231 82 210 83 194 76 C190 94 187 116 178 126 C158 144 122 141 94 122 C80 112 74 93 84 82",
              "M96 116 C84 130 79 148 86 168 M108 119 C98 132 94 149 101 168 M130 124 C139 134 145 149 137 168 M146 118 C158 130 161 148 153 168",
              "M104 74 C112 71 118 72 122 79"
          ],
          "inner": [
              {
                  "d": "M98 106 C121 119 151 119 174 105"
              },
              {
                  "d": "M163 80 C168 89 171 94 169 96"
              },
              {
                  "d": "M193 74 C207 80 226 78 238 70"
              },
              {
                  "d": "M164 98 C173 100 179 105 180 112"
              },
              {
                  "d": "M104 135 C110 148 109 160 101 168"
              },
              {
                  "d": "M148 132 C154 145 154 157 147 168"
              }
          ],
          "face": "<circle cx=\"211\" cy=\"64\" r=\"2.5\" fill=\"#111827\"/><path d=\"M206 79 C216 83 228 79 235 72\" fill=\"none\" stroke=\"#111827\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
          "hitAreas": [
              "arm",
              "foot",
              "back_spines"
          ]
      },
      "coloring_lion": {
          "templateId": "coloring_lion",
          "viewBox": "0 0 240 180",
          "sourceLabel": "A改",
          "candidateVersion": 9,
          "designVersion": 2,
          "regions": [
              {
                  "id": "tail",
                  "d": "M55 91 C35 84 25 64 36 53 C49 56 55 75 66 94 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "tail_tip",
                  "d": "M31 50 C22 39 31 27 45 31 C56 36 54 51 42 57 C37 57 33 54 31 50 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "body",
                  "d": "M59 88 C80 71 120 66 154 74 C176 80 188 96 184 114 C177 138 142 149 100 138 C70 131 50 110 59 88 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "chest",
                  "d": "M143 80 C153 96 154 118 143 133 C131 120 130 98 143 80 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "back_leg",
                  "d": "M81 117 C73 135 68 151 59 167 L45 167 C53 144 59 126 65 111 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "front_leg",
                  "d": "M149 112 C158 128 160 146 153 167 L140 167 C144 145 140 129 132 115 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "paw",
                  "d": "M43 165 L63 165 L67 172 L42 172 Z M137 165 L156 165 L160 172 L135 172 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "mane",
                  "d": "M143 58 C149 42 164 35 176 40 C188 31 204 37 208 53 C222 61 222 78 211 87 C211 104 193 116 177 110 C161 119 142 108 144 90 C130 82 130 64 143 58 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "face",
                  "d": "M160 59 C176 49 197 54 204 70 C209 86 196 100 178 99 C160 98 151 85 154 70 C155 65 157 61 160 59 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "ears",
                  "d": "M153 58 C150 45 160 39 171 49 C170 57 162 61 153 58 Z M190 50 C198 39 210 44 209 58 C201 62 192 59 190 50 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "nose",
                  "d": "M184 76 C194 75 200 82 196 89 C189 94 181 91 179 83 C180 80 182 77 184 76 Z",
                  "fallback": "#FFFFFF"
              }
          ],
          "outer": [
              "M31 50 C22 39 31 27 45 31 C56 36 54 51 42 57 C49 67 56 80 66 94 C80 71 120 66 143 74 C133 64 132 52 143 58 C149 42 164 35 176 40 C188 31 204 37 208 53 C222 61 222 78 211 87 C211 104 193 116 177 110 C185 120 190 131 184 140 C169 155 129 149 100 138 C70 131 50 110 59 88",
              "M65 111 C59 126 53 144 45 167 L59 167 C68 151 73 135 81 117 M132 115 C140 129 144 145 140 167 L153 167 C160 146 158 128 149 112",
              "M153 58 C150 45 160 39 171 49 M190 50 C198 39 210 44 209 58"
          ],
          "inner": [
              {
                  "d": "M143 80 C153 96 154 118 143 133"
              },
              {
                  "d": "M160 59 C176 49 197 54 204 70"
              },
              {
                  "d": "M143 58 C151 70 151 83 144 90"
              },
              {
                  "d": "M177 110 C169 102 166 90 168 79"
              },
              {
                  "d": "M55 91 C45 84 39 67 36 53"
              },
              {
                  "d": "M81 117 C77 133 70 152 59 167"
              },
              {
                  "d": "M149 112 C143 128 145 147 153 167"
              }
          ],
          "face": "<circle cx=\"174\" cy=\"68\" r=\"2.5\" fill=\"#111827\"/><path d=\"M184 76 C194 75 200 82 196 89 C189 94 181 91 179 83 Z\" fill=\"#111827\"/><path d=\"M187 91 C182 96 174 96 169 90\" fill=\"none\" stroke=\"#111827\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
          "hitAreas": [
              "tail",
              "tail_tip",
              "front_leg",
              "back_leg"
          ]
      },
      "coloring_grasshopper": {
          "templateId": "coloring_grasshopper",
          "viewBox": "0 0 240 180",
          "sourceLabel": "C改",
          "candidateVersion": 9,
          "designVersion": 2,
          "regions": [
              {
                  "id": "abdomen",
                  "d": "M54 91 C80 71 118 70 148 86 C139 107 108 119 77 112 C58 108 48 100 54 91 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "thorax",
                  "d": "M141 84 C156 72 176 76 184 93 C179 109 157 114 141 101 C136 94 136 88 141 84 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "head",
                  "d": "M180 75 C194 66 211 75 214 90 C211 104 196 111 183 105 C171 99 170 84 180 75 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "wing",
                  "d": "M78 84 C109 70 139 75 157 94 C129 101 101 97 78 84 Z",
                  "fallback": "#EAFBE6"
              },
              {
                  "id": "back_leg",
                  "d": "M86 100 C77 84 72 65 78 51 C88 50 95 60 95 75 C94 88 93 99 90 108 Z M78 52 C61 75 53 101 50 126 L59 131 C66 105 80 80 95 65 Z M84 108 C104 130 127 143 154 151 L149 162 C120 154 91 134 70 112 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "middle_leg",
                  "d": "M130 101 C121 118 118 136 120 154 L111 154 C108 132 114 113 124 98 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "front_leg",
                  "d": "M169 103 C164 117 168 130 179 140 L171 146 C157 137 154 119 162 101 Z",
                  "fallback": "#FFFFFF"
              },
              {
                  "id": "antennae",
                  "d": "M170 59 C191 44 212 38 232 41 L233 47 C213 44 192 51 172 65 Z M171 66 C193 60 214 64 232 76 L228 82 C210 72 191 68 173 72 Z",
                  "fallback": "#A3E635"
              },
              {
                  "id": "body_segments",
                  "d": "M78 92 C89 101 101 106 115 109 L110 114 C95 111 83 104 73 96 Z M105 83 C113 96 127 103 142 104 L138 109 C122 108 108 99 101 87 Z M130 84 C139 96 151 102 164 103 L160 108 C146 108 134 100 126 88 Z",
                  "fallback": "#BBF7D0"
              },
              {
                  "id": "eye",
                  "d": "M196 82 C202 79 208 84 207 90 C201 94 195 90 196 82 Z",
                  "fallback": "#FFFFFF"
              }
          ],
          "outer": [
              "M232 41 C213 44 192 51 172 65 M232 76 C210 72 191 68 173 72",
              "M54 91 C80 71 118 70 148 86 C156 72 176 76 184 93 C183 85 177 77 173 72 C194 66 211 75 214 90 C211 104 196 111 183 105 C172 114 156 114 141 101 C130 113 109 119 91 116 C111 134 134 145 154 151 L149 162 C120 154 91 134 70 112 C65 120 62 127 59 131 L50 126 C53 101 61 75 78 52 C78 48 86 47 92 52 C97 59 96 70 95 75 C94 88 93 99 90 108 C73 113 56 108 54 91 Z",
              "M78 84 C109 70 139 75 157 94"
          ],
          "inner": [
              {
                  "d": "M78 84 C109 70 139 75 157 94"
              },
              {
                  "d": "M78 92 C89 101 101 106 115 109"
              },
              {
                  "d": "M105 83 C113 96 127 103 142 104"
              },
              {
                  "d": "M130 84 C139 96 151 102 164 103"
              },
              {
                  "d": "M130 101 C121 118 118 136 120 154"
              },
              {
                  "d": "M169 103 C164 117 168 130 179 140"
              },
              {
                  "d": "M78 52 C61 75 53 101 50 126"
              },
              {
                  "d": "M86 100 C77 84 72 65 78 51"
              },
              {
                  "d": "M84 108 C104 130 127 143 154 151"
              }
          ],
          "face": "<path d=\"M196 82 C202 79 208 84 207 90 C201 94 195 90 196 82 Z\" fill=\"#ffffff\"/><circle cx=\"201\" cy=\"86\" r=\"2.1\" fill=\"#111827\"/>",
          "hitAreas": [
              "front_leg",
              "middle_leg",
              "back_leg",
              "antennae"
          ]
      }
  };

  function escapeSvgAttr(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function layeredDefinition(templateId) {
    return LAYERED_ANIMAL_SVG[templateId] || null;
  }

  function getLayeredDefinition(templateId) {
    var definition = layeredDefinition(templateId);
    return definition ? JSON.parse(JSON.stringify(definition)) : null;
  }

  function renderLayeredRegion(region, fill) {
    return '<path class="color-region" data-region-id="' + escapeSvgAttr(region.id) + '" tabindex="0" d="' + escapeSvgAttr(region.d) + '" fill="' + escapeSvgAttr(fill) + '"/>';
  }

  function renderHitAreas(definition) {
    var ids = definition.hitAreas || [];
    if (!ids.length) return "";
    return definition.regions.filter(function (region) {
      return ids.indexOf(region.id) >= 0;
    }).map(function (region) {
      return '<path class="hit-area" data-region-id="' + escapeSvgAttr(region.id) + '" d="' + escapeSvgAttr(region.d) + '" fill="none" stroke="transparent" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" pointer-events="stroke" tabindex="-1"/>';
    }).join("");
  }

  function svgLayeredAnimal(templateId, label, colors, className) {
    var definition = layeredDefinition(templateId);
    if (!definition) return "";
    var colorsForTemplate = normalizeRegionColors(templateId, colors);
    var c = function (id, fallback) { return colorFor(colorsForTemplate, id, fallback); };
    return [
      '<svg viewBox="' + escapeSvgAttr(definition.viewBox) + '" role="img" aria-label="' + escapeSvgAttr(label) + '" class="' + escapeSvgAttr(className || "") + '">',
      '<g class="color-regions">',
      definition.regions.map(function (region) {
        return renderLayeredRegion(region, c(region.id, region.fallback || "#FFFFFF"));
      }).join(""),
      '</g>',
      '<g class="hit-areas" aria-hidden="true">',
      renderHitAreas(definition),
      '</g>',
      '<g class="outer-outline" fill="none" stroke="#1F2937" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pointer-events="none">',
      definition.outer.map(function (d) { return '<path d="' + escapeSvgAttr(d) + '"/>'; }).join(""),
      '</g>',
      '<g class="inner-lines" fill="none" stroke="#2F3A42" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pointer-events="none">',
      definition.inner.map(function (item) { return '<path d="' + escapeSvgAttr(item.d || item) + '"/>'; }).join(""),
      '</g>',
      '<g class="face-details" pointer-events="none">',
      definition.face || "",
      '</g>',
      '</svg>'
    ].join("");
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
    return svgLayeredAnimal("coloring_rabbit_001", "うさぎ", colors, className);
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
    return svgLayeredAnimal("coloring_dolphin_001", "イルカ", colors, className);
  }

  function svgDinosaur(colors, className) {
    return svgLayeredAnimal("coloring_dinosaur_001", "きょうりゅう", colors, className);
  }

  function svgHorse(colors, className) {
    return svgLayeredAnimal("coloring_horse_001", "うま", colors, className);
  }

  function svgLion(colors, className) {
    return svgLayeredAnimal("coloring_lion", "ライオン", colors, className);
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
    return svgLayeredAnimal("coloring_grasshopper", "バッタ", colors, className);
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
    var eggGrowth = KA.eggs && KA.eggs.recordColoringBonus ? KA.eggs.recordColoringBonus() : null;
    clearDraft(templateId);
    KA.state.saveAppData();
    return { ok: true, artwork: artwork, placement: placement, eggGrowth: eggGrowth };
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
    getLayeredDefinition: getLayeredDefinition,
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
