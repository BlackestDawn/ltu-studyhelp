import { describe, expect, test } from "bun:test";
import { switchFrame, slottedAloha, pureAloha } from "./lan.js";

describe("self-learning switch", () => {
  const ports = [1, 2, 3, 4];
  test("floods unknown destinations, forwards known ones, filters same-port ones", () => {
    const t = {};
    expect(switchFrame(t, 1, "A", "B", ports)).toEqual({ action: "flood", out: [2, 3, 4] });
    expect(t).toEqual({ A: 1 });
    expect(switchFrame(t, 2, "B", "A", ports)).toEqual({ action: "forward", out: [1] });
    expect(switchFrame(t, 4, "D", "*", ports).action).toBe("flood");
    expect(switchFrame(t, 4, "E", "D", ports)).toEqual({ action: "filter", out: [] });
    expect(t).toEqual({ A: 1, B: 2, D: 4, E: 4 });
  });
});

describe("ALOHA efficiency", () => {
  test("slotted ALOHA approaches 1/e at p = 1/N, pure ALOHA half of that", () => {
    expect(slottedAloha(1000, 1 / 1000)).toBeCloseTo(1 / Math.E, 3);
    expect(pureAloha(1000, 1 / 2000)).toBeCloseTo(1 / (2 * Math.E), 3);
  });
});
