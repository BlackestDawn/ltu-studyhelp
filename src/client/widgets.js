import { $ } from "./lib/util.js";
import { cwndTrace } from "./lib/cwnd.js";

export function widgetPipeline(){
  const el=document.createElement("article");el.className="card";
  el.innerHTML=`<div class="dhead"><span class="tag">Model · store-and-forward pipelining</span><h3>Watch packets move through routers</h3><p class="pages"><b>Builds on</b> pp. 23–27 store-and-forward packet switching (§1.3.1)</p></div>
  <p class="q">Each column is one time slot of L/R. Each row is a link. A router must receive a whole packet before forwarding it, but different links can carry different packets at the same time.</p>
  <div class="controls"><label for="pl-n">Links <input type="range" id="pl-n" min="1" max="5" value="3"></label><label for="pl-p">Packets <input type="range" id="pl-p" min="1" max="8" value="4"></label></div>
  <div class="svgbox"><svg id="pl-svg" viewBox="0 0 640 220" role="img" aria-label="Space-time diagram of packets on links"></svg></div><div class="readout" id="pl-out"></div>`;
  const draw=()=>{const N=+$("#pl-n",el).value,P=+$("#pl-p",el).value,T=N+P-1,cols=Math.max(T,8),x0=70,y0=26,cw=(640-x0-10)/cols,rh=Math.min(34,(220-y0-10)/N);
    let s="";for(let t=0;t<=cols;t++)s+=`<line class="gridline" x1="${x0+t*cw}" y1="${y0}" x2="${x0+t*cw}" y2="${y0+N*rh}"/>`;
    for(let t=0;t<cols;t++)s+=`<text x="${x0+t*cw+cw/2}" y="${y0-8}" text-anchor="middle" font-size="10">${t+1}</text>`;
    for(let j=0;j<N;j++){s+=`<text x="${x0-8}" y="${y0+j*rh+rh/2+4}" text-anchor="end" font-size="11">link ${j+1}</text><line class="gridline" x1="${x0}" y1="${y0+(j+1)*rh}" x2="${x0+cols*cw}" y2="${y0+(j+1)*rh}"/>`;
      for(let i=0;i<P;i++){const t=i+j;s+=`<rect class="blk${i%2?" alt":""}" x="${x0+t*cw+2}" y="${y0+j*rh+3}" width="${cw-4}" height="${rh-6}" rx="3"/><text class="blktxt" x="${x0+t*cw+cw/2}" y="${y0+j*rh+rh/2+4}" text-anchor="middle">${i+1}</text>`;}}
    $("#pl-svg",el).innerHTML=s;
    $("#pl-out",el).innerHTML=`${P} packet${P>1?"s":""} over ${N} link${N>1?"s":""}: (N + P − 1) = <b>${T}</b> slots of L/R. The same data as one big message would take N × P = <b>${N*P}</b> slots.`;};
  el.addEventListener("input",draw);draw();return el;
}
export function widgetDNS(){
  const el=document.createElement("article");el.className="card";
  const nodes={host:{x:70,y:200,t:"Requesting host",s:"cse.nyu.edu"},local:{x:230,y:200,t:"Local DNS",s:"dns.nyu.edu"},root:{x:300,y:52,t:"Root server",s:""},tld:{x:520,y:52,t:".edu TLD server",s:""},auth:{x:540,y:200,t:"Authoritative",s:"dns.umass.edu"}};
  const IT=[["host","local","Query: address of gaia.cs.umass.edu? The host asks its local server to do the work (a recursive request)."],["local","root","The local server asks a root server."],["root","local","Root: “I don't know, but here are the .edu TLD servers.” (referral)"],["local","tld","The local server asks a .edu TLD server."],["tld","local","TLD: “Ask umass.edu's authoritative server, dns.umass.edu.” (referral)"],["local","auth","The local server asks the authoritative server."],["auth","local","Answer: gaia.cs.umass.edu A 128.119.245.12"],["local","host","The local server returns the answer and caches it, along with the TLD and authoritative server addresses."]];
  const RC=[["host","local","Query from the host to its local server."],["local","root","The local server asks the root, and the root takes on the job itself (recursive)."],["root","tld","The root asks the .edu TLD server on the local server's behalf."],["tld","auth","The TLD asks the authoritative server."],["auth","tld","Answer goes back to the TLD…"],["tld","root","…back to the root…"],["root","local","…back to the local server."],["local","host","The host gets the answer. This puts heavy load on the root and TLD servers, so in practice queries from the local server are usually iterative."]];
  let mode="it",step=0;
  el.innerHTML=`<div class="dhead"><span class="tag">Model · DNS resolution</span><h3>Step through a DNS lookup</h3><p class="pages"><b>Builds on</b> pp. 125–131 how DNS works: hierarchy, iterative and recursive queries, caching (§2.4.2)</p></div>
  <div class="controls"><label for="dns-mode">Query style <select id="dns-mode"><option value="it">Iterative (as in practice)</option><option value="rc">Fully recursive</option></select></label><button class="btn" data-d="-1">← Back</button><button class="btn primary" data-d="1">Next message →</button><button class="btn ghost" data-d="0">Restart</button></div>
  <div class="svgbox"><svg id="dns-svg" viewBox="0 0 640 250" role="img" aria-label="DNS servers and messages"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker><marker id="ahg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/></marker></defs><g id="dns-g"></g></svg></div>
  <div class="readout" id="dns-out"></div>`;
  const W=120,H=44;
  const draw=()=>{const seq=mode==="it"?IT:RC;let s="";
    seq.slice(0,step).forEach(([a,b],i)=>{const A=nodes[a],B=nodes[b];const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
      const off=-9;
      const sh=Math.min(W/2/Math.abs(ux||1e-9),H/2/Math.abs(uy||1e-9))+4;
      const x1=A.x+ux*sh+nx*off,y1=A.y+uy*sh+ny*off,x2=B.x-ux*sh+nx*off,y2=B.y-uy*sh+ny*off;const on=i===step-1;
      s+=`<line class="arw${on?" on":""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${on?"ah":"ahg"})"/><text class="arwlbl${on?" on":""}" x="${(x1+x2)/2-nx*20}" y="${(y1+y2)/2-ny*20+4}" text-anchor="middle">${i+1}</text>`;});
    const cur=step?seq[step-1]:null;
    Object.entries(nodes).forEach(([k,n])=>{const on=cur&&(cur[0]===k||cur[1]===k);s+=`<g class="node${on?" on":""}"><rect x="${n.x-W/2}" y="${n.y-H/2}" width="${W}" height="${H}" rx="6"/><text x="${n.x}" y="${n.y-(n.s?2:-4)}" text-anchor="middle">${n.t}</text>${n.s?`<text class="sm" x="${n.x}" y="${n.y+13}" text-anchor="middle">${n.s}</text>`:""}</g>`;});
    $("#dns-g",el).innerHTML=s;
    $("#dns-out",el).innerHTML=step?`<b>Message ${step} of ${seq.length}:</b> ${seq[step-1][2]}`:`Resolving <b>gaia.cs.umass.edu</b> with empty caches. Press “Next message”.`;};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b)return;const d=+b.dataset.d;step=d===0?0:Math.max(0,Math.min(8,step+d));draw();});
  $("#dns-mode",el).addEventListener("change",e=>{mode=e.target.value;step=0;draw();});
  draw();return el;
}
export function widgetCwnd(){
  const el=document.createElement("article");el.className="card";
  el.innerHTML=`<div class="dhead"><span class="tag">Model · TCP congestion control</span><h3>Drive the congestion window yourself</h3><p class="pages"><b>Builds on</b> pp. 263–274 classic TCP congestion control, Reno vs Tahoe (§3.7.1)</p></div>
  <p class="q">Decide what happens in each RTT and watch cwnd respond. Try: let it grow past ssthresh, then cause 3 duplicate ACKs, then a timeout, and compare Reno with Tahoe.</p>
  <div class="controls"><label for="cw-ss">Initial ssthresh <input type="number" id="cw-ss" min="2" max="64" value="8"></label><label for="cw-var">Variant <select id="cw-var"><option value="reno">TCP Reno</option><option value="tahoe">TCP Tahoe</option></select></label><label for="cw-p3">On 3 dup ACKs (Reno) <select id="cw-p3"><option value="1">cwnd = ssthresh + 3 (book figure)</option><option value="0">cwnd = ssthresh (halve)</option></select></label></div>
  <div class="controls"><button class="btn primary" data-e="ok">Next RTT: all ACKed</button><button class="btn" data-e="3dup">3 duplicate ACKs</button><button class="btn" data-e="to">Timeout</button><button class="btn ghost" data-e="undo">Undo</button><button class="btn ghost" data-e="reset">Reset</button><button class="btn ghost" data-e="demo">Load example</button></div>
  <div class="svgbox"><svg id="cw-svg" viewBox="0 0 640 290" role="img" aria-label="Congestion window per round"></svg></div>
  <div class="readout" id="cw-out"></div>`;
  let ev={},rounds=1;
  const draw=()=>{const S0=Math.max(2,Math.min(64,+$("#cw-ss",el).value||8)),v=$("#cw-var",el).value,p3=$("#cw-p3",el).value==="1";
    const rows=cwndTrace(S0,ev,rounds,v,p3);const W=640,H=290,ml=40,mr=14,mt=30,mb=36,n=Math.max(rows.length,16);
    const ymaxRaw=Math.max(8,...rows.map(r=>Math.max(r.cw,r.ss)))+2,step=ymaxRaw<=14?2:ymaxRaw<=28?4:ymaxRaw<=56?8:16,ymax=Math.ceil(ymaxRaw/step)*step;
    const X=r=>ml+(r-1)*(W-ml-mr)/(n-1),Y=v=>mt+(H-mt-mb)*(1-v/ymax);let s="";
    for(let v=0;v<=ymax;v+=step)s+=`<line class="gridline" x1="${ml}" x2="${W-mr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${ml-6}" y="${Y(v)+4}" text-anchor="end" font-size="10">${v}</text>`;
    const xs=n>24?2:1;for(let r=1;r<=n;r+=xs)s+=`<text x="${X(r)}" y="${H-mb+16}" text-anchor="middle" font-size="10">${r}</text>`;
    s+=`<text x="${(W+ml)/2}" y="${H-4}" text-anchor="middle" font-size="10">transmission round (RTT)</text><text x="${ml-6}" y="14" text-anchor="end" font-size="10">MSS</text>`;
    let d=`M${X(1)},${Y(rows[0].ss)}`;rows.forEach((r,i)=>{if(i)d+=` H${X(r.r)} V${Y(r.ss)}`;});d+=` H${X(rows.length)+6}`;s+=`<path class="ssl" d="${d}"/>`;
    s+=`<polyline class="ln" points="${rows.map(r=>`${X(r.r)},${Y(r.cw)}`).join(" ")}"/>`;
    rows.forEach(r=>{s+=`<circle class="pt" cx="${X(r.r)}" cy="${Y(r.cw)}" r="3.2"/>`;if(r.ev)s+=`<text class="evt" x="${X(r.r)}" y="${Y(r.cw)-9}" text-anchor="middle" font-size="10">${r.ev==="to"?"timeout":"3 dup"}</text>`;});
    s+=`<line x1="${W-mr-150}" x2="${W-mr-130}" y1="10" y2="10" class="ln"/><text x="${W-mr-125}" y="14" font-size="10">cwnd</text><line x1="${W-mr-80}" x2="${W-mr-60}" y1="10" y2="10" class="ssl"/><text x="${W-mr-55}" y="14" font-size="10">ssthresh</text>`;
    $("#cw-svg",el).innerHTML=s;const L=rows[rows.length-1];
    $("#cw-out",el).innerHTML=`Round ${L.r}: cwnd = <b>${L.cw}</b> MSS, ssthresh = <b>${L.ss}</b>, phase: <b>${L.phase}</b>. Sending rate ≈ cwnd/RTT.`;};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(!b)return;const k=b.dataset.e;
    if(k==="reset"){ev={};rounds=1;}else if(k==="undo"){if(rounds>1){rounds--;delete ev[rounds];}}
    else if(k==="demo"){$("#cw-ss",el).value=8;ev={8:"3dup",14:"to"};rounds=22;}
    else{if(rounds>=40)return;if(k!=="ok")ev[rounds]=k;rounds++;}draw();});
  el.addEventListener("change",draw);draw();return el;
}
export function widgetIPv4(){
  const el=document.createElement("article");el.className="card";
  const rows=[[["Version",4,"4 bits. Tells the router how to read the rest (4 for IPv4, 6 for IPv6)."],["Hdr len",4,"Header length in 32-bit words. Needed because options make the IPv4 header variable-length. Usually 5 (20 bytes)."],["Type of service",8,"DiffServ bits to tell traffic types apart (e.g. real-time vs bulk) and 2 ECN bits, which let routers signal congestion to TCP without dropping."],["Datagram length (bytes)",16,"Total length of header + data. 16 bits, so at most 65,535 bytes; rarely above 1,500."]],
   [["16-bit identifier",16,"Same in every fragment of an original datagram, so the destination can reassemble them."],["Flags",3,"Includes MF (more fragments): 1 on every fragment except the last. DF (don't fragment) is also here."],["13-bit fragment offset",13,"Where this fragment's data belongs, in units of 8 bytes."]],
   [["Time-to-live",8,"Decremented by every router. At 0 the datagram is dropped (and an ICMP message is usually sent), so routing loops can't trap a packet forever. Traceroute uses this."],["Upper-layer protocol",8,"Which transport protocol gets the payload: 6 = TCP, 17 = UDP. The glue between network and transport layers, like port numbers between transport and application."],["Header checksum",16,"Covers the header only. Recomputed at every router because TTL changes. IPv6 removed it, since the transport and link layers already check for errors."]],
   [["32-bit source IP address",32,"Sender's address. A home NAT rewrites this on the way out."]],
   [["32-bit destination IP address",32,"The router looks this up in its forwarding table using longest-prefix match to choose the output port."]],
   [["Options (if any)",32,"Rarely used; they make processing slower and the header variable-length. IPv6 replaced them with extension headers."]],
   [["Data (variable length; typically a TCP or UDP segment)",32,"The payload. Usually a transport segment, but it can also be e.g. an ICMP message. An IPv4 header without options plus a TCP header without options adds 40 bytes of overhead."]]];
  el.innerHTML=`<div class="dhead"><span class="tag">Model · IPv4 datagram format</span><h3>Explore the IPv4 header</h3><p class="pages"><b>Builds on</b> pp. 331–333 IPv4 datagram format (§4.3.1) · pp. 347–353 IPv6 comparison (§4.3.4)</p></div><p class="q">Click any field. The layout is to scale: 32 bits per row.</p>
  <div class="svgbox"><div class="bits"><span>bit 0</span><span>8</span><span>16</span><span>24</span><span>31</span></div><div class="ipgrid">${rows.flat().map(([n,b],i)=>`<button class="ipf" style="grid-column:span ${b}" data-i="${i}" aria-pressed="false">${n}</button>`).join("")}</div></div>
  <div class="ipdesc" id="ip-desc" aria-live="polite">The first five rows (20 bytes) are the fixed part of the header.</div>`;
  const flat=rows.flat();
  el.addEventListener("click",e=>{const b=e.target.closest(".ipf");if(!b)return;el.querySelectorAll(".ipf").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");const f=flat[+b.dataset.i];$("#ip-desc",el).innerHTML=`<b>${f[0]}</b> (${f[1]} bits). ${f[2]}`;});
  return el;
}
