// Interactive models for the Computer and Network Security course.
import { $, store, tbl, esc } from "./lib/util.js";
import { b4, show4, encryptModes, rotr, naiveHash, forgeBlock, multiples, curvePoints, showPt, onCurve } from "./lib/seccrypto.js";
import { toyTable } from "./courses/security/shared.js";

// Each model remembers its settings in this browser between visits.
const kept = k => ({ get: () => store.get("w:" + k) || {}, set: v => store.set("w:" + k, v) });
const bits4 = s => /^[01]{4}$/.test(s);

/* ---------- block-cipher modes on the 4-bit cipher ---------- */
export function widgetModes() {
  const el = document.createElement("article"); el.className = "card";
  const keep = kept("secmodes"), st = keep.get();
  el.innerHTML = `<div class="dhead"><span class="tag">Model · modes of operation</span><h3>Run every mode on the 4-bit cipher</h3><p class="pages"><b>Builds on</b> Lecture 3 example · §20.5</p></div>
  <p class="q">Type a 12-bit plaintext and choose an IV. The table below each mode shows what goes into the cipher and what comes out. The lecture's example is 1011 1011 1011 with IV 1101; the quiz uses 1001 1001 1001.</p>
  <details><summary class="sub">Show the cipher table</summary>${toyTable()}</details>
  <div class="controls"><label for="md-pt">Plaintext <input id="md-pt" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" style="width:150px;font-family:var(--f-mono)"></label>
    <label for="md-iv">IV <select id="md-iv">${Array.from({ length: 16 }, (_, i) => `<option value="${i}">${b4(i)}</option>`).join("")}</select></label>
    <label for="md-mode">Mode <select id="md-mode">${["ECB", "CBC", "CFB", "OFB", "CTR"].map(m => `<option>${m}</option>`).join("")}</select></label></div>
  <div id="md-tbl"></div><div class="readout" id="md-out" aria-live="polite"></div>`;
  $("#md-pt", el).value = st.pt || "1011 1011 1011";
  $("#md-iv", el).value = String(Number.isInteger(st.iv) ? st.iv : 13);
  $("#md-mode", el).value = st.mode || "CBC";
  const draw = () => {
    const raw = $("#md-pt", el).value.replace(/[^01]/g, ""), iv = +$("#md-iv", el).value, mode = $("#md-mode", el).value;
    keep.set({ pt: $("#md-pt", el).value, iv, mode });
    if (raw.length !== 12) { $("#md-tbl", el).innerHTML = ""; $("#md-out", el).textContent = `Enter exactly 12 bits (you have ${raw.length}).`; return; }
    const pt = raw.match(/.{4}/g).map(x => parseInt(x, 2)), r = encryptModes(pt, iv), S = r.steps[mode];
    const prevName = (i, k) => (i ? `${k}${i}` : "IV");
    const rows = mode === "ECB" ? pt.map((p, i) => [i + 1, b4(p), "—", `<b>${b4(r.ECB[i])}</b>`])
      : mode === "CBC" ? S.map((s, i) => [i + 1, b4(s.p), `${b4(s.p)} ⊕ ${b4(s.prev)} (${prevName(i, "C")}) = ${b4(s.x)}`, `<b>E(${b4(s.x)}) = ${b4(s.c)}</b>`])
      : S.map((s, i) => [i + 1, b4(s.p), `E(${b4(s.prev)}${mode === "CTR" ? " counter" : ` ${prevName(i, mode === "OFB" ? "O" : "C")}`}) = ${b4(s.k)}`, `<b>${b4(s.p)} ⊕ ${b4(s.k)} = ${b4(s.c)}</b>`]);
    $("#md-tbl", el).innerHTML = tbl(["Block", "P", mode === "ECB" ? "Chaining" : mode === "CBC" ? "Cipher input" : "Key stream", "C"], rows);
    $("#md-out", el).innerHTML = `${mode}: ${show4(pt)} → <b>${show4(r[mode])}</b>` + (mode === "ECB" && new Set(pt).size < pt.length ? " (equal plaintext blocks give equal ciphertext blocks)" : "")
      + `<br>All modes: ${["ECB", "CBC", "CFB", "OFB", "CTR"].map(m => `${m} ${show4(r[m])}`).join(" · ")}`;
  };
  el.addEventListener("input", draw); el.addEventListener("change", draw);
  draw(); return el;
}

/* ---------- forging the naive rotate-XOR hash ---------- */
export function widgetHashForge() {
  const el = document.createElement("article"); el.className = "card";
  const keep = kept("hashforge"), st = keep.get();
  el.innerHTML = `<div class="dhead"><span class="tag">Model · naive hash</span><h3>Append a block, keep the hash</h3><p class="pages"><b>Builds on</b> Lecture 2 concatenation attack · §21.1</p></div>
  <p class="q">H = ((M1 &lt;&lt; ⊕ M2) &lt;&lt; ⊕ M3), where &lt;&lt; moves the last bit to the front. Change the blocks: the model always finds a block M? that restores the original hash after the attacker's M4.</p>
  <div class="controls">${["M1", "M2", "M3", "M4"].map((m, i) => `<label for="hf-${i}">${m}${i === 3 ? " (attacker)" : ""} <input id="hf-${i}" type="text" inputmode="numeric" maxlength="4" autocomplete="off" style="width:64px;font-family:var(--f-mono)"></label>`).join("")}</div>
  <div class="readout" id="hf-out" aria-live="polite"></div>`;
  const init = st.m || ["1011", "0110", "1010", "1010"];
  init.forEach((v, i) => { $(`#hf-${i}`, el).value = v; });
  const draw = () => {
    const vals = [0, 1, 2, 3].map(i => $(`#hf-${i}`, el).value.trim());
    keep.set({ m: vals });
    if (!vals.every(bits4)) { $("#hf-out", el).textContent = "Each block must be exactly 4 bits."; return; }
    const [m1, m2, m3, m4] = vals.map(v => parseInt(v, 2)), h1 = naiveHash([m1, m2, m3]), hNew = naiveHash([m1, m2, m3, m4]), x = forgeBlock(h1, hNew);
    $("#hf-out", el).innerHTML = `H1 = ((${b4(m1)} &lt;&lt; = ${b4(rotr(m1))}) ⊕ ${b4(m2)} = ${b4(rotr(m1) ^ m2)}) &lt;&lt; = ${b4(rotr(rotr(m1) ^ m2))}, ⊕ ${b4(m3)} = <b>${b4(h1)}</b><br>
      Append M4: ${b4(h1)} &lt;&lt; = ${b4(rotr(h1))}, ⊕ ${b4(m4)} = H<sub>new</sub> = <b>${b4(hNew)}</b><br>
      Need (H<sub>new</sub> &lt;&lt;) ⊕ M? = H1, so M? = ${b4(rotr(hNew))} ⊕ ${b4(h1)} = <b>${b4(x)}</b><br>
      Check: hash of M1 M2 M3 M4 M? = ${b4(naiveHash([m1, m2, m3, m4, x]))} ${naiveHash([m1, m2, m3, m4, x]) === h1 ? "✓ same as H1: a second preimage" : "✗"}`;
  };
  el.addEventListener("input", draw);
  draw(); return el;
}

/* ---------- multiples of G on a small elliptic curve ---------- */
const CURVES = [
  { name: "y² = x³ + 2x + 2 (mod 17), G = (5, 1)", c: { a: 2, b: 2, p: 17 }, G: [5, 1] },
  { name: "y² = x³ + 7 (mod 17), G = (15, 13)", c: { a: 0, b: 7, p: 17 }, G: [15, 13] },
  { name: "y² = x³ − x + 1 (mod 97)", c: { a: 96, b: 1, p: 97 }, G: null },
];
export function widgetECC() {
  const el = document.createElement("article"); el.className = "card";
  const keep = kept("ecc"), st = keep.get();
  el.innerHTML = `<div class="dhead"><span class="tag">Model · elliptic curves</span><h3>Walk the multiples of G</h3><p class="pages"><b>Builds on</b> Lecture 6 · ECC security principle</p></div>
  <p class="q">Every dot is a point on the curve mod p. Increase k to see G, 2G, 3G, …: each step is a point addition, and the path jumps around the field with no visible pattern. That is why recovering k from k·G is hard.</p>
  <div class="controls"><label for="ec-c">Curve <select id="ec-c">${CURVES.map((x, i) => `<option value="${i}">${x.name}</option>`).join("")}</select></label>
    <label for="ec-k">k <input type="range" id="ec-k" min="1" max="18" value="1"></label></div>
  <div class="svgbox"><svg id="ec-svg" viewBox="0 0 420 420" role="img" aria-label="Points of the curve and multiples of G" style="min-width:300px;max-width:440px;margin:auto"></svg></div>
  <div class="readout" id="ec-out" aria-live="polite"></div>`;
  $("#ec-c", el).value = String(st.c ?? 0);
  if (st.k) $("#ec-k", el).value = String(st.k);
  const draw = () => {
    const cv = CURVES[+$("#ec-c", el).value], c = cv.c, pts = curvePoints(c), G = cv.G || pts.find(P => P[1] !== 0);
    const M = multiples(G, c), n = M.length + 1, kIn = $("#ec-k", el);
    kIn.max = String(M.length);
    const k = Math.min(+kIn.value, M.length); kIn.value = String(k);
    keep.set({ c: +$("#ec-c", el).value, k });
    const pad = 24, W = 420 - 2 * pad, sx = x => pad + (x + 0.5) * W / c.p, sy = y => 420 - pad - (y + 0.5) * W / c.p, r = Math.max(2, 120 / c.p);
    let s = `<line class="ax" x1="${pad}" y1="${420 - pad}" x2="${420 - pad}" y2="${420 - pad}"/><line class="ax" x1="${pad}" y1="${pad}" x2="${pad}" y2="${420 - pad}"/>`;
    s += pts.map(P => `<circle cx="${sx(P[0])}" cy="${sy(P[1])}" r="${r}" style="fill:var(--line)"/>`).join("");
    const path = M.slice(0, k);
    if (path.length > 1) s += `<polyline class="ssl" points="${path.map(P => `${sx(P[0])},${sy(P[1])}`).join(" ")}"/>`;
    s += path.map((P, i) => `<circle cx="${sx(P[0])}" cy="${sy(P[1])}" r="${i === k - 1 ? r * 1.8 : r * 1.2}" class="${i === k - 1 ? "pt" : ""}" style="${i === k - 1 ? "" : "fill:var(--signal)"}"/>`).join("");
    const P = M[k - 1];
    s += `<text x="${Math.min(sx(P[0]) + 8, 360)}" y="${Math.max(sy(P[1]) - 8, 14)}" class="evt" font-size="12">${k}G</text>`;
    $("#ec-svg", el).innerHTML = s;
    $("#ec-out", el).innerHTML = `${pts.length} points plus O. G = ${showPt(G)} has order n = ${n}: ${n}G = O.<br><b>${k}G = ${showPt(P)}</b> ${onCurve(P, c) ? "(on the curve ✓)" : ""}<br>`
      + (c.p <= 17 ? `Multiples: ${M.slice(0, Math.min(k, 18)).map((Q, i) => `${i + 1}G = ${showPt(Q)}`).join(", ")}` : `Last steps: ${M.slice(Math.max(0, k - 5), k).map((Q, i) => `${Math.max(0, k - 5) + i + 1}G = ${showPt(Q)}`).join(", ")}`);
  };
  el.addEventListener("input", draw); el.addEventListener("change", draw);
  draw(); return el;
}

/* ---------- the Quiz 3 KDC protocol, step by step ---------- */
const sub = s => esc(s).replace(/E_(\w+)/g, 'E<tspan baseline-shift="sub" font-size="9">$1</tspan>').replace(/R_(\w)/g, 'R<tspan baseline-shift="sub" font-size="9">$1</tspan>');
const RUNS = {
  normal: { who: ["X", "A (KDC)", "Y"], steps: [
    [0, 1, "X, Y, R_X", "X asks the KDC for a key to talk to Y, with a fresh nonce R_X. Sent in the clear."],
    [1, 0, "E_X(R_X, Y, K, E_Y(K, X))", "Only A (and X) know X's key. R_X shows this answers the current request; Y shows the key is for Y. X can read K but not the ticket E_Y(K, X)."],
    [0, 2, "E_Y(K, X)", "X forwards the ticket. Y decrypts it with its own key and learns K, issued by A for X."],
    [2, 0, "E_K(R_Y)", "Y challenges with its own nonce under K."],
    [0, 2, "E_K(R_Y − 1)", "X decrypts R_Y and returns R_Y − 1, proving it holds K right now. Both now share K."],
  ] },
  replay: { who: ["Z (attacker)", "A (KDC)", "Y"], steps: [
    [0, 2, "E_Y(K′, X)  (recorded earlier)", "Z recorded message 3 of an old run and later learned that run's session key K′. Z replays the old ticket. Nothing in it tells Y how old it is."],
    [2, 0, "E_K′(R_Y)", "Y accepts K′ and challenges with a fresh nonce, believing it is talking to X."],
    [0, 2, "E_K′(R_Y − 1)", "Z knows K′, so it answers correctly. Y now accepts Z as X: the KDC was never involved. A timestamp in the ticket would have let Y reject it."],
  ] },
};
export function widgetKDC() {
  const el = document.createElement("article"); el.className = "card";
  const keep = kept("kdc"), st = keep.get();
  let mode = st.mode === "replay" ? "replay" : "normal", step = Number.isInteger(st.step) ? st.step : 0;
  el.innerHTML = `<div class="dhead"><span class="tag">Model · key distribution</span><h3>Step through the Quiz 3 protocol</h3><p class="pages"><b>Builds on</b> Lecture 7 · Needham–Schroeder</p></div>
  <div class="controls"><label for="kd-mode">Run <select id="kd-mode"><option value="normal">Normal run</option><option value="replay">Replay of an old ticket</option></select></label>
    <button class="btn" data-k="-1">← Back</button><button class="btn primary" data-k="1">Next message →</button><button class="btn ghost" data-k="0">Restart</button></div>
  <div class="svgbox"><svg id="kd-svg" viewBox="0 0 640 230" role="img" aria-label="Message sequence between the principals"></svg></div>
  <div class="readout" id="kd-out" aria-live="polite"></div>`;
  $("#kd-mode", el).value = mode;
  const draw = () => {
    const run = RUNS[mode], xs = [90, 320, 550];
    step = Math.max(0, Math.min(run.steps.length, step));
    keep.set({ mode, step });
    let s = run.who.map((w, i) => `<g class="node${run.steps[step - 1] && (run.steps[step - 1][0] === i || run.steps[step - 1][1] === i) ? " on" : ""}"><rect x="${xs[i] - 60}" y="6" width="120" height="28" rx="6"/><text x="${xs[i]}" y="25" text-anchor="middle">${esc(w)}</text></g><line class="gridline" x1="${xs[i]}" y1="34" x2="${xs[i]}" y2="225" stroke-dasharray="4 4"/>`).join("");
    s += `<defs><marker id="kd-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker><marker id="kd-ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/></marker></defs>`;
    run.steps.slice(0, step).forEach(([a, b, msg], i) => {
      const y = 58 + i * 34, on = i === step - 1, x1 = xs[a] + (b > a ? 4 : -4), x2 = xs[b] + (b > a ? -6 : 6);
      s += `<line class="arw${on ? " on" : ""}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-end="url(#${on ? "kd-ah" : "kd-ag"})"/><text class="arwlbl${on ? " on" : ""}" x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle">(${i + 1}) ${sub(msg)}</text>`;
    });
    $("#kd-svg", el).innerHTML = s;
    $("#kd-out", el).innerHTML = step ? `<b>Message ${step} of ${run.steps.length}:</b> ${esc(run.steps[step - 1][3]).replace(/R_(\w)/g, "R<sub>$1</sub>").replace(/E_(\w+)/g, "E<sub>$1</sub>")}`
      : mode === "normal" ? "X wants a session key for talking to Y. Press “Next message”." : "An attacker Z holds an old session key K′ and the ticket that carried it. Press “Next message”.";
  };
  el.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; const d = +b.dataset.k; step = d === 0 ? 0 : step + d; draw(); });
  $("#kd-mode", el).addEventListener("change", e => { mode = e.target.value; step = 0; draw(); });
  draw(); return el;
}
