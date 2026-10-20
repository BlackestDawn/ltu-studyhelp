import { M1_DRILLS, M1_MCQ } from "./m1.js";
import { M2_DRILLS, M2_MCQ } from "./m2.js";
import { M3_DRILLS, M3_MCQ } from "./m3.js";
import { M4_DRILLS, M4_MCQ } from "./m4.js";
import { widgetPipeline, widgetDNS, widgetCwnd, widgetIPv4 } from "../widgets.js";

export const GA="https://gaia.cs.umass.edu/kurose_ross/interactive/";
export const MODULES=[
{id:"m1",short:"Internet overview",title:"Module 1 · The Internet at a high level",
 focus:"Build the conceptual map: what the parts are and how they relate. The only numbers you really need are the four delays, throughput as a bottleneck, and why packet switching wins for bursty users.",
 obj:["Describe the Internet's main components","Explain the role of protocols","Distinguish network edge from network core","Contrast packet switching and circuit switching","Identify delay, loss and throughput as performance measures","Explain why security matters","Explain why protocols are organised into layers"],
 drills:M1_DRILLS,widgets:[widgetPipeline],widgetAfter:1,mcq:M1_MCQ,
 read:[["What is the Internet?","1–9"],["The network edge","9–21"],["The network core","22–34"],["Delay, loss and throughput","35–46"],["Protocol layers and their service models","47–54"],["Networks under attack","54–58"]],probs:["P6 (prop vs trans delay)","P8–P9 (packet vs circuit)","P10 (multi-hop delay)","P13 (queuing bursts)","P20–P22 (throughput)","P25 (bandwidth-delay)","P31 (message segmentation)"],
 inter:[["One-hop transmission delay","one-hop-delay.php"],["End-to-end delay","end-end-delay.php"],["Queuing delay","qdelay.php"],["End-to-end throughput","end-end-throughput-simple.php"],["Packet vs circuit switching","ps_versus_cs.php"],["Circuit switching","circuit_switching.php"],["Car-caravan analogy","caravan.php"],["Protocol layering","layers.php"]],
 lab:"Wireshark lab: Getting Started",tutor:1},
{id:"m2",short:"Application layer",title:"Module 2 · The application layer",
 focus:"For each protocol, ask: what problem does it solve, who talks to whom, over which transport, and is it push or pull? Then do the timing calculations (HTTP RTTs, P2P distribution) until they feel mechanical.",
 obj:["Explain principles and architectures of network apps","Describe how processes communicate via sockets and transport services","Explain how HTTP works between clients and servers","Describe email with SMTP and IMAP","Explain DNS's purpose and hierarchy","Distinguish client-server from P2P","Describe video streaming (DASH) and CDNs"],
 drills:M2_DRILLS,widgets:[widgetDNS],widgetAfter:3,mcq:M2_MCQ,
 read:[["Principles of network applications","82–95"],["The Web and HTTP","95–116"],["Electronic mail (SMTP, IMAP)","116–122"],["DNS","122–136"],["Peer-to-peer file distribution","136–143"],["Video streaming and CDNs","143–152"],["Socket programming","152–165"]],probs:["P1 (true/false on HTTP)","P4–P5 (read HTTP messages)","P7–P8 (DNS + HTTP timing)","P9 (Web caching)","P19–P21 (DNS, dig)","P22–P24 (P2P distribution)","P26 (BitTorrent free-riding)","P27 (DASH)"],
 inter:[["HTTP GET","http-get.php"],["HTTP response","http-response.php"],["DNS and HTTP delays","DNS_HTTP_delay.php"],["Browser caching","browser_caching.php"],["DNS basics","dns.php"],["DNS iterative vs recursive","dns_query.php"],["Email and SMTP","smtp.php"],["Client-server vs P2P","CS_vs_P2P_download.php"]],
 lab:"Wireshark labs: HTTP, DNS",tutor:2},
{id:"m3",short:"Transport layer",title:"Module 3 · The transport layer",
 focus:"These mechanisms build on each other: checksum → ACK/NAK → sequence numbers → timers → pipelining (GBN/SR) → TCP. For each, ask what failure it fixes. Then trace cwnd by hand until you can do it without the rules in front of you.",
 obj:["Explain the transport layer's role and services","Explain multiplexing and demultiplexing","Describe UDP","Explain the mechanisms for reliable data transfer","Describe how TCP provides reliable, connection-oriented transport","Explain connection management and flow control","Explain why congestion occurs and congestion-control principles","Explain how TCP adapts its sending rate","Analyse basic TCP performance and throughput"],
 drills:M3_DRILLS,widgets:[widgetCwnd],widgetAfter:5,mcq:M3_MCQ,
 read:[["Transport-layer services","182–187"],["Multiplexing and demultiplexing","187–194"],["Connectionless transport: UDP","194–200"],["Principles of reliable data transfer","200–226"],["Connection-oriented transport: TCP","227–255"],["Principles of congestion control","255–263"],["TCP congestion control","263–279"],["Evolution of transport-layer functionality","279–282"]],probs:["P3–P4 (checksum)","P9 (rdt3.0 trace)","P15 (pipelining utilisation)","P22–P23 (GBN/SR windows)","P26–P27 (seq/ACK numbers)","P31–P32 (RTT estimation)","P40 (read a cwnd graph)","P44–P45 (TCP throughput)"],
 inter:[["Internet checksum","internet_checksum.php"],["UDP mux/demux","UDP_Mux_Demux.php"],["TCP mux/demux","TCP_Mux_Demux.php"],["rdt2.2","rdt22.php"],["rdt3.0","rdt30.php"],["TCP seq/ACK with loss","tcp_segloss.php"],["TCP RTT and timeout","TCP_RTT.php"],["TCP retransmissions","tcp_retrans.php"],["TCP cwnd evolution","tcp_evolution.php"]],
 lab:"Wireshark labs: TCP, UDP",tutor:3},
{id:"m4",short:"Network layer",title:"Module 4 · The network layer: data plane",
 focus:"Follow one packet into a router: header fields → forwarding-table lookup (longest prefix) → switching fabric → output queue and scheduler → maybe NAT, fragmentation or a match+action rule. Every lab below is one stop on that journey.",
 obj:["Explain the network layer's role in delivering packets","Distinguish data plane from control plane","Explain forwarding vs routing","Describe a router's components and packet path","Explain buffering, queueing and scheduling","Interpret IPv4 datagram fields","Apply IPv4 addressing and subnetting","Explain NAT","Describe IPv6's motivation and features","Explain generalised match+action forwarding","Describe SDN/OpenFlow and middleboxes"],
 drills:M4_DRILLS,widgets:[widgetIPv4],widgetAfter:3,mcq:M4_MCQ,
 read:[["Overview of the network layer","304–311"],["What's inside a router?","311–330"],["The Internet Protocol (IPv4, addressing, NAT, IPv6)","330–353"],["Generalized forwarding and SDN","353–360"],["Middleboxes","360–364"]],probs:["P5–P6 (scheduling, WFQ)","P8–P10 (forwarding tables, LPM)","P11, P14–P15 (subnetting)","P17 (fragmentation)","P18–P19 (NAT)","P21–P23 (OpenFlow flow tables)"],
 inter:[["Longest prefix matching","longestprefix.php"],["Subnet addressing","subnet_addressing.php"],["Packet scheduling","scheduling.php"],["NAT","nat.php"],["IPv6 tunneling","ip_tunneling.php"],["OpenFlow flow tables","openflow.php"]],
 lab:"Wireshark lab: IP",tutor:4}
];
