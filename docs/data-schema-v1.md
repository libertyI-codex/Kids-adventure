# Data Schema v1

## 1. 保存方針

Ver.1.0ではlocalStorageにJSON文字列として保存します。

確定キー:

| キー | 用途 |
|---|---|
| `kodomoAdventure.appData.v1` | アプリデータ本体 |
| `kodomoAdventure.uiState.v1` | UI状態、下書き、一時状態 |
| `kodomoAdventure.backup.v1` | 一時バックアップ |

`deviceId` は個人追跡ではなく、バックアップ元識別、復元時確認、将来の競合判定に備えるためのローカルIDです。外部送信は行いません。

## 2. appData全体構造

JSONに近い構造例:

```json
{
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "createdAt": "2026-07-13T09:00:00+09:00",
  "updatedAt": "2026-07-13T09:30:00+09:00",
  "deviceId": "device_20260713_ab12cd34",
  "profile": {},
  "settings": {},
  "tasks": [],
  "dailyRecords": {},
  "starLedger": [],
  "coloringTemplates": [],
  "artworks": [],
  "worlds": {},
  "unlocks": {},
  "migrations": []
}
```

必須トップレベル:

- `schemaVersion`
- `appVersion`
- `createdAt`
- `updatedAt`
- `deviceId`
- `profile`
- `settings`
- `tasks`
- `dailyRecords`
- `starLedger`
- `coloringTemplates`
- `artworks`
- `worlds`
- `unlocks`
- `migrations`

## 3. ID形式

IDは英数字、アンダースコア、ハイフンで構成します。表示名を変更しても記録が壊れないよう、保存データは表示名ではなくIDで関連付けます。

例:

| 種類 | 形式 | 例 |
|---|---|---|
| profile | `profile_*` | `profile_yuwa` |
| task | `task_*` | `task_brush_teeth` |
| coloring | `coloring_*_001` | `coloring_butterfly_001` |
| artwork | `artwork_YYYYMMDD_*` | `artwork_20260713_butterfly_ab12` |
| world | `world_*` | `world_forest` |
| ledger | `ledger_YYYYMMDD_*` | `ledger_20260713_001` |
| placement | `placement_*` | `placement_artwork_20260713_ab12` |

## 4. profile

Ver.1.0では単一プロフィールですが、すべての記録に `profileId` を持たせます。

```json
{
  "profileId": "profile_yuwa",
  "displayName": "結羽ちゃん",
  "createdAt": "2026-07-13T09:00:00+09:00",
  "birthday": null,
  "ageLabel": "4-8",
  "avatar": "avatar_default_star",
  "favoriteColor": "pink",
  "activeWorldId": "world_forest",
  "starTotals": {
    "lifetimeStars": 0,
    "spendableStars": 0
  }
}
```

将来の複数プロフィール対応では、`profile` を `profiles` 配列へ移行し、`activeProfileId` を追加します。Ver.1.0の各記録にはすでに `profileId` があるため、移行しやすい構造です。

## 5. settings

```json
{
  "soundEnabled": true,
  "animationLevel": "normal",
  "textSize": "normal",
  "parentGate": {
    "mode": "hold_confirm",
    "holdMs": 2000,
    "pinEnabled": false,
    "pinHash": null,
    "pinSalt": null
  },
  "dataSafety": {
    "autoBackupBeforeMigration": true,
    "warnStorageUsageRatio": 0.8
  }
}
```

Ver.1.0ではBGMは実装しません。`soundEnabled` は短い効果音を将来追加するための予約を兼ねます。

## 6. tasks

初期値:

```json
[
  {
    "taskId": "task_brush_teeth",
    "profileId": "profile_yuwa",
    "title": "はみがき",
    "icon": "tooth",
    "category": "morning",
    "rewardStars": 1,
    "active": true,
    "sortOrder": 10,
    "availableDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "timeOfDay": "morning",
    "createdAt": "2026-07-13T09:00:00+09:00",
    "updatedAt": "2026-07-13T09:00:00+09:00"
  },
  {
    "taskId": "task_get_dressed",
    "profileId": "profile_yuwa",
    "title": "おきがえ",
    "icon": "shirt",
    "category": "morning",
    "rewardStars": 1,
    "active": true,
    "sortOrder": 20,
    "availableDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "timeOfDay": "morning",
    "createdAt": "2026-07-13T09:00:00+09:00",
    "updatedAt": "2026-07-13T09:00:00+09:00"
  },
  {
    "taskId": "task_picture_book",
    "profileId": "profile_yuwa",
    "title": "えほん",
    "icon": "book",
    "category": "learning",
    "rewardStars": 1,
    "active": true,
    "sortOrder": 30,
    "availableDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "timeOfDay": "any",
    "createdAt": "2026-07-13T09:00:00+09:00",
    "updatedAt": "2026-07-13T09:00:00+09:00"
  },
  {
    "taskId": "task_watering",
    "profileId": "profile_yuwa",
    "title": "おみずあげ",
    "icon": "watering",
    "category": "help",
    "rewardStars": 1,
    "active": true,
    "sortOrder": 40,
    "availableDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "timeOfDay": "any",
    "createdAt": "2026-07-13T09:00:00+09:00",
    "updatedAt": "2026-07-13T09:00:00+09:00"
  }
]
```

おしごとを削除したくなった場合も、原則として `active: false` にします。過去記録との関連を壊さないためです。

## 7. dailyRecords

日付キーは端末ローカル日付の `YYYY-MM-DD` です。

```json
{
  "2026-07-13": {
    "recordId": "daily_2026-07-13_profile_yuwa",
    "profileId": "profile_yuwa",
    "localDate": "2026-07-13",
    "createdAt": "2026-07-13T06:30:00+09:00",
    "updatedAt": "2026-07-13T08:10:00+09:00",
    "completedTasks": [
      {
        "taskId": "task_brush_teeth",
        "completedAt": "2026-07-13T07:05:00+09:00",
        "rewardStars": 1,
        "ledgerId": "ledger_20260713_001",
        "status": "completed"
      }
    ],
    "earnedStarsToday": 1,
    "artworkIds": ["artwork_20260713_butterfly_ab12"],
    "forestPlacementIds": ["placement_artwork_20260713_butterfly_ab12"],
    "parentNotes": {
      "artwork_20260713_butterfly_ab12": "紫のちょうちょ、きれいだね"
    },
    "corrections": []
  }
}
```

完了訂正例:

```json
{
  "taskId": "task_brush_teeth",
  "correctedAt": "2026-07-13T20:00:00+09:00",
  "action": "undo_completion",
  "reason": "誤操作",
  "ledgerId": "ledger_20260713_undo_001"
}
```

## 8. starLedger

スター残高だけでなく、増減履歴を保存します。

イベント種別:

| type | lifetimeDelta | spendableDelta | 用途 |
|---|---:|---:|---|
| `earn_task` | + | + | おしごと完了 |
| `spend_unlock_coloring` | 0 | - | ぬりえ解放 |
| `adjust_task_undo` | - | 0または- | 親による完了取り消し |
| `adjust_manual` | 任意 | 任意 | 将来の手動調整 |

例:

```json
[
  {
    "ledgerId": "ledger_20260713_001",
    "profileId": "profile_yuwa",
    "createdAt": "2026-07-13T07:05:00+09:00",
    "localDate": "2026-07-13",
    "type": "earn_task",
    "sourceType": "task",
    "sourceId": "task_brush_teeth",
    "lifetimeDelta": 1,
    "spendableDelta": 1,
    "balanceAfter": {
      "lifetimeStars": 1,
      "spendableStars": 1
    },
    "note": "はみがき"
  },
  {
    "ledgerId": "ledger_20260713_002",
    "profileId": "profile_yuwa",
    "createdAt": "2026-07-13T07:20:00+09:00",
    "localDate": "2026-07-13",
    "type": "spend_unlock_coloring",
    "sourceType": "coloringTemplate",
    "sourceId": "coloring_butterfly_001",
    "lifetimeDelta": 0,
    "spendableDelta": -1,
    "balanceAfter": {
      "lifetimeStars": 1,
      "spendableStars": 0
    },
    "note": "ちょうちょをひらいた"
  }
]
```

## 9. coloringTemplates

初期値:

```json
[
  {
    "templateId": "coloring_butterfly_001",
    "title": "ちょうちょ",
    "kind": "creature",
    "svgAssetId": "svg_coloring_butterfly_001",
    "requiredStars": 1,
    "sortOrder": 10,
    "active": true,
    "regionIds": ["left_wing", "right_wing", "body", "spots"],
    "defaultUnlocked": false,
    "worldObjectType": "butterfly"
  },
  {
    "templateId": "coloring_flower_001",
    "title": "おはな",
    "kind": "plant",
    "svgAssetId": "svg_coloring_flower_001",
    "requiredStars": 2,
    "sortOrder": 20,
    "active": true,
    "regionIds": ["petal_1", "petal_2", "center", "leaf"],
    "defaultUnlocked": false,
    "worldObjectType": "flower"
  },
  {
    "templateId": "coloring_rabbit_001",
    "title": "うさぎ",
    "kind": "creature",
    "svgAssetId": "svg_coloring_rabbit_001",
    "requiredStars": 3,
    "sortOrder": 30,
    "active": true,
    "regionIds": ["body", "ear_left", "ear_right", "cheek"],
    "defaultUnlocked": false,
    "worldObjectType": "rabbit"
  },
  {
    "templateId": "coloring_cat_001",
    "title": "ねこ",
    "kind": "creature",
    "svgAssetId": "svg_coloring_cat_001",
    "requiredStars": 4,
    "sortOrder": 40,
    "active": true,
    "regionIds": ["body", "tail", "ear_left", "ear_right", "collar"],
    "defaultUnlocked": false,
    "worldObjectType": "cat"
  }
]
```

## 10. artworks

作品はSVGテンプレートIDと領域別カラーを中心に保存します。大量のBase64画像は保存しません。

```json
[
  {
    "artworkId": "artwork_20260713_butterfly_ab12",
    "profileId": "profile_yuwa",
    "templateId": "coloring_butterfly_001",
    "title": "ちょうちょ",
    "createdAt": "2026-07-13T07:30:00+09:00",
    "completedAt": "2026-07-13T07:35:00+09:00",
    "localDate": "2026-07-13",
    "status": "completed",
    "regionColors": {
      "left_wing": "#8B5CF6",
      "right_wing": "#F472B6",
      "body": "#7C2D12",
      "spots": "#FACC15"
    },
    "usedColors": ["#8B5CF6", "#F472B6", "#7C2D12", "#FACC15"],
    "analysis": {
      "dominantColor": "#8B5CF6",
      "dominantColorFamily": "purple",
      "brightness": "bright",
      "coloredRegionCount": 4,
      "totalRegionCount": 4,
      "completionRatio": 1
    },
    "magicResult": {
      "outlineStyle": "soft_bold",
      "shineLevel": 2,
      "seed": "artwork_20260713_butterfly_ab12"
    },
    "parentNote": "紫のちょうちょ、きれいだね",
    "favorite": false,
    "placementId": "placement_artwork_20260713_butterfly_ab12"
  }
]
```

下書きは `uiState.v1` に保存し、完成後に `artworks` へ移します。

## 11. worlds

Ver.1.0では `world_forest` のみです。

```json
{
  "world_forest": {
    "worldId": "world_forest",
    "title": "思い出の森",
    "active": true,
    "level": 1,
    "createdAt": "2026-07-13T09:00:00+09:00",
    "updatedAt": "2026-07-13T09:30:00+09:00",
    "stats": {
      "totalArtworks": 1,
      "totalCompletedDays": 1,
      "totalLifetimeStarsAtLastUpdate": 1
    },
    "placements": [
      {
        "placementId": "placement_artwork_20260713_butterfly_ab12",
        "artworkId": "artwork_20260713_butterfly_ab12",
        "profileId": "profile_yuwa",
        "objectType": "butterfly",
        "layer": "creatures",
        "zone": "flower_side",
        "x": 62,
        "y": 38,
        "scale": 1.08,
        "animation": "flutter",
        "seed": "artwork_20260713_butterfly_ab12",
        "createdAt": "2026-07-13T07:35:00+09:00"
      }
    ]
  }
}
```

座標は森SVGの viewBox に対する0〜100の相対値を基本にします。画面サイズが変わっても配置が崩れにくくなります。

## 12. unlocks

```json
{
  "profileId": "profile_yuwa",
  "coloringTemplateIds": [
    {
      "templateId": "coloring_butterfly_001",
      "unlockedAt": "2026-07-13T07:20:00+09:00",
      "ledgerId": "ledger_20260713_002"
    }
  ],
  "worldIds": ["world_forest"],
  "featureIds": []
}
```

解放済みかどうかは、`templateId` の存在で判定します。同じIDを重複追加しません。

## 13. uiState

保存キー: `kodomoAdventure.uiState.v1`

```json
{
  "schemaVersion": 1,
  "lastOpenedAt": "2026-07-13T09:30:00+09:00",
  "lastRoute": "home",
  "currentLocalDate": "2026-07-13",
  "activeProfileId": "profile_yuwa",
  "coloringDrafts": {
    "coloring_butterfly_001": {
      "templateId": "coloring_butterfly_001",
      "regionColors": {
        "left_wing": "#8B5CF6"
      },
      "updatedAt": "2026-07-13T07:25:00+09:00"
    }
  },
  "dismissedMessages": []
}
```

## 14. backup

保存キー: `kodomoAdventure.backup.v1`

用途:

- マイグレーション前の一時退避
- インポート前の一時退避
- 初期化前の退避

```json
{
  "createdAt": "2026-07-13T09:40:00+09:00",
  "reason": "before_migration",
  "appData": {},
  "uiState": {}
}
```

## 15. ensureDataShape方針

起動時に `ensureDataShape()` 相当の補完を行います。

処理方針:

- 欠けているトップレベルキーを追加する
- 初期おしごとは `taskId` で存在確認して追加する
- 初期ぬりえは `templateId` で存在確認して追加する
- `profile.starTotals` がない場合は `starLedger` から再計算する
- `dailyRecords` がない場合は空オブジェクトにする
- `world_forest` がない場合は追加する
- 既存のユーザー変更を上書きしない
- 同じ処理を何度実行しても重複しない

疑似コード:

```text
load appData
if appData is missing: create default appData
if schemaVersion is old: migrate step by step
ensure required keys
ensure default tasks by ID
ensure default coloring templates by ID
ensure world_forest
ensure unlocks
recalculate or validate star totals
save if changed
```

## 16. マイグレーション方針

将来のschemaVersion更新に備え、次の方針にします。

1. 現在のデータを `kodomoAdventure.backup.v1` に保存
2. `schemaVersion` を確認
3. 1段階ずつ変換
4. 変換後に `ensureDataShape()` を実行
5. 失敗した場合は元データを残し、復元案内を表示

例:

```text
1 -> 2
2 -> 3
3 -> 4
```

飛び級変換はしません。

## 17. JSONエクスポート

エクスポート対象:

- appData
- uiState
- exportedAt
- exportAppVersion
- exportSchemaVersion

形式例:

```json
{
  "exportType": "kodomoAdventureBackup",
  "exportedAt": "2026-07-13T10:00:00+09:00",
  "exportAppVersion": "1.0.0",
  "exportSchemaVersion": 1,
  "appData": {},
  "uiState": {}
}
```

## 18. JSONインポート

インポート前確認:

- JSONとして読めるか
- `exportType` が正しいか
- `appData.schemaVersion` が対応範囲か
- 必須キーが存在するか
- `profile` が存在するか
- `starLedger` が配列か
- `artworks` が配列か
- `worlds` がオブジェクトか

不正データの場合:

- 保存しない
- 現在データを変更しない
- 親にエラーを表示する

インポート成功時:

- 現在データを `backup.v1` に退避
- インポートデータを保存
- `ensureDataShape()` を実行
- ホームへ戻る

## 19. localStorage容量対策

方針:

- Base64画像を大量保存しない
- 作品はSVGテンプレートIDと領域カラーで保存する
- 作品サムネイルは原則保存しない
- 保存前後にJSONサイズを概算する
- 容量が増えた場合は親モードで警告する

警告目安:

- 3MB超: 注意表示
- 4MB超: バックアップ推奨
- 保存失敗: 不要な下書き削除やJSONエクスポートを案内

## 20. データ破損時の安全な初期化

破損時の流れ:

1. JSON parse失敗を検出
2. `backup.v1` があれば復元候補として表示
3. 復元できない場合は初期化候補を表示
4. 初期化前に破損文字列を可能な範囲で退避する
5. 複数段階確認後に初期化する

自動で即初期化しません。

