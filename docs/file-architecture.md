# File Architecture

## 1. 方針

Ver.1.0はビルドツールなしでGitHub Pages上で動く構成にします。

使用しないもの:

- npmビルド
- バンドラー
- TypeScriptコンパイル
- 外部CDN
- 外部API
- Service Worker

HTML、CSS、JavaScript、ローカル素材だけで構成します。

## 2. 実装時の推奨フォルダ構成

この文書は設計です。今回は下記ファイルを作成しません。

```text
kodomo-adventure-local
├─ README.md
├─ docs
│  ├─ design-final.md
│  ├─ ver1.0-spec.md
│  ├─ data-schema-v1.md
│  ├─ file-architecture.md
│  └─ test-plan-v1.md
├─ index.html
├─ css
│  ├─ base.css
│  ├─ layout.css
│  ├─ components.css
│  ├─ screens.css
│  └─ animations.css
├─ js
│  ├─ app.js
│  ├─ constants.js
│  ├─ date-utils.js
│  ├─ storage.js
│  ├─ migrations.js
│  ├─ state.js
│  ├─ router.js
│  ├─ tasks.js
│  ├─ stars.js
│  ├─ coloring.js
│  ├─ magic.js
│  ├─ forest.js
│  ├─ parent-mode.js
│  ├─ backup.js
│  ├─ render.js
│  └─ views
│     ├─ home-view.js
│     ├─ tasks-view.js
│     ├─ star-view.js
│     ├─ coloring-list-view.js
│     ├─ coloring-editor-view.js
│     ├─ magic-view.js
│     ├─ forest-view.js
│     ├─ adventure-summary-view.js
│     ├─ album-view.js
│     ├─ parent-view.js
│     └─ data-view.js
└─ assets
   ├─ icons
   ├─ coloring
   ├─ forest
   └─ ui
```

## 3. HTML

### index.html

責務:

- アプリの単一エントリーポイント
- CSS読み込み
- JavaScriptエントリー読み込み
- ルート要素の配置
- noscriptメッセージ

方針:

- 画面ごとのHTMLファイルは作らない
- ルーティングはJavaScriptで行う
- GitHub Pagesでそのまま動かす

## 4. CSS

### base.css

責務:

- CSS変数
- リセット
- フォント指定
- 色
- 基本文字サイズ
- アクセシビリティ基盤

外部フォントは使いません。端末標準の読みやすいフォントにします。

### layout.css

責務:

- アプリ全体レイアウト
- ヘッダー
- 下部ナビ
- 画面コンテナ
- スマホ優先のレスポンシブ

### components.css

責務:

- ボタン
- カード
- バッジ
- モーダル
- トースト
- パレット
- フォーム部品

### screens.css

責務:

- 各画面固有の見た目
- ホーム
- 今日のおしごと
- ぬりえ
- 森
- 親モード

### animations.css

責務:

- スター獲得演出
- まほう演出
- 森の小さな動き
- アニメーション控えめ設定

## 5. JavaScriptモジュール

ES Modulesを推奨します。GitHub Pagesでは相対パスで読み込めます。ビルドは不要です。

### app.js

責務:

- アプリ起動
- 初期化順序の管理
- ルーター開始
- エラーハンドリング

依存:

- constants
- storage
- migrations
- state
- router
- date-utils

### constants.js

責務:

- appVersion
- schemaVersion
- localStorageキー
- 初期おしごと
- 初期ぬりえ
- 初期ワールド
- 色パレット

他モジュールへの依存は持たせません。

### date-utils.js

責務:

- ローカル日付キー生成
- 曜日判定
- ISO日時生成
- 日付変更検出

日付処理は必ずここに集約します。

### storage.js

責務:

- localStorage読み込み
- localStorage保存
- JSON parse/stringify
- 保存失敗検出
- 容量概算
- 破損データ検出

画面から直接localStorageを触らない方針にします。

### migrations.js

責務:

- schemaVersion別マイグレーション
- マイグレーション前バックアップ
- ensureDataShape相当の補完

storageに依存しますが、画面には依存しません。

### state.js

責務:

- 現在のappData
- 現在のuiState
- 状態更新
- 保存要求
- 今日のdailyRecord取得

ロジックの中心ですが、画面描画には直接依存しません。

### router.js

責務:

- 画面遷移
- 下部ナビの選択状態
- 画面表示関数の呼び出し
- 戻る操作

業務ロジックは持たせません。

### tasks.js

責務:

- 今日のおしごと一覧取得
- 完了判定
- 完了処理
- 親モードでの訂正処理

stars、date-utils、stateに依存します。

### stars.js

責務:

- 累計スター加算
- つかえるスター加算・減算
- スター履歴追加
- 残高検証
- 訂正時の調整

画面には依存しません。

### coloring.js

責務:

- ぬりえテンプレート取得
- 解放判定
- 解放処理
- 領域カラー管理
- 完成作品作成

stars、stateに依存します。

### magic.js

責務:

- 代表色判定
- 明るさ判定
- 色系統判定
- 固定シード生成
- 森配置候補の計算
- まほう結果データ作成

AIではなく、ローカルルールによる演出計算です。

### forest.js

責務:

- ワールド取得
- 配置追加
- 配置更新
- 森レベル計算
- 作品タップ時データ取得

Canvasには依存しません。SVGレイヤーに渡すデータを作ります。

### parent-mode.js

責務:

- 親モード入室判定
- おしごと設定更新
- 子どもの名前更新
- 親のひとこと保存
- 完了訂正の起点

PINはVer.1.0では必須実装にしません。将来のために設定構造だけ扱えるようにします。

### backup.js

責務:

- JSONエクスポート
- JSONインポート
- インポート前検証
- 一時バックアップ
- 初期化前バックアップ

### render.js

責務:

- 共通DOM生成補助
- モーダル
- トースト
- エラー表示
- 安全なテキスト描画

画面固有の描画は `views` に置きます。

## 6. views

views配下は画面単位の描画を担当します。

| ファイル | 責務 |
|---|---|
| `home-view.js` | ホーム画面 |
| `tasks-view.js` | 今日のおしごと |
| `star-view.js` | スター獲得演出 |
| `coloring-list-view.js` | ぬりえ一覧 |
| `coloring-editor-view.js` | ぬりえ編集 |
| `magic-view.js` | まほうの仕上げ |
| `forest-view.js` | 森 |
| `adventure-summary-view.js` | 今日のぼうけん |
| `album-view.js` | 今日の作品・簡易アルバム |
| `parent-view.js` | 親モード |
| `data-view.js` | データ管理 |

viewsは、業務ロジックを直接持ちすぎないようにします。

## 7. 読み込み順

HTML上の読み込みは最小にします。

```text
CSS
↓
js/app.js
```

`app.js` からES Modulesで必要なモジュールを読み込みます。

概念上の初期化順:

```text
constants
↓
storage
↓
migrations / ensureDataShape
↓
state
↓
date-utilsで今日のrecord確認
↓
router
↓
home-view
```

## 8. 依存関係

推奨依存:

```text
constants
date-utils
  ↑
storage ← migrations
  ↑        ↑
state ← tasks ← views/tasks-view
state ← stars ← tasks/coloring/parent-mode
state ← coloring ← views/coloring-*
state ← magic ← coloring/magic-view
state ← forest ← views/forest-view
router ← views
```

## 9. 循環依存を避ける方針

禁止する依存:

- `storage` が画面に依存する
- `stars` が画面に依存する
- `tasks` が特定viewに依存する
- `forest` が `forest-view` に依存する
- `router` がスター計算を直接行う

ルール:

- 下位層は上位層を知らない
- 業務ロジックはDOMを触らない
- viewはロジック関数を呼ぶだけにする
- 共通定数は `constants.js` に集約する
- 日付処理は `date-utils.js` 以外に散らさない

## 10. SVG素材方針

ぬりえ素材:

- `assets/coloring` に置く
- 領域ごとにIDを持たせる
- JavaScriptが領域IDへ色を適用する

森素材:

- `assets/forest` に置く
- 背景、木、草などはレイヤー化しやすくする
- 完成作品はデータから再描画する

アイコン:

- 外部アイコンCDNは使わない
- 必要なアイコンはローカルSVGまたはCSSで表現する

## 11. GitHub Pages方針

GitHub Pages公開時は、`github-pages` へ公開用コピーを置く運用を想定します。ただし今回その中身は作成・変更しません。

Ver.1.0実装時は、相対パスで動くようにします。

避けるもの:

- 絶対パス依存
- ローカルPC固有パス
- CDN依存
- Node.js実行前提

