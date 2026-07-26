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
    if (response.status() >= 400 && !/favicon\.ico(?:$|\?)/.test(response.url())) {
      failedResources.push(response.status() + " " + response.url());
    }
  });

  await page.goto("http://127.0.0.1:8765/tests/legend-companions-coloring-preview.html", { waitUntil: "networkidle" });
  const preview = await page.evaluate(() => {
    const editor = document.querySelector("#coloring-editor");
    const editorRegions = Array.from(editor.querySelectorAll(".color-region")).map((region) => region.getAttribute("data-region-id"));
    const birdSvgs = Array.from(document.querySelectorAll(".bird-art .companion-svg")).map((svg) => {
      const box = svg.getBBox();
      return { width: box.width, height: box.height };
    });
    return {
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      buttons: Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height),
      editorRegionCount: editorRegions.length,
      uniqueEditorRegionCount: new Set(editorRegions).size,
      birdSvgs
    };
  });
  if (preview.scrollWidth > preview.viewport) throw new Error("legend preview has horizontal overflow");
  if (Math.min(...preview.buttons) < 48) throw new Error("legend preview button height should be at least 48px");
  if (preview.editorRegionCount !== 15 || preview.uniqueEditorRegionCount !== 15) throw new Error("electric mouse editor should expose fifteen unique regions");
  if (preview.birdSvgs.some((box) => box.width <= 0 || box.height <= 0)) throw new Error("legend bird SVG should have visible content");
  const previewScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p25-preview-390.png");
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
  if (app.scrollWidth > app.viewport) throw new Error("production app has horizontal overflow at 390px");
  if (app.version !== "Ver.1.0 試作25" || app.appVersion !== "1.0.0-prototype.25") throw new Error("prototype 25 version mismatch");
  if (app.speciesCount !== 13 || app.coloringCount !== 11) throw new Error("formal character counts mismatch");
  if (!app.recoveryHidden || !app.startupHidden) throw new Error("normal startup did not finish cleanly");

  const runtime = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    data.companions = [];
    KA.companions.allSpecies().forEach((species) => {
      const companion = KA.companions.recordHatch(data, species.id, "2026-07-26T09:00:00+09:00");
      companion.lastFedAt = KA.date.localIsoString();
    });
    KA.companions.setFavorite("companion_thunder_legend_bird", true);
    KA.companions.setCompanionNickname("companion_thunder_legend_bird", "らいとらいとらいと");
    data.kitchen = KA.kitchen.defaultKitchen();
    const cooking = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg"], "companion_fire_legend_bird");
    if (cooking.ok) {
      const stepCount = KA.kitchen.getRecipe("recipe_ramen").steps.length;
      for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) KA.kitchen.completeCurrentStep();
    }
    const kitchenFeed = cooking.ok ? KA.kitchen.feedCompletedCooking("companion_fire_legend_bird") : { ok: false };
    data.unlocks.coloringTemplateIds = data.unlocks.coloringTemplateIds || [];
    if (!data.unlocks.coloringTemplateIds.some((item) => item && item.templateId === "coloring_electric_mouse")) {
      data.unlocks.coloringTemplateIds.push({
        templateId: "coloring_electric_mouse",
        unlockedAt: KA.date.localIsoString(),
        paidStars: 0,
        ledgerId: "qa_unlock"
      });
    }
    KA.companions.ensureCompanions(data);
    KA.state.saveAppData();
    KA.state.getUiState().eggTab = "companions";
    KA.state.saveUiState();
    KA.router.navigate("eggs");
    return {
      displayName: KA.companions.getCompanionDisplayName(KA.companions.getCompanion(data, "companion_thunder_legend_bird")),
      favoriteSpeciesId: (KA.companions.favoriteCompanion(data) || {}).speciesId || null,
      kitchenFeedOk: kitchenFeed.ok,
      fireMealCount: Number((KA.companions.getCompanion(data, "companion_fire_legend_bird") || {}).mealCount || 0),
      eligibleOutingIds: KA.outings.eligibleCompanions(data, KA.date.localDateKey()).map((companion) => companion.speciesId)
    };
  });
  if (runtime.displayName !== "らいとらいとらいと") throw new Error("new legend bird should use shared nickname display");
  if (runtime.favoriteSpeciesId !== "companion_thunder_legend_bird") throw new Error("new legend bird should use shared favorite setting");
  if (!runtime.kitchenFeedOk || runtime.fireMealCount !== 1) throw new Error("new legend bird should use shared kitchen feeding");
  if (runtime.eligibleOutingIds.indexOf("companion_thunder_legend_bird") < 0 || runtime.eligibleOutingIds.indexOf("companion_fire_legend_bird") < 0) {
    throw new Error("new legend birds should be eligible for outings after today's meal");
  }
  await page.waitForTimeout(100);
  const albumLayout = await page.evaluate(() => ({
    count: document.querySelectorAll(".companion-card").length,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    text: document.body.innerText
  }));
  if (albumLayout.count !== 13) throw new Error("companion album should show thirteen cards");
  if (albumLayout.scrollWidth > albumLayout.viewport) throw new Error("companion album has horizontal overflow");
  if (albumLayout.text.indexOf("でんせつの かみなりのとり") < 0 || albumLayout.text.indexOf("でんせつの ほのおのとり") < 0) {
    throw new Error("companion album should show both formal names");
  }

  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house", { companionId: "companion_thunder_legend_bird" }));
  await page.waitForTimeout(150);
  const house = await page.evaluate(() => {
    const room = document.querySelector(".bird-house-room").getBoundingClientRect();
    const birds = Array.from(document.querySelectorAll(".bird-house-bird")).map((bird) => {
      const rect = bird.getBoundingClientRect();
      return {
        id: bird.getAttribute("data-house-bird"),
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        center: Math.round(rect.left + rect.width / 2) + ":" + Math.round(rect.top + rect.height / 2)
      };
    });
    return {
      count: birds.length,
      uniqueCenters: new Set(birds.map((bird) => bird.center)).size,
      inside: birds.every((bird) => bird.left >= room.left - 1 && bird.right <= room.right + 1 && bird.top >= room.top - 1 && bird.bottom <= room.bottom + 1),
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
  });
  if (house.count !== 13 || house.uniqueCenters !== 13 || !house.inside) throw new Error("thirteen-bird fixed house layout should be unique and contained");
  if (house.scrollWidth > house.viewport) throw new Error("bird house has horizontal overflow");
  const houseScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p25-house-13-390.png");
  await page.screenshot({ path: houseScreenshot, fullPage: true });

  await page.evaluate(() => window.KodomoAdventure.router.navigate("coloring-list"));
  await page.waitForTimeout(100);
  const coloringList = await page.evaluate(() => ({
    count: document.querySelectorAll(".coloring-card").length,
    hasElectricMouse: document.body.innerText.indexOf("びりびり ねずみ") >= 0,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  if (coloringList.count !== 11 || !coloringList.hasElectricMouse) throw new Error("coloring list should show eleven templates including electric mouse");
  if (coloringList.scrollWidth > coloringList.viewport) throw new Error("coloring list has horizontal overflow");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("coloring-editor", { templateId: "coloring_electric_mouse" }));
  await page.waitForTimeout(100);
  const editor = await page.evaluate(() => ({
    regionCount: document.querySelectorAll("#editor-canvas .color-region").length,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    navOverlap: (() => {
      const nav = document.querySelector(".bottom-nav");
      const canvas = document.querySelector(".editor-canvas");
      if (!nav || !canvas) return false;
      return canvas.getBoundingClientRect().bottom > nav.getBoundingClientRect().top && canvas.getBoundingClientRect().top < nav.getBoundingClientRect().bottom;
    })()
  }));
  if (editor.regionCount !== 15) throw new Error("production electric mouse editor should show fifteen regions");
  if (editor.scrollWidth > editor.viewport || editor.navOverlap) throw new Error("coloring editor should fit above bottom navigation");
  await page.click('#editor-canvas [data-region-id="belly"].color-region');
  await page.waitForTimeout(80);
  const artwork = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const result = KA.coloring.createArtwork("coloring_electric_mouse", {
      body: "#9AD4C8",
      belly: "#FFF4C9",
      left_cheek_star: "#F7CF67",
      right_cheek_star: "#F7CF67",
      tail: "#78B6C8",
      tail_spark: "#F7CF67"
    });
    KA.router.navigate("album");
    return { ok: result.ok, id: result.ok && result.artwork.artworkId };
  });
  await page.waitForTimeout(100);
  if (!artwork.ok || !(await page.locator(".art-card").count())) throw new Error("electric mouse artwork should save and render in album");
  const albumOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (albumOverflow) throw new Error("artwork album has horizontal overflow");

  if (consoleErrors.length) throw new Error("browser console errors: " + consoleErrors.join(" | "));
  if (failedResources.length) throw new Error("failed browser resources: " + failedResources.join(" | "));
  console.log(JSON.stringify({
    preview,
    app,
    runtime,
    albumLayout: { count: albumLayout.count, viewport: albumLayout.viewport, scrollWidth: albumLayout.scrollWidth },
    house,
    coloringList,
    editor,
    artwork,
    consoleErrors,
    failedResources,
    previewScreenshot,
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
