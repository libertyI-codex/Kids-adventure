# こどもの冒険 Ver.1.0 試作8 実装メモ

## 目的

試作8では、実機確認で判明した表示不具合を修正し、ぬりえ原画の判別性を上げ、新しいぬりえを3種類追加した。

対象。

- 蝶の鱗粉追従
- うさぎ、イルカ、きょうりゅう、うまの再修正
- 島、城、空島の背景修正
- ライオン、パンダ、バッタの追加

画像生成AI、外部画像、外部SVG、素材ダウンロードは使用していない。

## 蝶の鱗粉が残った原因

試作7では作品表示が、配置座標を持つ `.forest-object` の中にSVGだけを直接入れる構造だった。

そのため、鱗粉・光・装飾を追加する場合に、背景側や作品外の座標で描画すると、作品をドラッグした後も旧位置へ残りやすい構造だった。

試作8では、原因を次のように整理した。

- 作品本体と装飾を同じDOMコンテナにまとめる必要がある
- 装飾に独立した世界座標を持たせない
- ドラッグ中は装飾アニメーションを止める、または非表示にする
- 再描画時は作品IDとplacementから装飾を再生成する

## 鱗粉追従の実装方式

森・世界画面の作品DOMを次の構造へ変更した。

```text
button.forest-object
└─ span.artwork-wrapper
   ├─ span.artwork-svg
   │  └─ inline svg
   └─ span.artwork-effects
      ├─ span.dust-1
      ├─ span.dust-2
      └─ ...
```

`.forest-object` が `left`、`top`、`transform`、`zIndex` を持つため、蝶本体と鱗粉は同時に移動する。

鱗粉の位置は `.artwork-wrapper` 内の相対座標だけで表現し、保存データへ独立座標は持たせない。

ならべかえ中は `.forest-stage.is-editing .artwork-effects { display: none; }` により一時非表示にする。

## 4種類の原画修正内容

### うさぎ

`coloring_rabbit_001` を `designVersion: 8` に更新した。

横向きの全身として、長い耳、鼻先、首から胸のくびれ、大きな後脚、小さな前脚、丸いしっぽを強調した。

領域数: 12

### イルカ

`coloring_dolphin_001` を `designVersion: 8` に更新した。

主胴体を滑らかな流線形のpathで構成し、細い口先、背びれ、胸びれ、尾の付け根、上下に分かれた尾びれを明確にした。

領域数: 9

### きょうりゅう

`coloring_dinosaur_001` を `designVersion: 8` に更新した。

ティラノサウルス風の横向き全身にし、前へ伸びた頭、はっきりした下あご、小さな前脚、太い後脚、長いしっぽを強調した。大きな三角トゲの連続にはしていない。

領域数: 12

### うま

`coloring_horse_001` を `designVersion: 8` に更新した。

顔を細長く、首を前上方へ伸ばし、脚を長めにして4本の位置をずらした。ひづめは小さな足先として残した。

領域数: 12

## 新規3種類のSVG構成

### ライオン

templateId: `coloring_lion`

必要スター: 32

designVersion: 1

領域数: 11

主な領域。

- たてがみ
- 顔
- 耳
- 鼻
- 胴体
- 胸
- 前脚
- 後脚
- しっぽ
- しっぽ先
- 足先

推奨世界は島、城。初期配置先は島。

### パンダ

templateId: `coloring_panda`

必要スター: 36

designVersion: 1

領域数: 10

主な領域。

- 顔
- 左右の耳
- 左右の目の周りの模様
- 鼻
- 胴体
- お腹
- 前脚
- 後脚

推奨世界は森、島。初期配置先は森。

### バッタ

templateId: `coloring_grasshopper`

必要スター: 40

designVersion: 1

領域数: 10

主な領域。

- 頭
- 目
- 触角
- 胸
- 腹
- 羽
- 前脚
- 中脚
- 大きな後脚
- 体の節

推奨世界は森、島、空島。初期配置先は森。

## regionAliases

既存4種類は既存の領域IDを基本的に維持した。

旧作品互換のため、既存の `regionAliases` は継続している。旧領域IDから新領域IDへ補完できるものは `normalizeRegionColors()` と `ensureDataShape()` の同期処理で引き継ぐ。

新規3種類は初回追加のため `regionAliases: {}` とした。

## 島の木の修正

`world_island` を `designVersion: 2` に更新した。

木の幹の根元を島の草地内へ移動し、海レイヤーの上ではなく、砂浜・草地の後に幹と葉を描画する構造へ変更した。根元に草の接地表現を追加し、海から幹が伸びて見えないようにした。

## 城背景の構成

`world_castle` を `designVersion: 2` に更新した。

城背景を全面的に描き直し、次を含めた。

- 中央の城本体
- 左右の縦長の塔
- 塔の屋根
- 中央のアーチ入口
- 左右の窓
- 城壁上部
- 旗
- 中庭
- 石畳の小道
- 噴水と花壇

作品配置領域は画面下半分の中庭を中心に残している。

## 空島背景の構成

`world_sky_island` を `designVersion: 2` に更新した。

島を画面中央からやや下に置き、島の下端と画面下端の間に空が見える余白を作った。島の下側は岩塊状に細くし、地面が下へつながって見えないようにした。

構成。

- 青空
- 遠くの雲
- 浮島
- 島上部の草地
- 下に細くなる岩
- 小さな滝
- 虹
- 光の粒

## 世界designVersion

| worldId | designVersion |
| --- | ---: |
| `world_forest` | 1 |
| `world_sea` | 1 |
| `world_island` | 2 |
| `world_castle` | 2 |
| `world_sky_island` | 2 |

## テンプレートdesignVersion

| templateId | designVersion |
| --- | ---: |
| `coloring_butterfly_001` | 5 |
| `coloring_flower_001` | 6 |
| `coloring_rabbit_001` | 8 |
| `coloring_cat_001` | 5 |
| `coloring_dolphin_001` | 8 |
| `coloring_dinosaur_001` | 8 |
| `coloring_horse_001` | 8 |
| `coloring_lion` | 1 |
| `coloring_panda` | 1 |
| `coloring_grasshopper` | 1 |

## データ互換

維持したもの。

- 既存作品
- 解放済み状態
- 完成日
- 親コメント
- お気に入り
- 森・各世界への配置
- `worldId`
- `xPercent`
- `yPercent`
- `zIndex`
- `isManual`
- スター履歴
- たまご
- BGM・効果音設定
- 保存キー
- schemaVersion

`ensureDataShape()` は、新しいテンプレートを不足分だけ追加し、保存済みの組み込みテンプレートと世界定義を正式定義へ同期する。複数回実行しても同じテンプレートや世界を重複追加しない。

## 検証結果

実装後に確認した内容。

- JS構文評価
- appVersion `1.0.0-prototype.8`
- 保存キー変更なし
- schemaVersion変更なし
- ぬりえ10種類
- 新規3種類の必要スター 32 / 36 / 40
- うさぎ、イルカ、きょうりゅう、うまのdesignVersion 8
- 島、城、空島のdesignVersion 2
- 新規3種類の保存・再描画
- 新規3種類の推奨世界
- 既存作品互換
- `ensureDataShape()` 重複防止
- 世界移動と配置維持
- 蝶の鱗粉が作品コンテナ内にあること

## 手動確認項目

ブラウザ・実機操作が必要な確認。

- 蝶をならべかえで移動しても旧位置に鱗粉が残らないこと
- 複数の蝶で鱗粉が混ざらないこと
- iPhone Safariでドラッグ中に文字選択が出ないこと
- うさぎ、イルカ、きょうりゅう、うまが120pxでも判別できること
- ライオン、パンダ、バッタが120pxでも判別できること
- 島の木が島の地面から生えて見えること
- 城が絵本風のお城として見えること
- 空島の下に空間が見えること
- BGM・効果音が従来通り動くこと
- JSONバックアップ・復元を実ブラウザで実行できること
