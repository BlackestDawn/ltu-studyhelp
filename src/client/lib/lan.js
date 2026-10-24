// Link-layer helpers shared by the module 6 labs and models.

// Self-learning switch (book §6.4.3): record the frame's source address and the
// port it came in on, then flood (destination unknown or broadcast), filter
// (destination is on the incoming port) or forward to the one known port.
export function switchFrame(table, inPort, src, dst, ports) {
  table[src] = inPort;
  if (dst === "*" || !(dst in table)) return { action: "flood", out: ports.filter(p => p !== inPort) };
  if (table[dst] === inPort) return { action: "filter", out: [] };
  return { action: "forward", out: [table[dst]] };
}

// Slotted / pure ALOHA efficiency with N active nodes each sending with probability p.
export const slottedAloha = (N, p) => N * p * (1 - p) ** (N - 1);
export const pureAloha = (N, p) => N * p * (1 - p) ** (2 * (N - 1));
