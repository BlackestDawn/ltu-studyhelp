import { M1_DRILLS, M1_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m1", num: 1, chapter: 1,
  short: "Internet overview",
  title: "The Internet at a high level",
  blurb: "What the Internet is made of, how packets cross it, what slows them down, and why it is built in layers.",
  focus: "Build the conceptual map: what the parts are and how they relate. The only numbers you really need are the four delays, throughput as a bottleneck, and why packet switching wins for bursty users.",
  obj: ["Describe the Internet's main components", "Explain the role of protocols", "Distinguish network edge from network core", "Contrast packet switching and circuit switching", "Identify delay, loss and throughput as performance measures", "Explain why security matters", "Explain why protocols are organised into layers"],
  read: [["What is the Internet?", "1–9"], ["The network edge", "9–21"], ["The network core", "22–34"], ["Delay, loss and throughput", "35–46"], ["Protocol layers and their service models", "47–54"], ["Networks under attack", "54–58"]],
  probs: ["P6 (prop vs trans delay)", "P8–P9 (packet vs circuit)", "P10 (multi-hop delay)", "P13 (queuing bursts)", "P20–P22 (throughput)", "P25 (bandwidth-delay)", "P31 (message segmentation)"],
  inter: [["One-hop transmission delay", "one-hop-delay.php"], ["End-to-end delay", "end-end-delay.php"], ["Queuing delay", "qdelay.php"], ["End-to-end throughput", "end-end-throughput-simple.php"], ["Packet vs circuit switching", "ps_versus_cs.php"], ["Circuit switching", "circuit_switching.php"], ["Car-caravan analogy", "caravan.php"], ["Protocol layering", "layers.php"]],
  lab: "Wireshark lab: Getting Started", tutor: 1,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 1: Computer networks and the Internet", pages: "pp. 1–21, 47–54",
      notes: ["internet", "edge", "layers"],
      focus: "Build a mental picture of what the Internet is made of, what protocols do, where end systems sit, and how each layer provides a service to the layer above.",
      takeaway: "The Internet is a network of interconnected networks whose end systems communicate using agreed protocols. Layers manage the complexity: each one provides services to the layer above and uses the services of the layer below." },
    { title: "Lecture 2: Network core, performance and security", pages: "pp. 22–46, 54–58",
      notes: ["core", "delay", "security"],
      focus: "Understand how packets move through the core, why congestion causes delay and loss, how link capacities limit throughput, and which threats need which protection. Practise the delay and throughput calculations.",
      takeaway: "The core moves data by packet switching through shared routers and links, so packets can be delayed or lost, and throughput is capped by the path's bottleneck. Communicating over a network also brings security risks that need protection at several layers." },
  ],
  drills: M1_DRILLS, mcq: M1_MCQ,
  ...study,
};
