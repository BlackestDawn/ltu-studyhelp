import { describe, expect, test } from "bun:test";
import {
  TOY, TOY_INV, blocks4, show4, encryptModes, decryptCBC, rotr, naiveHash, forgeBlock, padLen,
  egcd, inv, phi, rsa, rsaExponents, modPow, primitiveRoots, onCurve, ecAdd, ecAddSteps, multiples, ecMul, sslCapture,
} from "./seccrypto.js";

describe("4-bit block cipher (Lecture 3)", () => {
  test("the table is a permutation and TOY_INV undoes it", () => {
    expect(new Set(TOY).size).toBe(16);
    for (let i = 0; i < 16; i++) expect(TOY_INV[TOY[i]]).toBe(i);
  });
  test("lecture example: PT 1011 1011 1011, IV 1101", () => {
    const r = encryptModes(blocks4("1011 1011 1011"), 0b1101);
    expect(show4(r.ECB)).toBe("1010 1010 1010");
    expect(show4(r.CBC)).toBe("0001 0110 1011");
    // The slide prints 0001 for the third CFB block; E(0010) = 1110 and 1011 ⊕ 1110 = 0101.
    expect(show4(r.CFB)).toBe("0000 0010 0101");
  });
  test("OFB and CTR are their own inverse; CBC decrypts", () => {
    for (let k = 0; k < 50; k++) {
      const pt = [0, 0, 0].map(() => Math.floor(Math.random() * 16)), iv = Math.floor(Math.random() * 16);
      const r = encryptModes(pt, iv);
      expect(encryptModes(r.OFB, iv).OFB).toEqual(pt);
      expect(encryptModes(r.CTR, iv).CTR).toEqual(pt);
      expect(decryptCBC(r.CBC, iv)).toEqual(pt);
    }
  });
});

describe("naive rotate-XOR hash (Lecture 2)", () => {
  test("rotation moves the last bit to the front", () => {
    expect(rotr(0b101001, 6)).toBe(0b110100);
    expect(rotr(0b1011)).toBe(0b1101);
  });
  test("lecture example: H1 = 0111, appending 1010 gives 0001, forged block 1111", () => {
    const h1 = naiveHash([0b1011, 0b0110, 0b1010]);
    expect(h1).toBe(0b0111);
    const hNew = naiveHash([0b1011, 0b0110, 0b1010, 0b1010]);
    expect(hNew).toBe(0b0001);
    const x = forgeBlock(h1, hNew);
    expect(x).toBe(0b1111);
    expect(naiveHash([0b1011, 0b0110, 0b1010, 0b1010, x])).toBe(h1);
  });
});

test("PKCS#5 padding (Lecture 3 experiments)", () => {
  expect(padLen(9, 16)).toBe(7);
  expect(padLen(16, 16)).toBe(16);
  expect(padLen(21, 16)).toBe(11);
});

describe("modular arithmetic and RSA", () => {
  test("extended Euclid and inverses", () => {
    expect(egcd(240, 46).g).toBe(2);
    expect(inv(3, 10)).toBe(7);
    expect(inv(9, 17)).toBe(2);
    expect(inv(4, 10)).toBeNull();
    expect([phi(10), phi(7), phi(12), phi(33)]).toEqual([4, 6, 4, 20]);
  });
  test("lecture example p = 13, q = 17, e = 7: d = 55 and $ (36) encrypts to 179", () => {
    expect(rsa(13, 17, 7)).toEqual({ n: 221, f: 192, e: 7, d: 55 });
    expect(modPow(36, 7, 221)).toBe(179);
    expect(modPow(179, 55, 221)).toBe(36);
  });
  test("book Figure 21.8: p = 17, q = 11, e = 7, d = 23, 88 → 11", () => {
    expect(rsa(17, 11, 7).d).toBe(23);
    expect(modPow(88, 7, 187)).toBe(11);
    expect(modPow(11, 23, 187)).toBe(88);
  });
  test("Euler reduction from the lecture: 4^100003 mod 33 = 4^3 mod 33", () => {
    expect(modPow(4, 100003, 33)).toBe(64 % 33);
  });
  test("textbook-RSA pitfalls from the lecture: m ≥ n comes back as m mod n", () => {
    expect(modPow(modPow(35, 7, 33), 3, 33)).toBe(2);
    expect(modPow(5, 7, 33)).toBe(14);
  });
  test("Quiz 2 setting p = 11, q = 23 has valid exponents that sign and verify", () => {
    for (const e of rsaExponents(11, 23)) {
      const { n, d } = rsa(11, 23, e);
      expect(modPow(modPow(9, d, n), e, n)).toBe(9);
      expect(d).not.toBe(e);
    }
  });
});

test("Diffie-Hellman example (book §21.5 and Lecture 6)", () => {
  expect(primitiveRoots(353)).toContain(3);
  expect(modPow(3, 97, 353)).toBe(40);
  expect(modPow(3, 233, 353)).toBe(248);
  expect(modPow(248, 97, 353)).toBe(160);
  expect(modPow(40, 233, 353)).toBe(160);
  expect(primitiveRoots(23)[0]).toBe(5);
});

describe("elliptic curves (Lecture 6)", () => {
  const c7 = { a: 0, b: 7, p: 17 };
  test("doubling (15, 13) on y² = x³ + 7 mod 17 gives (2, 10) with λ = 7", () => {
    const s = ecAddSteps([15, 13], [15, 13], c7);
    expect(s.lam).toBe(7);
    expect(s.R).toEqual([2, 10]);
  });
  test("(1, 5) + (2, 7) = (1, 12)", () => {
    expect(ecAdd([1, 5], [2, 7], c7)).toEqual([1, 12]);
  });
  test("ECDH example: y² = x³ + 2x + 2 mod 17, G = (5, 1), n = 19", () => {
    const c = { a: 2, b: 2, p: 17 }, G = [5, 1];
    const m = multiples(G, c);
    expect(m).toHaveLength(18); // 19G = O
    expect(m[1]).toEqual([6, 3]);
    expect(m[8]).toEqual([7, 6]); // 9G
    expect(m[2]).toEqual([10, 6]); // 3G
    expect(ecMul(9, ecMul(3, G, c), c)).toEqual([13, 7]); // 27G = 8G
    expect(m.every(P => onCurve(P, c))).toBe(true);
  });
});

test("SSL capture: record lengths add up to the TCP payload", () => {
  for (let i = 0; i < 50; i++) {
    const s = sslCapture();
    expect(s.len).toBe(5 + 4 + s.pmsLen + 5 + 1 + 5 + s.finLen);
    expect(s.nextSeq).toBe(s.seq + s.len);
    expect(s.frameLen).toBe(54 + s.len);
    expect(s.records.map(r => r.type)).toEqual([22, 20, 22]);
  }
});
