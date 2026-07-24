# Ver.1.0 試作19 実装メモ

## 目的
試作19では、卵から生まれた鳥たちが一緒に暮らす「とりのおうち」を追加した。取得済みの鳥だけを表示し、タップで触れ合い、条件達成で増える家具を固定配置枠へ置けるようにした。

## 画面構造
- ホームの「いっしょに ぼうけん」カードへ「とりのおうちへ」を追加。
- なかまずかんの取得済み鳥カードへ「おうちで あそぶ」を追加。
- 新ルートは `bird-house`。
- 画面上部に戻るボタン、見出し、モード切替を配置。
- モードは通常表示、模様替え、家具図鑑。

## 描画レイヤー
おうちは次の順で描画する。
1. 背景、壁、床、窓、光
2. 壁家具
3. 後方家具
4. 鳥
5. 前方家具
6. ハート、メッセージ、通知

家具SVGは通常 `pointer-events: none` とし、模様替え時だけ配置枠ボタンを操作対象にしている。

## 鳥の配置
取得済み鳥のみを表示する。未取得鳥の姿やシルエットは表示しない。

- 1種類: 中央
- 2種類: 中央左右
- 3種類: 中央、左右
- 4〜6種類: 画面内へ分散
- 同じspeciesは重複表示しない

お気に入り鳥がいる場合は中央寄りへ配置する。お気に入りがない場合は、取得済みのうち表示順が早い鳥を中心にする。配置座標は保存せず、表示時に安定計算する。

## 鳥との触れ合い
鳥をタップすると一時反応を表示する。

- 首をかしげる
- 小さく跳ねる
- 羽を軽く動かす
- 眠そうにする
- ハートを出す

反応は保存しない。`lastInteractedCompanionId` だけ必要時に保存する。連打で演出が積み上がらないよう、約0.8秒のクールダウンを入れている。

## 食事後の反応
既存の `lastFedAt` を参照し、同日または直近に食事した鳥には「ごはん おいしかった！」系の反応を優先表示する。空腹、体力、病気、要求、機嫌低下などの新データは追加していない。

## 家具12種類
正式定義は `js/bird-house.js` の `FURNITURE_ITEMS` に集約した。

| itemId | 名前 | type | 取得条件 |
| --- | --- | --- | --- |
| `house_perch_basic` | 基本の止まり木 | perch | 初期取得 |
| `house_nest_basic` | 小さな巣 | nest | 初期取得 |
| `house_cushion_small` | 小さなクッション | floor | 初期取得 |
| `house_food_table` | ごはんテーブル | table | 初期取得 |
| `house_perch_large` | 大きな止まり木 | perch | 鳥3種類 |
| `house_perch_rainbow` | 虹の止まり木 | perch | 鳥6種類 |
| `house_table_wood` | 木のテーブル | table | 異なる料理3種類 |
| `house_kitchen_wagon` | キッチンワゴン | table | 料理10回 |
| `house_mobile_rainbow` | 虹のモビール | wall | 作品3枚 |
| `house_bell_toy` | おもちゃのベル | wall/floor | 食事5回 |
| `house_cushion_star` | 星のクッション | floor | 最大bondLevel 5 |
| `house_photo_frame` | 思い出の写真立て | wall | 合計孵化8回 |

## 配置枠8種類
正式定義は `SLOT_DEFINITIONS` に集約した。

| slotId | slotType | 用途 |
| --- | --- | --- |
| `wallLeft` | wall | 壁飾り |
| `wallRight` | wall | 壁飾り |
| `floorLeft` | floor | 床置き家具 |
| `floorRight` | floor | 床置き家具 |
| `perchLeft` | perch | 止まり木 |
| `perchRight` | perch | 止まり木 |
| `centerTable` | table | テーブル・ワゴン |
| `nestCorner` | nest | 巣 |

互換しない家具は候補に出さず、不正データで入っていた場合は表示前に解除する。同じ家具は1か所だけへ置ける。別枠へ置いた場合は以前の枠から外す。

## getBirdHouseMetrics
家具取得条件は重複保存せず、既存データから計算する。

```js
{
  acquiredSpeciesCount,
  totalHatchCount,
  uniqueRecipeCount,
  totalCookCount,
  totalMealCount,
  completedArtworkCount,
  maxBondLevel
}
```

計算元は `companions`、`kitchen.recipeStats`、`artworks`。不完全データは0扱いで安全に処理する。

## evaluateBirdHouseUnlocks
条件達成時に `unlockedItemIds` へ追加し、`unlockedAtByItemId` へ日時を保存する。新規取得分は `unseenItemIds` へ入れ、おうちボタンのNEW表示と入室時のまとめ通知に使う。

一度取得した家具は条件値が下がっても没収しない。重複追加もしない。

## birdHouseデータ
`appData.birdHouse` へ保存する。

```json
{
  "unlockedItemIds": [],
  "unlockedAtByItemId": {},
  "unseenItemIds": [],
  "placements": {},
  "lastVisitedAt": null,
  "lastInteractedCompanionId": null
}
```

初期家具4種類と初期配置は不足時だけ補完する。既存配置、取得済み家具、未確認状態は上書きしない。

## 模様替え
自由ドラッグは使わない。配置枠を選び、その枠に合う取得済み家具または「なにも おかない」を選択し、プレビュー後に「これにする」で保存する。「やめる」で破棄する。

## 家具図鑑
取得済み家具は姿、名前、説明、取得日、配置中かどうか、配置できる枠を表示する。未取得家具は薄いシルエット、名前、取得条件、進行状況を表示する。

## データ移行
試作18以前のデータには `birdHouse` がないため、`ensureDataShape()` で補完する。

- 初期家具4種類を追加
- 初期配置を追加
- 既存の鳥、料理、作品データから条件達成家具を再評価
- 不正なitemId、slotId、compatibleSlotTypes違反は安全に無視または解除
- 既存データは削除しない

`ensureDataShape()` を複数回実行しても、家具重複、配置リセット、unseen復活、取得済み家具消失が起きないようにした。

## JSON互換
JSONバックアップには `birdHouse` を含める。試作18以前のJSONは安全に補完し、試作19 JSONでは家具取得状態、配置、未確認状態、取得日時を維持する。

## safeStart
safeStartでも `birdHouse` の不正データでホーム表示を止めない。おうちを開いた場合は有効な鳥と家具だけを表示し、不正家具は無視する。

## reduced-motion
`prefers-reduced-motion` では大きなジャンプや羽ばたきを省略し、ハート、メッセージ、軽い光中心にする。

## 自動検証結果
- 全本番JavaScriptをindex.html順に評価
- `tests/smoke-tests.js` 通過
- 家具12種類、配置枠8種類、初期家具4種類、取得条件、配置互換性を検証
- 試作18/19データ補完、JSON互換、保存キー、schemaVersion 1を検証
- 外部URL、外部画像、外部SVG、外部音声、fetch、CDN、type=moduleなしを検証

## 手動確認項目
- iPhone Safariとstandaloneで起動する
- ホームとなかまずかんからとりのおうちを開ける
- 鳥0/1/3/6種類で表示が崩れない
- お気に入り鳥が中央寄りに配置される
- 孔雀が切れず、家具に顔を隠されない
- 鳥タップ反応と食事後反応が自然に出る
- 家具取得、NEW通知、模様替え、家具図鑑が操作できる
- 390px幅で横スクロールがない
- 既存のキッチン、たまご、ぬりえ、世界、作品が正常に動く
