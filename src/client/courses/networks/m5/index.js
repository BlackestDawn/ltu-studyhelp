import { M5_DRILLS, M5_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m5", num: 5, chapter: 5,
  short: "Control plane",
  title: "The network layer: control plane",
  blurb: "How routes are computed and shared: link-state and distance-vector routing, OSPF and BGP, SDN, ICMP and network management.",
  focus: "Don't memorise protocols one by one. For each, ask what information the control plane has, how it uses that information to choose paths, and how the decisions reach every router. Then practise Dijkstra and Bellman-Ford on paper until you can do a full table without help.",
  obj: ["Explain the role of the network-layer control plane and its relationship to the data plane", "Distinguish between routing and forwarding", "Explain and compare link-state and distance-vector routing", "Apply Dijkstra's algorithm to determine least-cost paths through a network", "Apply the Bellman-Ford distance-vector approach and explain how routes are updated through information exchanged between neighbouring routers", "Explain why Internet routing is organised into Autonomous Systems (ASes)", "Describe the operation and purpose of OSPF as an intra-AS routing protocol", "Describe the operation and purpose of BGP as an inter-AS routing protocol and explain the role of routing policy", "Explain the principles of a logically centralised SDN control plane and the role of OpenFlow", "Explain how ICMP supports network error reporting and diagnostic tools such as ping and traceroute", "Describe the basic roles of SNMP, NETCONF and YANG in network management"],
  concepts: ["Control plane", "Routing", "Link state", "Dijkstra", "Distance vector", "Bellman-Ford", "Autonomous system", "OSPF", "BGP", "Routing policy", "SDN", "OpenFlow", "ICMP", "SNMP", "NETCONF", "YANG"],
  questions: [
    "Where does the forwarding information used by a router's data plane come from?",
    "How can a router find the least-cost path when it knows the whole network topology?",
    "How can routers find least-cost paths using only what their neighbours tell them?",
    "Why does the Internet use different approaches for routing within and between autonomous systems?",
    "How does an SDN control plane differ from traditional per-router control?",
    "How can an IP network report errors and network conditions back to an end system?",
    "How can network administrators observe and configure large numbers of devices?",
  ],
  read: [["Introduction to the control plane", "378–380"], ["Routing algorithms: link state and distance vector", "380–395"], ["Intra-AS routing: OSPF", "395–399"], ["Routing among the ISPs: BGP", "399–411"], ["The SDN control plane", "411–419"], ["ICMP", "423–425"], ["Network management: SNMP, NETCONF/YANG", "425–436"]],
  probs: ["P3–P4 (Dijkstra)", "P5, P8 (distance vector)", "P9–P11 (link-cost changes, count-to-infinity)", "P12–P15 (BGP loops and route choice)", "P16–P19 (BGP policy)", "P21–P22 (SNMP)"],
  inter: [["Dijkstra's link-state algorithm", "dij.php"], ["Dijkstra's algorithm: advanced", "dij_advanced.php"], ["Bellman-Ford distance vector", "disVector.php"]],
  lab: "Wireshark lab: ICMP", tutor: 5,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 10: Control plane and routing algorithms", pages: "pp. 378–395",
      notes: ["intro", "routing", "ls", "dv"],
      focus: "Ask what information each routing approach has and how it uses it. Link state needs a global view of the network; distance vector learns routes through repeated exchanges with neighbours. Understand why, rather than memorising the algorithms mechanically.",
      takeaway: "Routing algorithms decide which paths packets follow. Link-state routing computes routes from a global view of the topology; distance-vector routing computes them through distributed exchanges between neighbours. Both look for good paths, but differ in what each router knows and how that knowledge spreads." },
    { title: "Lecture 11: OSPF, BGP and OpenFlow", pages: "pp. 395–419",
      notes: ["ospf", "bgp", "sdn"],
      focus: "See how the routing principles are put into practice: OSPF inside an autonomous system, BGP between them, and SDN controllers using OpenFlow. Keep the different roles of OSPF and BGP apart rather than treating them as interchangeable.",
      takeaway: "The Internet scales its routing by grouping routers into autonomous systems: OSPF (link state) computes paths inside an AS, while BGP spreads reachability between ASes and lets policy decide which routes are used. SDN moves route computation into a logically centralised controller that programs switches through OpenFlow." },
    { title: "Lecture 12: ICMP and network management", pages: "pp. 423–436",
      notes: ["icmp", "mgmt"],
      focus: "Keep diagnosing apart from managing. ICMP reports network-layer conditions and underpins ping and traceroute; SNMP and NETCONF/YANG give structured ways to monitor and configure devices.",
      takeaway: "Operating a network takes more than forwarding and routing. ICMP lets hosts and routers report and diagnose network-layer conditions, while network management lets operators monitor, organise and configure their devices." },
  ],
  drills: M5_DRILLS, mcq: M5_MCQ,
  ...study,
};
