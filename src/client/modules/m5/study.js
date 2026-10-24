// Reading-first material for module 5: summary, study notes and key terms.
import { widgetDijkstra, widgetDV } from "../../widgets.js";

export default {
summary: {
  big: `<p>Module 4 showed how a router forwards a packet using its forwarding table. This module answers where that table comes from. The <b>control plane</b> computes the paths packets should follow and installs the forwarding information that the data plane uses. It can do that <b>per router</b>, with every router running a routing protocol and talking to the others, or through a <b>logically centralised controller</b>, as in SDN.</p>
  <p>Two families of <b>routing algorithms</b> find least-cost paths through a graph of routers and links. In <b>link-state</b> routing every router learns the whole map (by flooding) and runs <b>Dijkstra's algorithm</b> itself. In <b>distance-vector</b> routing each router knows only its own links and what its neighbours tell it, and keeps improving its estimates with the <b>Bellman-Ford equation</b>. They differ in what each router knows, how fast they converge, and how they fail.</p>
  <p>The Internet is far too big for one routing domain, so routers are grouped into <b>autonomous systems</b>. Inside an AS, <b>OSPF</b> (link state) computes paths. Between ASes, <b>BGP</b> spreads reachability of address prefixes along AS paths, and <b>policy</b> decides which routes are used and advertised. <b>SDN</b> moves route computation into a controller that programs switches with <b>OpenFlow</b>. Finally, running a network needs diagnostics and management: <b>ICMP</b> reports errors and powers ping and traceroute, while <b>SNMP</b> and <b>NETCONF/YANG</b> monitor and configure devices.</p>`,
  takeaways: [
    "The <b>control plane</b> computes paths and fills in forwarding tables; the <b>data plane</b> uses them to forward each packet. Control can be <b>per router</b> (OSPF, BGP) or <b>logically centralised</b> (SDN).",
    "Routing works on a <b>graph</b>: routers are nodes, links are edges with <b>costs</b> chosen by the operator. The goal is the least-cost path; with all costs 1 that is the shortest path.",
    "<b>Link state</b> is global: every router knows every link's cost and runs <b>Dijkstra</b>, which adds the cheapest remaining node to N′ each step. Simple version: O(n²).",
    "<b>Distance vector</b> is decentralised, iterative, asynchronous and self-terminating: <code>D<sub>x</sub>(y) = min<sub>v</sub>{c(x,v) + D<sub>v</sub>(y)}</code>, using only neighbours' vectors.",
    "Distance vector spreads <b>good news fast and bad news slowly</b> (count-to-infinity, routing loops). <b>Poisoned reverse</b> fixes loops between two neighbours only.",
    "<b>Autonomous systems</b> solve scale and administrative autonomy. <b>OSPF</b> (intra-AS) floods link state and runs Dijkstra, with optional areas for hierarchy.",
    "<b>BGP</b> (inter-AS) advertises prefixes with attributes such as <b>AS-PATH</b> and <b>NEXT-HOP</b> over eBGP and iBGP. Route selection: local preference → shortest AS-PATH → closest NEXT-HOP (hot potato) → router ID. <b>Policy dominates performance.</b>",
    "<b>SDN</b>: switches do flow-based forwarding; a logically centralised controller (e.g. OpenDaylight, ONOS) runs network-control apps (northbound) and talks <b>OpenFlow</b> to switches (southbound).",
    "<b>ICMP</b> (inside IP, protocol 1) reports errors and supports <b>ping</b> (echo request/reply) and <b>traceroute</b> (TTL expired, then port unreachable).",
    "<b>Network management</b>: <b>SNMP</b> reads and sets MIB objects and sends traps (monitoring); <b>NETCONF</b> carries configuration as XML RPCs; <b>YANG</b> models the data.",
  ],
  formulas: [
    ["path cost = c(x₁,x₂) + c(x₂,x₃) + … + c(xₚ₋₁,xₚ)", "The cost of a path is the sum of its link costs.", "Comparing paths by hand.",
      [["c(a,b)", "cost of the link between neighbours a and b (∞ if they aren't directly linked)"], ["x₁ … xₚ", "the routers along the path, from source to destination"]]],
    ["D(v) = min( D(v), D(w) + c(w,v) )", "Dijkstra's update: after adding w to N′, check whether going through w is cheaper for each neighbour v of w not yet in N′.", "Every step of a Dijkstra table.",
      [["D(v)", "current least-cost estimate from the source to v"], ["w", "the node just added to N′ (cheapest node not yet in N′)"], ["c(w,v)", "cost of the link from w to v"], ["N′", "nodes whose least-cost path is final"]]],
    ["p(v) = w  when the update above lowers D(v)", "The previous node on the least-cost path. Follow p( ) backwards from a destination to get the whole path.", "Building paths and the forwarding table.",
      [["p(v)", "previous node before v on the current least-cost path"], ["w", "the node whose path made D(v) cheaper"]]],
    ["n(n + 1)/2 → O(n²)", "Dijkstra's worst-case number of node checks when the minimum is found by a simple search.", "Complexity questions.",
      [["n", "number of nodes, not counting the source"]]],
    ["d<sub>x</sub>(y) = min<sub>v</sub> { c(x,v) + d<sub>v</sub>(y) }", "Bellman-Ford equation: x's least cost to y is the best of “link to neighbour v, then v's least cost to y”. The minimising v is the next hop.", "Distance-vector questions.",
      [["d<sub>x</sub>(y)", "least cost from x to y"], ["v", "each of x's neighbours"], ["c(x,v)", "cost of x's link to neighbour v"], ["d<sub>v</sub>(y)", "neighbour v's least cost to y"]]],
    ["D<sub>x</sub>(y) = min<sub>v</sub> { c(x,v) + D<sub>v</sub>(y) }", "The distance-vector update x applies whenever a neighbour's vector or one of its own link costs changes.", "Updating a distance vector from received vectors.",
      [["D<sub>x</sub>(y)", "x's current estimate of its least cost to y"], ["D<sub>v</sub>(y)", "the estimate neighbour v last sent to x"], ["c(x,v)", "x's link cost to neighbour v"]]],
    ["Poisoned reverse: if z routes to x via y, z tells y D<sub>z</sub>(x) = ∞", "Stops y from routing back through z when the y–x path gets worse.", "Link-cost-increase (bad news) questions.",
      [["D<sub>z</sub>(x)", "z's least cost to x"], ["∞", "“no route”, the value z pretends to y"]]],
    ["BGP: local pref ↑ → AS-PATH length ↓ → NEXT-HOP cost ↓ → router ID", "BGP's elimination rules, applied in order until one route is left (after rejecting routes whose AS-PATH contains your own AS).", "Choosing among several BGP routes.",
      [["local pref", "policy value set by your own AS; highest wins"], ["AS-PATH length", "number of ASes on the path; shortest wins"], ["NEXT-HOP cost", "intra-AS cost to the route's NEXT-HOP router; lowest wins (hot potato)"]]],
    ["Traceroute: probe with TTL n → reply from router n", "The nth router decrements the TTL to 0 and returns ICMP type 11 (TTL expired); the destination finally returns type 3 code 3.", "Explaining traceroute output.",
      [["TTL", "time-to-live, decremented by one at each router"], ["n", "1, 2, 3, … (three probes per value)"]]],
  ],
  traps: [
    "Confusing forwarding (data plane, local, per packet) with routing (control plane, network-wide, computing paths).",
    "In Dijkstra, adding the node with the fewest hops instead of the lowest D, or forgetting to compare D(w) + c(w,v) with the old D(v).",
    "Forgetting that a node already in N′ is final: its column stays blank for the rest of the table.",
    "In Bellman-Ford, using a neighbour's link cost alone, or adding all neighbours instead of taking the minimum.",
    "Thinking distance vector needs the whole map. It only needs its own links and its neighbours' vectors.",
    "Saying poisoned reverse solves count-to-infinity in general: it only stops loops between two neighbours.",
    "Swapping OSPF and BGP roles: OSPF is intra-AS link state; BGP is inter-AS and policy-driven.",
    "Applying hot potato first: in BGP route selection it comes third, after local preference and AS-PATH length.",
    "Mixing up OSPF's area border router (summarises an area for the backbone) and boundary router (connects to other ASes).",
    "Thinking routers answer traceroute's last probe: the destination host does, with port unreachable.",
    "Confusing SNMP's Trap (agent reports unprompted) with Response (answers a request), and NETCONF (the protocol) with YANG (the data model).",
  ],
},
notes: [
{id: "intro", title: "The control plane", ref: "§5.1 · pp. 378–380",
 gist: "The control plane computes the forwarding and flow tables that the data plane uses, either in every router or in a logically centralised controller.",
 body: `<p>In Module 4 the forwarding table (for destination-based forwarding) or flow table (for generalised forwarding) was simply there. This module is about how those tables are <b>computed, maintained and installed</b>. There are two approaches:</p>
 <ul>
 <li><b>Per-router control.</b> Every router contains both a forwarding function and a routing component. The routing components of all routers talk to each other to compute each router's table. The Internet has worked this way for decades; OSPF and BGP are per-router protocols.</li>
 <li><b>Logically centralised control.</b> A distinct, usually remote controller computes and distributes the tables. It talks to a simple <b>control agent (CA)</b> in each router. The CAs don't talk to each other or take part in computing routes; they just carry out the controller's commands. “Logically centralised” means it is used as if it were one service, even if it actually runs on several servers for reliability and scale. This is the SDN approach, used for example in Google's private WAN and in 4G/5G networks.</li>
 </ul>
 <div class="tblwrap"><table><thead><tr><th></th><th>Data plane</th><th>Control plane</th></tr></thead><tbody>
 <tr><td>Job</td><td>Forwarding: move each packet from input to output port</td><td>Routing: decide paths; also network management and configuration</td></tr>
 <tr><td>Scope</td><td>Local to one router</td><td>Network-wide</td></tr>
 <tr><td>Works with</td><td>The forwarding/flow table</td><td>Routing algorithms that produce the table</td></tr>
 </tbody></table></div>
 <p>The routing algorithm itself (for example Dijkstra) can be the same in both approaches; what differs is <i>where</i> it runs.</p>`},
{id: "routing", title: "Routing algorithms: graphs and costs", ref: "§5.2 · pp. 380–383",
 gist: "Routing finds least-cost paths in a graph whose nodes are routers and whose edges are links with costs.",
 body: `<p>A network is modelled as a <b>graph</b> G = (N, E): N is the set of nodes (routers) and E the set of edges (links). Each edge has a <b>cost</b> c(x,y); if x and y aren't directly linked, c(x,y) = ∞. A <b>path</b> is a sequence of nodes joined by edges, and its cost is the sum of its link costs. The goal is the <b>least-cost path</b>. If every link costs 1, the least-cost path is simply the shortest path (fewest hops). In BGP the graph's nodes are whole networks (ASes) instead of routers.</p>
 <p><b>Where costs come from.</b> The routing algorithm doesn't care: costs are set by the network operator. They might be the same for every link, reflect physical length, be inversely related to bandwidth (so fast links attract traffic), or reflect monetary cost.</p>
 <p><b>Three ways to classify routing algorithms:</b></p>
 <div class="tblwrap"><table><thead><tr><th>Classification</th><th>One kind</th><th>The other kind</th></tr></thead><tbody>
 <tr><td>What each router knows</td><td><b>Centralised / global</b>: complete topology and all link costs as input. Called <b>link-state (LS)</b> algorithms. Example: Dijkstra.</td><td><b>Decentralised</b>: each router starts with only its own links and exchanges information with neighbours, iteratively. Example: <b>distance vector (DV)</b>, Bellman-Ford.</td></tr>
 <tr><td>How often routes change</td><td><b>Static</b>: change slowly, often by hand.</td><td><b>Dynamic</b>: follow topology or load changes, periodically or on each change. More responsive, but more prone to loops and oscillation.</td></tr>
 <tr><td>Do costs follow traffic?</td><td><b>Load-sensitive</b>: costs track current congestion (early ARPAnet).</td><td><b>Load-insensitive</b>: costs don't reflect current load. Today's RIP, OSPF and BGP work this way.</td></tr>
 </tbody></table></div>`},
{id: "ls", title: "Link-state routing and Dijkstra's algorithm", ref: "§5.2.1 · pp. 383–388",
 gist: "With the whole map in hand, each router repeatedly adds the cheapest node it hasn't finalised yet and updates the costs of that node's neighbours.",
 body: `<p><b>Getting the map.</b> Each router broadcasts (floods) <b>link-state packets</b> listing its own links and their costs to every other router. Afterwards all routers have the same, complete view of the network, and each runs the same algorithm, computing its own least-cost paths.</p>
 <p><b>Notation</b> (source u):</p>
 <ul>
 <li><b>D(v)</b>: cost of the least-cost path from u to v found so far.</li>
 <li><b>p(v)</b>: the previous node (a neighbour of v) on that path.</li>
 <li><b>N′</b>: the nodes whose least-cost path is definitely known.</li>
 </ul>
 <p><b>The algorithm.</b> Start with N′ = {u}, D(v) = c(u,v) for u's neighbours and ∞ for all other nodes. Then repeat until every node is in N′:</p>
 <ol>
 <li>Find the node <b>w not in N′</b> with the <b>smallest D(w)</b>, and add it to N′. Its path is now final.</li>
 <li>For each neighbour v of w not in N′: <code>D(v) = min( D(v), D(w) + c(w,v) )</code>. If going through w is cheaper, also set p(v) = w.</li>
 </ol>
 <p>After k iterations the least-cost paths to k nodes are known, and they are the k cheapest destinations. When it finishes, follow p( ) back from any destination to find the path. u's forwarding table stores just the <b>first hop</b> on each path. Ties can be broken arbitrarily; the book takes y before v in its example.</p>
 <p>The model below runs the book's example (Figure 5.3, Table 5.1), and can give the network new random costs for practice. A blank table cell means that node is already in N′.</p>
 <p><b>Cost.</b> With n nodes besides the source, finding the minimum by searching costs n + (n−1) + … = n(n+1)/2 checks: <b>O(n²)</b>. A heap makes it faster. Flooding the link state takes O(|N|·|E|) messages.</p>
 <p><b>Oscillations.</b> If link costs follow the traffic they carry (load-sensitive), routers can all move their traffic to the “cheaper” path at once, which then becomes expensive, so they all move back, and so on. Making costs ignore load would stop it but defeats the point of avoiding congestion; the practical fix is to stop routers running in lockstep, for example by <b>randomising when each router sends its link advertisements</b>.</p>`,
 widget: widgetDijkstra},
{id: "dv", title: "Distance-vector routing and Bellman-Ford", ref: "§5.2.2 · pp. 388–395",
 gist: "Each router keeps estimates of its cost to every destination and improves them using only its own link costs and what its neighbours report.",
 body: `<p>The DV algorithm is <b>distributed</b> (each router computes with what its neighbours send), <b>iterative</b> (it repeats until nothing changes), <b>asynchronous</b> (routers don't move in lockstep) and <b>self-terminating</b> (it just stops when no one has news).</p>
 <p><b>The Bellman-Ford equation.</b> If d<sub>x</sub>(y) is the least cost from x to y, then <code>d<sub>x</sub>(y) = min<sub>v</sub> { c(x,v) + d<sub>v</sub>(y) }</code> over x's neighbours v: you must leave x through some neighbour, so pick the one that minimises link cost plus that neighbour's own least cost. The neighbour that gives the minimum is the <b>next hop</b> in x's forwarding table.</p>
 <div class="callout ex"><b>Book example.</b> In Figure 5.3, u's neighbours are v, x and w with c(u,v) = 2, c(u,x) = 1, c(u,w) = 5, and their least costs to z are 5, 3 and 3. So d<sub>u</sub>(z) = min{2 + 5, 1 + 3, 5 + 3} = 4, via x: the same answer Dijkstra gives.</div>
 <p><b>What each router keeps:</b> its link cost to each neighbour; its own <b>distance vector</b> D<sub>x</sub> = [D<sub>x</sub>(y) for every destination y]; and the latest distance vector received from each neighbour.</p>
 <p><b>How it runs.</b> At the start D<sub>x</sub>(y) = c(x,y) (∞ if not a neighbour), and x sends its vector to each neighbour. Then it waits. Whenever a link cost changes or a neighbour sends a new vector, x recomputes <code>D<sub>x</sub>(y) = min<sub>v</sub> { c(x,v) + D<sub>v</sub>(y) }</code> for every y. If its vector changed, it sends it to all neighbours. The estimates converge to the true least costs. Information spreads one hop per exchange, so news needs about as many steps as the network's <b>diameter</b> to cross it.</p>
 <p><b>Link-cost changes.</b> When a cost goes <b>down</b>, the good news spreads quickly. When it goes <b>up</b>, a router may trust a neighbour's old cost that actually went through itself: the two routers then point at each other, forming a <b>routing loop</b>, and raise their costs one step per message exchange. In the book's example (x–y rises from 4 to 60, x–z is 50) this takes 44 exchanges. Bad news travels slowly: the <b>count-to-infinity</b> problem.</p>
 <p><b>Poisoned reverse.</b> If z routes to x via y, z tells y that its cost to x is ∞. Then y will never try to route to x through z. This prevents loops between <b>two</b> neighbours, but not loops involving three or more routers. Try both cases in the model below.</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>Link state (LS)</th><th>Distance vector (DV)</th></tr></thead><tbody>
 <tr><td>What a router knows</td><td>The whole topology and all link costs</td><td>Its own link costs and its neighbours' vectors</td></tr>
 <tr><td>Who it talks to</td><td>Everyone (flooding), about its own links</td><td>Only neighbours, about every destination</td></tr>
 <tr><td>Messages</td><td>O(|N|·|E|); every change goes to all nodes</td><td>Between neighbours, only when a least cost changes</td></tr>
 <tr><td>Convergence</td><td>O(n²) computation</td><td>Can be slow; may loop while converging; count-to-infinity</td></tr>
 <tr><td>Robustness</td><td>A router can only lie about its own links, and each computes its own table</td><td>A wrong cost is passed on and can spread through the whole network</td></tr>
 </tbody></table></div>
 <p>Neither is an obvious winner; both are used in the Internet. RIP and BGP are DV-like; OSPF and IS-IS are link state.</p>`,
 widget: widgetDV},
{id: "ospf", title: "Autonomous systems and OSPF", ref: "§5.3 · pp. 395–399",
 gist: "Routers are grouped into autonomous systems; inside one, OSPF floods link state and every router runs Dijkstra.",
 body: `<p>One flat routing domain doesn't work for the real Internet, for two reasons:</p>
 <ul>
 <li><b>Scale.</b> With hundreds of millions of routers, storing every destination, flooding every link change and getting distance vectors to converge would all be impossible.</li>
 <li><b>Administrative autonomy.</b> Each ISP wants to run its own network its own way, choose its own routing algorithm, and hide its internals.</li>
 </ul>
 <p>So routers are grouped into <b>autonomous systems (ASes)</b>: groups of routers under the same administrative control, each with a globally unique <b>AS number</b> (assigned through ICANN's regional registries). An ISP may be one AS or split into many. Routing within an AS uses an <b>intra-AS</b> protocol that all its routers run; routing between ASes uses the <b>inter-AS</b> protocol, BGP. <b>Gateway routers</b> at the edge of an AS take part in both.</p>
 <p><b>Intra-AS protocols in use:</b> RIP (classic distance vector, now largely replaced), EIGRP (distance-vector based, Cisco-proprietary for about 20 years, now open), and OSPF and its close relative IS-IS (link state), the most widely used.</p>
 <p><b>OSPF</b> (Open Shortest Path First; “open” because its specification is public, RFC 2328) is a <b>link-state</b> protocol:</p>
 <ul>
 <li>Each router <b>floods</b> link-state advertisements to <b>all</b> routers in the AS (not just its neighbours): whenever a link changes, and at least <b>every 30 minutes</b> anyway, for robustness.</li>
 <li>Each router builds the complete map of the AS and runs <b>Dijkstra</b> to get a shortest-path tree with itself as the root.</li>
 <li><b>Link costs are set by the administrator</b>, for example all 1 for minimum-hop routing, or inversely proportional to capacity. OSPF provides the mechanism, not the policy; operators sometimes tune weights to get the traffic flows they want.</li>
 <li>OSPF messages go directly in IP datagrams (upper-layer protocol <b>89</b>), so OSPF handles its own reliable delivery. HELLO messages check that links to neighbours are up.</li>
 </ul>
 <p><b>OSPF features:</b> <b>authentication</b> of messages (simple password or MD5 with a shared key) so outsiders can't inject false routes; <b>multiple equal-cost paths</b> can be used at once; integrated multicast support (MOSPF); and <b>hierarchy</b> within one AS.</p>
 <p><b>Hierarchical OSPF.</b> A large AS can be split into <b>areas</b>. Each area runs its own link-state flooding, so routers only know the detailed topology of their own area. Exactly one area is the <b>backbone</b>, which routes traffic between areas.</p>
 <div class="tblwrap"><table><thead><tr><th>Router</th><th>Role</th></tr></thead><tbody>
 <tr><td>Internal router</td><td>Runs OSPF within its own area only</td></tr>
 <tr><td>Area border router</td><td>Belongs to an area and the backbone; summarises distances to its area's destinations and advertises them in the backbone</td></tr>
 <tr><td>Backbone router</td><td>Runs OSPF within the backbone</td></tr>
 <tr><td>Boundary router</td><td>Connects the AS to other ASes</td></tr>
 </tbody></table></div>
 <p>A packet between areas goes: to an area border router, across the backbone to the destination area's border router, then to the destination.</p>`},
{id: "bgp", title: "Routing among ISPs: BGP", ref: "§5.4 · pp. 399–411",
 gist: "BGP lets every AS learn which prefixes are reachable through which AS paths, and lets policy choose among them: the glue that holds the Internet together.",
 body: `<p>Every AS runs the same inter-AS protocol: the <b>Border Gateway Protocol (BGP)</b>. It is decentralised and asynchronous, in the spirit of distance vector, but routes to <b>CIDR prefixes</b> (such as 138.16.68/22) rather than to single routers. BGP gives each router a way to:</p>
 <ol>
 <li><b>Learn reachability</b>: find out from neighbouring ASes which prefixes exist and can be reached through them.</li>
 <li><b>Choose the “best” route</b> to each prefix, based on policy and on the reachability information.</li>
 </ol>
 <p><b>Sessions.</b> Pairs of routers exchange BGP messages over semi-permanent <b>TCP connections on port 179</b>. A session between routers in <b>different</b> ASes is <b>eBGP</b> (external); between routers in the <b>same</b> AS it is <b>iBGP</b> (internal). A gateway learns “AS3 x” over eBGP, passes it on over iBGP inside its own AS, and another gateway then advertises “AS2 AS3 x” over eBGP to the next AS.</p>
 <p><b>Routes and attributes.</b> A BGP route is a prefix plus attributes:</p>
 <ul>
 <li><b>AS-PATH</b>: the list of ASes the advertisement has passed through; each AS adds its own number. A router that finds <b>its own AS</b> in the path <b>rejects</b> the advertisement, which prevents loops.</li>
 <li><b>NEXT-HOP</b>: the IP address of the router interface where the AS-PATH begins (typically the neighbouring AS's gateway). It ties BGP to intra-AS routing: the router uses OSPF to find its cost to the NEXT-HOP.</li>
 <li><b>Local preference</b>: a policy value set by your own AS.</li>
 </ul>
 <p><b>Hot potato routing</b>: choose the route whose NEXT-HOP router is closest by intra-AS cost, so the packet leaves your AS as cheaply as possible, ignoring the cost outside. It is selfish, and two routers in the same AS may pick different exits. To add an outside prefix to its forwarding table, a router uses BGP (to learn the gateways) and OSPF (to reach them).</p>
 <p><b>BGP's route-selection algorithm</b> applies these rules in order until one route is left:</p>
 <ol>
 <li>Highest <b>local preference</b> (pure policy).</li>
 <li>Shortest <b>AS-PATH</b> (like distance vector, counting AS hops).</li>
 <li>Closest <b>NEXT-HOP</b> router: hot potato.</li>
 <li><b>BGP identifiers</b> as the final tie-break.</li>
 </ol>
 <p><b>IP anycast.</b> The same IP address is advertised from many locations (for example every copy of a DNS root server). Each router simply picks its best route to that address, so requests reach a nearby copy. CDNs rarely use it, because a routing change could send packets of one TCP connection to different servers.</p>
 <p><b>Routing policy.</b> Policy can override everything else, mainly through local preference and through which routes an AS chooses to <b>advertise</b>. A multi-homed customer (stub) network that doesn't want to carry traffic between its two providers simply advertises no routes except to itself. A rule of thumb between backbone ISPs: traffic crossing an ISP's network must have its source or destination in one of that ISP's customers; otherwise it is a free ride, so the ISP won't advertise routes that would invite it.</p>
 <div class="callout"><b>Why different protocols inside and between ASes?</b> <b>Policy</b>: between ASes it dominates; inside one AS a single administration is in charge. <b>Scale</b>: inter-AS routing must handle huge numbers of networks; inside an AS, hierarchy (or splitting the AS) keeps things manageable. <b>Performance</b>: between ASes, policy matters more than route quality; inside an AS, routing can focus on performance.</div>
 <p><b>Getting on the Internet</b> ties it together: get an address range from your ISP, register your domain and DNS server, and your ISP's BGP routers advertise your prefix so the rest of the world can reach you.</p>`},
{id: "sdn", title: "The SDN control plane and OpenFlow", ref: "§5.5 · pp. 411–419",
 gist: "A logically centralised controller holds the network's state, runs routing and other control apps, and programs simple switches through OpenFlow.",
 body: `<p><b>Four characteristics of SDN:</b></p>
 <ul>
 <li><b>Flow-based forwarding</b>: switches forward on many header fields from several layers, using match+action flow tables (Module 4).</li>
 <li><b>Separation of data plane and control plane</b>: switches are simple forwarding devices; control runs elsewhere.</li>
 <li><b>Network control functions outside the switches</b>, in software on servers: the controller plus network-control applications.</li>
 <li><b>A programmable network</b>: applications (routing, access control, load balancing) program the network through the controller.</li>
 </ul>
 <p><b>Inside the controller</b> there are three layers:</p>
 <ul>
 <li><b>Communication layer</b>: talks to the switches over the <b>southbound</b> interface, using a protocol such as OpenFlow.</li>
 <li><b>Network-wide state management</b>: keeps the state of links, hosts, switches and flow tables, usually in a distributed, replicated database.</li>
 <li><b>Interface to network-control applications</b>: the <b>northbound</b> API (often REST), through which apps read and write state and get notified of events.</li>
 </ul>
 <p>Well-known open-source controllers are <b>OpenDaylight (ODL)</b> and <b>ONOS</b>.</p>
 <p><b>OpenFlow</b> runs between controller and switch over <b>TCP, default port 6653</b>.</p>
 <div class="tblwrap"><table><thead><tr><th>Direction</th><th>Message</th><th>Purpose</th></tr></thead><tbody>
 <tr><td rowspan="4">Controller → switch</td><td>Configuration</td><td>Query and set the switch's configuration</td></tr>
 <tr><td>Modify-State</td><td>Add, delete or change flow-table entries; set port properties</td></tr>
 <tr><td>Read-State</td><td>Collect counters and statistics</td></tr>
 <tr><td>Send-Packet</td><td>Send a given packet out of a given port</td></tr>
 <tr><td rowspan="3">Switch → controller</td><td>Packet-in</td><td>Hand over a packet that matched no entry (or whose action says so)</td></tr>
 <tr><td>Flow-Removed</td><td>Report that a flow-table entry was removed, e.g. by timeout</td></tr>
 <tr><td>Port-status</td><td>Report that a port changed, e.g. a link went down</td></tr>
 </tbody></table></div>
 <div class="callout ex"><b>Example: a link fails.</b> The switch sends <b>Port-status</b>; the controller's link-state manager updates its database; the routing application (running Dijkstra) is notified, recomputes paths, and asks the flow-table manager to send <b>Modify-State</b> messages to every switch whose table must change. The same Dijkstra runs as in OSPF, but in one place instead of in every router.</div>`},
{id: "icmp", title: "ICMP: the Internet Control Message Protocol", ref: "§5.6 · pp. 423–425",
 gist: "Hosts and routers use ICMP to report errors and network-layer information back to each other; ping and traceroute are built on it.",
 body: `<p>ICMP (RFC 792) is mostly used for <b>error reporting</b>, such as “destination network unreachable” when a router has no route. Architecturally it sits <b>just above IP</b>: ICMP messages travel as IP payload, and the receiver hands them to ICMP because the IP header's upper-layer protocol number is <b>1</b>. Each message has a <b>type</b> and a <b>code</b>, and carries the IP header and first 8 bytes of the datagram that caused it, so the sender can tell which datagram it was. Routers <i>may</i> send ICMP messages; they don't have to.</p>
 <div class="tblwrap"><table><thead><tr><th>Type</th><th>Code</th><th>Meaning</th></tr></thead><tbody>
 <tr><td>0</td><td>0</td><td>Echo reply (to ping)</td></tr>
 <tr><td>3</td><td>0 / 1 / 2 / 3</td><td>Destination network / host / protocol / port unreachable</td></tr>
 <tr><td>3</td><td>6 / 7</td><td>Destination network / host unknown</td></tr>
 <tr><td>4</td><td>0</td><td>Source quench (congestion control; seldom used)</td></tr>
 <tr><td>8</td><td>0</td><td>Echo request</td></tr>
 <tr><td>9 / 10</td><td>0</td><td>Router advertisement / discovery</td></tr>
 <tr><td>11</td><td>0</td><td>TTL expired</td></tr>
 <tr><td>12</td><td>0</td><td>IP header bad</td></tr>
 </tbody></table></div>
 <div class="tblwrap"><table><thead><tr><th></th><th>Ping</th><th>Traceroute</th></tr></thead><tbody>
 <tr><td>Sends</td><td>ICMP echo request (type 8)</td><td>UDP probes to an unlikely port, with TTL 1, 2, 3, … (three per TTL)</td></tr>
 <tr><td>Gets back</td><td>Echo reply (type 0) from the destination</td><td>TTL expired (type 11) from router n; finally port unreachable (type 3, code 3) from the destination</td></tr>
 <tr><td>Answers</td><td>Can I reach the destination, and how long is the round trip?</td><td>Which routers are on the path, and what is the RTT to each?</td></tr>
 </tbody></table></div>
 <p>Traceroute times each probe from sending until the matching ICMP message comes back; that is the RTT to that router, whose name and address are in the ICMP message. It stops when the port-unreachable message shows the probe reached the destination. ICMPv6 (RFC 4443) reorganises the types for IPv6 and adds new ones, such as “packet too big”.</p>`},
{id: "mgmt", title: "Network management: SNMP, NETCONF and YANG", ref: "§5.7 · pp. 425–436",
 gist: "Operators monitor and configure many devices through management protocols: SNMP for reading and setting MIB values, NETCONF/YANG for structured, network-wide configuration.",
 body: `<p>Network management means deploying, integrating and coordinating hardware, software and people to monitor, test, poll, configure, analyse and control the network, so it meets its operational, performance and quality-of-service needs at reasonable cost.</p>
 <p><b>The framework:</b></p>
 <ul>
 <li><b>Managing server</b>: an application in the network operations centre (with people in the loop) that collects, analyses and acts on management data.</li>
 <li><b>Managed device</b>: a router, switch, host, firewall and so on, with configurable hardware and software components.</li>
 <li><b>Data</b> (“state”) on each device: <b>configuration data</b> set by the operator (such as an interface's IP address or speed), <b>operational data</b> learned while running (such as the list of OSPF neighbours), and <b>device statistics</b> (counters, such as dropped packets).</li>
 <li><b>Network management agent</b>: software on the device that talks to the managing server and acts on its commands.</li>
 <li><b>Network management protocol</b>: lets the server query and control devices, and devices report events.</li>
 </ul>
 <p><b>Three ways to manage:</b> typing <b>CLI</b> commands into each device (vendor-specific, error-prone, doesn't scale); <b>SNMP/MIB</b>, mainly for monitoring; and <b>NETCONF/YANG</b>, a more abstract, network-wide approach focused on configuration.</p>
 <p><b>SNMP</b> (SNMPv3) is usually carried over <b>UDP</b>, so the manager decides when to retransmit. It works in two modes: <b>request–response</b> (the manager reads or sets values) and <b>traps</b> (the agent reports an exceptional event unprompted, such as an interface going down). The values live in the <b>MIB</b> (Management Information Base), whose objects are defined in the <b>SMI</b> language and grouped into MIB modules.</p>
 <div class="tblwrap"><table><thead><tr><th>SNMP PDU</th><th>Sent by → to</th><th>Purpose</th></tr></thead><tbody>
 <tr><td>GetRequest, GetNextRequest, GetBulkRequest</td><td>Manager → agent</td><td>Read one object, the next one in a list or table, or a large block</td></tr>
 <tr><td>SetRequest</td><td>Manager → agent</td><td>Set MIB values</td></tr>
 <tr><td>InformRequest</td><td>Manager → manager</td><td>Tell another manager about MIB values</td></tr>
 <tr><td>Response</td><td>Agent → manager</td><td>Answer one of the requests above</td></tr>
 <tr><td>Trap</td><td>Agent → manager</td><td>Report an exceptional event; no reply needed</td></tr>
 </tbody></table></div>
 <p><b>NETCONF</b> runs between the managing server and devices over a secure, connection-oriented session such as <b>TLS</b>. It uses <b>remote procedure calls</b> encoded in <b>XML</b>: a session starts with <code>&lt;hello&gt;</code> (exchanging capabilities), continues with <code>&lt;rpc&gt;</code>/<code>&lt;rpc-reply&gt;</code> pairs and device <code>&lt;notification&gt;</code>s, and ends with <code>&lt;close-session&gt;</code>. Its emphasis is <b>configuration</b>: <code>&lt;get-config&gt;</code> reads a configuration, <code>&lt;get&gt;</code> reads configuration and operational data, <code>&lt;edit-config&gt;</code> changes it, <code>&lt;lock&gt;</code>/<code>&lt;unlock&gt;</code> stop others interfering, and <code>&lt;create-subscription&gt;</code> starts event notifications. Changes across several devices can be made as one <b>atomic transaction</b>: all succeed, or all are rolled back.</p>
 <p><b>YANG</b> is the <b>data-modelling language</b> that defines the structure, syntax and meaning of the data NETCONF carries, including <b>constraints</b> that a valid configuration must satisfy. In short: NETCONF is the protocol, YANG describes the data.</p>`},
],
glossary: [
  ["Control plane", "Network-wide logic that computes paths and installs the forwarding information the data plane uses."],
  ["Per-router control", "Every router runs a routing component that works with the others to compute its own table (OSPF, BGP)."],
  ["Logically centralised control", "A controller, possibly replicated, computes and installs tables in all routers (SDN)."],
  ["Control agent (CA)", "Minimal software in an SDN switch that carries out the controller's commands."],
  ["Routing", "Determining the paths packets take from source to destination."],
  ["Link cost", "The value an operator assigns to a link; routing minimises the sum of costs along a path."],
  ["Least-cost path", "The path whose link costs add up to the smallest total."],
  ["Link state (LS)", "Global routing: every router knows all link costs (by flooding) and computes paths itself."],
  ["Dijkstra's algorithm", "LS algorithm that repeatedly adds the cheapest node not yet in N′ and updates its neighbours' costs."],
  ["N′", "In Dijkstra's algorithm, the set of nodes whose least-cost path is known for certain."],
  ["Distance vector (DV)", "Decentralised routing: each router keeps cost estimates to all destinations and swaps them with neighbours."],
  ["Bellman-Ford equation", "dx(y) = minv{c(x,v) + dv(y)}: the basis of distance-vector routing."],
  ["Count-to-infinity", "DV's slow reaction to a cost increase, while two routers raise their costs step by step in a loop."],
  ["Poisoned reverse", "If z routes via y to x, z tells y its cost to x is ∞; stops two-node loops only."],
  ["Static / dynamic routing", "Routes changed slowly, often by hand / routes that follow topology or load changes."],
  ["Load-sensitive costs", "Link costs that follow current congestion; can cause route oscillation."],
  ["Autonomous system (AS)", "A group of routers under one administrative control, with its own AS number."],
  ["Intra-AS / inter-AS routing", "Routing within one AS (e.g. OSPF) / between ASes (BGP)."],
  ["Gateway router", "A router at the edge of an AS that connects directly to routers in other ASes."],
  ["OSPF", "Open Shortest Path First: intra-AS link-state protocol that floods link state and runs Dijkstra."],
  ["OSPF area", "Part of a hierarchical OSPF AS that floods link state only within itself; the backbone connects the areas."],
  ["Area border router", "OSPF router that summarises its area's destinations to the backbone."],
  ["Boundary router", "OSPF router that connects the AS to other ASes."],
  ["RIP / EIGRP / IS-IS", "Other intra-AS protocols: classic DV / DV-based, formerly Cisco-proprietary / link state, close cousin of OSPF."],
  ["BGP", "Border Gateway Protocol: the inter-AS protocol that spreads prefix reachability and applies routing policy."],
  ["eBGP / iBGP", "BGP sessions between routers in different ASes / in the same AS."],
  ["AS-PATH", "BGP attribute listing the ASes an advertisement has passed through; used for loop detection and path length."],
  ["NEXT-HOP", "BGP attribute: IP address of the router interface where the AS-PATH begins."],
  ["Local preference", "BGP policy value set by the local AS; the first rule in route selection."],
  ["Hot potato routing", "Choosing the route whose NEXT-HOP is closest inside your own AS."],
  ["Routing policy", "Business-driven rules for which BGP routes an AS prefers and which it advertises."],
  ["IP anycast", "Advertising one IP address from many places so routers reach the nearest copy."],
  ["SDN", "Software-defined networking: flow-based switches controlled by a logically centralised, programmable controller."],
  ["Northbound / southbound interface", "The SDN controller's interface to network-control applications / to the switches."],
  ["OpenFlow", "Protocol between an SDN controller and switches, over TCP port 6653."],
  ["Packet-in / Port-status / Modify-State", "OpenFlow messages: unmatched packet to controller / port change report / install or change flow entries."],
  ["OpenDaylight / ONOS", "Open-source SDN controllers."],
  ["ICMP", "Internet Control Message Protocol: error and diagnostic messages carried in IP (protocol 1)."],
  ["Ping", "Sends ICMP echo requests (type 8) and waits for echo replies (type 0)."],
  ["Traceroute", "Sends probes with TTL 1, 2, 3, … and uses TTL-expired (type 11) and port-unreachable (type 3) replies to map the path."],
  ["Managing server / managed device / agent", "Management application in the NOC / device being managed / software on the device that talks to the server."],
  ["Configuration / operational data / statistics", "Device data set by the operator / learned while running / counters."],
  ["SNMP", "Simple Network Management Protocol: reads and sets MIB values and sends traps, usually over UDP."],
  ["MIB / SMI", "Management Information Base (the device's management data) / the language MIB objects are defined in."],
  ["Trap", "SNMP message an agent sends unprompted to report an exceptional event."],
  ["NETCONF", "Configuration-focused management protocol using XML remote procedure calls over a secure session."],
  ["YANG", "Data-modelling language that defines the structure, syntax, meaning and constraints of NETCONF data."],
],
};
