# Ver.1.0 試作5 実装メモ

## ぬりえが更新されなかった原因

試作4の調査で確認した構造は次の通り。

- 組み込みぬりえのメタデータは `localStorage` の `coloringTemplates` に保存される。
- 実際のSVGパスは `js/coloring.js` の `renderTemplate()` 配下の関数で生成される。
- `ensureDataShape()` は既存テンプレートへタイトル、必要スター、領域IDなどを同期していたが、`designVersion`、`svgKey`、`viewBox` のようなデザイン更新を判定する情報を持っていなかった。
- `constants.js` のテンプレート定義より保存済み `coloringTemplates` が参照される画面があり、デザイン更新の意図がデータ上で確認しにくかった。
- 古いSVGパスは `coloring.js` 内に残っており、試作4の変更も旧形状に近いパスが多かったため、実機で見た目の変化を判別しにくかった。
- GitHub Pages側の読み込みクエリは試作4で `?v=10p4` へ更新済みだった。今回の試作5では `?v=10p5` へ更新した。

結論として、主因は「デザイン更新を同期する明確なバージョン情報がないこと」と「SVG自体の描き直しが不十分だったこと」。

## 対応した同期方式

組み込みテンプレートへ次を追加した。

- `designVersion`
- `svgKey`
- `viewBox`
- `regionAliases`

`ensureDataShape()` の `syncBuiltInColoringTemplates()` は、コード内の正式定義を基準に次を同期する。

- 表示名
- 表示順
- 必要スター
- 生き物種別
- viewBox
- svgKey
- designVersion
- 領域ID
- 領域名
- 旧領域ID対応

利用者の進行状況である解放済み状態、作品、親コメント、スター履歴、森の配置は変更しない。

## 各ぬりえの変更内容

- おはな: 6枚の花びら、中心、茎、左右で違う葉を閉じたpathで描画。
- うさぎ: 横向き。長い左右の耳、耳の内側、鼻先、胴体、前脚、大きな後脚、しっぽを追加。
- ねこ: 座り姿。三角耳、耳の内側、胸、前脚、後ろ脚、長いしっぽ、首輪を追加。
- イルカ: 横向きの流線形。伸びた口先、背びれ、胸びれ、尾の付け根、上下の尾びれを分離。
- きょうりゅう: ティラノサウルス風。大きめの頭、あご、首、小さな前脚、太い後脚、長いしっぽを追加。
- うま: 横向きの立ち姿。縦長の顔、左右の耳、首、たてがみ、4本の脚、ひづめ、長いしっぽを追加。

蝶は既存品質を維持した。

## 新旧領域IDの対応

主な対応は次の通り。

- おはな: `petals` -> 各花びら領域
- うさぎ: `ear_left`, `ear_right` -> 外耳・内耳、`cheeks` / `cheek_left` / `cheek_right` -> `cheek`
- ねこ: `ears` -> 左右の耳、`belly` -> `chest`, `paws` -> 前脚・後ろ脚, `stripes` -> `markings`
- イルカ: `body` -> `body_top`, `nose` -> `snout`, `fin_top` -> `dorsal_fin`, `fin_side` -> `pectoral_fin`, `tail` -> 尾の付け根・上下尾びれ
- きょうりゅう: `legs` -> 前脚・後脚, `claws` -> `foot`, `spikes` -> `back_spines`, `spots` -> `body_mark`
- うま: `legs` -> 4本の脚, `head` -> 耳, `muzzle` -> 口もと

変換は既存キーを削除せず、新領域が未設定の場合だけ補完する。何度実行しても変化し続けない。

## UI角丸の変更方針

単一の `--radius` に頼りすぎず、用途別に分けた。

- パネル: `--radius-panel`
- カード: `--radius-card`
- ボタン: `--radius-button`
- 入力欄: `--radius-input`
- モーダル: `--radius-modal`
- 下部ナビ: `--radius-nav`

バッジや親モードの円形ボタンなど、円形が意味を持つ要素だけは丸みを維持した。

## 互換性対応

- 保存キーは変更なし。
- `schemaVersion` は1のまま。
- `templateId` と `regionColors` による作品保存方式を維持。
- 解放済みぬりえは再ロックしない。
- 既存作品、アルバム、森の配置、親コメント、お気に入り状態を維持。
- BGM、効果音、たまごシステム、親モード長押しを維持。

## 検証結果

- JS読み込み順・構文評価: 実施。
- 関数名重複: なし。
- 外部URL、CDN、`fetch()`、`type="module"`: なし。
- 保存キー: 変更なし。
- `ensureDataShape()` 2回実行: 重複なし。
- `designVersion` 同期2回実行: 2回目は変化なし。
- 保存済み旧テンプレート: 新しい `designVersion` と領域定義へ同期。
- 旧regionColors: 新領域へ補完。
- 既存作品: アルバム・森の参照を維持。

## 手動確認項目

- `tests/coloring-preview.html` をブラウザで開き、120pxプレビューで全種類を判別できるか確認する。
- iPhone Safariで親モード長押し時に文字選択が出ないか確認する。
- 390px前後のスマホ幅で横スクロールが出ないか確認する。
- BGMと効果音のON/OFFを実機で確認する。
