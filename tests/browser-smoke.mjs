/* Short, dependency-free smoke test. Start a server first:
 * python3 -m http.server 8917 --directory /home/andrzey/git-claude/ai_plan
 * Optional: PLAYWRIGHT_PATH=/absolute/path/to/playwright/index.mjs
 */
import assert from "node:assert/strict";

const playwrightPath = process.env.PLAYWRIGHT_PATH || "/home/andrzey/.hermes/hermes-agent/node_modules/playwright/index.mjs";
const { chromium } = await import(playwrightPath);
const baseUrl = process.env.AI_PLAN_BASE_URL || "http://127.0.0.1:8917";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-crashpad", "--disable-gpu"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

try {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"), null, { timeout: 10000 });
  const initialProbe = await page.evaluate(() => window.ROADMAP_CHECK());
  assert.deepEqual(initialProbe.errors, []);
  assert.equal(initialProbe.tasks, 20);
  assert.equal(initialProbe.gates, 12);
  assert.equal(await page.locator('[data-decision], [data-save-decision], .print-decision').count(), 0);
  assert.equal(await page.locator('#phases input[data-kind="gate"]').count(), 12);
  const readableType = await page.evaluate(() => {
    const size = (selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    return { task: size('.task'), body: size('.cell p'), input: size('#projectTask'), label: size('.project-form label'), meta: size('.step-meta') };
  });
  assert.ok(readableType.task >= 18 && readableType.body >= 18);
  assert.ok(readableType.input >= 16 && readableType.label >= 16 && readableType.meta >= 14);
  assert.equal(await page.locator("#guideSafety").isVisible(), true);
  assert.equal(await page.locator("#guideSafety [data-layer='basics']").count(), 1);
  assert.equal(await page.locator("#guideSafety [data-layer='conditional']").count(), 1);
  assert.match(await page.locator("#guideSafety [data-layer='conditional']").textContent(), /Połączenie z innym systemem/);

  const heroHeight = await page.locator(".hero").evaluate((element) => element.getBoundingClientRect().height);
  assert.ok(heroHeight < 540, `Hero should leave room for the overview, got ${heroHeight}px`);

  await page.click("#btnPlanMode");
  assert.equal(await page.locator("#plan").isVisible(), true);
  assert.equal(await page.locator("body").getAttribute("data-mode"), "plan");
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".hero")).display), "none");
  assert.match(await page.locator("#planMeta").textContent(), /działań pozostało.*warunków decyzji/);
  assert.equal(await page.locator("#printSnapshot").getAttribute("data-scope"), "all-phases");
  await page.evaluate(() => localStorage.setItem("aiPlan.plan.v3", JSON.stringify({ schemaVersion: 3, done: { "sme.choice.action.001": 1 } })));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"), null, { timeout: 10000 });
  await page.click("#btnPlanMode");
  assert.equal(await page.locator("#legacyNotice").isVisible(), true);
  assert.equal(await page.locator("#planTasks input[data-task]").first().isChecked(), false);
  await page.fill("#projectTask", "Odpowiedzi na pytania klientów");
  await page.fill("#projectImprovement", "Skrócenie czasu pierwszej odpowiedzi");
  await page.fill("#projectSuccess", "Kryterium zapisane przed testem");
  await page.fill("#projectNextStep", "Przygotowanie przykładów");
  await page.check("input[data-context='personalData']");
  assert.equal(await page.locator("#contextGuidance").getAttribute("data-active-contexts"), "personalData");
  await page.click("#planTasks input[data-task]");
  assert.equal((await page.evaluate(() => window.ROADMAP_CHECK())).done, 1);

  const delayedImportPayload = await page.evaluate(() => {
    const plan = JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1"));
    plan.project.task = "Imported copy";
    return JSON.stringify(plan);
  });
  await page.evaluate((payload) => {
    window.__testImportPayload = payload;
    window.FileReader = class {
      readAsText() {
        setTimeout(() => { this.result = window.__testImportPayload; this.onload({ target: { result: this.result } }); }, 80);
      }
    };
  }, delayedImportPayload);
  await page.setInputFiles("#importFile", { name: "delayed.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await page.fill("#projectTask", "Intervening edit");
  await page.waitForTimeout(120);
  assert.equal(await page.locator("#projectTask").inputValue(), "Intervening edit");
  assert.match(await page.locator("#toastText").textContent(), /anulowane|zmienił/);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    window.__testImportPayload = JSON.stringify({ schemaVersion: 3, project: { name: "Stary plan" }, done: {} });
  });
  await page.setInputFiles("#importFile", { name: "old-v3.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await page.waitForTimeout(120);
  const legacyToast = await page.locator("#toastText").textContent();
  assert.match(legacyToast, /Kopia starego planu.*MŚP/);
  assert.doesNotMatch(legacyToast, /lastPhaseId/);

  const validDecisionPlan = await page.evaluate(() => {
    const plan = JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1"));
    const phase = window.ROADMAP.phases.find((item) => item.id === "choice");
    phase.gate.checks.forEach((check) => { plan.done[check.id] = 1; });
    plan.decisions.choice = {
      status: "continue",
      person: "Ala",
      date: "2026-10-22",
      evidence: "https://example.test/gate",
      basis: window.AI_PLAN_CORE.decisionBasis(window.ROADMAP, plan.done, "choice", plan.na, plan.project),
      phaseId: "choice"
    };
    return plan;
  });
  await page.evaluate((plan) => localStorage.setItem("aiPlan.plan.sme.v1", JSON.stringify(plan)), validDecisionPlan);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"), null, { timeout: 10000 });
  await page.click("#btnPlanMode");
  const preservedDecision = await page.evaluate(() => JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1")).decisions.choice);
  assert.equal(preservedDecision.person, "Ala");
  assert.equal(preservedDecision.date, "2026-10-22");
  assert.equal(preservedDecision.evidence, "https://example.test/gate");
  await page.check("input[data-context='integration']");
  await page.waitForTimeout(750);
  const scopeChange = await page.evaluate(() => ({
    status: JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1")).decisions.choice.status,
    selected: JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1")).project.context
  }));
  assert.equal(scopeChange.status, "none");
  assert.ok(scopeChange.selected.includes("integration"));
  await page.click("#btnGuideMode");
  assert.equal(await page.locator('[data-decision], [data-save-decision]').count(), 0);
  assert.equal(await page.locator('#printSnapshot .print-decision').count(), 0);
  const actionCountBeforeGateChange = (await page.evaluate(() => window.ROADMAP_CHECK())).done;
  await page.locator('#faza-1 input[data-kind="gate"]').first().uncheck();
  const staleTransition = await page.evaluate(() => ({
    savedStatus: document.querySelector("#saveStatus").dataset.state,
    decisionStatus: JSON.parse(localStorage.getItem("aiPlan.plan.sme.v1")).decisions.choice.status,
    errors: window.ROADMAP_CHECK().errors
  }));
  assert.equal(staleTransition.savedStatus, "saved");
  assert.equal((await page.evaluate(() => window.ROADMAP_CHECK())).done, actionCountBeforeGateChange);
  assert.equal((await page.evaluate(() => window.ROADMAP_CHECK())).gatesDone, 2);
  assert.equal(staleTransition.decisionStatus, "none");
  assert.deepEqual(staleTransition.errors, []);
  await page.click("#btnPlanMode");

  await page.click("[data-task-details]");
  assert.equal(await page.evaluate(() => document.activeElement.id), "taskOwner");
  await page.keyboard.press("Escape");
  await page.click(".secondary-tools summary");
  await page.click("#btnHelp");
  assert.equal(await page.evaluate(() => document.activeElement.id), "btnHelpClose");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.querySelector("#help").contains(document.activeElement)), true);
  await page.keyboard.press("Escape");

  await page.click("#btnReset");
  await page.click("#btnResetCancel");
  assert.equal(await page.locator("#planTasks input[data-task]").first().isChecked(), true);
  await page.click("#btnReset");
  await page.click("#btnResetConfirm");
  assert.equal(await page.locator("#btnUndo").isVisible(), true);
  await page.click("#btnUndo");
  assert.equal(await page.locator("#planTasks input[data-task]").first().isChecked(), true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const compactLayout = await page.evaluate(() => {
    const toolbar = document.querySelector('body[data-mode="plan"] #przeglad > .wrap').getBoundingClientRect();
    const head = document.querySelector("#plan .workbench-head").getBoundingClientRect();
    const toast = document.querySelector("#toast");
    const toastStyle = getComputedStyle(toast);
    return { toolbarBottom: toolbar.bottom, headTop: head.top, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, toastWidth: toast.getBoundingClientRect().width, viewportWidth: innerWidth, toastRadius: toastStyle.borderRadius };
  });
  assert.ok(compactLayout.headTop >= compactLayout.toolbarBottom - 1);
  assert.equal(compactLayout.overflow, false);
  assert.ok(compactLayout.toastWidth <= compactLayout.viewportWidth - 32);
  assert.notEqual(compactLayout.toastRadius, "999px");
  await page.click(".nav-burger");
  assert.equal(await page.locator(".nav-burger").getAttribute("aria-expanded"), "true");
  await page.click(".nav-links a[href='#przeglad']");
  assert.equal(await page.locator(".nav-burger").getAttribute("aria-expanded"), "false");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ok: true, probe: await page.evaluate(() => window.ROADMAP_CHECK()), errors }));
} finally {
  await context.close();
  await browser.close();
}
