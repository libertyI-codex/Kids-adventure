(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function design(config) {
    config.renderer = config.renderer || "generic";
    config.transparentOuterBox = true;
    config.outlineWidth = config.outlineWidth || 2.8;
    config.innerWidth = config.innerWidth || 2;
    return config;
  }

  KA.companionArtV33 = {
    version: 1,
    targetIds: [
      "companion_chick",
      "companion_peacock",
      "companion_sparrow",
      "companion_shimaenaga",
      "companion_java_sparrow",
      "companion_ice_legend_bird",
      "companion_thunder_legend_bird",
      "companion_fire_legend_bird",
      "companion_phoenix"
    ],
    species: {
      companion_chick: design({
        designVersion: 4,
        viewBox: "0 0 200 180",
        outlineStroke: "#8A6223",
        innerStroke: "#A36D22",
        defaultColors: { body: "#FFD84D", wing: "#FFF0A3", beak: "#F28B35", leg: "#D98B32" },
        outer: [
          "M96 34 C74 28 53 42 49 65 C34 78 31 105 42 125 C54 148 81 157 106 151 C133 158 161 142 166 117 C170 94 159 75 145 66 C141 43 119 30 96 34 Z",
          "M91 34 C84 25 85 16 92 10 C96 18 101 23 106 27 C110 18 118 14 126 17 C120 24 118 31 121 38 Z",
          "M100 72 L109 78 L100 84 L91 78 Z",
          "M70 145 C66 156 60 162 51 165 L74 165 M119 149 C123 159 131 164 140 165 L116 165"
        ],
        regions: [
          { id: "body", d: "M56 72 C72 56 109 53 137 67 C158 78 166 101 157 123 C147 146 117 154 91 148 C65 151 43 135 40 112 C38 95 44 81 56 72 Z", fill: "#FFD84D" },
          { id: "head", d: "M68 44 C84 29 113 29 132 42 C149 54 149 77 134 91 C117 106 83 103 65 87 C50 73 53 57 68 44 Z", fill: "#FFE77A" },
          { id: "belly", d: "M78 97 C92 88 119 91 131 106 C139 122 127 141 104 143 C80 141 68 119 78 97 Z", fill: "#FFF1AF" },
          { id: "left_wing", d: "M59 87 C44 91 35 105 39 119 C52 123 65 114 71 97 Z", fill: "#FFC93B" },
          { id: "right_wing", d: "M137 86 C153 90 162 103 159 118 C146 124 133 114 127 97 Z", fill: "#FFC93B" },
          { id: "crest", d: "M91 35 C86 26 87 18 92 13 C96 21 101 26 106 30 C111 21 117 18 122 20 C117 27 116 33 119 39 Z", fill: "#F5B82E" },
          { id: "beak", d: "M100 72 L109 78 L100 84 L91 78 Z", fill: "#F28B35" },
          { id: "feet", d: "M70 145 C67 155 61 162 52 164 M69 157 L77 164 M119 149 C123 158 131 163 140 164 M128 157 L119 165", fill: "none" }
        ],
        inner: [
          "M57 91 C64 88 69 91 72 97",
          "M137 91 C131 88 127 92 125 98",
          "M79 106 C90 113 118 114 130 106",
          "M84 49 C91 44 98 44 104 48"
        ],
        face: '<circle cx="82" cy="65" r="4" fill="#493B2B"/><circle cx="119" cy="65" r="4" fill="#493B2B"/><circle cx="83" cy="64" r="1.2" fill="#fff"/><circle cx="120" cy="64" r="1.2" fill="#fff"/><path d="M91 88 C99 93 108 93 116 88" fill="none" stroke="#8A6223" stroke-width="2.2" stroke-linecap="round"/>'
      }),

      companion_peacock: design({
        renderer: "peacock-split",
        designVersion: 6,
        viewBox: "0 0 240 205",
        outlineStroke: "#236C67",
        innerStroke: "#2F7F75",
        defaultColors: { body: "#2476C9", neck: "#31B9CB", tail: "#55B978", eye: "#F3CC57", leg: "#9A7440" },
        peacockTailTransform: "translate(0 0) scale(1)",
        peacockBodyTransform: "translate(78 82) scale(0.35)",
        peacockTailRegionIds: ["tail", "tail_fan_inner", "tail_eyes"],
        peacockBodyOuterIndexes: [1, 2, 3],
        peacockTailInnerCount: 5,
        outer: [
          "M16 142 C12 91 35 42 72 24 C91 15 108 22 120 38 C132 22 149 15 168 24 C205 42 228 91 224 142 C194 121 165 119 143 137 C134 145 127 154 120 164 C113 154 106 145 97 137 C75 119 46 121 16 142 Z",
          "M95 70 C100 45 126 36 144 51 C160 65 157 91 142 104 C154 132 145 164 121 171 C96 177 74 154 79 126 C82 109 89 98 97 92 C92 84 92 77 95 70 Z",
          "M107 46 C103 34 106 25 113 18 L120 38 L128 17 C136 24 137 34 132 47 Z",
          "M103 168 C99 180 91 187 81 190 L111 190 M137 168 C142 180 150 187 160 190 L130 190"
        ],
        regions: [
          { id: "tail", d: "M19 139 C17 92 38 48 73 29 C92 19 108 27 120 45 C132 27 148 19 167 29 C202 48 223 92 221 139 C190 119 159 120 139 140 C131 148 125 156 120 165 C114 156 109 148 101 140 C81 120 50 119 19 139 Z", fill: "#55B978" },
          { id: "tail_fan_inner", d: "M46 121 C46 78 72 43 99 45 C113 47 119 59 120 75 C121 59 127 47 141 45 C168 43 194 78 194 121 C167 111 143 120 120 151 C97 120 73 111 46 121 Z", fill: "#79D28C" },
          { id: "body", d: "M91 99 C106 82 134 87 144 111 C155 138 140 164 119 169 C94 171 77 145 82 120 C84 110 87 103 91 99 Z", fill: "#2476C9" },
          { id: "neck", d: "M100 66 C108 45 132 43 144 59 C157 77 143 102 123 105 C102 107 91 87 100 66 Z", fill: "#31B9CB" },
          { id: "crest", d: "M108 48 C104 36 107 27 113 22 L120 42 L128 21 C134 28 135 37 131 49 Z", fill: "#F3CC57" },
          { id: "tail_eyes", d: "M39 100 C47 84 65 84 73 100 C65 116 47 116 39 100 Z M73 56 C83 39 102 41 108 59 C98 74 81 72 73 56 Z M132 59 C138 41 157 39 167 56 C159 72 142 74 132 59 Z M167 100 C175 84 193 84 201 100 C193 116 175 116 167 100 Z", fill: "#F3CC57" },
          { id: "beak", d: "M143 67 L162 73 L144 80 Z", fill: "#F1B94A" },
          { id: "feet", d: "M103 167 C100 179 92 186 82 189 M112 181 L102 190 M137 167 C141 179 149 186 159 189 M128 181 L138 190", fill: "none" }
        ],
        inner: [
          "M120 46 L120 151",
          "M74 31 C91 72 104 111 117 148",
          "M166 31 C149 72 136 111 123 148",
          "M28 126 C64 124 93 134 116 153",
          "M212 126 C176 124 147 134 124 153",
          "M91 113 C106 123 130 123 144 112"
        ],
        face: '<circle cx="126" cy="68" r="4" fill="#173F47"/><circle cx="127" cy="67" r="1.2" fill="#fff"/><path d="M143 73 L157 75" fill="none" stroke="#9A6826" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_sparrow: design({
        designVersion: 4,
        viewBox: "0 0 210 165",
        outlineStroke: "#69513E",
        innerStroke: "#80634D",
        defaultColors: { body: "#B7855E", wing: "#8F674E", belly: "#E7C8A5", beak: "#D79A4B", leg: "#946A44" },
        outer: [
          "M53 64 C62 35 93 21 121 34 C139 42 151 56 154 72 C177 78 192 93 191 112 C189 138 156 151 120 147 C84 151 50 139 41 116 C33 95 38 77 53 64 Z",
          "M60 62 L38 68 L60 74 Z",
          "M174 92 L205 78 L192 109 Z",
          "M92 145 C88 154 80 159 70 160 L98 160 M130 146 C136 154 144 158 154 159 L125 160"
        ],
        regions: [
          { id: "body", d: "M60 70 C79 52 116 53 143 70 C170 75 190 92 187 113 C184 136 153 146 119 142 C85 147 53 136 45 116 C37 98 44 81 60 70 Z", fill: "#B7855E" },
          { id: "head", d: "M58 61 C69 34 99 24 124 36 C143 45 152 64 145 81 C134 95 103 96 80 86 C65 80 58 71 58 61 Z", fill: "#9C6C4D" },
          { id: "belly", d: "M84 89 C111 80 151 91 166 112 C150 135 111 143 78 130 C65 119 68 100 84 89 Z", fill: "#E7C8A5" },
          { id: "wing", d: "M103 75 C128 68 157 82 166 105 C148 119 116 114 102 91 Z", fill: "#8F674E" },
          { id: "tail", d: "M173 91 L204 80 L190 108 Z", fill: "#7A5947" },
          { id: "beak", d: "M60 62 L39 68 L60 73 Z", fill: "#D79A4B" },
          { id: "feet", d: "M92 142 C89 152 81 158 71 159 M130 143 C135 152 144 157 153 159", fill: "none" }
        ],
        inner: [
          "M105 77 C124 85 143 96 161 106",
          "M115 87 C128 94 142 102 153 110",
          "M68 58 C82 52 96 52 108 57",
          "M80 130 C105 139 139 136 161 120"
        ],
        face: '<path d="M63 65 C69 58 78 56 85 61 C80 69 70 71 63 65 Z" fill="#F2D6BB"/><circle cx="83" cy="59" r="3.8" fill="#2E3030"/><circle cx="84" cy="58" r="1.1" fill="#fff"/>'
      }),

      companion_shimaenaga: design({
        designVersion: 3,
        viewBox: "0 0 210 185",
        outlineStroke: "#718091",
        innerStroke: "#8E9BAA",
        defaultColors: { body: "#FFFDF8", wing: "#D9E0E8", tail: "#AAB5C3", beak: "#6C6670", leg: "#8E6F6A" },
        outer: [
          "M50 75 C50 40 78 18 106 28 C134 18 162 40 162 75 C180 89 184 118 168 137 C152 156 124 158 106 146 C88 158 60 156 44 137 C28 118 32 89 50 75 Z",
          "M85 143 C78 159 70 173 59 183 C78 178 94 166 105 150 Z",
          "M127 143 C134 159 142 173 153 183 C134 178 118 166 107 150 Z",
          "M106 82 L114 87 L106 92 L98 87 Z",
          "M83 151 C79 162 72 168 63 171 M129 151 C133 162 140 168 149 171"
        ],
        regions: [
          { id: "body", d: "M52 73 C52 44 77 25 106 32 C135 25 160 44 160 73 C180 90 178 120 160 138 C145 153 121 153 106 143 C91 153 67 153 52 138 C34 120 32 90 52 73 Z", fill: "#FFFDF8" },
          { id: "left_wing", d: "M50 92 C35 100 35 122 49 134 C61 126 66 108 61 96 Z", fill: "#D9E0E8" },
          { id: "right_wing", d: "M162 92 C177 100 177 122 163 134 C151 126 146 108 151 96 Z", fill: "#D9E0E8" },
          { id: "tail", d: "M85 142 C78 157 71 170 61 180 C79 175 95 163 105 148 C116 163 133 175 151 180 C141 170 134 157 127 142 Z", fill: "#AAB5C3" },
          { id: "face_cap", d: "M60 61 C70 37 91 32 106 44 C121 32 142 37 152 61 C138 54 121 57 106 68 C91 57 74 54 60 61 Z", fill: "#E6EAF0" },
          { id: "beak", d: "M106 82 L114 87 L106 92 L98 87 Z", fill: "#6C6670" },
          { id: "feet", d: "M83 149 C80 160 73 167 64 170 M129 149 C132 160 139 167 148 170", fill: "none" }
        ],
        inner: [
          "M54 97 C61 94 65 99 64 106",
          "M158 97 C151 94 147 99 148 106",
          "M83 143 C91 149 99 150 106 145 C113 150 121 149 129 143"
        ],
        face: '<circle cx="82" cy="78" r="4" fill="#2D3740"/><circle cx="130" cy="78" r="4" fill="#2D3740"/><circle cx="83" cy="77" r="1.2" fill="#fff"/><circle cx="131" cy="77" r="1.2" fill="#fff"/><ellipse cx="70" cy="91" rx="8" ry="4" fill="#F3B9C5" opacity=".75"/><ellipse cx="142" cy="91" rx="8" ry="4" fill="#F3B9C5" opacity=".75"/><path d="M98 97 C103 101 109 101 114 97" fill="none" stroke="#77727A" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_java_sparrow: design({
        designVersion: 3,
        viewBox: "0 0 205 170",
        outlineStroke: "#655E61",
        innerStroke: "#807477",
        defaultColors: { body: "#D7D1CF", head: "#55565D", wing: "#A89EA0", tail: "#6E686C", beak: "#EF8FA1", leg: "#B6787F" },
        outer: [
          "M57 62 C66 34 96 22 124 34 C143 42 154 57 156 74 C178 81 191 97 188 116 C184 141 153 151 120 147 C84 151 51 138 43 115 C36 94 42 75 57 62 Z",
          "M61 62 L39 68 L61 74 Z",
          "M172 94 L202 84 L188 112 Z",
          "M91 145 C87 155 79 160 69 161 L97 161 M129 145 C134 154 143 159 153 160 L124 161"
        ],
        regions: [
          { id: "body", d: "M60 69 C80 52 118 53 146 71 C171 79 188 96 184 116 C179 137 151 146 119 142 C87 147 56 136 48 115 C41 97 46 80 60 69 Z", fill: "#D7D1CF" },
          { id: "head", d: "M60 61 C70 35 99 26 124 37 C145 47 155 66 147 83 C134 96 103 97 80 87 C66 81 59 71 60 61 Z", fill: "#55565D" },
          { id: "cheek", d: "M65 57 C74 45 90 46 97 59 C100 72 89 83 77 80 C65 77 59 67 65 57 Z", fill: "#FFF8F1" },
          { id: "belly", d: "M85 89 C111 81 150 91 164 112 C148 135 111 142 79 130 C66 119 69 101 85 89 Z", fill: "#F4EDEA" },
          { id: "wing", d: "M103 76 C127 70 155 84 163 106 C146 120 116 115 102 92 Z", fill: "#A89EA0" },
          { id: "tail", d: "M171 94 L201 85 L187 111 Z", fill: "#6E686C" },
          { id: "beak", d: "M61 62 L40 68 L61 73 Z", fill: "#EF8FA1" },
          { id: "feet", d: "M91 142 C88 153 80 159 70 160 M129 142 C134 153 143 158 152 160", fill: "none" }
        ],
        inner: [
          "M105 78 C124 86 143 97 159 107",
          "M114 89 C129 96 142 104 153 111",
          "M80 130 C104 139 138 136 159 120"
        ],
        face: '<circle cx="85" cy="58" r="4" fill="#24282C"/><circle cx="86" cy="57" r="1.2" fill="#fff"/><ellipse cx="70" cy="72" rx="7" ry="4" fill="#F1B7BE" opacity=".65"/>'
      }),

      companion_ice_legend_bird: design({
        designVersion: 3,
        viewBox: "0 0 250 200",
        outlineStroke: "#4E89A8",
        innerStroke: "#69A9C7",
        defaultColors: { body: "#9DDFF3", wing: "#DDF7FF", chest: "#FFFFFF", tail: "#77C6E7", beak: "#8BA9BD", leg: "#6598AF" },
        outer: [
          "M108 76 C82 53 49 30 8 23 L31 53 L5 66 L43 88 L14 106 L55 120 L31 139 C68 141 94 119 111 96 Z",
          "M142 76 C168 53 201 30 242 23 L219 53 L245 66 L207 88 L236 106 L195 120 L219 139 C182 141 156 119 139 96 Z",
          "M101 46 C113 28 139 28 151 46 C166 68 161 108 146 137 C137 154 113 154 104 137 C89 108 86 68 101 46 Z",
          "M106 42 L114 15 L125 37 L139 10 L145 46 Z",
          "M102 132 L82 184 L116 159 L125 196 L135 159 L168 184 L148 132 Z",
          "M145 58 L166 67 L146 77 Z"
        ],
        regions: [
          { id: "left_wing", d: "M107 77 C82 56 51 35 15 28 L36 53 L12 65 L47 86 L22 102 L58 115 L39 132 C70 133 94 116 109 93 Z", fill: "#DDF7FF" },
          { id: "right_wing", d: "M143 77 C168 56 199 35 235 28 L214 53 L238 65 L203 86 L228 102 L192 115 L211 132 C180 133 156 116 141 93 Z", fill: "#DDF7FF" },
          { id: "body", d: "M104 49 C116 32 138 32 149 49 C163 70 157 108 143 135 C134 151 116 151 107 135 C93 108 90 70 104 49 Z", fill: "#9DDFF3" },
          { id: "chest", d: "M108 78 C115 67 135 67 142 79 C151 96 143 127 125 137 C107 127 99 96 108 78 Z", fill: "#FFFFFF" },
          { id: "crest", d: "M107 44 L114 18 L125 39 L138 14 L143 47 Z", fill: "#BDEBFA" },
          { id: "tail", d: "M105 131 L86 179 L116 156 L125 191 L135 156 L164 179 L146 131 Z", fill: "#77C6E7" },
          { id: "beak", d: "M145 59 L163 67 L146 75 Z", fill: "#8BA9BD" },
          { id: "feet", d: "M112 143 L108 158 M138 143 L142 158", fill: "none" }
        ],
        inner: [
          "M24 52 C53 58 82 73 105 88",
          "M226 52 C197 58 168 73 145 88",
          "M37 86 C63 91 86 98 107 92",
          "M213 86 C187 91 164 98 143 92",
          "M109 93 L125 107 L141 93"
        ],
        face: '<circle cx="128" cy="56" r="4" fill="#315F78"/><circle cx="129" cy="55" r="1.2" fill="#fff"/><path d="M111 69 C119 75 131 75 139 69" fill="none" stroke="#4E89A8" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_thunder_legend_bird: design({
        designVersion: 4,
        viewBox: "0 0 250 200",
        outlineStroke: "#5C5426",
        innerStroke: "#776B2D",
        defaultColors: { body: "#FFD62E", wing: "#FFE869", chest: "#FFF7CE", tail: "#F4B924", beak: "#F28B31", leg: "#9B7441" },
        outer: [
          "M108 80 L76 62 L84 45 L52 48 L58 28 L17 42 L31 63 L4 78 L44 92 L21 113 L67 111 L52 137 L111 101 Z",
          "M142 80 L174 62 L166 45 L198 48 L192 28 L233 42 L219 63 L246 78 L206 92 L229 113 L183 111 L198 137 L139 101 Z",
          "M102 47 C115 30 139 30 151 49 C165 71 159 111 144 140 C135 156 115 156 106 140 C91 111 88 70 102 47 Z",
          "M107 44 L101 22 L115 29 L124 7 L132 29 L147 19 L141 47 Z",
          "M104 136 L78 181 L113 162 L125 195 L137 162 L171 181 L146 136 Z",
          "M150 60 L171 69 L151 79 Z"
        ],
        regions: [
          { id: "left_wing", d: "M107 81 L78 65 L86 49 L56 52 L63 34 L23 45 L37 63 L12 77 L48 90 L28 108 L70 106 L59 129 L109 98 Z", fill: "#FFE869" },
          { id: "right_wing", d: "M143 81 L172 65 L164 49 L194 52 L187 34 L227 45 L213 63 L238 77 L202 90 L222 108 L180 106 L191 129 L141 98 Z", fill: "#FFE869" },
          { id: "wing_bands", d: "M32 50 L63 62 L51 76 L88 88 L72 104 L108 94 L109 82 L73 70 L87 53 Z M218 50 L187 62 L199 76 L162 88 L178 104 L142 94 L141 82 L177 70 L163 53 Z", fill: "#454335" },
          { id: "body", d: "M105 50 C117 34 137 34 148 51 C161 72 155 110 141 138 C132 153 118 153 109 138 C95 110 92 72 105 50 Z", fill: "#FFD62E" },
          { id: "chest_cloud", d: "M108 78 C112 68 124 66 130 73 C137 66 149 73 147 84 C156 91 151 104 140 104 C135 117 116 117 111 104 C99 103 98 87 108 78 Z", fill: "#FFF7CE" },
          { id: "crest", d: "M109 43 L104 24 L116 31 L124 12 L132 31 L145 22 L139 46 Z", fill: "#F4B924" },
          { id: "tail", d: "M106 135 L83 176 L114 158 L125 190 L137 158 L167 176 L144 135 Z", fill: "#F4B924" },
          { id: "beak", d: "M149 61 L168 69 L150 77 Z", fill: "#F28B31" },
          { id: "feet", d: "M112 145 L108 160 M138 145 L142 160", fill: "none" }
        ],
        inner: [
          "M27 61 L61 76 L47 91 L78 100",
          "M223 61 L189 76 L203 91 L172 100",
          "M77 55 L103 76 L92 91",
          "M173 55 L147 76 L158 91",
          "M109 108 L125 120 L141 108"
        ],
        face: '<circle cx="128" cy="55" r="4" fill="#3E3B2A"/><circle cx="129" cy="54" r="1.2" fill="#fff"/><path d="M111 67 C119 73 132 73 140 67" fill="none" stroke="#776B2D" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_fire_legend_bird: design({
        designVersion: 3,
        viewBox: "0 0 250 205",
        outlineStroke: "#8B493B",
        innerStroke: "#A85C48",
        defaultColors: { body: "#EC7057", wing: "#F68A5F", chest: "#FFF0C7", tail: "#D95B4C", beak: "#F3B74D", leg: "#9D6742" },
        outer: [
          "M108 82 C80 55 46 34 7 29 C24 45 27 59 15 72 C39 74 45 88 32 104 C58 102 70 116 61 136 C84 129 100 114 112 99 Z",
          "M142 82 C170 55 204 34 243 29 C226 45 223 59 235 72 C211 74 205 88 218 104 C192 102 180 116 189 136 C166 129 150 114 138 99 Z",
          "M102 49 C115 30 140 31 151 51 C165 76 158 118 143 145 C134 160 116 160 107 145 C92 118 88 75 102 49 Z",
          "M106 45 C102 30 109 20 121 14 C120 26 126 31 133 34 C139 25 147 24 155 28 C146 35 143 42 144 51 Z",
          "M103 141 C88 153 74 171 68 193 L102 175 L125 202 L148 175 L182 193 C176 171 162 153 147 141 Z",
          "M150 61 L170 70 L151 79 Z"
        ],
        regions: [
          { id: "left_wing", d: "M107 83 C81 59 49 39 14 34 C29 47 31 59 21 70 C42 74 48 87 38 100 C61 100 72 111 65 128 C85 123 100 109 111 96 Z", fill: "#F68A5F" },
          { id: "right_wing", d: "M143 83 C169 59 201 39 236 34 C221 47 219 59 229 70 C208 74 202 87 212 100 C189 100 178 111 185 128 C165 123 150 109 139 96 Z", fill: "#F68A5F" },
          { id: "wing_layers", d: "M28 53 C53 58 78 73 101 92 C76 89 58 96 47 112 C52 91 45 72 28 53 Z M222 53 C197 58 172 73 149 92 C174 89 192 96 203 112 C198 91 205 72 222 53 Z", fill: "#D95B4C" },
          { id: "body", d: "M105 52 C117 34 138 35 148 53 C161 77 154 116 140 142 C132 157 118 157 110 142 C96 116 92 76 105 52 Z", fill: "#EC7057" },
          { id: "chest_petal", d: "M110 82 C116 70 125 67 125 67 C125 67 134 70 140 82 C149 100 138 125 125 137 C112 125 101 100 110 82 Z", fill: "#FFF0C7" },
          { id: "crest", d: "M108 44 C105 32 110 23 120 18 C120 28 125 34 132 37 C138 29 145 28 151 31 C143 37 141 43 142 49 Z", fill: "#F3B74D" },
          { id: "tail", d: "M105 140 C90 153 78 169 72 187 L103 171 L125 196 L147 171 L178 187 C172 169 160 153 145 140 Z", fill: "#D95B4C" },
          { id: "beak", d: "M150 62 L168 70 L151 77 Z", fill: "#F3B74D" },
          { id: "feet", d: "M112 151 L108 165 M138 151 L142 165", fill: "none" }
        ],
        inner: [
          "M23 60 C51 67 79 82 104 101",
          "M227 60 C199 67 171 82 146 101",
          "M39 91 C64 91 86 101 104 116",
          "M211 91 C186 91 164 101 146 116",
          "M109 110 C119 119 131 119 141 110"
        ],
        face: '<circle cx="129" cy="57" r="4" fill="#4B332C"/><circle cx="130" cy="56" r="1.2" fill="#fff"/><path d="M111 69 C119 75 132 75 140 69" fill="none" stroke="#8B493B" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_phoenix: design({
        designVersion: 4,
        viewBox: "0 0 300 250",
        outlineStroke: "#87661D",
        innerStroke: "#A9852E",
        defaultColors: { body: "#F3C94B", wing: "#FFF0A6", chest: "#FFFBEA", tail: "#DDAF32", beak: "#C9872D", leg: "#8F7138" },
        outer: [
          "M139 99 C111 75 84 44 62 13 C58 37 45 57 21 70 C47 68 62 80 54 98 C78 88 99 95 98 114 C115 106 130 107 144 116 Z",
          "M162 95 C193 60 230 32 283 14 C267 40 247 57 221 68 C253 62 277 71 294 87 C263 97 236 97 212 91 C231 108 239 125 234 144 C207 129 187 115 158 111 Z",
          "M137 76 C149 47 181 42 198 62 C212 79 205 100 186 109 C188 135 174 163 151 167 C127 164 115 137 122 113 C110 98 117 83 137 76 Z",
          "M143 72 C137 55 144 40 157 30 L162 51 L176 27 L179 55 L194 43 L188 76 Z",
          "M139 157 C108 169 76 190 39 232 C79 219 112 202 141 184 C124 209 121 230 129 246 C145 225 153 205 155 181 Z",
          "M160 157 C190 170 224 193 272 225 C236 216 200 200 166 182 C188 204 196 224 190 245 C171 224 159 202 154 181 Z",
          "M146 160 C138 187 141 220 153 247 C165 218 167 187 159 159 Z",
          "M197 72 C215 73 222 83 214 95 C205 91 200 83 197 72 Z",
          "M139 164 C134 176 126 181 116 183 M161 166 C167 177 176 181 186 182"
        ],
        regions: [
          { id: "left_wing", d: "M139 101 C113 78 88 49 66 20 C62 43 50 60 29 69 C51 72 65 82 59 96 C80 91 99 98 101 111 C117 106 130 109 143 115 Z", fill: "#FFE89A" },
          { id: "right_wing", d: "M162 97 C192 64 228 37 275 20 C259 42 241 57 217 68 C246 66 268 73 286 85 C260 93 236 94 214 89 C230 104 237 120 233 137 C208 125 187 112 159 109 Z", fill: "#FFF1B4" },
          { id: "wing_plumes", d: "M48 68 C78 70 107 84 136 105 C102 94 82 99 65 112 C72 93 65 79 48 68 Z M251 58 C223 67 197 82 167 105 C200 92 224 96 246 108 C234 90 236 74 251 58 Z", fill: "#E2B13A" },
          { id: "body", d: "M140 78 C152 51 179 48 195 65 C207 80 201 98 184 106 C187 132 172 158 151 163 C130 159 119 135 125 114 C114 99 120 84 140 78 Z", fill: "#F3C94B" },
          { id: "chest_plume", d: "M143 91 C151 80 166 79 175 90 C183 104 177 137 152 151 C128 137 126 106 143 91 Z", fill: "#FFFBEA" },
          { id: "crest", d: "M145 72 C140 57 146 44 156 35 L161 56 L174 34 L176 59 L190 49 L185 75 Z", fill: "#E0AE2D" },
          { id: "tail_left", d: "M140 156 C109 169 78 191 47 225 C82 213 113 197 142 179 C127 205 125 226 131 240 C145 220 152 201 155 178 Z", fill: "#E2B13A" },
          { id: "tail_right", d: "M159 156 C188 170 221 192 263 219 C231 210 199 196 165 179 C184 200 192 220 189 239 C172 220 160 200 154 178 Z", fill: "#F2CC55" },
          { id: "tail_center", d: "M147 158 C141 185 143 216 153 240 C163 215 165 185 158 158 Z", fill: "#FFF0A6" },
          { id: "tail_gems", d: "M105 205 C111 194 122 195 127 206 C121 216 110 216 105 205 Z M179 205 C185 194 196 195 201 206 C195 216 184 216 179 205 Z", fill: "#FFFBEA" },
          { id: "beak", d: "M197 73 C212 74 218 82 213 91 C204 88 200 81 197 73 Z", fill: "#C9872D" },
          { id: "feet", d: "M139 162 C135 174 127 180 117 182 M161 164 C167 175 176 180 185 181", fill: "none" }
        ],
        inner: [
          "M57 60 C83 69 110 86 137 106",
          "M80 45 C99 68 117 86 140 103",
          "M247 49 C218 65 190 84 164 105",
          "M273 77 C237 76 203 88 165 108",
          "M130 115 C141 124 159 124 174 111",
          "M79 214 C105 197 127 181 145 166",
          "M226 210 C202 194 180 178 160 165"
        ],
        face: '<circle cx="174" cy="70" r="4" fill="#433621"/><circle cx="175" cy="69" r="1.2" fill="#fff"/><path d="M153 82 C162 88 176 87 184 80" fill="none" stroke="#87661D" stroke-width="2" stroke-linecap="round"/><path d="M164 91 C171 95 179 94 184 90" fill="none" stroke="#173653" stroke-width="2" stroke-linecap="round" opacity=".65"/>'
      })
    },

    evolutionDecorations: {
      companion_ice_legend_bird: {
        2: { front: '<path d="M36 84 Q70 56 107 75 M214 84 Q180 56 143 75 M106 104 L125 123 L144 104" fill="none" stroke="#6DB9DE" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#BDEBFA" stroke-width="2"><path d="M18 44 h18 M27 35 v18 M20 37 l14 14 M34 37 l-14 14"/></g>' },
        3: { back: '<circle cx="125" cy="92" r="91" fill="none" stroke="#D9F5FC" stroke-width="5" opacity=".62"/>', front: '<path d="M25 76 Q69 40 111 69 M225 76 Q181 40 139 69 M101 104 L125 130 L149 104 M106 43 L124 12 L143 45" fill="none" stroke="#4D9FCB" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#D9F5FC" stroke-width="2"><path d="M10 47 h18 M19 38 v18 M12 40 l14 14 M26 40 l-14 14"/><path d="M222 44 h18 M231 35 v18 M224 37 l14 14 M238 37 l-14 14"/></g>' }
      },
      companion_thunder_legend_bird: {
        2: { front: '<path d="M101 92 Q125 72 149 92 M26 66 L48 79 L36 91 L61 104 M224 66 L202 79 L214 91 L189 104" fill="none" stroke="#FFF5B0" stroke-width="3" stroke-linecap="round"/><path d="M108 44 L124 20 L136 45" fill="none" stroke="#F28B31" stroke-width="3" stroke-linecap="round"/>' },
        3: { back: '<path d="M15 137 Q125 -2 235 137" fill="none" stroke="#FFF2A0" stroke-width="5" opacity=".62"/>', front: '<path d="M94 88 Q125 61 156 88 M15 58 L42 74 L27 89 L57 106 M235 58 L208 74 L223 89 L193 106 M105 43 L124 8 L139 46" fill="none" stroke="#FFF8CF" stroke-width="3" stroke-linecap="round"/><g fill="#F28B31"><path d="M13 31 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M237 31 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>' }
      },
      companion_fire_legend_bird: {
        2: { front: '<g fill="#F7C76D"><path d="M28 91 q8-11 16 0-8 10-16 0z"/><path d="M206 91 q8-11 16 0-8 10-16 0z"/><path d="M70 116 q7-10 14 0-7 9-14 0z"/><path d="M166 116 q7-10 14 0-7 9-14 0z"/></g><path d="M98 126 Q125 142 152 126" fill="none" stroke="#D97852" stroke-width="3" stroke-linecap="round"/>' },
        3: { back: '<circle cx="125" cy="96" r="94" fill="none" stroke="#FFD99A" stroke-width="5" opacity=".55"/>', front: '<g fill="#F7D681"><path d="M16 80 q10-14 20 0-10 13-20 0z"/><path d="M214 80 q10-14 20 0-10 13-20 0z"/><path d="M68 158 q9-13 18 0-9 12-18 0z"/><path d="M164 158 q9-13 18 0-9 12-18 0z"/></g><path d="M92 122 Q125 148 158 122 M106 47 Q117 27 125 48 M125 48 Q138 27 147 52" fill="none" stroke="#CB684E" stroke-width="3" stroke-linecap="round"/>' }
      },
      companion_phoenix: {
        2: { front: '<path d="M57 75 Q94 63 135 96 M249 67 Q208 67 166 99 M134 126 Q153 139 174 123 M144 72 L154 48 L164 70 L177 43 L185 74" fill="none" stroke="#FFF4BC" stroke-width="3" stroke-linecap="round"/><g fill="#FFF3B5" stroke="#C99B2D" stroke-width="2"><path d="M111 205 q8-12 16 0-8 12-16 0z"/><path d="M179 205 q8-12 16 0-8 12-16 0z"/><circle cx="153" cy="126" r="5"/></g>' },
        3: { back: '<ellipse cx="153" cy="112" rx="112" ry="103" fill="none" stroke="#FFF7CE" stroke-width="6" opacity=".75"/><path d="M45 61 Q153 -20 267 54 M62 43 L35 19 M239 38 L268 14 M153 18 V1" fill="none" stroke="#F7D86B" stroke-width="4" stroke-linecap="round" opacity=".82"/>', front: '<path d="M48 69 Q93 48 140 91 M263 61 Q211 53 163 94 M126 126 Q153 148 182 122 M139 73 L153 36 L165 70 L181 34 L191 76" fill="none" stroke="#FFFBEA" stroke-width="3" stroke-linecap="round"/><g fill="#F7D561"><path d="M18 62 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M282 54 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g><g fill="#FFF8D5"><circle cx="86" cy="25" r="3"/><circle cx="218" cy="23" r="3"/><circle cx="153" cy="8" r="3"/></g>' }
      }
    }
  };
})(window);
