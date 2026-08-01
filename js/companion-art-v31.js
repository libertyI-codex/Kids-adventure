(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function design(config) {
    config.renderer = "generic";
    config.transparentOuterBox = true;
    config.outlineWidth = config.outlineWidth || 2.8;
    config.innerWidth = config.innerWidth || 2;
    return config;
  }

  KA.companionArtV31 = {
    version: 1,
    targetIds: [
      "companion_chick",
      "companion_duck",
      "companion_parrot",
      "companion_peacock",
      "companion_owl",
      "companion_sparrow",
      "companion_penguin",
      "companion_shimaenaga",
      "companion_parakeet",
      "companion_java_sparrow",
      "companion_ice_legend_bird",
      "companion_thunder_legend_bird",
      "companion_fire_legend_bird",
      "companion_phoenix",
      "companion_quetzal"
    ],
    species: {
      companion_chick: design({
        designVersion: 3,
        viewBox: "0 0 200 180",
        outlineStroke: "#8A6223",
        innerStroke: "#A36D22",
        defaultColors: { body: "#FFD84D", wing: "#FFF0A3", beak: "#F28B35", leg: "#D98B32" },
        outer: [
          "M96 34 C74 28 53 42 49 65 C34 78 31 105 42 125 C54 148 81 157 106 151 C133 158 161 142 166 117 C170 94 159 75 145 66 C141 43 119 30 96 34 Z",
          "M91 34 C84 25 85 16 92 10 C96 18 101 23 106 27 C110 18 118 14 126 17 C120 24 118 31 121 38 Z",
          "M48 82 L28 88 L49 99 Z",
          "M70 145 C66 156 60 162 51 165 L74 165 M119 149 C123 159 131 164 140 165 L116 165"
        ],
        regions: [
          { id: "body", d: "M56 72 C72 56 109 53 137 67 C158 78 166 101 157 123 C147 146 117 154 91 148 C65 151 43 135 40 112 C38 95 44 81 56 72 Z", fill: "#FFD84D" },
          { id: "head", d: "M68 44 C84 29 113 29 132 42 C149 54 149 77 134 91 C117 106 83 103 65 87 C50 73 53 57 68 44 Z", fill: "#FFE77A" },
          { id: "belly", d: "M78 97 C92 88 119 91 131 106 C139 122 127 141 104 143 C80 141 68 119 78 97 Z", fill: "#FFF1AF" },
          { id: "left_wing", d: "M59 87 C44 91 35 105 39 119 C52 123 65 114 71 97 Z", fill: "#FFC93B" },
          { id: "right_wing", d: "M137 86 C153 90 162 103 159 118 C146 124 133 114 127 97 Z", fill: "#FFC93B" },
          { id: "crest", d: "M91 35 C86 26 87 18 92 13 C96 21 101 26 106 30 C111 21 117 18 122 20 C117 27 116 33 119 39 Z", fill: "#F5B82E" },
          { id: "beak", d: "M50 82 L28 89 L51 97 Z", fill: "#F28B35" },
          { id: "feet", d: "M70 145 C67 155 61 162 52 164 M69 157 L77 164 M119 149 C123 158 131 163 140 164 M128 157 L119 165", fill: "none" }
        ],
        inner: [
          "M57 91 C64 88 69 91 72 97",
          "M137 91 C131 88 127 92 125 98",
          "M79 106 C90 113 118 114 130 106",
          "M84 49 C91 44 98 44 104 48"
        ],
        face: '<circle cx="82" cy="65" r="4" fill="#493B2B"/><circle cx="119" cy="65" r="4" fill="#493B2B"/><circle cx="83" cy="64" r="1.2" fill="#fff"/><circle cx="120" cy="64" r="1.2" fill="#fff"/><path d="M91 78 C99 84 108 84 116 78" fill="none" stroke="#8A6223" stroke-width="2.2" stroke-linecap="round"/>'
      }),

      companion_duck: design({
        designVersion: 3,
        viewBox: "0 0 210 170",
        outlineStroke: "#7A673B",
        innerStroke: "#9B7A37",
        defaultColors: { body: "#FFF3B8", wing: "#FFD75E", beak: "#F58A38", leg: "#E99A3A" },
        outer: [
          "M70 53 C77 31 101 20 124 28 C142 34 153 48 153 64 C178 68 197 84 197 105 C197 132 164 147 123 145 C79 144 42 129 36 106 C31 88 43 72 62 65 C63 60 66 56 70 53 Z",
          "M68 62 C49 54 25 58 14 72 C28 84 51 84 69 75 Z",
          "M187 88 L205 77 L200 99 Z",
          "M93 143 C88 152 79 157 67 158 L99 158 M141 144 C148 152 158 156 169 157 L136 158"
        ],
        regions: [
          { id: "body", d: "M57 74 C82 61 142 64 174 83 C197 97 190 124 163 136 C130 150 75 141 51 123 C31 108 37 85 57 74 Z", fill: "#FFF3B8" },
          { id: "head", d: "M77 43 C91 25 119 23 137 38 C155 54 150 77 132 89 C111 101 80 91 70 73 C65 62 68 51 77 43 Z", fill: "#FFE88A" },
          { id: "wing", d: "M95 83 C119 74 151 84 163 105 C144 119 111 115 95 96 Z", fill: "#FFD75E" },
          { id: "tail", d: "M175 84 L202 77 L190 101 Z", fill: "#FFE88A" },
          { id: "beak", d: "M69 61 C49 53 27 58 17 71 C28 79 51 81 69 73 Z", fill: "#F58A38" },
          { id: "feet", d: "M93 142 C88 151 79 156 68 158 M84 151 L99 158 M141 143 C148 151 158 155 168 157 M154 150 L137 158", fill: "none" }
        ],
        inner: [
          "M97 84 C117 92 137 101 157 106",
          "M59 115 C82 132 133 138 169 122",
          "M43 69 C51 70 60 69 67 66"
        ],
        face: '<circle cx="113" cy="55" r="4.2" fill="#3F3A31"/><circle cx="114" cy="54" r="1.2" fill="#fff"/><path d="M73 68 C65 71 53 71 42 68" fill="none" stroke="#B95A29" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_parrot: design({
        designVersion: 3,
        viewBox: "0 0 200 190",
        outlineStroke: "#315F4D",
        innerStroke: "#3C765D",
        defaultColors: { head: "#F05A59", body: "#58C778", wing: "#42A5D9", tail: "#F2C84B", beak: "#F3D38A", leg: "#8C6B45" },
        outer: [
          "M80 29 C102 15 130 24 141 46 C151 65 144 85 130 96 C142 121 131 151 107 159 C82 168 56 149 52 120 C49 97 58 81 68 71 C58 54 63 39 80 29 Z",
          "M93 96 C119 88 145 105 151 133 C130 143 106 132 93 110 Z",
          "M92 153 L86 185 L105 162 L117 188 L124 153 Z",
          "M137 52 C158 51 168 63 158 79 C148 76 141 67 137 52 Z",
          "M83 29 C76 20 77 12 84 7 C87 15 92 20 98 22 C104 13 112 11 119 15 C110 21 107 26 108 33 Z"
        ],
        regions: [
          { id: "body", d: "M67 78 C85 62 116 66 130 88 C146 113 134 147 108 156 C80 164 56 142 55 114 C54 98 59 86 67 78 Z", fill: "#58C778" },
          { id: "head", d: "M80 31 C101 17 128 26 138 47 C147 67 135 87 115 93 C91 99 67 84 63 62 C60 49 67 38 80 31 Z", fill: "#F05A59" },
          { id: "face_patch", d: "M105 38 C124 36 139 49 138 64 C136 79 123 88 108 84 C96 76 94 53 105 38 Z", fill: "#FFF4D6" },
          { id: "wing", d: "M80 88 C104 76 133 92 139 120 C121 135 91 126 80 103 Z", fill: "#42A5D9" },
          { id: "tail", d: "M91 151 L87 184 L105 160 L117 186 L123 151 Z", fill: "#F2C84B" },
          { id: "crest", d: "M82 30 C77 21 79 13 84 9 C88 18 93 22 99 24 C104 17 111 15 116 17 C109 23 106 28 107 34 Z", fill: "#F2C84B" },
          { id: "beak", d: "M137 53 C155 53 163 63 157 75 C147 73 141 66 137 53 Z", fill: "#F3D38A" },
          { id: "feet", d: "M83 153 C80 162 74 167 66 170 M106 158 C109 166 115 170 123 172", fill: "none" }
        ],
        inner: [
          "M83 90 C101 96 119 108 135 121",
          "M88 103 C102 110 116 119 128 128",
          "M73 127 C84 145 106 150 123 138"
        ],
        face: '<circle cx="119" cy="55" r="4" fill="#263B35"/><circle cx="120" cy="54" r="1.2" fill="#fff"/><path d="M138 63 C145 62 151 66 154 71" fill="none" stroke="#91622C" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_peacock: design({
        designVersion: 5,
        viewBox: "0 0 240 205",
        outlineStroke: "#236C67",
        innerStroke: "#2F7F75",
        defaultColors: { body: "#2476C9", neck: "#31B9CB", tail: "#55B978", eye: "#F3CC57", leg: "#9A7440" },
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

      companion_owl: design({
        designVersion: 3,
        viewBox: "0 0 200 185",
        outlineStroke: "#68513D",
        innerStroke: "#86674D",
        defaultColors: { body: "#A9784D", face: "#F4D7A4", wing: "#8D6042", beak: "#E9A23B", leg: "#9B7047" },
        outer: [
          "M52 42 L70 18 L87 37 C96 32 105 32 114 37 L132 18 L149 43 C165 59 170 87 165 116 C160 151 135 171 101 171 C67 171 42 151 37 116 C32 87 37 60 52 42 Z",
          "M45 83 C25 98 27 127 48 142 C61 131 66 108 59 89 Z",
          "M157 83 C177 98 175 127 154 142 C141 131 136 108 143 89 Z",
          "M86 169 C82 177 74 181 65 182 L91 182 M116 169 C121 177 129 181 138 182 L111 182"
        ],
        regions: [
          { id: "body", d: "M53 45 L70 24 L87 42 C96 37 105 37 114 42 L132 24 L148 45 C162 63 165 90 160 117 C154 149 132 166 101 166 C70 166 48 149 42 117 C37 90 40 64 53 45 Z", fill: "#A9784D" },
          { id: "face_left", d: "M55 55 C69 39 94 42 101 62 C106 83 88 101 68 96 C49 91 43 70 55 55 Z", fill: "#F4D7A4" },
          { id: "face_right", d: "M101 62 C108 42 133 39 147 55 C159 70 153 91 134 96 C114 101 96 83 101 62 Z", fill: "#F4D7A4" },
          { id: "belly", d: "M70 104 C85 93 117 93 132 104 C143 126 132 153 101 158 C70 153 59 126 70 104 Z", fill: "#D6AB78" },
          { id: "left_wing", d: "M48 86 C30 99 32 125 49 138 C60 126 64 106 58 90 Z", fill: "#8D6042" },
          { id: "right_wing", d: "M154 86 C172 99 170 125 153 138 C142 126 138 106 144 90 Z", fill: "#8D6042" },
          { id: "beak", d: "M92 88 L101 100 L110 88 Z", fill: "#E9A23B" },
          { id: "feet", d: "M86 166 C83 176 75 180 66 181 M116 166 C120 176 128 180 137 181", fill: "none" }
        ],
        inner: [
          "M69 112 L80 120 L91 112 L102 120 L113 112 L124 120 L134 112",
          "M75 133 L86 141 L97 133 L108 141 L119 133 L129 140",
          "M51 89 C58 101 60 118 53 132",
          "M151 89 C144 101 142 118 149 132"
        ],
        face: '<circle cx="76" cy="69" r="10" fill="#fff"/><circle cx="126" cy="69" r="10" fill="#fff"/><circle cx="77" cy="70" r="5" fill="#28343A"/><circle cx="125" cy="70" r="5" fill="#28343A"/><circle cx="79" cy="68" r="1.5" fill="#fff"/><circle cx="127" cy="68" r="1.5" fill="#fff"/>'
      }),

      companion_sparrow: design({
        designVersion: 3,
        viewBox: "0 0 210 165",
        outlineStroke: "#69513E",
        innerStroke: "#80634D",
        defaultColors: { body: "#B7855E", wing: "#8F674E", belly: "#E7C8A5", beak: "#D79A4B", leg: "#946A44" },
        outer: [
          "M53 64 C62 35 93 21 121 34 C139 42 151 56 154 72 C177 78 192 93 191 112 C189 138 156 151 120 147 C84 151 50 139 41 116 C33 95 38 77 53 64 Z",
          "M42 79 L18 87 L43 96 Z",
          "M174 92 L205 78 L192 109 Z",
          "M92 145 C88 154 80 159 70 160 L98 160 M130 146 C136 154 144 158 154 159 L125 160"
        ],
        regions: [
          { id: "body", d: "M60 70 C79 52 116 53 143 70 C170 75 190 92 187 113 C184 136 153 146 119 142 C85 147 53 136 45 116 C37 98 44 81 60 70 Z", fill: "#B7855E" },
          { id: "head", d: "M58 61 C69 34 99 24 124 36 C143 45 152 64 145 81 C134 95 103 96 80 86 C65 80 58 71 58 61 Z", fill: "#9C6C4D" },
          { id: "belly", d: "M84 89 C111 80 151 91 166 112 C150 135 111 143 78 130 C65 119 68 100 84 89 Z", fill: "#E7C8A5" },
          { id: "wing", d: "M103 75 C128 68 157 82 166 105 C148 119 116 114 102 91 Z", fill: "#8F674E" },
          { id: "tail", d: "M173 91 L204 80 L190 108 Z", fill: "#7A5947" },
          { id: "beak", d: "M45 79 L19 87 L44 95 Z", fill: "#D79A4B" },
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

      companion_penguin: design({
        designVersion: 2,
        viewBox: "0 0 200 190",
        outlineStroke: "#31475A",
        innerStroke: "#4F6A7E",
        defaultColors: { body: "#27465F", belly: "#F7FBF5", wing: "#315A77", beak: "#F0A443", leg: "#E89B42" },
        outer: [
          "M101 21 C128 21 151 43 154 73 C172 87 178 111 167 127 C159 138 150 137 143 129 C139 158 124 176 101 176 C78 176 63 158 59 129 C52 137 43 138 35 127 C24 111 30 87 48 73 C51 43 74 21 101 21 Z",
          "M89 175 C82 184 70 187 57 184 C65 173 75 169 88 169 Z",
          "M113 175 C120 184 132 187 145 184 C137 173 127 169 114 169 Z",
          "M87 67 L101 77 L115 67 L101 88 Z"
        ],
        regions: [
          { id: "body", d: "M101 24 C128 24 150 46 151 77 C154 113 145 170 101 173 C57 170 48 113 51 77 C52 46 74 24 101 24 Z", fill: "#27465F" },
          { id: "belly", d: "M75 70 C84 56 118 56 127 70 C143 94 137 151 101 160 C65 151 59 94 75 70 Z", fill: "#F7FBF5" },
          { id: "left_flipper", d: "M52 75 C34 83 25 105 36 124 C44 136 54 131 61 118 C62 100 59 84 52 75 Z", fill: "#315A77" },
          { id: "right_flipper", d: "M150 75 C168 83 177 105 166 124 C158 136 148 131 141 118 C140 100 143 84 150 75 Z", fill: "#315A77" },
          { id: "face_patch", d: "M71 49 C82 35 96 39 101 52 C106 39 120 35 131 49 C141 64 130 82 113 83 C107 83 103 81 101 77 C99 81 95 83 89 83 C72 82 61 64 71 49 Z", fill: "#F7FBF5" },
          { id: "beak", d: "M87 68 L101 78 L115 68 L101 88 Z", fill: "#F0A443" },
          { id: "feet", d: "M88 169 C78 168 67 174 60 183 C72 186 83 182 91 174 Z M114 169 C124 168 135 174 142 183 C130 186 119 182 111 174 Z", fill: "#E89B42" }
        ],
        inner: [
          "M74 94 C84 103 118 103 128 94",
          "M78 122 C88 132 114 132 124 122",
          "M52 81 C57 93 59 106 58 118",
          "M150 81 C145 93 143 106 144 118"
        ],
        face: '<circle cx="84" cy="59" r="4" fill="#263640"/><circle cx="118" cy="59" r="4" fill="#263640"/><circle cx="85" cy="58" r="1.2" fill="#fff"/><circle cx="119" cy="58" r="1.2" fill="#fff"/>'
      }),

      companion_shimaenaga: design({
        designVersion: 2,
        viewBox: "0 0 210 185",
        outlineStroke: "#718091",
        innerStroke: "#8E9BAA",
        defaultColors: { body: "#FFFDF8", wing: "#D9E0E8", tail: "#AAB5C3", beak: "#6C6670", leg: "#8E6F6A" },
        outer: [
          "M50 75 C50 40 78 18 106 28 C134 18 162 40 162 75 C180 89 184 118 168 137 C152 156 124 158 106 146 C88 158 60 156 44 137 C28 118 32 89 50 75 Z",
          "M85 143 C78 159 70 173 59 183 C78 178 94 166 105 150 Z",
          "M127 143 C134 159 142 173 153 183 C134 178 118 166 107 150 Z",
          "M48 90 L30 96 L49 103 Z",
          "M83 151 C79 162 72 168 63 171 M129 151 C133 162 140 168 149 171"
        ],
        regions: [
          { id: "body", d: "M52 73 C52 44 77 25 106 32 C135 25 160 44 160 73 C180 90 178 120 160 138 C145 153 121 153 106 143 C91 153 67 153 52 138 C34 120 32 90 52 73 Z", fill: "#FFFDF8" },
          { id: "left_wing", d: "M50 92 C35 100 35 122 49 134 C61 126 66 108 61 96 Z", fill: "#D9E0E8" },
          { id: "right_wing", d: "M162 92 C177 100 177 122 163 134 C151 126 146 108 151 96 Z", fill: "#D9E0E8" },
          { id: "tail", d: "M85 142 C78 157 71 170 61 180 C79 175 95 163 105 148 C116 163 133 175 151 180 C141 170 134 157 127 142 Z", fill: "#AAB5C3" },
          { id: "face_cap", d: "M60 61 C70 37 91 32 106 44 C121 32 142 37 152 61 C138 54 121 57 106 68 C91 57 74 54 60 61 Z", fill: "#E6EAF0" },
          { id: "beak", d: "M50 90 L31 96 L50 102 Z", fill: "#6C6670" },
          { id: "feet", d: "M83 149 C80 160 73 167 64 170 M129 149 C132 160 139 167 148 170", fill: "none" }
        ],
        inner: [
          "M54 97 C61 94 65 99 64 106",
          "M158 97 C151 94 147 99 148 106",
          "M83 143 C91 149 99 150 106 145 C113 150 121 149 129 143"
        ],
        face: '<circle cx="82" cy="78" r="4" fill="#2D3740"/><circle cx="130" cy="78" r="4" fill="#2D3740"/><circle cx="83" cy="77" r="1.2" fill="#fff"/><circle cx="131" cy="77" r="1.2" fill="#fff"/><ellipse cx="70" cy="91" rx="8" ry="4" fill="#F3B9C5" opacity=".75"/><ellipse cx="142" cy="91" rx="8" ry="4" fill="#F3B9C5" opacity=".75"/><path d="M97 92 C103 97 109 97 115 92" fill="none" stroke="#77727A" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_parakeet: design({
        designVersion: 2,
        viewBox: "0 0 195 195",
        outlineStroke: "#3B6E45",
        innerStroke: "#4D8556",
        defaultColors: { body: "#78CE65", head: "#C7EA69", wing: "#4FAF66", tail: "#3B9661", beak: "#DFA94A", leg: "#8B704F" },
        outer: [
          "M75 31 C96 17 123 25 133 47 C142 67 133 86 119 96 C132 119 123 151 101 160 C78 169 54 150 52 122 C50 101 58 86 67 77 C56 60 60 42 75 31 Z",
          "M90 151 C89 170 93 184 101 194 L108 160 L124 190 C127 174 123 158 115 148 Z",
          "M128 51 C146 50 155 61 148 74 C139 71 133 64 128 51 Z",
          "M79 31 C75 22 79 13 86 10 C88 18 92 24 98 27 Z"
        ],
        regions: [
          { id: "body", d: "M68 76 C85 64 111 70 123 91 C138 117 124 150 101 158 C76 165 55 143 55 119 C54 99 60 84 68 76 Z", fill: "#78CE65" },
          { id: "head", d: "M76 33 C96 20 121 28 130 48 C139 67 127 85 109 91 C87 97 64 83 61 62 C59 49 65 40 76 33 Z", fill: "#C7EA69" },
          { id: "wing", d: "M79 87 C100 76 125 90 130 115 C115 129 88 122 79 101 Z", fill: "#4FAF66" },
          { id: "tail", d: "M89 150 C88 169 93 184 101 193 L108 158 L123 189 C126 173 122 158 114 148 Z", fill: "#3B9661" },
          { id: "crest", d: "M78 32 C75 23 79 16 85 13 C87 21 92 27 97 30 Z", fill: "#9DD957" },
          { id: "beak", d: "M128 52 C143 52 151 61 147 71 C138 69 133 63 128 52 Z", fill: "#DFA94A" },
          { id: "feet", d: "M77 153 C74 162 68 167 60 169 M99 158 C102 166 108 170 116 172", fill: "none" }
        ],
        inner: [
          "M81 88 C96 96 111 106 126 117",
          "M87 101 C99 108 111 116 122 123",
          "M70 116 C80 139 103 150 119 136"
        ],
        face: '<circle cx="107" cy="53" r="4" fill="#26392D"/><circle cx="108" cy="52" r="1.2" fill="#fff"/><circle cx="95" cy="67" r="5" fill="#5E9DD1"/><circle cx="116" cy="69" r="3" fill="#5E9DD1"/><path d="M129 61 C136 60 141 64 144 69" fill="none" stroke="#8D6429" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_java_sparrow: design({
        designVersion: 2,
        viewBox: "0 0 205 170",
        outlineStroke: "#655E61",
        innerStroke: "#807477",
        defaultColors: { body: "#D7D1CF", head: "#55565D", wing: "#A89EA0", tail: "#6E686C", beak: "#EF8FA1", leg: "#B6787F" },
        outer: [
          "M57 62 C66 34 96 22 124 34 C143 42 154 57 156 74 C178 81 191 97 188 116 C184 141 153 151 120 147 C84 151 51 138 43 115 C36 94 42 75 57 62 Z",
          "M45 78 L22 87 L46 96 Z",
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
          { id: "beak", d: "M47 78 L23 87 L47 95 Z", fill: "#EF8FA1" },
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
        designVersion: 2,
        viewBox: "0 0 250 200",
        outlineStroke: "#4E89A8",
        innerStroke: "#69A9C7",
        defaultColors: { body: "#9DDFF3", wing: "#DDF7FF", chest: "#FFFFFF", tail: "#77C6E7", beak: "#8BA9BD", leg: "#6598AF" },
        outer: [
          "M105 71 C81 54 50 37 15 37 L35 64 L11 73 L48 93 L25 107 C58 116 84 105 107 91 Z",
          "M145 71 C169 54 200 37 235 37 L215 64 L239 73 L202 93 L225 107 C192 116 166 105 143 91 Z",
          "M101 46 C113 28 139 28 151 46 C166 68 161 108 146 137 C137 154 113 154 104 137 C89 108 86 68 101 46 Z",
          "M106 42 L114 15 L125 37 L139 10 L145 46 Z",
          "M102 132 L82 184 L116 159 L125 196 L135 159 L168 184 L148 132 Z",
          "M145 58 L166 67 L146 77 Z"
        ],
        regions: [
          { id: "left_wing", d: "M105 73 C81 56 52 41 20 40 L40 63 L18 72 L51 91 L32 103 C62 109 85 100 107 88 Z", fill: "#DDF7FF" },
          { id: "right_wing", d: "M145 73 C169 56 198 41 230 40 L210 63 L232 72 L199 91 L218 103 C188 109 165 100 143 88 Z", fill: "#DDF7FF" },
          { id: "body", d: "M104 49 C116 32 138 32 149 49 C163 70 157 108 143 135 C134 151 116 151 107 135 C93 108 90 70 104 49 Z", fill: "#9DDFF3" },
          { id: "chest", d: "M108 78 C115 67 135 67 142 79 C151 96 143 127 125 137 C107 127 99 96 108 78 Z", fill: "#FFFFFF" },
          { id: "crest", d: "M107 44 L114 18 L125 39 L138 14 L143 47 Z", fill: "#BDEBFA" },
          { id: "tail", d: "M105 131 L86 179 L116 156 L125 191 L135 156 L164 179 L146 131 Z", fill: "#77C6E7" },
          { id: "beak", d: "M145 59 L163 67 L146 75 Z", fill: "#8BA9BD" },
          { id: "feet", d: "M112 143 L108 158 M138 143 L142 158", fill: "none" }
        ],
        inner: [
          "M34 61 L72 78 L103 84",
          "M216 61 L178 78 L147 84",
          "M50 91 L83 94 L104 88",
          "M200 91 L167 94 L146 88",
          "M109 93 L125 107 L141 93"
        ],
        face: '<circle cx="128" cy="56" r="4" fill="#315F78"/><circle cx="129" cy="55" r="1.2" fill="#fff"/><path d="M111 69 C119 75 131 75 139 69" fill="none" stroke="#4E89A8" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_thunder_legend_bird: design({
        designVersion: 3,
        viewBox: "0 0 250 200",
        outlineStroke: "#5C5426",
        innerStroke: "#776B2D",
        defaultColors: { body: "#FFD62E", wing: "#FFE869", chest: "#FFF7CE", tail: "#F4B924", beak: "#F28B31", leg: "#9B7441" },
        outer: [
          "M104 77 L77 63 L84 48 L55 51 L60 35 L22 47 L35 66 L12 80 L48 91 L30 108 L70 106 L59 124 L108 99 Z",
          "M146 77 L173 63 L166 48 L195 51 L190 35 L228 47 L215 66 L238 80 L202 91 L220 108 L180 106 L191 124 L142 99 Z",
          "M102 47 C115 30 139 30 151 49 C165 71 159 111 144 140 C135 156 115 156 106 140 C91 111 88 70 102 47 Z",
          "M107 44 L101 22 L115 29 L124 7 L132 29 L147 19 L141 47 Z",
          "M104 136 L78 181 L113 162 L125 195 L137 162 L171 181 L146 136 Z",
          "M150 60 L171 69 L151 79 Z"
        ],
        regions: [
          { id: "left_wing", d: "M105 79 L78 66 L85 52 L59 55 L64 41 L28 50 L40 66 L19 79 L51 89 L36 104 L72 102 L64 117 L108 96 Z", fill: "#FFE869" },
          { id: "right_wing", d: "M145 79 L172 66 L165 52 L191 55 L186 41 L222 50 L210 66 L231 79 L199 89 L214 104 L178 102 L186 117 L142 96 Z", fill: "#FFE869" },
          { id: "wing_bands", d: "M45 54 L73 65 L61 78 L92 88 L77 100 L106 92 L107 83 L75 72 L87 58 Z M205 54 L177 65 L189 78 L158 88 L173 100 L144 92 L143 83 L175 72 L163 58 Z", fill: "#454335" },
          { id: "body", d: "M105 50 C117 34 137 34 148 51 C161 72 155 110 141 138 C132 153 118 153 109 138 C95 110 92 72 105 50 Z", fill: "#FFD62E" },
          { id: "chest_cloud", d: "M108 78 C112 68 124 66 130 73 C137 66 149 73 147 84 C156 91 151 104 140 104 C135 117 116 117 111 104 C99 103 98 87 108 78 Z", fill: "#FFF7CE" },
          { id: "crest", d: "M109 43 L104 24 L116 31 L124 12 L132 31 L145 22 L139 46 Z", fill: "#F4B924" },
          { id: "tail", d: "M106 135 L83 176 L114 158 L125 190 L137 158 L167 176 L144 135 Z", fill: "#F4B924" },
          { id: "beak", d: "M149 61 L168 69 L150 77 Z", fill: "#F28B31" },
          { id: "feet", d: "M112 145 L108 160 M138 145 L142 160", fill: "none" }
        ],
        inner: [
          "M39 67 L68 79 L55 91",
          "M211 67 L182 79 L195 91",
          "M91 69 L104 78 L96 88",
          "M159 69 L146 78 L154 88",
          "M109 108 L125 120 L141 108"
        ],
        face: '<circle cx="128" cy="55" r="4" fill="#3E3B2A"/><circle cx="129" cy="54" r="1.2" fill="#fff"/><path d="M111 67 C119 73 132 73 140 67" fill="none" stroke="#776B2D" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_fire_legend_bird: design({
        designVersion: 2,
        viewBox: "0 0 250 205",
        outlineStroke: "#8B493B",
        innerStroke: "#A85C48",
        defaultColors: { body: "#EC7057", wing: "#F68A5F", chest: "#FFF0C7", tail: "#D95B4C", beak: "#F3B74D", leg: "#9D6742" },
        outer: [
          "M105 78 C82 58 52 43 17 41 C30 54 31 65 22 75 C43 77 48 87 39 101 C61 100 70 110 64 125 C83 119 96 109 109 98 Z",
          "M145 78 C168 58 198 43 233 41 C220 54 219 65 228 75 C207 77 202 87 211 101 C189 100 180 110 186 125 C167 119 154 109 141 98 Z",
          "M102 49 C115 30 140 31 151 51 C165 76 158 118 143 145 C134 160 116 160 107 145 C92 118 88 75 102 49 Z",
          "M106 45 C102 30 109 20 121 14 C120 26 126 31 133 34 C139 25 147 24 155 28 C146 35 143 42 144 51 Z",
          "M103 141 C88 153 74 171 68 193 L102 175 L125 202 L148 175 L182 193 C176 171 162 153 147 141 Z",
          "M150 61 L170 70 L151 79 Z"
        ],
        regions: [
          { id: "left_wing", d: "M105 80 C82 60 54 47 23 44 C34 55 35 65 27 73 C46 77 51 87 44 97 C63 98 72 107 68 119 C85 114 97 105 109 95 Z", fill: "#F68A5F" },
          { id: "right_wing", d: "M145 80 C168 60 196 47 227 44 C216 55 215 65 223 73 C204 77 199 87 206 97 C187 98 178 107 182 119 C165 114 153 105 141 95 Z", fill: "#F68A5F" },
          { id: "wing_layers", d: "M40 61 C58 64 77 74 96 88 C75 87 61 92 52 104 C56 88 50 75 40 61 Z M210 61 C192 64 173 74 154 88 C175 87 189 92 198 104 C194 88 200 75 210 61 Z", fill: "#D95B4C" },
          { id: "body", d: "M105 52 C117 34 138 35 148 53 C161 77 154 116 140 142 C132 157 118 157 110 142 C96 116 92 76 105 52 Z", fill: "#EC7057" },
          { id: "chest_petal", d: "M110 82 C116 70 125 67 125 67 C125 67 134 70 140 82 C149 100 138 125 125 137 C112 125 101 100 110 82 Z", fill: "#FFF0C7" },
          { id: "crest", d: "M108 44 C105 32 110 23 120 18 C120 28 125 34 132 37 C138 29 145 28 151 31 C143 37 141 43 142 49 Z", fill: "#F3B74D" },
          { id: "tail", d: "M105 140 C90 153 78 169 72 187 L103 171 L125 196 L147 171 L178 187 C172 169 160 153 145 140 Z", fill: "#D95B4C" },
          { id: "beak", d: "M150 62 L168 70 L151 77 Z", fill: "#F3B74D" },
          { id: "feet", d: "M112 151 L108 165 M138 151 L142 165", fill: "none" }
        ],
        inner: [
          "M39 74 C60 78 81 88 101 101",
          "M211 74 C190 78 169 88 149 101",
          "M55 96 C72 95 88 101 102 112",
          "M195 96 C178 95 162 101 148 112",
          "M109 110 C119 119 131 119 141 110"
        ],
        face: '<circle cx="129" cy="57" r="4" fill="#4B332C"/><circle cx="130" cy="56" r="1.2" fill="#fff"/><path d="M111 69 C119 75 132 75 140 69" fill="none" stroke="#8B493B" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_phoenix: design({
        designVersion: 3,
        viewBox: "0 0 260 220",
        outlineStroke: "#8B6C23",
        innerStroke: "#A6812A",
        defaultColors: { body: "#F5C94C", wing: "#FFE992", chest: "#FFF8DD", tail: "#E7AF32", beak: "#E98C32", leg: "#A07B3A" },
        outer: [
          "M108 84 C82 56 47 34 10 28 L32 57 L7 68 L48 85 L24 103 L73 108 L59 129 C82 123 99 112 113 99 Z",
          "M152 84 C178 56 213 34 250 28 L228 57 L253 68 L212 85 L236 103 L187 108 L201 129 C178 123 161 112 147 99 Z",
          "M106 50 C120 27 146 28 158 52 C171 78 164 121 149 151 C140 168 120 168 111 151 C96 121 92 77 106 50 Z",
          "M108 47 L104 24 L117 30 L130 5 L143 30 L156 23 L152 51 Z",
          "M103 146 C72 158 45 181 30 211 L82 191 L104 216 L130 190 L156 216 L178 191 L230 211 C215 181 188 158 157 146 Z",
          "M157 62 L181 71 L158 82 Z"
        ],
        regions: [
          { id: "left_wing", d: "M108 86 C83 59 50 38 17 33 L38 57 L15 67 L52 83 L31 99 L76 104 L65 122 C85 117 101 108 113 96 Z", fill: "#FFE992" },
          { id: "right_wing", d: "M152 86 C177 59 210 38 243 33 L222 57 L245 67 L208 83 L229 99 L184 104 L195 122 C175 117 159 108 147 96 Z", fill: "#FFE992" },
          { id: "wing_sun_rays", d: "M30 47 L61 65 L51 76 L88 86 L75 101 L110 91 L112 82 L80 72 L92 56 L55 52 Z M230 47 L199 65 L209 76 L172 86 L185 101 L150 91 L148 82 L180 72 L168 56 L205 52 Z", fill: "#F5C94C" },
          { id: "body", d: "M109 53 C122 32 144 33 155 54 C168 80 161 119 146 148 C138 164 122 164 114 148 C99 119 96 79 109 53 Z", fill: "#F5C94C" },
          { id: "chest_sun", d: "M113 82 C118 70 126 66 130 66 C134 66 142 70 147 82 C153 99 144 125 130 140 C116 125 107 99 113 82 Z", fill: "#FFF8DD" },
          { id: "crest", d: "M111 46 L108 28 L119 34 L130 12 L141 34 L153 28 L149 49 Z", fill: "#E7AF32" },
          { id: "tail_fan", d: "M105 145 C75 157 51 177 37 203 L83 186 L105 210 L130 185 L155 210 L177 186 L223 203 C209 177 185 157 155 145 Z", fill: "#E7AF32" },
          { id: "tail_gems", d: "M69 185 C76 174 87 175 93 187 C86 198 75 197 69 185 Z M117 187 C124 174 136 174 143 187 C136 200 124 200 117 187 Z M167 185 C173 175 184 174 191 185 C185 197 174 198 167 185 Z", fill: "#FFF1A3" },
          { id: "beak", d: "M157 63 L178 71 L158 79 Z", fill: "#E98C32" },
          { id: "feet", d: "M117 158 L112 173 M143 158 L148 173", fill: "none" }
        ],
        inner: [
          "M30 65 L67 78 L53 91",
          "M230 65 L193 78 L207 91",
          "M78 102 C91 99 102 103 112 112",
          "M182 102 C169 99 158 103 148 112",
          "M114 112 C124 122 136 122 146 112",
          "M82 187 L106 165 L130 185 L154 165 L178 187"
        ],
        face: '<circle cx="133" cy="58" r="4" fill="#4A3B27"/><circle cx="134" cy="57" r="1.2" fill="#fff"/><path d="M114 70 C123 77 137 77 146 70" fill="none" stroke="#8B6C23" stroke-width="2" stroke-linecap="round"/>'
      }),

      companion_quetzal: design({
        designVersion: 2,
        viewBox: "0 0 220 245",
        outlineStroke: "#21664D",
        innerStroke: "#2C7C5D",
        defaultColors: { body: "#25A66F", wing: "#3EC58A", chest: "#D9535F", tail: "#157B5B", beak: "#E3B64F", leg: "#8A6944" },
        outer: [
          "M76 40 C98 20 130 24 145 46 C159 66 152 87 137 99 C151 127 138 158 110 165 C80 170 55 147 58 118 C60 96 69 83 79 75 C68 62 67 50 76 40 Z",
          "M70 88 C42 78 21 91 14 117 C35 124 55 114 74 98 Z",
          "M136 87 C164 76 192 88 205 112 C184 126 155 115 134 99 Z",
          "M90 157 C81 186 75 216 79 241 C91 221 101 198 108 174 C113 201 124 224 139 242 C140 213 134 185 125 157 Z",
          "M140 52 L159 60 L141 70 Z",
          "M88 38 C88 26 96 16 108 13 C104 26 108 34 116 41 Z"
        ],
        regions: [
          { id: "body", d: "M80 76 C98 62 126 69 139 91 C155 118 140 151 111 161 C82 166 60 143 61 117 C62 98 70 84 80 76 Z", fill: "#25A66F" },
          { id: "head", d: "M78 42 C99 24 128 29 142 49 C155 68 142 90 121 97 C96 103 73 86 70 64 C69 55 71 48 78 42 Z", fill: "#159568" },
          { id: "chest", d: "M90 93 C102 82 125 83 137 96 C146 114 137 140 111 151 C86 140 78 114 90 93 Z", fill: "#D9535F" },
          { id: "left_wing", d: "M72 87 C45 80 25 92 18 115 C38 120 57 111 75 98 Z", fill: "#3EC58A" },
          { id: "right_wing", d: "M135 87 C161 78 188 89 201 111 C181 122 155 113 134 99 Z", fill: "#3EC58A" },
          { id: "tail", d: "M91 155 C83 184 78 212 81 237 C93 217 102 194 108 171 C114 198 125 220 136 237 C137 210 132 182 124 155 Z", fill: "#157B5B" },
          { id: "tail_highlight", d: "M96 161 C91 184 88 205 89 223 C96 208 102 190 108 174 C113 192 120 209 128 224 C129 204 126 183 120 161 Z", fill: "#73D6AF" },
          { id: "crest", d: "M88 39 C89 28 96 20 105 17 C102 28 106 36 114 42 Z", fill: "#73D6AF" },
          { id: "beak", d: "M140 53 L157 60 L141 68 Z", fill: "#E3B64F" },
          { id: "feet", d: "M95 158 L91 173 M124 158 L129 173", fill: "none" }
        ],
        inner: [
          "M29 106 C44 99 58 96 72 96",
          "M191 104 C173 97 155 95 138 97",
          "M78 91 C90 99 99 110 105 123",
          "M140 91 C129 101 121 112 116 125",
          "M91 146 C103 156 119 156 131 145"
        ],
        face: '<circle cx="119" cy="54" r="4" fill="#173E32"/><circle cx="120" cy="53" r="1.2" fill="#fff"/><path d="M140 60 L153 61" fill="none" stroke="#8C6828" stroke-width="2" stroke-linecap="round"/>'
      })
    },

    evolutionDecorations: {
      companion_chick: {
        2: { front: '<path d="M52 92 Q62 78 74 88 M128 88 Q140 78 150 92 M91 33 Q97 22 102 34 M103 34 Q110 23 114 37" fill="none" stroke="#D99D24" stroke-width="3" stroke-linecap="round"/><path d="M59 90 l8 4-7 6 M143 90 l-8 4 7 6" fill="#FFF3A8"/>' },
        3: { front: '<path d="M46 87 Q61 66 78 83 M124 83 Q141 66 156 87 M88 35 Q95 16 102 34 M103 34 Q112 16 120 38" fill="none" stroke="#C98B1E" stroke-width="3" stroke-linecap="round"/><g fill="#FFD84D"><path d="M25 55 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M174 49 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>' }
      },
      companion_duck: {
        2: { front: '<path d="M99 88 Q118 77 137 88 M108 101 Q126 91 145 101" fill="none" stroke="#D9A238" stroke-width="3" stroke-linecap="round"/><path d="M105 42 Q113 52 105 62 Q97 52 105 42Z" fill="#A9E5F5"/>' },
        3: { front: '<path d="M91 82 Q118 64 145 82 M98 101 Q126 82 155 100" fill="none" stroke="#C88F2C" stroke-width="3" stroke-linecap="round"/><g fill="#84D2EC"><circle cx="31" cy="45" r="4"/><circle cx="179" cy="52" r="3"/><path d="M27 70 q6-10 12 0-6 9-12 0z"/></g>' }
      },
      companion_parrot: {
        2: { front: '<path d="M82 91 Q102 75 123 90 M87 106 Q108 88 130 105 M91 30 Q97 17 103 31" fill="none" stroke="#246E5A" stroke-width="3" stroke-linecap="round"/><path d="M92 94 l10 5-9 7z" fill="#F3D459"/>' },
        3: { front: '<path d="M75 86 Q101 61 128 84 M81 106 Q109 79 136 104 M87 31 Q96 10 104 31 M101 32 Q113 14 120 37 M94 154 L82 183 M116 154 L132 182" fill="none" stroke="#1F614F" stroke-width="3" stroke-linecap="round"/><g fill="#F3D459"><path d="M168 70 v13 q9-5 9 3-1 8-11 4 v-20z"/><circle cx="33" cy="59" r="3"/></g>' }
      },
      companion_peacock: {
        2: { front: '<g fill="#3D8A80" stroke="#F5DB70" stroke-width="3"><circle cx="62" cy="87" r="8"/><circle cx="178" cy="87" r="8"/><circle cx="120" cy="62" r="8"/></g>' },
        3: { back: '<path d="M30 144 Q120 2 210 144" fill="none" stroke="#BCE9CE" stroke-width="5" opacity=".65"/>', front: '<g fill="#27756F" stroke="#FFE993" stroke-width="3"><circle cx="45" cy="58" r="8"/><circle cx="195" cy="58" r="8"/><circle cx="88" cy="39" r="7"/><circle cx="152" cy="39" r="7"/></g><g fill="#F5D96F"><path d="M19 38 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><path d="M221 38 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>' }
      },
      companion_owl: {
        2: { front: '<path d="M68 112 l11 8 11-8 11 8 11-8 11 8 11-8 M77 134 l12 8 12-8 12 8 12-8" fill="none" stroke="#8D6848" stroke-width="3" stroke-linecap="round"/><path d="M57 45 L68 30 L78 46 M124 46 L134 30 L145 45" fill="#D6B178"/>' },
        3: { front: '<path d="M61 106 l14 11 14-11 14 11 14-11 14 11 M67 132 l17 12 17-12 17 12 17-12" fill="none" stroke="#765238" stroke-width="3" stroke-linecap="round"/><g fill="#F2CD61"><path d="M25 55 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M172 40 q-12 13 1 24-20-2-17-17 3-8 16-7z"/></g>' }
      },
      companion_sparrow: {
        2: { front: '<path d="M106 82 Q126 68 147 82 M112 96 Q132 81 153 96 M174 95 L195 84" fill="none" stroke="#76523F" stroke-width="3" stroke-linecap="round"/><path d="M63 61 q10-9 20 0-10 10-20 0z" fill="#E6B790"/>' },
        3: { front: '<path d="M99 77 Q126 57 153 78 M106 96 Q134 75 161 96 M171 91 L205 76" fill="none" stroke="#644533" stroke-width="3" stroke-linecap="round"/><g fill="#E9B08D"><path d="M29 58 q8-11 16 0-8 10-16 0z"/><path d="M184 45 q7-10 14 0-7 9-14 0z"/></g><circle cx="176" cy="120" r="3" fill="#F1CF68"/>' }
      },
      companion_penguin: {
        2: { front: '<path d="M75 92 L101 112 L127 92 M82 116 L101 130 L120 116" fill="none" stroke="#72BDD8" stroke-width="3" stroke-linecap="round"/><g fill="#C9F1FA"><circle cx="31" cy="55" r="3"/><circle cx="171" cy="49" r="3"/></g>' },
        3: { front: '<path d="M68 86 L101 113 L134 86 M74 117 L101 140 L128 117" fill="none" stroke="#58A9C8" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#AEE7F4" stroke-width="2"><path d="M24 52 h16 M32 44 v16 M26 46 l12 12 M38 46 l-12 12"/><path d="M164 42 h16 M172 34 v16 M166 36 l12 12 M178 36 l-12 12"/></g>' }
      },
      companion_shimaenaga: {
        2: { front: '<path d="M83 143 Q73 164 60 180 M129 143 Q139 164 152 180" fill="none" stroke="#91A2B4" stroke-width="3" stroke-linecap="round"/><g fill="#D8EDF7"><circle cx="33" cy="58" r="4"/><circle cx="177" cy="61" r="3"/></g>' },
        3: { back: '<path d="M47 54 Q106 7 165 54" fill="none" stroke="#F0D5E5" stroke-width="4" opacity=".8"/>', front: '<path d="M79 140 Q65 169 48 184 M133 140 Q147 169 164 184 M106 145 L106 184" fill="none" stroke="#7E93A8" stroke-width="3" stroke-linecap="round"/><g fill="#F2D6E5"><circle cx="25" cy="76" r="4"/><circle cx="187" cy="76" r="4"/></g>' }
      },
      companion_parakeet: {
        2: { front: '<path d="M81 91 Q99 74 119 89 M86 106 Q106 87 126 104 M85 31 Q91 17 97 32" fill="none" stroke="#3D8C4E" stroke-width="3" stroke-linecap="round"/><path d="M91 95 l9 5-8 6z" fill="#E8D65D"/>' },
        3: { front: '<path d="M75 85 Q99 60 124 83 M81 106 Q108 79 134 104 M82 31 Q91 10 99 31 M96 32 Q107 15 114 37 M92 151 L81 188 M112 151 L130 186" fill="none" stroke="#2F7741" stroke-width="3" stroke-linecap="round"/><g fill="#F2D35E"><path d="M161 70 v13 q9-5 9 3-1 8-11 4 v-20z"/><circle cx="31" cy="53" r="3"/></g>' }
      },
      companion_java_sparrow: {
        2: { front: '<path d="M106 83 Q126 68 147 83 M112 98 Q133 82 154 97 M96 126 Q110 137 124 126" fill="none" stroke="#8B777A" stroke-width="3" stroke-linecap="round"/>' },
        3: { front: '<path d="M99 77 Q126 57 153 79 M106 97 Q134 76 162 97 M89 126 Q110 143 131 126" fill="none" stroke="#736064" stroke-width="3" stroke-linecap="round"/><g fill="#F2B7C5"><path d="M30 57 q9-11 18 0-9 11-18 0z"/><path d="M183 46 q8-10 16 0-8 10-16 0z"/></g><circle cx="177" cy="121" r="3" fill="#F1CF68"/>' }
      },
      companion_ice_legend_bird: {
        2: { front: '<path d="M55 83 Q82 65 108 78 M195 83 Q168 65 142 78 M110 105 L125 120 L140 105" fill="none" stroke="#6DB9DE" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#BDEBFA" stroke-width="2"><path d="M31 51 h16 M39 43 v16 M33 45 l12 12 M45 45 l-12 12"/></g>' },
        3: { back: '<circle cx="125" cy="91" r="82" fill="none" stroke="#D9F5FC" stroke-width="5" opacity=".62"/>', front: '<path d="M44 77 Q80 50 113 72 M206 77 Q170 50 137 72 M104 104 L125 126 L146 104 M108 43 L124 16 L140 45" fill="none" stroke="#4D9FCB" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#D9F5FC" stroke-width="2"><path d="M20 48 h18 M29 39 v18 M22 41 l14 14 M36 41 l-14 14"/><path d="M212 45 h18 M221 36 v18 M214 38 l14 14 M228 38 l-14 14"/></g>' }
      },
      companion_thunder_legend_bird: {
        2: { front: '<path d="M108 91 Q125 76 142 91 M46 70 L60 78 L51 87 L68 96 M204 70 L190 78 L199 87 L182 96" fill="none" stroke="#FFF5B0" stroke-width="3" stroke-linecap="round"/><path d="M111 44 L124 23 L132 44" fill="none" stroke="#F28B31" stroke-width="3" stroke-linecap="round"/>' },
        3: { back: '<path d="M27 128 Q125 7 223 128" fill="none" stroke="#FFF2A0" stroke-width="5" opacity=".62"/>', front: '<path d="M101 87 Q125 66 149 87 M35 62 L54 74 L42 85 L64 98 M215 62 L196 74 L208 85 L186 98 M108 43 L124 14 L135 45" fill="none" stroke="#FFF8CF" stroke-width="3" stroke-linecap="round"/><g fill="#F28B31"><path d="M20 42 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M230 42 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>' }
      },
      companion_fire_legend_bird: {
        2: { front: '<g fill="#F7C76D"><path d="M43 88 q8-11 16 0-8 10-16 0z"/><path d="M191 88 q8-11 16 0-8 10-16 0z"/><path d="M82 111 q7-10 14 0-7 9-14 0z"/><path d="M154 111 q7-10 14 0-7 9-14 0z"/></g><path d="M102 125 Q125 139 148 125" fill="none" stroke="#D97852" stroke-width="3" stroke-linecap="round"/>' },
        3: { back: '<circle cx="125" cy="93" r="84" fill="none" stroke="#FFD99A" stroke-width="5" opacity=".55"/>', front: '<g fill="#F7D681"><path d="M30 78 q10-14 20 0-10 13-20 0z"/><path d="M200 78 q10-14 20 0-10 13-20 0z"/><path d="M73 153 q9-13 18 0-9 12-18 0z"/><path d="M159 153 q9-13 18 0-9 12-18 0z"/></g><path d="M96 120 Q125 143 154 120 M108 47 Q117 29 125 48 M125 48 Q136 29 144 51" fill="none" stroke="#CB684E" stroke-width="3" stroke-linecap="round"/>' }
      },
      companion_phoenix: {
        2: { front: '<path d="M51 78 Q80 55 111 75 M209 78 Q180 55 149 75 M108 116 L130 132 L152 116 M109 48 L118 31 L130 48 L142 30 L151 50" fill="none" stroke="#FFF4BC" stroke-width="3" stroke-linecap="round"/><g fill="#F3B94F"><path d="M78 178 q8-11 16 0-8 11-16 0z"/><path d="M166 178 q8-11 16 0-8 11-16 0z"/><circle cx="130" cy="102" r="4"/></g>' },
        3: { back: '<circle cx="130" cy="97" r="91" fill="none" stroke="#FFF6C9" stroke-width="6" opacity=".75"/><path d="M31 62 Q130 -11 229 62 M50 43 L25 20 M210 43 L235 20 M130 15 V0" fill="none" stroke="#F7D86B" stroke-width="4" stroke-linecap="round" opacity=".82"/>', front: '<path d="M41 72 Q78 43 116 68 M219 72 Q182 43 144 68 M100 116 Q130 141 160 116 M106 49 L119 22 L130 47 L143 20 L155 52" fill="none" stroke="#FFF9DF" stroke-width="3" stroke-linecap="round"/><g fill="#F5C84C"><path d="M18 58 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/><path d="M242 58 l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>' }
      },
      companion_quetzal: {
        2: { front: '<path d="M50 98 Q72 80 94 91 M171 96 Q148 79 128 91 M92 144 Q110 158 128 144 M91 164 Q84 194 83 226 M125 164 Q134 194 136 226" fill="none" stroke="#8FE1BF" stroke-width="3" stroke-linecap="round"/><path d="M92 40 Q100 24 108 41" fill="none" stroke="#F2C15D" stroke-width="3" stroke-linecap="round"/>' },
        3: { back: '<path d="M43 64 Q110 5 177 64" fill="none" stroke="#B9F0D8" stroke-width="4" stroke-linecap="round" opacity=".8"/>', front: '<path d="M39 94 Q69 68 99 86 M181 94 Q151 68 121 86 M86 141 Q110 164 134 141 M88 158 Q77 198 80 239 M128 158 Q142 198 140 239" fill="none" stroke="#A7EBCF" stroke-width="3" stroke-linecap="round"/><g fill="#F2D573"><path d="M25 74 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><path d="M195 74 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>' }
      }
    }
  };
})(window);
