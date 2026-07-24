# Ver.1.0 試作11 実装メモ

## 目的
採用済み画像をiPhoneのホーム画面用アプリアイコンとして設定した。

## 採用元画像
```text
C:\Users\tbska\Documents\Codex\07_こどもの冒険\current\kodomo-adventure-local\assets\icons\yuu-bouken-icon-adopted.png
```

確認結果:

- PNG形式
- 1254 x 1254
- 正方形
- 180px以上
- SHA-256: `76F8CE81C49589F3335E8EBCBD9F81A0DD586F8129DEAB968A641503C2E724D2`

## 本番アイコン配置先
```text
C:\Users\tbska\Documents\Codex\07_こどもの冒険\current\kodomo-adventure-local\apple-touch-icon.png
```

採用元画像を画像処理せず、そのままコピーした。トリミング、再生成、色変更、文字変更、角丸追加、白枠追加、影追加、圧縮最適化は行っていない。

## index.html設定
head内へ次の指定を1件だけ追加した。

```html
<link rel="apple-touch-icon" href="./apple-touch-icon.png?v=10p11">
```

既存のCSS/JavaScriptキャッシュクエリも `?v=10p11` へ更新した。`?v=10p10` は `index.html` 内に残していない。

## 今回変更していないもの
- Android用アイコン
- Windows用アイコン
- favicon.ico
- 複数サイズfavicon
- Web App Manifest
- Android adaptive icon
- maskable icon
- SNS用OGP画像
- manifest.json

## 画像を変更していない確認方法
採用元画像と `apple-touch-icon.png` のSHA-256を比較し、完全一致を確認する。

```text
assets/icons/yuu-bouken-icon-adopted.png
apple-touch-icon.png
```

両方のSHA-256が一致していれば、ピクセル変更だけでなくファイル内容全体が一致している。

## GitHub Pagesへのコピー対象
GitHub Pagesへコピーする:

- `index.html`
- `README.md`
- `css`
- `js`
- `apple-touch-icon.png`

GitHub Pagesへコピーしない:

- `tests`
- `docs`
- `assets/icons/yuu-bouken-icon-adopted.png`
- その他の素材・テスト専用ファイル

## 自動検証結果
`tests/smoke-tests.js` に次の確認を追加した。

- `apple-touch-icon.png` が存在する
- PNG形式である
- 正方形である
- 幅と高さが180px以上
- 採用元画像と本番画像のSHA-256が一致する
- `index.html` にapple-touch-icon指定が1件だけ存在する
- hrefが `./apple-touch-icon.png?v=10p11`
- `?v=10p10` が残っていない
- manifestを追加していない
- 保存キーが変わっていない
- schemaVersionが1のまま
- ぬりえ10種類を維持
- 世界6種類を維持

## iPhone実機確認手順
1. GitHub Pagesの公開URLをiPhone Safariで開く。
2. 共有ボタンを押す。
3. 「ホーム画面に追加」を選ぶ。
4. プレビュー画像に `apple-touch-icon.png` が使われていることを確認する。
5. ホーム画面へ追加し、アイコンの文字、構図、色が採用画像どおりであることを確認する。

ブラウザやiOSのキャッシュが残る場合は、URLの `?v=10p11` が反映されていることを確認し、Safariのタブを閉じて再試行する。
