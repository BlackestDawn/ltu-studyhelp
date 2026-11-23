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

const pageRange = m => `pp. ${m.read[0][1].split("–")[0]}–${m.read.at(-1)[1].split("–").at(-1)}`;

export default {
  id: "networks",
  // Module ids here predate multiple courses, so their saved state has no prefix.
  keyPrefix: "",
  title: "Networks Midterm Workbench",
  short: "Networks",
  eyebrow: "Computer Networking · Kurose &amp; Ross 8e",
  blurb: "Computer Networking: A Top-Down Approach, chapters 1–8: from the Internet's edge and core through every layer to security.",
  lede: "Study one module at a time, in the way that suits you: read summaries and study notes, explore interactive models, or learn by doing with labs that generate fresh numbers, check your answers and show worked solutions.",
  hdr: n => [["s2", "src", "you"], ["s2", "dst", "midterm"], ["s2", "proto", "read · do · check"], ["s2", "ttl", `${n} modules`],
    ["s4", "payload", "notes · labs · models · concept checks"], ["s4", "checksum", "worked solutions"]],
  footnote: "Section numbers refer to the 8th edition of the course book. Labs follow the book's conventions; if your lecturer used a different convention (for example how TCP Reno sets cwnd after three duplicate ACKs), the lab says which rule it uses.",
  labels: {},
  labsNoun: "labs",
  cardEyebrow: m => `Module ${m.num} · Chapter ${m.chapter}`,
  modEyebrow: m => `Module ${m.num} · Chapter ${m.chapter} · ${pageRange(m)}`,
  resourcesHint: "Course reading checklist, book problems and the authors' interactive exercises.",
  resources: m => `<div class="more">
    <div class="card"><h3>Course reading</h3><p class="sub" style="margin-top:4px">The pages your course lists as supporting material. Tick each one off as you read it.</p>
      <ul class="objs" style="margin-top:6px">${m.read.map(([t, pg], i) => checkbox(`r${m.key}${i}`, `${t} <span class="mono" style="color:var(--muted)">pp. ${pg}</span>`)).join("")}</ul>
      <p class="sub" style="margin-top:12px">Then try these end-of-chapter problems:</p><div>${m.probs.map(x => `<span class="pill">${x}</span>`).join(" ")}</div></div>
    <div class="card"><h3>Authors' interactive problems</h3><p class="sub" style="margin-top:4px">Randomised problems from the book's authors, with answers.</p>
      ${m.inter.length ? `<ul>${m.inter.map(([n, u]) => `<li><a href="${GA}${u}" target="_blank" rel="noopener">${n}</a></li>`).join("")}</ul>` : `<p class="sub" style="margin-top:6px">The authors have no interactive problems for this chapter; the AI tutor below covers it.</p>`}
      <p style="font-size:.9rem;margin-top:8px"><a href="https://gaia.cs.umass.edu/kurose_ross/wireshark.php" target="_blank" rel="noopener">${m.lab}</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/knowledgechecks/" target="_blank" rel="noopener">Knowledge checks</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/tutor.php?bot=${m.tutor}" target="_blank" rel="noopener">Chapter ${m.tutor} AI tutor</a></p></div>
  </div>`,
  modules: [m1, m2, m3, m4, m5, m6, m7, m8],
};
