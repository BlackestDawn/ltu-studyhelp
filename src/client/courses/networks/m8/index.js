import { M8_DRILLS, M8_MCQ } from "./practice.js";
import study from "./study.js";

export default {
  id: "m8", num: 8, chapter: 8,
  short: "Security",
  title: "Security in computer networks",
  blurb: "What secure communication needs and how it's achieved: cryptography, integrity and signatures, authentication, e-mail, TLS, IPsec, wireless security, firewalls and IDS.",
  focus: "Security isn't just encryption. For each mechanism ask two questions: which threat does it defend against, and which property (confidentiality, integrity, authentication, availability) does it provide? Then notice that the same few building blocks are combined differently at each layer.",
  obj: ["Identify the fundamental security goals of confidentiality, integrity, authentication and availability", "Explain the basic principles of symmetric-key and public-key cryptography", "Explain how hash functions, digital signatures and certificates support message integrity and authentication", "Explain why different cryptographic mechanisms are often combined in practical security systems", "Describe how secure e-mail can provide confidentiality, integrity and authentication", "Explain how TLS combines authentication, key establishment, encryption and message integrity to protect communication", "Explain the purpose of IPsec and distinguish between transport and tunnel modes", "Explain at a high level how authentication and encryption are applied in Wi-Fi and cellular networks", "Distinguish between stateless and stateful packet filtering", "Explain the complementary roles of firewalls and intrusion detection systems (IDS)"],
  concepts: ["Confidentiality", "Integrity", "Authentication", "Availability", "Symmetric cryptography", "Public-key cryptography", "Hashing", "Digital signatures", "Certificates", "TLS", "IPsec", "Wireless security", "Firewalls", "IDS"],
  questions: [
    "What exactly are we trying to protect, and what can an attacker do to compromise it?",
    "How can a receiver verify both who sent a message and whether it was altered?",
    "What changes when security is applied at the application, transport or network layer?",
    "What extra security concerns arise when traffic is sent over the air?",
    "How can a network restrict unwanted traffic and spot potentially malicious behaviour?",
  ],
  read: [["What is network security?", "608–610"], ["Principles of cryptography", "610–624"], ["Message integrity and digital signatures", "624–634"], ["End-point authentication (covered in Lecture 15, not in its page list)", "634–639"], ["Securing e-mail", "639–644"], ["Securing TCP connections: TLS", "644–651"], ["Network-layer security: IPsec and VPNs", "651–659"], ["Securing wireless LANs and 4G/5G networks", "659–667"], ["Operational security: firewalls and IDS", "667–679"]],
  probs: ["P1–P3 (substitution ciphers)", "P7–P8 (RSA by hand)", "P9 (Diffie-Hellman)", "P11–P12 (hashes and MACs)", "P15–P16 (nonces and authentication)", "P17–P18 (secure e-mail)", "P20–P21 (TLS attacks)", "P22–P23 (IPsec)", "P24 (stateful firewall)"],
  inter: [],
  lab: "Wireshark lab: TLS", tutor: 8,
  // Course lectures for this module; `notes` lists the study-notes section ids each one covers.
  lectures: [
    { title: "Lecture 15: Network security, cryptography, message integrity and authentication", pages: "pp. 608–634 (+ 634–639)",
      notes: ["goals", "symmetric", "pubkey", "integrity", "auth"],
      focus: "Don't treat security as simply encrypting data. Ask which property is needed (confidentiality, authentication, integrity or availability), which mechanism provides it, and what limitations remain.",
      takeaway: "Secure communication needs more than hiding a message's contents: confidentiality, authentication, integrity and availability may all be required. Different cryptographic mechanisms provide different properties and are usually combined in practice." },
    { title: "Lecture 16: E-mail, TLS, IPsec, wireless and operational security", pages: "pp. 639–679",
      notes: ["email", "tls", "ipsec", "wireless", "firewall", "ids"],
      focus: "The cryptographic principles stay the same; focus on how and where they're applied. For each mechanism ask what is protected, where in the network the protection happens, and which properties it gives.",
      takeaway: "Security is built in at many points in the architecture. The same techniques (encryption, authentication, hashing and key management) are combined differently to protect a message, a connection, an IP datagram, a wireless link, or a whole network." },
  ],
  drills: M8_DRILLS, mcq: M8_MCQ,
  ...study,
};
