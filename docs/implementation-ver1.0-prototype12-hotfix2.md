# Ver.1.0 試作12 修正版2 実装メモ

## 実機症状
iPhone Safariでスタート画面は閉じるが、その後に「うまく よみこめませんでした」が表示される。修正版1の復旧画面では「ホームをひらく」を押しても本体初期化関数へ戻るため、同じ例外が残っている場合は操作可能な状態まで復旧できなかった。

## 修正版1の結果
修正版1では `padStart` をSafari互換の原因候補として修正したが、復旧画面が表示され続けているため、`padStart` を確認済み根本原因とは扱わない。修正版2では先に独立boot層で実際の例外を保存できる構造へ変更した。

## 実際に取得した例外
ローカルの起動順テストで、boot診断に次を取得した。

- error.name: `ReferenceError`
- error.message: `renderAlbum is not defined`
- stage: `EVENT_BINDING_STARTED`
- errorCode: `INIT-EVENTS-001`
- stack: `registerRoutes()` から `KA.router.register("album", renderAlbum)` を呼ぶ経路

iPhone実機で発生している例外は、修正版2以降 `kodomoAdventure.bootDiagnostic.v1` に保存される。実機固有の追加例外がある場合は、復旧画面の「しょうさいを コピー」で確認する。

## 確認済み根本原因
`js/app.js` の `registerRoutes()` に `renderAlbum` ルート登録が残っている一方、`renderAlbum()` 関数が定義されていなかった。これにより初期化中のイベント・ルート登録段階で `ReferenceError` が発生し、初回ホーム描画へ進めなかった。

## 原因ファイル・関数・行
- ファイル: `js/app.js`
- 関数: `registerRoutes()`
- 原因箇所: `KA.router.register("album", renderAlbum)`
- 修正: 既存の `artCard()` と `bindArtworkDetails()` を使う `renderAlbum()` を復元

## boot.jsの責務
`js/boot.js` を本体JavaScriptより先に読み込む。

- 起動段階の記録
- `window.error` 捕捉
- `unhandledrejection` 捕捉
- 診断情報保存
- startup lock解除
- splash終了
- 復旧画面表示
- 復旧ボタン処理
- safeStartモード表示
- 診断情報コピー

`KA.state`、`KA.app`、`KA.eggs`、`KA.companions` には依存しない。

## 診断情報構造
専用キー:

`kodomoAdventure.bootDiagnostic.v1`

保存内容:
- 発生日時
- 起動段階
- エラーコード
- error.name
- error.message
- filename
- line number
- column number
- stack
- rejection reason
- appVersion
- userAgent
- URL
- safe modeの有無

最新5件だけを保持する。

## startup lock解除
復旧画面表示前とsplash終了時に以下を解除する。

- `hidden`
- `inert`
- `element.inert = false`
- `aria-hidden`
- `opacity`
- `visibility`
- `pointer-events`
- `display`
- `transform`
- body/htmlのstartup class
- `overflow: hidden`
- `position: fixed`
- `touch-action`

復旧画面は `#app` の外、body直下の `#boot-recovery-root` に表示する。

## 復旧ボタンの独立方法
復旧ボタンは `boot.js` のdocument click委譲で処理する。

- 「もういちど よみこむ」: `window.location.reload()`
- 「あんぜんに ホームをひらく」: `safeStart=1&v=10p12h2` を付けて再読み込み
- 「しょうさいを コピー」: Clipboard API、失敗時はtextarea選択方式

本体の `KA.app` や `KA.router` は呼ばない。

## safeStartモード
URLに `safeStart=1` がある場合、本体初期化をスキップしてboot層が安全ホームを描画する。

- 保存データを削除しない
- localStorageを読み取り専用で扱う
- parse失敗時はメモリ上の一時表示にする
- たまご・仲間初期化へ依存しない
- ホーム、下部ナビ、おしごと、ぬりえ、せかい、さくひんの基本表示を出す
- 通常起動へ戻るボタンを表示する

## Safari互換性監査
修正版2で起動経路を確認した。

- `padStart`: 本番起動経路では不使用
- `Object.hasOwn`: 不使用
- `structuredClone`: 不使用
- `Array.prototype.at`: 不使用
- `findLast`: 不使用
- `replaceAll`: APIとしては不使用
- `crypto.randomUUID`: 不使用
- `Clipboard API`: bootでフォールバックあり
- `inert`: 属性削除とプロパティ代入の両方をtry付きで実行
- `URLSearchParams`: safeStart生成では使わず文字列処理

## localStorage別テスト
`tests/smoke-tests.js` で次を確認した。

- localStorage空
- 試作11相当データ
- 試作12相当データ
- 不完全データ
- 旧dailyRecordで `artworkIds` 等が欠落
- `state.init` throw
- render throw
- safeStart

旧dailyRecordについては、`completedTasks`、`artworkIds`、`forestPlacementIds`、`parentNotes`、`corrections` を補完する。

## ブラウザテスト結果
この環境ではPlaywrightの起動が権限エラーで失敗したため、実ブラウザ自動化は実施できなかった。単なる構文評価だけをブラウザ確認済みとは扱わない。実機確認は手動項目として残す。

## 検証結果
- `tests/smoke-tests.js`: OK
- boot.js先行読み込み: OK
- boot.js独立性: OK
- 復旧rootがbody直下: OK
- reload/safeStart/copyボタン: clickハンドラ実行確認
- `renderAlbum is not defined` 修正: OK
- 旧dailyRecord欠損補完: OK
- `?v=10p12h2` 反映: OK
- 保存キー未変更
- schemaVersion未変更
- apple-touch-icon.png未変更

## 手動確認項目
- iPhone Safariで通常起動し、splash後にホームが表示される
- 復旧画面が出た場合、エラー番号が表示される
- 「もういちど よみこむ」が反応する
- 「あんぜんに ホームをひらく」が反応する
- 「しょうさいを コピー」で診断情報をコピーできる
- safeStartで保存データを削除せず最低限ホームが開く
- 通常起動へ戻れる
- たまご、なかまずかん、ぬりえ、世界、さくひん、親モードが維持されている
