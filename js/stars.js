(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function makeId(type) {
    return type + "_" + KA.date.compactDateKey() + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  }

  function totals() {
    return KA.state.getAppData().profile.starTotals;
  }

  function addLedgerEntry(options) {
    var data = KA.state.getAppData();
    var profile = data.profile;
    var total = totals();
    var totalDelta = Number(options.totalDelta || 0);
    var spendableDelta = Number(options.spendableDelta || 0);
    var eggsBefore = Array.isArray(data.eggInventory) ? data.eggInventory.length : 0;
    total.lifetimeStars = Math.max(0, Number(total.lifetimeStars || 0) + totalDelta);
    total.spendableStars = Math.max(0, Number(total.spendableStars || 0) + spendableDelta);
    if (KA.eggs && KA.eggs.syncEggInventory) {
      KA.eggs.syncEggInventory(data);
    }
    var eggsAfter = Array.isArray(data.eggInventory) ? data.eggInventory.length : eggsBefore;
    var entry = {
      id: makeId("ledger"),
      profileId: profile.profileId,
      createdAt: KA.date.localIsoString(),
      dateKey: KA.state.getTodayKey(),
      type: options.type,
      reason: options.reason || "",
      relatedTaskId: options.relatedTaskId || null,
      relatedColoringId: options.relatedColoringId || null,
      paidStars: typeof options.paidStars === "undefined" ? null : Number(options.paidStars || 0),
      totalDelta: totalDelta,
      spendableDelta: spendableDelta,
      totalAfter: total.lifetimeStars,
      spendableAfter: total.spendableStars,
      eggsEarned: Math.max(0, eggsAfter - eggsBefore)
    };
    data.starLedger.push(entry);
    return entry;
  }

  function earnTask(task) {
    return addLedgerEntry({
      type: "earn_task",
      reason: task.title + " ができた",
      relatedTaskId: task.taskId,
      totalDelta: Number(task.rewardStars || 0),
      spendableDelta: Number(task.rewardStars || 0)
    });
  }

  function spendForColoring(template, effectiveCost) {
    var required = typeof effectiveCost === "undefined" ? Number(template.requiredStars || 0) : Number(effectiveCost || 0);
    required = Math.max(0, required);
    var current = totals().spendableStars;
    if (current < required) {
      return { ok: false, reason: "not_enough_stars" };
    }
    var entry = addLedgerEntry({
      type: "spend_unlock_coloring",
      reason: template.title + " をかいほう",
      relatedColoringId: template.templateId,
      paidStars: required,
      totalDelta: 0,
      spendableDelta: -required
    });
    return { ok: true, entry: entry };
  }

  function adjustUndoTask(task, note) {
    var reward = Number(task.rewardStars || 0);
    var spendableBefore = totals().spendableStars;
    var safeSpendableDelta = -Math.min(spendableBefore, reward);
    var reason = note || (task.title + " の完了を訂正");
    if (Math.abs(safeSpendableDelta) < reward) {
      reason += "。つかえるほしが使われていたため、残高は0未満にしません。";
    }
    return addLedgerEntry({
      type: "adjust_task_undo",
      reason: reason,
      relatedTaskId: task.taskId,
      totalDelta: -reward,
      spendableDelta: safeSpendableDelta
    });
  }

  function toHalfWidthDigits(value) {
    return String(value == null ? "" : value).replace(/[０-９]/g, function (char) {
      return String.fromCharCode(char.charCodeAt(0) - 65248);
    });
  }

  function normalizeSpecialRewardNote(value) {
    var cleaned;
    if (typeof value !== "string") return "";
    cleaned = value
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return Array.from ? Array.from(cleaned).slice(0, 30).join("") : cleaned.slice(0, 30);
  }

  function validateSpecialRewardAmount(value) {
    var raw = toHalfWidthDigits(value).trim();
    var amount;
    var current = Number(totals().spendableStars || 0);
    var lifetime = Number(totals().lifetimeStars || 0);
    if (!raw) return { ok: false, reason: "required", message: "スターのかずを いれてください" };
    if (!/^\d+$/.test(raw)) return { ok: false, reason: "integer", message: "せいすうで いれてください" };
    amount = Number(raw);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      return { ok: false, reason: amount < 1 ? "minimum" : "too_large", message: amount < 1 ? "1いじょうの かずを いれてください" : "おおきすぎる かずです" };
    }
    if (!Number.isSafeInteger(current) || !Number.isSafeInteger(lifetime) ||
        !Number.isSafeInteger(current + amount) || !Number.isSafeInteger(lifetime + amount)) {
      return { ok: false, reason: "overflow", message: "おおきすぎる かずです" };
    }
    return {
      ok: true,
      amount: amount,
      current: current,
      lifetime: lifetime,
      after: current + amount,
      lifetimeAfter: lifetime + amount
    };
  }

  function grantSpecialRewardStars(value, note) {
    var validation;
    var data;
    var ledger;
    var reward;
    if (!KA.parentMode || !KA.parentMode.isAuthorized || !KA.parentMode.isAuthorized()) {
      return { ok: false, reason: "unauthorized", message: "おとなモードで つかってください" };
    }
    validation = validateSpecialRewardAmount(value);
    if (!validation.ok) return validation;
    data = KA.state.getAppData();
    data.specialRewards = Array.isArray(data.specialRewards) ? data.specialRewards : [];
    ledger = addLedgerEntry({
      type: "earn_special_reward",
      reason: normalizeSpecialRewardNote(note) || "とくべつな ごほうび",
      totalDelta: validation.amount,
      spendableDelta: validation.amount
    });
    reward = {
      id: makeId("special_reward"),
      type: "special_reward",
      amount: validation.amount,
      note: normalizeSpecialRewardNote(note),
      createdAt: KA.date.localIsoString(),
      ledgerId: ledger.id,
      seenAt: null
    };
    data.specialRewards.push(reward);
    KA.state.saveAppData();
    return { ok: true, reward: reward, ledger: ledger, before: validation.current, after: validation.after };
  }

  function specialRewards() {
    var data = KA.state.getAppData();
    data.specialRewards = Array.isArray(data.specialRewards) ? data.specialRewards : [];
    return data.specialRewards;
  }

  function pendingSpecialRewards() {
    return specialRewards().filter(function (reward) {
      return reward && reward.type === "special_reward" && !reward.seenAt;
    }).sort(function (a, b) {
      return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    });
  }

  function recentSpecialRewards(limit) {
    return specialRewards().slice().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    }).slice(0, Math.max(1, Number(limit || 5)));
  }

  function markSpecialRewardSeen(rewardId) {
    var reward = specialRewards().filter(function (item) { return item && item.id === rewardId; })[0];
    if (!reward) return false;
    if (!reward.seenAt) {
      reward.seenAt = KA.date.localIsoString();
      KA.state.saveAppData();
    }
    return true;
  }

  KA.stars = {
    makeId: makeId,
    totals: totals,
    addLedgerEntry: addLedgerEntry,
    earnTask: earnTask,
    spendForColoring: spendForColoring,
    adjustUndoTask: adjustUndoTask,
    normalizeSpecialRewardNote: normalizeSpecialRewardNote,
    validateSpecialRewardAmount: validateSpecialRewardAmount,
    grantSpecialRewardStars: grantSpecialRewardStars,
    pendingSpecialRewards: pendingSpecialRewards,
    recentSpecialRewards: recentSpecialRewards,
    markSpecialRewardSeen: markSpecialRewardSeen
  };
})(window);
