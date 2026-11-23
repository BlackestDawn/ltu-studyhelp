// The five views of a module: summary, study notes, labs, concept check, resources.
import { $, store } from "../lib/util.js";
import { checkbox, bindChecklists } from "../lib/checklist.js";
import { renderDrill } from "../lib/drill.js";
import { renderMCQ } from "../lib/mcq.js";

export const SECTIONS = [
  { id: "summary", label: "Summary", hint: "The big picture, key takeaways, formulas and common traps." },
  { id: "notes", label: "Study notes", hint: "Section-by-section explanations with examples, interactive models and key terms." },
  { id: "labs", label: "Labs", hint: "Generated problems with answer checking and worked solutions." },
  { id: "quiz", label: "Concept check", hint: "Multiple-choice questions with the reasoning behind every answer." },
  { id: "resources", label: "Resources", hint: "Course reading checklist and further practice." },
];

// A course can rename a section or change its hint; the ids (and so the URLs) stay the same.
export const sectionsFor = c => SECTIONS.map(s => ({ ...s, ...c.labels?.[s.id], ...(s.id === "resources" && c.resourcesHint ? { hint: c.resourcesHint } : {}) }));
const label = (m, id) => sectionsFor(m.course).find(s => s.id === id).label;

const link = (m, sec, text) => `<a href="${m.path}/${sec}" data-link>${text}</a>`;

// Short lecture label ("Lecture 1") for a study-notes section, if the module maps lectures.
const lectureOf = (m, noteId) => (m.lectures || []).find(l => l.notes.includes(noteId))?.title.split(":")[0];

function lectures(m) {
  if (!m.lectures?.length) return "";
  const title = id => m.notes.find(n => n.id === id)?.title ?? id;
  return `<section><h2>Lectures</h2><p class="sub">How this module's material maps onto the course lectures. Each topic links to its study notes.</p>
    <div class="lectures">${m.lectures.map(l => `<div class="card lecture"><h3>${l.title}</h3><p class="pages"><b>Book</b> ${l.pages}${l.slides ? ` <b style="margin-left:8px">Slides</b> ${l.slides}` : ""}</p>
      <ul>${l.notes.map(id => `<li><a href="${m.path}/notes#${m.id}-${id}" data-link>${title(id)}</a></li>`).join("")}</ul>
      <p><b>Focus:</b> ${l.focus}</p><p class="callout"><b>Key takeaway:</b> ${l.takeaway}</p>
      ${l.keys ? `<details class="keys"><summary>The slides' five key takeaways</summary><ol>${l.keys.map(k => `<li>${k}</li>`).join("")}</ol></details>` : ""}</div>`).join("")}</div></section>`;
}

function summary(m) {
  const s = m.summary;
  const el = document.createElement("div");
  el.innerHTML = `
  <section><h2>The big picture</h2><div class="prose">${s.big}</div></section>
  ${lectures(m)}
  <section><h2>Key takeaways</h2><ol class="takeaways">${s.takeaways.map(t => `<li>${t}</li>`).join("")}</ol></section>
  <section><h2>Formula sheet</h2><p class="sub">Every formula used in this module's labs: what it means, what each symbol stands for, and when to reach for it.</p>
    <div class="tblwrap"><table class="formulas"><thead><tr><th>Formula</th><th>What it means</th><th>Use it when</th></tr></thead><tbody>
    ${s.formulas.map(([f, what, when, vars = []]) => `<tr><td><code>${f}</code></td><td>${what}${vars.length ? `<ul class="vars" aria-label="Symbols">${vars.map(([v, d]) => `<li><code>${v}</code> ${d}</li>`).join("")}</ul>` : ""}</td><td>${when}</td></tr>`).join("")}
    </tbody></table></div></section>
  <section><h2>Common traps</h2><ul class="traps">${s.traps.map(t => `<li>${t}</li>`).join("")}</ul></section>
  <section><h2>Check yourself</h2>
    <div class="brief"><div class="focus"><div class="objhead">How to approach this module</div><p>${m.focus}</p>
      <p>Next: read the ${link(m, "notes", "study notes")}, then test yourself in the ${link(m, "quiz", label(m, "quiz").toLowerCase())} or the ${link(m, "labs", label(m, "labs").toLowerCase())}.</p></div>
    <div><div class="objhead">Learning objectives: tick when you can explain it aloud</div>
      <ul class="objs">${m.obj.map((o, i) => checkbox(m.key + i, o)).join("")}</ul></div></div>
    ${m.questions ? `<div class="card study-qs"><div class="objhead">Questions you should be able to answer</div><ol>${m.questions.map(q => `<li>${q}</li>`).join("")}</ol></div>` : ""}
    ${m.concepts ? `<p class="concepts"><span class="objhead">Key concepts</span> ${m.concepts.map(c => `<span class="pill">${c}</span>`).join(" ")}</p>` : ""}</section>`;
  bindChecklists(el);
  return el;
}

function notes(m) {
  const el = document.createElement("div");
  const anchor = id => `${m.id}-${id}`;
  el.innerHTML = `
  <nav class="card toc" aria-label="Study notes contents"><div class="objhead">On this page</div><ol>
    ${m.notes.map(n => `<li><a href="#${anchor(n.id)}">${n.title}</a> <span class="mono">${n.ref.split("·")[0].trim()}${lectureOf(m, n.id) ? ` · ${lectureOf(m, n.id).replace("Lecture ", "L")}` : ""}</span></li>`).join("")}
    <li><a href="#${anchor("terms")}">Key terms</a></li></ol></nav>
  ${m.notes.map(n => `<section class="note" id="${anchor(n.id)}"><h2>${n.title}</h2><p class="pages"><b>Book</b> ${n.ref}${lectureOf(m, n.id) ? ` · <b>${lectureOf(m, n.id)}</b>` : ""}</p>
    <p class="gist">${n.gist}</p><div class="prose">${n.body}</div><div data-widget="${n.id}"></div></section>`).join("")}
  <section class="note" id="${anchor("terms")}"><h2>Key terms</h2>
    <div class="controls"><label>Filter <input type="search" data-filter placeholder="e.g. delay" autocomplete="off"></label><span class="mono" data-count></span></div>
    <dl class="gloss">${m.glossary.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("")}</dl></section>`;
  m.notes.forEach(n => { if (n.widget) $(`[data-widget="${n.id}"]`, el).appendChild(n.widget()); });
  const items = [...el.querySelectorAll(".gloss > div")], count = $("[data-count]", el);
  const filter = q => {
    q = q.trim().toLowerCase();
    let shown = 0;
    items.forEach(it => { const on = !q || it.textContent.toLowerCase().includes(q); it.hidden = !on; shown += on; });
    count.textContent = `${shown} of ${items.length} terms`;
  };
  // The filter text is remembered per module in this browser.
  const box = $("[data-filter]", el), saved = store.get(`gloss:${m.key}`, "");
  box.value = saved;
  box.addEventListener("input", e => { filter(e.target.value); store.set(`gloss:${m.key}`, e.target.value); });
  filter(saved);
  return el;
}

function labs(m) {
  const el = document.createElement("div");
  el.innerHTML = `<p class="sub">Fresh numbers every time. Use “New numbers” until you get each type right twice in a row. Stuck on the idea behind a lab? Each one says which pages it builds on, and the ${link(m, "notes", "study notes")} explain them.</p><div class="stack"></div>`;
  const stack = $(".stack", el);
  m.drills.forEach(d => stack.appendChild(renderDrill(d, m.key)));
  return el;
}

function quiz(m) {
  const el = document.createElement("div");
  el.appendChild(renderMCQ(m.mcq, m.key));
  return el;
}

function resources(m) {
  const el = document.createElement("div");
  el.innerHTML = m.course.resources(m);
  bindChecklists(el);
  return el;
}

export const RENDER = { summary, notes, labs, quiz, resources };
