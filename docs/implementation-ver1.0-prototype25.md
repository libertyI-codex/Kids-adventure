# Ver.1.0 試作25 実装メモ

## 今回の目的

既存11種類の鳥と10種類のぬりえを変更せず、完全オリジナルの伝説鳥2種類と電気ネズミぬりえ1種類を追加する。保存キー、schemaVersion、孵化、ニックネーム、おきにいり、作品保存などの既存処理は共通処理をそのまま利用する。

## 新しい鳥2種類

### 雷

- companion ID: `companion_thunder_legend_bird`
- 表示名: でんせつの かみなりのとり
- designVersion: `1`
- viewBox: `0 0 240 170`
- 配色: 深い青、水色、白、クリーム、少量の淡い黄色
- 造形: 丸い小鳥の体、左右へ広がる扇形の翼、曲線を含む稲妻模様、雲形の胸毛、丸い冠羽、短い脚
- 輪郭: 黒い外周円を使わず、青系の細い輪郭線を使用

### 炎

- companion ID: `companion_fire_legend_bird`
- 表示名: でんせつの ほのおのとり
- designVersion: `1`
- viewBox: `0 0 240 170`
- 配色: コーラル、オレンジ、クリーム、赤茶、淡い金色
- 造形: 丸い上品な体、二層の翼、花びら形の胸模様、光の粒を含む扇形の尾
- 輪郭: 翼や尾全体を炎形にせず、赤茶系の細い輪郭線を使用

## オリジナルデザインへの配慮

- 既存作品の名称、ロゴ、固有模様を使用しない
- 特徴的な既存シルエットやポーズを参照しない
- 雷鳥は全身を黄・黒にせず、青空と雲を主題にした
- 炎鳥は連続した炎の翼や長い炎の尾を避け、羽根と光の粒で暖かさを表した
- 本番素材はHTML、CSS、手書きインラインSVGだけで構成する

## 孵化候補への追加

`js/companions.js` の正式 `SPECIES` 配列末尾へdisplayOrder 12、13として追加した。`allSpecies()`、`pickSpeciesForEgg()`、`recordHatch()`は既存共通処理を変更していない。

- 正式候補: 13種類
- 未取得種優先: `allSpecies()`から取得済みspeciesIdを除く既存処理
- fixed seed: egg IDを`companionHashString()`へ渡す既存処理
- plannedSpeciesId: 有効speciesIdならそのまま返す既存処理
- 再読み込み: eggに保存済みのplannedSpeciesIdを維持

## 再孵化処理

`recordHatch()`を変更していない。同じspeciesIdが再び生まれた場合は保存レコードを増やさず、既存レコードの`hatchCount`と`bondLevel`を1ずつ増やす。ニックネーム、おきにいり、食事データは維持する。

## ニックネーム・おきにいり互換

新規2種専用処理は追加していない。取得後は既存companionレコードへ保存され、次の共通処理を使用する。

- `getCompanionDisplayName()`
- `normalizeCompanionNickname()`
- `setCompanionNickname()`
- `clearCompanionNickname()`
- `setFavorite()`

最大12文字、変更、削除、正式名称への復帰、JSON復元は試作24と同じである。

## 既存画面への追加

孵化演出、なかまずかん、ホーム、なかまのようす、キッチン、おでかけは正式species配列と取得済みcompanionを参照するため、新規2種を個別複製せず表示する。

とりのおうちの固定座標は、既存1〜11羽用を変更せず、12羽用と13羽用だけを追加した。13羽時は中央の代表鳥と上下2列へ分散し、同一座標を使わない。保存データへ鳥座標は追加しない。

## 電気ネズミぬりえ

- template ID: `coloring_electric_mouse`
- 表示名: びりびり ねずみ
- designVersion: `1`
- svgKey: `electric_mouse_original_v1`
- viewBox: `0 0 240 180`
- 標準必要スター: 44

丸い森のネズミを基礎に、大きな楕円形の耳、耳内の縞、小さな毛束、星形の頬、両手を広げた姿、渦巻きの尾と先端の火花で構成した。既存作品に固有の配色、耳先、丸い頬、稲妻形の尾は使っていない。

## ぬりえregion構成

1. `body`
2. `belly`
3. `left_ear`
4. `right_ear`
5. `left_ear_inner`
6. `right_ear_inner`
7. `left_cheek_star`
8. `right_cheek_star`
9. `left_arm`
10. `right_arm`
11. `left_foot`
12. `right_foot`
13. `tail`
14. `tail_spark`
15. `head_tuft`

小さい耳内、星、火花、毛束には既存の透明hit areaを追加した。色領域は`LAYERED_ANIMAL_SVG`に1回だけ定義し、一覧、編集、作品サムネイルで同じ`renderTemplate()`を使う。

## 作品保存との互換性

新しい保存形式は追加していない。`createArtwork()`が従来どおりtemplateId、regionColors、analysis、placementIdを保存し、`renderAlbum()`はtemplateIdから同じSVGを描画する。作品削除、世界配置、JSONバックアップ・復元も既存形式を使用する。

## coloringSettingsとJSON互換

既存の`normalizeColoringSettings()`は、利用者の並び順とスター設定を先に維持し、未登録の正式テンプレートだけを標準順の末尾へ追加する。試作24データでは`coloring_electric_mouse`だけが末尾へ補完される。

鳥とぬりえはいずれも既存appDataへ正式定義を追加する方式であり、保存キーと`schemaVersion: 1`は変更しない。旧JSONのcompanions、artworks、coloringSettingsを初期化しない。

## アクセシビリティ

- 鳥の操作ボタンは正式名またはニックネームをaria-labelへ使用
- ぬりえSVGは`role="img"`と`aria-label="びりびり ねずみ"`を使用
- 小領域へ透明hit areaを追加
- 長い正式名称は既存の`overflow-wrap`で折り返す
- 主要ボタン48px以上、safe-area、フォーカス表示を維持
- `prefers-reduced-motion`時も静的表示と操作を維持

## 自動検証結果

- 本番JavaScript 18ファイルの構文評価: 合格
- `tests/smoke-tests.js`: 合格
- 正式鳥13種類、ID一意、displayOrder一意: 合格
- 既存11鳥の定義SHA-256: 保存版24と一致
- 正式ぬりえ11種類、region ID一意: 合格
- 既存10ぬりえの定義SHA-256: 保存版24と一致
- fixed seed、plannedSpeciesId、未取得種優先、再孵化: 合格
- 新ぬりえの作品保存・復元・サムネイル描画: 合格
- 外部URL、外部画像、外部SVG、CDN、fetch、type=module: 不使用

## 390px確認

`tests/legend-companions-coloring-preview.html`と本番画面をEdgeの390×844、タッチ、reduced-motion相当で確認した。

- document幅: 390px、横スクロールなし
- 主要ボタン最小高: 52px
- 図鑑: 13カード
- とりのおうち: 13羽、13個の固有中心座標、全鳥が部屋内
- キッチン: 炎鳥への食事処理成功、mealCount更新
- おでかけ: 新規2羽を当日食事済み候補として取得
- ぬりえ一覧: 11カード
- ぬりえ編集: 15領域、下部ナビとの重なりなし
- 作品: 保存とアルバムカード表示成功
- コンソールエラー、読込失敗: 0件

## 既存機能維持

- `job_cleanup`の名称と2スター
- 利用者向け「おきにいり」と内部favoriteキー
- ニックネーム
- 孔雀designVersion 4
- ひよこの`outlineStroke: "none"`
- たまご、おしごと、キッチン、とりのおうち、おでかけ
- 既存ぬりえ10種類、世界6種類、作品
- `renderAlbum()`、safeStart、boot.js、PWA standalone
- apple-touch-icon.png、保存キー4種、schemaVersion 1

## 手動確認項目

- 80px〜120pxで新規2羽を判別できる
- 13羽取得時に鳥が画面外へ出ず、タップできる
- 長い正式名称と12文字ニックネームが自然に折り返される
- ぬりえ15領域が意図した領域へ反応する
- 作品保存、再読み込み、削除、JSON復元
- Safariとstandaloneで下部ナビ、safe-area、横スクロールを確認する
