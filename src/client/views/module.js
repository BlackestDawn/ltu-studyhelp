// One module page: header, sticky section tabs, lazily rendered section panels.
import { $ } from "../lib/util.js";
import { getProgress } from "../lib/progress.js";
import { MODULES } from "../modules/index.js";
import { SECTIONS, RENDER } from "./sections.js";

const pageRange = m => `pp. ${m.read[0][1].split("–")[0]}–${m.read.at(-1)[1].split("–").at(-1)}`;

export function moduleView(m) {
  const i = MODULES.indexOf(m), prev = MODULES[i - 1], next = MODULES[i + 1];
  const el = document.createElement("div");
  const solved = getProgress()[m.id] || 0;
  el.innerHTML = `
  <header class="modhead"><div class="wrap">
    <a class="crumb" href="/" data-link>← All modules</a>
    <div class="eyebrow">Module ${m.num} · Chapter ${m.chapter} · ${pageRange(m)}</div>
    <h1>${m.title}</h1><p class="lede">${m.blurb}</p>
  </div></header>
  <nav class="tabs" aria-label="Module sections"><div class="wrap">
    ${SECTIONS.map(s => `<a class="tab" href="/${m.id}/${s.id}" data-link data-sec="${s.id}" title="${s.hint}">${s.label}${s.id === "labs" ? `<span class="sc" data-sc="${m.id}"${solved ? "" : " hidden"}>${solved} solved</span>` : ""}</a>`).join("")}
  </div></nav>
  <main class="wrap">${SECTIONS.map(s => `<section class="panel" data-panel="${s.id}" hidden></section>`).join("")}
    <nav class="pager" aria-label="Other modules">
      ${prev ? `<a href="/${prev.id}" data-link>← Module ${prev.num}: ${prev.short}</a>` : "<span></span>"}
      ${next ? `<a href="/${next.id}" data-link>Module ${next.num}: ${next.short} →</a>` : ""}
    </nav>
  </main>`;
  const head = $(".modhead", el);

  return {
    el,
    show(sec) {
      SECTIONS.forEach(s => {
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
