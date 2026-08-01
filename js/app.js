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
  var parentColoringDragState = null;
  var eggCareEffect = null;
  var birdHouseReaction = null;
  var birdHouseTapCooldown = {};
  var nicknameDialogReturnFocus = null;
  var evolutionDialogReturnFocus = null;
  var mealFeedInProgress = false;
  var specialRewardInProgress = false;
  var specialRewardStatusMessage = "";
  var specialRewardDialogReturnFocus = null;
  var parentCompanionGalleryStage = 1;
  var outingSelection = { companionId: null, destinationId: null, confirming: false };
  var startupState = {
    startupStarted: false,
    appInitialized: false,
    firstRenderCompleted: false,
    splashFinished: false,
    startedAt: 0,
    minMs: 1200,
    maxMs: 4000,
    error: null
  };

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

  function ownedCompanions(data) {
    if (!KA.companions || !KA.companions.ensureCompanions) return [];
    return KA.companions.ensureCompanions(data || KA.state.getAppData()).filter(function (companion) {
      return companion &&
        KA.companions.isValidSpeciesId(companion.speciesId) &&
        Number(companion.hatchCount || 0) > 0;
    });
  }

  function ownedCompanionById(data, companionId) {
    if (typeof companionId !== "string" || !companionId) return null;
    return ownedCompanions(data).filter(function (companion) {
      return companion.id === companionId || companion.speciesId === companionId;
    })[0] || null;
  }

  function setSelectedCompanionId(companionId) {
    var data = KA.state.getAppData();
    var ui = KA.state.getUiState();
    var companion = ownedCompanionById(data, companionId);
    var validId = companion ? companion.speciesId : null;
    ui.selectedCompanionId = validId;
    ui.kitchenPreselectedCompanionId = validId;
    KA.state.saveUiState();
    return validId;
  }

  function getSelectedCompanion(data, preferredId) {
    var ui = KA.state.getUiState();
    var companion = ownedCompanionById(data, preferredId || ui.selectedCompanionId);
    if (!companion && ui.selectedCompanionId) {
      ui.selectedCompanionId = null;
      ui.kitchenPreselectedCompanionId = null;
      KA.state.saveUiState();
    }
    return companion;
  }

  function rememberCompanionReturnRoute(companionId) {
    var ui = KA.state.getUiState();
    var current = KA.router.getCurrent();
    var route = current && current.name;
    if (route !== "home" && route !== "eggs" && route !== "bird-house") route = "home";
    ui.companionDetailReturnRoute = route;
    ui.companionDetailReturnParams = route === "bird-house"
      ? { companionId: companionId }
      : {};
    ui.companionDetailReturnScrollY = Math.max(0, Number(global.scrollY || 0));
    KA.state.saveUiState();
  }

  function openCompanionDetail(companionId) {
    var selectedId = setSelectedCompanionId(companionId);
    if (!selectedId) {
      toast("まだ なかまになっていないよ");
      return false;
    }
    rememberCompanionReturnRoute(selectedId);
    KA.router.navigate("companion-detail", { companionId: selectedId });
    return true;
  }

  function bindCompanionDetailEntries(root) {
    var scope = root || appEl;
    Array.prototype.forEach.call(scope.querySelectorAll("[data-companion-detail]"), function (el) {
      el.addEventListener("click", function () {
        openCompanionDetail(el.getAttribute("data-companion-detail"));
      });
    });
  }

  function focusCompanionEntry(companionId, scrollY) {
    global.setTimeout(function () {
      var safeId = String(companionId || "").replace(/"/g, '\\"');
      var selector = '[data-companion-detail="' + safeId + '"], [data-house-bird="' + safeId + '"]';
      var entry = appEl && appEl.querySelector(selector);
      if (entry) entry.focus();
      if (typeof scrollY === "number" && isFinite(scrollY)) global.scrollTo(0, Math.max(0, scrollY));
    }, 40);
  }

  function returnFromCompanionDetail(companionId) {
    var ui = KA.state.getUiState();
    var route = ui.companionDetailReturnRoute;
    var params = ui.companionDetailReturnParams;
    var scrollY = Number(ui.companionDetailReturnScrollY || 0);
    if (route !== "home" && route !== "eggs" && route !== "bird-house") route = "home";
    if (!params || typeof params !== "object" || Array.isArray(params)) params = {};
    if (route === "eggs") ui.eggTab = "companions";
    KA.state.saveUiState();
    KA.router.navigate(route, params);
    focusCompanionEntry(companionId, scrollY);
  }

  function companionIsTraveling(data, companionId) {
    if (!KA.outings || !KA.outings.ensureOuting) return false;
    var outing = KA.outings.ensureOuting(data);
    var trip = outing && outing.activeTrip;
    return Boolean(
      trip &&
      trip.status === "traveling" &&
      (trip.companionId === companionId || trip.speciesId === companionId)
    );
  }

  function companionFedToday(companion) {
    if (!companion || !companion.lastFedAt) return false;
    var fedAt = new Date(companion.lastFedAt);
    return !isNaN(fedAt.getTime()) && KA.date.localDateKey(fedAt) === KA.date.localDateKey();
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
    if (KA.router.getCurrent().name === "parent" && route !== "parent" && isParentColoringDirty()) {
      parentColoringLeaveDialog(route, params);
      return;
    }
    if ((KA.router.getCurrent().name === "parent" || KA.router.getCurrent().name === "data") &&
        route !== "parent" && route !== "data" && KA.parentMode && KA.parentMode.revokeSession) {
      KA.parentMode.revokeSession();
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
      '<h1 tabindex="-1" data-screen-title>' + escapeHtml(title || KA.constants.APP_DISPLAY_NAME) + '</h1>',
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
          if (KA.parentMode && KA.parentMode.authorizeSession) KA.parentMode.authorizeSession();
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
        kind === "warm" ? [440, 554, 659] :
        kind === "song" ? [523, 659, 784, 659] :
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
    return KA.eggs && KA.eggs.statusLabel ? KA.eggs.statusLabel(state) : "たまご";
  }

  function companionDisplayName(companion) {
    if (!KA.companions || !KA.companions.getCompanionDisplayName) return "なかま";
    return KA.companions.getCompanionDisplayName(companion);
  }

  function companionEvolutionProgress(companion) {
    if (!KA.companions || !KA.companions.getEvolutionProgress) {
      return { stage: 1, label: "ちいさなすがた", nextStage: 2, nextLevel: 3, remaining: 2 };
    }
    return KA.companions.getEvolutionProgress(companion);
  }

  function isLegendarySpecies(species) {
    return Boolean(KA.companions && KA.companions.isLegendaryCompanionSpecies &&
      KA.companions.isLegendaryCompanionSpecies(species));
  }

  function legendaryBadgeHtml(species) {
    return isLegendarySpecies(species)
      ? '<span class="badge legendary-badge">でんせつ</span>'
      : "";
  }

  function legendaryCardClass(species) {
    return isLegendarySpecies(species) ? " is-legendary-companion" : "";
  }

  function legendaryAriaPrefix(species) {
    return isLegendarySpecies(species) ? "でんせつのなかま、" : "";
  }

  function companionPresentation(speciesOrId, companion, options) {
    var species = typeof speciesOrId === "string" ? KA.companions.getSpecies(speciesOrId) : speciesOrId;
    var opts = options || {};
    if (!species) return "";
    return [
      '<span class="companion-presentation' + legendaryCardClass(species) + '">',
      KA.companions.renderCompanion(species.id, {
        companion: companion || null,
        silhouette: Boolean(opts.silhouette),
        stage: opts.stage,
        displayName: opts.displayName
      }),
      legendaryBadgeHtml(species),
      '</span>'
    ].join("");
  }

  function bindDialogFocusTrap(dialog) {
    if (!dialog) return;
    dialog.addEventListener("keydown", function (event) {
      var focusable;
      var first;
      var last;
      if (event.key !== "Tab") return;
      focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      first = focusable[0];
      last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function showNextSpecialRewardNotification() {
    var rewards;
    var reward;
    var dialog;
    var closeButton;
    if (!modalRoot || modalRoot.children.length || KA.router.getCurrent().name !== "home" ||
        !KA.stars || !KA.stars.pendingSpecialRewards) return false;
    rewards = KA.stars.pendingSpecialRewards();
    if (!rewards.length) return false;
    reward = rewards[0];
    modalRoot.innerHTML = [
      '<div class="modal special-reward-receive-modal" role="dialog" aria-modal="true" aria-labelledby="special-reward-receive-title">',
      '<div class="special-reward-stars" aria-hidden="true"><span>★</span><span>✦</span><span>★</span></div>',
      '<p class="eyebrow">おとなから</p>',
      '<h2 id="special-reward-receive-title">とくべつな ごほうび！</h2>',
      '<p class="special-reward-amount" aria-live="polite"><strong>' + Number(reward.amount).toLocaleString("ja-JP") + '</strong>スター<br>もらったよ！</p>',
      reward.note ? '<p class="special-reward-note">' + escapeHtml(reward.note) + '</p>' : '',
      '<div class="modal-actions">' + button("うけとったよ", "btn-primary", 'data-close-special-reward') + '</div>',
      '</div>'
    ].join("");
    dialog = modalRoot.querySelector(".special-reward-receive-modal");
    closeButton = modalRoot.querySelector("[data-close-special-reward]");
    function finish() {
      KA.stars.markSpecialRewardSeen(reward.id);
      closeDialog();
      global.setTimeout(showNextSpecialRewardNotification, 0);
    }
    closeButton.addEventListener("click", finish);
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    });
    bindDialogFocusTrap(dialog);
    global.setTimeout(function () { closeButton.focus(); }, 0);
    return true;
  }

  function evolutionProgressHtml(companion, compact) {
    var progress = companionEvolutionProgress(companion);
    if (compact) {
      return '<span class="badge evolution-badge">なかよし進化: ' + escapeHtml(progress.label) + '</span>';
    }
    return [
      '<section class="companion-evolution-status" aria-label="なかよし進化の状況">',
      '<p class="eyebrow">なかよし進化</p>',
      '<p><strong>いま: ' + escapeHtml(progress.label) + '</strong></p>',
      progress.stage < 3
        ? '<p class="muted">なかよしレベル' + progress.nextLevel + 'で<br>' + escapeHtml(KA.companions.getEvolutionStageLabel(progress.nextStage)) + '</p><p class="evolution-next">つぎの せいちょうまで あと' + progress.remaining + '</p>'
        : '<p class="evolution-next">いちばん なかよしなすがただよ！</p>',
      '</section>'
    ].join("");
  }

  function focusAfterEvolutionDialog() {
    var returnFocus = evolutionDialogReturnFocus;
    evolutionDialogReturnFocus = null;
    if (returnFocus && document.body.contains(returnFocus)) {
      returnFocus.focus();
      return;
    }
    var fallback = appEl && appEl.querySelector("[data-show-evolution], button, [tabindex]");
    if (fallback) fallback.focus();
  }

  function closeEvolutionDialog() {
    closeDialog();
    focusAfterEvolutionDialog();
  }

  function showCompanionEvolutionDialog(companions, returnFocus) {
    var list = Array.isArray(companions) ? companions : [companions];
    list = list.filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    });
    if (!list.length) return false;
    var hasLegendary = list.some(function (companion) {
      return isLegendarySpecies(KA.companions.getSpecies(companion.speciesId));
    });
    evolutionDialogReturnFocus = returnFocus || document.activeElement;
    list.forEach(function (companion) {
      KA.companions.markEvolutionStageSeen(companion);
    });
    KA.state.saveAppData();
    modalRoot.innerHTML = [
      '<div class="modal companion-evolution-modal' + (hasLegendary ? ' has-legendary-evolution' : '') + '" role="dialog" aria-modal="true" aria-labelledby="companion-evolution-title">',
      '<div class="companion-evolution-announcement" aria-live="polite">',
      '<p class="eyebrow">もっと すてきなすがたに なったよ！</p>',
      '<h2 id="companion-evolution-title">なかよし進化</h2>',
      '<div class="companion-evolution-list">',
      list.map(function (companion) {
        var species = KA.companions.getSpecies(companion.speciesId);
        var progress = companionEvolutionProgress(companion);
        var displayName = companionDisplayName(companion);
        var legendary = isLegendarySpecies(species);
        return [
          '<article class="companion-evolution-result' + legendaryCardClass(species) + '">',
          '<div class="companion-evolution-glow" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>',
          '<div class="companion-evolution-art">' + companionPresentation(species, companion) + '</div>',
          '<h3 class="companion-display-name">' + escapeHtml(displayName) + 'が<br>なかよし進化したよ！</h3>',
          '<p><strong>' + escapeHtml(progress.label) + '</strong>に なったよ！</p>',
          '</article>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>',
      '<div class="modal-actions">',
      button("とじる", "btn-primary", 'data-close-companion-evolution'),
      '</div>',
      '</div>'
    ].join("");
    var dialog = modalRoot.querySelector(".companion-evolution-modal");
    var closeButton = modalRoot.querySelector("[data-close-companion-evolution]");
    closeButton.addEventListener("click", closeEvolutionDialog);
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEvolutionDialog();
      }
    });
    global.setTimeout(function () {
      closeButton.focus();
    }, 0);
    return true;
  }

  function pendingEvolutionNotice(data) {
    var pending = KA.companions && KA.companions.pendingEvolutionCompanions
      ? KA.companions.pendingEvolutionCompanions(data)
      : [];
    if (!pending.length) return "";
    return [
      '<section class="panel panel-pad evolution-home-notice" aria-live="polite">',
      '<div><p class="eyebrow">なかよし進化</p><h2>なかよし進化した なかまがいるよ！</h2>',
      '<p class="muted">' + pending.length + 'わの せいちょうを みてみよう。</p></div>',
      button("せいちょうを みる", "btn-primary", 'data-show-evolution'),
      '</section>'
    ].join("");
  }

  function favoriteCompanionCard() {
    if (!KA.companions || !KA.companions.ensureCompanions) return "";
    var data = KA.state.getAppData();
    var owned = KA.companions.ensureCompanions(data).filter(function (item) {
      return item && KA.companions.isValidSpeciesId(item.speciesId) && Number(item.hatchCount || 0) > 0;
    });
    var house = KA.birdHouse && KA.birdHouse.ensureBirdHouse ? KA.birdHouse.ensureBirdHouse(data) : null;
    if (house) KA.state.saveAppData();
    var companion = KA.companions.favoriteCompanion(data) || owned[0];
    if (!companion) {
      return [
        '<div class="panel panel-pad companion-home-card">',
        '<div><p class="eyebrow">いっしょに ぼうけん</p><h3>とりさんキッチン</h3>',
        '<p class="muted">たまごから なかまが うまれたら<br>ごはんを つくれるよ！</p>',
        '<p class="muted">たまごから なかまが うまれたら<br>おうちで いっしょに あそべるよ！</p>',
        '<div class="quick-actions">' + button("とりのおうちへ", "btn-soft btn-small", 'disabled aria-disabled="true"') + '</div></div>',
        '</div>'
      ].join("");
    }
    var species = KA.companions.getSpecies(companion.speciesId);
    if (!species) return "";
    var displayName = companionDisplayName(companion);
    return [
      '<div class="panel panel-pad companion-home-card">',
      '<div class="companion-home-art">' + companionPresentation(species, companion) + '</div>',
      '<div><p class="eyebrow">いっしょに ぼうけん</p><h3 class="companion-display-name">' + escapeHtml(displayName) + '</h3>',
      '<p><span class="badge star">なかよし ' + Number(companion.bondLevel || 1) + '</span> ' + evolutionProgressHtml(companion, true) + '</p>',
      '<div class="quick-actions">' + button("このこの ようすをみる", "btn-primary btn-small", 'data-companion-detail="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(displayName) + 'の ようすをみる"') + '</div></div>',
      '</div>'
    ].join("");
  }

  function forestMiniPreview() {
    var count = KA.state.getAppData().artworks.length;
    return '<div class="preview-wrap" aria-hidden="true"><svg viewBox="0 0 320 160"><rect width="320" height="160" fill="#BDEEFF"/><circle cx="270" cy="32" r="20" fill="#FACC15"/><path d="M0 104 C70 84 125 120 190 96 C250 74 290 92 320 80 L320 160 L0 160 Z" fill="#8BD17E"/><path d="M50 112 L70 54 L90 112 Z" fill="#4F9F54"/><path d="M210 116 L238 44 L266 116 Z" fill="#3F8F46"/><text x="18" y="145" fill="#2F7837" font-size="18" font-weight="800">せかいのさくひん ' + count + '</text></svg></div>';
  }

  function renderCompanionStatus(data) {
    var egg = KA.eggs && KA.eggs.activeEgg ? KA.eggs.activeEgg(data) : null;
    var owned = ownedCompanions(data);
    var eggMessage = "";
    if (egg) {
      var target = KA.eggs.targetForEgg ? KA.eggs.targetForEgg(egg) : Number(egg.targetGrowthPoints || 6);
      var progress = Math.max(0, Math.min(target, Number(egg.growthPoints || 0)));
      var remaining = Math.max(0, target - progress);
      eggMessage = '<p class="companion-status-egg"><strong>たまご:</strong> ' + (remaining ? 'あと' + remaining + 'ポイント' : 'うまれる じゅんびが できたよ！') + '</p>';
    }
    return [
      '<section class="panel panel-pad companion-status-card" aria-labelledby="companion-status-title">',
      '<div class="section-heading"><div><p class="eyebrow">くらべて みられるよ</p><h2 id="companion-status-title">なかまのようす</h2></div><span class="badge">' + owned.length + 'わ</span></div>',
      eggMessage,
      owned.length ? '<div class="companion-status-grid">' + owned.map(function (companion) {
        var species = KA.companions.getSpecies(companion.speciesId);
        var displayName = companionDisplayName(companion);
        var traveling = companionIsTraveling(data, companion.speciesId);
        return [
          '<button class="companion-status-item' + legendaryCardClass(species) + '" data-companion-detail="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(legendaryAriaPrefix(species) + displayName) + 'の ようすをみる">',
          '<span class="companion-status-art">' + companionPresentation(species, companion) + '</span>',
          '<span class="companion-status-copy"><strong class="companion-display-name">' + escapeHtml(displayName) + '</strong>',
          '<small>なかよし ' + Number(companion.bondLevel || 1) + '<br>' + escapeHtml(companionEvolutionProgress(companion).label) + '</small>',
          '<small class="companion-status-state">' + (traveling ? "おでかけちゅう" : (companionFedToday(companion) ? "きょう ごはん済み" : "きょうは まだだよ")) + '</small></span>',
          '</button>'
        ].join("");
      }).join("") + '</div>' : '<p>たまごから どんな なかまが<br>うまれるかな？</p>',
      '</section>'
    ].join("");
  }

  function renderOutingHomeCard(data) {
    if (!KA.outings || !KA.outings.ensureOuting) return "";
    var synced = KA.outings.syncTripStatus(data, KA.date.localDateKey());
    if (synced.changed) KA.state.saveAppData();
    var outing = KA.outings.ensureOuting(data);
    var owned = KA.companions.ensureCompanions(data).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    });
    var prep = KA.outings.preparationStatus(data);
    var trip = outing.activeTrip;
    var species = trip ? KA.companions.getSpecies(trip.speciesId) : null;
    var tripCompanion = trip ? KA.companions.getCompanion(data, trip.speciesId) : null;
    var destination = trip ? KA.outings.getDestination(trip.destinationId) : null;
    var departedToday = outing.history.some(function (item) { return item.departedDateKey === KA.date.localDateKey(); });
    var message;
    var action;
    if (!owned.length) {
      message = "たまごから なかまが うまれたら<br>いっしょに おでかけできるよ！";
      action = button("おでかけする", "btn-soft", 'disabled aria-disabled="true"');
    } else if (trip && trip.status === "returned") {
      message = "おかえり！<br>おみやげが あるよ！";
      action = button("おみやげを うけとる", "btn-primary", 'data-route="outing"');
    } else if (trip) {
      message = escapeHtml(tripCompanion ? companionDisplayName(tripCompanion) : (species ? species.name : "なかま")) + "は " + escapeHtml(destination ? destination.name : "おでかけさき") + "へ<br>おでかけしているよ！<br><small>しゅっぱつ: " + escapeHtml(KA.date.formatDisplayDate(trip.departedDateKey)) + "</small>";
      action = button("ようすを みる", "btn-soft", 'data-route="outing"');
    } else if (departedToday) {
      message = "きょうの おでかけは おしまい。<br>また あした いこうね！";
      action = button("おでかけの きろく", "btn-soft", 'data-route="outing"');
    } else {
      message = prep.complete ? "おでかけの じゅんびが できたよ！" : "おでかけの じゅんびを しよう！";
      action = button(prep.complete ? "おでかけする" : "じゅんびを みる", prep.complete ? "btn-primary" : "btn-soft", 'data-route="outing"');
    }
    return [
      '<section class="panel panel-pad outing-home-card" aria-labelledby="outing-home-title">',
      '<div class="section-heading"><div><p class="eyebrow">いっしょに いこう</p><h2 id="outing-home-title">なかまと おでかけ</h2></div></div>',
      '<p>' + message + '</p>',
      owned.length && !trip ? '<div class="outing-prep-mini" aria-label="おでかけの準備 ' + prep.count + 'つ完了"><span>' + (prep.job ? "✓" : "□") + ' おしごと</span><span>' + (prep.care ? "✓" : "□") + ' おせわ</span><span>' + (prep.food ? "✓" : "□") + ' ごはん</span></div>' : '',
      '<div class="quick-actions">' + action + '</div>',
      '</section>'
    ].join("");
  }

  function getHomeAdventureSnapshot(data) {
    var today = KA.date.localDateKey();
    var outing = KA.outings && KA.outings.ensureOuting ? KA.outings.ensureOuting(data) : { activeTrip: null, history: [] };
    if (KA.outings && KA.outings.syncTripStatus) {
      var synced = KA.outings.syncTripStatus(data, today);
      if (synced.changed) KA.state.saveAppData();
      outing = KA.outings.ensureOuting(data);
    }
    var prep = KA.outings && KA.outings.preparationStatus
      ? KA.outings.preparationStatus(data)
      : { job: false, care: false, food: false, count: 0, complete: false };
    var history = Array.isArray(outing.history) ? outing.history : [];
    var departedToday = history.some(function (item) {
      return item && item.departedDateKey === today;
    });
    var claimedToday = history.some(function (item) {
      if (!item || !item.claimedAt) return false;
      var claimedDate = new Date(item.claimedAt);
      return !isNaN(claimedDate.getTime()) && KA.date.localDateKey(claimedDate) === today;
    });
    return {
      today: today,
      prep: prep,
      trip: outing.activeTrip,
      outingDone: Boolean(outing.activeTrip) || departedToday,
      giftReady: Boolean(outing.activeTrip && outing.activeTrip.status === "returned"),
      giftReceived: claimedToday
    };
  }

  function renderHomeHero(data, snapshot) {
    var owned = KA.companions && KA.companions.ensureCompanions ? KA.companions.ensureCompanions(data).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    }) : [];
    var companion = KA.companions && KA.companions.favoriteCompanion ? KA.companions.favoriteCompanion(data) : null;
    companion = companion || owned[0] || null;
    var tripCompanion = snapshot.trip && KA.companions ? KA.companions.getCompanion(data, snapshot.trip.speciesId) : null;
    var tripSpecies = tripCompanion && KA.companions ? KA.companions.getSpecies(tripCompanion.speciesId) : null;
    var species = tripSpecies || (companion && KA.companions.getSpecies(companion.speciesId));
    var featuredCompanion = tripCompanion || companion;
    var egg = KA.eggs && KA.eggs.activeEgg ? KA.eggs.activeEgg(data) : null;
    var art = species && KA.companions
      ? companionPresentation(species, featuredCompanion)
      : (egg && KA.eggs.renderEggSvg ? KA.eggs.renderEggSvg(egg) : '<span class="home-hero-placeholder" aria-hidden="true">★</span>');
    var artLabel = featuredCompanion ? companionDisplayName(featuredCompanion) : (species ? species.name : (egg ? "たまご" : "これからの なかま"));
    var message;
    var actionLabel;
    var actionRoute;
    var actionAttrs;
    var actionClass = "btn-primary";

    if (snapshot.giftReady) {
      message = "おみやげが あるよ！";
      actionLabel = "おみやげを うけとる";
      actionRoute = "outing";
    } else if (snapshot.trip && snapshot.trip.status === "traveling") {
      message = escapeHtml(featuredCompanion ? companionDisplayName(featuredCompanion) : (species ? species.name : "なかま")) + "が おでかけを たのしんでいるよ";
      actionLabel = "おでかけの ようすをみる";
      actionRoute = "outing";
      actionClass = "btn-soft";
    } else if (featuredCompanion) {
      message = companionFedToday(featuredCompanion)
        ? escapeHtml(companionDisplayName(featuredCompanion)) + "の ようすを みてみよう"
        : "きょうは ごはんが まだだよ";
      actionLabel = companionFedToday(featuredCompanion) ? "このこの ようすをみる" : "ごはんを あげよう";
      actionAttrs = 'data-companion-detail="' + escapeHtml(featuredCompanion.speciesId) + '" aria-label="' + escapeHtml(companionDisplayName(featuredCompanion)) + 'の ようすをみる"';
    } else if (egg) {
      var target = KA.eggs.targetForEgg ? KA.eggs.targetForEgg(egg) : Number(egg.targetGrowthPoints || 6);
      var growth = Math.max(0, Math.min(target, Number(egg.growthPoints || 0)));
      var remaining = Math.max(0, target - growth);
      if (remaining === 0 || egg.state === "ready") {
        message = "たまごが うまれる じゅんびを しているよ！";
        actionLabel = "たまごを みる";
        actionRoute = "eggs";
      }
    }

    if (!message && !owned.length) {
      message = "たまごから どんな なかまが うまれるかな？";
      actionLabel = "たまごを おせわする";
      actionRoute = "eggs";
    } else if (!message && !snapshot.prep.job) {
      message = "まずは おしごとを ひとつ やってみよう";
      actionLabel = "おしごとへ";
      actionRoute = "tasks";
    } else if (!message && !snapshot.prep.care) {
      message = "きょうは おせわが まだだよ";
      actionLabel = "おせわする";
      actionRoute = "eggs";
    } else if (!message && !snapshot.prep.food) {
      message = "きょうは ごはんが まだだよ";
      actionLabel = "ごはんを つくる";
      actionRoute = "kitchen";
    } else if (!message && snapshot.prep.complete) {
      message = snapshot.outingDone ? "きょうも たくさん ぼうけんしたね！" : "おでかけの じゅんびが できたよ！";
      actionLabel = snapshot.outingDone ? "なかまに あいにいく" : "おでかけする";
      actionRoute = snapshot.outingDone ? "bird-house" : "outing";
    }

    if (!message) {
      message = "きょうも いっしょに あそぼう";
      actionLabel = "なかまに あいにいく";
      actionRoute = "bird-house";
    }

    return [
      '<section class="home-hero' + legendaryCardClass(species) + '" aria-labelledby="home-hero-title">',
      '<div class="home-hero-art" role="img" aria-label="' + escapeHtml(artLabel) + '">' + art + '</div>',
      '<div class="home-hero-copy">',
      '<p class="eyebrow">きょうの おすすめ</p>',
      '<h2 id="home-hero-title">きょうも いっしょに あそぼう</h2>',
      '<p class="home-hero-message">' + message + '</p>',
      button(actionLabel, actionClass + " home-hero-action", actionAttrs || ('data-route="' + actionRoute + '"')),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderHomeAdventure(snapshot) {
    var items = [
      { label: "おしごと", done: snapshot.prep.job, detail: snapshot.prep.job ? "できた！" : "まだだよ" },
      { label: "おせわ", done: snapshot.prep.care, detail: snapshot.prep.care ? "できた！" : "まだだよ" },
      { label: "ごはん", done: snapshot.prep.food, detail: snapshot.prep.food ? "できた！" : "まだだよ" },
      { label: "おでかけ", done: snapshot.outingDone, detail: snapshot.outingDone ? "しゅっぱつ済み" : "これから" },
      { label: "おみやげ", done: snapshot.giftReady || snapshot.giftReceived, detail: snapshot.giftReady ? "うけとれるよ" : (snapshot.giftReceived ? "うけとったよ" : "まだだよ"), alert: snapshot.giftReady }
    ];
    return [
      '<section class="panel panel-pad home-adventure-card" aria-labelledby="home-adventure-title">',
      '<div class="section-heading"><div><p class="eyebrow">ひとめで わかるよ</p><h2 id="home-adventure-title">きょうの ぼうけん</h2></div>',
      '<span class="badge">' + snapshot.prep.count + '/3 じゅんび</span></div>',
      '<div class="home-adventure-grid">',
      items.map(function (item) {
        return [
          '<div class="home-adventure-item ' + (item.done ? "is-done" : "") + (item.alert ? " is-alert" : "") + '">',
          '<span class="home-adventure-mark" aria-hidden="true">' + (item.done ? "✓" : "□") + '</span>',
          '<span><strong>' + item.label + '</strong><small>' + item.detail + '</small></span>',
          '</div>'
        ].join("");
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderHome() {
    var data = KA.state.getAppData();
    getSelectedCompanion(data);
    var record = KA.state.getDailyRecord();
    var tasks = KA.tasks.activeTasks();
    var completed = KA.tasks.completedDailyTasks();
    var snapshot = getHomeAdventureSnapshot(data);
    var body = [
      '<section class="home-flow">',
      renderHomeHero(data, snapshot),
      pendingEvolutionNotice(data),
      '<div class="home-star-strip" role="group" aria-label="スターの数">',
      '<div class="home-star-mini" aria-label="つかえるほし ' + Number(data.profile.starTotals.spendableStars || 0) + 'こ"><span>つかえるほし</span><strong>⭐' + Number(data.profile.starTotals.spendableStars || 0) + '</strong></div>',
      '<div class="home-star-mini" aria-label="あつめたほし ' + Number(data.profile.starTotals.lifetimeStars || 0) + 'こ"><span>あつめたほし</span><strong>⭐' + Number(data.profile.starTotals.lifetimeStars || 0) + '</strong></div>',
      '</div>',
      renderHomeAdventure(snapshot),
      renderCompanionStatus(data),
      renderOutingHomeCard(data),
      '<section class="home-support-stack" aria-label="そのほかの ぼうけん">',
      '<div class="home-quick-summary"><span class="badge">おしごと ' + completed.length + ' / ' + tasks.length + '</span><span class="badge">さくひん ' + record.artworkIds.length + '</span></div>',
      button("🥚 ふしぎなたまご " + KA.eggs.eggCount() + "こ", "btn-soft egg-button", 'data-route="eggs"'),
      '<div class="home-world-peek">' + forestMiniPreview() + '</div>',
      dataIssueMessage(),
      '</section>',
      '</section>'
    ].join("");
    layout(KA.constants.APP_DISPLAY_NAME, body, { subtitle: KA.constants.VERSION_LABEL });
    var evolutionButton = appEl.querySelector("[data-show-evolution]");
    if (evolutionButton) {
      evolutionButton.addEventListener("click", function () {
        showCompanionEvolutionDialog(KA.companions.pendingEvolutionCompanions(data), evolutionButton);
      });
    }
    bindCompanionDetailEntries(appEl);
    global.setTimeout(showNextSpecialRewardNotification, 0);
  }

  function renderTasks() {
    var tasks = KA.tasks.activeTasks();
    var completed = KA.tasks.completedDailyTasks();
    var html = [
      '<div class="screen-header"><div><h2>きょうのおしごと</h2><p class="muted">できたら大きなボタンをおしてね。</p></div><div>' + starPill() + '</div></div>',
      '<section class="grid">'
    ];
    tasks.forEach(function (task) {
      var done = KA.tasks.isCompleted(task.taskId);
      html.push([
        '<article class="task-card ' + (done ? "is-done" : "") + '">',
        '<div class="task-icon">' + KA.tasks.renderTaskIcon(task) + '</div>',
        '<div><h3>' + escapeHtml(task.title) + '</h3>',
        task.description ? '<p class="muted task-description">' + escapeHtml(task.description) + '</p>' : '',
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
        if (result.eggGrowth && result.eggGrowth.ok) {
          global.setTimeout(function () {
            playTone(result.eggGrowth.ready ? "hatch" : "egg");
            toast("おしごとを がんばったから たまごが そだったよ！");
          }, 560);
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
      var requiredStars = KA.coloring.getEffectiveColoringStarCost(template.templateId);
      body.push([
        '<article class="coloring-card">',
        '<div class="coloring-preview preview-wrap">' + KA.coloring.renderTemplate(template.templateId, {}, "") + '</div>',
        '<h3>' + escapeHtml(template.icon + " " + template.title) + '</h3>',
        '<p><span class="badge star">⭐ ' + requiredStars + '</span> ' + (unlocked ? '<span class="badge">ひらいた</span>' : '<span class="badge">まだ</span>') + '</p>',
        unlocked ? button("ぬる", "btn-primary", 'data-edit-coloring="' + template.templateId + '"') :
          button(totals.spendableStars >= requiredStars ? "かいほうする" : "もうすこし", totals.spendableStars >= requiredStars ? "btn-sun" : "btn-soft", 'data-unlock-coloring="' + template.templateId + '"'),
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
        var requiredStars = KA.coloring.getEffectiveColoringStarCost(template.templateId);
        if (KA.state.getAppData().profile.starTotals.spendableStars < requiredStars) {
          toast("もうすこしで かいほうできるよ");
          return;
        }
        confirmDialog(template.title + "をひらく？", "つかえるほしを " + requiredStars + " つかいます。", "ひらく", function () {
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
        if (result.eggGrowth && result.eggGrowth.ok) {
          toast("ぬりえが できたから たまごが ひかったよ！");
        }
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
    if (id === "world_secret_base") {
      return [
        '<svg class="forest-bg world-bg world-bg-secret-base" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">',
        '<rect width="100" height="100" fill="#ffe8bd"/>',
        '<path d="M0 0 H100 V63 H0 Z" fill="#f7d59b"/><path d="M0 63 H100 V100 H0 Z" fill="#d59b5b"/>',
        '<g stroke="#c4894e" stroke-width=".45" opacity=".55"><path d="M0 10 H100 M0 22 H100 M0 34 H100 M0 46 H100 M0 58 H100"/><path d="M10 0 V63 M23 0 V63 M37 0 V63 M51 0 V63 M65 0 V63 M79 0 V63 M93 0 V63"/></g>',
        '<path d="M0 63 C20 66 38 62 54 65 C72 68 88 64 100 66 V100 H0 Z" fill="#cf9153"/><g stroke="#b6783e" stroke-width=".6" opacity=".5"><path d="M0 72 H100 M0 82 H100 M0 92 H100"/><path d="M12 64 L6 100 M36 64 L31 100 M62 65 L68 100 M85 64 L93 100"/></g>',
        '<path d="M8 6 H92 V13 H8 Z" fill="#8b5a2b"/><path d="M20 13 C22 24 18 35 22 46" stroke="#8b5a2b" stroke-width="1.4" fill="none" opacity=".45"/><path d="M62 13 C64 24 60 36 64 48" stroke="#8b5a2b" stroke-width="1.4" fill="none" opacity=".45"/>',
        '<path d="M68 11 C76 5 90 9 91 20 C94 24 92 32 86 34 H67 C60 31 61 19 68 11 Z" fill="#9be7ff" stroke="#a66d38" stroke-width="1.2"/><path d="M78 9 V34 M62 22 H92" stroke="#fff7dd" stroke-width=".9"/><path d="M64 36 C71 39 83 39 90 36" stroke="#f2b96e" stroke-width="2" fill="none"/>',
        '<path d="M43 7 C48 2 58 4 60 11 C63 19 57 24 51 25 C43 24 38 18 40 11 Z" fill="#fff4a3" opacity=".9"/><path d="M50 24 V32" stroke="#d19047" stroke-width="1.2"/><path d="M46 32 H55" stroke="#d19047" stroke-width="1.2"/>',
        '<path d="M42 26 H60 V43 H42 Z" fill="#f5e7c2" stroke="#a66d38" stroke-width=".9"/><path d="M45 30 L52 27 L57 32 L54 39 L47 39 Z" fill="#d9c17e" stroke="#9a7d3d" stroke-width=".6"/><path d="M44 44 H59" stroke="#8b5a2b" stroke-width="1.1"/>',
        '<path d="M8 28 H35 V35 H8 Z" fill="#b77943" stroke="#7a4a26" stroke-width=".9"/><path d="M9 35 H37 V65 H9 Z" fill="#f0c07a" stroke="#7a4a26" stroke-width=".9"/><path d="M11 39 H20 V48 H11 Z M22 39 H35 V48 H22 Z" fill="#f8e2b6" stroke="#a66d38" stroke-width=".55"/><path d="M11 50 H20 V63 H11 Z M22 50 H35 V63 H22 Z" fill="#d89b5d" stroke="#a66d38" stroke-width=".55"/><circle cx="15.5" cy="56" r=".7" fill="#7a4a26"/><circle cx="29" cy="56" r=".7" fill="#7a4a26"/>',
        '<path d="M14 30 H22 C22 33 20 35 18 35 C16 35 14 33 14 30 Z" fill="#d9f6ff" stroke="#7097a1" stroke-width=".65"/><path d="M18 30 C18 27 22 27 22 30" fill="none" stroke="#5b7d86" stroke-width=".7"/><path d="M24 30 H34 V34 H24 Z" fill="#2f2f34" opacity=".75"/><circle cx="27" cy="32" r="1.2" fill="#f59e0b"/><circle cx="31" cy="32" r="1.2" fill="#f59e0b"/>',
        '<path d="M10 20 H34 V27 H10 Z" fill="#a76836" stroke="#73451f" stroke-width=".8"/><g fill="#fff8dc" stroke="#8a6030" stroke-width=".45"><path d="M13 23 C13 20 18 20 18 23 Z"/><rect x="21" y="21" width="3.5" height="4" rx=".5"/><rect x="27" y="21" width="4" height="4" rx=".5"/></g><path d="M35 21 C37 24 36 28 34 31" fill="none" stroke="#6f421d" stroke-width=".75"/><path d="M36 19 L39 21 L37 23" fill="none" stroke="#6f421d" stroke-width=".75"/>',
        '<path d="M57 67 C64 59 82 59 90 67 L86 73 H61 Z" fill="#b87943" stroke="#70421f" stroke-width="1"/><path d="M60 73 H87 V78 H60 Z" fill="#8b5a2b"/><path d="M64 78 V92 M83 78 V92" stroke="#70421f" stroke-width="2.2" stroke-linecap="round"/><path d="M55 76 C51 80 51 89 57 91 C60 86 60 80 57 76 Z" fill="#c79255" stroke="#70421f" stroke-width=".8"/><path d="M88 77 C94 80 94 89 88 92 C85 87 85 80 88 77 Z" fill="#c79255" stroke="#70421f" stroke-width=".8"/>',
        '<path d="M68 62 H75 L77 68 H66 Z" fill="#fff1b8" stroke="#9a6b31" stroke-width=".65"/><path d="M79 62 C84 60 88 63 87 68 H80 Z" fill="#f8e0a2" stroke="#9a6b31" stroke-width=".65"/><path d="M62 63 H67 V69 H62 Z" fill="#b8e4ff" stroke="#6d8ba0" stroke-width=".55"/><path d="M61 61 L72 56 L82 61" fill="none" stroke="#80512a" stroke-width=".9"/><path d="M70 56 H81 V61 H70 Z" fill="#f3e7bf" stroke="#80512a" stroke-width=".55"/>',
        '<path d="M37 74 C45 69 58 69 67 75 C64 87 43 89 35 79 Z" fill="#f5b3a5" opacity=".78" stroke="#bd7b65" stroke-width=".8"/><path d="M27 82 H39 V90 H27 Z" fill="#d8a15c" stroke="#73451f" stroke-width=".75"/><path d="M29 78 H37 V82 H29 Z" fill="#facc15" stroke="#73451f" stroke-width=".65"/><path d="M25 74 C31 70 36 72 40 76 C34 80 29 79 25 74 Z" fill="#8ccf6a"/>',
        '<g fill="#fef3c7" stroke="#93642f" stroke-width=".45"><path d="M8 70 H21 V78 H8 Z"/><path d="M12 66 H26 V72 H12 Z"/><path d="M17 73 H28 V82 H17 Z"/></g><path d="M12 72 L21 72 M17 76 L25 76" stroke="#93642f" stroke-width=".45"/>',
        '<g fill="#fff7a8"><circle cx="22" cy="15" r="1"/><circle cx="32" cy="13" r=".8"/><circle cx="72" cy="48" r=".85"/><circle cx="88" cy="46" r=".7"/></g><path d="M11 16 C16 13 22 13 28 16 C22 18 16 18 11 16 Z" fill="#ef6fa6"/><path d="M11 16 C16 19 22 19 28 16" fill="none" stroke="#fbbf24" stroke-width=".65"/>',
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

  function findDraggedPlacement(placementId) {
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
        var placement = findDraggedPlacement(el.getAttribute("data-draggable-placement"));
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

  function renderAlbum() {
    var artworks = (KA.state.getAppData().artworks || []).slice().sort(function (a, b) {
      return String(b.completedAt || b.createdAt || "").localeCompare(String(a.completedAt || a.createdAt || ""));
    });
    var favorites = artworks.filter(function (artwork) {
      return artwork && artwork.favorite;
    });
    var body = [
      '<div class="screen-header"><div><h2>さくひん</h2><p class="muted">これまでのぬりえを見られるよ。</p></div><div><span class="badge">' + artworks.length + 'こ</span></div></div>',
      favorites.length ? '<section class="panel panel-pad"><h3>おきにいり</h3><div class="album-grid">' + favorites.map(artCard).join("") + '</div></section>' : '',
      '<section class="album-grid">',
      artworks.length ? artworks.map(artCard).join("") : '<div class="panel panel-pad"><h3>まだ さくひんはありません</h3><p class="muted">ぬりえを完成するとここに出ます。</p>' + button("ぬりえへ", "btn-primary", 'data-route="coloring-list"') + '</div>',
      '</section>'
    ].join("");
    layout("さくひん", body);
    bindArtworkDetails();
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
      completed.length ? completed.map(function (item) {
        var task = taskMap[item.taskId] || null;
        var title = task ? task.title : (item.taskTitle || "以前のおしごと");
        var icon = task ? KA.tasks.renderTaskIcon(task) : escapeHtml(item.taskIcon || "⭐");
        return '<li><span class="summary-task-icon" aria-hidden="true">' + icon + '</span> ' + escapeHtml(title) + '</li>';
      }).join("") : '<li>できたことがここに出るよ</li>',
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

  function eggDailyChecklist(activity) {
    var items = [
      { key: "petted", done: activity.petted, label: activity.petted ? "たまごを なでた" : "たまごを なでよう" },
      { key: "warmed", done: activity.warmed, label: activity.warmed ? "たまごを あたためた" : "たまごを あたためよう" },
      { key: "sang", done: activity.sang, label: activity.sang ? "うたを うたった" : "うたを うたおう" },
      { key: "jobBonus", done: activity.jobBonus, label: activity.jobBonus ? "おしごとを がんばった" : "おしごとを がんばろう" },
      { key: "coloringBonus", done: activity.coloringBonus, label: activity.coloringBonus ? "ぬりえを かんせいした" : "ぬりえを かんせいしよう" }
    ];
    var checklist = '<ul class="egg-checklist">' + items.map(function (item) {
      return '<li class="' + (item.done ? "is-done" : "") + '">' + (item.done ? '✓ ' : '・') + escapeHtml(item.label) + '</li>';
    }).join("") + '</ul>';
    if (items.every(function (item) { return item.done; })) {
      checklist += '<p class="egg-all-done">きょうのおせわは ばっちり！<br><span>あしたも おせわしてね</span></p>';
    }
    return checklist;
  }

  function renderEggPanel(data) {
    var eggs = KA.eggs.getEggs();
    var egg = KA.eggs.activeEgg(data);
    var activity = KA.eggs.todayActivity(data);
    var nextAt = KA.eggs.nextEggAt(data);
    var lifetime = Number((data.profile.starTotals || {}).lifetimeStars || 0);
    var toNext = Math.max(0, nextAt - lifetime);
    if (!eggs.length) {
      return '<div class="panel panel-pad egg-focus"><h3>まだ たまごはありません</h3><p>あと ' + toNext + 'こ スターをあつめると<br>あたらしい たまごが もらえるよ！</p>' + button("おしごとへ", "btn-primary", 'data-route="tasks"') + '</div>';
    }
    var target = egg ? KA.eggs.targetForEgg(egg) : KA.eggs.TARGET_GROWTH;
    var progress = egg ? Math.max(0, Math.min(target, Number(egg.growthPoints || 0))) : 0;
    var state = egg ? egg.state : "waiting";
    var message = egg ? (state === "ready" ? "もうすぐ うまれるよ！" : state === "cracked" ? "ひびが はいってきたよ" : state === "glowing" ? "きらきら ひかっているよ" : state === "warm" ? "ぽかぽか あたたかいよ" : "やさしく そだてよう") : "じゅんばんまちの たまごが あります";
    var firstNote = egg && egg.isFirstHatchEgg && egg.state !== "hatched" ? '<p class="egg-first-note">はじめての たまごは<br>すこし はやく うまれるよ！</p>' : '';
    var effectClass = eggCareEffect ? " is-care-" + eggCareEffect : "";
    function careButton(label, type, done) {
      return button(label, "btn-primary egg-care-button" + (done ? " is-done" : ""), 'data-care-egg="' + type + '" aria-label="' + escapeHtml(label) + '"');
    }
    return [
      '<div class="panel panel-pad egg-focus">',
      '<div class="egg-focus-header"><div><h3>いま そだてている たまご</h3><p><span class="badge">' + escapeHtml(eggStateLabel(state)) + '</span> <span class="badge star">' + progress + ' / ' + target + '</span></p></div></div>',
      '<div class="egg-big ' + (state === "ready" ? "is-ready" : "") + effectClass + '">' + (egg ? KA.eggs.renderEggSvg(egg) : '') + '</div>',
      '<p class="egg-message">' + escapeHtml(message) + '</p>',
      firstNote,
      '<div class="egg-care-actions">',
      careButton("たまごを なでる", "pet", activity.petted),
      careButton("たまごを あたためる", "warm", activity.warmed),
      careButton("うたを うたう", "sing", activity.sang),
      '</div>',
      '<div class="quick-actions">',
      egg && egg.state === "ready" ? button("うまれる！", "btn-sun", 'data-hatch-egg="' + escapeHtml(egg.id) + '"') : '',
      '</div>',
      '</div>',
      '<div class="panel panel-pad"><h3>きょう できること</h3>' + eggDailyChecklist(activity) + '</div>',
      '<div class="egg-count-grid">',
      '<div class="panel panel-pad"><strong>じゅんばんまち</strong><span>' + KA.eggs.waitingCount(data) + 'こ</span></div>',
      '<div class="panel panel-pad"><strong>うまれたたまご</strong><span>' + KA.eggs.hatchedCount(data) + 'こ</span></div>',
      '<div class="panel panel-pad"><strong>つぎのたまご</strong><span>あと ' + toNext + 'スター</span></div>',
      '</div>'
    ].join("");
  }

  function renderCompanionDex(data) {
    var companions = KA.companions.ensureCompanions(data);
    var companionBySpecies = {};
    companions.forEach(function (companion) { companionBySpecies[companion.speciesId] = companion; });
    return '<section class="companion-grid">' + KA.companions.allSpecies().map(function (species) {
      var companion = companionBySpecies[species.id];
      var owned = Boolean(companion && Number(companion.hatchCount || 0) > 0);
      var displayName = owned ? companionDisplayName(companion) : species.name;
      var hasNickname = owned && Boolean(companion.nickname);
      var content = [
        '<div class="companion-art">' + companionPresentation(species, companion, { silhouette: !owned }) + '</div>',
        '<h3 class="companion-display-name">' + escapeHtml(displayName) + '</h3>',
        hasNickname ? '<p class="companion-species-name">しゅるい: ' + escapeHtml(species.name) + '</p>' : '',
        owned ? '<p><span class="badge star">なかよし ' + Number(companion.bondLevel || 1) + '</span> <span class="badge">' + Number(companion.hatchCount || 1) + 'かい</span></p>' : '<p class="muted">まだ あっていないよ</p>',
        owned ? '<p class="muted">ごはん ' + Number(companion.mealCount || 0) + 'かい / なかよしごはん ' + Number(companion.bondMealProgress || 0) + '/3</p>' : '',
        owned ? evolutionProgressHtml(companion, false) : '',
        owned ? '<p class="muted">はじめて: ' + escapeHtml((companion.firstHatchedAt || "").slice(0, 10)) + '<br>さいご: ' + escapeHtml((companion.lastHatchedAt || "").slice(0, 10)) + '</p>' : '',
        owned ? '<span class="companion-card-open">このこの ようすをみる</span>' : ''
      ].join("");
      return owned
        ? '<button class="companion-card companion-card-button is-owned' + legendaryCardClass(species) + '" data-companion-detail="' + escapeHtml(species.id) + '" aria-label="' + escapeHtml(legendaryAriaPrefix(species) + displayName) + 'の ようすをみる">' + content + '</button>'
        : '<article class="companion-card is-locked' + legendaryCardClass(species) + '">' + content + '</article>';
    }).join("") + '</section>';
  }

  function focusCompanionNicknameButton(companionId) {
    global.setTimeout(function () {
      var selector = '[data-edit-companion-nickname="' + String(companionId || "").replace(/"/g, '\\"') + '"]';
      var buttonEl = appEl && appEl.querySelector(selector);
      if (buttonEl) buttonEl.focus();
    }, 0);
  }

  function closeCompanionNicknameDialog(companionId) {
    var returnFocus = nicknameDialogReturnFocus;
    nicknameDialogReturnFocus = null;
    closeDialog();
    if (returnFocus && document.body.contains(returnFocus)) returnFocus.focus();
    else focusCompanionNicknameButton(companionId);
  }

  function openCompanionNicknameDialog(companionId, returnFocus) {
    var data = KA.state.getAppData();
    var companion = KA.companions.getCompanion(data, companionId);
    var species = companion && KA.companions.getSpecies(companion.speciesId);
    if (!companion || !species || Number(companion.hatchCount || 0) < 1) {
      toast("まだ ニックネームは つけられないよ");
      return;
    }
    nicknameDialogReturnFocus = returnFocus || null;
    var inputId = "companion-nickname-input";
    modalRoot.innerHTML = [
      '<div class="modal companion-nickname-modal" role="dialog" aria-modal="true" aria-labelledby="companion-nickname-title" aria-describedby="companion-nickname-help">',
      '<h2 id="companion-nickname-title">このこの ニックネームを<br>つけてあげよう！</h2>',
      '<div class="companion-nickname-target">',
      '<div class="companion-nickname-art">' + companionPresentation(species, companion) + '</div>',
      '<p><span class="muted">しゅるい</span><br><strong>' + escapeHtml(species.name) + '</strong></p>',
      '</div>',
      '<label class="field" for="' + inputId + '"><span>ニックネーム</span><input id="' + inputId + '" data-companion-nickname-input maxlength="12" autocomplete="off" value="' + escapeHtml(companion.nickname || "") + '" aria-describedby="companion-nickname-help companion-nickname-error"></label>',
      '<p id="companion-nickname-help" class="field-help"><span data-companion-nickname-count>' + KA.companions.companionNicknameLength(companion.nickname || "") + '</span> / 12もじまで</p>',
      '<p id="companion-nickname-error" class="field-error" data-companion-nickname-error aria-live="polite"></p>',
      '<div class="modal-actions companion-nickname-actions">',
      button("キャンセル", "btn-soft", 'data-cancel-companion-nickname'),
      companion.nickname ? button("もとの なまえに もどす", "btn-soft", 'data-clear-companion-nickname') : '',
      button("ほぞんする", "btn-primary", 'data-save-companion-nickname'),
      '</div>',
      '</div>'
    ].join("");
    var dialog = modalRoot.querySelector(".companion-nickname-modal");
    var input = modalRoot.querySelector("[data-companion-nickname-input]");
    var error = modalRoot.querySelector("[data-companion-nickname-error]");
    var count = modalRoot.querySelector("[data-companion-nickname-count]");
    function closeEditor() {
      closeCompanionNicknameDialog(companionId);
    }
    modalRoot.querySelector("[data-cancel-companion-nickname]").addEventListener("click", closeEditor);
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditor();
      }
    });
    input.addEventListener("input", function () {
      count.textContent = String(KA.companions.companionNicknameLength(input.value));
      error.textContent = "";
    });
    modalRoot.querySelector("[data-save-companion-nickname]").addEventListener("click", function () {
      var result = KA.companions.setCompanionNickname(companionId, input.value);
      if (!result.ok) {
        error.textContent = result.reason === "too_long" ? "ニックネームは 12もじまでだよ" : "ニックネームを いれてね";
        input.focus();
        return;
      }
      nicknameDialogReturnFocus = null;
      closeDialog();
      toast("ニックネームを ほぞんしたよ");
      KA.router.render();
      focusCompanionNicknameButton(companionId);
    });
    var clear = modalRoot.querySelector("[data-clear-companion-nickname]");
    if (clear) {
      clear.addEventListener("click", function () {
        KA.companions.clearCompanionNickname(companionId);
        nicknameDialogReturnFocus = null;
        closeDialog();
        toast("もとの なまえに もどしたよ");
        KA.router.render();
        focusCompanionNicknameButton(companionId);
      });
    }
    global.setTimeout(function () {
      input.focus();
      input.select();
    }, 0);
  }

  function companionCurrentState(data, companion) {
    if (companionIsTraveling(data, companion.speciesId)) {
      return {
        key: "traveling",
        label: "おでかけちゅう",
        message: "いまは おでかけちゅう。ごはんも とどけられるよ"
      };
    }
    var outing = KA.outings && KA.outings.ensureOuting ? KA.outings.ensureOuting(data) : null;
    var trip = outing && outing.activeTrip;
    if (trip && trip.status === "returned" && (trip.companionId === companion.speciesId || trip.speciesId === companion.speciesId)) {
      return { key: "returned", label: "かえってきたよ", message: "おみやげを うけとれるよ" };
    }
    if (companionFedToday(companion)) {
      return { key: "fed", label: "きょう ごはん済み", message: "きょうも おいしく たべたよ" };
    }
    return { key: "home", label: "おうちにいるよ", message: "きょうは まだ ごはんを たべていないよ" };
  }

  function renderCompanionDetail(params) {
    var data = KA.state.getAppData();
    var requestedId = params && params.companionId;
    var companion = getSelectedCompanion(data, requestedId);
    if (companion) setSelectedCompanionId(companion.speciesId);
    if (!companion) {
      layout("なかまのしょうさい", [
        '<section class="panel panel-pad companion-detail-empty">',
        '<h2>まだ なかまになっていないよ</h2>',
        '<p>なかまずかんから 取得済みの なかまを えらんでね。</p>',
        '<div class="quick-actions">',
        button("なかまずかんへ", "btn-primary", 'data-detail-open-dex'),
        button("ホームへ", "btn-soft", 'data-route="home"'),
        '</div></section>'
      ].join(""), { screenClass: "companion-detail-screen" });
      var dexButton = appEl.querySelector("[data-detail-open-dex]");
      if (dexButton) dexButton.addEventListener("click", function () {
        KA.state.getUiState().eggTab = "companions";
        KA.state.saveUiState();
        KA.router.navigate("eggs");
      });
      return;
    }
    var species = KA.companions.getSpecies(companion.speciesId);
    var displayName = companionDisplayName(companion);
    var state = companionCurrentState(data, companion);
    var hasNickname = Boolean(companion.nickname);
    var traveling = state.key === "traveling";
    var body = [
      '<div class="screen-header companion-detail-header"><div>',
      '<p class="eyebrow">このこの こと</p><h2 class="companion-display-name">' + escapeHtml(displayName) + '</h2>',
      '</div>' + button("もどる", "btn-soft btn-small", 'data-companion-detail-back') + '</div>',
      '<section class="panel panel-pad companion-detail-hero' + legendaryCardClass(species) + '" aria-labelledby="companion-detail-name">',
      '<div class="companion-detail-art">' + companionPresentation(species, companion) + '</div>',
      '<div class="companion-detail-summary">',
      '<h2 id="companion-detail-name" class="companion-display-name">' + escapeHtml(displayName) + '</h2>',
      hasNickname ? '<p class="companion-species-name">しゅるい: ' + escapeHtml(species.name) + '</p>' : '<p class="companion-species-name">' + escapeHtml(species.name) + '</p>',
      '<div class="companion-detail-badges"><span class="badge star">なかよし ' + Number(companion.bondLevel || 1) + '</span><span class="badge">' + escapeHtml(companionEvolutionProgress(companion).label) + '</span>' + (companion.isFavorite ? '<span class="badge sun">おきにいり</span>' : '') + '</div>',
      '<p class="companion-detail-state is-' + state.key + '"><strong>' + escapeHtml(state.label) + '</strong><br>' + escapeHtml(state.message) + '</p>',
      '</div></section>',
      '<section class="companion-action-grid" aria-label="' + escapeHtml(displayName) + 'に できること">',
      '<article class="panel panel-pad companion-action-group is-primary"><p class="eyebrow">おせわ</p><h3>ごはん</h3><p>料理をつくって ' + escapeHtml(displayName) + 'に あげよう。</p>',
      button("ごはんを あげる", "btn-primary", 'data-detail-kitchen="' + escapeHtml(companion.speciesId) + '" data-companion-detail-primary aria-label="' + escapeHtml(displayName) + 'に ごはんをあげる"'),
      traveling ? '<p class="action-reason">おでかけちゅうでも ごはんを とどけられるよ。</p>' : '',
      '</article>',
      '<article class="panel panel-pad companion-action-group"><p class="eyebrow">いっしょに</p><h3>おでかけ</h3><p>' + (traveling ? 'いまの おでかけを みてみよう。' : 'いっしょに いく じゅんびを しよう。') + '</p>',
      button(traveling ? "おでかけの ようすをみる" : "おでかけする", "btn-soft", 'data-detail-outing="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(displayName) + (traveling ? 'の おでかけの ようすをみる' : 'と おでかけする') + '"'),
      '</article>',
      '<article class="panel panel-pad companion-action-group"><p class="eyebrow">おうち</p><h3>とりのおうち</h3><p>おへやの なかで このこを みつけよう。</p>',
      button("とりのおうちで みる", "btn-soft", 'data-detail-house="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(displayName) + 'を とりのおうちでみる"'),
      '</article>',
      '<article class="panel panel-pad companion-action-group is-settings"><p class="eyebrow">このこのこと</p><h3>なまえと おきにいり</h3><div class="companion-setting-actions">',
      button(hasNickname ? "ニックネームを かえる" : "ニックネームを つける", "btn-soft", 'data-edit-companion-nickname="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(displayName) + 'のニックネームを' + (hasNickname ? '変える' : '付ける') + '"'),
      button(companion.isFavorite ? "おきにいりから はずす" : "おきにいりに する", companion.isFavorite ? "btn-sun" : "btn-soft", 'data-detail-favorite="' + escapeHtml(companion.speciesId) + '" data-favorite-enabled="' + (companion.isFavorite ? "false" : "true") + '" aria-label="' + escapeHtml(displayName) + 'を' + (companion.isFavorite ? 'おきにいりから外す' : 'おきにいりにする') + '"'),
      '</div></article>',
      '</section>',
      evolutionProgressHtml(companion, false)
    ].join("");
    layout(displayName, body, { screenClass: "companion-detail-screen" });

    var back = appEl.querySelector("[data-companion-detail-back]");
    if (back) back.addEventListener("click", function () { returnFromCompanionDetail(companion.speciesId); });
    var kitchenButton = appEl.querySelector("[data-detail-kitchen]");
    if (kitchenButton) kitchenButton.addEventListener("click", function () {
      setSelectedCompanionId(companion.speciesId);
      KA.router.navigate("kitchen", { companionId: companion.speciesId });
    });
    var outingButton = appEl.querySelector("[data-detail-outing]");
    if (outingButton) outingButton.addEventListener("click", function () {
      setSelectedCompanionId(companion.speciesId);
      outingSelection.companionId = companion.speciesId;
      outingSelection.confirming = false;
      KA.router.navigate("outing", { companionId: companion.speciesId });
    });
    var houseButton = appEl.querySelector("[data-detail-house]");
    if (houseButton) houseButton.addEventListener("click", function () {
      setSelectedCompanionId(companion.speciesId);
      KA.router.navigate("bird-house", { companionId: companion.speciesId });
    });
    var nicknameButton = appEl.querySelector("[data-edit-companion-nickname]");
    if (nicknameButton) nicknameButton.addEventListener("click", function () {
      openCompanionNicknameDialog(companion.speciesId, nicknameButton);
    });
    var favoriteButton = appEl.querySelector("[data-detail-favorite]");
    if (favoriteButton) favoriteButton.addEventListener("click", function () {
      var enabled = favoriteButton.getAttribute("data-favorite-enabled") === "true";
      KA.companions.setFavorite(companion.speciesId, enabled);
      toast(enabled ? "おきにいりに したよ" : "おきにいりから はずしたよ");
      KA.router.render();
    });
  }

  function renderEggs() {
    var data = KA.state.getAppData();
    KA.eggs.syncEggInventory(data);
    KA.companions.ensureCompanions(data);
    var ui = KA.state.getUiState();
    ui.eggTab = ui.eggTab === "companions" ? "companions" : "eggs";
    var eggs = KA.eggs.getEggs();
    var body = [
      '<div class="screen-header"><div><h2>ふしぎなたまご</h2><p class="muted">たまごを まいにち そだてると、鳥のなかまが うまれるよ。</p></div><div><span class="badge star">🥚 ' + eggs.length + 'こ</span></div></div>',
      '<div class="segmented egg-tabs">',
      button("たまご", ui.eggTab === "eggs" ? "btn-primary" : "btn-soft", 'data-egg-tab="eggs"'),
      button("なかまずかん", ui.eggTab === "companions" ? "btn-primary" : "btn-soft", 'data-egg-tab="companions"'),
      '</div>',
      ui.eggTab === "companions" ? renderCompanionDex(data) : renderEggPanel(data)
    ].join("");
    layout("たまご", body);
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-egg-tab]"), function (el) {
      el.addEventListener("click", function () {
        KA.state.getUiState().eggTab = el.getAttribute("data-egg-tab");
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-care-egg]"), function (careButtonEl) {
      careButtonEl.addEventListener("click", function () {
        var type = careButtonEl.getAttribute("data-care-egg");
        var result;
        careButtonEl.disabled = true;
        if (type === "warm") result = KA.eggs.warmActiveEgg();
        else if (type === "sing") result = KA.eggs.singToActiveEgg();
        else result = KA.eggs.petActiveEgg();
        if (result.ok) {
          eggCareEffect = type === "warm" ? "warm" : type === "sing" ? "sing" : "pet";
          playTone(result.ready ? "hatch" : type === "warm" ? "warm" : type === "sing" ? "song" : "egg");
          toast(result.ready ? "うまれそうだよ！" : result.message);
          KA.router.render();
          global.setTimeout(function () {
            if (eggCareEffect && KA.router.getCurrent().name === "eggs") {
              eggCareEffect = null;
              KA.router.render();
            } else {
              eggCareEffect = null;
            }
          }, 1400);
        } else if (result.alreadyDone) {
          toast(type === "warm" ? "きょうは もう あたためたよ" : type === "sing" ? "きょうは もう うたったよ" : "きょうは もう なでたよ");
          KA.router.render();
        } else {
          toast("いま そだてる たまごは ないみたい");
          KA.router.render();
        }
      });
    });
    var hatchButton = appEl.querySelector("[data-hatch-egg]");
    if (hatchButton) {
      hatchButton.addEventListener("click", function () {
        var result = KA.eggs.hatchReadyEgg(hatchButton.getAttribute("data-hatch-egg"));
        if (!result.ok) {
          toast("もうすこしで うまれるよ");
          KA.router.render();
          return;
        }
        playTone("hatch");
        var evolved = KA.companions.pendingEvolutionCompanions(KA.state.getAppData()).filter(function (companion) {
          return companion.speciesId === result.companion.speciesId;
        });
        if (!showCompanionEvolutionDialog(evolved, hatchButton)) {
          var firstLegendaryHatch = isLegendarySpecies(result.species) && Number(result.companion.hatchCount || 0) === 1;
          var html = '<div class="hatch-result' + (firstLegendaryHatch ? ' is-legendary-hatch' : '') + '"><div class="legendary-hatch-glow" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><div class="egg-hatch-pop">' + companionPresentation(result.species, result.companion) + '</div><h3>' + (firstLegendaryHatch ? 'でんせつの なかまが<br>うまれた！' : 'なかまが うまれたよ！') + '</h3><p>' + escapeHtml(result.species.name) + 'が なかまになったよ。</p><p><span class="badge star">なかよし ' + Number(result.companion.bondLevel || 1) + '</span></p></div>';
          infoDialog(firstLegendaryHatch ? "きらきらの たまご" : "たまごが かえったよ", html);
        }
      });
    }
    bindCompanionDetailEntries(appEl);
  }

  function kitchenOwnedCompanions(data) {
    return KA.companions.ensureCompanions(data).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    }).sort(function (a, b) {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      var speciesA = KA.companions.getSpecies(a.speciesId);
      var speciesB = KA.companions.getSpecies(b.speciesId);
      return Number((speciesA && speciesA.displayOrder) || 0) - Number((speciesB && speciesB.displayOrder) || 0);
    });
  }

  function kitchenNotice() {
    return '<aside class="kitchen-notice">アプリの とりは ふしぎな とりだよ。<br>ほんものの とりに<br>ひとの ごはんを あげないでね。</aside>';
  }

  function renderKitchenSelectedCompanion(data, ui) {
    var companion = getSelectedCompanion(data, ui.kitchenPreselectedCompanionId);
    if (!companion) {
      return '<section class="panel panel-pad kitchen-selected-companion is-empty" aria-live="polite"><div><p class="eyebrow">ごはんを あげるこ</p><h3>まだ えらんでいないよ</h3><p class="muted">料理ができたら なかまを えらべるよ。</p></div></section>';
    }
    var species = KA.companions.getSpecies(companion.speciesId);
    var displayName = companionDisplayName(companion);
    return [
      '<section class="panel panel-pad kitchen-selected-companion' + legendaryCardClass(species) + '" aria-live="polite">',
      '<div class="kitchen-selected-companion-art">' + companionPresentation(species, companion) + '</div>',
      '<div><p class="eyebrow">ごはんを あげるこ</p><h3 class="companion-display-name">' + escapeHtml(displayName) + '</h3>',
      '<p class="muted">なかよし ' + Number(companion.bondLevel || 1) + ' / ' + escapeHtml(companionEvolutionProgress(companion).label) + '</p>',
      companionIsTraveling(data, companion.speciesId) ? '<p class="action-reason">おでかけちゅうでも ごはんを とどけられるよ。</p>' : '',
      '</div></section>'
    ].join("");
  }

  function renderKitchenTabs(ui) {
    var tab = ui.kitchenTab === "book" ? "book" : "cook";
    return [
      '<div class="segmented kitchen-tabs">',
      button("りょうりをつくる", tab === "cook" ? "btn-primary" : "btn-soft", 'data-kitchen-tab="cook"'),
      button("りょうりずかん", tab === "book" ? "btn-primary" : "btn-soft", 'data-kitchen-tab="book"'),
      '</div>'
    ].join("");
  }

  function renderKitchenRecipeList() {
    return [
      '<section class="kitchen-recipe-grid">',
      KA.kitchen.allRecipes().map(function (recipe) {
        return [
          '<article class="kitchen-card recipe-card">',
          '<div class="kitchen-icon">' + KA.kitchen.renderRecipeDish(recipe.id) + '</div>',
          '<h3>' + escapeHtml(recipe.name) + '</h3>',
          '<p class="muted">ざいりょう ' + recipe.ingredientIds.length + 'こ</p>',
          button("つくる", "btn-primary btn-small", 'data-select-recipe="' + escapeHtml(recipe.id) + '"'),
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }

  function kitchenSelectedIngredientIds(ui) {
    return Array.isArray(ui.kitchenSelectedIngredientIds) ? ui.kitchenSelectedIngredientIds : [];
  }

  function renderIngredientSelection(recipe, ui) {
    var selected = kitchenSelectedIngredientIds(ui);
    var required = recipe.ingredientIds;
    var missing = required.filter(function (id) { return selected.indexOf(id) === -1; });
    var categories = {};
    KA.kitchen.allIngredients().forEach(function (ingredient) {
      if (!categories[ingredient.category]) categories[ingredient.category] = [];
      categories[ingredient.category].push(ingredient);
    });
    return [
      '<section class="panel panel-pad kitchen-select-panel">',
      '<div class="kitchen-selected-header">',
      '<div class="kitchen-icon small">' + KA.kitchen.renderRecipeDish(recipe.id) + '</div>',
      '<div><p class="eyebrow">つかうものを えらぼう</p><h2>' + escapeHtml(recipe.name) + '</h2>',
      '<p class="muted">ひつような ざいりょう: ' + required.map(function (id) { return escapeHtml(KA.kitchen.getIngredient(id).name); }).join("、") + '</p></div>',
      '</div>',
      Object.keys(categories).map(function (category) {
        return [
          '<div class="ingredient-category"><h3>' + escapeHtml(category) + '</h3>',
          '<div class="ingredient-grid">',
          categories[category].map(function (ingredient) {
            var isRequired = required.indexOf(ingredient.id) >= 0;
            var isSelected = selected.indexOf(ingredient.id) >= 0;
            return [
              '<button class="ingredient-choice ' + (isSelected ? "is-selected" : "") + '" data-toggle-ingredient="' + escapeHtml(ingredient.id) + '" aria-pressed="' + (isSelected ? "true" : "false") + '">',
              '<span class="ingredient-art">' + KA.kitchen.renderIngredient(ingredient.id) + '</span>',
              '<span>' + escapeHtml(ingredient.name) + '</span>',
              isRequired ? '<small>つかう</small>' : '<small>ほかのりょうり</small>',
              KA.kitchen.getIngredientInventory(ingredient.id) ? '<small class="ingredient-souvenir-count">おみやげ ' + KA.kitchen.getIngredientInventory(ingredient.id) + 'こ</small>' : '',
              '</button>'
            ].join("");
          }).join(""),
          '</div></div>'
        ].join("");
      }).join(""),
      '<div class="kitchen-start-bar">',
      '<p><strong>' + (required.length - missing.length) + ' / ' + required.length + '</strong> えらんだよ</p>',
      missing.length ? '<p class="muted">あと ' + missing.map(function (id) { return escapeHtml(KA.kitchen.getIngredient(id).name); }).join("、") + ' をえらぼう。</p>' : '<p class="muted">ぜんぶ そろったよ。</p>',
      '<div class="quick-actions">' + button("りょうりを はじめる", missing.length ? "btn-soft" : "btn-primary", 'data-start-cooking="' + escapeHtml(recipe.id) + '"' + (missing.length ? " disabled" : "")) + button("りょうりを えらびなおす", "btn-soft", 'data-kitchen-clear-recipe') + '</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderKitchenCooking(kitchen) {
    var cooking = kitchen.currentCooking;
    var recipe = KA.kitchen.getRecipe(cooking.recipeId);
    var step = recipe.steps[cooking.currentStepIndex] || recipe.steps[recipe.steps.length - 1];
    var progress = Math.min(recipe.steps.length, Number(cooking.currentStepIndex || 0));
    return [
      '<section class="panel panel-pad kitchen-work-panel">',
      '<div class="kitchen-selected-header">',
      '<div class="kitchen-icon">' + KA.kitchen.renderRecipeDish(recipe.id) + '</div>',
      '<div><p class="eyebrow">ちょうりちゅう</p><h2>' + escapeHtml(recipe.name) + '</h2>',
      '<p class="muted">工程 ' + (progress + 1) + ' / ' + recipe.steps.length + '</p></div>',
      '</div>',
      '<div class="kitchen-progress"><span style="width:' + Math.round((progress / recipe.steps.length) * 100) + '%"></span></div>',
      '<div class="kitchen-work-area" data-kitchen-work-area role="button" tabindex="0" aria-label="調理を進める">',
      '<div class="kitchen-work-art">' + KA.kitchen.renderRecipeDish(recipe.id) + '</div>',
      '<div class="kitchen-work-tools" aria-hidden="true"><span></span><span></span><span></span></div>',
      '</div>',
      '<h3>' + escapeHtml(step.title) + '</h3>',
      '<p class="muted" aria-live="polite">' + escapeHtml(step.instruction) + '</p>',
      '<div class="quick-actions">',
      button(step.type === "cut" ? "とん とん" : step.type === "mix" ? "まぜる" : step.type === "wrap" ? "つつむ" : step.type === "layer" ? "ここに おく" : "すすめる", "btn-primary", 'data-complete-kitchen-step'),
      button("りょうりを やめる", "btn-soft", 'data-quit-cooking'),
      '</div>',
      '</section>',
      kitchenNotice()
    ].join("");
  }

  function renderKitchenFeed(kitchen, data, ui) {
    var cooking = kitchen.currentCooking;
    var recipe = KA.kitchen.getRecipe(cooking.recipeId);
    var owned = kitchenOwnedCompanions(data);
    var selectedCompanion = getSelectedCompanion(data, cooking.preselectedCompanionId || ui.kitchenPreselectedCompanionId);
    var selectedId = selectedCompanion ? selectedCompanion.speciesId : null;
    return [
      '<section class="panel panel-pad kitchen-complete-panel">',
      '<div class="kitchen-complete-dish">' + KA.kitchen.renderRecipeDish(recipe.id) + '</div>',
      '<h2>できあがり！</h2>',
      '<p>' + escapeHtml(recipe.name) + 'が できたよ！</p>',
      '<h3>だれに あげる？</h3>',
      '<div class="companion-grid kitchen-feed-grid">',
      owned.map(function (companion) {
        var species = KA.companions.getSpecies(companion.speciesId);
        var displayName = companionDisplayName(companion);
        var selected = companion.speciesId === selectedId;
        return [
          '<button class="companion-card kitchen-feed-choice is-owned ' + (selected ? "is-selected" : "") + legendaryCardClass(species) + '" data-select-kitchen-companion="' + escapeHtml(species.id) + '" aria-label="' + escapeHtml(legendaryAriaPrefix(species) + displayName) + 'を ごはんのあいてに えらぶ" aria-pressed="' + (selected ? "true" : "false") + '">',
          '<div class="companion-art">' + companionPresentation(species, companion) + '</div>',
          '<h3 class="companion-display-name">' + escapeHtml(displayName) + '</h3>',
          companion.nickname ? '<p class="companion-species-name">しゅるい: ' + escapeHtml(species.name) + '</p>' : '',
          '<p><span class="badge star">なかよし ' + Number(companion.bondLevel || 1) + '</span></p>',
          '<p class="muted">' + escapeHtml(companionEvolutionProgress(companion).label) + '</p>',
          '<p class="muted">' + (companion.lastBondMealDate === KA.date.localDateKey() ? "きょうの なかよしごはん 済み" : "きょうは まだだよ") + '</p>',
          selected ? '<span class="badge selected-label">えらんでいるよ</span>' : '<span class="companion-card-open">このこを えらぶ</span>',
          '</button>'
        ].join("");
      }).join(""),
      '</div>',
      '<div class="kitchen-feed-action">',
      button("ごはんを あげる", selectedId ? "btn-primary" : "btn-soft", 'data-feed-selected-companion="' + escapeHtml(selectedId || "") + '"' + (selectedId ? '' : ' disabled aria-disabled="true"')),
      selectedId ? '<p class="muted companion-display-name">' + escapeHtml(companionDisplayName(selectedCompanion)) + 'に あげるよ。</p>' : '<p class="action-reason">ごはんを あげるこを えらんでね。</p>',
      '</div>',
      '</section>',
      kitchenNotice()
    ].join("");
  }

  function renderKitchenBook(kitchen) {
    var stats = kitchen.recipeStats || {};
    return [
      '<section class="kitchen-recipe-grid kitchen-book-grid">',
      KA.kitchen.allRecipes().map(function (recipe) {
        var item = stats[recipe.id];
        var cooked = Boolean(item && Number(item.cookCount || 0) > 0);
        return [
          '<article class="kitchen-card recipe-card ' + (cooked ? "is-cooked" : "is-locked") + '">',
          '<div class="kitchen-icon">' + KA.kitchen.renderRecipeDish(recipe.id, { silhouette: !cooked }) + '</div>',
          '<h3>' + escapeHtml(recipe.name) + '</h3>',
          cooked ? '<p class="muted">はじめて: ' + escapeHtml((item.firstCookedAt || "").slice(0, 10)) + '<br>さいご: ' + escapeHtml((item.lastCookedAt || "").slice(0, 10)) + '</p><p><span class="badge">' + Number(item.cookCount || 0) + 'かい</span> <span class="badge star">あげた ' + Number(item.fedCount || 0) + 'かい</span></p>' : '<p class="muted">まだ つくっていないよ</p>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>',
      kitchenNotice()
    ].join("");
  }

  function renderKitchen(params) {
    var data = KA.state.getAppData();
    KA.companions.ensureCompanions(data);
    var kitchen = KA.kitchen.ensureKitchen(data);
    var ui = KA.state.getUiState();
    var owned = kitchenOwnedCompanions(data);
    if (params && params.companionId) {
      var selectedId = setSelectedCompanionId(params.companionId);
      params.companionId = null;
      if (kitchen.currentCooking && selectedId) {
        kitchen.currentCooking.preselectedCompanionId = selectedId;
        KA.state.saveAppData();
      }
    } else {
      var selectedCompanion = getSelectedCompanion(data, ui.kitchenPreselectedCompanionId);
      ui.kitchenPreselectedCompanionId = selectedCompanion ? selectedCompanion.speciesId : null;
      if (kitchen.currentCooking && !ownedCompanionById(data, kitchen.currentCooking.preselectedCompanionId)) {
        kitchen.currentCooking.preselectedCompanionId = ui.kitchenPreselectedCompanionId;
        KA.state.saveAppData();
      }
      KA.state.saveUiState();
    }
    ui.kitchenTab = ui.kitchenTab === "book" ? "book" : "cook";
    var selectedForKitchen = getSelectedCompanion(data, ui.kitchenPreselectedCompanionId);
    var backButton = selectedForKitchen
      ? button("もどる", "btn-soft btn-small", 'data-kitchen-back="' + escapeHtml(selectedForKitchen.speciesId) + '"')
      : button("ホーム", "btn-soft btn-small", 'data-route="home"');
    var selectedPanel = renderKitchenSelectedCompanion(data, ui);
    var body;
    if (!owned.length) {
      body = '<section class="panel panel-pad"><h2>とりさんキッチン</h2><p>たまごから なかまが うまれたら<br>ごはんを つくれるよ！</p><div class="quick-actions">' + button("たまごを みる", "btn-primary", 'data-route="eggs"') + '</div></section>';
      layout("とりさんキッチン", body);
      return;
    }
    if (kitchen.currentCooking && KA.kitchen.isCookingComplete(kitchen.currentCooking)) {
      body = '<div class="screen-header"><div><h2>とりさんキッチン</h2><p class="muted">できた料理を とりさんへ あげよう。</p></div>' + backButton + '</div>' + selectedPanel + renderKitchenFeed(kitchen, data, ui);
    } else if (kitchen.currentCooking) {
      body = '<div class="screen-header"><div><h2>とりさんキッチン</h2><p class="muted">途中から つづけられるよ。</p></div>' + backButton + '</div>' + selectedPanel + renderKitchenCooking(kitchen);
    } else if (ui.kitchenTab === "book") {
      body = '<div class="screen-header"><div><h2>とりさんキッチン</h2><p class="muted">つくった料理を みられるよ。</p></div>' + backButton + '</div>' + selectedPanel + renderKitchenTabs(ui) + renderKitchenBook(kitchen);
    } else {
      var recipe = ui.kitchenRecipeId ? KA.kitchen.getRecipe(ui.kitchenRecipeId) : null;
      body = '<div class="screen-header"><div><h2>とりさんキッチン</h2><p class="muted">料理をつくって、とりさんに あげよう。</p></div>' + backButton + '</div>' + selectedPanel + renderKitchenTabs(ui) + (recipe ? renderIngredientSelection(recipe, ui) : renderKitchenRecipeList()) + kitchenNotice();
    }
    layout("とりさんキッチン", body, { screenClass: "kitchen-screen" });
    bindKitchenEvents();
  }

  function showMealResultDialog(result) {
    var companion = result.companion;
    var species = KA.companions.getSpecies(companion.speciesId);
    var displayName = companionDisplayName(companion);
    var evolved = result.levelUp ? KA.companions.pendingEvolutionCompanions(KA.state.getAppData()).filter(function (item) {
      return item.speciesId === companion.speciesId;
    }) : [];
    modalRoot.innerHTML = [
      '<div class="modal kitchen-meal-result-modal" role="dialog" aria-modal="true" aria-labelledby="kitchen-meal-result-title">',
      '<h2 id="kitchen-meal-result-title">おいしい！</h2>',
      '<div class="kitchen-fed-result">',
      '<div class="kitchen-fed-art">' + companionPresentation(species, companion) + '</div>',
      '<div class="kitchen-fed-dish">' + KA.kitchen.renderRecipeDish(result.recipe.id) + '</div>',
      '<h3 class="companion-display-name">' + escapeHtml(displayName) + 'が ごちそうさま！</h3>',
      '<p>' + escapeHtml(result.recipe.name) + 'を よろこんで たべたよ。</p>',
      result.levelUp ? '<p><span class="badge star">もっと なかよしに なったよ！</span></p>' : '',
      '</div>',
      '<div class="modal-actions">' + button("つづける", "btn-primary", 'data-meal-result-continue') + '</div>',
      '</div>'
    ].join("");
    var dialog = modalRoot.querySelector(".kitchen-meal-result-modal");
    var continueButton = modalRoot.querySelector("[data-meal-result-continue]");
    function finishMealResult() {
      if (!mealFeedInProgress) return;
      mealFeedInProgress = false;
      closeDialog();
      var ui = KA.state.getUiState();
      ui.companionDetailReturnRoute = "home";
      ui.companionDetailReturnParams = {};
      ui.companionDetailReturnScrollY = 0;
      KA.state.saveUiState();
      KA.router.navigate("companion-detail", { companionId: companion.speciesId });
      if (evolved.length) {
        global.setTimeout(function () {
          var returnFocus = appEl.querySelector("[data-companion-detail-primary]");
          showCompanionEvolutionDialog(evolved, returnFocus);
        }, 0);
      }
    }
    continueButton.addEventListener("click", finishMealResult);
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        finishMealResult();
      }
    });
    global.setTimeout(function () { continueButton.focus(); }, 0);
  }

  function bindKitchenEvents() {
    var back = appEl.querySelector("[data-kitchen-back]");
    if (back) back.addEventListener("click", function () {
      var companionId = back.getAttribute("data-kitchen-back");
      setSelectedCompanionId(companionId);
      KA.router.navigate("companion-detail", { companionId: companionId });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-kitchen-tab]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        ui.kitchenTab = el.getAttribute("data-kitchen-tab");
        ui.kitchenRecipeId = null;
        ui.kitchenSelectedIngredientIds = [];
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-select-recipe]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        ui.kitchenRecipeId = el.getAttribute("data-select-recipe");
        ui.kitchenSelectedIngredientIds = [];
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-toggle-ingredient]"), function (el) {
      el.addEventListener("click", function () {
        var ingredientId = el.getAttribute("data-toggle-ingredient");
        var ui = KA.state.getUiState();
        var recipe = KA.kitchen.getRecipe(ui.kitchenRecipeId);
        var selected = kitchenSelectedIngredientIds(ui).slice();
        if (!recipe || recipe.ingredientIds.indexOf(ingredientId) === -1) {
          toast("このりょうりには つかわないよ");
          return;
        }
        if (selected.indexOf(ingredientId) >= 0) {
          selected = selected.filter(function (id) { return id !== ingredientId; });
        } else {
          selected.push(ingredientId);
          playTone("egg");
        }
        ui.kitchenSelectedIngredientIds = selected;
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-kitchen-clear-recipe]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        ui.kitchenRecipeId = null;
        ui.kitchenSelectedIngredientIds = [];
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-start-cooking]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        var result = KA.kitchen.startCooking(el.getAttribute("data-start-cooking"), kitchenSelectedIngredientIds(ui), ui.kitchenPreselectedCompanionId);
        if (!result.ok) {
          toast(result.message || "ざいりょうを えらんでね");
          return;
        }
        ui.kitchenRecipeId = null;
        ui.kitchenSelectedIngredientIds = [];
        KA.state.saveUiState();
        playTone("complete");
        KA.router.render();
      });
    });
    function completeStepOnce(source) {
      if (source && source.disabled) return;
      if (source) source.disabled = true;
      var result = KA.kitchen.completeCurrentStep();
      playTone(result.completed ? "complete" : "egg");
      toast(result.completed ? "できあがり！" : "いいかんじ！");
      KA.router.render();
    }
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-complete-kitchen-step]"), function (el) {
      el.addEventListener("click", function () { completeStepOnce(el); });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-kitchen-work-area]"), function (el) {
      el.addEventListener("pointerdown", function (event) {
        if (el.setPointerCapture && event.pointerId != null) {
          try { el.setPointerCapture(event.pointerId); } catch (captureError) { /* Safari fallback */ }
        }
      });
      el.addEventListener("pointerup", function () { completeStepOnce(el); });
      el.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") completeStepOnce(el);
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-quit-cooking]"), function (el) {
      el.addEventListener("click", function () {
        confirmDialog("りょうりを やめますか？", "ざいりょうやスターは へりません。", "りょうりを やめる", function () {
          KA.kitchen.quitCooking();
          toast("りょうりを やめました");
          KA.router.render();
        }, "つづける");
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-select-kitchen-companion]"), function (el) {
      el.addEventListener("click", function () {
        var companionId = setSelectedCompanionId(el.getAttribute("data-select-kitchen-companion"));
        var kitchen = KA.kitchen.ensureKitchen(KA.state.getAppData());
        if (kitchen.currentCooking) {
          kitchen.currentCooking.preselectedCompanionId = companionId;
          KA.state.saveAppData();
        }
        KA.router.render();
      });
    });
    var feedButton = appEl.querySelector("[data-feed-selected-companion]");
    if (feedButton) {
      feedButton.addEventListener("click", function () {
        if (mealFeedInProgress || feedButton.disabled) return;
        var companionId = feedButton.getAttribute("data-feed-selected-companion");
        if (!ownedCompanionById(KA.state.getAppData(), companionId)) {
          toast("ごはんを あげるこを えらんでね");
          return;
        }
        mealFeedInProgress = true;
        feedButton.disabled = true;
        feedButton.textContent = "じゅんびちゅう…";
        var result = KA.kitchen.feedCompletedCooking(companionId);
        if (!result.ok) {
          mealFeedInProgress = false;
          toast(result.message || "なかまを えらんでね");
          KA.router.render();
          return;
        }
        playTone(result.levelUp ? "hatch" : "complete");
        showMealResultDialog(result);
      });
    }
  }

  function outingPreparationPanel(prep) {
    return [
      '<section class="panel panel-pad outing-preparation" aria-labelledby="outing-preparation-title">',
      '<h2 id="outing-preparation-title">おでかけの じゅんび</h2>',
      '<div class="outing-prep-list">',
      '<p><strong>' + (prep.job ? "✓" : "□") + ' おしごと</strong><span>' + (prep.job ? "できたよ" : "1つ できたら じゅんびOK") + '</span></p>',
      '<p><strong>' + (prep.care ? "✓" : "□") + ' おせわ</strong><span>' + (prep.care ? "できたよ" : "なでる・あたためる・うたう") + '</span></p>',
      '<p><strong>' + (prep.food ? "✓" : "□") + ' ごはん</strong><span>' + (prep.food ? "できたよ" : "なかまへ ごはんを あげよう") + '</span></p>',
      '</div>',
      '<p class="muted">' + prep.count + ' / 3 じゅんびできたよ</p>',
      '</section>'
    ].join("");
  }

  function outingRewardArt(rewardPlan) {
    if (!rewardPlan) return "";
    if (rewardPlan.type === "houseItem") return '<div class="outing-reward-art">' + KA.birdHouse.renderFurniture(rewardPlan.itemId) + '</div>';
    if (rewardPlan.type === "ingredients") {
      return '<div class="outing-reward-items">' + rewardPlan.items.map(function (item) {
        return '<span>' + KA.kitchen.renderIngredient(item.ingredientId) + '<small>' + escapeHtml(KA.outings.rewardLabel({ type: "ingredients", items: [item] })) + '</small></span>';
      }).join("") + '</div>';
    }
    return '<div class="outing-star-reward" aria-hidden="true">⭐</div>';
  }

  function outingHistoryHtml(outing) {
    var data = KA.state.getAppData();
    var history = (outing.history || []).slice(-20).reverse();
    return [
      '<section class="panel panel-pad outing-history">',
      '<h2>おでかけの きろく</h2>',
      history.length ? '<div class="outing-history-list">' + history.map(function (trip) {
        var species = KA.companions.getSpecies(trip.speciesId);
        var companion = KA.companions.getCompanion(data, trip.speciesId);
        var destination = KA.outings.getDestination(trip.destinationId);
        var displayName = companion ? companionDisplayName(companion) : (species ? species.name : "むかしの なかま");
        return '<article><strong>' + escapeHtml(KA.date.formatDisplayDate(trip.departedDateKey)) + '</strong><span>' + escapeHtml(displayName) + 'と ' + escapeHtml(destination ? destination.name : "むかしの おでかけさき") + '</span><small>' + escapeHtml(KA.outings.rewardLabel(trip.rewardPlan)) + ' / うけとりずみ</small></article>';
      }).join("") + '</div>' : '<p class="muted">まだ きろくは ないよ。</p>',
      '</section>'
    ].join("");
  }

  function renderActiveOuting(data, outing, trip) {
    var species = KA.companions.getSpecies(trip.speciesId);
    var companion = KA.companions.getCompanion(data, trip.speciesId);
    var displayName = companion ? companionDisplayName(companion) : (species ? species.name : "なかま");
    var destination = KA.outings.getDestination(trip.destinationId);
    var returned = trip.status === "returned";
    return [
      '<section class="panel panel-pad outing-active ' + (returned ? "is-returned" : "is-traveling") + legendaryCardClass(species) + '">',
      '<p class="eyebrow">' + (returned ? "おかえり！" : "おでかけちゅう") + '</p>',
      '<div class="outing-active-scene">',
      '<div class="outing-destination-art">' + KA.outings.renderDestinationIcon(destination ? destination.id : "") + '</div>',
      '<div class="outing-companion-art">' + (species ? companionPresentation(species, companion) : "") + '</div>',
      '</div>',
      '<h2 class="companion-display-name">' + escapeHtml(displayName) + (returned ? 'が かえってきたよ！' : 'は ' + escapeHtml(destination ? destination.name : "おでかけさき") + 'へ<br>おでかけしているよ！') + '</h2>',
      returned ? '<p>' + escapeHtml(KA.outings.returnMessage(trip)) + '</p><p><strong>おみやげ: ' + escapeHtml(KA.outings.rewardLabel(trip.rewardPlan)) + '</strong></p>' + outingRewardArt(trip.rewardPlan) + '<div class="quick-actions">' + button("おみやげを うけとる", "btn-primary", 'data-claim-outing="' + escapeHtml(trip.tripId) + '"') + '</div>' : '<p>' + escapeHtml(destination ? destination.departureMessage : "たのしんでいるよ！") + '</p><p class="muted">' + escapeHtml(KA.date.formatDisplayDate(trip.departedDateKey)) + 'に しゅっぱつ<br>つぎの ひに また あおうね！</p>',
      '</section>',
      outingHistoryHtml(outing)
    ].join("");
  }

  function renderOutingSelection(data, outing, prep) {
    var eligible = KA.outings.eligibleCompanions(data);
    var departedToday = (outing.history || []).some(function (trip) { return trip.departedDateKey === KA.date.localDateKey(); });
    if (departedToday) return '<section class="panel panel-pad"><h2>きょうは おでかけしたよ</h2><p>また あした いっしょに いこうね！</p></section>' + outingHistoryHtml(outing);
    if (!prep.complete) return outingPreparationPanel(prep) + outingHistoryHtml(outing);
    if (!eligible.length) return outingPreparationPanel(prep) + '<section class="panel panel-pad"><h2>いっしょに いく なかま</h2><p>きょう ごはんを たべた なかまから えらべるよ！</p><div class="quick-actions">' + button("ごはんを つくる", "btn-primary", 'data-route="kitchen"') + '</div></section>' + outingHistoryHtml(outing);
    if (!eligible.some(function (companion) { return companion.speciesId === outingSelection.companionId; })) outingSelection.companionId = eligible[0].speciesId;
    if (!KA.outings.getDestination(outingSelection.destinationId)) outingSelection.destinationId = KA.outings.allDestinations()[0].id;
    var selectedCompanion = eligible.filter(function (companion) { return companion.speciesId === outingSelection.companionId; })[0];
    var selectedSpecies = selectedCompanion && KA.companions.getSpecies(selectedCompanion.speciesId);
    var selectedName = selectedCompanion ? companionDisplayName(selectedCompanion) : (selectedSpecies ? selectedSpecies.name : "なかま");
    var selectedDestination = KA.outings.getDestination(outingSelection.destinationId);
    if (outingSelection.confirming) {
      return [
        '<section class="panel panel-pad outing-confirm">',
        '<p class="eyebrow">しゅっぱつの かくにん</p>',
        '<div class="outing-confirm-grid"><div>' + companionPresentation(selectedSpecies, selectedCompanion) + '</div><div>' + KA.outings.renderDestinationIcon(selectedDestination.id) + '</div></div>',
        '<h2 class="companion-display-name">' + escapeHtml(selectedName) + 'と ' + escapeHtml(selectedDestination.name) + 'へ<br>おでかけする？</h2>',
        '<p>主なおみやげ: ' + escapeHtml(selectedDestination.rewardType === "stars" ? "スター" : selectedDestination.rewardType === "houseItem" ? "おへやの かざり" : "りょうりの そざい") + '</p>',
        '<p class="muted">つぎの ひに かえってくるよ！</p>',
        '<div class="quick-actions">' + button("しゅっぱつ！", "btn-primary", 'data-depart-outing') + button("もどる", "btn-soft", 'data-outing-confirm-back') + '</div>',
        '</section>',
        outingHistoryHtml(outing)
      ].join("");
    }
    return [
      outingPreparationPanel(prep),
      '<section class="panel panel-pad outing-companion-panel"><h2>いっしょに いく なかま</h2><p class="muted">きょう ごはんを たべた なかまから えらべるよ！</p><div class="outing-companion-grid">',
      eligible.map(function (companion) {
        var species = KA.companions.getSpecies(companion.speciesId);
        var selected = companion.speciesId === outingSelection.companionId;
        var displayName = companionDisplayName(companion);
        return '<button class="outing-companion-choice ' + (selected ? "is-selected" : "") + legendaryCardClass(species) + '" data-outing-companion="' + escapeHtml(companion.speciesId) + '" aria-label="' + escapeHtml(legendaryAriaPrefix(species) + displayName) + 'と出かける、' + escapeHtml(companionEvolutionProgress(companion).label) + '" aria-pressed="' + (selected ? "true" : "false") + '"><span>' + companionPresentation(species, companion) + '</span><strong class="companion-display-name">' + escapeHtml(displayName) + '</strong><small>なかよし ' + Number(companion.bondLevel || 1) + ' / ' + escapeHtml(companionEvolutionProgress(companion).label) + '<br>ごはん済み' + (companion.isFavorite ? ' / おきにいり' : '') + '</small></button>';
      }).join(""),
      '</div></section>',
      '<section class="panel panel-pad outing-destination-panel"><h2>どこへ いく？</h2><div class="outing-destination-grid">',
      KA.outings.allDestinations().map(function (destination) {
        var selected = destination.id === outingSelection.destinationId;
        return '<button class="outing-destination-choice ' + (selected ? "is-selected" : "") + '" data-outing-destination="' + escapeHtml(destination.id) + '" aria-label="' + escapeHtml(destination.name) + 'へ行く" aria-pressed="' + (selected ? "true" : "false") + '"><span>' + KA.outings.renderDestinationIcon(destination.id) + '</span><strong>' + escapeHtml(destination.name) + '</strong><small>' + escapeHtml(destination.description).replace(/\n/g, '<br>') + '</small></button>';
      }).join(""),
      '</div><div class="quick-actions">' + button("しゅっぱつを かくにん", "btn-primary", 'data-confirm-outing') + '</div></section>',
      outingHistoryHtml(outing)
    ].join("");
  }

  function renderOuting(params) {
    var data = KA.state.getAppData();
    KA.companions.ensureCompanions(data);
    if (params && params.companionId) {
      var selectedId = setSelectedCompanionId(params.companionId);
      if (selectedId) outingSelection.companionId = selectedId;
      outingSelection.confirming = false;
      params.companionId = null;
    }
    var synced = KA.outings.syncTripStatus(data, KA.date.localDateKey());
    if (synced.changed) KA.state.saveAppData();
    var outing = KA.outings.ensureOuting(data);
    var owned = KA.companions.ensureCompanions(data).filter(function (companion) { return companion && Number(companion.hatchCount || 0) > 0; });
    var body = '<div class="screen-header"><div><h2>なかまと おでかけ</h2><p class="muted">じゅんびをして、つぎのひの おみやげを たのしみにしよう。</p></div>' + button("ホーム", "btn-soft btn-small", 'data-route="home"') + '</div>';
    if (!owned.length) body += '<section class="panel panel-pad"><h2>なかまと おでかけ</h2><p>たまごから なかまが うまれたら<br>いっしょに おでかけできるよ！</p><div class="quick-actions">' + button("たまごを みる", "btn-primary", 'data-route="eggs"') + '</div></section>' + outingHistoryHtml(outing);
    else if (outing.activeTrip) body += renderActiveOuting(data, outing, outing.activeTrip);
    else body += renderOutingSelection(data, outing, KA.outings.preparationStatus(data));
    layout("なかまと おでかけ", body, { screenClass: "outing-screen" });
    bindOutingEvents();
  }

  function bindOutingEvents() {
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-outing-companion]"), function (el) {
      el.addEventListener("click", function () { outingSelection.companionId = el.getAttribute("data-outing-companion"); outingSelection.confirming = false; KA.router.render(); });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-outing-destination]"), function (el) {
      el.addEventListener("click", function () { outingSelection.destinationId = el.getAttribute("data-outing-destination"); outingSelection.confirming = false; KA.router.render(); });
    });
    var confirm = appEl.querySelector("[data-confirm-outing]");
    if (confirm) confirm.addEventListener("click", function () { outingSelection.confirming = true; KA.router.render(); });
    var back = appEl.querySelector("[data-outing-confirm-back]");
    if (back) back.addEventListener("click", function () { outingSelection.confirming = false; KA.router.render(); });
    var depart = appEl.querySelector("[data-depart-outing]");
    if (depart) depart.addEventListener("click", function () {
      depart.disabled = true;
      var result = KA.outings.startTrip(outingSelection.companionId, outingSelection.destinationId);
      if (!result.ok) { toast(result.reason === "already_departed_today" ? "きょうは もう おでかけしたよ" : "しゅっぱつの じゅんびを かくにんしてね"); KA.router.render(); return; }
      outingSelection = { companionId: null, destinationId: null, confirming: false };
      playTone("complete");
      toast("しゅっぱつ！ つぎのひに また あおうね！");
      KA.router.render();
    });
    var claim = appEl.querySelector("[data-claim-outing]");
    if (claim) claim.addEventListener("click", function () {
      claim.disabled = true;
      var result = KA.outings.claimOutingReward(claim.getAttribute("data-claim-outing"));
      if (!result.ok) { toast(result.reason === "already_claimed" ? "おみやげは うけとりずみだよ" : "まだ うけとれないよ"); KA.router.render(); return; }
      playTone("star");
      var species = KA.companions.getSpecies(result.trip.speciesId);
      var companion = KA.companions.getCompanion(KA.state.getAppData(), result.trip.speciesId);
      var displayName = companion ? companionDisplayName(companion) : (species ? species.name : "なかま");
      infoDialog("やったね！", '<div class="outing-claim-result' + legendaryCardClass(species) + '"><div>' + (species ? companionPresentation(species, companion) : "") + '</div>' + outingRewardArt(result.reward) + '<h3 class="companion-display-name">' + escapeHtml(displayName) + 'が かえってきたよ！</h3><p>' + escapeHtml(KA.outings.returnMessage(result.trip)) + '</p><p><strong>' + escapeHtml(KA.outings.rewardLabel(result.reward)) + 'を うけとったよ！</strong></p><p>また いっしょに いこうね！</p></div>');
      KA.router.render();
    });
  }

  function birdHouseOwnedCompanions(data) {
    return KA.companions.ensureCompanions(data).filter(function (companion) {
      return companion && KA.companions.isValidSpeciesId(companion.speciesId) && Number(companion.hatchCount || 0) > 0;
    });
  }

  function birdHouseButtonRow(mode) {
    return [
      '<div class="quick-actions bird-house-actions">',
      button("とりのおうち", mode === "home" ? "btn-primary" : "btn-soft", 'data-bird-house-mode="home"'),
      button("かざりを かえる", mode === "decorate" ? "btn-primary" : "btn-soft", 'data-bird-house-mode="decorate"'),
      button("かぐずかん", mode === "catalog" ? "btn-primary" : "btn-soft", 'data-bird-house-mode="catalog"'),
      '</div>'
    ].join("");
  }

  function renderBirdHouseFurnitureLayer(placements, slotType, layerName) {
    return KA.birdHouse.allSlots().filter(function (slot) {
      return slot.type === slotType && placements[slot.id];
    }).map(function (slot) {
      var itemId = placements[slot.id];
      return [
        '<div class="bird-house-furniture bird-house-layer-' + layerName + ' bird-house-slot-' + escapeHtml(slot.id) + '" style="left:' + slot.x + '%;top:' + slot.y + '%">',
        KA.birdHouse.renderFurniture(itemId),
        '</div>'
      ].join("");
    }).join("");
  }

  function birdHouseReactionText(species, type, companion) {
    var displayName = companion ? companionDisplayName(companion) : species.name;
    if (companion && companion.lastFedAt && String(companion.lastFedAt).slice(0, 10) === KA.date.localDateKey()) {
      return displayName + "が ごはん おいしかった！";
    }
    if (type === "tilt") return displayName + "が くびを かしげたよ！";
    if (type === "hop") return displayName + "が ぴょんと はねたよ！";
    if (type === "wing") return displayName + "が はねを うごかしたよ！";
    if (type === "sleep") return displayName + "が ねむそうにしているよ";
    return displayName + "が うれしそう！";
  }

  function pickBirdHouseReaction(speciesId) {
    var types = ["tilt", "hop", "wing", "sleep", "heart"];
    var seed = KA.companions.hashString(speciesId + "_" + Date.now());
    return types[seed % types.length];
  }

  function renderBirdHouseBirds(data, focusSpeciesId) {
    var layoutData = KA.birdHouse.companionLayout(data, focusSpeciesId);
    if (!layoutData.length) return "";
    return layoutData.map(function (entry) {
      var species = entry.species;
      var companion = entry.companion;
      var displayName = companionDisplayName(companion);
      var active = birdHouseReaction && birdHouseReaction.speciesId === species.id;
      var reactionClass = active ? " is-reacting reaction-" + birdHouseReaction.type : "";
      return [
        '<button class="bird-house-bird ' + (entry.isFocus ? "is-focus" : "") + reactionClass + legendaryCardClass(species) + '" data-house-bird="' + escapeHtml(species.id) + '" style="--bird-phone-x:' + entry.x + '%;--bird-phone-y:' + entry.y + '%;--bird-phone-scale:' + entry.scale + ';--bird-scale:' + entry.scale + ';--bird-tablet-portrait-x:' + entry.tabletPortrait.x + '%;--bird-tablet-portrait-y:' + entry.tabletPortrait.y + '%;--bird-tablet-portrait-scale:' + entry.tabletPortrait.scale + ';--bird-tablet-landscape-x:' + entry.tabletLandscape.x + '%;--bird-tablet-landscape-y:' + entry.tabletLandscape.y + '%;--bird-tablet-landscape-scale:' + entry.tabletLandscape.scale + '" aria-label="' + escapeHtml(legendaryAriaPrefix(species) + displayName) + 'の ようすをみる、' + escapeHtml(companionEvolutionProgress(companion).label) + '">',
        '<span class="bird-house-bird-art">' + companionPresentation(species, companion) + '</span>',
        '<span class="bird-house-bird-label companion-display-name">' + escapeHtml(displayName) + '<br><small>なかよし ' + Number(companion.bondLevel || 1) + ' / ' + escapeHtml(companionEvolutionProgress(companion).label) + '<br>ごはん ' + Number(companion.mealCount || 0) + 'かい</small></span>',
        active ? '<span class="bird-house-heart" aria-hidden="true">♥</span>' : '',
        '</button>'
      ].join("");
    }).join("");
  }

  function renderBirdHouseSlotButtons(placements, selectedSlotId) {
    return KA.birdHouse.allSlots().map(function (slot) {
      var item = placements[slot.id] ? KA.birdHouse.getItem(placements[slot.id]) : null;
      return [
        '<button class="bird-house-slot-button ' + (slot.id === selectedSlotId ? "is-selected" : "") + '" data-house-slot="' + escapeHtml(slot.id) + '" style="left:' + slot.x + '%;top:' + slot.y + '%" aria-label="' + escapeHtml(slot.name) + 'を選ぶ">',
        '<span>' + escapeHtml(slot.name) + '</span>',
        '<small>' + escapeHtml(item ? item.name : "なし") + '</small>',
        '</button>'
      ].join("");
    }).join("");
  }

  function renderBirdHouseRoom(data, placements, options) {
    var opts = options || {};
    var owned = birdHouseOwnedCompanions(data);
    var focusId = opts.focusSpeciesId;
    var awayId = KA.outings && KA.outings.travelingSpeciesId ? KA.outings.travelingSpeciesId(data) : null;
    var awaySpecies = awayId ? KA.companions.getSpecies(awayId) : null;
    var awayCompanion = awayId ? KA.companions.getCompanion(data, awayId) : null;
    var visibleCount = KA.birdHouse.companionLayout(data, focusId).length;
    var missingMessage = owned.length > 0 && owned.length < KA.companions.allSpecies().length ? '<p class="bird-house-maybe">まだ だれかが くるかも？</p>' : '';
    return [
      '<section class="bird-house-room panel' + (opts.decorate ? ' is-decorating' : '') + '">',
      '<div class="bird-house-bg"><div class="bird-house-window"></div><div class="bird-house-light"></div></div>',
      '<div class="bird-house-wall-layer">' + renderBirdHouseFurnitureLayer(placements, "wall", "wall") + '</div>',
      '<div class="bird-house-back-floor-layer">' + renderBirdHouseFurnitureLayer(placements, "perch", "back") + renderBirdHouseFurnitureLayer(placements, "table", "back") + renderBirdHouseFurnitureLayer(placements, "nest", "back") + '</div>',
      '<div class="bird-house-bird-layer">' + renderBirdHouseBirds(data, focusId) + '</div>',
      '<div class="bird-house-front-layer">' + renderBirdHouseFurnitureLayer(placements, "floor", "front") + '</div>',
      opts.decorate ? '<div class="bird-house-slot-layer">' + renderBirdHouseSlotButtons(placements, opts.selectedSlotId) + '</div>' : '',
      birdHouseReaction ? '<div class="bird-house-reaction" aria-live="polite">' + escapeHtml(birdHouseReaction.message) + '</div>' : '',
      awaySpecies ? '<div class="bird-house-away-message" aria-live="polite">' + (visibleCount ? escapeHtml(awayCompanion ? companionDisplayName(awayCompanion) : awaySpecies.name) + 'は おでかけちゅう！' : 'いまは おでかけちゅうだよ！<br>かえってくるのを まとうね') + '</div>' : '',
      missingMessage,
      '</section>'
    ].join("");
  }

  function renderBirdHouseNotice(house) {
    if (!house.unseenItemIds || !house.unseenItemIds.length) return "";
    return [
      '<section class="panel panel-pad bird-house-new" aria-live="polite">',
      '<h3>新しい かざりが ふえたよ！</h3>',
      '<ul>' + house.unseenItemIds.map(function (itemId) {
        var item = KA.birdHouse.getItem(itemId);
        return item ? '<li>' + escapeHtml(item.name) + '</li>' : '';
      }).join("") + '</ul>',
      button("みてみる", "btn-primary", 'data-clear-house-new'),
      '</section>'
    ].join("");
  }

  function renderBirdHouseHome(data, house, ui, focusSpeciesId) {
    var owned = birdHouseOwnedCompanions(data);
    if (!owned.length) {
      return '<section class="panel panel-pad"><h2>とりのおうち</h2><p>たまごから なかまが うまれたら<br>おうちで いっしょに あそべるよ！</p><div class="quick-actions">' + button("たまごを みる", "btn-primary", 'data-route="eggs"') + '</div></section>';
    }
    return [
      renderBirdHouseNotice(house),
      renderBirdHouseRoom(data, house.placements, { focusSpeciesId: focusSpeciesId }),
      '<section class="panel panel-pad"><h3>鳥をタップして ようすをみよう</h3><p class="muted">なかよしレベルや、ごはんを食べた回数も見られるよ。</p></section>'
    ].join("");
  }

  function birdHouseDraftPlacements(ui, house) {
    if (!ui.birdHouseDraftPlacements || typeof ui.birdHouseDraftPlacements !== "object" || Array.isArray(ui.birdHouseDraftPlacements)) {
      ui.birdHouseDraftPlacements = JSON.parse(JSON.stringify(house.placements || {}));
    }
    return ui.birdHouseDraftPlacements;
  }

  function renderBirdHouseDecorate(data, house, ui, focusSpeciesId) {
    var draft = birdHouseDraftPlacements(ui, house);
    var slots = KA.birdHouse.allSlots();
    var selectedSlotId = ui.birdHouseSelectedSlotId && KA.birdHouse.getSlot(ui.birdHouseSelectedSlotId) ? ui.birdHouseSelectedSlotId : slots[0].id;
    ui.birdHouseSelectedSlotId = selectedSlotId;
    var selectedSlot = KA.birdHouse.getSlot(selectedSlotId);
    var candidates = KA.birdHouse.compatibleUnlockedItems(selectedSlotId, data);
    return [
      '<section class="panel panel-pad"><h3>かざりを かえる</h3><p class="muted">枠をえらんで、置ける家具を選びます。自由ドラッグは使いません。</p></section>',
      renderBirdHouseRoom(data, draft, { decorate: true, selectedSlotId: selectedSlotId, focusSpeciesId: focusSpeciesId }),
      '<section class="panel panel-pad">',
      '<h3>' + escapeHtml(selectedSlot.name) + '</h3>',
      '<div class="bird-house-item-grid">',
      '<button class="bird-house-item-choice ' + (!draft[selectedSlotId] ? "is-selected" : "") + '" data-house-item=""><span class="bird-house-empty">なし</span><strong>なにも おかない</strong></button>',
      candidates.map(function (item) {
        var current = draft[selectedSlotId] === item.id;
        var placedElsewhere = Object.keys(draft).some(function (slotId) { return slotId !== selectedSlotId && draft[slotId] === item.id; });
        return [
          '<button class="bird-house-item-choice ' + (current ? "is-selected" : "") + '" data-house-item="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(item.name) + 'を置く">',
          '<span class="bird-house-item-art">' + KA.birdHouse.renderFurniture(item.id) + '</span>',
          '<strong>' + escapeHtml(item.name) + '</strong>',
          current ? '<small>いま おいているよ</small>' : placedElsewhere ? '<small>ここへ うつせるよ</small>' : '<small>' + escapeHtml(item.description) + '</small>',
          '</button>'
        ].join("");
      }).join(""),
      '</div>',
      '<div class="quick-actions">' + button("これにする", "btn-primary", 'data-save-house-decor') + button("やめる", "btn-soft", 'data-cancel-house-decor') + '</div>',
      '</section>'
    ].join("");
  }

  function renderBirdHouseCatalog(data, house) {
    var metrics = KA.birdHouse.getBirdHouseMetrics(data);
    return [
      '<section class="bird-house-item-grid">',
      KA.birdHouse.allItems().map(function (item) {
        var unlocked = house.unlockedItemIds.indexOf(item.id) >= 0;
        var progress = KA.birdHouse.conditionProgress(item, metrics);
        var placed = Object.keys(house.placements || {}).filter(function (slotId) { return house.placements[slotId] === item.id; })[0];
        return [
          '<article class="bird-house-catalog-card ' + (unlocked ? "is-unlocked" : "is-locked") + '">',
          '<div class="bird-house-catalog-art">' + KA.birdHouse.renderFurniture(item.id, { silhouette: !unlocked }) + '</div>',
          '<h3>' + escapeHtml(item.name) + '</h3>',
          '<p class="muted">' + escapeHtml(item.description) + '</p>',
          unlocked ? '<p><span class="badge">取得済み</span> ' + (placed ? '<span class="badge star">配置中: ' + escapeHtml(KA.birdHouse.getSlot(placed).name) + '</span>' : '') + '</p><p class="muted">取得日: ' + escapeHtml((house.unlockedAtByItemId[item.id] || "").slice(0, 10) || "はじめから") + '<br>置ける枠: ' + item.compatibleSlotTypes.join(" / ") + '</p>' : '<p class="muted">' + escapeHtml(progress.label) + '<br>' + Number(progress.current || 0) + ' / ' + Number(progress.target || 0) + (progress.remaining ? '<br>あと ' + Number(progress.remaining) + ' だよ' : '') + '</p>',
          '</article>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }

  function renderBirdHouse(params) {
    var data = KA.state.getAppData();
    KA.companions.ensureCompanions(data);
    if (KA.kitchen && KA.kitchen.ensureKitchen) KA.kitchen.ensureKitchen(data);
    var house = KA.birdHouse.markVisited(data);
    KA.state.saveAppData();
    var ui = KA.state.getUiState();
    if (params && params.companionId) ui.birdHouseFocusCompanionId = params.companionId;
    ui.birdHouseMode = ui.birdHouseMode === "decorate" || ui.birdHouseMode === "catalog" ? ui.birdHouseMode : "home";
    var mode = ui.birdHouseMode;
    var focusId = ui.birdHouseFocusCompanionId;
    var header = '<div class="screen-header"><div><h2>とりのおうち</h2><p class="muted">鳥たちが いっしょに くらす おうちです。</p></div><div>' + (house.unseenItemIds && house.unseenItemIds.length ? '<span class="badge star">NEW</span> ' : '') + button("ホーム", "btn-soft btn-small", 'data-route="home"') + '</div></div>';
    var body = header + birdHouseButtonRow(mode);
    if (mode === "decorate") body += renderBirdHouseDecorate(data, house, ui, focusId);
    else if (mode === "catalog") body += renderBirdHouseCatalog(data, house);
    else body += renderBirdHouseHome(data, house, ui, focusId);
    KA.state.saveUiState();
    layout("とりのおうち", body, { screenClass: "bird-house-screen" });
    bindBirdHouseEvents();
  }

  function bindBirdHouseEvents() {
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-bird-house-mode]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        var mode = el.getAttribute("data-bird-house-mode");
        ui.birdHouseMode = mode;
        if (mode === "decorate") {
          ui.birdHouseDraftPlacements = JSON.parse(JSON.stringify(KA.birdHouse.ensureBirdHouse(KA.state.getAppData()).placements));
          ui.birdHouseSelectedSlotId = ui.birdHouseSelectedSlotId || "wallLeft";
        } else {
          ui.birdHouseDraftPlacements = null;
        }
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    var clear = appEl.querySelector("[data-clear-house-new]");
    if (clear) {
      clear.addEventListener("click", function () {
        KA.birdHouse.clearUnseen(KA.state.getAppData());
        toast("かぐずかんで 見られるよ");
        KA.state.getUiState().birdHouseMode = "catalog";
        KA.state.saveUiState();
        KA.router.render();
      });
    }
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-house-bird]"), function (el) {
      el.addEventListener("click", function () {
        var speciesId = el.getAttribute("data-house-bird");
        var now = Date.now();
        if (birdHouseTapCooldown[speciesId] && now - birdHouseTapCooldown[speciesId] < 800) return;
        birdHouseTapCooldown[speciesId] = now;
        var data = KA.state.getAppData();
        var species = KA.companions.getSpecies(speciesId);
        var companion = KA.companions.getCompanion(data, speciesId);
        var type = pickBirdHouseReaction(speciesId);
        var reactionMessage = birdHouseReactionText(species, type, companion);
        KA.birdHouse.recordInteraction(speciesId, data);
        toast(reactionMessage);
        openCompanionDetail(speciesId);
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-house-slot]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        ui.birdHouseSelectedSlotId = el.getAttribute("data-house-slot");
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-house-item]"), function (el) {
      el.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        var data = KA.state.getAppData();
        var house = KA.birdHouse.ensureBirdHouse(data);
        var draft = birdHouseDraftPlacements(ui, house);
        var slotId = ui.birdHouseSelectedSlotId || "wallLeft";
        var itemId = el.getAttribute("data-house-item") || null;
        Object.keys(draft).forEach(function (key) {
          if (itemId && draft[key] === itemId) draft[key] = null;
        });
        draft[slotId] = itemId;
        ui.birdHouseDraftPlacements = draft;
        KA.state.saveUiState();
        KA.router.render();
      });
    });
    var saveDecor = appEl.querySelector("[data-save-house-decor]");
    if (saveDecor) {
      saveDecor.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        var data = KA.state.getAppData();
        var draft = ui.birdHouseDraftPlacements || {};
        KA.birdHouse.allSlots().forEach(function (slot) {
          KA.birdHouse.placeItem(slot.id, draft[slot.id] || null, data);
        });
        ui.birdHouseDraftPlacements = null;
        ui.birdHouseMode = "home";
        KA.state.saveUiState();
        toast("かざりを かえました");
        KA.router.render();
      });
    }
    var cancelDecor = appEl.querySelector("[data-cancel-house-decor]");
    if (cancelDecor) {
      cancelDecor.addEventListener("click", function () {
        var ui = KA.state.getUiState();
        ui.birdHouseDraftPlacements = null;
        ui.birdHouseMode = "home";
        KA.state.saveUiState();
        KA.router.render();
      });
    }
  }

  function toHalfWidthDigits(value) {
    return String(value == null ? "" : value).replace(/[０-９]/g, function (char) {
      return String.fromCharCode(char.charCodeAt(0) - 65248);
    });
  }

  function parseParentStarInput(value) {
    var raw = toHalfWidthDigits(value).trim();
    var numberValue;
    if (raw === "") return { ok: false, message: "スター数を入れてください" };
    if (!/^\d+$/.test(raw)) return { ok: false, message: "0から999の整数にしてください" };
    numberValue = Number(raw);
    if (!isFinite(numberValue) || numberValue < 0 || numberValue > 999) return { ok: false, message: "0から999の範囲にしてください" };
    return { ok: true, value: numberValue };
  }

  function parentColoringRows() {
    if (!appEl) return [];
    return Array.prototype.slice.call(appEl.querySelectorAll("[data-coloring-setting-row]"));
  }

  function clearParentColoringErrors() {
    parentColoringRows().forEach(function (row) {
      row.classList.remove("is-invalid");
      var error = row.querySelector("[data-coloring-cost-error]");
      if (error) error.textContent = "";
    });
  }

  function collectParentColoringSettings(showErrors) {
    var rows = parentColoringRows();
    var order = [];
    var starCosts = {};
    var ok = true;
    if (!rows.length) return { ok: true, settings: KA.coloring.getCurrentColoringSettings() };
    if (showErrors) clearParentColoringErrors();
    rows.forEach(function (row) {
      var templateId = row.getAttribute("data-template-id");
      var input = row.querySelector("[data-coloring-star-input]");
      var parsed = parseParentStarInput(input ? input.value : "");
      order.push(templateId);
      if (parsed.ok) {
        starCosts[templateId] = parsed.value;
        if (input) input.value = String(parsed.value);
      } else {
        ok = false;
        if (showErrors) {
          row.classList.add("is-invalid");
          var error = row.querySelector("[data-coloring-cost-error]");
          if (error) error.textContent = parsed.message;
        }
      }
    });
    return { ok: ok, settings: { order: order, starCosts: starCosts } };
  }

  function normalizedParentSettingsJson(settings) {
    return JSON.stringify(KA.coloring.normalizeColoringSettings(settings));
  }

  function isParentColoringDirty() {
    if (!appEl || !appEl.querySelector("[data-coloring-settings-panel]")) return false;
    var collected = collectParentColoringSettings(false);
    if (!collected.ok) return true;
    return normalizedParentSettingsJson(collected.settings) !== normalizedParentSettingsJson(KA.coloring.getCurrentColoringSettings());
  }

  function setParentColoringDirty() {
    var status = appEl && appEl.querySelector("[data-coloring-settings-status]");
    if (status) status.textContent = isParentColoringDirty() ? "未保存の変更があります" : "";
  }

  function updateParentColoringMoveButtons() {
    var rows = parentColoringRows();
    rows.forEach(function (row, index) {
      var up = row.querySelector("[data-coloring-move-up]");
      var down = row.querySelector("[data-coloring-move-down]");
      if (up) up.disabled = index === 0;
      if (down) down.disabled = index === rows.length - 1;
    });
  }

  function moveParentColoringRow(row, direction) {
    var list = appEl.querySelector("[data-coloring-settings-list]");
    if (!row || !list) return;
    if (direction < 0 && row.previousElementSibling) {
      list.insertBefore(row, row.previousElementSibling);
    } else if (direction > 0 && row.nextElementSibling) {
      list.insertBefore(row.nextElementSibling, row);
    }
    updateParentColoringMoveButtons();
    setParentColoringDirty();
  }

  function saveParentColoringSettings() {
    var collected = collectParentColoringSettings(true);
    if (!collected.ok) {
      toast("ぬりえ設定を確認してください");
      setParentColoringDirty();
      return false;
    }
    KA.coloring.saveColoringSettings(collected.settings);
    toast("ぬりえ設定を保存しました");
    KA.router.render();
    return true;
  }

  function parentColoringLeaveDialog(route, params) {
    modalRoot.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true">',
      '<h2>ぬりえ設定を保存しますか？</h2>',
      '<p>変更したスターの数と並び順があります。</p>',
      '<div class="modal-actions">',
      button("戻る", "btn-soft", 'data-dialog-cancel'),
      button("保存しない", "btn-soft", 'data-parent-coloring-discard'),
      button("保存する", "btn-primary", 'data-parent-coloring-save-leave'),
      '</div>',
      '</div>'
    ].join("");
    modalRoot.querySelector("[data-dialog-cancel]").addEventListener("click", closeDialog);
    modalRoot.querySelector("[data-parent-coloring-discard]").addEventListener("click", function () {
      closeDialog();
      KA.router.navigate(route, params);
    });
    modalRoot.querySelector("[data-parent-coloring-save-leave]").addEventListener("click", function () {
      if (!saveParentColoringSettings()) return;
      closeDialog();
      KA.router.navigate(route, params);
    });
  }

  function renderParentColoringSettings() {
    var templates = KA.coloring.getOrderedColoringTemplates();
    var rows = templates.map(function (template, index) {
      var templateId = escapeHtml(template.templateId);
      var cost = KA.coloring.getEffectiveColoringStarCost(template.templateId);
      var standard = KA.coloring.getStandardColoringStarCost(template.templateId);
      var title = escapeHtml(template.title);
      return [
        '<div class="parent-coloring-row" data-coloring-setting-row data-template-id="' + templateId + '">',
        '<button type="button" class="coloring-drag-handle" data-coloring-drag-handle aria-label="' + title + 'をドラッグで移動">↕</button>',
        '<div class="parent-coloring-preview preview-wrap" aria-hidden="true">' + KA.coloring.renderTemplate(template.templateId, {}, "") + '</div>',
        '<div class="parent-coloring-main">',
        '<h3>' + escapeHtml(template.icon + " " + template.title) + '</h3>',
        '<p class="muted">標準 ' + standard + ' / 現在 ' + cost + '</p>',
        '<div class="coloring-star-controls">',
        '<button type="button" class="btn btn-soft btn-small" data-coloring-star-minus aria-label="' + title + 'の必要スターを1つ減らす">－</button>',
        '<label class="field compact-field" for="coloring-cost-' + templateId + '"><span>必要スター</span><input id="coloring-cost-' + templateId + '" data-coloring-star-input inputmode="numeric" pattern="[0-9０-９]*" value="' + cost + '" aria-describedby="coloring-cost-error-' + templateId + '"></label>',
        '<button type="button" class="btn btn-soft btn-small" data-coloring-star-plus aria-label="' + title + 'の必要スターを1つ増やす">＋</button>',
        '</div>',
        '<p class="field-error" id="coloring-cost-error-' + templateId + '" data-coloring-cost-error aria-live="polite"></p>',
        '</div>',
        '<div class="coloring-order-controls">',
        '<button type="button" class="btn btn-soft btn-small" data-coloring-move-up aria-label="' + title + 'を上へ移動" ' + (index === 0 ? "disabled" : "") + '>上へ</button>',
        '<button type="button" class="btn btn-soft btn-small" data-coloring-move-down aria-label="' + title + 'を下へ移動" ' + (index === templates.length - 1 ? "disabled" : "") + '>下へ</button>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
    return [
      '<div class="panel panel-pad" data-coloring-settings-panel>',
      '<div class="section-heading"><div><h2>ぬりえ設定</h2><p class="muted">ひつようなスターと、ならびじゅんを変更できます。</p></div></div>',
      '<div class="parent-coloring-list" data-coloring-settings-list>' + rows + '</div>',
      '<p class="muted" data-coloring-settings-status aria-live="polite"></p>',
      '<div class="quick-actions parent-coloring-actions">',
      button("変更を保存", "btn-primary", 'data-save-coloring-settings'),
      button("標準設定に戻す", "btn-soft", 'data-reset-coloring-settings'),
      '</div>',
      '</div>'
    ].join("");
  }

  function standaloneScopeBase() {
    var manifestHref = "./manifest.webmanifest";
    var link = null;
    if (document.querySelector) {
      link = document.querySelector('link[rel="manifest"]');
    }
    if (link && link.getAttribute("href")) {
      manifestHref = link.getAttribute("href");
    }
    try {
      return new URL("./", new URL(manifestHref, global.location.href).href).href;
    } catch (error) {
      var current = String(global.location && global.location.href || "");
      return current.split("#")[0].split("?")[0].replace(/[^\/]*$/, "");
    }
  }

  function getStandaloneDiagnostics() {
    var currentUrl = String(global.location && global.location.href || "");
    var scopeBase = standaloneScopeBase();
    var navigatorStandalone = false;
    var displayModeStandalone = false;
    try {
      navigatorStandalone = !!(global.navigator && global.navigator.standalone);
    } catch (error) {
      navigatorStandalone = false;
    }
    try {
      displayModeStandalone = !!(global.matchMedia && global.matchMedia("(display-mode: standalone)").matches);
    } catch (error) {
      displayModeStandalone = false;
    }
    return {
      launchMode: navigatorStandalone || displayModeStandalone ? "独立アプリ" : "Safari",
      currentUrl: currentUrl,
      scopeBase: scopeBase,
      scopeStatus: scopeBase && currentUrl.indexOf(scopeBase) === 0 ? "scope内" : "scope外",
      navigatorStandalone: navigatorStandalone,
      displayModeStandalone: displayModeStandalone
    };
  }

  function renderStandaloneDiagnostics() {
    var info = getStandaloneDiagnostics();
    return [
      '<div class="panel panel-pad" data-standalone-diagnostics>',
      '<h2>起動診断</h2>',
      '<p class="muted">ホーム画面から独立アプリとして開けているかを確認します。</p>',
      '<div class="grid">',
      '<div class="parent-row"><h3>起動方法</h3><p><span class="badge">' + escapeHtml(info.launchMode) + '</span></p><p class="muted">navigator.standalone: ' + (info.navigatorStandalone ? "true" : "false") + ' / display-mode: ' + (info.displayModeStandalone ? "standalone" : "browser") + '</p></div>',
      '<div class="parent-row"><h3>現在URL</h3><p class="muted">' + escapeHtml(info.currentUrl) + '</p></div>',
      '<div class="parent-row"><h3>scope判定</h3><p><span class="badge">' + escapeHtml(info.scopeStatus) + '</span></p><p class="muted">scope: ' + escapeHtml(info.scopeBase) + '</p></div>',
      '</div>',
      '</div>'
    ].join("");
  }

  function bindParentColoringSettings() {
    var panel = appEl.querySelector("[data-coloring-settings-panel]");
    if (!panel) return;
    updateParentColoringMoveButtons();
    Array.prototype.forEach.call(panel.querySelectorAll("[data-coloring-star-minus], [data-coloring-star-plus]"), function (el) {
      el.addEventListener("click", function () {
        var row = el.closest("[data-coloring-setting-row]");
        var input = row && row.querySelector("[data-coloring-star-input]");
        var parsed = parseParentStarInput(input ? input.value : "");
        var value = parsed.ok ? parsed.value : KA.coloring.getEffectiveColoringStarCost(row.getAttribute("data-template-id"));
        value += el.hasAttribute("data-coloring-star-plus") ? 1 : -1;
        value = Math.max(0, Math.min(999, value));
        input.value = String(value);
        clearParentColoringErrors();
        setParentColoringDirty();
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll("[data-coloring-star-input]"), function (input) {
      input.addEventListener("input", function () {
        input.value = toHalfWidthDigits(input.value);
        setParentColoringDirty();
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll("[data-coloring-move-up]"), function (el) {
      el.addEventListener("click", function () {
        moveParentColoringRow(el.closest("[data-coloring-setting-row]"), -1);
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll("[data-coloring-move-down]"), function (el) {
      el.addEventListener("click", function () {
        moveParentColoringRow(el.closest("[data-coloring-setting-row]"), 1);
      });
    });
    Array.prototype.forEach.call(panel.querySelectorAll("[data-coloring-drag-handle]"), function (handle) {
      handle.addEventListener("pointerdown", function (event) {
        var row = handle.closest("[data-coloring-setting-row]");
        if (!row) return;
        parentColoringDragState = {
          row: row,
          pointerId: event.pointerId,
          startY: event.clientY,
          dragging: false
        };
        try { handle.setPointerCapture(event.pointerId); } catch (error) { /* optional */ }
      });
      handle.addEventListener("pointermove", function (event) {
        var state = parentColoringDragState;
        var list = appEl.querySelector("[data-coloring-settings-list]");
        var target = null;
        if (!state || state.pointerId !== event.pointerId || !list) return;
        if (!state.dragging && Math.abs(event.clientY - state.startY) < 6) return;
        state.dragging = true;
        event.preventDefault();
        state.row.classList.add("is-dragging");
        parentColoringRows().forEach(function (row) {
          if (row === state.row || target) return;
          var rect = row.getBoundingClientRect();
          if (event.clientY < rect.top + rect.height / 2) target = row;
        });
        if (target) list.insertBefore(state.row, target);
        else list.appendChild(state.row);
        updateParentColoringMoveButtons();
        setParentColoringDirty();
      });
      function endDrag(event) {
        if (!parentColoringDragState || parentColoringDragState.pointerId !== event.pointerId) return;
        if (parentColoringDragState.row) parentColoringDragState.row.classList.remove("is-dragging");
        try { handle.releasePointerCapture(event.pointerId); } catch (error) { /* optional */ }
        parentColoringDragState = null;
        updateParentColoringMoveButtons();
      }
      handle.addEventListener("pointerup", endDrag);
      handle.addEventListener("pointercancel", endDrag);
    });
    var save = panel.querySelector("[data-save-coloring-settings]");
    if (save) save.addEventListener("click", saveParentColoringSettings);
    var reset = panel.querySelector("[data-reset-coloring-settings]");
    if (reset) {
      reset.addEventListener("click", function () {
        confirmDialog("標準設定に戻す？", "スターの数と、ぬりえの並びを\nはじめの設定に戻します。", "戻す", function () {
          KA.coloring.resetColoringSettings();
          toast("標準設定に戻しました");
          KA.router.render();
        });
      });
    }
  }

  function renderParentJobSettings() {
    var data = KA.state.getAppData();
    var settings = KA.tasks.ensureJobSettings(data);
    var tasks = KA.tasks.allTasks();
    var rows = tasks.map(function (task, index) {
      var taskId = escapeHtml(task.taskId);
      var title = escapeHtml(task.title);
      var enabled = settings.enabledJobIds.indexOf(task.taskId) >= 0;
      var done = KA.tasks.isCompleted(task.taskId);
      return [
        '<div class="parent-job-row" data-parent-job-row data-job-id="' + taskId + '">',
        '<div class="parent-job-main">',
        '<div class="task-icon parent-job-icon">' + KA.tasks.renderTaskIcon(task) + '</div>',
        '<div><h3>' + title + '</h3>',
        '<p><span class="badge">' + (task.isCustom ? 'オリジナル' : '標準') + '</span> <span class="badge ' + (enabled ? 'is-enabled' : '') + '">' + (enabled ? '有効' : 'お休み中') + '</span></p>',
        task.description ? '<p class="muted">' + escapeHtml(task.description) + '</p>' : '',
        '</div></div>',
        '<div class="parent-job-controls">',
        '<label class="job-enabled-control"><input type="checkbox" data-parent-job-enabled="' + taskId + '" ' + (enabled ? 'checked' : '') + ' aria-label="' + title + 'を有効またはお休み中にする"><span>' + (enabled ? '有効' : 'お休み中') + '</span></label>',
        '<div class="job-order-controls">',
        button('上へ', 'btn-soft btn-small', 'data-parent-job-up="' + taskId + '" aria-label="' + title + 'を上へ移動" ' + (index === 0 ? 'disabled' : '')),
        button('下へ', 'btn-soft btn-small', 'data-parent-job-down="' + taskId + '" aria-label="' + title + 'を下へ移動" ' + (index === tasks.length - 1 ? 'disabled' : '')),
        '</div>',
        task.isCustom ? '<div class="job-edit-controls">' + button('編集', 'btn-soft btn-small', 'data-edit-custom-job="' + taskId + '"') + button('削除', 'btn-soft btn-small', 'data-delete-custom-job="' + taskId + '"') + '</div>' : (task.taskId === "job_cleanup" ? '<p class="parent-job-reward-fixed"><span>報酬スター</span><strong>⭐ 2</strong><small>このおしごとは 2こ</small></p>' : '<label class="field compact-field parent-job-reward"><span>報酬スター</span><input type="number" min="0" max="9" value="' + Number(task.rewardStars || 0) + '" data-parent-task-reward="' + taskId + '"></label>'),
        '<p><span class="badge">' + (done ? '今日 完了' : '今日 未完了') + '</span></p>',
        done ? button('完了を訂正', 'btn-danger btn-small', 'data-undo-task="' + taskId + '"') : '',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
    return [
      '<section class="panel panel-pad parent-job-settings" aria-labelledby="parent-job-settings-title">',
      '<div class="section-heading"><div><h2 id="parent-job-settings-title">おしごと設定</h2><p class="muted">表示する数・種類・並び順を変更できます。</p></div></div>',
      '<div class="job-count-control">',
      '<span>1日に ひょうじする かず</span>',
      button('－', 'btn-soft btn-small', 'data-job-count-minus aria-label="1日に表示するおしごとを1つ減らす" ' + (settings.dailyDisplayCount <= 1 ? 'disabled' : '')),
      '<output aria-live="polite">' + settings.dailyDisplayCount + '</output>',
      button('＋', 'btn-soft btn-small', 'data-job-count-plus aria-label="1日に表示するおしごとを1つ増やす" ' + (settings.dailyDisplayCount >= 10 ? 'disabled' : '')),
      '</div>',
      '<div class="parent-job-list">' + rows + '</div>',
      '<p class="muted" data-job-settings-status aria-live="polite"></p>',
      '<div class="parent-job-actions">',
      button('オリジナルを追加', 'btn-primary', 'data-add-custom-job ' + (settings.customJobs.length >= KA.tasks.MAX_CUSTOM_JOBS ? 'disabled' : '')),
      button('おしごと設定を もとにもどす', 'btn-soft', 'data-reset-job-settings'),
      '</div>',
      '</section>'
    ].join('');
  }

  function customJobEditor(taskId) {
    var task = taskId ? KA.tasks.allTasks().filter(function (item) { return item.taskId === taskId && item.isCustom; })[0] : null;
    var presets = KA.tasks.iconPresets();
    var selectedIcon = task ? task.iconKey : "toybox";
    modalRoot.innerHTML = [
      '<div class="modal job-editor-modal" role="dialog" aria-modal="true" aria-labelledby="custom-job-editor-title">',
      '<h2 id="custom-job-editor-title">' + (task ? 'オリジナルを編集' : 'オリジナルを追加') + '</h2>',
      '<label class="field"><span>おしごとの名前（20文字まで）</span><input data-custom-job-name maxlength="20" value="' + escapeHtml(task ? task.title : '') + '"></label>',
      '<label class="field"><span>短い説明（60文字まで）</span><textarea data-custom-job-description maxlength="60">' + escapeHtml(task ? task.description : '') + '</textarea></label>',
      '<fieldset class="job-icon-fieldset"><legend>アイコン</legend><div class="job-icon-presets">',
      presets.map(function (preset) {
        return '<label class="job-icon-option"><input type="radio" name="custom-job-icon" value="' + preset.key + '" ' + (preset.key === selectedIcon ? 'checked' : '') + '><span class="task-icon">' + preset.svg + '</span><span>' + escapeHtml(preset.label) + '</span></label>';
      }).join(''),
      '</div></fieldset>',
      '<label class="job-enabled-control"><input type="checkbox" data-custom-job-enabled ' + (!task || task.active !== false ? 'checked' : '') + '><span>有効にする</span></label>',
      '<p class="field-error" data-custom-job-error aria-live="polite"></p>',
      '<div class="modal-actions">',
      button('戻る', 'btn-soft', 'data-dialog-cancel'),
      button('保存', 'btn-primary', 'data-save-custom-job'),
      '</div></div>'
    ].join('');
    modalRoot.querySelector('[data-dialog-cancel]').addEventListener('click', closeDialog);
    modalRoot.querySelector('[data-save-custom-job]').addEventListener('click', function () {
      var selected = modalRoot.querySelector('input[name="custom-job-icon"]:checked');
      var input = {
        name: modalRoot.querySelector('[data-custom-job-name]').value,
        description: modalRoot.querySelector('[data-custom-job-description]').value,
        iconKey: selected ? selected.value : 'star',
        enabled: modalRoot.querySelector('[data-custom-job-enabled]').checked
      };
      var result = task ? KA.tasks.updateCustomJob(task.taskId, input) : KA.tasks.addCustomJob(input);
      if (!result.ok) {
        modalRoot.querySelector('[data-custom-job-error]').textContent = result.reason === 'limit' ? 'オリジナルのおしごとは20件までです。' : result.reason === 'minimum_one' ? 'おしごとは 1ついじょう えらんでください' : 'おしごとの名前を入力してください。';
        return;
      }
      closeDialog();
      toast('おしごと設定を保存しました');
      KA.router.render();
    });
  }

  function jobSettingsResetDialog() {
    modalRoot.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true">',
      '<h2>おしごと設定を もとにもどす？</h2>',
      '<p>標準のおしごと、並び順、1日の表示数を戻します。達成履歴と星は変わりません。</p>',
      '<div class="modal-actions modal-actions-stack">',
      button('戻る', 'btn-soft', 'data-dialog-cancel'),
      button('標準設定だけ戻す', 'btn-primary', 'data-reset-standard-jobs'),
      button('オリジナルもすべて削除', 'btn-soft', 'data-reset-all-jobs'),
      '</div></div>'
    ].join('');
    modalRoot.querySelector('[data-dialog-cancel]').addEventListener('click', closeDialog);
    modalRoot.querySelector('[data-reset-standard-jobs]').addEventListener('click', function () {
      KA.tasks.resetJobSettings(false);
      closeDialog();
      toast('標準のおしごと設定に戻しました');
      KA.router.render();
    });
    modalRoot.querySelector('[data-reset-all-jobs]').addEventListener('click', function () {
      confirmDialog('オリジナルをすべて削除しますか？', '過去の達成履歴と星は残ります。削除したおしごとは元に戻せません。', 'すべて削除', function () {
        KA.tasks.resetJobSettings(true);
        toast('標準のおしごと設定に戻しました');
        KA.router.render();
      });
    });
  }

  function bindParentJobSettings() {
    var settings = KA.tasks.ensureJobSettings(KA.state.getAppData());
    var minus = appEl.querySelector('[data-job-count-minus]');
    var plus = appEl.querySelector('[data-job-count-plus]');
    if (minus) minus.addEventListener('click', function () { KA.tasks.setDailyDisplayCount(settings.dailyDisplayCount - 1); KA.router.render(); });
    if (plus) plus.addEventListener('click', function () { KA.tasks.setDailyDisplayCount(settings.dailyDisplayCount + 1); KA.router.render(); });
    Array.prototype.forEach.call(appEl.querySelectorAll('[data-parent-job-enabled]'), function (el) {
      el.addEventListener('change', function () {
        var result = KA.tasks.setJobEnabled(el.getAttribute('data-parent-job-enabled'), el.checked);
        if (!result.ok) toast('おしごとは 1ついじょう えらんでください');
        else toast('おしごと設定を保存しました');
        KA.router.render();
      });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll('[data-parent-job-up]'), function (el) {
      el.addEventListener('click', function () { KA.tasks.moveJob(el.getAttribute('data-parent-job-up'), 'up'); KA.router.render(); });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll('[data-parent-job-down]'), function (el) {
      el.addEventListener('click', function () { KA.tasks.moveJob(el.getAttribute('data-parent-job-down'), 'down'); KA.router.render(); });
    });
    var add = appEl.querySelector('[data-add-custom-job]');
    if (add) add.addEventListener('click', function () { customJobEditor(null); });
    Array.prototype.forEach.call(appEl.querySelectorAll('[data-edit-custom-job]'), function (el) {
      el.addEventListener('click', function () { customJobEditor(el.getAttribute('data-edit-custom-job')); });
    });
    Array.prototype.forEach.call(appEl.querySelectorAll('[data-delete-custom-job]'), function (el) {
      el.addEventListener('click', function () {
        var taskId = el.getAttribute('data-delete-custom-job');
        var task = KA.tasks.allTasks().filter(function (item) { return item.taskId === taskId; })[0];
        confirmDialog('オリジナルを削除しますか？', (task ? task.title : 'このおしごと') + 'を今日の一覧から外します。過去の達成履歴と星は残ります。', '削除', function () {
          KA.tasks.deleteCustomJob(taskId);
          toast('オリジナルのおしごとを削除しました');
          KA.router.render();
        });
      });
    });
    var reset = appEl.querySelector('[data-reset-job-settings]');
    if (reset) reset.addEventListener('click', jobSettingsResetDialog);
  }

  function renderSpecialRewardPanel(data) {
    var totals = data.profile.starTotals || {};
    var recent = KA.stars.recentSpecialRewards(5);
    return [
      '<section class="panel panel-pad parent-special-reward" data-special-reward-form aria-labelledby="parent-special-reward-title">',
      '<div class="section-heading"><div><p class="eyebrow">スターを プレゼント</p><h2 id="parent-special-reward-title">とくべつな ごほうび</h2></div>',
      '<span class="badge star">つかえるほし ' + Number(totals.spendableStars || 0).toLocaleString("ja-JP") + '</span></div>',
      '<p class="muted">がんばったときや<br>とくべつな日に<br>スターをプレゼントできます。</p>',
      '<label class="field" for="special-reward-amount"><span>わたす スターのかず</span><input id="special-reward-amount" data-special-reward-amount type="text" inputmode="numeric" pattern="[0-9０-９]*" autocomplete="off" aria-describedby="special-reward-error"></label>',
      '<label class="field" for="special-reward-note"><span>ひとこと（30もじまで・なくてもOK）</span><textarea id="special-reward-note" data-special-reward-note maxlength="30"></textarea></label>',
      '<p class="field-error" id="special-reward-error" data-special-reward-error aria-live="assertive"></p>',
      '<p class="parent-special-reward-status" data-special-reward-status aria-live="polite">' + escapeHtml(specialRewardStatusMessage) + '</p>',
      button("かくにんする", "btn-primary", 'data-confirm-special-reward'),
      '<div class="special-reward-history"><h3>さいきんの ごほうび</h3>',
      recent.length ? recent.map(function (reward) {
        return '<article><strong>' + escapeHtml(KA.date.formatDisplayDate(String(reward.createdAt || "").slice(0, 10))) + '　' + Number(reward.amount).toLocaleString("ja-JP") + 'スター</strong>' + (reward.note ? '<p>' + escapeHtml(reward.note) + '</p>' : '<p class="muted">ひとことなし</p>') + '<small>' + (reward.seenAt ? "うけとり表示ずみ" : "まだ みていません") + '</small></article>';
      }).join("") : '<p class="muted">まだ ごほうびの きろくはありません。</p>',
      '</div>',
      '</section>'
    ].join("");
  }

  function closeSpecialRewardDialog() {
    var returnFocus = specialRewardDialogReturnFocus;
    specialRewardDialogReturnFocus = null;
    specialRewardInProgress = false;
    closeDialog();
    if (returnFocus && document.body.contains(returnFocus)) returnFocus.focus();
    else {
      var input = appEl && appEl.querySelector("[data-special-reward-amount]");
      if (input) input.focus();
    }
  }

  function openSpecialRewardConfirmation(validation, note, returnFocus) {
    var dialog;
    var executeButton;
    var error;
    var submitted = false;
    specialRewardDialogReturnFocus = returnFocus || document.activeElement;
    modalRoot.innerHTML = [
      '<div class="modal special-reward-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="special-reward-confirm-title">',
      '<h2 id="special-reward-confirm-title">' + validation.amount.toLocaleString("ja-JP") + 'スターを<br>プレゼントしますか？</h2>',
      '<dl class="special-reward-summary">',
      '<div><dt>いま</dt><dd>' + validation.current.toLocaleString("ja-JP") + 'スター</dd></div>',
      '<div><dt>プレゼント</dt><dd>+' + validation.amount.toLocaleString("ja-JP") + 'スター</dd></div>',
      '<div><dt>プレゼントしたあと</dt><dd>' + validation.after.toLocaleString("ja-JP") + 'スター</dd></div>',
      '</dl>',
      note ? '<div class="special-reward-confirm-note"><span>ひとこと</span><p>' + escapeHtml(note) + '</p></div>' : '',
      '<p class="field-error" data-special-reward-confirm-error aria-live="assertive"></p>',
      '<div class="modal-actions">',
      button("もどる", "btn-soft", 'data-cancel-special-reward'),
      button("スターを プレゼントする", "btn-primary", 'data-grant-special-reward aria-label="' + validation.amount + 'スターを とくべつなごほうびとして プレゼントする"'),
      '</div>',
      '</div>'
    ].join("");
    dialog = modalRoot.querySelector(".special-reward-confirm-modal");
    executeButton = modalRoot.querySelector("[data-grant-special-reward]");
    error = modalRoot.querySelector("[data-special-reward-confirm-error]");
    modalRoot.querySelector("[data-cancel-special-reward]").addEventListener("click", closeSpecialRewardDialog);
    executeButton.addEventListener("click", function () {
      var result;
      if (specialRewardInProgress || submitted) return;
      submitted = true;
      specialRewardInProgress = true;
      executeButton.disabled = true;
      executeButton.textContent = "プレゼントしています…";
      result = KA.stars.grantSpecialRewardStars(validation.amount, note);
      if (!result.ok) {
        submitted = false;
        specialRewardInProgress = false;
        executeButton.disabled = false;
        executeButton.textContent = "スターを プレゼントする";
        error.textContent = result.message || "もういちど やりなおしてください";
        executeButton.focus();
        return;
      }
      specialRewardStatusMessage = result.reward.amount.toLocaleString("ja-JP") + "スターを プレゼントしました";
      specialRewardInProgress = false;
      specialRewardDialogReturnFocus = null;
      closeDialog();
      toast(specialRewardStatusMessage);
      KA.router.render();
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !specialRewardInProgress) {
        event.preventDefault();
        closeSpecialRewardDialog();
      }
    });
    bindDialogFocusTrap(dialog);
    global.setTimeout(function () { executeButton.focus(); }, 0);
  }

  function bindSpecialRewardPanel() {
    var amount = appEl.querySelector("[data-special-reward-amount]");
    var note = appEl.querySelector("[data-special-reward-note]");
    var error = appEl.querySelector("[data-special-reward-error]");
    var confirm = appEl.querySelector("[data-confirm-special-reward]");
    if (!amount || !note || !error || !confirm) return;
    amount.addEventListener("input", function () {
      amount.value = toHalfWidthDigits(amount.value);
      error.textContent = "";
      specialRewardStatusMessage = "";
    });
    note.addEventListener("input", function () {
      error.textContent = "";
      specialRewardStatusMessage = "";
    });
    confirm.addEventListener("click", function () {
      var validation = KA.stars.validateSpecialRewardAmount(amount.value);
      var safeNote = KA.stars.normalizeSpecialRewardNote(note.value);
      if (!validation.ok) {
        error.textContent = validation.message;
        amount.focus();
        return;
      }
      openSpecialRewardConfirmation(validation, safeNote, confirm);
    });
  }

  function renderParentAccessRequired() {
    var body = '<section class="panel panel-pad"><h2>おとなのひとと ひらいてね</h2><p>画面右上の「おとな」を長押しして、確認してから使えます。</p></section>';
    layout("おとなモード", body);
  }

  function renderParentCompanionDesignGallery() {
    var stage = parentCompanionGalleryStage >= 1 && parentCompanionGalleryStage <= 3
      ? parentCompanionGalleryStage
      : 1;
    var stageButtons = [1, 2, 3].map(function (candidate) {
      return button(
        "stage " + candidate,
        candidate === stage ? "btn-primary is-selected" : "btn-soft",
        'data-parent-companion-stage="' + candidate + '" aria-pressed="' + (candidate === stage ? "true" : "false") + '"'
      );
    }).join("");
    var cards = KA.companions.allSpecies().map(function (species) {
      return [
        '<article class="parent-companion-design-card' + legendaryCardClass(species) + '" data-parent-design-species="' + escapeHtml(species.id) + '">',
        '<div class="parent-companion-design-art">' + companionPresentation(species, null, { stage: stage, displayName: species.name }) + '</div>',
        '<h3>' + escapeHtml(species.name) + '</h3>',
        '<p><span class="badge">' + escapeHtml(KA.companions.getEvolutionStageLabel(stage)) + '</span></p>',
        '<small>designVersion ' + Number(species.designVersion || 1) + '</small>',
        '</article>'
      ].join("");
    }).join("");
    return [
      '<section class="panel panel-pad parent-companion-gallery" data-parent-companion-gallery aria-labelledby="parent-companion-gallery-title">',
      '<div class="section-heading"><div><p class="eyebrow">未取得のなかまも見られます</p><h2 id="parent-companion-gallery-title">なかまデザイン一覧</h2></div><span class="badge">全15種類</span></div>',
      '<p class="muted">おとなモードだけで、すべての正式デザインと成長した姿を確認できます。</p>',
      '<div class="parent-companion-stage-control" role="group" aria-label="表示するなかよし進化の段階">' + stageButtons + '</div>',
      '<div class="parent-companion-design-grid">' + cards + '</div>',
      '</section>'
    ].join("");
  }

  function renderParent() {
    if (!KA.parentMode || !KA.parentMode.isAuthorized || !KA.parentMode.isAuthorized()) {
      renderParentAccessRequired();
      return;
    }
    var data = KA.state.getAppData();
    var record = KA.state.getDailyRecord();
    var todayArt = record.artworkIds.map(KA.coloring.getArtwork).filter(Boolean);
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
      renderSpecialRewardPanel(data),
      renderStandaloneDiagnostics(),
      renderParentCompanionDesignGallery(),
      renderParentColoringSettings(),
      renderParentJobSettings(),
      '<div class="panel panel-pad"><h2>とりさんキッチンの注意</h2><p class="muted">このアプリでは、空想上の鳥が人間の料理を食べます。実際の鳥には、人間用に調理された料理を与えないでください。</p></div>',
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
    bindParentColoringSettings();
    bindParentJobSettings();
    bindSpecialRewardPanel();
    Array.prototype.forEach.call(appEl.querySelectorAll("[data-parent-companion-stage]"), function (el) {
      el.addEventListener("click", function () {
        var stage = Number(el.getAttribute("data-parent-companion-stage"));
        if (stage < 1 || stage > 3 || stage === parentCompanionGalleryStage) return;
        parentCompanionGalleryStage = stage;
        KA.router.render();
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
    if (!KA.parentMode || !KA.parentMode.isAuthorized || !KA.parentMode.isAuthorized()) {
      renderParentAccessRequired();
      return;
    }
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
    KA.router.register("companion-detail", renderCompanionDetail);
    KA.router.register("kitchen", renderKitchen);
    KA.router.register("bird-house", renderBirdHouse);
    KA.router.register("outing", renderOuting);
    KA.router.register("album", renderAlbum);
    KA.router.register("parent", renderParent);
    KA.router.register("data", renderData);
  }

  function unlockAppShell() {
    var shell = appEl || document.getElementById("app");
    var body = document.body;
    var html = document.documentElement;
    if (shell) {
      shell.hidden = false;
      shell.removeAttribute("hidden");
      shell.removeAttribute("aria-hidden");
      shell.removeAttribute("inert");
      try { shell.inert = false; } catch (error) { /* Safari fallback */ }
      shell.style.display = "";
      shell.style.visibility = "";
      shell.style.opacity = "";
      shell.style.pointerEvents = "";
      shell.style.transform = "";
    }
    if (body) {
      body.classList.remove("startup-active");
      body.classList.remove("is-starting");
      body.style.overflow = "";
      body.style.position = "";
      body.style.pointerEvents = "";
    }
    if (html) {
      html.classList.remove("startup-active");
      html.classList.remove("is-starting");
      html.style.overflow = "";
    }
  }

  function bootMark(stage) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.mark) {
      global.KodomoAdventureBoot.mark(stage);
    }
  }

  function bootCapture(error, stage) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.captureException) {
      return global.KodomoAdventureBoot.captureException(error, { stage: stage || (global.KodomoAdventureBoot.currentStage && global.KodomoAdventureBoot.currentStage()) });
    }
    return null;
  }

  function hasAppContent() {
    var shell = appEl || document.getElementById("app");
    return Boolean(shell && shell.innerHTML && shell.innerHTML.replace(/\s/g, "").length);
  }

  function renderStartupRecovery(error) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.showRecovery) {
      global.KodomoAdventureBoot.showRecovery(error, { stage: global.KodomoAdventureBoot.currentStage && global.KodomoAdventureBoot.currentStage() });
      startupState.firstRenderCompleted = true;
      return;
    }
    var shell = appEl || document.getElementById("app");
    if (!shell) return;
    if (global.console && console.error) {
      console.error("KodomoAdventure startup failed", error);
    }
    shell.innerHTML = [
      '<main class="screen startup-recovery" role="main">',
      '<section class="panel panel-pad">',
      '<h1>うまく よみこめませんでした</h1>',
      '<p class="muted">データは そのままです。もういちど ひらいてみてください。</p>',
      '<div class="quick-actions">',
      button("もういちど よみこむ", "btn-primary", 'data-startup-reload'),
      button("ホームを ひらく", "btn-soft", 'data-startup-home'),
      '</div>',
      '</section>',
      '</main>'
    ].join("");
    var reload = shell.querySelector("[data-startup-reload]");
    var home = shell.querySelector("[data-startup-home]");
    if (reload) {
      reload.addEventListener("click", function () {
        global.location.reload();
      });
    }
    if (home) {
      home.addEventListener("click", function () {
        try {
          KA.state.init();
          registerRoutes();
          KA.router.navigate("home");
        } catch (innerError) {
          if (global.console && console.error) console.error("KodomoAdventure recovery home failed", innerError);
          renderStartupRecovery(innerError);
        }
      });
    }
    startupState.firstRenderCompleted = true;
  }

  function finishStartupScreen(options) {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.finishStartupScreen) {
      unlockAppShell();
      global.KodomoAdventureBoot.finishStartupScreen(options || {});
      startupState.splashFinished = true;
      return;
    }
    var opts = options || {};
    var splash = document.getElementById("startup-splash");
    if (startupState.splashFinished) {
      unlockAppShell();
      return;
    }
    if (!startupState.firstRenderCompleted && !opts.force) return;
    var elapsed = Date.now() - (startupState.startedAt || Date.now());
    var wait = opts.force ? 0 : Math.max(0, startupState.minMs - elapsed);
    global.setTimeout(function () {
      if (startupState.splashFinished) {
        unlockAppShell();
        return;
      }
      if (!hasAppContent()) {
        renderStartupRecovery(startupState.error || new Error("first render did not complete"));
      }
      unlockAppShell();
      startupState.splashFinished = true;
      if (splash) {
        splash.classList.add("is-hiding");
        splash.setAttribute("aria-hidden", "true");
        global.setTimeout(function () {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 450);
      }
    }, wait);
  }

  function initStartupSplash() {
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.finishStartupScreen) {
      startupState.startupStarted = true;
      startupState.startedAt = Date.now();
      startupState.splashFinished = false;
      if (document.body) document.body.classList.add("startup-active");
      return finishStartupScreen;
    }
    var splash = document.getElementById("startup-splash");
    startupState.startupStarted = true;
    startupState.startedAt = Date.now();
    startupState.splashFinished = false;
    if (!splash) return finishStartupScreen;
    startupState.minMs = Number(splash.getAttribute("data-min-ms") || 1200);
    startupState.maxMs = Number(splash.getAttribute("data-max-ms") || 4000);
    document.body.classList.add("startup-active");
    splash.addEventListener("click", function () {
      finishStartupScreen({});
    });
    global.setTimeout(function () {
      finishStartupScreen({ force: true, reason: "timeout" });
    }, startupState.maxMs);
    return finishStartupScreen;
  }

  function initApp() {
    var closeStartupSplash = initStartupSplash();
    var initError = null;
    appEl = document.getElementById("app");
    modalRoot = document.getElementById("modal-root");
    toastRoot = document.getElementById("toast-root");
    bootMark("APP_INIT_STARTED");
    if (global.KodomoAdventureBoot && global.KodomoAdventureBoot.isSafeStart && global.KodomoAdventureBoot.isSafeStart()) {
      try {
        global.KodomoAdventureBoot.renderSafeStartHome();
        startupState.firstRenderCompleted = true;
        startupState.appInitialized = true;
      } catch (safeError) {
        initError = safeError;
        startupState.error = safeError;
        bootCapture(safeError, "INIT_RENDER_SAFE_START");
        renderStartupRecovery(safeError);
      } finally {
        unlockAppShell();
        closeStartupSplash({ error: initError });
      }
      return;
    }
    try {
      bootMark("STATE_INIT_STARTED");
      KA.state.init();
      bootMark("STATE_INIT_COMPLETED");
      bootMark("EVENT_BINDING_STARTED");
      registerRoutes();
      bootMark("EVENT_BINDING_COMPLETED");
      var startRoute = KA.state.getUiState().lastRoute || "home";
      if (["parent", "data", "magic", "coloring-editor", "star"].indexOf(startRoute) >= 0) {
        startRoute = "home";
      }
      bootMark("FIRST_RENDER_STARTED");
      KA.router.navigate(startRoute);
      startupState.firstRenderCompleted = hasAppContent();
      bootMark("FIRST_RENDER_COMPLETED");
      document.addEventListener("pointerdown", syncBgmState, { once: true });
    } catch (error) {
      initError = error;
      startupState.error = error;
      bootCapture(error, global.KodomoAdventureBoot && global.KodomoAdventureBoot.currentStage ? global.KodomoAdventureBoot.currentStage() : "APP_INIT_STARTED");
      renderStartupRecovery(error);
    } finally {
      startupState.appInitialized = true;
      bootMark("APP_INIT_COMPLETED");
      unlockAppShell();
      closeStartupSplash({ error: initError });
    }
  }

  KA.app = {
    init: initApp,
    toast: toast,
    confirmDialog: confirmDialog,
    infoDialog: infoDialog,
    playTone: playTone,
    setSelectedCompanionId: setSelectedCompanionId,
    getSelectedCompanion: getSelectedCompanion,
    openCompanionDetail: openCompanionDetail,
    companionIsTraveling: companionIsTraveling,
    syncBgmState: syncBgmState,
    escapeHtml: escapeHtml,
    finishStartupScreen: finishStartupScreen,
    startupState: startupState
  };

  document.addEventListener("DOMContentLoaded", initApp);
})(window, document);
