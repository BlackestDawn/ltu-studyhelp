// Computer Networks (Kurose & Ross, 8th ed.): modules in order, plus the
// course-specific parts of the pages (header strip, eyebrows, resources).
import { checkbox } from "../../lib/checklist.js";
import m1 from "./m1/index.js";
import m2 from "./m2/index.js";
import m3 from "./m3/index.js";
import m4 from "./m4/index.js";
import m5 from "./m5/index.js";
import m6 from "./m6/index.js";
import m7 from "./m7/index.js";
import m8 from "./m8/index.js";

// Base URL for the book authors' interactive problems.
const GA = "https://gaia.cs.umass.edu/kurose_ross/interactive/";

const about = `<h2>How the course is assessed</h2>
  <p class="sub">There is no final exam. Each module ends with a quiz, and two open-book midterms each cover four modules.</p>
  <div class="assess">
    <div class="card"><h3>Module quizzes</h3><ul>
      <li>8 quizzes, one per module, <b>300 points</b> in total.</li>
      <li>Pass needs <b>150 points</b>, with at least <b>10 from every quiz</b>.</li></ul></div>
    <div class="card"><h3>Two midterms</h3><ul>
      <li>Midterm 1: modules 1–4, 150 points, pass at 75.</li>
      <li>Midterm 2: modules 5–8, 150 points, pass at 75.</li>
      <li>Each must be passed <b>on its own</b>; a high score on one doesn't make up for the other.</li></ul>
      <p>Open book, online, all day. The Knowledge Checks are the basis of the midterm question bank, so understand why each answer is right, rather than memorising them.</p></div>
    <div class="card"><h3>Six labs</h3><ul>
      <li>Lab 1 in Wireshark: capture packets and inspect protocols.</li>
      <li>Labs 2–6 in Cisco Packet Tracer: addressing, switching, forwarding and routing.</li></ul>
      <p>Groups of 3–4 hand in one report, then every member must be able to explain the work at the online lab assessment. All labs are compulsory.</p></div>
  </div>`;

const pageRange = m => `pp. ${m.read[0][1].split("–")[0]}–${m.read.at(-1)[1].split("–").at(-1)}`;

export default {
  id: "networks",
  // Module ids here predate multiple courses, so their saved state has no prefix.
  keyPrefix: "",
  title: "Computer Networks",
  short: "Networks",
  eyebrow: "Z0025E · Kurose &amp; Ross 8e",
  blurb: "How information gets from one application to another across the Internet: a top-down journey from the Internet's edge and core through the application, transport, network and link layers to wireless networks and security.",
  lede: "Eight modules that follow the course's sixteen lectures and Computer Networking: A Top-Down Approach. Read the notes, explore the interactive models, and learn by doing with problems that generate fresh numbers, check your answers and show worked solutions.",
  hdr: n => [["s2", "src", "application"], ["s2", "dst", "application"], ["s2", "proto", "read · do · check"], ["s2", "ttl", `${n} modules`],
    ["s4", "payload", "notes · practice · models · concept checks"], ["s4", "checksum", "worked solutions"]],
  about,
  footnote: "Section numbers refer to the 8th edition of the course book; lecture numbers and slide files (“[Z0025E] L01” …) follow the course. Practice problems follow the book's conventions; where the lectures use a different one (for example how TCP Reno sets cwnd after three duplicate ACKs), the problem says which rule it uses.",
  labels: { labs: { label: "Practice", hint: "Generated problems with answer checking and worked solutions." } },
  labsNoun: "practice problems",
  cardEyebrow: m => `Module ${m.num} · Chapter ${m.chapter}`,
  modEyebrow: m => `Module ${m.num} · Chapter ${m.chapter} · ${pageRange(m)}`,
  resourcesHint: "Course reading checklist, lecture slides, book problems and the authors' interactive exercises.",
  resources: m => `<div class="more">
    <div class="card"><h3>Course reading</h3><p class="sub" style="margin-top:4px">The pages your course lists as supporting material. Tick each one off as you read it.</p>
      <ul class="objs" style="margin-top:6px">${m.read.map(([t, pg], i) => checkbox(`r${m.key}${i}`, `${t} <span class="mono" style="color:var(--muted)">pp. ${pg}</span>`)).join("")}</ul>
      ${m.lectures?.length ? `<p class="sub" style="margin-top:12px">Lecture slides on Canvas: ${m.lectures.map(l => `<span class="pill">[Z0025E] ${l.slides}</span>`).join(" ")}</p>` : ""}
      <p class="sub" style="margin-top:12px">Then try these end-of-chapter problems:</p><div>${m.probs.map(x => `<span class="pill">${x}</span>`).join(" ")}</div></div>
    <div class="card"><h3>Authors' interactive problems</h3><p class="sub" style="margin-top:4px">Randomised problems from the book's authors, with answers.</p>
      ${m.inter.length ? `<ul>${m.inter.map(([n, u]) => `<li><a href="${GA}${u}" target="_blank" rel="noopener">${n}</a></li>`).join("")}</ul>` : `<p class="sub" style="margin-top:6px">The authors have no interactive problems for this chapter; the AI tutor below covers it.</p>`}
      <p style="font-size:.9rem;margin-top:8px"><a href="https://gaia.cs.umass.edu/kurose_ross/wireshark.php" target="_blank" rel="noopener">${m.lab}</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/knowledgechecks/" target="_blank" rel="noopener">Knowledge checks</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/tutor.php?bot=${m.tutor}" target="_blank" rel="noopener">Chapter ${m.tutor} AI tutor</a></p></div>
  </div>`,
  modules: [m1, m2, m3, m4, m5, m6, m7, m8],
};
