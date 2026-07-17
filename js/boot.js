(function (global, document) {
  "use strict";

  var DIAGNOSTIC_KEY = "kodomoAdventure.bootDiagnostic.v1";
  var HOTFIX_QUERY = "v=10p19";
  var APP_VERSION = "1.0.0-prototype.19";
  var VERSION_LABEL = "Ver.1.0 試作19";
  var startupStartedAt = Date.now();
  var minSplashMs = 1200;
  var maxSplashMs = 4000;
  var currentStage = "BOOT_SCRIPT_LOADED";
  var splashFinished = false;
  var listenersReady = false;
  var lastDiagnostic = null;
  var safeMode = /\bsafeStart=1\b/.test(global.location && global.location.search || "");

  function nowIso() {
    try {
      return new Date().toISOString();
    } catch (error) {
      return String(Date.now());
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stageCode(stage) {
    var value = String(stage || currentStage || "");
    if (value.indexOf("STORAGE") >= 0) return "INIT-STORAGE-001";
    if (value.indexOf("MIGRATION") >= 0) return "INIT-MIGRATION-001";
    if (value.indexOf("COMPANION") >= 0) return "INIT-COMPANIONS-001";
    if (value.indexOf("EGG") >= 0) return "INIT-EGGS-001";
    if (value.indexOf("UI_STATE") >= 0 || value.indexOf("UISTATE") >= 0) return "INIT-UISTATE-001";
    if (value.indexOf("EVENT") >= 0) return "INIT-EVENTS-001";
    if (value.indexOf("RENDER") >= 0) return "INIT-RENDER-001";
    if (value.indexOf("STATE") >= 0) return "INIT-STATE-001";
    return "INIT-UNKNOWN-001";
  }

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function mark(stage) {
    currentStage = String(stage || currentStage || "INIT_UNKNOWN");
    return currentStage;
  }

  function getAppVersion() {
    try {
      if (global.KodomoAdventure && global.KodomoAdventure.constants && global.KodomoAdventure.constants.APP_VERSION) {
        return global.KodomoAdventure.constants.APP_VERSION;
      }
    } catch (error) {
      // Keep boot independent from app internals.
    }
    return APP_VERSION;
  }

  function normalizeError(input) {
    var error = input || {};
    var reason = error.reason || error;
    if (error.error) reason = error.error;
    return {
      name: String((reason && reason.name) || error.name || "Error"),
      message: String((reason && reason.message) || error.message || reason || "unknown error"),
      filename: String(error.filename || error.fileName || ""),
      lineno: typeof error.lineno === "number" ? error.lineno : (typeof error.lineNumber === "number" ? error.lineNumber : null),
      colno: typeof error.colno === "number" ? error.colno : (typeof error.columnNumber === "number" ? error.columnNumber : null),
      stack: String((reason && reason.stack) || error.stack || "")
    };
  }

  function diagnosticPayload(input, opts) {
    var options = opts || {};
    var normalized = normalizeError(input || {});
    return {
      occurredAt: nowIso(),
      stage: options.stage || currentStage,
      errorCode: options.errorCode || stageCode(options.stage || currentStage),
      errorName: normalized.name,
      message: normalized.message,
      filename: normalized.filename,
      lineNumber: normalized.lineno,
      columnNumber: normalized.colno,
      stack: normalized.stack,
      rejectionReason: options.rejectionReason || "",
      appVersion: getAppVersion(),
      userAgent: String(global.navigator && global.navigator.userAgent || ""),
      url: String(global.location && global.location.href || ""),
      safeMode: Boolean(safeMode),
      versionLabel: VERSION_LABEL
    };
  }

  function saveDiagnostic(payload) {
    lastDiagnostic = payload;
    try {
      var raw = global.localStorage && global.localStorage.getItem(DIAGNOSTIC_KEY);
      var list = safeJsonParse(raw, []);
      if (!Array.isArray(list)) list = [];
      list.unshift(payload);
      while (list.length > 5) list.pop();
      global.localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(list));
    } catch (error) {
      // Diagnostics must never block recovery.
    }
  }

  function latestDiagnostic() {
    if (lastDiagnostic) return lastDiagnostic;
    try {
      var list = safeJsonParse(global.localStorage && global.localStorage.getItem(DIAGNOSTIC_KEY), []);
      if (Array.isArray(list) && list[0]) return list[0];
    } catch (error) {
      // Ignore.
    }
    return null;
  }

  function captureException(input, opts) {
    var payload = diagnosticPayload(input, opts || {});
    saveDiagnostic(payload);
    if (global.console && console.error) {
      console.error("KodomoAdventure boot diagnostic", payload);
    }
    return payload;
  }

  function removeLockFromElement(element) {
    if (!element) return;
    try { element.hidden = false; } catch (error) { /* noop */ }
    try { element.removeAttribute("hidden"); } catch (error2) { /* noop */ }
    try { element.removeAttribute("inert"); } catch (error3) { /* noop */ }
    try { element.inert = false; } catch (error4) { /* noop */ }
    try { element.removeAttribute("aria-hidden"); } catch (error5) { /* noop */ }
    if (element.style) {
      element.style.opacity = "";
      element.style.visibility = "";
      element.style.pointerEvents = "";
      element.style.transform = "";
      element.style.touchAction = "";
      if (element.id !== "boot-recovery-root") element.style.display = "";
    }
  }

  function unlockStartupLock() {
    var html = document.documentElement;
    var body = document.body;
    removeLockFromElement(html);
    removeLockFromElement(body);
    removeLockFromElement(document.getElementById("app"));
    removeLockFromElement(document.getElementById("app-root"));
    removeLockFromElement(document.querySelector && document.querySelector("main"));
    if (html) {
      try { html.classList.remove("startup-active"); } catch (error) { /* noop */ }
      try { html.classList.remove("is-starting"); } catch (error2) { /* noop */ }
      html.style.overflow = "";
      html.style.position = "";
      html.style.pointerEvents = "";
      html.style.touchAction = "";
    }
    if (body) {
      try { body.classList.remove("startup-active"); } catch (error3) { /* noop */ }
      try { body.classList.remove("is-starting"); } catch (error4) { /* noop */ }
      try { body.classList.remove("splash-active"); } catch (error5) { /* noop */ }
      body.style.overflow = "";
      body.style.position = "";
      body.style.pointerEvents = "";
      body.style.touchAction = "";
    }
  }

  function recoveryRoot() {
    var root = document.getElementById("boot-recovery-root");
    if (!root && document.body) {
      root = document.createElement("div");
      root.id = "boot-recovery-root";
      document.body.appendChild(root);
    }
    if (root) {
      root.hidden = false;
      root.removeAttribute("hidden");
      root.removeAttribute("inert");
      root.removeAttribute("aria-hidden");
      try { root.inert = false; } catch (error) { /* noop */ }
      root.style.display = "block";
      root.style.visibility = "visible";
      root.style.opacity = "1";
      root.style.pointerEvents = "auto";
    }
    return root;
  }

  function diagnosticText() {
    var payload = latestDiagnostic() || diagnosticPayload({ message: "no diagnostic" }, { errorCode: "INIT-UNKNOWN-001" });
    return JSON.stringify(payload, null, 2);
  }

  function buttonHtml(label, attrs) {
    return '<button class="boot-recovery-button" type="button" ' + attrs + '>' + label + '</button>';
  }

  function plainRecovery(message) {
    try {
      var root = recoveryRoot();
      if (!root) return;
      root.innerHTML = '<div style="min-height:100vh;padding:24px;background:#fffdf8;color:#24312b;font-family:system-ui,sans-serif"><h1>うまく よみこめませんでした</h1><p>' + escapeHtml(message || "データは そのままです。") + '</p><button type="button" data-boot-reload>もういちど よみこむ</button></div>';
    } catch (error) {
      // Last resort only.
    }
  }

  function showRecovery(input, opts) {
    var payload = input && input.errorCode ? input : captureException(input || { message: "startup recovery" }, opts || {});
    unlockStartupLock();
    try {
      var root = recoveryRoot();
      if (!root) return;
      root.className = "boot-recovery-root is-visible";
      root.innerHTML = [
        '<section class="boot-recovery-panel" role="dialog" aria-modal="true" aria-labelledby="boot-recovery-title">',
        '<h1 id="boot-recovery-title">うまく よみこめませんでした</h1>',
        '<p>データは そのままです。<br>あんぜんモードで ひらくこともできます。</p>',
        '<p class="boot-error-code">エラー番号：' + escapeHtml(payload.errorCode || "INIT-UNKNOWN-001") + '</p>',
        '<div class="boot-recovery-actions">',
        buttonHtml("もういちど よみこむ", "data-boot-reload"),
        buttonHtml("あんぜんに ホームをひらく", "data-boot-safe-start"),
        buttonHtml("しょうさいを コピー", "data-boot-copy"),
        '</div>',
        '<p class="boot-copy-status" data-boot-copy-status aria-live="polite"></p>',
        '</section>'
      ].join("");
      finishStartupScreen({ force: true, keepRecovery: true });
    } catch (error) {
      plainRecovery("復旧画面の表示中に問題が起きました。");
    }
  }

  function updateQuery(url, key, value) {
    var hash = "";
    var hashIndex = url.indexOf("#");
    if (hashIndex >= 0) {
      hash = url.slice(hashIndex);
      url = url.slice(0, hashIndex);
    }
    var parts = url.split("?");
    var base = parts[0];
    var query = parts[1] || "";
    var pairs = query ? query.split("&") : [];
    var found = false;
    var next = [];
    for (var i = 0; i < pairs.length; i += 1) {
      if (!pairs[i]) continue;
      var pair = pairs[i].split("=");
      if (decodeURIComponent(pair[0]) === key) {
        next.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        found = true;
      } else {
        next.push(pairs[i]);
      }
    }
    if (!found) next.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    return base + "?" + next.join("&") + hash;
  }

  function safeStartUrl() {
    var href = String(global.location && global.location.href || "");
    href = updateQuery(href, "safeStart", "1");
    href = updateQuery(href, "v", "10p19");
    return href;
  }

  function normalStartUrl() {
    var href = String(global.location && global.location.href || "");
    var hash = "";
    var hashIndex = href.indexOf("#");
    if (hashIndex >= 0) {
      hash = href.slice(hashIndex);
      href = href.slice(0, hashIndex);
    }
    var parts = href.split("?");
    var base = parts[0];
    var pairs = (parts[1] || "").split("&");
    var next = [];
    for (var i = 0; i < pairs.length; i += 1) {
      if (!pairs[i]) continue;
      var key = decodeURIComponent(pairs[i].split("=")[0]);
      if (key === "safeStart") continue;
      if (key === "v") next.push("v=10p19");
      else next.push(pairs[i]);
    }
    if (next.join("&").indexOf("v=10p19") < 0) next.push("v=10p19");
    return base + (next.length ? "?" + next.join("&") : "") + hash;
  }

  function copyDiagnostic() {
    var text = diagnosticText();
    var status = document.querySelector && document.querySelector("[data-boot-copy-status]");
    function done(ok) {
      if (status) status.textContent = ok ? "コピーしました" : "コピーできませんでした";
    }
    if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallbackCopy(text, done); });
        return;
      } catch (error) {
        fallbackCopy(text, done);
        return;
      }
    }
    fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    try {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      var ok = false;
      try { ok = document.execCommand && document.execCommand("copy"); } catch (error) { ok = false; }
      if (textarea.parentNode) textarea.parentNode.removeChild(textarea);
      done(Boolean(ok));
    } catch (error2) {
      done(false);
    }
  }

  function handleBootClick(event) {
    var target = event.target;
    while (target && target !== document) {
      if (target.getAttribute && target.getAttribute("data-boot-reload") !== null) {
        event.preventDefault();
        try { global.location.reload(); } catch (error) { global.location.href = global.location.href; }
        return;
      }
      if (target.getAttribute && target.getAttribute("data-boot-safe-start") !== null) {
        event.preventDefault();
        global.location.href = safeStartUrl();
        return;
      }
      if (target.getAttribute && target.getAttribute("data-boot-copy") !== null) {
        event.preventDefault();
        copyDiagnostic();
        return;
      }
      if (target.getAttribute && target.getAttribute("data-safe-route") !== null) {
        event.preventDefault();
        renderSafePanel(target.getAttribute("data-safe-route"));
        return;
      }
      if (target.getAttribute && target.getAttribute("data-safe-normal-start") !== null) {
        event.preventDefault();
        global.location.href = normalStartUrl();
        return;
      }
      target = target.parentNode;
    }
  }

  function readAppDataWithoutSaving() {
    var raw = null;
    try {
      raw = global.localStorage && global.localStorage.getItem("kodomoAdventure.appData.v1");
    } catch (error) {
      return { ok: false, data: null, error: error };
    }
    if (!raw) return { ok: true, data: null };
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch (error2) {
      return { ok: false, data: null, error: error2 };
    }
  }

  function safeNumber(value) {
    var number = Number(value || 0);
    return isFinite(number) ? number : 0;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeDataSummary() {
    var loaded = readAppDataWithoutSaving();
    var data = loaded.data || {};
    var profile = data.profile || {};
    var totals = profile.starTotals || {};
    return {
      parseOk: loaded.ok,
      stars: safeNumber(totals.spendableStars),
      lifetimeStars: safeNumber(totals.lifetimeStars),
      tasks: safeArray(data.tasks),
      artworks: safeArray(data.artworks),
      coloringTemplates: safeArray(data.coloringTemplates),
      worlds: data.worlds && typeof data.worlds === "object" ? data.worlds : {},
      eggs: safeArray(data.eggInventory),
      companions: safeArray(data.companions)
    };
  }

  function safeNav() {
    return [
      '<nav class="bottom-nav boot-safe-nav" aria-label="あんぜんモードメニュー">',
      '<button class="nav-btn" data-safe-route="home"><span>🏠</span>ホーム</button>',
      '<button class="nav-btn" data-safe-route="tasks"><span>⭐</span>おしごと</button>',
      '<button class="nav-btn" data-safe-route="coloring"><span>🎨</span>ぬりえ</button>',
      '<button class="nav-btn" data-safe-route="worlds"><span>🌍</span>せかい</button>',
      '<button class="nav-btn" data-safe-route="album"><span>🖼️</span>さくひん</button>',
      '</nav>'
    ].join("");
  }

  function safePanelHtml(route, summary) {
    if (route === "tasks") {
      return '<section class="panel panel-pad"><h2>おしごと</h2><p>保存データは消さずに、基本表示だけを開いています。</p><p><span class="badge">おしごと ' + summary.tasks.length + 'こ</span></p></section>';
    }
    if (route === "coloring") {
      return '<section class="panel panel-pad"><h2>ぬりえ</h2><p>通常起動に戻ると、ぬりえを編集できます。</p><p><span class="badge">ぬりえ ' + (summary.coloringTemplates.length || 10) + 'しゅるい</span></p></section>';
    }
    if (route === "worlds") {
      var worldCount = 0;
      try { worldCount = Object.keys(summary.worlds || {}).length; } catch (error) { worldCount = 0; }
      return '<section class="panel panel-pad"><h2>せかい</h2><p>世界の保存データはそのままです。</p><p><span class="badge">せかい ' + (worldCount || 6) + 'こ</span></p></section>';
    }
    if (route === "album") {
      return '<section class="panel panel-pad"><h2>さくひん</h2><p>作品データはそのままです。</p><p><span class="badge">さくひん ' + summary.artworks.length + 'こ</span></p></section>';
    }
    return [
      '<section class="panel panel-pad">',
      '<p class="eyebrow">あんぜんモード</p>',
      '<h1>ホーム</h1>',
      '<p>あんぜんモードで ひらいています。</p>',
      '<div class="home-stats">',
      '<div class="stat"><span class="stat-label">つかえるほし</span><span class="stat-value">⭐ ' + summary.stars + '</span></div>',
      '<div class="stat secondary"><span class="stat-label">あつめたほし</span><span class="stat-value">⭐ ' + summary.lifetimeStars + '</span></div>',
      '</div>',
      '<p class="muted">たまご・なかまずかんは、いまは ひらけません。</p>',
      '<div class="quick-actions"><button class="btn btn-primary" data-safe-normal-start>通常起動へ戻る</button></div>',
      '</section>'
    ].join("");
  }

  function renderSafePanel(route) {
    var app = document.getElementById("app");
    if (!app) return;
    var summary = safeDataSummary();
    app.hidden = false;
    app.removeAttribute("hidden");
    app.removeAttribute("inert");
    app.removeAttribute("aria-hidden");
    try { app.inert = false; } catch (error) { /* noop */ }
    app.innerHTML = '<main class="screen boot-safe-screen">' + safePanelHtml(route || "home", summary) + '</main>' + safeNav();
  }

  function renderSafeStartHome() {
    mark("SAFE_START_STARTED");
    unlockStartupLock();
    renderSafePanel("home");
    mark("FIRST_RENDER_COMPLETED");
    finishStartupScreen({});
  }

  function finishStartupScreen(options) {
    var opts = options || {};
    var splash = document.getElementById("startup-splash");
    if (splashFinished) {
      unlockStartupLock();
      return;
    }
    var elapsed = Date.now() - startupStartedAt;
    var wait = opts.force ? 0 : Math.max(0, minSplashMs - elapsed);
    global.setTimeout(function () {
      if (splashFinished) {
        unlockStartupLock();
        return;
      }
      unlockStartupLock();
      splashFinished = true;
      mark("SPLASH_FINISHED");
      if (splash) {
        try { splash.classList.add("is-hiding"); } catch (error) { /* noop */ }
        splash.setAttribute("aria-hidden", "true");
        global.setTimeout(function () {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, opts.keepRecovery ? 0 : 450);
      }
    }, wait);
  }

  function bootReady() {
    var splash = document.getElementById("startup-splash");
    mark("DOM_READY");
    if (splash) {
      minSplashMs = Number(splash.getAttribute("data-min-ms") || minSplashMs);
      maxSplashMs = Number(splash.getAttribute("data-max-ms") || maxSplashMs);
      splash.addEventListener("click", function () {
        if (Date.now() - startupStartedAt >= minSplashMs) finishStartupScreen({});
      });
    }
    global.setTimeout(function () {
      if (!splashFinished) {
        captureException({ name: "StartupTimeout", message: "startup fail-safe timeout" }, { stage: currentStage, errorCode: stageCode(currentStage) });
        showRecovery(latestDiagnostic() || { errorCode: stageCode(currentStage) }, { stage: currentStage });
      }
    }, maxSplashMs);
  }

  function installListeners() {
    if (listenersReady) return;
    listenersReady = true;
    document.addEventListener("click", handleBootClick, true);
    global.addEventListener("error", function (event) {
      var diagnostic = captureException(event, { stage: currentStage });
      showRecovery(diagnostic);
    });
    global.addEventListener("unhandledrejection", function (event) {
      var diagnostic = captureException(event, {
        stage: currentStage,
        rejectionReason: String(event && event.reason || "")
      });
      showRecovery(diagnostic);
    });
    document.addEventListener("DOMContentLoaded", bootReady);
  }

  global.KodomoAdventureBoot = {
    mark: mark,
    currentStage: function () { return currentStage; },
    captureException: captureException,
    saveDiagnostic: saveDiagnostic,
    latestDiagnostic: latestDiagnostic,
    showRecovery: showRecovery,
    finishStartupScreen: finishStartupScreen,
    unlockStartupLock: unlockStartupLock,
    renderSafeStartHome: renderSafeStartHome,
    renderSafePanel: renderSafePanel,
    isSafeStart: function () { return safeMode; },
    diagnosticKey: DIAGNOSTIC_KEY,
    safeStartUrl: safeStartUrl,
    normalStartUrl: normalStartUrl,
    copyDiagnostic: copyDiagnostic,
    stageCode: stageCode
  };

  installListeners();
})(window, document);
