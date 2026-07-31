# Ver.1.0 試作30 実装メモ

## 今回の目的

画像生成や外部素材を使わず、既存のSVGぬりえ基盤のまま、4〜8歳の子どもが一目で種類を判別でき、指で塗りやすい原画へ刷新した。

## 変更対象

| 表示名 | templateId | 旧designVersion | 新designVersion |
| --- | --- | ---: | ---: |
| うさぎ | `coloring_rabbit_001` | 9 | 10 |
| イルカ | `coloring_dolphin_001` | 9 | 10 |
| きょうりゅう | `coloring_dinosaur_001` | 9 | 10 |
| うま | `coloring_horse_001` | 9 | 10 |
| ライオン | `coloring_lion` | 2 | 3 |
| バッタ | `coloring_grasshopper` | 2 | 3 |
| びりびり ねずみ | `coloring_electric_mouse` | 1 | 2 |

## 変更していない原画

次の4種類は定義、designVersion、region構造、レンダラーを変更していない。

- `coloring_butterfly_001`（ちょうちょ）
- `coloring_flower_001`（おはな）
- `coloring_cat_001`（ねこ）
- `coloring_panda`（パンダ）

試作29を基準に、テンプレート定義JSONと空SVGレンダリングのSHA-256をsmoke testで固定した。4種類すべて一致している。

## 描画方式

刷新7種の本体定義は `js/coloring-art-v30.js` に分離した。`js/coloring.js` は試作30定義があるtemplateIdだけを新定義へ切り替え、それ以外は従来レンダラーを使う。

旧7種の定義は削除していない。通常画面では使用せず、`getLegacyLayeredDefinition()`を介してレビュー画面と互換比較だけに利用する。

各新SVGは次の共通レイヤーを持つ。

- `color-regions`: fillだけを持つ塗り領域
- `hit-areas`: 小さな耳、脚、触角、模様等の透明タップ補助
- `outer-outline`: 種類を判別する外周線
- `inner-lines`: 部位の境界を示す簡潔な内側線
- `face-details`: 目、口、鼻等の非塗り描画

`color-regions`にはstroke属性を入れていない。

## 原画デザイン

### うさぎ

横向きの丸い胴体へ、長い左右の耳、丸い顔、短い前脚、大きな後脚、丸い尾を配置した。80pxでも耳と後脚で判別できる。

### イルカ

流線形の背中と腹を分け、自然なくち先、背びれ、胸びれ、上下の尾びれを大きくした。尾の付け根も独立領域として維持した。

### きょうりゅう

大きな頭とあご、小さな前脚、太い後脚、長い尾、背中の突起を整理した。怖くなりすぎない目と口元を使用した。

### うま

首から顔への流れ、耳、たてがみ、胴体、尾、4本の脚とひづめを明確にした。脚は既存どおり4つのregion IDを維持する。

### ライオン

大きなたてがみの中へ顔を配置し、胴体、胸、前後の脚、足先、尾、尾房を簡潔に分離した。

### バッタ

細長い腹部、胸、頭、羽、触角、前脚、中脚、大きく折れた後脚を整理した。細い部位はhit-areaで操作を補強した。

### びりびり ねずみ

独自キャラクターの大きな楕円耳、耳内の縞、星形の頬、丸い体、広げた両手、渦巻き尾と火花を維持しつつ、輪郭を丸く読みやすくした。特定の既存キャラクターの輪郭、頬、尾、配色は使用していない。

## regionAliasesと旧作品

`templateId`と現行region IDは変更していない。さらに旧世代で使われた統合region IDを次へ引き継ぐ。

- うさぎ: `ear_left`、`ear_right`、`cheeks`
- イルカ: `body`、`nose`、`tail`、`fin_top`、`fin_side`
- きょうりゅう: `legs`、`claws`、`spikes`、`spots`
- うま: `legs`、`head`
- ライオン: `head`、`legs`、`tail_tuft`、`paws`
- バッタ: `body`、`wings`、`legs`、`segments`、`antenna`
- びりびり ねずみ: region IDを変更していないため追加aliasなし

`normalizeRegionColors()`と`syncArtworkRegionColors()`が旧色を新しい対応領域へ補完する。元のキーは削除せず、有効な既存色を維持する。`regionColorDesignVersion`だけを現在値へ同期する。

## データ互換

- 保存キー4種は変更していない。
- `schemaVersion`は1のまま。
- ぬりえは11種類、必要スター、解放順、templateIdを維持。
- `artworks`、`regionColors`、作品アルバム、世界配置、親コメント、おきにいりを維持。
- JSONエクスポート・復元は既存形式のまま。
- `ensureDataShape()`を2回実行しても作品色が変化しないことを確認。
- スター、鳥、たまご、キッチン、おうち、おでかけ、親モードには処理変更なし。

## レビュー画面

`tests/coloring-preview.html`は本番localStorageを使わず、刷新7種について次を同時表示する。

- 旧原画
- 新原画の未着色線画
- 新原画の黒シルエット
- 新原画のサンプル着色
- 80px
- 120px
- region ID
- regionAliases

## 自動検証

- 全本番JavaScript構文評価: 合格
- `tests/smoke-tests.js`: 合格
- 読み込み順: `coloring-art-v30.js`が`coloring.js`より前
- 11テンプレート維持: 合格
- 刷新7種のregion ID一致・一意性: 合格
- `color-regions`のstrokeなし: 合格
- 旧regionColors移行と冪等性: 合格
- 保護4種の定義・空SVG SHA-256一致: 合格
- 外部URL、外部画像、外部SVG、CDN、fetch、type=moduleなし: 合格

## ブラウザ確認

390×844のEdgeタッチ相当で次を確認した。

- 比較カード7件、SVG 42件がすべて非空
- 7種すべてに80pxと120pxの確認表示
- 横幅 `clientWidth === 390`、`scrollWidth === 390`
- 本番ぬりえ一覧11件
- 主要ボタン48px以上
- コンソールエラー0件
- 読込失敗0件

実機iPhone Safariはこの環境から操作できないため、公開後はSafariとstandaloneで最終確認する。

## 手動確認項目

- 旧作品を開いた時に色が自然に引き継がれる
- 各小領域を指で正しく選択できる
- 作品保存、再読込、削除、アルバム表示
- 森と各世界への既存作品配置
- JSONバックアップ・復元
- iPhone Safariとstandaloneでの80px/120px表示
- apple-touch-iconとPWA standalone設定の維持
