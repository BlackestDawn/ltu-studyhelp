// Helpers for the Computer and Network Security course: the lecture's 4-bit
// block cipher and its modes, the naive rotate-XOR hash, PKCS#5 padding,
// modular arithmetic for RSA and Diffie-Hellman, small elliptic curves, and a
// generator for an SSL capture like the one in Quiz 4.
import { gcd, modPow } from "./crypto.js";
import { rnd, pick, shuffle } from "./util.js";

export { gcd, modPow };

/* ---------- 4-bit block cipher (Lecture 3 example and Quiz 1) ---------- */
// TOY[i] is the output block for input block i.
export const TOY = [0b1001, 0b0010, 0b1110, 0b0100, 0b0000, 0b0111, 0b0001, 0b0011,
  0b0101, 0b1101, 0b0110, 0b1010, 0b1111, 0b1011, 0b1100, 0b1000];
export const TOY_INV = TOY.reduce((inv, out, i) => { inv[out] = i; return inv; }, []);

export const b4 = n => n.toString(2).padStart(4, "0");
// "1001 1001 1001" or "100110011001" → [9, 9, 9]
export const blocks4 = s => s.replace(/[^01]/g, "").match(/.{4}/g).map(x => parseInt(x, 2));
export const show4 = bs => bs.map(b4).join(" ");

// Encrypt 4-bit blocks in each mode. Every mode returns the ciphertext blocks and
// the steps (what was fed to the cipher, what came out) for the worked solution.
// CTR uses counter values IV, IV + 1, IV + 2, … (mod 16).
export function encryptModes(pt, iv, E = TOY) {
  const ecb = pt.map(p => E[p]);
  const cbc = [], cbcSteps = [];
  let prev = iv;
  for (const p of pt) { const x = p ^ prev, c = E[x]; cbcSteps.push({ p, prev, x, c }); cbc.push(c); prev = c; }
  const cfb = [], cfbSteps = [];
  prev = iv;
  for (const p of pt) { const k = E[prev], c = p ^ k; cfbSteps.push({ p, prev, k, c }); cfb.push(c); prev = c; }
  const ofb = [], ofbSteps = [];
  let o = iv;
  for (const p of pt) { const inp = o; o = E[o]; const c = p ^ o; ofbSteps.push({ p, prev: inp, k: o, c }); ofb.push(c); }
  const ctr = [], ctrSteps = [];
  pt.forEach((p, i) => { const n = (iv + i) & 15, k = E[n], c = p ^ k; ctrSteps.push({ p, prev: n, k, c }); ctr.push(c); });
  return { ECB: ecb, CBC: cbc, CFB: cfb, OFB: ofb, CTR: ctr, steps: { CBC: cbcSteps, CFB: cfbSteps, OFB: ofbSteps, CTR: ctrSteps } };
}

// Decrypt in CBC mode: P_i = D(C_i) ⊕ C_{i−1}.
export function decryptCBC(ct, iv, D = TOY_INV) {
  let prev = iv;
  return ct.map(c => { const p = D[c] ^ prev; prev = c; return p; });
}

/* ---------- naive hash from Lecture 2 ---------- */
// "Circular shift": the last bit moves to the first position (a right rotation).
export const rotr = (x, n = 4) => ((x >>> 1) | ((x & 1) << (n - 1))) & ((1 << n) - 1);
// H = (…((M1 << ⊕ M2) << ⊕ M3) …), i.e. start from 0, then rotate and XOR in each block.
export const naiveHash = (bs, n = 4) => bs.reduce((h, m) => rotr(h, n) ^ m, 0);
// Block to append after `extra` so that the longer message hashes to `target` again.
export function forgeBlock(target, hNew, n = 4) { return rotr(hNew, n) ^ target; }

/* ---------- PKCS#5 / PKCS#7 padding ---------- */
// Bytes of padding added to a message of `len` bytes for block size `b` bytes.
// A message that is already a multiple of b still gets a full block of padding.
export const padLen = (len, b) => b - (len % b);

/* ---------- modular arithmetic ---------- */
// Extended Euclidean algorithm, with the rows of the table for the worked solution.
export function egcd(a, b) {
  const rows = [];
  let [r0, r1, s0, s1, t0, t1] = [a, b, 1, 0, 0, 1];
  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);
    rows.push({ r0, r1, q });
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
    [t0, t1] = [t1, t0 - q * t1];
  }
  return { g: r0, x: s0, y: t0, rows };
}
// Multiplicative inverse of a mod m, or null if none exists.
export const inv = (a, m) => { const { g, x } = egcd(((a % m) + m) % m, m); return g === 1 ? ((x % m) + m) % m : null; };
export const mod = (a, m) => ((a % m) + m) % m;
// Euler's totient by counting (fine for the small numbers used in exercises).
export const phi = n => { let k = 0; for (let i = 1; i <= n; i++) if (gcd(i, n) === 1) k++; return k; };
export const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
export const PRIMES = Array.from({ length: 200 }, (_, i) => i).filter(isPrime);

// RSA key pair from p, q, e (φ(n) = (p−1)(q−1), d = e⁻¹ mod φ(n)).
export function rsa(p, q, e) {
  const n = p * q, f = (p - 1) * (q - 1), d = inv(e, f);
  return { n, f, e, d };
}
// Public exponents 1 < e < φ(n) with gcd(e, φ(n)) = 1 whose inverse differs from e.
export const rsaExponents = (p, q) => { const f = (p - 1) * (q - 1); return Array.from({ length: f - 2 }, (_, i) => i + 2).filter(e => gcd(e, f) === 1 && inv(e, f) !== e); };

// Smallest primitive root of a prime p (generator for Diffie-Hellman).
export function primitiveRoots(p) {
  const f = p - 1, factors = [...new Set(Array.from({ length: f }, (_, i) => i + 2).filter(d => f % d === 0 && isPrime(d)))];
  return Array.from({ length: p - 2 }, (_, i) => i + 2).filter(g => factors.every(q => modPow(g, f / q, p) !== 1));
}

/* ---------- elliptic curves y² = x³ + ax + b over GF(p) ---------- */
// Points are [x, y]; the point at infinity O is null.
export const onCurve = (P, c) => P === null || mod(P[1] * P[1] - (P[0] ** 3 + c.a * P[0] + c.b), c.p) === 0;
// P + Q with the slope λ, so the worked solution can show it.
export function ecAddSteps(P, Q, c) {
  if (P === null) return { R: Q };
  if (Q === null) return { R: P };
  const [x1, y1] = P, [x2, y2] = Q, p = c.p;
  if (x1 === x2 && mod(y1 + y2, p) === 0) return { R: null };
  const dbl = x1 === x2 && y1 === y2;
  const num = dbl ? mod(3 * x1 * x1 + c.a, p) : mod(y2 - y1, p), den = dbl ? mod(2 * y1, p) : mod(x2 - x1, p);
  const di = inv(den, p), lam = mod(num * di, p);
  const x3 = mod(lam * lam - x1 - x2, p), y3 = mod(lam * (x1 - x3) - y1, p);
  return { R: [x3, y3], lam, num, den, di, dbl };
}
export const ecAdd = (P, Q, c) => ecAddSteps(P, Q, c).R;
// [G, 2G, 3G, …] until O; the list length is the order n of G.
export function multiples(G, c) {
  const out = [G];
  let P = G;
  for (let i = 0; i < 4 * c.p + 8; i++) { P = ecAdd(P, G, c); if (P === null) break; out.push(P); }
  return out;
}
export const ecMul = (k, G, c) => { let R = null; for (let i = 0; i < k; i++) R = ecAdd(R, G, c); return R; };
export const curvePoints = c => {
  const pts = [];
  for (let x = 0; x < c.p; x++) for (let y = 0; y < c.p; y++) if (onCurve([x, y], c)) pts.push([x, y]);
  return pts;
};
export const showPt = P => (P === null ? "O" : `(${P[0]}, ${P[1]})`);

/* ---------- an SSL session capture (Quiz 4, after Kurose & Ross P19) ---------- */
const hex2 = n => n.toString(16).padStart(2, "0");
const randIp = () => `${rnd(11, 223)}.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}`;

// A ClientKeyExchange packet like Wireshark packet 112 in the quiz: three SSL
// records (ClientKeyExchange, ChangeCipherSpec, encrypted Finished) in one TCP segment.
export function sslCapture() {
  const client = randIp(), server = randIp(), cport = rnd(1025, 60000);
  const pmsLen = pick([128, 128, 256]), finLen = pick([40, 48, 56, 64]);
  const seq = rnd(60, 220), ack = rnd(1500, 5200);
  const pms = Array.from({ length: pmsLen }, () => rnd(0, 255));
  const fin = Array.from({ length: finLen }, () => rnd(0, 255));
  const rec = (type, body) => [type, 3, 0, body.length >> 8, body.length & 255, ...body];
  const cke = rec(22, [16, (pmsLen >> 16) & 255, (pmsLen >> 8) & 255, pmsLen & 255, ...pms]);
  const ccs = rec(20, [1]);
  const enc = rec(22, fin);
  const payload = [...cke, ...ccs, ...enc];
  // Ethernet (14) + IP (20) + TCP (20) headers; the dump starts at offset 0x30 as in the quiz.
  const header = Array.from({ length: 54 }, () => rnd(0, 255));
  const frame = [...header, ...payload];
  const rows = [];
  for (let off = 0x30; off < frame.length; off += 16) rows.push(`${off.toString(16).padStart(4, "0")}  ${frame.slice(off, off + 16).map(hex2).join(" ")}`);
  const t0 = rnd(10, 40) + Math.random();
  const list = [
    [106, "SSLv2", "client", "Client Hello"],
    [108, "SSLv3", "server", "Server Hello"],
    [111, "SSLv3", "server", "Certificate, Server Hello Done"],
    [112, "SSLv3", "client", "Client Key Exchange, Change Cipher Spec, Encrypted Handshake Message"],
    [113, "SSLv3", "server", "Change Cipher Spec, Encrypted Handshake Message"],
    [114, "SSLv3", "client", "Application Data"],
  ].map(([no, proto, from, info], i) => ({ no, time: (t0 + i * 0.024).toFixed(6), src: from === "client" ? client : server, dst: from === "client" ? server : client, proto, info }));
  return {
    client, server, cport, seq, ack, pmsLen, finLen, rows, list,
    len: payload.length, frameLen: frame.length, nextSeq: seq + payload.length,
    first: hex2(pms[0]), last: hex2(pms.at(-1)),
    records: [{ type: 22, len: cke.length - 5 }, { type: 20, len: 1 }, { type: 22, len: finLen }],
  };
}

/* ---------- small helpers for generators ---------- */
export const randBits4 = n => Array.from({ length: n }, () => rnd(0, 15));
export const distinct = (k, a, b) => shuffle(Array.from({ length: b - a + 1 }, (_, i) => a + i)).slice(0, k);
