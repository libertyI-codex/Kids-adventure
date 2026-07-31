(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  KA.coloringArtV30 = {
    targetIds: [
      "coloring_rabbit_001",
      "coloring_dolphin_001",
      "coloring_dinosaur_001",
      "coloring_horse_001",
      "coloring_lion",
      "coloring_grasshopper",
      "coloring_electric_mouse"
    ],
    definitions: {
      coloring_rabbit_001: {
        templateId: "coloring_rabbit_001",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 10,
        designVersion: 10,
        regions: [
          { id: "tail", d: "M48 105 C31 100 22 111 28 124 C35 138 56 138 67 124 C67 114 59 107 48 105 Z", fallback: "#FFFFFF" },
          { id: "body", d: "M55 111 C58 85 83 68 119 70 C150 71 176 91 179 119 C181 143 159 158 119 157 C79 156 51 140 55 111 Z", fallback: "#FFFFFF" },
          { id: "back_leg", d: "M76 119 C59 128 57 148 74 158 C94 169 126 158 139 139 C124 126 96 121 76 119 Z", fallback: "#FFFFFF" },
          { id: "belly", d: "M113 108 C131 120 157 122 175 112 C174 135 153 148 125 145 C108 142 103 121 113 108 Z", fallback: "#FFFFFF" },
          { id: "front_leg", d: "M145 117 C158 126 164 144 155 158 L139 158 C144 143 141 131 132 123 Z", fallback: "#FFFFFF" },
          { id: "head", d: "M151 79 C157 61 177 51 198 57 C216 62 224 77 218 94 C211 110 188 115 168 105 C153 98 147 89 151 79 Z", fallback: "#FFFFFF" },
          { id: "nose", d: "M211 82 C221 80 231 86 230 93 C227 100 215 101 207 94 C207 89 208 85 211 82 Z", fallback: "#FFFFFF" },
          { id: "ear_left_outer", d: "M159 65 C148 38 149 12 162 6 C177 19 182 47 171 70 Z", fallback: "#FFFFFF" },
          { id: "ear_left_inner", d: "M162 57 C156 39 157 20 163 14 C172 27 175 47 168 61 Z", fallback: "#F7D4E6" },
          { id: "ear_right_outer", d: "M177 63 C174 32 186 7 199 10 C207 30 202 57 187 70 Z", fallback: "#FFFFFF" },
          { id: "ear_right_inner", d: "M183 57 C182 36 189 18 197 17 C201 34 197 52 188 61 Z", fallback: "#F7D4E6" },
          { id: "cheek", d: "M185 85 C194 81 204 86 205 96 C199 104 187 101 183 92 C183 89 184 87 185 85 Z", fallback: "#FDE2E2" }
        ],
        outer: [
          "M28 124 C21 110 32 99 48 105 C38 89 54 79 70 86 C82 75 99 69 119 70 C132 70 144 74 154 80 C154 75 156 69 160 65 C149 38 149 12 162 6 C175 17 181 39 175 60 C177 59 178 59 180 59 C178 31 187 7 199 10 C207 30 202 55 190 68 C211 62 226 74 230 88 C233 99 220 106 209 103 C197 113 183 113 169 106 C178 118 182 133 175 143 C165 158 142 160 119 157 C91 158 70 150 61 136 C47 141 32 135 28 124 Z",
          "M76 119 C60 128 57 148 74 158 M139 139 C126 158 94 169 74 158",
          "M132 123 C141 131 144 143 139 158 M155 158 C164 144 158 126 145 117"
        ],
        inner: [
          { d: "M162 57 C156 39 157 20 163 14" },
          { d: "M183 57 C182 36 189 18 197 17" },
          { d: "M113 108 C131 120 157 122 175 112" },
          { d: "M76 119 C96 121 124 126 139 139" },
          { d: "M145 117 C140 130 141 145 155 158" },
          { d: "M207 94 C214 99 224 99 230 93" },
          { d: "M151 83 C143 88 137 89 130 87" }
        ],
        face: "<circle cx=\"194\" cy=\"72\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"193\" cy=\"71\" r=\"1\" fill=\"#FFFFFF\"/><path d=\"M213 92 C209 96 202 96 198 92 M204 88 L195 86 M204 97 L195 100\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
        hitAreas: ["nose", "ear_left_outer", "ear_left_inner", "ear_right_outer", "ear_right_inner", "front_leg", "cheek"]
      },
      coloring_dolphin_001: {
        templateId: "coloring_dolphin_001",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 10,
        designVersion: 10,
        regions: [
          { id: "tail_fluke_top", d: "M52 80 C35 74 21 59 26 48 C42 46 58 58 62 75 C60 79 56 81 52 80 Z", fallback: "#FFFFFF" },
          { id: "tail_fluke_bottom", d: "M52 91 C33 98 24 114 31 124 C47 123 60 109 62 94 C59 91 56 90 52 91 Z", fallback: "#FFFFFF" },
          { id: "tail_stem", d: "M56 78 C77 77 96 81 112 90 C96 100 77 101 56 94 C62 89 62 83 56 78 Z", fallback: "#FFFFFF" },
          { id: "body_top", d: "M99 85 C119 61 157 49 190 56 C207 59 217 67 222 76 C205 81 190 86 177 96 C157 113 127 119 103 109 C88 103 86 93 99 85 Z", fallback: "#FFFFFF" },
          { id: "belly", d: "M102 94 C122 106 151 106 177 96 C161 118 130 127 104 112 C95 107 94 99 102 94 Z", fallback: "#FFFFFF" },
          { id: "snout", d: "M188 59 C210 51 231 58 238 70 C230 78 214 81 198 77 C189 74 184 67 188 59 Z", fallback: "#FFFFFF" },
          { id: "dorsal_fin", d: "M136 62 C145 38 161 33 172 60 C161 66 148 67 136 62 Z", fallback: "#FFFFFF" },
          { id: "pectoral_fin", d: "M144 104 C154 130 177 133 181 104 C170 97 155 98 144 104 Z", fallback: "#FFFFFF" },
          { id: "cheek", d: "M190 68 C199 65 207 70 208 78 C202 86 191 82 188 74 C188 72 189 70 190 68 Z", fallback: "#DDF7FF" }
        ],
        outer: [
          "M26 48 C42 46 58 58 62 75 C80 76 98 81 112 90 C130 67 160 53 188 56 C211 49 231 58 238 70 C231 79 215 82 198 77 C192 82 185 88 177 96 C161 118 130 127 104 112 C88 104 75 99 62 94 C58 110 46 122 31 124 C24 114 33 98 52 91 C32 78 20 61 26 48 Z",
          "M136 62 C145 38 161 33 172 60",
          "M144 104 C154 130 177 133 181 104"
        ],
        inner: [
          { d: "M102 94 C122 106 151 106 177 96" },
          { d: "M188 59 C207 57 225 62 238 70" },
          { d: "M56 78 C77 77 96 81 112 90" },
          { d: "M56 94 C77 101 96 100 112 90" },
          { d: "M199 77 C211 80 229 77 238 70" },
          { d: "M145 104 C157 108 169 108 181 104" }
        ],
        face: "<circle cx=\"197\" cy=\"64\" r=\"2.8\" fill=\"#1F2937\"/><circle cx=\"196.5\" cy=\"63.4\" r=\".9\" fill=\"#FFFFFF\"/><path d=\"M211 74 C216 76 224 75 229 72\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
        hitAreas: ["tail_fluke_top", "tail_fluke_bottom", "tail_stem", "dorsal_fin", "pectoral_fin", "cheek"]
      },
      coloring_dinosaur_001: {
        templateId: "coloring_dinosaur_001",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 10,
        designVersion: 10,
        regions: [
          { id: "tail", d: "M88 98 C60 83 28 83 5 96 C30 111 59 116 93 106 C96 101 94 99 88 98 Z", fallback: "#FFFFFF" },
          { id: "body", d: "M80 83 C104 66 145 67 170 82 C190 94 191 116 174 131 C151 148 112 141 88 121 C75 110 70 94 80 83 Z", fallback: "#FFFFFF" },
          { id: "belly", d: "M95 105 C117 121 149 122 175 108 C170 128 147 139 119 132 C101 128 91 117 95 105 Z", fallback: "#FFFFFF" },
          { id: "neck", d: "M163 78 C171 62 187 53 202 57 C207 70 198 91 176 101 C167 96 161 88 163 78 Z", fallback: "#FFFFFF" },
          { id: "head", d: "M194 50 C214 39 234 46 239 62 C235 74 218 80 198 74 C186 69 184 57 194 50 Z", fallback: "#FFFFFF" },
          { id: "jaw", d: "M190 68 C204 75 225 74 239 62 C242 75 230 87 209 89 C195 89 185 80 190 68 Z", fallback: "#FFFFFF" },
          { id: "arm", d: "M166 98 C178 99 185 106 183 115 C174 119 163 115 157 108 C158 103 161 100 166 98 Z", fallback: "#FFFFFF" },
          { id: "back_leg", d: "M91 116 C79 130 77 150 87 166 L104 166 C100 150 105 137 116 126 Z M137 121 C148 135 149 150 141 167 L159 167 C170 146 164 126 151 115 Z", fallback: "#FFFFFF" },
          { id: "foot", d: "M83 163 C96 161 109 164 117 171 L109 177 L81 177 Z M137 164 C151 161 165 164 174 171 L165 177 L135 177 Z", fallback: "#FFFFFF" },
          { id: "back_spines", d: "M88 78 L98 62 L108 75 L119 57 L130 72 L143 58 L151 75 Z", fallback: "#DDF7D4" },
          { id: "cheek", d: "M207 58 C216 55 224 60 224 68 C218 75 207 71 205 64 C205 61 206 59 207 58 Z", fallback: "#FDE2E2" },
          { id: "body_mark", d: "M109 83 C119 78 133 80 141 89 C132 98 116 96 109 83 Z", fallback: "#DDF7D4" }
        ],
        outer: [
          "M5 96 C30 111 59 116 93 106 C103 68 142 64 163 78 C171 62 187 53 202 57 C214 39 234 46 239 62 C242 75 230 87 209 89 C197 91 185 94 176 101 C191 113 183 128 174 131 C151 148 112 141 88 121 C75 110 70 94 80 83 C57 82 28 83 5 96 Z",
          "M91 116 C79 130 77 150 87 166 M104 166 C100 150 105 137 116 126",
          "M137 121 C148 135 149 150 141 167 M159 167 C170 146 164 126 151 115",
          "M88 78 L98 62 L108 75 L119 57 L130 72 L143 58 L151 75"
        ],
        inner: [
          { d: "M95 105 C117 121 149 122 175 108" },
          { d: "M163 78 C162 89 167 96 176 101" },
          { d: "M190 68 C204 75 225 74 239 62" },
          { d: "M166 98 C178 99 185 106 183 115" },
          { d: "M97 137 C91 148 92 158 99 166" },
          { d: "M151 135 C159 145 157 158 151 167" },
          { d: "M81 171 L116 171 M136 171 L173 171" }
        ],
        face: "<circle cx=\"210\" cy=\"55\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"209.5\" cy=\"54.5\" r=\"1\" fill=\"#FFFFFF\"/><path d=\"M204 78 C215 83 228 77 235 69\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M218 77 L221 81 L224 76\" fill=\"#FFFFFF\" stroke=\"#1F2937\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>",
        hitAreas: ["arm", "foot", "back_spines", "cheek", "body_mark"]
      },
      coloring_horse_001: {
        templateId: "coloring_horse_001",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 10,
        designVersion: 10,
        regions: [
          { id: "tail", d: "M55 79 C31 80 16 97 13 124 C33 120 51 101 66 83 C65 78 61 77 55 79 Z", fallback: "#FFFFFF" },
          { id: "body", d: "M52 78 C75 61 119 59 156 68 C179 74 190 88 185 106 C177 130 142 139 99 132 C68 127 43 104 52 78 Z", fallback: "#FFFFFF" },
          { id: "neck", d: "M145 70 C150 48 165 29 185 22 C199 34 193 62 171 87 C159 85 151 79 145 70 Z", fallback: "#FFFFFF" },
          { id: "head", d: "M180 21 C198 10 221 19 228 36 C228 52 213 64 191 61 C178 54 173 34 180 21 Z", fallback: "#FFFFFF" },
          { id: "muzzle", d: "M204 39 C220 37 233 45 232 56 C223 64 209 61 199 54 C199 48 201 43 204 39 Z", fallback: "#FFFFFF" },
          { id: "ears", d: "M179 24 C174 10 183 5 192 20 C191 27 185 30 179 24 Z M195 21 C202 7 213 10 212 27 C206 31 200 28 195 21 Z", fallback: "#FFFFFF" },
          { id: "mane", d: "M151 35 C139 48 139 67 149 82 C155 75 160 65 163 55 C158 53 155 47 157 39 Z", fallback: "#FFFFFF" },
          { id: "front_leg_near", d: "M144 101 C154 122 155 145 150 168 L136 168 C140 145 135 124 126 105 Z", fallback: "#FFFFFF" },
          { id: "front_leg_far", d: "M162 103 C172 122 174 144 169 168 L155 168 C159 146 155 126 147 107 Z", fallback: "#FFFFFF" },
          { id: "back_leg_near", d: "M74 104 C65 123 59 146 53 168 L39 168 C44 141 52 118 63 99 Z", fallback: "#FFFFFF" },
          { id: "back_leg_far", d: "M94 109 C108 126 112 146 107 168 L93 168 C97 149 91 132 81 114 Z", fallback: "#FFFFFF" },
          { id: "hooves", d: "M37 165 L55 165 L59 173 L36 173 Z M91 165 L109 165 L113 173 L90 173 Z M134 165 L152 165 L156 173 L133 173 Z M154 165 L171 165 L175 173 L153 173 Z", fallback: "#FFFFFF" }
        ],
        outer: [
          "M13 124 C33 120 51 101 66 83 C76 62 119 59 145 70 C150 48 165 29 179 24 C174 10 183 5 192 20 C202 7 213 10 212 27 C223 29 229 41 228 49 C226 61 211 66 191 61 C185 72 178 81 171 87 C184 91 190 99 185 112 C177 132 142 139 99 132 C68 127 43 104 52 78",
          "M63 99 C52 118 44 141 39 168 M74 104 C65 123 59 146 53 168 M81 114 C91 132 97 149 93 168 M94 109 C108 126 112 146 107 168",
          "M126 105 C135 124 140 145 136 168 M144 101 C154 122 155 145 150 168 M147 107 C155 126 159 146 155 168 M162 103 C172 122 174 144 169 168"
        ],
        inner: [
          { d: "M145 70 C151 79 159 85 171 87" },
          { d: "M151 35 C139 48 139 67 149 82" },
          { d: "M199 54 C209 61 223 64 232 56" },
          { d: "M52 78 C81 90 119 91 158 82" },
          { d: "M74 104 C70 123 74 139 82 148" },
          { d: "M144 101 C136 123 138 149 150 168" },
          { d: "M20 119 C34 107 46 92 56 80" },
          { d: "M36 173 L59 173 M90 173 L113 173 M133 173 L156 173 M153 173 L175 173" }
        ],
        face: "<circle cx=\"199\" cy=\"35\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"198.5\" cy=\"34.5\" r=\"1\" fill=\"#FFFFFF\"/><ellipse cx=\"220\" cy=\"53\" rx=\"2.3\" ry=\"1.5\" fill=\"#1F2937\"/><path d=\"M209 58 C214 60 220 60 224 58\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.7\" stroke-linecap=\"round\"/>",
        hitAreas: ["tail", "ears", "mane", "front_leg_near", "front_leg_far", "back_leg_near", "back_leg_far", "hooves", "muzzle"]
      },
      coloring_lion: {
        templateId: "coloring_lion",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 3,
        designVersion: 3,
        regions: [
          { id: "tail", d: "M67 93 C45 90 28 76 29 58 C42 57 51 72 57 88 C61 90 64 92 67 93 Z", fallback: "#FFFFFF" },
          { id: "tail_tip", d: "M24 59 C13 50 18 35 31 31 C45 32 51 46 42 58 C36 64 29 64 24 59 Z", fallback: "#FFFFFF" },
          { id: "body", d: "M56 85 C76 68 117 65 151 74 C176 80 189 98 182 117 C173 140 137 147 96 136 C68 129 47 106 56 85 Z", fallback: "#FFFFFF" },
          { id: "chest", d: "M140 79 C156 91 160 116 146 137 C132 122 128 96 140 79 Z", fallback: "#FFFFFF" },
          { id: "back_leg", d: "M73 113 C62 129 58 149 52 168 L37 168 C43 143 51 121 62 106 Z M94 119 C108 133 112 150 107 168 L92 168 C97 151 92 136 82 124 Z", fallback: "#FFFFFF" },
          { id: "front_leg", d: "M142 111 C153 127 157 147 151 168 L136 168 C140 147 135 130 126 115 Z M160 108 C172 126 175 147 168 168 L154 168 C159 147 155 128 146 113 Z", fallback: "#FFFFFF" },
          { id: "paw", d: "M34 165 L55 165 L60 173 L33 173 Z M89 165 L110 165 L115 173 L88 173 Z M133 165 L154 165 L159 173 L132 173 Z M151 165 L171 165 L176 173 L150 173 Z", fallback: "#FFFFFF" },
          { id: "mane", d: "M143 34 C151 19 168 17 178 29 C190 20 207 27 209 41 C224 42 231 58 222 70 C231 82 224 98 210 101 C207 116 190 122 179 112 C167 124 149 116 147 102 C132 98 127 82 136 71 C126 57 132 41 143 34 Z", fallback: "#FFFFFF" },
          { id: "ears", d: "M150 47 C142 36 151 27 163 36 C166 45 160 51 150 47 Z M194 36 C206 27 215 37 207 48 C197 51 191 45 194 36 Z", fallback: "#FFFFFF" },
          { id: "face", d: "M153 47 C167 36 193 39 203 53 C211 70 203 91 181 98 C158 98 145 84 146 66 C147 58 149 52 153 47 Z", fallback: "#FFFFFF" },
          { id: "nose", d: "M173 70 C179 65 188 67 192 73 C189 82 177 83 172 76 C171 74 172 72 173 70 Z", fallback: "#FFFFFF" }
        ],
        outer: [
          "M18 37 C26 28 39 31 45 40 C50 49 46 57 39 61 C43 74 53 86 67 93 C74 69 112 63 140 76 C132 69 127 58 132 47 C135 40 139 36 143 34 C151 19 168 17 178 29 C190 20 207 27 209 41 C224 42 231 58 222 70 C231 82 224 98 210 101 C207 116 190 122 179 112 C174 120 170 126 182 117 C173 140 137 147 96 136 C68 129 47 106 56 85",
          "M62 106 C51 121 43 143 37 168 M73 113 C62 129 58 149 52 168 M82 124 C92 136 97 151 92 168 M94 119 C108 133 112 150 107 168",
          "M126 115 C135 130 140 147 136 168 M142 111 C153 127 157 147 151 168 M146 113 C155 128 159 147 154 168 M160 108 C172 126 175 147 168 168"
        ],
        inner: [
          { d: "M140 79 C156 91 160 116 146 137" },
          { d: "M153 47 C167 36 193 39 203 53 C211 70 203 91 181 98 C158 98 145 84 146 66 C147 58 149 52 153 47 Z" },
          { d: "M150 47 C142 36 151 27 163 36 M194 36 C206 27 215 37 207 48" },
          { d: "M42 58 C48 69 54 82 67 93" },
          { d: "M33 173 L60 173 M88 173 L115 173 M132 173 L159 173 M150 173 L176 173" }
        ],
        face: "<circle cx=\"166\" cy=\"61\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"195\" cy=\"61\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"165.5\" cy=\"60.5\" r=\"1\" fill=\"#FFFFFF\"/><circle cx=\"194.5\" cy=\"60.5\" r=\"1\" fill=\"#FFFFFF\"/><path d=\"M181 80 L181 85 M181 85 C175 91 167 88 164 84 M181 85 C187 91 195 88 198 84\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>",
        hitAreas: ["tail", "tail_tip", "front_leg", "back_leg", "paw", "ears", "nose"]
      },
      coloring_grasshopper: {
        templateId: "coloring_grasshopper",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 3,
        designVersion: 3,
        regions: [
          { id: "abdomen", d: "M43 88 C67 68 108 67 137 81 C137 99 111 113 77 111 C57 110 43 102 43 88 Z", fallback: "#FFFFFF" },
          { id: "body_segments", d: "M50 86 C69 76 100 75 126 83 C119 98 87 107 58 102 C50 99 47 92 50 86 Z", fallback: "#DDF7D4" },
          { id: "thorax", d: "M128 76 C143 65 163 68 174 81 C179 98 162 112 143 107 C128 102 121 88 128 76 Z", fallback: "#FFFFFF" },
          { id: "head", d: "M169 69 C188 59 209 68 215 83 C214 99 197 110 179 104 C164 99 158 79 169 69 Z", fallback: "#FFFFFF" },
          { id: "eye", d: "M188 72 C199 68 207 76 204 86 C197 94 185 88 184 80 C184 77 186 74 188 72 Z", fallback: "#FFFFFF" },
          { id: "antennae", d: "M190 69 C186 47 173 31 157 20 L164 16 C182 29 194 47 198 69 Z M204 73 C210 50 226 39 237 34 L239 41 C226 48 215 60 212 78 Z", fallback: "#FFFFFF" },
          { id: "wing", d: "M81 75 C105 52 146 52 166 74 C151 91 116 99 84 91 C78 87 77 81 81 75 Z", fallback: "#FFFFFF" },
          { id: "front_leg", d: "M177 100 L193 118 L214 124 L211 132 L188 126 L166 108 Z", fallback: "#FFFFFF" },
          { id: "middle_leg", d: "M147 105 L157 128 L181 141 L176 149 L148 135 L136 109 Z", fallback: "#FFFFFF" },
          { id: "back_leg", d: "M98 104 L76 129 L36 137 L30 129 L68 117 L87 98 Z M76 129 L63 163 L52 162 L58 132 Z", fallback: "#FFFFFF" }
        ],
        outer: [
          "M43 88 C67 68 108 67 128 76 C143 65 163 68 174 81 C178 69 190 62 203 68 C210 71 214 77 215 83 C214 99 197 110 179 104 C166 113 153 113 143 107 C117 116 78 114 57 107 C44 103 39 96 43 88 Z",
          "M81 75 C105 52 146 52 166 74",
          "M190 69 C186 47 173 31 157 20 L164 16 C182 29 194 47 198 69 M204 73 C210 50 226 39 237 34 L239 41 C226 48 215 60 212 78",
          "M166 108 L188 126 L211 132 M177 100 L193 118 L214 124",
          "M136 109 L148 135 L176 149 M147 105 L157 128 L181 141",
          "M87 98 L68 117 L30 129 M98 104 L76 129 L36 137 M58 132 L52 162 M76 129 L63 163"
        ],
        inner: [
          { d: "M81 75 C102 86 139 87 166 74" },
          { d: "M50 86 C69 76 100 75 126 83" },
          { d: "M60 80 L63 104 M75 75 L79 109 M92 72 L96 111 M109 72 L112 108" },
          { d: "M128 76 C122 88 128 101 143 107" },
          { d: "M168 72 C164 82 168 96 179 104" },
          { d: "M68 117 L76 129 L58 132" }
        ],
        face: "<circle cx=\"194\" cy=\"79\" r=\"3\" fill=\"#1F2937\"/><circle cx=\"193.5\" cy=\"78.5\" r=\"1\" fill=\"#FFFFFF\"/><path d=\"M202 94 C198 99 190 101 184 98\" fill=\"none\" stroke=\"#1F2937\" stroke-width=\"1.7\" stroke-linecap=\"round\"/>",
        hitAreas: ["eye", "antennae", "front_leg", "middle_leg", "back_leg", "body_segments"]
      },
      coloring_electric_mouse: {
        templateId: "coloring_electric_mouse",
        viewBox: "0 0 240 180",
        sourceLabel: "prototype30 refresh",
        candidateVersion: 2,
        designVersion: 2,
        regions: [
          { id: "tail", d: "M176 116 C205 125 221 108 214 92 C208 78 190 80 188 93 C187 103 200 107 205 98 C211 113 196 119 180 111 Z", fallback: "#FFFFFF" },
          { id: "tail_spark", d: "M215 83 L220 91 L230 89 L225 98 L233 105 L222 106 L220 116 L213 108 L203 112 L207 101 L199 96 L210 93 Z", fallback: "#FFFFFF" },
          { id: "body", d: "M75 72 C83 51 103 40 124 42 C147 43 165 57 170 80 C178 111 163 148 124 158 C86 150 69 116 75 72 Z", fallback: "#FFFFFF" },
          { id: "belly", d: "M99 103 C109 91 139 91 149 105 C155 126 144 144 124 148 C102 143 92 123 99 103 Z", fallback: "#FFFFFF" },
          { id: "left_ear", d: "M82 62 C61 49 52 23 66 13 C86 19 100 40 99 60 C94 66 88 66 82 62 Z", fallback: "#FFFFFF" },
          { id: "right_ear", d: "M148 58 C153 35 169 16 187 17 C198 31 184 55 163 66 C156 66 151 63 148 58 Z", fallback: "#FFFFFF" },
          { id: "left_ear_inner", d: "M73 23 C84 31 91 45 91 57 C83 54 72 40 69 29 Z", fallback: "#F7D4E6" },
          { id: "right_ear_inner", d: "M180 26 C171 33 162 45 157 57 C167 51 178 39 184 30 Z", fallback: "#F7D4E6" },
          { id: "left_arm", d: "M83 92 C66 91 49 101 45 116 C55 124 72 117 88 105 C90 99 88 95 83 92 Z", fallback: "#FFFFFF" },
          { id: "right_arm", d: "M165 91 C181 89 198 98 203 112 C194 121 177 116 160 104 C158 98 160 94 165 91 Z", fallback: "#FFFFFF" },
          { id: "left_foot", d: "M100 143 C83 146 74 158 81 169 C94 176 112 168 116 154 C112 147 107 144 100 143 Z", fallback: "#FFFFFF" },
          { id: "right_foot", d: "M147 143 C164 146 173 158 166 169 C153 176 135 168 131 154 C135 147 140 144 147 143 Z", fallback: "#FFFFFF" },
          { id: "left_cheek_star", d: "M91 76 L95 83 L103 82 L99 89 L103 96 L94 94 L89 100 L88 91 L80 88 L88 84 Z", fallback: "#FFFFFF" },
          { id: "right_cheek_star", d: "M151 76 L155 83 L163 82 L159 89 L163 96 L154 94 L149 100 L148 91 L140 88 L148 84 Z", fallback: "#FFFFFF" },
          { id: "head_tuft", d: "M105 48 C105 35 113 27 120 37 C125 24 136 29 134 44 C126 50 115 52 105 48 Z", fallback: "#FFFFFF" }
        ],
        outer: [
          "M66 13 C86 19 98 37 99 56 C107 46 116 42 124 42 C133 41 141 45 149 54 C155 33 170 16 187 17 C198 31 184 55 163 66 C169 73 172 82 171 91 C184 89 198 98 203 112 C194 121 179 116 165 107 C168 119 164 137 154 147 C169 151 173 161 166 169 C153 176 137 169 131 156 C126 159 121 159 116 156 C111 169 94 176 81 169 C74 158 79 150 94 145 C85 134 80 119 82 108 C67 118 54 123 45 116 C49 101 66 91 82 92 C72 81 73 71 82 62 C61 49 52 23 66 13 Z",
          "M176 116 C205 125 221 108 214 92 C208 78 190 80 188 93 C187 103 200 107 205 98",
          "M215 83 L220 91 L230 89 L225 98 L233 105 L222 106 L220 116 L213 108 L203 112 L207 101 L199 96 L210 93 Z"
        ],
        inner: [
          { d: "M73 23 C84 31 91 45 91 57 M78 29 L88 37 M82 39 L92 47" },
          { d: "M180 26 C171 33 162 45 157 57 M176 31 L166 39 M172 42 L162 49" },
          { d: "M99 103 C109 91 139 91 149 105" },
          { d: "M83 92 C88 95 90 99 88 105 M165 91 C160 94 158 98 160 104" },
          { d: "M100 143 C107 144 112 147 116 154 M147 143 C140 144 135 147 131 154" },
          { d: "M105 48 C115 52 126 50 134 44" }
        ],
        face: "<ellipse cx=\"109\" cy=\"72\" rx=\"4\" ry=\"5\" fill=\"#1F2937\"/><ellipse cx=\"139\" cy=\"72\" rx=\"4\" ry=\"5\" fill=\"#1F2937\"/><circle cx=\"108\" cy=\"70.5\" r=\"1.2\" fill=\"#FFFFFF\"/><circle cx=\"138\" cy=\"70.5\" r=\"1.2\" fill=\"#FFFFFF\"/><path d=\"M121 82 C124 79 127 81 127 84 C126 87 122 87 120 84 Z M124 87 C119 93 112 91 109 87 M124 87 C129 93 136 91 139 87\" fill=\"#1F2937\" stroke=\"#1F2937\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
        hitAreas: ["left_ear_inner", "right_ear_inner", "left_cheek_star", "right_cheek_star", "left_arm", "right_arm", "left_foot", "right_foot", "tail_spark", "head_tuft"]
      }
    }
  };
})(window);
