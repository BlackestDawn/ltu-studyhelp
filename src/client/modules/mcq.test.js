// Guards the concept checks against answer-giveaway patterns: if the right
// answer is usually the longest option, students can score well without
// knowing anything. Run on every module, so new modules are checked too.
import { describe, expect, test } from "bun:test";
import { MODULES } from "./index.js";

const text = s => s.replace(/<[^>]+>/g, "");
const all = MODULES.flatMap(m => m.mcq.map((q, i) => ({ ...q, id: `${m.id}#${i}` })));

describe("concept-check questions", () => {
  test.each(all.map(q => [q.id, q]))("%s is well formed", (_, q) => {
    expect(q.o).toHaveLength(4);
    expect(new Set(q.o.map(text)).size).toBe(4);
    expect(q.a).toBeGreaterThanOrEqual(0);
    expect(q.a).toBeLessThan(4);
    expect(q.why.length).toBeGreaterThan(20);
  });

  test("the correct answer is not usually the longest option", () => {
    const longest = all.filter(q => {
      const L = q.o.map(o => text(o).length);
      return L.every((l, j) => j === q.a || l <= L[q.a]);
    }).length;
    // Chance is 25%; allow some slack for short, name-only options.
    expect(longest / all.length).toBeLessThan(0.35);
  });

  test("correct answers are about as long as wrong ones on average", () => {
    const ratio = all.reduce((sum, q) => {
      const L = q.o.map(o => text(o).length), wrong = L.filter((_, j) => j !== q.a);
      return sum + L[q.a] / (wrong.reduce((a, b) => a + b) / 3);
    }, 0) / all.length;
    expect(ratio).toBeGreaterThan(0.85);
    expect(ratio).toBeLessThan(1.15);
  });
});
