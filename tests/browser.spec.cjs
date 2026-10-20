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

test("exploded diagram opens in an accessible enlarged overlay and closes cleanly", async ({ page }) => {
  await page.goto(appUrl);
  const opener = page.locator("#openDiagramModal");
  await expect(opener).toBeVisible();
  await opener.click();
  await expect(page.locator("#diagramModal")).toHaveAttribute("open", "");
  await expect(page.locator("#diagramModalContent svg")).toBeVisible();
  await page.locator("#closeDiagramModal").click();
  await expect(page.locator("#diagramModal")).not.toHaveAttribute("open", "");
});

test("nightstand concept recalculates its parts from current dimensions and marks limits clearly", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(appUrl);
  await page.locator("#generateNightstand").click();
  await expect(page.locator("#nightstandPreview svg")).toBeVisible();
  await expect(page.locator("#nightstandParts .nightstand-part")).toHaveCount(10);
  await expect(page.locator("#nightstandParts")).toContainText("Corner legs");
  await expect(page.locator("#nightstandParts")).toContainText("Drawer front");
  await expect(page.locator("#nightstandStatus")).toContainText("Idealized geometry checks passed");
  await expect(page.locator("#nightstandStatus")).toContainText("physical fit still need a material test");
  const first = await page.locator("#nightstandParts").innerText();
  await page.locator("#width").fill("40");
  await page.locator("#height").fill("50");
  await page.locator("#depth").fill("30");
  await page.locator("#thickness").fill("1");
  await page.locator("#generateNightstand").click();
  const second = await page.locator("#nightstandParts").innerText();
  expect(second).not.toEqual(first);
  expect(errors).toEqual([]);
});

test("nightstand shows assembled and exploded views tied to dimensions and material thickness", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(appUrl);
  await page.locator("#width").fill("40");
  await page.locator("#height").fill("50");
  await page.locator("#depth").fill("30");
  await page.locator("#thickness").fill("2");
  await page.locator("#generateNightstand").click();
  await expect(page.locator("#nightstandPreview .nightstand-view-card")).toHaveCount(2);
  await expect(page.locator("#nightstandPreview svg[aria-label^='Assembled']")).toHaveAttribute("data-model-width", "40");
  await expect(page.locator("#nightstandPreview svg[aria-label^='Assembled']")).toHaveAttribute("data-model-height", "50");
  await expect(page.locator("#nightstandPreview svg[aria-label^='Assembled']")).toHaveAttribute("data-model-depth", "30");
  await expect(page.locator("#nightstandPreview svg[aria-label^='Assembled']")).toHaveAttribute("data-material-thickness", "2");
  await expect(page.locator("#nightstandParts")).toContainText("Material");
  const first = await page.locator("#nightstandParts").innerText();
  await page.locator("#thickness").fill("1");
  await page.locator("#generateNightstand").click();
  await expect(page.locator("#nightstandPreview svg[aria-label^='Assembled']")).toHaveAttribute("data-material-thickness", "1");
  const second = await page.locator("#nightstandParts").innerText();
  expect(second).not.toEqual(first);
  expect(errors).toEqual([]);
});

test("nightstand generator rejects impossible dimensions instead of showing an old concept", async ({ page }) => {
  await page.goto(appUrl);
  await page.locator("#generateNightstand").click();
  await expect(page.locator("#nightstandPreview svg")).toBeVisible();
  await page.locator("#width").fill("10");
  await page.locator("#height").fill("10");
  await page.locator("#depth").fill("5");
  await page.locator("#thickness").fill("10");
  await page.locator("#generateNightstand").click();
  await expect(page.locator("#nightstandStatus")).toContainText("width");
  await expect(page.locator("#nightstandPreview svg")).toHaveCount(0);
  await expect(page.locator("#nightstandParts .nightstand-part")).toHaveCount(0);
});

test("nightstand dimensions preserve the intended outside envelope and positive panel sizes", async ({ page }) => {
  await page.goto(appUrl);
  const result = await page.evaluate(() => generateNightstandConcept({W:40,H:50,D:30,t:1}));
  expect(result.ok).toBe(true);
  expect(result.checks.outsideWidth).toBe(40);
  expect(result.checks.outsideHeight).toBe(50);
  expect(result.checks.outsideDepth).toBe(30);
  expect(result.checks.dimensionsMatch).toBe(true);
  expect(result.checks.allPartsPositive).toBe(true);
  expect(result.parts).toHaveLength(10);
  expect(result.parts.find(p => p.id === "L").qty).toBe(4);
  expect(result.parts.find(p => p.id === "S").qty).toBe(1);
  expect(result.parts.find(p => p.id === "DS").qty).toBe(2);
});

test("nightstand geometry stays consistent across multiple valid dimensions", async ({ page }) => {
  await page.goto(appUrl);
  const results = await page.evaluate(() => [
    generateNightstandConcept({W:36,H:45,D:27,t:1}),
    generateNightstandConcept({W:80,H:100,D:60,t:2}),
    generateNightstandConcept({W:120,H:150,D:90,t:3})
  ]);
  for (const result of results) {
    expect(result.ok).toBe(true);
    expect(result.checks.dimensionsMatch).toBe(true);
    expect(result.checks.allPartsPositive).toBe(true);
    expect(result.checks.outsideWidth).toBe(result.input.W);
    expect(result.checks.outsideHeight).toBe(result.input.H);
    expect(result.checks.outsideDepth).toBe(result.input.D);
  }
});
