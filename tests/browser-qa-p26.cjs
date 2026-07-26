/* eslint-env node */
"use strict";

const { chromium } = require("playwright-core");
const path = require("path");

let browser;

(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce"
  });
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().indexOf("Failed to load resource") < 0) consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && !/favicon\.ico(?:$|\?)/.test(response.url())) failedResources.push(response.status() + " " + response.url());
  });

  await page.goto("http://127.0.0.1:8765/tests/companion-evolution-preview.html", { waitUntil: "networkidle" });
  const preview = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".evolution-stage-card"));
    const stages = cards.reduce((counts, card) => {
      const stage = card.getAttribute("data-stage");
      counts[stage] = (counts[stage] || 0) + 1;
      return counts;
    }, {});
    return {
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      speciesRows: document.querySelectorAll(".evolution-species-row").length,
      stageCards: cards.length,
      stages,
      houseBirds: document.querySelectorAll(".preview-house-bird").length,
      minButtonHeight: Math.min(...Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height).filter((height) => height > 0)),
      emptySvgs: Array.from(document.querySelectorAll("main .companion-svg")).filter((svg) => {
        const box = svg.getBBox();
        return box.width <= 0 || box.height <= 0;
      }).length
    };
  });
  if (preview.scrollWidth > preview.viewport) throw new Error("evolution preview has horizontal overflow");
  if (preview.speciesRows !== 13 || preview.stageCards !== 39 || preview.stages["1"] !== 13 || preview.stages["2"] !== 13 || preview.stages["3"] !== 13) {
    throw new Error("evolution preview should show thirteen species in all three stages");
  }
  if (preview.houseBirds !== 13 || preview.minButtonHeight < 48 || preview.emptySvgs) throw new Error("evolution preview controls or SVGs are invalid: " + JSON.stringify(preview));
  await page.click("#show-evolution");
  await page.waitForSelector("#preview-modal.is-open");
  const previewDialog = await page.evaluate(() => ({
    open: document.getElementById("preview-modal").classList.contains("is-open"),
    role: document.querySelector(".preview-modal-card").getAttribute("role"),
    focused: document.activeElement && document.activeElement.id
  }));
  if (!previewDialog.open || previewDialog.role !== "dialog" || previewDialog.focused !== "close-evolution") throw new Error("preview evolution dialog should open with focus");
  await page.keyboard.press("Escape");
  if (await page.locator("#preview-modal.is-open").count()) throw new Error("preview evolution dialog should close with Escape");
  const previewScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p26-evolution-preview-390.png");
  await page.screenshot({ path: previewScreenshot, fullPage: true });

  await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const app = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    version: window.KodomoAdventure.constants.VERSION_LABEL,
    appVersion: window.KodomoAdventure.constants.APP_VERSION,
    speciesCount: window.KodomoAdventure.companions.allSpecies().length,
    coloringCount: window.KodomoAdventure.constants.COLORING_TEMPLATES.length,
    recoveryHidden: !document.getElementById("boot-recovery-root") || document.getElementById("boot-recovery-root").hidden,
    startupHidden: !document.getElementById("startup-splash") || document.getElementById("startup-splash").hidden
  }));
  if (app.version !== "Ver.1.0 試作26" || app.appVersion !== "1.0.0-prototype.26") throw new Error("prototype 26 version mismatch");
  if (app.speciesCount !== 13 || app.coloringCount !== 11 || app.scrollWidth > app.viewport) throw new Error("production counts or width mismatch");
  if (!app.recoveryHidden || !app.startupHidden) throw new Error("normal startup did not finish cleanly");

  const runtime = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    data.companions = [];
    KA.companions.allSpecies().forEach((species, index) => {
      const companion = KA.companions.recordHatch(data, species.id, "2026-07-26T09:00:00+09:00");
      companion.bondLevel = [1, 3, 5][index % 3];
      companion.lastSeenEvolutionStage = KA.companions.getCompanionEvolutionStage(companion);
      companion.lastFedAt = KA.date.localIsoString();
    });
    const chick = KA.companions.getCompanion(data, "companion_chick");
    chick.bondLevel = 2;
    chick.lastSeenEvolutionStage = 1;
    chick.nickname = "ぴよぴよなかよし号";
    chick.isFavorite = true;
    const beforeIdentity = {
      id: chick.id,
      speciesId: chick.speciesId,
      hatchCount: chick.hatchCount,
      mealCount: chick.mealCount,
      nickname: chick.nickname,
      favorite: chick.isFavorite
    };
    const result = KA.companions.increaseCompanionBond(chick, 1, "browser_qa");
    const today = KA.date.localDateKey();
    const record = KA.state.getDailyRecord(today);
    record.completedTasks = [{ taskId: "job_cleanup", taskTitle: "おかたづけBOXをからにする", status: "completed", completedAt: KA.date.localIsoString() }];
    data.eggSystem.dailyActivity[today] = { petted: true };
    KA.companions.ensureCompanions(data);
    KA.state.saveAppData();
    KA.state.getUiState().eggTab = "companions";
    KA.state.saveUiState();
    KA.router.navigate("home");
    return {
      result,
      beforeIdentity,
      afterIdentity: {
        id: chick.id,
        speciesId: chick.speciesId,
        hatchCount: chick.hatchCount,
        mealCount: chick.mealCount,
        nickname: chick.nickname,
        favorite: chick.isFavorite
      },
      pending: KA.companions.pendingEvolutionCompanions(data).length
    };
  });
  if (!runtime.result.evolved || runtime.result.currentStage !== 2 || runtime.pending !== 1) throw new Error("bond threshold should create one pending stage 2 evolution");
  if (JSON.stringify(runtime.beforeIdentity) !== JSON.stringify(runtime.afterIdentity)) throw new Error("evolution should preserve companion identity and saved attributes");
  await page.waitForTimeout(100);
  if (!(await page.locator("[data-show-evolution]").count())) throw new Error("home should show pending evolution notice");
  await page.click("[data-show-evolution]");
  await page.waitForSelector(".companion-evolution-modal");
  const evolutionDialog = await page.evaluate(() => ({
    label: document.querySelector(".companion-evolution-modal").innerText,
    focused: document.activeElement && document.activeElement.getAttribute("data-close-companion-evolution") !== null,
    stage: document.querySelector(".companion-evolution-modal .companion-svg").classList.contains("evolution-stage-2"),
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  if (!evolutionDialog.focused || !evolutionDialog.stage || evolutionDialog.label.indexOf("ぴよぴよなかよし号") < 0 || evolutionDialog.scrollWidth > evolutionDialog.viewport) {
    throw new Error("production evolution dialog should show nickname, stage and focus correctly");
  }
  const evolutionScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p26-evolution-dialog-390.png");
  await page.screenshot({ path: evolutionScreenshot, fullPage: true });
  await page.keyboard.press("Escape");
  const seenState = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    const chick = KA.companions.getCompanion(data, "companion_chick");
    const exported = JSON.parse(JSON.stringify(data));
    KA.state.replaceAllData(exported, KA.state.getUiState());
    return {
      pending: KA.companions.pendingEvolutionCompanions(KA.state.getAppData()).length,
      seen: chick.lastSeenEvolutionStage,
      nickname: chick.nickname,
      favorite: chick.isFavorite
    };
  });
  if (seenState.pending !== 0 || seenState.seen !== 2 || seenState.nickname !== "ぴよぴよなかよし号" || !seenState.favorite) {
    throw new Error("seen evolution and companion data should survive JSON-shaped restore");
  }

  await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    KA.state.getUiState().eggTab = "companions";
    KA.router.navigate("eggs");
  });
  await page.waitForTimeout(100);
  const dex = await page.evaluate(() => ({
    cards: document.querySelectorAll(".companion-card").length,
    statusPanels: document.querySelectorAll(".companion-evolution-status").length,
    stage2: document.querySelectorAll(".companion-svg.evolution-stage-2").length,
    stage3: document.querySelectorAll(".companion-svg.evolution-stage-3").length,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  if (dex.cards !== 13 || dex.statusPanels !== 13 || !dex.stage2 || !dex.stage3 || dex.scrollWidth > dex.viewport) throw new Error("dex should show evolution for all thirteen companions");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house", { companionId: "companion_chick" }));
  await page.waitForTimeout(120);
  const house = await page.evaluate(() => {
    const room = document.querySelector(".bird-house-room").getBoundingClientRect();
    const birds = Array.from(document.querySelectorAll(".bird-house-bird"));
    return {
      count: birds.length,
      uniqueCenters: new Set(birds.map((bird) => {
        const rect = bird.getBoundingClientRect();
        return Math.round(rect.left + rect.width / 2) + ":" + Math.round(rect.top + rect.height / 2);
      })).size,
      inside: birds.every((bird) => {
        const rect = bird.getBoundingClientRect();
        return rect.left >= room.left - 1 && rect.right <= room.right + 1 && rect.top >= room.top - 1 && rect.bottom <= room.bottom + 1;
      }),
      stage3: document.querySelectorAll(".bird-house-bird .companion-svg.evolution-stage-3").length,
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
  });
  if (house.count !== 13 || house.uniqueCenters !== 13 || !house.inside || !house.stage3 || house.scrollWidth > house.viewport) {
    throw new Error("thirteen evolved house companions should be unique and contained");
  }
  const houseScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p26-house-evolution-390.png");
  await page.screenshot({ path: houseScreenshot, fullPage: true });

  const routeChecks = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    data.kitchen = KA.kitchen.defaultKitchen();
    const cooking = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg"]);
    if (cooking.ok) {
      const steps = KA.kitchen.getRecipe("recipe_ramen").steps.length;
      for (let index = 0; index < steps; index += 1) KA.kitchen.completeCurrentStep();
    }
    KA.router.navigate("kitchen");
    return { cookingOk: cooking.ok };
  });
  await page.waitForTimeout(100);
  const kitchen = await page.evaluate(() => ({
    cards: document.querySelectorAll(".kitchen-feed-grid .companion-card").length,
    evolved: document.querySelectorAll(".kitchen-feed-grid .companion-svg.evolution-stage-2, .kitchen-feed-grid .companion-svg.evolution-stage-3").length,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  if (!routeChecks.cookingOk || kitchen.cards !== 13 || !kitchen.evolved || kitchen.scrollWidth > kitchen.viewport) throw new Error("kitchen should render evolved companions");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("outing"));
  await page.waitForTimeout(100);
  const outing = await page.evaluate(() => ({
    choices: document.querySelectorAll(".outing-companion-choice").length,
    evolved: document.querySelectorAll(".outing-companion-choice .companion-svg.evolution-stage-2, .outing-companion-choice .companion-svg.evolution-stage-3").length,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  if (outing.choices !== 13 || !outing.evolved || outing.scrollWidth > outing.viewport) throw new Error("outing should render all eligible evolved companions");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("parent"));
  await page.waitForTimeout(100);
  const parent = await page.evaluate(() => ({
    visible: Boolean(document.querySelector(".parent-screen")),
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  if (!parent.visible || parent.scrollWidth > parent.viewport) throw new Error("parent mode should remain usable at 390px");

  if (consoleErrors.length) throw new Error("browser console errors: " + consoleErrors.join(" | "));
  if (failedResources.length) throw new Error("failed browser resources: " + failedResources.join(" | "));
  console.log(JSON.stringify({
    preview,
    previewDialog,
    app,
    runtime,
    evolutionDialog,
    seenState,
    dex,
    house,
    kitchen,
    outing,
    parent,
    consoleErrors,
    failedResources,
    previewScreenshot,
    evolutionScreenshot,
    houseScreenshot
  }, null, 2));
  await browser.close();
  browser = null;
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
