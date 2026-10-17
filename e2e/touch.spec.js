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

// Android Chrome grants pointer lock to touch too, and a locked pointer sends every touch to the canvas, so the
// joystick goes dead after Start journey. iOS ignores the request, which is why only Android showed it.
test('starting the journey never asks for pointer lock on a touch device', async ({ page }) => {
  await page.addInitScript(() => { window.__locks = 0; Element.prototype.requestPointerLock = function () { window.__locks++; return Promise.resolve(); }; });
  await startJourney(page);
  await page.getByText('Right thumb: look').waitFor();
  expect(await page.evaluate(() => window.__locks)).toBe(0);
});

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

async function boxes(page, selectors = CONTROLS) {
  const out = {};
  for (const sel of selectors) {
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

// Home screen: the intro card, Start button, chat button and every menu item must all be on screen and apart,
// on this device and on the smallest phone still in use (iPhone SE, 320 px wide).
test('home screen layout fits without overlaps, down to a 320px-wide phone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name:/Start journey/ }).waitFor();
  for (const size of [page.viewportSize(), { width:320, height:568 }]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(300);
    const b = await boxes(page, ['.sidebar', '.intro-card', '.start-btn', '.ask-fab']), names = Object.keys(b);
    expect(names).toEqual(expect.arrayContaining(['.sidebar', '.start-btn', '.ask-fab']));
    for (const n of names) {
      expect(b[n].x, `${n} inside left edge at ${size.width}px`).toBeGreaterThanOrEqual(0);
      expect(b[n].x + b[n].width, `${n} inside right edge at ${size.width}px`).toBeLessThanOrEqual(size.width + 1);
      expect(b[n].y + b[n].height, `${n} inside bottom edge at ${size.width}px`).toBeLessThanOrEqual(size.height + 1);
    }
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++)
      expect(overlap(b[names[i]], b[names[j]]), `${names[i]} overlaps ${names[j]} at ${size.width}px`).toBe(false);
    for (const nav of await page.locator('.nav-btn').all()) {
      const r = await nav.boundingBox();
      expect(r.x + r.width, `menu item cut off at ${size.width}px`).toBeLessThanOrEqual(size.width + 1);
    }
  }
});

// The Chinese site lives at /zh: interface, projects and chat are in Chinese, and EN switches back to the same page in English.
test('the Chinese site shows Chinese text throughout and switches back to English', async ({ page }) => {
  await page.goto('/zh');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  await page.getByRole('button', { name:/开始旅程/ }).waitFor();
  await expect(page.getByRole('button', { name:'关于我', exact:true })).toBeVisible();
  await page.getByRole('button', { name:'项目', exact:true }).click();
  await expect(page.getByText('银行信贷文件 AI')).toBeVisible();
  await page.getByRole('button', { name:'项目', exact:true }).click();
  await page.locator('.ask-fab').click();
  await expect(page.getByText('你好！我是 Ray 的助手。', { exact:false })).toBeVisible();
  await page.locator('.ask-fab').click();
  await page.getByRole('link', { name:'Switch to English' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name:/Start journey/ })).toBeVisible();
});
