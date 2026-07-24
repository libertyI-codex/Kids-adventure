/* eslint-env node */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const storage = {};

const context = {
  console,
  setTimeout,
  clearTimeout,
  Blob,
  window: {},
  document: {},
  localStorage: {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem(key, value) {
      storage[key] = String(value);
    },
    removeItem(key) {
      delete storage[key];
    }
  }
};
context.window = context;
vm.createContext(context);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function pngInfo(filePath) {
  const bytes = fs.readFileSync(filePath);
  return {
    isPng: bytes.length >= 24 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0D &&
      bytes[5] === 0x0A &&
      bytes[6] === 0x1A &&
      bytes[7] === 0x0A,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20)
  };
}

function loadJs(file) {
  vm.runInContext(read(path.join("js", file)), context, { filename: file });
}

const jsFiles = fs.readdirSync(path.join(root, "js")).filter((file) => file.endsWith(".js")).sort();
jsFiles.forEach((file) => {
  new vm.Script(read(path.join("js", file)), { filename: file });
});
[
  ["app.js", ["renderHome", "getHomeAdventureSnapshot", "renderHomeHero", "renderHomeAdventure", "renderCompanionStatus", "renderParentJobSettings", "customJobEditor", "bindParentJobSettings"]],
  ["companions.js", ["renderCompanion"]],
  ["tasks.js", ["ensureJobSettings", "dailyTasks", "completeTask", "setJobEnabled", "addCustomJob", "updateCustomJob", "deleteCustomJob"]],
  ["migrations.js", ["ensureDataShape", "createDefaultAppData"]]
].forEach(([file, expectedNames]) => {
  const source = read(path.join("js", file));
  expectedNames.forEach((name) => {
    const count = (source.match(new RegExp("\\bfunction\\s+" + name + "\\s*\\(", "g")) || []).length;
    assert(count === 1, file + " should define " + name + " exactly once");
  });
});

[
  "constants.js",
  "date-utils.js",
  "storage.js",
  "eggs.js",
  "companions.js",
  "kitchen.js",
  "bird-house.js",
  "outings.js",
  "migrations.js",
  "state.js",
  "stars.js",
  "tasks.js",
  "worlds.js",
  "coloring.js"
].forEach(loadJs);

const KA = context.KodomoAdventure;
KA.state.init();

const indexHtml = read("index.html");
const manifestJson = JSON.parse(read("manifest.webmanifest"));
const bootJs = read(path.join("js", "boot.js"));
const appJs = read(path.join("js", "app.js"));
const stylesCss = read(path.join("css", "styles.css"));
const uiPolishPreview = read(path.join("tests", "ui-polish-preview.html"));
const cacheQuery = "10p23";
const scriptOrder = Array.from(indexHtml.matchAll(/<script\s+defer\s+src="js\/([^"?]+)\?v=10p23"><\/script>/g)).map((match) => match[1]);
assert(scriptOrder[0] === "boot.js", "boot.js should load before app scripts");
assert(scriptOrder.indexOf("constants.js") > scriptOrder.indexOf("boot.js"), "constants should load after boot.js");
assert(scriptOrder.indexOf("companions.js") > scriptOrder.indexOf("eggs.js"), "companions.js should load after eggs.js");
assert(scriptOrder.indexOf("kitchen.js") > scriptOrder.indexOf("companions.js"), "kitchen.js should load after companions.js");
assert(scriptOrder.indexOf("bird-house.js") > scriptOrder.indexOf("kitchen.js"), "bird-house.js should load after kitchen.js");
assert(scriptOrder.indexOf("outings.js") > scriptOrder.indexOf("bird-house.js"), "outings.js should load after bird-house.js");
assert(scriptOrder.indexOf("migrations.js") > scriptOrder.indexOf("outings.js"), "migrations.js should load after outings.js");
assert(scriptOrder.indexOf("app.js") > scriptOrder.indexOf("router.js"), "app.js should load last");
assert(indexHtml.indexOf("?v=10p11") < 0, "old v=10p11 query should not remain");
assert(indexHtml.indexOf("?v=10p12\"") < 0 && indexHtml.indexOf("?v=10p12<") < 0, "old v=10p12 query should not remain in index.html");
assert(indexHtml.indexOf("?v=10p12h1") < 0, "old v=10p12h1 query should not remain");
assert(indexHtml.indexOf("?v=10p12h2") < 0, "old v=10p12h2 query should not remain");
assert(indexHtml.indexOf("?v=10p13") < 0, "old v=10p13 query should not remain");
assert(indexHtml.indexOf("?v=10p14") < 0, "old v=10p14 query should not remain");
assert(indexHtml.indexOf("?v=10p15\"") < 0 && indexHtml.indexOf("?v=10p15<") < 0, "old v=10p15 query should not remain");
assert(indexHtml.indexOf("10p15pwa1") < 0 && bootJs.indexOf("10p15pwa1") < 0 && appJs.indexOf("10p15pwa1") < 0 && JSON.stringify(manifestJson).indexOf("10p15pwa1") < 0, "old v=10p15pwa1 query should not remain in production code");
assert(indexHtml.indexOf("10p16") < 0 && bootJs.indexOf("10p16") < 0 && appJs.indexOf("10p16") < 0 && JSON.stringify(manifestJson).indexOf("10p16") < 0, "old v=10p16 query should not remain in production code");
assert(indexHtml.indexOf("10p18") < 0 && bootJs.indexOf("10p18") < 0 && appJs.indexOf("10p18") < 0 && JSON.stringify(manifestJson).indexOf("10p18") < 0, "old v=10p18 query should not remain in production code");
assert(indexHtml.indexOf("10p19") < 0 && bootJs.indexOf("10p19") < 0 && appJs.indexOf("10p19") < 0 && JSON.stringify(manifestJson).indexOf("10p19") < 0, "old v=10p19 query should not remain in production code");
assert(!/10p21(?!h1)/.test(indexHtml + bootJs + JSON.stringify(manifestJson)), "old v=10p21 query should not remain in production code");
assert(indexHtml.indexOf("10p21h1") < 0 && bootJs.indexOf("10p21h1") < 0 && appJs.indexOf("10p21h1") < 0 && JSON.stringify(manifestJson).indexOf("10p21h1") < 0, "old v=10p21h1 query should not remain in production code");
assert(indexHtml.indexOf("10p22") < 0 && bootJs.indexOf("10p22") < 0 && appJs.indexOf("10p22") < 0 && JSON.stringify(manifestJson).indexOf("10p22") < 0, "old v=10p22 query should not remain in production code");
assert(indexHtml.indexOf('name="apple-mobile-web-app-capable" content="yes"') >= 0, "apple mobile web app capable meta missing");
assert(indexHtml.indexOf('name="apple-mobile-web-app-title" content="こどもの冒険"') >= 0, "apple mobile web app title meta missing");
assert(indexHtml.indexOf('rel="manifest" href="./manifest.webmanifest?v=10p23"') >= 0, "manifest link missing");
assert(manifestJson.display === "standalone", "manifest display should be standalone");
assert(manifestJson.start_url === "./", "manifest start_url should match deployed directory");
assert(manifestJson.scope === "./", "manifest scope should match deployed directory");
assert(Array.isArray(manifestJson.icons) && manifestJson.icons.length >= 1, "manifest should include icons");
assert(manifestJson.icons[0].src === "./apple-touch-icon.png?v=10p23", "manifest icon should use apple touch icon");
assert(indexHtml.indexOf("serviceWorker") < 0 && bootJs.indexOf("serviceWorker") < 0 && appJs.indexOf("serviceWorker") < 0, "service worker should not be added for standalone support");
assert(indexHtml.indexOf('src="./apple-touch-icon.png?v=10p23"') >= 0, "startup splash should use apple-touch-icon v=10p23");
assert(indexHtml.indexOf('rel="preload" as="image" href="./apple-touch-icon.png?v=10p23"') >= 0, "startup preload missing");
const appleTouchLinks = Array.from(indexHtml.matchAll(/<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*>/g));
assert(appleTouchLinks.length === 1, "apple-touch-icon should exist exactly once");
assert(appleTouchLinks[0][0].indexOf('href="./apple-touch-icon.png?v=10p23"') >= 0, "apple-touch-icon href should use v=10p23");
assert((indexHtml.match(/data-startup-splash/g) || []).length === 1, "startup splash DOM should exist once");
assert((indexHtml.match(/id="boot-recovery-root"/g) || []).length === 1, "boot recovery root should exist once");
assert(indexHtml.indexOf('data-min-ms="1200"') >= 0, "startup splash should have minimum display time");
assert(indexHtml.indexOf('data-max-ms="4000"') >= 0, "startup splash should have fail-safe max time");
assert(bootJs.indexOf("KA.state") < 0 && bootJs.indexOf("KA.app") < 0 && bootJs.indexOf("KA.eggs") < 0 && bootJs.indexOf("KA.companions") < 0, "boot.js should not depend on app namespaces");
assert(bootJs.indexOf("addEventListener(\"error\"") >= 0, "boot.js should register window error listener");
assert(bootJs.indexOf("addEventListener(\"unhandledrejection\"") >= 0, "boot.js should register unhandledrejection listener");
assert(bootJs.indexOf("kodomoAdventure.bootDiagnostic.v1") >= 0, "boot diagnostic key should be present");
assert(bootJs.indexOf("safeStart=1") >= 0, "boot.js should detect safeStart");
assert(stylesCss.indexOf(".boot-recovery-root") >= 0, "boot recovery root styles should exist");
assert(appJs.indexOf("renderAlbum") >= 0, "renderAlbum should remain present");
assert(appJs.indexOf("data-standalone-diagnostics") >= 0, "parent mode should include standalone diagnostics");
assert(appJs.indexOf("navigator.standalone") >= 0, "standalone diagnostics should check navigator.standalone");
assert(appJs.indexOf("display-mode: standalone") >= 0, "standalone diagnostics should check display-mode");
assert(appJs.indexOf("scope判定") >= 0, "standalone diagnostics should show scope status");
assert(appJs.indexOf("data-coloring-settings-panel") >= 0, "parent coloring settings panel should exist");
assert(appJs.indexOf("data-coloring-drag-handle") >= 0, "drag handle should exist for coloring order");
assert(appJs.indexOf("data-coloring-move-up") >= 0 && appJs.indexOf("data-coloring-move-down") >= 0, "up/down ordering buttons should exist");
assert(appJs.indexOf("data-save-coloring-settings") >= 0, "save coloring settings button should exist");
assert(appJs.indexOf("data-reset-coloring-settings") >= 0, "reset coloring settings button should exist");
assert(stylesCss.indexOf(".parent-coloring-row") >= 0, "parent coloring settings styles should exist");
assert(stylesCss.indexOf("@media (max-width: 420px)") >= 0 && stylesCss.indexOf(".parent-coloring-actions") >= 0, "mobile coloring settings styles should exist");

function makeClassList() {
  const values = new Set();
  return {
    add(name) { values.add(name); },
    remove(name) { values.delete(name); },
    contains(name) { return values.has(name); },
    toggle(name, force) {
      if (force === true || (typeof force === "undefined" && !values.has(name))) {
        values.add(name);
        return true;
      }
      values.delete(name);
      return false;
    }
  };
}

function makeElement(id) {
  const attrs = {};
  const el = {
    id,
    innerHTML: "",
    hidden: id === "app",
    inert: id === "app",
    style: { display: "none", visibility: "hidden", opacity: "0", pointerEvents: "none", transform: "scale(.99)", overflow: "hidden", position: "fixed" },
    classList: makeClassList(),
    parentNode: {
      removeChild(child) {
        child.removed = true;
        child.parentNode = null;
      }
    },
    children: [],
    appendChild(child) {
      child.parentNode = el;
      el.children.push(child);
      return child;
    },
    removeChild(child) {
      child.removed = true;
      el.children = el.children.filter((item) => item !== child);
      child.parentNode = null;
      return child;
    },
    setAttribute(key, value) { attrs[key] = String(value); },
    getAttribute(key) {
      if (id === "startup-splash" && key === "data-min-ms") return "1200";
      if (id === "startup-splash" && key === "data-max-ms") return "4000";
      return Object.prototype.hasOwnProperty.call(attrs, key) ? attrs[key] : null;
    },
    removeAttribute(key) { delete attrs[key]; },
    hasAttribute(key) { return Object.prototype.hasOwnProperty.call(attrs, key); },
    addEventListener() {},
    select() { el.selected = true; },
    remove() {
      if (el.parentNode && el.parentNode.children) {
        el.parentNode.children = el.parentNode.children.filter((child) => child !== el);
      }
      el.parentNode = null;
    },
    querySelector() { return makeElement("query-result"); },
    querySelectorAll() { return []; }
  };
  if (id === "app") attrs["aria-hidden"] = "true";
  if (id === "app") attrs.inert = "";
  return el;
}

function makeDocument() {
  const elements = {
    app: makeElement("app"),
    "startup-splash": makeElement("startup-splash"),
    "boot-recovery-root": makeElement("boot-recovery-root"),
    "modal-root": makeElement("modal-root"),
    "toast-root": makeElement("toast-root")
  };
  const listeners = {};
  const body = makeElement("body");
  const html = makeElement("html");
  Object.keys(elements).forEach((key) => {
    elements[key].parentNode = body;
    body.children.push(elements[key]);
  });
  return {
    elements,
    body,
    documentElement: html,
    getElementById(id) {
      return elements[id] || null;
    },
    addEventListener(name, handler) {
      listeners[name] = listeners[name] || [];
      listeners[name].push(handler);
    },
    querySelector(selector) {
      if (selector === "main") return elements.app;
      if (selector === "[data-boot-copy-status]") return elements["boot-copy-status"] || makeElement("boot-copy-status");
      return null;
    },
    createElement(tagName) {
      const element = makeElement(tagName);
      element.tagName = tagName.toUpperCase();
      element.click = function () {};
      element.remove = function () {};
      return element;
    },
    execCommand(command) {
      if (command === "copy") return true;
      return false;
    },
    dispatch(name, event) {
      (listeners[name] || []).forEach((handler) => handler(event));
    },
    listeners
  };
}

function runStartupCase(name, storedAppData, storedUiState, options) {
  const opts = options || {};
  const caseStorage = {};
  if (storedAppData) caseStorage["kodomoAdventure.appData.v1"] = JSON.stringify(storedAppData);
  if (storedUiState) caseStorage["kodomoAdventure.uiState.v1"] = JSON.stringify(storedUiState);
  const timers = [];
  const doc = makeDocument();
  const windowListeners = {};
  const caseContext = {
    console: { log() {}, error() {} },
    Blob,
    URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
    FileReader: function () {},
    AudioContext: function () {},
    webkitAudioContext: function () {},
    navigator: { userAgent: "SmokeTest Safari", clipboard: null },
    location: {
      href: opts.safeStart ? "file:///kodomo/index.html?safeStart=1&v=10p23" : "file:///kodomo/index.html?v=10p23",
      search: opts.safeStart ? "?safeStart=1&v=10p23" : "?v=10p23",
      reload() { caseContext.__reloaded = true; }
    },
    addEventListener(name, handler) {
      windowListeners[name] = windowListeners[name] || [];
      windowListeners[name].push(handler);
    },
    dispatchWindowEvent(name, event) {
      (windowListeners[name] || []).forEach((handler) => handler(event));
    },
    setTimeout(fn, delay) {
      timers.push({ fn, delay: Number(delay || 0) });
      return timers.length;
    },
    clearTimeout() {},
    localStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(caseStorage, key) ? caseStorage[key] : null; },
      setItem(key, value) { caseStorage[key] = String(value); },
      removeItem(key) { delete caseStorage[key]; }
    },
    document: doc,
    window: {}
  };
  caseContext.window = caseContext;
  vm.createContext(caseContext);
  scriptOrder.forEach((file) => {
    vm.runInContext(read(path.join("js", file)), caseContext, { filename: file });
  });
  assert(caseContext.KodomoAdventure.companions, name + ": companion definitions should exist before startup");
  assert(caseContext.KodomoAdventure.eggs, name + ": egg functions should exist before startup");
  if (opts.failStateInit) {
    caseContext.KodomoAdventure.state.init = function () { throw new Error("forced state init failure"); };
  }
  if (opts.failMigration) {
    caseContext.KodomoAdventure.migrations.migrate = function () { throw new Error("forced migration failure"); };
  }
  if (opts.failRender) {
    caseContext.KodomoAdventure.router.navigate = function () { throw new Error("forced render failure"); };
  }
  assert(Array.isArray(doc.listeners.DOMContentLoaded) && doc.listeners.DOMContentLoaded.length >= 2, name + ": DOMContentLoaded should be registered by boot and app");
  doc.listeners.DOMContentLoaded.forEach((handler) => handler());
  timers.sort((a, b) => a.delay - b.delay);
  while (timers.length) {
    const next = timers.shift();
    next.fn();
    timers.sort((a, b) => a.delay - b.delay);
  }
  const app = doc.getElementById("app");
  const splash = doc.getElementById("startup-splash");
  const recoveryRoot = doc.getElementById("boot-recovery-root");
  assert(caseContext.KodomoAdventureBoot, name + ": boot namespace should exist");
  assert(caseContext.KodomoAdventure.app.startupState.appInitialized, name + ": appInitialized should complete");
  assert(caseContext.KodomoAdventure.app.startupState.splashFinished, name + ": splash should finish");
  const hasAppContent = app.innerHTML.replace(/\s/g, "").length > 0;
  const hasRecoveryContent = recoveryRoot.innerHTML.replace(/\s/g, "").length > 0;
  assert(hasAppContent || hasRecoveryContent, name + ": screen should not be blank diagnostics=" + (caseStorage["kodomoAdventure.bootDiagnostic.v1"] || "none"));
  if (!opts.expectRecovery) {
    assert(hasAppContent, name + ": app should render during normal startup");
  }
  assert(app.hidden === false, name + ": app hidden should be cleared");
  assert(app.inert === false, name + ": app inert property should be cleared");
  assert(!app.hasAttribute("inert"), name + ": app inert attribute should be removed");
  assert(!app.hasAttribute("aria-hidden"), name + ": app aria-hidden should be removed");
  assert(!doc.body.classList.contains("startup-active"), name + ": body startup class should be removed");
  assert(doc.body.style.overflow === "", name + ": body scroll lock should be cleared");
  assert(splash.removed || splash.classList.contains("is-hiding"), name + ": splash should be hidden or removed");
  assert(recoveryRoot.parentNode === doc.body, name + ": boot recovery root should be outside app and directly under body");
  assert(recoveryRoot.inert !== true && !recoveryRoot.hasAttribute("inert"), name + ": recovery root should not be inert");
  if (opts.expectRecovery) {
    assert(recoveryRoot.innerHTML.indexOf("うまく よみこめませんでした") >= 0, name + ": boot recovery screen should render");
    assert(recoveryRoot.innerHTML.indexOf("エラー番号：") >= 0, name + ": recovery screen should show error code");
    assert(recoveryRoot.style.pointerEvents === "auto", name + ": visible recovery root should allow pointer events");
  }
  if (opts.safeStart) {
    assert(app.innerHTML.indexOf("あんぜんモード") >= 0, name + ": safeStart should render safe home");
    assert(caseStorage["kodomoAdventure.appData.v1"] === (storedAppData ? JSON.stringify(storedAppData) : undefined), name + ": safeStart should not overwrite appData");
  }
  caseContext.KodomoAdventure.app.finishStartupScreen({ force: true });
  caseContext.KodomoAdventure.app.finishStartupScreen({ force: true });
  assert(app.hidden === false && !app.hasAttribute("inert"), name + ": repeated finish should be safe");
  return { context: caseContext, document: doc, storage: caseStorage };
}

function clickBoot(doc, attr) {
  const target = {
    parentNode: doc,
    getAttribute(name) {
      return name === attr ? "" : null;
    }
  };
  let prevented = false;
  doc.dispatch("click", { target, preventDefault() { prevented = true; } });
  return prevented;
}

const adoptedIconPath = path.join(root, "assets", "icons", "yuu-bouken-icon-adopted.png");
const appleIconPath = path.join(root, "apple-touch-icon.png");
assert(fs.existsSync(appleIconPath), "apple-touch-icon.png should exist");
const appleIconInfo = pngInfo(appleIconPath);
assert(appleIconInfo.isPng, "apple-touch-icon.png should be PNG");
assert(appleIconInfo.width === appleIconInfo.height, "apple-touch-icon.png should be square");
assert(appleIconInfo.width >= 180, "apple-touch-icon.png should be at least 180px");
assert(manifestJson.icons[0].sizes === appleIconInfo.width + "x" + appleIconInfo.height, "manifest icon size should match apple-touch-icon.png");
if (fs.existsSync(adoptedIconPath)) {
  assert(sha256File(adoptedIconPath) === sha256File(appleIconPath), "adopted icon and apple-touch-icon should match exactly");
}

const appData = KA.state.getAppData();
assert(appData.schemaVersion === 1, "schemaVersion should stay 1");
assert(appData.appVersion === "1.0.0-prototype.23", "appVersion should be prototype 23");
assert(KA.constants.VERSION_LABEL === "Ver.1.0 試作23", "version label mismatch");
assert(KA.constants.STORAGE_KEYS.appData === "kodomoAdventure.appData.v1", "app data key changed");
assert(KA.constants.STORAGE_KEYS.uiState === "kodomoAdventure.uiState.v1", "ui state key changed");
assert(KA.constants.STORAGE_KEYS.backup === "kodomoAdventure.backup.v1", "backup key changed");
assert(KA.constants.SCHEMA_VERSION === 1, "constant schemaVersion should stay 1");
assert(KA.constants.COLORING_TEMPLATES.length === 10, "coloring templates should remain 10");
assert(KA.constants.WORLD_DEFINITIONS.length === 6, "worlds should remain 6");
assert(appData.worlds.world_secret_base && appData.worlds.world_secret_base.designVersion === 1, "secret base should remain available");
assert(KA.constants.DEFAULT_TASKS.length === 7, "formal jobs should include the six existing jobs and cleanup");
const formalJobIds = KA.constants.DEFAULT_TASKS.map((task) => task.taskId);
assert(new Set(formalJobIds).size === formalJobIds.length, "formal job IDs should be unique");
const cleanupJob = KA.constants.DEFAULT_TASKS.filter((task) => task.taskId === "job_cleanup")[0];
assert(cleanupJob && cleanupJob.title === "おかたづけ", "job_cleanup should be a formal job");
assert(cleanupJob.active === true && cleanupJob.rewardStars === 1, "job_cleanup should be initially enabled with the standard reward");
assert(cleanupJob.description && cleanupJob.iconKey === "toybox", "job_cleanup should include description and a hand-drawn icon key");
assert(KA.tasks.renderTaskIcon(cleanupJob).indexOf("<svg") >= 0, "job_cleanup should render inline SVG");

const homeSource = appJs.slice(appJs.indexOf("function renderHome"), appJs.indexOf("function renderTasks"));
assert(homeSource.indexOf("home-star-strip") >= 0 && stylesCss.indexOf(".home-star-strip") >= 0, "home stars should use compact layout");
assert(appJs.indexOf("home-hero") >= 0 && stylesCss.indexOf(".home-hero") >= 0, "home should include the prototype 23 hero");
assert(appJs.indexOf("きょうの ぼうけん") >= 0 && appJs.indexOf("home-adventure-grid") >= 0, "home should show today's adventure progress");
["おしごと", "おせわ", "ごはん", "おでかけ", "おみやげ"].forEach((label) => {
  assert(appJs.indexOf('{ label: "' + label + '"') >= 0, "home adventure should include " + label);
});
assert(stylesCss.indexOf("--color-bg") >= 0 && stylesCss.indexOf("--shadow-card") >= 0 && stylesCss.indexOf("--space-md") >= 0, "shared UI design tokens should exist");
assert(/\.btn-small\s*\{[^}]*min-height:\s*48px/s.test(stylesCss), "small buttons should keep a 48px tap target");
assert(/\.btn\s*\{[^}]*min-height:\s*52px/s.test(stylesCss), "primary button base should exceed 48px");
assert(stylesCss.indexOf(".bird-house-room.is-decorating") >= 0, "bird-house decorating mode should be visually distinct");
assert(stylesCss.indexOf("@media (prefers-reduced-motion: reduce)") >= 0, "reduced-motion support should remain");
assert(uiPolishPreview.indexOf("きょうの ぼうけん") >= 0 && uiPolishPreview.indexOf("data-route=") < 0, "UI polish preview should include today's adventure without linking to production navigation");
assert(uiPolishPreview.indexOf("localStorage.") < 0, "UI polish preview should not access production localStorage");
assert(uiPolishPreview.indexOf("../css/styles.css?v=10p23") >= 0, "UI polish preview should use prototype 23 styles");
assert(homeSource.indexOf("なかまのようす") < 0 && appJs.indexOf("function renderCompanionStatus") >= 0, "companion status should be rendered through the inline status function");
assert(appJs.indexOf("なかまのようす") >= 0, "companion status heading should exist");
assert(appJs.indexOf("きょうのようす") < 0, "old user-facing today status label should be removed");
assert(homeSource.indexOf('button("⭐ おしごと"') < 0, "duplicate home task entry should be removed");
assert(homeSource.indexOf('button("🎨 ぬりえ"') < 0, "duplicate home coloring entry should be removed");
assert(homeSource.indexOf('button("🌍 せかい"') < 0, "duplicate home world entry should be removed");
assert(homeSource.indexOf('button("🖼️ さくひん"') < 0, "duplicate home album entry should be removed");
assert(appJs.indexOf('iconButton("⭐", "おしごと", "tasks")') >= 0, "bottom task navigation should remain");
assert(appJs.indexOf('iconButton("🎨", "ぬりえ", "coloring-list")') >= 0, "bottom coloring navigation should remain");
assert(appJs.indexOf('iconButton("🌍", "せかい", "forest")') >= 0, "bottom world navigation should remain");
assert(appJs.indexOf('iconButton("🖼️", "さくひん", "album")') >= 0, "bottom album navigation should remain");
assert(appJs.indexOf("function renderParentJobSettings") >= 0 && appJs.indexOf("data-add-custom-job") >= 0, "parent job settings UI should exist");
assert(fs.existsSync(path.join(root, "tests", "home-jobs-preview.html")), "home/jobs preview should exist");
assert(fs.existsSync(path.join(root, "tests", "outing-preview.html")), "outing preview should exist");
const outingPreview = read(path.join("tests", "outing-preview.html"));
assert(outingPreview.indexOf("本番localStorageを使わない") >= 0, "outing preview should not use production storage");
assert(outingPreview.indexOf("準備 0/3") >= 0 && outingPreview.indexOf("翌日帰宅") >= 0 && outingPreview.indexOf("受取連打テスト") >= 0, "outing preview should include preparation, return, and duplicate-claim states");

assert(appData.jobSettings && appData.jobSettings.dailyDisplayCount === 7, "default daily job display count should be seven");
assert(appData.jobSettings.enabledJobIds.indexOf("job_cleanup") >= 0, "cleanup should be initially enabled");
assert(new Set(appData.jobSettings.enabledJobIds).size === appData.jobSettings.enabledJobIds.length, "enabled job IDs should be unique");
assert(new Set(appData.jobSettings.displayOrder).size === appData.jobSettings.displayOrder.length, "job order IDs should be unique");

const malformedJobsData = KA.migrations.createDefaultAppData();
malformedJobsData.jobSettings = {
  dailyDisplayCount: "100",
  enabledJobIds: "bad",
  displayOrder: null,
  customJobs: {
    bad: true
  },
  dailySelectionsByDate: []
};
KA.migrations.ensureDataShape(malformedJobsData);
assert(malformedJobsData.jobSettings.dailyDisplayCount === 10, "invalid high display count should clamp to ten");
assert(malformedJobsData.jobSettings.enabledJobIds.length >= 1, "malformed settings should keep at least one enabled job");
assert(malformedJobsData.jobSettings.displayOrder.length === 7, "malformed order should restore all formal jobs");
const malformedJobsOnce = JSON.stringify(malformedJobsData.jobSettings);
KA.migrations.ensureDataShape(malformedJobsData);
assert(JSON.stringify(malformedJobsData.jobSettings) === malformedJobsOnce, "jobSettings normalization should be idempotent");

const mixedJobsData = KA.migrations.createDefaultAppData();
mixedJobsData.jobSettings = {
  dailyDisplayCount: "3",
  enabledJobIds: ["job_cleanup", "job_cleanup", "missing_job"],
  displayOrder: ["missing_job", "job_cleanup", "job_cleanup"],
  customJobs: [
    { id: "custom_job_valid", name: "ほんを もどす", iconKey: "book", enabled: true },
    { id: "custom_job_valid", name: "重複", iconKey: "star", enabled: true },
    { id: "task_brush_teeth", name: "衝突", iconKey: "star", enabled: true },
    { id: "custom_job_empty", name: "", iconKey: "missing", enabled: true }
  ],
  dailySelectionsByDate: {
    "2026-07-18": ["missing_job", "job_cleanup", "job_cleanup"]
  }
};
KA.migrations.ensureDataShape(mixedJobsData);
assert(mixedJobsData.jobSettings.dailyDisplayCount === 3, "numeric string display count should normalize to integer");
assert(mixedJobsData.jobSettings.customJobs.length === 1, "invalid and duplicate custom jobs should be removed");
assert(mixedJobsData.jobSettings.displayOrder.indexOf("custom_job_valid") >= 0, "valid custom job should be appended to order");
const datedJobsData = KA.migrations.createDefaultAppData();
datedJobsData.jobSettings.dailySelectionsByDate = {};
for (let dayIndex = 1; dayIndex <= 70; dayIndex += 1) {
  datedJobsData.jobSettings.dailySelectionsByDate["2026-08-" + (dayIndex < 10 ? "0" : "") + String(dayIndex)] = ["job_cleanup", "job_cleanup", "missing_job"];
}
KA.migrations.ensureDataShape(datedJobsData);
assert(Object.keys(datedJobsData.jobSettings.dailySelectionsByDate).length <= 60, "daily selections should keep at most sixty dates");
Object.keys(datedJobsData.jobSettings.dailySelectionsByDate).forEach((dateKey) => {
  assert(new Set(datedJobsData.jobSettings.dailySelectionsByDate[dateKey]).size === datedJobsData.jobSettings.dailySelectionsByDate[dateKey].length, "daily selection IDs should be unique");
});

const settingStarsBefore = appData.profile.starTotals.spendableStars;
KA.tasks.resetJobSettings(true);
KA.tasks.setDailyDisplayCount(3);
const fixedSelection = KA.tasks.dailyTasks("2026-07-18").map((task) => task.taskId);
assert(fixedSelection.length === 3 && new Set(fixedSelection).size === 3, "daily selection should contain three unique jobs");
assert(JSON.stringify(KA.tasks.dailyTasks("2026-07-18").map((task) => task.taskId)) === JSON.stringify(fixedSelection), "same date should keep the same selection");
const disabledSelectedId = fixedSelection[0];
assert(KA.tasks.setJobEnabled(disabledSelectedId, false).ok, "a selected job should be disableable");
const refilledSelection = KA.tasks.dailyTasks("2026-07-18").map((task) => task.taskId);
assert(refilledSelection.indexOf(disabledSelectedId) < 0 && refilledSelection.length === 3, "disabled daily job should be removed and its slot refilled");
const customAdd = KA.tasks.addCustomJob({ name: "かばんを しまう", description: "かばんを いつもの ばしょへ", iconKey: "bag", enabled: true });
assert(customAdd.ok && /^custom_job_/.test(customAdd.job.id), "custom job should receive a unique ID");
const customId = customAdd.job.id;
assert(KA.tasks.updateCustomJob(customId, { name: "かばんを もどす", description: "おきばへ もどそう", iconKey: "bag", enabled: true }).ok, "custom job should be editable without changing ID");
assert(KA.tasks.allTasks().some((task) => task.taskId === customId && task.title === "かばんを もどす"), "custom edit should preserve ID and update text");
assert(KA.tasks.moveJob(customId, "up"), "custom job should move up");
assert(KA.tasks.deleteCustomJob(customId).ok, "custom job should be deleteable");
assert(!KA.tasks.allTasks().some((task) => task.taskId === customId), "deleted custom job should leave current list");
assert(KA.tasks.deleteCustomJob("job_cleanup").reason === "standard_or_missing", "formal jobs should not be deleteable");
const enabledBeforeMinimumTest = KA.tasks.enabledTasks().map((task) => task.taskId);
enabledBeforeMinimumTest.slice(0, -1).forEach((id) => { assert(KA.tasks.setJobEnabled(id, false).ok, "enabled jobs should be disableable until one remains"); });
assert(KA.tasks.setJobEnabled(enabledBeforeMinimumTest[enabledBeforeMinimumTest.length - 1], false).reason === "minimum_one", "last enabled job should not be disabled");
assert(appData.profile.starTotals.spendableStars === settingStarsBefore, "job setting changes should not change stars");
KA.tasks.resetJobSettings(true);
assert(KA.tasks.activeTasks().length === 7, "standard reset should restore all seven formal daily jobs");
const currentRecord = KA.state.getDailyRecord();
const eggActivityBeforeJobSetting = JSON.stringify(appData.eggSystem.dailyActivity || {});
currentRecord.completedTasks.push({ taskId: "job_cleanup", taskTitle: "おかたづけ", rewardStars: 1, status: "completed" });
assert(KA.tasks.setJobEnabled("job_cleanup", false).ok, "cleanup should be disableable from parent settings");
assert(currentRecord.completedTasks.some((item) => item.taskId === "job_cleanup" && item.status === "completed"), "disabling a job should preserve completed history");
assert(JSON.stringify(appData.eggSystem.dailyActivity || {}) === eggActivityBeforeJobSetting, "job settings should not rewind egg activity");
currentRecord.completedTasks = currentRecord.completedTasks.filter((item) => !(item.taskId === "job_cleanup" && item.taskTitle === "おかたづけ"));
KA.tasks.resetJobSettings(true);
const settingsBeforeEnsure = JSON.stringify(appData.jobSettings);
KA.migrations.ensureDataShape(appData);
assert(JSON.stringify(appData.jobSettings) === settingsBeforeEnsure, "ensureDataShape should not reset valid job settings");
assert(appData.coloringSettings && Array.isArray(appData.coloringSettings.order), "coloringSettings order should be present");
assert(appData.coloringSettings.order.length === 10, "coloringSettings order should contain 10 templateIds");
assert(appData.coloringSettings.starCosts.coloring_butterfly_001 === 4, "default butterfly star cost should be 4");
assert(KA.coloring.getEffectiveColoringStarCost("coloring_butterfly_001") === 4, "standard star cost should be effective by default");
assert(KA.coloring.getOrderedColoringTemplates()[0].templateId === "coloring_butterfly_001", "standard coloring order should be used by default");

const malformedColoringSettingsData = KA.migrations.createDefaultAppData();
malformedColoringSettingsData.coloringSettings = {
  order: ["missing_template", "coloring_panda", "coloring_panda", "coloring_butterfly_001"],
  starCosts: {
    coloring_panda: "０",
    coloring_butterfly_001: -3,
    coloring_flower_001: "999",
    coloring_rabbit_001: "1000",
    coloring_cat_001: "12.5"
  }
};
const malformedEnsured = KA.migrations.ensureDataShape(malformedColoringSettingsData).data.coloringSettings;
assert(malformedEnsured.order[0] === "coloring_panda", "valid custom order should be preserved first");
assert(malformedEnsured.order.indexOf("missing_template") < 0, "invalid templateId should be removed from order");
assert(malformedEnsured.order.filter((id) => id === "coloring_panda").length === 1, "duplicate templateId should be removed");
assert(malformedEnsured.order.length === 10, "missing templateIds should be appended");
assert(malformedEnsured.starCosts.coloring_panda === 0, "full-width zero should normalize to 0");
assert(malformedEnsured.starCosts.coloring_flower_001 === 999, "999 star cost should be valid");
assert(malformedEnsured.starCosts.coloring_butterfly_001 === 4, "negative cost should fall back to standard");
assert(malformedEnsured.starCosts.coloring_rabbit_001 === 12, "over 999 should fall back to standard");
assert(malformedEnsured.starCosts.coloring_cat_001 === 16, "decimal cost should fall back to standard");
const preservedSettingsData = KA.migrations.createDefaultAppData();
preservedSettingsData.coloringSettings = {
  order: ["coloring_grasshopper", "coloring_lion", "coloring_butterfly_001"],
  starCosts: { coloring_grasshopper: 0, coloring_lion: 999, coloring_butterfly_001: 7 }
};
const preservedOnce = KA.migrations.ensureDataShape(preservedSettingsData).data;
const preservedJson = JSON.stringify(preservedOnce.coloringSettings);
const preservedTwice = KA.migrations.ensureDataShape(preservedOnce).data;
assert(JSON.stringify(preservedTwice.coloringSettings) === preservedJson, "ensureDataShape should be idempotent for coloringSettings");
assert(preservedTwice.coloringSettings.order[0] === "coloring_grasshopper", "user coloring order should not reset");
assert(preservedTwice.coloringSettings.starCosts.coloring_lion === 999, "user star cost should not reset");

const beforeSettingStars = appData.profile.starTotals.spendableStars;
KA.coloring.saveColoringSettings({
  order: ["coloring_panda", "coloring_butterfly_001", "coloring_flower_001", "coloring_rabbit_001", "coloring_cat_001", "coloring_dolphin_001", "coloring_dinosaur_001", "coloring_horse_001", "coloring_lion", "coloring_grasshopper"],
  starCosts: {
    coloring_panda: 0,
    coloring_flower_001: 0,
    coloring_rabbit_001: 7
  }
});
assert(appData.profile.starTotals.spendableStars === beforeSettingStars, "changing coloring settings should not change spendable stars");
assert(KA.coloring.getOrderedColoringTemplates()[0].templateId === "coloring_panda", "saved coloring order should be effective");
assert(KA.coloring.getEffectiveColoringStarCost("coloring_panda") === 0, "0 star override should be effective");
appData.profile.starTotals.spendableStars = 10;
const spendBeforeFreeUnlock = appData.profile.starTotals.spendableStars;
const freeUnlock = KA.coloring.unlock("coloring_flower_001");
assert(freeUnlock.ok, "0-star coloring should unlock");
assert(appData.profile.starTotals.spendableStars === spendBeforeFreeUnlock, "0-star unlock should not spend stars");
const paidUnlock = KA.coloring.unlock("coloring_rabbit_001");
assert(paidUnlock.ok, "custom-cost coloring should unlock");
assert(appData.profile.starTotals.spendableStars === 3, "custom unlock cost should spend 7 stars");
assert(paidUnlock.entry.paidStars === 7, "ledger should store paid star cost");
const starsBeforePriceChange = appData.profile.starTotals.spendableStars;
KA.coloring.saveColoringSettings({
  order: KA.coloring.getCurrentColoringSettings().order,
  starCosts: { coloring_rabbit_001: 999, coloring_flower_001: 2 }
});
assert(KA.coloring.isUnlocked("coloring_rabbit_001"), "already unlocked coloring should remain unlocked after price increase");
assert(appData.profile.starTotals.spendableStars === starsBeforePriceChange, "price change should not charge or refund stars");
KA.coloring.resetColoringSettings();

const ingredients = KA.kitchen.allIngredients();
const ingredientIds = ingredients.map((item) => item.id);
const ingredientNames = ingredients.map((item) => item.name);
assert(ingredients.length === 17, "formal ingredients should be 17");
assert(new Set(ingredientIds).size === 17, "ingredient IDs should be unique");
assert(new Set(ingredients.map((item) => item.displayOrder)).size === 17, "ingredient displayOrder should be unique");
[
  "しょくパン",
  "バンズ",
  "スパゲティのめん",
  "ラーメンのめん",
  "ひきにく",
  "やきにくのおにく",
  "ねぎ",
  "クリーム",
  "さとう",
  "のり",
  "しゅうまいのかわ"
].forEach((name) => {
  assert(ingredientNames.indexOf(name) === -1, name + " should not be a formal ingredient");
});
assert(ingredientIds.filter((id) => id === "ingredient_bread").length === 1, "bread should be one unified ingredient");
assert(ingredientIds.filter((id) => id === "ingredient_noodles").length === 1, "noodles should be one unified ingredient");
assert(ingredientIds.filter((id) => id === "ingredient_meat").length === 1, "meat should be one unified ingredient");
assert(ingredientIds.indexOf("ingredient_flour") >= 0, "flour should exist for shumai wrapper");
assert(ingredientIds.indexOf("ingredient_cream") < 0 && ingredientIds.indexOf("ingredient_sugar") < 0 && ingredientIds.indexOf("ingredient_nori") < 0, "deprecated ingredient IDs should not exist");

const expectedRecipes = {
  recipe_fruit_salad: ["ingredient_apple", "ingredient_strawberry", "ingredient_banana", "ingredient_grape"],
  recipe_sandwich: ["ingredient_bread", "ingredient_ham", "ingredient_lettuce", "ingredient_tomato", "ingredient_cheese"],
  recipe_hamburg_steak: ["ingredient_meat", "ingredient_onion", "ingredient_egg"],
  recipe_spaghetti: ["ingredient_noodles", "ingredient_tomato", "ingredient_onion", "ingredient_meat"],
  recipe_ramen: ["ingredient_noodles", "ingredient_egg"],
  recipe_yakiniku: ["ingredient_meat", "ingredient_onion", "ingredient_lettuce"],
  recipe_shumai: ["ingredient_flour", "ingredient_meat", "ingredient_onion"],
  recipe_hamburger: ["ingredient_bread", "ingredient_meat", "ingredient_lettuce", "ingredient_tomato", "ingredient_cheese"],
  recipe_cake: ["ingredient_flour", "ingredient_egg", "ingredient_milk", "ingredient_strawberry"],
  recipe_parfait: ["ingredient_ice_cream", "ingredient_cornflakes", "ingredient_strawberry", "ingredient_banana"]
};
const recipes = KA.kitchen.allRecipes();
assert(recipes.length === 10, "formal recipes should be 10");
assert(new Set(recipes.map((item) => item.id)).size === 10, "recipe IDs should be unique");
recipes.forEach((recipe) => {
  assert(JSON.stringify(recipe.ingredientIds) === JSON.stringify(expectedRecipes[recipe.id]), recipe.id + " ingredients mismatch");
  recipe.ingredientIds.forEach((id) => assert(ingredientIds.indexOf(id) >= 0, recipe.id + " uses unknown ingredient " + id));
  recipe.steps.forEach((step) => assert(KA.kitchen.stepTypes.indexOf(step.type) >= 0, recipe.id + " has unsupported step type " + step.type));
  assert(KA.kitchen.renderRecipeDish(recipe.id).indexOf("<svg") >= 0, recipe.id + " should render dish SVG");
});
assert(expectedRecipes.recipe_shumai.indexOf("ingredient_flour") >= 0, "shumai should use flour");
assert(expectedRecipes.recipe_ramen.indexOf("ingredient_nori") < 0, "ramen should not use nori");
assert(expectedRecipes.recipe_cake.indexOf("ingredient_cream") < 0 && expectedRecipes.recipe_cake.indexOf("ingredient_sugar") < 0, "cake should not use cream or sugar");
assert(expectedRecipes.recipe_parfait.indexOf("ingredient_cream") < 0, "parfait should not use cream");

const malformedKitchenData = KA.migrations.createDefaultAppData();
malformedKitchenData.kitchen = {
  currentCooking: { recipeId: "recipe_cake", selectedIngredientIds: ["ingredient_flour"], currentStepIndex: 99 },
  recipeStats: [{ bad: true }],
  cookingHistory: null
};
malformedKitchenData.companions = [{
  id: "companion_owl",
  speciesId: "companion_owl",
  firstHatchedAt: "2026-07-01T09:00:00+09:00",
  lastHatchedAt: "2026-07-01T09:00:00+09:00",
  hatchCount: 1,
  bondLevel: 2
}];
KA.migrations.ensureDataShape(malformedKitchenData);
assert(malformedKitchenData.kitchen.currentCooking.currentStepIndex === KA.kitchen.getRecipe("recipe_cake").steps.length, "current cooking step should clamp to recipe length");
assert(Array.isArray(malformedKitchenData.kitchen.cookingHistory), "cookingHistory should normalize to array");
assert(malformedKitchenData.companions[0].mealCount === 0, "companion mealCount should be added");
assert(malformedKitchenData.companions[0].bondMealProgress === 0, "companion bondMealProgress should be added");

appData.companions = [{
  id: "companion_owl",
  speciesId: "companion_owl",
  firstHatchedAt: "2026-07-01T09:00:00+09:00",
  lastHatchedAt: "2026-07-01T09:00:00+09:00",
  hatchCount: 1,
  bondLevel: 1,
  isFavorite: true,
  mealCount: 0,
  bondMealProgress: 2,
  lastBondMealDate: "2026-01-01",
  lastFedAt: null
}];
appData.kitchen = KA.kitchen.defaultKitchen();
KA.companions.ensureCompanions(appData);
const missingStart = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles"]);
assert(!missingStart.ok, "cooking should not start until required ingredients are selected");
const startCooking = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg", "ingredient_invalid"], "companion_owl");
assert(startCooking.ok, "cooking should start with required ingredients");
assert(appData.kitchen.currentCooking.currentStepIndex === 0, "currentStepIndex should start at 0");
const ramenSteps = KA.kitchen.getRecipe("recipe_ramen").steps.length;
for (let i = 0; i < ramenSteps; i += 1) {
  const stepResult = KA.kitchen.completeCurrentStep();
  assert(stepResult.ok, "kitchen step should complete");
}
assert(KA.kitchen.isCookingComplete(appData.kitchen.currentCooking), "cooking should complete after all steps");
assert(appData.kitchen.recipeStats.recipe_ramen.cookCount === 1, "recipeStats cookCount should increase on completion");
const feedFirst = KA.kitchen.feedCompletedCooking("companion_owl");
assert(feedFirst.ok, "owned companion should be feedable");
assert(feedFirst.levelUp, "bond should level up when meal progress reaches 3");
assert(appData.companions[0].mealCount === 1, "mealCount should increase");
assert(appData.companions[0].bondLevel === 2, "bondLevel should increase after three meal progress");
assert(appData.companions[0].bondMealProgress === 0, "bondMealProgress should reset after level up");
assert(appData.kitchen.recipeStats.recipe_ramen.fedCount === 1, "recipeStats fedCount should increase");
assert(appData.kitchen.cookingHistory.length === 1, "cookingHistory should record fed meal");
KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg"], "companion_owl");
for (let i = 0; i < ramenSteps; i += 1) KA.kitchen.completeCurrentStep();
const sameDayBeforeProgress = appData.companions[0].bondMealProgress;
const feedSecond = KA.kitchen.feedCompletedCooking("companion_owl");
assert(feedSecond.ok, "same-day second meal should still be accepted");
assert(appData.companions[0].mealCount === 2, "same-day second meal should increase mealCount");
assert(appData.companions[0].bondMealProgress === sameDayBeforeProgress, "same-day second meal should not increase bondMealProgress");
assert(appData.kitchen.cookingHistory.length <= 100, "cookingHistory should stay capped");
appData.companions = [];
appData.kitchen = KA.kitchen.defaultKitchen();

const houseItems = KA.birdHouse.allItems();
const houseSlots = KA.birdHouse.allSlots();
assert(houseItems.length === 15, "bird house furniture should be 15");
assert(new Set(houseItems.map((item) => item.id)).size === 15, "bird house item IDs should be unique");
assert(new Set(houseItems.map((item) => item.displayOrder)).size === 15, "bird house displayOrder should be unique");
assert(houseItems.filter((item) => item.unlockCondition && item.unlockCondition.type === "initial").length === 4, "initial furniture should be four");
houseItems.forEach((item) => {
  assert(item.id.indexOf("house_") === 0, item.id + " should use house item ID");
  assert(Array.isArray(item.compatibleSlotTypes) && item.compatibleSlotTypes.length >= 1, item.id + " should define compatible slots");
  assert(item.unlockCondition, item.id + " should define unlockCondition");
  assert(KA.birdHouse.renderFurniture(item.id).indexOf("<svg") >= 0, item.id + " should render SVG");
  assert(KA.birdHouse.renderFurniture(item.id).indexOf("<img") < 0 && KA.birdHouse.renderFurniture(item.id).indexOf("http") < 0, item.id + " should not use external images");
});
assert(houseSlots.length === 8, "bird house slots should be 8");
assert(new Set(houseSlots.map((slot) => slot.id)).size === 8, "slot IDs should be unique");
assert(houseSlots.filter((slot) => slot.type === "wall").length === 2, "wall slots should be 2");
assert(houseSlots.filter((slot) => slot.type === "floor").length === 2, "floor slots should be 2");
assert(houseSlots.filter((slot) => slot.type === "perch").length === 2, "perch slots should be 2");
assert(houseSlots.filter((slot) => slot.type === "table").length === 1, "table slots should be 1");
assert(houseSlots.filter((slot) => slot.type === "nest").length === 1, "nest slots should be 1");
assert(KA.birdHouse.isCompatible("house_mobile_rainbow", "wallLeft"), "wall item should fit wall slot");
assert(!KA.birdHouse.isCompatible("house_mobile_rainbow", "floorLeft"), "wall item should not fit floor slot");
assert(KA.birdHouse.isCompatible("house_bell_toy", "wallLeft") && KA.birdHouse.isCompatible("house_bell_toy", "floorLeft"), "bell should fit wall or floor");

function makeHouseConditionData() {
  const houseData = KA.migrations.createDefaultAppData();
  houseData.companions = [
    { id: "companion_chick", speciesId: "companion_chick", hatchCount: 2, bondLevel: 5, mealCount: 2 },
    { id: "companion_duck", speciesId: "companion_duck", hatchCount: 2, bondLevel: 2, mealCount: 2 },
    { id: "companion_parrot", speciesId: "companion_parrot", hatchCount: 1, bondLevel: 2, mealCount: 1 },
    { id: "companion_peacock", speciesId: "companion_peacock", hatchCount: 1, bondLevel: 1, mealCount: 0 },
    { id: "companion_owl", speciesId: "companion_owl", hatchCount: 1, bondLevel: 1, mealCount: 0 },
    { id: "companion_sparrow", speciesId: "companion_sparrow", hatchCount: 1, bondLevel: 1, mealCount: 0 }
  ];
  houseData.kitchen = {
    currentCooking: null,
    recipeStats: {
      recipe_fruit_salad: { cookCount: 3, fedCount: 1 },
      recipe_ramen: { cookCount: 4, fedCount: 1 },
      recipe_cake: { cookCount: 3, fedCount: 1 }
    },
    cookingHistory: []
  };
  houseData.artworks = [{ artworkId: "art1" }, { artworkId: "art2" }, { artworkId: "art3" }];
  houseData.birdHouse = KA.birdHouse.defaultBirdHouse();
  return houseData;
}

const houseConditionData = makeHouseConditionData();
const metrics = KA.birdHouse.getBirdHouseMetrics(houseConditionData);
assert(metrics.acquiredSpeciesCount === 6, "metrics should count acquired species");
assert(metrics.totalHatchCount === 8, "metrics should sum hatchCount");
assert(metrics.uniqueRecipeCount === 3, "metrics should count unique cooked recipes");
assert(metrics.totalCookCount === 10, "metrics should sum cookCount");
assert(metrics.totalMealCount === 5, "metrics should sum mealCount");
assert(metrics.completedArtworkCount === 3, "metrics should count artworks");
assert(metrics.maxBondLevel === 5, "metrics should detect max bondLevel");
KA.birdHouse.ensureBirdHouse(houseConditionData);
[
  "house_perch_basic",
  "house_nest_basic",
  "house_cushion_small",
  "house_food_table",
  "house_perch_large",
  "house_perch_rainbow",
  "house_table_wood",
  "house_kitchen_wagon",
  "house_mobile_rainbow",
  "house_bell_toy",
  "house_cushion_star",
  "house_photo_frame"
].forEach((itemId) => {
  assert(houseConditionData.birdHouse.unlockedItemIds.indexOf(itemId) >= 0, itemId + " should unlock from metrics");
});
const houseOnce = JSON.stringify(houseConditionData.birdHouse);
KA.birdHouse.ensureBirdHouse(houseConditionData);
assert(JSON.stringify(houseConditionData.birdHouse) === houseOnce, "birdHouse ensure should be idempotent");
assert(KA.birdHouse.placeItem("wallLeft", "house_mobile_rainbow", houseConditionData), "compatible wall item should place");
assert(!KA.birdHouse.placeItem("floorLeft", "house_mobile_rainbow", houseConditionData), "incompatible wall item should not place on floor");
assert(KA.birdHouse.placeItem("wallRight", "house_mobile_rainbow", houseConditionData), "same item should move to a new slot");
assert(houseConditionData.birdHouse.placements.wallLeft === null && houseConditionData.birdHouse.placements.wallRight === "house_mobile_rainbow", "same item should not duplicate across slots");
assert(KA.birdHouse.placeItem("wallRight", null, houseConditionData), "item should be removable");
const normalizedBadHouse = KA.migrations.createDefaultAppData();
normalizedBadHouse.birdHouse = {
  unlockedItemIds: "bad",
  unlockedAtByItemId: [],
  unseenItemIds: null,
  placements: {
    wallLeft: "house_cushion_small",
    floorLeft: "house_cushion_small",
    perchLeft: "missing_item",
    centerTable: "house_food_table"
  }
};
KA.migrations.ensureDataShape(normalizedBadHouse);
assert(normalizedBadHouse.birdHouse.unlockedItemIds.indexOf("house_perch_basic") >= 0, "initial house furniture should be restored");
assert(normalizedBadHouse.birdHouse.placements.wallLeft === null, "incompatible placement should be cleared");
assert(Object.keys(normalizedBadHouse.birdHouse.placements).length === 8, "placements should contain eight official slots");
const houseLayoutData = KA.birdHouse.companionLayout(houseConditionData, "companion_peacock");
assert(houseLayoutData.length === 6, "house should render acquired birds only");
assert(houseLayoutData.filter((entry) => entry.species.id === "companion_peacock")[0].isFocus === true, "focused or favorite bird should be central");
assert(new Set(houseLayoutData.map((entry) => entry.species.id)).size === houseLayoutData.length, "house should not duplicate species");
const elevenBirdHouseData = KA.migrations.createDefaultAppData();
elevenBirdHouseData.companions = KA.companions.allSpecies().map((item, index) => ({
  id: item.id,
  speciesId: item.id,
  firstHatchedAt: "2026-07-01T09:00:00+09:00",
  lastHatchedAt: "2026-07-01T09:00:00+09:00",
  hatchCount: 1,
  bondLevel: 1,
  mealCount: 0,
  isFavorite: index === 6
}));
const elevenBirdLayout = KA.birdHouse.companionLayout(elevenBirdHouseData);
assert(elevenBirdLayout.length === 11, "bird house should render all eleven acquired species");
assert(new Set(elevenBirdLayout.map((entry) => entry.x + ":" + entry.y)).size === 11, "eleven-bird house positions should not overlap exactly");
elevenBirdLayout.forEach((entry) => {
  assert(entry.x >= 10 && entry.x <= 90 && entry.y >= 46 && entry.y <= 82, entry.species.id + " should stay inside the fixed house layout");
});
assert(elevenBirdLayout[0].species.id === "companion_penguin" && elevenBirdLayout[0].isFocus, "favorite new species should receive the focus position");
KA.birdHouse.recordInteraction("companion_chick", houseConditionData);
assert(houseConditionData.birdHouse.lastInteractedCompanionId === "companion_chick", "house interaction should save only the last interacted companion");
KA.birdHouse.clearUnseen(houseConditionData);
assert(houseConditionData.birdHouse.unseenItemIds.length === 0, "unseen furniture should clear");

const prototype11Data = KA.migrations.createDefaultAppData();
prototype11Data.appVersion = "1.0.0-prototype.11";
prototype11Data.profile.starTotals.lifetimeStars = 20;
prototype11Data.eggInventory = [
  { id: "egg_p11_10", createdAt: "2026-07-01T09:00:00+09:00", earnedByStars: 10, state: "new" },
  { id: "egg_p11_20", createdAt: "2026-07-02T09:00:00+09:00", earnedByStars: 20, state: "new" }
];
delete prototype11Data.eggSystem;
delete prototype11Data.companions;

const prototype12Data = KA.migrations.createDefaultAppData();
prototype12Data.profile.starTotals.lifetimeStars = 20;
prototype12Data.eggInventory = [
  { id: "egg_p12_10", createdAt: "2026-07-01T09:00:00+09:00", earnedByStars: 10, state: "warm", growthPoints: 2, targetGrowthPoints: 6, plannedSpeciesId: null },
  { id: "egg_p12_20", createdAt: "2026-07-02T09:00:00+09:00", earnedByStars: 20, state: "waiting", growthPoints: 0, targetGrowthPoints: 6 }
];
prototype12Data.eggSystem = { activeEggId: "egg_p12_10", dailyActivity: { "2026-07-15": { petted: true } } };
prototype12Data.companions = [{ id: "companion_chick", speciesId: "companion_chick", firstHatchedAt: "2026-07-10T09:00:00+09:00", lastHatchedAt: "2026-07-10T09:00:00+09:00", hatchCount: 1, bondLevel: 1, isFavorite: true }];

const incompleteStartupData = KA.migrations.createDefaultAppData();
incompleteStartupData.eggSystem = { activeEggId: "missing_egg" };
incompleteStartupData.companions = null;
incompleteStartupData.eggInventory = [
  { id: "egg_bad", createdAt: "2026-07-03T09:00:00+09:00", earnedByStars: 10, state: "glowing", growthPoints: 3, plannedSpeciesId: "companion_invalid" }
];

const legacyDailyRecordData = KA.migrations.createDefaultAppData();
const legacyToday = KA.date.localDateKey();
legacyDailyRecordData.dailyRecords[legacyToday] = {
  recordId: "daily_legacy_" + legacyToday,
  localDate: legacyToday,
  completedTasks: [{ taskId: "task_brush_teeth", status: "completed" }],
  earnedStarsToday: 1
};
delete legacyDailyRecordData.dailyRecords[legacyToday].artworkIds;
delete legacyDailyRecordData.dailyRecords[legacyToday].forestPlacementIds;
delete legacyDailyRecordData.dailyRecords[legacyToday].parentNotes;

runStartupCase("empty localStorage", null, null);
runStartupCase("prototype11 localStorage", prototype11Data, null);
runStartupCase("prototype12 localStorage", prototype12Data, KA.migrations.createDefaultUiState());
runStartupCase("incomplete localStorage", incompleteStartupData, { selectedWorldId: "world_secret_base" });
runStartupCase("legacy dailyRecord missing fields", legacyDailyRecordData, KA.migrations.createDefaultUiState());
const recoveryCase = runStartupCase("state init failure", null, null, { failStateInit: true, expectRecovery: true });
runStartupCase("migration failure", prototype11Data, null, { failMigration: true });
runStartupCase("render failure", null, null, { failRender: true, expectRecovery: true });
runStartupCase("safeStart mode", prototype12Data, KA.migrations.createDefaultUiState(), { safeStart: true });

assert(clickBoot(recoveryCase.document, "data-boot-reload"), "reload button should be handled by boot");
assert(recoveryCase.context.__reloaded === true, "reload button should call location.reload");
assert(clickBoot(recoveryCase.document, "data-boot-safe-start"), "safeStart button should be handled by boot");
assert(recoveryCase.context.location.href.indexOf("safeStart=1") >= 0, "safeStart button should navigate with safeStart=1");
assert(recoveryCase.context.location.href.indexOf("v=10p23") >= 0, "safeStart button should keep prototype 23 cache query");
assert(clickBoot(recoveryCase.document, "data-boot-copy"), "copy button should be handled by boot");
const diagnostics = JSON.parse(recoveryCase.storage["kodomoAdventure.bootDiagnostic.v1"]);
assert(Array.isArray(diagnostics) && diagnostics.length >= 1, "diagnostics should be saved");
assert(diagnostics[0].stage && diagnostics[0].errorCode, "diagnostics should include stage and errorCode");

const expectedTemplates = {
  coloring_butterfly_001: 5,
  coloring_flower_001: 6,
  coloring_rabbit_001: 9,
  coloring_cat_001: 5,
  coloring_dolphin_001: 9,
  coloring_dinosaur_001: 9,
  coloring_horse_001: 9,
  coloring_lion: 2,
  coloring_panda: 1,
  coloring_grasshopper: 2
};
Object.keys(expectedTemplates).forEach((templateId) => {
  const template = KA.coloring.getTemplate(templateId);
  assert(template, templateId + " should exist");
  assert(template.designVersion === expectedTemplates[templateId], templateId + " designVersion changed");
});

const species = KA.companions.allSpecies();
const speciesIds = species.map((item) => item.id);
assert(species.length === 11, "formal companion species should be 11");
[
  "companion_chick",
  "companion_duck",
  "companion_parrot",
  "companion_peacock",
  "companion_owl",
  "companion_sparrow",
  "companion_penguin",
  "companion_shimaenaga",
  "companion_parakeet",
  "companion_java_sparrow",
  "companion_ice_legend_bird"
].forEach((speciesId, index) => {
  const item = KA.companions.getSpecies(speciesId);
  assert(item, speciesId + " should exist");
  assert(item.displayOrder === index + 1, speciesId + " displayOrder mismatch");
  const expectedDesignVersion = speciesId === "companion_peacock" ? 4 : (index < 6 ? 2 : 1);
  assert(item.designVersion === expectedDesignVersion, speciesId + " designVersion mismatch");
  assert(Array.isArray(item.preferredWorldIds) && item.preferredWorldIds.length >= 2, speciesId + " preferred worlds missing");
  item.preferredWorldIds.forEach((worldId) => {
    assert(KA.constants.WORLD_DEFINITIONS.some((world) => world.id === worldId), speciesId + " has invalid preferred world " + worldId);
  });
  const svg = KA.companions.renderCompanion(speciesId);
  assert(svg.indexOf("<svg") >= 0, speciesId + " should render SVG");
  assert(svg.indexOf("<img") < 0 && svg.indexOf("http") < 0, speciesId + " should not reference external images");
});
const chickSvg = KA.companions.renderCompanion("companion_chick");
assert(KA.companions.getSpecies("companion_chick").transparentOuterBox === true, "chick should request transparent outer box reset");
assert(chickSvg.indexOf("companion-transparent-box") >= 0, "chick SVG should use transparent outer box class");
assert(chickSvg.indexOf("<rect") < 0, "chick SVG should not contain an outer frame rect");
assert(chickSvg.indexOf('cx="84" cy="45" r="4" fill="#1f2937"') < 0, "chick black eye circle should be removed");
assert(chickSvg.indexOf('M80 45 C83 42 88 43 90 46') >= 0, "chick should use a small curved eye");
assert(KA.companions.getSpecies("companion_chick").outlineStroke === "none", "chick enclosing outline should be disabled");
assert(chickSvg.indexOf('<g class="outer-outline" fill="none" stroke="none"') >= 0, "chick should render without an enclosing outer stroke");
assert(chickSvg.indexOf('stroke="#28312d"') < 0, "chick should not render the black enclosing stroke");
assert(chickSvg.indexOf('stroke="#5b4631"') >= 0, "chick internal feather and crest lines should remain");
const duck = KA.companions.getSpecies("companion_duck");
const duckBeak = duck.regions.filter((region) => region.id === "beak")[0];
assert(duckBeak && duckBeak.d.indexOf("M64 45") === 0 && duckBeak.d.indexOf("26 50") >= 0, "duck beak should face left");
const parrotSvg = KA.companions.renderCompanion("companion_parrot");
assert(parrotSvg.indexOf('companion-parrot') >= 0, "parrot should render");
assert(KA.companions.getSpecies("companion_parrot").transparentOuterBox === true, "parrot should request transparent outer box reset");
assert(parrotSvg.indexOf("companion-transparent-box") >= 0 && parrotSvg.indexOf("<rect") < 0, "parrot SVG outer box should be transparent and rect-free");
assert(parrotSvg.indexOf('stroke="#28312d"') < 0 && parrotSvg.indexOf('stroke="#5b4631"') < 0, "parrot black outline lines should be removed");
assert(parrotSvg.indexOf('cx="91" cy="45" r="4" fill="#1f2937"') >= 0 && parrotSvg.indexOf('stroke="#92400e"') >= 0, "parrot eye and beak detail should remain");
const owlSvg = KA.companions.renderCompanion("companion_owl");
assert(KA.companions.getSpecies("companion_owl").transparentOuterBox === true, "owl should request transparent outer box reset");
assert(owlSvg.indexOf("companion-transparent-box") >= 0 && owlSvg.indexOf("<rect") < 0, "owl SVG outer box should be transparent and rect-free");
assert(owlSvg.indexOf('stroke="#28312d"') < 0 && owlSvg.indexOf('stroke="#5b4631"') < 0, "owl black outline lines should be removed");
assert(owlSvg.indexOf('cx="78" cy="59" r="6" fill="#4b2f1e"') >= 0, "owl eyes should remain");
assert(stylesCss.indexOf(".companion-svg.companion-transparent-box") >= 0 && stylesCss.indexOf("background: transparent !important") >= 0, "target companion box reset styles should exist");
["companion_duck", "companion_peacock", "companion_sparrow"].forEach((speciesId) => {
  assert(KA.companions.getSpecies(speciesId).transparentOuterBox !== true, speciesId + " should not receive the hotfix box reset");
  assert(KA.companions.renderCompanion(speciesId).indexOf("companion-transparent-box") < 0, speciesId + " rendered SVG should remain unchanged by the box reset");
});
const peacock = KA.companions.getSpecies("companion_peacock");
assert(peacock.viewBox === "-105 -100 420 260", "peacock viewBox should expand to fit enlarged tail");
assert(peacock.peacockTailScale === 2, "peacock tail scale should be 2x");
assert(peacock.peacockBodyScale === 0.75, "peacock body scale should be 0.75x");
const peacockSvg = KA.companions.renderCompanion("companion_peacock");
assert(peacockSvg.indexOf("peacock-tail-group") >= 0, "peacock tail group should exist");
assert(peacockSvg.indexOf("peacock-body-group") >= 0, "peacock body group should exist");
assert(peacockSvg.indexOf('transform="translate(-105 -100) scale(2)"') >= 0, "peacock tail should be scaled 2x");
assert(peacockSvg.indexOf('transform="translate(26.25 25) scale(0.75)"') >= 0, "peacock body should be scaled 0.75x");
assert(peacockSvg.indexOf('cx="111" cy="61" r="3.5"') >= 0, "peacock face eye should be preserved");
assert(peacockSvg.indexOf("M121 68 L134 72 L121 77 Z") >= 0, "peacock beak should be preserved");
assert(peacockSvg.indexOf("M99 45 C94 34 96 28 103 22") >= 0, "peacock crest should be preserved");
assert(peacockSvg.indexOf("tail_eyes") < 0 && peacockSvg.indexOf("M36 92 C43 82 57 83 62 94") >= 0, "peacock tail eye pattern should be preserved");
const sparrow = KA.companions.getSpecies("companion_sparrow");
assert(sparrow.outer[0].indexOf("M32 56") === 0, "sparrow should use rebuilt small-bird outline");
assert(sparrow.regions.filter((region) => region.id === "beak")[0].d.indexOf("L31 56") >= 0, "sparrow should have a short conical beak");
[
  { id: "companion_penguin", name: "ぺんぎん", regions: ["body", "belly", "wing_left", "beak", "feet"] },
  { id: "companion_shimaenaga", name: "しまえなが", regions: ["body", "wing", "tail", "beak", "legs"] },
  { id: "companion_parakeet", name: "いんこ", regions: ["body", "head", "wing", "tail", "beak"] },
  { id: "companion_java_sparrow", name: "ぶんちょう", regions: ["body", "head", "wing", "tail", "beak"] },
  { id: "companion_ice_legend_bird", name: "こおりの でんせつどり", regions: ["left_wing", "right_wing", "body", "crest", "tail"] }
].forEach((expected) => {
  const item = KA.companions.getSpecies(expected.id);
  assert(item && item.name === expected.name && item.designVersion === 1, expected.id + " should be a formal version 1 species");
  const regionIds = item.regions.map((region) => region.id);
  expected.regions.forEach((regionId) => assert(regionIds.indexOf(regionId) >= 0, expected.id + " should include " + regionId));
  const normal = KA.companions.renderCompanion(expected.id);
  const silhouette = KA.companions.renderCompanion(expected.id, { silhouette: true });
  assert(normal.indexOf("<svg") >= 0 && silhouette.indexOf("companion-silhouette") >= 0, expected.id + " should render normal and silhouette SVG");
  assert(normal.indexOf("<rect") < 0 && normal.indexOf("<img") < 0 && normal.indexOf("http") < 0, expected.id + " should have a transparent inline SVG");
});
assert(new Set(speciesIds).size === speciesIds.length, "species IDs should be unique");
const oldOwnedData = KA.migrations.createDefaultAppData();
oldOwnedData.companions = species.slice(0, 6).map((item, index) => ({
  id: item.id,
  speciesId: item.id,
  firstHatchedAt: "2026-07-" + String(index + 1).padStart(2, "0") + "T09:00:00+09:00",
  lastHatchedAt: "2026-07-" + String(index + 1).padStart(2, "0") + "T09:00:00+09:00",
  hatchCount: 1,
  bondLevel: 1,
  isFavorite: index === 0
}));
const newSpeciesIds = species.slice(6).map((item) => item.id);
for (let candidateIndex = 0; candidateIndex < 20; candidateIndex += 1) {
  const candidateId = KA.companions.pickSpeciesForEgg({ id: "egg_new_candidate_" + candidateIndex }, oldOwnedData);
  assert(newSpeciesIds.indexOf(candidateId) >= 0, "unowned-priority hatch pool should select one of the five new species");
}
assert(
  KA.companions.pickSpeciesForEgg({ id: "egg_planned", plannedSpeciesId: "companion_java_sparrow" }, oldOwnedData) === "companion_java_sparrow",
  "valid plannedSpeciesId should remain fixed after the species expansion"
);
["coloring_rabbit_001", "coloring_cat_001", "coloring_lion", "coloring_panda", "coloring_grasshopper", "coloring_flower_001"].forEach((notSpecies) => {
  assert(speciesIds.indexOf(notSpecies) === -1, notSpecies + " must not be a companion species");
});

function countActiveLike(data) {
  return data.eggInventory.filter((egg) => ["active", "warm", "glowing", "cracked", "ready"].indexOf(egg.state) >= 0).length;
}

const legacyData = KA.migrations.createDefaultAppData();
legacyData.profile.starTotals.lifetimeStars = 30;
legacyData.eggInventory = [
  { id: "egg_old_10", createdAt: "2026-07-01T09:00:00+09:00", earnedByStars: 10, state: "new" },
  { id: "egg_old_20", createdAt: "2026-07-02T09:00:00+09:00", earnedByStars: 20, state: "new", growthPoints: 2 },
  { id: "egg_old_30", createdAt: "2026-07-03T09:00:00+09:00", earnedByStars: 30, state: "new" }
];
KA.migrations.ensureDataShape(legacyData);
const legacyOnce = JSON.stringify(legacyData);
KA.migrations.ensureDataShape(legacyData);
assert(legacyOnce === JSON.stringify(legacyData), "legacy egg migration should be idempotent");
assert(legacyData.eggSystem && legacyData.eggSystem.dailyActivity, "eggSystem should be added");
assert(legacyData.companions && Array.isArray(legacyData.companions), "companions should be added");
assert(countActiveLike(legacyData) === 1, "only one legacy egg should become active");
assert(legacyData.eggInventory.filter((egg) => egg.state === "waiting").length === 2, "remaining legacy eggs should wait");
assert(legacyData.eggInventory[0].isFirstHatchEgg === true, "oldest unhatched legacy egg should become first hatch egg");
assert(legacyData.eggInventory[0].targetGrowthPoints === 4, "first hatch egg should target 4 points");
assert(legacyData.eggInventory.filter((egg) => egg.isFirstHatchEgg === true).length === 1, "first hatch egg should be unique");
legacyData.eggInventory.forEach((egg) => {
  const target = egg.isFirstHatchEgg ? 4 : 6;
  assert(egg.targetGrowthPoints === target, "target growth should match first-hatch status");
  assert(egg.growthPoints >= 0 && egg.growthPoints <= target, "growth should be clamped to target");
});
const legacyActivity = KA.eggs.todayActivity(legacyData, "2099-02-01");
["petted", "warmed", "sang", "jobBonus", "coloringBonus"].forEach((key) => {
  assert(legacyActivity[key] === false, "dailyActivity should include " + key);
});

const invalidData = KA.migrations.createDefaultAppData();
invalidData.profile.starTotals.lifetimeStars = 20;
invalidData.eggInventory = [
  { id: "egg_invalid_1", createdAt: "2026-07-01T09:00:00+09:00", earnedByStars: 10, state: "waiting", growthPoints: 3, plannedSpeciesId: "companion_unicorn" },
  { id: "egg_invalid_2", createdAt: "2026-07-02T09:00:00+09:00", earnedByStars: 20, state: "ready", growthPoints: 6, plannedSpeciesId: "companion_dragon" }
];
invalidData.eggSystem = { activeEggId: "egg_invalid_2", dailyActivity: {} };
invalidData.companions = [{ id: "companion_dragon", speciesId: "companion_dragon", hatchCount: 1, bondLevel: 1, isFavorite: true }];
KA.migrations.ensureDataShape(invalidData);
assert(invalidData.eggInventory[0].plannedSpeciesId === null, "invalid planned species below ready should reset to null");
assert(KA.companions.isValidSpeciesId(invalidData.eggInventory[1].plannedSpeciesId), "invalid ready species should be replaced with formal bird");
assert(invalidData.companions[0].speciesId === "companion_dragon", "invalid hatched companion records should be preserved safely");

assert(KA.eggs.stateForGrowth(0, 4) === "active", "4-point egg 0 should be active");
assert(KA.eggs.stateForGrowth(1, 4) === "warm", "4-point egg 1 should be warm");
assert(KA.eggs.stateForGrowth(2, 4) === "glowing", "4-point egg 2 should be glowing");
assert(KA.eggs.stateForGrowth(3, 4) === "cracked", "4-point egg 3 should be cracked");
assert(KA.eggs.stateForGrowth(4, 4) === "ready", "4-point egg 4 should be ready");
assert(KA.eggs.stateForGrowth(2, 6) === "warm", "6-point egg 2 should be warm");
assert(KA.eggs.stateForGrowth(4, 6) === "glowing", "6-point egg 4 should be glowing");
assert(KA.eggs.stateForGrowth(5, 6) === "cracked", "6-point egg 5 should be cracked");
assert(KA.eggs.stateForGrowth(6, 6) === "ready", "6-point egg 6 should be ready");

KA.stars.addLedgerEntry({ type: "test_adjust", reason: "egg test", totalDelta: 20, spendableDelta: 20 });
KA.eggs.syncEggInventory(KA.state.getAppData());
const data = KA.state.getAppData();
assert(KA.eggs.eggCount() === 2, "two eggs should exist at 20 lifetime stars");
assert(countActiveLike(data) === 1, "active egg should be at most one");
let active = KA.eggs.activeEgg(data);
assert(active && active.state === "active", "first egg should be active");
assert(active.isFirstHatchEgg === true, "first active egg should be marked first hatch");
assert(active.targetGrowthPoints === 4, "first active egg should be ready at 4 points");

const pet1 = KA.eggs.petActiveEgg();
const pet2 = KA.eggs.petActiveEgg();
assert(pet1.ok && pet1.growthPoints === 1, "petting should add one point");
assert(!pet2.ok && pet2.alreadyDone, "petting should not repeat on same day");
assert(KA.eggs.activeEgg(data).growthPoints === 1, "duplicate pet should not grow");
const warm1 = KA.eggs.warmActiveEgg();
const warm2 = KA.eggs.warmActiveEgg();
assert(warm1.ok && warm1.growthPoints === 2, "warming should add one point");
assert(!warm2.ok && warm2.alreadyDone, "warming should not repeat on same day");
const sing1 = KA.eggs.singToActiveEgg();
const sing2 = KA.eggs.singToActiveEgg();
assert(sing1.ok && sing1.growthPoints === 3, "singing should add one point");
assert(!sing2.ok && sing2.alreadyDone, "singing should not repeat on same day");

const activeTasks = KA.tasks.activeTasks();
for (let i = 0; i < Math.min(3, activeTasks.length); i += 1) {
  KA.tasks.completeTask(activeTasks[i].taskId);
}
assert(data.eggSystem.dailyActivity[KA.state.getTodayKey()].jobBonus === true, "job bonus should be recorded");
const afterJob = KA.eggs.activeEgg(data).growthPoints;
assert(afterJob === 4 && KA.eggs.activeEgg(data).state === "ready", "first hatch egg should become ready at four points");
KA.tasks.undoTask(activeTasks[0].taskId);
KA.tasks.completeTask(activeTasks[0].taskId);
assert(KA.eggs.activeEgg(data).growthPoints === afterJob, "job bonus should not repeat after unchecked/rechecked task");
active = KA.eggs.activeEgg(data);
assert(active.state === "ready", "ready egg should stay ready");
assert(active.plannedSpeciesId && KA.companions.isValidSpeciesId(active.plannedSpeciesId), "ready egg should plan formal bird");
const planned = active.plannedSpeciesId;
KA.migrations.ensureDataShape(data);
assert(KA.eggs.activeEgg(data).plannedSpeciesId === planned, "planned species should remain stable after reload");
assert(data.companions.length === 0, "ready egg should not auto hatch");

const hatch1 = KA.eggs.hatchReadyEgg(active.id);
assert(hatch1.ok, "ready egg should hatch when button action is called");
assert(hatch1.egg.state === "hatched", "hatched egg should be marked hatched");
assert(hatch1.egg.growthPoints === 4, "first hatched egg should keep 4-point target");
assert(data.companions.length === 1, "first hatch should add companion");
assert(data.companions[0].hatchCount === 1 && data.companions[0].bondLevel === 1, "first hatch should start count and bond at 1");
assert(KA.eggs.activeEgg(data), "next waiting egg should become active");
active = KA.eggs.activeEgg(data);
assert(active.isFirstHatchEgg === false && active.targetGrowthPoints === 6, "second egg should use the normal 6-point target");
const sameDayGrowth = Number(active.growthPoints || 0);
["petted", "warmed", "sang", "jobBonus"].forEach((key) => {
  const duplicate = KA.eggs.addGrowth(key, "same day reuse", data, { dateKey: KA.state.getTodayKey() });
  assert(!duplicate.ok && duplicate.alreadyDone, key + " should not be reusable for the next egg on the same day");
});
assert(KA.eggs.activeEgg(data).growthPoints === sameDayGrowth, "same-day reused actions should not grow next egg");

const normalEggDate = "2099-01-02";
["petted", "warmed", "sang", "jobBonus", "coloringBonus"].forEach((key, index) => {
  const result = KA.eggs.addGrowth(key, "normal egg growth", data, { dateKey: normalEggDate });
  assert(result.ok && result.growthPoints === index + 1, key + " should grow the normal egg once");
});
assert(KA.eggs.activeEgg(data).growthPoints === 5, "one day growth should allow up to five points");
assert(KA.eggs.activeEgg(data).state === "cracked", "normal egg should be cracked at five points");
const duplicateColoring = KA.eggs.addGrowth("coloringBonus", "duplicate coloring", data, { dateKey: normalEggDate });
assert(!duplicateColoring.ok && duplicateColoring.alreadyDone, "coloring bonus should not repeat");
assert(KA.eggs.activeEgg(data).growthPoints === 5, "duplicate fifth action should not exceed five points");
const normalReady = KA.eggs.addGrowth("petted", "sixth point", data, { dateKey: "2099-01-03" });
assert(normalReady.ok && normalReady.ready && normalReady.growthPoints === 6, "normal egg should become ready at six points");
const readyNoGrowth = KA.eggs.addGrowth("warmed", "ready no growth", data, { dateKey: "2099-01-04" });
assert(!readyNoGrowth.ok && readyNoGrowth.reason === "no_active_egg", "ready egg should not receive more growth");
assert(KA.eggs.activeEgg(data).growthPoints === 6, "ready egg should not exceed target");

const hatchNormal = KA.eggs.hatchReadyEgg(KA.eggs.activeEgg(data).id);
assert(hatchNormal.ok, "normal ready egg should hatch by button action");

const repeatEgg = {
  id: "egg_repeat",
  createdAt: "2026-07-15T10:00:00+09:00",
  earnedByStars: 999,
  state: "ready",
  growthPoints: 6,
  targetGrowthPoints: 6,
  isFirstHatchEgg: false,
  plannedSpeciesId: hatch1.species.id
};
data.eggInventory.push(repeatEgg);
data.eggSystem.activeEggId = repeatEgg.id;
const hatch2 = KA.eggs.hatchReadyEgg(repeatEgg.id);
assert(hatch2.ok, "repeat hatch should succeed");
assert(data.companions.filter((companion) => companion.speciesId === hatch1.species.id).length === 1, "repeat hatch should not duplicate companion card");
const repeated = KA.companions.getCompanion(data, hatch1.species.id);
assert(repeated.hatchCount === 2 && repeated.bondLevel === 2, "repeat hatch should increase count and bond");
KA.companions.setFavorite(hatch1.species.id, true);
assert(KA.companions.favoriteCompanion(data).speciesId === hatch1.species.id, "favorite should be set");
KA.companions.setFavorite(hatch1.species.id, false);
assert(KA.companions.favoriteCompanion(data) === null, "favorite can be cleared");

const outingDestinations = KA.outings.allDestinations();
assert(outingDestinations.length === 3, "outing destinations should be three");
assert(new Set(outingDestinations.map((item) => item.id)).size === 3, "outing destination IDs should be unique");
assert(new Set(outingDestinations.map((item) => item.displayOrder)).size === 3, "outing displayOrder should be unique");
assert(outingDestinations.map((item) => item.rewardType).join(",") === "stars,houseItem,ingredients", "outing reward types should match destinations");
outingDestinations.forEach((destination) => {
  assert(destination.description && destination.returnMessages.length >= 3, destination.id + " should include descriptions and return messages");
  assert(KA.outings.renderDestinationIcon(destination.id).indexOf("<svg") >= 0, destination.id + " should render inline SVG");
});

const tripItemIds = ["house_trip_flower_wreath", "house_trip_flower_cushion", "house_trip_butterfly_mobile"];
tripItemIds.forEach((itemId) => {
  const item = KA.birdHouse.getItem(itemId);
  assert(item && item.unlockCondition.type === "outing", itemId + " should be an outing furniture item");
  assert(item.compatibleSlotTypes.indexOf(item.type === "floor" ? "floor" : "wall") >= 0, itemId + " should have a compatible fixed slot");
  assert(KA.birdHouse.renderFurniture(itemId).indexOf("<svg") >= 0, itemId + " should render inline SVG");
});

function makeReadyOutingData(dateKey) {
  const outingData = KA.migrations.createDefaultAppData();
  outingData.companions = [{
    id: "companion_chick",
    speciesId: "companion_chick",
    firstHatchedAt: dateKey + "T08:00:00+09:00",
    lastHatchedAt: dateKey + "T08:00:00+09:00",
    hatchCount: 1,
    bondLevel: 2,
    isFavorite: true,
    mealCount: 1,
    bondMealProgress: 1,
    lastBondMealDate: dateKey,
    lastFedAt: dateKey + "T12:00:00+09:00"
  }];
  outingData.eggInventory = [{ id: "outing_egg", state: "active", growthPoints: 0, targetGrowthPoints: 6, createdAt: dateKey + "T07:00:00+09:00" }];
  outingData.eggSystem = {
    activeEggId: "outing_egg",
    dailyActivity: { [dateKey]: { petted: true, warmed: false, sang: false, jobBonus: false, coloringBonus: false } }
  };
  outingData.dailyRecords[dateKey] = {
    recordId: "daily_outing_" + dateKey,
    profileId: KA.constants.PROFILE_ID,
    dateKey,
    createdAt: dateKey + "T08:00:00+09:00",
    updatedAt: dateKey + "T09:00:00+09:00",
    completedTasks: [{ taskId: KA.constants.DEFAULT_TASKS[0].taskId, status: "completed", completedAt: dateKey + "T09:00:00+09:00" }],
    earnedStarsToday: 1,
    artworkIds: [],
    forestPlacementIds: [],
    parentNotes: {},
    corrections: []
  };
  KA.companions.ensureCompanions(outingData);
  KA.kitchen.ensureKitchen(outingData);
  KA.birdHouse.ensureBirdHouse(outingData);
  KA.outings.ensureOuting(outingData, dateKey);
  return outingData;
}

const originalGetAppData = KA.state.getAppData;
const originalSaveAppData = KA.state.saveAppData;
const originalLocalDateKey = KA.date.localDateKey;
let outingData = makeReadyOutingData("2026-07-18");
let mockedOutingDate = "2026-07-18";
KA.state.getAppData = () => outingData;
KA.state.saveAppData = () => true;
KA.date.localDateKey = (date) => date ? originalLocalDateKey(date) : mockedOutingDate;
try {
  const prep = KA.outings.preparationStatus(outingData, "2026-07-18");
  assert(prep.job && prep.care && prep.food && prep.complete, "three outing preparation conditions should complete from existing records");
  assert(KA.outings.eligibleCompanions(outingData, "2026-07-18").length === 1, "only a companion fed today should be eligible");
  outingData.eggSystem.dailyActivity["2026-07-18"] = { petted: false, warmed: false, sang: false, jobBonus: true, coloringBonus: true };
  assert(!KA.outings.preparationStatus(outingData, "2026-07-18").care, "job and coloring egg points should not count as direct care");
  outingData.eggSystem.dailyActivity["2026-07-18"].warmed = true;
  assert(KA.outings.preparationStatus(outingData, "2026-07-18").care, "one direct care action should count");

  const departure = KA.outings.startTrip("companion_chick", "outing_meadow");
  assert(departure.ok && departure.trip.status === "traveling", "ready outing should depart");
  assert(departure.trip.departedDateKey === "2026-07-18" && departure.trip.returnDateKey === "2026-07-19", "outing should use local departure and next-day return keys");
  assert(departure.trip.rewardPlan.type === "stars" && departure.trip.rewardPlan.amount >= 2 && departure.trip.rewardPlan.amount <= 4, "meadow reward should be fixed at departure to 2-4 stars");
  const fixedReward = JSON.stringify(departure.trip.rewardPlan);
  KA.outings.ensureOuting(outingData, "2026-07-18");
  assert(JSON.stringify(outingData.outing.activeTrip.rewardPlan) === fixedReward, "reload normalization should preserve rewardPlan");
  assert(!KA.outings.startTrip("companion_chick", "outing_sea").ok, "only one active trip should exist");
  assert(KA.birdHouse.companionLayout(outingData).length === 0, "traveling companion should not be interactive in bird house");
  assert(!KA.outings.claimOutingReward(departure.trip.tripId).ok, "departure-day reward should not be claimable");

  mockedOutingDate = "2026-07-19";
  assert(KA.outings.syncTripStatus(outingData, "2026-07-19").trip.status === "returned", "trip should return on the next local date");
  const starsBeforeClaim = outingData.profile.starTotals.spendableStars;
  const claimed = KA.outings.claimOutingReward(departure.trip.tripId);
  assert(claimed.ok, "returned reward should be claimable");
  assert(outingData.profile.starTotals.spendableStars === starsBeforeClaim + claimed.reward.amount, "meadow should use central star totals");
  const starsAfterClaim = outingData.profile.starTotals.spendableStars;
  assert(!KA.outings.claimOutingReward(departure.trip.tripId).ok && outingData.profile.starTotals.spendableStars === starsAfterClaim, "claimOutingReward should be idempotent");
  assert(outingData.outing.history.length === 1 && outingData.outing.history[0].claimedAt, "claimed trip should move to history with claimedAt");

  outingData = makeReadyOutingData("2026-07-20");
  mockedOutingDate = "2026-07-20";
  const flowerTrip = KA.outings.startTrip("companion_chick", "outing_flower_field");
  assert(flowerTrip.ok && flowerTrip.trip.rewardPlan.type === "houseItem" && tripItemIds.indexOf(flowerTrip.trip.rewardPlan.itemId) >= 0, "flower field should prefer an unowned trip furniture item");
  const flowerItem = flowerTrip.trip.rewardPlan.itemId;
  mockedOutingDate = "2026-07-21";
  KA.outings.syncTripStatus(outingData, "2026-07-21");
  assert(KA.outings.claimOutingReward(flowerTrip.trip.tripId).ok, "flower reward should be claimable");
  assert(outingData.birdHouse.unlockedItemIds.indexOf(flowerItem) >= 0 && outingData.birdHouse.unseenItemIds.indexOf(flowerItem) >= 0, "flower furniture should unlock and become NEW");
  KA.birdHouse.evaluateBirdHouseUnlocks(outingData);
  assert(outingData.birdHouse.unlockedItemIds.indexOf(flowerItem) >= 0, "outing furniture should never relock");

  outingData = makeReadyOutingData("2026-07-22");
  mockedOutingDate = "2026-07-22";
  const seaTrip = KA.outings.startTrip("companion_chick", "outing_sea");
  assert(seaTrip.ok && seaTrip.trip.rewardPlan.type === "ingredients" && seaTrip.trip.rewardPlan.items.length >= 1, "sea should fix valid ingredient rewards at departure");
  mockedOutingDate = "2026-07-23";
  KA.outings.syncTripStatus(outingData, "2026-07-23");
  const seaClaim = KA.outings.claimOutingReward(seaTrip.trip.tripId);
  assert(seaClaim.ok, "sea reward should be claimable");
  seaClaim.reward.items.forEach((item) => assert(KA.kitchen.getIngredientInventory(item.ingredientId, outingData) >= item.quantity, "sea ingredients should enter kitchen souvenir inventory"));
  const ensuredOnce = JSON.stringify(KA.outings.ensureOuting(outingData, "2026-07-23"));
  assert(JSON.stringify(KA.outings.ensureOuting(outingData, "2026-07-23")) === ensuredOnce, "outing ensure should be idempotent");
} finally {
  KA.state.getAppData = originalGetAppData;
  KA.state.saveAppData = originalSaveAppData;
  KA.date.localDateKey = originalLocalDateKey;
}

data.outing = JSON.parse(JSON.stringify(outingData.outing));
data.kitchen.ingredientInventory = JSON.parse(JSON.stringify(outingData.kitchen.ingredientInventory));

assert(appJs.indexOf('KA.router.register("outing", renderOuting)') >= 0, "outing route should be registered without a bottom navigation item");
assert(appJs.indexOf("renderOutingHomeCard(data)") >= 0, "home should render outing status directly");
assert(appJs.indexOf("おでかけの じゅんび") >= 0 && appJs.indexOf("おでかけの きろく") >= 0, "outing UI should include preparation and history");
assert(appJs.indexOf("Math.random()") < 0 || read(path.join("js", "outings.js")).indexOf("Math.random()") < 0, "outing rewards should not use Math.random");

const exportPayload = {
  appData: data,
  uiState: KA.state.getUiState()
};
const exportText = JSON.stringify(exportPayload);
["eggInventory", "eggSystem", "dailyActivity", "growthPoints", "targetGrowthPoints", "isFirstHatchEgg", "warmed", "sang", "plannedSpeciesId", "companionId", "companions", "firstHatchedAt", "lastHatchedAt", "hatchCount", "bondLevel", "isFavorite", "mealCount", "bondMealProgress", "lastBondMealDate", "lastFedAt", "kitchen", "currentCooking", "recipeStats", "cookingHistory", "ingredientInventory", "birdHouse", "unlockedItemIds", "unlockedAtByItemId", "unseenItemIds", "placements", "lastVisitedAt", "lastInteractedCompanionId", "outing", "activeTrip", "history", "totalTripCount", "destinationStats", "lastClaimedTripId", "claimedTripIds", "rewardPlan", "tripId", "claimedAt", "coloringSettings", "starCosts", "order", "jobSettings", "dailyDisplayCount", "enabledJobIds", "displayOrder", "customJobs", "dailySelectionsByDate"].forEach((key) => {
  assert(exportText.indexOf(key) >= 0, "JSON export shape should include " + key);
});

const sourceScanFiles = ["index.html", "manifest.webmanifest"]
  .concat(fs.readdirSync(path.join(root, "js")).map((file) => path.join("js", file)))
  .concat(fs.readdirSync(path.join(root, "css")).map((file) => path.join("css", file)))
  .concat(fs.existsSync(path.join(root, "tests")) ? fs.readdirSync(path.join(root, "tests")).filter((file) => file.endsWith(".html") || file.endsWith(".js")).map((file) => path.join("tests", file)) : []);
sourceScanFiles.forEach((rel) => {
  const text = read(rel);
  assert(!/https?:\/\//.test(text), rel + " should not use external URL");
  assert(!/fetch\s*\(/.test(text), rel + " should not use fetch");
  assert(!/type=["']module["']/.test(text), rel + " should not use type=module");
});

JSON.parse(storage[KA.constants.STORAGE_KEYS.appData]);
console.log("Smoke tests passed");
