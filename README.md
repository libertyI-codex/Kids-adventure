# こどもの冒険

## 概要
「こどもの冒険」は、子どもの毎日の頑張りをスター、ぬりえ、作品、世界に反映するローカル専用Webアプリです。

Ver.1.0 試作10では、既存の5つの世界に加えて、新しい世界「ひみつきち」を追加しました。

## バージョン
- 表示名: 結羽ちゃんの冒険
- 内部プロジェクト名: こどもの冒険
- バージョン: Ver.1.0 試作10
- appVersion: `1.0.0-prototype.10`
- schemaVersion: `1`

## 基本体験
1. 今日のおしごとをする
2. スターをもらう
3. ぬりえを解放する
4. 自由に色を塗る
5. まほうの仕上げで作品が変身する
6. 作品を置く世界を選ぶ
7. 世界の中で作品を自由に並べ替える
8. 今日のぼうけんと思い出を残す
9. 累計スター10ごとに、ふしぎなたまごが増える

## 技術条件
完全無料で使える静的Webアプリです。

- HTML
- CSS
- JavaScript
- SVG
- localStorage

外部API、外部AI、有料サービス、npm依存、ビルドツール、CDN、ログイン、クラウド保存は使っていません。画像生成AI、外部画像、外部SVG、素材ダウンロードも使っていません。

`index.html` をブラウザで直接開いて動作します。GitHub Pagesにも対応します。

## 実装済み機能
- ホーム
- 今日のおしごと
- スター獲得演出
- ぬりえ一覧
- SVGぬりえ編集
- まほうの仕上げ
- せかい画面
- 世界選択
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

## ぬりえ
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

作品はBase64画像として保存せず、SVGテンプレートIDと領域別カラー情報から再描画します。既存作品の `regionColors` は互換処理で維持します。

## 世界
Ver.1.0 試作10では、次の6世界をすべて初期利用可能にしています。

| 世界 | ID | designVersion |
| --- | --- | ---: |
| 森 | `world_forest` | 1 |
| 海 | `world_sea` | 1 |
| 島 | `world_island` | 2 |
| 城 | `world_castle` | 2 |
| 空島 | `world_sky_island` | 2 |
| ひみつきち | `world_secret_base` | 1 |

作品は同時に1つの世界だけに所属します。所属世界は配置データ内の `placement.worldId` に保存します。

```text
placement: {
  worldId: "world_secret_base",
  xPercent: 52.4,
  yPercent: 68.1,
  zIndex: 4,
  isManual: true,
  updatedAt: "..."
}
```

## ひみつきち
「ひみつきち」は、木造の小さな隠れ部屋をイメージした世界です。

- 左側に小さなキッチン
- シンク、蛇口、コンロ、下部収納、棚、食器
- 右側にテーブル
- 天板、脚、椅子、コップや地図などの小物
- 木の壁、木の床、窓、ランタン、冒険の地図、宝箱、クッション

家具は背景要素です。作品のドラッグ対象にはなりません。中央から下部にかけて作品を置ける空間を確保しています。

## 保存キー
- アプリデータ: `kodomoAdventure.appData.v1`
- UI状態: `kodomoAdventure.uiState.v1`
- 一時バックアップ: `kodomoAdventure.backup.v1`

試作10でも保存キーは変更していません。schemaVersionも `1` のままです。

## データ互換
試作9以前のJSONを読み込んだ場合は、`world_secret_base` を不足分として追加します。既存作品、既存5世界、配置座標、親コメント、お気に入り、スター、たまごは維持します。

`ensureDataShape()` は、複数回実行しても世界や作品を重複追加しない設計です。

## テスト用ページ
本番画面からはリンクしていない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`
- `tests/animal-svg-review.html`

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
- 世界解放条件はデータ構造のみで、試作10では全世界利用可能
