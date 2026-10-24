import { describe, expect, test } from "bun:test";
import { CODES, dot, encode, channel, decode, snrDb } from "./wireless.js";

describe("CDMA", () => {
  test("the codes are ±1, length 8 and pairwise orthogonal", () => {
    expect(CODES).toHaveLength(7);
    for (const c of CODES) expect(c.every(x => x === 1 || x === -1) && c.length === 8).toBe(true);
    for (let i = 0; i < CODES.length; i++) for (let j = i + 1; j < CODES.length; j++) expect(dot(CODES[i], CODES[j])).toBe(0);
  });
  test("two senders' bits are both recovered from the summed channel", () => {
    for (const d1 of [1, -1]) for (const d2 of [1, -1]) {
      const z = channel([encode(d1, CODES[0]), encode(d2, CODES[4])]);
      expect(decode(z, CODES[0])).toBe(d1);
      expect(decode(z, CODES[4])).toBe(d2);
    }
  });
  test("the book's single-sender example (code 1 1 1 -1 1 -1 -1 -1)", () => {
    const c = [1, 1, 1, -1, 1, -1, -1, -1];
    expect(decode(encode(-1, c), c)).toBe(-1);
  });
});

test("SNR: an amplitude ratio of 10 is 20 dB", () => {
  expect(snrDb(10, 1)).toBeCloseTo(20);
});
