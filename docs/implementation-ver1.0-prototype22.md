# Ver.1.0 試作22 実装メモ

## 目的

ひよこの周囲に見えていた黒い丸状の囲みを除去し、たまごから生まれる正式な仲間を6種から11種へ拡張する。保存キー、schemaVersion、既存companionレコード、孵化履歴を変更しない。

## ひよこの黒い丸の原因

原因はカードやSVGラッパーの `border`、`outline`、`box-shadow` ではなかった。`js/companions.js` の `companion_chick.outer` は、全身を囲う楕円状のパスとして共通レンダラーの `.outer-outline` へ渡され、既定の `stroke="#28312d"` と `stroke-width="4.2"` で描かれていた。このパスの濃いストロークが、ひよこ本体の外側に黒い丸状の囲みとして見えていた。

`companion_chick` に `outlineStroke: "none"` を指定し、外周ストロークだけを無効化した。`outer` パスとviewBoxはシルエット表示およびタップ領域維持のため残している。黄色い体、頭、翼、くちばし、足、冠羽、曲線の目、内部の羽毛線は変更していない。

## 正式species

既存6種はID、表示順、designVersion、SVG定義を維持した。次の5種を `js/companions.js` の正式定義へ追加した。

| displayOrder | speciesId | 表示名 | designVersion |
| ---: | --- | --- | ---: |
| 7 | `companion_penguin` | ぺんぎん | 1 |
| 8 | `companion_shimaenaga` | しまえなが | 1 |
| 9 | `companion_parakeet` | いんこ | 1 |
| 10 | `companion_java_sparrow` | ぶんちょう | 1 |
| 11 | `companion_ice_legend_bird` | こおりの でんせつどり | 1 |

すべて手書きインラインSVGで、外部画像、外部SVG、生成画像を使っていない。80pxでも判別できる大きな色面とシルエットを優先した。白い鳥は淡い灰色、氷の鳥は淡い青の細い外周線を使い、黒い囲みが強く出ないようにした。

「こおりの でんせつどり」は、丸い顔、左右対称の幅広い翼、氷晶形の冠羽、複数の短い結晶尾を組み合わせた独自デザインである。既存キャラクターの形状や配色配置をトレースしていない。

## 孵化候補

既存の `allSpecies()`、`isValidSpeciesId()`、`pickSpeciesForEgg()` をそのまま中央関数として使用する。正式定義が11種になったため、孵化候補も自動的に11種になる。

- 有効な `plannedSpeciesId` は再決定しない
- 未取得speciesを優先する
- `egg.id` の固定hashから決定する
- 全種取得後は11種全体を候補にする
- 同一speciesの再孵化は新しいカードを作らず、既存の `hatchCount` と `bondLevel` を増やす

## 画面反映

孵化、なかまずかん、ホーム、なかまのようす、キッチン、おでかけは、既存の `KA.companions.renderCompanion()` と `allSpecies()` を使用するため、新規5種を個別複製せず反映する。

とりのおうちは、従来の1〜6羽用固定配置に7〜11羽用の配置を追加した。お気に入り鳥を先頭の中央寄りへ置く既存ルールは維持し、座標をcompanionデータへ保存しない。孔雀のSVGと `designVersion: 4` は変更していない。

## データ互換

- `schemaVersion: 1` を維持
- `kodomoAdventure.appData.v1` を維持
- `kodomoAdventure.uiState.v1` を維持
- `kodomoAdventure.backup.v1` を維持
- `kodomoAdventure.bootDiagnostic.v1` を維持
- 既存companionの取得状態、お気に入り、`hatchCount`、`bondLevel`、`mealCount`、`lastFedAt` を維持
- JSONバックアップは従来どおりappData全体を保存・復元
- 新しいspecies定義は保存データへ複製せず、既存データへ不要な移行項目を追加しない

## レビュー

`tests/bird-companion-review.html` は11種を本番定義から描画し、各鳥の黒一色シルエット、通常配色、120px、80pxを表示する。ひよこは修正前相当と試作22を白系・色付き背景で比較する。

## 自動検証

- 全本番JavaScriptの構文評価
- 正式species 11種とID・displayOrder・designVersion
- 新規5種の通常SVGとシルエットSVG
- ひよこの外周stroke無効化と内部線維持
- 未取得優先とplannedSpeciesId固定
- 11羽のおうち固定配置
- 保存キーとschemaVersion
- 読み込み順と `?v=10p22`
- standalone manifest設定
- 外部URL、外部画像、外部SVG、fetch、CDN、`type="module"` がないこと

## 手動確認項目

- 390 x 844でひよこの黒い丸がホーム、図鑑、おうち、孵化表示に出ない
- 新規5種が80pxと120pxで判別でき、頭、翼、尾、足が見切れない
- 11種すべてを取得したおうちで鳥が画面外へ出ず、完全に重ならない
- 新規鳥の孵化、図鑑登録、お気に入り、食事、おでかけ選択が動作する
- Safari通常表示とstandalone表示で透明背景が維持される

