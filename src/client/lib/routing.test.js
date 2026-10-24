import { describe, expect, test } from "bun:test";
import { dijkstra, nextHop, pathTo, bellmanFord, INF } from "./routing.js";

// The book's Figure 5.3 network and its Table 5.1 result.
const BOOK = [["u","v",2],["u","x",1],["u","w",5],["v","x",2],["v","w",3],["x","w",3],["x","y",1],["w","y",1],["w","z",5],["y","z",2]];

describe("dijkstra", () => {
  // The book breaks the v/y tie at cost 2 by taking y first.
  const run = dijkstra(BOOK, "u", ["y"]);
  test("matches the book's Table 5.1", () => {
    expect(run.steps.map(s => s.N.join(""))).toEqual(["u", "ux", "uxy", "uxyv", "uxyvw", "uxyvwz"]);
    expect(run.D).toEqual({ u: 0, v: 2, w: 3, x: 1, y: 2, z: 4 });
    expect(run.P).toMatchObject({ v: "u", w: "y", x: "u", y: "x", z: "y" });
    expect(run.steps[0].D).toMatchObject({ v: 2, w: 5, x: 1, y: INF, z: INF });
    expect(run.steps[1].D).toMatchObject({ w: 4, y: 2 });
  });
  test("forwarding table: everything except v goes via x", () => {
    expect(["v", "w", "x", "y", "z"].map(d => nextHop(run.P, "u", d))).toEqual(["v", "x", "x", "x", "x"]);
    expect(pathTo(run.P, "u", "z")).toEqual(["u", "x", "y", "z"]);
  });
  test("the book example has a tie (v and y at cost 2), alphabetical order takes v", () => {
    expect(run.ambiguous).toBe(true);
    expect(dijkstra(BOOK, "u").steps[2].added).toBe("v");
  });
});

describe("bellmanFord", () => {
  test("the book's du(z) = min{2+5, 5+3, 1+3} = 4 via x", () => {
    const r = bellmanFord({ v: 2, w: 5, x: 1 }, { v: { z: 5 }, w: { z: 3 }, x: { z: 3 } }, ["z"]);
    expect(r.z.d).toBe(4);
    expect(r.z.via).toBe("x");
  });
});
