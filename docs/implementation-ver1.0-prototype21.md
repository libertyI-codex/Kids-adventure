# Ver.1.0 試作21 実装メモ

## 目的と画面構造
取得済みの鳥と1日単位で出かけ、翌日以降に固定済みのおみやげを受け取る機能を追加した。ホームには常時状態カードを表示し、「なかまのようす」に短い進行状況を加えた。専用ルートは `outing` で、準備、鳥選択、行き先選択、確認、旅行中、帰宅・受取、履歴を同じ画面で切り替える。下部ナビは変更していない。

## 準備3条件
- おしごと: 当日の `dailyRecords[dateKey].completedTasks` のうち、現在有効な標準・おかたづけ・オリジナルおしごとが1件以上 `completed`
- 直接おせわ: `eggSystem.dailyActivity[dateKey]` の `petted`、`warmed`、`sang` のいずれかが `true`
- ごはん: 有効な取得済み鳥の `lastFedAt` のローカル日付が当日

`jobBonus` と `coloringBonus` は直接おせわに含めない。育てられるたまごがなく取得済み鳥がいる状態では、進行不能を避けるため直接おせわを安全に完了扱いとした。準備専用フラグは保存せず、既存履歴から表示時に計算する。

## ローカル日付と鳥選択
日付キーは既存の `KA.date.localDateKey()` を共通利用する。翌日はローカル正午の `Date` を1日進めて同関数へ渡すため、UTC日付へ変更していない。選択対象は当日に食事した取得済み鳥のみ。お気に入り、`lastFedAt` の新しい順、species表示順で安定整列する。

## 行き先定義
`js/outings.js` に正式定義を集約した。

| destinationId | 表示名 | rewardType |
| --- | --- | --- |
| `outing_meadow` | はらっぱ | `stars` |
| `outing_flower_field` | はなのはら | `houseItem` |
| `outing_sea` | うみ | `ingredients` |

定義には名前、説明、表示順、出発文、帰宅文、インラインSVG描画を持たせる。外部画像・外部SVGは使用しない。

## 出発、tripId、rewardPlan
`startTrip()` は準備3条件、当日食事済み鳥、正式行き先、activeTrip不在、同日未出発を再確認する。連打ロック後、ローカル出発日、翌日、鳥、行き先を含む一意の `tripId` を作り、報酬を出発時に決定して保存する。報酬seedは `tripId / destinationId / companionId / departedDateKey` の決定的ハッシュで、受取時に引き直さない。

## 帰宅判定
`syncTripStatus()` と `ensureOuting()` は `todayKey >= returnDateKey` の場合だけ `traveling` から `returned` へ進める。出発当日は受取不可で、数日後に開いても1旅行分だけ帰宅する。時・分・秒の残り時間、キャンセル、バックグラウンド処理はない。

## 報酬と重複防止
`claimOutingReward(tripId)` は受取中ロック、`history`、`claimedTripIds` を確認する冪等処理である。報酬をメモリ上で付与した後、`claimedAt`、履歴、activeTrip解除をまとめて保存する。同じtripIdを再実行しても付与しない。

- はらっぱ: 既存 `KA.stars.addLedgerEntry()` で2〜4スターを付与し、使える星・累計星・台帳を同時更新
- はなのはら: 未取得のおでかけ家具を優先し、3種類取得後は3スターへ置換
- うみ: 正式素材17種類から2件を固定し、`kitchen.ingredientInventory` へ追加。不正素材だけなら2スターへ置換

素材のおみやげ数は料理の利用条件や消費処理へ接続していない。試作18の「素材在庫を消費せず何度でも料理できる」仕様を維持する。

## 新家具3種類とおうち連携
- `house_trip_flower_wreath`: wallLeft / wallRight
- `house_trip_flower_cushion`: floorLeft / floorRight
- `house_trip_butterfly_mobile`: wallLeft / wallRight

家具定義は既存12件と同じ `js/bird-house.js` に追加し、合計15件とした。取得条件typeは `outing` で、既存の指標評価では自動取得も再ロックもしない。受取時に `unlockedItemIds`、`unlockedAtByItemId`、`unseenItemIds` へ追加する。

おでかけ中の鳥は `companionLayout()` で除外するため透明なタップ領域が残らない。帰宅判定後は報酬受取前でも部屋へ戻る。鳥が1羽だけの場合は待つ案内を表示する。既存鳥SVGと孔雀designVersion 4は変更していない。

## outingデータ
```json
{
  "activeTrip": null,
  "history": [],
  "totalTripCount": 0,
  "destinationStats": {
    "outing_meadow": { "tripCount": 0, "lastTripDate": null },
    "outing_flower_field": { "tripCount": 0, "lastTripDate": null },
    "outing_sea": { "tripCount": 0, "lastTripDate": null }
  },
  "lastClaimedTripId": null,
  "claimedTripIds": []
}
```

履歴はtripId重複を除いて最新100件、受取済みIDは最新200件を保持する。画面には最新20件を表示する。

## 移行、JSON、不正データ、safeStart
試作20以前のデータには空のoutingと素材おみやげ数を補完し、既存スター、家具、素材、鳥、仕事、作品を変更しない。JSONはappData全体を扱う既存方式のため、outing、rewardPlan、履歴、新家具取得状態、素材おみやげ数をそのまま復元する。

不正なouting、trip、履歴、報酬は項目単位で正規化する。不明報酬は未受取の場合のみ2スターへ置換し、受取済みtripは復活させない。safeStartは保存データを更新せず、おでかけデータがあることをホームカードへ表示する。

## reduced-motion
通常表示では鳥を小さく上下させる。`prefers-reduced-motion` では既存の全体設定により動きをほぼ停止し、文字と静的な鳥・行き先・報酬で状態を理解できる。

## 自動検証結果
- 全本番JavaScriptの構文評価: 合格
- smoke tests: 合格
- 出発時報酬固定、翌日帰宅、受取冪等性: 合格
- スター、花家具、料理素材の3報酬: 合格
- 家具15種類、固定枠適合、新家具再ロック防止: 合格
- 保存キー、schemaVersion、PWA、boot.js、renderAlbum、孔雀designVersion 4: 維持
- 外部URL、外部画像、外部SVG、外部音声、fetch、CDN、module: 未使用

## 手動確認項目
- iPhone Safari / standaloneでホームカードと3条件が当日データへ追従すること
- 当日食事済み鳥だけが選べ、出発連打で旅行が増えないこと
- 端末の日付を翌日にした時だけ帰宅し、受取連打・再読み込みで報酬が増えないこと
- おでかけ中の鳥がおうちから消え、帰宅後に戻ること
- 花家具のNEW、家具図鑑、固定枠配置、海素材のキッチン表示
- 390pxで横スクロールや不自然な文字分割がないこと
