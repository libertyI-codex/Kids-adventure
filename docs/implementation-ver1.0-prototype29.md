# Ver.1.0 試作29 実装メモ

## 今回の目的

試作28の15種類の鳥と既存データを維持したまま、伝説鳥の分類と表示を一元化し、ほうおうを金色主体へ再設計する。あわせて、おとなモードから既存スター残高へ任意数を安全に加算する「とくべつな ごほうび」を追加する。

作業前currentは `1.0.0-prototype.28`、画面表示は `Ver.1.0 試作28`、キャッシュは `?v=10p28` だった。

## 伝説鳥分類

`js/companions.js` のspecies定義へ `rarity` を導入した。伝説4種は定義上で `legendary`、それ以外は `allSpecies()` で `normal` へ正規化する。

- `companion_ice_legend_bird`
- `companion_thunder_legend_bird`
- `companion_fire_legend_bird`
- `companion_phoenix`

`companion_quetzal` は `normal` である。判定は `isLegendaryCompanionSpecies()` と `isLegendaryCompanion()` に集約し、名前に「でんせつ」が含まれるかどうかでは判定しない。

## 通常鳥との表示差

`companionPresentation()` が共通レンダラーのSVGへ、伝説鳥だけ次を表示時に重ねる。

- 文字付きの「でんせつ」バッジ
- 金色系の枠と淡い背景
- SVGのやわらかな光
- aria-labelの「でんせつのなかま」

ホーム、なかまのようす、図鑑、詳細、おうち、キッチン、食事対象、おでかけ、帰宅、孵化、進化で同じ共通処理を使用する。バッジ文字は鳥名や保存レコードへ書き込まない。

## 孵化演出

伝説鳥を初めて取得した時だけ、通常の孵化結果を「でんせつの なかまが うまれた！」へ分岐し、金色と白の背景光、星、伝説バッジを表示する。再孵化、hatchCount、fixed seed、plannedSpeciesId、未取得種優先、孵化確率は変更していない。

## 進化演出

stage 2またはstage 3へ進化した伝説鳥の結果カードへ、金色の枠、光輪、星、伝説バッジを加える。stage判定、`lastSeenEvolutionStage`、食事結果後に詳細へ戻ってから進化を表示する順番は維持した。通常鳥の演出構造は変更していない。

## reduced-motion

`prefers-reduced-motion` またはアプリ内の軽減設定では、孵化・ご褒美の星の動きを停止する。静的な伝説枠、背景、バッジ、光輪は残すため、アニメーションがなくても意味が伝わる。

## ほうおうの変更

試作28のほうおうは赤、橙、炎羽が中心で、炎の伝説鳥との違いが小さかった。試作29では `companion_phoenix` と表示名「ほうおう」を維持し、`designVersion: 2` とした。

新しいstage 1は金、淡い金、黄色、白金を主体とし、王冠状の冠羽、太陽光のような左右の翼、雫形の宝石を持つ扇状尾羽で構成する。赤・橙は小さな宝石とくちばしの差し色に限定した。炎鳥の花びら状の炎、火の粉、尾羽構造は流用していない。

stage 2は翼の金色模様、胸の太陽、冠羽、尾羽宝石を追加する。stage 3は金・白金の光輪、後光、扇状尾羽の装飾、金色の光粒を重ねる。stage 1本体を別speciesへ置き換えない。

## 既存companionデータ互換

companionId、speciesId、nickname、favorite、bondLevel、hatchCount、mealCount、lastFedAt、lastSeenEvolutionStage、plannedSpeciesIdを変更しない。ほうおう以外14種の本体定義は、比較時に新しい`rarity`メタデータを除外したJSON SHA-256が試作28の値と一致する。

## おとなモード

既存の長押しと確認ダイアログを通過した時だけ、メモリ上の親セッションを認証する。`parent`と`data`の直接ルートでは、認証済みでない限り編集UIをDOMへ描画しない。親画面を離れると認証を解除し、再読み込み後も従来どおり通常モードから始まる。新しいパスコードは追加していない。

## スター中央処理

既存の `KA.stars.addLedgerEntry()` が、使える星、累計星、スター台帳、たまご同期を一括更新する中央処理である。`grantSpecialRewardStars()` は検証後にこの中央処理へ `earn_special_reward` として接続する。別残高や別通貨、表示専用残高は作成しない。

## 入力値検証と確認

スター数は全角数字を半角へ正規化し、数字だけの正の整数を受け付ける。空欄、0、負数、小数、指数表記、safe integer超過、加算後のオーバーフローは拒否する。ひとことは任意、最大30文字で、制御文字と改行を空白へ正規化し、画面ではHTMLエスケープする。

加算前に専用ダイアログで現在値、追加値、追加後、ひとことを表示する。戻る操作では残高、台帳、履歴、通知を変更しない。

## 二重実行防止

実行開始時に `specialRewardInProgress` を立て、実行ボタンをdisabledにする。同じクリック、ダブルタップ、Enter連打では中央加算、台帳、ご褒美履歴を各1回だけ作る。

## ご褒美履歴と未読通知

schemaVersionを変えず、appDataの任意フィールド `specialRewards` を追加した。各レコードは一意ID、type、amount、note、createdAt、ledgerId、seenAtを持つ。おとなモードは最新5件だけを表示し、保存データ自体は削除しない。

子ども側ホームでは `seenAt` がないレコードを古い順に1件ずつ表示する。閉じた時だけ既読を保存し、通知失敗や再読み込みでスターを再加算しない。複数未読も合算せず個別表示し、同時に複数モーダルを重ねない。

## JSON・ensureDataShape

既存JSONエクスポートはappData全体を保存するため `specialRewards` も含まれる。試作28以前は空配列で補完する。不正型、重複ID、非整数・非正数のamountは除外し、note、createdAt、ledgerId、seenAtを安全に正規化する。`ensureDataShape()`を繰り返しても履歴や残高は増えない。

## Accessibility

- 入力へlabelと `inputmode="numeric"` を設定
- エラーと成功をaria-liveで通知
- 確認・受取ダイアログはrole、aria-modal、Escape、フォーカス復帰、Tab循環へ対応
- 実行中disabledと処理中文言を表示
- 伝説は色だけでなく文字バッジとaria-labelで通知
- 主要ボタン48px以上、390pxで折り返し、safe-areaと下部ナビ余白を維持

## 自動検証

- smoke tests
- 全本番JavaScript構文評価
- `tests/browser-qa-p29.cjs` による390×844 Edgeタッチ・standalone相当
- 伝説4種、通常ケツァール、ほうおうstage 1〜3、80px比較
- 親認証、確認キャンセル、1回加算、二重実行防止、履歴、未読通知、既読後リロード
- 外部URL、外部画像、外部SVG、外部音声、CDN、fetch、type=module不使用

## 手動確認項目

- 実機iPhone Safariとホーム画面standaloneでの長押し入口、確認ダイアログ、キーボード表示
- 15羽取得済みのおうちで伝説バッジと鳥タップ
- 伝説鳥初回孵化とstage 2・3進化
- ほうおうと炎鳥の80px・120px・シルエット比較
- ご褒美未読2件の順次表示とJSON復元後の既読維持

## 確定した検証結果

- `tests/smoke-tests.js`: 合格
- 全本番JavaScriptの `node --check`: 合格
- `tests/browser-qa-p29.cjs`: 390×844 Edgeタッチ・standalone相当、reduced-motionで合格
- 図鑑15種、伝説4種、ケツァール通常分類、ほうおうstage 1〜3、おうち15羽の一意配置を確認
- 250スターから100スターを確認後に付与し、残高350、累計350、中央台帳1件、特別報酬履歴1件を確認
- 確認キャンセル時は残高不変、同一確認ボタンの連続clickでも加算1回、通知既読後の再読み込みで再表示・再加算なしを確認
- `job_cleanup`は同日初回のみ2スターを維持
- 390pxで `scrollWidth === 390`、表示中の主要ボタン最小高さ48px以上、コンソールエラー0件、読込失敗0件
- 実機iPhone Safariはこの環境から操作できないため、Edgeのモバイルタッチ・standalone相当で代替確認
