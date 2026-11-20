export default async function run(page, ui) {
  const out = {};
  const fileUrl = "file:///e:/self/website/attempt%201/index.html";

  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  // 1. snapshot to find the toggle buttons
  const snap = await ui.snapshot();
  out.snapshot = snap;

  // 2. check default state
  const defaultState = await page.evaluate(() => {
    const btnP = document.getElementById("btn-projects");
    const btnE = document.getElementById("btn-exp");
    const panelP = document.getElementById("panel-projects");
    const panelE = document.getElementById("panel-exp");
    const cardsP = panelP ? [...panelP.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    const cardsE = panelE ? [...panelE.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    return {
      btnPActive: btnP ? btnP.classList.contains("is-active") : null,
      btnEActive: btnE ? btnE.classList.contains("is-active") : null,
      btnPAria: btnP ? btnP.getAttribute("aria-selected") : null,
      btnEAria: btnE ? btnE.getAttribute("aria-selected") : null,
      panelPHidden: panelP ? panelP.classList.contains("is-hidden") : null,
      panelEHidden: panelE ? panelE.classList.contains("is-hidden") : null,
      cardsP, cardsE
    };
  });
  out.defaultState = defaultState;

  // 3. click Work Exp
  const btnE = await page.locator("#btn-exp").first();
  await btnE.click();
  await page.waitForTimeout(400);
  const afterExp = await page.evaluate(() => {
    const panelP = document.getElementById("panel-projects");
    const panelE = document.getElementById("panel-exp");
    const cardsP = panelP ? [...panelP.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    const cardsE = panelE ? [...panelE.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    return {
      btnPActive: document.getElementById("btn-projects").classList.contains("is-active"),
      btnEActive: document.getElementById("btn-exp").classList.contains("is-active"),
      panelPHidden: panelP.classList.contains("is-hidden"),
      panelEHidden: panelE.classList.contains("is-hidden"),
      cardsP, cardsE
    };
  });
  out.afterClickExp = afterExp;

  // 4. click Projects again
  const btnP = await page.locator("#btn-projects").first();
  await btnP.click();
  await page.waitForTimeout(400);
  const afterProjects = await page.evaluate(() => {
    const panelP = document.getElementById("panel-projects");
    const panelE = document.getElementById("panel-exp");
    const cardsP = panelP ? [...panelP.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    const cardsE = panelE ? [...panelE.querySelectorAll(".impact")].map(a => a.querySelector("h3").textContent.trim()) : [];
    return {
      btnPActive: document.getElementById("btn-projects").classList.contains("is-active"),
      btnEActive: document.getElementById("btn-exp").classList.contains("is-active"),
      panelPHidden: panelP.classList.contains("is-hidden"),
      panelEHidden: panelE.classList.contains("is-hidden"),
      cardsP, cardsE
    };
  });
  out.afterClickProjects = afterProjects;

  // 5. console errors
  out.consoleErrors = page.__consoleErrors || [];

  return out;
}