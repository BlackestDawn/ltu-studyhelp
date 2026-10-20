// Reading-first material for module 4: summary, study notes and key terms.
import { widgetIPv4 } from "../../widgets.js";

export default {
summary: {
  big: `<p>The network layer runs in <b>every host and every router</b>, and its job is to move datagrams from the sending host to the receiving host. It has two parts. The <b>data plane</b> is what each router does locally to every packet: look at the header and <b>forward</b> it to the right output link, in nanoseconds. The <b>control plane</b> decides the network-wide paths (<b>routing</b>) and fills in the forwarding tables, either through algorithms running in every router or through a remote <b>SDN controller</b>. This module covers the data plane; the control plane comes next.</p>
  <p>Inside a router, a packet goes through an input port (where the destination is looked up with <b>longest prefix match</b>), then a <b>switching fabric</b>, then an output port where it may wait in a <b>queue</b> and be picked by a <b>scheduler</b>. Queues explain both delay and loss.</p>
  <p>The Internet's network-layer protocol is <b>IP</b>. This module covers the IPv4 datagram format, <b>addressing and subnetting with CIDR</b>, how hosts get addresses (<b>DHCP</b>), how home networks share one address (<b>NAT</b>), and <b>IPv6</b>. It ends with <b>generalised forwarding</b> (match + action, as in OpenFlow), which lets one device act as a router, switch, firewall or NAT, and with <b>middleboxes</b>.</p>`,
  takeaways: [
    "<b>Forwarding</b>: what should this router do with this packet? Local, data plane, hardware, nanoseconds. <b>Routing</b>: which path should packets take? Network-wide, control plane, software, seconds.",
    "IP gives <b>best-effort</b> service: no guarantees of delivery, order, timing or bandwidth.",
    "Forwarding tables are searched with <b>longest prefix match</b>: the most specific matching entry wins.",
    "Switching fabrics: via memory, via a bus (one packet at a time), via an interconnection network (packets in parallel).",
    "Queues form at input ports (<b>head-of-line blocking</b>, input side only) and output ports. With a full buffer the router drops the arriving packet (<b>tail drop</b>) or a lower-priority one, or marks packets; AQM such as RED acts early.",
    "Schedulers: FIFO, priority, round robin, and <b>weighted fair queuing</b> (class i gets wᵢ/Σw of the link).",
    "IPv4 header: 20 bytes without options. Key fields: TTL, upper-layer protocol, header checksum, source and destination addresses, and the fragmentation fields.",
    "<b>CIDR</b> a.b.c.d/x: x prefix bits. A /x block has 2^(32−x) addresses and 2^(32−x) − 2 usable hosts. <b>DHCP</b> gives a host its address, mask, gateway and DNS server.",
    "<b>NAT</b> hides a private network behind one public address by rewriting addresses and port numbers.",
    "<b>IPv6</b>: 128-bit addresses, fixed 40-byte header, flow label; no router fragmentation, no header checksum, no options. Crosses IPv4 regions by <b>tunneling</b>.",
    "<b>Generalised forwarding</b> matches on fields from several layers and acts: forward, drop, modify, or send to the controller. It is a limited form of programmability.",
    "<b>Middleboxes</b> (NAT, firewalls, load balancers) put functions inside the network, challenging the principle that intelligence belongs at the ends.",
  ],
  formulas: [
    ["network = IP AND mask", "The subnet address: keep the first x bits, set the rest to 0.", "Dissecting an address with a prefix.", [["IP", "the address, in binary"], ["mask", "x ones followed by zeros (x = prefix length)"], ["AND", "bitwise AND: keeps the prefix bits, zeroes the host bits"]]],
    ["broadcast = network OR ~mask", "Set all host bits to 1.", "Finding the last address of a subnet.", [["network", "the subnet address"], ["~mask", "the mask with every bit flipped: ones in the host bits"], ["OR", "bitwise OR: sets all host bits to 1"]]],
    ["usable hosts = 2^(32−x) − 2", "The all-0s (network) and all-1s (broadcast) host parts can't be given to hosts.", "Sizing a subnet.", [["x", "prefix length (the /x)"], ["32 − x", "number of host bits"], ["− 2", "the network and broadcast addresses"]]],
    ["smallest k with 2^k − 2 ≥ hosts; prefix = 32 − k", "Block size for a subnet that must hold a given number of hosts.", "Carving up a block. Allocate the largest subnets first so each stays aligned.", [["k", "number of host bits"], ["hosts", "number of hosts the subnet must hold"]]],
    ["data per fragment = ⌊(MTU − 20) / 8⌋ · 8", "Fragment payloads must be a multiple of 8 bytes (except the last).", "Fragmentation problems.", [["MTU", "largest datagram the next link can carry, in bytes"], ["20", "IPv4 header size, in bytes"], ["⌊ / 8⌋ · 8", "round down to a multiple of 8"]]],
    ["offset = (bytes before this fragment) / 8", "The fragment offset field counts 8-byte units.", "Fragmentation problems.", [["bytes before this fragment", "data bytes carried by the earlier fragments"]]],
    ["total length = data + 20", "Each fragment carries its own 20-byte header.", "Fragmentation problems.", [["data", "data bytes in this fragment"], ["20", "this fragment's own IPv4 header"]]],
    ["B = RTT · C   (or RTT · C / √N)", "Classic rule for router buffer size; with N large TCP flows, much less is needed.", "Buffer sizing questions.", [["RTT", "average round-trip time of the flows, in seconds"], ["C", "link capacity, in bits/s"], ["N", "number of TCP flows through the link"]]],
    ["WFQ share = wᵢ / Σⱼ wⱼ", "Fraction of link rate guaranteed to class i under weighted fair queuing.", "Scheduling problems.", [["wᵢ", "weight of class i"], ["Σⱼ wⱼ", "sum of the weights of all classes with packets waiting"]]],
  ],
  traps: [
    "Mixing up forwarding and routing, or data plane and control plane.",
    "Forgetting the −2 when counting usable hosts.",
    "Placing subnets at addresses that aren't multiples of their block size.",
    "Forgetting that the fragment offset counts 8-byte units, and that each fragment's total length includes its own header.",
    "Setting MF = 1 on the last fragment. Only the last fragment has MF = 0.",
    "Thinking routers reassemble fragments. Only the destination host does.",
    "Saying IPv6 removed the flow label or addresses; it removed the checksum, router fragmentation and options.",
    "In a flow table, using a later rule when an earlier, higher-priority rule already matches.",
    "Thinking the IPv4 header checksum covers the payload. It covers only the header, which is why routers recompute it when TTL changes.",
    "Confusing NAT with DHCP: DHCP hands out addresses; NAT translates addresses and ports at the network's edge.",
  ],
},
notes: [
{id: "overview", title: "Overview: forwarding, routing and SDN", ref: "§4.1 · pp. 304–311",
 gist: "The data plane forwards each packet locally; the control plane decides the paths.",
 body: `<p>Every host and router runs a network layer. The sending host <b>encapsulates</b> segments in datagrams, every router examines the header of each datagram passing through and forwards it, and the receiving host extracts the payload and passes it up to transport. Two functions matter:</p>
 <ul>
 <li><b>Forwarding</b>: when a packet arrives on an input link, move it to the right output link. It is local to one router, takes nanoseconds, and is usually done in hardware. This is the <b>data plane</b>.</li>
 <li><b>Routing</b>: work out the path packets take from source to destination using <b>routing algorithms</b>. It is network-wide, takes seconds, and is usually done in software. This is the <b>control plane</b>.</li>
 </ul>
 <div class="callout"><b>Analogy.</b> Forwarding is getting through one motorway interchange; routing is planning the whole trip.</div>
 <div class="tblwrap"><table><thead><tr><th></th><th>Forwarding (data plane)</th><th>Routing (control plane)</th></tr></thead><tbody>
 <tr><td>Question it answers</td><td>What should <i>this router</i> do with <i>this packet</i>?</td><td>Which path should packets follow from source to destination?</td></tr>
 <tr><td>Scope</td><td>Local, one router</td><td>Network-wide</td></tr>
 <tr><td>Timescale</td><td>Nanoseconds</td><td>Seconds</td></tr>
 <tr><td>Implemented in</td><td>Hardware</td><td>Software</td></tr>
 </tbody></table></div>
 <p>The link between them is the <b>forwarding table</b>. In the <b>traditional</b> approach, every router runs a routing algorithm and talks to other routers to build its own table. In <b>software-defined networking (SDN)</b>, a logically centralised <b>remote controller</b> computes the tables and installs them in the routers, which then only forward.</p>
 <p><b>Service model.</b> A network layer could promise guaranteed delivery, bounded delay, in-order delivery, minimum bandwidth or security. The Internet promises none of these: it offers <b>best-effort</b> service. Other architectures did offer guarantees; ATM's constant-bit-rate service, for example, behaved essentially like a dedicated wire. That simplicity, plus adequate bandwidth and application-level fixes (CDNs, adaptive streaming, TCP congestion control), has worked well in practice.</p>`},
{id: "router", title: "What's inside a router", ref: "§4.2 · pp. 311–330",
 gist: "Input ports look up and queue, the fabric moves packets across, output ports queue and schedule.",
 body: `<p>A router has four parts: <b>input ports</b>, a <b>switching fabric</b>, <b>output ports</b>, and a <b>routing processor</b>, which runs the control plane (or talks to the SDN controller).</p>
 <p><b>Data plane vs control plane inside the router.</b> Input ports, the switching fabric and output ports form the data plane: implemented in <b>hardware</b>, working in nanoseconds. The routing processor, usually an ordinary CPU, runs the control plane in <b>software</b> on a timescale of milliseconds: it runs routing protocols (or talks to the SDN controller) and installs the forwarding table.</p>
 <p><b>Input port processing</b> has three jobs: <b>line termination</b> (physical layer: receive the bits), <b>link-layer processing</b> (assemble the frame), and the most important network-layer job, <b>lookup and forwarding</b>: look up the destination in the forwarding table to choose the output port. That is “match plus action”. Lookups must keep up with line rate, so they are often done in special memory (TCAM).</p>
 <p><b>Longest prefix match.</b> Tables list address <b>prefixes</b>, not single addresses. A destination may match several entries; the router uses the <b>longest</b> (most specific) one. This lets an organisation carve an exception out of a bigger block. If nothing matches, a default entry is used.</p>
 <p><b>Switching fabrics:</b></p>
 <ul>
 <li><b>Via memory</b>: the earliest routers were ordinary computers. The CPU copies each packet into memory and out again, so every packet crosses the memory bus twice.</li>
 <li><b>Via a bus</b>: input ports send packets straight to output ports over a shared bus, <b>one packet at a time</b>. The bus speed limits the router.</li>
 <li><b>Via an interconnection network</b>, such as a <b>crossbar</b>: packets to <i>different</i> output ports can cross at the same time (non-blocking). Large routers use several stages of these.</li>
 </ul>
 <p><b>Queuing.</b> If the fabric is slower than all inputs combined, packets queue at the <b>input</b>. A packet at the front waiting for a busy output then blocks packets behind it whose outputs are free: <b>head-of-line (HOL) blocking</b>. If several inputs send to one output faster than it can transmit, packets queue at the <b>output</b>. HOL blocking only happens at the input side, before the fabric.</p>
 <p><b>Buffer management.</b> When a packet arrives at a full buffer, the router can drop the arriving packet (<b>tail drop</b>), or remove an already queued packet, for example a lower-priority one, to make room. It can also <b>mark</b> packets (ECN) to signal congestion instead. <b>Active queue management (AQM)</b> such as <b>RED</b> drops or marks packets <i>before</i> the buffer fills, so TCP senders slow down early.</p>
 <p><b>How much buffering?</b> The classic rule is <b>B = RTT · C</b> (round-trip time × link capacity). With N large TCP flows, <b>RTT · C / √N</b> is enough. More is not always better: big buffers cause long, persistent queues and delays (<b>bufferbloat</b>).</p>
 <p><b>Packet scheduling</b> chooses the next packet to send:</p>
 <ul>
 <li><b>FIFO</b> (also called first-come first-served, FCFS): send packets in the order they arrived.</li>
 <li><b>Priority</b>: classes by importance; always send from the highest-priority class with a non-empty queue, and within a class, first-come first-served. Non-preemptive means a packet already being sent is never interrupted.</li>
 <li><b>Round robin</b>: take turns between classes, skipping empty ones.</li>
 <li><b>Weighted fair queuing (WFQ)</b>: round robin where class i is guaranteed a share wᵢ/Σw of the link.</li>
 </ul>
 <p>These choices connect to the policy debate on <b>net neutrality</b>: whether ISPs may block, throttle or prioritise traffic.</p>`},
{id: "ipv4", title: "The IPv4 datagram and fragmentation", ref: "§4.3.1 · pp. 331–333",
 gist: "A 20-byte header (without options) that every router reads, and partly rewrites, at every hop.",
 body: `<p>The <b>IP protocol</b> itself defines three things: the <b>datagram format</b>, the <b>addressing</b> (how addresses are structured and interpreted), and <b>packet-handling conventions</b> such as fragmentation. Routing is not part of IP; it belongs to the control plane.</p>
 <p>Click the fields in the model below for details. The ones exams ask about most:</p>
 <ul>
 <li><b>Version</b> (4) and <b>header length</b> (in 32-bit words; usually 5, meaning 20 bytes).</li>
 <li><b>Type of service</b>: DiffServ bits to mark traffic classes, and 2 <b>ECN</b> bits for congestion notification.</li>
 <li><b>Datagram length</b>: header plus data in bytes, at most 65,535 and rarely above 1,500.</li>
 <li><b>Identifier, flags, fragment offset</b>: used for fragmentation.</li>
 <li><b>Time-to-live (TTL)</b>: decremented at each router; at 0 the datagram is dropped. This stops routing loops from trapping packets forever.</li>
 <li><b>Upper-layer protocol</b>: which transport protocol gets the payload (6 = TCP, 17 = UDP).</li>
 <li><b>Header checksum</b>: covers only the header, and is recomputed at every router because TTL changes.</li>
 <li><b>Source and destination IP addresses</b>, then <b>options</b> (rare) and the <b>data</b>.</li>
 </ul>
 <p>A TCP segment in an IPv4 datagram, with no options, carries 40 bytes of headers (20 + 20).</p>
 <p><b>Fragmentation.</b> Each link has an <b>MTU</b>, the largest frame payload it can carry. A datagram bigger than the next link's MTU is split into <b>fragments</b>. Every fragment keeps the original <b>identifier</b>, has <b>MF</b> (more fragments) set to 1 except the last, and has an <b>offset</b> giving where its data belongs, in 8-byte units. Fragment payloads are therefore multiples of 8 bytes, except the last. Reassembly happens <b>only at the destination host</b>.</p>
 <div class="callout ex"><b>Example.</b> A 4,000-byte datagram (20 header + 3,980 data) meets an MTU of 1,500. Each fragment can carry 1,480 data bytes (already a multiple of 8). That gives three fragments with 1,480, 1,480 and 1,020 data bytes; total lengths 1,500, 1,500 and 1,040; offsets 0, 185 and 370; MF flags 1, 1, 0.</div>`,
 widget: widgetIPv4},
{id: "addressing", title: "IPv4 addressing, subnets and DHCP", ref: "§4.3.2 · pp. 333–344",
 gist: "Addresses belong to interfaces, are grouped into subnets by prefix, and are handed out by DHCP.",
 body: `<p>An IPv4 address is 32 bits, written in dotted-decimal (for example 193.32.216.9). Addresses belong to <b>interfaces</b>, not hosts: a router with three links has three addresses.</p>
 <p><b>Subnets.</b> Interfaces that can reach each other without going through a router form a <b>subnet</b> and share the same leading bits. To find the subnets in a network, detach every interface from its router or host; each “island” left over is a subnet. A subnet is written <b>a.b.c.d/x</b>, where x is the number of prefix bits, and its mask has x ones (for example /24 = 255.255.255.0).</p>
 <p><b>CIDR</b> (Classless Interdomain Routing) allows any prefix length. The older <b>classful</b> scheme only allowed /8, /16 and /24 (classes A, B and C), which wasted addresses. CIDR also enables <b>address aggregation</b> (route aggregation): an ISP announces a single prefix covering all its customers' blocks, and longest-prefix match handles exceptions when a customer moves to another ISP.</p>
 <div class="callout ex"><b>Example.</b> 200.23.16.0/23 has 23 prefix bits and 9 host bits: 512 addresses, 510 usable hosts, from 200.23.16.0 (network) to 200.23.17.255 (broadcast). The address 255.255.255.255 means “broadcast to everyone on this subnet”.</div>
 <p>This is <b>hierarchical addressing</b>: the prefix identifies the network and the rest identifies the interface, so routers far away only need one entry per prefix, not one per host. That is what makes forwarding scale.</p>
 <p>Organisations get blocks from their ISP, and address space is ultimately managed by <b>ICANN</b> through regional registries. A host gets its own address either configured by hand or, usually, from DHCP.</p>
 <p><b>DHCP</b> (Dynamic Host Configuration Protocol) gives a joining host an IP address automatically (“plug and play”), together with the subnet mask, the <b>first-hop router</b> (default gateway) and the <b>local DNS server</b>. It is a client-server protocol over UDP (server port 67, client port 68), in four steps:</p>
 <ol>
 <li><b>Discover</b>: the client broadcasts from 0.0.0.0 to 255.255.255.255, because it has no address yet.</li>
 <li><b>Offer</b>: a server proposes an address, mask and lease time (also broadcast).</li>
 <li><b>Request</b>: the client picks one offer and asks for it.</li>
 <li><b>ACK</b>: the server confirms.</li>
 </ol>`},
{id: "nat", title: "Network address translation (NAT)", ref: "§4.3.3 · pp. 344–347",
 gist: "A whole home network shares one public address; the NAT router rewrites addresses and ports.",
 body: `<p>Home and small-office networks use <b>private address ranges</b> (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) that only mean something inside that network. To the outside world, the whole network looks like one device with a single public address. That stretched the shrinking supply of IPv4 addresses. NAT has side benefits too: the network can change ISP, or renumber its own devices, without telling the outside world, and devices inside aren't directly addressable from outside.</p>
 <p>NAT doesn't hand out addresses: the hosts' private addresses usually come from a DHCP server, often running on the same home router.</p>
 <p><b>How it works.</b> When a host sends a datagram out, the NAT router replaces the source (private IP, port) with (public IP, new port) and records the pair in its <b>NAT translation table</b>. When a reply arrives for (public IP, that port), it looks up the table and rewrites the destination back to the private host and port. Port numbers are 16 bits, so one public address supports more than 60,000 simultaneous connections. Incoming datagrams with no table entry are dropped, which is why servers behind NAT are hard to reach without port forwarding or NAT-traversal tricks.</p>
 <p><b>Why NAT is controversial:</b> it uses <b>port numbers</b>, a transport-layer field, to address hosts, so routers end up touching layer-4 headers, when they should only process up to layer 3. It also breaks the end-to-end argument (see middleboxes below). Purists argue that the real fix for address shortage is IPv6.</p>`},
{id: "ipv6", title: "IPv6", ref: "§4.3.4 · pp. 347–353",
 gist: "Much larger addresses, a simpler fixed header, and tunneling to cross IPv4-only parts of the Internet.",
 body: `<p>The main motivation was that the <b>32-bit IPv4 address space was running out</b>. The redesign also aimed at faster processing and better support for different kinds of traffic.</p>
 <ul>
 <li><b>128-bit addresses</b>, plus a new <b>anycast</b> address type (deliver to any one of a group).</li>
 <li>A fixed <b>40-byte header</b>, so routers can process it faster.</li>
 <li>A <b>flow label</b> to mark packets belonging to the same flow for special handling.</li>
 <li>Header fields: version, traffic class, flow label, payload length, <b>next header</b> (like IPv4's protocol field), <b>hop limit</b> (like TTL), source and destination addresses.</li>
 </ul>
 <p><b>Removed:</b> <b>fragmentation at routers</b> (a router sends back an ICMP “Packet Too Big” message, and the sender fragments instead), the <b>header checksum</b> (transport and link layers already check), and <b>options</b> (moved to optional extension headers).</p>
 <p><b>Transition by tunneling.</b> Switching every router to IPv6 at once (a “flag day”) is impossible, so IPv4 and IPv6 must coexist. When IPv6 datagrams must cross IPv4-only routers, the IPv6 node at the start of the tunnel puts the <b>whole IPv6 datagram inside an IPv4 datagram</b> addressed to the node at the other end, with the protocol field set to 41 (IPv6). The far end unwraps it and continues with IPv6.</p>`},
{id: "generalized", title: "Generalised forwarding and SDN", ref: "§4.4 · pp. 353–360",
 gist: "Match on fields from several layers, then take an action: forward, drop, modify, or ask the controller.",
 body: `<div class="tblwrap"><table><thead><tr><th></th><th>Destination-based forwarding</th><th>Generalised forwarding</th></tr></thead><tbody>
 <tr><td>Match on</td><td>Destination IP address only</td><td>Many header fields from the link, network and transport layers</td></tr>
 <tr><td>Actions</td><td>Forward through the chosen output port</td><td>Forward, drop, modify fields, or send to the controller</td></tr>
 </tbody></table></div>
 <p><b>Generalised forwarding</b> turns forwarding into “<b>match plus action</b>”: match on any combination of header fields, then act. A <b>flow table</b>, installed by a remote controller, has entries with:</p>
 <ul>
 <li><b>Match fields</b>, from several layers: ingress port, source and destination MAC, Ethernet type, VLAN, source and destination IP, IP protocol, TOS, and source and destination TCP/UDP port. Any field can be a wildcard.</li>
 <li><b>Counters</b>: how many packets matched, and when the entry was last used.</li>
 <li><b>Actions</b>: <b>forward</b> to one or more ports, <b>drop</b>, <b>modify fields</b> (as NAT does), or <b>send to the controller</b>.</li>
 </ul>
 <p>Entries have priorities, and the <b>first (highest-priority) match wins</b>. <b>OpenFlow</b> is the best-known standard for this. The flow table still lives locally in each switch; the controller only computes and installs it.</p>
 <p>Match plus action is a <b>limited form of programmability</b>: a program can tell a router which per-packet processing steps to take, an idea that goes back to research on “active networking”.</p>
 <div class="callout ex"><b>One device, many roles.</b> Match on destination IP and forward: a <b>router</b>. Match on destination MAC: a <b>switch</b>. Drop everything except certain addresses or ports: a <b>firewall</b>. Rewrite addresses and ports: a <b>NAT</b>. Send traffic for one destination out of different ports depending on the source: <b>load balancing</b>.</div>`},
{id: "middleboxes", title: "Middleboxes and the Internet's architecture", ref: "§4.5 · pp. 360–364",
 gist: "Boxes in the data path doing more than forwarding, and the design principles they bend.",
 body: `<p>A <b>middlebox</b> (RFC 3234) is “any intermediary box performing functions apart from normal, standard functions of an IP router on the data path”. There are three broad kinds:</p>
 <ul>
 <li><b>NAT translation</b>.</li>
 <li><b>Security services</b>: <b>firewalls</b> that block traffic based on header fields, <b>intrusion detection systems (IDS)</b> that look for known attack patterns, and mail filters.</li>
 <li><b>Performance enhancement</b>: compression, content caching, and <b>load balancers</b> that spread requests over many servers. A load balancer that routes HTTP requests by looking at application-layer headers is sometimes called a <b>layer-7 switch</b> (application-layer switch).</li>
 </ul>
 <p>Many middleboxes now run as software on ordinary hardware (network function virtualisation), and many can be expressed as match-plus-action rules.</p>
 <p><b>Architectural principles.</b> RFC 1958 sums up the Internet's design: “the goal is connectivity, the tool is the Internet Protocol, and the intelligence is end to end rather than hidden in the network.” The <b>IP hourglass</b> shows the narrow waist: many applications and transport protocols on top, many link technologies below, and just one protocol, IP, in the middle that everything must speak. The <b>end-to-end argument</b> says a function that can only be done correctly at the endpoints (such as reliable delivery) belongs there; doing it inside the network can at most improve performance. Middleboxes bend these principles: they put functions and intelligence <i>inside</i> the network, which some describe as <b>thickening the waist</b>. That is why they are debated.</p>
 <p><b>Where does the intelligence live?</b> The telephone network kept it inside the network, with simple phones at the ends. The Internet moved it to the edge, keeping a simple IP core. NAT, programmable forwarding and middleboxes are now pulling some of it back into the network.</p>`},
],
glossary: [
  ["Forwarding", "Moving a packet from a router's input link to the right output link (data plane)."],
  ["Routing", "Computing the paths packets take through the network (control plane)."],
  ["Data plane / control plane", "Per-router forwarding of each packet / network-wide logic that decides the forwarding tables."],
  ["SDN", "Software-defined networking: a remote controller computes and installs forwarding tables."],
  ["Best-effort service", "The Internet's service model: no guarantees of delivery, timing, order or bandwidth."],
  ["Longest prefix match", "Of all forwarding-table entries matching a destination, use the one with the longest prefix."],
  ["Routing processor", "The router's CPU; runs the control plane in software and installs the forwarding table."],
  ["Line termination", "The physical-layer job of an input port: receiving the bits."],
  ["Switching fabric", "The part of a router that moves packets from input ports to output ports."],
  ["Crossbar", "An interconnection-network fabric that can move packets to different outputs in parallel."],
  ["Head-of-line (HOL) blocking", "A packet at the front of an input queue blocks those behind it while it waits for a busy output."],
  ["Drop-tail", "Dropping arriving packets when the buffer is full."],
  ["AQM / RED", "Active queue management, such as Random Early Detection: drop or mark packets before the buffer is full."],
  ["Bufferbloat", "Persistent long queues, and long delays, caused by oversized buffers."],
  ["FIFO / FCFS", "First in, first out (first-come, first-served): send packets in arrival order."],
  ["WFQ", "Weighted fair queuing: round robin where each class gets a weighted share of the link."],
  ["MTU", "Maximum transmission unit: the largest payload a link-layer frame can carry."],
  ["Fragmentation", "Splitting an IPv4 datagram that is too big for the next link; reassembled only at the destination."],
  ["TTL", "Time-to-live: hop counter decremented by each router; the datagram is dropped at 0."],
  ["Interface", "The boundary between a host or router and one physical link; IP addresses belong to interfaces."],
  ["Subnet", "A group of interfaces that can reach each other without passing through a router; they share a prefix."],
  ["CIDR", "Classless Interdomain Routing: addresses written a.b.c.d/x, with any prefix length x."],
  ["Subnet mask", "The prefix written as an address: x ones followed by zeros, e.g. 255.255.255.0 for /24."],
  ["Hierarchical addressing", "Prefix identifies the network, remaining bits the interface, so routers need one entry per prefix."],
  ["Address aggregation", "Advertising one prefix that covers many smaller blocks."],
  ["DHCP", "Dynamic Host Configuration Protocol: gives a host its IP address, mask, gateway and DNS server."],
  ["Default gateway", "The first-hop router a host sends off-subnet datagrams to."],
  ["NAT", "Network address translation: sharing one public address by rewriting addresses and ports."],
  ["Private address range", "10/8, 172.16/12 and 192.168/16: only meaningful inside a private network."],
  ["IPv6", "The 128-bit successor to IPv4, with a fixed 40-byte header."],
  ["Flow label", "IPv6 field identifying packets of the same flow."],
  ["Flag day", "Switching everything to a new protocol at the same moment; impossible for IPv6 on the Internet."],
  ["Tunneling", "Carrying an entire IPv6 datagram as the payload of an IPv4 datagram."],
  ["Generalised forwarding", "Match on fields from several layers, then forward, drop, modify or send to the controller."],
  ["Flow table", "The table of match-plus-action entries in an OpenFlow switch."],
  ["OpenFlow", "A standard protocol and flow-table format for generalised forwarding."],
  ["Match plus action", "Find the flow-table entry whose header fields match the packet, then apply its action."],
  ["Middlebox", "A device in the data path doing more than IP forwarding: NAT, firewall, IDS, cache, load balancer."],
  ["Layer-7 switch", "A load balancer that makes decisions based on application-layer headers, such as HTTP."],
  ["IP hourglass", "The Internet's “narrow waist”: many protocols above and below, only IP in the middle."],
  ["End-to-end argument", "Functions that need the endpoints to be done correctly should be implemented at the endpoints."],
],
};
