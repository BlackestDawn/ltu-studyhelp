// Reading-first material for module 2: summary, study notes and key terms.
import { widgetDNS } from "../../widgets.js";

export default {
summary: {
  big: `<p>Network applications are programs that run on <b>end systems</b> and talk to each other over the network. Routers in the core never run application code, which is why new applications can spread so fast. An application is built either as <b>client-server</b> (an always-on server with a fixed address serves many clients) or as <b>peer-to-peer</b> (hosts that come and go serve each other directly).</p>
  <p>Processes send and receive messages through <b>sockets</b> and are addressed by <b>IP address + port number</b>. The application picks a transport: <b>TCP</b> for reliable, in-order delivery, or <b>UDP</b> for a minimal, no-frills service.</p>
  <p>The chapter then works through the protocols behind everyday applications: <b>HTTP</b> for the Web (request/response, persistent connections, cookies, caching, HTTP/2 and HTTP/3), <b>SMTP and IMAP</b> for email, <b>DNS</b> as the Internet's distributed directory, <b>BitTorrent</b> for peer-to-peer file sharing, and <b>DASH with CDNs</b> for video. It ends with writing simple UDP and TCP programs using sockets.</p>`,
  takeaways: [
    "<b>Client-server</b>: an always-on server with a permanent address. <b>P2P</b>: peers connect directly and add capacity as they join (self-scaling).",
    "A process is addressed by <b>IP address + port</b>. The socket is the door between the application and the transport layer.",
    "Choose <b>TCP</b> for reliability (Web, email, file transfer) and <b>UDP</b> for low overhead and control over timing. Neither guarantees throughput or delay.",
    "<b>HTTP</b> is stateless request/response over TCP port 80. Non-persistent: 2 RTT per object. Persistent: the connection stays open for several objects.",
    "<b>Cookies</b> add state on top of HTTP. <b>Web caches</b> cut delay and access-link load; the conditional GET (<code>If-Modified-Since</code> → <code>304</code>) keeps them fresh.",
    "Email: <b>SMTP pushes</b> mail from sender to the sender's server and then to the receiver's server. <b>IMAP or HTTP pulls</b> it to the reader.",
    "<b>DNS</b> maps names to addresses through a hierarchy of root, TLD and authoritative servers, plus local servers and caching. It runs over UDP port 53.",
    "P2P distribution time grows much more slowly with N than client-server, because each peer also uploads.",
    "<b>DASH</b> lets the client choose the bitrate of each chunk. <b>CDNs</b> place copies near users and redirect requests through DNS.",
  ],
  formulas: [
    ["2·RTT + L/R", "Non-persistent HTTP, per object: one RTT for the TCP handshake, one for request and response, plus the file's transmission time.", "Timing problems with a new TCP connection per object.", [["RTT", "round-trip time between client and server"], ["L", "size of the object, in bits"], ["R", "rate of the link it is sent over, in bits/s (often negligible)"]]],
    ["≈ 1 RTT per object", "Persistent HTTP after the first object. With pipelining, all remaining requests share about one RTT.", "Connection stays open.", [["RTT", "round-trip time between client and server"]]],
    ["non-persistent, serial: base + M · 2·RTT₀", "Total time when each of the M referenced objects needs its own new TCP connection, one after another.", "Page-load problems; base = DNS time + 2·RTT₀ for the base HTML file.", [["base", "time to get the base HTML: Σ RTT_DNS + 2·RTT₀"], ["M", "number of objects referenced by the base file"], ["RTT₀", "round-trip time between your host and the web server"]]],
    ["non-persistent, parallel: base + ⌈M / P⌉ · 2·RTT₀", "With P parallel connections the objects are fetched in ⌈M/P⌉ rounds, each costing 2 RTT₀.", "Browser opens several connections at once.", [["base", "time to get the base HTML"], ["M", "number of referenced objects"], ["P", "number of parallel connections"], ["⌈ ⌉", "round up"], ["RTT₀", "round-trip time to the web server"]]],
    ["persistent, pipelined: base + RTT₀", "The connection stays open and all M requests go back-to-back, so they share one round trip.", "Persistent HTTP with pipelining.", [["base", "time to get the base HTML"], ["RTT₀", "round-trip time to the web server"]]],
    ["Σ RTT_DNS + 2·RTT₀ (+ objects)", "Total page time with an empty DNS cache: DNS lookups first, then the HTTP connection.", "Problems P7–P8 style.", [["RTT_DNS", "round-trip time to each DNS server visited"], ["RTT₀", "round-trip time between your host and the web server"]]],
    ["I = (a · L) / R_access", "Traffic intensity on an institution's access link (requests/s × object size ÷ link rate).", "Web caching problems: a cache hit rate h cuts this to (1 − h)·I.", [["a", "request rate over the access link, in requests/s"], ["L", "average object size, in bits"], ["R_access", "access link rate, in bits/s"], ["h", "cache hit rate: share of requests the cache answers"]]],
    ["D_cs ≥ max( N·F/u_s , F/d_min )", "Client-server: the server uploads N copies; the slowest client needs F/d_min.", "File distribution, client-server.", [["N", "number of clients that need the file"], ["F", "file size, in bits"], ["u_s", "server upload rate, in bits/s"], ["d_min", "download rate of the slowest client"]]],
    ["D_P2P ≥ max( F/u_s , F/d_min , N·F/(u_s + Σuᵢ) )", "P2P: the server sends at least one copy, the slowest peer must download F, and the total upload capacity grows with N.", "File distribution, P2P.", [["F", "file size, in bits"], ["u_s", "server upload rate"], ["d_min", "download rate of the slowest peer"], ["N", "number of peers"], ["Σuᵢ", "sum of all peers' upload rates (N·u if all equal)"]]],
    ["8 / 6 / 2 messages", "Iterative DNS lookup counting host↔local: nothing cached / TLD server cached / name cached.", "Counting DNS messages."],
    ["sockets on a TCP server = n + 1", "One welcoming socket plus one connection socket per connected client. A UDP server needs just one socket.", "Socket-counting questions.", [["n", "number of connected clients"], ["1", "the welcoming (listening) socket"]]],
  ],
  traps: [
    "Forgetting the TCP handshake RTT for <i>every</i> new non-persistent connection.",
    "Saying SMTP fetches mail. SMTP only pushes; the reader uses IMAP or HTTP to pull.",
    "Saying the root server returns the final IP address. In an iterative lookup it returns a referral to TLD servers.",
    "Confusing iterative and recursive: iterative answers “ask this server next”; recursive takes over the job.",
    "Calling HTTP stateful because of cookies. The protocol is stateless; cookies plus a back-end database add state.",
    "In P2P formulas, using a typical peer's download rate instead of the <b>slowest</b> one (d_min), or forgetting that the server must upload at least one full copy.",
    "Mixing up Gbit and GB in file sizes. Convert everything to bits first.",
  ],
},
notes: [
{id: "principles", title: "Principles of network applications", ref: "§2.1 · pp. 82–95",
 gist: "Applications run only on end systems, talk through sockets, and pick the transport service they need.",
 body: `<p><b>Architectures.</b> In <b>client-server</b> the server is always on, has a fixed IP address and serves many clients; clients do not talk to each other directly (Web, email). Large services use <b>data centres</b> full of servers. In <b>peer-to-peer (P2P)</b>, intermittently connected hosts (peers) talk directly. P2P is <b>self-scaling</b>: each new peer brings demand but also upload capacity. It is harder to manage, secure and make perform well.</p>
 <p><b>Processes and sockets.</b> The thing that communicates is a <b>process</b>, a running program. In each exchange, the process that starts it is the <b>client</b> and the one waiting to be contacted is the <b>server</b>, even in P2P. A process sends and receives through a <b>socket</b>, the interface between the application layer and the transport layer. The application controls everything on its side of the socket and very little on the transport side. To reach a process you need the host's <b>IP address</b> and the process's <b>port number</b> (for example 80 for a web server, 25 for a mail server).</p>
 <p><b>What an application can ask of transport:</b> reliable data transfer, throughput, timing, and security. File transfer and email need full reliability but tolerate delay. Streaming and calls tolerate some loss but are sensitive to delay and need some minimum throughput.</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>TCP</th><th>UDP</th></tr></thead><tbody>
 <tr><td>Connection</td><td>Handshake first (connection-oriented)</td><td>None</td></tr>
 <tr><td>Reliable, in order</td><td>Yes</td><td>No</td></tr>
 <tr><td>Congestion control</td><td>Yes: slows down when the network is congested</td><td>No</td></tr>
 <tr><td>Throughput or delay guarantees</td><td>No</td><td>No</td></tr>
 <tr><td>Encryption</td><td>Not by itself; <b>TLS</b> adds it on top at the application layer</td><td>No</td></tr>
 </tbody></table></div>
 <p>An <b>application-layer protocol</b> defines message types, syntax, meaning and the rules for when to send what. Some are public standards in RFCs (HTTP, SMTP); others are proprietary (many video-call apps).</p>`},
{id: "http", title: "The Web and HTTP", ref: "§2.2 · pp. 95–116",
 gist: "A stateless request/response protocol over TCP. Most performance tricks are about saving round trips.",
 body: `<p>A web page is a <b>base HTML file</b> plus referenced <b>objects</b> (images, scripts, stylesheets), each with its own <b>URL</b> (host name + path). The browser (client) sends <b>HTTP requests</b>; the web server returns <b>HTTP responses</b>. HTTP uses TCP, port 80 (443 for HTTPS). It is <b>stateless</b>: the server keeps no memory of earlier requests.</p>
 <p><b>Non-persistent vs persistent connections.</b> With non-persistent HTTP, every object needs a new TCP connection: one RTT to set up the connection, one RTT for the request and the start of the response, plus the transmission time. That is <b>2 RTT + transmission</b> per object, and each connection also costs memory on the server. Browsers soften this with several parallel connections. With <b>persistent</b> HTTP (the default in HTTP/1.1), the server keeps the connection open, so later objects cost about one RTT each, or less if requests are sent back-to-back (pipelining).</p>
 <p><b>Message format.</b> A request has a <b>request line</b> (method, URL, version), <b>header lines</b> such as <code>Host:</code>, <code>Connection:</code>, <code>User-Agent:</code> and <code>Accept-Language:</code>, a blank line, and an optional body. Methods include GET, POST, HEAD, PUT and DELETE. A response has a <b>status line</b> (version, code, phrase), headers such as <code>Date:</code>, <code>Last-Modified:</code>, <code>Content-Length:</code> and <code>Content-Type:</code>, and the body. Common codes: <code>200 OK</code>, <code>301 Moved Permanently</code>, <code>400 Bad Request</code>, <code>404 Not Found</code>, <code>505 HTTP Version Not Supported</code>.</p>
 <p><b>Cookies</b> let a site track users despite HTTP being stateless. There are four parts: a <code>Set-cookie:</code> header in the response, a <code>Cookie:</code> header in later requests, a cookie file kept by the browser, and a back-end database at the site. Cookies enable shopping carts and logins, and also raise privacy concerns.</p>
 <p><b>Web caches (proxy servers)</b> keep copies of recently requested objects. The browser asks the cache; on a hit the cache answers immediately, on a miss it fetches from the origin server, stores a copy and forwards it. Caches cut response time and traffic on an institution's access link. To check whether a stored copy is still fresh, a cache sends a <b>conditional GET</b> with <code>If-Modified-Since:</code>. If nothing changed, the server replies <code>304 Not Modified</code> with no body.</p>
 <div class="callout ex"><b>Worked example from the book.</b> An institution's clients make 15 requests/s for 1 Mbit objects over a 15 Mbps access link, and the “Internet delay” is 2 s. The access link's intensity is 15 × 1 ÷ 15 = 1, so delays explode. Upgrading the link to 100 Mbps fixes it but costs a lot. A cache with a 40% hit rate lowers the intensity to 0.6. Average response time then becomes roughly 0.4 × ~0 + 0.6 × ~2 s ≈ 1.2 s, cheaper and even faster than the upgrade.</div>
 <p><b>HTTP/2</b> keeps the same methods and headers, but splits messages into <b>frames</b> and interleaves them on one TCP connection. This reduces <b>head-of-line blocking</b>, where one large object delays many small ones behind it. It also adds request prioritisation and <b>server push</b> (sending objects before the client asks). <b>HTTP/3</b> runs over <b>QUIC</b> on top of UDP.</p>`},
{id: "email", title: "Electronic mail: SMTP and IMAP", ref: "§2.3 · pp. 116–122",
 gist: "SMTP pushes mail between servers; the reader pulls it with IMAP or over the Web.",
 body: `<p>Email has three parts: <b>user agents</b> (mail apps), <b>mail servers</b> (each user has a mailbox on one), and <b>SMTP</b>. Mail goes from Alice's user agent to her mail server, then directly from her server to Bob's server, and later Bob's user agent fetches it. If Bob's server is down, Alice's server keeps the message in a queue and retries.</p>
 <p><b>SMTP</b> runs over TCP on port 25. The sending server is the client. After a handshake (<code>HELO</code>, <code>MAIL FROM</code>, <code>RCPT TO</code>, <code>DATA</code>, a line containing only a period to end the message, <code>QUIT</code>), several messages can be sent over the same connection. SMTP requires message bodies to be 7-bit ASCII, so binary attachments must be encoded. SMTP does not use intermediate servers: the two servers talk directly.</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>HTTP</th><th>SMTP</th></tr></thead><tbody>
 <tr><td>Direction</td><td><b>Pull</b>: the client fetches what it wants</td><td><b>Push</b>: the sender sends to the receiver</td></tr>
 <tr><td>Content</td><td>Any data</td><td>7-bit ASCII</td></tr>
 <tr><td>Objects</td><td>One object per response</td><td>All parts in one message</td></tr>
 </tbody></table></div>
 <p><b>Message format.</b> Header lines such as <code>From:</code>, <code>To:</code> and <code>Subject:</code>, then a blank line, then the body. These headers are part of the message, separate from the SMTP commands.</p>
 <p><b>Mail access.</b> Because SMTP only pushes, Bob needs another protocol to retrieve mail: <b>IMAP</b>, which manages folders on the server, or <b>HTTP</b> for webmail and many phone apps. Alice's server finds Bob's server through a DNS <b>MX record</b> for Bob's domain.</p>`},
{id: "dns", title: "DNS: the Internet's directory service", ref: "§2.4 · pp. 122–136",
 gist: "A distributed, hierarchical database that turns host names into IP addresses, helped a lot by caching.",
 body: `<p><b>What DNS does:</b> translates host names to IP addresses, maps aliases to canonical names (<b>host aliasing</b>), finds a domain's mail server (<b>mail server aliasing</b>), and spreads load across replicated servers by rotating the order of addresses (<b>load distribution</b>). DNS runs over UDP port 53. Other applications such as HTTP and SMTP use it, adding delay before they can start.</p>
 <p><b>Why not one big server?</b> It would be a single point of failure, would carry enormous traffic, would be far away from most users, and would need constant maintenance. A centralised design does not scale.</p>
 <p><b>The hierarchy.</b></p>
 <ul>
 <li><b>Root servers</b>: more than 1,000 instances worldwide, copies of 13 root servers run by 12 organisations. They point to TLD servers.</li>
 <li><b>Top-level domain (TLD) servers</b> for .com, .org, .edu, .se and so on. For example Verisign runs .com and Educause runs .edu. They point to authoritative servers.</li>
 <li><b>Authoritative servers</b> hold an organisation's own records and give the final answer.</li>
 <li>A <b>local DNS server</b> (run by your ISP or university) is not strictly part of the hierarchy, but every host's queries go to it first.</li>
 </ul>
 <p><b>Iterative vs recursive.</b> The host's query to its local server is recursive (“get me the answer”). From there, queries are usually <b>iterative</b>: each server either answers or replies “I don't know, ask this server”. In a fully recursive chain, each server passes the job along, which puts a heavy load on the root and TLD servers. Step through both in the model below.</p>
 <p><b>Caching.</b> Any DNS server stores answers it receives, for a <b>TTL</b> (time to live), often two days. Local servers usually have TLD server addresses cached, so root servers are rarely contacted.</p>
 <p><b>Resource records</b> have the form (Name, Value, Type, TTL):</p>
 <div class="tblwrap"><table><thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead><tbody>
 <tr><td>A</td><td>host name</td><td>IPv4 address</td></tr>
 <tr><td>NS</td><td>domain</td><td>host name of an authoritative server for it</td></tr>
 <tr><td>CNAME</td><td>alias</td><td>canonical host name</td></tr>
 <tr><td>MX</td><td>alias / domain</td><td>canonical name of the mail server</td></tr>
 </tbody></table></div>
 <p><b>Messages.</b> Queries and replies share one format: a 12-byte header (a 16-bit ID that matches replies to queries, plus flags such as query/reply, authoritative, recursion desired and recursion available), then question, answer, authority and additional sections. To register a new domain you go through a <b>registrar</b>, which adds NS and A records for your authoritative servers to the TLD servers.</p>
 <p><b>Attacks.</b> DDoS floods against root or TLD servers have had limited effect thanks to packet filtering and caching. DNS has also been abused for man-in-the-middle and cache poisoning attacks.</p>`,
 widget: widgetDNS},
{id: "p2p", title: "Peer-to-peer file distribution", ref: "§2.5 · pp. 136–143",
 gist: "In P2P, every downloader also uploads, so distribution time grows slowly as more peers join.",
 body: `<p>Distribute a file of F bits to N peers. The server uploads at u<sub>s</sub>, peer i uploads at u<sub>i</sub>, and the slowest peer downloads at d<sub>min</sub>.</p>
 <p><b>Client-server:</b> the server must upload N full copies (N·F/u<sub>s</sub>), and the slowest client needs at least F/d<sub>min</sub>. So D<sub>cs</sub> ≥ max(NF/u<sub>s</sub>, F/d<sub>min</sub>), which grows <b>linearly with N</b>.</p>
 <p><b>P2P:</b> the server must send at least one copy (F/u<sub>s</sub>), the slowest peer still needs F/d<sub>min</sub>, and NF bits must be uploaded in total by everyone together, at a combined rate of u<sub>s</sub> + Σu<sub>i</sub>. So D<sub>P2P</sub> ≥ max(F/u<sub>s</sub>, F/d<sub>min</sub>, NF/(u<sub>s</sub> + Σu<sub>i</sub>)). Because the denominator grows with N, the time levels off: P2P is <b>self-scaling</b>.</p>
 <p><b>BitTorrent.</b> The peers sharing a file form a <b>torrent</b>. The file is split into <b>chunks</b>, typically 256 KB. A <b>tracker</b> keeps a list of peers; a new peer gets a random subset and connects to some of them as neighbours. Two rules matter:</p>
 <ul>
 <li><b>Rarest first</b>: request the chunks that the fewest neighbours have, so rare chunks spread quickly.</li>
 <li><b>Tit-for-tat</b>: upload to the four neighbours currently sending to you fastest (re-evaluated every 10 seconds). Every 30 seconds, also upload to one random extra neighbour: the <b>optimistic unchoke</b>. This lets newcomers get started and helps find better trading partners, while discouraging free-riding.</li>
 </ul>`},
{id: "video", title: "Video streaming and CDNs", ref: "§2.6 · pp. 143–152",
 gist: "The client adapts video quality chunk by chunk; CDNs serve copies from servers close to users.",
 body: `<p>Video is a sequence of compressed images, and it can be encoded at several <b>bitrates</b> (higher bitrate, better quality). Streaming needs an average throughput at least as high as the bitrate, and network conditions change constantly.</p>
 <p><b>DASH</b> (Dynamic Adaptive Streaming over HTTP): the video is stored in several versions and cut into chunks of a few seconds. The client first downloads a <b>manifest file</b> listing the versions and their URLs, then requests one chunk at a time over plain HTTP. For each chunk the <b>client</b> picks the best bitrate it can sustain, based on measured bandwidth and how much video it has buffered.</p>
 <p><b>Content distribution networks (CDNs)</b> keep copies of content in many geographically spread clusters. There are two placement philosophies:</p>
 <ul>
 <li><b>Enter deep</b> (Akamai): many small clusters inside access ISPs, very close to users. Low delay and high throughput, but hard to maintain.</li>
 <li><b>Bring home</b>: fewer, larger clusters at IXPs. Easier to manage, but further from users.</li>
 </ul>
 <p><b>How a request reaches the CDN.</b> The page links to a URL whose host name the content provider's DNS answers with a CNAME pointing into the CDN's domain. The CDN's own DNS then picks a cluster and returns its address. <b>Cluster selection</b> may use the geographically closest cluster (according to the local DNS server's location) or real-time measurements of delay and loss.</p>
 <p><b>Case studies.</b> Netflix runs its own CDN, Open Connect, with servers in IXPs and inside ISPs, and pushes content to them in advance during off-peak hours. YouTube uses Google's private CDN and pulls content into caches on demand.</p>`},
{id: "sockets", title: "Socket programming", ref: "§2.7 · pp. 152–165",
 gist: "UDP sockets send addressed datagrams with no setup; TCP sockets first connect, then exchange a byte stream.",
 body: `<p>The book's examples are in Python. The server must already be running, with its socket bound to a known port, before a client can contact it.</p>
 <p><b>UDP.</b> Create a socket with <code>socket(AF_INET, SOCK_DGRAM)</code>. There is no connection, so every message carries its destination: the client calls <code>sendto(message, (serverName, serverPort))</code>. The server calls <code>bind(('', serverPort))</code>, then loops on <code>recvfrom(2048)</code>, which returns the data and the sender's address so it can reply. One UDP socket can serve all clients.</p>
 <pre class="msg">clientSocket = socket(AF_INET, SOCK_DGRAM)
clientSocket.sendto(message.encode(), (serverName, serverPort))
reply, serverAddress = clientSocket.recvfrom(2048)</pre>
 <p><b>TCP.</b> Create sockets with <code>SOCK_STREAM</code>. The server creates a <b>welcoming socket</b>, calls <code>bind()</code> and <code>listen()</code>, and waits in <code>accept()</code>. The client calls <code>connect((serverName, serverPort))</code>, which triggers TCP's three-way handshake in the transport layer. <code>accept()</code> then returns a new <b>connection socket</b> dedicated to that client. After that, both sides simply <code>send()</code> and <code>recv()</code> bytes, without addresses. A server talking to n clients has n + 1 sockets.</p>
 <pre class="msg">serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind(('', serverPort))
serverSocket.listen(1)
connectionSocket, addr = serverSocket.accept()</pre>`},
],
glossary: [
  ["Client-server", "An architecture with an always-on server at a fixed address serving many clients."],
  ["Peer-to-peer (P2P)", "An architecture where intermittently connected hosts communicate directly with each other."],
  ["Self-scaling", "Capacity grows with demand, because each new peer also contributes upload capacity."],
  ["Process", "A program running on a host. Processes, not hosts, are the endpoints of communication."],
  ["Socket", "The interface between an application process and the transport layer."],
  ["Port number", "A 16-bit number identifying a process/socket on a host (80 = HTTP, 25 = SMTP, 53 = DNS)."],
  ["TLS", "Transport Layer Security: encryption and authentication added on top of TCP at the application layer."],
  ["HTTP", "HyperText Transfer Protocol: the Web's stateless request/response protocol, over TCP."],
  ["Persistent connection", "A TCP connection kept open for several HTTP requests and responses."],
  ["RTT", "Round-trip time: the time for a small packet to go from client to server and back."],
  ["Cookie", "A small identifier set by a website and returned by the browser, letting the site keep state about a user."],
  ["Web cache / proxy", "A server that stores copies of recently requested objects and answers requests for them."],
  ["Conditional GET", "A request with If-Modified-Since; the server answers 304 Not Modified if the cached copy is still fresh."],
  ["Head-of-line (HOL) blocking", "Small objects stuck behind a large one on the same connection. HTTP/2 framing reduces it."],
  ["SMTP", "Simple Mail Transfer Protocol: pushes mail between servers over TCP port 25."],
  ["IMAP", "Internet Mail Access Protocol: lets a user agent fetch and manage mail stored on a server."],
  ["DNS", "Domain Name System: a distributed database mapping host names to IP addresses and more."],
  ["Root / TLD / authoritative server", "The three levels of the DNS hierarchy, from the top down."],
  ["Local DNS server", "The server a host sends its queries to first, usually run by its ISP or institution."],
  ["Iterative query", "The contacted server answers with a referral to the next server to ask."],
  ["Recursive query", "The contacted server takes over the job and returns the final answer."],
  ["Resource record", "A DNS entry (Name, Value, Type, TTL). Types include A, NS, CNAME and MX."],
  ["Registrar", "A company that registers domain names and inserts the records into TLD servers."],
  ["Torrent", "All the peers taking part in distributing one file in BitTorrent."],
  ["Tracker", "A BitTorrent server that keeps track of which peers are in a torrent."],
  ["Rarest first", "BitTorrent's rule of requesting the chunks fewest neighbours have."],
  ["Tit-for-tat / optimistic unchoke", "Upload to the peers that upload to you fastest, plus one random peer every 30 seconds."],
  ["DASH", "Dynamic Adaptive Streaming over HTTP: the client picks the bitrate of each video chunk."],
  ["Manifest file", "A DASH file listing the available versions of a video and their URLs."],
  ["CDN", "Content distribution network: servers in many locations that serve copies of content close to users."],
  ["Enter deep / bring home", "CDN strategies: many small clusters inside ISPs vs fewer large clusters at IXPs."],
  ["Welcoming socket", "A TCP server's listening socket; accept() creates a new connection socket for each client."],
],
};
