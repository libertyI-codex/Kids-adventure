(function (global, document) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var appEl;
  var modalRoot;
  var toastRoot;
  var audioContext = null;
  var bgmTimer = null;
  var bgmGain = null;
  var forestEditSession = null;
  var forestDragState = null;

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

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || []));
  }

  function isForestEditing() {
    return Boolean(forestEditSession && forestEditSession.active);
  }

  function startForestEdit() {
    forestEditSession = {
      active: true,
      snapshot: cloneJson(KA.worlds.getPlacements())
    };
    forestDragState = null;
    KA.router.render();
  }

  function commitForestEdit() {
    if (!isForestEditing()) return;
    KA.worlds.normalizeZIndexes();
    KA.state.saveAppData();
    forestEditSession = null;
    forestDragState = null;
  }

  function restoreForestEditSnapshot() {
    if (!isForestEditing()) return;
    KA.worlds.world().placements = cloneJson(forestEditSession.snapshot);
    KA.state.saveAppData();
    forestEditSession = null;
    forestDragState = null;
  }

  function forestLeaveDialog(route, params) {
    modalRoot.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true">',
      '<h2>ならべかえをどうする？</h2>',
      '<p>いまの場所をほぞんするか、もとにもどしてから進めます。</p>',
      '<div class="modal-actions">',
      button("やめる", "btn-soft", 'data-dialog-cancel'),
      button("もどす", "btn-soft", 'data-forest-leave-restore'),
      button("ほぞんする", "btn-primary", 'data-forest-leave-save'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    modalRoot.querySelector("[data-forest-leave-restore]").addEventListener("click", function () {
      closeDialog();
      restoreForestEditSnapshot();
      KA.router.navigate(route, params);
    });
    modalRoot.querySelector("[data-forest-leave-save]").addEventListener("click", function () {
      closeDialog();
      commitForestEdit();
      KA.router.navigate(route, params);
    });
  }

  function navigateWithForestGuard(route, params) {
    if (isForestEditing() && KA.router.getCurrent().name === "forest" && route !== "forest") {
      forestLeaveDialog(route, params);
      return;
    }
    KA.router.navigate(route, params);
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
      iconButton("🌍", "せかい", "forest"),
      iconButton("🖼️", "さくひん", "album"),
      '</nav>'
    ].join("");
    appEl.innerHTML = '<main class="screen ' + (options.screenClass || "") + '">' + topbar + body + '</main>' + nav;
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-route]"), function (el) {
      el.addEventListener("click", function () {
        navigateWithForestGuard(el.getAttribute("data-route"));
      });
    });
    var gate = document.getElementById("parent-gate");
    if (gate) {
      KA.parentMode.bindParentGate(gate, function () {
        confirmDialog("おとながつかいます", "親モードに進みます。おとなのひとといっしょに使ってください。", "すすむ", function () {
          navigateWithForestGuard("parent");
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

  function ensureAudioContext() {
    audioContext = audioContext || new (global.AudioContext || global.webkitAudioContext)();
    if (audioContext.state === "suspended" && audioContext.resume) {
      audioContext.resume();
    }
    return audioContext;
  }

  function playSingleTone(frequency, startAt, duration, volume, type, output) {
    var ctx = ensureAudioContext();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = type || "sine";
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume || 0.1, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(output || ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.03);
  }

  function playTone(kind) {
    var settings = KA.state.getAppData().settings;
    if (settings.effectsEnabled === false || settings.soundEnabled === false) return;
    try {
      var ctx = ensureAudioContext();
      var now = audioContext.currentTime;
      var notes = kind === "star" ? [784, 988] :
        kind === "egg" ? [523, 659, 784] :
        kind === "hatch" ? [392, 523, 659, 1046] :
        kind === "complete" || kind === "magic" ? [659, 784, 988] : [520];
      notes.forEach(function (frequency, index) {
        playSingleTone(frequency, now + index * 0.08, 0.18, 0.11, "sine", ctx.destination);
      });
    } catch (error) {
      // Sound is optional.
    }
  }

  function scheduleBgmLoop() {
    if (!bgmGain) return;
    var ctx = ensureAudioContext();
    var now = ctx.currentTime + 0.05;
    var notes = [392, 440, 523, 587, 523, 440, 392, 330];
    notes.forEach(function (frequency, index) {
      playSingleTone(frequency, now + index * 0.46, 0.42, 0.045, index % 2 ? "sine" : "triangle", bgmGain);
    });
  }

  function stopBgm() {
    if (bgmTimer) global.clearInterval(bgmTimer);
    bgmTimer = null;
    if (bgmGain) {
      try { bgmGain.disconnect(); } catch (error) { /* optional */ }
    }
    bgmGain = null;
  }

  function startBgm() {
    if (bgmTimer) return;
    try {
      var ctx = ensureAudioContext();
      bgmGain = ctx.createGain();
      bgmGain.gain.value = 0.34;
      bgmGain.connect(ctx.destination);
      scheduleBgmLoop();
      bgmTimer = global.setInterval(scheduleBgmLoop, 3800);
    } catch (error) {
      stopBgm();
    }
  }

  function syncBgmState() {
    var settings = KA.state.getAppData().settings || {};
    if (settings.bgmEnabled) startBgm();
    else stopBgm();
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
    return '<div class="preview-wrap" aria-hidden="true"><svg viewBox="0 0 320 160"><rect width="320" height="160" fill="#BDEEFF"/><circle cx="270" cy="32" r="20" fill="#FACC15"/><path d="M0 104 C70 84 125 120 190 96 C250 74 290 92 320 80 L320 160 L0 160 Z" fill="#8BD17E"/><path d="M50 112 L70 54 L90 112 Z" fill="#4F9F54"/><path d="M210 116 L238 44 L266 116 Z" fill="#3F8F46"/><text x="18" y="145" fill="#2F7837" font-size="18" font-weight="800">せかいのさくひん ' + count + '</text></svg></div>';
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
      button("🌍 せかい", "btn-soft", 'data-route="forest"'),
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
        if (result.ledger && result.ledger.eggsEarned > 0) {
          global.setTimeout(function () {
            playTone("egg");
            toast("ふしぎなたまごを見つけたよ");
          }, 260);
        }
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
      var dark = ["blue", "purple", "brown", "black"].indexOf(color.id) >= 0;
      return '<button class="swatch crayon-swatch ' + (selected === color.value ? "is-selected " : "") + (dark ? "is-dark" : "") + '" style="--swatch-color:' + color.value + '" title="' + escapeHtml(color.name) + '" aria-label="' + escapeHtml(color.name) + '" data-color="' + color.value + '"><span>' + escapeHtml(color.name) + '</span></button>';
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
        playTone("complete");
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
    var steps = ["いろをみているよ", "にあうせかいをさがしているよ", "きらきらをつけているよ", "せかいへいくよ"];
    var index = 0;
    var msg = document.getElementById("magic-message");
    var interval = global.setInterval(function () {
      index += 1;
      if (msg && steps[index]) msg.textContent = steps[index];
    }, 800);
    var finish = function () {
      global.clearInterval(interval);
      showWorldChoiceForArtwork(artwork);
    };
    var timeout = global.setTimeout(finish, 3600);
    appEl.querySelector("[data-skip-magic]").addEventListener("click", function () {
      global.clearTimeout(timeout);
      finish();
    });
  }

  function worldBackgroundSvg(worldId) {
    var id = KA.worlds.safeWorldId(worldId);
    if (id === "world_sea") {
      return [
        '<svg class="forest-bg world-bg world-bg-sea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '<defs><linearGradient id="seaWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ee7ff"/><stop offset=".55" stop-color="#48bde2"/><stop offset="1" stop-color="#2388bd"/></linearGradient></defs>',
        '<rect width="100" height="100" fill="url(#seaWater)"/><path d="M10 0 L26 0 L15 70 L3 70 Z M44 0 L58 0 L50 68 L38 68 Z M76 0 L90 0 L82 70 L70 70 Z" fill="#fff" opacity=".18"/>',
        '<g fill="#dff8ff" opacity=".72"><circle cx="18" cy="28" r="1.7"/><circle cx="25" cy="44" r="1.1"/><circle cx="70" cy="24" r="1.4"/><circle cx="84" cy="49" r="1.7"/><circle cx="57" cy="36" r="1"/></g>',
        '<path d="M0 82 C18 76 32 86 50 80 C70 74 84 84 100 78 L100 100 L0 100 Z" fill="#f4d58a"/><path d="M13 78 C18 68 23 68 28 78 Z M79 80 C84 69 92 70 96 80 Z" fill="#6f7f88"/>',
        '<path d="M18 81 C16 68 20 60 24 50 C25 64 27 71 23 82 Z M74 82 C72 69 76 60 82 52 C82 66 85 75 80 84 Z" fill="#2ea66b"/><g fill="#ff7fa8"><path d="M33 82 C30 74 34 69 39 75 C44 70 49 74 45 82 Z"/><path d="M64 83 C61 75 66 70 70 76 C75 72 80 76 76 84 Z"/></g>',
        '</svg>'
      ].join("");
    }
    if (id === "world_island") {
      return [
        '<svg class="forest-bg world-bg world-bg-island" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '<rect width="100" height="100" fill="#aee7ff"/><circle cx="84" cy="13" r="6" fill="#facc15"/>',
        '<path d="M0 55 C20 48 36 57 52 50 C72 42 88 50 100 44 L100 72 L0 72 Z" fill="#6ccce6"/>',
        '<path d="M0 72 C18 63 40 63 58 70 C74 78 90 76 100 70 L100 100 L0 100 Z" fill="#f5d48a"/>',
        '<path d="M15 72 C31 55 69 54 88 72 C73 82 31 83 15 72 Z" fill="#f7dd99"/>',
        '<path d="M24 70 C39 56 66 57 81 70 C65 77 39 78 24 70 Z" fill="#7ed36f"/>',
        '<path d="M42 77 C50 73 59 78 64 91" fill="none" stroke="#d19a52" stroke-width="3" stroke-linecap="round"/>',
        '<path d="M73 68 C74 58 76 48 80 39 C82 49 83 58 81 69 Z" fill="#8b5a2b" stroke="#6f421d" stroke-width="1.2"/>',
        '<path d="M69 69 C73 66 80 66 85 70 C81 72 73 72 69 69 Z" fill="#6f9d45"/>',
        '<path d="M80 41 C68 37 63 29 79 31 C84 20 94 25 88 37 C100 36 100 48 88 45 C91 56 78 56 80 41 Z" fill="#2f9f54"/>',
        '<g fill="#ef6fa6"><circle cx="67" cy="73" r="1.2"/><circle cx="72" cy="76" r="1.1"/><circle cx="31" cy="75" r="1.2"/></g>',
        '</svg>'
      ].join("");
    }
    if (id === "world_castle") {
      return [
        '<svg class="forest-bg world-bg world-bg-castle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '<rect width="100" height="100" fill="#dff3ff"/><path d="M0 58 H100 V100 H0 Z" fill="#91d887"/>',
        '<path d="M11 33 H25 V57 H11 Z M75 33 H89 V57 H75 Z M24 40 H76 V61 H24 Z" fill="#f8f5ff" stroke="#9f94c7" stroke-width="1.1"/>',
        '<path d="M9 33 L18 18 L27 33 Z M73 33 L82 18 L91 33 Z" fill="#d8ccff" stroke="#9f94c7" stroke-width="1.1"/>',
        '<path d="M31 31 H69 V43 H31 Z" fill="#fff" stroke="#9f94c7" stroke-width="1.1"/><path d="M31 31 L36 24 L41 31 M45 31 L50 24 L55 31 M59 31 L64 24 L69 31" fill="#e5dcff" stroke="#9f94c7" stroke-width="1"/>',
        '<path d="M48 32 V18 L62 22 L48 26 Z" fill="#ef6fa6"/><path d="M49 61 C49 50 62 50 62 61 V73 H49 Z" fill="#a78bfa" stroke="#7c6bb8" stroke-width="1.1"/>',
        '<g fill="#9fd4ff" stroke="#8fa4c7" stroke-width=".8"><path d="M16 40 C16 35 21 35 21 40 V47 H16 Z"/><path d="M79 40 C79 35 84 35 84 40 V47 H79 Z"/><path d="M36 44 C36 39 41 39 41 44 V51 H36 Z"/><path d="M59 44 C59 39 64 39 64 44 V51 H59 Z"/></g>',
        '<path d="M33 68 C43 62 57 62 67 68 L58 100 H42 Z" fill="#d8d1c4"/><path d="M43 78 H57 M39 91 H61" stroke="#aaa094" stroke-width="1.4"/>',
        '<circle cx="33" cy="76" r="5" fill="#7bcfe4" stroke="#58aabd" stroke-width="1"/><path d="M13 80 C19 75 27 76 31 82 C24 86 17 85 13 80 Z M70 82 C76 75 86 76 91 82 C84 87 75 87 70 82 Z" fill="#f7d0e4"/>',
        '<g fill="#ef6fa6"><circle cx="22" cy="79" r="1.2"/><circle cx="27" cy="82" r="1.1"/><circle cx="77" cy="80" r="1.2"/><circle cx="83" cy="83" r="1.1"/></g>',
        '</svg>'
      ].join("");
    }
    if (id === "world_sky_island") {
      return [
        '<svg class="forest-bg world-bg world-bg-sky" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '<rect width="100" height="100" fill="#bdeeff"/>',
        '<path d="M12 25 C18 16 32 18 35 27 C45 25 52 32 47 39 H10 C4 35 6 27 12 25 Z M70 18 C75 10 88 12 91 21 C99 22 103 30 96 36 H66 C60 32 62 21 70 18 Z M10 78 C17 70 31 72 34 80 C42 79 47 85 42 91 H9 C3 88 4 80 10 78 Z" fill="#fff" opacity=".86"/>',
        '<path d="M54 14 C70 17 82 29 88 45" fill="none" stroke="#f472b6" stroke-width="2.7"/><path d="M54 20 C67 23 77 33 83 47" fill="none" stroke="#facc15" stroke-width="2.7"/><path d="M54 26 C64 29 72 38 78 48" fill="none" stroke="#38bdf8" stroke-width="2.7"/>',
        '<path d="M19 62 C35 45 68 45 86 62 C75 72 32 72 19 62 Z" fill="#7ed36f" stroke="#579c49" stroke-width="1"/>',
        '<path d="M25 65 C38 78 65 78 80 65 C73 86 34 87 25 65 Z" fill="#8b6f47"/><path d="M36 69 C44 84 55 91 62 69 C55 100 43 100 36 69 Z" fill="#6f5638"/>',
        '<path d="M60 62 C63 74 58 82 54 91" fill="none" stroke="#7bcfe4" stroke-width="3.5" opacity=".85" stroke-linecap="round"/>',
        '<g fill="#fff" opacity=".88"><circle cx="26" cy="80" r="5"/><circle cx="34" cy="82" r="6"/><circle cx="73" cy="80" r="6"/><circle cx="84" cy="82" r="5"/></g>',
        '<g fill="#fff7a8"><circle cx="37" cy="35" r="1"/><circle cx="45" cy="24" r="1.2"/><circle cx="83" cy="55" r="1.1"/></g>',
        '</svg>'
      ].join("");
    }
    return [
      '<svg class="forest-bg world-bg world-bg-forest" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
      '<rect width="100" height="100" fill="#BDEEFF"/><circle cx="85" cy="12" r="6" fill="#FACC15"/><path d="M0 54 C18 45 32 58 48 50 C66 40 82 48 100 38 L100 100 L0 100 Z" fill="#9BE18D"/>',
      '<path d="M0 72 C18 64 40 79 58 68 C74 58 88 70 100 60 L100 100 L0 100 Z" fill="#7ACB77"/><path d="M8 64 C17 44 20 30 26 18 C34 32 39 48 45 66 Z" fill="#4F9F54"/><path d="M66 64 C74 42 79 28 86 14 C93 32 98 48 100 67 Z" fill="#3F8F46"/>',
      '<path d="M0 82 C20 76 42 84 58 80 C76 76 90 82 100 78 L100 100 L0 100 Z" fill="#5FBF66"/><path d="M2 84 C12 78 24 78 36 84 C26 90 12 90 2 84 Z" fill="#7BCFE4" opacity=".9"/><g fill="#EF6FA6"><circle cx="70" cy="76" r="1.4"/><circle cx="74" cy="79" r="1.2"/><circle cx="79" cy="75" r="1.3"/><circle cx="84" cy="81" r="1.1"/></g>',
      '</svg>'
    ].join("");
  }

  function worldMiniPreview(worldId) {
    return '<div class="world-mini world-mini-' + escapeHtml(KA.worlds.safeWorldId(worldId).replace("world_", "")) + '">' + worldBackgroundSvg(worldId) + '</div>';
  }

  function worldCards(attrsPrefix, currentWorldId, recommendedIds) {
    recommendedIds = recommendedIds || [];
    return KA.worlds.allWorlds().map(function (world) {
      var id = world.worldId || world.id;
      var isCurrent = id === currentWorldId;
      var isRecommended = recommendedIds.indexOf(id) >= 0;
      return [
        '<button class="world-card ' + (isCurrent ? "is-current " : "") + '" ' + attrsPrefix + '="' + escapeHtml(id) + '">',
        '<span class="world-card-icon">' + escapeHtml(world.icon || "🌍") + '</span>',
        '<strong>' + escapeHtml(world.name || world.title || id) + '</strong>',
        worldMiniPreview(id),
        isCurrent ? '<span class="badge">いまここ</span>' : '',
        isRecommended ? '<span class="badge star">おすすめ</span>' : '',
        '</button>'
      ].join("");
    }).join("");
  }

  function showWorldSelector() {
    var current = KA.worlds.selectedWorldId();
    modalRoot.innerHTML = [
      '<div class="modal world-modal" role="dialog" aria-modal="true">',
      '<h2>せかいをかえる</h2>',
      '<p class="muted">いきたいせかいを えらんでね。</p>',
      '<div class="world-card-grid">',
      worldCards("data-select-world", current, []),
      '</div>',
      '<div class="modal-actions">',
      button("とじる", "btn-soft", 'data-dialog-cancel'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    Array.prototype.forEach.call(modalRoot.querySelectorAll("[data-select-world]"), function (el) {
      el.addEventListener("click", function () {
        var worldId = KA.worlds.setSelectedWorldId(el.getAttribute("data-select-world"));
        closeDialog();
        KA.router.navigate("forest", { worldId: worldId });
      });
    });
  }

  function openWorldAfterPlacement(worldId) {
    KA.worlds.setSelectedWorldId(worldId);
    KA.state.saveAppData();
    closeDialog();
    KA.router.navigate("forest", { worldId: worldId });
  }

  function showWorldChoiceForArtwork(artwork) {
    if (!artwork) return;
    var placement = KA.worlds.placementForArtwork(artwork.artworkId);
    var current = placement ? placement.worldId : KA.worlds.recommendedWorldForTemplate(artwork.templateId);
    var recommended = KA.worlds.recommendedWorldIds(artwork.templateId);
    modalRoot.innerHTML = [
      '<div class="modal world-modal" role="dialog" aria-modal="true">',
      '<h2>どのせかいに おく？</h2>',
      '<p class="muted">' + escapeHtml(artwork.title) + 'を すきなせかいに おけるよ。</p>',
      '<div class="world-card-grid">',
      worldCards("data-place-artwork-world", current, recommended),
      '</div>',
      '<div class="modal-actions">',
      button("おすすめにおく", "btn-primary", 'data-place-recommended'),
      '</div>',
      '</div>'
    ].join("");
    Array.prototype.forEach.call(modalRoot.querySelectorAll("[data-place-artwork-world]"), function (el) {
      el.addEventListener("click", function () {
        var worldId = el.getAttribute("data-place-artwork-world");
        var moved = KA.worlds.moveArtworkToWorld(artwork.artworkId, worldId);
        if (moved.ok) openWorldAfterPlacement(worldId);
      });
    });
    modalRoot.querySelector("[data-place-recommended]").addEventListener("click", function () {
      var recommendedWorld = KA.worlds.recommendedWorldForTemplate(artwork.templateId);
      var moved = KA.worlds.moveArtworkToWorld(artwork.artworkId, recommendedWorld);
      if (moved.ok) openWorldAfterPlacement(recommendedWorld);
    });
  }

  function showMoveArtworkSelector() {
    var currentWorldId = KA.worlds.selectedWorldId();
    var placements = KA.worlds.getPlacements(currentWorldId);
    if (!placements.length) {
      toast("このせかいには まださくひんがないよ");
      return;
    }
    modalRoot.innerHTML = [
      '<div class="modal world-modal" role="dialog" aria-modal="true">',
      '<h2>さくひんをうつす</h2>',
      '<p class="muted">うつしたい さくひんを えらんでね。</p>',
      '<div class="move-art-grid">',
      placements.map(function (placement) {
        var artwork = KA.coloring.getArtwork(placement.artworkId);
        if (!artwork) return "";
        return '<button class="move-art-card" data-move-artwork="' + escapeHtml(artwork.artworkId) + '"><div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</div><strong>' + escapeHtml(artwork.title) + '</strong></button>';
      }).join(""),
      '</div>',
      '<div class="modal-actions">',
      button("とじる", "btn-soft", 'data-dialog-cancel'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    Array.prototype.forEach.call(modalRoot.querySelectorAll("[data-move-artwork]"), function (el) {
      el.addEventListener("click", function () {
        showMoveDestinationSelector(el.getAttribute("data-move-artwork"));
      });
    });
  }

  function showMoveDestinationSelector(artworkId) {
    var artwork = KA.coloring.getArtwork(artworkId);
    if (!artwork) return;
    var current = (KA.worlds.placementForArtwork(artworkId) || {}).worldId || KA.worlds.selectedWorldId();
    modalRoot.innerHTML = [
      '<div class="modal world-modal" role="dialog" aria-modal="true">',
      '<h2>どこへ うつす？</h2>',
      '<p class="muted">' + escapeHtml(artwork.title) + 'を うつすせかいを えらんでね。</p>',
      '<div class="world-card-grid">',
      worldCards("data-move-target-world", current, KA.worlds.recommendedWorldIds(artwork.templateId)),
      '</div>',
      '<div class="modal-actions">',
      button("もどる", "btn-soft", 'data-move-back'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-move-back]").addEventListener("click", showMoveArtworkSelector);
    Array.prototype.forEach.call(modalRoot.querySelectorAll("[data-move-target-world]"), function (el) {
      el.addEventListener("click", function () {
        var targetWorldId = el.getAttribute("data-move-target-world");
        confirmDialog("さくひんをうつす？", KA.worlds.worldLabel(targetWorldId) + "へ うつします。", "うつす", function () {
          var moved = KA.worlds.moveArtworkToWorld(artworkId, targetWorldId);
          if (!moved.ok) {
            toast("うまく うつせなかったみたい");
            return;
          }
          KA.state.saveAppData();
          openWorldAfterPlacement(targetWorldId);
        });
      });
    });
  }

  function findPlacement(placementId) {
    return KA.worlds.getPlacements().filter(function (placement) {
      return placement.placementId === placementId;
    })[0] || null;
  }

  function stageDeltaToPercent(stage, dx, dy, startXPercent, startYPercent) {
    var rect = stage.getBoundingClientRect();
    var width = Math.max(1, rect.width);
    var height = Math.max(1, rect.height);
    return KA.worlds.clampPlacementPercent(
      startXPercent + (dx / width) * 100,
      startYPercent + (dy / height) * 100
    );
  }

  function bindForestDrag(stage) {
    Array.prototype.forEach.call(stage.querySelectorAll("[data-draggable-placement]"), function (el) {
      el.addEventListener("pointerdown", function (event) {
        if (!isForestEditing()) return;
        var placement = findPlacement(el.getAttribute("data-draggable-placement"));
        if (!placement) return;
        event.preventDefault();
        event.stopPropagation();
        forestDragState = {
          pointerId: event.pointerId,
          placementId: placement.placementId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startXPercent: Number(placement.xPercent || placement.x || 50),
          startYPercent: Number(placement.yPercent || placement.y || 64),
          originalZIndex: Number(placement.zIndex || 1),
          dragZIndex: KA.worlds.nextZIndex(),
          moved: false
        };
        el.classList.add("is-pressed");
        if (el.setPointerCapture) {
          try { el.setPointerCapture(event.pointerId); } catch (error) { /* optional */ }
        }
      });

      el.addEventListener("pointermove", function (event) {
        if (!forestDragState || forestDragState.placementId !== el.getAttribute("data-draggable-placement")) return;
        var dx = event.clientX - forestDragState.startClientX;
        var dy = event.clientY - forestDragState.startClientY;
        if (!forestDragState.moved && Math.sqrt(dx * dx + dy * dy) < 6) return;
        event.preventDefault();
        event.stopPropagation();
        forestDragState.moved = true;
        el.classList.add("is-dragging");
        var next = stageDeltaToPercent(stage, dx, dy, forestDragState.startXPercent, forestDragState.startYPercent);
        var placement = KA.worlds.updatePlacementPosition(forestDragState.placementId, next.xPercent, next.yPercent, forestDragState.dragZIndex, true);
        if (!placement) return;
        el.style.left = placement.xPercent + "%";
        el.style.top = placement.yPercent + "%";
        el.style.zIndex = placement.zIndex;
      });

      function endDrag(event) {
        if (!forestDragState || forestDragState.placementId !== el.getAttribute("data-draggable-placement")) return;
        event.preventDefault();
        event.stopPropagation();
        if (!forestDragState.moved) {
          el.style.zIndex = forestDragState.originalZIndex;
        }
        el.classList.remove("is-pressed");
        el.classList.remove("is-dragging");
        if (el.releasePointerCapture) {
          try { el.releasePointerCapture(event.pointerId); } catch (error) { /* optional */ }
        }
        forestDragState = null;
      }

      el.addEventListener("pointerup", endDrag);
      el.addEventListener("pointercancel", endDrag);
    });
  }

  function artworkEffects(placement) {
    var type = placement.objectType || "";
    if (type === "butterfly") {
      return [
        '<span class="artwork-effects butterfly-dust" aria-hidden="true">',
        '<span class="dust dust-1"></span><span class="dust dust-2"></span><span class="dust dust-3"></span>',
        '<span class="dust dust-4"></span><span class="dust dust-5"></span><span class="dust dust-6"></span>',
        '</span>'
      ].join("");
    }
    return '<span class="artwork-effects" aria-hidden="true"></span>';
  }

  function renderForest(params) {
    if (params && params.worldId) {
      KA.worlds.setSelectedWorldId(params.worldId);
    }
    var currentWorldId = KA.worlds.selectedWorldId();
    var currentWorld = KA.worlds.getWorld(currentWorldId);
    var placements = KA.worlds.getPlacements(currentWorldId);
    var editing = isForestEditing();
    var objects = placements.map(function (placement) {
      var artwork = KA.coloring.getArtwork(placement.artworkId);
      if (!artwork) return "";
      var attrs = editing ? 'data-draggable-placement="' + escapeHtml(placement.placementId) + '"' : 'data-artwork-detail="' + escapeHtml(artwork.artworkId) + '"';
      var classes = "forest-object anim-" + escapeHtml(placement.animation) + (editing ? " is-editable" : "");
      return '<button class="' + classes + '" style="left:' + Number(placement.xPercent || placement.x) + '%; top:' + Number(placement.yPercent || placement.y) + '%; --scale:' + placement.scale + '; z-index:' + Number(placement.zIndex || 1) + '" ' + attrs + ' aria-label="' + escapeHtml(artwork.title) + '"><span class="artwork-wrapper" data-artwork-wrapper="' + escapeHtml(artwork.artworkId) + '"><span class="artwork-svg">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</span>' + artworkEffects(placement) + '</span></button>';
    }).join("");
    var headerActions = editing ?
      '<div class="forest-tools">' + button("できた", "btn-primary", 'data-finish-forest-edit') + button("もとにもどす", "btn-soft", 'data-reset-forest-layout') + button("やめる", "btn-soft", 'data-cancel-forest-edit') + '</div>' :
      '<div class="forest-tools">' + button("せかいをかえる", "btn-soft", 'data-change-world') + (placements.length ? button("ならべかえ", "btn-sun", 'data-start-forest-edit') : '') + button("さくひんをうつす", "btn-soft", 'data-move-artwork-world') + button("きょうのぼうけん", "btn-soft", 'data-route="summary"') + '</div>';
    var body = [
      '<div class="screen-header world-screen-header"><div><p class="eyebrow">' + escapeHtml(currentWorld.icon || "🌍") + ' せかい</p><h2>' + escapeHtml(currentWorld.title || currentWorld.name || "せかい") + '</h2><p class="' + (editing ? "forest-edit-banner" : "muted") + '">' + (editing ? "すきなところへ うごかしてね" : escapeHtml(currentWorld.description || "ぬりえの作品があらわれるよ。")) + '</p></div>' + headerActions + '</div>',
      '<section class="forest-stage world-stage world-stage-' + escapeHtml(currentWorldId.replace("world_", "")) + ' ' + (editing ? "is-editing" : "") + '" id="forest-stage">',
      worldBackgroundSvg(currentWorldId),
      objects || '<div class="panel panel-pad empty-world-message"><p>このせかいには まだ作品がありません。ぬりえを完成させるか、作品をうつしてね。</p></div>',
      '</section>'
    ].join("");
    layout("せかい", body);
    var worldButton = appEl.querySelector("[data-change-world]");
    if (worldButton) {
      worldButton.addEventListener("click", showWorldSelector);
    }
    var moveButton = appEl.querySelector("[data-move-artwork-world]");
    if (moveButton) {
      moveButton.addEventListener("click", showMoveArtworkSelector);
    }
    var startButton = appEl.querySelector("[data-start-forest-edit]");
    if (startButton) {
      startButton.addEventListener("click", startForestEdit);
    }
    var finishButton = appEl.querySelector("[data-finish-forest-edit]");
    if (finishButton) {
      finishButton.addEventListener("click", function () {
        commitForestEdit();
        toast("ならべかえを ほぞんしたよ");
        KA.router.render();
      });
    }
    var cancelButton = appEl.querySelector("[data-cancel-forest-edit]");
    if (cancelButton) {
      cancelButton.addEventListener("click", function () {
        confirmDialog("ならべかえをやめる？", "動かした場所をもとにもどします。", "もどす", function () {
          restoreForestEditSnapshot();
          KA.router.render();
        });
      });
    }
    var resetButton = appEl.querySelector("[data-reset-forest-layout]");
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        confirmDialog("ならべかえを もとにもどす？", "作品は消えません。自動で決めた場所にもどします。", "もどす", function () {
          KA.worlds.resetToAutoPlacements(currentWorldId);
          KA.worlds.normalizeZIndexes(currentWorldId);
          KA.state.saveAppData();
          forestEditSession = null;
          forestDragState = null;
          KA.router.render();
        });
      });
    }
    if (editing) {
      bindForestDrag(document.getElementById("forest-stage"));
    } else {
      bindArtworkDetails();
    }
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
    var placement = KA.worlds.placementForArtwork(artworkId);
    var worldName = placement ? KA.worlds.worldLabel(placement.worldId) : "もり";
    var html = [
      '<div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</div>',
      '<p><strong>完成日:</strong> ' + escapeHtml(KA.date.formatDisplayDate(artwork.localDate)) + '</p>',
      '<p><strong>いるせかい:</strong> ' + escapeHtml(worldName) + '</p>',
      '<p><strong>つかった色:</strong> ' + escapeHtml(colorNames(artwork.usedColors)) + '</p>',
      '<p><strong>おきにいり:</strong> ' + (artwork.favorite ? "はい" : "まだ") + '</p>',
      '<p><strong>親のひとこと:</strong><br>' + escapeHtml(artwork.parentNote || "まだありません") + '</p>'
    ].join("");
    infoDialog(artwork.title, html);
  }

  function artCard(artwork) {
    var placement = KA.worlds.placementForArtwork(artwork.artworkId);
    var worldName = placement ? KA.worlds.worldLabel(placement.worldId) : "";
    return [
      '<article class="art-card">',
      '<div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(artwork.templateId, artwork.regionColors, "") + '</div>',
      '<h3>' + escapeHtml(artwork.title) + '</h3>',
      '<p><span class="badge">' + escapeHtml(KA.date.formatDisplayDate(artwork.localDate)) + '</span> <span class="badge">' + escapeHtml((artwork.analysis || {}).dominantColorFamily || "color") + '</span></p>',
      '<p class="muted">' + (placement ? escapeHtml(worldName) + "にいるよ" : "せかいにはまだいません") + '</p>',
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
    var artworkWorldMessages = artworks.map(function (artwork) {
      var placement = KA.worlds.placementForArtwork(artwork.artworkId);
      var worldName = placement ? KA.worlds.worldLabel(placement.worldId) : "もり";
      return '<li>' + escapeHtml(artwork.title) + 'が ' + escapeHtml(worldName) + 'に なかまいりしたよ！</li>';
    }).join("");
    var body = [
      '<section class="panel panel-pad">',
      '<h2>きょうもがんばったね</h2>',
      '<p class="muted">' + escapeHtml(KA.date.formatDisplayDate(record.localDate)) + '</p>',
      '<h3>できたおしごと</h3><ul class="summary-list">',
      completed.length ? completed.map(function (item) { return '<li>' + escapeHtml((taskMap[item.taskId] || {}).icon || "⭐") + ' ' + escapeHtml((taskMap[item.taskId] || {}).title || item.taskId) + '</li>'; }).join("") : '<li>できたことがここに出るよ</li>',
      '</ul><p><span class="badge star">きょうのほし ' + Number(record.earnedStarsToday || 0) + '</span></p>',
      artworkWorldMessages ? '<h3>せかいにふえたなかま</h3><ul class="summary-list">' + artworkWorldMessages + '</ul>' : '',
      '<h3>きょうのさくひん</h3><div class="album-grid">',
      artworks.length ? artworks.map(artCard).join("") : '<p class="muted">ぬりえを完成するとここに出ます。</p>',
      '</div><div class="quick-actions">',
      button("せかいへ進む", "btn-primary", 'data-route="forest"'),
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
      var placement = KA.worlds.placementForArtwork(art.artworkId);
      var worldName = placement ? KA.worlds.worldLabel(placement.worldId) : "もり";
      return '<div class="parent-row"><h3>' + escapeHtml(art.title) + '</h3><p><span class="badge">いるせかい: ' + escapeHtml(worldName) + '</span></p><div class="art-preview preview-wrap">' + KA.coloring.renderTemplate(art.templateId, art.regionColors, "") + '</div><label class="field"><span>親のひとこと</span><textarea data-parent-note="' + escapeHtml(art.artworkId) + '">' + escapeHtml(art.parentNote || "") + '</textarea></label>' + button("ひとこと保存", "btn-primary btn-small", 'data-save-note="' + escapeHtml(art.artworkId) + '"') + '</div>';
    }).join("");
    var body = [
      '<section class="parent-screen grid">',
      '<div class="panel panel-pad"><h2>親モード</h2><p class="muted">通常タップでは入れない保護者用の画面です。</p>',
      '<p><span class="badge">現在のたまご ' + KA.eggs.eggCount() + 'こ</span></p>',
      '<label class="field"><span>子どもの名前</span><input id="profile-name" value="' + escapeHtml(data.profile.displayName) + '"></label>' + button("名前を保存", "btn-primary", 'data-save-profile') + '</div>',
      '<div class="panel panel-pad"><h2>今日のおしごと</h2><div class="grid">' + taskRows + '</div></div>',
      '<div class="panel panel-pad"><h2>今日の作品</h2><div class="grid">' + (artRows || '<p class="muted">今日の作品はまだありません。</p>') + '</div></div>',
      '<div class="panel panel-pad"><h2>設定</h2><label class="field"><span>BGM</span><select id="bgm-setting"><option value="false" ' + (!data.settings.bgmEnabled ? "selected" : "") + '>オフ</option><option value="true" ' + (data.settings.bgmEnabled ? "selected" : "") + '>オン</option></select></label><label class="field"><span>効果音</span><select id="effects-setting"><option value="true" ' + (data.settings.effectsEnabled !== false && data.settings.soundEnabled !== false ? "selected" : "") + '>オン</option><option value="false" ' + (data.settings.effectsEnabled === false || data.settings.soundEnabled === false ? "selected" : "") + '>オフ</option></select></label><label class="field"><span>アニメーション</span><select id="animation-setting"><option value="normal" ' + (data.settings.animationLevel !== "reduced" ? "selected" : "") + '>ふつう</option><option value="reduced" ' + (data.settings.animationLevel === "reduced" ? "selected" : "") + '>ひかえめ</option></select></label><p class="muted">' + escapeHtml(KA.constants.VERSION_LABEL + " / appVersion " + KA.constants.APP_VERSION) + '</p><div class="quick-actions">' + button("データ管理", "btn-soft", 'data-route="data"') + button("ホームへ戻る", "btn-primary", 'data-route="home"') + '</div></div>',
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
    appEl.querySelector("#bgm-setting").addEventListener("change", function (event) {
      KA.state.getAppData().settings.bgmEnabled = event.target.value === "true";
      KA.state.getUiState().bgmEnabled = event.target.value === "true";
      KA.state.saveAppData();
      KA.state.saveUiState();
      syncBgmState();
    });
    appEl.querySelector("#effects-setting").addEventListener("change", function (event) {
      var enabled = event.target.value === "true";
      KA.state.getAppData().settings.effectsEnabled = enabled;
      KA.state.getAppData().settings.soundEnabled = enabled;
      KA.state.getUiState().effectsEnabled = enabled;
      KA.state.getUiState().soundEnabled = enabled;
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
    document.addEventListener("pointerdown", syncBgmState, { once: true });
  }

  KA.app = {
    init: initApp,
    toast: toast,
    confirmDialog: confirmDialog,
    infoDialog: infoDialog,
    playTone: playTone,
    syncBgmState: syncBgmState,
    escapeHtml: escapeHtml
  };

  document.addEventListener("DOMContentLoaded", initApp);
})(window, document);
