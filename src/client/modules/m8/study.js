// Reading-first material for module 8: summary, study notes and key terms.
import { widgetRSA, widgetFirewall } from "../../widgets.js";

export default {
summary: {
  big: `<p>This module asks <b>what secure communication actually needs</b>, and answers with four properties: <b>confidentiality</b> (only the intended parties understand the message), <b>message integrity</b> (changes are detected), <b>end-point authentication</b> (each side knows who it's talking to) and <b>operational security</b> (keeping attackers out of an organisation's network and the service available). An intruder, Trudy, can eavesdrop, insert, modify or delete messages, impersonate, or hijack a session.</p>
  <p>A handful of building blocks provide these properties. <b>Symmetric-key ciphers</b> (from Caesar to DES and AES) are fast but need a shared key. <b>Public-key cryptography</b> (RSA) removes that need but is slow, so it is used to agree on a <b>session key</b>. <b>Cryptographic hashes</b>, <b>MACs</b> and <b>digital signatures</b> give integrity and authentication, and <b>certificates</b> from a CA bind public keys to their owners. <b>Nonces</b> defeat replayed logins.</p>
  <p>The second half shows the same blocks combined at every layer: <b>secure e-mail</b> (PGP) at the application layer, <b>TLS</b> on top of TCP, <b>IPsec</b> and VPNs at the network layer, <b>WPA2/WPA3</b> and 4G/5G AKA on wireless links, and finally <b>firewalls</b> and <b>intrusion detection systems</b> protecting a whole network.</p>`,
  takeaways: [
    "Four security properties: <b>confidentiality</b>, <b>message integrity</b>, <b>end-point authentication</b>, <b>operational security</b> (including availability). Different mechanisms provide different ones.",
    "<b>Symmetric-key</b> ciphers share one key: Caesar (25 keys), monoalphabetic (26! keys, broken by letter frequencies), block ciphers like <b>DES</b> (56-bit key, now too short) and <b>AES</b> (128-bit blocks, 128/192/256-bit keys), with <b>CBC</b> so identical blocks don't encrypt the same.",
    "Attacks by what Trudy knows: <b>ciphertext-only</b>, <b>known-plaintext</b>, <b>chosen-plaintext</b>.",
    "<b>Public-key</b> crypto: K<sup>+</sup> is published, K<sup>−</sup> kept secret, and K<sup>−</sup>(K<sup>+</sup>(m)) = m = K<sup>+</sup>(K<sup>−</sup>(m)). <b>RSA</b> rests on how hard it is to factor n = pq. It is slow, so it mostly carries a <b>session key</b>.",
    "A <b>cryptographic hash</b> (MD5 128-bit, SHA-1 160-bit) must make collisions infeasible. A <b>MAC</b> H(m + s) gives integrity with a shared secret; a <b>digital signature</b> K<sup>−</sup>(H(m)) also proves who signed.",
    "A <b>certificate</b> is a CA's signature binding a public key to an identity; without it, a <b>man-in-the-middle</b> can hand out her own key.",
    "Authentication protocols fail to <b>spoofing</b> (ap1.0, ap2.0) and <b>playback</b> (ap3.0, ap3.1); a <b>nonce</b> (ap4.0) proves the other side is live.",
    "<b>Secure e-mail</b>: encrypt m with a session key K<sub>S</sub>, encrypt K<sub>S</sub> with Bob's public key, sign H(m) with Alice's private key. PGP does exactly this.",
    "<b>TLS</b>: handshake (algorithms, certificate, nonces, pre-master secret, master secret), <b>four keys</b> (encryption + MAC each way), records with HMACs over a <b>sequence number</b>, and an authenticated closure record. HTTPS uses port 443.",
    "<b>IPsec</b>: <b>AH</b> (integrity and authentication) or <b>ESP</b> (also confidentiality, protocol 50); one-way <b>security associations</b> found via the SPI; <b>tunnel</b> mode for VPN gateways, <b>transport</b> mode end to end; <b>IKE</b> sets up SAs.",
    "Wi-Fi security: discovery, mutual authentication and key derivation with an <b>authentication server</b> (EAP over EAPoL and RADIUS), key distribution, encryption. <b>WEP</b> is broken; <b>WPA2</b> mandates AES. 4G <b>AKA</b> authenticates the device via its home <b>HSS</b>.",
    "<b>Firewalls</b>: stateless <b>packet filters</b> (ACLs on headers), <b>stateful</b> filters (connection table), <b>application gateways</b> (per-user decisions). <b>IDSs</b> inspect contents: <b>signature-based</b> or <b>anomaly-based</b>; an <b>IPS</b> also blocks.",
  ],
  formulas: [
    ["n = p · q,&nbsp; z = (p − 1)(q − 1)", "RSA key generation, step 1 and 2.", "Building an RSA key pair from two primes.",
      [["p, q", "two large primes, kept secret"], ["n", "the modulus, part of both keys"], ["z", "used to choose e and d, kept secret"]]],
    ["e · d mod z = 1", "RSA: choose e < n with no common factor with z, then find d.", "Finding the private exponent d.",
      [["e", "public exponent; public key K<sup>+</sup> = (n, e)"], ["d", "private exponent; private key K<sup>−</sup> = (n, d)"], ["z", "(p − 1)(q − 1)"]]],
    ["c = m<sup>e</sup> mod n,&nbsp; m = c<sup>d</sup> mod n", "RSA encryption with the public key and decryption with the private key. Swapping the order (signing with d, checking with e) also works.", "Encrypting or decrypting a small number by hand.",
      [["m", "the message as a number, m < n"], ["c", "the ciphertext"], ["e, d, n", "the key values above"]]],
    ["c = (m + k) mod 26", "Caesar cipher, letter by letter; decrypt with (c − k) mod 26.", "Encrypting or breaking a Caesar cipher.",
      [["m, c", "plaintext and ciphertext letter as 0 (a) … 25 (z)"], ["k", "the key, 1 … 25"]]],
    ["MAC = H(m + s)", "Message authentication code: send (m, H(m + s)); the receiver recomputes and compares.", "Integrity check between parties sharing a secret.",
      [["H", "a cryptographic hash function, e.g. SHA-1"], ["m", "the message"], ["s", "the authentication key, a secret shared by sender and receiver"], ["+", "concatenation"]]],
    ["signature = K<sub>B</sub><sup>−</sup>(H(m))", "Digital signature: Bob signs the digest; anyone checks K<sub>B</sub><sup>+</sup>(signature) = H(m).", "Signing a message or checking a signature.",
      [["K<sub>B</sub><sup>−</sup>", "Bob's private key"], ["K<sub>B</sub><sup>+</sup>", "Bob's public key"], ["H(m)", "hash (message digest) of m"]]],
    ["send K<sub>S</sub>(m), K<sub>B</sub><sup>+</sup>(K<sub>S</sub>), K<sub>A</sub><sup>−</sup>(H(m))", "Secure e-mail: confidentiality, integrity and sender authentication together. (The signature is often encrypted along with m.)", "Working out which key does what in PGP-style e-mail.",
      [["K<sub>S</sub>", "a fresh symmetric session key"], ["K<sub>B</sub><sup>+</sup>", "the receiver Bob's public key"], ["K<sub>A</sub><sup>−</sup>", "the sender Alice's private key"]]],
  ],
  traps: [
    "Thinking security just means encryption: encryption gives confidentiality, not integrity or authentication.",
    "Mixing up the keys: you <b>encrypt for</b> someone with <i>their</i> public key, and <b>sign</b> with <i>your own</i> private key.",
    "Treating a MAC as a signature: both sides know the MAC key, so either could have made it.",
    "Believing a public key just because it arrived in a message: without a certificate, a man in the middle can substitute her own.",
    "Forgetting that encrypting a password doesn't stop playback: Trudy just resends the encrypted version. Use a nonce.",
    "Calling RSA practical for bulk data: it is far slower than AES, so it carries a session key.",
    "Thinking an IPsec SA covers both directions: it is one-way.",
    "Saying AH encrypts: only ESP gives confidentiality.",
    "Assuming an ACK bit proves a packet belongs to a connection: a stateless filter can be fooled by crafted ACKs.",
    "Expecting a signature-based IDS to catch brand-new attacks.",
  ],
},
notes: [
{id: "goals", title: "What is network security?", ref: "§8.1 · pp. 608–610",
 gist: "Secure communication needs confidentiality, message integrity, end-point authentication and operational security, against an intruder who can do much more than eavesdrop.",
 body: `<p>The book's cast: <b>Alice</b> and <b>Bob</b> want to communicate securely (they might be people, a browser and a web server, two routers exchanging routing tables, or DNS servers), and <b>Trudy</b> the intruder wants to interfere.</p>
 <ul>
 <li><b>Confidentiality:</b> only the sender and intended receiver should understand the message. Usually achieved by encryption.</li>
 <li><b>Message integrity:</b> the receiver can tell whether the message was changed in transit, maliciously or by accident.</li>
 <li><b>End-point authentication:</b> each side can confirm the identity of the other.</li>
 <li><b>Operational security:</b> protecting an organisation's network from attack (worms, mapping, DoS, stolen data) using firewalls and intrusion detection systems. Keeping the service <b>available</b> is part of this.</li>
 </ul>
 <p><b>What Trudy can do:</b> <b>eavesdrop</b> (sniff and record messages), and <b>modify, insert or delete</b> messages. That makes possible impersonation (spoofing a source address), hijacking a connection by removing one side and taking its place, and denial of service.</p>
 <p>Keep asking two questions for every mechanism in this module: <i>which threat does it stop</i>, and <i>which property does it provide</i>?</p>`},
{id: "symmetric", title: "Symmetric-key cryptography", ref: "§8.2.1 · pp. 610–618",
 gist: "Sender and receiver share one secret key. From simple substitution to DES and AES block ciphers, with CBC to hide repeated blocks.",
 body: `<p>Alice encrypts plaintext m with key K<sub>A</sub> to get ciphertext K<sub>A</sub>(m); Bob decrypts with K<sub>B</sub>. The <b>algorithm</b> is public (that is the norm); only the <b>key</b> is secret. In <b>symmetric</b> systems, K<sub>A</sub> = K<sub>B</sub>.</p>
 <ul>
 <li><b>Caesar cipher:</b> shift every letter k places (book example k = 3: “bob, i love you” → “ere, l oryh brx”). Only 25 keys, so trying them all is trivial.</li>
 <li><b>Monoalphabetic cipher:</b> any one-to-one letter substitution, so 26! (about 10<sup>26</sup>) keys. Brute force is out, but <b>letter frequencies</b> (e and t are most common; pairs like “th” and “in”) break it quickly.</li>
 <li><b>Polyalphabetic</b> ciphers cycle through several monoalphabetic ciphers, so the same letter encrypts differently depending on its position.</li>
 </ul>
 <p><b>Attacks, by what Trudy knows:</b> <b>ciphertext-only</b> (just the encrypted text; statistical analysis), <b>known-plaintext</b> (some matching plaintext–ciphertext pairs, e.g. she knows “alice” and “bob” appear) and <b>chosen-plaintext</b> (she can get plaintexts of her choice encrypted).</p>
 <p><b>Block ciphers</b> encrypt fixed-size blocks of k bits. A full table mapping every k-bit input to an output would be a perfect cipher but is far too big for k = 64, so real ciphers use functions that simulate a randomly permuted table, controlled by a key.</p>
 <ul>
 <li><b>DES</b>: 64-bit blocks, <b>56-bit key</b>. A machine that cracks DES in one second would need about 149 trillion years for a 128-bit AES key.</li>
 <li><b>AES</b> (2001): <b>128-bit blocks</b>, keys of 128, 192 or 256 bits.</li>
 </ul>
 <p><b>Cipher block chaining (CBC).</b> Encrypting each block on its own means identical plaintext blocks give identical ciphertext blocks, which leaks structure (e.g. repeated HTTP headers). CBC XORs each plaintext block with the <i>previous ciphertext</i> block before encrypting, starting from a random <b>initialisation vector</b> sent in the clear. Now identical blocks almost never encrypt the same.</p>`},
{id: "pubkey", title: "Public-key cryptography and RSA", ref: "§8.2.2 · pp. 618–624",
 gist: "Each party has a public key everyone can use and a private key only they know. RSA builds such a key pair from two large primes.",
 body: `<p>Symmetric crypto needs Alice and Bob to agree on a shared key first, which is hard if they've never met. <b>Public-key cryptography</b> (Diffie-Hellman, 1976) solves this: Bob publishes his <b>public key</b> K<sub>B</sub><sup>+</sup> and keeps a <b>private key</b> K<sub>B</sub><sup>−</sup>. Anyone can send him K<sub>B</sub><sup>+</sup>(m); only he can compute K<sub>B</sub><sup>−</sup>(K<sub>B</sub><sup>+</sup>(m)) = m.</p>
 <p>Since anyone can encrypt to Bob, encryption alone says nothing about <i>who</i> sent the message. That takes signatures (next section).</p>
 <p><b>RSA</b> (Rivest, Shamir, Adleman):</p>
 <ol>
 <li>Choose two large primes p and q (RSA Laboratories recommends that n = pq be on the order of 1,024 bits).</li>
 <li>Compute <code>n = pq</code> and <code>z = (p − 1)(q − 1)</code>.</li>
 <li>Choose <b>e</b> &lt; n with no common factor (other than 1) with z.</li>
 <li>Find <b>d</b> such that <code>ed mod z = 1</code>.</li>
 <li>Public key K<sub>B</sub><sup>+</sup> = (n, e); private key K<sub>B</sub><sup>−</sup> = (n, d).</li>
 </ol>
 <p>Encrypt a message (as an integer m &lt; n): <code>c = m<sup>e</sup> mod n</code>. Decrypt: <code>m = c<sup>d</sup> mod n</code>. The book's example uses p = 5, q = 7, so n = 35 and z = 24; e = 5 and d = 29. The letter “l” (12) encrypts to 12<sup>5</sup> mod 35 = 17.</p>
 <p>The order also works the other way round: <code>(m<sup>d</sup> mod n)<sup>e</sup> mod n = m</code>, which is what makes RSA signatures possible. RSA is believed secure because nobody knows a fast way to <b>factor n</b> into p and q.</p>
 <p><b>Session keys.</b> The exponentiation RSA needs is time-consuming. So in practice Alice picks a symmetric <b>session key</b> K<sub>S</sub>, sends it encrypted with Bob's RSA public key, and they then use K<sub>S</sub> with a fast symmetric cipher for the data.</p>
 <p>The model below runs RSA with small primes. Choose p, q and e, then encrypt and decrypt a number.</p>`,
 widget: widgetRSA},
{id: "integrity", title: "Message integrity, signatures and certificates", ref: "§8.3 · pp. 624–634",
 gist: "Hashes detect changes; a MAC adds a shared secret; a digital signature uses a private key so it proves who signed. Certificates bind public keys to their owners.",
 body: `<p>Bob wants to check that a message really came from Alice and wasn't changed on the way.</p>
 <p><b>Cryptographic hash functions.</b> A hash H takes a message of any length and produces a fixed-size <b>digest</b> H(m). An Internet checksum isn't enough: it's easy to craft a different message with the same checksum. A cryptographic hash must make it computationally infeasible to find any two messages with the same digest (<b>collision resistance</b>). Examples: <b>MD5</b> (128-bit digest) and <b>SHA-1</b> (160-bit).</p>
 <p><b>Message authentication code (MAC).</b> A plain hash isn't enough either: Trudy could change m and send a new H(m). So Alice and Bob share an <b>authentication key s</b>. Alice sends m together with <code>H(m + s)</code>; Bob, knowing s, recomputes it and compares. No encryption is needed. <b>HMAC</b> is the widely used standard, and distributing s is the hard part.</p>
 <p><b>Digital signatures.</b> A signature must be <b>verifiable</b> and <b>non-forgeable</b>: it proves that Bob, and nobody else, signed this exact document. A MAC can't do that, because both parties know s. Instead Bob uses his private key: <code>K<sub>B</sub><sup>−</sup>(m)</code>. Anyone can check that <code>K<sub>B</sub><sup>+</sup>(K<sub>B</sub><sup>−</sup>(m)) = m</code>, and nobody without K<sub>B</sub><sup>−</sup> could have produced it. Public-key operations on a long message are expensive, so Bob signs the digest: he sends <code>m</code> and <code>K<sub>B</sub><sup>−</sup>(H(m))</code>.</p>
 <p><b>Public-key certification.</b> Signatures and public-key encryption are only as good as your belief that a key really belongs to its claimed owner. Trudy could e-mail a pizza shop an order “signed by Bob”, together with “Bob's public key”, which is really hers. A <b>certification authority (CA)</b> checks an entity's identity and issues a <b>certificate</b>: the entity's identity and public key, signed with the CA's private key. Certificates follow the <b>X.509</b> format. Your browser and OS come with the public keys of trusted CAs, so they can check certificates.</p>`},
{id: "auth", title: "End-point authentication", ref: "§8.4 · pp. 634–639",
 gist: "Proving identity over a network: names and IP addresses can be spoofed, passwords can be replayed, and nonces show the other side is live. Public keys need certificates to stop a man in the middle.",
 body: `<p>The book builds an authentication protocol (“ap”) step by step, each fixing the last one's flaw:</p>
 <ul>
 <li><b>ap1.0:</b> Alice just says “I am Alice”. Anyone can say that.</li>
 <li><b>ap2.0:</b> also check the source IP address. Trudy can <b>spoof</b> the address.</li>
 <li><b>ap3.0:</b> Alice sends a secret password. Trudy records it and <b>plays it back</b>.</li>
 <li><b>ap3.1:</b> Alice sends an encrypted password. Still a <b>playback attack</b>: Trudy doesn't need to decrypt it, just resend it.</li>
 <li><b>ap4.0:</b> Bob sends a <b>nonce</b> R, a number used only once in a lifetime, and Alice returns it encrypted with their shared symmetric key, K<sub>A-B</sub>(R). Because R is new, only the live Alice can answer correctly; a recording is useless.</li>
 </ul>
 <p><b>From the lecture: public keys and the man in the middle.</b> (This part is from the course lecture rather than the 8th edition.) A version “ap5.0” has Alice encrypt the nonce with her <i>private</i> key, and Bob ask for her public key to check it. But if Bob can't be sure the public key really is Alice's, Trudy can sit in the middle: she answers with her own key, poses as Alice to Bob and as Bob to Alice, and relays (and reads) everything. Neither side notices. The fix is <b>certificates</b>, which bind a public key to its real owner.</p>`},
{id: "email", title: "Securing e-mail", ref: "§8.5 · pp. 639–644",
 gist: "Application-layer security for a single message: a session key for confidentiality, Bob's public key to protect that key, Alice's private key to sign the hash.",
 body: `<p>E-mail is a single message with no live connection, so Alice can't run a handshake with Bob. She builds the security into the message itself.</p>
 <p><b>Confidentiality.</b> Encrypting the whole message with Bob's public key would be slow. Instead Alice:</p>
 <ol>
 <li>picks a random symmetric <b>session key</b> K<sub>S</sub> and encrypts m with it: K<sub>S</sub>(m);</li>
 <li>encrypts K<sub>S</sub> with <b>Bob's public key</b>: K<sub>B</sub><sup>+</sup>(K<sub>S</sub>);</li>
 <li>sends both. Bob recovers K<sub>S</sub> with his private key, then decrypts m.</li>
 </ol>
 <p><b>Integrity and sender authentication.</b> Alice hashes m and signs it with <b>her private key</b>, K<sub>A</sub><sup>−</sup>(H(m)), and sends that with m. Bob checks it with Alice's public key and compares it with his own H(m).</p>
 <p><b>All three properties</b>: Alice signs the hash, then encrypts m and the signature with K<sub>S</sub>, and encrypts K<sub>S</sub> with Bob's public key. She uses <b>three keys</b>: her private key, Bob's public key and the new session key. Both must still obtain each other's public keys reliably, using certificates.</p>
 <p><b>PGP</b> (Pretty Good Privacy, Phil Zimmermann, 1991) implements essentially this scheme. Instead of CAs it uses a <b>web of trust</b>: users certify keys of people they know, and key-signing parties are held to exchange keys.</p>`},
{id: "tls", title: "Securing TCP connections: TLS", ref: "§8.6 · pp. 644–651",
 gist: "TLS adds confidentiality, integrity and server authentication to a TCP connection: a handshake that authenticates and derives keys, then MAC-protected, encrypted records.",
 body: `<p><b>Transport Layer Security (TLS)</b>, the successor of SSL, sits on top of TCP and gives applications a secure socket. It is used by almost every website (<b>HTTPS</b>, port 443), as well as e-mail and many other apps. The book first builds an “almost-TLS”, then shows the real thing.</p>
 <p><b>Handshake</b> (in real TLS):</p>
 <ol>
 <li>The client sends the list of cryptographic algorithms it supports, plus a client <b>nonce</b>.</li>
 <li>The server picks a symmetric algorithm, a public-key algorithm and a MAC algorithm, and sends its choices, its <b>certificate</b> and a server nonce.</li>
 <li>The client verifies the certificate, extracts the server's public key, creates a <b>pre-master secret (PMS)</b>, and sends it encrypted with the server's public key.</li>
 <li>Both sides derive the <b>master secret (MS)</b> from the PMS and the two nonces, and from it <b>four keys</b>: encryption and MAC keys for each direction (E<sub>B</sub>, M<sub>B</sub>, E<sub>A</sub>, M<sub>A</sub>), plus IVs if the cipher uses CBC.</li>
 <li>Both send an <b>HMAC of all the handshake messages</b>. This stops Trudy secretly removing strong algorithms from the client's list.</li>
 </ol>
 <p><b>Records.</b> Data is split into <b>records</b> (type, version, length, data, HMAC), each with an HMAC and then encrypted. The HMAC covers a <b>sequence number</b> that both sides count but never send, so a reordered, repeated or deleted record fails the check.</p>
 <p><b>Attacks it handles:</b></p>
 <ul>
 <li><b>Connection replay</b>: the nonces make every session's keys different, so a recorded session can't be replayed.</li>
 <li><b>Truncation</b>: Trudy could end the session early with a forged TCP FIN. TLS records have a <b>type</b> field, and closing uses an authenticated closure record, so a FIN without it is spotted.</li>
 </ul>`},
{id: "ipsec", title: "Network-layer security: IPsec and VPNs", ref: "§8.7 · pp. 651–659",
 gist: "IPsec secures IP datagrams between hosts or routers, so every transport protocol above benefits. VPNs use it to join sites over the public Internet.",
 body: `<p>A <b>virtual private network (VPN)</b> lets an organisation with several sites (and travelling employees) send its internal traffic over the public Internet instead of leasing private lines, with IPsec making that traffic secret. Because IPsec works at the network layer, it protects <i>all</i> payloads: TCP, UDP, ICMP, OSPF and so on.</p>
 <p><b>Two protocols:</b></p>
 <ul>
 <li><b>Authentication Header (AH)</b>: source authentication and data integrity, <i>no confidentiality</i>.</li>
 <li><b>Encapsulation Security Payload (ESP)</b>: source authentication, integrity <i>and</i> confidentiality. Far more widely used.</li>
 </ul>
 <p><b>Security associations (SAs).</b> Before sending, the two endpoints set up an SA, a <b>one-way</b> logical connection (so two-way traffic needs two SAs). An SA records a 32-bit <b>Security Parameter Index (SPI)</b>, the source and destination interfaces, the encryption algorithm and key, the integrity algorithm and key, and so on. Each endpoint keeps its SAs in a <b>Security Association Database (SAD)</b>. IPsec turns connectionless IP into a logically connection-oriented service.</p>
 <p><b>Modes:</b> in <b>tunnel mode</b> the whole original datagram is protected and carried inside a new IP datagram, typical between VPN gateways. In <b>transport mode</b> only the original datagram's payload is protected, end to end between hosts.</p>
 <p><b>The ESP datagram</b> (tunnel mode): the original datagram plus an <b>ESP trailer</b> (padding, pad length, next header) is encrypted; the <b>ESP header</b> (SPI and sequence number) is prepended; a <b>MAC</b> over all of that is appended; and a new IP header is added, with <b>protocol number 50</b> to signal ESP. The receiving gateway uses the SPI to find the SA, checks the MAC and sequence number (for replay), decrypts, and forwards the original datagram.</p>
 <p><b>IKE.</b> Configuring SAs by hand doesn't scale, so the <b>Internet Key Exchange</b> protocol sets them up automatically, authenticating with pre-shared keys or certificates (it resembles the TLS handshake).</p>`},
{id: "wireless", title: "Securing wireless LANs and 4G/5G networks", ref: "§8.8 · pp. 659–667",
 gist: "Over the air anyone can listen, so devices and networks must authenticate each other and encrypt each link. Wi-Fi uses an authentication server and WPA2/WPA3; cellular uses AKA with the home network.",
 body: `<p><b>802.11 security has four phases:</b></p>
 <ol>
 <li><b>Discovery</b> of security capabilities: the AP advertises which forms of authentication and encryption it supports, and the device asks for what it wants.</li>
 <li><b>Mutual authentication and shared key derivation</b> between the device and an <b>authentication server (AS)</b>. In the four-way handshake the device and AS derive a shared session key using nonces and a shared secret, with no key sent over the air.</li>
 <li><b>Session key distribution</b>: the AS gives the session key to the AP.</li>
 <li><b>Encrypted communication</b> between device and AP (and on to the remote host) with the session key.</li>
 </ol>
 <p><b>EAP</b> (Extensible Authentication Protocol) carries the authentication messages: over the air as <b>EAPoL</b> (EAP over LAN), and between AP and AS using <b>RADIUS</b> (or Diameter). The AP just relays them.</p>
 <p><b>History:</b> the original <b>WEP</b> had serious flaws. <b>WPA1</b> was a stopgap; <b>WPA2</b> mandated <b>AES</b>; <b>WPA3</b> (2018) fixed a nonce-reuse attack on WPA2's handshake.</p>
 <p><b>4G/5G.</b> A device and its network must authenticate each other even when roaming. In 4G <b>Authentication and Key Agreement (AKA)</b>, the device (identified by its <b>IMSI</b>) and its <b>home network's HSS</b> share a long-term secret on the SIM. The visited network's <b>MME</b> asks the HSS for an authentication token and expected result, challenges the device, and checks its answer; both sides then derive keys to encrypt the radio link. 5G strengthens this: the home network takes the authentication decision itself, and the IMSI is sent encrypted.</p>`},
{id: "firewall", title: "Firewalls", ref: "§8.9.1 · pp. 667–675",
 gist: "A firewall isolates an organisation's network from the Internet, letting some packets through and blocking others. Packet filters look at headers; stateful filters also track connections; application gateways look at the application.",
 body: `<p><b>Three goals:</b> all traffic between outside and inside passes through the firewall; only traffic allowed by the local <b>security policy</b> is let through; and the firewall itself is immune to penetration.</p>
 <p><b>Traditional (stateless) packet filters</b> check each datagram on its own, using IP addresses, protocol type, TCP/UDP ports, TCP flag bits and ICMP type, and apply an <b>access control list (ACL)</b> checked top to bottom. Typical policies: block incoming connections except to the public web server; block outgoing Telnet; block all ICMP pings.</p>
 <p>The <b>ACK-bit trick:</b> to let inside users browse but stop outsiders opening connections inward, allow incoming TCP from port 80 <i>only if the ACK bit is set</i>. An outsider's first segment (the SYN) has ACK = 0.</p>
 <p>But a stateless filter can't tell whether a packet belongs to a real connection: Trudy can send crafted packets with ACK = 1 from port 80 and they pass. A <b>stateful packet filter</b> keeps a <b>connection table</b> (updated from SYN, FIN and timeouts) and, for chosen rules, also checks that the packet belongs to an open connection.</p>
 <p><b>Application gateways</b> (proxies) relay a particular application and can make decisions per user, e.g. only some users may Telnet out: the gateway asks for a user ID and password and only then opens the connection outward. Disadvantages: one gateway per application, extra processing, and clients must be configured to use them. (Anonymising proxies and TOR use the same relaying idea to hide who is talking to whom.)</p>
 <p>The model below applies the book's ACL (Table 8.6) to a few packets, including a crafted ACK.</p>`,
 widget: widgetFirewall},
{id: "ids", title: "Intrusion detection systems", ref: "§8.9.2 · pp. 675–679",
 gist: "An IDS looks deeper than headers and across many packets to spot attacks; an IPS also blocks them. Signature-based systems match known attacks; anomaly-based ones flag unusual traffic.",
 body: `<p>Packet filters only look at headers, one packet at a time. Detecting attacks such as <b>port scans</b>, <b>network mapping</b>, worms, malware and <b>DoS</b> floods needs <b>deep packet inspection</b> (looking at contents) and <b>correlation across many packets</b>. An <b>intrusion detection system (IDS)</b> does this and raises alerts; an <b>intrusion prevention system (IPS)</b> also blocks the suspicious traffic.</p>
 <p>An organisation may place several IDS sensors: a high-security internal network behind a firewall, and a lower-security <b>demilitarised zone (DMZ)</b> for public servers. Spreading the work over several sensors also keeps up with high traffic rates.</p>
 <ul>
 <li><b>Signature-based</b>: compares traffic with a database of known attack <b>signatures</b> (patterns in header fields and contents, or sequences of packets). Accurate for known attacks but blind to new ones, and expensive to match everything at high speeds.</li>
 <li><b>Anomaly-based</b>: learns a profile of normal traffic and flags statistically unusual traffic (e.g. a sudden rise in ICMP or port scans). Can catch new attacks, but telling normal from abnormal is hard, so most deployed systems are mainly signature-based.</li>
 </ul>
 <p><b>Snort</b> is a popular open-source, signature-based IDS: it sniffs packets with libpcap and matches them against a large set of community rules, for example one that alerts on any ICMP echo request arriving from outside.</p>
 <p><b>Firewalls and IDSs complement each other.</b> The firewall controls what may enter or leave; the IDS watches what gets through (and what is attempted) for signs of attack.</p>`},
],
glossary: [
  ["Confidentiality", "Only the sender and intended receiver understand the message."],
  ["Message integrity", "The receiver can detect whether a message was changed."],
  ["End-point authentication", "Each side confirms the other's identity."],
  ["Operational security", "Protecting an organisation's network from attack, including keeping services available."],
  ["Availability", "Legitimate users can still reach the service; what a DoS attack threatens."],
  ["Plaintext / ciphertext", "The original message / its encrypted form."],
  ["Symmetric-key cryptography", "Sender and receiver share the same secret key."],
  ["Caesar cipher", "Shift every letter k places; only 25 keys."],
  ["Monoalphabetic cipher", "Any one-to-one letter substitution; 26! keys but broken by letter frequencies."],
  ["Ciphertext-only / known-plaintext / chosen-plaintext attack", "What Trudy knows: only ciphertext / some matching pairs / she can get chosen plaintexts encrypted."],
  ["Block cipher", "Encrypts fixed-size blocks under a key, simulating a random permutation."],
  ["DES", "Data Encryption Standard: 64-bit blocks, 56-bit key; now too weak."],
  ["AES", "Advanced Encryption Standard: 128-bit blocks, 128/192/256-bit keys."],
  ["Cipher block chaining (CBC)", "XOR each plaintext block with the previous ciphertext block (starting from an IV) so repeated blocks encrypt differently."],
  ["Public-key cryptography", "Each party has a public key K⁺ for others to use and a private key K⁻ only they know."],
  ["RSA", "Public-key system from primes p, q: n = pq, z = (p−1)(q−1), ed mod z = 1; c = mᵉ mod n."],
  ["Session key", "A fresh symmetric key for one session, often sent encrypted with a public key."],
  ["Cryptographic hash function", "Fixed-size digest of any message; finding collisions must be infeasible. E.g. MD5 (128 bits), SHA-1 (160 bits)."],
  ["MAC / HMAC", "Message authentication code H(m + s) using a shared secret s; HMAC is the standard construction."],
  ["Digital signature", "K⁻(H(m)): verifiable, non-forgeable proof of who signed a document."],
  ["Certification authority (CA)", "Trusted party that verifies identities and signs certificates."],
  ["Certificate", "A public key and its owner's identity, signed by a CA (X.509 format)."],
  ["Nonce", "A number used only once in a lifetime; shows the other party is live."],
  ["Playback attack", "Recording a valid message (such as a login) and resending it later."],
  ["Man-in-the-middle attack", "Trudy poses as each party to the other, relaying and reading their messages."],
  ["PGP", "Pretty Good Privacy: secure e-mail with session keys, public keys and signatures; web of trust."],
  ["TLS", "Transport Layer Security: handshake, four keys, HMAC-protected encrypted records on top of TCP."],
  ["Pre-master secret / master secret", "TLS: random value the client sends encrypted / value derived from it and the nonces, from which the keys come."],
  ["IPsec", "Network-layer security for IP datagrams between hosts or routers."],
  ["AH / ESP", "IPsec protocols: authentication and integrity / plus confidentiality (protocol 50)."],
  ["Security association (SA)", "One-way logical connection holding IPsec algorithms, keys and state; found by its SPI in the SAD."],
  ["Tunnel / transport mode", "IPsec protects the whole datagram inside a new one / only the original payload."],
  ["IKE", "Internet Key Exchange: sets up IPsec SAs automatically."],
  ["VPN", "Virtual private network: private traffic carried securely over the public Internet."],
  ["WEP / WPA2 / WPA3", "Broken original Wi-Fi security / AES-based standard / its 2018 successor."],
  ["Authentication server (AS)", "Authenticates Wi-Fi devices and derives session keys with them; the AP relays."],
  ["EAP / EAPoL / RADIUS", "Extensible Authentication Protocol / EAP over the wireless LAN / protocol carrying it from AP to AS."],
  ["AKA", "4G/5G Authentication and Key Agreement between the device, the visited MME and the home HSS."],
  ["Firewall", "Isolates an internal network from the Internet, allowing some packets and blocking others."],
  ["Packet filter / ACL", "Stateless firewall checking each datagram's headers against an access control list."],
  ["Stateful packet filter", "Also tracks open TCP connections in a connection table."],
  ["Application gateway", "Application-specific relay (proxy) that can make per-user decisions."],
  ["IDS / IPS", "Intrusion detection system (alerts) / intrusion prevention system (also blocks)."],
  ["Signature-based / anomaly-based IDS", "Matches known attack patterns / flags traffic that differs from normal."],
  ["DMZ", "Demilitarised zone: a lower-security network segment for public servers."],
  ["Snort", "Popular open-source, signature-based IDS."],
],
};
