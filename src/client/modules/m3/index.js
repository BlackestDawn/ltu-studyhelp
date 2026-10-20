import { M3_DRILLS, M3_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m3", num: 3, chapter: 3,
  short: "Transport layer",
  title: "The transport layer",
  blurb: "From host-to-host to process-to-process: UDP, building reliable transfer step by step, TCP, and congestion control.",
  focus: "These mechanisms build on each other: checksum → ACK/NAK → sequence numbers → timers → pipelining (GBN/SR) → TCP. For each, ask what failure it fixes. Then trace cwnd by hand until you can do it without the rules in front of you.",
  obj: ["Explain the transport layer's role and services", "Explain multiplexing and demultiplexing", "Describe UDP", "Explain the mechanisms for reliable data transfer", "Describe how TCP provides reliable, connection-oriented transport", "Explain connection management and flow control", "Explain why congestion occurs and congestion-control principles", "Explain how TCP adapts its sending rate", "Analyse basic TCP performance and throughput"],
  read: [["Transport-layer services", "182–187"], ["Multiplexing and demultiplexing", "187–194"], ["Connectionless transport: UDP", "194–200"], ["Principles of reliable data transfer", "200–226"], ["Connection-oriented transport: TCP", "227–255"], ["Principles of congestion control", "255–263"], ["TCP congestion control", "263–279"], ["Evolution of transport-layer functionality", "279–282"]],
  probs: ["P3–P4 (checksum)", "P9 (rdt3.0 trace)", "P15 (pipelining utilisation)", "P22–P23 (GBN/SR windows)", "P26–P27 (seq/ACK numbers)", "P31–P32 (RTT estimation)", "P40 (read a cwnd graph)", "P44–P45 (TCP throughput)"],
  inter: [["Internet checksum", "internet_checksum.php"], ["UDP mux/demux", "UDP_Mux_Demux.php"], ["TCP mux/demux", "TCP_Mux_Demux.php"], ["rdt2.2", "rdt22.php"], ["rdt3.0", "rdt30.php"], ["TCP seq/ACK with loss", "tcp_segloss.php"], ["TCP RTT and timeout", "TCP_RTT.php"], ["TCP retransmissions", "tcp_retrans.php"], ["TCP cwnd evolution", "tcp_evolution.php"]],
  lab: "Wireshark labs: TCP, UDP", tutor: 3,
  drills: M3_DRILLS, mcq: M3_MCQ,
  ...study,
};
