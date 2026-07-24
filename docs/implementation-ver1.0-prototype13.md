# Ver.1.0 試作13 実装メモ

## 概要
親モードへ「ぬりえ設定」を追加した。対象は既存10種類のぬりえだけで、ぬりえ原画、作品、世界、たまご、鳥の仲間、起動復旧処理は仕様変更していない。

## coloringSettings構造
保存場所は `appData.coloringSettings`。

```json
{
  "order": ["coloring_butterfly_001"],
  "starCosts": {
    "coloring_butterfly_001": 4
  }
}
```

`order` は正式な `templateId` の配列、`starCosts` は `templateId` ごとの実効必要スター数。

## 標準定義との分離
`KA.constants.COLORING_TEMPLATES` と保存済み `appData.coloringTemplates` は標準定義として維持する。親モードで変更したスター数や順番は、正式テンプレートへ直接書き込まず `coloringSettings` にだけ保存する。

`syncBuiltInColoringTemplates()` は従来どおり標準の `requiredStars` と `sortOrder` を同期する。

## 共通取得関数
`js/coloring.js` に次を追加した。

- `getEffectiveColoringStarCost(templateId)`
- `getOrderedColoringTemplates()`
- `getCurrentColoringSettings()`
- `normalizeColoringSettings(settings)`
- `defaultColoringSettings()`
- `saveColoringSettings(settings)`
- `resetColoringSettings()`

子ども側のぬりえ一覧、解放ボタン、解放時のスター消費、親モード設定一覧は共通関数を参照する。

## 入力検証
親モードの数値入力は保存時に検証する。

- 0〜999
- 整数のみ
- 全角数字は半角へ正規化
- 空欄、小数、負数、1000以上は保存しない
- 不正行へエラーメッセージを表示

## 保存処理
入力や並べ替えのたびには保存しない。「変更を保存」を押した時に全行を検証し、正常な場合だけ `coloringSettings` とlocalStorageへ保存する。

未保存のまま親モードを離れる場合は、保存する、保存しない、戻るを選べる確認ダイアログを表示する。

## 解放済みぬりえの扱い
必要スター数を変更しても、既に解放済みのぬりえは再ロックしない。

- 値上げ: 追加請求なし
- 値下げ: 差額返金なし
- スター履歴: 再計算しない
- 解放履歴: 改変しない

未解放ぬりえは、解放操作時点の実効必要スター数を使用する。0スターの場合は消費0で解放する。

解放履歴には可能な範囲で `paidStars` を保存し、スター台帳にも `paidStars` を記録する。

## 並べ替え処理
親モードの各行にドラッグハンドルを追加した。ハンドルからの `pointerdown`、`pointermove`、`pointerup`、`pointercancel` で並べ替える。

ドラッグ開始は6px以上の移動後。ハンドルだけに `touch-action: none` と文字選択防止を適用し、画面全体のスクロールを常時止めない。

iPhone Safariでドラッグしにくい場合に備え、各行に「上へ」「下へ」ボタンも追加した。先頭の上、末尾の下はdisabledにする。

## 標準設定復元
「標準設定に戻す」は確認後に、スター数と並び順だけを正式定義の標準値へ戻す。作品、スター残高、解放状態、スター履歴、たまご、鳥、世界配置は変更しない。

## データ移行
試作12修正版2以前のデータには `coloringSettings` がないため、`ensureDataShape()` で標準設定を補完する。

不正データ対応:
- `coloringSettings` がnullでも起動
- `order` が配列でなければ標準順
- 重複IDは1件へ整理
- 不正IDは表示対象から除外
- 不足IDは標準順の末尾へ追加
- `starCosts` が不正な型なら標準値
- 負数、小数、999超過は標準値へフォールバック

複数回 `ensureDataShape()` を実行しても、ユーザーが変更した有効な設定は標準値へ戻さない。

## JSON互換
JSONバックアップには `appData.coloringSettings.order` と `appData.coloringSettings.starCosts` が含まれる。試作12修正版2以前のJSONは標準設定を補完し、試作13のJSONは変更済み設定を維持する。

## safeStart対応
safeStartは保存データを上書きしないため、`coloringSettings` が壊れていても通常の起動側 `ensureDataShape()` で正規化する。safeStartの基本ホーム表示、下部ナビ、復旧画面、診断保存は維持した。

## 自動検証結果
- `tests/smoke-tests.js`: 通過
- JS構文評価: 通過
- ぬりえ10種類維持
- 世界6種類維持
- `boot.js` 読み込み順維持
- `renderAlbum()` 維持
- 保存キー未変更
- `schemaVersion: 1` 維持
- 外部URL、fetch、CDN、type=moduleなし

## 手動確認項目
- iPhone Safariで親モードを長押し起動できる
- ぬりえ設定が親モード内だけに表示される
- 数字キーボードで0〜999を入力できる
- プラス・マイナスが反応する
- ドラッグ並べ替えができる
- 上下ボタンで並べ替えできる
- 未保存で離れる時に確認が出る
- 保存後に子ども側ぬりえ一覧へ反映される
- 再読み込み後も設定が残る
- 標準設定へ戻せる
- 解放済みぬりえが再ロックされない
- 390px幅で横スクロールが出ない
- 起動スタート画面、作品画面、たまご画面が従来どおり開ける
