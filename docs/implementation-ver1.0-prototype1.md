# 実装メモ Ver.1.0 試作1

## 実装方針

設計書を正式仕様として、Ver.1.0 試作1を静的Webアプリとして実装した。

今回の追加条件により、`docs/file-architecture.md` のES Modules推奨部分は採用せず、ローカル `index.html` 直接起動を優先して通常の `script defer` と `window.KodomoAdventure` 名前空間を使った。

## 設計との差分

- `type="module"` は使用しない。
- SVGぬりえ素材は外部ファイルや `fetch()` ではなく、JavaScript内のテンプレート関数として保持する。
- CSSはVer.1.0試作1では `css/styles.css` へ集約した。
- viewファイルは分割せず、試作1では `js/app.js` に画面描画を集約した。
- Canvasは使用していない。まほう演出はCSSとSVGで実装した。

## 実装済み画面

- ホーム
- 今日のおしごと
- スター獲得演出
- ぬりえ一覧
- ぬりえ編集
- まほうの仕上げ
- 森
- 今日のぼうけん
- 今日の作品・簡易アルバム
- 親モード
- データ管理

## 保存仕様

保存キーは設計通り。

- `kodomoAdventure.appData.v1`
- `kodomoAdventure.uiState.v1`
- `kodomoAdventure.backup.v1`

作品はBase64画像として保存せず、`templateId`、`regionColors`、`usedColors`、`analysis`、`magicResult.seed`、`placementId` で保存する。

## 既知の制約

- 本格的な生き物図鑑は未実装。
- 複数プロフィール切り替えは未実装。
- 4桁PINは未実装。設定データに将来用項目のみ持つ。
- PWA、Service Worker、BGM、外部同期は未実装。
- 森の自由配置編集は未実装。固定スロットによる自動配置のみ。
