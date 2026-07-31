# こどもの冒険

## 概要
「こどもの冒険」は、毎日のおしごと、スター、ぬりえ、作品を置く世界、たまご育成をローカル保存で楽しむ子ども向けWebアプリです。

Ver.1.0 試作30では、うさぎ、イルカ、きょうりゅう、うま、ライオン、バッタ、びりびり ねずみのSVG原画を、幼児が見分けやすく塗りやすい形へ刷新しました。ちょうちょ、おはな、ねこ、パンダは定義と見た目を変更していません。

既存のホーム画面アイコンは古いHTML設定を保持するため、一度削除してからSafariで最新版を開き、改めてホーム画面へ追加してください。

## バージョン
- 表示名: 結羽ちゃんの冒険
- バージョン: Ver.1.0 試作30
- appVersion: `1.0.0-prototype.30`
- schemaVersion: `1`
- キャッシュ対策: `?v=10p30`

## 試作30のぬりえ原画

- うさぎは長い耳、丸い顔、大きな後脚、短い前脚を一目で追える横向きへ刷新
- イルカは流線形の胴体、自然なくち先、背びれ、胸びれ、上下の尾びれを明確化
- きょうりゅうは大きな頭、あご、小さな前脚、太い後脚、長い尾、背中の突起を整理
- うまは首から顔への流れ、たてがみ、尾、4本の脚、ひづめが小サイズでも読める横向きへ刷新
- ライオンは大きなたてがみと顔を主役にし、胴体、4本脚、尾房を簡潔に整理
- バッタは細長い胴体、触角、羽、大きく折れた後脚を明確化
- びりびり ねずみは大きな楕円耳、星形の頬、両手を広げた姿、渦巻き尾と火花を維持しながら、丸く親しみやすい形へ刷新
- 刷新7種は `color-regions`、`hit-areas`、`outer-outline`、`inner-lines`、`face-details` の共通構造を使用
- `color-regions` にstrokeを持たせず、耳、脚、触角、模様など小さい領域は透明なhit-areaでタップ範囲を補強
- `templateId`、必要スター、解放順、既存作品形式を維持し、旧region IDは `regionAliases` で可能な範囲を引き継ぐ
- ちょうちょ、おはな、ねこ、パンダは定義JSONと空SVGのSHA-256が試作29と一致
- `tests/coloring-preview.html` で旧原画、新線画、黒シルエット、サンプル着色、80px、120pxを比較可能
- 11種類のぬりえ、作品アルバム、世界配置、JSONバックアップ・復元、保存キー4種、`schemaVersion: 1` を維持
- 外部画像、外部SVG、CDN、fetch、外部API、type=moduleは不使用

## 試作29の伝説の鳥と特別なご褒美

- 氷、雷、炎、ほうおうの4種類を `rarity: "legendary"` で一元管理し、ケツァールを含む他11種類は通常鳥として扱う
- 名前やID文字列ではなく共通関数で伝説判定し、図鑑、ホーム、詳細、おうち、キッチン、おでかけ、孵化、進化へ「でんせつ」表示を反映
- 伝説鳥の初回孵化は金色と白の専用表示、stage 2・3のなかよし進化は伝説専用の光輪を追加
- reduced-motion時も静的な枠、背景、バッジで特別感と情報を維持
- `companion_phoenix`（ほうおう）を伝説へ分類し、表示名と保存IDを維持したまま `designVersion: 2` へ更新
- ほうおうを金、淡い金、白金主体の太陽・王冠・扇状尾羽デザインへ全面更新し、赤・珊瑚・橙主体の炎鳥と明確に区別
- おとなモードへ「とくべつな ごほうび」を追加し、正の安全な整数のスター数と任意の30文字のひとことを入力可能
- 現在値、追加値、追加後を専用確認画面で確認してから、既存のスター台帳中央処理へ1回だけ加算
- 実行中disabledと処理中ガードで二重加算を防ぎ、最近5件のご褒美履歴を表示
- 子ども側ホームでは未読のご褒美を1件ずつ一度だけ表示し、閉じた時点で既読保存
- JSONバックアップ・復元、試作28以前のデータ補完、保存キー4種、`schemaVersion: 1` を維持
- 外部画像、外部SVG、外部音声、CDN、fetch、外部API、type=moduleは不使用

## 試作28の鳥の仲間

- `companion_thunder_legend_bird` のIDと表示名を維持し、黄色を主役にした角張った翼・稲妻模様・扇状の尾羽へ全面再設計
- 雷鳥の `designVersion` を2へ更新し、nickname、favorite、bondLevel、hatchCount、plannedSpeciesId、lastSeenEvolutionStageを維持
- `companion_phoenix`（ほうおう、`designVersion: 1`）を追加
- `companion_quetzal`（ケツァール、`designVersion: 1`）を追加
- 正式な孵化候補を15種類へ拡張し、fixed seed、plannedSpeciesId、未取得種優先、再孵化の既存ルールを維持
- ほうおうとケツァールはstage 1本体にstage 2・3の装飾を重ねる共通のなかよし進化へ対応
- 図鑑、ホーム、詳細、おうち、キッチン、食事、おでかけへ既存の共通レンダラーから反映
- とりのおうちへ14羽・15羽用の固定配置を追加
- 雷鳥以外の既存12種類の本体定義は試作27とSHA-256一致
- `tests/bird-companion-review.html` で旧・新雷鳥、ほうおう、ケツァール、80px、120px、黒一色、全15候補を確認可能
- 外部画像・外部SVG・CDN・fetch・外部APIは不使用
- 保存キー4種と `schemaVersion: 1` は変更なし

## 試作27の仲間動線

- 鳥の詳細に「おせわ」「いっしょに」「おうち」「このこのこと」の操作グループを集約
- 詳細の「ごはんを あげる」から、対象の鳥を選択済みにしたキッチンへ移動
- 選択鳥はニックネームや進化stageではなく、取得済みの `companionId` で検証・引き継ぎ
- 料理途中に古い選択鳥が残っていても、詳細から渡した鳥を優先
- 完成料理では鳥カードを選択し、共通の主ボタン1個から既存の中央食事処理を1回だけ実行
- 食事結果を表示してから、必要な場合だけなかよし進化演出を表示
- ホームは代表鳥の主操作1個、なかまのようすと図鑑は鳥の詳細への入口へ整理
- とりのおうちの鳥タップは、対象鳥の反応を記録して詳細へ移動
- キッチンとおでかけからニックネーム・おきにいり等の重複設定操作を除外
- おでかけ中の判定は対象 `companionId` 単位。既存仕様どおり、ごはんは届けられる旨を表示
- 氷の伝説鳥の利用者向け表示名を「でんせつのこおりのとり」へ変更し、`companion_ice_legend_bird` は維持
- なかよし進化13種類×3段階、ニックネーム、おきにいり、キッチン、おでかけ、JSON互換を維持
- 保存キー4種と `schemaVersion: 1` は変更なし

## 試作26のなかよし進化

- bondLevel 1～2はstage 1「ちいさなすがた」
- bondLevel 3～4はstage 2「せいちょうしたすがた」
- bondLevel 5以上はstage 3「とくべつなすがた」
- stageは保存せず、現在の `bondLevel` から共通関数で毎回算出
- stage 1は試作25の13種類のSVG定義と同じ姿を維持
- stage 2・3は元のSVGへ鳥ごとの装飾レイヤーだけを追加し、speciesId、正式名称、カード数を変更しない
- 再孵化と料理による既存のbondLevel上昇条件・上昇量を維持
- 閾値を越えた時はニックネームを優先した「なかよし進化」演出を一度だけ表示
- 進化演出の既読は各companionの任意項目 `lastSeenEvolutionStage` へ保存
- 試作25以前の既存データは現在のstageを既読扱いとし、連続ダイアログを表示しない
- 図鑑で現在の姿、次の成長条件、残りレベルを文字でも表示
- ホーム、なかまのようす、図鑑、とりのおうち、キッチン、おでかけへ共通レンダラーで反映
- ニックネーム、おきにいり、`hatchCount`、`bondLevel`、`mealCount`、`lastFedAt`を維持
- JSONバックアップ・復元で進化既読情報を維持し、stage自体は復元後もbondLevelから再計算
- 390px、safe-area、フォーカス復帰、Escape、`prefers-reduced-motion`へ対応
- 鳥13種類、ぬりえ11種類、保存キー4種、`schemaVersion: 1`は変更なし

## 試作25の仲間とぬりえ

- `companion_thunder_legend_bird`（でんせつの かみなりのとり、`designVersion: 1`）を追加
- `companion_fire_legend_bird`（でんせつの ほのおのとり、`designVersion: 1`）を追加
- 正式な孵化候補は既存11種類を維持して合計13種類
- 新しい2羽も未取得種優先、fixed seed、`plannedSpeciesId`、再孵化、図鑑、おうち、キッチン、おでかけへ共通定義から反映
- 新しい2羽もおきにいりと最大12文字のニックネームに対応
- `coloring_electric_mouse`（びりびり ねずみ、`designVersion: 1`）を追加
- びりびり ねずみは、体、おなか、左右の耳と耳内、左右の星形の頬、両手足、渦巻きの尾、火花、毛束の15領域
- ぬりえは既存10種類を維持して合計11種類
- 新しいぬりえも既存形式で作品アルバム、`renderAlbum()`、JSONバックアップ・復元へ対応
- キャラクターは内部の手書きSVGだけで構成し、外部画像・外部SVG・生成画像・CDN・外部APIは不使用
- 保存キー4種と `schemaVersion: 1` は変更なし

## 試作24の表示名とニックネーム

- `job_cleanup` の正式表示名を「おかたづけBOXをからにする」へ変更
- `job_cleanup` の当日初回報酬を、既存のスター付与処理を通じて2スターへ変更
- 既存の達成履歴へ差額スターを付与せず、他のおしごとの報酬とたまごポイントは変更なし
- 利用者向け表示を「おきにいり」へ統一し、内部の `favorite`、`isFavorite`、`favoriteCompanionId` は維持
- 取得済みの鳥へ、前後空白と制御文字を除いた最大12文字のニックネームを設定可能
- ニックネームは変更・削除でき、削除後は正式な種族名へ戻る
- 図鑑ではニックネームを主表示、正式な種族名を補助表示
- ホーム、なかまのようす、図鑑、とりのおうち、キッチン、おでかけ、おでかけ履歴へ共通表示名関数で反映
- ニックネームは既存companionレコードの `nickname` に保存し、JSONバックアップ・復元で維持
- 試作23以前のデータはニックネーム未設定として安全に補完
- 保存キー4種と `schemaVersion: 1` は変更なし

## 試作23のUI/UX改善

- ホーム上部に代表の鳥またはたまごを使った「きょうの おすすめ」を表示
- 既存データから「きょうの ぼうけん」を計算し、おしごと、おせわ、ごはん、おでかけ、おみやげを短く表示
- カードの角丸、影、余白、見出しサイズを共通デザイントークンへ統一
- 主要ボタンと小ボタンを48px以上のタップ領域へ整理
- 鳥SVGを変更せず、明るい背景と余白で図鑑、ホーム、選択画面の視認性を改善
- とりのおうちの通常モードと模様替えモードを枠表示で区別
- おでかけ、キッチン、ぬりえ、世界、作品、親モードのカードと操作状態を統一
- 390px幅、safe-area、下部ナビの余白、フォーカス表示、disabled表示を確認
- `prefers-reduced-motion` では追加した動きを停止

鳥11種類、たまご育成、おしごと、キッチン、とりのおうち、おでかけ、ぬりえ、世界、作品、JSONバックアップのデータ構造と処理は変更していません。保存キー4種とschemaVersionも従来どおりです。

## 試作22の仲間

- `companion_chick` は黄色い体、表情、くちばし、足、冠羽を維持し、ひよこ本体以外の黒い外周ストロークだけを無効化
- `companion_penguin`（ぺんぎん）を追加
- `companion_shimaenaga`（しまえなが）を追加
- `companion_parakeet`（いんこ）を追加
- `companion_java_sparrow`（ぶんちょう）を追加
- `companion_ice_legend_bird`（でんせつのこおりのとり）を、既存IPを複製しないオリジナルデザインで追加

新規5種はすべて `designVersion: 1` です。正式species定義は `js/companions.js` の1か所にあり、孵化演出、なかまずかん、ホーム、なかまのようす、とりのおうち、キッチン、おでかけで同じSVGレンダラーを使います。とりのおうちは11羽用の固定配置を追加し、保存済みの鳥座標データは増やしていません。

既存の取得済み鳥、孵化履歴、おきにいり、`hatchCount`、`mealCount`、`bondLevel` は変更しません。同じ鳥が再び生まれた場合も、従来どおりカードは増やさず `hatchCount` と `bondLevel` を増やします。JSONバックアップは従来のappData形式を維持し、保存キーとschemaVersionは変更していません。

## 試作21 修正1の表示修正

- ひよこの不要な黒い外枠を削除
- オウムの不要な黒い外枠を削除
- ふくろうの不要な黒い外枠を削除
- 鳥本体の輪郭・表情・模様は維持
- あひる・くじゃく・すずめは変更なし
- 保存データ、保存キー、schemaVersion、既存機能は変更なし

## 試作21のなかまと おでかけ
ホームの「なかまと おでかけ」カードと「なかまのようす」で、準備中、出発可能、おでかけ中、帰宅・未受取の状態を確認できます。新しい下部ナビ項目は追加していません。

準備条件は、ローカル日付の既存データから計算します。

- 有効なおしごとを当日1件以上達成
- なでる・あたためる・うたうのいずれかを当日1回以上実施
- 取得済み鳥のいずれかへ当日ごはんをあげる

育てられるたまごがない場合は、取得済みの鳥との生活を継続できるよう「おせわ」を安全に完了扱いとします。おしごとやぬりえ由来のたまごポイントだけでは、直接のおせわ完了になりません。一緒に行ける鳥は、当日にごはんを食べた取得済み鳥だけです。

おでかけ先は3種類です。

| 行き先 | destinationId | 主なおみやげ |
| --- | --- | --- |
| はらっぱ | `outing_meadow` | 2〜4スター |
| はなのはら | `outing_flower_field` | おでかけ家具3種類、全取得後は3スター |
| うみ | `outing_sea` | 正式な料理素材 |

はなのはらでは、おはなのリース、おはなのクッション、ちょうちょのモビールを取得できます。既存12家具と合わせて15種類です。うみの素材は `kitchen.ingredientInventory` へ「おみやげ保有数」として保存しますが、料理素材は従来どおり消費せず何度でも使えます。

おでかけの `rewardPlan` は出発時に決定して `appData.outing.activeTrip` へ保存します。翌ローカル日付以降に帰宅し、「おみやげを うけとる」を押した時だけ既存のスター、家具、素材データへ付与します。`tripId`、`claimedTripIds`、受取済み履歴で重複付与を防ぎ、履歴は最新100件を保存します。おでかけ中の鳥はとりのおうちから一時的に外れ、帰宅後は受取前でも部屋へ戻ります。

## 試作20のホームとおしごと
ホーム上部の「おしごと」「ぬりえ」「せかい」「さくひん」の重複入口を削除し、下部ナビゲーションへ統一しました。使える星と集めた星は、計算方法を変えずに小型表示へ整理しています。

「なかまのようす」はホームを開いた時点で表示され、現在のたまごの進み具合、代表の鳥となかよしレベル、今日のお世話、今日の食事を既存データから計算して短く案内します。鳥やたまごがなくてもホーム表示は継続します。

正式なおしごと `job_cleanup` は試作24で「おかたづけBOXをからにする」へ改称しました。当日の初回達成では2スターを付与し、同日重複防止とたまごのおしごとボーナスは既存処理を使用します。1日最大5ポイントの上限は変わりません。

親モードの「おしごと設定」では次を設定できます。

- 1日に表示する数: 1〜10
- 標準・オリジナルのおしごとの有効／無効
- 上下ボタンによる並べ替え
- オリジナルのおしごとの追加・編集・削除（最大20件）
- 標準設定への復元

有効なおしごとが表示数より多い日は、ローカル日付とjobIdから決定的に選択します。同じ日は再読み込みしても同じ組み合わせを使い、設定変更で無効・削除された項目だけを除いて空いた枠を補充します。過去の達成履歴、獲得スター、たまごポイントは削除・再計算しません。

設定は `appData.jobSettings` に保存します。

```json
{
  "dailyDisplayCount": 7,
  "enabledJobIds": ["task_brush_teeth", "job_cleanup"],
  "displayOrder": ["task_brush_teeth", "job_cleanup"],
  "customJobs": [],
  "dailySelectionsByDate": {}
}
```

試作19以前のデータとJSONには標準設定を補完し、不正項目だけを正規化します。保存キーとschemaVersionは変更していません。

## 試作19のとりのおうち
取得済みの鳥が1種類以上いると、鳥の詳細から「とりのおうちで みる」を選べます。とりのおうちの鳥をタップすると、その鳥の詳細へ戻れます。未取得の鳥はおうちに姿やシルエットを出さず、まだ仲間が増える余地だけを小さく案内します。

- 取得済み鳥だけを共通のおうちへ表示
- おきにいり鳥、または最初の鳥を中央寄りへ安定配置
- 鳥をタップすると首かしげ、ジャンプ、羽ばたき、眠そうな反応、ハートのいずれかを表示
- 直近で料理を食べた鳥には、食事後のうれしい反応を表示
- 家具12種類と固定配置枠8か所を追加
- 家具は条件達成で取得し、一度取得した家具は没収しません
- 模様替えは自由ドラッグではなく、配置枠を選んで置く方式です
- 家具図鑑で取得済み家具、未取得家具、条件の進み具合を確認できます
- 鳥SVG本体、孔雀designVersion 4、既存companionsデータは変更していません

birdHouseデータは `appData.birdHouse` に保存します。

```json
{
  "birdHouse": {
    "unlockedItemIds": [
      "house_perch_basic",
      "house_nest_basic",
      "house_cushion_small",
      "house_food_table"
    ],
    "unlockedAtByItemId": {},
    "unseenItemIds": [],
    "placements": {
      "wallLeft": null,
      "wallRight": null,
      "floorLeft": "house_cushion_small",
      "floorRight": null,
      "perchLeft": "house_perch_basic",
      "perchRight": null,
      "centerTable": "house_food_table",
      "nestCorner": "house_nest_basic"
    },
    "lastVisitedAt": null,
    "lastInteractedCompanionId": null
  }
}
```

家具12種類:

| 家具 | itemId | 種類 | 取得条件 |
| --- | --- | --- | --- |
| 基本の止まり木 | `house_perch_basic` | perch | 最初から取得済み |
| 小さな巣 | `house_nest_basic` | nest | 最初から取得済み |
| 小さなクッション | `house_cushion_small` | floor | 最初から取得済み |
| ごはんテーブル | `house_food_table` | table | 最初から取得済み |
| 大きな止まり木 | `house_perch_large` | perch | 鳥を3種類取得 |
| 虹の止まり木 | `house_perch_rainbow` | perch | 鳥を6種類取得 |
| 木のテーブル | `house_table_wood` | table | 異なる料理を3種類作る |
| キッチンワゴン | `house_kitchen_wagon` | table | 料理を合計10回作る |
| 虹のモビール | `house_mobile_rainbow` | wall | ぬりえ作品を3枚完成 |
| おもちゃのベル | `house_bell_toy` | wall/floor | 鳥への食事回数が合計5回 |
| 星のクッション | `house_cushion_star` | floor | なかよしレベル5以上の鳥が1種類 |
| 思い出の写真立て | `house_photo_frame` | wall | 鳥の合計孵化回数が8回以上 |

配置枠8か所:

| slotId | 用途 |
| --- | --- |
| `wallLeft` / `wallRight` | 壁飾り |
| `floorLeft` / `floorRight` | 床置き家具 |
| `perchLeft` / `perchRight` | 止まり木 |
| `centerTable` | テーブル・ワゴン |
| `nestCorner` | 巣 |

家具取得条件は `getBirdHouseMetrics()` で既存データから計算し、`evaluateBirdHouseUnlocks()` で取得済み家具へ追加します。新しい累計値は重複保存せず、鳥、料理、作品、孵化、なかよしレベルの既存データを参照します。

## 試作18のとりさんキッチン
取得済みの鳥が1種類以上いると、鳥の詳細の「ごはんを あげる」から対象鳥を選択済みにしてキッチンへ進めます。キッチン内でも取得済み鳥を選び直せます。

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
たまごから生まれる正式な仲間は鳥類15種類です。

| 仲間 | speciesId | designVersion |
| --- | --- | ---: |
| ひよこ | `companion_chick` | 2 |
| あひる | `companion_duck` | 2 |
| オウム | `companion_parrot` | 2 |
| くじゃく | `companion_peacock` | 4 |
| ふくろう | `companion_owl` | 2 |
| すずめ | `companion_sparrow` | 2 |
| ぺんぎん | `companion_penguin` | 1 |
| しまえなが | `companion_shimaenaga` | 1 |
| いんこ | `companion_parakeet` | 1 |
| ぶんちょう | `companion_java_sparrow` | 1 |
| でんせつのこおりのとり | `companion_ice_legend_bird` | 1 |
| でんせつの かみなりのとり | `companion_thunder_legend_bird` | 2 |
| でんせつの ほのおのとり | `companion_fire_legend_bird` | 1 |
| ほうおう | `companion_phoenix` | 1 |
| ケツァール | `companion_quetzal` | 1 |

鳥はぬりえ作品とは独立した `companions` データとして管理します。`templateId`、`regionColors`、作品ID、作品配置、親コメント、作品のおきにいり状態は共有しません。

初めて生まれた鳥は `hatchCount: 1`、`bondLevel: 1` で登録されます。同じ鳥が再び生まれた場合はカードを増やさず、`hatchCount` と `bondLevel` を1ずつ増やします。

## なかまずかん
たまご画面に「たまご」「なかまずかん」の切替を追加しました。

未取得の鳥は黒いシルエットで表示し、取得済みの鳥は姿、名前、初回孵化日、最終孵化日、生まれた回数、なかよしレベルを表示します。

取得済みの仲間は1種類だけおきにいりにできます。おきにいりの仲間はホームの代表鳥として優先表示され、鳥の詳細から設定・解除できます。おきにいり0件も可能です。

## スタート画面
アプリ起動時に、採用済みの `apple-touch-icon.png` をそのまま表示するスタート画面を追加しました。

- 画像パス: `./apple-touch-icon.png?v=10p30`
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
- manifest: `./manifest.webmanifest?v=10p30`
- manifest `display`: `standalone`
- manifest `start_url`: `./`
- manifest `scope`: `./`
- Service Worker: 追加していません

`start_url` と `scope` はmanifestが置かれた公開ディレクトリ基準の相対指定です。GitHub Pagesの公開フォルダ配下で同じパスに収まり、起動時にscope外へ移動しない構成です。

親モードには「起動診断」を追加しています。通常Safariで開いた場合は「Safari」、ホーム画面からstandalone起動できている場合は `navigator.standalone` または `display-mode: standalone` に基づいて「独立アプリ」と表示します。子ども側の画面には表示されません。

## ぬりえ
ぬりえは11種類です。表の必要スターは標準値です。親モードの「ぬりえ設定」で変更した場合、子ども側のぬりえ一覧と解放時の消費スターへ反映されます。

| ぬりえ | templateId | 必要スター | designVersion |
| --- | --- | ---: | ---: |
| ちょうちょ | `coloring_butterfly_001` | 4 | 5 |
| おはな | `coloring_flower_001` | 8 | 6 |
| うさぎ | `coloring_rabbit_001` | 12 | 10 |
| ねこ | `coloring_cat_001` | 16 | 5 |
| イルカ | `coloring_dolphin_001` | 20 | 10 |
| きょうりゅう | `coloring_dinosaur_001` | 24 | 10 |
| うま | `coloring_horse_001` | 28 | 10 |
| ライオン | `coloring_lion` | 32 | 3 |
| パンダ | `coloring_panda` | 36 | 1 |
| バッタ | `coloring_grasshopper` | 40 | 3 |
| びりびり ねずみ | `coloring_electric_mouse` | 44 | 2 |

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

保存キーとschemaVersionは変更していません。試作18以前のJSONを読み込んだ場合は、既存たまご、作品、世界、スター、解放状態、`coloringSettings`、`kitchen`、`companions` を維持したまま、`birdHouse` を安全に補完します。

## 技術条件
外部API、CDN、fetch、module形式のscript、画像生成AI、外部画像、外部SVG、外部音声、素材ダウンロードは使用していません。鳥の仲間とたまごの見た目はHTML、CSS、JavaScript、手書きインラインSVGで実装し、お世話の音はWeb Audio APIで短く生成します。

## テストページ
本番ナビからはリンクしない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/browser-qa-p30.cjs`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`
- `tests/animal-svg-review.html`
- `tests/bird-companion-review.html`
- `tests/egg-system-preview.html`
- `tests/startup-recovery-preview.html`
- `tests/coloring-settings-preview.html`
- `tests/kitchen-preview.html`
- `tests/bird-house-preview.html`
- `tests/home-jobs-preview.html`
- `tests/outing-preview.html`

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
│  ├─ kitchen.js
│  ├─ bird-house.js
│  ├─ outings.js
│  ├─ migrations.js
│  ├─ state.js
│  ├─ stars.js
│  ├─ tasks.js
│  ├─ coloring-art-v30.js
│  ├─ coloring.js
│  ├─ worlds.js
│  ├─ parent-mode.js
│  ├─ router.js
│  └─ app.js
├─ tests
└─ docs
```
