import { M2_DRILLS, M2_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m2", num: 2, chapter: 2,
  short: "Application layer",
  title: "The application layer",
  blurb: "How network applications are built: HTTP and the Web, email, DNS, peer-to-peer, video streaming and sockets.",
  focus: "Start where networking is visible: the applications you use every day. For each protocol, ask what problem it solves, who talks to whom, over which transport, and whether it pushes or pulls. Connect the protocols to each other rather than memorising details in isolation, then do the timing calculations (HTTP RTTs, P2P distribution) until they feel mechanical.",
  obj: ["Explain the basic principles and architectures of network applications", "Describe how processes communicate using sockets and transport-layer services", "Explain how HTTP supports communication between web clients and servers", "Describe how Internet email uses protocols such as SMTP and IMAP", "Explain the purpose and hierarchical operation of the Domain Name System (DNS)", "Distinguish between client-server and peer-to-peer (P2P) application architectures", "Describe the basic principles behind video streaming and Content Distribution Networks (CDNs)", "Explain how applications use TCP and UDP sockets to communicate over a network"],
  concepts: ["Application layer", "Client-server", "Peer-to-peer", "Process", "Socket", "HTTP", "Cookies", "Web caching", "SMTP", "IMAP", "DNS", "Video streaming", "CDN", "TCP", "UDP"],
  questions: [
    "What does a network application need so that processes on different end systems can communicate?",
    "What happens between a browser and a web server when you request a web resource?",
    "How does an e-mail message get from the sender's application to the recipient's mailbox?",
    "When you type a domain name, how does the Internet work out where to send the request?",
    "How does a peer-to-peer application differ from a client-server one?",
    "Why is Internet video usually delivered from distributed infrastructure rather than one central server?",
    "How does an application use a socket to talk to a process on another end system?",
  ],
  read: [["Principles of network applications", "82–95"], ["The Web and HTTP", "95–116"], ["Electronic mail (SMTP, IMAP)", "116–122"], ["DNS", "122–136"], ["Peer-to-peer file distribution", "136–143"], ["Video streaming and CDNs", "143–152"], ["Socket programming", "152–165"]],
  probs: ["P1 (true/false on HTTP)", "P4–P5 (read HTTP messages)", "P7–P8 (DNS + HTTP timing)", "P9 (Web caching)", "P19–P21 (DNS, dig)", "P22–P24 (P2P distribution)", "P26 (BitTorrent free-riding)", "P27 (DASH)"],
  inter: [["HTTP GET", "http-get.php"], ["HTTP response", "http-response.php"], ["DNS and HTTP delays", "DNS_HTTP_delay.php"], ["Browser caching", "browser_caching.php"], ["DNS basics", "dns.php"], ["DNS iterative vs recursive", "dns_query.php"], ["Email and SMTP", "smtp.php"], ["Client-server vs P2P", "CS_vs_P2P_download.php"]],
  lab: "Wireshark labs: HTTP, DNS", tutor: 2,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 3: Principles of network applications, email, DNS and sockets", pages: "pp. 82–95, 116–136, 152–165",
      notes: ["principles", "email", "dns", "sockets"],
      focus: "Understand how applications on different end systems communicate through processes and sockets, and how an application's needs decide its transport service. Use email and DNS as examples of how application-layer protocols solve different problems.",
      takeaway: "Network applications run at the edge and communicate by exchanging messages between processes through sockets. Application-layer protocols define how those messages are exchanged; TCP and UDP offer different services to suit what each application needs." },
    { title: "Lecture 4: Web and HTTP, P2P, video streaming and CDNs", pages: "pp. 95–116, 136–152",
      notes: ["http", "p2p", "video"],
      focus: "See how application-layer design choices affect communication, performance and scale: how HTTP structures client-server exchanges, why caching helps, and why P2P and CDNs matter as the number of users grows.",
      takeaway: "Application-layer protocols decide how applications exchange messages and services. HTTP shows client-server communication; P2P systems and CDNs show how distributed designs keep content delivery scalable as applications grow." },
  ],
  drills: M2_DRILLS, mcq: M2_MCQ,
  ...study,
};
