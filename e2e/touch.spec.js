import { test, expect } from '@playwright/test';

test.setTimeout(180_000);

// Real multi-finger touch through Chrome DevTools Protocol (Playwright's page.touchscreen only taps).
async function fingers(page) {
  const cdp = await page.context().newCDPSession(page);
  const send = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints:points.map(([x, y], id) => ({ x, y, id })) });
  return {
    // drag one finger from `from` by `delta`, hold it there for `holdMs`, then lift
    async hold(from, delta, holdMs) {
      await send('touchStart', [from]);
      for (let i = 1; i <= 6; i++) await send('touchMove', [[from[0] + delta[0] * i / 6, from[1] + delta[1] * i / 6]]);
      await page.waitForTimeout(holdMs);
      await send('touchEnd', []);
    },
    // keep the finger pushed until `locator` shows up (headless software rendering can run at only a few fps)
    async holdUntil(from, delta, locator) {
      await send('touchStart', [from]);
      for (let i = 1; i <= 6; i++) await send('touchMove', [[from[0] + delta[0] * i / 6, from[1] + delta[1] * i / 6]]);
      await expect(locator).toBeVisible({ timeout:90_000 });
      await send('touchEnd', []);
    },
  };
}

async function startJourney(page) {
  await page.goto('/');
  await page.getByRole('button', { name:/Start journey/ }).click();
  await page.waitForTimeout(1500); // Ray turns around to face down the bridge
}

test('holding the joystick forward walks Ray to the first bubble and offers Enter', async ({ page }) => {
  await startJourney(page);
  const { width, height } = page.viewportSize();
  await (await fingers(page)).holdUntil([width * .22, height * .78], [0, -90], page.getByRole('button', { name:/Enter bubble/ }));
});

test('tapping Enter beside a bubble opens its project room', async ({ page }) => {
  await startJourney(page);
  const { width, height } = page.viewportSize();
  await (await fingers(page)).holdUntil([width * .22, height * .78], [0, -90], page.getByRole('button', { name:/Enter bubble/ }));
  await page.getByRole('button', { name:/Enter bubble/ }).tap();
  await expect(page.getByText(/CHAPTER 1 \/ 3/)).toBeVisible();
});

test('dragging on the right half turns the camera, so forward then walks the other way', async ({ page }) => {
  await startJourney(page);
  const { width, height } = page.viewportSize();
  const hand = await fingers(page);
  // swipe left across the right half three times: about a half turn
  for (let i = 0; i < 3; i++) await hand.hold([width * .9, height * .45], [-300, 0], 50);
  await hand.hold([width * .22, height * .78], [0, -90], 3500);
  // facing back toward the start, the same push that reaches bubble 01 now finds no bubble
  await expect(page.getByRole('button', { name:/Enter bubble/ })).toHaveCount(0);
});

// Every on-screen control a walking visitor can see: none may overlap another or leave the screen.
const CONTROLS = ['.sidebar', '.ask-fab', '.touch-jump', '.controls-hint', '.door-prompt'];

async function boxes(page) {
  const out = {};
  for (const sel of CONTROLS) {
    const el = page.locator(sel).first();
    if (await el.count() && await el.isVisible()) out[sel] = await el.boundingBox();
  }
  return out;
}
const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test('walking controls fit the screen without overlapping, including next to a bubble', async ({ page }) => {
  await startJourney(page);
  const { width, height } = page.viewportSize();
  await (await fingers(page)).holdUntil([width * .22, height * .78], [0, -90], page.getByRole('button', { name:/Enter bubble/ }));
  const b = await boxes(page), names = Object.keys(b);
  expect(names).toEqual(expect.arrayContaining(['.sidebar', '.ask-fab', '.touch-jump', '.door-prompt']));
  for (const n of names) {
    expect(b[n].x, `${n} inside left edge`).toBeGreaterThanOrEqual(0);
    expect(b[n].x + b[n].width, `${n} inside right edge`).toBeLessThanOrEqual(width + 1);
    expect(b[n].y + b[n].height, `${n} inside bottom edge`).toBeLessThanOrEqual(height + 1);
  }
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++)
    expect(overlap(b[names[i]], b[names[j]]), `${names[i]} overlaps ${names[j]}`).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
