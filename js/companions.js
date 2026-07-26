(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var SPECIES = [
    {
      id: "companion_chick",
      name: "ひよこ",
      displayOrder: 1,
      designVersion: 2,
      preferredWorldIds: ["world_secret_base", "world_forest", "world_island"],
      defaultColors: { body: "#FACC15", wing: "#FDE68A", beak: "#FB923C", leg: "#F59E0B" },
      viewBox: "0 0 160 140",
      transparentOuterBox: true,
      outlineStroke: "none",
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
      face: '<path d="M80 45 C83 42 88 43 90 46" fill="none" stroke="#5b4631" stroke-width="2.3" stroke-linecap="round"/><path d="M101 51 C96 55 91 55 87 52" fill="none" stroke="#8a5b20" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_duck",
      name: "あひる",
      displayOrder: 2,
      designVersion: 2,
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
        { id: "beak", d: "M64 45 C49 39 32 42 26 50 C34 59 51 61 64 55 Z", fill: "#F97316" },
        { id: "feet", d: "M81 120 C75 126 66 128 59 124 M117 120 C126 126 136 127 143 123", fill: "none" }
      ],
      inner: [
        "M91 75 C108 82 121 88 135 96",
        "M53 93 C71 104 112 108 142 96"
      ],
      face: '<circle cx="93" cy="43" r="4" fill="#1f2937"/><path d="M60 51 C51 53 40 53 30 50" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_parrot",
      name: "オウム",
      displayOrder: 3,
      designVersion: 2,
      preferredWorldIds: ["world_island", "world_sky_island", "world_secret_base"],
      defaultColors: { head: "#EF4444", body: "#22C55E", wing: "#3B82F6", tail: "#FACC15", beak: "#FDE68A" },
      viewBox: "0 0 170 150",
      transparentOuterBox: true,
      outlineStroke: "none",
      innerStroke: "none",
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
      designVersion: 4,
      preferredWorldIds: ["world_castle", "world_sky_island", "world_island"],
      defaultColors: { body: "#2563EB", neck: "#38BDF8", tail: "#22C55E", eye: "#FACC15" },
      viewBox: "-105 -100 420 260",
      peacockTailTransform: "translate(-105 -100) scale(2)",
      peacockBodyTransform: "translate(26.25 25) scale(0.75)",
      peacockTailScale: 2,
      peacockBodyScale: 0.75,
      outer: [
        "M6 124 C8 48 59 4 105 32 C151 4 202 49 204 124 C165 88 129 90 111 119 C92 90 45 88 6 124 Z",
        "M96 47 C110 38 126 48 128 64 C130 82 119 96 105 96 C90 96 80 83 83 67 C84 58 88 51 96 47 Z"
      ],
      regions: [
        { id: "tail", d: "M6 124 C8 48 59 4 105 32 C151 4 202 49 204 124 C165 88 129 90 111 119 C92 90 45 88 6 124 Z", fill: "#22C55E" },
        { id: "body", d: "M86 76 C100 62 124 68 132 88 C143 114 122 135 101 131 C78 127 68 102 78 85 C80 81 83 78 86 76 Z", fill: "#2563EB" },
        { id: "neck", d: "M96 47 C108 40 122 49 123 64 C124 80 113 92 101 91 C88 90 83 77 87 64 C89 56 92 51 96 47 Z", fill: "#38BDF8" },
        { id: "crest", d: "M99 45 C94 34 96 28 103 22 M108 45 C111 34 116 29 123 27 M103 45 C103 33 108 27 112 21", fill: "none" },
        { id: "tail_eyes", d: "M36 92 C43 82 57 83 62 94 C56 104 43 104 36 92 Z M68 49 C76 38 91 40 97 52 C90 63 76 62 68 49 Z M103 34 C112 22 128 25 134 38 C127 50 112 48 103 34 Z M139 50 C148 39 163 41 169 54 C162 66 147 64 139 50 Z M169 93 C177 83 191 84 196 96 C190 106 176 105 169 93 Z", fill: "#FACC15" }
      ],
      inner: [
        "M105 32 C101 58 101 88 111 119",
        "M56 28 C78 60 92 88 104 116",
        "M154 30 C132 61 119 89 111 119",
        "M26 92 C56 96 82 103 104 116",
        "M184 94 C153 97 130 104 113 116",
        "M82 88 C95 98 116 100 131 90"
      ],
      face: '<circle cx="111" cy="61" r="3.5" fill="#1f2937"/><path d="M121 68 L134 72 L121 77 Z" fill="#FACC15"/>'
    },
    {
      id: "companion_owl",
      name: "ふくろう",
      displayOrder: 5,
      designVersion: 2,
      preferredWorldIds: ["world_forest", "world_secret_base", "world_castle"],
      defaultColors: { body: "#92400E", face: "#FDE68A", wing: "#A16207", beak: "#F59E0B" },
      viewBox: "0 0 170 150",
      transparentOuterBox: true,
      outlineStroke: "none",
      innerStroke: "none",
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
      face: '<circle cx="78" cy="59" r="6" fill="#4b2f1e"/><circle cx="111" cy="59" r="6" fill="#4b2f1e"/><circle cx="80" cy="57" r="2" fill="#fff"/><circle cx="113" cy="57" r="2" fill="#fff"/>'
    },
    {
      id: "companion_sparrow",
      name: "すずめ",
      displayOrder: 6,
      designVersion: 2,
      preferredWorldIds: ["world_forest", "world_secret_base", "world_sky_island"],
      defaultColors: { body: "#B45309", belly: "#FDE68A", wing: "#92400E", beak: "#D97706" },
      viewBox: "0 0 170 130",
      outer: [
        "M32 56 L53 48 C59 34 78 27 96 31 C113 35 127 47 131 63 C143 68 153 79 158 91 C144 99 130 99 118 93 C106 114 72 119 49 103 C31 91 33 67 53 57 Z"
      ],
      regions: [
        { id: "body", d: "M55 59 C72 45 107 48 124 66 C143 86 123 111 91 113 C61 115 40 98 43 78 C44 70 48 64 55 59 Z", fill: "#B45309" },
        { id: "head", d: "M55 37 C68 24 91 27 101 42 C111 58 97 72 78 70 C60 69 48 57 51 45 C52 42 53 39 55 37 Z", fill: "#8B5A2B" },
        { id: "belly", d: "M66 82 C82 75 108 79 120 94 C106 108 76 109 58 96 C58 89 61 85 66 82 Z", fill: "#F6D7A8" },
        { id: "wing", d: "M82 61 C103 61 119 74 122 93 C104 98 87 85 82 61 Z", fill: "#6B3F1D" },
        { id: "tail", d: "M124 68 L158 86 L128 96 Z", fill: "#6B3F1D" },
        { id: "beak", d: "M53 49 L31 56 L54 61 Z", fill: "#D97706" },
        { id: "legs", d: "M74 112 L70 124 M98 112 L103 124", fill: "none" }
      ],
      inner: [
        "M84 62 C95 73 106 83 120 92",
        "M63 45 C73 38 88 39 98 48",
        "M57 69 C65 74 76 76 86 74",
        "M70 124 C63 127 58 127 53 124 M103 124 C110 127 116 127 121 124"
      ],
      face: '<circle cx="76" cy="48" r="3.4" fill="#1f2937"/><path d="M55 63 C63 67 73 68 83 66" fill="none" stroke="#7c2d12" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_penguin",
      name: "ぺんぎん",
      displayOrder: 7,
      designVersion: 1,
      preferredWorldIds: ["world_sea", "world_island", "world_secret_base"],
      defaultColors: { body: "#243B53", belly: "#F8FAFC", wing: "#334E68", beak: "#F59E0B", leg: "#F59E0B" },
      viewBox: "0 0 170 150",
      transparentOuterBox: true,
      outlineStroke: "none",
      innerStroke: "#486581",
      outer: [
        "M85 10 C111 10 130 34 129 62 C144 72 151 91 145 108 C139 125 122 132 106 130 C101 141 94 146 85 146 C76 146 69 141 64 130 C47 132 31 124 25 108 C19 91 26 73 41 62 C40 34 59 10 85 10 Z"
      ],
      regions: [
        { id: "body", d: "M85 12 C110 12 128 34 126 66 C139 79 142 102 130 117 C118 132 101 132 85 128 C68 132 51 131 40 117 C28 101 31 79 44 66 C42 34 60 12 85 12 Z", fill: "#243B53" },
        { id: "belly", d: "M61 52 C72 42 98 42 109 52 C121 66 120 103 105 119 C94 130 76 130 65 119 C50 103 49 67 61 52 Z", fill: "#F8FAFC" },
        { id: "face_patch", d: "M57 34 C64 21 78 21 85 32 C92 21 107 22 113 35 C108 50 99 58 85 57 C71 58 61 50 57 34 Z", fill: "#F8FAFC" },
        { id: "wing_left", d: "M45 61 C28 70 22 88 28 104 C39 99 48 86 53 70 Z", fill: "#334E68" },
        { id: "wing_right", d: "M125 61 C142 70 148 88 142 104 C131 99 122 86 117 70 Z", fill: "#334E68" },
        { id: "beak", d: "M76 51 L85 45 L95 51 L85 58 Z", fill: "#F59E0B" },
        { id: "feet", d: "M64 127 C57 134 49 137 41 134 C48 127 56 124 65 124 Z M106 127 C113 134 121 137 129 134 C122 127 114 124 105 124 Z", fill: "#F59E0B" }
      ],
      inner: [
        "M53 70 C45 79 40 89 37 99",
        "M117 70 C125 79 130 89 133 99",
        "M66 117 C76 123 94 123 104 117"
      ],
      face: '<circle cx="72" cy="39" r="3.2" fill="#17202A"/><circle cx="98" cy="39" r="3.2" fill="#17202A"/><circle cx="73" cy="38" r="1" fill="#fff"/><circle cx="99" cy="38" r="1" fill="#fff"/>'
    },
    {
      id: "companion_shimaenaga",
      name: "しまえなが",
      displayOrder: 8,
      designVersion: 1,
      preferredWorldIds: ["world_forest", "world_sky_island", "world_secret_base"],
      defaultColors: { body: "#FFFFFF", wing: "#CBD5E1", tail: "#94A3B8", beak: "#475569", leg: "#8B5E3C" },
      viewBox: "0 0 190 140",
      transparentOuterBox: true,
      outlineStroke: "#B6C2CF",
      outlineWidth: 2.4,
      innerStroke: "#94A3B8",
      innerWidth: 1.9,
      outer: [
        "M30 67 C35 39 61 21 91 25 C117 28 134 45 137 67 C153 73 169 88 181 109 C158 108 139 101 123 91 C110 112 82 122 57 113 C37 106 25 88 30 67 Z",
        "M121 88 C148 96 168 111 178 132 C153 127 132 115 113 99 Z",
        "M112 94 C135 108 148 123 151 137 C130 128 112 116 99 103 Z"
      ],
      regions: [
        { id: "body", d: "M32 67 C36 40 61 23 90 26 C117 28 134 47 134 72 C135 97 115 115 87 116 C58 117 35 103 30 82 C29 77 30 72 32 67 Z", fill: "#FFFFFF" },
        { id: "head", d: "M47 48 C57 27 86 20 109 30 C126 38 133 54 127 69 C116 75 104 75 92 68 C78 76 61 74 49 65 C46 59 45 53 47 48 Z", fill: "#F8FAFC" },
        { id: "wing", d: "M80 70 C100 65 119 77 121 96 C106 106 84 98 80 70 Z", fill: "#CBD5E1" },
        { id: "tail", d: "M121 88 C148 96 168 111 178 132 C153 127 132 115 113 99 Z M112 94 C135 108 148 123 151 137 C130 128 112 116 99 103 Z", fill: "#94A3B8" },
        { id: "beak", d: "M48 56 L34 61 L49 65 Z", fill: "#475569" },
        { id: "legs", d: "M67 111 L64 127 M96 113 L99 128", fill: "none" }
      ],
      inner: [
        "M80 70 C91 78 105 88 119 96",
        "M56 73 C68 79 82 79 92 68",
        "M64 127 C58 131 52 131 47 128 M99 128 C105 132 111 132 116 129"
      ],
      face: '<circle cx="69" cy="54" r="2.8" fill="#334155"/><circle cx="104" cy="53" r="2.8" fill="#334155"/><circle cx="57" cy="66" r="4" fill="#FBCFE8" opacity="0.8"/><circle cx="116" cy="65" r="4" fill="#FBCFE8" opacity="0.8"/>'
    },
    {
      id: "companion_parakeet",
      name: "いんこ",
      displayOrder: 9,
      designVersion: 1,
      preferredWorldIds: ["world_island", "world_sky_island", "world_secret_base"],
      defaultColors: { body: "#84CC16", head: "#BEF264", wing: "#22C55E", tail: "#15803D", beak: "#F59E0B", leg: "#A16207" },
      viewBox: "0 0 175 155",
      transparentOuterBox: true,
      outlineStroke: "none",
      innerStroke: "#3F6212",
      outer: [
        "M65 21 C88 10 114 24 119 49 C121 62 117 73 109 82 C121 96 128 119 129 145 L99 116 C91 134 67 137 50 123 C32 108 31 78 47 61 C43 44 50 29 65 21 Z",
        "M102 105 L147 148 L116 139 L91 119 Z"
      ],
      regions: [
        { id: "body", d: "M55 61 C76 50 103 61 110 84 C119 111 99 132 76 130 C50 128 36 103 43 80 C46 71 50 65 55 61 Z", fill: "#84CC16" },
        { id: "head", d: "M64 22 C86 12 110 25 115 47 C119 66 104 80 84 78 C64 77 49 62 51 45 C52 35 56 27 64 22 Z", fill: "#BEF264" },
        { id: "cheek", d: "M86 43 C99 39 111 47 111 59 C104 67 94 67 85 61 Z", fill: "#FDE68A" },
        { id: "wing", d: "M70 73 C94 70 111 85 111 108 C94 119 73 102 70 73 Z", fill: "#22C55E" },
        { id: "tail", d: "M96 109 L147 148 L116 139 L86 118 Z", fill: "#15803D" },
        { id: "beak", d: "M111 49 C127 49 134 58 127 69 C119 65 114 59 111 49 Z", fill: "#F59E0B" },
        { id: "feet", d: "M63 127 C60 136 55 140 48 142 M82 130 C85 138 91 142 98 143", fill: "none" }
      ],
      inner: [
        "M70 73 C82 84 94 96 108 107",
        "M59 48 C66 40 77 37 87 41",
        "M55 113 C66 123 84 127 99 118"
      ],
      face: '<circle cx="88" cy="43" r="3.5" fill="#1F2937"/><circle cx="89" cy="42" r="1.1" fill="#fff"/><circle cx="101" cy="57" r="2.2" fill="#3B82F6"/><circle cx="96" cy="62" r="2" fill="#3B82F6"/>'
    },
    {
      id: "companion_java_sparrow",
      name: "ぶんちょう",
      displayOrder: 10,
      designVersion: 1,
      preferredWorldIds: ["world_forest", "world_secret_base", "world_castle"],
      defaultColors: { body: "#F8FAFC", head: "#475569", wing: "#94A3B8", tail: "#475569", beak: "#FB7185", leg: "#E8798A" },
      viewBox: "0 0 175 140",
      transparentOuterBox: true,
      outlineStroke: "#94A3B8",
      outlineWidth: 2.4,
      innerStroke: "#64748B",
      innerWidth: 1.9,
      outer: [
        "M38 61 C44 39 65 26 89 28 C111 29 128 42 133 61 C148 66 159 78 164 91 C151 99 138 100 126 94 C116 113 90 121 65 114 C42 107 29 88 38 61 Z",
        "M123 79 L159 91 L130 101 Z"
      ],
      regions: [
        { id: "body", d: "M49 62 C68 49 106 51 124 68 C141 84 124 109 96 114 C67 120 41 106 40 84 C40 74 43 67 49 62 Z", fill: "#F8FAFC" },
        { id: "head", d: "M57 39 C69 25 93 25 106 39 C118 53 108 69 91 72 C73 74 55 63 53 49 C53 45 55 41 57 39 Z", fill: "#475569" },
        { id: "cheek", d: "M60 48 C67 38 79 37 87 45 C91 55 84 64 73 64 C65 63 60 57 60 48 Z", fill: "#FFFFFF" },
        { id: "belly", d: "M62 76 C79 67 106 73 118 91 C104 108 76 111 57 98 C55 89 57 81 62 76 Z", fill: "#FFFDF7" },
        { id: "wing", d: "M86 64 C107 64 124 76 126 94 C108 102 90 90 86 64 Z", fill: "#94A3B8" },
        { id: "tail", d: "M123 79 L159 91 L130 101 Z", fill: "#475569" },
        { id: "beak", d: "M55 49 L34 56 L56 62 Z", fill: "#FB7185" },
        { id: "legs", d: "M71 112 L68 127 M99 112 L103 127", fill: "none" }
      ],
      inner: [
        "M87 65 C98 75 111 84 124 93",
        "M62 76 C74 81 87 81 98 75",
        "M68 127 C62 131 56 131 51 128 M103 127 C109 131 115 131 120 128"
      ],
      face: '<circle cx="76" cy="46" r="3.2" fill="#17202A"/><circle cx="77" cy="45" r="1" fill="#fff"/><path d="M57 63 C64 67 72 68 79 66" fill="none" stroke="#E8798A" stroke-width="1.8" stroke-linecap="round"/>'
    },
    {
      id: "companion_ice_legend_bird",
      name: "こおりの でんせつどり",
      displayOrder: 11,
      designVersion: 1,
      preferredWorldIds: ["world_sky_island", "world_castle", "world_sea"],
      defaultColors: { body: "#60A5FA", chest: "#F8FAFC", wing: "#93C5FD", tail: "#38BDF8", beak: "#D9F4FF", leg: "#2563EB" },
      viewBox: "0 0 230 170",
      transparentOuterBox: true,
      outlineStroke: "#60A5FA",
      outlineWidth: 2.4,
      innerStroke: "#3B82F6",
      innerWidth: 2,
      outer: [
        "M91 41 C102 23 126 20 140 35 C150 45 151 60 145 71 C165 65 190 51 218 38 C210 66 191 89 157 102 C150 121 135 134 115 134 C94 134 79 121 72 102 C39 89 20 66 12 38 C40 51 65 65 85 71 C79 60 81 48 91 41 Z",
        "M94 126 L77 165 L111 143 L115 168 L125 143 L159 165 L137 126 Z"
      ],
      regions: [
        { id: "left_wing", d: "M84 69 C61 65 35 52 13 39 C22 65 42 88 75 99 C84 92 89 81 84 69 Z", fill: "#93C5FD" },
        { id: "right_wing", d: "M146 69 C169 65 195 52 217 39 C208 65 188 88 155 99 C146 92 141 81 146 69 Z", fill: "#93C5FD" },
        { id: "body", d: "M92 57 C104 42 128 42 140 57 C154 75 153 105 137 123 C124 138 104 138 91 123 C75 105 76 76 92 57 Z", fill: "#60A5FA" },
        { id: "chest", d: "M99 73 C108 66 123 66 132 74 C141 87 139 111 128 123 C120 132 109 132 101 123 C89 110 89 87 99 73 Z", fill: "#F8FAFC" },
        { id: "head", d: "M92 41 C103 23 127 21 140 36 C152 50 147 69 132 76 C117 83 96 76 88 62 C84 54 86 47 92 41 Z", fill: "#BFDBFE" },
        { id: "crest", d: "M101 30 L111 7 L118 29 L136 12 L132 37 Z", fill: "#E0F2FE" },
        { id: "tail", d: "M94 126 L77 165 L111 143 L115 168 L125 143 L159 165 L137 126 Z", fill: "#38BDF8" },
        { id: "beak", d: "M138 53 L157 60 L138 67 Z", fill: "#D9F4FF" },
        { id: "feet", d: "M103 130 L98 145 M128 130 L133 145", fill: "none" }
      ],
      inner: [
        "M80 71 C57 69 36 58 21 47",
        "M150 71 C173 69 194 58 209 47",
        "M95 83 C105 91 125 92 136 83",
        "M99 123 C108 130 123 130 132 123",
        "M98 145 C91 149 85 149 79 146 M133 145 C140 149 146 149 152 146"
      ],
      face: '<circle cx="116" cy="48" r="3.4" fill="#1E3A8A"/><circle cx="117" cy="47" r="1.1" fill="#fff"/><path d="M100 58 C107 63 116 64 124 60" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_thunder_legend_bird",
      name: "でんせつの かみなりのとり",
      displayOrder: 12,
      designVersion: 1,
      preferredWorldIds: ["world_sky_island", "world_secret_base", "world_castle"],
      defaultColors: { body: "#4F83B3", chest: "#FFF7DD", wing: "#80C7E8", tail: "#5AA6D6", beak: "#F6D66A", leg: "#476A87" },
      viewBox: "0 0 240 170",
      transparentOuterBox: true,
      outlineStroke: "#386B93",
      outlineWidth: 2.6,
      innerStroke: "#4F83B3",
      innerWidth: 2,
      outer: [
        "M92 69 C70 64 48 49 20 35 C15 55 23 73 39 84 C28 87 21 96 22 108 C48 111 70 103 91 90 Z",
        "M148 69 C170 64 192 49 220 35 C225 55 217 73 201 84 C212 87 219 96 218 108 C192 111 170 103 149 90 Z",
        "M94 54 C103 39 126 36 140 49 C156 64 157 103 142 126 C132 143 108 143 98 126 C83 103 80 74 94 54 Z",
        "M98 43 C94 31 99 20 108 16 C111 25 114 31 119 35 C123 25 131 20 140 22 C135 32 134 39 137 47 Z",
        "M98 122 C87 136 83 150 86 164 L113 143 L120 166 L128 143 L155 164 C157 149 151 135 141 122 Z"
      ],
      regions: [
        { id: "left_wing", d: "M91 69 C69 64 48 50 21 37 C18 54 25 70 42 82 C32 88 27 96 26 104 C49 107 70 99 90 88 Z", fill: "#80C7E8" },
        { id: "right_wing", d: "M149 69 C171 64 192 50 219 37 C222 54 215 70 198 82 C208 88 213 96 214 104 C191 107 170 99 150 88 Z", fill: "#80C7E8" },
        { id: "body", d: "M96 57 C106 43 127 42 138 54 C153 70 152 103 139 124 C129 140 110 140 100 124 C87 103 85 73 96 57 Z", fill: "#4F83B3" },
        { id: "chest_cloud", d: "M100 82 C99 73 108 67 116 71 C121 63 133 66 134 76 C144 77 147 89 139 95 C142 109 133 126 120 129 C107 126 98 110 101 96 C91 91 92 80 100 82 Z", fill: "#FFF7DD" },
        { id: "head", d: "M96 49 C105 36 126 34 139 47 C151 59 145 76 131 82 C116 88 96 81 90 67 C87 59 90 53 96 49 Z", fill: "#A8DDF0" },
        { id: "crest", d: "M99 43 C96 32 100 22 108 18 C110 27 114 33 119 37 C123 28 130 23 138 24 C134 34 133 40 136 46 Z", fill: "#DDF4FA" },
        { id: "tail", d: "M99 121 C89 136 86 149 88 160 L113 141 L120 164 L128 141 L153 160 C154 147 149 135 140 121 Z", fill: "#5AA6D6" },
        { id: "lightning_marks", d: "M44 58 C52 60 58 63 65 67 L59 73 C66 76 72 80 78 86 C67 82 57 78 48 72 L55 67 C50 64 46 62 44 58 Z M196 58 C188 60 182 63 175 67 L181 73 C174 76 168 80 162 86 C173 82 183 78 192 72 L185 67 C190 64 194 62 196 58 Z", fill: "#F6D66A" },
        { id: "beak", d: "M138 57 C153 58 159 65 153 74 C146 70 141 65 138 57 Z", fill: "#F6D66A" },
        { id: "feet", d: "M107 135 L103 151 M132 135 L137 151", fill: "none" }
      ],
      inner: [
        "M34 74 C48 78 63 84 78 91",
        "M206 74 C192 78 177 84 162 91",
        "M99 91 C109 98 130 99 140 91",
        "M103 124 C111 132 129 132 137 124",
        "M103 151 C96 155 90 155 84 152 M137 151 C144 155 150 155 156 152"
      ],
      face: '<circle cx="115" cy="55" r="3.5" fill="#24445F"/><circle cx="116" cy="54" r="1.1" fill="#fff"/><path d="M100 65 C107 71 118 72 126 67" fill="none" stroke="#386B93" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: "companion_fire_legend_bird",
      name: "でんせつの ほのおのとり",
      displayOrder: 13,
      designVersion: 1,
      preferredWorldIds: ["world_castle", "world_sky_island", "world_island"],
      defaultColors: { body: "#E56F61", chest: "#FFF0D6", wing: "#F39A67", tail: "#D95D52", beak: "#F6CF72", leg: "#9B5A46" },
      viewBox: "0 0 240 170",
      transparentOuterBox: true,
      outlineStroke: "#9F5A4D",
      outlineWidth: 2.6,
      innerStroke: "#B96A54",
      innerWidth: 2,
      outer: [
        "M92 69 C69 65 44 51 17 37 C17 57 27 75 45 84 C34 90 28 99 29 110 C52 111 73 102 93 90 Z",
        "M148 69 C171 65 196 51 223 37 C223 57 213 75 195 84 C206 90 212 99 211 110 C188 111 167 102 147 90 Z",
        "M94 52 C106 37 129 38 141 52 C156 69 155 104 141 127 C131 143 109 143 99 127 C84 104 82 70 94 52 Z",
        "M95 121 C75 133 61 148 55 164 L93 150 L120 166 L147 150 L185 164 C179 147 165 133 145 121 Z"
      ],
      regions: [
        { id: "left_wing", d: "M92 69 C70 65 45 52 19 39 C20 57 29 72 47 82 C38 89 33 97 33 106 C55 107 75 99 93 88 Z", fill: "#F39A67" },
        { id: "right_wing", d: "M148 69 C170 65 195 52 221 39 C220 57 211 72 193 82 C202 89 207 97 207 106 C185 107 165 99 147 88 Z", fill: "#F39A67" },
        { id: "left_wing_layer", d: "M49 57 C61 63 74 70 88 75 L84 89 C68 84 54 77 42 68 Z", fill: "#F7B57D" },
        { id: "right_wing_layer", d: "M191 57 C179 63 166 70 152 75 L156 89 C172 84 186 77 198 68 Z", fill: "#F7B57D" },
        { id: "body", d: "M96 55 C107 42 128 42 139 55 C153 72 152 103 138 125 C129 140 111 140 101 125 C87 103 85 72 96 55 Z", fill: "#E56F61" },
        { id: "chest_petal", d: "M120 70 C132 81 135 96 128 108 C124 115 116 115 111 108 C103 96 107 81 120 70 Z", fill: "#FFF0D6" },
        { id: "head", d: "M96 48 C108 35 129 37 140 50 C151 63 144 79 129 84 C114 89 96 81 90 67 C87 59 90 53 96 48 Z", fill: "#F2A177" },
        { id: "tail", d: "M96 120 C77 132 64 145 59 159 L94 147 L120 163 L146 147 L181 159 C176 145 163 132 144 120 Z", fill: "#D95D52" },
        { id: "spark_marks", d: "M44 91 C48 86 53 86 56 91 C53 97 47 97 44 91 Z M66 101 C70 96 75 97 78 102 C74 107 69 107 66 101 Z M184 91 C187 86 192 86 196 91 C193 97 187 97 184 91 Z M162 102 C165 97 170 96 174 101 C171 107 166 107 162 102 Z M82 145 C86 140 91 140 94 146 C90 151 85 151 82 145 Z M146 145 C149 140 154 140 158 145 C155 151 149 151 146 145 Z", fill: "#F6CF72" },
        { id: "beak", d: "M139 57 C154 58 160 65 154 74 C147 70 142 65 139 57 Z", fill: "#F6CF72" },
        { id: "feet", d: "M107 135 L103 151 M132 135 L137 151", fill: "none" }
      ],
      inner: [
        "M29 64 C45 72 63 81 82 89",
        "M211 64 C195 72 177 81 158 89",
        "M49 57 C61 64 74 71 88 75",
        "M191 57 C179 64 166 71 152 75",
        "M101 124 C111 132 129 132 139 124",
        "M103 151 C96 155 90 155 84 152 M137 151 C144 155 150 155 156 152"
      ],
      face: '<circle cx="116" cy="54" r="3.5" fill="#6B3B32"/><circle cx="117" cy="53" r="1.1" fill="#fff"/><path d="M101 65 C108 71 119 71 127 66" fill="none" stroke="#9F5A4D" stroke-width="2" stroke-linecap="round"/>'
    }
  ];

  var EVOLUTION_STAGE_LABELS = {
    1: "ちいさなすがた",
    2: "せいちょうしたすがた",
    3: "とくべつなすがた"
  };

  var EVOLUTION_DECORATIONS = {
    companion_chick: {
      2: {
        front: '<path d="M43 79 Q55 69 67 78 M96 78 Q108 69 119 79 M74 28 Q78 19 82 28" fill="none" stroke="#E3A827" stroke-width="3" stroke-linecap="round"/><path d="M53 76 l7 5 -8 3 M109 76 l-7 5 8 3" fill="#FFF1A8"/>'
      },
      3: {
        front: '<path d="M38 72 Q53 58 69 70 M94 70 Q110 58 125 72 M70 27 Q76 13 81 27 M82 27 Q88 14 92 29" fill="none" stroke="#D99B1E" stroke-width="3" stroke-linecap="round"/><g fill="#F7C948"><path d="M25 48 l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/><path d="M132 42 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>'
      }
    },
    companion_duck: {
      2: {
        front: '<path d="M58 83 Q72 72 88 78 M72 92 Q85 82 100 88" fill="none" stroke="#E6A83B" stroke-width="3" stroke-linecap="round"/><path d="M93 54 Q100 64 93 70 Q86 64 93 54Z" fill="#BDEBFA" stroke="#6AB7D6" stroke-width="2"/>'
      },
      3: {
        front: '<path d="M49 76 Q70 59 94 70 M54 91 Q76 72 103 83 M111 94 Q123 86 136 91" fill="none" stroke="#D99A32" stroke-width="3" stroke-linecap="round"/><g fill="#8FD7F2"><circle cx="35" cy="49" r="4"/><circle cx="141" cy="39" r="3"/><path d="M27 71 q5-9 10 0 q-5 7-10 0z"/></g>'
      }
    },
    companion_parrot: {
      2: {
        front: '<path d="M49 82 Q63 68 78 74 M54 94 Q68 80 83 86 M82 35 Q86 23 90 36" fill="none" stroke="#2F8F65" stroke-width="3" stroke-linecap="round"/><path d="M61 84 l8 4 -7 5z" fill="#F4D35E"/>'
      },
      3: {
        front: '<path d="M42 75 Q62 56 82 67 M47 91 Q68 70 88 82 M82 35 Q86 18 91 35 M91 36 Q97 22 101 39 M91 116 l-6 19 M101 116 l5 20" fill="none" stroke="#247A59" stroke-width="3" stroke-linecap="round"/><g fill="#F4D35E"><circle cx="29" cy="55" r="3"/><circle cx="136" cy="48" r="3"/><path d="M139 67 v11 q8-4 8 2 q-1 7-10 4 v-17z"/></g>'
      }
    },
    companion_peacock: {
      2: {
        front: '<g fill="none" stroke="#D8B84D" stroke-width="3"><circle cx="-55" cy="-30" r="10"/><circle cx="192" cy="-31" r="10"/></g><g fill="#5CB7A5"><circle cx="-55" cy="-30" r="4"/><circle cx="192" cy="-31" r="4"/></g>'
      },
      3: {
        front: '<g fill="none" stroke="#E8CE65" stroke-width="3"><circle cx="-74" cy="10" r="9"/><circle cx="210" cy="10" r="9"/><circle cx="69" cy="-73" r="10"/></g><g fill="#2F8C86"><circle cx="-74" cy="10" r="3.5"/><circle cx="210" cy="10" r="3.5"/><circle cx="69" cy="-73" r="4"/></g><g fill="#F5D96F"><path d="M-91 -39 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M224 -37 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>'
      }
    },
    companion_owl: {
      2: {
        front: '<path d="M55 87 l10 8 10-8 10 8 10-8 M65 105 l10 7 10-7" fill="none" stroke="#A77B4D" stroke-width="3" stroke-linecap="round"/><path d="M55 39 l8-9 5 12 M104 39 l-8-9-5 12" fill="#D7B27B"/>'
      },
      3: {
        front: '<path d="M48 81 l13 10 13-10 13 10 13-10 M55 101 l11 9 11-9 11 9 11-9" fill="none" stroke="#93663E" stroke-width="3" stroke-linecap="round"/><g fill="#F2CD61"><path d="M30 46 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M130 38 q-10 11 1 20-17-2-14-14 2-7 13-6z"/></g>'
      }
    },
    companion_sparrow: {
      2: {
        front: '<path d="M51 75 Q65 63 80 70 M56 86 Q70 73 84 81 M97 104 l8 15" fill="none" stroke="#8B6546" stroke-width="3" stroke-linecap="round"/><path d="M39 50 q8-7 15 0-7 8-15 0z" fill="#E8B78D"/>'
      },
      3: {
        front: '<path d="M43 70 Q64 51 84 65 M49 86 Q70 66 90 80 M94 103 l6 21 M103 102 l12 18" fill="none" stroke="#765338" stroke-width="3" stroke-linecap="round"/><g fill="#EAAE8A"><path d="M25 54 q7-10 14 0-7 9-14 0z"/><path d="M132 42 q6-9 12 0-6 8-12 0z"/></g><circle cx="126" cy="74" r="3" fill="#F2CF69"/>'
      }
    },
    companion_penguin: {
      2: {
        front: '<path d="M68 73 l15 14 15-14 M74 92 l9 9 9-9" fill="none" stroke="#83CDE5" stroke-width="3" stroke-linecap="round"/><g fill="#C9F1FA"><circle cx="39" cy="54" r="3"/><circle cx="130" cy="48" r="3"/></g>'
      },
      3: {
        front: '<path d="M61 68 l22 19 22-19 M66 91 l17 15 17-15" fill="none" stroke="#65B9D6" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#AEE7F4" stroke-width="2"><path d="M31 52 h14 M38 45 v14 M33 47 l10 10 M43 47 l-10 10"/><path d="M124 40 h14 M131 33 v14 M126 35 l10 10 M136 35 l-10 10"/></g>'
      }
    },
    companion_shimaenaga: {
      2: {
        front: '<path d="M82 96 Q73 117 61 133 M98 96 Q105 117 117 132" fill="none" stroke="#A8B6C5" stroke-width="3" stroke-linecap="round"/><g fill="#D8EDF7"><circle cx="48" cy="47" r="4"/><circle cx="139" cy="52" r="3"/></g>'
      },
      3: {
        front: '<path d="M79 94 Q67 121 51 137 M99 94 Q111 121 128 137 M88 99 L87 137" fill="none" stroke="#91A6BA" stroke-width="3" stroke-linecap="round"/><path d="M45 38 Q91 8 143 39" fill="none" stroke="#E4C6DA" stroke-width="3" stroke-linecap="round"/><g fill="#F2D6E5"><circle cx="34" cy="61" r="4"/><circle cx="151" cy="64" r="4"/></g>'
      }
    },
    companion_parakeet: {
      2: {
        front: '<path d="M50 82 Q64 67 80 74 M55 95 Q70 79 86 87 M84 37 Q88 24 93 38" fill="none" stroke="#4E9F58" stroke-width="3" stroke-linecap="round"/><path d="M61 82 l8 5-8 5z" fill="#8ED16C"/>'
      },
      3: {
        front: '<path d="M43 75 Q63 55 84 68 M49 92 Q70 70 91 83 M84 37 Q89 18 94 37 M94 38 Q101 23 105 41 M87 119 l-6 23 M99 118 l8 23" fill="none" stroke="#3C8748" stroke-width="3" stroke-linecap="round"/><g fill="#F2D35E"><path d="M137 61 v12 q8-4 8 3-1 7-10 3 v-18z"/><circle cx="29" cy="52" r="3"/></g>'
      }
    },
    companion_java_sparrow: {
      2: {
        front: '<path d="M56 78 Q70 65 85 73 M61 91 Q75 78 90 86 M87 99 Q94 106 101 99" fill="none" stroke="#9C7D86" stroke-width="3" stroke-linecap="round"/>'
      },
      3: {
        front: '<path d="M48 72 Q69 53 89 68 M54 89 Q76 69 96 84 M78 102 Q88 113 99 102" fill="none" stroke="#82636D" stroke-width="3" stroke-linecap="round"/><g fill="#F2B7C5"><path d="M32 51 q8-10 16 0-8 10-16 0z"/><path d="M137 45 q7-9 14 0-7 9-14 0z"/></g><circle cx="129" cy="73" r="3" fill="#F3D36B"/>'
      }
    },
    companion_ice_legend_bird: {
      2: {
        front: '<path d="M54 77 Q75 62 95 72 M176 77 Q155 62 135 72 M104 91 l11 12 11-12" fill="none" stroke="#7FC8EB" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#BDEBFA" stroke-width="2"><path d="M37 52 h14 M44 45 v14 M39 47 l10 10 M49 47 l-10 10"/></g>'
      },
      3: {
        front: '<path d="M45 70 Q73 48 101 64 M185 70 Q157 48 129 64 M99 90 l16 17 16-17 M104 31 Q114 15 124 32" fill="none" stroke="#5EAFDC" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#D9F5FC" stroke-width="2"><path d="M25 48 h16 M33 40 v16 M27 42 l12 12 M39 42 l-12 12"/><path d="M190 43 h16 M198 35 v16 M192 37 l12 12 M204 37 l-12 12"/></g>'
      }
    },
    companion_thunder_legend_bird: {
      2: {
        front: '<path d="M91 87 Q105 76 120 84 Q135 76 150 87 M53 70 l11 7-8 7 12 7 M187 70 l-11 7 8 7-12 7" fill="none" stroke="#F3D45F" stroke-width="3" stroke-linecap="round"/>'
      },
      3: {
        front: '<path d="M82 82 Q101 64 120 78 Q139 64 158 82 M43 62 l14 9-10 9 16 10 M197 62 l-14 9 10 9-16 10 M105 31 Q112 14 118 32 M121 31 Q130 15 135 36" fill="none" stroke="#F5DC72" stroke-width="3" stroke-linecap="round"/><g fill="#FFF0A1"><path d="M27 47 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M211 43 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>'
      }
    },
    companion_fire_legend_bird: {
      2: {
        front: '<path d="M48 85 q7-10 14 0-7 9-14 0z M72 98 q7-10 14 0-7 9-14 0z M178 85 q7-10 14 0-7 9-14 0z M154 98 q7-10 14 0-7 9-14 0z" fill="#F7C76D"/><path d="M96 118 Q120 132 144 118" fill="none" stroke="#E88958" stroke-width="3" stroke-linecap="round"/>'
      },
      3: {
        front: '<g fill="#F7D681"><path d="M35 74 q9-13 18 0-9 12-18 0z"/><path d="M187 74 q9-13 18 0-9 12-18 0z"/><path d="M71 139 q8-12 16 0-8 11-16 0z"/><path d="M153 139 q8-12 16 0-8 11-16 0z"/></g><path d="M88 113 Q120 138 152 113 M104 38 Q112 23 120 39 M120 39 Q129 23 136 43" fill="none" stroke="#D97852" stroke-width="3" stroke-linecap="round"/><g fill="#FFF0B0"><circle cx="26" cy="48" r="3"/><circle cx="214" cy="48" r="3"/></g>'
      }
    }
  };

  function cloneSpeciesData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCompanionEvolutionStage(companion) {
    var level = companion && companion.bondLevel;
    if (typeof level !== "number" || !isFinite(level) || level < 1) return 1;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return 1;
  }

  function getEvolutionStageLabel(stage) {
    return EVOLUTION_STAGE_LABELS[stage] || EVOLUTION_STAGE_LABELS[1];
  }

  function getEvolutionProgress(companion) {
    var stage = getCompanionEvolutionStage(companion);
    var level = companion && typeof companion.bondLevel === "number" && isFinite(companion.bondLevel) && companion.bondLevel >= 1
      ? companion.bondLevel
      : 1;
    if (stage === 1) return { stage: 1, label: getEvolutionStageLabel(1), nextStage: 2, nextLevel: 3, remaining: Math.max(0, 3 - level) };
    if (stage === 2) return { stage: 2, label: getEvolutionStageLabel(2), nextStage: 3, nextLevel: 5, remaining: Math.max(0, 5 - level) };
    return { stage: 3, label: getEvolutionStageLabel(3), nextStage: null, nextLevel: null, remaining: 0 };
  }

  function normalizeSeenEvolutionStage(value, currentStage) {
    if (typeof value !== "number" || !isFinite(value) || value < 1 || value > 3 || Math.floor(value) !== value) {
      return currentStage;
    }
    return Math.min(value, currentStage);
  }

  function ensureCompanionEvolutionState(companion) {
    if (!companion || typeof companion !== "object") return companion;
    var currentStage = getCompanionEvolutionStage(companion);
    companion.lastSeenEvolutionStage = normalizeSeenEvolutionStage(companion.lastSeenEvolutionStage, currentStage);
    return companion;
  }

  function pendingEvolutionCompanions(appData) {
    return ensureCompanions(appData).filter(function (companion) {
      return companion &&
        Number(companion.hatchCount || 0) > 0 &&
        isValidSpeciesId(companion.speciesId) &&
        getCompanionEvolutionStage(companion) > Number(companion.lastSeenEvolutionStage || 1);
    });
  }

  function markEvolutionStageSeen(companion) {
    if (!companion || typeof companion !== "object") return false;
    companion.lastSeenEvolutionStage = getCompanionEvolutionStage(companion);
    return true;
  }

  function increaseCompanionBond(companion, amount, reason) {
    var previousLevel = companion && typeof companion.bondLevel === "number" && isFinite(companion.bondLevel) && companion.bondLevel >= 0
      ? companion.bondLevel
      : 0;
    var previousStage = getCompanionEvolutionStage({ bondLevel: previousLevel });
    var increment = typeof amount === "number" && isFinite(amount) && amount > 0 ? amount : 0;
    if (!companion || !increment) {
      return { ok: false, previousLevel: previousLevel, currentLevel: previousLevel, previousStage: previousStage, currentStage: previousStage, evolved: false, reason: reason || null };
    }
    companion.bondLevel = previousLevel + increment;
    var currentStage = getCompanionEvolutionStage(companion);
    return {
      ok: true,
      previousLevel: previousLevel,
      currentLevel: companion.bondLevel,
      previousStage: previousStage,
      currentStage: currentStage,
      evolved: currentStage > previousStage,
      reason: reason || null
    };
  }

  function evolutionDecorationMarkup(speciesId, stage, layer) {
    var definition = EVOLUTION_DECORATIONS[speciesId];
    var parts = [];
    if (!definition || stage < 2) return "";
    for (var current = 2; current <= stage; current += 1) {
      if (definition[current] && definition[current][layer]) parts.push(definition[current][layer]);
    }
    if (!parts.length) return "";
    return '<g class="companion-evolution-decoration evolution-decoration-' + layer + '" data-evolution-stage="' + stage + '" aria-hidden="true">' + parts.join("") + '</g>';
  }

  function escapeSvgAttribute(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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

  function companionNicknameLength(value) {
    if (typeof value !== "string") return 0;
    return Array.from ? Array.from(value).length : value.length;
  }

  function cleanCompanionNickname(value) {
    if (typeof value !== "string") return "";
    return value
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
      .replace(/^\s+|\s+$/g, "");
  }

  function normalizeCompanionNickname(value) {
    var cleaned = cleanCompanionNickname(value);
    if (!cleaned) return "";
    return Array.from ? Array.from(cleaned).slice(0, 12).join("") : cleaned.slice(0, 12);
  }

  function ensureCompanions(appData) {
    appData.companions = Array.isArray(appData.companions) ? appData.companions : [];
    appData.companions.forEach(function (companion) {
      if (!companion) return;
      companion.id = companion.id || companion.speciesId;
      companion.speciesId = companion.speciesId || companion.id;
      companion.hatchCount = Math.max(0, Number(companion.hatchCount || 0));
      companion.bondLevel = typeof companion.bondLevel === "number" && isFinite(companion.bondLevel) && companion.bondLevel >= 0
        ? companion.bondLevel
        : 0;
      companion.isFavorite = Boolean(companion.isFavorite);
      companion.firstHatchedAt = companion.firstHatchedAt || companion.lastHatchedAt || null;
      companion.lastHatchedAt = companion.lastHatchedAt || companion.firstHatchedAt || null;
      companion.mealCount = Math.max(0, Number(companion.mealCount || 0));
      companion.bondMealProgress = Math.max(0, Math.min(2, Number(companion.bondMealProgress || 0)));
      companion.lastBondMealDate = companion.lastBondMealDate || null;
      companion.lastFedAt = companion.lastFedAt || null;
      companion.nickname = normalizeCompanionNickname(companion.nickname);
      ensureCompanionEvolutionState(companion);
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

  function getCompanionSpeciesName(companion) {
    var speciesId = companion && (companion.speciesId || companion.id);
    var species = getSpecies(speciesId);
    return species ? species.name : "なかま";
  }

  function getCompanionDisplayName(companion) {
    return normalizeCompanionNickname(companion && companion.nickname) || getCompanionSpeciesName(companion);
  }

  function findOwnedCompanion(companionId) {
    return ensureCompanions(KA.state.getAppData()).filter(function (companion) {
      return companion &&
        Number(companion.hatchCount || 0) > 0 &&
        isValidSpeciesId(companion.speciesId) &&
        (companion.id === companionId || companion.speciesId === companionId);
    })[0] || null;
  }

  function setCompanionNickname(companionId, value) {
    var companion = findOwnedCompanion(companionId);
    var cleaned = cleanCompanionNickname(value);
    if (!companion) return { ok: false, reason: "not_owned" };
    if (!cleaned) return { ok: false, reason: "required" };
    if (companionNicknameLength(cleaned) > 12) return { ok: false, reason: "too_long" };
    companion.nickname = cleaned;
    KA.state.getAppData().updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, companion: companion, nickname: cleaned };
  }

  function clearCompanionNickname(companionId) {
    var companion = findOwnedCompanion(companionId);
    if (!companion) return { ok: false, reason: "not_owned" };
    companion.nickname = "";
    KA.state.getAppData().updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, companion: companion };
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
        isFavorite: false,
        mealCount: 0,
        bondMealProgress: 0,
        lastBondMealDate: null,
        lastFedAt: null,
        nickname: "",
        lastSeenEvolutionStage: 1
      };
      list.push(companion);
    } else {
      companion.firstHatchedAt = companion.firstHatchedAt || hatchedAt;
      companion.lastHatchedAt = hatchedAt;
      companion.hatchCount = Math.max(0, Number(companion.hatchCount || 0)) + 1;
      increaseCompanionBond(companion, 1, "rehatch");
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

  function companionForRender(speciesId, opts) {
    if (opts.companion) return opts.companion;
    if (!KA.state || !KA.state.getAppData) return null;
    try {
      var data = KA.state.getAppData();
      return data ? getCompanion(data, speciesId) : null;
    } catch (error) {
      return null;
    }
  }

  function renderEvolutionContext(species, opts) {
    var companion = companionForRender(species.id, opts);
    var requestedStage = Number(opts.stage);
    var stage = requestedStage >= 1 && requestedStage <= 3 && Math.floor(requestedStage) === requestedStage
      ? requestedStage
      : getCompanionEvolutionStage(companion);
    var displayName = opts.displayName || (companion ? getCompanionDisplayName(companion) : species.name);
    return {
      companion: companion,
      stage: stage,
      label: getEvolutionStageLabel(stage),
      ariaLabel: opts.ariaLabel || (displayName + "、" + getEvolutionStageLabel(stage))
    };
  }

  function renderPeacockCompanion(species, opts) {
    var outlineStroke = species.outlineStroke || "#28312d";
    var innerStroke = species.innerStroke || "#5b4631";
    var tailTransform = species.peacockTailTransform;
    var bodyTransform = species.peacockBodyTransform;
    var tailRegions = species.regions.filter(function (region) {
      return region.id === "tail" || region.id === "tail_eyes";
    });
    var bodyRegions = species.regions.filter(function (region) {
      return region.id !== "tail" && region.id !== "tail_eyes";
    });
    var tailInner = species.inner.slice(0, 5);
    var bodyInner = species.inner.slice(5);
    var evolution = renderEvolutionContext(species, opts);
    if (opts.silhouette) {
      return [
        '<svg class="companion-svg companion-silhouette companion-peacock" viewBox="' + species.viewBox + '" aria-hidden="true" focusable="false">',
        '<g class="peacock-tail-group" transform="' + tailTransform + '">',
        '<path d="' + species.outer[0] + '" fill="#1f2937"/>',
        '</g>',
        '<g class="peacock-body-group" transform="' + bodyTransform + '">',
        '<path d="' + species.outer[1] + '" fill="#1f2937"/>',
        '<path d="' + species.regions[1].d + '" fill="#1f2937"/>',
        '<path d="' + species.regions[2].d + '" fill="#1f2937"/>',
        '</g>',
        '</svg>'
      ].join("");
    }
    return [
      '<svg class="companion-svg companion-peacock evolution-stage-' + evolution.stage + '" viewBox="' + species.viewBox + '" role="img" aria-label="' + escapeSvgAttribute(evolution.ariaLabel) + '" focusable="false">',
      evolutionDecorationMarkup(species.id, evolution.stage, "back"),
      '<g class="body-regions">',
      '<g class="peacock-tail-group" transform="' + tailTransform + '">',
      tailRegions.map(function (region) {
        return '<path d="' + region.d + '" fill="' + region.fill + '"/>';
      }).join(""),
      '</g>',
      '<g class="peacock-body-group" transform="' + bodyTransform + '">',
      bodyRegions.map(function (region) {
        if (region.fill === "none") {
          return '<path d="' + region.d + '" fill="none" stroke="' + (species.defaultColors.leg || "#92400E") + '" stroke-width="4" stroke-linecap="round"/>';
        }
        return '<path d="' + region.d + '" fill="' + region.fill + '"/>';
      }).join(""),
      '</g>',
      '</g>',
      '<g class="outer-outline" fill="none" stroke="' + outlineStroke + '" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round">',
      '<g class="peacock-tail-group" transform="' + tailTransform + '"><path d="' + species.outer[0] + '"/></g>',
      '<g class="peacock-body-group" transform="' + bodyTransform + '"><path d="' + species.outer[1] + '"/></g>',
      '</g>',
      '<g class="inner-lines" fill="none" stroke="' + innerStroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      '<g class="peacock-tail-group" transform="' + tailTransform + '">' + tailInner.map(function (d) { return '<path d="' + d + '"/>'; }).join("") + '</g>',
      '<g class="peacock-body-group" transform="' + bodyTransform + '">' + bodyInner.map(function (d) { return '<path d="' + d + '"/>'; }).join("") + '</g>',
      '</g>',
      '<g class="face-details peacock-body-group" transform="' + bodyTransform + '">',
      species.face,
      '</g>',
      evolutionDecorationMarkup(species.id, evolution.stage, "front"),
      '</svg>'
    ].join("");
  }

  function renderCompanion(speciesId, options) {
    var opts = options || {};
    var species = getSpecies(speciesId) || allSpecies()[0];
    var outlineStroke = species.outlineStroke || "#28312d";
    var innerStroke = species.innerStroke || "#5b4631";
    var outlineWidth = Number(species.outlineWidth || 4.2);
    var innerWidth = Number(species.innerWidth || 2.2);
    var transparentBoxClass = species.transparentOuterBox ? " companion-transparent-box" : "";
    var evolution = renderEvolutionContext(species, opts);
    if (species.id === "companion_peacock") {
      return renderPeacockCompanion(species, opts);
    }
    if (opts.silhouette) {
      return [
        '<svg class="companion-svg companion-silhouette' + transparentBoxClass + '" viewBox="' + species.viewBox + '" aria-hidden="true" focusable="false">',
        pathList(species.outer, "#1f2937", "none"),
        '</svg>'
      ].join("");
    }
    return [
      '<svg class="companion-svg companion-' + species.id.replace("companion_", "") + transparentBoxClass + ' evolution-stage-' + evolution.stage + '" viewBox="' + species.viewBox + '" role="img" aria-label="' + escapeSvgAttribute(evolution.ariaLabel) + '" focusable="false">',
      evolutionDecorationMarkup(species.id, evolution.stage, "back"),
      '<g class="body-regions">',
      species.regions.map(function (region) {
        if (region.fill === "none") {
          return '<path d="' + region.d + '" fill="none" stroke="' + (species.defaultColors.leg || "#92400E") + '" stroke-width="4" stroke-linecap="round"/>';
        }
        return '<path d="' + region.d + '" fill="' + region.fill + '"/>';
      }).join(""),
      '</g>',
      '<g class="outer-outline" fill="none" stroke="' + outlineStroke + '" stroke-width="' + outlineWidth + '" stroke-linejoin="round" stroke-linecap="round">',
      species.outer.map(function (d) { return '<path d="' + d + '"/>'; }).join(""),
      '</g>',
      '<g class="inner-lines" fill="none" stroke="' + innerStroke + '" stroke-width="' + innerWidth + '" stroke-linecap="round" stroke-linejoin="round">',
      species.inner.map(function (d) { return '<path d="' + d + '"/>'; }).join(""),
      '</g>',
      '<g class="face-details">',
      species.face,
      '</g>',
      evolutionDecorationMarkup(species.id, evolution.stage, "front"),
      '</svg>'
    ].join("");
  }

  KA.companions = {
    allSpecies: allSpecies,
    getSpecies: getSpecies,
    isValidSpeciesId: isValidSpeciesId,
    ensureCompanions: ensureCompanions,
    getCompanion: getCompanion,
    getCompanionSpeciesName: getCompanionSpeciesName,
    getCompanionDisplayName: getCompanionDisplayName,
    getCompanionEvolutionStage: getCompanionEvolutionStage,
    getEvolutionStageLabel: getEvolutionStageLabel,
    getEvolutionProgress: getEvolutionProgress,
    pendingEvolutionCompanions: pendingEvolutionCompanions,
    markEvolutionStageSeen: markEvolutionStageSeen,
    increaseCompanionBond: increaseCompanionBond,
    evolutionDecorations: cloneSpeciesData(EVOLUTION_DECORATIONS),
    normalizeCompanionNickname: normalizeCompanionNickname,
    companionNicknameLength: companionNicknameLength,
    setCompanionNickname: setCompanionNickname,
    clearCompanionNickname: clearCompanionNickname,
    ownedSpeciesIds: ownedSpeciesIds,
    pickSpeciesForEgg: pickCompanionSpeciesForEgg,
    recordHatch: recordHatch,
    setFavorite: setFavorite,
    favoriteCompanion: favoriteCompanion,
    renderCompanion: renderCompanion,
    hashString: companionHashString
  };
})(window);
