# こどもの冒険 Ver.1.0 試作9 実装メモ

## 採用候補一覧

| ぬりえ | templateId | 採用候補 | designVersion | 領域数 |
| --- | --- | --- | ---: | ---: |
| うさぎ | `coloring_rabbit_001` | 合格済み候補 | 9 | 12 |
| イルカ | `coloring_dolphin_001` | 合格済み候補 | 9 | 9 |
| うま | `coloring_horse_001` | 合格済み候補 | 9 | 12 |
| きょうりゅう | `coloring_dinosaur_001` | D案 | 9 | 12 |
| ライオン | `coloring_lion` | A改 | 2 | 11 |
| バッタ | `coloring_grasshopper` | C改 | 2 | 10 |

## 移植方法

`tests/animal-svg-review.html` の採用候補オブジェクトから、viewBox、color-regions、outer-outline、inner-lines、face-details、領域ID、path座標を抽出し、`js/coloring.js` の正式定義へ機械的に移植しました。採用候補の形状を描き直したり、座標を調整したりしていません。

## 4層SVG構造

本番出力は次の順で描画します。

1. `color-regions`: `regionColors` の対象。strokeなし。
2. `hit-areas`: 見た目に出ない透明の補助タップ領域。保存データには含めない。
3. `outer-outline`: 外側輪郭。pointer-eventsなし。
4. `inner-lines`: 部位境界線。pointer-eventsなし。
5. `face-details`: 目、鼻、口など。pointer-eventsなし。

`face-details` は視覚上の顔部品として扱い、着色操作を妨げないようにしています。

## hit-area構造

追加対象は、うさぎの耳・前脚、イルカのひれ・尾びれ、きょうりゅうの前脚・足先、うまの脚・尾・ひづめ、ライオンのしっぽ・脚、バッタの前脚・中脚・後脚・触角です。hit-areaは `class="hit-area"` と `data-region-id` を持ちますが、`color-region` には含めません。

## designVersion

- うさぎ、イルカ、きょうりゅう、うま: 9
- ライオン、バッタ: 2
- ちょうちょ、おはな、ねこ、パンダは変更なし
- 世界のdesignVersionは変更なし

## regionAliasesと互換性

既存のtemplateIdとregionIdsを維持しました。旧regionColorsは同じ領域IDではそのまま引き継がれ、既存のregionAliasesも維持されます。ensureDataShapeは正式テンプレート定義を同期し、既存作品、途中保存、親コメント、お気に入り、worldId、xPercent、yPercent、zIndex、isManualを削除しません。

## 世界表示とアニメーション

世界画面、アルバム、まほうの仕上げ、ぬりえ編集は同じ `KA.coloring.renderTemplate()` を使うため、旧SVGが別経路で表示されない構造です。既存アニメーションは作品ラッパーに対するtransformを中心に維持し、採用原画のpath座標は変更していません。

## 自動検証結果

- 6種類の正式定義が存在
- 採用候補と本番定義のviewBox、領域ID、color-regions、outer-outline、inner-lines、face-detailsが一致
- designVersion指定値を確認
- ぬりえ一覧は10種類のまま
- 必要スターと推奨世界は変更なし
- 保存キー、schemaVersionは変更なし
- 外部画像、外部SVG、fetch、CDN、type=moduleは不使用

## 手動確認項目

- 実機で細い脚、尾、ひれ、耳をタップできること
- 12色で着色、ひとつ戻す、全部消す、途中保存、完成保存が期待通り動くこと
- まほうの仕上げ後、世界選択、世界表示、ならべかえ、世界間移動で同じ正式SVGが表示されること
- 120pxプレビューで6種類を判別できること
