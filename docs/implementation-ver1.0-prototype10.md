# Ver.1.0 試作10 実装メモ

## 目的
既存の5世界を維持したまま、6つ目の世界として「ひみつきち」を追加した。

## ひみつきちのコンセプト
子どもだけの小さくて居心地のよい隠れ部屋。暗い地下室ではなく、明るい木造の小屋、屋根裏、ツリーハウスの室内を思わせる空間にした。

主な印象:

- 明るい
- 温かい
- 安心できる
- 手作り感がある
- 軽い料理や食事ができそう
- 冒険の地図や宝箱で秘密基地らしさがある

## 世界定義
追加した正式定義:

```js
{
  id: "world_secret_base",
  worldId: "world_secret_base",
  name: "ひみつきち",
  title: "みんなのひみつきち",
  icon: "🏠",
  description: "キッチンとテーブルがある、みんなのひみつきち！",
  theme: "secret_base",
  unlocked: true,
  unlockedAt: null,
  designVersion: 1,
  displayOrder: 6,
  unlockCondition: null
}
```

schemaVersionと保存キーは変更していない。

## 背景SVG構成
`js/app.js` の `worldBackgroundSvg()` に `world_secret_base` 分岐を追加した。外部画像、外部SVG、Canvas画像生成は使っていない。

レイヤー順:

1. 基礎背景
2. 木の壁
3. 木の床
4. 梁、窓、照明
5. 奥側の地図と棚
6. 左側キッチン
7. 右側テーブルと椅子
8. ラグ、宝箱、植物、小物
9. 作品

## キッチンの構成
左側へ小さなキッチンを配置した。

- 調理台
- シンク
- 蛇口
- コンロ
- 下部収納
- 扉と引き出し
- 棚
- カップ、皿、調理道具

キッチンは床と壁に接する背景要素で、作品のドラッグ対象にはしない。

## テーブルの構成
右側へテーブルと椅子を配置した。

- 天板
- 脚
- 左右の椅子
- コップ
- 地図または本
- 小物

テーブルも背景要素であり、作品の配置編集時に移動しない。

## 自動配置候補
`js/worlds.js` に `world_secret_base` 専用スロットを追加した。

候補ゾーン:

- `rug_center`
- `kitchen_front`
- `table_side`
- `table_front`
- `window_light`
- `lamp_light`
- `treasure_side`
- `cushion_side`
- `plant_corner`
- `map_wall`

家具の完全な裏側や天井、コンロ上を避け、作品が見えやすい中央から下部の空間を中心にした。

## selectedWorldId対応
`uiState.selectedWorldId` は世界定義から検証されるため、`WORLD_DEFINITIONS` に `world_secret_base` を追加することで正しい世界IDとして扱われる。無効IDだけが `world_forest` へ戻る。

## ensureDataShape対応
既存の `syncWorlds()` は `WORLD_DEFINITIONS` を基準に不足世界を追加する。試作10ではこの仕組みにより、旧データへ `world_secret_base` だけを不足分として追加する。

維持するデータ:

- 既存5世界
- 既存作品
- `worldId`
- `xPercent`
- `yPercent`
- `zIndex`
- `isManual`
- 親コメント
- お気に入り
- スター
- たまご

## JSON互換
JSONエクスポートには `world_secret_base` が含まれる。試作9以前のJSONを復元した場合は、補完処理で新世界を追加するが、既存作品は自動移動しない。

## テストページ
`tests/worlds-preview.html` に `world_secret_base` を追加した。

確認できる内容:

- ひみつきち背景
- キッチン
- テーブル
- 椅子
- 中央の作品配置空間
- 390px幅相当の表示
- 自動配置サンプル
- ドラッグ配置
- 世界間移動
- `xPercent` / `yPercent`

## 自動検証結果
実装後に `tests/smoke-tests.js` を更新し、次を検証対象に追加した。

- 世界定義が6種類
- `world_secret_base` が1件だけ存在
- `designVersion` が1
- `displayOrder` が6
- `unlocked` がtrue
- `unlockCondition` がnull
- `ensureDataShape()` が冪等
- `selectedWorldId` へ保存できる
- 作品をひみつきちへ移動できる
- ひみつきちで自動配置できる
- ひみつきちで自由配置できる
- `もとにもどす` が対象世界だけに作用する
- 保存キーとschemaVersionが変わっていない

## 手動確認項目
- iPhone Safari相当の縦画面で横スクロールが出ないこと
- キッチンとテーブルが実機で十分大きく見えること
- 家具が作品ドラッグ対象にならないこと
- ひみつきち選択後、再読み込みしても同じ世界が開くこと
- 作品が家具の完全な裏側に隠れないこと
- 下部ナビや説明パネルで重要な家具が隠れないこと
