// Reading-first material for security module 4: summary, study notes and key terms.
import { widgetKDC } from "../../../secwidgets.js";

export default {
summary: {
  big: `<p>Before a system can protect anything, it has to know who it is dealing with. <b>Identification</b> claims an identity, <b>authentication</b> proves it, and <b>authorisation</b> decides what that identity may do. Users authenticate with something they know, have, are or do; combining categories (<b>MFA</b>) or replacing passwords with device-held private keys (<b>passwordless</b>) closes the gaps that passwords leave.</p>
  <p>In a network of many nodes, pairwise keys don't scale, so authentication relies on <b>trusted intermediaries</b>: <b>certificate authorities</b> vouch for public keys, and <b>key distribution centres</b> share one key with each node and hand out session keys. Protocols built on them, like <b>Needham–Schroeder</b> (Quiz 3) and <b>Kerberos</b>, must use nonces or timestamps so old messages can't be replayed.</p>
  <p>The Internet's protocols were built for trusted networks, so each layer has attacks: jamming at the physical layer, <b>ARP and DHCP spoofing</b> on the LAN, <b>BGP hijacking</b> in routing, <b>SYN floods</b> and <b>RST injection</b> against TCP. Cryptographic protocols add protection at the network layer (<b>IPsec</b>) or just above TCP (<b>SSL/TLS</b>), whose handshake Quiz 4 asks you to read in a Wireshark capture.</p>`,
  takeaways: [
    "<b>Identification</b> (who are you?), <b>authentication</b> (prove it), <b>authorisation</b> (what may you do?). Apply <b>least privilege</b>.",
    "Four means of authentication: something you <b>know</b>, <b>have</b>, <b>are</b> (static biometrics), <b>do</b> (dynamic biometrics). <b>2FA/MFA</b> combines different categories.",
    "Password threats: offline dictionary attacks on stolen hash files, popular passwords, workstation hijacking, reused passwords, electronic monitoring. Defend with <b>salted, slow hashes</b> and good policy.",
    "SMS/OTP 2FA can be relayed by a man in the middle; <b>passwordless</b> login signs a server nonce with a device private key unlocked by PIN or biometrics.",
    "<b>CAs</b> (public keys; today an oligarchy trusted by browsers) and <b>KDCs</b> (symmetric master key per node, always online, physically secure) are the two kinds of trusted intermediary.",
    "In KDC protocols, a <b>nonce</b> proves freshness to whoever chose it. Needham–Schroeder gives Y no freshness for the ticket, so a compromised old K can be replayed; <b>timestamps</b> fix it.",
    "<b>Kerberos</b>: the <b>AS</b> authenticates the user and issues a <b>TGT</b> (encrypted with the TGS key); the <b>TGS</b> issues <b>service tickets</b> (encrypted with the service's key) holding a session key.",
    "Link layer: <b>ARP poisoning</b> (no authentication) and <b>DHCP starvation/spoofing</b> (defence: DHCP snooping, port limits, rate limits). Network layer: <b>BGP hijacking</b>.",
    "Transport layer: <b>SYN flooding</b> exhausts half-open state (defence: <b>SYN cookies</b>); <b>RST attacks</b> forge resets matching addresses, ports and sequence number; UDP enables <b>reflection-amplification</b>.",
    "<b>IPsec</b>: AH and ESP, <b>transport</b> mode (host to host) and <b>tunnel</b> mode (gateway to gateway); one-way <b>SAs</b> found by SPI; keys by manual keying or <b>IKE</b>.",
    "<b>SSL/TLS</b>: Record Protocol under Handshake, Change Cipher Spec, Alert and Heartbeat. Run: ClientHello; ServerHello + certificate + ServerHelloDone; ClientKeyExchange + CCS + Finished; CCS + Finished. Record header: type (22 handshake, 20 CCS, 23 data), version, length.",
  ],
  formulas: [
    ["N = c<sup>L</sup>,&nbsp; t<sub>max</sub> = N / r,&nbsp; t<sub>avg</sub> = N / 2r", "Size of a password space and the time to search it.", "Password-strength calculations.",
      [["c", "number of possible characters"], ["L", "password length"], ["r", "guesses per second"]]],
    ["next Seq = Seq + Len", "TCP numbers bytes, so the next segment's sequence number adds the payload length.", "Quiz 4 question c.",
      [["Seq", "sequence number of this segment"], ["Len", "TCP payload length in bytes"]]],
    ["record = type (1) ‖ version (2) ‖ length (2) ‖ fragment", "SSL/TLS record header: 5 bytes. Types: 20 Change Cipher Spec, 21 Alert, 22 Handshake, 23 Application Data.", "Reading records in a hex dump.",
      [["version", "0x0300 for SSL 3.0, 0x0301 for TLS 1.0"], ["length", "bytes in the fragment that follows"]]],
    ["handshake = type (1) ‖ length (3) ‖ body", "Handshake message header inside a record. Types: 1 ClientHello, 2 ServerHello, 11 Certificate, 14 ServerHelloDone, 16 ClientKeyExchange, 20 Finished.", "Finding the encrypted pre-master secret (Quiz 4 question f).",
      [["0x10", "16 = ClientKeyExchange"]]],
    ["pairwise keys = n(n − 1)/2,&nbsp; KDC keys = n", "Keys needed for n nodes without and with a key distribution centre.", "Explaining why trusted intermediaries scale.",
      [["n", "number of nodes"]]],
  ],
  traps: [
    "Calling two passwords two-factor authentication: both are something you know.",
    "Confusing message authentication (the message is unchanged and from the claimed sender) with user authentication (the user is who they claim).",
    "Thinking a nonce proves anything to the party that didn't choose it: R<sub>X</sub> gives freshness to X, not to Y.",
    "Saying the Kerberos user can read the TGT: it is encrypted with the TGS's key; the user only forwards it.",
    "Counting the 5-byte record header as part of the record's length field, or forgetting it when adding up the TCP payload.",
    "Saying the master secret is sent in ClientKeyExchange: it carries the <b>pre-master</b> secret, encrypted with the server's public key.",
    "Thinking the client is authenticated in a normal HTTPS handshake: only the server is, unless a client certificate is requested.",
    "Thinking an IPsec SA covers both directions: it is one-way.",
  ],
},
notes: [
{id: "iaa", title: "Identification, authentication and authorisation", ref: "§3.1 · pp. 86–92 · Lecture 7",
 gist: "Claim an identity, prove it, then get exactly the access that identity is allowed.",
 body: `<ul>
 <li><b>Identification</b>: the user presents a claimed identity (user ID, username) to a PC, a printer or a remote service. <i>Who are you?</i></li>
 <li><b>Authentication</b>: the system establishes that the claim is valid. <i>Prove it!</i> This is <b>user</b> authentication, which is different from <b>message</b> authentication (the content is authentic and unmodified, Module 1).</li>
 <li><b>Authorisation</b>: which resources the user may access and what they may do with them, following the principle of <b>least privilege</b> (only the minimum access needed, which reduces the attack surface and the impact of a compromise).</li>
 </ul>
 <p>A <b>digital identity</b> is broader than a username: organisational attributes (department, roles, working hours), entitlements (resources and allowed actions) and individual features (fingerprints, height). It lives in an access database that must be audited, kept up to date and carefully monitored.</p>`},
{id: "factors", title: "Means of authentication", ref: "§3.1–3.4 · pp. 86–114",
 gist: "Something you know, have, are or do. Each has its own failure modes, so strong systems combine them.",
 body: `<ol>
 <li><b>Something you know</b>: password, PIN, answers to prearranged questions.</li>
 <li><b>Something you possess</b> (token): electronic keycards, smart cards, physical keys.</li>
 <li><b>Something you are</b> (static biometrics): fingerprint, retina, face.</li>
 <li><b>Something you do</b> (dynamic biometrics): voice pattern, handwriting, typing rhythm.</li>
 </ol>
 <p>(The lecture slide's labels for items 2 and 3 are swapped; the book's order above is the standard one.)</p>
 <p>Knowledge can be guessed or stolen, tokens can be lost or cloned, biometrics give false matches and non-matches and can't be changed once leaked. The book's §3.3 covers memory and smart cards (including one-time password generators), and §3.4 biometric accuracy and the trade-off between false match and false non-match rates.</p>`},
{id: "passwords", title: "Passwords and their vulnerabilities", ref: "§3.2 · pp. 92–104",
 gist: "Still the most common method, and attacked offline, by guessing, by watching and by reuse. Store salted, slow hashes.",
 body: `<p>Virtually all multi-user systems, network servers and websites ask for a username and password and compare the password with a stored value for that ID.</p>
 <p><b>Vulnerabilities</b> (book and lecture):</p>
 <ul>
 <li><b>Offline dictionary attack</b>: steal the password file and compare hashes of likely passwords. Defend by protecting the file, detecting intrusion, and forcing password changes after a compromise.</li>
 <li><b>Specific-account attack</b> and <b>popular-password attack</b>: guess for one account, or try common passwords across many accounts. Lock out after failed attempts; forbid common passwords.</li>
 <li><b>Workstation hijacking</b>: use a logged-in, unattended machine. Automatic logout.</li>
 <li><b>Exploiting user mistakes</b> (written-down passwords, social engineering) and <b>multiple password use</b> (one leak opens many systems).</li>
 <li><b>Electronic monitoring</b>: sniffing passwords sent over a network; encryption alone doesn't stop replay.</li>
 </ul>
 <p><b>Hashed passwords</b>: store hash(salt ‖ password) with the salt. The salt stops identical passwords looking identical, makes precomputed dictionaries useless (a 12-bit salt means 4096 versions of each), and makes it hard to tell whether one person used the same password on two systems. Modern schemes (bcrypt, many rounds of SHA-512 in Linux) are deliberately slow, which lowers the attacker's guessing rate. Password crackers use dictionaries, rules and GPUs; policy should push towards long passphrases and use proactive checking against weak choices.</p>`},
{id: "mfa", title: "Multi-factor and passwordless authentication", ref: "Lecture 7 · §3.5",
 gist: "Two different factors stop a stolen password being enough. Passwordless login goes further: no shared secret is ever sent.",
 body: `<p><b>Two-factor authentication</b> needs factors from <b>two different categories</b>, e.g. a password plus a token or a biometric. More independent factors make a stronger system, and a stolen password alone no longer gets in. A separate channel (SMS, a phone call) often carries the second factor.</p>
 <p><b>The MITM problem</b>: a fake server that imitates the real one can collect the password, forward it, receive the real server's request for a one-time code, ask the user for it, and forward that too. The attacker ends up with a live session for transactions.</p>
 <p><b>Passwordless authentication</b> (e.g. Microsoft Entra ID with an authenticator app):</p>
 <ol>
 <li>The user starts login with just a user ID.</li>
 <li>The cloud service looks up the user's registered public key and device, and generates a <b>nonce</b>.</li>
 <li>It pushes the nonce to the authenticator app (proof of presence).</li>
 <li>The app prompts the user, who approves with a <b>PIN or biometric</b>; that unlocks the device's private key.</li>
 <li>The app signs the nonce with the private key and returns the response.</li>
 <li>The service verifies it with the registered public key and tells the device that login succeeded.</li>
 </ol>
 <p>The private key is created at registration and never leaves the device; only the public key is stored by the service. No shared secret is ever typed or sent, so there is nothing reusable for a phishing site to relay.</p>
 <p><b>Remote authentication</b> in general (book §3.5) uses <b>challenge–response</b> with a random nonce, so that a captured response is useless later.</p>`},
{id: "multiparty", title: "Multi-party authentication and certificate authorities", ref: "Lecture 7 · §23.3 · pp. 716–719",
 gist: "Pairwise keys don't scale. Trusted intermediaries do: CAs certify public keys, KDCs distribute symmetric keys.",
 body: `<p>With n nodes that all authenticate each other directly, each node needs n − 1 keys (n(n − 1)/2 in total), all distributed securely. A shared printer would need a key with every user. The fix is a <b>trusted intermediary</b>:</p>
 <ul>
 <li><b>Public-key systems (PKI)</b>: a <b>certificate authority</b>, a public place for certificates, a trusted global entity, and users who know the CA's public key to check certificates.</li>
 <li><b>Secret-key systems</b>: a <b>key distribution centre</b> (next section).</li>
 </ul>
 <p><b>CA models</b>: a <b>monopoly</b> (one globally trusted CA) is the ideal but doesn't exist; today's model is an <b>oligarchy</b>: several competing CAs, with a list of trusted ones built into each browser, which is responsible for checking them.</p>
 <p><b>General scheme</b>: Alice sends Bob (say, a bank's site) a nonce. Bob replies with his certificate and the nonce encrypted with his private key. Alice checks the certificate with the CA's public key, extracts Bob's public key and decrypts the nonce. If it matches, she is talking to the live holder of Bob's private key.</p>
 <p>The book's <b>PKI</b> section (X.509, PKIX) lists the problems: users relying on a huge list of root CAs, revocation (CRLs, OCSP), and certificates issued in error.</p>`},
{id: "kdc", title: "Key distribution centres and the Quiz 3 protocol", ref: "Lecture 7",
 gist: "The KDC shares one key with each node and creates session keys. Each nonce proves freshness only to the party that chose it.",
 body: `<p>A <b>KDC</b> is a node (or hierarchy) inside the organisation's network that relies on <b>symmetric keys only</b>. It must be physically secure and always online. Every node gets one <b>master key</b> shared with the KDC when it registers, and the KDC grants <b>session keys</b> for communication between nodes.</p>
 <p><b>The Quiz 3 protocol</b> is the Needham–Schroeder symmetric-key protocol (1978):</p>
 <pre class="msg">(1) X → A : X, Y, R<sub>X</sub>
(2) A → X : E<sub>X</sub>(R<sub>X</sub>, Y, K, E<sub>Y</sub>(K, X))
(3) X → Y : E<sub>Y</sub>(K, X)
(4) Y → X : E<sub>K</sub>(R<sub>Y</sub>)
(5) X → Y : E<sub>K</sub>(R<sub>Y</sub> − 1)</pre>
 <ul>
 <li><b>Message 1</b> is sent in the clear: X asks for a key to talk to Y, with a fresh nonce R<sub>X</sub>.</li>
 <li><b>Message 2</b> can only come from A (only A and X know X's key). R<sub>X</sub> shows it answers <i>this</i> request; Y's name shows the key is for Y (an attacker couldn't change the request to name someone else). It carries the new session key K and a <b>ticket</b> E<sub>Y</sub>(K, X) that X can't read.</li>
 <li><b>Message 3</b>: X forwards the ticket. Y learns K and that A issued it for X.</li>
 <li><b>Messages 4–5</b>: Y's own nonce, returned as R<sub>Y</sub> − 1 (so it can't just be echoed), proves that someone holding K is live now.</li>
 </ul>
 <p><b>The weakness</b>: Y gets no proof that the <i>ticket</i> is fresh. If an attacker once learned an old session key K, they can replay the matching old message 3, decrypt message 4 with K and answer it, and Y accepts them as X (Denning and Sacco, 1981). <b>Fix</b>: put a timestamp in the ticket so Y rejects old ones (as Kerberos does), or let Y supply a nonce that A includes in the ticket.</p>
 <p>Step through a normal run and the replay below.</p>`,
 widget: widgetKDC},
{id: "kerberos", title: "Kerberos", ref: "§23.1 · pp. 707–713 · Lecture 7",
 gist: "A KDC split in two: the authentication server logs you in once and gives you a TGT; the ticket-granting server turns it into service tickets.",
 body: `<p>Kerberos is the de facto standard for remote authentication on a network: a trusted third-party service that clients and servers both trust to mediate their mutual authentication. Its KDC has two parts:</p>
 <ul>
 <li><b>Authentication server (AS)</b>: handles the initial login. It verifies the user against the KDC database and issues a <b>ticket-granting ticket</b>.</li>
 <li><b>Ticket-granting server (TGS)</b>: receives the TGT and a service request, and issues a <b>service ticket</b> for the requested resource.</li>
 </ul>
 <p><b>Keys</b>: the KDC shares a master key with every user and service (derived from the password or randomly generated), and the AS and TGS share the <b>TGS principal key</b>.</p>
 <ul>
 <li><code>TGT = K<sub>TGS</sub>(“A”, S<sub>A</sub>, TS, T, …)</code>: user A's name, the A–TGS session key, the timestamp of the login and the validity period (typically 10 hours).</li>
 <li><code>Ticket<sub>B</sub> = K<sub>B</sub>(“A”, K<sub>AB</sub>, …)</code>: encrypted with service B's master key, which only B and the KDC know.</li>
 </ul>
 <p><b>The flow</b> (user A and a printer):</p>
 <ol>
 <li>A sends its username to the AS.</li>
 <li>The AS returns the A–TGS session key encrypted with A's master key, K<sub>A</sub>(K<sub>A,TGS</sub>, …), and the TGT. A can't open the TGT; it carries the session key to the TGS, which didn't create it.</li>
 <li>A sends the TGS a request for the printer, encrypted with K<sub>A,TGS</sub>, plus the TGT. The TGS opens the TGT to get the session key and decrypts the request.</li>
 <li>The TGS returns a new A–printer session key encrypted with K<sub>A,TGS</sub>, and a ticket with the same key encrypted with the key it shares with the printer.</li>
 <li>A sends the ticket to the printer, which decrypts it to get the A–printer key.</li>
 <li>The printer confirms with a message encrypted under that session key.</li>
 </ol>
 <p><b>Realms</b>: each realm has its own Kerberos server. Servers in different realms share a secret key and are registered with each other, so a user first gets a ticket for the remote TGS from the local one, then a service ticket from the remote TGS.</p>`},
{id: "stack", title: "The protocol stack and where attacks happen", ref: "Lecture 8",
 gist: "The Internet joins independent networks with TCP/IP. Each layer serves the one above, and each has its own weaknesses.",
 body: `<p>The Internet is a set of interconnected, independent networks using the TCP/IP suite. <b>Routers</b> forward datagrams between networks; a <b>gateway</b> is the exit from a local network, and the <b>default gateway</b> receives all traffic for addresses outside the local subnet.</p>
 <p>Networks are modelled as layers, each providing services to the one above: <b>application</b> (HTTP, SMTP, FTP), <b>transport</b> (TCP, UDP: process to process), <b>network</b> (IP and routing: host to host), <b>link</b> (Ethernet, PPP: between neighbours) and <b>physical</b> (bits on the wire). Sending <b>encapsulates</b> the message in a segment, datagram and frame, each adding its header; receiving strips them in reverse.</p>
 <p>The lecture walks up the stack asking, at each layer, what can go wrong. Summary:</p>
 <div class="tblwrap"><table><thead><tr><th>Layer</th><th>Attacks</th><th>Countermeasures</th></tr></thead><tbody>
 <tr><td>Physical</td><td>jamming, relay attacks, side channels</td><td>spread spectrum, shielding, distance bounding</td></tr>
 <tr><td>Link</td><td>ARP poisoning, DHCP starvation and spoofing</td><td>DHCP snooping, port limits, ARP monitoring</td></tr>
 <tr><td>Network</td><td>BGP hijacking, IP spoofing</td><td>route filtering, IPsec</td></tr>
 <tr><td>Transport</td><td>SYN flooding, RST injection, UDP reflection-amplification</td><td>SYN cookies, random ISNs, rate limits, TLS</td></tr>
 </tbody></table></div>`},
{id: "lowlayers", title: "Physical and link-layer attacks", ref: "Lecture 8",
 gist: "Radio can be jammed or relayed. ARP and DHCP trust everyone on the LAN, so anyone there can redirect traffic.",
 body: `<p><b>Physical layer</b>: bits travel as electromagnetic signals over guided media (twisted pair, coax, fibre) or unguided ones (radio). Noise, malicious or not, causes bit errors, and at a given noise level a higher data rate means more errors. <b>Spread spectrum</b> protects against narrowband interference, fading and tapping. Attacks: <b>jamming</b>, <b>relay attacks</b> (forwarding signals, e.g. to unlock a car from far away) and <b>side-channel attacks</b> (timing, power, emissions).</p>
 <p><b>Link layer</b>: medium access control shares the channel (channel partitioning by time, frequency or code; random access; taking turns) and gives each interface a (factory-set) MAC address.</p>
 <ul>
 <li><b>DHCP</b> hands out IP addresses with Discover, Offer, Request, Acknowledge (DORA). <b>Starvation</b>: flood the server with fake Discovers from spoofed MAC addresses until the pool is empty (a DoS). <b>Spoofing</b>: a rogue DHCP server gives clients a fake gateway or DNS server, enabling MITM. Defence for both: <b>DHCP snooping</b>, limiting MAC addresses per switch port, and rate-limiting requests.</li>
 <li><b>ARP</b> maps IP addresses to MAC addresses by broadcasting a question; it has <b>no authentication</b>, by design, for trusted LANs. <b>ARP poisoning</b> sends fake replies associating the attacker's MAC with a victim's IP, so traffic flows to the attacker, who can read, change, drop or block it. Defence: audit and protect ARP tables, monitor for unusual traffic.</li>
 </ul>`},
{id: "network", title: "Network layer and routing attacks", ref: "Lecture 8",
 gist: "IP forwards on destination addresses that nothing authenticates, and BGP trusts what neighbouring networks announce.",
 body: `<p>Bridging LANs doesn't scale to the whole world, so the Internet uses a <b>connectionless network layer</b>: every interface has an IP address, and routers forward packets on the destination address. IP is the common denominator of the “hourglass”.</p>
 <p>An IPv4 address is 32 bits (e.g. 192.168.32.2), split into a <b>prefix</b> (the subnetwork, used for routing with longest-prefix match) and a host part. Within a subnet, hosts talk directly; between subnets, routers forward. The IP header carries version, length, TTL, protocol, checksum and source and destination addresses; with TCP, every packet has at least 40 bytes of headers.</p>
 <p><b>Routing</b>: link-state (Dijkstra; OSPF, IS-IS), distance-vector (Bellman-Ford; RIP) and policy-based (BGP between networks).</p>
 <p><b>BGP hijacking</b>: an attacker announces false reachability for someone else's prefixes, rerouting traffic away from its legitimate path, to block whole domains or intercept them. In February 2022, attackers hijacked prefixes of a South Korean cryptocurrency platform, obtained a certificate for its domain and served malicious JavaScript, stealing $1.9 million.</p>`},
{id: "ipsec", title: "IPsec", ref: "§22.5 · pp. 698–703 · Lecture 8",
 gist: "Security for every IP datagram, transparent to applications: AH or ESP, in transport or tunnel mode, governed by one-way security associations.",
 body: `<p>IPsec provides security at the network layer, so <b>all IP datagrams</b> are covered and applications need no changes (RFCs 4301–4309). It was mandatory in IPv6 and is optional in IPv4.</p>
 <ul>
 <li><b>AH</b> (Authentication Header): integrity and data-origin authentication.</li>
 <li><b>ESP</b> (Encapsulating Security Payload): confidentiality, optionally with authentication.</li>
 </ul>
 <p><b>Transport mode</b>: host-to-host security; IPsec-aware endpoints protect the payload, and the original header stays. <b>Tunnel mode</b>: the whole datagram plus security fields becomes the payload of a new outer datagram, processed by <b>security gateways</b> (a firewall or router) on behalf of hosts that needn't be IPsec-aware. Gateway to gateway, not end to end; the inner addresses are hidden from routers in between.</p>
 <p><b>Security association (SA)</b>: a <b>one-way</b> relationship between sender and receiver saying how to process its traffic. SAs are held in the <b>SA database (SAD)</b> and identified by <b>SPI</b>, source and destination address. Each holds the sequence-number counter and anti-replay window, the AH/ESP algorithms, keys, IVs and lifetimes, the SA lifetime and the mode.</p>
 <p><b>Key management</b>: IPsec needs many keys (one per SA, and a separate SA for each combination of protocol, mode and direction). <b>Manual keying</b> works for a few nodes; <b>IKE</b> (Internet Key Exchange) automates it.</p>`},
{id: "transport", title: "TCP and UDP attacks", ref: "Lecture 8 · Lab 4",
 gist: "TCP trusts anything that matches its addresses, ports and sequence numbers, and keeps state for half-open connections. UDP has no handshake at all.",
 body: `<p>The transport layer runs in end systems only and makes network services available to programs. <b>UDP</b> offers little more than a programming interface. <b>TCP</b> delivers a byte stream in order and without loss (ARQ for error recovery, credit-based flow control, congestion control). Segments are limited by the <b>MSS</b> (536 bytes by default), and sequence numbers count <b>bytes</b>, not packets. A connection begins by synchronising sequence numbers (SYN), starting from a random <b>initial sequence number</b>.</p>
 <ul>
 <li><b>SYN flooding</b>: send many SYNs (often from spoofed addresses) and never complete the handshake, so the server's table of half-open connections fills up and real clients are refused. <b>SYN cookies</b>: the server keeps no state, but encodes the connection parameters (including the MSS) in its initial sequence number; only a client whose ACK returns the right value gets a connection.</li>
 <li><b>RST attack</b>: a forged reset that matches an active connection's IP addresses, ports and an acceptable sequence number tears it down. Random ISNs and encryption below TCP (IPsec) make this much harder for attackers who can't see the traffic.</li>
 <li><b>Session hijacking</b>: injecting forged data into an existing connection, under the same conditions.</li>
 <li><b>UDP reflection-amplification</b>: send small requests with the victim's spoofed address to servers whose replies are much larger (DNS, NTP), flooding the victim.</li>
 </ul>
 <p>Lab 4 explores these in the SEED VM's isolated container network.</p>`},
{id: "ssl", title: "SSL/TLS", ref: "§22.3 · pp. 690–697 · Lecture 8",
 gist: "A thin layer between TCP and the application. The handshake authenticates the server and agrees fresh keys; the record protocol encrypts and MACs everything.",
 body: `<p><b>Versions</b>: SSL v1 was never released, v2 was flawed (and is disabled), v3 was widely used until POODLE. All SSL versions are replaced by <b>TLS</b>: TLS 1.0 ≈ SSL 3.0, TLS 1.2 in RFC 5246 (2008), open source in OpenSSL. HTTPS (with the browser lock) is HTTP over TLS, used for e-commerce: customers browse anonymously and the channel protects card details at checkout.</p>
 <p><b>Architecture</b>: the <b>Record Protocol</b> fragments, (optionally) compresses, MACs and encrypts data into records, giving <b>confidentiality</b> and <b>message integrity</b>. Above it run the <b>Handshake Protocol</b> (negotiate parameters, exchange certificates, create keys), <b>Change Cipher Spec</b> (one message: switch to the negotiated keys), <b>Alert</b> (warning or fatal errors), <b>Heartbeat</b> (liveness checks; the <b>Heartbleed</b> bug was in OpenSSL's implementation, not the protocol) and application data such as HTTP.</p>
 <p><b>Session vs connection</b>: a <b>session</b> is created by the handshake and holds the algorithms, master secret and certificates; it can carry several <b>connections</b>, each with its own nonces, MAC and encryption keys, IVs and sequence numbers derived from the master secret, so the expensive handshake isn't repeated.</p>
 <p><b>Handshake goals</b>: authenticate the participants (the server nearly always, the client rarely), establish a fresh shared secret, and negotiate the cipher suite securely.</p>
 <ol>
 <li><b>M1 ClientHello</b>: version (3.1 for TLS 1.0), client nonce (28 random bytes + 4 bytes of time), list of cipher suites such as TLS_RSA_WITH_3DES_EDE_CBC_SHA.</li>
 <li><b>M2 ServerHello, Certificate, ServerHelloDone</b>: version, server nonce, session ID, the chosen suite, and the certificate chain so the client can validate the server's public key up to a trusted root. (An optional CertificateRequest would ask for client authentication.)</li>
 <li><b>M3 ClientKeyExchange, ChangeCipherSpec, Finished</b>: the <b>pre-master secret encrypted with the server's public key</b>; the switch to the new suite; and a MAC over all handshake messages so far, keyed with the master secret.</li>
 <li><b>M4 ChangeCipherSpec, Finished</b>: the server's switch and its MAC over all messages. It can only compute this if it decrypted the pre-master secret.</li>
 </ol>
 <p>So: the client is <b>not</b> authenticated in this run; an adversary can't learn the pre-master secret without the server's private key; and the server <b>is</b> authenticated, because its Finished MAC depends on the pre-master secret. The book's four attack categories are attacks on the handshake protocol, on the record and application data protocols, on the PKI, and others (such as DoS).</p>`},
{id: "capture", title: "Reading an SSL capture (Quiz 4)", ref: "Kurose & Ross P19 · Lecture 8",
 gist: "Records start with type, version and length; handshake messages with type and a 3-byte length. Count bytes carefully.",
 body: `<p>Quiz 4 shows a Wireshark capture filtered on <code>ssl</code>: packets 106 Client Hello, 108 Server Hello, 111 Certificate + Server Hello Done, 112 Client Key Exchange + Change Cipher Spec + Encrypted Handshake Message, 113 Change Cipher Spec + Encrypted Handshake Message, 114 Application Data. Packet 112 is expanded and its bytes shown.</p>
 <p><b>How to read packet 112</b>:</p>
 <ul>
 <li><b>Direction</b>: source is the client, destination port 443 (https) is the server.</li>
 <li><b>Next sequence number</b>: TCP's Seq plus Len (in the quiz, 79 + 204 = 283).</li>
 <li><b>Records</b>: each starts with a 5-byte header: content type (<code>16</code> = 22 handshake, <code>14</code> = 20 change cipher spec, <code>17</code> = 23 application data), version (<code>03 00</code> = SSL 3.0) and a 2-byte length. Packet 112 has <b>three</b> records: 5 + 132, 5 + 1 and 5 + 56 bytes = 204.</li>
 <li><b>Encrypted (pre-)master secret</b>: inside the first record, the handshake header is type <code>10</code> (16, ClientKeyExchange) and a 3-byte length <code>00 00 80</code> (128). The next 128 bytes are the pre-master secret encrypted with the server's RSA public key. The packet contains the <b>encrypted</b> secret, never the master secret itself.</li>
 <li><b>First and last byte</b>: the byte right after <code>10 00 00 80</code>, and the byte just before the next record's <code>14 03 00 00 01 01</code>.</li>
 <li><b>Finished messages</b> (the “encrypted handshake messages”): counting the records before each, the client's covers 6 (106, 108, two in 111, and the CKE and CCS in 112) and the server's 8 (adding the client's Finished and the server's own CCS). Strictly, the MAC covers only handshake messages, so if a question counts those, it is 5 and 6.</li>
 </ul>
 <p>The Practice tab generates captures like this one with fresh addresses, sequence numbers and bytes.</p>`},
],
glossary: [
  ["Identification", "Presenting a claimed identity, such as a username."],
  ["Authentication", "Establishing that a claimed identity is valid."],
  ["Authorisation", "Deciding which resources an authenticated identity may use and how."],
  ["Least privilege", "Grant only the minimum access needed."],
  ["Authentication factors", "Something you know, possess, are (static biometrics) or do (dynamic biometrics)."],
  ["Two-factor / multi-factor authentication", "Combining factors from different categories."],
  ["Passwordless authentication", "Login by signing a server nonce with a device-held private key unlocked by PIN or biometrics."],
  ["Offline dictionary attack", "Guessing passwords against a stolen hash file."],
  ["Challenge–response", "Proving knowledge of a secret by transforming a fresh nonce."],
  ["Certificate authority (CA)", "Trusted entity that signs certificates binding public keys to identities."],
  ["PKI", "Public-key infrastructure: CAs, certificates, repositories and revocation."],
  ["Key distribution centre (KDC)", "Trusted node sharing a master key with each node and issuing session keys."],
  ["Master key / session key", "Long-term key shared with the KDC / short-lived key for one conversation."],
  ["Needham–Schroeder protocol", "The 1978 KDC protocol in Quiz 3; vulnerable to replay of old tickets."],
  ["Replay attack", "Resending a captured valid message to repeat its effect."],
  ["Kerberos", "Trusted third-party authentication service with an AS, a TGS and tickets."],
  ["Ticket-granting ticket (TGT)", "Ticket from the AS, encrypted with the TGS key, used to get service tickets."],
  ["Service ticket", "Ticket encrypted with a service's key, carrying the client–service session key."],
  ["Realm", "One Kerberos domain; realms can trust each other through shared keys."],
  ["ARP poisoning", "Fake ARP replies mapping the attacker's MAC to a victim's IP."],
  ["DHCP starvation / spoofing", "Exhausting the address pool / a rogue server handing out bad settings."],
  ["BGP hijacking", "False route announcements that redirect traffic for someone else's prefixes."],
  ["SYN flooding / SYN cookies", "Filling the half-open connection table / stateless defence encoding state in the ISN."],
  ["RST attack", "Forged TCP reset that tears down a connection."],
  ["Reflection-amplification", "Spoofed small UDP requests that trigger large replies to the victim."],
  ["IPsec AH / ESP", "Authentication Header (integrity, origin) / Encapsulating Security Payload (confidentiality)."],
  ["Transport / tunnel mode", "IPsec protecting the payload host to host / the whole datagram between gateways."],
  ["Security association (SA)", "One-way IPsec relationship, identified by SPI, source and destination."],
  ["IKE", "Internet Key Exchange: sets up IPsec SAs and keys."],
  ["SSL / TLS", "Secure Sockets Layer and its successor Transport Layer Security, between TCP and the application."],
  ["Record Protocol", "TLS layer that fragments, MACs and encrypts data into records."],
  ["Change Cipher Spec", "One-message protocol: switch to the newly negotiated keys."],
  ["Pre-master secret", "Value the client sends encrypted with the server's public key; the master secret is derived from it."],
  ["Finished message", "MAC over all handshake messages, keyed with the master secret."],
  ["Heartbleed", "2014 OpenSSL bug in the Heartbeat extension that leaked server memory."],
],
};
