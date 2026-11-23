import { M7_DRILLS, M7_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m7", num: 7, chapter: 7,
  short: "Wireless & mobile",
  title: "Wireless and mobile networks",
  blurb: "What changes when the link is wireless, and when the device moves: wireless links, CDMA, Wi-Fi, 4G/5G cellular, mobility management and the effect on TCP.",
  focus: "Keep wireless and mobility apart: a device can be wireless without moving. For each mechanism, ask whether it solves a wireless-link problem (weak, noisy, shared signal), a network-access problem, or a mobility problem (finding a device that has moved).",
  obj: ["Explain the main characteristics and challenges of wireless communication", "Explain how path loss, interference, multipath propagation and the hidden-terminal problem affect wireless links", "Explain the relationship between signal-to-noise ratio (SNR), bit error rate (BER) and transmission rate", "Describe the basic architecture and operation of IEEE 802.11 Wi-Fi networks", "Explain why Wi-Fi uses CSMA/CA rather than the collision detection traditionally associated with Ethernet", "Describe the basic architecture and major components of 4G/5G cellular networks", "Distinguish between wireless communication and mobility", "Explain the fundamental principles of mobility management", "Explain the difference between direct and indirect routing for mobile users", "Explain at a high level how handover lets communication continue as a mobile device changes its point of attachment", "Explain how wireless communication and mobility can affect higher-layer protocols such as TCP and real-time applications"],
  concepts: ["Wireless links", "Path loss", "Interference", "Multipath", "SNR", "BER", "Hidden terminals", "Wi-Fi", "CSMA/CA", "4G/5G", "Mobility", "Handover", "Tunnelling"],
  questions: [
    "Why can't a wireless link be treated as an Ethernet cable without the cable?",
    "How can several wireless devices share one channel when they can't reliably hear every competing transmission?",
    "How does a cellular network connect a mobile device to the wider Internet?",
    "If a device moves to another network, how can packets still find it?",
    "How might a transport protocol interpret packet loss caused by a wireless link or by mobility?",
  ],
  read: [["Introduction", "532–536"], ["Wireless links and network characteristics", "536–542"], ["WiFi: 802.11 wireless LANs", "542–563"], ["Cellular networks: 4G and 5G", "563–578"], ["Mobility management: principles", "578–587"], ["Mobility management in practice", "587–594"], ["Impact on higher-layer protocols", "594–596"]],
  probs: ["P1–P4 (CDMA)", "P5 (Wi-Fi channels)", "P6–P8 (CSMA/CA, RTS/CTS)", "P10 (LTE slots)", "P11–P12 (mobility, handover delay)", "P13–P14 (attaching and tunnelling in a visited LTE network)"],
  inter: [["CDMA: basic", "cdma.php"], ["CDMA: advanced", "cdma_advanced.php"], ["4G wireless tunnelling", "4g_tunneling.php"], ["4G wireless handover", "4g_handover.php"]],
  lab: "Wireshark lab: 802.11", tutor: 7,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 14: Wireless and mobile networks", pages: "pp. 532–596",
      notes: ["intro", "links", "cdma", "wifi", "csmaca", "cellular", "mobility", "practice", "impact"],
      focus: "Keep wireless communication and mobility conceptually separate. A device can communicate wirelessly without moving; a mobile device adds the challenge of changing its point of attachment. For each mechanism, ask whether it solves a wireless-link problem or a mobility problem.",
      takeaway: "Wireless networking brings a variable, shared medium; mobility adds the challenge of keeping communication going as a device changes its point of attachment. Wi-Fi and cellular networks provide wireless access in different ways, and mobility management lets communication continue as users move." },
  ],
  drills: M7_DRILLS, mcq: M7_MCQ,
  ...study,
};
