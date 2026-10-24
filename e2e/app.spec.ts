import { test, expect, type Page } from "@playwright/test";

const MODULES = ["m1", "m2", "m3", "m4", "m5"];
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
  for (const path of ["/", "/m1", "/m3/notes", "/m4/labs", "/m5/notes", "/m5/labs"]) {
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

test("formula sheets explain their symbols", async ({ page }) => {
  for (const id of ["m1", "m2", "m3", "m4"]) {
    await page.goto(`/${id}`);
    const rows = page.locator(".formulas tbody tr");
    const withVars = page.locator(".formulas tbody tr:has(.vars li)");
    expect(await withVars.count(), id).toBeGreaterThanOrEqual((await rows.count()) - 1);
  }
});

for (const [id, lecture, topic, note, label] of [
  ["m1", 1, "Networks under attack", "security", "Lecture 2"],
  ["m2", 1, "Video streaming and CDNs", "video", "Lecture 4"],
  ["m3", 1, "TCP: flow control and connection management", "tcp-conn", "Lecture 6"],
  ["m3", 2, "Multiplexing and demultiplexing", "mux", "Lecture 7"],
  ["m4", 1, "Generalised forwarding and SDN", "generalized", "Lecture 9"],
  ["m5", 0, "Link-state routing and Dijkstra's algorithm", "ls", "Lecture 10"],
  ["m5", 2, "ICMP: the Internet Control Message Protocol", "icmp", "Lecture 12"],
] as const) {
  test(`${id}: lecture map links to ${note}`, async ({ page }) => {
    await page.goto(`/${id}`);
    await expect(page.locator(".lecture")).toHaveCount(["m3", "m5"].includes(id) ? 3 : 2);
    await page.locator(".lecture").nth(lecture).getByRole("link", { name: topic }).click();
    await expect(page).toHaveURL(new RegExp(`/${id}/notes#${id}-${note}$`));
    await expect(page.locator(`#${id}-${note}`)).toBeInViewport();
    await expect(page.locator(`#${id}-${note} > .pages`)).toContainText(label);
  });
}

test("concept check shuffles options and still marks the right answer", async ({ page }) => {
  await page.goto("/m3/quiz");
  const items = page.locator(".mcq > li");
  const order = async () => (await items.locator(".opt").allTextContents()).join("|");
  const before = await order();
  // Answer every question with its first option: each must reveal exactly one right answer and an explanation.
  for (const li of await items.all()) {
    await li.locator(".opt").first().click();
    await expect(li.locator(".opt.right")).toHaveCount(1);
    await expect(li.locator(".why")).toBeVisible();
  }
  await expect(page.locator("[data-score]")).toContainText(`/${await items.count()} right`);
  await page.click("[data-reset]");
  expect(await order()).not.toBe(before);
});

test.describe("state survives a reload", () => {
  test("reading position", async ({ page }) => {
    await page.goto("/m1/notes");
    // Put the reader 120px into the "Delay, loss and throughput" section, just below the sticky tabs.
    await page.evaluate(() => {
      const tabs = document.querySelector("nav.tabs")!.getBoundingClientRect().bottom;
      const top = document.getElementById("m1-delay")!.getBoundingClientRect().top + scrollY;
      scrollTo(0, top - tabs + 120);
    });
    await page.waitForTimeout(400); // scroll saves are debounced
    const before = await page.evaluate(() => scrollY);
    await page.reload();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 5);
    expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(5);
  });

  test("lab: same numbers, answers, solution and result; progress not counted twice", async ({ page }) => {
    await page.goto("/m1/labs");
    const drill = page.locator("#d-m1layers");
    await drill.locator('[data-act="sol"]').click();
    const answers = await drill.locator(".sol .key li code").allTextContents();
    const question = await drill.locator(".fld label").allTextContents();
    for (const [i, a] of answers.entries()) await drill.locator(".fields select").nth(i).selectOption(a);
    await drill.locator('[data-act="check"]').click();
    await expect(page.locator('.tab[data-sec="labs"] .sc')).toHaveText("1 solved");
    await page.reload();
    expect(await drill.locator(".fld label").allTextContents()).toEqual(question);
    for (const [i, a] of answers.entries()) await expect(drill.locator(".fields select").nth(i)).toHaveValue(a);
    await expect(drill.locator(".sol")).toBeVisible();
    await expect(drill.locator(".feedback")).toHaveText(`All ${answers.length} correct.`);
    await expect(drill.locator(".mark.ok")).toHaveCount(answers.length);
    await expect(page.locator('.tab[data-sec="labs"] .sc')).toHaveText("1 solved");
    // A typed but unchecked answer is kept too.
    const delay = page.locator("#d-m1delay");
    await delay.locator(".fields input").first().fill("0,5");
    await page.reload();
    await expect(delay.locator(".fields input").first()).toHaveValue("0,5");
  });

  test("concept check: picks and option order", async ({ page }) => {
    await page.goto("/m2/quiz");
    const items = page.locator(".mcq > li");
    await items.nth(0).locator(".opt").nth(2).click();
    await items.nth(5).locator(".opt").nth(0).click();
    const order = await items.locator(".opt").allTextContents();
    const score = await page.locator("[data-score]").textContent();
    await page.reload();
    expect(await items.locator(".opt").allTextContents()).toEqual(order);
    await expect(page.locator("[data-score]")).toHaveText(score!);
    await expect(items.nth(0).locator(".why")).toBeVisible();
    await expect(items.nth(1).locator(".why")).toBeHidden();
    // Reset clears the saved answers.
    await page.click("[data-reset]");
    await page.reload();
    await expect(page.locator("[data-score]")).toContainText("0/0 right");
  });

  test("interactive models and glossary filter", async ({ page }) => {
    await page.goto("/m3/notes");
    await page.click('[data-e="demo"]');
    const cwnd = await page.textContent("#cw-out");
    await page.fill("[data-filter]", "window");
    const count = await page.textContent("[data-count]");
    await page.goto("/m2/notes");
    await page.selectOption("#dns-mode", "rc");
    await page.click('#m2-dns [data-d="1"]');
    await page.click('#m2-dns [data-d="1"]');
    await page.goto("/m3/notes");
    await expect(page.locator("#cw-out")).toHaveText(cwnd!);
    await expect(page.locator("[data-filter]")).toHaveValue("window");
    await expect(page.locator("[data-count]")).toHaveText(count!);
    await page.goto("/m2/notes");
    await expect(page.locator("#dns-mode")).toHaveValue("rc");
    await expect(page.locator("#dns-out")).toContainText("Message 2 of 8");
  });
});

test.describe("module 5 routing models", () => {
  test("Dijkstra model reproduces the book's Figure 5.4 forwarding table", async ({ page }) => {
    await page.goto("/m5/notes");
    const model = page.locator("#m5-ls");
    for (let i = 0; i < 5; i++) await model.locator('[data-k="1"]').click();
    await expect(page.locator("#dj-out")).toContainText("v → (u, v), w → (u, x), x → (u, x), y → (u, x), z → (u, x)");
    await expect(model.locator("table tbody tr")).toHaveCount(6);
    await expect(model.locator("table tbody tr").nth(2)).toContainText("uxy"); // the book takes y before v
    await model.locator('[data-k="new"]').click();
    await expect(page.locator("#dj-out")).toContainText("Initialisation");
  });

  test("distance-vector model: count-to-infinity, then poisoned reverse", async ({ page }) => {
    await page.goto("/m5/notes");
    const model = page.locator("#m5-dv");
    await model.locator('[data-s="1"]').click();
    await expect(page.locator("#dv-out")).toContainText("Routing loop");
    await expect(page.locator("#dv-out")).toContainText("= 6 via z");
    await model.locator('[data-s="end"]').click();
    await expect(page.locator("#dv-out")).toContainText("Finished after");
    await page.check("#dv-pr");
    await model.locator('[data-s="1"]').click();
    await expect(page.locator("#dv-out")).toContainText("= 60 via x");
    await model.locator('[data-s="end"]').click();
    await expect(model.locator("svg")).toContainText("Dy(x) = 51 via z");
    await expect(model.locator("svg")).toContainText("Dz(x) = 50 via x");
  });
});
