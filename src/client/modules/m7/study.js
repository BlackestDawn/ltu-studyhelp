// Reading-first material for module 7: summary, study notes and key terms.
import { widgetCDMA, widgetMobility } from "../../widgets.js";

export default {
summary: {
  big: `<p>This module asks two separate questions. First: <b>what changes when the link is wireless?</b> Radio signals weaken with distance (<b>path loss</b>), suffer <b>interference</b>, and arrive as several reflected copies (<b>multipath</b>), so bit errors are far more common and vary from moment to moment. Devices adapt their transmission rate to the <b>signal-to-noise ratio</b>, and because senders can't always hear each other (<b>hidden terminals</b>), sharing the medium is harder than on Ethernet.</p>
  <p><b>Wi-Fi (802.11)</b> handles this with access points, association, link-layer ACKs and <b>CSMA/CA</b>, which avoids collisions instead of detecting them, optionally reserving the channel with RTS/CTS. <b>4G/5G cellular networks</b> connect devices through base stations to an all-IP core (MME, HSS, S-GW, P-GW) that tunnels each device's traffic to the Internet.</p>
  <p>Second: <b>what changes when the device moves?</b> A device that changes its point of attachment needs the network to find it and keep its connections alive. With a <b>home network</b> that always knows where the device is, traffic can reach it by <b>indirect routing</b> (via the home network, at the cost of <b>triangle routing</b>) or <b>direct routing</b>. 4G/5G and Mobile IP both use <b>tunnelling</b>, and <b>handover</b> moves a device between base stations. Finally, TCP mistakes wireless and handover losses for congestion, which hurts performance.</p>`,
  takeaways: [
    "Elements of a wireless network: wireless hosts, wireless links, <b>base stations</b> (APs, cell towers) and network infrastructure. Hosts work in <b>infrastructure</b> mode or <b>ad hoc</b>; moving between base stations is <b>handover</b>.",
    "Wireless links suffer <b>path loss</b>, <b>interference</b> and <b>multipath propagation</b>, giving higher, time-varying bit error rates than wired links.",
    "Higher <b>SNR</b> → lower <b>BER</b> for a given modulation; at a given SNR, faster modulations have higher BER. <b>Rate adaptation</b> picks the fastest rate the current SNR allows.",
    "<b>Hidden terminals</b> (and fading) mean two senders may collide at a receiver without hearing each other.",
    "<b>CDMA</b> gives each sender its own code; with orthogonal codes, receivers can separate simultaneous senders.",
    "<b>802.11</b>: an AP and its stations form a BSS, named by an SSID; hosts scan (beacons or probes), associate, maybe authenticate, then use DHCP.",
    "Wi-Fi uses <b>CSMA/CA</b>, not CSMA/CD: listen, wait DIFS, count down a random backoff only while idle, send the whole frame, wait for an <b>ACK</b>. <b>RTS/CTS</b> optionally reserves the channel against hidden terminals.",
    "An 802.11 frame has up to <b>four addresses</b>: receiver, transmitter, router interface (and one for AP-to-AP forwarding).",
    "<b>4G LTE</b>: device (IMSI on a SIM), base station (eNode-B), MME and HSS (control plane), S-GW (mobility anchor) and P-GW (Internet gateway, NAT), with <b>GTP tunnels</b> for user data. 5G adds millimetre-wave bands and a virtualised core.",
    "<b>Wireless ≠ mobility.</b> Mobility management keeps a moving device reachable: home and visited networks, <b>permanent</b> vs <b>care-of</b> addresses, <b>indirect</b> (triangle routing) or <b>direct</b> routing.",
    "4G handover moves the S-GW tunnel to the target base station; Mobile IP uses home and foreign agents, agent discovery and registration.",
    "TCP treats every loss as congestion, so wireless errors and handover losses shrink its window needlessly. Fixes: local recovery, sender awareness, split connections.",
  ],
  formulas: [
    ["SNR(dB) = 20 · log₁₀( A<sub>signal</sub> / A<sub>noise</sub> )", "Signal-to-noise ratio in decibels, as the book defines it from amplitudes.", "Converting an amplitude ratio to dB.",
      [["A<sub>signal</sub>", "amplitude of the received signal"], ["A<sub>noise</sub>", "amplitude of the background noise"], ["20 dB", "an amplitude ratio of 10; every factor of 10 adds 20 dB"]]],
    ["choose the fastest modulation with SNR ≥ its minimum", "Rate adaptation: the minimum is the lowest SNR at which that modulation meets the BER target.", "Picking a transmission rate from an SNR.",
      [["SNR", "current signal-to-noise ratio"], ["BER target", "acceptable bit error rate, e.g. 10⁻⁷"]]],
    ["Z<sub>i,m</sub> = d<sub>i</sub> · c<sub>m</sub>", "CDMA encoding: the sender's output in mini-slot m of bit slot i.", "Working out what a CDMA sender transmits.",
      [["d<sub>i</sub>", "data bit i, as +1 or −1"], ["c<sub>m</sub>", "chip m of the sender's code (+1 or −1)"], ["m", "1 … M, the mini-slots per bit (8 in the book)"]]],
    ["Z*<sub>i,m</sub> = Σ<sub>s</sub> Z<sup>s</sup><sub>i,m</sub>", "The channel adds what all senders transmit in the same mini-slot.", "Two or more simultaneous CDMA senders.",
      [["s", "each sender"], ["Z<sup>s</sup><sub>i,m</sub>", "sender s's output in that mini-slot"]]],
    ["d<sub>i</sub> = (1/M) · Σ<sub>m</sub> Z*<sub>i,m</sub> · c<sub>m</sub>", "CDMA decoding with the wanted sender's code. If the codes are orthogonal, the other senders' terms sum to zero.", "Recovering a bit at a receiver.",
      [["M", "code length (chips per bit)"], ["Z*<sub>i,m</sub>", "received (summed) value in mini-slot m"], ["c<sub>m</sub>", "the wanted sender's code"]]],
    ["orthogonal codes: Σ<sub>m</sub> c¹<sub>m</sub> · c²<sub>m</sub> = 0", "The condition that lets receivers separate senders.", "Checking whether two codes can share a channel.",
      [["c¹, c²", "two senders' codes"]]],
  ],
  traps: [
    "Treating “wireless” and “mobile” as the same thing: a wireless device can be stationary.",
    "Mixing up the link effects: path loss is weakening, interference is other sources, multipath is reflected copies.",
    "Thinking higher SNR allows any modulation: each modulation needs its own minimum SNR for the BER target.",
    "Saying Wi-Fi uses CSMA/CD: it uses CSMA/CA with ACKs, because collisions can't be reliably detected.",
    "Thinking the CSMA/CA backoff counter runs while the channel is busy: it freezes.",
    "Thinking RTS/CTS is always used: only for frames above a threshold, if at all.",
    "Mixing up address 1 (receiver) and address 2 (transmitter) in an 802.11 frame.",
    "Confusing the 4G elements: HSS = subscriber database, MME = control (authentication, tunnels), S-GW = mobility anchor on the data path, P-GW = Internet gateway with NAT.",
    "Saying the correspondent uses the care-of address in indirect routing: it uses the permanent address; the home network tunnels to the care-of address.",
    "Thinking TCP can tell a wireless loss from congestion: it can't, so it slows down anyway.",
  ],
},
notes: [
{id: "intro", title: "Elements of a wireless network", ref: "§7.1 · pp. 532–536",
 gist: "Wireless hosts reach the network through wireless links and base stations, and two separate challenges appear: the wireless link itself, and mobility.",
 body: `<p><b>The pieces:</b></p>
 <ul>
 <li><b>Wireless hosts</b>: phones, laptops, IoT devices running applications. They may or may not move.</li>
 <li><b>Wireless links</b>: connect a host to a base station or to another host. Technologies differ in rate and range.</li>
 <li><b>Base stations</b>: send and receive on behalf of the hosts <b>associated</b> with them (within range, and using that base station to relay data), and often coordinate their transmissions. Examples are Wi-Fi <b>access points</b> and cellular cell towers. They have no direct counterpart in a wired network.</li>
 <li><b>Network infrastructure</b>: the larger network the base station connects to.</li>
 </ul>
 <p>Hosts associated with a base station work in <b>infrastructure mode</b>: the base station provides services such as address assignment and routing. In an <b>ad hoc</b> network there is no infrastructure, so the hosts provide those services themselves. When a mobile host moves out of one base station's range into another's, it changes association: <b>handover</b> (or handoff).</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>With infrastructure</th><th>Without infrastructure</th></tr></thead><tbody>
 <tr><td>Single hop</td><td>Host ↔ base station ↔ wired network (Wi-Fi, 4G/5G)</td><td>Hosts talk directly, e.g. Bluetooth, ad hoc 802.11</td></tr>
 <tr><td>Multiple hops</td><td>Wireless nodes relay to reach a base station (some mesh and sensor networks)</td><td>Nodes relay for each other: mobile ad hoc networks (MANETs), vehicular (VANETs)</td></tr>
 </tbody></table></div>
 <div class="callout"><b>Wireless vs mobility.</b> <b>Wireless</b> is about communicating over a wireless link: weak, noisy, shared signals. <b>Mobility</b> is about a device that changes its point of attachment while communication may continue: finding it, routing to its current location, handing it over. A device can be wireless and stationary; for each mechanism in this module, ask which problem it solves.</div>`},
{id: "links", title: "Wireless link characteristics", ref: "§7.2 · pp. 536–539",
 gist: "Radio signals weaken, suffer interference and arrive as reflections, so bit errors are common and changing, and senders can't always hear each other.",
 body: `<p>Wireless links differ from wired ones in several ways:</p>
 <ul>
 <li><b>Decreasing signal strength</b> (<b>path loss</b>): radio signals attenuate through matter such as walls, and disperse with distance even in free space.</li>
 <li><b>Interference</b> from other sources in the same band (for example 2.4 GHz cordless phones, other Wi-Fi networks) and from electromagnetic noise (motors, microwave ovens).</li>
 <li><b>Multipath propagation</b>: parts of the wave reflect off objects and the ground, take paths of different lengths, and arrive at different times, blurring the signal. Moving objects make it change over time.</li>
 </ul>
 <p>So bit errors are much more common than on a wired link, which is why wireless links use strong error detection and link-level ACKs and retransmission.</p>
 <p><b>SNR and BER.</b> The receiver sees the signal plus background noise. The <b>signal-to-noise ratio (SNR)</b> compares them; in decibels, <code>SNR = 20 · log₁₀(signal amplitude / noise amplitude)</code>. The <b>bit error rate (BER)</b> is roughly the probability that a bit arrives wrong. Three rules follow:</p>
 <ul>
 <li>For a given modulation, <b>higher SNR → lower BER</b>. A sender can raise SNR by transmitting with more power, but that costs battery energy and interferes more with others, and beyond some point there's little gain.</li>
 <li>For a given SNR, a <b>faster modulation → higher BER</b>. At 10 dB, BPSK (1 Mbps) has a BER below 10⁻⁷ but QAM16 (4 Mbps) has 10⁻¹; at 20 dB, QAM16 reaches 10⁻⁷.</li>
 <li>So devices use <b>rate adaptation</b>: as SNR changes (with mobility or the environment), they switch to the fastest modulation that still meets the BER target. Wi-Fi and 4G/5G both do this.</li>
 </ul>
 <p><b>Hidden terminals and fading.</b> On a wired broadcast link every node hears every other. Wirelessly, A and C may both be sending to B but be unable to hear each other, because of an obstacle between them (the <b>hidden terminal problem</b>) or because their signals have faded too much by the time they reach each other, while still being strong enough to collide at B. This makes wireless multiple access much harder.</p>`},
{id: "cdma", title: "CDMA", ref: "§7.2.1 · pp. 539–542",
 gist: "Code division multiple access lets several senders share the same frequency at the same time, by giving each one its own code.",
 body: `<p>CDMA is a <b>channel-partitioning</b> protocol: instead of slots or frequency bands, each sender gets its own <b>code</b>. Each data bit's time is split into M mini-slots (chips), and the code is a sequence of M values, each +1 or −1. A data bit is written as +1 (for 1) or −1 (for 0).</p>
 <ul>
 <li><b>Encoding:</b> in mini-slot m, the sender transmits <code>Z<sub>m</sub> = d · c<sub>m</sub></code>: the bit multiplied by that chip of its code. The code changes much faster than the data (the <b>chipping rate</b>).</li>
 <li><b>Decoding</b> with no other senders: <code>d = (1/M) · Σ Z<sub>m</sub> · c<sub>m</sub></code>. Multiplying by the code again gives d · c<sub>m</sub>² = d in every mini-slot.</li>
 <li><b>Several senders:</b> their signals add up in the channel: <code>Z* = Σ Z<sup>s</sup></code>. If the codes are <b>orthogonal</b> (each pair's chips multiply and sum to zero), the receiver applies its sender's code to the sum and every other sender's contribution cancels out, leaving just the wanted bit.</li>
 </ul>
 <p>The model below lets you change codes and bits for two senders. With the book's example code (1, 1, 1, −1, 1, −1, −1, −1) and bit −1, the sender transmits (−1, −1, −1, 1, −1, 1, 1, 1), and the receiver's sum is −8, so −8/8 = −1.</p>`,
 widget: widgetCDMA},
{id: "wifi", title: "802.11 Wi-Fi: architecture and association", ref: "§7.3–7.3.1 · pp. 542–548",
 gist: "An access point and its stations form a basic service set; a host scans for access points, associates with one, and then gets an IP address with DHCP.",
 body: `<p>The IEEE 802.11 family (Wi-Fi) has many generations, all sharing the same frame format and the CSMA/CA access protocol, and all backward compatible:</p>
 <div class="tblwrap"><table><thead><tr><th>Standard</th><th>Year</th><th>Max rate</th><th>Range</th><th>Band</th></tr></thead><tbody>
 <tr><td>802.11b</td><td>1999</td><td>11 Mbps</td><td>30 m</td><td>2.4 GHz</td></tr>
 <tr><td>802.11g</td><td>2003</td><td>54 Mbps</td><td>30 m</td><td>2.4 GHz</td></tr>
 <tr><td>802.11n (Wi-Fi 4)</td><td>2009</td><td>600 Mbps</td><td>70 m</td><td>2.4, 5 GHz</td></tr>
 <tr><td>802.11ac (Wi-Fi 5)</td><td>2013</td><td>3.47 Gbps</td><td>70 m</td><td>5 GHz</td></tr>
 <tr><td>802.11ax (Wi-Fi 6)</td><td>2020</td><td>14 Gbps</td><td>70 m</td><td>2.4, 5 GHz</td></tr>
 </tbody></table></div>
 <p>The 2.4 GHz band is unlicensed and shared with phones and microwave ovens; the 5 GHz band has shorter range and suffers more from multipath. Newer standards use MIMO: several antennas at each end.</p>
 <p><b>Architecture.</b> The building block is the <b>basic service set (BSS)</b>: one <b>access point (AP)</b> plus the wireless stations associated with it. APs connect through switches to a router; each station's adapter has a 6-byte MAC address, like Ethernet. Stations can also form an <b>ad hoc</b> network with no AP.</p>
 <p><b>Channels.</b> When installing an AP, the administrator gives it a <b>Service Set Identifier (SSID)</b> (the network name you see) and a channel. The 2.4 GHz band has 11 partially overlapping channels; two are non-overlapping only if 4 or more apart, so <b>1, 6 and 11</b> is the only non-overlapping set of three.</p>
 <p><b>Association.</b> A host must associate with an AP before it can send data:</p>
 <ul>
 <li><b>Passive scanning:</b> APs periodically send <b>beacon frames</b> with their SSID and MAC address; the host listens on each channel and picks an AP (the standard doesn't say how; often the strongest signal).</li>
 <li><b>Active scanning:</b> the host broadcasts a <b>probe request</b>; APs in range answer with probe responses.</li>
 <li>The host sends an <b>association request</b> and the AP answers with an association response.</li>
 <li>The host may need to <b>authenticate</b>, often through a separate authentication server (using RADIUS or DIAMETER) that serves many APs.</li>
 <li>Then the host usually runs <b>DHCP</b> to get an IP address in the AP's subnet.</li>
 </ul>`},
{id: "csmaca", title: "CSMA/CA, the 802.11 frame and Wi-Fi mobility", ref: "§7.3.2–7.3.6 · pp. 548–563",
 gist: "Wi-Fi avoids collisions instead of detecting them, confirms each frame with an ACK, and can reserve the channel with RTS/CTS.",
 body: `<p><b>Why not CSMA/CD?</b> Detecting collisions needs a radio that sends and receives at the same time, which is costly when your own signal is far stronger than anyone else's at your antenna. And because of hidden terminals and fading, a sender couldn't detect every collision anyway. So 802.11 uses <b>CSMA with collision avoidance (CSMA/CA)</b> and a <b>link-layer acknowledgment</b> scheme. Once a station starts sending a frame, it sends all of it.</p>
 <p><b>Link-layer ACKs.</b> When a frame passes the CRC check, the receiver waits a <b>Short Inter-frame Spacing (SIFS)</b> and sends an ACK. If the sender gets no ACK in time, it retransmits (using CSMA/CA again); after a fixed number of failures it gives up.</p>
 <p><b>CSMA/CA</b>, for a station with a frame to send:</p>
 <ol>
 <li>If the channel is idle, wait a <b>Distributed Inter-frame Space (DIFS)</b>, then send the frame.</li>
 <li>Otherwise, choose a random backoff value (binary exponential backoff) and count it down while the channel is idle after DIFS. While the channel is busy, the counter is <b>frozen</b>.</li>
 <li>When the counter reaches zero (which can only happen while the channel is idle), send the whole frame and wait for the ACK.</li>
 <li>If the ACK arrives and there is another frame, start at step 2. If not, go back to step 2 with a larger backoff range.</li>
 </ol>
 <p>Unlike CSMA/CD, a station doesn't send the moment the channel goes idle: two stations waiting for the same busy channel would then always collide. Random backoff lets one win, and the other hears it and freezes.</p>
 <p><b>RTS/CTS.</b> To protect against hidden terminals, a station can send a short <b>Request to Send (RTS)</b> giving the time it needs. The AP answers with a <b>Clear to Send (CTS)</b>, which every station in the AP's range hears, including ones hidden from the sender, so they stay quiet for that time. Collisions can then only hit the short RTS/CTS frames. Because it adds delay, RTS/CTS is only used for frames longer than an <b>RTS threshold</b>, which by default is often larger than any frame, so in practice it is often off.</p>
 <p><b>The 802.11 frame</b> carries a payload of up to 2,312 bytes (usually an IP datagram under 1,500 bytes), a CRC, sequence numbers (so retransmitted frames can be told apart from new ones), a duration field (for reservations) and <b>four address fields</b>:</p>
 <ul>
 <li><b>Address 1</b>: the MAC of the wireless station that should <b>receive</b> the frame.</li>
 <li><b>Address 2</b>: the MAC of the station that <b>transmits</b> it.</li>
 <li><b>Address 3</b>: the MAC of the <b>router interface</b> the BSS's subnet connects to. The AP uses it to build the Ethernet frame towards the router, with the host as source.</li>
 <li><b>Address 4</b>: used only when APs forward frames to each other in ad hoc mode.</li>
 </ul>
 <p><b>Mobility within one subnet.</b> If a host moves between BSSs in the same IP subnet, it keeps its IP address. Switches self-learn the host's new location; to speed this up, the new AP can send a broadcast Ethernet frame with the host's source address.</p>
 <p><b>Advanced features:</b> <b>rate adaptation</b> (drop to a lower rate after repeated losses, try a higher one after a run of successes); <b>power management</b> (a host tells the AP it is going to sleep, the AP buffers its frames, and the host wakes just before the next beacon, sent about every 100 ms, which lists hosts with waiting frames). <b>Bluetooth</b> (802.15.1) is a short-range, low-power personal area network: a piconet of up to eight active devices, one of which is the controller that polls the others.</p>`},
{id: "cellular", title: "Cellular networks: 4G and 5G", ref: "§7.4 · pp. 563–578",
 gist: "Devices attach to base stations at the edge; an all-IP core authenticates them, tracks them and tunnels their traffic to the Internet.",
 body: `<p>A cellular network divides its area into <b>cells</b>, each with a base station. The 4G LTE architecture follows familiar Internet principles: edge and core, a network of networks, and a clear split between data plane and control plane.</p>
 <div class="tblwrap"><table><thead><tr><th>Element</th><th>Plane</th><th>Role</th></tr></thead><tbody>
 <tr><td>Mobile device (UE)</td><td></td><td>Runs applications; has an IP address (via NAT) and a globally unique 64-bit <b>IMSI</b> on its <b>SIM</b> card, identifying the subscriber and home network</td></tr>
 <tr><td>Base station (<b>eNode-B</b>)</td><td>Both</td><td>Manages radio resources in its cell, coordinates authentication, creates a tunnel for each device, and coordinates with neighbours on interference and handover</td></tr>
 <tr><td>Home Subscriber Server (<b>HSS</b>)</td><td>Control</td><td>Database of subscribers for whom this is the home network, used with the MME for authentication</td></tr>
 <tr><td>Mobility Management Entity (<b>MME</b>)</td><td>Control</td><td>Authenticates devices (with the HSS), sets up their tunnels, tracks where they are (tracking area) and pages idle devices</td></tr>
 <tr><td>Serving Gateway (<b>S-GW</b>)</td><td>Data</td><td>The <b>mobility anchor</b>: all of a device's traffic passes through it</td></tr>
 <tr><td>Packet data network Gateway (<b>P-GW</b>)</td><td>Data</td><td>Gateway to the Internet; gives devices NAT addresses. To the outside it looks like any gateway router, hiding the devices' mobility</td></tr>
 </tbody></table></div>
 <p><b>Tunnels.</b> User datagrams travel between base station, S-GW and P-GW inside <b>GTP</b> (GPRS Tunnelling Protocol) tunnels carried over UDP, each with a tunnel endpoint ID. The MME sets them up when the device attaches.</p>
 <p><b>Radio access.</b> LTE shares the downstream channel with <b>OFDM</b>, a mix of FDM and TDM: each device gets one or more <b>0.5 ms slots</b> on one or more frequencies, as decided by the operator's scheduler. More slots give a higher rate.</p>
 <p><b>Attaching</b> to the network: the device finds a base station's synchronisation signal (broadcast every 5 ms), associates with it, then authenticates mutually with the network (the visited network's MME contacts the device's home HSS), and the MME sets up the data-plane tunnels.</p>
 <p><b>Sleep modes</b> save battery. After several hundred milliseconds of inactivity the device enters “light sleep” (discontinuous reception), waking at times scheduled in advance. After 5 to 10 seconds it enters “deep sleep” (idle): it may move between cells without telling anyone, and periodically wakes to check for <b>paging</b> messages the MME broadcasts through base stations near its last known position.</p>
 <p><b>A network of networks.</b> Operators' networks interconnect, with the public Internet or through an IP Packet eXchange (IPX), so devices can <b>roam</b> on visited networks.</p>
 <p><b>5G</b> aims for roughly 10× higher peak rates, 10× lower latency and 100× more traffic capacity than 4G. 5G New Radio uses two frequency ranges: <b>FR1</b> (450 MHz to 6 GHz) and <b>FR2</b> (24 to 52 GHz, <b>millimetre wave</b>: very fast but short-range and easily blocked, so it needs many small cells). It has three service classes: <b>eMBB</b> (enhanced mobile broadband), <b>URLLC</b> (ultra-reliable low latency, aiming at 1 ms) and <b>mMTC</b> (massive machine-type communication, e.g. IoT). The <b>5G core</b> is built from virtualised software functions with full control- and user-plane separation, and supports network slicing.</p>`},
{id: "mobility", title: "Mobility management: principles", ref: "§7.5 · pp. 578–587",
 gist: "When a device moves to another network, a home network that always knows where it is lets datagrams be forwarded to it, indirectly or directly.",
 body: `<p><b>The mobility spectrum.</b> At one end, a device moves only between sessions (a laptop shut down at home and opened in a café): it simply gets a new address, and the network needs nothing special. At the other end, a device keeps its connections running while it moves between networks (a phone on a call in a car). Mobility management is about the second case.</p>
 <p><b>Home and visited networks.</b> A device has a <b>home network</b>, for example its cellular operator, whose database (the HSS) always knows where it is. Any other network it attaches to is a <b>visited network</b>: it is <b>roaming</b>. The home network gives others a single place to ask where the device is. The device keeps a <b>permanent address</b> from its home network and gets a <b>care-of address</b> in the visited network.</p>
 <p>One rejected idea: let the visited network advertise the device's full address in BGP, so longest-prefix matching routes to it. This needs no new infrastructure, but would never scale to billions of devices.</p>
 <p><b>Indirect routing.</b> The correspondent sends to the device's <b>permanent address</b>, as if it were at home: mobility is invisible to it. The home network's gateway (or home agent) intercepts the datagram and <b>tunnels</b> it (wraps it in a new datagram) to the visited network, which decapsulates it and delivers it. Replies can go straight back to the correspondent or be tunnelled back through the home network. The weakness is <b>triangle routing</b>: traffic to the device always detours via its home network, even when correspondent and device are close together. When the device moves to another visited network, only the home network's record needs updating, so ongoing connections continue transparently.</p>
 <p><b>Direct routing.</b> The correspondent first asks the device's home network for its current location (care-of address), then tunnels straight to the visited network. No triangle routing, but it needs a <b>location protocol</b> between correspondent and home network, and if the device moves again mid-conversation, the first visited network must forward datagrams on, acting as an <b>anchor</b>.</p>
 <p>Step through both approaches in the model below.</p>`,
 widget: widgetMobility},
{id: "practice", title: "Mobility in practice: 4G/5G and Mobile IP", ref: "§7.6 · pp. 587–594",
 gist: "4G uses its home HSS, the visited MME and tunnels to the S-GW; handover just moves the tunnel's end. Mobile IP uses home and foreign agents.",
 body: `<p><b>4G/5G mobility</b> has four steps:</p>
 <ol>
 <li><b>Associating with a base station</b> in the visited network.</li>
 <li><b>Control-plane configuration</b>: the visited network's MME uses the device's IMSI to contact its home HSS, authenticates it, and tells the HSS where the device is.</li>
 <li><b>Data-plane configuration</b>: the MME sets up tunnels between the base station and the visited S-GW, and between the S-GW and the home network's P-GW. 4G uses <b>symmetric indirect routing</b>: all traffic to and from the device goes through its home network. The visited S-GW acts as the mobility anchor.</li>
 <li><b>Handover</b> between base stations, as the device moves.</li>
 </ol>
 <p><b>Handover.</b> Reasons include a stronger signal from another base station, or moving load off a congested cell. The device reports signal strengths, and the current (<b>source</b>) base station decides:</p>
 <ol>
 <li>The source base station picks a <b>target</b> base station and sends it a Handover Request.</li>
 <li>The target checks it has the resources, pre-allocates radio slots, and replies with a Handover Request Acknowledge.</li>
 <li>The source tells the device to switch to the target. From the device's point of view, handover is now done.</li>
 <li>The source stops sending to the device and forwards any tunnelled datagrams it still receives to the target.</li>
 <li>The target tells the MME it now serves the device; the MME has the S-GW move the <b>S-GW-to-base-station tunnel</b> to end at the target.</li>
 <li>The target confirms, and the source releases its resources for the device.</li>
 </ol>
 <p>All of this is local to the visited network: the home network isn't involved.</p>
 <p><b>Mobile IP</b> (RFC 5944, for IPv4) is the Internet's version, though it has seen limited deployment. Its <b>home agent</b> plays a role like the HSS (tracking the device and forwarding datagrams to it), and its <b>foreign agent</b> a role like the visited MME. It defines:</p>
 <ul>
 <li><b>Agent discovery</b>: foreign agents advertise themselves and offer care-of addresses.</li>
 <li><b>Registration</b> of the care-of address with the home agent.</li>
 <li><b>Indirect routing</b> of datagrams by the home agent, tunnelling them to the care-of address.</li>
 </ul>`},
{id: "impact", title: "Impact on higher-layer protocols", ref: "§7.7 · pp. 594–596",
 gist: "The network service stays best effort, but TCP mistakes wireless and handover losses for congestion and slows down for no reason.",
 body: `<p>Logically, the network layer offers the same best-effort service over wireless links, and TCP and UDP work unchanged. But performance can suffer.</p>
 <p>TCP retransmits a segment that is lost or corrupted, whatever the cause. With mobile users, a loss may come from <b>congestion</b>, from <b>bit errors</b> on the wireless link, or from <b>handover</b>. TCP can't tell which, so it always assumes congestion and <b>shrinks its congestion window</b>. Wireless bit errors are far more common than on wired links, so TCP often slows down when the path isn't congested at all.</p>
 <p>Three families of fixes:</p>
 <ul>
 <li><b>Local recovery</b>: fix bit errors where they happen, on the wireless link, with link-layer ARQ (such as 802.11 ACKs) and forward error correction (as in 4G/5G).</li>
 <li><b>TCP sender awareness of wireless links</b>: let the sender distinguish wireless losses from congestion losses, and only react to congestion.</li>
 <li><b>Split connections</b>: split the end-to-end connection at the base station into one connection over the wireless hop and another over the wired path, so wireless problems are handled separately.</li>
 </ul>
 <p>Real-time applications such as video calls are also affected: wireless links usually offer less bandwidth than wired ones, rates vary as conditions change, and handover adds delay and loss.</p>`},
],
glossary: [
  ["Wireless host", "An end system with a wireless link, such as a phone or laptop; it may or may not be mobile."],
  ["Base station", "Sends and receives on behalf of associated wireless hosts and connects them to the network, e.g. an AP or cell tower."],
  ["Infrastructure mode / ad hoc", "Hosts using a base station for network services / hosts providing those services themselves."],
  ["Handover (handoff)", "A mobile device changing the base station it is associated with."],
  ["Wireless links", "Radio links whose signal weakens, suffers interference and arrives via several paths."],
  ["Path loss", "The weakening of a radio signal with distance and through obstacles."],
  ["Interference", "Disturbance from other transmitters in the same band, or from electromagnetic noise."],
  ["Multipath propagation", "Reflected copies of a signal arriving at the receiver at different times."],
  ["SNR", "Signal-to-noise ratio, in dB: 20·log₁₀(signal amplitude / noise amplitude)."],
  ["BER", "Bit error rate: roughly the probability that a bit is received in error."],
  ["Rate adaptation", "Choosing the fastest modulation the current SNR allows within a BER target."],
  ["Hidden terminals", "Senders that can't hear each other but collide at a common receiver."],
  ["Fading", "Signal strength dropping as it travels, which can hide one sender from another."],
  ["CDMA", "Code division multiple access: each sender multiplies its bits by its own ±1 code."],
  ["Orthogonal codes", "Codes whose chip-by-chip products sum to zero, so receivers can separate senders."],
  ["Wi-Fi (802.11)", "The IEEE wireless LAN standards."],
  ["Access point (AP)", "The base station of an 802.11 network."],
  ["BSS", "Basic service set: an access point and its associated stations."],
  ["SSID", "Service Set Identifier: the network name an AP advertises."],
  ["Beacon frame", "Frame an AP sends periodically with its SSID and MAC address."],
  ["Passive / active scanning", "Listening for beacons / broadcasting a probe request to find APs."],
  ["Association", "A host joining an AP's BSS so it can send and receive data through it."],
  ["CSMA/CA", "Carrier sense multiple access with collision avoidance: 802.11's access protocol."],
  ["DIFS / SIFS", "Distributed inter-frame space before sending / short inter-frame space before an ACK."],
  ["RTS / CTS", "Request to send / clear to send: short frames that reserve the channel."],
  ["RTS threshold", "Frame length above which a station uses RTS/CTS."],
  ["4G/5G", "Current generations of cellular networks: LTE and 5G New Radio."],
  ["IMSI / SIM", "International Mobile Subscriber Identity / the card that stores it."],
  ["eNode-B", "4G base station."],
  ["HSS", "Home Subscriber Server: database of the home network's subscribers."],
  ["MME", "Mobility Management Entity: control-plane authentication, tracking and tunnel setup."],
  ["S-GW", "Serving Gateway: the mobility anchor on the data path."],
  ["P-GW", "Packet data network Gateway: gateway to the Internet, provides NAT."],
  ["GTP", "GPRS Tunnelling Protocol: carries user datagrams in tunnels over UDP."],
  ["OFDM", "Orthogonal frequency division multiplexing: LTE's mix of frequency and time slots."],
  ["Paging", "MME messages to find a sleeping device that may have moved between cells."],
  ["Millimetre wave (FR2)", "5G frequencies of 24–52 GHz: very fast but short-range."],
  ["eMBB / URLLC / mMTC", "5G service classes: enhanced mobile broadband / ultra-reliable low latency / massive machine-type communication."],
  ["Mobility", "A device changing its point of attachment while communication may continue."],
  ["Home / visited network", "The network that always knows where a device is / any other network it attaches to (roaming)."],
  ["Permanent / care-of address", "The device's address in its home network / its temporary address in a visited network."],
  ["Correspondent", "The host that wants to communicate with a mobile device."],
  ["Indirect routing", "Correspondent sends to the permanent address; the home network tunnels it on to the device."],
  ["Triangle routing", "Indirect routing's detour through the home network."],
  ["Direct routing", "Correspondent looks up the care-of address and sends straight to the visited network."],
  ["Tunnelling", "Wrapping a datagram inside another one addressed to an intermediate point, which unwraps it."],
  ["Home agent / foreign agent", "Mobile IP's elements in the home and visited networks."],
  ["Mobile IP", "The Internet standard (RFC 5944) for mobility: agent discovery, registration, indirect routing."],
  ["Local recovery / split connection", "Fixing wireless errors on the wireless hop / splitting a TCP connection at the base station."],
],
};
