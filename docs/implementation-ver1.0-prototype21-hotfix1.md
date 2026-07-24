# Ver.1.0 試作21 修正1 実装メモ

## 黒い枠の原因

`js/companions.js` の本番描画を追跡し、ひよこ・オウム・ふくろうのSVGには背景用 `rect`、viewBox外周を描く矩形path、インラインborder、filterは存在しないことを確認した。鳥本体の輪郭は `.outer-outline` 内の鳥形pathであり、削除対象ではない。

一方、対象3羽のSVGルートには、表示コンテナやブラウザの状態に依存しない透明背景・box境界の明示的なリセットがなかった。iPhone Safariで報告された四角い外枠を、鳥本体のpathを変更せず確実に抑止するため、対象3羽だけへ `companion-transparent-box` を付け、border、outline、background、box-shadowを明示的に無効化した。

## 修正したファイル

- `js/companions.js`
- `css/styles.css`
- `index.html`
- `manifest.webmanifest`
- `js/constants.js`
- `js/boot.js`
- `README.md`
- `tests/smoke-tests.js`
- `docs/implementation-ver1.0-prototype21-hotfix1.md`

## 修正内容

正式speciesId `companion_chick`、`companion_parrot`、`companion_owl` にだけ `transparentOuterBox: true` を追加した。`renderCompanion()` はこの指定を持つ通常表示とシルエット表示のSVGルートへ `companion-transparent-box` を付与する。

CSSでは対象クラスのSVGルートだけに次を適用する。

```css
.companion-svg.companion-transparent-box {
  border: 0 !important;
  outline: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
```

共通の `.companion-svg`、viewBox、幅、高さ、overflow、pointer-events、表示ラッパーは変更していない。

## 残した内部描画

- ひよこ: 鳥形の外輪郭、曲線の目、くちばし、翼、足、冠羽
- オウム: 目、くちばしの内部線、頭・胴体・翼・尾・足の色面
- ふくろう: 目と瞳、くちばし、顔・胴体・翼・足の色面

対象SVGのpath/circle、viewBox、designVersionは変更していない。

## 対象3羽の確認

390×844のChromium系実ブラウザで、白背景、色付きカード背景、とりのおうち背景、おでかけ背景を確認した。対象SVGのcomputed styleはborderなし、outlineなし、透明背景、box-shadowなしで、外周rectは0件。内部の目・輪郭・くちばし・羽・足を維持し、見切れと横スクロールがないことを確認した。

## 対象外の鳥

`companion_duck`、`companion_peacock`、`companion_sparrow` には新しい属性・クラスを付与していない。試作21保存版とのspecies定義比較で一致を確認する。孔雀は `designVersion: 4`、既存viewBox、尾羽・本体変形を維持する。

## 自動検証

- 全本番JavaScript構文評価
- script読み込み順
- `renderCompanion()` 重複定義なし
- 対象3羽の外周rectなし、透明boxクラスあり
- 内部の目・輪郭・くちばしの代表要素あり
- 対象外3羽へ修正クラスなし
- smoke tests
- 外部URL、外部画像、外部SVG、fetch、CDN、`type="module"` なし
- 保存キー4種とschemaVersion 1を維持

## 既存機能の維持

companions保存構造、なかよし、食事、孵化、とりのおうち、キッチン、おでかけ、safeStart、boot診断、PWA standalone、`renderAlbum()` は変更していない。保存データ移行は不要で、既存データを削除・初期化しない。
