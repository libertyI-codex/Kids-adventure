# こどもの冒険

## 概要
「こどもの冒険」は、毎日のおしごと、スター、ぬりえ、作品を置く世界、たまご育成をローカル保存で楽しむ子ども向けWebアプリです。

Ver.1.0 試作12では、既存のたまご機能を「おせわ、成長、孵化、なかまずかん」へ拡張しました。たまごから生まれる仲間はぬりえ作品とは独立した鳥類6種類です。起動直後には採用済みの `apple-touch-icon.png` を使ったスタート画面を表示します。

## バージョン
- 表示名: 結羽ちゃんの冒険
- バージョン: Ver.1.0 試作12
- appVersion: `1.0.0-prototype.12`
- schemaVersion: `1`
- キャッシュ対策: `?v=10p12`

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

1日の成長ポイントは最大3ポイントです。
- たまごをなでる: 1ポイント
- おしごと達成: 1ポイント
- ぬりえ完成: 1ポイント

各条件は1日1回だけです。`eggSystem.dailyActivity` にローカル日付 `YYYY-MM-DD` で記録し、同じ日に重複加算しません。

## 鳥の仲間
たまごから生まれる正式な仲間は鳥類6種類だけです。

| 仲間 | speciesId | designVersion |
| --- | --- | ---: |
| ひよこ | `companion_chick` | 1 |
| あひる | `companion_duck` | 1 |
| オウム | `companion_parrot` | 1 |
| くじゃく | `companion_peacock` | 1 |
| ふくろう | `companion_owl` | 1 |
| すずめ | `companion_sparrow` | 1 |

鳥はぬりえ作品とは独立した `companions` データとして管理します。`templateId`、`regionColors`、作品ID、作品配置、親コメント、作品お気に入りは共有しません。

初めて生まれた鳥は `hatchCount: 1`、`bondLevel: 1` で登録されます。同じ鳥が再び生まれた場合はカードを増やさず、`hatchCount` と `bondLevel` を1ずつ増やします。

## なかまずかん
たまご画面に「たまご」「なかまずかん」の切替を追加しました。

未取得の鳥は黒いシルエットで表示し、取得済みの鳥は姿、名前、初回孵化日、最終孵化日、生まれた回数、なかよしレベルを表示します。

取得済みの仲間は1種類だけお気に入りにできます。お気に入りの仲間はホーム画面の「いっしょに ぼうけん」カードへ小さく表示されます。お気に入り0件も可能です。

## スタート画面
アプリ起動時に、採用済みの `apple-touch-icon.png` をそのまま表示するスタート画面を追加しました。

- 画像パス: `./apple-touch-icon.png?v=10p12`
- 最低表示時間: 1.2秒
- 通常終了目安: 初期化完了後
- フェイルセーフ: 約4秒
- フェードアウト後にDOMから除去
- アプリ内画面移動では再表示しない

画像の再生成、描き直し、トリミング、色変更、文字変更、追加加工は行っていません。スタート画面ではユーザー操作前に音を鳴らしません。

## ぬりえ
ぬりえは10種類を維持しています。

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

鳥の仲間には将来の世界配置に備えて `preferredWorldIds` を持たせていますが、試作12では鳥を世界へ自由配置する機能は追加していません。

## 保存キー
- アプリデータ: `kodomoAdventure.appData.v1`
- UI状態: `kodomoAdventure.uiState.v1`
- 一時バックアップ: `kodomoAdventure.backup.v1`

保存キーとschemaVersionは変更していません。試作11以前のJSONを読み込んだ場合は、既存たまご、作品、世界、スターを維持したまま、`eggSystem` と `companions` を不足分として補完します。

## 技術条件
外部API、CDN、fetch、`type="module"`、画像生成AI、外部画像、外部SVG、素材ダウンロードは使用していません。鳥の仲間とたまごの見た目はHTML、CSS、JavaScript、手書きインラインSVGで実装しています。

## テストページ
本番ナビからはリンクしない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`
- `tests/animal-svg-review.html`
- `tests/bird-companion-review.html`
- `tests/egg-system-preview.html`

## ファイル構成
```text
kodomo-adventure-local
├─ index.html
├─ apple-touch-icon.png
├─ css
│  └─ styles.css
├─ js
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
