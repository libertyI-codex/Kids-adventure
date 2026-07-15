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

  KA.stars = {
    makeId: makeId,
    totals: totals,
    addLedgerEntry: addLedgerEntry,
    earnTask: earnTask,
    spendForColoring: spendForColoring,
    adjustUndoTask: adjustUndoTask
  };
})(window);
