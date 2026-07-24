# Ver.1.0 試作18 実装メモ

## 目的
卵から生まれた鳥の仲間へ、子どもが作った料理を食べさせる「とりさんキッチン」を追加した。料理はレシピ方式とし、素材在庫、スター消費、失敗、好き嫌いは追加しない。

## 素材17種類
正式素材は `js/kitchen.js` の `INGREDIENTS` に集約した。

- フルーツ: りんご、いちご、バナナ、ぶどう
- 主食・生地: パン、めん、こむぎこ
- 肉・卵: にく、ハム、たまご
- 野菜: レタス、トマト、たまねぎ
- 乳製品・甘い素材: チーズ、ミルク、アイスクリーム、コーンフレーク

廃止素材の `しょくパン`、`バンズ`、`スパゲティのめん`、`ラーメンのめん`、`ひきにく`、`やきにくのおにく`、`ねぎ`、`クリーム`、`さとう`、`のり`、`しゅうまいのかわ` は正式定義に含めない。パン、めん、にくは料理ごとの完成SVGで見た目だけ変化させる。

## 料理10種類
正式レシピは `js/kitchen.js` の `RECIPES` に集約した。

- `recipe_fruit_salad`: りんご、いちご、バナナ、ぶどう
- `recipe_sandwich`: パン、ハム、レタス、トマト、チーズ
- `recipe_hamburg_steak`: にく、たまねぎ、たまご
- `recipe_spaghetti`: めん、トマト、たまねぎ、にく
- `recipe_ramen`: めん、たまご
- `recipe_yakiniku`: にく、たまねぎ、レタス
- `recipe_shumai`: こむぎこ、にく、たまねぎ
- `recipe_hamburger`: パン、にく、レタス、トマト、チーズ
- `recipe_cake`: こむぎこ、たまご、ミルク、いちご
- `recipe_parfait`: アイスクリーム、コーンフレーク、いちご、バナナ

## 共通step engine
対応step typeは `cut`、`mix`、`knead`、`shape`、`grill`、`boil`、`steam`、`bake`、`fry`、`wrap`、`layer`、`decorate`、`plate`。本番UIでは作業エリアのpointer操作と、必ず進められる代替ボタンを同時に用意した。

各step完了時に `currentStepIndex` を保存する。最後のstep完了時に `completedAt` と `recipeStats` を更新し、鳥選択へ進む。

## currentCooking
保存構造:

```json
{
  "id": "cooking_xxx",
  "recipeId": "recipe_cake",
  "selectedIngredientIds": ["ingredient_flour"],
  "currentStepIndex": 2,
  "startedAt": "...",
  "updatedAt": "...",
  "completedAt": null,
  "statsRecorded": false,
  "preselectedCompanionId": null
}
```

同時に作れる料理は1品だけ。途中で画面を閉じても、次回キッチン表示時に `currentCooking` から復元する。料理をやめる場合は確認し、スターや素材は減らさない。

## 鳥選択と食事
料理完成後は取得済みの鳥だけを表示する。なかまずかんから「ごはんを あげる」で入った場合は、その鳥を優先表示する。

食事時は以下を行う。

- `mealCount` を毎回1増やす
- `lastFedAt` を更新
- `cookingHistory` へ記録
- `recipeStats.fedCount` を増やす
- 鳥1種類につき1日1回だけ `bondMealProgress` を増やす
- `bondMealProgress` が3になったら `bondLevel` を1増やし、進行を0へ戻す

同日2回目以降も食べる演出と `mealCount` は有効だが、なかよし進行は増やさない。

## りょうりずかん
`recipeStats` に初回作成日、最終作成日、作成回数、食べさせた回数を保存する。同じ料理カードを重複作成しない。`cookingHistory` は最新100件程度に制限する。

## 本物の鳥への注意
キッチン画面下部に次を表示する。

「アプリの とりは ふしぎな とりだよ。ほんものの とりに ひとの ごはんを あげないでね。」

親モードにも、実際の鳥に人間用の料理を与えない注意文を追加した。

## データ移行
試作17以前のデータでは `appData.kitchen` を追加する。

```json
{
  "currentCooking": null,
  "recipeStats": {},
  "cookingHistory": []
}
```

既存 `companions` には不足時だけ `mealCount`、`bondMealProgress`、`lastBondMealDate`、`lastFedAt` を補完する。`hatchCount`、`bondLevel`、お気に入り、孵化日時は変更しない。

不正な料理ID、素材ID、履歴、進行番号は有効部分だけ残して正規化する。保存データ全体は削除しない。

## JSON互換
バックアップは `appData` 全体を書き出す既存方式のため、`kitchen` と食事項目も含まれる。試作17以前のJSONは `ensureDataShape()` で補完し、試作18 JSONは調理途中、料理図鑑、履歴、食事回数、なかよし進行を維持する。

## safeStart対応
`js/kitchen.js` は本体初期化前のboot層へ依存しない。`migrations.js` で不正値を安全に補完するため、safeStartでも保存データを削除せず起動できる。

## 自動検証結果
`tests/smoke-tests.js` に以下を追加した。

- 正式素材17種類と廃止素材の不在
- 正式料理10種類と素材対応
- 全step type対応
- 素材選択と調理step完了
- `currentStepIndex` 保存
- 料理完成と `recipeStats`
- 取得済み鳥への食事
- `mealCount`、`bondMealProgress`、`bondLevel` 連携
- 同日2回目のなかよし重複防止
- `cookingHistory` 上限
- 試作17データ補完
- 保存キー、schemaVersion、PWA、boot.js、鳥SVG維持

## 手動確認項目
- iPhone Safariとstandaloneで正常起動する
- 取得済み鳥がいる場合にキッチンを開ける
- 鳥がいない場合に案内が表示される
- 料理10種類と素材17種類が表示される
- 必要素材を選ぶと料理を開始できる
- 不要素材を押しても失敗しない
- 各調理操作と代替ボタンで進められる
- 途中で再読み込みして再開できる
- 完成後に取得済み鳥へ食べさせられる
- 同日2回目は `mealCount` だけ増える
- 3日分の食事で `bondLevel` が上がる
- りょうりずかんの作成回数と食事回数が維持される
- 390px幅で横スクロールが出ない
- ホーム、たまご、なかまずかん、ぬりえ、世界、親モードが従来どおり動く
