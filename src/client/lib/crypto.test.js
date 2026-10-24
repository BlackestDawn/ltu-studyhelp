import { describe, expect, test } from "bun:test";
import { rsaKeys, modPow, validE, caesar, filterPacket } from "./crypto.js";

describe("RSA", () => {
  test("the book's example: p = 5, q = 7, e = 5 gives n = 35, z = 24, d = 29", () => {
    expect(rsaKeys(5, 7, 5)).toEqual({ n: 35, z: 24, e: 5, d: 29 });
  });
  test("Tables 8.2 and 8.3: l o v e = 12 15 22 5 encrypt to 17 15 22 10 and back", () => {
    expect([12, 15, 22, 5].map(m => modPow(m, 5, 35))).toEqual([17, 15, 22, 10]);
    expect([17, 15, 22, 10].map(c => modPow(c, 29, 35))).toEqual([12, 15, 22, 5]);
  });
  test("every valid e round-trips every message for small primes", () => {
    for (const [p, q] of [[3, 11], [5, 11], [7, 13]]) for (const e of validE(p, q)) {
      const { n, d } = rsaKeys(p, q, e);
      for (let m = 0; m < n; m++) expect(modPow(modPow(m, e, n), d, n)).toBe(m);
    }
  });
});

test("Caesar cipher with k = 3 (book: “bob, i love you. alice” → “ere, l oryh brx. dolfh”)", () => {
  expect(caesar("bob, i love you. alice", 3)).toBe("ere, l oryh brx. dolfh");
  expect(caesar("ere", -3)).toBe("bob");
});

describe("Table 8.6 packet filter", () => {
  test("outgoing web request allowed by rule 1, its reply by rule 2", () => {
    expect(filterPacket({ src: "inside", dst: "outside", proto: "TCP", sport: 5000, dport: 80, ack: false })).toEqual({ rule: 1, action: "allow" });
    expect(filterPacket({ src: "outside", dst: "inside", proto: "TCP", sport: 80, dport: 5000, ack: true })).toEqual({ rule: 2, action: "allow" });
  });
  test("an outside SYN to an inside web server is denied by rule 5", () => {
    expect(filterPacket({ src: "outside", dst: "inside", proto: "TCP", sport: 5000, dport: 80, ack: false })).toEqual({ rule: 5, action: "deny" });
  });
  test("DNS out and back; ICMP denied", () => {
    expect(filterPacket({ src: "inside", dst: "outside", proto: "UDP", sport: 4000, dport: 53 }).rule).toBe(3);
    expect(filterPacket({ src: "outside", dst: "inside", proto: "UDP", sport: 53, dport: 4000 }).rule).toBe(4);
    expect(filterPacket({ src: "outside", dst: "inside", proto: "ICMP" }).rule).toBe(5);
  });
});
