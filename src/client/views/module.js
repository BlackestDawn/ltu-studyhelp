// One module page: header, sticky section tabs, lazily rendered section panels.
import { $ } from "../lib/util.js";
import { getProgress } from "../lib/progress.js";
import { sectionsFor, RENDER } from "./sections.js";

export function moduleView(m) {
  const c = m.course, mods = c.modules, sections = sectionsFor(c);
  const i = mods.indexOf(m), prev = mods[i - 1], next = mods[i + 1];
  const el = document.createElement("div");
  const solved = getProgress()[m.key] || 0;
  el.innerHTML = `
  <header class="modhead"><div class="wrap">
    <a class="crumb" href="/${c.id}" data-link>← All modules</a>
    <div class="eyebrow">${c.modEyebrow(m)}</div>
    <h1>${m.title}</h1><p class="lede">${m.blurb}</p>
  </div></header>
  <nav class="tabs" aria-label="Module sections"><div class="wrap">
    ${sections.map(s => `<a class="tab" href="${m.path}/${s.id}" data-link data-sec="${s.id}" title="${s.hint}">${s.label}${s.id === "labs" ? `<span class="sc" data-sc="${m.key}"${solved ? "" : " hidden"}>${solved} solved</span>` : ""}</a>`).join("")}
  </div></nav>
  <main class="wrap">${sections.map(s => `<section class="panel" data-panel="${s.id}" hidden></section>`).join("")}
    <nav class="pager" aria-label="Other modules">
      ${prev ? `<a href="${prev.path}" data-link>← Module ${prev.num}: ${prev.short}</a>` : "<span></span>"}
      ${next ? `<a href="${next.path}" data-link>Module ${next.num}: ${next.short} →</a>` : ""}
    </nav>
  </main>`;
  const head = $(".modhead", el);

  return {
    el,
    show(sec) {
      sections.forEach(s => {
        const panel = $(`[data-panel="${s.id}"]`, el), on = s.id === sec;
        if (on && !panel.childElementCount) panel.appendChild(RENDER[s.id](m));
        panel.hidden = !on;
        const tab = $(`[data-sec="${s.id}"]`, el);
        if (on) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current");
      });
    },
    // Scroll position that puts the section tabs at the top of the viewport.
    tabsTop: () => head.offsetTop + head.offsetHeight,
  };
}
