// Generates every lab many times: each instance must be well formed, and the
// answer key shown to students must be accepted by the answer checker.
import { describe, expect, test } from "bun:test";
import { MODULES } from "./index.js";
import { judge, showAns } from "../lib/drill.js";

const RUNS = 200;

describe("labs generate solvable problems", () => {
  for (const m of MODULES) for (const d of m.drills) {
    test(`${m.id}/${d.id}`, () => {
      for (let i = 0; i < RUNS; i++) {
        const inst = d.gen();
        expect(typeof inst.q).toBe("string");
        expect(typeof inst.sol).toBe("string");
        expect(inst.fields.length).toBeGreaterThan(0);
        for (const f of inst.fields) {
          if (f.type === "select") expect(f.opts).toContain([].concat(f.ans)[0]);
          if (f.type === "num") expect(Number.isFinite(f.ans)).toBe(true);
          // The key a student sees must itself be marked right.
          expect(judge(f, showAns(f))).toBe(true);
        }
      }
    });
  }
});
