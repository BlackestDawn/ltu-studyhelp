import { $ } from "./lib/util.js";
import { getProgress, onProgress } from "./lib/progress.js";
import { startRouter, onRoute } from "./lib/router.js";
import { MODULES } from "./modules/index.js";
import { SECTIONS } from "./views/sections.js";
import { moduleView } from "./views/module.js";
import { homeView, notFoundView } from "./views/home.js";

const APP = "Networks Midterm Workbench";
const app = $("#app"), menu = $("#menu");

/* ---------- module menu in the top bar ---------- */
$("ol", menu).innerHTML = MODULES.map(m =>
  `<li><a href="/${m.id}" data-link data-mod="${m.id}"><span class="n">M${m.num}</span><span>${m.short}</span><span class="sc" data-sc="${m.id}" hidden></span></a></li>`).join("");
document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.open) { menu.open = false; $("summary", menu).focus(); } });

function updateBadges() {
  const p = getProgress();
  MODULES.forEach(m => document.querySelectorAll(`[data-sc="${m.id}"]`).forEach(el => {
    const n = p[m.id] || 0;
    el.textContent = n ? `${n} solved` : "";
    el.hidden = !n;
  }));
}

/* ---------- routes: /  ·  /:module  ·  /:module/:section ---------- */
const views = new Map();
let current = null;

function scrollToHash() {
  const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (t) t.scrollIntoView();
}

function render(path) {
  const parts = path.split("/").filter(Boolean), key = parts.join("/");
  menu.open = false;
  if (key === current) return scrollToHash();
  const prevMod = current?.split("/")[0];
  current = key;
  menu.querySelectorAll("[data-mod]").forEach(a => a.toggleAttribute("aria-current", a.dataset.mod === parts[0]));

  if (!parts.length) {
    app.replaceChildren(homeView());
    document.title = APP;
    return scrollTo(0, 0);
  }
  const m = MODULES.find(x => x.id === parts[0]), sec = parts[1] || "summary", s = SECTIONS.find(x => x.id === sec);
  if (!m || !s || parts.length > 2) {
    app.replaceChildren(notFoundView());
    document.title = `Not found · ${APP}`;
    return;
  }
  if (!views.has(m.id)) views.set(m.id, moduleView(m));
  const v = views.get(m.id);
  if (app.firstChild !== v.el) app.replaceChildren(v.el);
  v.show(sec);
  updateBadges();
  document.title = `${s.label} · Module ${m.num}: ${m.short} · ${APP}`;
  if (location.hash) scrollToHash();
  else if (prevMod !== m.id) scrollTo(0, 0);
  else if (scrollY > v.tabsTop()) scrollTo(0, v.tabsTop());
}

onRoute(render);
onProgress(updateBadges);
startRouter();
updateBadges();
