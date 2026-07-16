# こどもの冒険

## 概要
「こどもの冒険」は、毎日のおしごと、スター、ぬりえ、作品を置く世界、たまご育成をローカル保存で楽しむ子ども向けWebアプリです。

Ver.1.0 試作18では、卵から生まれた鳥の仲間へ料理を作って食べさせられる「とりさんキッチン」を追加しました。素材17種類、料理10種類、共通調理操作、りょうりずかん、食事によるなかよし成長を追加しつつ、iPhone standalone対応、たまご育成、なかまずかん、親モードのぬりえ設定、起動診断、safeStartモードは維持しています。

既存のホーム画面アイコンは古いHTML設定を保持するため、一度削除してからSafariで最新版を開き、改めてホーム画面へ追加してください。

## バージョン
- 表示名: 結羽ちゃんの冒険
- バージョン: Ver.1.0 試作18
- appVersion: `1.0.0-prototype.18`
- schemaVersion: `1`
- キャッシュ対策: `?v=10p18`

## 試作18のとりさんキッチン
取得済みの鳥が1種類以上いると、ホーム画面の「いっしょに ぼうけん」カードと、なかまずかんの取得済み鳥カードから「ごはん」を作れるようになりました。

- 料理はレシピ方式で、10種類すべて最初から選択可能
- スター消費、素材在庫、料理失敗、時間切れはありません
- 素材は17種類だけを正式定義し、パン・めん・にくは料理ごとに見た目だけ変化
- 切る、混ぜる、こねる、形を作る、焼く、ゆでる、蒸す、包む、重ねる、飾る、盛りつける共通操作を使用
- ドラッグやなぞりが難しい場合も、タップ式代替ボタンで必ず進められます
- 料理完成後、取得済みの鳥を選んで食べさせられます
- すべての鳥が10種類すべての料理を喜んで食べます
- 本物の鳥へ人間の料理を与えない注意表示を、子ども画面と親モードへ追加

素材17種類:

| 分類 | 素材 |
| --- | --- |
| フルーツ | りんご、いちご、バナナ、ぶどう |
| 主食・生地 | パン、めん、こむぎこ |
| 肉・卵 | にく、ハム、たまご |
| 野菜 | レタス、トマト、たまねぎ |
| 乳製品・甘い素材 | チーズ、ミルク、アイスクリーム、コーンフレーク |

料理10種類:

| 料理 | recipeId | 素材 |
| --- | --- | --- |
| フルーツサラダ | `recipe_fruit_salad` | りんご、いちご、バナナ、ぶどう |
| サンドイッチ | `recipe_sandwich` | パン、ハム、レタス、トマト、チーズ |
| ハンバーグ | `recipe_hamburg_steak` | にく、たまねぎ、たまご |
| スパゲティ | `recipe_spaghetti` | めん、トマト、たまねぎ、にく |
| ラーメン | `recipe_ramen` | めん、たまご |
| やきにく | `recipe_yakiniku` | にく、たまねぎ、レタス |
| しゅうまい | `recipe_shumai` | こむぎこ、にく、たまねぎ |
| ハンバーガー | `recipe_hamburger` | パン、にく、レタス、トマト、チーズ |
| ケーキ | `recipe_cake` | こむぎこ、たまご、ミルク、いちご |
| パフェ | `recipe_parfait` | アイスクリーム、コーンフレーク、いちご、バナナ |

料理データは `appData.kitchen` に保存します。

```json
{
  "kitchen": {
    "currentCooking": null,
    "recipeStats": {},
    "cookingHistory": []
  }
}
```

鳥の仲間には `mealCount`、`bondMealProgress`、`lastBondMealDate`、`lastFedAt` を不足時だけ追加します。食事は何度でもできますが、料理によるなかよし成長は鳥1種類につき1日1回だけです。`bondMealProgress` が3回に到達すると `bondLevel` が1上がります。重複孵化による `bondLevel` 上昇も維持しています。

りょうりずかんには、初めて作った日、最後に作った日、作った回数、食べさせた回数を記録します。料理履歴は最新100件程度を上限にし、図鑑統計や鳥のなかよし状態は維持します。

## 試作17のくじゃく修正
画像生成・外部画像・外部SVGを使わず、既存のインラインSVG定義を手修正しました。

- `companion_peacock` の `designVersion` を4へ更新
- 尾羽を `peacock-tail-group` として独立
- 尾羽を試作15比で縦横約200%へ拡大
- 顔・体を `peacock-body-group` として独立
- 顔・体を試作15比で縦横約75%へ調整
- 顔立ち、目、くちばし、冠羽、色は維持
- viewBoxを広げ、80px/120px/図鑑/ホーム/孵化表示で切れないように調整

## 試作15の鳥原画修正
鳥の仲間6種類は、画像生成・外部画像・外部SVGを使わず、既存のインラインSVG定義を手修正しました。試作17では、くじゃくだけ追加修正しています。

| 仲間 | 修正内容 |
| --- | --- |
| ひよこ | 黒丸の目をなくし、小さな曲線の目に変更 |
| あひる | 体・頭・目・姿勢は維持し、くちばしだけ左向きへ変更 |
| オウム | 形状と色面を維持し、黒い外線・内線を非表示化 |
| くじゃく | 試作17で尾羽は約2倍を維持し、本体を約0.75倍へ調整 |
| ふくろう | 形状と配色を維持し、黒い外線・内線を非表示化 |
| すずめ | あひる風の形をやめ、小さな茶系の雀として全面作り直し |

## 試作13のぬりえ設定維持
親モード内に「ぬりえ設定」を追加しました。

- 必要スター数を0〜999の整数で変更
- 0スターのぬりえはスター消費なしで解放可能
- ぬりえ一覧の表示順をドラッグハンドルで並べ替え
- iPhone Safari向けに「上へ」「下へ」ボタンでも並べ替え
- 「変更を保存」で明示保存
- 未保存のまま親モードを離れる場合は保存確認を表示
- 「標準設定に戻す」でスター数と並び順だけを初期状態へ復元

保存先は `appData.coloringSettings` です。

```json
{
  "coloringSettings": {
    "order": ["coloring_butterfly_001"],
    "starCosts": {
      "coloring_butterfly_001": 4
    }
  }
}
```

正式なぬりえ定義の `requiredStars` と `sortOrder` は標準値として維持し、ユーザー設定値は直接書き込みません。実際の表示・解放判定では `getEffectiveColoringStarCost()` と `getOrderedColoringTemplates()` を使います。

既に解放済みのぬりえは、スター数を高くしても再ロックしません。値上げ時の追加請求、値下げ時の差額返金、スター履歴の再計算は行いません。

## 修正版2の起動修正
修正版1では `padStart` を原因候補として対処しましたが、復旧画面が出続けたため確定原因とは扱っていません。修正版2では `boot.js` を本体より先に読み込み、実際の例外を `kodomoAdventure.bootDiagnostic.v1` へ最大5件保存します。

確認済み原因:
- `js/app.js` の `registerRoutes()` が未定義の `renderAlbum` を参照し、`ReferenceError: renderAlbum is not defined` で初期化が止まっていた
- 復旧画面が `#app` 内にあり、「ホームをひらく」も `KA.state` / `KA.router` に依存していたため、初期化失敗時に復旧操作まで失敗しやすかった

対応内容:
- `js/boot.js` を追加し、`window.error` と `unhandledrejection` を本体初期化前から捕捉
- 起動段階とエラーコードを記録
- 復旧画面を `body` 直下の `#boot-recovery-root` へ移動
- 復旧ボタンを boot 層だけで処理
- `safeStart=1` の安全モードを追加
- 欠落していたアルバム描画関数を復元
- 旧 dailyRecord の不足項目を補完し、初回ホーム描画で落ちないようにした
- 保存データは削除・初期化しない

起動段階の例:
- `BOOT_SCRIPT_LOADED`
- `DOM_READY`
- `APP_INIT_STARTED`
- `STATE_INIT_STARTED`
- `STORAGE_READ_STARTED`
- `MIGRATION_STARTED`
- `COMPANIONS_INIT_STARTED`
- `EGGS_INIT_STARTED`
- `EVENT_BINDING_STARTED`
- `FIRST_RENDER_STARTED`
- `APP_INIT_COMPLETED`
- `SPLASH_FINISHED`

復旧画面:
- 「もういちど よみこむ」
- 「あんぜんに ホームをひらく」
- 「しょうさいを コピー」

安全モードでは保存データを削除せず、最低限のホーム、下部ナビ、おしごと、ぬりえ、せかい、さくひんを開けます。たまご・なかまずかんが失敗している場合は基本画面だけを表示します。

## 基本サイクル
1. 今日のおしごとをする
2. スターを集める
3. 10スターごとにたまごをもらう
4. 毎日たまごを育てる
5. ひびが入ったたまごを孵化させる
6. 鳥の仲間がなかまずかんへ登録される
7. 同じ鳥がまた生まれると、なかよしレベルが上がる

## たまご育成
既存仕様どおり、累計スター10個ごとにたまごを1個獲得します。スターは消費せず、一度獲得したたまごは没収しません。

同時に育てられるたまごは1個だけです。未孵化の古いたまごから順に `active` になり、残りは `waiting` になります。

たまご状態:
- `waiting`: 順番待ち
- `active`: 育成中
- `warm`: 少し温かい
- `glowing`: 光り始めた
- `cracked`: ひびが入った
- `ready`: 「うまれる！」を押せる
- `hatched`: 孵化済み

1日の成長ポイントは最大5ポイントです。
- たまごをなでる: 1ポイント
- たまごをあたためる: 1ポイント
- うたをうたう: 1ポイント
- おしごと達成: 1ポイント
- ぬりえ完成: 1ポイント

各条件は1日1回だけです。`eggSystem.dailyActivity` に `petted`、`warmed`、`sang`、`jobBonus`、`coloringBonus` をローカル日付 `YYYY-MM-DD` で記録し、同じ日に重複加算しません。同じ日に次のたまごがactiveになっても、その日に実施済みのお世話やボーナスは再利用できません。

初めて孵化させるたまごは `isFirstHatchEgg: true` として保存し、`targetGrowthPoints: 4` でreadyになります。2個目以降のたまごは `targetGrowthPoints: 6` です。ready後も自動孵化はせず、「うまれる！」ボタンを押した時だけ孵化します。

## 鳥の仲間
たまごから生まれる正式な仲間は鳥類6種類だけです。

| 仲間 | speciesId | designVersion |
| --- | --- | ---: |
| ひよこ | `companion_chick` | 2 |
| あひる | `companion_duck` | 2 |
| オウム | `companion_parrot` | 2 |
| くじゃく | `companion_peacock` | 4 |
| ふくろう | `companion_owl` | 2 |
| すずめ | `companion_sparrow` | 2 |

鳥はぬりえ作品とは独立した `companions` データとして管理します。`templateId`、`regionColors`、作品ID、作品配置、親コメント、作品お気に入りは共有しません。

初めて生まれた鳥は `hatchCount: 1`、`bondLevel: 1` で登録されます。同じ鳥が再び生まれた場合はカードを増やさず、`hatchCount` と `bondLevel` を1ずつ増やします。

## なかまずかん
たまご画面に「たまご」「なかまずかん」の切替を追加しました。

未取得の鳥は黒いシルエットで表示し、取得済みの鳥は姿、名前、初回孵化日、最終孵化日、生まれた回数、なかよしレベルを表示します。

取得済みの仲間は1種類だけお気に入りにできます。お気に入りの仲間はホーム画面の「いっしょに ぼうけん」カードへ小さく表示されます。お気に入り0件も可能です。

## スタート画面
アプリ起動時に、採用済みの `apple-touch-icon.png` をそのまま表示するスタート画面を追加しました。

- 画像パス: `./apple-touch-icon.png?v=10p18`
- 最低表示時間: 1.2秒
- 通常終了目安: 初期化完了後
- フェイルセーフ: 約4秒
- フェードアウト後にDOMから除去
- アプリ内画面移動では再表示しない

画像の再生成、描き直し、トリミング、色変更、文字変更、追加加工は行っていません。スタート画面ではユーザー操作前に音を鳴らしません。

## iPhone standalone起動
iPhoneのホーム画面から独立Webアプリとして起動できるように、初期HTMLとmanifestを設定しています。

- `apple-mobile-web-app-capable`: `yes`
- `apple-mobile-web-app-title`: `こどもの冒険`
- manifest: `./manifest.webmanifest?v=10p18`
- manifest `display`: `standalone`
- manifest `start_url`: `./`
- manifest `scope`: `./`
- Service Worker: 追加していません

`start_url` と `scope` はmanifestが置かれた公開ディレクトリ基準の相対指定です。GitHub Pagesの公開フォルダ配下で同じパスに収まり、起動時にscope外へ移動しない構成です。

親モードには「起動診断」を追加しています。通常Safariで開いた場合は「Safari」、ホーム画面からstandalone起動できている場合は `navigator.standalone` または `display-mode: standalone` に基づいて「独立アプリ」と表示します。子ども側の画面には表示されません。

## ぬりえ
ぬりえは10種類を維持しています。表の必要スターは標準値です。親モードの「ぬりえ設定」で変更した場合、子ども側のぬりえ一覧と解放時の消費スターへ反映されます。

| ぬりえ | templateId | 必要スター | designVersion |
| --- | --- | ---: | ---: |
| ちょうちょ | `coloring_butterfly_001` | 4 | 5 |
| おはな | `coloring_flower_001` | 8 | 6 |
| うさぎ | `coloring_rabbit_001` | 12 | 9 |
| ねこ | `coloring_cat_001` | 16 | 5 |
| イルカ | `coloring_dolphin_001` | 20 | 9 |
| きょうりゅう | `coloring_dinosaur_001` | 24 | 9 |
| うま | `coloring_horse_001` | 28 | 9 |
| ライオン | `coloring_lion` | 32 | 2 |
| パンダ | `coloring_panda` | 36 | 1 |
| バッタ | `coloring_grasshopper` | 40 | 2 |

12色クレヨンパレット、まほうの仕上げ、アルバム、世界選択、世界間移動、自由配置は維持しています。

## 世界
作品を置ける世界は6種類を維持しています。

| 世界 | ID | designVersion |
| --- | --- | ---: |
| もり | `world_forest` | 1 |
| うみ | `world_sea` | 1 |
| しま | `world_island` | 2 |
| しろ | `world_castle` | 2 |
| そらじま | `world_sky_island` | 2 |
| ひみつきち | `world_secret_base` | 1 |

鳥の仲間には将来の世界配置に備えて `preferredWorldIds` を持たせていますが、現時点では鳥を世界へ自由配置する機能は追加していません。

## 保存キー
- アプリデータ: `kodomoAdventure.appData.v1`
- UI状態: `kodomoAdventure.uiState.v1`
- 一時バックアップ: `kodomoAdventure.backup.v1`

保存キーとschemaVersionは変更していません。試作13以前のJSONを読み込んだ場合は、既存たまご、作品、世界、スター、解放状態、`coloringSettings` を維持したまま、`dailyActivity.warmed` / `dailyActivity.sang` と初回たまご設定を安全に補完します。

## 技術条件
外部API、CDN、fetch、module形式のscript、画像生成AI、外部画像、外部SVG、外部音声、素材ダウンロードは使用していません。鳥の仲間とたまごの見た目はHTML、CSS、JavaScript、手書きインラインSVGで実装し、お世話の音はWeb Audio APIで短く生成します。

## テストページ
本番ナビからはリンクしない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`
- `tests/animal-svg-review.html`
- `tests/bird-companion-review.html`
- `tests/egg-system-preview.html`
- `tests/startup-recovery-preview.html`
- `tests/coloring-settings-preview.html`

## ファイル構成
```text
kodomo-adventure-local
├─ index.html
├─ apple-touch-icon.png
├─ css
│  └─ styles.css
├─ js
│  ├─ boot.js
│  ├─ constants.js
│  ├─ date-utils.js
│  ├─ storage.js
│  ├─ eggs.js
│  ├─ companions.js
│  ├─ migrations.js
│  ├─ state.js
│  ├─ stars.js
│  ├─ tasks.js
│  ├─ coloring.js
│  ├─ worlds.js
│  ├─ parent-mode.js
│  ├─ router.js
│  └─ app.js
├─ tests
└─ docs
```
