import { M3_DRILLS, M3_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m3", num: 3, chapter: 3,
  short: "Transport layer",
  title: "The transport layer",
  blurb: "From host-to-host to process-to-process: UDP, building reliable transfer step by step, TCP, and congestion control.",
  focus: "The transport layer's mechanisms build on each other: checksum → ACK/NAK → sequence numbers → timers → pipelining (GBN/SR) → TCP. For each, ask what failure it fixes and how it combines with the others. Keep flow control (protects the receiver) apart from congestion control (protects the network). Then trace cwnd by hand until you can do it without the rules in front of you.",
  obj: ["Explain the role of the transport layer and the services it provides to applications", "Explain how multiplexing and demultiplexing let many application processes share network communication", "Describe the operation and characteristics of UDP", "Explain the fundamental mechanisms used to achieve reliable data transfer", "Describe how TCP provides connection-oriented, reliable transport between processes", "Explain the purpose of TCP connection management and flow control", "Explain why network congestion occurs and the basic principles of congestion control", "Explain how TCP congestion control adapts the sending rate to network conditions", "Apply transport-layer concepts to analyse basic TCP performance and throughput"],
  concepts: ["Transport layer", "Process-to-process communication", "Multiplexing / demultiplexing", "Port numbers", "UDP", "TCP", "Reliable data transfer", "Sequence numbers", "Acknowledgements", "Retransmission", "Flow control", "Connection management", "Congestion control", "cwnd", "Slow start", "Congestion avoidance"],
  questions: [
    "What communication services does the transport layer give application processes?",
    "How does a receiving host know which process should get an incoming segment?",
    "Why might an application choose UDP rather than TCP?",
    "How can two end systems communicate reliably over an unreliable network?",
    "How does TCP give reliable, in-order communication between two processes?",
    "How can a sender adapt its rate when the network becomes congested?",
    "What determines the throughput a TCP connection can achieve?",
  ],
  read: [["Transport-layer services", "182–187"], ["Multiplexing and demultiplexing", "187–194"], ["Connectionless transport: UDP", "194–200"], ["Principles of reliable data transfer", "200–226"], ["Connection-oriented transport: TCP", "227–255"], ["Principles of congestion control", "255–263"], ["TCP congestion control", "263–279"], ["Evolution of transport-layer functionality", "279–282"]],
  probs: ["P3–P4 (checksum)", "P9 (rdt3.0 trace)", "P15 (pipelining utilisation)", "P22–P23 (GBN/SR windows)", "P26–P27 (seq/ACK numbers)", "P31–P32 (RTT estimation)", "P40 (read a cwnd graph)", "P44–P45 (TCP throughput)"],
  inter: [["Internet checksum", "internet_checksum.php"], ["UDP mux/demux", "UDP_Mux_Demux.php"], ["TCP mux/demux", "TCP_Mux_Demux.php"], ["rdt2.2", "rdt22.php"], ["rdt3.0", "rdt30.php"], ["TCP seq/ACK with loss", "tcp_segloss.php"], ["TCP RTT and timeout", "TCP_RTT.php"], ["TCP retransmissions", "tcp_retrans.php"], ["TCP cwnd evolution", "tcp_evolution.php"]],
  lab: "Wireshark labs: TCP, UDP", tutor: 3,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 5: Reliable data transfer and TCP reliable data transfer", pages: "pp. 200–246",
      notes: ["rdt", "tcp"],
      focus: "Don't memorise each rdt protocol on its own. Ask what problem each new mechanism solves: why checksums, ACKs, sequence numbers, timers, retransmission and pipelining become necessary as the channel gets worse.",
      takeaway: "Reliable transfer combines mechanisms that detect errors or loss with ways for sender and receiver to coordinate recovery: checksums, ACKs, sequence numbers, timers, retransmission and pipelining. TCP applies the same principles to deliver a reliable, ordered byte stream." },
    { title: "Lecture 6: TCP flow control, congestion control and transport evolution", pages: "pp. 246–282",
      notes: ["tcp-conn", "cc-principles", "tcp-cc", "quic"],
      focus: "Keep flow control and congestion control apart: flow control protects the receiver, congestion control protects the network. Think dynamically: what does the sender observe, what does it infer, and how should its rate change?",
      takeaway: "TCP has to respect both the receiver and the network. Flow control limits sending to what the receiver can take; congestion control keeps adapting the rate to network conditions. Together with reliable transfer and connection management, they give robust end-to-end communication." },
    { title: "Lecture 7: Transport-layer services, multiplexing and demultiplexing, and UDP", pages: "pp. 182–200",
      notes: ["services", "mux", "udp"],
      focus: "See how the transport layer turns host-to-host communication into process-to-process communication: how port numbers and socket information get each segment to the right application, and why an application might pick UDP's simple service.",
      takeaway: "The transport layer gives logical communication between processes. Multiplexing and demultiplexing let many processes share the network, and TCP and UDP offer different services to suit each application. UDP is simple, connectionless and best-effort, with minimal overhead." },
  ],
  drills: M3_DRILLS, mcq: M3_MCQ,
  ...study,
};
