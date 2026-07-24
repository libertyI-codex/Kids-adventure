# Ver.1.0 試作16 実装メモ

## 概要
試作16では、試作15後に入っていたstandalone対応を正式な試作16として統一し、くじゃくの鳥SVGを追加修正した。

## バージョン
- appVersion: `1.0.0-prototype.16`
- 画面表示: `Ver.1.0 試作16`
- キャッシュ対策: `?v=10p16`
- schemaVersion: `1`
- 保存キー: 変更なし

## PWA / standalone設定
試作15後のstandalone対応は維持した。

- `manifest.webmanifest`
- `display: "standalone"`
- `start_url: "./"`
- `scope: "./"`
- `apple-mobile-web-app-capable=yes`
- `apple-mobile-web-app-title=こどもの冒険`
- `mobile-web-app-capable=yes`
- `apple-mobile-web-app-status-bar-style=default`
- 親モードの起動診断
- `navigator.standalone` 判定
- `display-mode: standalone` 判定
- scope判定

Service Workerは追加していない。

## くじゃく修正
対象speciesId: `companion_peacock`

- designVersion: `3`
- viewBox: `-105 -100 420 260`
- 尾羽グループ: `peacock-tail-group`
- 本体グループ: `peacock-body-group`
- 尾羽拡大率: `2`
- 本体縮小率: `0.5`

試作15の尾羽path、目玉模様、色、重なりは維持し、`transform="translate(-105 -100) scale(2)"` で尾羽グループだけを拡大した。

顔・目・くちばし・冠羽・首・胴体・脚は、試作15のpathと色を維持し、`transform="translate(52.5 45) scale(0.5)"` で本体グループだけを縮小した。脚や顔パーツが元位置へ残らないよう、顔詳細も同じ本体グループへ含めている。

## 他の鳥
次の5種類はdesignVersion 2のまま維持した。

- `companion_chick`
- `companion_duck`
- `companion_parrot`
- `companion_owl`
- `companion_sparrow`

## レビュー用ページ
`tests/bird-companion-review.html` を更新した。

くじゃくは次を比較表示する。

- 試作15相当
- 試作16
- 通常カラー
- 黒一色シルエット
- 120px
- 80px
- 図鑑カード相当
- ホームお気に入り相当
- 孵化表示相当
- designVersion
- viewBox
- 尾羽拡大率
- 本体縮小率

## 検証
`tests/smoke-tests.js` へ次を追加した。

- appVersionが `1.0.0-prototype.16`
- 表示が `Ver.1.0 試作16`
- キャッシュが `?v=10p16`
- `10p15pwa1` が本番コードへ残っていない
- manifest参照が `?v=10p16`
- apple-touch-icon参照が `?v=10p16`
- `companion_peacock` がdesignVersion 3
- 他5種類がdesignVersion 2
- `peacock-tail-group` が存在
- `peacock-body-group` が存在
- 尾羽が2倍
- 本体が0.5倍
- 顔、くちばし、冠羽、目玉模様が維持されている
- standalone設定が維持されている
- 保存キーとschemaVersionが未変更

## 手動確認項目
- iPhoneで最新版をSafariから開き、古いホーム画面アイコンを削除して追加し直す
- ホーム画面起動時にSafariバーが出ない
- 親モード起動診断で「独立アプリ」になる
- 通常Safari起動では「Safari」になる
- くじゃくの尾羽が主役に見える
- くじゃくの顔・目・くちばし・冠羽が試作15と同じ印象に見える
- 80px/120px/図鑑/ホーム/孵化表示で切れない
