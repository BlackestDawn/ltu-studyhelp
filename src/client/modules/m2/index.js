import { M2_DRILLS, M2_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m2", num: 2, chapter: 2,
  short: "Application layer",
  title: "The application layer",
  blurb: "How network applications are built: HTTP and the Web, email, DNS, peer-to-peer, video streaming and sockets.",
  focus: "For each protocol, ask: what problem does it solve, who talks to whom, over which transport, and is it push or pull? Then do the timing calculations (HTTP RTTs, P2P distribution) until they feel mechanical.",
  obj: ["Explain principles and architectures of network apps", "Describe how processes communicate via sockets and transport services", "Explain how HTTP works between clients and servers", "Describe email with SMTP and IMAP", "Explain DNS's purpose and hierarchy", "Distinguish client-server from P2P", "Describe video streaming (DASH) and CDNs"],
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
