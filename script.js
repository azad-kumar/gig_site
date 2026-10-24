/* Azad Kumar portfolio: rolling-counter hero.
   One rAF loop (sleeps when idle), transform/opacity only, cached layout, auto-roll every 5s. */
(() => {
'use strict';

/* ---------- constants & environment ---------- */
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/+!?-&";
const N = CHARS.length;
const IDX = {}; [...CHARS].forEach((c, i) => IDX[c] = i);
const SCENES = [
  { t: "AZAD KUMAR",   c: "Hi, I'm Azad Kumar. I turn *raw data* into *strategic decisions.*" },
  { t: "DATA ANALYST", c: "SQL, Power BI, and exploratory analysis that turn *complex numbers* into *actionable insight.*" },
  { t: "DATA SCIENTIST", c: "Python, predictive models, and machine learning pipelines that solve *core business problems.*" }
];
const ROLL_MS = 5000, DRUMS = 14;
const STEP = 34 * Math.PI / 180, HALF_PI = Math.PI / 2, SIN17 = Math.sin(17 * Math.PI / 180);

const $ = id => document.getElementById(id);
const mod = (a, n) => ((a % n) + n) % n;

const ease = u => { const c = 1.35, v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; }; // back-out

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

const counter = $("counter"), cap = $("cap");
const segs = [...document.querySelectorAll(".seg")];

/* ---------- the loop: only tweening drums are touched ---------- */
const active = [];
let running = false, paused = false;
function wake() { if (!running && !paused) { running = true; requestAnimationFrame(frame); } }

/* ---------- drum: projected cylinder, 6 faces, cached writes ---------- */
class Drum {
  constructor(chars) {
    this.chars = chars; this.n = chars.length;
    this.p = 0; this.t0 = null; this.act = false; this.h = 0; this.R = 0;
    this.cell = document.createElement("div"); this.cell.className = "cell";
    this.cell.innerHTML = "<span class=f></span>".repeat(6) + "<div class=sh></div>";
    this.f = [...this.cell.children].slice(0, 6); this.key = Array(6).fill(""); this.txt = Array(6).fill("");
  }
  setH(h) { this.h = h; this.R = h / (2 * SIN17); this.key.fill(""); this.render(this.p); }
  render(p) {
    if (!this.h) return;
    const b = Math.floor(p), fr = p - b;
    for (let k = 0; k < 6; k++) {
      const o = k - 2, a = (o - fr) * STEP, el = this.f[k];
      if (Math.abs(a) >= HALF_PI) {
        if (this.key[k] !== "h") { this.key[k] = "h"; el.style.visibility = "hidden"; }
        continue;
      }
      const s = Math.cos(a), y = (this.R * Math.sin(a)).toFixed(1), sc = s.toFixed(3);
      const key = y + "|" + sc;
      if (key !== this.key[k]) {
        this.key[k] = key;
        el.style.visibility = "visible";
        el.style.transform = "translate3d(0," + y + "px,0) scaleY(" + sc + ")";
        el.style.opacity = Math.min(1, s * 1.25).toFixed(2);
      }
      const ch = this.chars[mod(b + o, this.n)];
      if (ch !== this.txt[k]) { this.txt[k] = ch; el.textContent = ch; }
    }
  }
  roll(t, delay, extra, now, instant) {
    if (instant) { this.t0 = null; this.p = t; this.render(t); return; }
    const f = this.p, c = Math.ceil(f - 1e-6), to = c + mod(t - c, this.n) + extra * this.n;
    if (Math.abs(to - f) < 1e-3) return;                    // already there, no spin
    this.from = f; this.to = to;
    this.dur = Math.min(2, .6 + .022 * (to - f)) * 1000;     // 0.6s + 0.022s per char, max 2s
    this.t0 = now + delay;
    this.track();
  }

  track() { if (!this.act) { this.act = true; active.push(this); } }
  step(now) {                                               // returns true while still animating
    let live = false, p = this.p;
    if (this.t0 !== null) {
      live = true;
      if (now >= this.t0) {
        const u = (now - this.t0) / this.dur;
        if (u >= 1) { p = mod(this.to, this.n); this.t0 = null; live = false; }
        else p = this.from + (this.to - this.from) * ease(u);
        this.p = p;
      }
    }
    this.render(p);
    return live;
  }
}

/* ---------- build main counter (14 drums) ---------- */
const drums = [];
for (let i = 0; i < DRUMS; i++) {
  const d = new Drum(CHARS); drums.push(d); counter.appendChild(d.cell);
}

/* ---------- measure once and on resize, never inside the loop ---------- */
function measure() {
  const h = drums[0].cell.offsetHeight / 1.62;
  if (h) drums.forEach(d => d.setH(h));
}
new ResizeObserver(measure).observe(counter);

/* ---------- scenes ---------- */
let scene = 0, rollN = 0, started = false, nextRoll = Infinity, capT = 0, rollT = 0;

function layout(t) {                                       // centre text across 14 drums
  const a = Array(DRUMS).fill(" "), s = Math.floor((DRUMS - t.length) / 2);
  for (let i = 0; i < t.length; i++) a[s + i] = t[i];
  return a;
}
function parseCaption(txt) {                               // *word* -> accent italic
  const out = [], segs = txt.split("*");
  segs.forEach((seg, i) => {
    if (!seg) return;
    const em = i % 2 === 1, words = seg.trim().split(/\s+/);
    const midWord = i > 0 && !/\s$/.test(segs[i - 1]) && !/^\s/.test(seg);
    if (midWord && out.length) out[out.length - 1].t += words.shift();
    words.forEach(w => w && out.push({ t: w, em }));
  });
  return out;
}
function restart(el, cls) {                                // re-trigger a CSS animation without reading layout
  el.classList.remove(cls); clearTimeout(el._t); el._t = setTimeout(() => el.classList.add(cls), 24);
}
function progress() {
  segs.forEach((s, k) => { s.classList.toggle("done", k < scene); s.classList.remove("run"); });
  restart(segs[scene], "run");
}
function go(i, extra) {
  const now = performance.now(), m = rollN++ % 3;
  scene = i; started = true; nextRoll = now + ROLL_MS;     // 5s counted from this roll's start
  const chars = layout(SCENES[i].t);
  drums.forEach((d, k) => {
    const delay = m === 0 ? k * 60 : m === 1 ? (DRUMS - 1 - k) * 60 : Math.floor(Math.abs(k - 6.5)) * 120;
    d.roll(IDX[chars[k]], REDUCED ? 0 : delay, extra, now, REDUCED);
  });
  counter.setAttribute("aria-label", "Azad Kumar portfolio counter showing " + SCENES[i].t + ". Press to show the next scene.");
  cap.classList.remove("in");
  cap.innerHTML = parseCaption(SCENES[i].c).map((w, k) =>
    '<span class="w"><span class="wi' + (w.em ? " em" : "") + '" style="transition-delay:' + k * 45 + 'ms">' + w.t + "</span></span>").join(" ");
  clearTimeout(capT); capT = setTimeout(() => cap.classList.add("in"), 30);
  progress(); scheduleRoll(); wake();
}

/* ---------- single timer: auto-roll, one setTimeout chained to nextRoll ---------- */
function tick() {
  rollT = 0;
  if (paused || !started) return;
  if (performance.now() >= nextRoll) go((scene + 1) % 3, Math.random() < .3 ? 1 : 0);
  else scheduleRoll();
}
function scheduleRoll() {
  clearTimeout(rollT); rollT = 0;
  if (started && !paused) rollT = setTimeout(tick, Math.max(0, nextRoll - performance.now()));
}

/* ---------- pause when hidden or off-screen; resume with a fresh countdown ---------- */
let hiddenTab = document.hidden, inView = true;
function sync() {
  const p = hiddenTab || !inView;
  if (p === paused) return;
  paused = p; document.body.classList.toggle("paused", p);
  if (!p) { if (started) { nextRoll = performance.now() + ROLL_MS; progress(); } scheduleRoll(); wake(); }
  else clearTimeout(rollT);
}
document.addEventListener("visibilitychange", () => { hiddenTab = document.hidden; sync(); });
/* instant-hide both bottom hero indicators once the hero tagline starts scrolling off */
const heroIndicators = [...document.querySelectorAll(".hero-bottom-indicators .hero-indicator")];
function syncIndicators() {
  const hide = scrollY > 80;
  heroIndicators.forEach(el => el.classList.toggle("is-hidden", hide));
}
syncIndicators();
new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }).observe($("hero"));

/* ---------- one passive scroll listener for indicators, nav and lens position ---------- */
const navEl = document.querySelector(".nav");
let scrollTick = false;
function onScroll() {
  scrollTick = false;
  if (navEl) navEl.classList.toggle("is-scrolled", scrollY > 20);
  syncIndicators();
  syncLens();
}
addEventListener("scroll", () => { if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ---------- lens position tracking ---------- */
const lens = $("data-lens");
function syncLens() {}                                        // replaced below when the lens is enabled
if (lens && !matchMedia("(max-width:560px)").matches) {
  const dashboard = lens.querySelector(".clean-dashboard-bg .dash");
  if (dashboard) {
    const zoomedDashboard = dashboard.cloneNode(true);
    zoomedDashboard.classList.add("dash-zoom");
    zoomedDashboard.setAttribute("aria-hidden", "true");
    zoomedDashboard.setAttribute("role", "presentation");
    dashboard.parentElement.appendChild(zoomedDashboard);
    lens.classList.add("has-lens-zoom");
  }
  /* only these layers read the pointer, so the vars are written here and nowhere else */
  const lensVars = [lens.querySelector(".clean-dashboard-bg"), lens.querySelector(".dash-zoom"), lens.querySelector(".lens-ring")].filter(Boolean);
  let lensFrame = 0, lx = 0, ly = 0, lensPointerActive = false, lensKeyboardActive = false, lensPositionKnown = false;
  const setLensVars = (x, y) => {
    for (const el of lensVars) { el.style.setProperty("--mouse-x", x + "px"); el.style.setProperty("--mouse-y", y + "px"); }
  };
  const setLensPosition = (x, y) => {
    const rect = lens.getBoundingClientRect();
    lx = Math.max(0, Math.min(lens.clientWidth, x - rect.left - lens.clientLeft));
    ly = Math.max(0, Math.min(lens.clientHeight, y - rect.top - lens.clientTop));
    setLensVars(lx, ly);
  };
  const queueLensPosition = (x, y) => {                     // only one update per frame
    if (lensFrame) return;
    lensFrame = requestAnimationFrame(() => {
      lensFrame = 0;
      setLensPosition(x, y);
    });
  };
  const moveLens = e => {
    lensPointerActive = true;
    lens.classList.add("lens-active");
    queueLensPosition(e.clientX, e.clientY);
  };
  const leaveLens = () => {
    lensPointerActive = false;
    if (!lensKeyboardActive) lens.classList.remove("lens-active");
  };
  lens.addEventListener("pointerenter", moveLens, { passive: true });
  lens.addEventListener("pointermove", moveLens, { passive: true });
  lens.addEventListener("pointerdown", moveLens, { passive: true });
  lens.addEventListener("pointerleave", leaveLens, { passive: true });
  lens.addEventListener("pointercancel", leaveLens, { passive: true });
  lens.addEventListener("pointerup", e => {
    if (e.pointerType === "touch") leaveLens();
  }, { passive: true });
  lens.addEventListener("focus", () => {
    lensKeyboardActive = true;
    lens.classList.add("lens-active");
    if (!lensPointerActive) {
      const rect = lens.getBoundingClientRect();
      queueLensPosition(rect.left + lens.clientLeft + lens.clientWidth / 2, rect.top + lens.clientTop + lens.clientHeight / 2);
    }
  });
  lens.addEventListener("blur", () => {
    lensKeyboardActive = false;
    if (!lensPointerActive) lens.classList.remove("lens-active");
  });
  lens.addEventListener("keydown", e => {
    const step = e.shiftKey ? 80 : 40;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape"].includes(e.key)) return;
    e.preventDefault();
    if (lensFrame) { cancelAnimationFrame(lensFrame); lensFrame = 0; }
    if (!lensPositionKnown) {                                // first key: start from the centre
      lx = lens.clientWidth / 2;
      ly = lens.clientHeight / 2;
      lensPositionKnown = true;
    }
    if (e.key === "Escape") lx = lens.clientWidth / 2, ly = lens.clientHeight / 2;
    else {
      lx = Math.max(0, Math.min(lens.clientWidth, lx + (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0)));
      ly = Math.max(0, Math.min(lens.clientHeight, ly + (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0)));
    }
    setLensVars(lx, ly);
  });
  const refreshLensPosition = () => {                        // page moved under a live lens
    if (lensPositionKnown && lens.classList.contains("lens-active")) setLensPosition(lx, ly);
  };
  syncLens = refreshLensPosition;
  addEventListener("resize", refreshLensPosition, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("scroll", refreshLensPosition, { passive: true });
    window.visualViewport.addEventListener("resize", refreshLensPosition, { passive: true });
  }
  new ResizeObserver(refreshLensPosition).observe(lens);
}


/* ---------- THE loop: drums, then it sleeps (no tilt) ---------- */
function frame(now) {
  if (paused) { running = false; return; }
  for (let i = active.length - 1; i >= 0; i--) {           // only tweening drums
    const d = active[i];
    if (!d.step(now)) { d.act = false; active.splice(i, 1); }
  }
  let busy = active.length > 0;
  if (busy) requestAnimationFrame(frame);
  else running = false;
}

/* ---------- interactions ---------- */
const next = extra => go((scene + 1) % 3, extra);
counter.addEventListener("click", () => next(1));
counter.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(1); }
});

/* ---------- start: measure, scramble, then spin 2 turns onto scene 1 ---------- */
measure();
drums.forEach(d => { const r = Math.random() * N | 0; d.p = r; d.render(r); });
setTimeout(() => go(0, 2), 450);

/* ---------- sections: reveal, project toggle, preview modal (anchor scrolls are CSS) ---------- */
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("on"); io.unobserve(x.target); } }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const btns = [...document.querySelectorAll(".toggle-btn")];
const grids = { ds: $("grid-ds"), da: $("grid-da") };
btns.forEach(b => b.addEventListener("click", () => {
  btns.forEach(x => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
  Object.entries(grids).forEach(([k, g]) => { if (g) g.classList.toggle("is-hidden", k !== b.dataset.filter); });
}));

const PREVIEWS = {
  churn:   { k: "Streamlit — Churn", title: "Customer Churn & Retention Predictor", note: "XGBoost + SHAP demo. Replace src with your Streamlit share URL.", url: "about:blank" },
  clv:     { k: "Jupyter — Segmentation", title: "E-Commerce CLV & Segmentation", note: "RFM + K-Means notebook. Replace src with your nbviewer / Colab embed.", url: "about:blank" },
  nlp:     { k: "FastAPI — NLP", title: "Sentiment & Feedback NLP Engine", note: "HuggingFace + FastAPI demo. Replace src with your hosted endpoint UI.", url: "about:blank" },
  revenue: { k: "Power BI — Revenue", title: "Executive Revenue & Operations Dashboard", note: "Power BI embed. Replace src with your publish-to-web URL.", url: "about:blank" },
  abtest:  { k: "Analytics — A/B", title: "A/B Testing & User Behavior Analysis", note: "SciPy experiment notebook. Replace src with your notebook embed.", url: "about:blank" },
  supply:  { k: "Analytics — Forecast", title: "Supply Chain & Demand Forecasting", note: "Statsmodels forecast notebook. Replace src with your notebook embed.", url: "about:blank" }
};
const modal = $("preview-modal"), pFrame = $("preview-frame"), pTitle = $("preview-title"), pKick = $("preview-kicker"), pNote = $("preview-note");
function openPreview(key) {
  const p = PREVIEWS[key]; if (!p || !modal) return;
  pKick.textContent = p.k; pTitle.textContent = p.title; pNote.textContent = p.note; pFrame.src = p.url;
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
}
function closePreview() { if (!modal) return; modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); pFrame.src = ""; }
document.querySelectorAll("[data-preview]").forEach(b => b.addEventListener("click", () => openPreview(b.dataset.preview)));
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closePreview));
addEventListener("keydown", e => { if (e.key === "Escape") closePreview(); });
})();
