(function (global, document) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var appEl;
  var modalRoot;
  var toastRoot;
  var audioContext = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function button(label, className, attrs) {
    return '<button class="btn ' + (className || "btn-soft") + '" ' + (attrs || "") + '>' + label + '</button>';
  }

  function iconButton(icon, label, route) {
    return '<button class="nav-btn ' + (KA.router.getCurrent().name === route ? "is-active" : "") + '" data-route="' + route + '"><span>' + icon + '</span>' + label + '</button>';
  }

  function layout(title, body, options) {
    options = options || {};
    var dateKey = KA.state.getTodayKey();
    var topbar = [
      '<div class="topbar">',
      '<div class="brand-block">',
      '<p class="eyebrow">' + escapeHtml(KA.date.formatDisplayDate(dateKey)) + '</p>',
      '<h1>' + escapeHtml(title || KA.constants.APP_DISPLAY_NAME) + '</h1>',
      options.subtitle ? '<p class="muted">' + escapeHtml(options.subtitle) + '</p>' : '',
      '</div>',
      options.parentGate === false ? '' : '<button class="parent-gate" id="parent-gate" aria-label="保護者モード"><span class="parent-gate-progress"></span>おとな</button>',
      '</div>'
    ].join("");
    var nav = [
      '<nav class="bottom-nav" aria-label="メインメニュー">',
      iconButton("🏠", "ホーム", "home"),
      iconButton("⭐", "おしごと", "tasks"),
      iconButton("🎨", "ぬりえ", "coloring-list"),
      iconButton("🌳", "もり", "forest"),
      iconButton("🖼️", "さくひん", "album"),
      '</nav>'
    ].join("");
    appEl.innerHTML = '<main class="screen ' + (options.screenClass || "") + '">' + topbar + body + '</main>' + nav;
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-route]"), function (el) {
      el.addEventListener("click", function () {
        KA.router.navigate(el.getAttribute("data-route"));
      });
    });
    var gate = document.getElementById("parent-gate");
    if (gate) {
      KA.parentMode.bindParentGate(gate, function () {
        confirmDialog("おとながつかいます", "親モードに進みます。おとなのひとといっしょに使ってください。", "すすむ", function () {
          KA.router.navigate("parent");
        });
      });
    }
    if (KA.state.getAppData().settings.animationLevel === "reduced") {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }

  function toast(message) {
    var div = document.createElement("div");
    div.className = "toast";
    div.textContent = message;
    toastRoot.appendChild(div);
    global.setTimeout(function () {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 3200);
  }

  function closeDialog() {
    modalRoot.innerHTML = "";
  }

  function confirmDialog(title, message, okLabel, onOk, cancelLabel) {
    modalRoot.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true">',
      '<h2>' + escapeHtml(title) + '</h2>',
      '<p>' + escapeHtml(message) + '</p>',
      '<div class="modal-actions">',
      button(cancelLabel || "やめる", "btn-soft", 'data-dialog-cancel'),
      button(okLabel || "OK", "btn-primary", 'data-dialog-ok'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    modalRoot.querySelector("[data-dialog-ok]").addEventListener("click", function () {
      closeDialog();
      if (onOk) onOk();
    });
  }

  function infoDialog(title, html) {
    modalRoot.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true">',
      '<h2>' + escapeHtml(title) + '</h2>',
      html,
      '<div class="modal-actions">',
      button("とじる", "btn-primary", 'data-dialog-cancel'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
  }

  function playTone(kind) {
    if (!KA.state.getAppData().settings.soundEnabled) return;
    try {
      audioContext = audioContext || new (global.AudioContext || global.webkitAudioContext)();
      var osc = audioContext.createOscillator();
      var gain = audioContext.createGain();
      var now = audioContext.currentTime;
      osc.frequency.value = kind === "star" ? 784 : kind === "magic" ? 988 : 520;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (error) {
      // Sound is optional.
    }
  }

  function starPill() {
    var totals = KA.state.getAppData().profile.starTotals;
    return '<span class="badge star">つかえるほし ' + totals.spendableStars + '</span>';
  }

  function dataIssueMessage() {
    return KA.state.getDataIssue() ? '<p class="muted">うまく保存を読めなかったみたい。おとなのひとと確認してね。</p>' : "";
  }

  function eggStateLabel(state) {
    if (state === "cracked") return "ひびが入った";
    if (state === "hatched") return "うまれた";
    return "まだ開いていない";
  }

  function forestMiniPreview() {
    var count = KA.state.getAppData().artworks.length;
    return '<div class="preview-wrap" aria-hidden="true"><svg viewBox="0 0 320 160"><rect width="320" height="160" fill="#BDEEFF"/><circle cx="270" cy="32" r="20" fill="#FACC15"/><path d="M0 104 C70 84 125 120 190 96 C250 74 290 92 320 80 L320 160 L0 160 Z" fill="#8BD17E"/><path d="M50 112 L70 54 L90 112 Z" fill="#4F9F54"/><path d="M210 116 L238 44 L266 116 Z" fill="#3F8F46"/><text x="18" y="145" fill="#2F7837" font-size="18" font-weight="800">森のさくひん ' + count + '</text></svg></div>';
  }

  function renderHome() {
    var data = KA.state.getAppData();
    var record = KA.state.getDailyRecord();
    var tasks = KA.tasks.activeTasks();
    var completed = KA.tasks.completedToday();
    var body = [
      '<section class="hero">',
      '<div class="panel panel-pad">',
      '<div class="home-stats">',
      '<div class="stat"><span class="stat-label">つかえるほし</span><span class="stat-value">⭐ ' + data.profile.starTotals.spendableStars + '</span></div>',
      '<div class="stat secondary"><span class="stat-label">あつめたほし</span><span class="stat-value">⭐ ' + data.profile.starTotals.lifetimeStars + '</span></div>',
      '</div>',
      '<div class="quick-actions">',
      button("⭐ おしごと", "btn-primary", 'data-route="tasks"'),
      button("🎨 ぬりえ", "btn-sun", 'data-route="coloring-list"'),
      button("🌳 もり", "btn-soft", 'data-route="forest"'),
      button("🖼️ さくひん", "btn-soft", 'data-route="album"'),
      '</div>',
      '</div>',
      '<div class="panel panel-pad">',
      '<h2>きょうのようす</h2>',
      '<p><span class="badge">おしごと ' + completed.length + ' / ' + tasks.length + '</span> <span class="badge">さくひん ' + record.artworkIds.length + '</span></p>',
      button("🥚 ふしぎなたまご " + KA.eggs.eggCount() + "こ", "btn-soft egg-button", 'data-route="eggs"'),
      forestMiniPreview(),
      dataIssueMessage(),
      '</div>',
      '</section>'
    ].join("");
    layout(KA.constants.APP_DISPLAY_NAME, body, { subtitle: KA.constants.VERSION_LABEL });
  }

  function renderTasks() {
    var tasks = KA.tasks.activeTasks();
    var completed = KA.tasks.completedToday();
    var html = [
      '<div class="screen-header"><div><h2>きょうのおしごと</h2><p class="muted">できたら大きなボタンをおしてね。</p></div><div>' + starPill() + '</div></div>',
      '<section class="grid">'
    ];
    tasks.forEach(function (task) {
      var done = KA.tasks.isCompleted(task.taskId);
      html.push([
        '<article class="task-card ' + (done ? "is-done" : "") + '">',
        '<div class="task-icon">' + escapeHtml(task.icon || "⭐") + '</div>',
        '<div><h3>' + escapeHtml(task.title) + '</h3>',
        '<p><span class="badge star">⭐ ' + Number(task.rewardStars || 0) + '</span> ' + (done ? '<span class="badge">できた</span>' : '<span class="badge">まだだよ</span>') + '</p>',
        '<div class="task-actions">' + button(done ? "できたよ" : "できた", done ? "btn-soft" : "btn-primary", done ? "disabled" : 'data-complete-task="' + escapeHtml(task.taskId) + '"') + '</div>',
        '</div></article>'
      ].join(""));
    });
    html.push('</section>');
    if (completed.length === tasks.length && tasks.length) {
      html.push('<div class="panel panel-pad" style="margin-top:12px"><h2>ぜんぶできたね</h2><p>きょうのぼうけんを見てみよう。</p>' + button("きょうのぼうけん", "btn-sun", 'data-route="summary"') + '</div>');
    }
    layout("おしごと", html.join(""), { subtitle: "きょうあつめたほし " + KA.state.getDailyRecord().earnedStarsToday });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-complete-task]"), function (el) {
      el.addEventListener("click", function () {
        el.disabled = true;
        var result = KA.tasks.completeTask(el.getAttribute("data-complete-task"));
        if (!result.ok) {
          toast("もう できたことに なっているよ");
          KA.router.render();
          return;
        }
        playTone("star");
        KA.router.navigate("star", { earned: result.task.rewardStars });
      });
    });
  }

  function renderStar(params) {
    var allDone = KA.tasks.allActiveCompleted();
    var body = [
      '<section class="magic-screen"><div class="panel panel-pad magic-card sparkle-field">',
      '<div style="font-size:5rem; line-height:1">⭐</div>',
      '<h2>できたね</h2>',
      '<p class="stat-value">+' + Number(params.earned || 1) + '</p>',
      '<p class="muted">きょうあつめたほし ' + KA.state.getDailyRecord().earnedStarsToday + '</p>',
      '<div class="quick-actions">',
      button("つぎのおしごと", "btn-primary", 'data-route="tasks"'),
      button("ぬりえへ", "btn-sun", 'data-route="coloring-list"'),
      button(allDone ? "きょうのぼうけん" : "スキップ", "btn-soft", 'data-route="' + (allDone ? "summary" : "tasks") + '"'),
      '</div></div></section>'
    ].join("");
    layout("ほしをもらったよ", body, { parentGate: false });
  }

  function renderColoringList() {
    var templates = KA.coloring.getTemplates();
    var totals = KA.state.getAppData().profile.starTotals;
    var body = ['<div class="screen-header"><div><h2>ぬりえ</h2><p class="muted">ほしでひらいて、すきな色をぬろう。</p></div><div>' + starPill() + '</div></div>', '<section class="coloring-grid">'];
    templates.forEach(function (template) {
      var unlocked = KA.coloring.isUnlocked(template.templateId);
      body.push([
        '<article class="coloring-card">',
        '<div class="coloring-preview preview-wrap">' + KA.coloring.renderTemplate(template.templateId, {}, "") + '</div>',
        '<h3>' + escapeHtml(template.icon + " " + template.title) + '</h3>',
        '<p><span class="badge star">⭐ ' + template.requiredStars + '</span> ' + (unlocked ? '<span class="badge">ひらいた</span>' : '<span class="badge">まだ</span>') + '</p>',
        unlocked ? button("ぬる", "btn-primary", 'data-edit-coloring="' + template.templateId + '"') :
          button(totals.spendableStars >= template.requiredStars ? "かいほうする" : "もうすこし", totals.spendableStars >= template.requiredStars ? "btn-sun" : "btn-soft", 'data-unlock-coloring="' + template.templateId + '"'),
        '</article>'
      ].join(""));
    });
    body.push('</section>');
    layout("ぬりえ", body.join(""));
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-edit-coloring]"), function (el) {
      el.addEventListener("click", function () {
        KA.router.navigate("coloring-editor", { templateId: el.getAttribute("data-edit-coloring") });
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-unlock-coloring]"), function (el) {
      el.addEventListener("click", function () {
        var template = KA.coloring.getTemplate(el.getAttribute("data-unlock-coloring"));
        if (KA.state.getAppData().profile.starTotals.spendableStars < template.requiredStars) {
          toast("もうすこしで かいほうできるよ");
          return;
        }
        confirmDialog(template.title + "をひらく？", "つかえるほしを " + template.requiredStars + " つかいます。", "ひらく", function () {
          var result = KA.coloring.unlock(template.templateId);
          if (!result.ok) {
            toast("もうすこしで かいほうできるよ");
            return;
          }
          playTone("tap");
          KA.router.navigate("coloring-editor", { templateId: template.templateId });
        });
      });
    });
  }

  function renderColoringEditor(params) {
    var templateId = params.templateId;
    var template = KA.coloring.getTemplate(templateId);
    if (!template || !KA.coloring.isUnlocked(templateId)) {
      toast("まだ ひらいていないよ");
      KA.router.navigate("coloring-list");
      return;
    }
    var draft = KA.coloring.getDraft(templateId);
    var selected = KA.state.getUiState().selectedColor || KA.constants.COLOR_PALETTE[1].value;
    var palette = KA.constants.COLOR_PALETTE.map(function (color) {
      return '<button class="swatch ' + (selected === color.value ? "is-selected" : "") + '" style="background:' + color.value + '" title="' + escapeHtml(color.name) + '" aria-label="' + escapeHtml(color.name) + '" data-color="' + color.value + '">' + escapeHtml(color.name) + '</button>';
    }).join("");
    var body = [
      '<div class="screen-header"><div><h2>' + escapeHtml(template.title) + '</h2><p class="muted">いろをえらんで、ぬりたいところをタップしてね。</p></div></div>',
      '<section class="editor-layout">',
      '<div class="editor-canvas" id="editor-canvas">' + KA.coloring.renderTemplate(templateId, draft.regionColors, "editable-svg") + '</div>',
      '<div class="panel panel-pad"><h3>いろ</h3><div class="palette">' + palette + '</div>',
      '<p class="muted">えらんだいろ: ' + escapeHtml((KA.coloring.paletteByValue(selected) || {}).name || "") + '</p>',
      '<div class="editor-actions">',
      button("ひとつ戻す", "btn-soft", 'data-undo'),
      button("全部消す", "btn-soft", 'data-clear'),
      button("完成する", "btn-sun", 'data-complete-art'),
      button("やめる", "btn-soft", 'data-route="coloring-list"'),
      '</div></div></section>'
    ].join("");
    layout("ぬりえ", body);
    appEl.querySelector("#editor-canvas").addEventListener("click", function (event) {
      var target = event.target.closest("[data-region-id]");
      if (!target) return;
      var regionId = target.getAttribute("data-region-id");
      var current = draft.regionColors[regionId] || null;
      draft.undoStack = draft.undoStack || [];
      draft.undoStack.push({ regionId: regionId, previous: current });
      draft.regionColors[regionId] = KA.state.getUiState().selectedColor || selected;
      KA.coloring.saveDraft(templateId, draft);
      playTone("tap");
      KA.router.render();
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-color]"), function (el) {
      el.addEventListener("click", function () {
        KA.state.getUiState().selectedColor = el.getAttribute("data-color");
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    appEl.querySelector("[data-undo]").addEventListener("click", function () {
      var last = (draft.undoStack || []).pop();
      if (!last) {
        toast("もどすところがないよ");
        return;
      }
      if (last.previous) draft.regionColors[last.regionId] = last.previous;
      else delete draft.regionColors[last.regionId];
      KA.coloring.saveDraft(templateId, draft);
      KA.router.render();
    });
    appEl.querySelector("[data-clear]").addEventListener("click", function () {
      confirmDialog("ぜんぶ消す？", "ぬった色をぜんぶ消します。", "消す", function () {
        draft.regionColors = {};
        draft.undoStack = [];
        KA.coloring.saveDraft(templateId, draft);
        KA.router.render();
      });
    });
    appEl.querySelector("[data-complete-art]").addEventListener("click", function () {
      if (Object.keys(draft.regionColors || {}).length < 1) {
        toast("ひとついろをぬってから完成できるよ");
        return;
      }
      confirmDialog("できあがりにする？", "まほうをかけて森に送ります。", "まほうをかける", function () {
        var result = KA.coloring.createArtwork(templateId, draft.regionColors);
        if (!result.ok) {
          toast("うまく保存できなかったみたい。おとなのひとと ためしてね。");
          return;
        }
        playTone("magic");
        KA.router.navigate("magic", { artworkId: result.artwork.artworkId });
      });
    });
  }

  function renderMagic(params) {
    var artwork = KA.coloring.getArtwork(params.artworkId);
    if (!artwork) {
      KA.router.navigate("forest");
      return;
    }
    var body = [
      '<section class="magic-screen"><div class="panel panel-pad magic-card sparkle-field">',
      '<div class="magic-art">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "magic-svg") + '</div>',
      '<h2>まほうの仕上げ</h2><p id="magic-message">いろをみているよ</p>',
      '<div class="modal-actions" style="justify-content:center">' + button("スキップ", "btn-soft", 'data-skip-magic') + '</div>',
      '</div></section>'
    ].join("");
    layout("まほう", body, { parentGate: false });
    var steps = ["いろをみているよ", "もりにあうばしょをさがしているよ", "きらきらをつけているよ", "森へいくよ"];
    var index = 0;
    var msg = document.getElementById("magic-message");
    var interval = global.setInterval(function () {
      index += 1;
      if (msg && steps[index]) msg.textContent = steps[index];
    }, 800);
    var finish = function () {
      global.clearInterval(interval);
      KA.router.navigate("forest", { focusArtworkId: artwork.artworkId });
    };
    var timeout = global.setTimeout(finish, 3600);
    appEl.querySelector("[data-skip-magic]").addEventListener("click", function () {
      global.clearTimeout(timeout);
      finish();
    });
  }

  function forestBackgroundSvg() {
    return '<svg class="forest-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="100" fill="#BDEEFF"/><circle cx="85" cy="12" r="6" fill="#FACC15"/><path d="M0 54 C18 45 32 58 48 50 C66 40 82 48 100 38 L100 100 L0 100 Z" fill="#9BE18D"/><path d="M0 72 C18 64 40 79 58 68 C74 58 88 70 100 60 L100 100 L0 100 Z" fill="#7ACB77"/><path d="M8 64 C17 44 20 30 26 18 C34 32 39 48 45 66 Z" fill="#4F9F54"/><path d="M66 64 C74 42 79 28 86 14 C93 32 98 48 100 67 Z" fill="#3F8F46"/><path d="M0 82 C20 76 42 84 58 80 C76 76 90 82 100 78 L100 100 L0 100 Z" fill="#5FBF66"/><path d="M2 84 C12 78 24 78 36 84 C26 90 12 90 2 84 Z" fill="#7BCFE4" opacity=".9"/><g fill="#EF6FA6"><circle cx="70" cy="76" r="1.4"/><circle cx="74" cy="79" r="1.2"/><circle cx="79" cy="75" r="1.3"/><circle cx="84" cy="81" r="1.1"/></g></svg>';
  }

  function renderForest() {
    var placements = KA.worlds.getPlacements();
    var objects = placements.map(function (placement) {
      var artwork = KA.coloring.getArtwork(placement.artworkId);
      if (!artwork) return "";
      return '<button class="forest-object anim-' + escapeHtml(placement.animation) + '" style="left:' + placement.x + '%; top:' + placement.y + '%; --scale:' + placement.scale + '" data-artwork-detail="' + escapeHtml(artwork.artworkId) + '" aria-label="' + escapeHtml(artwork.title) + '">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</button>';
    }).join("");
    var body = [
      '<div class="screen-header"><div><h2>思い出の森</h2><p class="muted">ぬりえの作品が森にあらわれるよ。</p></div>' + button("きょうのぼうけん", "btn-soft", 'data-route="summary"') + '</div>',
      '<section class="forest-stage">',
      forestBackgroundSvg(),
      objects || '<div class="panel panel-pad" style="position:absolute; left:16px; right:16px; bottom:16px"><p>まだ作品はありません。ぬりえを完成させると森に登場します。</p></div>',
      '</section>'
    ].join("");
    layout("もり", body);
    bindArtworkDetails();
  }

  function colorNames(values) {
    return (values || []).map(function (value) {
      var found = KA.coloring.paletteByValue(value);
      return found ? found.name : value;
    }).join("、");
  }

  function showArtworkDetail(artworkId) {
    var artwork = KA.coloring.getArtwork(artworkId);
    if (!artwork) return;
    var html = [
      '<div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</div>',
      '<p><strong>完成日:</strong> ' + escapeHtml(KA.date.formatDisplayDate(artwork.localDate)) + '</p>',
      '<p><strong>つかった色:</strong> ' + escapeHtml(colorNames(artwork.usedColors)) + '</p>',
      '<p><strong>おきにいり:</strong> ' + (artwork.favorite ? "はい" : "まだ") + '</p>',
      '<p><strong>親のひとこと:</strong><br>' + escapeHtml(artwork.parentNote || "まだありません") + '</p>'
    ].join("");
    infoDialog(artwork.title, html);
  }

  function artCard(artwork) {
    var placement = KA.worlds.placementForArtwork(artwork.artworkId);
    return [
      '<article class="art-card">',
      '<div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</div>',
      '<h3>' + escapeHtml(artwork.title) + '</h3>',
      '<p><span class="badge">' + escapeHtml(KA.date.formatDisplayDate(artwork.localDate)) + '</span> <span class="badge">' + escapeHtml((artwork.analysis || {}).dominantColorFamily || "color") + '</span></p>',
      '<p class="muted">' + (placement ? "森にいるよ" : "森にはまだいません") + '</p>',
      '<p>' + (artwork.favorite ? "★ おきにいり" : "☆ おきにいり") + '</p>',
      '<p class="muted">' + escapeHtml(artwork.parentNote || "親のひとことはまだありません") + '</p>',
      button("見る", "btn-soft btn-small", 'data-artwork-detail="' + escapeHtml(artwork.artworkId) + '"'),
      '</article>'
    ].join("");
  }

  function bindArtworkDetails() {
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-artwork-detail]"), function (el) {
      el.addEventListener("click", function () {
        showArtworkDetail(el.getAttribute("data-artwork-detail"));
      });
    });
  }

  function renderSummary() {
    var record = KA.state.getDailyRecord();
    var taskMap = {};
    KA.tasks.allTasks().forEach(function (task) { taskMap[task.taskId] = task; });
    var completed = KA.tasks.completedToday();
    var artworks = record.artworkIds.map(KA.coloring.getArtwork).filter(Boolean);
    var body = [
      '<section class="panel panel-pad">',
      '<h2>きょうもがんばったね</h2>',
      '<p class="muted">' + escapeHtml(KA.date.formatDisplayDate(record.localDate)) + '</p>',
      '<h3>できたおしごと</h3><ul class="summary-list">',
      completed.length ? completed.map(function (item) { return '<li>' + escapeHtml((taskMap[item.taskId] || {}).icon || "⭐") + ' ' + escapeHtml((taskMap[item.taskId] || {}).title || item.taskId) + '</li>'; }).join("") : '<li>できたことがここに出るよ</li>',
      '</ul><p><span class="badge star">きょうのほし ' + Number(record.earnedStarsToday || 0) + '</span></p>',
      '<h3>きょうのさくひん</h3><div class="album-grid">',
      artworks.length ? artworks.map(artCard).join("") : '<p class="muted">ぬりえを完成するとここに出ます。</p>',
      '</div><div class="quick-actions">',
      button("森へ進む", "btn-primary", 'data-route="forest"'),
      button("ホームへ戻る", "btn-soft", 'data-route="home"'),
      '</div></section>'
    ].join("");
    layout("きょうのぼうけん", body);
    bindArtworkDetails();
  }

  function renderEggs() {
    var data = KA.state.getAppData();
    var eggs = KA.eggs.getEggs();
    var nextAt = KA.eggs.nextEggAt(data);
    var body = [
      '<div class="screen-header"><div><h2>ふしぎなたまご</h2><p class="muted">あつめたほしが10こふえるごとに、たまごがひとつ増えるよ。</p></div><div><span class="badge star">🥚 ' + eggs.length + 'こ</span></div></div>',
      '<section class="album-grid">'
    ];
    if (!eggs.length) {
      body.push('<div class="panel panel-pad"><h3>まだたまごはありません</h3><p>あつめたほしが ' + nextAt + ' こになると、たまごが見つかるよ。</p>' + button("おしごとへ", "btn-primary", 'data-route="tasks"') + '</div>');
    } else {
      eggs.forEach(function (egg) {
        body.push([
          '<button class="egg-card" data-egg-id="' + escapeHtml(egg.id) + '">',
          '<span class="egg-icon">🥚</span>',
          '<strong>' + escapeHtml(eggStateLabel(egg.state)) + '</strong>',
          '<span class="muted">あつめたほし ' + Number(egg.earnedByStars || 0) + ' こで見つけたよ</span>',
          '</button>'
        ].join(""));
      });
    }
    body.push('</section>');
    layout("たまご", body.join(""));
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-egg-id]"), function (el) {
      el.addEventListener("click", function () {
        toast("もうすぐうまれるかも？");
      });
    });
  }

  function renderAlbum() {
    var artworks = KA.coloring.recentArtworks();
    var body = [
      '<div class="screen-header"><div><h2>さくひん</h2><p class="muted">完成したぬりえを新しい順で見られます。</p></div></div>',
      '<section class="album-grid">',
      artworks.length ? artworks.map(artCard).join("") : '<div class="panel panel-pad"><p>まだ作品はありません。</p></div>',
      '</section>'
    ].join("");
    layout("さくひん", body);
    bindArtworkDetails();
  }

  function renderParent() {
    var data = KA.state.getAppData();
    var tasks = KA.tasks.allTasks();
    var record = KA.state.getDailyRecord();
    var todayArt = record.artworkIds.map(KA.coloring.getArtwork).filter(Boolean);
    var taskRows = tasks.map(function (task) {
      var done = KA.tasks.isCompleted(task.taskId);
      return '<div class="parent-row"><h3>' + escapeHtml(task.icon + " " + task.title) + '</h3><div class="form-grid"><label class="field"><span>有効</span><select data-parent-task-active="' + task.taskId + '"><option value="true" ' + (task.active !== false ? "selected" : "") + '>有効</option><option value="false" ' + (task.active === false ? "selected" : "") + '>無効</option></select></label><label class="field"><span>報酬スター</span><input type="number" min="0" max="9" value="' + Number(task.rewardStars || 0) + '" data-parent-task-reward="' + task.taskId + '"></label><p><span class="badge">' + (done ? "今日 完了" : "今日 未完了") + '</span></p>' + (done ? button("完了を訂正", "btn-danger btn-small", 'data-undo-task="' + task.taskId + '"') : '') + '</div></div>';
    }).join("");
    var artRows = todayArt.map(function (art) {
      return '<div class="parent-row"><h3>' + escapeHtml(art.title) + '</h3><div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(art.templateId, art.regionColors, "") + '</div><label class="field"><span>親のひとこと</span><textarea data-parent-note="' + escapeHtml(art.artworkId) + '">' + escapeHtml(art.parentNote || "") + '</textarea></label>' + button("ひとこと保存", "btn-primary btn-small", 'data-save-note="' + escapeHtml(art.artworkId) + '"') + '</div>';
    }).join("");
    var body = [
      '<section class="parent-screen grid">',
      '<div class="panel panel-pad"><h2>親モード</h2><p class="muted">通常タップでは入れない保護者用の画面です。</p>',
      '<p><span class="badge">現在のたまご ' + KA.eggs.eggCount() + 'こ</span></p>',
      '<label class="field"><span>子どもの名前</span><input id="profile-name" value="' + escapeHtml(data.profile.displayName) + '"></label>' + button("名前を保存", "btn-primary", 'data-save-profile') + '</div>',
      '<div class="panel panel-pad"><h2>今日のおしごと</h2><div class="grid">' + taskRows + '</div></div>',
      '<div class="panel panel-pad"><h2>今日の作品</h2><div class="grid">' + (artRows || '<p class="muted">今日の作品はまだありません。</p>') + '</div></div>',
      '<div class="panel panel-pad"><h2>設定</h2><label class="field"><span>効果音</span><select id="sound-setting"><option value="true" ' + (data.settings.soundEnabled ? "selected" : "") + '>オン</option><option value="false" ' + (!data.settings.soundEnabled ? "selected" : "") + '>オフ</option></select></label><label class="field"><span>アニメーション</span><select id="animation-setting"><option value="normal" ' + (data.settings.animationLevel !== "reduced" ? "selected" : "") + '>ふつう</option><option value="reduced" ' + (data.settings.animationLevel === "reduced" ? "selected" : "") + '>ひかえめ</option></select></label><p class="muted">' + escapeHtml(KA.constants.VERSION_LABEL + " / appVersion " + KA.constants.APP_VERSION) + '</p><div class="quick-actions">' + button("データ管理", "btn-soft", 'data-route="data"') + button("ホームへ戻る", "btn-primary", 'data-route="home"') + '</div></div>',
      '</section>'
    ].join("");
    layout("親モード", body, { screenClass: "parent-screen", parentGate: false });
    bindParentEvents();
  }

  function bindParentEvents() {
    appEl.querySelector("[data-save-profile]").addEventListener("click", function () {
      KA.parentMode.updateProfileName(appEl.querySelector("#profile-name").value);
      toast("名前を保存しました");
      KA.router.render();
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-parent-task-active]"), function (el) {
      el.addEventListener("change", function () {
        KA.tasks.updateTask(el.getAttribute("data-parent-task-active"), { active: el.value === "true" });
        toast("おしごとを更新しました");
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-parent-task-reward]"), function (el) {
      el.addEventListener("change", function () {
        KA.tasks.updateTask(el.getAttribute("data-parent-task-reward"), { rewardStars: el.value });
        toast("スターを更新しました");
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-undo-task]"), function (el) {
      el.addEventListener("click", function () {
        confirmDialog("完了を訂正しますか？", "スター履歴には訂正記録を残します。解放済みぬりえはそのままです。", "訂正する", function () {
          KA.tasks.undoTask(el.getAttribute("data-undo-task"));
          toast("訂正しました");
          KA.router.render();
        });
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-save-note]"), function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-save-note");
        KA.parentMode.saveParentNote(id, appEl.querySelector('[data-parent-note="' + id + '"]').value);
        toast("ひとことを保存しました");
      });
    });
    appEl.querySelector("#sound-setting").addEventListener("change", function (event) {
      KA.state.getAppData().settings.soundEnabled = event.target.value === "true";
      KA.state.getUiState().soundEnabled = event.target.value === "true";
      KA.state.saveAppData();
      KA.state.saveUiState();
    });
    appEl.querySelector("#animation-setting").addEventListener("change", function (event) {
      KA.state.getAppData().settings.animationLevel = event.target.value;
      KA.state.getUiState().animationLevel = event.target.value;
      KA.state.saveAppData();
      KA.state.saveUiState();
      KA.router.render();
    });
  }

  function renderData() {
    var data = KA.state.getAppData();
    var bytes = KA.storage.estimateBytes(data);
    var body = [
      '<section class="parent-screen grid">',
      '<div class="panel panel-pad"><h2>データ管理</h2><p class="muted">バックアップと復元を行います。</p><p><span class="badge">schemaVersion ' + data.schemaVersion + '</span> <span class="badge">約 ' + Math.round(bytes / 1024) + ' KB</span></p><div class="quick-actions">' + button("JSONを書き出し", "btn-primary", 'data-export-json') + button("親モードへ戻る", "btn-soft", 'data-route="parent"') + '</div></div>',
      '<div class="panel panel-pad"><h2>JSON読み込み</h2><label class="field"><span>バックアップファイル</span><input type="file" accept="application/json,.json" id="import-file"></label>' + button("読み込む", "btn-primary", 'data-import-json') + '</div>',
      '<div class="panel panel-pad"><h2>全データ初期化</h2><p class="muted">すべてのデータが消えます。何度も確認してから実行します。</p>' + button("初期化する", "btn-danger", 'data-reset-all') + '</div>',
      '</section>'
    ].join("");
    layout("データ管理", body, { screenClass: "parent-screen", parentGate: false });
    appEl.querySelector("[data-export-json]").addEventListener("click", exportJson);
    appEl.querySelector("[data-import-json]").addEventListener("click", importJson);
    appEl.querySelector("[data-reset-all]").addEventListener("click", resetFlow);
  }

  function exportJson() {
    var payload = {
      exportType: "kodomoAdventureBackup",
      exportedAt: KA.date.localIsoString(),
      exportAppVersion: KA.constants.APP_VERSION,
      exportSchemaVersion: KA.constants.SCHEMA_VERSION,
      appData: KA.state.getAppData(),
      uiState: KA.state.getUiState()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "kodomo-adventure-backup-" + KA.state.getTodayKey() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    global.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    toast("バックアップを書き出しました");
  }

  function validateImport(payload) {
    if (!payload || payload.exportType !== "kodomoAdventureBackup") return "バックアップ形式が違います。";
    if (!payload.appData || typeof payload.appData !== "object") return "アプリデータがありません。";
    if (Number(payload.appData.schemaVersion) > KA.constants.SCHEMA_VERSION) return "新しい形式のデータです。";
    if (!payload.appData.profile || !Array.isArray(payload.appData.starLedger) || !Array.isArray(payload.appData.artworks)) return "必要な項目が足りません。";
    return "";
  }

  function importJson() {
    var input = appEl.querySelector("#import-file");
    if (!input.files || !input.files[0]) {
      toast("JSONファイルを選んでください");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var payload = JSON.parse(String(reader.result || ""));
        var error = validateImport(payload);
        if (error) {
          toast(error);
          return;
        }
        confirmDialog("復元しますか？", "現在のデータを一時バックアップしてから復元します。", "復元する", function () {
          KA.storage.saveBackup("before_import", KA.state.getAppData(), KA.state.getUiState());
          KA.state.replaceAllData(payload.appData, payload.uiState);
          toast("復元しました");
          KA.router.navigate("home");
        });
      } catch (error) {
        toast("JSONを読み込めませんでした。現在のデータはそのままです。");
      }
    };
    reader.readAsText(input.files[0], "utf-8");
  }

  function resetFlow() {
    confirmDialog("初期化しますか？", "すべてのデータが消えます。", "次へ", function () {
      confirmDialog("本当に消しますか？", "作品、スター、記録が消えます。", "最終確認へ", function () {
        confirmDialog("最後の確認", "初期化を実行します。元に戻せません。", "初期化する", function () {
          KA.storage.saveBackup("before_reset", KA.state.getAppData(), KA.state.getUiState());
          KA.state.resetAllData();
          toast("初期化しました");
          KA.router.navigate("home");
        }, "やめる");
      }, "やめる");
    }, "やめる");
  }

  function registerRoutes() {
    KA.router.register("home", renderHome);
    KA.router.register("tasks", renderTasks);
    KA.router.register("star", renderStar);
    KA.router.register("coloring-list", renderColoringList);
    KA.router.register("coloring-editor", renderColoringEditor);
    KA.router.register("magic", renderMagic);
    KA.router.register("forest", renderForest);
    KA.router.register("summary", renderSummary);
    KA.router.register("eggs", renderEggs);
    KA.router.register("album", renderAlbum);
    KA.router.register("parent", renderParent);
    KA.router.register("data", renderData);
  }

  function initApp() {
    appEl = document.getElementById("app");
    modalRoot = document.getElementById("modal-root");
    toastRoot = document.getElementById("toast-root");
    KA.state.init();
    registerRoutes();
    var startRoute = KA.state.getUiState().lastRoute || "home";
    if (["parent", "data", "magic", "coloring-editor", "star"].indexOf(startRoute) >= 0) {
      startRoute = "home";
    }
    KA.router.navigate(startRoute);
  }

  KA.app = {
    init: initApp,
    toast: toast,
    confirmDialog: confirmDialog,
    infoDialog: infoDialog,
    playTone: playTone,
    escapeHtml: escapeHtml
  };

  document.addEventListener("DOMContentLoaded", initApp);
})(window, document);
