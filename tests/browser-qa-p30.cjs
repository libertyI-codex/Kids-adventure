/* eslint-env node */
"use strict";

const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require("playwright");

const projectRoot = path.resolve(__dirname, "..");
const edgePath = process.env.P30_EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const screenshotPath = process.env.P30_SCREENSHOT || path.join(__dirname, "p30-coloring-preview.png");
let qaBrowser = null;
let qaLocal = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function startStaticServer() {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png"
  };
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestPath = decodeURIComponent(String(request.url || "/").split("?")[0]);
      if (requestPath === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const resolvedPath = path.resolve(projectRoot, relativePath);
      if (!resolvedPath.startsWith(projectRoot + path.sep) && resolvedPath !== path.join(projectRoot, "index.html")) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(resolvedPath, (error, bytes) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, {
          "Content-Type": mimeTypes[path.extname(resolvedPath).toLowerCase()] || "application/octet-stream",
          "Cache-Control": "no-store"
        });
        response.end(bytes);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: "http://127.0.0.1:" + address.port });
    });
  });
}

(async () => {
  qaLocal = process.env.P30_BASE_URL ? null : await startStaticServer();
  const baseUrl = process.env.P30_BASE_URL || qaLocal.baseUrl;
  qaBrowser = await chromium.launch({
    headless: true,
    executablePath: edgePath
  });
  const context = await qaBrowser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  page.on("requestfailed", (request) => {
    failedRequests.push(request.url() + " :: " + (request.failure() ? request.failure().errorText : "unknown"));
  });

  await page.goto(baseUrl + "/tests/coloring-preview.html", { waitUntil: "networkidle" });
  const review = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".card"));
    const svgBoxes = Array.from(document.querySelectorAll("svg")).map((svg) => {
      const rect = svg.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      title: document.title,
      cardCount: cards.length,
      ids: cards.map((card) => card.getAttribute("data-template-id")),
      svgCount: svgBoxes.length,
      blankSvgCount: svgBoxes.filter((box) => box.width < 1 || box.height < 1).length,
      colorRegionStrokeCount: document.querySelectorAll(".comparison .preview:not(.legacy) .color-regions [stroke]").length,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sizes80: document.querySelectorAll(".size-80 svg").length,
      sizes120: document.querySelectorAll(".size-120 svg").length
    };
  });
  assert(review.cardCount === 7, "review page should show exactly seven refreshed templates");
  assert(review.svgCount === 42, "review page should show six SVG views for each refreshed template");
  assert(review.blankSvgCount === 0, "review page should not contain blank SVG boxes");
  assert(review.colorRegionStrokeCount === 0, "refreshed color-regions should not contain stroke attributes");
  assert(review.sizes80 === 7 && review.sizes120 === 7, "review page should show every target at 80px and 120px");
  assert(review.clientWidth === 390 && review.scrollWidth === 390, "review page should not horizontally overflow at 390px");
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.goto(baseUrl + "/index.html?v=10p30", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    window.KodomoAdventure.router.navigate("coloring-list");
  });
  await page.waitForTimeout(100);
  const app = await page.evaluate(() => {
    const KA = window.KodomoAdventure;
    const targets = KA.coloringArtV30.targetIds;
    const cards = Array.from(document.querySelectorAll(".coloring-card"));
    const targetChecks = targets.map((templateId) => {
      const definition = KA.coloring.getLayeredDefinition(templateId);
      const template = KA.constants.COLORING_TEMPLATES.filter((item) => item.templateId === templateId)[0];
      const svg = KA.coloring.renderTemplate(templateId, {}, "qa-svg");
      return {
        templateId,
        regionsMatch: JSON.stringify(definition.regions.map((region) => region.id).sort()) === JSON.stringify(template.regionIds.slice().sort()),
        hasSvg: svg.indexOf("<svg") >= 0,
        hasHitAreas: svg.indexOf('class="hit-areas"') >= 0
      };
    });
    return {
      appVersion: KA.constants.APP_VERSION,
      versionLabel: KA.constants.VERSION_LABEL,
      schemaVersion: KA.constants.SCHEMA_VERSION,
      templateCount: KA.constants.COLORING_TEMPLATES.length,
      targetChecks,
      cardCount: cards.length,
      previewSvgCount: document.querySelectorAll(".coloring-card .coloring-preview svg").length,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      appScrollWidth: document.getElementById("app").scrollWidth,
      buttonHeights: Array.from(document.querySelectorAll("button")).map((button) => button.getBoundingClientRect().height)
    };
  });
  assert(app.appVersion === "1.0.0-prototype.30", "production appVersion mismatch");
  assert(app.versionLabel === "Ver.1.0 試作30", "production display version mismatch");
  assert(app.schemaVersion === 1, "schemaVersion should remain 1");
  assert(app.templateCount === 11, "production coloring list should keep eleven templates");
  assert(app.cardCount === 11 && app.previewSvgCount === 11, "production coloring list should render all eleven template cards and previews");
  assert(app.targetChecks.every((item) => item.regionsMatch && item.hasSvg && item.hasHitAreas), "every refreshed production template should render with matching region IDs and hit areas");
  assert(app.clientWidth === 390 && app.scrollWidth === 390 && app.appScrollWidth <= 390, "production coloring list should not horizontally overflow at 390px");
  assert(app.buttonHeights.filter((height) => height > 0).every((height) => height >= 48), "visible production buttons should be at least 48px high");
  assert(consoleErrors.length === 0, "browser console should have no errors: " + consoleErrors.join(" | "));
  assert(failedRequests.length === 0, "browser should have no failed requests: " + failedRequests.join(" | "));

  console.log(JSON.stringify({ review, app, consoleErrors, failedRequests, screenshotPath }, null, 2));
  await qaBrowser.close();
  qaBrowser = null;
  if (qaLocal) {
    await new Promise((resolve) => qaLocal.server.close(resolve));
    qaLocal = null;
  }
})().catch(async (error) => {
  if (qaBrowser) {
    await qaBrowser.close().catch(() => {});
  }
  if (qaLocal) {
    await new Promise((resolve) => qaLocal.server.close(resolve));
  }
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
