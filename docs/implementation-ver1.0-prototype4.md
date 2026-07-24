# Ver.1.0 試作4 実装メモ

## 目的

試作4では、iPhone Safariでの親モード長押し改善、音の追加、ぬりえ体験の改善を行った。

## 追加・変更内容

- 親モードボタンの文字選択抑止
- `pointerdown` / `pointerup` / `pointercancel` による長押し判定
- Web Audio APIによるBGM
- Web Audio APIによる効果音
- BGM初期OFF
- 親モードのBGM・効果音設定
- 蝶以外のSVGぬりえ全面リファイン
- 12色クレヨン風パレット

## データ互換

保存キー、`schemaVersion`、`templateId`、`regionColors` の保存方式は変更していない。

旧データに対しては `ensureDataShape()` で次を補完する。

- `settings.effectsEnabled`
- `settings.bgmEnabled`
- `uiState.effectsEnabled`
- `uiState.bgmEnabled`
- 更新後のぬりえ領域定義

旧作品に含まれる一部の旧領域IDは、新SVGの代表領域へフォールバックして表示する。

## 音の扱い

外部音源は使用しない。BGMと効果音はユーザー操作後にWeb Audio APIで生成する。

BGMは親モードでONにした時だけ開始する。ブラウザの自動再生制限により、保存状態がONでも初回操作前には再生されない場合がある。

## 実装しないもの

- 外部音源ファイル
- BGM素材のダウンロード
- 音声読み上げ
- Service Worker
- オンライン同期
