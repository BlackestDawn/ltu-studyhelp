// Reading-first material for module 3: summary, study notes and key terms.
import { widgetCwnd } from "../../widgets.js";

export default {
summary: {
  big: `<p>The network layer delivers datagrams between <b>hosts</b>, with no guarantees. The transport layer turns that into communication between <b>processes</b>: it uses port numbers to hand each arriving segment to the right socket (<b>demultiplexing</b>), and it can add services that IP lacks.</p>
  <p><b>UDP</b> adds almost nothing: ports and a checksum. <b>TCP</b> adds a lot. The chapter builds reliable transfer one problem at a time: <b>checksums</b> detect corrupted bits, <b>ACKs</b> and <b>retransmission</b> fix them, <b>sequence numbers</b> catch duplicates, <b>timers</b> recover lost packets, and <b>pipelining</b> (Go-Back-N, Selective Repeat) keeps the link busy. TCP combines these with connection setup, flow control and RTT-based timeouts.</p>
  <p>Finally, <b>congestion control</b> stops senders from overloading the network. TCP probes for bandwidth with <b>slow start</b> and <b>additive increase</b>, and backs off with <b>multiplicative decrease</b> when it sees loss. QUIC shows how these ideas are now being reimplemented over UDP in the application layer.</p>`,
  takeaways: [
    "Network layer: host to host. Transport layer: <b>process to process</b>, using port numbers.",
    "A UDP socket is identified by (dest IP, dest port). A TCP socket is identified by the <b>4-tuple</b> (src IP, src port, dest IP, dest port).",
    "UDP: 8-byte header, no connection, no reliability, no congestion control. Chosen for low delay and fine control.",
    "Reliable transfer, step by step: checksum → ACK/NAK → sequence numbers → timeout and retransmit → pipelining.",
    "Stop-and-wait wastes a fast, long link. Pipelining with a window of N packets multiplies utilisation by up to N.",
    "<b>Go-Back-N</b>: cumulative ACKs, one timer, resend everything from the lost packet on. <b>Selective Repeat</b>: individual ACKs and timers, resend only what was lost.",
    "TCP numbers <b>bytes</b>. The ACK number is the next byte expected (cumulative). Three duplicate ACKs trigger <b>fast retransmit</b>.",
    "TimeoutInterval = EstimatedRTT + 4·DevRTT, and it doubles after each timeout.",
    "<b>Flow control</b> (rwnd) protects the receiver's buffer. <b>Congestion control</b> (cwnd) protects the network. A sender keeps unACKed data ≤ min(cwnd, rwnd).",
    "TCP congestion control: slow start doubles cwnd per RTT up to ssthresh, then +1 MSS per RTT. On 3 duplicate ACKs (Reno) cwnd halves; on timeout cwnd drops to 1.",
  ],
  formulas: [
    ["Checksum = ~(16-bit one's-complement sum)", "Add the 16-bit words, wrapping any carry back into the lowest bit, then flip all bits.", "UDP/TCP checksum questions. Receiver's sum including the checksum is all 1s if no error."],
    ["U = (L/R) / (RTT + L/R)", "Sender utilisation for stop-and-wait.", "rdt3.0 performance."],
    ["U = N·(L/R) / (RTT + L/R)", "Utilisation with a window of N packets (at most 1).", "Pipelined protocols; the smallest N for full utilisation is ⌈(RTT + L/R)/(L/R)⌉."],
    ["Window ≤ 2^k − 1 (GBN), ≤ 2^(k−1) (SR)", "Largest safe window for k-bit sequence numbers. SR needs at most half the sequence space.", "Window-size / sequence-number questions."],
    ["EstimatedRTT = 0.875·EstRTT + 0.125·SampleRTT", "Exponentially weighted moving average, α = 0.125.", "RTT estimation."],
    ["DevRTT = 0.75·DevRTT + 0.25·|SampleRTT − EstRTT|", "Moving average of how much RTT varies, β = 0.25.", "RTT estimation (use the new EstimatedRTT)."],
    ["TimeoutInterval = EstimatedRTT + 4·DevRTT", "Retransmission timeout. Starts at 1 s and doubles after each timeout.", "Timeout questions."],
    ["rwnd = RcvBuffer − (LastByteRcvd − LastByteRead)", "Free space in the receiver's buffer, advertised to the sender.", "Flow control."],
    ["LastByteSent − LastByteAcked ≤ min(cwnd, rwnd)", "Limit on unacknowledged data in flight.", "Combining flow and congestion control."],
    ["rate ≈ cwnd / RTT", "TCP sends roughly one window per round trip.", "Converting cwnd to throughput."],
    ["avg throughput ≈ 0.75 · W / RTT", "Reno's window saw-tooths between W/2 and W.", "Long-lived TCP throughput."],
    ["throughput ≈ 1.22 · MSS / (RTT · √L)", "Throughput as a function of loss probability L (end-of-chapter problems).", "High-speed TCP questions."],
  ],
  traps: [
    "Counting segments instead of bytes: TCP sequence and ACK numbers count bytes.",
    "Answering with the last byte received: the ACK number is the <b>next</b> byte expected.",
    "Forgetting that GBN resends <b>all</b> outstanding packets, while SR resends only the lost one.",
    "Mixing up flow control (receiver's buffer, rwnd) and congestion control (network, cwnd).",
    "Treating timeout and 3 duplicate ACKs the same in Reno. Timeout: cwnd = 1 and slow start. 3 duplicate ACKs: cwnd about halves.",
    "Thinking slow start is slow: it doubles cwnd every RTT.",
    "Using the old EstimatedRTT in the DevRTT formula when the course follows the book's order (update EstimatedRTT first).",
  ],
},
notes: [
{id: "services", title: "Transport-layer services", ref: "§3.1 · pp. 182–187",
 gist: "Transport gives processes a logical connection to each other, running only in the end systems.",
 body: `<p>The transport layer provides <b>logical communication between application processes</b> on different hosts. Logical means the processes act as if they were directly connected, although the data crosses many routers. Transport protocols run only in end systems; routers never look at transport headers.</p>
 <div class="callout"><b>The book's household analogy.</b> Two houses, each with a dozen kids, write letters to each other. In each house, one kid (Ann and Bill) collects and distributes the letters, and the postal service carries them between the houses. Houses are <b>hosts</b>, kids are <b>processes</b>, letters are <b>messages</b>, the postal service is the <b>network layer</b>, and Ann and Bill are the <b>transport layer</b>. They can only offer what the postal service allows: if the post takes three days, so do they. But they can add things the post doesn't, such as resending lost letters.</div>
 <p>The Internet's network layer, IP, gives <b>best-effort</b> delivery: no guarantees of delivery, order or integrity. Building on it, <b>UDP</b> offers just process-to-process delivery and error checking. <b>TCP</b> adds reliable, in-order delivery, connection setup, flow control and congestion control. Neither offers delay or bandwidth guarantees.</p>`},
{id: "mux", title: "Multiplexing and demultiplexing", ref: "§3.2 · pp. 187–194",
 gist: "Port numbers let one host run many network processes at once.",
 body: `<p><b>Multiplexing</b> at the sender: collect data from many sockets, add headers, and pass segments to the network layer. <b>Demultiplexing</b> at the receiver: deliver each arriving segment to the right socket. Every segment carries a 16-bit <b>source port</b> and <b>destination port</b>. Ports 0–1023 are <b>well-known</b> ports reserved for standard services such as HTTP (80) and DNS (53).</p>
 <p><b>UDP demultiplexing</b> uses only (destination IP, destination port). Two segments from different senders to the same port reach the <b>same socket</b>; the source port is only used as a return address.</p>
 <p><b>TCP demultiplexing</b> uses the full <b>4-tuple</b> (source IP, source port, destination IP, destination port). A web server on port 80 therefore has a separate socket for each connected client. Two connections from the same browser to the same server are told apart by their different source ports.</p>
 <div class="callout ex"><b>Example.</b> Hosts A and C both open connections to server B on port 80, and both happen to choose source port 26145. B still separates them, because the source IP addresses differ, so the 4-tuples differ.</div>`},
{id: "udp", title: "Connectionless transport: UDP", ref: "§3.3 · pp. 194–200",
 gist: "UDP adds ports and a checksum to IP, and nothing else.",
 body: `<p>Why would an application choose UDP?</p>
 <ul>
 <li><b>Finer control over what is sent and when</b>: no congestion control slows it down, and no retransmissions add delay.</li>
 <li><b>No connection setup</b>, so no handshake delay. This is why DNS uses UDP.</li>
 <li><b>No connection state</b> on the server, so it can handle more clients.</li>
 <li><b>Small header</b>: 8 bytes, against 20 for TCP.</li>
 </ul>
 <p>Users include DNS, network management (SNMP), real-time media, and QUIC, which builds its own reliability on top. Applications that need reliability over UDP must add it themselves.</p>
 <p><b>Segment structure:</b> four 16-bit fields (source port, destination port, length in bytes including header, checksum), then the data.</p>
 <p><b>Checksum.</b> The sender adds the segment's 16-bit words using one's-complement addition: any carry out of the top bit is wrapped around and added to the lowest bit. It then flips every bit of the sum to get the checksum. The receiver adds all the words <i>and</i> the checksum; if no bits changed, the result is all 1s. Some errors cancel out and go unnoticed, and errors can be detected but not corrected. Error checking is done here even though many links check too: not every link does, and errors can happen inside a router's memory. This is the <b>end-to-end principle</b>: functions are best placed at the ends.</p>`},
{id: "rdt", title: "Principles of reliable data transfer", ref: "§3.4 · pp. 200–226",
 gist: "Each mechanism exists to fix one specific problem the channel can cause.",
 body: `<div class="tblwrap"><table><thead><tr><th>Protocol</th><th>Channel problem</th><th>New mechanism</th></tr></thead><tbody>
 <tr><td>rdt1.0</td><td>None (perfect channel)</td><td>Just send and receive</td></tr>
 <tr><td>rdt2.0</td><td>Bit errors</td><td>Checksum, ACK/NAK feedback, retransmit (stop-and-wait)</td></tr>
 <tr><td>rdt2.1</td><td>ACKs/NAKs can be corrupted too</td><td>1-bit sequence number, so the receiver can spot duplicate data</td></tr>
 <tr><td>rdt2.2</td><td>Same, without NAKs</td><td>Duplicate ACK of the last good packet acts as a NAK</td></tr>
 <tr><td>rdt3.0</td><td>Packets (or ACKs) can be lost</td><td>Countdown timer; retransmit on timeout</td></tr>
 </tbody></table></div>
 <p>rdt3.0 is also called the <b>alternating-bit protocol</b>. The sender can't tell whether a packet was lost, its ACK was lost, or it's just slow, so it waits a reasonable time and resends. Sequence numbers make any resulting duplicates harmless.</p>
 <div class="callout ex"><b>Why stop-and-wait is slow.</b> A 1 Gbps link with a 30 ms RTT and 1,000-byte packets: L/R = 8 µs, so the sender is busy only 0.008 / 30.008 ≈ 0.027% of the time. Effective throughput is about 267 kbps on a 1 Gbps link.</div>
 <p><b>Pipelining</b> lets the sender have many packets “in flight”. That needs a larger range of sequence numbers and buffers at the sender (and maybe the receiver). There are two approaches:</p>
 <p><b>Go-Back-N (GBN).</b> The sender may have up to N unACKed packets (a <b>sliding window</b>). The receiver accepts only in-order packets and sends <b>cumulative ACKs</b>; anything out of order is discarded and the last in-order packet is ACKed again. A single timer runs for the oldest unACKed packet; on timeout the sender resends <b>all</b> unACKed packets. Simple, but one loss can cause many retransmissions.</p>
 <p><b>Selective Repeat (SR).</b> The receiver ACKs each correctly received packet individually and <b>buffers</b> out-of-order packets until the gap is filled. Each packet has its own timer, so only lost packets are resent. Sender and receiver windows may not line up, so the window must be <b>at most half</b> the sequence-number space; otherwise the receiver can't tell a new packet from a retransmitted old one.</p>`},
{id: "tcp", title: "Connection-oriented transport: TCP", ref: "§3.5 · pp. 227–255",
 gist: "Reliable, in-order byte stream between two processes, with flow control and connection setup.",
 body: `<p>TCP is <b>connection-oriented</b> (handshake first), <b>full-duplex</b> (data both ways), and <b>point-to-point</b> (exactly one sender and one receiver). Data from the application goes into a send buffer and is cut into segments of at most one <b>MSS</b> (maximum segment size, typically 1,460 bytes so the segment fits a 1,500-byte Ethernet frame).</p>
 <p><b>Segment structure</b> (usually 20 bytes of header): source and destination ports, 32-bit <b>sequence number</b>, 32-bit <b>acknowledgment number</b>, header length, flags (<b>ACK</b>, <b>SYN</b>, <b>FIN</b>, <b>RST</b>, plus CWR/ECE for congestion notification and PSH/URG), 16-bit <b>receive window</b>, checksum, urgent pointer, and options.</p>
 <p><b>Sequence and ACK numbers.</b> TCP numbers the <b>bytes</b> in the stream. A segment's sequence number is the number of its first byte. The ACK number is the <b>next byte the receiver expects</b>, and ACKs are cumulative. ACKs can ride on data going the other way (<b>piggybacking</b>). How to handle out-of-order segments is left to the implementation; in practice they are buffered.</p>
 <p><b>RTT and timeout.</b> TCP measures SampleRTT for one segment at a time (never for retransmitted ones) and smooths it: EstimatedRTT = 0.875·EstimatedRTT + 0.125·SampleRTT, and DevRTT = 0.75·DevRTT + 0.25·|SampleRTT − EstimatedRTT|. Then <b>TimeoutInterval = EstimatedRTT + 4·DevRTT</b>, starting at 1 second.</p>
 <p><b>Reliable transfer.</b> TCP uses a single retransmission timer. On timeout it resends the oldest unACKed segment and <b>doubles</b> the timeout. On <b>three duplicate ACKs</b> it resends the missing segment immediately, before the timer runs out (<b>fast retransmit</b>). It is a hybrid of GBN (cumulative ACKs) and SR (it resends only one segment and buffers out-of-order data).</p>
 <p><b>Flow control.</b> The receiver advertises <b>rwnd</b>, its free buffer space, in every segment, and the sender keeps unACKed data below it. If rwnd reaches 0, the sender keeps sending 1-byte segments so it learns when space frees up.</p>
 <p><b>Connection management.</b> Opening is a <b>three-way handshake</b>: the client sends <b>SYN</b> with its initial sequence number; the server allocates buffers and replies <b>SYNACK</b> with its own initial sequence number and ACK = client_isn + 1; the client replies with an <b>ACK</b>, which may already carry data. Closing: each side sends <b>FIN</b> and gets an ACK. The client then waits in <b>TIME_WAIT</b> (typically 30 s to 2 min) in case its final ACK was lost. A segment to a port with no socket gets an <b>RST</b> reply. The <b>SYN flood</b> attack sends many SYNs without completing the handshake; <b>SYN cookies</b> defend against it by not allocating anything until the final ACK arrives.</p>`},
{id: "cc-principles", title: "Principles of congestion control", ref: "§3.6 · pp. 255–263",
 gist: "Congestion wastes capacity in several ways, so senders must slow down when the network is overloaded.",
 body: `<p>The book uses three scenarios to show the <b>costs of congestion</b>:</p>
 <ol>
 <li><b>Two senders, one router, infinite buffer.</b> Throughput per connection can't exceed R/2, and as the sending rate approaches R/2, <b>queuing delay grows without bound</b>.</li>
 <li><b>Finite buffer, with retransmissions.</b> The sender must retransmit dropped packets, and premature timeouts make it resend packets that were only delayed. Link capacity is spent on <b>duplicate copies</b>.</li>
 <li><b>Several hops.</b> When a packet is dropped at a later router, the capacity every earlier router used to forward it is <b>wasted</b>. Under heavy load, throughput can collapse towards zero.</li>
 </ol>
 <p><b>Two approaches:</b></p>
 <ul>
 <li><b>End-to-end</b>: the network gives no explicit help; senders infer congestion from loss and delay. This is classic TCP's approach.</li>
 <li><b>Network-assisted</b>: routers signal congestion directly, for example by setting bits in passing packets (as in ECN) or sending a choke packet.</li>
 </ul>`},
{id: "tcp-cc", title: "TCP congestion control", ref: "§3.7 · pp. 263–279",
 gist: "TCP probes for bandwidth by growing cwnd and backs off when it sees loss: additive increase, multiplicative decrease.",
 body: `<p>The sender keeps a <b>congestion window, cwnd</b>, and limits unACKed data to min(cwnd, rwnd). Its rate is about <b>cwnd / RTT</b>. TCP is <b>self-clocking</b>: arriving ACKs trigger cwnd growth, so it grows faster when RTTs are short. A lost segment (timeout or 3 duplicate ACKs) is taken as a sign of congestion.</p>
 <ul>
 <li><b>Slow start.</b> cwnd starts at 1 MSS and grows by 1 MSS per ACK, which <b>doubles</b> it every RTT. Slow start ends when cwnd reaches <b>ssthresh</b> (switch to congestion avoidance), when 3 duplicate ACKs arrive (fast retransmit, then fast recovery), or on a timeout (ssthresh = cwnd/2, cwnd = 1, start slow start again).</li>
 <li><b>Congestion avoidance.</b> cwnd grows by about <b>1 MSS per RTT</b> (MSS·MSS/cwnd per ACK). On timeout, behave as in slow start. On 3 duplicate ACKs, set ssthresh = cwnd/2 and cwnd = ssthresh + 3 MSS, and enter fast recovery.</li>
 <li><b>Fast recovery.</b> cwnd grows by 1 MSS for each further duplicate ACK. When a new ACK arrives, set cwnd = ssthresh and return to congestion avoidance.</li>
 </ul>
 <p><b>TCP Tahoe</b> drops cwnd to 1 on <i>any</i> loss. <b>TCP Reno</b> adds fast recovery, so it only halves on 3 duplicate ACKs. Ignoring slow start, Reno's cwnd forms a saw-tooth: <b>additive increase, multiplicative decrease (AIMD)</b>. Try both in the model below.</p>
 <p><b>TCP CUBIC</b>, the default in Linux, changes only congestion avoidance. It remembers W<sub>max</sub>, the window when loss last happened, and grows quickly when far below it and cautiously when close to it.</p>
 <p><b>Network help and delay.</b> With <b>ECN</b>, a congested router sets two bits in the IP header; the receiver echoes this to the sender with the ECE flag, and the sender halves cwnd as if a packet were lost, then sets CWR. <b>Delay-based</b> algorithms such as TCP Vegas and Google's <b>BBR</b> watch the RTT and slow down before queues fill up.</p>
 <p><b>Fairness.</b> K connections sharing a bottleneck of rate R should each get about R/K. Under idealised conditions AIMD converges to this fair share. In practice, connections with shorter RTTs grab more, UDP traffic ignores TCP's fairness, and an application that opens many parallel TCP connections gets a bigger share.</p>`,
 widget: widgetCwnd},
{id: "quic", title: "Evolution of the transport layer: QUIC", ref: "§3.8 · pp. 279–282",
 gist: "QUIC rebuilds TCP-like services, plus security and streams, in the application layer on top of UDP.",
 body: `<p>Changing TCP is slow because it lives in the operating system. <b>QUIC</b> sidesteps this: it is an <b>application-layer protocol over UDP</b>, so it can ship inside a browser or app. It is used by HTTP/3.</p>
 <ul>
 <li><b>Connection-oriented and secure</b>: connection setup is combined with TLS-style encryption and authentication in one handshake, which saves round trips.</li>
 <li><b>Streams</b>: several application-level streams share one QUIC connection, and each is delivered reliably and in order on its own. A lost packet only holds up its own stream, so there is no <b>head-of-line blocking</b> between streams.</li>
 <li><b>Reliable, TCP-friendly congestion control</b>, closely based on TCP NewReno.</li>
 </ul>`},
],
glossary: [
  ["Logical communication", "Processes act as if directly connected, although data crosses many routers."],
  ["Multiplexing / demultiplexing", "Gathering data from many sockets into segments / delivering arriving segments to the right socket."],
  ["4-tuple", "(source IP, source port, destination IP, destination port): what identifies a TCP socket."],
  ["Well-known port", "Port numbers 0–1023, reserved for standard services."],
  ["Best-effort service", "IP's model: it tries to deliver, but makes no guarantees."],
  ["Checksum", "One's complement of the one's-complement sum of 16-bit words, used to detect bit errors."],
  ["End-to-end principle", "Functions such as error checking are best placed in the end systems, not inside the network."],
  ["ACK / NAK", "Positive and negative acknowledgment: “got it” / “please resend”."],
  ["Stop-and-wait", "Send one packet, then wait for its ACK before sending the next."],
  ["Alternating-bit protocol", "rdt3.0: stop-and-wait with a 1-bit sequence number and a timer."],
  ["Pipelining", "Sending several packets before receiving ACKs for them."],
  ["Sliding window", "The range of sequence numbers a sender may have outstanding, which moves forward as ACKs arrive."],
  ["Go-Back-N", "Pipelined protocol with cumulative ACKs; on timeout, resend every unACKed packet."],
  ["Selective Repeat", "Pipelined protocol with individual ACKs and timers; resend only lost packets."],
  ["Cumulative ACK", "An ACK that confirms everything up to a point."],
  ["MSS", "Maximum segment size: the most application data in one TCP segment, typically 1,460 bytes."],
  ["Sequence number (TCP)", "The byte-stream number of the first byte in a segment."],
  ["Acknowledgment number (TCP)", "The number of the next byte the receiver expects."],
  ["Piggybacking", "Carrying an ACK in a segment that also carries data the other way."],
  ["SampleRTT / EstimatedRTT / DevRTT", "One RTT measurement / its smoothed average / its smoothed variation."],
  ["Fast retransmit", "Resending a segment after three duplicate ACKs, before its timer runs out."],
  ["Flow control", "Stopping the sender from overflowing the receiver's buffer, using rwnd."],
  ["rwnd", "Receive window: free buffer space the receiver advertises."],
  ["Three-way handshake", "SYN, SYNACK, ACK: how TCP opens a connection."],
  ["TIME_WAIT", "State the closing side waits in, so it can resend the final ACK if needed."],
  ["SYN flood / SYN cookies", "A DoS attack of half-open connections / the defence that delays allocating state."],
  ["Congestion control", "Stopping senders from overloading the network, using cwnd."],
  ["cwnd", "Congestion window: the sender's limit on unACKed data, set by congestion control."],
  ["ssthresh", "Slow-start threshold: where slow start hands over to congestion avoidance."],
  ["Slow start", "cwnd starts at 1 MSS and doubles every RTT."],
  ["Congestion avoidance", "cwnd grows by about 1 MSS per RTT."],
  ["Fast recovery", "Reno's phase after 3 duplicate ACKs, which avoids dropping back to slow start."],
  ["AIMD", "Additive increase, multiplicative decrease: TCP's saw-tooth behaviour."],
  ["TCP CUBIC", "A TCP variant that grows cwnd as a cubic function of time since the last loss; default in Linux."],
  ["ECN", "Explicit congestion notification: routers mark packets instead of dropping them."],
  ["BBR", "Google's delay-based congestion control algorithm."],
  ["QUIC", "A reliable, secure, multi-stream transport built in the application layer over UDP; used by HTTP/3."],
],
};
