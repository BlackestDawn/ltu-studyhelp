// Security helpers shared by the module 8 labs and models.

// --- Toy RSA (book §8.2.2), with BigInt so m^e never overflows ---
export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
export const modPow = (base, exp, mod) => {
  let r = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }
  return Number(r);
};
// Smallest d > 0 with e·d mod z = 1.
export const modInverse = (e, z) => { for (let d = 1; d < z; d++) if ((e * d) % z === 1) return d; return null; };
// Like the book (e = 5, d = 29 rather than 5), d is chosen to differ from e, so the two keys differ.
export function rsaKeys(p, q, e) {
  const n = p * q, z = (p - 1) * (q - 1), d = modInverse(e, z);
  return { n, z, e, d: d === e ? d + z : d };
}
// Valid public exponents e (1 < e < n, no common factor with z) for given p, q.
export const validE = (p, q) => { const n = p * q, z = (p - 1) * (q - 1); return [...Array(n).keys()].filter(e => e > 1 && gcd(e, z) === 1); };

// --- Caesar cipher: shift each letter k places, wrapping around ---
export const caesar = (text, k) => text.replace(/[a-z]/gi, ch => {
  const base = ch === ch.toUpperCase() ? 65 : 97;
  return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26 + 26) % 26 + base);
});

// --- Stateless packet filter: the book's Table 8.6 ACL for organisation 222.22/16 ---
// Rules are tried top to bottom; the first match decides.
export const ACL = [
  { action: "allow", src: "inside", dst: "outside", proto: "TCP", sport: ">1023", dport: "80", flag: "any" },
  { action: "allow", src: "outside", dst: "inside", proto: "TCP", sport: "80", dport: ">1023", flag: "ACK" },
  { action: "allow", src: "inside", dst: "outside", proto: "UDP", sport: ">1023", dport: "53", flag: "—" },
  { action: "allow", src: "outside", dst: "inside", proto: "UDP", sport: "53", dport: ">1023", flag: "—" },
  { action: "deny", src: "all", dst: "all", proto: "all", sport: "all", dport: "all", flag: "all" },
];
const portOk = (rule, p) => rule === "all" || (rule === ">1023" ? p > 1023 : p === +rule);
// pkt: { src: "inside"|"outside", dst, proto: "TCP"|"UDP"|"ICMP", sport, dport, ack: boolean }
export function filterPacket(pkt) {
  const i = ACL.findIndex(r =>
    (r.src === "all" || r.src === pkt.src) && (r.dst === "all" || r.dst === pkt.dst) &&
    (r.proto === "all" || r.proto === pkt.proto) &&
    (r.proto === "all" || (portOk(r.sport, pkt.sport) && portOk(r.dport, pkt.dport))) &&
    (r.flag !== "ACK" || pkt.ack));
  return { rule: i + 1, action: ACL[i].action };
}
