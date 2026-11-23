import { M6_DRILLS, M6_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m6", num: 6, chapter: 6,
  short: "Link layer",
  title: "The link layer and LANs",
  blurb: "How a datagram crosses one link: framing, sharing a channel, MAC addresses and ARP, Ethernet, self-learning switches and VLANs.",
  focus: "Follow one IP datagram across a single link: how it is wrapped in a frame, how the sender finds the right MAC address, how access to a shared link is coordinated, and how a switch decides where the frame goes. Then practise the ALOHA, backoff and switch-table labs until they feel mechanical.",
  obj: ["Explain the role of the link layer and how it supports the network layer", "Explain how network-layer datagrams are encapsulated into link-layer frames", "Distinguish between point-to-point and shared-medium links", "Explain why multiple-access protocols are required and compare channel-partitioning, random-access and taking-turns approaches", "Explain the basic operation of ALOHA and CSMA/CD", "Distinguish between IP addresses and MAC addresses and explain their different roles", "Explain how ARP resolves an IP address to a MAC address on a local network", "Describe the basic operation of Ethernet", "Explain how Ethernet switches learn, filter, flood and forward frames", "Describe at a high level the motivation for VLANs and how they can logically separate devices within a switched network"],
  concepts: ["Link layer", "Frames", "Multiple access", "Channel partitioning", "Random access", "CSMA/CD", "MAC addressing", "ARP", "Ethernet", "Switches", "Self-learning", "Frame forwarding", "VLANs"],
  questions: [
    "What does the link layer need to do to move an IP datagram across one link?",
    "How can several devices share the same communication channel efficiently?",
    "If a host knows the destination IP address, how does it find the MAC address to put in the Ethernet frame?",
    "What must an Ethernet frame contain so it can be delivered across a LAN?",
    "How can an Ethernet switch learn where devices are without being configured with every MAC address?",
    "How can one physical switched network behave as several logically separate LANs?",
  ],
  read: [["Introduction to the link layer", "450–454"], ["Multiple access links and protocols", "461–477"], ["Switched local area networks", "477–501"]],
  probs: ["P8–P9 (ALOHA efficiency)", "P10–P13 (slotted ALOHA, polling)", "P14–P16 (addressing across routers and switches)", "P17–P19 (CSMA/CD backoff and timing)", "P21–P22 (MAC and IP addresses per hop)", "P23–P26 (hubs, switches, learning switch)", "P28 (VLANs)"],
  inter: [["Random access protocols: ALOHA", "aloha.php"], ["Random access protocols: collisions", "collisions.php"], ["Link- and network-layer addressing", "link_layer_addressing.php"], ["Learning switches: basic", "learning_switch_basic.php"], ["Learning switches: advanced", "learning_switch.php"]],
  lab: "Wireshark lab: Ethernet and ARP", tutor: 6,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  // The course skips §6.2 (error detection and correction).
  lectures: [
    { title: "Lecture 13: The link layer", pages: "pp. 450–454, 461–501",
      notes: ["intro", "access", "random", "turns", "arp", "ethernet", "switch", "vlan"],
      focus: "Follow the journey of an IP datagram across a single link: how it is encapsulated into a frame, how the sender finds the right MAC address, how access to the link is coordinated, and how an Ethernet switch decides where the frame goes.",
      takeaway: "The link layer gives hop-by-hop communication between neighbouring devices. Datagrams are wrapped in frames, link-layer addresses identify interfaces on the local network, and multiple-access protocols and Ethernet switching decide how frames cross each link." },
  ],
  drills: M6_DRILLS, mcq: M6_MCQ,
  ...study,
};
