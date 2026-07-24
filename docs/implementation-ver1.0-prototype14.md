# Ver.1.0 試作14 実装メモ

## 改善理由
試作12のたまご育成は、1日に進む成長ポイントが最大3ポイントだったため、孵化までの待ち時間が長く感じられる可能性がありました。試作14では、子どもが自分で押せるお世話を3種類へ増やし、初めての孵化だけ早く体験できるようにしました。

## dailyActivity追加項目
`appData.eggSystem.dailyActivity[YYYY-MM-DD]` に次を保持します。

- `petted`
- `warmed`
- `sang`
- `jobBonus`
- `coloringBonus`

ローカル日付キーを使い、UTC日付へは変更していません。既存の `petted`、`jobBonus`、`coloringBonus` は維持し、不足する `warmed` と `sang` は false 相当で補完します。

## お世話3種類
- なでる: `KA.eggs.petActiveEgg()`、`petted` を記録
- あたためる: `KA.eggs.warmActiveEgg()`、`warmed` を記録
- うたをうたう: `KA.eggs.singToActiveEgg()`、`sang` を記録

各操作は `addGrowth()` へ集約し、active / warm / glowing / cracked のたまごだけを成長させます。ready、waiting、hatched には加算しません。

## 1日最大5ポイント
1日の成長条件は5種類で、それぞれ1回だけ +1 です。

- たまごをなでる
- たまごをあたためる
- うたをうたう
- おしごと達成
- ぬりえ完成

同じ日にたまごが孵化して次のたまごがactiveになっても、使用済みの同日行動は再利用しません。

## 初回たまご判定
孵化履歴がない場合、最も古い未孵化たまごを `isFirstHatchEgg: true` として確定します。

孵化履歴の判定:
- `companions` に `hatchCount > 0` がある
- または `eggInventory` に `state: "hatched"` がある

一度決まった初回対象は、再読み込みや `ensureDataShape()` の再実行で別のたまごへ移しません。

## targetGrowthPoints
- 初回たまご: `targetGrowthPoints: 4`
- 2個目以降: `targetGrowthPoints: 6`

既に孵化済みのたまごは履歴として維持し、無理にtargetを変更しません。

## 成長状態計算
共通関数:
- `KA.eggs.stateForGrowth(points, targetGrowthPoints)`
- `KA.eggs.getEggStateFromGrowth(egg)`
- `KA.eggs.targetForEgg(egg)`

4ポイント型:
- 0: `active`
- 1: `warm`
- 2: `glowing`
- 3: `cracked`
- 4以上: `ready`

6ポイント型:
- 0: `active`
- 1〜2: `warm`
- 3〜4: `glowing`
- 5: `cracked`
- 6以上: `ready`

`hatched` は成長ポイントから再計算して戻しません。

## ready判定
`growthPoints >= targetGrowthPoints` で `ready` にします。`readyAt` は未設定の場合だけ保存し、`plannedSpeciesId` も未設定の場合だけ固定seedで決定します。自動孵化は行わず、「うまれる！」ボタンの `hatchReadyEgg()` だけで孵化します。

## 既存データ移行
試作13以前のデータでは、不足項目だけ補完します。

- `warmed` / `sang` をfalse相当で扱う
- `isFirstHatchEgg` を最大1件へ正規化
- 初回対象は4ポイント、通常は6ポイントへ補完
- `growthPoints` はtarget上限へクランプ
- ready / hatched を後退させない
- `plannedSpeciesId` を再決定しない

## 同日重複防止
`addGrowth()` は、対象日の `dailyActivity[activityKey]` が true の場合は加算せず `alreadyDone` を返します。成長可能なたまごがない場合は日次フラグを消費しません。

## 孵化後の次たまご
孵化後は次のwaitingたまごをactiveにします。初回孵化後は孵化履歴があるため、次のたまごは `isFirstHatchEgg: false`、`targetGrowthPoints: 6` になります。同日のdailyActivityはリセットしません。

## Web Audio
外部音声ファイルは使っていません。なでる、あたためる、うたうの効果音は既存のWeb Audio APIの短い音列に追加しました。BGM設定は変更していません。

## reduced-motion
お世話演出はCSS animationで行い、既存の `prefers-reduced-motion: reduce` で大きな動きが実質停止する構造を維持しています。保存処理はアニメーション終了に依存しません。

## JSON互換
JSONエクスポート・インポートでは既存のappData全体を保持するため、次も維持されます。

- `targetGrowthPoints`
- `isFirstHatchEgg`
- `dailyActivity.petted`
- `dailyActivity.warmed`
- `dailyActivity.sang`
- `dailyActivity.jobBonus`
- `dailyActivity.coloringBonus`

試作13以前のJSONは `ensureDataShape()` と `KA.eggs.syncEggInventory()` で安全に補完します。

## safeStart対応
起動復旧用の `js/boot.js`、診断情報、safeStartモード、復旧画面は維持しました。bootの処理内容は変更せず、試作14のキャッシュクエリと表示バージョンだけ合わせています。

## 自動検証結果
- JS構文評価: 通過
- `tests/smoke-tests.js`: 通過
- ぬりえ10種類維持: 通過
- 世界6種類維持: 通過
- `coloringSettings` 維持: 通過
- `renderAlbum()` 維持: 通過
- 保存キー未変更: 通過
- `schemaVersion: 1` 維持: 通過
- 外部URL / fetch / CDN / type=moduleなし: 通過

## 手動確認項目
- iPhone Safariで起動し、スタート画面終了後にホームが表示される
- たまご画面で、なでる・あたためる・うたうが各1回だけ加算される
- おしごと・ぬりえを含めて1日最大5ポイントになる
- 初回たまごが4ポイントでreadyになる
- 2個目以降が6ポイントでreadyになる
- ready後に自動孵化しない
- 孵化後、同日の使用済み行動が次のたまごへ再利用されない
- 390px幅で横スクロールがない
- 親モードのぬりえ設定が試作13どおり動く
