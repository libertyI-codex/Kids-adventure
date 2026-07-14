# こどもの冒険

## 概要

「こどもの冒険」は、子どもの毎日の頑張りが冒険の世界へ反映される生活習慣アプリです。

Ver.1.0 試作7の子ども向け表示名は **結羽ちゃんの冒険** です。

## バージョン

- 表示名: 結羽ちゃんの冒険
- 内部プロジェクト名: こどもの冒険
- バージョン: Ver.1.0 試作7
- appVersion: `1.0.0-prototype.7`
- schemaVersion: `1`

## 基本体験

1. 今日のおしごとをする
2. スターをもらう
3. ぬりえを解放する
4. 自由に色を塗る
5. まほうの仕上げで作品が変身する
6. 作品を置く世界を選ぶ
7. 世界の中で作品を自由に並べる
8. 今日のぼうけんと思い出が残る
9. あつめたほし10こごとに、ふしぎなたまごが増える

## 対象年齢

4〜8歳を想定しています。

## 技術条件

完全無料で使える静的Webアプリです。

- HTML
- CSS
- JavaScript
- SVG
- localStorage

外部API、外部AI、有料サービス、npm依存、ビルドツール、CDN、ログイン、クラウド保存は使っていません。

`index.html` をブラウザで直接開いても動作します。GitHub Pagesにも対応します。

## 実装済み機能

- ホーム
- 今日のおしごと
- スター獲得演出
- ぬりえ一覧
- SVGぬりえ編集
- まほうの仕上げ
- せかい画面
- 森、海、島、城、空島
- 新しい作品の配置先選択
- 世界間の作品移動
- 世界ごとの作品配置編集
- 今日のぼうけん
- 今日の作品・簡易アルバム
- 親モード
- データ管理
- localStorage保存
- JSONバックアップ・復元
- schemaVersion 1対応
- スマホ対応
- ふしぎなたまご
- Safari向け親モード長押し改善
- BGM
- 効果音
- 12色クレヨン風パレット
- 組み込みぬりえdesignVersion同期
- 旧regionColors互換
- 割合座標での配置保存
- テスト用ぬりえプレビュー
- テスト用配置プレビュー
- テスト用世界プレビュー

## 初期おしごと

- はみがき
- おきがえ
- えほん
- ピアノ
- ドリル
- そろばん

各おしごとの初期報酬は1スターです。1つのおしごとは1日1回だけスターを獲得できます。

既存データに旧おしごとの `おみずあげ` がある場合は削除しません。補完処理では、新しい初期おしごとの不足分だけを追加します。

## 初期ぬりえと解放順

- ちょうちょ: 4スター
- おはな: 8スター
- うさぎ: 12スター
- ねこ: 16スター
- イルカ: 20スター
- きょうりゅう: 24スター
- うま: 28スター

作品はBase64画像として保存せず、SVGテンプレートIDと領域別カラー情報から再描画します。

組み込みぬりえには `designVersion`、`svgKey`、`viewBox`、領域定義、旧領域ID対応を持たせています。起動時の `ensureDataShape()` でコード内の正式定義を保存済みテンプレートへ同期し、解放済み状態や作品、配置、親コメントなどの進行状況は維持します。

## せかい

試作7では、現在の「思い出の森」を複数世界へ拡張しました。下部ナビゲーションの表示は「もり」から「せかい」に変更しています。

初期状態では、次の5世界をすべて利用できます。

| 世界 | ID | designVersion |
| --- | --- | --- |
| 森 | `world_forest` | `1` |
| 海 | `world_sea` | `1` |
| 島 | `world_island` | `1` |
| 城 | `world_castle` | `1` |
| 空島 | `world_sky_island` | `1` |

各世界は `id`、`name`、`icon`、`unlocked`、`unlockedAt`、`designVersion`、`displayOrder`、`unlockCondition` を持ちます。試作7では全世界を `unlocked: true`、`unlockCondition: null` とし、将来の解放条件追加に備えています。

## 作品の所属世界

作品は同時に1つの世界だけに所属します。所属世界は配置データ内の `placement.worldId` に保存します。

```text
placement: {
  worldId: "world_forest",
  xPercent: 52.4,
  yPercent: 68.1,
  zIndex: 4,
  isManual: true,
  updatedAt: "..."
}
```

試作6以前の既存作品は、初回補完時に `world_forest` へ所属させます。既存の森配置で使っていた `xPercent`、`yPercent`、`zIndex`、`isManual` は維持します。不正な `worldId` がある場合も作品を削除せず、`world_forest` へ安全に戻します。

## 新しい作品の配置先

ぬりえ完成後、まほうの仕上げが終わると「どのせかいに おく？」を表示します。どの作品も、森、海、島、城、空島のどこへでも置けます。

おすすめ世界は案内だけです。選ばずに閉じた場合は、作品の種類に応じた推奨世界へ自動配置されます。

- ちょうちょ: 森
- おはな: 森
- うさぎ: 森
- ねこ: 城
- イルカ: 海
- きょうりゅう: 島
- うま: 島

## 世界間の作品移動

せかい画面の「さくひんをうつす」から、現在の世界にいる作品を別の世界へ移動できます。

移動後も次の情報は維持します。

- 色
- `regionColors`
- `templateId`
- 完成日
- 親のひとこと
- お気に入り
- 固定seed

移動先では、その世界用の自動配置を再計算します。以前の世界の座標はそのまま流用しません。

## 世界ごとの配置編集

「ならべかえ」から配置編集モードに入り、現在開いている世界の作品だけを指でドラッグできます。通常モードではドラッグできず、作品タップで詳細を表示します。

座標は各世界の描画エリアに対する割合で保存します。スマホ、タブレット、PCでも相対位置が維持されます。

「もとにもどす」は、現在開いている世界の作品だけを、その世界の自動配置へ戻します。他の世界の配置は変更しません。

## 色パレット

12色のクレヨン風パレットです。

- 赤
- ピンク
- オレンジ
- 黄色
- 黄緑
- 緑
- 水色
- 青
- 紫
- 茶色
- 黒
- 白

## ふしぎなたまご

累計スター10こごとに、たまごを1こ獲得します。つかえるスターの残高やぬりえ解放には影響しません。

試作7では、たまごの状態は `new` のみ使用します。将来の拡張用に `cracked`、`hatched` を追加できる構造にしています。

## 音

外部音源は使用せず、Web Audio APIで生成します。

- BGM: やさしい短いループ。初期値はOFFです。
- 効果音: スター獲得、ぬりえ完成、たまご獲得、生き物誕生用を用意しています。
- 親モードからBGMと効果音を個別にON/OFFできます。

## Safari長押し改善

親モードの「おとな」ボタンは、iPhone Safariで文字選択が出にくいように調整しています。

- `user-select: none`
- `-webkit-user-select: none`
- `-webkit-touch-callout: none`
- `touch-action: manipulation`
- `pointerdown` / `pointerup` / `pointercancel` による長押し判定

## 保存キー

- アプリデータ: `kodomoAdventure.appData.v1`
- UI状態: `kodomoAdventure.uiState.v1`
- 一時バックアップ: `kodomoAdventure.backup.v1`

試作7でも保存キーは変更していません。schemaVersionも `1` のままです。

## データバックアップ方法

親モードからデータ管理を開き、JSONを書き出せます。復元時はJSON形式、必須項目、schemaVersionを確認し、不正データなら現在のデータを変更しません。

試作6以前のJSONを読み込んだ場合も、世界データと `placement.worldId` を補完します。

## テスト用ページ

本番画面からはリンクしていない確認用ページです。保存版には含めますが、GitHub Pages公開用フォルダにはコピーしません。

- `tests/coloring-preview.html`
- `tests/forest-placement-preview.html`
- `tests/worlds-preview.html`

## ファイル構成

```text
kodomo-adventure-local
├─ index.html
├─ css
│  └─ styles.css
├─ js
│  ├─ constants.js
│  ├─ date-utils.js
│  ├─ storage.js
│  ├─ eggs.js
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
│  ├─ smoke-tests.js
│  ├─ coloring-preview.html
│  ├─ forest-placement-preview.html
│  └─ worlds-preview.html
└─ docs
```

## 今後の予定

- Ver.1.1: おしごとの追加・削除、親モード強化
- Ver.1.2: アルバム強化、生き物図鑑
- Ver.1.3: たまごのひび・孵化演出、季節イベント
- Ver.2.0: 世界解放条件、複数プロフィール、PWA対応

## 既知の制約

- 複数プロフィール切り替えは未実装
- 季節の自動切り替えは未実装
- 本格的な生き物図鑑は未実装
- PWAとService Workerは未実装
- 4桁PINは未実装
- 世界解放条件はデータ構造のみで、試作7では全世界利用可能
- 画像生成AI、外部画像、外部SVG、外部API、CDNは未使用
