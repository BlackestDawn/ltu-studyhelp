// Routing-algorithm helpers shared by the module 5 labs and models.
// A network is a list of undirected edges: [["u", "v", 2], ["u", "x", 1], …].
import { tbl } from "./util.js";

export const INF = Infinity;
export const showCost = d => (d === INF ? "∞" : String(d));

export function neighbours(edges) {
  const g = {};
  edges.forEach(([a, b, c]) => { (g[a] ??= {})[b] = c; (g[b] ??= {})[a] = c; });
  return g;
}

// Dijkstra's link-state algorithm from `src`, recorded step by step as in the
// book's Table 5.1. Ties for the next node are broken by `prefer` (a list of
// node names), then alphabetically; `ambiguous` reports whether any tie (next
// node or equal-cost path) occurred.
export function dijkstra(edges, src, prefer = []) {
  const g = neighbours(edges), nodes = Object.keys(g).sort();
  const rank = n => (prefer.includes(n) ? prefer.indexOf(n) : prefer.length);
  const D = {}, P = {};
  let ambiguous = false;
  nodes.forEach(n => { D[n] = g[src][n] ?? INF; P[n] = g[src][n] != null ? src : null; });
  D[src] = 0;
  const N = [src], steps = [{ N: [...N], D: { ...D }, P: { ...P }, added: src }];
  while (N.length < nodes.length) {
    const cand = nodes.filter(n => !N.includes(n) && D[n] < INF).sort((a, b) => D[a] - D[b] || rank(a) - rank(b) || a.localeCompare(b));
    if (!cand.length) break;
    const w = cand[0];
    if (cand[1] && D[cand[1]] === D[w]) ambiguous = true;
    N.push(w);
    for (const [v, c] of Object.entries(g[w])) {
      if (N.includes(v)) continue;
      const nd = D[w] + c;
      if (nd < D[v]) { D[v] = nd; P[v] = w; } else if (nd === D[v] && P[v] !== w) ambiguous = true;
    }
    steps.push({ N: [...N], D: { ...D }, P: { ...P }, added: w });
  }
  return { steps, D, P, ambiguous, nodes };
}

export function pathTo(P, src, dst) {
  const p = [dst];
  while (p[0] !== src && P[p[0]]) p.unshift(P[p[0]]);
  return p;
}
export const nextHop = (P, src, dst) => pathTo(P, src, dst)[1];

// The step table as HTML, in the book's layout: a node's column is left blank
// once it is in N′. `upTo` limits how many steps are shown; `hl` marks a step.
export function dijkstraTable(run, src, upTo = run.steps.length, hl = -1) {
  const dests = run.nodes.filter(n => n !== src);
  return tbl(["Step", "N′", ...dests.map(n => `D(${n}), p(${n})`)],
    run.steps.slice(0, upTo).map((s, i) => [i, s.N.join(""), ...dests.map(n =>
      s.N.includes(n) && n !== s.added ? "" : s.D[n] === INF ? "∞" : `${s.D[n]}, ${s.P[n]}`)]),
    i => i === hl);
}

// One Bellman-Ford update at node x: Dx(y) = min over neighbours v of c(x,v) + Dv(y).
export function bellmanFord(costs, vectors, dests) {
  const out = {};
  for (const y of dests) {
    const opts = Object.keys(costs).map(v => ({ v, d: costs[v] + (v === y ? 0 : vectors[v][y]) }))
      .sort((a, b) => a.d - b.d || a.v.localeCompare(b.v));
    out[y] = { d: opts[0].d, via: opts[0].v, tie: opts.length > 1 && opts[1].d === opts[0].d, opts };
  }
  return out;
}
