// Wireless helpers shared by the module 7 labs and models.

// Eight orthogonal ±1 codes of length 8 (Walsh/Hadamard rows, minus the all-ones row).
// Any two different rows have inner product 0, so CDMA senders using them don't interfere.
export const CODES = (() => {
  let h = [[1]];
  for (let n = 1; n < 8; n *= 2) h = [...h.map(r => [...r, ...r]), ...h.map(r => [...r, ...r.map(x => -x)])];
  return h.slice(1);
})();

export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
// Sender output for one data bit d (±1): Z_m = d · c_m.
export const encode = (d, code) => code.map(c => d * c);
// The channel adds the senders' outputs mini-slot by mini-slot.
export const channel = outs => outs[0].map((_, m) => outs.reduce((s, o) => s + o[m], 0));
// Receiver for a code: d = (1/M) Σ Z*_m · c_m.
export const decode = (z, code) => dot(z, code) / code.length;

// SNR in dB from signal and noise amplitudes (the book's definition).
export const snrDb = (aSignal, aNoise) => 20 * Math.log10(aSignal / aNoise);
