// Reading-first material for module 1: summary, study notes and key terms.
import { widgetPipeline } from "../../widgets.js";

export default {
summary: {
  big: `<p>The Internet is a <b>network of networks</b>. At the edge sit billions of <b>end systems</b> (hosts) such as phones, laptops and servers. They connect through <b>access networks</b> (DSL, cable, fibre, Wi-Fi, cellular) to <b>Internet Service Providers</b>, and the ISPs interconnect through the <b>network core</b>: a mesh of routers and high-speed links.</p>
  <p>Data crosses this mesh as <b>packets</b>. Each router receives a whole packet, looks up where it should go next, and sends it on. This is <b>store-and-forward packet switching</b>. Links are shared on demand, which suits bursty traffic well, but it means packets can wait in queues, arrive late, or be dropped. Measuring those costs (<b>delay, loss and throughput</b>) is the main calculation skill in this chapter.</p>
  <p>To keep such a large system manageable, its work is split into five <b>layers</b>: application, transport, network, link and physical. Each layer adds its own header around the data from the layer above (<b>encapsulation</b>). The original design assumed everyone could be trusted, so <b>security</b> has had to be added afterwards.</p>`,
  takeaways: [
    "The Internet is a network of networks: end systems and access networks at the <b>edge</b>; routers and links in the <b>core</b>.",
    "A <b>protocol</b> defines the format and order of messages, and the actions taken when a message is sent or received.",
    "<b>Packet switching</b> shares links on demand and uses store-and-forward. <b>Circuit switching</b> reserves a fixed rate along the whole path for the whole session.",
    "Packet switching wins for bursty users through <b>statistical multiplexing</b>. The price is queuing delay and possible loss.",
    "The core has two key functions: <b>forwarding</b> (local: input link to output link, using the forwarding table) and <b>routing</b> (global: computing the paths).",
    "Each hop adds four delays: processing, queuing, <b>transmission (L/R)</b> and <b>propagation (d/s)</b>. Transmission depends on packet size and link rate; propagation depends on distance.",
    "Queuing depends on <b>traffic intensity La/R</b>. Delay grows sharply as it approaches 1 and without bound above 1. Full buffers drop packets.",
    "End-to-end <b>throughput</b> is set by the slowest (bottleneck) link on the path.",
    "Five layers, five names for the data unit: <b>message</b>, <b>segment</b>, <b>datagram</b>, <b>frame</b>, bits. Hosts run all five layers, routers three, link-layer switches two.",
    "Common attacks: malware and botnets, denial of service, packet sniffing and IP spoofing. Each has a matching defence: encryption against sniffing, authentication against spoofing, integrity checks against tampering, access control against unauthorised use, firewalls against unwanted traffic.",
  ],
  formulas: [
    ["d_trans = L / R", "Time to push all L bits of a packet onto a link of rate R bits/s.", "Packet size and link rate are given. Remember bytes × 8.", [["L", "packet length, in bits (bytes × 8)"], ["R", "link transmission rate, in bits/s"]]],
    ["d_prop = d / s", "Time for one bit to travel a link of length d at signal speed s (about 2×10⁸ m/s in cables).", "Distance is given. Independent of packet size.", [["d", "length of the link, in metres"], ["s", "propagation speed in the medium, in m/s (about 2×10⁸)"]]],
    ["d_nodal = d_proc + d_queue + d_trans + d_prop", "Total delay at one hop.", "Asked for the delay at a single router.", [["d_proc", "processing delay: checking the header and choosing the output link"], ["d_queue", "time spent waiting in the output buffer"], ["d_trans", "transmission delay, L/R"], ["d_prop", "propagation delay, d/s"]]],
    ["d_end-end = N (d_proc + d_trans + d_prop)", "N links in series (N−1 routers), no queuing, equal links.", "Multi-hop store-and-forward problems.", [["N", "number of links on the path (routers + 1)"], ["d_proc, d_trans, d_prop", "the per-link delays above"]]],
    ["(N + P − 1) · L/R", "Time for P packets to cross N store-and-forward links, ignoring propagation.", "A message is split into packets (pipelining).", [["N", "number of links"], ["P", "number of packets"], ["L", "length of one packet, in bits"], ["R", "link rate, in bits/s"]]],
    ["I = L·a / R", "Traffic intensity: bits arriving per second (a packets/s × L bits) over link rate.", "Deciding whether a queue stays bounded. Keep I below 1.", [["L", "packet length, in bits"], ["a", "average arrival rate, in packets/s"], ["R", "link rate, in bits/s"]]],
    ["(N − 1) · L / (2R)", "Average queuing delay when N packets arrive together at an empty queue.", "A burst of packets arrives at once.", [["N", "number of packets arriving at the same moment"], ["L", "packet length, in bits"], ["R", "link rate, in bits/s"]]],
    ["throughput = min(R₁, R₂, …, R_N)", "End-to-end throughput is limited by the slowest link. A link shared by n flows gives each R/n.", "Several links of different rates on a path.", [["R₁ … R_N", "the rate of each link on the path, in bits/s (use R/n for a link shared by n flows)"]]],
    ["time = F / throughput", "Time to transfer a whole file at the end-to-end throughput.", "A file size is given after a throughput question. Convert MB to Mbit (× 8) first.", [["F", "file size, in bits"], ["throughput", "end-to-end throughput (the bottleneck rate), in bits/s"]]],
    ["users = R / r", "How many users circuit switching can admit: each gets r reserved, whether active or not.", "Circuit switching capacity.", [["R", "link rate, in bits/s"], ["r", "rate each user needs while active"]]],
    ["P(X > k) = 1 − Σᵢ₌₀ᵏ C(N, i) · pⁱ · (1 − p)^(N − i)", "Probability that more than k of N packet-switching users are active at once, which is when queues build and packets can be lost.", "Comparing packet switching with circuit switching (k = the circuit-switching user count).", [["N", "number of users sharing the link"], ["k", "most users the link can serve at once (R / r)"], ["i", "number of active users, summed from 0 to k"], ["C(N, i)", "binomial coefficient: ways to choose i active users out of N"], ["p", "probability that one user is active"], ["1 − p", "probability that one user is idle"]]],
    ["average active = N · p", "Expected number of users active at the same time.", "Showing why packet switching copes: usually far fewer than k are active.", [["N", "number of users"], ["p", "probability that one user is active"]]],
    ["R · d_prop", "Bandwidth-delay product: the maximum number of bits on the link at once.", "Asked how many bits are “in flight” on a link.", [["R", "link rate, in bits/s"], ["d_prop", "propagation delay of the link, in seconds"]]],
  ],
  traps: [
    "Mixing bits and bytes: a 1,500-byte packet is 12,000 bits. Network rates use powers of 10 (1 Mbps = 10⁶ bit/s).",
    "Swapping transmission and propagation delay. Ask: does it depend on the packet size (transmission) or on the distance (propagation)?",
    "Forgetting that store-and-forward pays the full L/R again on <i>every</i> link.",
    "Adding or averaging link rates for throughput. It is the minimum.",
    "Saying a router implements the transport layer. Routers stop at the network layer; link-layer switches stop at the link layer.",
    "Unit slips: km vs m, ms vs s. Write units in every step.",
    "Confusing forwarding (one router, local, fast) with routing (whole network, global).",
    "Misreading traceroute: each RTT is a round trip and includes queuing, so RTTs need not grow hop by hop, and * means no reply, not that the path is broken.",
  ],
},
notes: [
{id: "internet", title: "What is the Internet?", ref: "§1.1 · pp. 1–9",
 gist: "It can be described in two ways: by the hardware and software it is built from, and by the services it provides to applications.",
 body: `<p><b>Nuts-and-bolts view.</b> The Internet connects billions of computing devices called <b>hosts</b> or <b>end systems</b>. They are joined by <b>communication links</b> (copper wire, coaxial cable, optical fibre, radio) and <b>packet switches</b>. The two main kinds of packet switch are <b>routers</b>, mostly used in the network core, and <b>link-layer switches</b>, mostly used in access networks. A link's <b>transmission rate</b> is measured in bits per second.</p>
 <p>A sending host splits its data into chunks and adds a <b>header</b> to each one, producing <b>packets</b>. The header carries protocol information, and the protocol in use decides what goes in it. The sequence of links and switches a packet crosses is its <b>route</b> or <b>path</b>. Hosts reach the Internet through <b>ISPs</b> (Internet Service Providers): residential, university, company and mobile providers. Each ISP is itself a network of switches and links, and smaller ISPs connect to larger national and international ones.</p>
 <p>Everything is controlled by <b>protocols</b>. The two most important are <b>TCP</b> (Transmission Control Protocol) and <b>IP</b> (Internet Protocol), together called TCP/IP. Internet standards are developed by the IETF and published as <b>RFCs</b> (Requests for Comments).</p>
 <p><b>Services view.</b> The Internet is infrastructure that serves <b>distributed applications</b>: programs running on several end systems that exchange data, such as the Web, video streaming, email and games. These programs run only on end systems, never inside routers. Programs use a <b>socket interface</b> to ask the Internet to deliver data to a program on another host, much like the postal service has rules for how to address a letter.</p>
 <div class="callout"><b>What is a protocol?</b> A protocol defines the <b>format</b> and the <b>order</b> of messages exchanged between two or more communicating entities, and the <b>actions</b> taken when a message is sent or received. Compare asking a stranger for the time: you say “hi”, wait for “hi” back, then ask. If the reply is “leave me alone”, you act differently. Network protocols work the same way, only between machines.</div>`},
{id: "edge", title: "The network edge", ref: "§1.2 · pp. 9–21",
 gist: "End systems, and the access networks that connect them to their first router (the edge router).",
 body: `<p>End systems are called <b>hosts</b> because they host, that is run, network applications. A host can be a <b>client</b> that requests a service (a laptop or phone) or a <b>server</b> that provides one (a powerful machine that stores and sends web pages, video and email, usually in a large <b>data centre</b>). The <b>access network</b> is what physically connects a host to its first router, the edge router.</p>
 <p><b>Sending data.</b> The host breaks application data into packets of <b>L bits</b> and transmits them into the access network at the link's <b>transmission rate R</b> (bits/s), so pushing out one packet takes L/R seconds. R depends on the access technology: wired Ethernet can run at gigabits per second, while a cellular link may give only a few megabits per second.</p>
 <ul>
 <li><b>DSL</b> reuses the telephone line to the phone company's local office, where a <b>DSLAM</b> separates data from phone calls. Downstream data, upstream data and the phone call use separate frequency bands on the same wire. Download is faster than upload, and rates fall with distance from the office.</li>
 <li><b>Cable</b> reuses the cable-TV network: fibre to the neighbourhood, then coaxial cable to each home (<b>hybrid fibre-coax, HFC</b>). A cable modem talks to the <b>CMTS</b> at the cable company, following the DOCSIS standard. Cable is a <b>shared broadcast medium</b>: every home on a segment receives every downstream packet, and neighbours share the upstream channel, so speeds drop when many people are busy.</li>
 <li><b>Fibre to the home (FTTH)</b> brings optical fibre all the way. In a passive optical network (PON), one fibre from the provider is split between many homes, each with an optical network terminator (ONT).</li>
 <li><b>5G fixed wireless</b> beams data from a base station to a modem in the home.</li>
 <li><b>Company and home networks</b> use <b>Ethernet</b> (twisted-pair copper to a switch) and <b>Wi-Fi</b> (IEEE 802.11) access points.</li>
 <li><b>Wide-area wireless</b> (4G, 5G) connects phones through cellular base stations kilometres away.</li>
 </ul>
 <p><b>Physical media.</b> <i>Guided</i> media carry signals in a solid medium: twisted-pair copper, coaxial cable and optical fibre. Fibre supports very high rates, loses little signal over long distances and is immune to electromagnetic interference. <i>Unguided</i> media carry signals through the air: terrestrial radio and satellites. A geostationary satellite sits 36,000 km up, which adds about 280 ms of propagation delay. The cost of the actual cable is usually small compared to the labour of installing it.</p>`},
{id: "core", title: "The network core", ref: "§1.3 · pp. 22–34",
 gist: "Packet switching sends packets through shared links on demand. Circuit switching reserves a path in advance.",
 body: `<p><b>Packet switching</b> is the technological basis of the Internet; the traditional telephone network was built on <b>circuit switching</b> instead (below). Hosts send packets, and the routers of the core pass them along, link by link, towards the destination.</p>
 <p><b>Store-and-forward.</b> A router must receive the <i>entire</i> packet before it starts sending it on the next link. Sending one packet of L bits over N links of rate R therefore takes N·L/R (ignoring propagation). With many packets the links work in parallel, like a pipeline: P packets need (N + P − 1)·L/R. The model below shows this.</p>
 <p><b>Queues and loss.</b> Each router output link has an <b>output buffer</b>. If a packet arrives while the link is busy, it waits there (<b>queuing delay</b>). If the buffer is full, the packet is dropped (<b>packet loss</b>).</p>
 <p><b>The two key functions of the core.</b></p>
 <ul>
 <li><b>Forwarding</b> (also called <b>switching</b>) is a <i>local</i> action inside one router: move an arriving packet from its input link to the right output link. Each router has a <b>forwarding table</b> that maps destination addresses (or parts of them) to output links.</li>
 <li><b>Routing</b> is a <i>global</i> action: work out the source-to-destination paths that packets take. <b>Routing algorithms and protocols</b> compute these paths and fill in the forwarding tables automatically.</li>
 </ul>
 <p>Think of a driver who asks for directions at every junction (forwarding) instead of carrying a map of the whole trip (routing).</p>
 <p><b>Circuit switching</b>, used by the traditional telephone network, reserves resources (buffer space and link rate) along the whole path for the duration of a call. The sender gets a guaranteed constant rate. A link is divided between circuits by <b>FDM</b> (each circuit gets its own frequency band) or <b>TDM</b> (time is divided into frames, and each circuit gets one slot in every frame). Reserved capacity is wasted whenever a user is silent.</p>
 <div class="callout ex"><b>Worked example.</b> A 1 Mbps link is shared by users who each need 100 kbps while active and are active 10% of the time. Circuit switching fits 1 Mbps ÷ 100 kbps = <b>10 users</b>. With packet switching and <b>35 users</b>, the chance that more than 10 are active at the same moment is only about 0.0004. So packet switching serves three and a half times as many users with almost the same performance. This is <b>statistical multiplexing</b>.</div>
 <p><b>A network of networks.</b> Access ISPs buy connectivity from <b>regional ISPs</b>, which buy from <b>tier-1 ISPs</b> with global reach (for example Level 3, AT&amp;T, Sprint, NTT). The customer pays the provider. ISPs connect to providers at <b>points of presence (PoPs)</b>, may connect to several providers at once (<b>multi-homing</b>), and exchange traffic directly with ISPs at the same level without payment (<b>peering</b>), often at an <b>Internet exchange point (IXP)</b>. Large <b>content providers</b> such as Google run their own global networks and peer directly with lower-tier ISPs, bypassing the upper tiers.</p>`,
 widget: widgetPipeline},
{id: "delay", title: "Delay, loss and throughput", ref: "§1.4 · pp. 35–46",
 gist: "Every hop adds four kinds of delay; the slowest link on the path caps the throughput.",
 body: `<div class="tblwrap"><table><thead><tr><th>Delay</th><th>What happens</th><th>Depends on</th><th>Typical size</th></tr></thead><tbody>
 <tr><td>Processing</td><td>Router reads the header, checks for bit errors, picks the output link</td><td>Router speed</td><td>Microseconds</td></tr>
 <tr><td>Queuing</td><td>Packet waits for packets ahead of it</td><td>Congestion at that moment</td><td>Zero to milliseconds</td></tr>
 <tr><td>Transmission</td><td>All bits are pushed onto the link: <code>L/R</code></td><td>Packet length L, link rate R</td><td>Microseconds to milliseconds</td></tr>
 <tr><td>Propagation</td><td>One bit travels the length of the link: <code>d/s</code></td><td>Distance d, signal speed s</td><td>Milliseconds on long links</td></tr>
 </tbody></table></div>
 <div class="callout"><b>Car caravan analogy.</b> Ten cars travel together. Toll booths are 100 km apart, each booth takes 12 s per car, and cars drive at 100 km/h. Getting the whole caravan through a booth takes 10 × 12 = 120 s: that is <i>transmission</i> (cars are bits, the booth is the link). Driving 100 km to the next booth takes 1 hour: that is <i>propagation</i>. The caravan reaches the next booth after 62 minutes.</div>
 <p><b>Queuing and loss.</b> If packets of L bits arrive at an average rate of a packets per second on a link of rate R, the <b>traffic intensity</b> is La/R. Above 1, bits arrive faster than they can leave, so the queue grows until packets are dropped. Below 1, delay depends on how bursty arrivals are, and it climbs very steeply as La/R approaches 1. Because buffers are finite, a growing share of packets are lost as intensity rises.</p>
 <p><b>End-to-end delay.</b> With N links of equal rate and no queuing, the total is N(d_proc + d_trans + d_prop).</p>
 <p><b>Measuring real paths with traceroute.</b> Traceroute sends <b>three probe packets</b> to the first router on the path, then three to the second, and so on to the destination. Each router sends a reply to every probe, and traceroute prints the <b>round-trip time (RTT)</b> of each of the three. An RTT includes all four kinds of delay, in both directions, on every link up to that router.</p>
 <pre class="msg"> 5  core1.example.net (192.0.2.1)    11.2 ms  10.9 ms  11.4 ms
 6  core2.example.net (198.51.100.7) 24.8 ms  25.3 ms  24.9 ms
 7  * * *
 8  edge.example.org (203.0.113.9)   23.7 ms  24.1 ms  24.0 ms</pre>
 <ul>
 <li>A <b>*</b> means no reply came back for that probe: the probe or the reply was lost, or the router does not answer probes. No RTT can be measured, but later hops can still reply, as hop 8 does above.</li>
 <li>A later hop can show a <i>smaller</i> RTT than an earlier one (hop 8 vs hop 6), because queuing delay changes from moment to moment.</li>
 <li>A big jump between two hops usually means a long link, such as a transatlantic cable.</li>
 </ul>
 <p><b>Throughput</b> is the rate (bits/s) at which the receiver actually gets data, either at one instant or on average (file size ÷ transfer time). On a path, it is the rate of the slowest link: the <b>bottleneck</b>. Think of water flowing through a series of pipes: the flow is limited by the thinnest pipe, however wide the others are. Core links are usually over-provisioned, so the bottleneck is typically an access link. A core link shared by n flows gives each about R/n.</p>`},
{id: "layers", title: "Protocol layers and encapsulation", ref: "§1.5 · pp. 47–54",
 gist: "Five layers, each providing a service to the layer above it and adding its own header.",
 body: `<p>Layering splits a complicated system into parts that each do one job. Each layer offers a <b>service</b> to the layer above, and builds it using the services of the layer below plus its own actions. Compare air travel: ticket purchase, baggage check, gates, runway and flight routing are separate steps, and each one can change without affecting the others. The main benefit is <b>modularity</b>: as long as a layer keeps offering the same service through the same interface, its implementation can change and the change stays local to that layer. Note that layering does not by itself make delivery reliable; that is a service a particular layer (for example TCP) chooses to provide. The downsides are that layers can duplicate work (for example error checking at several layers) and that a layer sometimes needs information that only another layer has.</p>
 <div class="tblwrap"><table><thead><tr><th>Layer</th><th>Job</th><th>Example protocols</th><th>Data unit</th><th>Runs in</th></tr></thead><tbody>
 <tr><td>Application</td><td>Network applications and their protocols</td><td>HTTP, SMTP, DNS</td><td>Message</td><td>End systems</td></tr>
 <tr><td>Transport</td><td>Carries messages between processes</td><td>TCP, UDP</td><td>Segment</td><td>End systems</td></tr>
 <tr><td>Network</td><td>Moves datagrams from host to host, across routers</td><td>IP, routing protocols</td><td>Datagram</td><td>Hosts and routers</td></tr>
 <tr><td>Link</td><td>Moves frames across one link to the next node</td><td>Ethernet, Wi-Fi, DOCSIS</td><td>Frame</td><td>Hosts, routers, switches</td></tr>
 <tr><td>Physical</td><td>Moves individual bits over the medium</td><td>Depends on the medium</td><td>Bits</td><td>Everywhere</td></tr>
 </tbody></table></div>
 <p>The older <b>OSI model</b> has seven layers. It adds a <b>presentation</b> layer (data interpretation, compression, encryption) and a <b>session</b> layer (synchronisation and checkpointing). The Internet leaves those tasks to the application if it needs them.</p>
 <p><b>Encapsulation.</b> Going down the stack, each layer wraps what it gets from above in its own header: the message M becomes a segment (H<sub>t</sub> + M), then a datagram (H<sub>n</sub> + H<sub>t</sub> + M), then a frame (H<sub>l</sub> + H<sub>n</sub> + H<sub>t</sub> + M). Each layer's unit has <i>header fields</i> and a <i>payload</i>, the unit from the layer above. The receiver's matching layers read and remove the headers in reverse order. Routers and link-layer switches only unwrap as far as they need to: switches up to the link layer, routers up to the network layer.</p>`},
{id: "security", title: "Networks under attack", ref: "§1.6 · pp. 54–58",
 gist: "The Internet was designed for users who trusted each other; attacks exploit that.",
 body: `<ul>
 <li><b>Malware</b> gets onto a device over the Internet and can delete files, spy on the user, or recruit the device into a <b>botnet</b>: a network of compromised machines under an attacker's control. A <i>virus</i> needs the user to do something (such as open an attachment); a <i>worm</i> spreads without user action. Most malware is self-replicating.</li>
 <li><b>Denial of service (DoS)</b> makes a network, host or service unusable. There are three kinds: a <i>vulnerability attack</i> sends a few crafted messages that crash a buggy service; <i>bandwidth flooding</i> sends so much traffic that the target's access link clogs; <i>connection flooding</i> opens so many half-open or full TCP connections that the target stops accepting real ones. A <b>distributed DoS (DDoS)</b> uses many sources, usually a botnet, so it is much harder to detect and block.</li>
 <li><b>Packet sniffing</b>: a passive receiver records a copy of every packet that passes by. It is easy on wireless and other broadcast media and hard to detect because it sends nothing. The defence is encryption.</li>
 <li><b>IP spoofing</b>: putting a false source address in a packet so it seems to come from someone else. The defence is <b>end-point authentication</b>: checking that a message really comes from where it claims to.</li>
 </ul>
 <p><b>Why is the Internet so exposed?</b> It was originally built for “a group of mutually trusting users attached to a transparent network”. Security was not consciously a design criterion, so nothing in the original design checked who sent what. Protection has been added on top ever since, at several layers.</p>
 <p><b>Matching defences to threats.</b></p>
 <div class="tblwrap"><table><thead><tr><th>Threat</th><th>Defence</th><th>How it helps</th></tr></thead><tbody>
 <tr><td>Packet sniffing (reading data)</td><td><b>Encryption</b></td><td>Keeps contents confidential: a sniffer only sees scrambled data.</td></tr>
 <tr><td>IP spoofing, impersonation</td><td><b>Authentication</b></td><td>Makes the other side prove who it is.</td></tr>
 <tr><td>Tampering with data in transit</td><td><b>Integrity checks</b>, <b>digital signatures</b></td><td>Detect that a message was changed.</td></tr>
 <tr><td>Unauthorised use of resources</td><td><b>Access control</b></td><td>Defines who may take which actions, after they have proved their identity.</td></tr>
 <tr><td>DoS floods, malware, unwanted traffic</td><td><b>Firewalls</b>, intrusion detection</td><td>Filter traffic and detect or stop attacks before they reach hosts.</td></tr>
 </tbody></table></div>`},
],
glossary: [
  ["Host / end system", "A device at the edge of the network that runs applications: a laptop, phone, server or IoT device."],
  ["Access network", "The network that physically connects an end system to its first (edge) router: DSL, cable, FTTH, Wi-Fi, cellular."],
  ["ISP", "Internet Service Provider: a network of switches and links that sells Internet access. ISPs are organised in tiers."],
  ["Packet", "A chunk of data with a header added, the unit that packet switches forward."],
  ["Router", "A packet switch that forwards packets using network-layer (IP) addresses; implements layers 1–3."],
  ["Link-layer switch", "A packet switch that forwards frames using link-layer (MAC) addresses; implements layers 1–2."],
  ["Store-and-forward", "A switch receives the whole packet before it starts sending it on the next link."],
  ["Forwarding (switching)", "A router's local action of moving an arriving packet from its input link to the right output link."],
  ["Routing", "The network-wide (global) task of determining the paths packets take from source to destination."],
  ["Forwarding table", "A router's table mapping destination addresses to output links."],
  ["Routing protocol", "A protocol that routers use to compute and fill in their forwarding tables automatically."],
  ["Circuit switching", "Reserving a fixed rate on every link of a path for the whole session, as in the telephone network."],
  ["FDM / TDM", "Ways to divide a link between circuits: by frequency band (FDM) or by time slot within each frame (TDM)."],
  ["Statistical multiplexing", "Sharing a link on demand, relying on users rarely being active all at once."],
  ["Tier-1 ISP", "An ISP at the top of the hierarchy with global reach, which has no provider of its own."],
  ["Peering", "Two ISPs at the same level connecting directly and exchanging traffic without paying each other."],
  ["IXP", "Internet exchange point: a meeting place where many ISPs peer with each other."],
  ["PoP", "Point of presence: a group of routers in a provider's network where customer ISPs connect."],
  ["Content-provider network", "A private network run by a large content company (such as Google) that connects its data centres and peers with ISPs directly."],
  ["Processing delay", "Time for a router to examine a packet's header and decide where it goes."],
  ["Queuing delay", "Time a packet waits in a buffer for the link to become free."],
  ["Transmission delay", "Time to push all of a packet's bits onto the link: L/R."],
  ["Propagation delay", "Time for one bit to travel the length of a link: d/s."],
  ["Traffic intensity", "La/R: the ratio of the rate bits arrive at a link to the rate it can send them."],
  ["Throughput", "The rate at which a receiver actually gets data, in bits/s."],
  ["Bottleneck link", "The slowest link on a path, which limits end-to-end throughput."],
  ["Traceroute", "A program that sends three probes to each router on a path and prints the round-trip time of each reply."],
  ["RTT", "Round-trip time: from sending a packet until its reply arrives."],
  ["Protocol", "Rules for the format and order of messages, and the actions taken on sending or receiving them."],
  ["Service model", "What a layer promises to the layer above it."],
  ["Encapsulation", "Each layer wrapping the data from the layer above in its own header."],
  ["Message, segment, datagram, frame", "The data unit at the application, transport, network and link layers."],
  ["RFC", "Request for Comments: the documents that define Internet standards, published by the IETF."],
  ["Botnet", "A network of compromised devices controlled by an attacker."],
  ["DDoS", "Distributed denial of service: flooding a target from many sources at once."],
  ["Packet sniffer", "A passive receiver that records a copy of every packet it can see."],
  ["IP spoofing", "Sending packets with a forged source IP address."],
  ["Encryption", "Scrambling data so only the intended receiver can read it; the defence against sniffing."],
  ["Authentication", "Proving who you are; the defence against spoofing and impersonation."],
  ["Integrity check / digital signature", "Lets the receiver detect that a message was changed in transit."],
  ["Access control", "Rules for who may take which actions on network resources."],
  ["Firewall", "A device or program that filters traffic to block unwanted or malicious packets."],
],
};
