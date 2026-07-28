/* eslint-env node */
"use strict";

const { chromium } = require("playwright-core");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

let browser;
let server;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".cjs") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".webmanifest" || extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".png") return "image/png";
  return "application/octet-stream";
}

(async () => {
  const root = path.resolve(__dirname, "..");
  const screenshots = [];
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
      response.writeHead(200, { "Content-Type": contentType(filePath) });
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
    if (message.type() === "error" && message.text().indexOf("Failed to load resource") < 0) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && !/favicon\.ico(?:$|\?)/.test(response.url())) {
      failedResources.push(response.status() + " " + response.url());
    }
  });

  await page.goto(baseUrl + "/tests/legendary-bird-special-preview.html", { waitUntil: "networkidle" });
  const legendaryPreview = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll("svg"));
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      legendaryCards: document.querySelectorAll(".preview-card.is-legendary").length,
      textBadges: document.querySelectorAll(".preview-badge").length,
      phoenixStages: document.querySelectorAll("#phoenix-stages .preview-card").length,
      tiny: document.querySelectorAll(".bird-view.is-80").length,
      silhouettes: document.querySelectorAll(".preview-card.silhouette").length,
      invalidSvg: svgs.filter((svg) => {
        const box = svg.getBBox();
        return box.width <= 0 || box.height <= 0;
      }).length,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
  assert(legendaryPreview.width === 390 && legendaryPreview.scrollWidth === 390, "legendary preview should have no 390px horizontal overflow");
  assert(legendaryPreview.legendaryCards >= 4 && legendaryPreview.textBadges >= 4, "legendary preview should show four text-based legendary treatments");
  assert(legendaryPreview.phoenixStages === 3 && legendaryPreview.tiny >= 2 && legendaryPreview.silhouettes >= 2, "phoenix stages, 80px views and silhouettes should be present");
  assert(legendaryPreview.invalidSvg === 0, "legendary preview SVGs should have visible bounds");
  assert(legendaryPreview.reduced, "legendary preview should run under reduced-motion media conditions");
  screenshots.push(path.join(os.tmpdir(), "kodomo-adventure-p29-legendary-390.png"));
  await page.screenshot({ path: screenshots[screenshots.length - 1], fullPage: true });

  await page.goto(baseUrl + "/tests/adult-special-reward-preview.html", { waitUntil: "networkidle" });
  await page.click("#confirm");
  const rewardPreview = await page.evaluate(() => {
    const buttonHeights = Array.from(document.querySelectorAll("button"))
      .map((button) => button.getBoundingClientRect().height)
      .filter((height) => height > 0);
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      states: document.querySelectorAll(".state-grid article").length,
      dialogs: document.querySelectorAll(".mock-modal").length,
      minButtonHeight: Math.min(...buttonHeights)
    };
  });
  assert(rewardPreview.width === 390 && rewardPreview.scrollWidth === 390, "special reward preview should have no 390px horizontal overflow");
  assert(rewardPreview.states >= 8 && rewardPreview.dialogs >= 2, "special reward preview should cover inputs and child confirmation states");
  assert(rewardPreview.minButtonHeight >= 48, "special reward preview buttons should meet the minimum touch target");

  await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const seeded = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    const ui = KA.state.getUiState();
    data.profile.starTotals.spendableStars = 250;
    data.profile.starTotals.lifetimeStars = 250;
    data.starLedger = [];
    data.specialRewards = [];
    data.companions = [];
    KA.companions.allSpecies().forEach((species, index) => {
      const companion = KA.companions.recordHatch(data, species.id, "2026-07-28T09:00:00+09:00");
      companion.bondLevel = [1, 3, 5][index % 3];
      companion.lastSeenEvolutionStage = KA.companions.getCompanionEvolutionStage(companion);
      companion.mealCount = index;
      companion.isFavorite = species.id === "companion_phoenix";
    });
    data.companions.find((companion) => companion.speciesId === "companion_phoenix").bondLevel = 5;
    data.companions.find((companion) => companion.speciesId === "companion_phoenix").lastSeenEvolutionStage = 3;
    ui.eggTab = "companions";
    ui.selectedCompanionId = "companion_phoenix";
    KA.state.saveAppData();
    KA.state.saveUiState();
    KA.router.navigate("eggs");
    return {
      version: KA.constants.APP_VERSION,
      label: KA.constants.VERSION_LABEL,
      speciesCount: KA.companions.allSpecies().length,
      legendaryIds: KA.companions.allSpecies().filter((species) => species.rarity === "legendary").map((species) => species.id),
      phoenixVersion: KA.companions.getSpecies("companion_phoenix").designVersion,
      phoenixBody: KA.companions.getSpecies("companion_phoenix").defaultColors.body
    };
  });
  assert(seeded.version === "1.0.0-prototype.29" && seeded.label === "Ver.1.0 試作29", "prototype 29 version should load");
  assert(seeded.speciesCount === 15 && seeded.legendaryIds.length === 4, "production should expose fifteen species and four legends");
  assert(seeded.legendaryIds.indexOf("companion_phoenix") >= 0 && seeded.legendaryIds.indexOf("companion_quetzal") < 0, "phoenix should be legendary and quetzal normal");
  assert(seeded.phoenixVersion === 2 && seeded.phoenixBody === "#F5C84C", "production phoenix should use the gold designVersion 2 body");

  const dex = await page.evaluate(() => ({
    cards: document.querySelectorAll(".companion-card").length,
    legends: document.querySelectorAll(".companion-card.is-legendary-companion").length,
    legendBadges: document.querySelectorAll(".companion-card .legendary-badge").length,
    quetzalLegendary: Boolean(document.querySelector('[data-companion-detail="companion_quetzal"].is-legendary-companion')),
    phoenixGold: Boolean(document.querySelector('[data-companion-detail="companion_phoenix"] .companion-phoenix [fill="#F5C84C"]')),
    scrollWidth: document.documentElement.scrollWidth,
    width: window.innerWidth
  }));
  assert(dex.cards === 15 && dex.legends === 4 && dex.legendBadges === 4, "dex should show legendary treatment on exactly four of fifteen cards: " + JSON.stringify(dex));
  assert(!dex.quetzalLegendary && dex.phoenixGold, "quetzal should be normal and phoenix visibly gold");
  assert(dex.scrollWidth === dex.width && dex.width === 390, "production dex should have no horizontal overflow");

  await page.click('[data-companion-detail="companion_phoenix"]');
  await page.waitForTimeout(80);
  const detail = await page.evaluate(() => ({
    route: window.KodomoAdventure.router.getCurrent().name,
    badge: Boolean(document.querySelector(".companion-detail-hero .legendary-badge")),
    stage: document.querySelector(".companion-detail-art .companion-svg")?.className.baseVal,
    aria: document.querySelector(".companion-detail-art .companion-svg")?.getAttribute("aria-label"),
    scrollWidth: document.documentElement.scrollWidth,
    width: window.innerWidth
  }));
  assert(detail.route === "companion-detail" && detail.badge, "legendary phoenix detail should use the shared detail route and badge");
  assert(/evolution-stage-3/.test(detail.stage) && /でんせつのなかま/.test(detail.aria), "legendary detail SVG should include stage and text-based legendary aria status");
  assert(detail.scrollWidth === detail.width, "legendary detail should not overflow");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house", { companionId: "companion_phoenix" }));
  await page.waitForTimeout(100);
  const house = await page.evaluate(() => {
    const birds = Array.from(document.querySelectorAll(".bird-house-bird"));
    return {
      birds: birds.length,
      uniquePositions: new Set(birds.map((bird) => bird.style.left + ":" + bird.style.top)).size,
      legends: document.querySelectorAll(".bird-house-bird.is-legendary-companion").length,
      scrollWidth: document.documentElement.scrollWidth,
      width: window.innerWidth
    };
  });
  assert(house.birds === 15 && house.uniquePositions === 15 && house.legends === 4, "bird house should fit fifteen unique positions with four legends");
  assert(house.scrollWidth === house.width, "bird house should not overflow");

  await page.evaluate(() => window.KodomoAdventure.router.navigate("parent"));
  await page.waitForTimeout(50);
  assert(await page.locator("[data-special-reward-form]").count() === 0, "direct parent route must not expose special reward controls");
  await page.evaluate(() => {
    window.KodomoAdventure.parentMode.authorizeSession();
    window.KodomoAdventure.router.navigate("parent");
  });
  await page.waitForTimeout(80);
  assert(await page.locator("[data-special-reward-form]").count() === 1, "authorized parent session should expose special reward controls");
  await page.fill("[data-special-reward-amount]", "１００");
  await page.fill("[data-special-reward-note]", "<b>おてつだい がんばったね</b>");
  const beforeConfirm = await page.evaluate(() => window.KodomoAdventure.state.getAppData().profile.starTotals.spendableStars);
  await page.click("[data-confirm-special-reward]");
  await page.waitForSelector(".special-reward-confirm-modal");
  const confirmation = await page.evaluate(() => ({
    current: document.querySelector(".special-reward-summary")?.textContent,
    stars: window.KodomoAdventure.state.getAppData().profile.starTotals.spendableStars,
    noteHtml: document.querySelector(".special-reward-confirm-note p")?.innerHTML
  }));
  assert(confirmation.stars === beforeConfirm && confirmation.current.indexOf("350") >= 0, "confirmation should show resulting balance without granting");
  assert(confirmation.noteHtml === "&lt;b&gt;おてつだい がんばったね&lt;/b&gt;", "confirmation note should be escaped text");
  await page.click("[data-cancel-special-reward]");
  assert(await page.evaluate(() => window.KodomoAdventure.state.getAppData().profile.starTotals.spendableStars) === beforeConfirm, "cancel should preserve star balance");

  await page.click("[data-confirm-special-reward]");
  await page.waitForSelector(".special-reward-confirm-modal");
  await page.evaluate(() => {
    const button = document.querySelector("[data-grant-special-reward]");
    button.click();
    button.click();
  });
  await page.waitForTimeout(100);
  const granted = await page.evaluate(() => {
    const data = window.KodomoAdventure.state.getAppData();
    return {
      stars: data.profile.starTotals.spendableStars,
      lifetime: data.profile.starTotals.lifetimeStars,
      rewards: data.specialRewards.length,
      ledgers: data.starLedger.filter((entry) => entry.type === "earn_special_reward").length,
      unread: data.specialRewards.filter((reward) => !reward.seenAt).length,
      historyRows: document.querySelectorAll(".special-reward-history article").length
    };
  });
  assert(granted.stars === 350 && granted.lifetime === 350, "special reward should add exactly 100 to existing star totals");
  assert(granted.rewards === 1 && granted.ledgers === 1 && granted.unread === 1, "double click should create one reward, ledger and unread notification");
  assert(granted.historyRows === 1, "authorized parent mode should show the new reward in recent history");

  await page.click('[data-route="home"]');
  await page.waitForSelector(".special-reward-receive-modal");
  const childReward = await page.evaluate(() => ({
    authorized: window.KodomoAdventure.parentMode.isAuthorized(),
    amount: document.querySelector(".special-reward-receive-modal .special-reward-amount")?.textContent,
    noteHtml: document.querySelector(".special-reward-receive-modal .special-reward-note")?.innerHTML
  }));
  assert(!childReward.authorized && childReward.amount.indexOf("100") >= 0, "returning home should revoke parent access and show the child reward once");
  assert(childReward.noteHtml === "&lt;b&gt;おてつだい がんばったね&lt;/b&gt;", "child reward note should remain escaped text");
  await page.click("[data-close-special-reward]");
  await page.waitForTimeout(40);
  const seen = await page.evaluate(() => ({
    seenAt: window.KodomoAdventure.state.getAppData().specialRewards[0].seenAt,
    stars: window.KodomoAdventure.state.getAppData().profile.starTotals.spendableStars
  }));
  assert(seen.seenAt && seen.stars === 350, "closing child reward should mark seen without changing stars");

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const reloaded = await page.evaluate(() => ({
    stars: window.KodomoAdventure.state.getAppData().profile.starTotals.spendableStars,
    rewards: window.KodomoAdventure.state.getAppData().specialRewards.length,
    notification: Boolean(document.querySelector(".special-reward-receive-modal")),
    scrollWidth: document.documentElement.scrollWidth,
    width: window.innerWidth,
    minButtonHeight: Math.min(...Array.from(document.querySelectorAll("button"))
      .map((button) => button.getBoundingClientRect().height)
      .filter((height) => height > 0))
  }));
  assert(reloaded.stars === 350 && reloaded.rewards === 1 && !reloaded.notification, "reload should preserve balance/history and not replay a seen reward");
  assert(reloaded.width === 390 && reloaded.scrollWidth === 390, "home should have exact 390px width without horizontal overflow");
  assert(reloaded.minButtonHeight >= 48, "visible production buttons should meet the minimum touch target");

  const cleanupResult = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    const record = KA.state.getDailyRecord();
    record.completedTasks = record.completedTasks.filter((entry) => entry.taskId !== "job_cleanup");
    const before = data.profile.starTotals.spendableStars;
    const result = KA.tasks.completeTask("job_cleanup");
    const afterFirst = data.profile.starTotals.spendableStars;
    const again = KA.tasks.completeTask("job_cleanup");
    return { ok: result.ok, delta: afterFirst - before, repeated: again.ok, final: data.profile.starTotals.spendableStars };
  });
  assert(cleanupResult.ok && cleanupResult.delta === 2 && !cleanupResult.repeated && cleanupResult.final === 352, "job_cleanup should still grant exactly two stars once");

  screenshots.push(path.join(os.tmpdir(), "kodomo-adventure-p29-home-390.png"));
  await page.screenshot({ path: screenshots[screenshots.length - 1], fullPage: true });
  assert(consoleErrors.length === 0, "console errors: " + consoleErrors.join(" | "));
  assert(failedResources.length === 0, "failed resources: " + failedResources.join(" | "));
  console.log("Browser QA p29 passed");
  console.log("Screenshots: " + screenshots.join(", "));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});
