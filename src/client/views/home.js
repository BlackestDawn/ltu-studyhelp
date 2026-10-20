// Landing page: what the workbench is, ways in by learning style, and the module list.
import { getProgress } from "../lib/progress.js";
import { countChecked } from "../lib/checklist.js";
import { MODULES } from "../modules/index.js";

const WAYS = [
  ["Read first", "Start with a module's <b>Summary</b> for the big picture, then work through the <b>Study notes</b> section by section.", "summary"],
  ["Learn by doing", "Go straight to the <b>Labs</b>: every problem has fresh numbers, answer checking and a worked solution.", "labs"],
  ["Test yourself", "Use the <b>Concept check</b> to find gaps. Every answer explains why each option is right or wrong.", "quiz"],
  ["Go further", "<b>Resources</b> lists the course reading, end-of-chapter problems and the book authors' own exercises.", "resources"],
];

export function homeView() {
  const el = document.createElement("div");
  const progress = getProgress();
  el.innerHTML = `
  <header class="top"><div class="wrap">
    <div class="eyebrow">Computer Networking · Kurose &amp; Ross 8e</div>
    <h1>Networks Midterm Workbench</h1>
    <p class="lede">Study one module at a time, in the way that suits you: read summaries and study notes, explore interactive models, or learn by doing with labs that generate fresh numbers, check your answers and show worked solutions.</p>
    <div class="hdr" aria-hidden="true">
      <div class="s2"><b>src</b>you</div><div class="s2"><b>dst</b>midterm</div><div class="s2"><b>proto</b>read · do · check</div><div class="s2"><b>ttl</b>${MODULES.length} modules</div>
      <div class="s4"><b>payload</b>notes · labs · models · concept checks</div><div class="s4"><b>checksum</b>worked solutions</div>
    </div>
  </div></header>
  <main class="wrap">
    <section><h2>Pick your way in</h2><div class="ways">
      ${WAYS.map(([t, d]) => `<div class="card way"><h3>${t}</h3><p>${d}</p></div>`).join("")}
    </div><p class="sub">Every module has the same five sections, so you can mix and match.</p></section>
    <section><h2>Modules</h2><div class="modgrid">
      ${MODULES.map(m => {
        const solved = progress[m.id] || 0, ticked = countChecked(m.id, m.obj.length);
        return `<a class="card modcard" href="/${m.id}" data-link>
          <span class="eyebrow">Module ${m.num} · Chapter ${m.chapter}</span>
          <h3>${m.title}</h3><p>${m.blurb}</p>
          <span class="meta">${m.notes.length} topics · ${m.drills.length} labs · ${m.mcq.length} questions</span>
          <span class="meta">${ticked}/${m.obj.length} objectives ticked${solved ? ` · ${solved} lab${solved > 1 ? "s" : ""} solved` : ""}</span>
        </a>`;
      }).join("")}
    </div></section>
  </main>`;
  return el;
}

export function notFoundView() {
  const el = document.createElement("main");
  el.className = "wrap";
  el.innerHTML = `<h1 style="margin-top:2rem">Page not found</h1><p class="sub">There is no page at this address.</p><p><a href="/" data-link>Go to all modules</a></p>`;
  return el;
}
