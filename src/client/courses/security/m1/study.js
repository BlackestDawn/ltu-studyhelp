// Reading-first material for security module 1: summary, study notes and key terms.
import { widgetModes, widgetHashForge } from "../../../secwidgets.js";

export default {
summary: {
  big: `<p>Computer security is about protecting <b>assets</b> (hardware, software, data, and communication facilities and networks) so that they keep three properties: <b>confidentiality</b>, <b>integrity</b> and <b>availability</b>, the CIA triad. <b>Threat agents</b> exploit <b>vulnerabilities</b> through <b>attacks</b>, which creates <b>risk</b>; owners answer with <b>countermeasures</b> that prevent, detect or recover.</p>
  <p>Cryptography is the main building block. A <b>secure hash function</b> squeezes any message into a short, fixed-size digest that is one-way and collision resistant. That makes it useful for integrity checks, commitments, salted password storage and timestamping. Add a secret key the right way, as <b>HMAC</b>, and the digest also proves who made it.</p>
  <p><b>Symmetric encryption</b> gives confidentiality with one shared key. Classical ciphers fall to frequency analysis; modern <b>block ciphers</b> (DES, Triple DES, AES) encrypt one block at a time. <b>Modes of operation</b> (ECB, CBC, CFB, OFB, CTR) chain blocks so patterns don't show, with <b>padding</b> and <b>IVs</b> that must be handled correctly. Quiz 1 tests all five modes by hand on a 4-bit cipher.</p>`,
  takeaways: [
    "<b>CIA triad</b>: confidentiality (no unauthorised disclosure; includes privacy), integrity (only authorised changes; data and system integrity), availability (timely, reliable access). <b>Authenticity</b> and <b>non-repudiation</b> build on them.",
    "<b>Owners</b> value <b>assets</b>; <b>threat agents</b> give rise to <b>threats</b> that exploit <b>vulnerabilities</b> in <b>attacks</b>; <b>risk</b> measures exposure; <b>countermeasures</b> prevent, detect or recover, guided by a <b>security policy</b>.",
    "Attacks are <b>active</b> (alter resources) or <b>passive</b> (only learn), <b>inside</b> or <b>outside</b>. RFC 4949's four consequences: <b>unauthorized disclosure</b>, <b>deception</b>, <b>disruption</b>, <b>usurpation</b>.",
    "A <b>hash</b> maps any input to a fixed-size digest. Secure hashes need <b>preimage</b>, <b>second-preimage</b> and <b>collision</b> resistance; collisions are found in about 2<sup>n/2</sup> tries (birthday bound).",
    "<b>MD5</b> and <b>SHA-1</b> (160 bits) have broken collision resistance; <b>SHA-2</b> (SHA-256/384/512) is current; <b>SHA-3</b> (2015) uses a different construction as a backup.",
    "Store passwords as <b>salted, iterated hashes</b>: the salt defeats dictionary precomputation and rainbow tables; many rounds slow brute force.",
    "A <b>MAC</b> needs a shared secret. <b>H(K ‖ M)</b> falls to <b>length extension</b>; <b>HMAC</b> = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ M)) does not.",
    "Classical ciphers: <b>monoalphabetic</b> substitution keeps letter frequencies, <b>transposition</b> keeps them too, <b>polyalphabetic</b> flattens them. Frequency analysis of letters, bigrams and trigrams breaks the first.",
    "<b>DES</b>: 64-bit blocks, 56-bit key, 16 rounds; <b>Triple DES</b> runs it three times; <b>AES</b>: 128-bit blocks, 128/192/256-bit keys.",
    "<b>ECB</b> leaks repeated blocks; <b>CBC</b> chains ciphertext (sequential encryption, parallel decryption); <b>CFB</b>, <b>OFB</b> and <b>CTR</b> make a key stream (no padding); <b>CTR</b> is fully parallel.",
    "<b>PKCS#5</b> pads with n bytes of value n, a full block if the length already fits. <b>IVs</b> must be unique and unpredictable; authenticated modes (<b>GCM</b>, <b>CCM</b>, <b>OCB</b>) add integrity.",
  ],
  formulas: [
    ["C<sub>i</sub> = E(K, P<sub>i</sub>)", "ECB: every block encrypted on its own.", "Quiz 1, ECB part.",
      [["P<sub>i</sub>, C<sub>i</sub>", "plaintext and ciphertext block i"], ["E(K, ·)", "the block cipher under key K (in the quiz: the table)"]]],
    ["C<sub>i</sub> = E(K, P<sub>i</sub> ⊕ C<sub>i−1</sub>),&nbsp; C<sub>0</sub> = IV", "CBC encryption; decrypt with P<sub>i</sub> = D(K, C<sub>i</sub>) ⊕ C<sub>i−1</sub>.", "Quiz 1, CBC part; decrypting CBC.",
      [["IV", "initialisation vector, used for the first block"], ["⊕", "bitwise XOR"], ["D", "the inverse of E (read the table backwards)"]]],
    ["C<sub>i</sub> = P<sub>i</sub> ⊕ E(K, C<sub>i−1</sub>),&nbsp; C<sub>0</sub> = IV", "CFB: encrypt the previous ciphertext, XOR with the plaintext. Decrypt: P<sub>i</sub> = C<sub>i</sub> ⊕ E(K, C<sub>i−1</sub>).", "Quiz 1, CFB part.",
      [["E(K, C<sub>i−1</sub>)", "the key stream block; uses E even when decrypting"]]],
    ["O<sub>i</sub> = E(K, O<sub>i−1</sub>),&nbsp; O<sub>0</sub> = IV,&nbsp; C<sub>i</sub> = P<sub>i</sub> ⊕ O<sub>i</sub>", "OFB: the key stream is the IV encrypted again and again.", "Quiz 1, OFB part.",
      [["O<sub>i</sub>", "output (key stream) block i, independent of the plaintext"]]],
    ["C<sub>i</sub> = P<sub>i</sub> ⊕ E(K, ctr<sub>i</sub>),&nbsp; ctr<sub>i</sub> = IV + i − 1", "CTR: encrypt successive counter values. (The practice uses IV, IV + 1, IV + 2.)", "Quiz 1, CTR part.",
      [["ctr<sub>i</sub>", "counter for block i, wrapping around at the block size"]]],
    ["n = B − (len mod B)", "PKCS#5: add n bytes, each of value n.", "Working out padding and ciphertext sizes.",
      [["B", "block size in bytes (16 for AES, 8 for DES)"], ["len", "plaintext length in bytes"], ["n", "1 … B; a full block when len is a multiple of B"]]],
    ["HMAC(K, M) = H[(K<sup>+</sup> ⊕ opad) ‖ H[(K<sup>+</sup> ⊕ ipad) ‖ M]]", "Keyed-hash MAC: inner hash with one derived key, outer hash with another.", "Explaining how HMAC works or why it resists length extension.",
      [["K<sup>+</sup>", "key padded with zeros to the hash's block size b"], ["ipad, opad", "0x36 and 0x5C repeated b/8 times"], ["‖", "concatenation"]]],
    ["H<sub>i</sub> = (H<sub>i−1</sub> &lt;&lt;) ⊕ M<sub>i</sub>,&nbsp; H<sub>0</sub> = 0", "The lecture's naive hash: rotate, then XOR in the next block.", "Showing why a simple hash is not second-preimage resistant.",
      [["&lt;&lt;", "circular shift: the last bit moves to the front"], ["M<sub>i</sub>", "message block i"]]],
    ["collision ≈ 2<sup>n/2</sup>,&nbsp; preimage ≈ 2<sup>n</sup>", "Brute-force effort against an n-bit hash (birthday attack for collisions).", "Comparing hash strengths; why SHA-256 gives 128-bit security.",
      [["n", "digest length in bits"]]],
  ],
  traps: [
    "Saying encryption gives integrity: a ciphertext can be changed (try flipping bits in OFB) without anyone noticing. Integrity needs a MAC or authenticated encryption.",
    "Confusing <b>second-preimage</b> resistance (match a <i>given</i> message's hash) with <b>collision</b> resistance (find <i>any</i> two messages that match).",
    "Thinking a salt must be secret: it is stored in the clear next to the hash; it works by making precomputation useless.",
    "Using H(key ‖ message) as a MAC: it is open to length extension with MD5, SHA-1 and SHA-2.",
    "In CBC and CFB, chaining the <i>plaintext</i> instead of the previous <i>ciphertext</i> block.",
    "In CFB, XORing the plaintext with the IV itself: XOR with <b>E(IV)</b>.",
    "Using the inverse table D when decrypting CFB, OFB or CTR: these only ever use E.",
    "Forgetting the extra full block of PKCS#5 padding when the plaintext is already a multiple of the block size.",
    "Copying the slide's CFB example: its third block should be 0101, not 0001 (E(0010) = 1110, and 1011 ⊕ 1110 = 0101).",
    "Reusing an IV or counter with the same key in OFB or CTR: both messages get the same key stream, so C<sub>1</sub> ⊕ C<sub>2</sub> = P<sub>1</sub> ⊕ P<sub>2</sub>.",
  ],
},
notes: [
{id: "cia", title: "What computer security protects", ref: "§1.1 · pp. 24–31",
 gist: "Security means keeping system assets confidential, intact and available. Authenticity and non-repudiation extend the triad.",
 body: `<p>NIST (NISTIR 7298) defines computer security as <i>measures and controls that ensure confidentiality, integrity, and availability of information system assets, including hardware, software, firmware, and information being processed, stored and communicated</i>. The definition has three parts: the <b>objectives</b> (CIA), the <b>assets</b>, and the <b>actions</b> on information (process, store, communicate).</p>
 <ul>
 <li><b>Confidentiality</b>: preserving authorised restrictions on access and disclosure. <b>Data confidentiality</b> keeps private information from unauthorised people; <b>privacy</b> lets individuals control what is collected about them and who sees it. Main tool: encryption.</li>
 <li><b>Integrity</b>: guarding against improper modification or destruction. <b>Data integrity</b> means information and programs change only in authorised ways; <b>system integrity</b> means the system performs its function unimpaired. Main tool: cryptographic hashing (with a key, a MAC).</li>
 <li><b>Availability</b>: timely, reliable access for authorised users. It can be lost maliciously (DDoS) or by accident (hardware failure, power outage, bugs). Main tool: redundancy.</li>
 </ul>
 <p>The book adds two more: <b>authenticity</b> (being genuine and verifiable: users are who they say, inputs come from trusted sources) and <b>accountability</b> (actions can be traced to an entity). The lecture shows how services build on each other: confidentiality and integrity support <b>authentication</b>, and authentication supports <b>non-repudiation</b>, the impossibility of denying an act, which digital signatures provide.</p>
 <p><b>Assets</b> fall into four groups: <b>hardware</b>, <b>software</b>, <b>data</b> (including security data such as password files), and <b>communication facilities and networks</b>. Digital assets are where critical and financial data live today.</p>`},
{id: "threats", title: "Threats, vulnerabilities and attacks", ref: "§1.2 · pp. 31–37",
 gist: "Threat agents exploit vulnerabilities through attacks. RFC 4949 sorts threats by consequence: disclosure, deception, disruption and usurpation.",
 body: `<p><b>How the concepts fit together</b> (the lecture's diagram): <b>owners</b> value <b>assets</b> and wish to minimise <b>risk</b>. <b>Threat agents</b> (individuals, groups, organisations or governments) wish to abuse or damage assets; they give rise to <b>threats</b> (any circumstance that could cause harm) that exploit <b>vulnerabilities</b> (weaknesses in systems, procedures, controls or implementation). A threat carried out is an <b>attack</b>. Owners impose <b>countermeasures</b> to reduce risk.</p>
 <p>A vulnerable system can become <b>corrupted</b> (does the wrong thing: integrity), <b>leaky</b> (someone gets information they shouldn't: confidentiality) or <b>unavailable or very slow</b> (availability). Complexity is the source of most vulnerabilities: open ports, services behind the firewall, code that parses incoming data, SQL and web forms, and employees open to social engineering.</p>
 <p><b>Kinds of attack</b>: <b>active</b> (alters resources or their operation) vs <b>passive</b> (learns without affecting resources), and <b>inside</b> (an authorised entity misusing access) vs <b>outside</b> (an unauthorised user, from pranksters to organised crime).</p>
 <div class="tblwrap"><table><thead><tr><th>RFC 4949 consequence</th><th>Threat actions</th><th>Threatens</th></tr></thead><tbody>
 <tr><td><b>Unauthorized disclosure</b>: access to data without authorisation</td><td>exposure, interception, inference, intrusion</td><td>confidentiality</td></tr>
 <tr><td><b>Deception</b>: an authorised entity receives false data and believes it</td><td>masquerade, falsification, repudiation</td><td>system or data integrity</td></tr>
 <tr><td><b>Disruption</b>: correct operation is interrupted or prevented</td><td>incapacitation, corruption, obstruction</td><td>availability or system integrity</td></tr>
 <tr><td><b>Usurpation</b>: an unauthorised entity controls services</td><td>misappropriation (e.g. theft of service), misuse</td><td>system integrity</td></tr>
 </tbody></table></div>
 <p><b>Threats per asset</b> (book Table 1.3): hardware can be stolen or disabled (A), an unencrypted USB drive stolen (C), or firmware tampered with (I). Software can be deleted (A), copied without authorisation (C), or modified to fail or do something unintended (I). Data can be deleted (A), read or inferred from statistics (C), or modified and fabricated (I). Communication lines can have messages destroyed or links made unavailable (A), messages read or traffic patterns observed (C), and messages modified, delayed, reordered, duplicated or fabricated (I).</p>`},
{id: "countermeasures", title: "Security services and countermeasures", ref: "§1.3–1.6 · pp. 37–48",
 gist: "Countermeasures prevent, detect or recover. Security services combine, and cryptography supplies the mechanisms, but only if keys are handled well.",
 body: `<p>A <b>countermeasure</b> is any device or technique that deals with a security risk:</p>
 <ul><li><b>Preventive</b>: stop attacks succeeding (encryption, access control, firewalls).</li><li><b>Detective</b>: notice attacks when prevention fails (intrusion detection, audit logs, integrity checks).</li><li><b>Recovery</b>: restore after an attack (backups, redundancy, incident response).</li></ul>
 <p>A <b>security policy</b> defines and constrains the allowed activities, so the system stays in a secure state. Countermeasures can introduce new vulnerabilities, and residual risk always remains.</p>
 <p>The lecture divides the scope into three areas: <b>user access</b> (identify, authenticate, authorise, audit: Module 4), <b>system and data</b> (protect information and correct operation) and <b>communication</b> (confidentiality, integrity and peer authentication between systems). The combination and strength of services should match the <b>threat model</b>.</p>
 <p>The book's <b>design principles</b> (§1.4) are worth recognising: economy of mechanism, fail-safe defaults, complete mediation, open design (security must not depend on a secret algorithm), separation of privilege, <b>least privilege</b>, least common mechanism, psychological acceptability, isolation, encapsulation, modularity, layering and least astonishment. The <b>attack surface</b> (§1.5) is everything reachable and exploitable: network, software and human.</p>
 <p><b>Cryptography is the building block.</b> The rest of the course uses: hash functions; symmetric ciphers for speed; MACs built from hashes; expensive public-key encryption, signatures and Diffie-Hellman only for authentication and key exchange; key derivation functions; and keys, nonces and random number generators.</p>
 <p class="callout ex"><b>When strong cryptography fails</b> (lecture example): eight P-384 elliptic-curve private keys used by a certificate authority had values below 256, one of them just 4. Since the generator G is public, an attacker can try 1G, 2G, 3G, 4G … and match the public key in seconds. The algorithm wasn't broken; key handling was. A strong algorithm cannot protect a weak or predictable key.</p>`},
{id: "hash", title: "Hash functions and their security properties", ref: "§21.1, §2.2 · pp. 657–662, 59–67",
 gist: "A hash maps any input to a fixed-size digest. To be secure it must be one-way, second-preimage resistant and collision resistant.",
 body: `<p>A hash function maps data of <b>arbitrary size</b> to a <b>fixed-size</b> digest (for example 256 bits), like <code>x mod 2</code> maps every number to 0 or 1. Because there are far more inputs than outputs, collisions must exist; security means they are infeasible to <i>find</i>.</p>
 <p><b>Iterated construction (Merkle–Damgård).</b> Split the padded message into fixed-size blocks. Feed the first block and a fixed constant (IV) to a compression function; feed each next block with the previous output; the last output is the digest. MD5, SHA-1 and SHA-2 work this way.</p>
 <p><b>A naive hash and why it fails.</b> The lecture's hash rotates the running value and XORs in each block: <code>H = ((M1 &lt;&lt; ⊕ M2) &lt;&lt; ⊕ M3)</code>, where <code>&lt;&lt;</code> moves the last bit to the front. It mixes bits well enough for error detection, but an attacker can append any block M4 and then one more block M? chosen so the hash returns to the original value. Try it below.</p>
 <p><b>Six properties</b> (for message authentication):</p>
 <ol>
 <li>H can be applied to a block of data of any size.</li>
 <li>H produces a fixed-length output.</li>
 <li>H(x) is easy to compute for any x.</li>
 <li><b>Preimage resistant (one-way)</b>: for a given h it is infeasible to find x with H(x) = h.</li>
 <li><b>Second-preimage resistant (weak collision resistance)</b>: for a given x it is infeasible to find y ≠ x with H(y) = H(x).</li>
 <li><b>Collision resistant (strong collision resistance)</b>: it is infeasible to find <i>any</i> pair x ≠ y with H(x) = H(y).</li>
 </ol>
 <p>Brute force needs about 2<sup>n</sup> tries for a preimage but only about <b>2<sup>n/2</sup></b> for a collision (the birthday attack), so a 256-bit hash gives 128-bit collision security.</p>
 <p><b>Collisions matter</b>: if two certificate requests (or a legitimate and a malicious program) had the same hash, a CA's signature on one would also be valid for the other.</p>
 <div class="tblwrap"><table><thead><tr><th>Algorithm</th><th>Digest</th><th>Status</th></tr></thead><tbody>
 <tr><td>MD2, MD4</td><td>128</td><td>severely broken, obsolete</td></tr>
 <tr><td>MD5 (Rivest)</td><td>128</td><td>collisions practical; still one-way</td></tr>
 <tr><td>SHA-0</td><td>160</td><td>withdrawn because of a flaw</td></tr>
 <tr><td>SHA-1 (NSA, NIST)</td><td>160</td><td>collision found in 2017 (2<sup>69</sup> attack already in 2005)</td></tr>
 <tr><td>SHA-2: SHA-224/256/384/512</td><td>224–512</td><td>secure; same structure as SHA-1; SHA-512 uses 1024-bit blocks and 80 rounds</td></tr>
 <tr><td>SHA-3 (2015, FIPS 202)</td><td>224–512</td><td>secure; different construction, a complement to SHA-2</td></tr>
 </tbody></table></div>
 <p>On Linux: <code>md5sum</code>, <code>sha256sum</code>, <code>sha512sum</code>, or <code>openssl dgst -sha256 file</code>; in code, Python's <code>hashlib</code> or OpenSSL's <code>openssl/sha.h</code>.</p>`,
 widget: widgetHashForge},
{id: "hashuse", title: "Using hashes: integrity, commitments, passwords, timestamps", ref: "Lecture 2 · §2.2, §3.2 · pp. 59–67",
 gist: "A digest is a small token that stands for the whole message: change one bit and it changes. That supports integrity checks, commitments, password storage and timestamps.",
 body: `<ul>
 <li><b>Integrity verification</b>: changing one bit changes the hash, so publish or store the digest and compare later. Used to detect changed system files and corrupted downloads.</li>
 <li><b>Committing to a secret without revealing it</b>: publish H(prediction) now and the prediction later; anyone can check it matches (the stock-market example). This relies on the one-way property.</li>
 <li><b>Password verification</b>: never store passwords in plaintext. Linux stores entries in <code>/etc/shadow</code> as <code>$algorithm$salt$hash</code>, with the salt and hash encoded as printable characters, and the hash computed over <b>many rounds</b> to slow brute force.</li>
 <li><b>Trusted timestamping</b>: prove a document existed by a date, either by publishing its hash in a newspaper or by having a <b>Time Stamping Authority</b> sign the hash.</li>
 <li><b>Message authentication</b> (HMAC, next section) and even encryption (as a key-stream generator).</li>
 </ul>
 <p><b>Why salt?</b> Hashing is deterministic, so identical passwords give identical hashes. The stored value is <code>hash<sup>rounds</sup>(salt ‖ password)</code> with a random salt per entry. This defeats:</p>
 <ul><li>the <b>dictionary attack</b> with precomputed hashes: hash a list of candidate words once and compare against every stolen hash;</li>
 <li>the <b>rainbow table attack</b>: a huge precomputed table of hash/password pairs for common passwords.</li></ul>
 <p>Both depend on “same password, same hash”. With a salt, the attacker must redo the work for every salt value, and users with the same password no longer stand out. The salt is not secret. (The old UNIX scheme used a 12-bit salt, multiplying the work by 4096.)</p>`},
{id: "hmac", title: "Message authentication codes and HMAC", ref: "§21.2 · pp. 663–666",
 gist: "A MAC adds a shared secret to the hash so a man in the middle can't recompute it. HMAC is the safe way to do that with any hash function.",
 body: `<p>On a network, a <b>man in the middle</b> can intercept and modify data. Attaching H(m) doesn't help: the attacker changes m and recomputes the hash. Sender and receiver need a <b>shared secret key</b> in the computation, so only they can produce a valid tag. That gives <b>integrity</b> and <b>authentication</b> of the message (though not non-repudiation, since both know the key).</p>
 <p><b>Length extension.</b> Simply hashing key ‖ message is not safe. With a Merkle–Damgård hash, the tag H(K ‖ M) <i>is</i> the internal state after the last block. An attacker who knows the tag, the message and the key length (easy to guess) can continue hashing: <code>H(K ‖ M ‖ padding ‖ malicious data)</code> is a valid tag, computed without ever knowing K.</p>
 <p><b>HMAC</b> (RFC 2104) nests two hashes:</p>
 <ol>
 <li>Pad the key K with zeros to the block size b: K<sup>+</sup>.</li>
 <li>Inner hash: <code>H((K<sup>+</sup> ⊕ ipad) ‖ M)</code>, with ipad = 0x36 repeated.</li>
 <li>Outer hash: <code>H((K<sup>+</sup> ⊕ opad) ‖ inner hash)</code>, with opad = 0x5C repeated.</li>
 </ol>
 <p>The attacker only sees the outer hash, so there is no state to extend. The XORs flip different halves of the key's bits, in effect deriving two keys from K. HMAC treats the hash as a black box, so a broken hash can be swapped for a better one. It costs about three extra hash executions, and its security is <b>provably</b> tied to the strength of the embedded hash. Forging needs about 2<sup>n/2</sup> messages <i>observed under the same key</i>, which is why even HMAC-MD5 was long considered acceptable. HMAC is mandatory in IPsec and used in TLS.</p>
 <p><b>Authenticated encryption</b> (§21.3) combines both jobs in one mode: GCM (Galois/Counter Mode), CCM (Counter with CBC-MAC) and OCB (Offset Codebook) encrypt and produce an authentication tag in one pass.</p>`},
{id: "classic", title: "Symmetric encryption and classical ciphers", ref: "§20.1, §2.1 · pp. 628–633, 53–59",
 gist: "One shared key encrypts and decrypts. Classical substitution keeps letter frequencies, so frequency analysis breaks it; polyalphabetic ciphers do better.",
 body: `<p><b>Symmetric (secret-key) encryption</b> has five parts: plaintext, encryption algorithm, secret key, ciphertext and decryption algorithm. Security needs a strong algorithm and a secret key; the algorithm itself is public. Attacks are <b>cryptanalysis</b> (exploit the algorithm's structure and known plaintext) or <b>brute force</b> (try every key; on average half the key space).</p>
 <p><b>Substitution and transposition</b>, from the lecture's “attackatdawn” examples:</p>
 <ul>
 <li><b>Monoalphabetic substitution</b>: one fixed mapping (attackatdawn → dwwdfndwgdzq). Hides the letters, not their frequencies.</li>
 <li><b>Transposition (permutation)</b>: rearrange the letters (→ atcawtkatdan). Hides order, not frequency.</li>
 <li><b>Polyalphabetic</b>: the substitution changes with position, for example a Vigenère key “lemon” (→ lxfopvefrnhr). Hides frequency and partly order.</li>
 </ul>
 <p><b>Frequency analysis</b> breaks monoalphabetic ciphers: the most common English letters are E, T, A, O, I; common bigrams TH, HE, IN, ER; trigrams THE, AND, ING. Map the most frequent ciphertext symbols to these, apply the partial mapping, and fill in the rest from context.</p>`},
{id: "des", title: "Block ciphers: DES, Triple DES and AES", ref: "§20.2–20.4 · pp. 633–644",
 gist: "Block ciphers encrypt fixed-size blocks through many rounds of substitution and permutation. DES's 56-bit key is too short; Triple DES and AES replaced it.",
 body: `<p><b>DES</b> (1977) is a block cipher: it only encrypts one 64-bit block.</p>
 <ul>
 <li><b>64-bit blocks</b>, <b>56-bit key</b> (a 64-bit key is fed in, 8 bits are parity).</li>
 <li>An initial <b>permutation</b> of the block, then <b>16 rounds</b>, each with its own round key derived from the master key.</li>
 <li>Each round (a Feistel structure) splits the block into 32-bit halves L and R, runs R and the round key through a substitution function, XORs the result into L, and swaps the halves.</li>
 </ul>
 <p>Theoretical attacks never became practical; the real problem is the short key, which brute force can now search. <b>Triple DES</b> applies DES three times to each block (encrypt–decrypt–encrypt with two or three keys, 112 or 168 bits), at three times the cost and still with 64-bit blocks.</p>
 <p><b>AES</b> (2001) is the current standard: <b>128-bit blocks</b> and keys of <b>128, 192 or 256 bits</b> (10, 12 or 14 rounds). It is fast in hardware and software.</p>
 <p><b>Stream ciphers</b> (§20.4) such as RC4 XOR the plaintext with a pseudorandom key stream one byte at a time. The modes CFB, OFB and CTR turn a block cipher into a stream cipher.</p>
 <p>With openssl: <code>openssl enc -aes-128-cbc -e -in plain.txt -out cipher.bin -K &lt;key hex&gt; -iv &lt;iv hex&gt;</code>; use <code>-d</code> to decrypt and <code>-aes-128-ecb</code> (no IV) for ECB.</p>`},
{id: "modes", title: "Modes of operation", ref: "§20.5 · pp. 644–650",
 gist: "A mode says how to use a block cipher on many blocks. ECB leaks patterns; CBC chains; CFB, OFB and CTR make a key stream.",
 body: `<p>A mode of operation makes the input to the block cipher different for each block, so that equal plaintext blocks don't give equal ciphertext.</p>
 <div class="tblwrap"><table><thead><tr><th>Mode</th><th>Encrypt</th><th>IV</th><th>Padding</th><th>Parallel</th><th>A flipped ciphertext bit…</th></tr></thead><tbody>
 <tr><td><b>ECB</b></td><td>C<sub>i</sub> = E(P<sub>i</sub>)</td><td>no</td><td>yes</td><td>enc + dec</td><td>garbles that block only</td></tr>
 <tr><td><b>CBC</b></td><td>C<sub>i</sub> = E(P<sub>i</sub> ⊕ C<sub>i−1</sub>)</td><td>yes</td><td>yes</td><td>dec only</td><td>garbles P<sub>i</sub>, flips the bit in P<sub>i+1</sub></td></tr>
 <tr><td><b>CFB</b></td><td>C<sub>i</sub> = P<sub>i</sub> ⊕ E(C<sub>i−1</sub>)</td><td>yes</td><td>no</td><td>dec only</td><td>flips the bit in P<sub>i</sub>, garbles P<sub>i+1</sub></td></tr>
 <tr><td><b>OFB</b></td><td>O<sub>i</sub> = E(O<sub>i−1</sub>), C<sub>i</sub> = P<sub>i</sub> ⊕ O<sub>i</sub></td><td>yes</td><td>no</td><td>no (key stream precomputable)</td><td>flips only that bit</td></tr>
 <tr><td><b>CTR</b></td><td>C<sub>i</sub> = P<sub>i</sub> ⊕ E(ctr<sub>i</sub>)</td><td>nonce</td><td>no</td><td>enc + dec</td><td>flips only that bit</td></tr>
 </tbody></table></div>
 <ul>
 <li><b>ECB</b>'s weakness: identical blocks encrypt identically, so structure shows (the outline of an encrypted picture stays visible).</li>
 <li><b>CBC</b>: the IV makes two encryptions of the same plaintext differ. Same key for every block.</li>
 <li><b>CFB</b>: a stream cipher, good for real-time data; the lecture's 21-byte file gives 32 bytes in CBC but 21 in CFB.</li>
 <li><b>OFB</b>: like CFB, but feeds back the cipher's <i>output</i>, not the ciphertext. No integrity: flipping a ciphertext bit flips exactly that plaintext bit.</li>
 <li><b>CTR</b>: encrypts a counter (prefixed with a random nonce so no key stream is ever reused). Fully parallel and precomputable; used in IPsec.</li>
 </ul>
 <p><b>Worked example from Lecture 3</b> (the same 4-bit table as Quiz 1), PT = 1011 1011 1011, IV = 1101:</p>
 <ul>
 <li>ECB: 1010 1010 1010 (identical blocks, identical output).</li>
 <li>CBC: 1011 ⊕ 1101 = 0110 → <b>0001</b>; 1011 ⊕ 0001 = 1010 → <b>0110</b>; 1011 ⊕ 0110 = 1101 → <b>1011</b>.</li>
 <li>CFB: E(1101) = 1011, 1011 ⊕ 1011 = <b>0000</b>; E(0000) = 1001, ⊕ 1011 = <b>0010</b>; E(0010) = 1110, ⊕ 1011 = <b>0101</b>. (The slide prints 0001 for the last block, which is an arithmetic slip.)</li>
 </ul>
 <p>Run any plaintext and IV through the model below; the Practice tab generates quiz-style problems.</p>`,
 widget: widgetModes},
{id: "padding", title: "Padding, IVs and common mistakes", ref: "Lecture 3 · §20.5",
 gist: "Block modes pad the last block so decryption can find where padding starts. IVs must be unique and unpredictable, or encryption leaks.",
 body: `<p><b>Padding.</b> ECB and CBC need whole blocks. <b>PKCS#5</b> (used by openssl) adds <i>n</i> bytes, each with value <i>n</i>: a 9-byte file with AES (16-byte blocks) gets seven bytes of 0x07 and becomes 16 bytes. The decryptor reads the last byte and strips that many bytes.</p>
 <p><b>Special case</b>: if the plaintext is already a multiple of the block size, a <b>full block</b> of padding is added (16 bytes of 0x10 for AES). Otherwise a 16-byte plaintext ending in seven 0x07 bytes would lose them on decryption. In the lecture, a 16-byte file encrypts to 32 bytes.</p>
 <p><b>Initialisation vectors</b> must:</p>
 <ul>
 <li>be agreed on by both sides (they are usually sent in the clear with the ciphertext);</li>
 <li><b>never repeat</b> under the same key, so equal plaintexts don't give equal ciphertexts;</li>
 <li>be <b>unpredictable</b>, generated with a cryptographically secure random number generator.</li>
 </ul>
 <p><b>Why unpredictable?</b> The lecture's voting example: Bob's vote P1 was encrypted with IV_bob. Eve knows the voting machine's next IV, IV_next. She guesses Bob voted “John Smith” and submits a write-in name P2 = guess ⊕ IV_bob ⊕ IV_next. The machine computes E(P2 ⊕ IV_next) = E(guess ⊕ IV_bob). If that equals Bob's ciphertext, her guess was right. Chaining modes (CBC, CFB) that use the last ciphertext block as the next IV are vulnerable in the same way.</p>
 <p><b>Common mistakes</b>: using ECB for structured data; reusing an IV or counter with the same key (in OFB and CTR this repeats the key stream, so XORing two ciphertexts gives the XOR of the plaintexts); predictable IVs; and assuming encryption protects integrity (OFB bit flipping). Use an authenticated mode such as <b>GCM</b>, <b>CCM</b> or <b>OCB</b> when you need both.</p>`},
],
glossary: [
  ["Computer security", "Measures and controls that ensure the confidentiality, integrity and availability of information system assets (NISTIR 7298)."],
  ["Confidentiality", "Preserving authorised restrictions on access and disclosure; includes privacy."],
  ["Integrity", "Guarding against improper modification or destruction; data integrity and system integrity."],
  ["Availability", "Timely and reliable access to information and services for authorised users."],
  ["Authenticity", "Being genuine and verifiable; users and data sources are who they claim."],
  ["Non-repudiation", "An entity can't deny an act it performed, such as sending a message; provided by digital signatures."],
  ["Asset", "A system resource worth protecting: hardware, software, data, communication facilities and networks."],
  ["Threat agent", "An individual, group, organisation or government that intends harm to assets."],
  ["Threat", "Any circumstance or event that could cause security harm to an asset."],
  ["Vulnerability", "A weakness in a system, procedure, control or implementation that could be exploited."],
  ["Attack", "A threat that is carried out; active or passive, inside or outside."],
  ["Risk", "The extent to which an entity is threatened by a potential circumstance or event."],
  ["Countermeasure", "A device or technique that deals with a risk by preventing, detecting or recovering from attacks."],
  ["Security policy", "Criteria that define and constrain allowed activities to keep the system secure."],
  ["Unauthorized disclosure / deception / disruption / usurpation", "RFC 4949's four threat consequences."],
  ["Hash function", "Maps data of any size to a fixed-size digest."],
  ["Preimage resistance", "Given h, infeasible to find x with H(x) = h (one-way)."],
  ["Second-preimage resistance", "Given x, infeasible to find y ≠ x with H(y) = H(x) (weak collision resistance)."],
  ["Collision resistance", "Infeasible to find any x ≠ y with H(x) = H(y) (strong collision resistance)."],
  ["Birthday attack", "Finding a collision in about 2^(n/2) tries for an n-bit hash."],
  ["Merkle–Damgård", "Iterated hash construction (MD5, SHA-1, SHA-2): chain a compression function over the message blocks."],
  ["MD5 / SHA-1 / SHA-2 / SHA-3", "128-bit, collisions practical / 160-bit, collision found 2017 / 224–512-bit, current / 2015, different construction."],
  ["Salt", "Random value hashed with a password so equal passwords hash differently; stored in the clear."],
  ["Rainbow table", "Precomputed table for reversing password hashes; defeated by salts."],
  ["MAC", "Message authentication code: a tag computed with a shared key that proves integrity and origin."],
  ["Length extension attack", "Extending H(K ‖ M) to a valid tag for M ‖ padding ‖ X without knowing K."],
  ["HMAC", "H((K⁺ ⊕ opad) ‖ H((K⁺ ⊕ ipad) ‖ M)); keyed hash that resists length extension."],
  ["Monoalphabetic / polyalphabetic cipher", "One fixed letter substitution / substitution that changes with position."],
  ["Transposition cipher", "Rearranges the positions of the letters."],
  ["Frequency analysis", "Breaking a substitution cipher from the frequencies of letters, bigrams and trigrams."],
  ["Block cipher", "Encrypts a fixed-size block under a key (DES: 64 bits, AES: 128 bits)."],
  ["DES / Triple DES", "64-bit blocks, 56-bit key, 16 rounds / DES applied three times."],
  ["AES", "Advanced Encryption Standard: 128-bit blocks, 128/192/256-bit keys."],
  ["ECB / CBC / CFB / OFB / CTR", "Electronic codebook / cipher block chaining / cipher feedback / output feedback / counter mode."],
  ["Initialisation vector (IV)", "Random, unique, unpredictable starting value for a chaining or stream mode."],
  ["Nonce", "A number used once; in CTR mode it is combined with the counter."],
  ["PKCS#5 padding", "Pad with n bytes of value n; a full extra block if the data already fills the last block."],
  ["Authenticated encryption", "A mode that gives confidentiality and integrity together: GCM, CCM, OCB."],
],
};
