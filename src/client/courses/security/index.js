// Computer and Network Security (Z0026E), taught from Stallings & Brown,
// Computer Security: Principles and Practice (4th ed., global edition).
// No exam: four Canvas quizzes and four SEED labs.
import { checkbox } from "../../lib/checklist.js";
import m1 from "./m1/index.js";
import m2 from "./m2/index.js";
import m3 from "./m3/index.js";
import m4 from "./m4/index.js";

const about = `<h2>How the course is assessed</h2>
  <p class="sub">There is no final exam. Each module has a theory week ending in a quiz, then a practical week with a SEED lab.</p>
  <div class="assess">
    <div class="card"><h3>Four quizzes</h3><ul>
      <li>Quiz 1: hashes and symmetric encryption (Module 1)</li>
      <li>Quiz 2: public-key cryptography (Module 3)</li>
      <li>Quiz 3: authentication protocols (Module 4)</li>
      <li>Quiz 4: SSL/TLS (Module 4)</li></ul>
      <p>On Canvas, <b>one attempt each</b>, open book (textbook and lecture notes), each with its own deadline. Expect calculations and fill-in-the-blank, short answers, multiple choice, multiple answers and true/false.</p></div>
    <div class="card"><h3>Four labs</h3><ul>
      <li>Lab 1: symmetric-key encryption</li><li>Lab 2: SQL injection</li><li>Lab 3: public-key encryption</li><li>Lab 4: TCP vulnerabilities</li></ul>
      <p>SEED labs in the SEED Ubuntu 20.04 VM, in groups of 3–4, with a lab report and an <b>oral group presentation</b> at the end of the lab week. All four must be passed.</p></div>
    <div class="card"><h3>Grades</h3><ul>
      <li>Quizzes give at most <b>120 points</b> in total.</li>
      <li>Pass needs <b>60 points</b>, with <b>at least 10 from every quiz</b>, and all labs completed.</li>
      <li>3: 60–79 · 4: 80–100 · 5: 101–120.</li>
      <li>Re-assessment can give at most grade 3.</li></ul></div>
  </div>`;

const SEED = "https://seedsecuritylabs.org/";

export default {
  id: "security",
  keyPrefix: "sec-",
  title: "Computer and Network Security",
  short: "Security",
  eyebrow: "Z0026E · Stallings &amp; Brown 4e",
  blurb: "Security fundamentals, hashes and HMAC, symmetric and public-key cryptography, web security, authentication and network security, with practice in the style of the four quizzes.",
  lede: "Four modules that follow the course's lectures. Read the notes, step through the interactive models, and practise with generated problems in the style of the quizzes: block-cipher modes on the lecture's 4-bit cipher, RSA signatures, key-distribution protocols and SSL captures.",
  hdr: n => [["s2", "key", "you"], ["s2", "iv", "fresh every time"], ["s2", "mode", "read · do · check"], ["s2", "blocks", `${n} modules`],
    ["s4", "plaintext", "notes · practice · models · concept checks"], ["s4", "hmac", "worked solutions"]],
  about,
  footnote: "Book references are to Computer Security: Principles and Practice by Stallings and Brown (4th ed., global edition). Lecture numbers follow the current course order, where web security is Module 2; the slide files keep their original numbers (L04 public-key cryptography, L05 elliptic curves, L06 web security). Practice problems use the lectures' conventions and say so where a convention matters.",
  labels: { labs: { label: "Practice", hint: "Generated problems in the style of the quizzes, with answer checking and worked solutions." } },
  labsNoun: "practice problems",
  cardEyebrow: m => `Module ${m.num} · ${m.eyebrow}`,
  modEyebrow: m => `Module ${m.num} · ${m.eyebrow}`,
  resourcesHint: "Course reading, lecture slides, the book's review questions, and the module's lab and quiz.",
  resources: m => `<div class="more">
    <div class="card"><h3>Course reading</h3><p class="sub" style="margin-top:4px">The book sections the course lists for this module${m.readNote ? ` ${m.readNote}` : ""}. Tick each one off as you read it.</p>
      <ul class="objs" style="margin-top:6px">${m.read.map(([t, pg], i) => checkbox(`r${m.key}${i}`, `${t} <span class="mono" style="color:var(--muted)">pp. ${pg}</span>`)).join("")}</ul>
      ${m.probs.length ? `<p class="sub" style="margin-top:12px">Then try these review questions and problems from the book:</p><div>${m.probs.map(x => `<span class="pill">${x}</span>`).join(" ")}</div>` : ""}</div>
    <div class="card"><h3>Lecture slides</h3><p class="sub" style="margin-top:4px">On Canvas, named “[Z0026E] L…”.</p>
      <ul>${m.slides.map(s => `<li>${s}</li>`).join("")}</ul></div>
    <div class="card"><h3>${m.lab.name}</h3><p class="sub" style="margin-top:4px">${m.lab.what} Follow the lab sheet on Canvas; it can differ from the public SEED version.</p>
      <p class="objhead" style="margin-top:10px">Be ready to explain at the presentation</p>
      <ul>${m.lab.explain.map(x => `<li>${x}</li>`).join("")}</ul>
      <p style="font-size:.9rem;margin-top:8px"><a href="${SEED}${m.lab.url}" target="_blank" rel="noopener">SEED lab: ${m.lab.seed}</a> · <a href="${SEED}labsetup.html" target="_blank" rel="noopener">SEED VM setup</a></p></div>
    ${m.quizzes.map(q => `<div class="card"><h3>${q.name}</h3><p class="sub" style="margin-top:4px">${q.what}</p>
      ${q.known ? `<p style="font-size:.93rem"><b>Known setup:</b> ${q.known}</p>` : ""}
      <p style="font-size:.93rem">Practise with: ${q.practice.map(([id, t]) => `<a href="${m.path}/labs#d-${id}" data-link>${t}</a>`).join(" · ")}</p></div>`).join("")}
  </div>`,
  modules: [m1, m2, m3, m4],
};
