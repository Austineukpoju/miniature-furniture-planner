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

test("rejects impossible geometry and clears the previous plan", async ({ page }) => {
  await page.goto(appUrl);
  await page.locator("#width").fill("10");
  await page.locator("#thickness").fill("10");
  await page.locator("#generate").click();
  await expect(page.locator("#error")).toContainText("greater than twice");
  await expect(page.locator("#cabinetPreview svg")).toHaveCount(0);
  await expect(page.locator("#cutRows tr")).toHaveCount(0);
  await expect(page.locator("#pieceList .piece")).toHaveCount(0);
  await expect(page.locator("#partViews .exploded-diagram")).toHaveCount(0);
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

test("scaled external reference cut list matches the generator's joint equations", async ({ page }) => {
  await page.goto(appUrl);
  // Reference: W=24 in, H=47.75 in, D=12 in, t=0.75 in.
  // Scale every dimension by 0.4 so it fits the app's miniature input bounds;
  // uniform scaling preserves the reference's joint geometry exactly.
  await page.locator("#width").fill("243.84");
  await page.locator("#height").fill("485.14");
  await page.locator("#depth").fill("121.92");
  await page.locator("#thickness").fill("7.62");
  await page.locator("#generate").click();
  await expect(page.locator("#error")).toHaveText("");
  await expect(page.locator("#cutRows")).toContainText("114.3 × 485.14");
  await expect(page.locator("#cutRows")).toContainText("228.6 × 114.3");
  await expect(page.locator("#cutRows")).toContainText("243.84 × 485.14");
});


test("nightstand engineering pages are generated only when Print / Save as PDF is clicked", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    window.print = () => { window.__printCalled = true; };
  });
  await page.goto(appUrl);
  await expect(page.locator("#nightstandPdfSection")).toBeHidden();
  await expect(page.locator("#nightstandPdfSection")).toContainText("");
  await expect(page.locator("body")).not.toContainText("Generate Nightstand");
  await page.locator("#width").fill("36");
  await page.locator("#height").fill("45");
  await page.locator("#depth").fill("27");
  await page.locator("#thickness").fill("1");
  await page.locator("#print").click();
  await expect(page.locator("#nsPdfSummary")).toContainText("36 W × 45 H × 27 D mm");
  await expect(page.locator("#nightstandPdfSection")).toContainText("engineering design basis");
  await expect(page.locator("#nightstandPdfSection")).not.toContainText("finished nightstand");
  await expect(page.locator("#nsExplodedView svg")).toHaveAttribute("aria-label", /exploded construction/i);
  await expect(page.locator("#nsCutList tbody tr")).toHaveCount(10);
  await expect(page.locator("#nsCutList")).toContainText("Corner legs");
  await expect(page.locator("#nsCutList")).toContainText("Drawer bottom");
  expect(await page.evaluate(() => window.__printCalled)).toBe(true);
  expect(errors).toEqual([]);
});

test("nightstand PDF drawings and cut list recalculate from the current dimensions", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => { window.__printCalled = true; }; });
  await page.goto(appUrl);
  await page.locator("#width").fill("40");
  await page.locator("#height").fill("50");
  await page.locator("#depth").fill("30");
  await page.locator("#thickness").fill("1");
  await page.locator("#print").click();
  await expect(page.locator("#nsPdfSummary")).toContainText("40 W × 50 H × 30 D mm");
  await expect(page.locator("#nsCutIntro")).toContainText("40 × 50 × 30 mm");
  await expect(page.locator("#nsCutList")).toContainText("40 × 30 × 1");
  await expect(page.locator("#nsGeometryChecks")).toContainText("All calculated component dimensions are positive: PASS");
  expect(await page.evaluate(() => window.__printCalled)).toBe(true);
});

test("nightstand blueprint refuses dimensions that cannot support a drawer and frame", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => { window.__printCalled = true; }; });
  await page.goto(appUrl);
  await page.locator("#width").fill("10");
  await page.locator("#height").fill("10");
  await page.locator("#depth").fill("5");
  await page.locator("#thickness").fill("1");
  await page.locator("#print").click();
  await expect(page.locator("#error")).toContainText("do not leave enough room");
  expect(await page.evaluate(() => Boolean(window.__printCalled))).toBe(false);
});
