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
    hasTouch: true
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

  await page.goto("http://127.0.0.1:8765/tests/companion-nickname-preview.html", { waitUntil: "networkidle" });
  const preview = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    maxLength: document.getElementById("nickname").maxLength,
    minButtonHeight: Math.min(...Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height)),
    contextCount: document.querySelectorAll(".preview-context").length
  }));
  if (preview.scrollWidth > preview.viewport) throw new Error("nickname preview has horizontal overflow");
  if (preview.maxLength !== 12) throw new Error("nickname input maxlength should be 12");
  if (preview.minButtonHeight < 48) throw new Error("nickname preview button height should be at least 48px");
  if (preview.contextCount !== 5) throw new Error("nickname preview should show five screen contexts");

  await page.fill("#nickname", "123456789012");
  await page.click("#save");
  const longNameCount = await page.locator(".preview-context strong", { hasText: "123456789012" }).count();
  if (longNameCount !== 5) throw new Error("twelve-character nickname did not update all contexts");

  await page.fill("#nickname", "<b>ぺん</b>");
  await page.click("#save");
  if (await page.locator(".preview-context b").count()) throw new Error("HTML-like nickname was interpreted as HTML");
  if ((await page.locator(".preview-context strong").first().textContent()) !== "<b>ぺん</b>") throw new Error("HTML-like nickname should remain visible as text");

  await page.click("#clear");
  if ((await page.locator(".preview-context strong").first().textContent()) !== "ぺんぎん") throw new Error("clearing nickname should restore species name");
  const previewScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p24-nickname-390.png");
  await page.screenshot({ path: previewScreenshot, fullPage: true });

  await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4300);
  const app = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    version: window.KodomoAdventure && window.KodomoAdventure.constants && window.KodomoAdventure.constants.VERSION_LABEL,
    appVersion: window.KodomoAdventure && window.KodomoAdventure.constants && window.KodomoAdventure.constants.APP_VERSION,
    recoveryHidden: !document.getElementById("boot-recovery-root") || document.getElementById("boot-recovery-root").hidden,
    startupHidden: !document.getElementById("startup-splash") || document.getElementById("startup-splash").hidden
  }));
  if (app.scrollWidth > app.viewport) throw new Error("production app has horizontal overflow at 390px");
  if (app.version !== "Ver.1.0 試作24" || app.appVersion !== "1.0.0-prototype.24") throw new Error("prototype 24 version mismatch");
  if (!app.recoveryHidden || !app.startupHidden) throw new Error("normal startup did not finish cleanly");

  await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const data = KA.state.getAppData();
    if (!KA.companions.getCompanion(data, "companion_penguin")) {
      KA.companions.recordHatch(data, "companion_penguin", KA.date.localIsoString());
      KA.state.saveAppData();
    }
    KA.state.getUiState().eggTab = "companions";
    KA.state.saveUiState();
    KA.router.navigate("eggs");
  });
  await page.waitForTimeout(200);
  await page.click('[data-edit-companion-nickname="companion_penguin"]');
  if (!(await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute("data-companion-nickname-input")))) throw new Error("nickname dialog should focus its input");
  const modalLayout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    buttonMinHeight: Math.min(...Array.from(document.querySelectorAll(".companion-nickname-modal button")).map((button) => button.getBoundingClientRect().height))
  }));
  if (modalLayout.scrollWidth > modalLayout.viewport || modalLayout.buttonMinHeight < 48) throw new Error("production nickname dialog is not mobile-safe");
  await page.fill("[data-companion-nickname-input]", "ぺんちゃん");
  await page.click("[data-save-companion-nickname]");
  await page.waitForTimeout(100);
  if (!(await page.locator(".companion-card.is-owned .companion-display-name").filter({ hasText: "ぺんちゃん" }).count())) {
    throw new Error("saved nickname should update the production companion card");
  }
  await page.evaluate(() => window.KodomoAdventure.router.navigate("home"));
  await page.waitForTimeout(100);
  if ((await page.locator("body").innerText()).indexOf("ぺんちゃん") < 0) throw new Error("saved nickname should update the production home");
  await page.evaluate(() => window.KodomoAdventure.router.navigate("bird-house"));
  await page.waitForTimeout(100);
  if ((await page.locator("body").innerText()).indexOf("ぺんちゃん") < 0) throw new Error("saved nickname should update the bird house");
  app.nicknameDialog = modalLayout;
  app.nicknameSaved = true;

  if (consoleErrors.length) throw new Error("browser console errors: " + consoleErrors.join(" | "));
  if (failedResources.length) throw new Error("failed browser resources: " + failedResources.join(" | "));
  const appScreenshot = path.join(process.env.TEMP, "kodomo-adventure-p24-home-390.png");
  await page.screenshot({ path: appScreenshot, fullPage: true });

  console.log(JSON.stringify({ preview, app, consoleErrors, failedResources, previewScreenshot, appScreenshot }, null, 2));
  await browser.close();
  browser = null;
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
