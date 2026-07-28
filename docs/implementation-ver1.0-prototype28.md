# Ver.1.0 試作28 実装メモ

## 今回の目的

既存の `companion_thunder_legend_bird` を黄色主体の雷鳥へ全面再設計し、正式な仲間として「ほうおう」と「ケツァール」を追加した。保存上の鳥ID、孵化・再孵化、ニックネーム、おきにいり、なかよし進化、キッチン、おでかけの共通処理は変更せず、正式な孵化候補を15種類へ拡張する。

## 雷鳥の再設計

- ID: `companion_thunder_legend_bird`
- 表示名: でんせつの かみなりのとり
- designVersion: 2
- viewBox: `0 0 240 180`
- 主色: 鮮やかな黄色 `#FFD21F` と明るい黄色 `#FFE55C`
- 補助色: オレンジ、白、濃い茶系
- 形状: 左右へ広がる角張った翼、翼内の稲妻帯、複数の冠羽、稲妻状に分かれる尾羽

試作27の青系SVGパスは本番定義で再利用せず、outer、regions、inner、faceを新しく定義した。黒い外周円は追加していない。`companionId`、speciesId、displayOrder、表示名、preferredWorldIdsと保存済みcompanionレコードの対応は維持した。

## ほうおう

- ID: `companion_phoenix`
- 表示名: ほうおう
- designVersion: 1
- displayOrder: 14
- viewBox: `0 0 240 190`

赤、橙、金、クリームを使い、左右へ広がる層状の翼、胸の花びら模様、金色の冠羽、扇状の尾羽で神話的な火の鳥を表現した。既存鳥や外部作品のパスは流用していない。

stage 2では炎羽、胸から尾へ続く金色の線、尾羽装飾を追加する。stage 3では背面のやさしい光、火の粉、追加の冠羽線と豪華な尾羽装飾を重ねる。

## ケツァール

- ID: `companion_quetzal`
- 表示名: ケツァール
- designVersion: 1
- displayOrder: 15
- viewBox: `0 0 220 210`

緑と青緑を主色に、赤い胸、短い丸みのある体、左右の翼模様、長い二本の尾羽を組み合わせた。縦長のviewBox内へ尾羽を収め、80pxでも他の鳥と区別できるシルエットにした。

stage 2では翼模様、胸元、尾羽の延長線を追加する。stage 3では背面の光輪、長い尾羽装飾、左右の光粒を重ねる。

## 孵化候補への追加

`js/companions.js` の正式な `SPECIES` 配列へ2定義を追加した。`allSpecies()`、`pickSpeciesForEgg()`、`recordHatch()` は既存の共通処理を使用するため、次を個別実装していない。

- fixed seed
- `plannedSpeciesId`
- 未取得種優先
- 再孵化時のカード重複防止
- `hatchCount +1`
- `bondLevel +1`

試作27データで既存13種類が取得済みの場合、未取得候補は `companion_phoenix` と `companion_quetzal` だけになる。同じegg IDでは決定結果が変わらない。

## 既存機能への反映

図鑑、ホーム、鳥の詳細、孵化表示、キッチン、食事対象、おでかけは `allSpecies()`、`getSpecies()`、`renderCompanion()` を使用するため、追加した2種類を同じ経路で表示する。ニックネーム、おきにいり、mealCount、lastFedAt、bondLevel、lastSeenEvolutionStageも既存companionレコードの共通処理を使用する。

とりのおうちは人数別の固定配置だけが13羽上限だったため、14羽・15羽用座標を追加し、上限を15へ変更した。birdHouseの保存形式、家具15種類、配置枠8種類は変更していない。

## なかよし進化

stageは保存せず、既存の `getCompanionEvolutionStage()` でbondLevelから算出する。

- stage 1: bondLevel 1～2
- stage 2: bondLevel 3～4
- stage 3: bondLevel 5以上

新2種類を `EVOLUTION_DECORATIONS` へ追加した。stage 1は本体定義だけ、stage 2・3は前後の装飾レイヤーだけを追加する。進化既読は従来どおり `lastSeenEvolutionStage` を使い、既存ユーザーへの大量ダイアログ抑制も変更していない。

## 既存12種類の未変更確認

雷鳥と新2種類を除いた試作27の12定義について、並び順を含むJSONのSHA-256を固定した。

`068C8B88CB92176F1AE7444219783C562CB70FD4F69FEA301938EA809340F361`

孔雀designVersion 4、ひよこの `outlineStroke: "none"`、氷の伝説鳥のIDと表示名を維持する。

## レビュー用ページ

`tests/bird-companion-review.html` は本番localStorageを使用せず、次を表示する。

- 試作27の旧雷鳥と試作28の新雷鳥
- ほうおう
- ケツァール
- stage 1
- 120px
- 80px
- 黒一色シルエット
- 正式候補15種類
- 鳥名表示のON/OFF

旧雷鳥は比較専用のローカル定義であり、本番の孵化候補には含まれない。

## データ互換

保存キー4種と `schemaVersion: 1` は変更していない。既存companionレコードを再構築せず、新speciesは正式定義の不足分として利用可能になる。既存のnickname、favorite、bondLevel、hatchCount、mealCount、lastFedAt、plannedSpeciesId、lastSeenEvolutionStage、birdHouse、kitchen、outing、coloring、artworksを維持する。

JSONバックアップ・復元はappData全体の既存形式を使用する。試作27以前のJSONに新speciesレコードがなくても、取得済み状態を勝手に追加せず、次回以降の孵化候補として利用できる。

## 外部素材とアクセシビリティ

鳥はすべて手書きインラインSVGで、外部画像、外部SVG、CDN、fetch、外部API、`type="module"` は追加していない。SVGは既存レンダラーが表示名と進化段階をaria-labelへ付与する。レビュー用操作は48px以上とし、390pxで横スクロールが出ないレスポンシブ構成にした。

## 自動検証

- 全本番JavaScript構文: 合格
- 読み込み順と関数重複: 合格
- `tests/smoke-tests.js`: `Smoke tests passed`
- 正式鳥15種類、ID・displayOrder一意: 合格
- 新2種類のfixed seed、plannedSpeciesId、未取得優先、再孵化: 合格
- 15種類のstage 1～3: 合格
- とりのおうち15羽固定配置: 15個の座標が一意
- 既存12種類の定義SHA-256: 試作27基準と一致
- 外部参照禁止条件: 外部URL、外部画像、外部SVG、CDN、fetch、`type="module"`なし
- 390×844ブラウザ表示: 全確認画面で`scrollWidth: 390`
- ブラウザコンソールと読込: エラー0件、失敗0件
- レビューSVG: 空描画0件、最小ボタン高さ48px
- ホーム、図鑑、詳細、おうち、キッチン、おでかけ: 新2種類の表示を確認

## 手動確認項目

- 雷鳥の黄色主体デザインと旧デザインとの差
- 雷鳥、ほうおう、ケツァールの80px・120px・黒一色
- ほうおうとケツァールの孵化、図鑑、詳細
- ニックネームとおきにいり
- キッチンでの食事
- おでかけ選択
- stage 2・3の装飾
- とりのおうち15羽表示
- 390px、safe-area、reduced-motion
