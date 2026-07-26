/* eslint-env node */
"use strict";

const { chromium } = require("playwright-core");
const fs = require("fs");
const http = require("http");
const path = require("path");

let browser;
let server;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const root = path.resolve(__dirname, "..");
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(root, relative);
    if (filePath !== root && filePath.indexOf(root + path.sep) !== 0) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, bytes) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const extension = path.extname(filePath).toLowerCase();
      const contentType = extension === ".html" ? "text/html; charset=utf-8"
        : extension === ".js" || extension === ".cjs" ? "text/javascript; charset=utf-8"
          : extension === ".css" ? "text/css; charset=utf-8"
            : extension === ".webmanifest" || extension === ".json" ? "application/json; charset=utf-8"
              : extension === ".png" ? "image/png"
                : "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType });
      response.end(bytes);
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const baseUrl = "http://127.0.0.1:" + server.address().port;
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
    if (response.status() >= 400 && !/favicon\.ico(?:$|\?)/.test(response.url())) {
      failedResources.push(response.status() + " " + response.url());
    }
  });

  await page.goto(baseUrl + "/tests/companion-care-flow-preview.html", { waitUntil: "networkidle" });
  const preview = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    screens: document.querySelectorAll(".preview-screen").length,
    detailGroups: document.querySelectorAll('[data-screen="detail"] .companion-action-group').length,
    minButtonHeight: Math.min(...Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height).filter((height) => height > 0)),
    selectedFeedCards: document.querySelectorAll(".kitchen-feed-choice.is-selected").length,
    stageBirds: document.querySelectorAll("#preview-stage-grid .companion-svg").length,
    newIceName: document.body.textContent.indexOf("でんせつのこおりのとり") >= 0,
    oldIceName: document.body.textContent.indexOf("こおりの でんせつどり") >= 0
  }));
  assert(preview.scrollWidth <= preview.viewport, "care preview has horizontal overflow");
  assert(preview.screens === 4 && preview.detailGroups === 4, "care preview should show four screens and four detail groups");
  assert(preview.minButtonHeight >= 48 && preview.selectedFeedCards === 1 && preview.stageBirds === 3, "care preview controls or stages are incomplete");
  assert(preview.newIceName && !preview.oldIceName, "care preview should use the new ice bird name");
  const previewScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p27-care-preview-390.png");
  await page.screenshot({ path: previewScreenshot, fullPage: true });

  await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const seeded = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    const today = KA.date.localDateKey();
    data.companions = [];
    KA.companions.allSpecies().forEach((species, index) => {
      const companion = KA.companions.recordHatch(data, species.id, "2026-07-26T09:00:00+09:00");
      companion.bondLevel = [1, 3, 5][index % 3];
      companion.lastSeenEvolutionStage = KA.companions.getCompanionEvolutionStage(companion);
      companion.lastFedAt = index ? KA.date.localIsoString() : null;
      companion.lastBondMealDate = index ? today : null;
    });
    const penguin = KA.companions.getCompanion(data, "companion_penguin");
    penguin.bondLevel = 2;
    penguin.bondMealProgress = 2;
    penguin.lastBondMealDate = "2000-01-01";
    penguin.lastFedAt = null;
    penguin.lastSeenEvolutionStage = 1;
    penguin.nickname = "ぺんちゃん";
    penguin.isFavorite = true;
    const chick = KA.companions.getCompanion(data, "companion_chick");
    chick.mealCount = 0;
    data.outing = KA.outings.defaultOuting();
    data.kitchen = KA.kitchen.defaultKitchen();
    const cooking = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg"], "companion_chick");
    if (cooking.ok) {
      const stepCount = KA.kitchen.getRecipe("recipe_ramen").steps.length;
      for (let index = 0; index < stepCount; index += 1) KA.kitchen.completeCurrentStep();
    }
    const record = KA.state.getDailyRecord(today);
    record.completedTasks = [{
      taskId: "job_cleanup",
      taskTitle: "おかたづけBOXをからにする",
      status: "completed",
      completedAt: KA.date.localIsoString()
    }];
    data.eggSystem.dailyActivity[today] = { petted: true };
    const ui = KA.state.getUiState();
    ui.selectedCompanionId = null;
    ui.kitchenPreselectedCompanionId = null;
    ui.eggTab = "companions";
    KA.state.saveAppData();
    KA.state.saveUiState();
    KA.router.navigate("home");
    return {
      version: KA.constants.APP_VERSION,
      label: KA.constants.VERSION_LABEL,
      speciesCount: KA.companions.allSpecies().length,
      coloringCount: KA.constants.COLORING_TEMPLATES.length,
      iceName: KA.companions.getSpecies("companion_ice_legend_bird").name,
      cookingPreselected: data.kitchen.currentCooking.preselectedCompanionId
    };
  });
  assert(seeded.version === "1.0.0-prototype.27" && seeded.label === "Ver.1.0 試作27", "prototype 27 version mismatch");
  assert(seeded.speciesCount === 13 && seeded.coloringCount === 11, "existing content counts changed");
  assert(seeded.iceName === "でんせつのこおりのとり", "ice bird species name was not updated");
  assert(seeded.cookingPreselected === "companion_chick", "QA setup should begin with stale chick cooking selection");

  const home = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroActions: document.querySelectorAll(".home-hero button").length,
    heroDetailId: document.querySelector(".home-hero [data-companion-detail]")?.getAttribute("data-companion-detail"),
    statusEntries: document.querySelectorAll(".companion-status-item[data-companion-detail]").length,
    duplicateFavoriteCard: document.querySelectorAll(".companion-home-card").length
  }));
  assert(home.scrollWidth <= home.viewport && home.heroActions === 1 && home.heroDetailId === "companion_penguin", "home should have one representative action for the favorite bird");
  assert(home.statusEntries === 13 && home.duplicateFavoriteCard === 0, "home companion status should be the single comparison entry");
  await page.click('.home-hero [data-companion-detail="companion_penguin"]');
  await page.waitForTimeout(80);

  const detailBefore = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    return {
      route: KA.router.getCurrent().name,
      selectedId: KA.state.getUiState().selectedCompanionId,
      name: document.querySelector("#companion-detail-name")?.textContent.trim(),
      groups: document.querySelectorAll(".companion-action-group").length,
      careButtons: document.querySelectorAll("[data-detail-kitchen]").length,
      careDisabled: document.querySelector("[data-detail-kitchen]")?.disabled,
      buttonLabels: Array.from(document.querySelectorAll(".companion-action-group button")).map((button) => button.textContent.trim()),
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });
  assert(detailBefore.route === "companion-detail" && detailBefore.selectedId === "companion_penguin" && detailBefore.name === "ぺんちゃん", "home should open the selected companion detail");
  assert(detailBefore.groups === 4 && detailBefore.careButtons === 1 && !detailBefore.careDisabled, "companion detail action groups are incomplete");
  assert(new Set(detailBefore.buttonLabels).size === detailBefore.buttonLabels.length && detailBefore.scrollWidth <= detailBefore.viewport, "detail buttons should not duplicate or overflow");
  await page.click("[data-detail-kitchen]");
  await page.waitForTimeout(80);

  const kitchenSelected = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const selected = document.querySelector(".kitchen-feed-choice.is-selected");
    return {
      route: KA.router.getCurrent().name,
      selectedId: KA.state.getUiState().selectedCompanionId,
      uiPreselected: KA.state.getUiState().kitchenPreselectedCompanionId,
      cookingPreselected: KA.state.getAppData().kitchen.currentCooking.preselectedCompanionId,
      selectedCards: document.querySelectorAll(".kitchen-feed-choice.is-selected").length,
      selectedName: selected && selected.querySelector("h3").textContent.trim(),
      feedButtons: document.querySelectorAll("[data-feed-selected-companion]").length,
      settingButtons: document.querySelectorAll("[data-edit-companion-nickname], [data-detail-favorite], [data-detail-outing]").length,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });
  assert(kitchenSelected.route === "kitchen" && kitchenSelected.selectedId === "companion_penguin", "detail should pass companionId to kitchen");
  assert(kitchenSelected.uiPreselected === "companion_penguin" && kitchenSelected.cookingPreselected === "companion_penguin", "explicit selection should replace stale cooking companionId");
  assert(kitchenSelected.selectedCards === 1 && kitchenSelected.selectedName === "ぺんちゃん" && kitchenSelected.feedButtons === 1, "kitchen should show one explicit selected companion and one feed action");
  assert(kitchenSelected.settingButtons === 0 && kitchenSelected.scrollWidth <= kitchenSelected.viewport, "kitchen should not duplicate companion settings or overflow");

  const beforeMeal = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const penguin = KA.companions.getCompanion(KA.state.getAppData(), "companion_penguin");
    const chick = KA.companions.getCompanion(KA.state.getAppData(), "companion_chick");
    return { penguinMeal: penguin.mealCount, penguinBond: penguin.bondLevel, chickMeal: chick.mealCount };
  });
  await page.evaluate(() => {
    const button = document.querySelector("[data-feed-selected-companion]");
    button.click();
    button.click();
  });
  await page.waitForSelector(".kitchen-meal-result-modal");
  const mealResult = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const penguin = KA.companions.getCompanion(KA.state.getAppData(), "companion_penguin");
    const chick = KA.companions.getCompanion(KA.state.getAppData(), "companion_chick");
    return {
      mealDialogs: document.querySelectorAll(".kitchen-meal-result-modal").length,
      evolutionDialogs: document.querySelectorAll(".companion-evolution-modal").length,
      penguinMeal: penguin.mealCount,
      penguinBond: penguin.bondLevel,
      penguinStage: KA.companions.getCompanionEvolutionStage(penguin),
      lastFedToday: String(penguin.lastFedAt || "").slice(0, 10) === KA.date.localDateKey(),
      chickMeal: chick.mealCount,
      cooking: KA.state.getAppData().kitchen.currentCooking
    };
  });
  assert(mealResult.mealDialogs === 1 && mealResult.evolutionDialogs === 0, "meal result must appear before evolution");
  assert(mealResult.penguinMeal === beforeMeal.penguinMeal + 1 && mealResult.penguinBond === 3 && mealResult.penguinStage === 2, "one meal should update the selected companion and cross the existing threshold");
  assert(mealResult.lastFedToday && mealResult.chickMeal === beforeMeal.chickMeal && mealResult.cooking === null, "meal should update lastFedAt once without affecting another bird");
  await page.click("[data-meal-result-continue]");
  await page.waitForSelector(".companion-evolution-modal");
  const evolution = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    detailName: document.querySelector("#companion-detail-name")?.textContent.trim(),
    modalName: document.querySelector(".companion-evolution-modal")?.innerText,
    stage2: Boolean(document.querySelector(".companion-evolution-modal .evolution-stage-2"))
  }));
  assert(evolution.route === "companion-detail" && evolution.detailName === "ぺんちゃん" && evolution.modalName.indexOf("ぺんちゃん") >= 0 && evolution.stage2, "meal should return to detail and then show one stage 2 evolution");
  await page.keyboard.press("Escape");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const reloaded = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const penguin = KA.companions.getCompanion(KA.state.getAppData(), "companion_penguin");
    return {
      route: KA.router.getCurrent().name,
      selectedId: KA.state.getUiState().selectedCompanionId,
      mealCount: penguin.mealCount,
      bondLevel: penguin.bondLevel,
      lastSeen: penguin.lastSeenEvolutionStage,
      pending: KA.companions.pendingEvolutionCompanions(KA.state.getAppData()).length
    };
  });
  assert(reloaded.route === "companion-detail" && reloaded.selectedId === "companion_penguin", "selected companion should survive reload on detail");
  assert(reloaded.mealCount === beforeMeal.penguinMeal + 1 && reloaded.bondLevel === 3 && reloaded.lastSeen === 2 && reloaded.pending === 0, "meal and seen evolution must persist without duplication");

  await page.click("[data-edit-companion-nickname]");
  await page.fill("[data-companion-nickname-input]", "ぺんちゃん27");
  await page.click("[data-save-companion-nickname]");
  await page.waitForTimeout(80);
  assert((await page.locator("#companion-detail-name").textContent()).trim() === "ぺんちゃん27", "nickname should update from detail");
  await page.click("[data-detail-favorite]");
  await page.waitForTimeout(80);
  const favoriteAfter = await page.evaluate(() => window.KodomoAdventure.companions.getCompanion(window.KodomoAdventure.state.getAppData(), "companion_penguin").isFavorite);
  assert(favoriteAfter === false, "favorite should update from detail without changing selected ID");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("home"));
  await page.waitForTimeout(80);
  await page.click('.companion-status-item[data-companion-detail="companion_fire_legend_bird"]');
  assert((await page.evaluate(() => window.KodomoAdventure.state.getUiState().selectedCompanionId)) === "companion_fire_legend_bird", "status card should open its own companion");
  await page.click("[data-companion-detail-back]");
  await page.waitForTimeout(100);
  assert((await page.evaluate(() => window.KodomoAdventure.router.getCurrent().name)) === "home", "detail back should return to home");

  await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    KA.state.getUiState().eggTab = "companions";
    KA.state.saveUiState();
    KA.router.navigate("eggs");
  });
  await page.click('.companion-card-button[data-companion-detail="companion_ice_legend_bird"]');
  const iceDetail = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    speciesText: document.querySelector(".companion-detail-summary").innerText,
    selectedId: window.KodomoAdventure.state.getUiState().selectedCompanionId
  }));
  assert(iceDetail.route === "companion-detail" && iceDetail.selectedId === "companion_ice_legend_bird", "dex card should open ice companion detail by ID");
  assert(iceDetail.speciesText.indexOf("でんせつのこおりのとり") >= 0 && iceDetail.speciesText.indexOf("こおりの でんせつどり") < 0, "detail should use the new ice bird display name");
  await page.click("[data-companion-detail-back]");
  await page.waitForTimeout(100);
  assert((await page.evaluate(() => window.KodomoAdventure.router.getCurrent().name)) === "eggs", "detail back should return to dex");

  await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const chick = KA.companions.getCompanion(KA.state.getAppData(), "companion_chick");
    chick.lastFedAt = KA.date.localIsoString();
    chick.lastBondMealDate = KA.date.localDateKey();
    KA.state.saveAppData();
  });
  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house", { companionId: "companion_chick" }));
  await page.waitForTimeout(100);
  const houseBefore = await page.evaluate(() => ({
    birds: document.querySelectorAll(".bird-house-bird").length,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(houseBefore.birds === 13 && houseBefore.scrollWidth <= houseBefore.viewport, "bird house should keep thirteen birds without overflow");
  await page.click('[data-house-bird="companion_chick"]');
  await page.waitForTimeout(80);
  assert((await page.evaluate(() => window.KodomoAdventure.router.getCurrent().name)) === "companion-detail", "house bird tap should open detail");
  assert((await page.evaluate(() => window.KodomoAdventure.state.getUiState().selectedCompanionId)) === "companion_chick", "house should preserve the tapped companionId");

  await page.click("[data-detail-outing]");
  await page.waitForTimeout(100);
  const outingSelection = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    selected: document.querySelector('[data-outing-companion="companion_chick"]')?.getAttribute("aria-pressed"),
    settingButtons: document.querySelectorAll("[data-edit-companion-nickname], [data-detail-favorite], [data-detail-kitchen]").length,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(outingSelection.route === "outing" && outingSelection.selected === "true", "detail should preselect the same eligible bird for outing");
  assert(outingSelection.settingButtons === 0 && outingSelection.scrollWidth <= outingSelection.viewport, "outing should not contain unrelated settings or overflow");

  const stateChecks = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    data.outing.activeTrip = {
      tripId: "outing_browser_p27",
      companionId: "companion_chick",
      speciesId: "companion_chick",
      destinationId: "outing_meadow",
      departedDateKey: KA.date.localDateKey(),
      returnDateKey: KA.outings.nextDateKey(KA.date.localDateKey()),
      status: "traveling",
      rewardPlan: { type: "stars", amount: 2 },
      createdAt: KA.date.localIsoString(),
      claimedAt: null
    };
    KA.state.saveAppData();
    const exactTraveling = KA.app.companionIsTraveling(data, "companion_chick") && !KA.app.companionIsTraveling(data, "companion_penguin");
    const checks = {};
    [
      ["companion_chick", 1],
      ["companion_penguin", 3],
      ["companion_fire_legend_bird", 5]
    ].forEach(([id, level]) => {
      const companion = KA.companions.getCompanion(data, id);
      companion.bondLevel = level;
      KA.router.navigate("companion-detail", { companionId: id });
      checks[id] = {
        stage: KA.companions.getCompanionEvolutionStage(companion),
        careEnabled: !document.querySelector("[data-detail-kitchen]").disabled,
        travelingText: document.querySelector(".companion-detail-state").innerText
      };
    });
    data.outing.activeTrip.status = "returned";
    KA.router.navigate("companion-detail", { companionId: "companion_chick" });
    const returnedText = document.querySelector(".companion-detail-state").innerText;
    KA.state.saveAppData();
    return { exactTraveling, checks, returnedText };
  });
  assert(stateChecks.exactTraveling, "traveling state must be companionId-specific");
  assert(stateChecks.checks.companion_chick.stage === 1 && stateChecks.checks.companion_penguin.stage === 2 && stateChecks.checks.companion_fire_legend_bird.stage === 3, "stage 1-3 should remain available");
  assert(Object.values(stateChecks.checks).every((item) => item.careEnabled), "existing kitchen behavior should allow care at every stage, including traveling");
  assert(stateChecks.returnedText.indexOf("かえってきたよ") >= 0, "returned companion state should be explicit");

  const finalAudit = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const source = document.documentElement.innerHTML;
    const buttons = Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height).filter((height) => height > 0);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      minButtonHeight: Math.min(...buttons),
      selectedId: KA.state.getUiState().selectedCompanionId,
      speciesCount: KA.companions.allSpecies().length,
      coloringCount: KA.constants.COLORING_TEMPLATES.length,
      peacockVersion: KA.companions.getSpecies("companion_peacock").designVersion,
      chickOutline: KA.companions.getSpecies("companion_chick").outlineStroke,
      oldIceNameVisible: source.indexOf("こおりの でんせつどり") >= 0
    };
  });
  assert(finalAudit.scrollWidth <= finalAudit.viewport && finalAudit.minButtonHeight >= 48, "final detail screen should fit 390px with accessible buttons");
  assert(finalAudit.speciesCount === 13 && finalAudit.coloringCount === 11 && finalAudit.peacockVersion === 4 && finalAudit.chickOutline === "none", "protected content changed");
  assert(!finalAudit.oldIceNameVisible, "old ice bird display name remains in production DOM");
  assert(consoleErrors.length === 0, "browser console errors: " + consoleErrors.join(" | "));
  assert(failedResources.length === 0, "failed browser resources: " + failedResources.join(" | "));

  const detailScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p27-companion-detail-390.png");
  await page.screenshot({ path: detailScreenshot, fullPage: true });
  console.log(JSON.stringify({
    preview,
    seeded,
    home,
    detailBefore,
    kitchenSelected,
    beforeMeal,
    mealResult,
    evolution,
    reloaded,
    iceDetail,
    houseBefore,
    outingSelection,
    stateChecks,
    finalAudit,
    consoleErrors,
    failedResources,
    previewScreenshot,
    detailScreenshot
  }, null, 2));
  await browser.close();
  browser = null;
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});
