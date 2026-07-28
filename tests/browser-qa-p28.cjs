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

  await page.goto(baseUrl + "/tests/bird-companion-review.html", { waitUntil: "networkidle" });
  const review = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll("svg"));
    const invalid = svgs.filter((svg) => {
      const box = svg.getBBox();
      return box.width <= 0 || box.height <= 0;
    }).length;
    const buttonHeights = Array.from(document.querySelectorAll("button"))
      .map((button) => button.getBoundingClientRect().height)
      .filter((height) => height > 0);
    return {
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      candidateCards: document.querySelectorAll(".candidate-card").length,
      comparisonPanels: document.querySelectorAll("#thunder-comparison .panel").length,
      featureCards: document.querySelectorAll("#new-birds .feature-card").length,
      tinyViews: document.querySelectorAll(".view-size-80").length,
      silhouettes: document.querySelectorAll(".view-silhouette").length,
      invalid,
      minButtonHeight: Math.min(...buttonHeights),
      hasPhoenix: document.body.textContent.indexOf("ほうおう") >= 0,
      hasQuetzal: document.body.textContent.indexOf("ケツァール") >= 0
    };
  });
  assert(review.scrollWidth <= review.viewport, "bird review has horizontal overflow");
  assert(review.candidateCards === 15 && review.comparisonPanels === 2 && review.featureCards === 2, "bird review should show the complete comparison and fifteen candidates");
  assert(review.tinyViews >= 4 && review.silhouettes >= 4 && review.invalid === 0, "bird review size or silhouette renders are incomplete");
  assert(review.minButtonHeight >= 48 && review.hasPhoenix && review.hasQuetzal, "bird review controls or names are invalid");
  const reviewScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p28-bird-review-390.png");
  await page.screenshot({ path: reviewScreenshot, fullPage: true });

  await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const seeded = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    const today = KA.date.localDateKey();
    data.companions = [];
    KA.companions.allSpecies().forEach((species, index) => {
      const companion = KA.companions.recordHatch(data, species.id, "2026-07-27T09:00:00+09:00");
      companion.bondLevel = [1, 3, 5][index % 3];
      companion.lastSeenEvolutionStage = KA.companions.getCompanionEvolutionStage(companion);
      companion.lastFedAt = KA.date.localIsoString();
      companion.lastBondMealDate = today;
      companion.mealCount = index + 1;
      companion.isFavorite = species.id === "companion_phoenix";
    });
    const phoenix = KA.companions.getCompanion(data, "companion_phoenix");
    phoenix.nickname = "ひかりのほうおう";
    phoenix.bondLevel = 5;
    phoenix.lastSeenEvolutionStage = 3;
    const record = KA.state.getDailyRecord(today);
    record.completedTasks = [{
      taskId: "job_cleanup",
      taskTitle: "おかたづけBOXをからにする",
      status: "completed",
      completedAt: KA.date.localIsoString()
    }];
    data.eggSystem.dailyActivity[today] = { petted: true };
    data.outing = KA.outings.defaultOuting();
    data.kitchen = KA.kitchen.defaultKitchen();
    const cooking = KA.kitchen.startCooking("recipe_ramen", ["ingredient_noodles", "ingredient_egg"], "companion_chick");
    if (cooking.ok) {
      const steps = KA.kitchen.getRecipe("recipe_ramen").steps.length;
      for (let index = 0; index < steps; index += 1) KA.kitchen.completeCurrentStep();
    }
    const ui = KA.state.getUiState();
    ui.eggTab = "companions";
    ui.selectedCompanionId = null;
    ui.kitchenPreselectedCompanionId = null;
    KA.state.saveAppData();
    KA.state.saveUiState();
    KA.router.navigate("home");
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-9999px;top:0;width:300px";
    host.innerHTML = [
      KA.companions.renderCompanion("companion_thunder_legend_bird", { stage: 1 }),
      KA.companions.renderCompanion("companion_phoenix", { stage: 2 }),
      KA.companions.renderCompanion("companion_quetzal", { stage: 3 })
    ].join("");
    document.body.appendChild(host);
    const boxes = Array.from(host.querySelectorAll("svg")).map((svg) => {
      const box = svg.getBBox();
      return { width: box.width, height: box.height };
    });
    host.remove();
    return {
      version: KA.constants.APP_VERSION,
      label: KA.constants.VERSION_LABEL,
      speciesCount: KA.companions.allSpecies().length,
      thunderVersion: KA.companions.getSpecies("companion_thunder_legend_bird").designVersion,
      phoenixName: KA.companions.getSpecies("companion_phoenix").name,
      quetzalName: KA.companions.getSpecies("companion_quetzal").name,
      boxes
    };
  });
  assert(seeded.version === "1.0.0-prototype.28" && seeded.label === "Ver.1.0 試作28", "prototype 28 version mismatch");
  assert(seeded.speciesCount === 15 && seeded.thunderVersion === 2, "prototype 28 species count or thunder version mismatch");
  assert(seeded.phoenixName === "ほうおう" && seeded.quetzalName === "ケツァール", "new species names mismatch");
  assert(seeded.boxes.every((box) => box.width > 0 && box.height > 0), "new production SVGs should have visible bounds");

  const home = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    statusEntries: document.querySelectorAll(".companion-status-item[data-companion-detail]").length,
    heroId: document.querySelector(".home-hero [data-companion-detail]")?.getAttribute("data-companion-detail"),
    heroName: document.querySelector(".home-hero")?.textContent
  }));
  assert(home.scrollWidth <= home.viewport && home.statusEntries === 15, "home should show fifteen companions without horizontal overflow");
  assert(home.heroId === "companion_phoenix" && home.heroName.indexOf("ひかりのほうおう") >= 0, "home should use the favorite phoenix through shared display logic");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("eggs"));
  await page.waitForTimeout(100);
  const dex = await page.evaluate(() => ({
    cards: document.querySelectorAll(".companion-card").length,
    phoenix: Boolean(document.querySelector('[data-companion-detail="companion_phoenix"]')),
    quetzal: Boolean(document.querySelector('[data-companion-detail="companion_quetzal"]')),
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(dex.cards === 15 && dex.phoenix && dex.quetzal && dex.scrollWidth <= dex.viewport, "dex should show all fifteen companions");

  await page.click('[data-companion-detail="companion_phoenix"]');
  await page.waitForTimeout(80);
  const detail = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    name: document.querySelector("#companion-detail-name")?.textContent.trim(),
    selected: window.KodomoAdventure.state.getUiState().selectedCompanionId,
    evolved: Boolean(document.querySelector(".companion-detail-art .evolution-stage-3")),
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(detail.route === "companion-detail" && detail.name === "ひかりのほうおう" && detail.selected === "companion_phoenix", "phoenix detail should preserve companionId and nickname");
  assert(detail.evolved && detail.scrollWidth <= detail.viewport, "phoenix detail should show its calculated stage without overflow");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house", { companionId: "companion_phoenix" }));
  await page.waitForTimeout(100);
  const house = await page.evaluate(() => {
    const birds = Array.from(document.querySelectorAll(".bird-house-bird"));
    const positions = birds.map((bird) => bird.style.left + ":" + bird.style.top);
    return {
      birds: birds.length,
      uniquePositions: new Set(positions).size,
      phoenix: Boolean(document.querySelector('[data-house-bird="companion_phoenix"]')),
      quetzal: Boolean(document.querySelector('[data-house-bird="companion_quetzal"]')),
      thunder: Boolean(document.querySelector('[data-house-bird="companion_thunder_legend_bird"]')),
      stage3: document.querySelectorAll(".bird-house-bird .evolution-stage-3").length,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });
  assert(house.birds === 15 && house.uniquePositions === 15, "bird house should render fifteen fixed unique positions");
  assert(house.phoenix && house.quetzal && house.thunder && house.stage3 > 0, "bird house should render the redesigned and new companions with evolution");
  assert(house.scrollWidth <= house.viewport, "bird house has horizontal overflow");
  const houseScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p28-house-15-birds-390.png");
  await page.screenshot({ path: houseScreenshot, fullPage: true });

  await page.evaluate(() => window.KodomoAdventure.app.openCompanionDetail("companion_quetzal"));
  await page.waitForTimeout(80);
  await page.click("[data-detail-kitchen]");
  await page.waitForTimeout(100);
  const kitchen = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    selected: document.querySelector(".kitchen-feed-choice.is-selected")?.getAttribute("data-select-kitchen-companion"),
    cards: document.querySelectorAll(".kitchen-feed-choice").length,
    quetzalSvg: Boolean(document.querySelector('[data-select-kitchen-companion="companion_quetzal"] .companion-quetzal')),
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(kitchen.route === "kitchen" && kitchen.selected === "companion_quetzal", "detail should preselect quetzal in kitchen");
  assert(kitchen.cards === 15 && kitchen.quetzalSvg && kitchen.scrollWidth <= kitchen.viewport, "kitchen should render all fifteen companions without overflow");

  await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    KA.app.openCompanionDetail("companion_quetzal");
  });
  await page.waitForTimeout(80);
  await page.click("[data-detail-outing]");
  await page.waitForTimeout(100);
  const outing = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    choices: document.querySelectorAll(".outing-companion-choice").length,
    selected: document.querySelector(".outing-companion-choice.is-selected")?.getAttribute("data-outing-companion"),
    phoenix: Boolean(document.querySelector('[data-outing-companion="companion_phoenix"]')),
    quetzal: Boolean(document.querySelector('[data-outing-companion="companion_quetzal"]')),
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(outing.route === "outing" && outing.choices === 15, "outing should list all fifteen fed companions");
  assert(outing.selected === "companion_quetzal" && outing.phoenix && outing.quetzal, "outing should preselect quetzal and include both new companions");
  assert(outing.scrollWidth <= outing.viewport, "outing has horizontal overflow");

  assert(consoleErrors.length === 0, "browser console errors: " + consoleErrors.join(" | "));
  assert(failedResources.length === 0, "browser resource failures: " + failedResources.join(" | "));
  console.log(JSON.stringify({
    ok: true,
    review,
    seeded,
    home,
    dex,
    detail,
    house,
    kitchen,
    outing,
    reviewScreenshot,
    houseScreenshot
  }, null, 2));
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});
