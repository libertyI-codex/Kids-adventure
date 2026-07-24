# Ver.1.0 試作12 修正版1 実装メモ

## 発生症状
iPhone Safariで起動時のスタート画面は表示され、時間経過後に消えるが、その後にアプリ本体が表示されず、淡い背景だけの空白画面になる。

## 根本原因
初期化中に例外が発生した場合でも、試作12のスタート画面フェイルセーフはsplashだけを閉じる構造だった。ホーム画面の初回render前に例外が起きると、`#app` が空のまま残り、splash終了後に背景だけが見える。

実機で発生しやすい原因として、`js/date-utils.js` の `String(value).padStart(2, "0")` がSafari世代によって未対応で、日付生成時に例外になる経路を確認した。`KA.state.init()` は `KA.date.localIsoString()` と `KA.date.localDateKey()` を初期化直後に使用するため、ここで止まると `KA.router.navigate("home")` まで到達しない。

## 例外が発生していた処理
- ファイル: `js/date-utils.js`
- 関数: `pad()`
- 呼び出し経路: `DOMContentLoaded` → `initApp()` → `KA.state.init()` → migration/default data/date helpers

`padStart` を使わず、文字列長を見て `"0" + text` する互換実装へ変更した。

## スクリプト読み込み順
`index.html` の非module読み込み順は維持した。

1. `constants.js`
2. `date-utils.js`
3. `storage.js`
4. `eggs.js`
5. `companions.js`
6. `migrations.js`
7. `state.js`
8. `stars.js`
9. `tasks.js`
10. `coloring.js`
11. `worlds.js`
12. `parent-mode.js`
13. `router.js`
14. `app.js`

`app.js` は最後、`companions.js` は `migrations.js` より前、`eggs.js` の後に読み込む。`type="module"` は使用していない。

## startup終了処理
`finishStartupScreen()` を追加し、通常終了、タップ終了、4秒フェイルセーフ終了をすべて同じ関数へ通した。

責務:
- 多重実行を防ぐ
- splashへ `is-hiding` を付ける
- `#app` の非表示・操作禁止を解除
- body/htmlのstartup classを解除
- スクロール禁止を解除
- splashをDOMから除去
- 本体が未描画なら復旧画面を描画

## 本体表示復旧処理
`unlockAppShell()` で以下を必ず実行する。

- `hidden = false`
- `hidden` 属性削除
- `aria-hidden` 属性削除
- `inert` 属性削除
- `element.inert = false`
- `display / visibility / opacity / pointerEvents / transform` のinline style解除
- `body.startup-active` 解除
- body/htmlの `overflow` 解除

## 初期化失敗時の復旧画面
`initApp()` を `try / catch / finally` 化した。

- `try`: データ読み込み、migration、ルート登録、初回render
- `catch`: `console.error` に記録し、保存データを削除せず復旧画面を描画
- `finally`: splash終了と本体復旧を必ず実行

復旧画面の表示:
- 「うまく よみこめませんでした」
- 「もういちど よみこむ」
- 「ホームを ひらく」

エラー詳細やスタックトレースは子ども画面へ出さない。

## Safari対応
- `padStart` 依存を除去
- `inert` は属性削除とプロパティ代入を両方実行し、失敗しても握りつぶす
- startup高さに `100vh / 100svh / 100dvh` を併記
- `prefers-reduced-motion` 既存対応を維持
- フェイルセーフ終了でも本体復旧処理を必ず通す

## localStorage別テスト
`tests/smoke-tests.js` に軽量DOMモックを追加し、以下を検証した。

- localStorage空
- 試作11相当データ: `state:new`、`eggSystem`なし、`companions`なし
- 試作12相当データ: activeたまご、`dailyActivity`、`companions`あり
- 不完全データ: `dailyActivity`なし、`companions:null`、無効な `activeEggId`、不正 `plannedSpeciesId`
- state初期化失敗
- migration失敗
- render失敗

すべてで、空白画面にならず、splashが終了し、本体が操作可能になることを確認した。

## 空白画面防止
初回renderが完了していない状態でsplash終了が走る場合、`finishStartupScreen()` が `#app` の内容を確認し、空なら復旧画面を描画する。これにより背景だけの画面を残さない。

## 検証結果
- 全本番JS構文評価: OK
- 関数名重複: なし
- `tests/smoke-tests.js`: OK
- `padStart` 本番利用なし
- `?v=10p12h1` 反映
- `index.html` に旧 `?v=10p12` 残存なし
- 外部URLなし
- fetchなし
- CDNなし
- type="module"なし
- 保存キー未変更
- schemaVersion未変更
- apple-touch-icon.png SHA変更なし

## 実機確認項目
- iPhone Safariでスタート画面後にホームが表示される
- ホームをタップできる
- 縦スクロールできる
- たまご、なかまずかん、ぬりえ、世界、親モードへ遷移できる
- 試作11以前の保存データでも起動できる
- 起動失敗時に復旧画面が出て空白にならない
