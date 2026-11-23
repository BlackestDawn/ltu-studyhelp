import { $, store } from "./lib/util.js";
import { getProgress, onProgress } from "./lib/progress.js";
import { startRouter, onRoute } from "./lib/router.js";
import { COURSES, MODULES } from "./courses/index.js";
import { sectionsFor } from "./views/sections.js";
import { moduleView } from "./views/module.js";
import { APP, homeView, courseView, notFoundView } from "./views/home.js";

const app = $("#app"), menu = $("#menu");

/* ---------- old addresses ----------
   Before there was more than one course, the networks modules lived at /m1 … /m8.
   Send those to /networks/m1 … and carry over the saved reading position. */
{
  const old = location.pathname.match(/^\/(m[1-8])(\/[a-z]+)?\/?$/);
  if (old) {
    const path = `/networks/${old[1]}${old[2] || ""}`;
    const pos = store.get(`pos:/${old[1]}${old[2] || ""}`);
    if (pos && !store.get(`pos:${path}`)) store.set(`pos:${path}`, pos);
    history.replaceState(null, "", path + location.hash);
  }
}

/* ---------- module menu in the top bar, grouped by course ---------- */
$("ol", menu).innerHTML = COURSES.map(c =>
  `<li class="grp"><a href="/${c.id}" data-link data-course="${c.id}">${c.short}</a></li>` + c.modules.map(m =>
  `<li><a href="${m.path}" data-link data-mod="${m.key}"><span class="n">M${m.num}</span><span>${m.short}</span><span class="sc" data-sc="${m.key}" hidden></span></a></li>`).join("")).join("");
document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.open) { menu.open = false; $("summary", menu).focus(); } });

function updateBadges() {
  const p = getProgress();
  MODULES.forEach(m => document.querySelectorAll(`[data-sc="${m.key}"]`).forEach(el => {
    const n = p[m.key] || 0;
    el.textContent = n ? `${n} solved` : "";
    el.hidden = !n;
  }));
}

/* ---------- reading position ----------
   Saved per page as "which element is at the top of the reading area, and how
   far into it", so it still lands in the right place after an update changes
   the content above. Falls back to the plain scroll offset. Restored only when
   the app loads (reload, reopened tab, update); in-app navigation is unchanged. */
const ANCHORS = "[id], h2, h3, .mcq > li, .drill, .card, .gloss > div";
history.scrollRestoration = "manual";

function readingLine() {
  const tabs = app.querySelector("nav.tabs");
  return tabs ? Math.max(0, tabs.getBoundingClientRect().bottom) : 0;
}
function anchors() {
  return [...app.querySelectorAll(ANCHORS)].filter(el => el.offsetParent !== null && !el.closest("[hidden]"));
}
function savePosition() {
  if (current === null) return;
  const line = readingLine(), list = anchors();
  const i = list.findIndex(el => el.getBoundingClientRect().bottom > line);
  const el = list[i];
  store.set(`pos:/${current}`, {
    y: Math.round(scrollY),
    a: el ? (el.id ? `#${el.id}` : `@${i}`) : null,
    o: el ? Math.round(line - el.getBoundingClientRect().top) : 0,
  });
}
function restorePosition(path) {
  const pos = store.get(`pos:${path}`);
  if (!pos) return;
  const apply = () => {
    let el = null;
    if (pos.a?.startsWith("#")) el = document.getElementById(pos.a.slice(1));
    else if (pos.a?.startsWith("@")) el = anchors()[+pos.a.slice(1)];
    if (el && !el.closest("[hidden]")) scrollTo(0, el.getBoundingClientRect().top + scrollY - readingLine() + pos.o);
    else scrollTo(0, pos.y);
  };
  apply();
  // Web fonts can shift the layout after first paint; re-apply unless the reader has moved.
  let moved = false;
  const stop = () => { moved = true; };
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(t => addEventListener(t, stop, { once: true, passive: true }));
  document.fonts?.ready.then(() => { if (!moved) requestAnimationFrame(apply); });
}
let saveTimer = 0;
addEventListener("scroll", () => { clearTimeout(saveTimer); saveTimer = setTimeout(savePosition, 200); }, { passive: true });
addEventListener("pagehide", savePosition);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") savePosition(); });

/* ---------- routes: /  ·  /:course  ·  /:course/:module  ·  /:course/:module/:section ---------- */
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
  if (current !== null) savePosition();
  const prevMod = current?.split("/").slice(0, 2).join("/");
  current = key;
  const c = COURSES.find(x => x.id === parts[0]);
  const m = c?.modules.find(x => x.id === parts[1]);
  menu.querySelectorAll("[data-mod]").forEach(a => a.toggleAttribute("aria-current", a.dataset.mod === m?.key));
  menu.querySelectorAll("[data-course]").forEach(a => a.toggleAttribute("aria-current", a.dataset.course === c?.id && !m));

  if (!parts.length) {
    app.replaceChildren(homeView());
    document.title = APP;
    return scrollTo(0, 0);
  }
  if (c && parts.length === 1) {
    app.replaceChildren(courseView(c));
    document.title = `${c.title} · ${APP}`;
    return scrollTo(0, 0);
  }
  const sec = parts[2] || "summary", s = c && sectionsFor(c).find(x => x.id === sec);
  if (!m || !s || parts.length > 3) {
    app.replaceChildren(notFoundView());
    document.title = `Not found · ${APP}`;
    return;
  }
  if (!views.has(m.key)) views.set(m.key, moduleView(m));
  const v = views.get(m.key);
  if (app.firstChild !== v.el) app.replaceChildren(v.el);
  v.show(sec);
  updateBadges();
  document.title = `${s.label} · Module ${m.num}: ${m.short} · ${c.short} · ${APP}`;
  if (location.hash) scrollToHash();
  else if (prevMod !== `${c.id}/${m.id}`) scrollTo(0, 0);
  else if (scrollY > v.tabsTop()) scrollTo(0, v.tabsTop());
}

onRoute(render);
onProgress(updateBadges);
startRouter();
updateBadges();
if (!location.hash) restorePosition(location.pathname.replace(/\/$/, "") || "/");
