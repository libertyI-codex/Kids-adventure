# Ver.1.0 試作15 実装メモ

## 目的
たまごから生まれる鳥の仲間6種類の原画を、画像生成や外部素材を使わず、既存の手書きインラインSVG定義で修正しました。

## 対象
- ひよこ: `companion_chick`
- あひる: `companion_duck`
- オウム: `companion_parrot`
- くじゃく: `companion_peacock`
- ふくろう: `companion_owl`
- すずめ: `companion_sparrow`

## 実装場所
本番の鳥SVG定義は `js/companions.js` の `SPECIES` にあります。レビュー用ページ `tests/bird-companion-review.html` は本番の `KA.companions.renderCompanion()` を呼び出すため、レビュー表示と本番採用SVGは同一です。

## 各鳥の修正
| 仲間 | 修正内容 |
| --- | --- |
| ひよこ | 黒丸の目を削除し、顔の印象を大きく変えない小さな曲線目へ変更 |
| あひる | 体、目、頭、首、輪郭、配色、姿勢は維持し、くちばしだけ左向きへ変更 |
| オウム | 形状・色面を維持し、黒い外線と内線を `stroke="none"` で非表示化 |
| くじゃく | 本体、顔、首、胴体、脚の位置を維持し、尾羽のファンだけ大きく拡張 |
| ふくろう | 形状・配色を維持し、黒い外線と内線を `stroke="none"` で非表示化 |
| すずめ | あひるの色違いに見える構成をやめ、短い円すい形のくちばし、茶系の小さな体、短い尾、翼、細い脚を持つ雀へ全面作り直し |

## designVersion
今回、6種類すべての見た目を変更したため、各 `designVersion` を `2` に更新しました。保存済みの `companions` データは `speciesId`、孵化回数、なかよしレベル、お気に入り等を持つだけなので、既存データ構造への破壊的変更はありません。

## 描画関数
`renderCompanion()` に species ごとの `outlineStroke` / `innerStroke` を読めるようにしました。通常の鳥は従来線を維持し、オウムとふくろうだけ黒い線を非表示化しています。

## 維持した機能
- 卵育成
- 初回4ポイント / 通常6ポイント
- 1日最大5ポイント
- 孵化
- なかまずかん
- ホームのお気に入り仲間表示
- 親モード
- ぬりえ設定 `coloringSettings`
- ぬりえ10種類
- 世界6種類
- 起動診断 `js/boot.js`
- safeStartモード
- 保存キー
- `schemaVersion: 1`

## レビュー用ページ
`tests/bird-companion-review.html` を更新し、本番SVGから以下を確認できます。

- 黒一色シルエット
- 通常カラー
- 120px表示
- 80px表示
- speciesId
- designVersion
- viewBox
- outer-outline path数
- inner-lines数
- preferredWorldIds

## 自動検証結果
- JS構文評価: 通過
- `tests/smoke-tests.js`: 通過
- script読み込み順: 通過
- 鳥6種類のspeciesId維持: 通過
- 全鳥 `designVersion: 2`: 通過
- ひよこの黒丸削除検出: 通過
- あひる左向きくちばし検出: 通過
- オウム/ふくろうの黒い外線・内線非表示検出: 通過
- くじゃく尾羽拡大検出: 通過
- すずめ新規アウトライン検出: 通過
- 外部URL / CDN / fetch / type=moduleなし: 通過

## 手動確認項目
- ひよこに黒丸が残っていない
- あひるのくちばしが左向きに見える
- オウムの黒線が目立たない
- くじゃくの尾羽だけ大きくなっている
- ふくろうの黒線が目立たない
- すずめが小さな茶系の雀として80pxでも判別できる
- 孵化後の図鑑カードとホームのお気に入り仲間表示が崩れない
