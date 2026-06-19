import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:8080';
const outputDir = path.resolve('tmp', 'e2e-smoke');

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function gatherCommonDiagnostics(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: doc.scrollWidth,
      hasHorizontalOverflow: doc.scrollWidth > window.innerWidth + 1,
    };
  });
}

async function checkPage(name, route, options = {}) {
  const context = await browser.newContext(options.device ?? {});
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedResponses = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  const url = route.startsWith('http') ? route : `${baseUrl}${route}`;
  const startedAt = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  if (options.actions) {
    await options.actions(page);
  }

  const diagnostics = await gatherCommonDiagnostics(page);
  const title = await page.title();
  const bodyText = await page.locator('body').innerText();
  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const entry = {
    name,
    url,
    title,
    elapsedMs: Date.now() - startedAt,
    consoleErrors,
    pageErrors,
    failedResponses,
    diagnostics,
    snippet: bodyText.slice(0, 400),
    screenshotPath,
  };

  if (options.assertions) {
    entry.assertions = await options.assertions(page);
  }

  results.push(entry);
  await context.close();
}

await checkPage('home-desktop', '/');
await checkPage('home-mobile', '/', { device: devices['iPhone 13'] });
await checkPage('vacation-rentals', '/vacation-rentals');
await checkPage('vacation-intake-direct', '/vacation-rental-intake?checkIn=2026-07-10&checkOut=2026-07-13&rentalId=1');
await checkPage('mobile-notary', '/mobile-notary', {
  actions: async (page) => {
    const shell = page.locator('#notary-date-shell').first();
    if (await shell.count()) {
      await shell.click();
    }
  },
  assertions: async (page) => {
    const heroHeading = page.locator('section').first().locator('h1');
    const heroImage = page.locator('.page-hero-image-frame img').first();
    const formHeading = page.locator('text=Pick a date and time.').first();
    const formPanel = page.locator('.booking-card, .notary-booking-card, form').first();
    const dateInput = page.locator('#notary-date, input[name=\"appointmentDate\"]').first();
    const timeInput = page.locator('#notary-time, select[name=\"appointmentTime\"]').first();

    const [heroHeadingBox, heroImageBox, formHeadingBox, formPanelBox] = await Promise.all([
      heroHeading.boundingBox(),
      heroImage.boundingBox(),
      formHeading.boundingBox(),
      formPanel.boundingBox(),
    ]);

    const timeOptions = await timeInput.locator('option').allTextContents().catch(() => []);
    const activeElement = await page.evaluate(() => document.activeElement?.id || document.activeElement?.getAttribute('name') || null);
    return {
      heroOverlapPx: heroHeadingBox && heroImageBox ? Math.max(0, heroHeadingBox.x + heroHeadingBox.width - heroImageBox.x) : null,
      formOverlapPx: formHeadingBox && formPanelBox ? Math.max(0, formHeadingBox.x + formHeadingBox.width - formPanelBox.x) : null,
      dateInputType: await dateInput.getAttribute('type').catch(() => null),
      activeElementAfterDateShellClick: activeElement,
      timeOptionsCount: timeOptions.length,
      firstTimeOption: timeOptions[1] ?? null,
      lastTimeOption: timeOptions.at(-1) ?? null,
    };
  },
});
await checkPage('admin-login', '/admin/login');
await checkPage('admin-register', '/admin/register');
await checkPage('admin-forgot-password', '/admin/forgot-password');
await checkPage('admin-control-center', '/admin');
await checkPage('admin-login-invalid', '/admin/login', {
  actions: async (page) => {
    await page.locator('#admin-login-email').fill('nobody@example.com');
    await page.locator('#admin-login-password').fill('wrong-password');
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await page.waitForTimeout(1200);
  },
  assertions: async (page) => ({
    errorText: await page.locator('[role=\"alert\"], .form-status-error').first().innerText().catch(() => ''),
    url: page.url(),
  }),
});
await checkPage('admin-forgot-password-submit', '/admin/forgot-password', {
  actions: async (page) => {
    await page.locator('#admin-forgot-email').fill('nobody@example.com');
    await page.getByRole('button', { name: 'SEND RESET LINK' }).click();
    await page.waitForTimeout(1200);
  },
  assertions: async (page) => ({
    statusText: await page.locator('.form-status-success, .form-status-error, [role=\"alert\"]').first().innerText().catch(() => ''),
    url: page.url(),
  }),
});

await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify(results, null, 2), 'utf8');
console.log(JSON.stringify({ outputDir, results }, null, 2));

await browser.close();
