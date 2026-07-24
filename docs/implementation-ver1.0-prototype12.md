# Ver.1.0 試作12 実装メモ

## 目的
既存のたまご付与を、毎日育てて鳥の仲間が生まれる孵化システムへ拡張した。あわせて、採用済み `apple-touch-icon.png` を使用した起動時スタート画面を追加した。

## 既存たまご機能
累計スター10個ごとにたまごを1個付与する仕様は維持した。スターは消費せず、累計スターが後で減っても既存たまごは削除しない。同じ `earnedByStars` のたまごは重複付与しない。

既存の `state: "new"` は、新状態へ移行する。最も古い未孵化たまご1個だけを育成中にし、残りは順番待ちにする。

## eggInventory構造
各たまごへ不足項目だけを追加する。

```js
{
  id: "egg_stars_10",
  createdAt: "...",
  earnedByStars: 10,
  state: "active",
  growthPoints: 0,
  targetGrowthPoints: 6,
  activatedAt: "...",
  readyAt: null,
  hatchedAt: null,
  plannedSpeciesId: null,
  companionId: null
}
```

`growthPoints` は0から6にクランプする。`hatched` は再計算で未孵化へ戻さない。

## eggSystem
`appData.eggSystem` を追加した。

```js
eggSystem: {
  activeEggId: null,
  dailyActivity: {}
}
```

`dailyActivity` は端末のローカル日付 `YYYY-MM-DD` をキーにする。

```js
{
  "2026-07-15": {
    petted: true,
    jobBonus: true,
    coloringBonus: false
  }
}
```

同じ日に1個目が孵化して次のたまごがactiveになっても、その日の使用済み条件は再利用しない。

## 成長ポイント
1日最大3ポイント。

- `petted`: たまごをなでる
- `jobBonus`: 有効なおしごと3個達成。有効なおしごとが3個未満なら全達成
- `coloringBonus`: ぬりえ作品を1枚完成

各項目は1日1回だけ。active、warm、glowing、cracked状態のたまごだけが成長する。waiting、ready、hatchedには加算しない。activeたまごがない場合も、その日の条件は繰り越さない。

## 状態遷移
`growthPoints` から状態を再計算する。

- 0: active
- 1〜2: warm
- 3〜4: glowing
- 5: cracked
- 6: ready

`ready` では自動孵化しない。「うまれる！」ボタンを押したときだけ孵化する。

## 孵化処理
孵化時に以下を保存する。

- `state: "hatched"`
- `hatchedAt`
- `plannedSpeciesId`
- `companionId`
- `growthPoints: 6`

孵化後は最も古いwaitingたまごをactiveにする。waitingがなければ `activeEggId` をnullにする。`dailyActivity` はリセットしない。

## 鳥6種類のspecies定義
`js/companions.js` に正式定義をまとめた。

| 表示名 | speciesId | designVersion | 判別要素 |
| --- | --- | ---: | --- |
| ひよこ | `companion_chick` | 1 | 小さい体、短い毛、小さなくちばし |
| あひる | `companion_duck` | 1 | 横長の平たいくちばし、水鳥らしい体 |
| オウム | `companion_parrot` | 1 | 曲がったくちばし、長い尾、鮮やかな翼 |
| くじゃく | `companion_peacock` | 1 | 扇状の尾羽、目玉模様、細い首 |
| ふくろう | `companion_owl` | 1 | 顔盤、前向きの目、丸みのある体 |
| すずめ | `companion_sparrow` | 1 | 茶色の羽模様、短い円すい形のくちばし |

正式候補はこの6種類のみ。ぬりえ動物と花は仲間候補へ含めない。

## 鳥SVG構造
鳥SVGは手書きインラインSVGで、外部画像や外部SVGを参照しない。

```text
companion-svg
├─ body-regions
├─ outer-outline
├─ inner-lines
└─ face-details
```

ぬりえではないためタップ用の `regionColors` は持たない。SVGは `pointer-events` を持たず、保存データを変更しない。

## plannedSpeciesId決定
readyになった時点で `plannedSpeciesId` を1回だけ保存する。未取得の鳥を優先し、`egg.id` 由来の固定seedで選ぶ。6種類すべて取得済みの場合は全6種類から固定seedで選ぶ。再読み込みしても同じたまごの予定種は変わらない。

## companions構造
`appData.companions` を追加した。

```js
{
  id: "companion_chick",
  speciesId: "companion_chick",
  firstHatchedAt: "...",
  lastHatchedAt: "...",
  hatchCount: 1,
  bondLevel: 1,
  isFavorite: false
}
```

同じ鳥が再孵化した場合はカードを増やさず、`hatchCount` と `bondLevel` を1ずつ増やす。

## なかまずかんとお気に入り
たまご画面に「たまご」「なかまずかん」の切替を追加した。未取得はシルエット、取得済みは鳥の姿と日付、孵化回数、なかよしレベルを表示する。

お気に入りは正式鳥のうち最大1種類。解除して0件にできる。お気に入りがある場合だけ、ホームへ「いっしょに ぼうけん」カードを表示する。

## preferredWorldIds
将来の世界配置に備え、各speciesへ相性のよい世界IDを持たせた。試作12では鳥の自由配置は実装していないため、既存作品の `worldId` や配置座標には影響しない。

## 既存データ移行
試作11以前のデータでは次を補完する。

- `eggSystem`
- `dailyActivity`
- `growthPoints`
- `targetGrowthPoints: 6`
- `plannedSpeciesId`
- `companionId`
- `companions: []`

`ensureDataShape()` を複数回実行しても、activeたまごの重複、growthPointsのリセット、hatchedの復活、companionsの重複、hatchCountやbondLevelの勝手な増加は起こさない。

## 不正speciesId対策
正式鳥speciesId以外が存在する場合の扱い。

- ready未満の不正 `plannedSpeciesId`: nullへ戻す
- ready状態の不正 `plannedSpeciesId`: egg.id固定seedで正式鳥へ再決定
- hatched状態や既存companionの不正speciesId: 勝手に別鳥へ書き換えず安全に保持

通常の試作11データでは実質変更は発生しない。

## JSON互換
JSONバックアップには `eggInventory`、`eggSystem`、`dailyActivity`、`plannedSpeciesId`、`companionId`、`companions`、`hatchCount`、`bondLevel`、`isFavorite` が含まれる。試作11以前のJSONを復元した場合も新構造へ補完する。

## スタート画面
`index.html` のbody先頭にスタート画面DOMを追加した。

```html
<img class="startup-icon" src="./apple-touch-icon.png?v=10p12" alt="結羽のぼうけん">
```

headには画像preloadとapple-touch-icon指定を1件ずつ置く。

```html
<link rel="preload" as="image" href="./apple-touch-icon.png?v=10p12">
<link rel="apple-touch-icon" href="./apple-touch-icon.png?v=10p12">
```

最低表示時間は1.2秒、フェイルセーフは4秒。初期化完了後にフェードアウトしてDOMから除去する。`prefers-reduced-motion` では大きな動きを抑える。

`apple-touch-icon.png` は既存ファイルを再利用し、画像処理や加工は行っていない。

## 自動検証結果
`tests/smoke-tests.js` に以下を追加した。

- state:new移行
- activeたまご最大1個
- 1日1回のなでる、おしごと、ぬりえボーナス
- 1日最大3ポイント
- readyで自動孵化しない
- 孵化後のhatched化と次たまごactive化
- 鳥6種類だけが正式speciesであること
- plannedSpeciesId固定
- 重複孵化でhatchCountとbondLevelが増えること
- お気に入り最大1種類
- スタート画面DOMと `?v=10p12`
- 保存キーとschemaVersion未変更
- 外部URL、外部画像、外部SVG、fetch、CDN、type=moduleなし

## 手動確認項目
- iPhoneで起動時に採用アイコンが切れずに表示される
- スタート画面が初期化後に閉じ、アプリ内遷移では再表示されない
- たまごをなでる操作が1日1回だけ加算される
- おしごととぬりえ完成で成長する
- 成長段階ごとに見た目が変わる
- 6ポイントで「うまれる！」が表示され、自動孵化しない
- 孵化演出が2〜3秒程度で自然に見える
- ひよこ、あひる、オウム、くじゃく、ふくろう、すずめが80pxでも判別できる
- なかまずかんの未取得、取得済み、重複孵化、お気に入りが崩れない
- 390px幅で横スクロールやカード重なりが出ない
