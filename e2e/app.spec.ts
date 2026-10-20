import { test, expect, type Page } from "@playwright/test";

const MODULES = ["m1", "m2", "m3", "m4"];
const SECTIONS = ["summary", "notes", "labs", "quiz", "resources"];

// Fail any test that triggers a page error or a console error from our own code.
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => {
    if (m.type() === "error" && !m.location().url.includes("fonts.g")) errors.push(m.text());
  });
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors).toEqual([]);
});

test("health endpoint", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBe(true);
  expect(await res.text()).toBe("ok");
});

test("home lists every module and links to it", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Networks Midterm Workbench");
  await expect(page.locator(".modcard")).toHaveCount(MODULES.length);
  await page.locator(".modcard").nth(2).click();
  await expect(page).toHaveURL(/\/m3$/);
  await expect(page.locator("h1")).toHaveText("The transport layer");
});

test("module menu navigates without a full page reload", async ({ page }) => {
  await page.goto("/m1");
  await page.evaluate(() => ((window as unknown as { spa: number }).spa = 1));
  await page.click("#menu summary");
  await page.click('#menu a[data-mod="m4"]');
  await expect(page).toHaveURL(/\/m4$/);
  await expect(page).toHaveTitle(/Module 4/);
  expect(await page.evaluate(() => (window as unknown as { spa?: number }).spa)).toBe(1);
});

for (const id of MODULES) {
  test(`${id}: every section renders content`, async ({ page }) => {
    await page.goto(`/${id}`);
    for (const sec of SECTIONS) {
      await page.click(`.tab[data-sec="${sec}"]`);
      await expect(page).toHaveURL(sec === "summary" ? new RegExp(`/${id}/summary$`) : new RegExp(`/${id}/${sec}$`));
      await expect(page.locator(`.tab[data-sec="${sec}"]`)).toHaveAttribute("aria-current", "page");
      const panel = page.locator(`[data-panel="${sec}"]`);
      await expect(panel).toBeVisible();
      const expected = {
        summary: ".takeaways li", notes: ".note", labs: ".drill", quiz: ".mcq > li", resources: ".objs li",
      }[sec]!;
      expect(await panel.locator(expected).count()).toBeGreaterThan(0);
    }
  });

  test(`${id}: every lab generates, checks and shows a solution`, async ({ page }) => {
    await page.goto(`/${id}/labs`);
    for (const drill of await page.locator(".drill").all()) {
      await drill.locator('[data-act="new"]').click();
      await drill.locator('[data-act="check"]').click();
      await expect(drill.locator(".feedback")).toContainText("correct");
      await drill.locator('[data-act="sol"]').click();
      await expect(drill.locator(".sol .key li").first()).toBeVisible();
    }
  });
}

test("deep links, back and forward", async ({ page }) => {
  await page.goto("/m2/quiz");
  await expect(page.locator('.tab[aria-current="page"]')).toHaveAttribute("data-sec", "quiz");
  await page.click('.tab[data-sec="notes"]');
  await page.goBack();
  await expect(page).toHaveURL(/\/m2\/quiz$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/m2\/notes$/);
});

test("unknown paths show a not-found page", async ({ page }) => {
  await page.goto("/m99/whatever");
  await expect(page.locator("h1")).toHaveText("Page not found");
});

test("solving a lab counts towards progress and survives a reload", async ({ page }) => {
  await page.goto("/m1/labs");
  const drill = page.locator("#d-m1layers");
  await drill.locator('[data-act="sol"]').click();
  const answers = await drill.locator(".sol .key li code").allTextContents();
  for (const [i, a] of answers.entries()) await drill.locator(".fields select").nth(i).selectOption(a);
  await drill.locator('[data-act="check"]').click();
  await expect(drill.locator(".feedback")).toContainText(`All ${answers.length} correct`);
  await expect(page.locator('.tab[data-sec="labs"] .sc')).toHaveText("1 solved");
  await page.reload();
  await expect(page.locator('#menu [data-sc="m1"]')).toHaveText("1 solved");
});

test("ticked objectives persist and show on the home page", async ({ page }) => {
  await page.goto("/m2");
  await page.check('[data-ck="m20"]');
  await page.goto("/");
  await expect(page.locator(".modcard").nth(1)).toContainText("1/7 objectives ticked");
});

test("study notes: contents links, models and glossary filter", async ({ page }) => {
  await page.goto("/m2/notes");
  await page.click('.toc a[href="#m2-dns"]');
  await expect(page).toHaveURL(/#m2-dns$/);
  await expect(page.locator("#m2-dns")).toBeInViewport();
  await page.locator('#m2-dns [data-d="1"]').click();
  await expect(page.locator("#dns-out")).toContainText("Message 1 of 8");
  await page.fill("[data-filter]", "dns");
  await expect(page.locator("[data-count]")).toHaveText(/^\d+ of \d+ terms$/);
  expect(await page.locator(".gloss > div:visible").count()).toBeLessThan(await page.locator(".gloss > div").count());
});

test("no horizontal scrolling at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/m1", "/m3/notes", "/m4/labs"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
});

test("numeric answers accept a comma as the decimal separator", async ({ page }) => {
  await page.goto("/m1/labs");
  const drill = page.locator("#d-m1delay");
  await drill.locator('[data-act="sol"]').click();
  const answers = await drill.locator(".sol .key li code").allTextContents();
  for (const [i, a] of answers.entries()) await drill.locator(".fields input").nth(i).fill(a.replace(".", ","));
  await drill.locator('[data-act="check"]').click();
  await expect(drill.locator(".feedback")).toContainText(`All ${answers.length} correct`);
});
