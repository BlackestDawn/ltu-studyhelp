import { M4_DRILLS, M4_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m4", num: 4, chapter: 4,
  short: "Network layer",
  title: "The network layer: data plane",
  blurb: "Inside a router, the IPv4 datagram, addressing and subnetting, NAT, IPv6, and match-plus-action forwarding.",
  focus: "Follow one packet into a router: header fields → forwarding-table lookup (longest prefix) → switching fabric → output queue and scheduler → maybe NAT, fragmentation or a match+action rule. Every lab is one stop on that journey. For each mechanism, ask what information decides what happens to the packet next, and what problem the mechanism solved as the Internet grew.",
  obj: ["Explain the role of the network layer in delivering packets between hosts", "Distinguish between the data plane and the control plane", "Explain the difference between forwarding and routing", "Describe the main components of a router and explain how packets move through it", "Explain how buffering, queueing and scheduling affect packet forwarding", "Interpret the main fields of an IPv4 datagram", "Explain the principles of IPv4 addressing, subnetting, CIDR and longest-prefix matching", "Explain the purpose and operation of Network Address Translation (NAT)", "Describe the motivation for IPv6 and how tunnelling supports the transition from IPv4", "Explain generalised match+action forwarding and its relationship to OpenFlow and programmable networks", "Describe the roles of middleboxes in modern networks", "Explain how these developments relate to the Internet's end-to-end architectural principles"],
  concepts: ["Network layer", "Data plane", "Forwarding", "Router architecture", "Buffering", "Packet scheduling", "IPv4", "Subnetting", "CIDR", "Longest-prefix matching", "NAT", "IPv6", "Tunnelling", "Match+action", "OpenFlow", "Middleboxes"],
  questions: [
    "What is the difference between forwarding a packet and working out the route packets should follow?",
    "What happens to a packet from the moment it enters a router until it leaves on an outgoing link?",
    "What information does IP provide so a datagram can be forwarded across an internetwork?",
    "Given an IP address and prefix, what can you work out about the network it belongs to?",
    "Why were mechanisms such as NAT and IPv6 needed as the Internet grew?",
    "How does match+action generalise traditional destination-based forwarding?",
    "How can a middlebox behave differently from a traditional IP router?",
  ],
  read: [["Overview of the network layer", "304–311"], ["What's inside a router?", "311–330"], ["The Internet Protocol (IPv4, addressing, NAT, IPv6)", "330–353"], ["Generalized forwarding and SDN", "353–360"], ["Middleboxes", "360–364"]],
  probs: ["P5–P6 (scheduling, WFQ)", "P8–P10 (forwarding tables, LPM)", "P11, P14–P15 (subnetting)", "P17 (fragmentation)", "P18–P19 (NAT)", "P21–P23 (OpenFlow flow tables)"],
  inter: [["Longest prefix matching", "longestprefix.php"], ["Subnet addressing", "subnet_addressing.php"], ["Packet scheduling", "scheduling.php"], ["NAT", "nat.php"], ["IPv6 tunneling", "ip_tunneling.php"], ["OpenFlow flow tables", "openflow.php"]],
  lab: "Wireshark lab: IP", tutor: 4,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 8: Network layer, inside a router, and IP", pages: "pp. 304–344",
      notes: ["overview", "router", "ipv4", "addressing"],
      focus: "Follow one IP datagram through a router: how the header and the forwarding table pick the output port, what happens when packets have to wait, and how IP addresses identify networks and interfaces.",
      takeaway: "The network layer moves datagrams between hosts across interconnected networks. At each router, the data plane reads the header and uses forwarding information to move the datagram from an input port to the right output port. Hierarchical IP addressing makes this forwarding scale." },
    { title: "Lecture 9: NAT, IPv6, generalised forwarding and middleboxes", pages: "pp. 344–364",
      notes: ["nat", "ipv6", "generalized", "middleboxes"],
      focus: "See how the data plane has grown beyond destination-based forwarding. For each mechanism, ask what problem it solves, what packet information it uses or changes, where it runs, and what it costs the Internet's architecture.",
      takeaway: "Today's data plane does far more than forward on the destination address: NAT translates addresses, IPv6 extends addressing, generalised forwarding makes packet processing programmable, and middleboxes add functions inside the network. Through it all, IP remains the common network-layer foundation." },
  ],
  drills: M4_DRILLS, mcq: M4_MCQ,
  ...study,
};
