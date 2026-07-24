# Ver.1.0 試作15 standalone起動対応メモ

## 目的
iPhoneのホーム画面アイコンから起動した際にSafariのアドレスバーと下部ツールバーが出る状態を解消し、standaloneの固有Webアプリとして起動できる条件を整えた。

## HTML設定
`index.html` の初期HTMLへ次を追加した。

- `apple-mobile-web-app-capable=yes`
- `mobile-web-app-capable=yes`
- `apple-mobile-web-app-title=こどもの冒険`
- `apple-mobile-web-app-status-bar-style=default`
- `rel="manifest"` を `./manifest.webmanifest?v=10p15pwa1` で追加

`apple-touch-icon`、スタート画面画像、CSS、JavaScriptのキャッシュ対策クエリは `?v=10p15pwa1` に更新した。

## manifest
`manifest.webmanifest` を追加した。

- `name`: `こどもの冒険`
- `short_name`: `こどもの冒険`
- `display`: `standalone`
- `start_url`: `./`
- `scope`: `./`
- icon: `./apple-touch-icon.png?v=10p15pwa1`

`start_url` と `scope` はmanifestが置かれた公開ディレクトリ基準の相対指定にした。GitHub Pagesの公開ディレクトリがサブパスでも、同じフォルダ内で起動・scope判定できる。

## 親モード診断
親モードに「起動診断」を追加した。

- 起動方法: `navigator.standalone` または `matchMedia("(display-mode: standalone)")` で判定
- 現在URL: `location.href`
- scope判定: manifest配置フォルダ基準のscope内外を表示

診断は親モード内のみで表示し、子ども側の通常画面には表示しない。

## Service Worker
今回は追加していない。standalone化の必須条件ではなく、既存キャッシュや起動復旧の問題を増やさないため。

## 既存ホーム画面アイコン
iOSの既存ホーム画面ショートカットは、追加時点のHTML設定を保持している場合がある。公開後は既存アイコンを一度削除し、Safariで最新版を開いてから改めてホーム画面へ追加する必要がある。

## 検証
- `index.html` にiOS standaloneメタが存在することをsmoke testで確認
- `manifest.webmanifest` がJSONとして読めることを確認
- manifest `display/start_url/scope` を確認
- `apple-touch-icon` が1件のみであることを確認
- Service Worker登録がないことを確認
- 既存保存キーとschemaVersionが変わっていないことを確認

## 手動確認項目
iPhone Safariで最新版を開き、既存ホーム画面アイコンを削除してから追加し直す。

- ホーム画面から開くとSafariバーが出ない
- アプリ切替画面でSafariではなくWebアプリとして表示される
- 親モードの起動診断が「独立アプリ」になる
- 通常Safariで開いた場合は起動診断が「Safari」になる
- scope判定が「scope内」になる
