const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const appUrl = pathToFileURL(path.join(__dirname, "..", "index.html")).href;

test("initial plan renders coherent cut list, 3D faces, patterns and panel views", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(appUrl);
  await expect(page.locator("#error")).toHaveText("");
  await expect(page.locator("#cutRows tr")).toHaveCount(4);
  await expect(page.locator("#pieceList .piece")).toHaveCount(4);
  await expect(page.locator("#partViews .part-view-card")).toHaveCount(4);
  await expect(page.locator("#cabinetPreview svg [data-face]")).toHaveCount(17);
  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-model-width", "36");
  await expect(page.locator("#mathTestStatus")).toHaveText("Passed");
  await expect(page.locator("#cutRows")).toContainText("26 × 45");
  await expect(page.locator("#cutRows")).toContainText("34 × 26");
  expect(errors).toEqual([]);
});

test("changing dimensions updates all outputs from the same generated plan", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(appUrl);
  await page.locator("#width").fill("40");
  await page.locator("#height").fill("50");
  await page.locator("#depth").fill("30");
  await page.locator("#thickness").fill("1");
  await page.locator("#generate").click();

  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-model-width", "40");
  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-model-height", "50");
  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-model-depth", "30");
  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-body-depth", "29");
  await expect(page.locator("#cutRows")).toContainText("29 × 50");
  await expect(page.locator("#cutRows")).toContainText("38 × 29");
  await expect(page.locator("#partViews")).toContainText("38 × 29 mm");
  await expect(page.locator("#pieceList")).toContainText("40 × 50 mm");
  await expect(page.locator("#previewCaption")).toContainText("40 W × 50 H × 30 D");
  expect(errors).toEqual([]);
});

test("rejects invalid geometry without producing a valid plan", async ({ page }) => {
  await page.goto(appUrl);
  await page.locator("#width").fill("2");
  await page.locator("#generate").click();
  await expect(page.locator("#error")).toContainText("width must be greater");
  await expect(page.locator("#cabinetPreview svg")).toHaveAttribute("data-model-width", "36");
});

test("tolerance calculator responds and reports a numeric mismatch budget", async ({ page }) => {
  await page.goto(appUrl);
  await page.locator("#cutTolerance").fill("0.5");
  await page.locator("#fitClearance").fill("0.2");
  await page.locator("#checkTolerance").click();
  await expect(page.locator("#toleranceResult")).toContainText("2 mm");
  await expect(page.locator("#toleranceResult")).toContainText("0.2 mm");
});

test("cutting patterns include physical dimensions and 100 mm calibration SVG", async ({ page }) => {
  await page.goto(appUrl);
  await expect(page.locator("#scaleCheck svg")).toHaveAttribute("width", "110mm");
  await expect(page.locator("#scaleCheck svg path")).toHaveAttribute("d", "M5 8 H105 M5 3 V11 M105 3 V11");
  await expect(page.locator("#pieceList svg")).toHaveCount(4);
  const widths = await page.locator("#pieceList svg").evaluateAll(nodes => nodes.map(node => node.getAttribute("width")));
  expect(widths.every(value => value && value.endsWith("mm"))).toBeTruthy();
});
