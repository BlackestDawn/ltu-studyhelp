import { rnd, pick, shuffle, tbl } from "../../../lib/util.js";
import { bankDrill } from "../../../lib/drill.js";
import { rsa, rsaExponents, modPow, egcd, inv, phi, gcd, primitiveRoots, ecAddSteps, curvePoints, multiples, showPt, mod } from "../../../lib/seccrypto.js";

const SMALL_PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31];

// Extended Euclid table for e·d ≡ 1 (mod f), as a worked solution.
function euclid(e, f) {
  const { rows } = egcd(f, e), d = inv(e, f);
  return `${tbl(["a", "b", "q = ⌊a / b⌋", "a mod b"], rows.map(r => [r.r0, r.r1, r.q, r.r0 % r.r1]))}
  <p>Working back up (or keeping the running coefficients) gives <code>${e} × ${d} = ${e * d} = ${Math.floor(e * d / f)} × ${f} + 1</code>, so <b>d = ${d}</b>.</p>`;
}
// Square-and-multiply in short: list m^(2^i) mod n for the bits of k.
function powSteps(m, k, n) {
  const rows = [];
  let sq = m % n, acc = 1;
  for (let bit = 1, i = 0; bit <= k; bit *= 2, i++) {
    const on = (k & bit) !== 0;
    if (on) acc = (acc * sq) % n;
    rows.push([`${m}<sup>${bit}</sup>`, sq, on ? "✓" : "", on ? acc : ""]);
    sq = (sq * sq) % n;
  }
  return tbl(["Power", `mod ${n}`, "Bit of " + k + " set?", "Running product"], rows);
}

// Small curves y² = x³ + ax + b mod p with enough points for practice.
function randomCurve() {
  for (;;) {
    const p = pick([17, 19, 23, 29, 31]), a = rnd(0, p - 1), b = rnd(1, p - 1);
    if (mod(4 * a ** 3 + 27 * b * b, p) === 0) continue;
    const c = { p, a, b }, pts = curvePoints(c).filter(P => P[1] !== 0);
    if (pts.length >= 6) return { c, pts };
  }
}
const curveName = c => `y² = x³${c.a ? ` + ${c.a === 1 ? "" : c.a}x` : ""} + ${c.b} (mod ${c.p})`;
const EX = { c: { a: 2, b: 2, p: 17 }, G: [5, 1], n: 19 };

const S3_DRILLS = [
{id:"s3sign",pages:"Quiz 2 · Lecture 5 digital signatures · §21.4",tag:"Quiz 2 · RSA signature",title:"Sign a digest with RSA",gen(){
  const quiz=Math.random()<0.5;
  let p=11,q=23;if(!quiz){do{[p,q]=shuffle(SMALL_PRIMES.slice(2)).slice(0,2);}while(p*q<60);}
  const e=pick(rsaExponents(p,q).filter(x=>x<40)),{n,f,d}=rsa(p,q,e),h=quiz?9:rnd(2,n-1),s=modPow(h,d,n);
  return{q:`<p>${quiz?"Linda":"Alice"} wants to sign a message electronically with RSA. Its digest is ${quiz?"<code>0x00 0x00 0x00 0x09</code>":`<b>${h}</b>`}. She chooses <b>p = ${p}</b>, <b>q = ${q}</b> and public exponent <b>e = ${e}</b>.</p>`,
  fields:[{label:"n",type:"num",ans:n,abs:0},{label:"φ(n)",type:"num",ans:f,abs:0},{label:"Private exponent d",type:"num",ans:d,abs:0},
    {label:"Digest as a number",type:"num",ans:h,abs:0},{label:"Signature s",type:"num",ans:s,abs:0},{label:"What a verifier computes from s (and must equal the digest)",type:"num",ans:modPow(s,e,n),abs:0},
    {label:"Key used to create the signature",type:"select",opts:["Signer's private key (d, n)","Signer's public key (e, n)","Verifier's private key","Verifier's public key"],ans:"Signer's private key (d, n)"}],
  sol:`<p><code>n = ${p} × ${q} = <b>${n}</b></code>, <code>φ(n) = ${p-1} × ${q-1} = <b>${f}</b></code>. e = ${e} is valid because gcd(${e}, ${f}) = 1.</p>
  <p>Find d with <code>${e}·d ≡ 1 (mod ${f})</code> by the extended Euclidean algorithm:</p>${euclid(e,f)}
  <p>${quiz?"The digest 0x00000009 is the number <b>9</b> (leading zero bytes don't change the value). ":""}Sign with the <b>private</b> key: <code>s = h<sup>d</sup> mod n = ${h}<sup>${d}</sup> mod ${n} = <b>${s}</b></code>. Square and multiply:</p>${powSteps(h,d,n)}
  <p>Anyone verifies with the <b>public</b> key: <code>s<sup>e</sup> mod n = ${s}<sup>${e}</sup> mod ${n} = ${modPow(s,e,n)}</code>, which matches the digest they compute themselves. Only the holder of d could have produced s, which gives authentication, integrity and non-repudiation.</p>`};}},
{id:"s3rsa",pages:"Lecture 5 RSA exercise · §21.4 Figure 21.8",tag:"RSA · encryption",title:"RSA by hand",gen(){
  let p,q;do{[p,q]=shuffle(SMALL_PRIMES).slice(0,2);}while(p*q<40);
  const e=pick(rsaExponents(p,q).filter(x=>x<50)),{n,f,d}=rsa(p,q,e),m=rnd(2,n-1),c=modPow(m,e,n),c2=rnd(2,n-1),m2=modPow(c2,d,n);
  return{q:`<p>Bob builds an RSA key pair from <b>p = ${p}</b>, <b>q = ${q}</b> and <b>e = ${e}</b>.</p>`,
  fields:[{label:"n = p·q",type:"num",ans:n,abs:0},{label:"φ(n) = (p − 1)(q − 1)",type:"num",ans:f,abs:0},{label:"d, with e·d ≡ 1 (mod φ(n)) and 0 < d < φ(n)",type:"num",ans:d,abs:0},
    {label:`Alice encrypts M = ${m} for Bob: C`,type:"num",ans:c,abs:0},{label:`Bob decrypts C = ${c2}: M`,type:"num",ans:m2,abs:0}],
  sol:`<p><code>n = ${n}</code>, <code>φ(n) = ${f}</code>. Extended Euclid for the inverse of ${e} mod ${f}:</p>${euclid(e,f)}
  <p>Public key <code>PU = {${e}, ${n}}</code>, private key <code>PR = {${d}, ${n}}</code>.</p>
  <p>Encrypt with Bob's public key: <code>C = ${m}<sup>${e}</sup> mod ${n} = <b>${c}</b></code>.</p>${powSteps(m,e,n)}
  <p>Decrypt with Bob's private key: <code>M = ${c2}<sup>${d}</sup> mod ${n} = <b>${m2}</b></code>. Reduce mod n after every multiplication, as the book does for 88<sup>7</sup> mod 187.</p>`};}},
{id:"s3euler",pages:"Lecture 5 modulo operation and Euler's theorem",tag:"Number theory",title:"Totients, inverses and Euler's theorem",gen(){
  let p,q;do{[p,q]=shuffle(SMALL_PRIMES.slice(0,7)).slice(0,2);}while(p===q);
  const n=p*q,f=phi(n),pr=pick([7,11,13,17,19,23]);
  let a;do{a=rnd(2,n-1);}while(gcd(a,n)!==1);
  let x,m;do{m=rnd(10,60);x=rnd(2,m-1);}while(gcd(x,m)!==1);
  const k=f*rnd(1000,9999)+rnd(1,f-1),r=k%f;
  return{q:`<p>Use the totient function and Euler's theorem (a<sup>φ(n)</sup> ≡ 1 mod n when gcd(a, n) = 1).</p>`,
  fields:[{label:`φ(${pr})`,type:"num",ans:pr-1,abs:0},{label:`φ(${n}) (= ${p} × ${q})`,type:"num",ans:f,abs:0},
    {label:`Multiplicative inverse of ${x} mod ${m}`,type:"num",ans:inv(x,m),abs:0},
    {label:`${a}<sup>${k}</sup> mod ${n}`,type:"num",ans:modPow(a,k,n),abs:0}],
  sol:`<p>${pr} is prime, so every number 1 … ${pr-1} is relatively prime to it: <b>φ(${pr}) = ${pr-1}</b>.</p>
  <p>For n = pq with p, q prime, φ is multiplicative: <code>φ(${n}) = φ(${p})·φ(${q}) = ${p-1} × ${q-1} = <b>${f}</b></code>.</p>
  <p>Inverse: find x<sup>−1</sup> with ${x}·x<sup>−1</sup> ≡ 1 (mod ${m}). Extended Euclid gives <b>${inv(x,m)}</b>, since ${x} × ${inv(x,m)} = ${x*inv(x,m)} = ${Math.floor(x*inv(x,m)/m)} × ${m} + 1.</p>
  <p>Euler reduction, as in the lecture's 4<sup>100003</sup> mod 33: <code>${k} = ${Math.floor(k/f)} × ${f} + ${r}</code>, and ${a}<sup>${f}</sup> ≡ 1, so <code>${a}<sup>${k}</sup> ≡ ${a}<sup>${r}</sup> ≡ <b>${modPow(a,k,n)}</b> (mod ${n})</code>.</p>`};}},
{id:"s3dh",pages:"Lecture 6 Diffie–Hellman · §21.5",tag:"Diffie–Hellman",title:"Agree on a key",gen(){
  const p=pick([23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]),g=primitiveRoots(p)[0],x=rnd(2,p-2),y=rnd(2,p-2);
  const A=modPow(g,x,p),B=modPow(g,y,p),K=modPow(B,x,p);
  return{q:`<p>Alice and Bob agree publicly on the prime <b>p = ${p}</b> and generator <b>g = ${g}</b>. Alice picks the secret <b>x = ${x}</b>, Bob the secret <b>y = ${y}</b>.</p>`,
  fields:[{label:"Alice sends A = g<sup>x</sup> mod p",type:"num",ans:A,abs:0},{label:"Bob sends B = g<sup>y</sup> mod p",type:"num",ans:B,abs:0},{label:"Shared key K",type:"num",ans:K,abs:0},
    {label:"What an eavesdropper must solve to get K from p, g, A and B",type:"select",opts:["A discrete logarithm","Factoring p","Inverting a hash","Nothing: K is sent in the clear"],ans:"A discrete logarithm"},
    {label:"Why Darth can sit in the middle of this exchange",type:"select",opts:["Neither side authenticates the values it receives","p is too small","g must be secret","The key is sent unencrypted"],ans:"Neither side authenticates the values it receives"}],
  sol:`<p><code>A = ${g}<sup>${x}</sup> mod ${p} = <b>${A}</b></code>, <code>B = ${g}<sup>${y}</sup> mod ${p} = <b>${B}</b></code>.</p>
  <p>Alice computes <code>B<sup>x</sup> mod p = ${B}<sup>${x}</sup> mod ${p} = ${K}</code>; Bob computes <code>A<sup>y</sup> mod p = ${A}<sup>${y}</sup> mod ${p} = ${modPow(A,y,p)}</code>. Both equal g<sup>xy</sup> mod p, so <b>K = ${K}</b>.</p>
  <p>An eavesdropper sees p, g, A and B and would have to find x from A = g<sup>x</sup> mod p, the <b>discrete logarithm</b>: easy here by trying powers, infeasible for 2048-bit p.</p>
  <p><b>Man in the middle</b>: Darth replaces A with his own value towards Bob and B with his own towards Alice. He then shares one key with each and relays (and reads) everything. The fix is to authenticate the exchange with signatures and certificates.</p>`};}},
{id:"s3ecc",pages:"Lecture 6 EC coordinate transformation",tag:"Elliptic curves",title:"Double and add points",gen(){
  const {c,pts}=randomCurve();let P,Q;
  do{[P,Q]=shuffle(pts).slice(0,2);}while(P[0]===Q[0]);
  const dbl=ecAddSteps(P,P,c),add=ecAddSteps(P,Q,c);
  return{q:`<p>Curve <b>${curveName(c)}</b>, so a = ${c.a}. P = ${showPt(P)} and Q = ${showPt(Q)} are on the curve. Division mod p means multiplying by the modular inverse.</p>`,
  fields:[{label:"λ for doubling P",type:"num",ans:dbl.lam,abs:0},{label:"2P: x",type:"num",ans:dbl.R[0],abs:0},{label:"2P: y",type:"num",ans:dbl.R[1],abs:0},
    {label:"λ for P + Q",type:"num",ans:add.lam,abs:0},{label:"P + Q: x",type:"num",ans:add.R[0],abs:0},{label:"P + Q: y",type:"num",ans:add.R[1],abs:0}],
  sol:`<p><b>Doubling</b>: <code>λ = (3x<sub>P</sub><sup>2</sup> + a) / (2y<sub>P</sub>) = (3·${P[0]}² + ${c.a}) / (2·${P[1]}) ≡ ${dbl.num} / ${dbl.den} ≡ ${dbl.num} × ${dbl.di} ≡ <b>${dbl.lam}</b> (mod ${c.p})</code>, where ${dbl.di} is the inverse of ${dbl.den} mod ${c.p}.</p>
  <p><code>x = λ² − 2x<sub>P</sub> = ${dbl.lam}² − 2·${P[0]} ≡ <b>${dbl.R[0]}</b></code>, <code>y = λ(x<sub>P</sub> − x) − y<sub>P</sub> = ${dbl.lam}(${P[0]} − ${dbl.R[0]}) − ${P[1]} ≡ <b>${dbl.R[1]}</b></code>. So 2P = ${showPt(dbl.R)}.</p>
  <p><b>Addition</b>: <code>λ = (y<sub>Q</sub> − y<sub>P</sub>) / (x<sub>Q</sub> − x<sub>P</sub>) = (${Q[1]} − ${P[1]}) / (${Q[0]} − ${P[0]}) ≡ ${add.num} × ${add.di} ≡ <b>${add.lam}</b> (mod ${c.p})</code>.</p>
  <p><code>x = λ² − x<sub>P</sub> − x<sub>Q</sub> ≡ <b>${add.R[0]}</b></code>, <code>y = λ(x<sub>P</sub> − x) − y<sub>P</sub> ≡ <b>${add.R[1]}</b></code>. So P + Q = ${showPt(add.R)}. Reduce negative results by adding ${c.p}; both answers lie on the curve again.</p>`};}},
{id:"s3ecdh",pages:"Lecture 6 ECDH example",tag:"ECDH",title:"Elliptic-curve Diffie–Hellman",gen(){
  const M=multiples(EX.G,EX.c),dA=rnd(2,18);let dB;do{dB=rnd(2,18);}while(dB===dA);
  const k=(dA*dB)%EX.n,QA=M[dA-1],QB=M[dB-1],S=k===0?null:M[k-1];
  return{q:`<p>The lecture's curve: <b>y² = x³ + 2x + 2 (mod 17)</b>, generator G = (5, 1) of order n = 19. Here are its multiples:</p>${tbl(["k","kG","k","kG"],Array.from({length:9},(_,i)=>[i+1,showPt(M[i]),i+10,showPt(M[i+9]??null)]))}<p>Alice's private key is <b>d<sub>A</sub> = ${dA}</b>, Bob's is <b>d<sub>B</sub> = ${dB}</b>.</p>`,
  fields:[{label:"Alice's public key Q<sub>A</sub>: x",type:"num",ans:QA[0],abs:0},{label:"Q<sub>A</sub>: y",type:"num",ans:QA[1],abs:0},
    {label:"Bob's public key Q<sub>B</sub>: x",type:"num",ans:QB[0],abs:0},{label:"Q<sub>B</sub>: y",type:"num",ans:QB[1],abs:0},
    {label:"Shared secret = k·G for which k (1 … 18)?",type:"num",ans:k,abs:0},{label:"Shared secret: x",type:"num",ans:S[0],abs:0}],
  sol:`<p>Public keys are <code>Q<sub>A</sub> = ${dA}G = ${showPt(QA)}</code> and <code>Q<sub>B</sub> = ${dB}G = ${showPt(QB)}</code>.</p>
  <p>Alice computes <code>d<sub>A</sub>·Q<sub>B</sub> = ${dA}·(${dB}G) = ${dA*dB}G</code>; Bob computes <code>d<sub>B</sub>·Q<sub>A</sub> = ${dB}·(${dA}G) = ${dA*dB}G</code>. Since 19G = O, reduce mod 19: <code>${dA*dB} mod 19 = <b>${k}</b></code>, so the secret is <b>${k}G = ${showPt(S)}</b>, and its x-coordinate is used as the key.</p>
  <p>An eavesdropper sees ${showPt(QA)} and ${showPt(QB)} but must find d<sub>A</sub> or d<sub>B</sub> from them: the elliptic-curve discrete logarithm problem. With 19 points it is a table lookup; with a 256-bit curve it is infeasible.</p>`};}},
{id:"s3pk",pages:"Lectures 5–6 · §21.4–21.5",fixed:true,tag:"Public-key concepts",title:"Public-key facts",gen:bankDrill([
  {label:"Key Alice uses to encrypt a message only Bob can read",type:"select",opts:["Bob's public key","Bob's private key","Alice's private key","Alice's public key"],ans:"Bob's public key",short:"Encrypt for Bob:",why:"anyone can use it; only Bob's private key decrypts."},
  {label:"Hard problem behind RSA",type:"select",opts:["Factoring n = pq","Discrete logarithm mod p","Finding hash collisions","Elliptic-curve discrete logarithm"],ans:"Factoring n = pq",short:"RSA:",why:"knowing p and q gives φ(n) and so d; Diffie–Hellman rests on discrete logarithms, ECC on the elliptic-curve version."},
  {label:"Why public-key encryption is mostly used to send a session key",type:"select",opts:["It is far slower than symmetric encryption","It can't encrypt numbers","Session keys are public","It needs no keys"],ans:"It is far slower than symmetric encryption",short:"Hybrid encryption:",why:"encrypt the bulk data with AES and only the short content key with RSA."},
  {label:"Problem with textbook RSA: encrypting the same message twice gives",type:"select",opts:["The same ciphertext","Different ciphertexts","An error","The private key"],ans:"The same ciphertext",short:"Deterministic:",why:"an attacker can guess a message, encrypt it with the public key and compare. Padding adds randomness."},
  {label:"If m<sup>e</sup> < n (small m and e), the attacker can",type:"select",opts:["Take the ordinary e-th root of C","Factor n immediately","Nothing","Read d from C"],ans:"Take the ordinary e-th root of C",short:"No wrap-around:",why:"the lecture's example: n = 2000, e = 3, m = 10 gives C = 1000, and ∛1000 = 10 without the private key."},
  {label:"Second byte (block type) of PKCS#1 v1.5 padding for encryption",type:"select",opts:["02","01","00","FF"],ans:"02",short:"PKCS#1 v1.5:",why:"00 ‖ 02 ‖ nonzero random bytes ‖ 00 ‖ message; types 00 and 01 are for private-key operations such as signatures."},
  {label:"Padding that XORs the message with a mask derived from a random seed",type:"select",opts:["OAEP","PKCS#1 v1.5","PKCS#5","CBC"],ans:"OAEP",short:"OAEP:",why:"the plaintext is never copied directly into the block; it resists the attacks found on PKCS#1 v1.5 since 1998."},
  {label:"Service a digital signature gives that a MAC can't",type:"select",opts:["Non-repudiation","Integrity","Confidentiality","Availability"],ans:"Non-repudiation",short:"Signatures:",why:"only the signer has the private key; with a MAC both parties know the key."},
  {label:"RSA key size giving about the same security as a 256-bit ECC key",type:"num",ans:3072,abs:0,unit:"bits",short:"Key sizes:",why:"the lecture's comparison table: ECC needs far smaller keys, so it is faster and suits IoT and mobile devices."},
  {label:"In ECC, the private key is",type:"select",opts:["The number k in Q = k·G","The point G","The curve parameters a and b","The prime p"],ans:"The number k in Q = k·G",short:"ECC keys:",why:"G, a, b and p are public; Q = k·G is the public key."},
],5)},
];

const S3_MCQ=[
{q:"What problem did public-key cryptography solve?",o:["Symmetric encryption was far too slow","Hashes could not be computed securely","Parties needed a shared key in advance","Messages could not be signed with hashes"],a:2,why:"Diffie and Hellman (1976) showed how strangers can agree on a secret, and RSA (1978) gave a public-key cryptosystem."},
{q:"In RSA, which values are public?",o:["e and n","d and n","p and q","φ(n) and d"],a:0,why:"(e, n) is the public key. d is private, and p, q and φ(n) must stay secret (or be discarded), since any of them gives d."},
{q:"Why must e be relatively prime to φ(n)?",o:["So that the modulus n is itself prime","So that encryption runs a lot faster","So that the primes p and q stay secret","Otherwise e has no inverse mod φ(n)"],a:3,why:"A multiplicative inverse exists only when gcd(e, φ(n)) = 1."},
{q:"What is φ(n) for n = 33?",o:["32","20","11","3"],a:1,why:"33 = 3 × 11, so φ(33) = 2 × 10 = 20, as in the lecture's 4^100003 mod 33 example."},
{q:"With n = 33, e = 7, d = 3, what does decrypting the encryption of m = 35 give?",o:["35","0","2","33"],a:2,why:"35 mod 33 = 2 before anything happens: RSA only works for m < n, so you recover m mod n."},
{q:"Why is textbook RSA insecure?",o:["It is deterministic and leaks small messages","Its key sizes are too short to be secure","It quietly relies on a shared symmetric key underneath","It cannot be used to make digital signatures"],a:0,why:"Same plaintext, same ciphertext; small m^e < n can be undone with a plain root; the same message sent to e recipients falls to the Chinese remainder theorem. Padding adds randomness."},
{q:"Why is a hash signed instead of the whole message?",o:["Hashes are kept secret from verifiers","Private keys only work on hash values","Hash values can never be forged by anyone at all","It's faster, and still binds the message"],a:3,why:"The signature is h^d mod n for h = H(M); any change to M changes h, so the signature no longer verifies."},
{q:"How does a verifier check an RSA signature s on digest h?",o:["Computes s^d mod n with the private key","Checks s^e mod n against h, using e","Decrypts s with their own private key","Hashes s again and compares it with h"],a:1,why:"Anyone can verify with the signer's public key; only the signer can create s."},
{q:"Which statement about Diffie–Hellman is true?",o:["It encrypts the messages themselves directly","It needs a shared secret set up beforehand","Its security rests on factoring large numbers","It agrees a secret over an insecure channel"],a:3,why:"It is a key-exchange protocol based on the discrete logarithm problem; the agreed key is then used with a symmetric cipher."},
{q:"In the man-in-the-middle attack on Diffie–Hellman, what does Darth end up with?",o:["One key with Alice, another with Bob","Alice's private exponent x itself","The prime p, which was secret before","Nothing useful, as the keys don't match"],a:0,why:"Alice and Bob each think they share a key with the other, but both share theirs with Darth, who decrypts and re-encrypts everything."},
{q:"How is the Diffie–Hellman MITM attack prevented?",o:["By choosing a much larger prime p","By choosing a smaller generator g","By signing the values that are exchanged","By exchanging the public values twice"],a:2,why:"The protocol itself doesn't authenticate the participants; signatures and certificates tie the values to known identities."},
{q:"On an elliptic curve, what is k·G?",o:["G added to itself k times","G's x-coordinate times k","G raised to the power k","The tangent line through G"],a:0,why:"Repeated point addition (computed quickly by doubling and adding). Recovering k from k·G is the elliptic-curve discrete logarithm problem."},
{q:"What does point doubling use for its slope?",o:["The line through P and −P","The chord (y₂ − y₁)/(x₂ − x₁)","The x-axis, with slope zero","The tangent (3x² + a)/(2y)"],a:3,why:"Addition of two different points uses the chord through them; doubling uses the tangent, then reflects the third intersection in the x-axis."},
{q:"Why is ECC popular on phones and IoT devices?",o:["It needs no random numbers anywhere","Smaller keys give the same security","It does away with the private key","It rests on factoring, which is cheap"],a:1,why:"About 256-bit ECC matches 3072-bit RSA, so less computation and memory; TLS 1.3 and Bitcoin use it."},
{q:"A CA's ECC private key turned out to be 4. Why is that fatal?",o:["4 isn't prime, so signatures fail","The curve becomes singular with it","Trying G, 2G, 3G, 4G finds it at once","Keys that small can't sign anything"],a:2,why:"The lecture's real-world example: a strong algorithm can't protect a weak or predictable private key."},
{q:"What does an ECDSA signature consist of?",o:["One point on the curve","The pair (r, s)","Only the message hash","The public key Q itself"],a:1,why:"r comes from the x-coordinate of a random point k·G, s = k⁻¹(z + d·r) mod n; the verifier recomputes u₁·G + u₂·Q and checks its x-coordinate equals r."},
];

export { S3_DRILLS, S3_MCQ };
