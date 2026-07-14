# こどもの冒険

## 概要

「こどもの冒険」は、子どもの毎日の頑張りが冒険の世界へ反映される生活習慣アプリです。

Ver.1.0 試作9の子ども向け表示名は **結羽ちゃんの冒険** です。

## バージョン

- 表示名: 結羽ちゃんの冒険
- 内部プロジェクト名: こどもの冒険
- バージョン: Ver.1.0 試作9
- appVersion: `1.0.0-prototype.9`
- schemaVersion: `1`

## 基本体験

1. 今日のおしごとをする
2. スターをもらう
3. ぬりえを解放する
4. 自由に色を塗る
5. まほうの仕上げで作品が変身する
6. 作品を置く世界を選ぶ
7. 世界の中で作品を自由に並べる
8. 今日のぼうけんと思い出が残る
9. あつめたほし10こごとに、ふしぎなたまごが増える

## 技術条件

完全無料で使える静的Webアプリです。

- HTML
- CSS
- JavaScript
- SVG
- localStorage

外部API、外部AI、有料サービス、npm依存、ビルドツール、CDN、ログイン、クラウド保存は使っていません。画像生成AI、外部画像、外部SVGも使用していません。

`index.html` をブラウザで直接開いても動作します。GitHub Pagesにも対応します。

## 試作8の主な変更

- 蝶の鱗粉・光の粒を作品コンテナ内へ移し、ドラッグ後に旧位置へ残らないよう修正
- うさぎ、イルカ、きょうりゅう、うまの原画を再修正
- 島の木が島の地面から生えて見えるように修正
- 城背景を、左右の塔・中央入口・中庭を持つ絵本風のお城へ修正
- 空島背景を、島の下に空間が見える浮島へ修正
- ライオン、パンダ、バッタのぬりえを追加
- ぬりえ全10種類へ拡張
- designVersion同期と既存作品互換を維持

## 実装済み機能

- ホーム
- 今日のおしごと
- スター獲得演出
- ぬりえ一覧
- SVGぬりえ編集
- まほうの仕上げ
- せかい画面
- 森、海、島、城、空島
- 新しい作品の配置先選択
- 世界間の作品移動
- 世界ごとの作品配置編集
- 今日のぼうけん
- 今日の作品・簡易アルバム
- 親モード
- データ管理
- localStorage保存
- JSONバックアップ・復元
- schemaVersion 1対応
- スマホ対応
- ふしぎなたまご
- BGM
- 効果音
- 12色クレヨン風パレット

## 初期おしごと

- はみがき
- おきがえ
- えほん
- ピアノ
- ドリル
- そろばん

各おしごとの初期報酬は1スターです。1つのおしごとは1日1回だけスターを獲得できます。

## ぬりえと解放順

| ぬりえ | templateId | 必要スター | designVersion |
| --- | --- | ---: | ---: |
| ちょうちょ | `coloring_butterfly_001` | 4 | 5 |
| おはな | `coloring_flower_001` | 8 | 6 |
| うさぎ | `coloring_rabbit_001` | 12 | 9 |
| ねこ | `coloring_cat_001` | 16 | 5 |
| イルカ | `coloring_dolphin_001` | 20 | 9 |
| きょうりゅう | `coloring_dinosaur_001` | 24 | 9 |
| うま | `coloring_horse_001` | 28 | 9 |
| ライオン | `coloring_lion` | 32 | 2 |
| パンダ | `coloring_panda` | 36 | 1 |
| バッタ | `coloring_grasshopper` | 40 | 2 |

作品はBase64画像として保存せず、SVGテンプレートIDと領域別カラー情報から再描画します。

既存作品の `regionColors` は、新旧領域IDの対応表に基づいて補完します。既存作品、解放済み状態、完成日、親コメント、お気に入り、世界配置、`worldId`、`xPercent`、`yPercent`、`zIndex`、`isManual` は維持します。

## 新規ぬりえの推奨世界

- ライオン: 島、城。初期配置先は島。
- パンダ: 森、島。初期配置先は森。
- バッタ: 森、島、空島。初期配置先は森。

おすすめ世界は案内だけです。どの作品も、森、海、島、城、空島のどこへでも置けます。

## せかい

初期状態では、次の5世界をすべて利用できます。

| 世界 | ID | designVersion |
| --- | --- | ---: |
| 森 | `world_forest` | 1 |
| 海 | `world_sea` | 1 |
| 島 | `world_island` | 2 |
| 城 | `world_castle` | 2 |
| 空島 | `world_sky_island` | 2 |

作品は同時に1つの世界だけに所属します。所属世界は配置データ内の `placement.worldId` に保存します。

```text
placement: {
  worldId: "world_forest",
  xPercent: 52.4,
  yPercent: 68.1,
  zIndex: 4,
  isManual: true,
  updatedAt: "..."
}
```

試作6以前の既存作品は、初回補完時に `world_forest` へ所属させます。不正な `worldId` がある場合も作品を削除せず、`world_forest` へ安全に戻します。

## 蝶の鱗粉追従

蝶本体と鱗粉・光の粒は、同じ作品コンテナ内に配置します。保存する座標は従来どおり作品の `placement` だけで、鱗粉の独立座標は保存しません。

ならべかえ中は鱗粉を一時非表示にし、編集終了後に新しい位置で再開します。

## 保存キー

- アプリデータ: `kodomoAdventure.appData.v1`
- UI状態: `kodomoAdventure.uiState.v1`
- 一時バックアップ: `kodomoAdventure.backup.v1`

試作8でも保存キーは変更していません。schemaVersionも `1` のままです。

## データバックアップ

親モードからデータ管理を開き、JSONを書き出せます。復元時はJSON形式、必須項目、schemaVersionを確認し、不正データなら現在のデータを変更しません。

試作7以前のJSONを読み込んだ場合も、新しいぬりえ定義、世界designVersion、`placement.worldId` を補完します。

## テスト用ページ

本番画面からはリンクしていない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`

## ファイル構成

```text
kodomo-adventure-local
├─ index.html
├─ css
│  └─ styles.css
├─ js
│  ├─ constants.js
│  ├─ date-utils.js
│  ├─ storage.js
│  ├─ eggs.js
│  ├─ migrations.js
│  ├─ state.js
│  ├─ stars.js
│  ├─ tasks.js
│  ├─ coloring.js
│  ├─ worlds.js
│  ├─ parent-mode.js
│  ├─ router.js
│  └─ app.js
├─ tests
└─ docs
```

## 既知の制約

- 複数プロフィール切り替えは未実装
- 季節の自動切り替えは未実装
- 本格的な生き物図鑑は未実装
- PWAとService Workerは未実装
- 4桁PINは未実装
- 世界解放条件はデータ構造のみで、試作8では全世界利用可能

## Ver.1.0 試作9の更新

- レビュー用ページで採用した6種類の候補原画を本番ぬりえへ正式統合しました。
- 対象は、うさぎ、イルカ、うま、きょうりゅうD案、ライオンA改、バッタC改です。
- 本番SVGは `color-regions`、`outer-outline`、`inner-lines`、`face-details` の4層構造です。
- 細い脚、尾、ひれ、耳などには見た目に出ない透明hit-areaを追加し、スマホで押しやすくしています。
- `templateId` と `regionColors` 保存方式は維持し、既存作品、親コメント、お気に入り、worldId、xPercent、yPercent、zIndex、isManualを維持します。
- designVersionは、うさぎ・イルカ・きょうりゅう・うまを9、ライオン・バッタを2へ更新しました。
- 画像生成AI、外部画像、外部SVG、素材ダウンロードは使用していません。
- 保存キーとschemaVersionは変更していません。
