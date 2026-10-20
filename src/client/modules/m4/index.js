import { M4_DRILLS, M4_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m4", num: 4, chapter: 4,
  short: "Network layer",
  title: "The network layer: data plane",
  blurb: "Inside a router, the IPv4 datagram, addressing and subnetting, NAT, IPv6, and match-plus-action forwarding.",
  focus: "Follow one packet into a router: header fields → forwarding-table lookup (longest prefix) → switching fabric → output queue and scheduler → maybe NAT, fragmentation or a match+action rule. Every lab is one stop on that journey.",
  obj: ["Explain the network layer's role in delivering packets", "Distinguish data plane from control plane", "Explain forwarding vs routing", "Describe a router's components and packet path", "Explain buffering, queueing and scheduling", "Interpret IPv4 datagram fields", "Apply IPv4 addressing and subnetting", "Explain NAT", "Describe IPv6's motivation and features", "Explain generalised match+action forwarding", "Describe SDN/OpenFlow and middleboxes"],
  read: [["Overview of the network layer", "304–311"], ["What's inside a router?", "311–330"], ["The Internet Protocol (IPv4, addressing, NAT, IPv6)", "330–353"], ["Generalized forwarding and SDN", "353–360"], ["Middleboxes", "360–364"]],
  probs: ["P5–P6 (scheduling, WFQ)", "P8–P10 (forwarding tables, LPM)", "P11, P14–P15 (subnetting)", "P17 (fragmentation)", "P18–P19 (NAT)", "P21–P23 (OpenFlow flow tables)"],
  inter: [["Longest prefix matching", "longestprefix.php"], ["Subnet addressing", "subnet_addressing.php"], ["Packet scheduling", "scheduling.php"], ["NAT", "nat.php"], ["IPv6 tunneling", "ip_tunneling.php"], ["OpenFlow flow tables", "openflow.php"]],
  lab: "Wireshark lab: IP", tutor: 4,
  drills: M4_DRILLS, mcq: M4_MCQ,
  ...study,
};
