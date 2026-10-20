import { describe, expect, test } from "bun:test";
import { readNumber, judge } from "./drill.js";

describe("readNumber", () => {
  test.each([
    ["0.5", [0.5]],
    ["0,5", [0.5]],
    ["12,345678", [12.345678]],
    ["-1,25", [-1.25]],
    ["1 500", [1500]],
    ["1 500,5", [1500.5]],
    ["1,500.25", [1500.25]],
    ["1.500,25", [1500.25]],
    ["1,000,000", [1000000]],
    ["1.000.000", [1000000]],
    ["1e-4", [0.0001]],
    ["2,5e-3", [0.0025]],
    ["12 ms", [12]],
  ])("%p → %p", (raw, want) => {
    expect(readNumber(raw)).toEqual(want);
  });

  test("a lone comma before exactly three digits gives both readings", () => {
    expect(readNumber("1,500")).toEqual([1.5, 1500]);
  });

  test("non-numbers give no readings", () => {
    expect(readNumber("abc")).toEqual([]);
    expect(readNumber(",")).toEqual([]);
  });
});

describe("judge numeric fields", () => {
  const f = { type: "num", ans: 0.48 };

  test("accepts dot and comma decimals", () => {
    expect(judge(f, "0.48")).toBe(true);
    expect(judge(f, "0,48")).toBe(true);
    expect(judge(f, " 0,48 ")).toBe(true);
  });

  test("rejects wrong values either way", () => {
    expect(judge(f, "0,58")).toBe(false);
    expect(judge(f, "48")).toBe(false);
  });

  test("blank is neither right nor wrong", () => {
    expect(judge(f, "  ")).toBe(null);
  });

  test("ambiguous 1,500 is right whether the answer is 1.5 or 1500", () => {
    expect(judge({ type: "num", ans: 1.5 }, "1,500")).toBe(true);
    expect(judge({ type: "num", ans: 1500 }, "1,500")).toBe(true);
    expect(judge({ type: "num", ans: 15 }, "1,500")).toBe(false);
  });

  test("keeps the field's tolerance", () => {
    expect(judge({ type: "num", ans: 100, rel: 0.01 }, "100,9")).toBe(true);
    expect(judge({ type: "num", ans: 100, rel: 0.01 }, "101,5")).toBe(false);
    expect(judge({ type: "num", ans: 5003, abs: 0 }, "5 003")).toBe(true);
  });
});
