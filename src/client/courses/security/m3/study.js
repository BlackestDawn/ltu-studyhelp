// Reading-first material for security module 3: summary, study notes and key terms.
import { widgetECC } from "../../../secwidgets.js";

export default {
summary: {
  big: `<p>Symmetric cryptography needs a shared key, and exchanging it was historically the hard part. <b>Public-key cryptography</b> gives each party a key pair: a <b>public key</b> anyone can use to encrypt to them or check their signatures, and a <b>private key</b> only they hold, to decrypt and to sign. It underpins HTTPS certificates, key exchange, and chip-card authentication.</p>
  <p><b>RSA</b> (1978) builds the pair from two large primes: n = pq, a public exponent e, and a private exponent d with ed ≡ 1 (mod φ(n)). Its security rests on how hard it is to factor n. Used raw (<b>textbook RSA</b>) it is deterministic and leaks, so real systems add <b>padding</b> (PKCS#1 v1.5, OAEP), use RSA only to protect a symmetric key (<b>hybrid encryption</b>), and <b>sign a hash</b> of the message.</p>
  <p><b>Diffie–Hellman</b> (1976) lets two strangers agree on a secret over an open channel, based on the discrete logarithm problem, but it is open to a <b>man in the middle</b> unless the exchange is authenticated. <b>Elliptic-curve cryptography</b> replaces modular powers with repeated point addition on a curve: k·G is easy, recovering k is infeasible, and a 256-bit key matches 3072-bit RSA.</p>`,
  takeaways: [
    "Encrypt with the <b>recipient's public key</b>; sign with <b>your own private key</b>. Encryption alone says nothing about who sent a message.",
    "<b>Modular arithmetic</b>: a mod n is the remainder. a and n are relatively prime if gcd = 1; then a has an <b>inverse</b> mod n, found with the <b>extended Euclidean algorithm</b>.",
    "<b>Euler's totient</b> φ(n) counts 1 … n relatively prime to n: φ(p) = p − 1, φ(pq) = (p − 1)(q − 1). <b>Euler's theorem</b>: a<sup>φ(n)</sup> ≡ 1 (mod n) when gcd(a, n) = 1.",
    "<b>RSA</b>: n = pq, choose e with gcd(e, φ(n)) = 1, d = e<sup>−1</sup> mod φ(n). Public (e, n), private d. C = M<sup>e</sup> mod n, M = C<sup>d</sup> mod n, for M < n.",
    "<b>Textbook RSA</b> is deterministic; m<sup>e</sup> &lt; n can be undone with an ordinary root; m ≥ n comes back as m mod n; the same m sent to e recipients falls to the Chinese remainder theorem.",
    "<b>PKCS#1 v1.5</b>: 00 ‖ BT ‖ random nonzero bytes ‖ 00 ‖ M (BT = 02 for encryption). <b>OAEP</b> masks the message with values derived from a random seed via hash functions.",
    "<b>Signature</b>: s = H(M)<sup>d</sup> mod n; verify s<sup>e</sup> mod n = H(M). Gives authentication, integrity and <b>non-repudiation</b>.",
    "<b>Diffie–Hellman</b>: public p, g; A = g<sup>x</sup>, B = g<sup>y</sup> mod p; K = B<sup>x</sup> = A<sup>y</sup> = g<sup>xy</sup> mod p. Secure against eavesdroppers (discrete log), not against a MITM.",
    "<b>Elliptic curves</b> y² = x³ + ax + b over GF(p): point addition (chord), doubling (tangent), all mod p. Public key Q = k·G, private key k.",
    "<b>ECDH</b>: shared secret d<sub>A</sub>·Q<sub>B</sub> = d<sub>B</sub>·Q<sub>A</sub>. <b>ECDSA</b> signs with a pair (r, s). ECC: smaller keys, faster, ideal for constrained devices.",
  ],
  formulas: [
    ["n = pq,&nbsp; φ(n) = (p − 1)(q − 1)", "RSA modulus and its totient.", "First step of every RSA question.",
      [["p, q", "distinct primes, kept secret"], ["φ(n)", "Euler's totient of n"]]],
    ["e·d ≡ 1 (mod φ(n))", "d is the multiplicative inverse of e mod φ(n); needs gcd(e, φ(n)) = 1.", "Finding the private exponent (extended Euclid).",
      [["e", "public exponent, 1 &lt; e &lt; φ(n)"], ["d", "private exponent"]]],
    ["C = M<sup>e</sup> mod n,&nbsp; M = C<sup>d</sup> mod n", "RSA encryption with the public key, decryption with the private key.", "Encrypting or decrypting small numbers.",
      [["M", "plaintext as a number, M &lt; n"], ["C", "ciphertext"]]],
    ["s = h<sup>d</sup> mod n,&nbsp; verify s<sup>e</sup> mod n = h", "RSA signature on digest h.", "Quiz 2: signing a digest.",
      [["h", "hash of the message as a number (0x00000009 = 9)"], ["s", "signature"]]],
    ["a<sup>k</sup> ≡ a<sup>k mod φ(n)</sup> (mod n)", "Euler reduction when gcd(a, n) = 1.", "Huge exponents, like 4<sup>100003</sup> mod 33.",
      [["k", "the exponent"], ["φ(n)", "totient of the modulus"]]],
    ["A = g<sup>x</sup>,&nbsp; B = g<sup>y</sup>,&nbsp; K = B<sup>x</sup> = A<sup>y</sup> (mod p)", "Diffie–Hellman key exchange.", "Computing public values and the shared key.",
      [["p", "public prime"], ["g", "public generator (primitive root of p)"], ["x, y", "Alice's and Bob's secrets"]]],
    ["λ = (3x<sub>1</sub><sup>2</sup> + a) / (2y<sub>1</sub>)", "Slope for doubling a point (tangent), mod p.", "Computing 2P.",
      [["a", "curve coefficient in y² = x³ + ax + b"], ["/", "multiply by the inverse mod p"]]],
    ["λ = (y<sub>2</sub> − y<sub>1</sub>) / (x<sub>2</sub> − x<sub>1</sub>)", "Slope for adding two different points (chord), mod p.", "Computing P + Q.",
      [["(x<sub>1</sub>, y<sub>1</sub>), (x<sub>2</sub>, y<sub>2</sub>)", "the two points"]]],
    ["x<sub>3</sub> = λ² − x<sub>1</sub> − x<sub>2</sub>,&nbsp; y<sub>3</sub> = λ(x<sub>1</sub> − x<sub>3</sub>) − y<sub>1</sub>", "Result of addition or doubling (for doubling, x<sub>2</sub> = x<sub>1</sub>), mod p.", "Finishing a point operation.",
      [["(x<sub>3</sub>, y<sub>3</sub>)", "the resulting point"]]],
  ],
  traps: [
    "Signing with the public key or encrypting with your own private key: <i>encrypt</i> with the recipient's public key, <i>sign</i> with your private key.",
    "Taking d mod n instead of mod φ(n).",
    "Forgetting that a digest written in hex (0x00000009) is just a number (9).",
    "Not reducing after each multiplication, so numbers explode; or forgetting to reduce negative results by adding p.",
    "Thinking Diffie–Hellman authenticates anyone: it only agrees a key, with whoever is on the other end.",
    "Dividing normally in elliptic-curve formulas: division mod p means multiplying by the modular inverse.",
    "Assuming bigger always means stronger across algorithms: 256-bit ECC ≈ 3072-bit RSA.",
    "Copying the slide's ECDSA step that takes r from the public key: r is the x-coordinate of the random point k·G.",
  ],
},
notes: [
{id: "pke", title: "Public-key cryptography", ref: "§2.3–2.4 · Lecture 5",
 gist: "Each party has a public key and a private key. Encrypt with the recipient's public key; sign with your own private key.",
 body: `<p>Historically, encryption used one shared key, and getting it to the other side (a face-to-face meeting, a courier) was the problem. In <b>1976</b> Diffie and Hellman published a key-exchange protocol and the idea of public-key cryptography; in <b>1978</b> Rivest, Shamir and Adleman published <b>RSA</b>, based on the difficulty of factoring large numbers.</p>
 <ul>
 <li><b>Encryption</b>: anyone encrypts with Bob's public key; only Bob's private key decrypts. This says nothing about who the sender was.</li>
 <li><b>Digital signature</b>: Bob applies his private key; anyone checks with his public key. Only Bob could have produced it.</li>
 <li><b>Key exchange</b>: parties obtain a shared secret key for fast symmetric encryption.</li>
 <li><b>Authentication with certificates</b>: HTTPS sites prove their identity with a certificate binding their public key to their name (the lecture's dugas.ch and chatgpt.com examples).</li>
 </ul>
 <p><b>Hybrid encryption</b>: public-key operations are expensive, so they protect only a short <b>content-encryption key</b>; the data itself is encrypted with a symmetric algorithm such as AES.</p>
 <p><b>Applications</b> from the lecture: authentication without a shared password (generate the proof with one key, verify with another); HTTPS/TLS (public keys for key exchange and authentication, secret-key encryption for the data); and <b>EMV chip cards</b>, where each card has a key pair, its public key is signed by the issuer, and the card signs each transaction with its private key so the issuer knows the cardholder approved it.</p>`},
{id: "math", title: "The arithmetic behind RSA", ref: "Lecture 5 · Appendix B",
 gist: "Modulo, relative primes, inverses, Euler's totient and Euler's theorem: the five tools for every RSA calculation.",
 body: `<p><b>Modulo</b>: a mod n is the remainder after dividing a by n (10 mod 3 = 1, 15 mod 5 = 0). It is distributive, so you can reduce after every addition and multiplication: (a·b) mod n = ((a mod n)(b mod n)) mod n.</p>
 <p><b>Relatively prime</b>: gcd(a, b) = 1, for example 28 and 15. In mod 10, the numbers 1, 3, 7 and 9 are relatively prime to 10.</p>
 <p><b>Multiplicative inverse</b>: x with a·x ≡ 1 (mod m). It exists exactly when gcd(a, m) = 1. Example: 3·7 = 21 ≡ 1 (mod 10), so 3<sup>−1</sup> = 7.</p>
 <p><b>Extended Euclidean algorithm</b>: run Euclid's algorithm (divide, keep the remainder) and track coefficients, which gives s and t with s·a + t·m = gcd(a, m). If the gcd is 1, s mod m is the inverse. For small numbers, trying multiples of m plus 1 also works: find k with (k·φ(n) + 1) divisible by e.</p>
 <p><b>Euler's totient</b> φ(n) counts the integers 1 … n relatively prime to n: φ(10) = 4 (1, 3, 7, 9), φ(7) = 6, φ(12) = 4. For a prime, φ(p) = p − 1; for relatively prime m, n, φ(mn) = φ(m)·φ(n), so φ(pq) = (p − 1)(q − 1).</p>
 <p><b>Euler's theorem</b>: if gcd(a, n) = 1 then a<sup>φ(n)</sup> ≡ 1 (mod n). Lecture example: 4<sup>100003</sup> mod 33. φ(33) = 2 × 10 = 20 and 100003 = 5000·20 + 3, so 4<sup>100003</sup> ≡ 4<sup>3</sup> = 64 ≡ 31 (mod 33).</p>
 <p><b>Fast exponentiation</b>: write the exponent in binary, square repeatedly and multiply in the powers whose bit is set (the book computes 88<sup>7</sup> = 88<sup>4</sup>·88<sup>2</sup>·88<sup>1</sup> mod 187).</p>`},
{id: "rsa", title: "RSA key generation, encryption and decryption", ref: "§21.4 · pp. 669–673",
 gist: "Pick primes p, q; n = pq; choose e relatively prime to φ(n); d is e's inverse. Encrypt with e, decrypt with d.",
 body: `<ol>
 <li>Choose two large random primes p ≠ q.</li>
 <li>n = pq (the <b>modulus</b>), and φ(n) = (p − 1)(q − 1). Then forget p and q.</li>
 <li>Choose e with 1 &lt; e &lt; φ(n) and gcd(e, φ(n)) = 1 (the public <b>exponent</b>).</li>
 <li>Find d with e·d mod φ(n) = 1 (extended Euclid).</li>
 <li>Public key PU = {e, n}; private key PR = {d, n}.</li>
 </ol>
 <p>Encrypt a plaintext M &lt; n: <code>C = M<sup>e</sup> mod n</code>. Decrypt: <code>M = C<sup>d</sup> mod n</code>. This works because e·d = 1 + k·φ(n), so M<sup>ed</sup> = M·(M<sup>φ(n)</sup>)<sup>k</sup> ≡ M.</p>
 <p><b>Requirements</b> (book): find e, d, n with M<sup>ed</sup> mod n = M for all M &lt; n; computing M<sup>e</sup> and C<sup>d</sup> must be easy; determining d from e and n must be infeasible. Computing d needs φ(n), which needs p and q, which means factoring n.</p>
 <p><b>Lecture example</b>: p = 13, q = 17, n = 221, φ(n) = 192, e = 7, d = 55. M = 36 (ASCII “$”) encrypts to 36<sup>7</sup> mod 221 = 179.</p>
 <p><b>Book example</b> (Figure 21.8): p = 17, q = 11, n = 187, φ(n) = 160, e = 7, d = 23 (7 × 23 = 161 = 160 + 1). M = 88 encrypts to 11, and 11<sup>23</sup> mod 187 = 88.</p>
 <p><b>With OpenSSL</b>: <code>openssl genrsa -aes128 -out private.pem 1024</code> creates a key pair (Base64-encoded DER), <code>openssl rsa -in private.pem -pubout &gt; public.pem</code> extracts the public key, and <code>openssl pkeyutl -encrypt / -decrypt</code> uses them.</p>`},
{id: "textbook", title: "Textbook RSA and padding", ref: "Lectures 5–6",
 gist: "Raw RSA is deterministic and leaks small or repeated messages. Padding adds structure and randomness before encryption.",
 body: `<p>Treating the plaintext as a number and applying RSA directly is <b>plain</b> or <b>textbook RSA</b>. Its weaknesses:</p>
 <ul>
 <li><b>Deterministic</b>: the same plaintext under the same public key always gives the same ciphertext, so an attacker can guess a message, encrypt it, and compare. (AES modes use random IVs to avoid this.)</li>
 <li><b>Small m and e</b>: if m<sup>e</sup> &lt; n there is no wrap-around, and C's ordinary e-th root is m. Example: n = 2000, e = 3, m = 10 gives C = 1000 and ∛1000 = 10, with no private key needed.</li>
 <li><b>m ≥ n</b>: encryption loses information, and decryption returns m mod n. Example: n = 33, e = 7, d = 3, m = 35 → C = 2<sup>7</sup> mod 33 = 29 → decrypts to 2, not 35. (A valid m = 5 gives 5<sup>7</sup> mod 33 = 14 and back to 5.)</li>
 <li><b>Same m to e or more recipients</b> with the same e but different n: the Chinese remainder theorem recovers m.</li>
 </ul>
 <p><b>PKCS#1 v1.5</b>: pad to the key's size (128 bytes for 1024-bit RSA) as <code>00 ‖ BT ‖ PS ‖ 00 ‖ M</code>. The leading 00 keeps the number below n; BT is 00 or 01 for private-key operations (signatures) and <b>02</b> for public-key encryption; PS is random nonzero bytes; the 00 delimiter marks where M starts. Weaknesses were found from 1998 (the book's Bleichenbacher attack on TLS).</p>
 <p><b>OAEP</b> (Optimal Asymmetric Encryption Padding) never copies M directly: build a data block DB = lHash ‖ PS (zeros) ‖ 01 ‖ M, mask it with MGF(seed), mask the random seed with MGF(maskedDB), and form EM = 00 ‖ maskedSeed ‖ maskedDB. It uses a hash function twice (SHA-1: 20-byte seed).</p>`},
{id: "sign", title: "Digital signatures with RSA", ref: "Lecture 5 · §2.4 · pp. 72–77",
 gist: "Sign the hash with your private key; anyone verifies with your public key. A changed bit in message or signature makes verification fail.",
 body: `<p>The RSA authors produced the first digital signature algorithm. Signing a message m directly would be <code>m<sup>d</sup> mod n</code>, which anyone can turn back into m with the public key. In practice the signer:</p>
 <ol>
 <li>computes a cryptographic hash h = H(m) (for example SHA-256);</li>
 <li>signs it with the private key: <code>s = h<sup>d</sup> mod n</code> (with padding in real systems);</li>
 <li>sends m and s.</li>
 </ol>
 <p>The verifier computes H(m) and checks <code>s<sup>e</sup> mod n = H(m)</code>. An attacker can't sign a modified message (no private key), and modifying the message changes the hash so it won't match. The lecture's experiment flips one bit of the signature file: applying the public key then gives a completely different block.</p>
 <p>Signatures provide <b>authentication</b> (who signed), <b>integrity</b> (unchanged) and <b>non-repudiation</b> (the signer can't deny it, since nobody else has the key). A MAC gives only the first two.</p>
 <p><b>Quiz 2 setting</b>: Linda signs a digest 0x00 0x00 0x00 0x09 with p = 11, q = 23. That gives n = 253 and φ(n) = 220; with the e the quiz gives you, find d and compute s = 9<sup>d</sup> mod 253. Practise it in the Practice tab.</p>`},
{id: "dh", title: "Diffie–Hellman key exchange", ref: "§21.5 · pp. 675–678",
 gist: "Exchange g^x and g^y in the open; both sides compute g^xy. Eavesdroppers face a discrete logarithm, but a man in the middle can fake both sides.",
 body: `<p>Diffie–Hellman lets parties with no prior shared knowledge agree on a secret key over an insecure channel. It only exchanges keys; it doesn't encrypt messages itself.</p>
 <ol>
 <li>Agree publicly on a big prime <b>p</b> (for example 2048 bits) and a generator <b>g</b> (a primitive root of p, often 2 or 3).</li>
 <li>Alice picks a secret x &lt; p and sends <code>A = g<sup>x</sup> mod p</code>; Bob picks y and sends <code>B = g<sup>y</sup> mod p</code>.</li>
 <li>Alice computes <code>K = B<sup>x</sup> mod p</code>, Bob computes <code>K = A<sup>y</sup> mod p</code>. Both equal g<sup>xy</sup> mod p.</li>
 </ol>
 <p><b>Example</b> (book and lecture): p = 353, g = 3, x = 97, y = 233. A = 3<sup>97</sup> mod 353 = 40, B = 3<sup>233</sup> mod 353 = 248, and K = 248<sup>97</sup> = 40<sup>233</sup> = 160 (mod 353).</p>
 <p><b>Security</b>: an eavesdropper has p, g, A and B and must compute a <b>discrete logarithm</b> (find x with g<sup>x</sup> ≡ A). With 353 she can try powers of 3; with large p it is infeasible. (The book writes q and α for p and g.)</p>
 <p><b>Man-in-the-middle attack</b>: Darth generates two private keys, intercepts A and sends Bob his own Y<sub>D1</sub>, intercepts B and sends Alice Y<sub>D2</sub>. Bob and Darth now share K1; Alice and Darth share K2. Darth decrypts each message from Alice with K2, reads or changes it, and re-encrypts it for Bob with K1. The protocol doesn't authenticate the participants; <b>digital signatures and public-key certificates</b> fix that.</p>`},
{id: "ecc", title: "Elliptic curves and point arithmetic", ref: "Lecture 6 · §21.5 · p. 679",
 gist: "Points on y² = x³ + ax + b mod p can be added and doubled. Multiplying G by k is fast; finding k again is the hard problem.",
 body: `<p>Elliptic curves in Weierstrass form: <code>y² = x³ + ax + b</code>. Over the real numbers the curve is symmetric about the x-axis, and a non-vertical line through two of its points meets it in a third. That gives an <b>addition</b>: draw the line through P and Q, take the third intersection, reflect it in the x-axis to get P + Q. <b>Doubling</b> uses the tangent at P.</p>
 <p>For cryptography: only points on the curve are valid, the operations are simple transformations of x and y, and everything is an <b>integer mod a prime p</b> (256, 384 or 521 bits in practice; 17 or 97 in the lecture). Plotted mod p, the curve becomes a scatter of points, and lines “wrap around” the edges.</p>
 <p><b>Doubling</b> P = (x<sub>1</sub>, y<sub>1</sub>): λ = (3x<sub>1</sub><sup>2</sup> + a) / (2y<sub>1</sub>). <b>Adding</b> P ≠ Q: λ = (y<sub>2</sub> − y<sub>1</sub>) / (x<sub>2</sub> − x<sub>1</sub>). Then x<sub>3</sub> = λ² − x<sub>1</sub> − x<sub>2</sub> and y<sub>3</sub> = λ(x<sub>1</sub> − x<sub>3</sub>) − y<sub>1</sub>, all mod p, with division meaning multiplication by the inverse.</p>
 <p><b>Lecture examples</b> on y² = x³ + 7 (mod 17): doubling G = (15, 13) gives λ = 675 · 26<sup>−1</sup> ≡ 12 · 2 = 24 ≡ 7, x = 49 − 30 = 19 ≡ 2, y = 7·13 − 13 = 78 ≡ 10, so 2G = (2, 10). Adding (1, 5) + (2, 7): λ = 2/1 = 2, x = 4 − 1 − 2 = 1, y = 2·0 − 5 ≡ 12, giving (1, 12).</p>
 <p><b>Scalar multiplication</b>: k·G means G + G + … + G (k times). With doubling it is fast (P → 2P → 3P → 6P → 12P → 24P → 25P → 50P → 100P), but given Q = k·G, finding k means trying G, 2G, 3G, … : the <b>elliptic-curve discrete logarithm problem</b>. The <b>order</b> n of G is the number of multiples before reaching the point at infinity O; the cofactor h = 1 means G reaches every point.</p>
 <p>Explore below: pick a small curve and a generator, and watch the multiples of G hop around the points.</p>`,
 widget: widgetECC},
{id: "ecapps", title: "ECDH, ECDSA and ECC versus RSA", ref: "Lecture 6",
 gist: "ECC keys are k (private) and k·G (public). ECDH and ECDSA mirror Diffie–Hellman and digital signatures with much smaller keys.",
 body: `<p><b>Keys</b>: the curve parameters p, a, b, the generator G, its order n and cofactor h are public. A random k is the private key; Q = k·G is the public key.</p>
 <p><b>ECDH</b>: Alice has (d<sub>A</sub>, Q<sub>A</sub> = d<sub>A</sub>·G), Bob has (d<sub>B</sub>, Q<sub>B</sub>). They exchange public keys and compute d<sub>A</sub>·Q<sub>B</sub> = d<sub>B</sub>·Q<sub>A</sub> = d<sub>A</sub>d<sub>B</sub>·G. Lecture example on y² = x³ + 2x + 2 (mod 17), G = (5, 1), n = 19: d<sub>A</sub> = 9 gives Q<sub>A</sub> = (7, 6), d<sub>B</sub> = 3 gives Q<sub>B</sub> = (10, 6), and both compute 27G = 8G = (13, 7).</p>
 <p><b>ECDSA</b> signing: hash z = H(M); pick a random k and compute the point k·G; r = its x-coordinate mod n; s = k<sup>−1</sup>(z + d·r) mod n. The signature is (r, s). Verifying: u<sub>1</sub> = z·s<sup>−1</sup>, u<sub>2</sub> = r·s<sup>−1</sup> (mod n), compute P = u<sub>1</sub>·G + u<sub>2</sub>·Q, and accept if P's x-coordinate mod n equals r. (k must be secret and never reused, or d leaks.)</p>
 <div class="tblwrap"><table><thead><tr><th></th><th>RSA</th><th>ECC</th></tr></thead><tbody>
 <tr><td>Security based on</td><td>factoring large integers</td><td>elliptic-curve discrete logarithm</td></tr>
 <tr><td>Key size for similar security</td><td>3072 bits</td><td>256 bits</td></tr>
 <tr><td>Performance</td><td>slower, bigger numbers</td><td>about 10× faster</td></tr>
 <tr><td>Resource use</td><td>high CPU and memory</td><td>low: IoT, mobile</td></tr>
 <tr><td>Adoption</td><td>legacy, widespread (TLS certificates)</td><td>growing fast (TLS 1.3, Bitcoin)</td></tr>
 </tbody></table></div>
 <p>The book notes that confidence in ECC came later than in RSA, because sustained cryptanalysis of it started later.</p>`},
],
glossary: [
  ["Public key / private key", "Key anyone may use to encrypt to you or verify your signatures / key only you hold, to decrypt and sign."],
  ["Hybrid encryption", "Public-key encryption of a symmetric content key; the data is encrypted symmetrically."],
  ["Modulus", "The n in a mod n; in RSA, n = pq."],
  ["Relatively prime", "Having greatest common divisor 1."],
  ["Multiplicative inverse", "x with a·x ≡ 1 (mod m); exists iff gcd(a, m) = 1."],
  ["Extended Euclidean algorithm", "Computes gcd(a, b) and coefficients that give the modular inverse."],
  ["Euler's totient φ(n)", "Number of integers 1 … n relatively prime to n; φ(pq) = (p − 1)(q − 1)."],
  ["Euler's theorem", "a^φ(n) ≡ 1 (mod n) when gcd(a, n) = 1."],
  ["RSA", "Public key (e, n), private key d, ed ≡ 1 mod φ(n); C = M^e mod n, M = C^d mod n."],
  ["Textbook RSA", "RSA applied directly to the message without padding; deterministic and insecure."],
  ["PKCS#1 v1.5", "RSA padding 00 ‖ BT ‖ random ‖ 00 ‖ M; BT = 02 for encryption."],
  ["OAEP", "Optimal Asymmetric Encryption Padding: masks the message using a random seed and hash-based mask generation."],
  ["Digital signature", "Value only the private-key holder can make, verifiable with the public key; gives non-repudiation."],
  ["Diffie–Hellman", "Key exchange: K = g^xy mod p from public g^x and g^y."],
  ["Primitive root (generator)", "g whose powers mod p give every value 1 … p − 1."],
  ["Discrete logarithm", "Finding x from g^x mod p; infeasible for large p."],
  ["Man-in-the-middle attack", "An attacker poses as each party to the other, sharing a separate key with each."],
  ["Elliptic curve", "y² = x³ + ax + b; in cryptography, its points with coordinates mod p."],
  ["Point addition / doubling", "Chord through two points / tangent at one point, reflected in the x-axis."],
  ["Scalar multiplication k·G", "G added to itself k times; the ECC public key."],
  ["Order of G", "Number of multiples of G before reaching the point at infinity."],
  ["ECDH", "Elliptic-curve Diffie–Hellman: shared secret d_A·Q_B = d_B·Q_A."],
  ["ECDSA", "Elliptic-curve digital signature algorithm; signature (r, s)."],
  ["DSS / DSA", "NIST's Digital Signature Standard; signatures only, no encryption or key exchange."],
],
};
