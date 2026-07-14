(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function allTasks() {
    return KA.state.getAppData().tasks.slice().sort(function (a, b) {
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
  }

  function activeTasks() {
    return allTasks().filter(function (task) {
      return task.active !== false;
    });
  }

  function isCompleted(taskId, dateKey) {
    var record = KA.state.getDailyRecord(dateKey);
    return record.completedTasks.some(function (item) {
      return item.taskId === taskId && item.status === "completed";
    });
  }

  function completedToday() {
    var record = KA.state.getDailyRecord();
    return record.completedTasks.filter(function (item) {
      return item.status === "completed";
    });
  }

  function completeTask(taskId) {
    var task = allTasks().filter(function (item) { return item.taskId === taskId; })[0];
    if (!task || task.active === false) return { ok: false, reason: "task_not_available" };
    if (isCompleted(taskId)) return { ok: false, reason: "already_completed" };

    var ledger = KA.stars.earnTask(task);
    var record = KA.state.getDailyRecord();
    record.completedTasks.push({
      taskId: task.taskId,
      completedAt: KA.date.localIsoString(),
      rewardStars: Number(task.rewardStars || 0),
      ledgerId: ledger.id,
      status: "completed"
    });
    record.earnedStarsToday = Number(record.earnedStarsToday || 0) + Number(task.rewardStars || 0);
    record.updatedAt = KA.date.localIsoString();
    var eggGrowth = KA.eggs && KA.eggs.recordTaskBonusIfEligible ? KA.eggs.recordTaskBonusIfEligible() : null;
    KA.state.saveAppData();
    return { ok: true, task: task, ledger: ledger, eggGrowth: eggGrowth };
  }

  function undoTask(taskId) {
    var data = KA.state.getAppData();
    var task = allTasks().filter(function (item) { return item.taskId === taskId; })[0];
    var record = KA.state.getDailyRecord();
    var completion = record.completedTasks.filter(function (item) {
      return item.taskId === taskId && item.status === "completed";
    })[0];
    if (!task || !completion) return { ok: false, reason: "not_completed" };
    completion.status = "undone";
    completion.undoneAt = KA.date.localIsoString();
    var ledger = KA.stars.adjustUndoTask(task);
    record.earnedStarsToday = Math.max(0, Number(record.earnedStarsToday || 0) - Number(completion.rewardStars || task.rewardStars || 0));
    record.corrections = record.corrections || [];
    record.corrections.push({
      taskId: taskId,
      correctedAt: KA.date.localIsoString(),
      action: "undo_completion",
      reason: "親モードで訂正",
      ledgerId: ledger.id
    });
    record.updatedAt = KA.date.localIsoString();
    data.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return { ok: true, task: task, ledger: ledger };
  }

  function updateTask(taskId, updates) {
    var task = allTasks().filter(function (item) { return item.taskId === taskId; })[0];
    if (!task) return false;
    if (typeof updates.active !== "undefined") task.active = Boolean(updates.active);
    if (typeof updates.rewardStars !== "undefined") {
      task.rewardStars = Math.max(0, Number(updates.rewardStars || 0));
    }
    task.updatedAt = KA.date.localIsoString();
    KA.state.saveAppData();
    return true;
  }

  function allActiveCompleted() {
    var list = activeTasks();
    return list.length > 0 && list.every(function (task) {
      return isCompleted(task.taskId);
    });
  }

  KA.tasks = {
    allTasks: allTasks,
    activeTasks: activeTasks,
    isCompleted: isCompleted,
    completedToday: completedToday,
    completeTask: completeTask,
    undoTask: undoTask,
    updateTask: updateTask,
    allActiveCompleted: allActiveCompleted
  };
})(window);
