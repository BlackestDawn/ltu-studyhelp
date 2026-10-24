// Reading-first material for module 6: summary, study notes and key terms.
import { widgetAloha, widgetSwitch } from "../../widgets.js";

export default {
summary: {
  big: `<p>The network layer decides the path of a datagram across many networks; the <b>link layer</b> carries it across <b>each single link</b> on that path, from one node (host, router, switch or access point) to the next. On every link the sending node wraps the datagram in a <b>frame</b>, and different links on the same path may use different link-layer protocols, such as Wi-Fi and then Ethernet.</p>
  <p>Some links are point-to-point, but many are <b>shared</b> (broadcast) media, where frames from different nodes can <b>collide</b>. <b>Multiple-access protocols</b> decide who may send when: by <b>partitioning</b> the channel (TDMA, FDMA), by <b>random access</b> with recovery from collisions (ALOHA, CSMA/CD), or by <b>taking turns</b> (polling, token passing).</p>
  <p>Inside a LAN, frames are delivered using <b>MAC addresses</b>, which belong to adapters. <b>ARP</b> finds the MAC address that goes with an IP address on the same subnet. <b>Ethernet</b> defines the frame format, and today's Ethernet LANs are built from <b>switches</b> that learn where each host is by themselves, then forward, flood or filter each frame. <b>VLANs</b> let one switched network act as several separate LANs.</p>`,
  takeaways: [
    "The link layer moves a datagram <b>one hop</b>, from a node to an adjacent node, inside a <b>frame</b>. Services can include framing, link access, reliable delivery (mainly on error-prone wireless links) and error detection.",
    "It is implemented mostly in the <b>network adapter (NIC)</b> hardware, plus some software: the place where software meets hardware.",
    "<b>Point-to-point</b> links have one sender; <b>broadcast</b> (shared) links need a <b>multiple-access protocol</b>, because simultaneous transmissions collide.",
    "<b>Channel partitioning</b> (TDMA, FDMA) is collision-free and fair under heavy load, but a lone node still only gets R/N.",
    "<b>Random access</b>: slotted ALOHA's best efficiency is 1/e ≈ 0.37, pure ALOHA's 1/(2e) ≈ 0.18. <b>CSMA</b> listens first; <b>CSMA/CD</b> also aborts on collision and retries after <b>binary exponential backoff</b> (K × 512 bit times).",
    "<b>Taking turns</b> (polling, token passing) avoids collisions and empty slots, at the cost of polling delay or a token to manage.",
    "A <b>MAC address</b> is 48 bits, flat and permanent, like a personal ID number; an <b>IP address</b> is hierarchical, like a postal address. Both are needed.",
    "<b>ARP</b> resolves an IP address to a MAC address on the <b>same subnet</b>: query broadcast, reply unicast, entries expire. For another subnet, the frame goes to the router's MAC while the IP destination stays the far host.",
    "<b>Ethernet</b> frames: preamble, destination and source MAC, type, 46–1,500 bytes of data, CRC. The service is connectionless and unreliable.",
    "A <b>switch</b> learns from source addresses, then <b>floods</b> unknown destinations, <b>filters</b> frames for the incoming segment and <b>forwards</b> the rest. It is plug-and-play and collision-free.",
    "<b>VLANs</b> split one switched network into isolated broadcast domains; <b>trunks</b> carry 802.1Q-tagged frames between switches, and a router connects the VLANs.",
  ],
  formulas: [
    ["rate per node = R / N", "TDMA or FDMA: each of the N nodes gets an equal, fixed share of the channel, whether or not the others are sending.", "Channel-partitioning questions.",
      [["R", "channel rate, in bits/s"], ["N", "number of nodes sharing the channel"]]],
    ["E<sub>slotted</sub> = N · p · (1 − p)<sup>N−1</sup>", "Slotted ALOHA efficiency: the probability that exactly one of N nodes transmits in a slot.", "Slotted ALOHA questions.",
      [["N", "number of active nodes, each always with a frame to send"], ["p", "probability that a node transmits in a given slot"], ["(1 − p)<sup>N−1</sup>", "probability that none of the other N − 1 nodes transmits"]]],
    ["p* = 1/N  →  E<sub>max</sub> = (1 − 1/N)<sup>N−1</sup> → 1/e ≈ 0.37", "The best transmission probability and the resulting maximum efficiency, which tends to 1/e as N grows.", "Maximum efficiency of slotted ALOHA.",
      [["p*", "the value of p that maximises efficiency"], ["e", "Euler's number, about 2.718"]]],
    ["E<sub>pure</sub> = N · p · (1 − p)<sup>2(N−1)</sup>  → max 1/(2e) ≈ 0.18", "Pure ALOHA: a frame is safe only if no one else starts in the frame time before it or during it, so the vulnerable time doubles.", "Pure ALOHA questions.",
      [["N", "number of active nodes"], ["p", "probability of transmitting in a frame time"], ["2(N − 1)", "two frame times in which the other N − 1 nodes must stay silent"]]],
    ["K ∈ {0, 1, …, 2<sup>m</sup> − 1},  m = min(n, 10)", "CSMA/CD binary exponential backoff: after the n-th collision in a row, pick K at random from this set.", "Backoff questions.",
      [["n", "number of collisions so far for this frame"], ["m", "n, capped at 10"], ["K", "the random backoff multiplier; each value equally likely"]]],
    ["wait = K × 512 bit times = K × 512 / R", "How long an Ethernet adapter waits before sensing the channel again.", "Turning K into a time.",
      [["K", "chosen backoff value"], ["512 bit times", "time to send 512 bits"], ["R", "link rate (512/R gives seconds; e.g. 5.12 µs at 100 Mbps)"]]],
    ["efficiency = 1 / (1 + 5 · d<sub>prop</sub> / d<sub>trans</sub>)", "Approximate CSMA/CD efficiency with many active nodes.", "CSMA/CD efficiency questions.",
      [["d<sub>prop</sub>", "largest propagation delay between any two adapters"], ["d<sub>trans</sub>", "time to send a maximum-size frame, L/R"]]],
    ["frame = 8 + 6 + 6 + 2 + (46…1,500) + 4 bytes", "Ethernet frame: preamble, destination MAC, source MAC, type, data, CRC.", "Frame-size and overhead questions.",
      [["8", "preamble (7 × 10101010, then 10101011)"], ["6 + 6", "destination and source MAC addresses"], ["2", "type field (e.g. 0x0800 IPv4, 0x0806 ARP)"], ["46…1,500", "data, padded up to 46; 1,500 is the MTU"], ["4", "CRC for error detection"]]],
    ["2<sup>48</sup> MAC addresses; IEEE blocks of 2<sup>24</sup>", "The size of the MAC address space, and the block a manufacturer buys.", "Addressing questions.",
      [["48", "bits in a MAC address (6 bytes)"], ["24", "bits left for the manufacturer to assign within its block"]]],
  ],
  traps: [
    "Thinking the link layer carries data end to end: it only crosses one link; a new frame is built for every hop.",
    "Thinking TDMA gives a lone sender the whole channel: it is still limited to R/N.",
    "Believing carrier sensing prevents all collisions: propagation delay means a node may not yet hear a transmission that has started.",
    "Forgetting the cap at n = 10 in binary exponential backoff, or using K × 512 bytes instead of bit times.",
    "Using B's MAC address in the frame A sends to another subnet: it is the router interface's MAC; the destination IP stays B's.",
    "ARPing for the far host's IP address: ARP only works within a subnet, so A asks for its router's interface.",
    "Mixing up the broadcast addresses: FF-FF-FF-FF-FF-FF is the MAC broadcast; 255.255.255.255 is the IP broadcast.",
    "Saying Ethernet acknowledges frames: it is unreliable and simply discards frames with a bad CRC.",
    "Thinking a switch learns from destination addresses: it learns only from source addresses.",
    "Confusing filtering (discard, the destination is on the incoming segment) with flooding (unknown destination).",
    "Thinking VLANs need separate switches, or that VLANs can talk to each other directly: a router is needed between them.",
  ],
},
notes: [
{id: "intro", title: "The link layer and its services", ref: "§6.1 · pp. 450–454",
 gist: "The link layer moves a datagram from one node to the next over a single link, wrapped in a frame; the network adapter does most of the work.",
 body: `<p>Any device that runs a link-layer protocol is a <b>node</b>: hosts, routers, switches and Wi-Fi access points. The channels that connect adjacent nodes are <b>links</b>. A datagram from a laptop to a server may cross six links: Wi-Fi to the access point, Ethernet to a switch, then to a router, between two routers, to another switch, and finally to the server. On each link, the sending node <b>encapsulates</b> the datagram in a link-layer <b>frame</b>.</p>
 <div class="callout"><b>Travel analogy.</b> A trip from Princeton to Lausanne uses a limousine to the airport, a plane to Geneva and a train to Lausanne. Each leg is run by a different company with a different mode of transport, but each moves the traveller between two adjacent places. The traveller is the <b>datagram</b>, each leg a <b>link</b>, each mode of transport a <b>link-layer protocol</b>, and the travel agent who plans the trip the <b>routing protocol</b>.</div>
 <p><b>Services a link-layer protocol can offer</b> (they vary from protocol to protocol):</p>
 <ul>
 <li><b>Framing</b>: put the datagram in a frame's data field and add header fields.</li>
 <li><b>Link access</b>: a <b>medium access control (MAC)</b> protocol sets the rules for putting frames on the link. On a point-to-point link it is trivial; on a shared link it coordinates many nodes (the multiple-access problem).</li>
 <li><b>Reliable delivery</b>: ACKs and retransmissions on the link, useful on error-prone links such as wireless to fix errors locally. Wired links (fibre, coax, most twisted pair) rarely need it.</li>
 <li><b>Error detection and correction</b>: error-detection bits added by the sender and checked by the receiver, in hardware, so a damaged frame isn't forwarded.</li>
 </ul>
 <p><b>Where is it implemented?</b> Mostly on a <b>network adapter</b>, or network interface controller (NIC), either a chip on the motherboard or a separate card. On the sending side it takes the datagram from host memory, builds the frame and transmits it using the link-access protocol; on the receiving side it receives the frame, checks it and extracts the datagram. Part of the link layer runs as software on the host's CPU: assembling addressing information, activating the adapter, and handling interrupts. The link layer is where <b>software meets hardware</b>.</p>`},
{id: "access", title: "Multiple access and channel partitioning", ref: "§6.3–6.3.1 · pp. 461–465",
 gist: "On a shared link, simultaneous transmissions collide; multiple-access protocols decide who may send, and partitioning simply divides the channel up.",
 body: `<p>There are two kinds of link:</p>
 <ul>
 <li><b>Point-to-point</b>: one sender at one end, one receiver at the other (for example a link between two routers, or a host and a switch).</li>
 <li><b>Broadcast</b>: many nodes share one medium, and every node receives every frame (for example classic shared Ethernet, Wi-Fi, a cable network's upstream). If two or more nodes send at the same time, the signals <b>collide</b> and none of the frames gets through.</li>
 </ul>
 <p>A <b>multiple-access protocol</b> coordinates the nodes, using the same channel for its own coordination. Ideally, on a channel of rate R:</p>
 <ol>
 <li>When only one node has data, it gets the full rate <b>R</b>.</li>
 <li>When M nodes have data, each gets <b>R/M</b> on average.</li>
 <li>It is <b>decentralised</b>: no master node that can fail.</li>
 <li>It is <b>simple</b> and cheap to implement.</li>
 </ol>
 <p>There are three classes: <b>channel partitioning</b>, <b>random access</b> and <b>taking turns</b>.</p>
 <p><b>Channel partitioning.</b></p>
 <ul>
 <li><b>TDMA</b> (time-division): time is divided into frames of N slots, and each node owns one slot per frame. No collisions and perfectly fair, but a node gets at most <b>R/N</b> even when it is the only one with data, and must wait for its turn.</li>
 <li><b>FDMA</b> (frequency-division): the channel is split into N frequency bands of R/N each. Same strengths and weaknesses.</li>
 <li><b>CDMA</b> gives each node a different code, so several can send at the same time without interfering. It is covered with wireless networks.</li>
 </ul>`},
{id: "random", title: "Random access: ALOHA, CSMA and CSMA/CD", ref: "§6.3.2 · pp. 465–474",
 gist: "Send at full speed and recover from collisions by waiting a random time; listening first and stopping early make this much more efficient.",
 body: `<p>In <b>random access</b>, a node always sends at the full rate R. If its frame collides, it retransmits after an independent random delay, so the colliding nodes are unlikely to collide again.</p>
 <p><b>Slotted ALOHA.</b> Time is divided into slots of one frame time (L/R), nodes start sending only at slot boundaries, and all nodes detect a collision before the slot ends. A node sends a new frame in the next slot; after a collision it retransmits in each later slot with probability <b>p</b> until it succeeds. It is decentralised and simple, and a lone node gets the full rate, but slots are wasted on collisions and on silence. With N active nodes the efficiency is <code>N·p·(1−p)^(N−1)</code>, best at p = 1/N; with many nodes the maximum is <b>1/e ≈ 0.37</b>. Only 37% of slots carry a frame; 37% are empty and 26% have collisions.</p>
 <p><b>Pure ALOHA</b> drops the slots: a node sends as soon as it has a frame. A frame is then hit by any frame that starts during the frame time before it or during it, so the vulnerable period doubles and the maximum efficiency halves to <b>1/(2e) ≈ 0.18</b>. Explore both with the model below.</p>
 <p><b>CSMA</b> (carrier sense multiple access) adds the first rule of polite conversation: <b>listen before speaking</b>. If the channel is busy, wait. Collisions still happen, because of <b>propagation delay</b>: a node may sense the channel idle while another node's transmission is still on its way. The longer the propagation delay, the more likely this is.</p>
 <p><b>CSMA/CD</b> adds the second rule: <b>stop talking if someone else starts</b> (collision detection). An adapter:</p>
 <ol>
 <li>Prepares a frame and senses the channel. If idle, it starts sending; if busy, it waits until idle.</li>
 <li>While sending, it monitors the channel. If it detects energy from another adapter, it <b>aborts</b>.</li>
 <li>After aborting, it waits a random time (binary exponential backoff) and goes back to step 1.</li>
 </ol>
 <p><b>Binary exponential backoff.</b> After the n-th collision in a row for the same frame, the adapter picks K at random from {0, 1, …, 2<sup>n</sup> − 1} (n is capped at 10, so at most 1,024 values) and waits <b>K × 512 bit times</b>. That is 5.12 µs per step at 100 Mbps. With few collisions the waits are short; with many colliding nodes the set grows and the retries spread out.</p>
 <p><b>Efficiency</b> of CSMA/CD with many active nodes is roughly <code>1 / (1 + 5·d<sub>prop</sub>/d<sub>trans</sub>)</code>. It approaches 1 when the propagation delay is tiny (collisions are detected and aborted immediately) or when frames are long (a frame that wins the channel holds it for a long time).</p>`,
 widget: widgetAloha},
{id: "turns", title: "Taking turns and DOCSIS", ref: "§6.3.3–6.3.4 · pp. 474–477",
 gist: "Taking-turns protocols let nodes send one after another, aiming for the full rate R alone and R/M each under load.",
 body: `<p>Partitioning is wasteful at low load; random access is wasteful at high load. <b>Taking-turns</b> protocols try to get the best of both.</p>
 <ul>
 <li><b>Polling</b>: a <b>master node</b> invites each node in turn to send up to a maximum number of frames. No collisions or empty slots, but there is <b>polling delay</b> (a lone sender still waits while the master polls the others), and if the master fails the whole channel stops. Bluetooth works this way.</li>
 <li><b>Token passing</b>: a special frame, the <b>token</b>, circulates in a fixed order. A node holding it may send up to a maximum number of frames, then passes it on. Decentralised and efficient, but one failed node can break the ring, and a lost token needs a recovery procedure (as in FDDI and IEEE 802.5 token ring).</li>
 </ul>
 <div class="tblwrap"><table><thead><tr><th>Class</th><th>Examples</th><th>Low load</th><th>High load</th></tr></thead><tbody>
 <tr><td>Channel partitioning</td><td>TDMA, FDMA, CDMA</td><td>Wasteful: a lone node gets only R/N</td><td>Efficient and fair, no collisions</td></tr>
 <tr><td>Random access</td><td>Slotted/pure ALOHA, CSMA, CSMA/CD</td><td>Efficient: a lone node sends at R</td><td>Collisions waste capacity</td></tr>
 <tr><td>Taking turns</td><td>Polling, token passing</td><td>Some delay waiting for a turn</td><td>Efficient, no collisions</td></tr>
 </tbody></table></div>
 <p><b>DOCSIS</b>, the cable-Internet standard, combines all three. It uses <b>FDM</b> to split the cable into downstream and upstream channels. Downstream, only the cable company's CMTS sends, so there is no access problem. Upstream, the CMTS hands out time slots (<b>TDM</b>) in MAP messages; cable modems request slots by sending in special request mini-slots using <b>random access</b> with binary exponential backoff.</p>`},
{id: "arp", title: "MAC addresses and ARP", ref: "§6.4.1 · pp. 478–484",
 gist: "Adapters have flat, permanent MAC addresses; ARP finds the MAC address belonging to an IP address on the same subnet.",
 body: `<p><b>MAC addresses.</b> It is <i>adapters</i> (interfaces) that have link-layer addresses, also called LAN, physical or MAC addresses. A router with three interfaces has three. Link-layer switches don't have MAC addresses on their host-facing interfaces: they carry frames transparently. A MAC address is <b>6 bytes (48 bits)</b>, written in hexadecimal like <code>1A-23-F9-CD-06-9B</code>, giving 2<sup>48</sup> possible addresses. The <b>IEEE</b> sells manufacturers blocks of 2<sup>24</sup> addresses (fixing the first 24 bits), so no two adapters share an address.</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>MAC address</th><th>IP address</th></tr></thead><tbody>
 <tr><td>Layer</td><td>Link: delivery across one link or LAN</td><td>Network: delivery across interconnected networks</td></tr>
 <tr><td>Structure</td><td>Flat, 48 bits</td><td>Hierarchical (network + host part), 32 or 128 bits</td></tr>
 <tr><td>Changes when you move?</td><td>No: it stays with the adapter</td><td>Yes: it depends on the subnet you join</td></tr>
 <tr><td>Analogy</td><td>A personal ID number</td><td>A postal address</td></tr>
 </tbody></table></div>
 <p>A sending adapter puts the destination's MAC address in the frame. On a broadcast LAN every adapter sees the frame, but it only passes the frame up if the destination matches its own address or the <b>MAC broadcast address</b> <code>FF-FF-FF-FF-FF-FF</code>; otherwise it discards it. Separate link-layer addresses keep the layers independent: LANs can carry other network-layer protocols than IP, and the host isn't interrupted for every frame on the LAN.</p>
 <p><b>ARP</b> (Address Resolution Protocol) translates an IP address into a MAC address, but only for interfaces on the <b>same subnet</b> (DNS, by contrast, resolves names for hosts anywhere). Each host and router keeps an <b>ARP table</b> of IP → MAC mappings with a <b>TTL</b>, typically 20 minutes. If an entry is missing:</p>
 <ol>
 <li>The sender builds an <b>ARP query</b> (containing the IP address it wants resolved) and sends it in a frame to the <b>broadcast address</b>, so every interface on the subnet receives it.</li>
 <li>The interface whose IP matches sends an <b>ARP response</b> with its MAC address, in an ordinary <b>unicast</b> frame.</li>
 <li>The sender adds the mapping to its table and sends the datagram.</li>
 </ol>
 <p>ARP is <b>plug-and-play</b>: tables build themselves, and entries for hosts that leave simply expire. It straddles the link and network layers: ARP packets travel in frames (Ethernet type 0x0806) but contain both kinds of address.</p>
 <p><b>Sending to another subnet.</b> Host A (111.111.111.111) sends to host B (222.222.222.222) through a router. A sees B is on another subnet, so the datagram must go to its first-hop router. A uses ARP to find the MAC of <b>the router's interface on A's subnet</b> and sends the frame there, while the datagram's destination IP stays <b>B's</b>. The router passes the datagram up, looks up B's IP in its forwarding table, uses ARP on the other subnet to find B's MAC, and sends a <b>new frame</b> from its other interface. The IP addresses stay the same end to end; the MAC addresses change on every link.</p>`},
{id: "ethernet", title: "Ethernet", ref: "§6.4.2 · pp. 484–491",
 gist: "Ethernet defines the frame used on most wired LANs; it is connectionless and unreliable, and today runs over switches rather than shared media.",
 body: `<p>Ethernet has dominated wired LANs since the 1970s: it was first, it kept getting faster, and its hardware is cheap. The original Ethernet used a shared coaxial <b>bus</b>; then a <b>hub-based star</b>, where a hub is a physical-layer device that repeats every incoming <i>bit</i> out of all its other ports (still a broadcast LAN, still with collisions). Today the centre of the star is a <b>switch</b>, a store-and-forward layer-2 device, so there are no collisions.</p>
 <div class="tblwrap"><table><thead><tr><th>Field</th><th>Size</th><th>Purpose</th></tr></thead><tbody>
 <tr><td>Preamble</td><td>8 bytes</td><td>Seven bytes of 10101010 wake up the receiver and sync its clock; the eighth, 10101011, marks where the frame starts</td></tr>
 <tr><td>Destination address</td><td>6 bytes</td><td>MAC address of the receiving adapter (or broadcast)</td></tr>
 <tr><td>Source address</td><td>6 bytes</td><td>MAC address of the sending adapter</td></tr>
 <tr><td>Type</td><td>2 bytes</td><td>Which network-layer protocol the data is for, e.g. 0x0800 IPv4 or 0x0806 ARP (like IP's protocol field)</td></tr>
 <tr><td>Data</td><td>46–1,500 bytes</td><td>The IP datagram. The MTU is 1,500; shorter data is padded up to 46 bytes</td></tr>
 <tr><td>CRC</td><td>4 bytes</td><td>Cyclic redundancy check, so the receiver can detect bit errors</td></tr>
 </tbody></table></div>
 <p><b>Service.</b> Ethernet is <b>connectionless</b> (no handshake) and <b>unreliable</b>: the receiver sends no ACKs or NAKs, and simply discards a frame that fails the CRC check. With UDP the application sees a gap; with TCP, the missing data is retransmitted end to end.</p>
 <p><b>Many Ethernets.</b> IEEE 802.3 standards such as 10BASE-T, 100BASE-TX, 1000BASE-LX and 10GBASE-T differ in speed (the first number, in Mbps or Gbps), all use <b>baseband</b> signalling, and differ in physical medium (T for twisted-pair copper, other letters for fibre). They all keep the same frame format. Shared segments used CSMA/CD; on a switched, full-duplex link there are no collisions, so it isn't needed.</p>`},
{id: "switch", title: "Link-layer switches", ref: "§6.4.3 · pp. 491–497",
 gist: "A switch learns which port leads to each MAC address from frames' source addresses, then forwards, floods or filters each frame.",
 body: `<p>A switch receives frames and forwards them on outgoing links, buffering them when an output is busy. It is <b>transparent</b>: hosts address frames to each other, not to the switch.</p>
 <p><b>Filtering and forwarding.</b> Filtering decides whether a frame is forwarded or dropped; forwarding decides which interfaces it goes to. Both use the <b>switch table</b>, whose entries hold a MAC address, the interface leading to it, and the time the entry was made. When a frame for destination D arrives on interface x:</p>
 <ul>
 <li><b>No entry for D</b> (or D is the broadcast address): <b>flood</b>: send copies out of every interface except x.</li>
 <li><b>D is on interface x</b>: <b>filter</b>: discard the frame. It is already on its destination's segment.</li>
 <li><b>D is on another interface y</b>: <b>forward</b> it to y only.</li>
 </ul>
 <p><b>Self-learning.</b> The table starts empty. For every frame received, the switch records the frame's <b>source</b> MAC address, the interface it arrived on, and the time. An entry is deleted if no frame with that source arrives within the <b>aging time</b>, so a replaced PC eventually disappears from the table. Switches are therefore <b>plug-and-play</b>, and their interfaces are <b>full-duplex</b>. Try it in the model below.</p>
 <p><b>Why switches beat buses and hubs:</b> no collisions, because frames are buffered and never sent two at a time on a segment, so total throughput is the sum of the interface rates; links of different speeds and media can be mixed; and a faulty adapter can be cut off, which helps management and gives statistics. On security: a switch normally sends a frame only to its destination, which makes sniffing harder, but attackers can flood it with bogus source addresses (<b>switch poisoning</b>) to fill the table, so it floods everything.</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>Hub</th><th>Router</th><th>Switch</th></tr></thead><tbody>
 <tr><td>Traffic isolation</td><td>No</td><td>Yes</td><td>Yes</td></tr>
 <tr><td>Plug and play</td><td>Yes</td><td>No</td><td>Yes</td></tr>
 <tr><td>Optimal routing</td><td>No</td><td>Yes</td><td>No</td></tr>
 </tbody></table></div>
 <p><b>Switches vs routers.</b> Switches work up to layer 2 (MAC addresses), routers up to layer 3 (IP addresses). Switches are plug-and-play and fast, but the active topology is restricted to a <b>spanning tree</b> to avoid loops, large switched networks need big ARP tables and generate lots of ARP traffic, and they are vulnerable to <b>broadcast storms</b>. Routers can use the best paths, isolate broadcast storms and act as firewalls, but need IP configuration and more processing. Small networks of a few hundred hosts usually use switches alone; larger ones add routers.</p>`,
 widget: widgetSwitch},
{id: "vlan", title: "Virtual LANs (VLANs)", ref: "§6.4.4 · pp. 497–501",
 gist: "A VLAN switch divides its ports into groups that act as separate LANs, configured in software instead of with separate switches and cables.",
 body: `<p>A building network with one switch per department, connected through a central switch, has three problems:</p>
 <ul>
 <li><b>Lack of traffic isolation</b>: broadcast frames (ARP, DHCP) and unknown-destination floods still cross the whole network, which hurts performance, security and privacy.</li>
 <li><b>Inefficient use of switches</b>: many small groups each need their own, mostly empty, switch.</li>
 <li><b>Managing users</b>: when someone moves to another group, the cabling has to change.</li>
 </ul>
 <p><b>Port-based VLANs.</b> A switch that supports <b>virtual local area networks (VLANs)</b> lets the network manager divide its ports into groups, each a separate VLAN and broadcast domain. The switch only delivers frames between ports in the same VLAN, so one physical switch behaves like several. Moving a user to another group is just a configuration change. VLANs can also be defined by MAC address or by network-layer protocol.</p>
 <p><b>Between VLANs.</b> Because the VLANs are fully isolated, traffic between them goes through a <b>router</b>, for example connected to a switch port that belongs to both VLANs. Vendors usually build the router into the switch.</p>
 <p><b>VLAN trunking.</b> To connect two VLAN switches, one port on each is made a <b>trunk port</b>, which belongs to all VLANs. Frames crossing the trunk use the <b>802.1Q</b> format: a <b>4-byte VLAN tag</b> is inserted into the Ethernet header, made up of a 2-byte Tag Protocol Identifier (<code>0x8100</code>) and 2 bytes of Tag Control Information, holding a <b>12-bit VLAN identifier</b> and a 3-bit priority field. The sending switch adds the tag (and recomputes the CRC); the receiving switch reads and removes it.</p>`},
],
glossary: [
  ["Node", "Any device that runs a link-layer protocol: host, router, switch or access point."],
  ["Link", "A communication channel between two adjacent nodes."],
  ["Frame", "The link-layer packet: header fields plus a data field holding the datagram."],
  ["Link layer", "The layer that moves a datagram across one link, from a node to an adjacent node."],
  ["Network adapter (NIC)", "The hardware that implements most of a host's link layer."],
  ["MAC protocol", "Medium access control: the rules for when a node may put a frame on a link."],
  ["Point-to-point link", "A link with one sender and one receiver."],
  ["Broadcast link", "A shared link where every node receives every frame and transmissions can collide."],
  ["Collision", "Two or more transmissions on a shared channel at once; none get through."],
  ["Multiple-access protocol", "A protocol that coordinates the nodes sharing a broadcast channel."],
  ["Channel partitioning", "Dividing the channel into fixed shares, e.g. time slots (TDMA) or frequency bands (FDMA)."],
  ["TDMA / FDMA / CDMA", "Time-division / frequency-division / code-division multiple access."],
  ["Random access", "Nodes send at full rate and recover from collisions by retrying after random delays."],
  ["Slotted ALOHA", "Random access in synchronised slots, retrying with probability p; best efficiency 1/e ≈ 0.37."],
  ["Pure ALOHA", "Unslotted ALOHA; best efficiency 1/(2e) ≈ 0.18."],
  ["Efficiency (multiple access)", "Long-run fraction of time the channel carries a successful frame, with many active nodes."],
  ["CSMA", "Carrier sense multiple access: listen before sending."],
  ["CSMA/CD", "CSMA with collision detection: abort as soon as a collision is detected, then back off."],
  ["Binary exponential backoff", "After the n-th collision, wait K × 512 bit times with K random in {0, …, 2^min(n,10) − 1}."],
  ["Taking turns", "Nodes send one after another, e.g. polling or token passing."],
  ["Polling", "A master node invites each node in turn to send."],
  ["Token passing", "A token frame circulates; only the node holding it may send."],
  ["DOCSIS", "Cable-Internet standard combining FDM channels, TDM slots and random-access requests."],
  ["MAC address", "48-bit, flat, permanent link-layer address of an adapter."],
  ["MAC broadcast address", "FF-FF-FF-FF-FF-FF: a frame for every adapter on the LAN."],
  ["ARP", "Address Resolution Protocol: finds the MAC address for an IP address on the same subnet."],
  ["ARP table", "A node's cache of IP → MAC mappings, each with a TTL (typically 20 minutes)."],
  ["Ethernet", "The dominant wired LAN technology (IEEE 802.3) and its frame format."],
  ["Preamble", "8 bytes at the start of an Ethernet frame that sync the receiver's clock."],
  ["Type field", "Ethernet header field naming the network-layer protocol, e.g. 0x0800 IPv4, 0x0806 ARP."],
  ["CRC", "Cyclic redundancy check at the end of a frame, for detecting bit errors."],
  ["MTU", "Maximum transmission unit: Ethernet's largest data field, 1,500 bytes."],
  ["Hub", "Physical-layer device that repeats every bit out of all its other ports."],
  ["Switch", "Layer-2 store-and-forward device that forwards frames using MAC addresses."],
  ["Switch table", "Entries of MAC address, interface and time used to filter and forward frames."],
  ["Self-learning", "A switch building its table from the source addresses of frames it receives."],
  ["Frame forwarding / filtering / flooding", "Send to the one known port / discard (destination on the incoming port) / send out of all other ports."],
  ["Aging time", "How long a switch keeps an entry without seeing that source address again."],
  ["Spanning tree", "The loop-free topology a switched network is restricted to."],
  ["Broadcast storm", "Broadcast frames multiplying through a switched network until it is overwhelmed."],
  ["VLAN", "Virtual LAN: a group of switch ports acting as a separate LAN and broadcast domain."],
  ["Trunk port", "A switch port that belongs to all VLANs and carries tagged frames to another switch."],
  ["802.1Q", "IEEE standard adding a 4-byte VLAN tag (with a 12-bit VLAN ID) to Ethernet frames on trunks."],
],
};
