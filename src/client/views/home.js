// Landing page (pick a course) and course page (ways in by learning style, and the module list).
import { getProgress } from "../lib/progress.js";
import { countChecked } from "../lib/checklist.js";
import { COURSES } from "../courses/index.js";
import { sectionsFor } from "./sections.js";

export const APP = "Study Workbench";

const solvedIn = (c, progress) => c.modules.reduce((n, m) => n + (progress[m.key] || 0), 0);

export function homeView() {
  const el = document.createElement("div");
  const progress = getProgress();
  el.innerHTML = `
  <header class="top"><div class="wrap">
    <div class="eyebrow">Course workbenches</div>
    <h1>${APP}</h1>
    <p class="lede">Pick a course. Each one is split into modules with the same five sections: a summary, study notes with interactive models, practice problems that generate fresh numbers and show worked solutions, a concept check, and the course reading.</p>
  </div></header>
  <main class="wrap">
    <section><h2>Courses</h2><div class="modgrid">
      ${COURSES.map(c => {
        const solved = solvedIn(c, progress);
        const ticked = c.modules.reduce((n, m) => n + countChecked(m.key, m.obj.length), 0), total = c.modules.reduce((n, m) => n + m.obj.length, 0);
        return `<a class="card modcard coursecard" href="/${c.id}" data-link>
          <span class="eyebrow">${c.eyebrow}</span>
          <h3>${c.title}</h3><p>${c.blurb}</p>
          <span class="meta">${c.modules.length} modules · ${c.modules.reduce((n, m) => n + m.drills.length, 0)} ${c.labsNoun} · ${c.modules.reduce((n, m) => n + m.mcq.length, 0)} questions</span>
          <span class="meta">${ticked}/${total} objectives ticked${solved ? ` · ${solved} solved` : ""}</span>
        </a>`;
      }).join("")}
    </div></section>
  </main>`;
  return el;
}

export function courseView(c) {
  const el = document.createElement("div");
  const progress = getProgress();
  const S = Object.fromEntries(sectionsFor(c).map(s => [s.id, s.label]));
  const ways = [
    ["Read first", `Start with a module's <b>${S.summary}</b> for the big picture, then work through the <b>${S.notes}</b> section by section.`],
    ["Learn by doing", `Go straight to the <b>${S.labs}</b>: every problem has fresh numbers, answer checking and a worked solution.`],
    ["Test yourself", `Use the <b>${S.quiz}</b> to find gaps. Every answer explains why each option is right or wrong.`],
    ["Go further", `<b>${S.resources}</b> lists the course reading${c.id === "networks" ? ", end-of-chapter problems and the book authors' own exercises" : ", the lecture slides, the book's review questions and the module's lab"}.`],
  ];
  el.innerHTML = `
  <header class="top"><div class="wrap">
    <a class="crumb" href="/" data-link>← All courses</a>
    <div class="eyebrow">${c.eyebrow}</div>
    <h1>${c.title}</h1>
    <p class="lede">${c.lede}</p>
    <div class="hdr" aria-hidden="true">${c.hdr(c.modules.length).map(([cls, k, v]) => `<div class="${cls}"><b>${k}</b>${v}</div>`).join("")}</div>
  </div></header>
  <main class="wrap">
    ${c.about ? `<section>${c.about}</section>` : ""}
    <section><h2>Pick your way in</h2><div class="ways">
      ${ways.map(([t, d]) => `<div class="card way"><h3>${t}</h3><p>${d}</p></div>`).join("")}
    </div><p class="sub">Every module has the same five sections, so you can mix and match.</p></section>
    <section><h2>Modules</h2><div class="modgrid">
      ${c.modules.map(m => {
        const solved = progress[m.key] || 0, ticked = countChecked(m.key, m.obj.length);
        return `<a class="card modcard" href="${m.path}" data-link>
          <span class="eyebrow">${c.cardEyebrow(m)}</span>
          <h3>${m.title}</h3><p>${m.blurb}</p>
          <span class="meta">${m.notes.length} topics · ${m.drills.length} ${c.labsNoun} · ${m.mcq.length} questions</span>
          <span class="meta">${ticked}/${m.obj.length} objectives ticked${solved ? ` · ${solved} solved` : ""}</span>
        </a>`;
      }).join("")}
    </div></section>
    <p class="sub foot-note">${c.footnote}</p>
  </main>`;
  return el;
}

export function notFoundView() {
  const el = document.createElement("main");
  el.className = "wrap";
  el.innerHTML = `<h1 style="margin-top:2rem">Page not found</h1><p class="sub">There is no page at this address.</p><p><a href="/" data-link>Go to all courses</a></p>`;
  return el;
}
