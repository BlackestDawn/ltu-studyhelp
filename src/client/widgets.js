import { $, store } from "./lib/util.js";

// Each model remembers its settings in this browser between visits.
const kept=k=>({get:()=>store.get("w:"+k)||{},set:v=>store.set("w:"+k,v)});
import { cwndTrace } from "./lib/cwnd.js";
import { dijkstra, dijkstraTable, INF, showCost, nextHop } from "./lib/routing.js";
import { switchFrame, slottedAloha, pureAloha } from "./lib/lan.js";
import { CODES, encode, channel, decode } from "./lib/wireless.js";

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
  const keep=kept("pipeline"),st=keep.get();
  if(st.n)$("#pl-n",el).value=st.n;if(st.p)$("#pl-p",el).value=st.p;
  el.addEventListener("input",()=>{draw();keep.set({n:+$("#pl-n",el).value,p:+$("#pl-p",el).value});});draw();return el;
}
export function widgetDNS(){
  const el=document.createElement("article");el.className="card";
  const nodes={host:{x:70,y:200,t:"Requesting host",s:"cse.nyu.edu"},local:{x:230,y:200,t:"Local DNS",s:"dns.nyu.edu"},root:{x:300,y:52,t:"Root server",s:""},tld:{x:520,y:52,t:".edu TLD server",s:""},auth:{x:540,y:200,t:"Authoritative",s:"dns.umass.edu"}};
  const IT=[["host","local","Query: address of gaia.cs.umass.edu? The host asks its local server to do the work (a recursive request)."],["local","root","The local server asks a root server."],["root","local","Root: “I don't know, but here are the .edu TLD servers.” (referral)"],["local","tld","The local server asks a .edu TLD server."],["tld","local","TLD: “Ask umass.edu's authoritative server, dns.umass.edu.” (referral)"],["local","auth","The local server asks the authoritative server."],["auth","local","Answer: gaia.cs.umass.edu A 128.119.245.12"],["local","host","The local server returns the answer and caches it, along with the TLD and authoritative server addresses."]];
  const RC=[["host","local","Query from the host to its local server."],["local","root","The local server asks the root, and the root takes on the job itself (recursive)."],["root","tld","The root asks the .edu TLD server on the local server's behalf."],["tld","auth","The TLD asks the authoritative server."],["auth","tld","Answer goes back to the TLD…"],["tld","root","…back to the root…"],["root","local","…back to the local server."],["local","host","The host gets the answer. This puts heavy load on the root and TLD servers, so in practice queries from the local server are usually iterative."]];
  const keep=kept("dns"),st=keep.get();let mode=st.mode==="rc"?"rc":"it",step=Number.isInteger(st.step)?Math.max(0,Math.min(8,st.step)):0;
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
  $("#dns-mode",el).value=mode;
  el.addEventListener("click",()=>keep.set({mode,step}));el.addEventListener("change",()=>keep.set({mode,step}));
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
  const keep=kept("cwnd"),st=keep.get();
  let ev=st.ev&&typeof st.ev==="object"?st.ev:{},rounds=Number.isInteger(st.rounds)?Math.max(1,Math.min(40,st.rounds)):1;
  if(st.ss)$("#cw-ss",el).value=st.ss;if(st.v)$("#cw-var",el).value=st.v;if(st.p3)$("#cw-p3",el).value=st.p3;
  const save=()=>keep.set({ev,rounds,ss:$("#cw-ss",el).value,v:$("#cw-var",el).value,p3:$("#cw-p3",el).value});
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
    else{if(rounds>=40)return;if(k!=="ok")ev[rounds]=k;rounds++;}draw();save();});
  el.addEventListener("change",()=>{draw();save();});draw();return el;
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
  el.addEventListener("click",e=>{const b=e.target.closest(".ipf");if(!b)return;el.querySelectorAll(".ipf").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");const f=flat[+b.dataset.i];$("#ip-desc",el).innerHTML=`<b>${f[0]}</b> (${f[1]} bits). ${f[2]}`;kept("ipv4").set({i:+b.dataset.i});});
  const sel=kept("ipv4").get().i;if(Number.isInteger(sel))el.querySelector(`.ipf[data-i="${sel}"]`)?.click();
  return el;
}

/* ---------- module 5: routing models ---------- */
// The book's Figure 5.3 network, with fixed node positions.
const NET=[["u","v",2],["u","x",1],["u","w",5],["v","x",2],["v","w",3],["x","w",3],["x","y",1],["w","y",1],["w","z",5],["y","z",2]];
const POS={u:[70,150],v:[230,55],w:[410,55],x:[230,245],y:[410,245],z:[570,150]};

export function widgetDijkstra(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("dijkstra"),st=keep.get(),bookCosts=NET.map(e=>e[2]);
  let costs=Array.isArray(st.costs)&&st.costs.length===NET.length?st.costs:bookCosts;
  let step=Number.isInteger(st.step)?st.step:0;
  el.innerHTML=`<div class="dhead"><span class="tag">Model · link-state routing</span><h3>Step through Dijkstra's algorithm</h3><p class="pages"><b>Builds on</b> pp. 383–388 the link-state routing algorithm (§5.2.1)</p></div>
  <p class="q">Source <b>u</b>. Each step adds the node not yet in N′ with the lowest D, then checks whether going through it is cheaper for each of its neighbours. Under each node: D, and the previous node p. Thick links form the least-cost tree found so far.</p>
  <div class="controls"><button class="btn" data-k="-1">← Back</button><button class="btn primary" data-k="1">Next step →</button><button class="btn ghost" data-k="0">Restart</button><button class="btn ghost" data-k="new">New link costs</button><button class="btn ghost" data-k="book">Book example</button></div>
  <div class="svgbox"><svg id="dj-svg" viewBox="0 0 640 300" role="img" aria-label="Network graph with link costs"></svg></div>
  <div class="readout" id="dj-out" aria-live="polite"></div><div id="dj-tbl"></div>`;
  const isBook=()=>costs.every((c,i)=>c===bookCosts[i]);
  const run=()=>dijkstra(NET.map((e,i)=>[e[0],e[1],costs[i]]),"u",isBook()?["y"]:[]);
  const draw=()=>{
    const r=run(),last=r.steps.length-1;step=Math.max(0,Math.min(last,step));
    const s=r.steps[step],prev=r.steps[step-1];
    let svg="";
    NET.forEach(([a,b],i)=>{const [x1,y1]=POS[a],[x2,y2]=POS[b],t=a==="u"&&b==="w"?.62:.5; // u–w's midpoint sits beside v–x
      const tree=(s.N.includes(b)&&b!=="u"&&s.P[b]===a)||(s.N.includes(a)&&a!=="u"&&s.P[a]===b);
      svg+=`<line class="gedge${tree?" tree":""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="gcost" x="${x1+(x2-x1)*t+6}" y="${y1+(y2-y1)*t-6}">${costs[i]}</text>`;});
    Object.entries(POS).forEach(([n,[x,y]])=>{
      const cls=step>0&&n===s.added?" cur":s.N.includes(n)?" done":"";
      const lbl=n==="u"?"source":`${showCost(s.D[n])}${s.P[n]?`, ${s.P[n]}`:""}`;
      svg+=`<g class="gnode${cls}"><circle cx="${x}" cy="${y}" r="20"/><text x="${x}" y="${y+5}" text-anchor="middle">${n}</text><text class="gd" x="${x}" y="${y<150?y-28:y+38}" text-anchor="middle">${lbl}</text></g>`;});
    $("#dj-svg",el).innerHTML=svg;
    let msg;
    if(step===0)msg="<b>Initialisation:</b> N′ = {u}. D(v) = c(u,v) for u's direct neighbours; ∞ for the others.";
    else{
      const w=s.added,ch=Object.keys(s.D).filter(n=>!s.N.includes(n)&&s.D[n]!==prev.D[n]);
      msg=`<b>Step ${step}:</b> add <b>${w}</b>, the cheapest node not yet in N′ (D(${w}) = ${s.D[w]}, reached via ${s.P[w]}).`;
      if(isBook()&&step===2)msg+=" v and y tie at 2; like the book, we take y.";
      msg+=ch.length?` Then D(v) = min(D(v), D(${w}) + c(${w},v)) improves: ${ch.map(n=>`D(${n}) ${showCost(prev.D[n])} → ${s.D[n]} via ${w}`).join("; ")}.`:` No neighbour of ${w} gets cheaper.`;
    }
    if(step===last)msg+=` <b>Done.</b> u's forwarding table: ${r.nodes.filter(n=>n!=="u").map(n=>`${n} → (u, ${nextHop(r.P,"u",n)})`).join(", ")}.`;
    $("#dj-out",el).innerHTML=msg;
    $("#dj-tbl",el).innerHTML=dijkstraTable(r,"u",step+1,step);
    keep.set({costs,step});};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k;
    if(k==="new"){do{costs=NET.map(()=>1+Math.floor(Math.random()*9));}while(run().ambiguous);step=0;}
    else if(k==="book"){costs=bookCosts;step=0;}
    else if(k==="0")step=0;else step+=+k;
    draw();});
  draw();return el;
}

// Distance vector after a link-cost change, on the book's Figure 5.7 triangle:
// x–y = 4, y–z = 1, x–z = 50. Only y's and z's costs to x are shown.
function dvLinkChange(newXY,poison){
  const cxz=50,cyz=1,adv=(D,next,to)=>poison&&next===to?INF:D;
  let Dy=4,ny="x",Dz=5,nz="y",yHeard=adv(Dz,nz,"y"),zHeard=adv(Dy,ny,"z");
  const ev=[{who:"",Dy,ny,Dz,nz,heard:null,sent:null,note:`Converged with c(x,y) = 4. ${poison?"With poisoned reverse, z (which routes via y) tells y that Dz(x) = ∞.":"z tells y that Dz(x) = 5."}`}];
  let who="y",first=true;
  for(let i=0;i<200;i++){
    if(who==="y"){const viaX=newXY,viaZ=cyz+yHeard,d=Math.min(viaX,viaZ),n=viaX<=viaZ?"x":"z",changed=d!==Dy||n!==ny;
      const heard=yHeard;Dy=d;ny=n;
      if(!changed&&!first){ev.push({who,Dy,ny,Dz,nz,heard,sent:null});break;}
      zHeard=adv(Dy,ny,"z");ev.push({who,Dy,ny,Dz,nz,heard,sent:zHeard,first});first=false;who="z";}
    else{const viaX=cxz,viaY=cyz+zHeard,d=Math.min(viaX,viaY),n=viaX<=viaY?"x":"y",changed=d!==Dz||n!==nz;
      const heard=zHeard;Dz=d;nz=n;
      if(!changed){ev.push({who,Dy,ny,Dz,nz,heard,sent:null});break;}
      yHeard=adv(Dz,nz,"y");ev.push({who,Dy,ny,Dz,nz,heard,sent:yHeard});who="y";}
  }
  return ev;
}

export function widgetDV(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("dv"),st=keep.get();
  let news=st.news==="good"?"good":"bad",poison=!!st.poison,step=Number.isInteger(st.step)?st.step:0;
  el.innerHTML=`<div class="dhead"><span class="tag">Model · distance-vector routing</span><h3>Good news, bad news and poisoned reverse</h3><p class="pages"><b>Builds on</b> pp. 392–394 link-cost changes, count-to-infinity and poisoned reverse (§5.2.2)</p></div>
  <p class="q">The book's three-router example. Only y's and z's least costs to <b>x</b> are tracked. Each step, one router recomputes with the Bellman-Ford equation using what its neighbour last told it, and sends a new distance vector if its own changed. Arrows show each router's next hop towards x.</p>
  <div class="controls"><label for="dv-news">Link change <select id="dv-news"><option value="bad">Bad news: c(x,y) 4 → 60</option><option value="good">Good news: c(x,y) 4 → 1</option></select></label><label><input type="checkbox" id="dv-pr"> Poisoned reverse</label></div>
  <div class="controls"><button class="btn" data-s="-1">← Back</button><button class="btn primary" data-s="1">Next update →</button><button class="btn ghost" data-s="end">Run to the end</button><button class="btn ghost" data-s="0">Restart</button></div>
  <div class="svgbox"><svg id="dv-svg" viewBox="0 0 640 280" role="img" aria-label="Three routers and their routes to x"><defs><marker id="dvah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker></defs><g id="dv-g"></g></svg></div>
  <div class="readout" id="dv-out" aria-live="polite"></div><div id="dv-log"></div>`;
  $("#dv-news",el).value=news;$("#dv-pr",el).checked=poison;
  const P={x:[90,225],y:[320,60],z:[550,225]};
  const draw=()=>{
    const ev=dvLinkChange(news==="bad"?60:1,poison),last=ev.length-1;step=Math.max(0,Math.min(last,step));
    const e=ev[step],cxy=step===0?4:news==="bad"?60:1,loop=e.ny==="z"&&e.nz==="y";
    const arrow=(from,to)=>{const [x1,y1]=P[from],[x2,y2]=P[to],dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,nx=-uy*12,ny=ux*12;
      return `<line class="arw on" x1="${x1+ux*30+nx}" y1="${y1+uy*30+ny}" x2="${x2-ux*30+nx}" y2="${y2-uy*30+ny}" marker-end="url(#dvah)"/>`;};
    let g="";
    [["x","y",cxy],["y","z",1],["x","z",50]].forEach(([a,b,c])=>{const [x1,y1]=P[a],[x2,y2]=P[b];
      g+=`<line class="gedge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="gcost${a==="x"&&b==="y"&&step>0?" hot":""}" x="${(x1+x2)/2+(b==="z"&&a==="x"?0:a==="x"?-26:26)}" y="${(y1+y2)/2+(a==="x"&&b==="z"?18:-6)}" text-anchor="middle">${c}</text>`;});
    g+=arrow("y",e.ny)+arrow("z",e.nz);
    Object.entries(P).forEach(([n,[x,y]])=>{const lbl=n==="x"?"destination":n==="y"?`Dy(x) = ${showCost(e.Dy)} via ${e.ny}`:`Dz(x) = ${showCost(e.Dz)} via ${e.nz}`;
      g+=`<g class="gnode${n===e.who?" cur":""}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y+5}" text-anchor="middle">${n}</text><text class="gd" x="${x}" y="${n==="y"?y-30:y+42}" text-anchor="middle">${lbl}</text></g>`;});
    $("#dv-g",el).innerHTML=g;
    let msg;
    if(step===0)msg=e.note;
    else{const other=e.who==="y"?"z":"y",D=e.who==="y"?e.Dy:e.Dz,n=e.who==="y"?e.ny:e.nz,direct=e.who==="y"?cxy:50;
      msg=`<b>Update ${step}:</b> ${e.first?`y sees c(x,y) change to ${cxy}. `:""}${e.who} computes D${e.who}(x) = min(c(${e.who},x) + 0, c(${e.who},${other}) + ${showCost(e.heard)}) = min(${direct}, ${e.heard===INF?"∞":1+e.heard}) = <b>${showCost(D)}</b> via ${n}. `;
      msg+=e.sent===null?`No change, so nothing is sent: the algorithm is quiet again.`:`It tells ${other} D${e.who}(x) = ${showCost(e.sent)}${e.sent===INF?" (poisoned: it routes via "+other+")":""}.`;}
    if(loop)msg+=` <b>Routing loop:</b> y sends packets for x to z, and z sends them back to y.`;
    if(step===last){
      const end=ev.findIndex((r,i)=>i>0&&r.nz!==ev[i-1].nz&&ev[i-1].ny==="z"&&ev[i-1].nz==="y");
      msg+=` Finished after ${last} update${last>1?"s":""}.`;
      if(end>0)msg+=` The routing loop lasted until update ${end}, when z's cost via y finally exceeded its direct link to x (50).`;}
    $("#dv-out",el).innerHTML=msg;
    const rows=ev.slice(1,step+1).map((r,i)=>[i+1,r.who,showCost(r.who==="y"?r.Dy:r.Dz)+" via "+(r.who==="y"?r.ny:r.nz),r.sent===null?"—":showCost(r.sent)]);
    const shown=rows.length>8?[...rows.slice(0,3),["…","","",""],...rows.slice(-4)]:rows;
    $("#dv-log",el).innerHTML=rows.length?tblRows(["Update","Router","New cost to x","Sends"],shown):"";
    keep.set({news,poison,step});};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const k=b.dataset.s;
    if(k==="end")step=1e9;else if(k==="0")step=0;else step+=+k;draw();});
  el.addEventListener("change",()=>{news=$("#dv-news",el).value;poison=$("#dv-pr",el).checked;step=0;draw();});
  draw();return el;
}
const tblRows=(head,rows)=>`<div class="tblwrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/* ---------- module 6: link-layer models ---------- */
export function widgetAloha(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("aloha"),st=keep.get();
  el.innerHTML=`<div class="dhead"><span class="tag">Model · random access</span><h3>How efficient is ALOHA?</h3><p class="pages"><b>Builds on</b> pp. 465–469 slotted and pure ALOHA (§6.3.2)</p></div>
  <p class="q">N nodes always have a frame to send, and each transmits with probability p. Efficiency is the long-run fraction of time carrying exactly one frame. Move the sliders to see why too small a p wastes the channel with silence and too large a p wastes it with collisions.</p>
  <div class="controls"><label for="al-n">Nodes N <input type="range" id="al-n" min="2" max="50" value="10"> <span class="mono" id="al-nv"></span></label><label for="al-p">Probability p <input type="range" id="al-p" min="1" max="100" value="10"> <span class="mono" id="al-pv"></span></label></div>
  <div class="svgbox"><svg id="al-svg" viewBox="0 0 640 260" role="img" aria-label="ALOHA efficiency against transmission probability"></svg></div>
  <div class="readout" id="al-out" aria-live="polite"></div>`;
  if(st.n)$("#al-n",el).value=st.n;if(st.p)$("#al-p",el).value=st.p;
  const draw=()=>{const N=+$("#al-n",el).value,p=+$("#al-p",el).value/100;
    $("#al-nv",el).textContent=N;$("#al-pv",el).textContent=p.toFixed(2);
    const W=640,H=260,ml=44,mr=14,mt=16,mb=34,X=v=>ml+v*(W-ml-mr),Y=v=>mt+(H-mt-mb)*(1-v/0.5);
    let s="";
    for(let v=0;v<=0.5;v+=0.1)s+=`<line class="gridline" x1="${ml}" x2="${W-mr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${ml-6}" y="${Y(v)+4}" text-anchor="end" font-size="10">${v.toFixed(1)}</text>`;
    for(let v=0;v<=1.0001;v+=0.2)s+=`<text x="${X(v)}" y="${H-mb+16}" text-anchor="middle" font-size="10">${v.toFixed(1)}</text>`;
    s+=`<text x="${(W+ml)/2}" y="${H-4}" text-anchor="middle" font-size="10">transmission probability p</text>`;
    const curve=f=>[...Array(201)].map((_,i)=>{const q=i/200;return `${X(q)},${Y(Math.min(0.5,f(N,q)))}`;}).join(" ");
    s+=`<polyline class="ln" points="${curve(slottedAloha)}"/><polyline class="ssl" points="${curve(pureAloha)}"/>`;
    s+=`<line class="ax" x1="${X(p)}" x2="${X(p)}" y1="${mt}" y2="${H-mb}"/><circle class="pt" cx="${X(p)}" cy="${Y(slottedAloha(N,p))}" r="4"/><circle class="pt" style="fill:var(--signal)" cx="${X(p)}" cy="${Y(pureAloha(N,p))}" r="4"/>`;
    s+=`<line x1="${W-mr-190}" x2="${W-mr-170}" y1="14" y2="14" class="ln"/><text x="${W-mr-165}" y="18" font-size="10">slotted</text><line x1="${W-mr-100}" x2="${W-mr-80}" y1="14" y2="14" class="ssl"/><text x="${W-mr-75}" y="18" font-size="10">pure</text>`;
    $("#al-svg",el).innerHTML=s;
    const best=slottedAloha(N,1/N),bestPure=Math.max(...[...Array(1000)].map((_,i)=>pureAloha(N,(i+1)/1000)));
    $("#al-out",el).innerHTML=`At p = ${p.toFixed(2)}: slotted <b>${slottedAloha(N,p).toFixed(3)}</b>, pure <b>${pureAloha(N,p).toFixed(3)}</b>. Slotted ALOHA is best at p = 1/N = ${(1/N).toFixed(3)}, giving ${best.toFixed(3)}; pure peaks at ${bestPure.toFixed(3)}. As N grows these approach 1/e ≈ 0.368 and 1/(2e) ≈ 0.184.`;
    keep.set({n:N,p:+$("#al-p",el).value});};
  el.addEventListener("input",draw);draw();return el;
}

// A four-port self-learning switch; D and E share port 4 through a hub.
const SW_HOSTS={A:{port:1,mac:"1A-2B-3C-4D-5E-0A",xy:[110,60]},B:{port:2,mac:"1A-2B-3C-4D-5E-0B",xy:[530,60]},C:{port:3,mac:"1A-2B-3C-4D-5E-0C",xy:[530,250]},D:{port:4,mac:"1A-2B-3C-4D-5E-0D",xy:[60,250]},E:{port:4,mac:"1A-2B-3C-4D-5E-0E",xy:[180,250]}};
const SW_PORTS={1:[280,125],2:[360,125],3:[360,185],4:[280,185]},HUB=[120,210];
export function widgetSwitch(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("switch"),st=keep.get();
  let table=st.table&&typeof st.table==="object"?st.table:{},log=Array.isArray(st.log)?st.log:[],last=st.last||null;
  const names=Object.keys(SW_HOSTS);
  el.innerHTML=`<div class="dhead"><span class="tag">Model · link-layer switch</span><h3>Watch a switch learn</h3><p class="pages"><b>Builds on</b> pp. 491–495 forwarding, filtering and self-learning (§6.4.3)</p></div>
  <p class="q">The switch table starts empty. For every frame, the switch first records the <b>source</b> MAC address and the port it arrived on, then looks up the <b>destination</b>: unknown → <b>flood</b>, on the arrival port → <b>filter</b>, otherwise → <b>forward</b>. D and E share port 4 through a hub, so the hub delivers frames between them without help.</p>
  <div class="controls"><label for="sw-src">From <select id="sw-src">${names.map(n=>`<option>${n}</option>`).join("")}</select></label><label for="sw-dst">To <select id="sw-dst">${names.map(n=>`<option>${n}</option>`).join("")}<option value="*">Broadcast (FF-FF-FF-FF-FF-FF)</option></select></label><button class="btn primary" data-a="send">Send frame</button><button class="btn ghost" data-a="reset">Clear switch table</button></div>
  <div class="svgbox"><svg id="sw-svg" viewBox="0 0 640 300" role="img" aria-label="Switch, hub and hosts"></svg></div>
  <div class="readout" id="sw-out" aria-live="polite"></div><div id="sw-tbl"></div>`;
  $("#sw-dst",el).value="B";
  const draw=()=>{
    const inP=last?SW_HOSTS[last.src].port:null,out=last?last.out:[];
    let g="";
    names.forEach(n=>{const h=SW_HOSTS[n],[px,py]=h.port===4?HUB:SW_PORTS[h.port],[x,y]=h.xy;
      const hot=last&&(n===last.src?" in":(out.includes(h.port)||(h.port===inP&&inP===4&&n!==last.src))?" on":"");
      g+=`<line class="gedge${hot===" on"?" tree":""}${hot===" in"?" hotlink":""}" x1="${px}" y1="${py}" x2="${x}" y2="${y}"/>`;});
    const hubOut=last&&(out.includes(4)||inP===4);
    g+=`<line class="gedge${hubOut?(inP===4?" hotlink":" tree"):""}" x1="${HUB[0]}" y1="${HUB[1]}" x2="${SW_PORTS[4][0]}" y2="${SW_PORTS[4][1]}"/>`;
    g+=`<rect x="250" y="105" width="140" height="100" rx="10" class="swbox"/><text x="320" y="160" text-anchor="middle" class="swlbl">switch</text>`;
    Object.entries(SW_PORTS).forEach(([p,[x,y]])=>{g+=`<g class="gnode${out.includes(+p)?" done":""}${+p===inP?" cur":""}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y+5}" text-anchor="middle">${p}</text></g>`;});
    g+=`<rect x="${HUB[0]-28}" y="${HUB[1]-14}" width="56" height="28" rx="6" class="swbox"/><text x="${HUB[0]}" y="${HUB[1]+5}" text-anchor="middle" class="swlbl">hub</text>`;
    names.forEach(n=>{const [x,y]=SW_HOSTS[n].xy;g+=`<g class="gnode${last&&n===last.src?" cur":""}"><circle cx="${x}" cy="${y}" r="20"/><text x="${x}" y="${y+5}" text-anchor="middle">${n}</text></g>`;});
    $("#sw-svg",el).innerHTML=g;
    let msg="Pick a source and destination and send a frame.";
    if(last){const s=last.src,d=last.dst==="*"?"the broadcast address":last.dst;
      msg=`<b>Frame ${log.length}:</b> ${s} → ${d}. The switch learns <b>${s} is on port ${inP}</b>. `+
      (last.action==="flood"?(last.dst==="*"?"Broadcast frames always go out of every port except the one they came in on":`${d} isn't in the table yet, so it <b>floods</b> the frame out of every port except ${inP}`)+` (ports ${last.out.join(", ")}).`:
       last.action==="filter"?`The table says ${d} is on port ${inP}, the same port the frame came in on, so the switch <b>filters</b> (discards) it. The hub has already delivered it.`:
       `The table says ${d} is on port ${last.out[0]}, so the switch <b>forwards</b> the frame only there.`);}
    $("#sw-out",el).innerHTML=msg;
    const rows=Object.entries(table).sort((a,b)=>a[1].t-b[1].t).map(([n,e])=>[`${n} · ${SW_HOSTS[n].mac}`,e.port,`frame ${e.t}`]);
    $("#sw-tbl",el).innerHTML=rows.length?tblRows(["MAC address","Port","Learned at"],rows):"<p class='sub'>Switch table: empty.</p>";
    keep.set({table,log,last});};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;
    if(b.dataset.a==="reset"){table={};log=[];last=null;draw();return;}
    const src=$("#sw-src",el).value,dst=$("#sw-dst",el).value;
    if(src===dst){$("#sw-out",el).textContent="Pick a different destination than the source.";return;}
    const ports=Object.fromEntries(Object.entries(table).map(([n,v])=>[n,v.port]));
    const r=switchFrame(ports,SW_HOSTS[src].port,src,dst,[1,2,3,4]);
    log.push({src,dst});table[src]={port:SW_HOSTS[src].port,t:log.length};
    last={src,dst,action:r.action,out:r.out};draw();});
  draw();return el;
}

/* ---------- module 7: wireless and mobility models ---------- */
export function widgetCDMA(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("cdma"),st=keep.get();
  let c1=Number.isInteger(st.c1)?st.c1:0,c2=Number.isInteger(st.c2)?st.c2:4,d1=st.d1===-1?-1:1,d2=st.d2===1?1:-1,on2=st.on2!==false;
  const codeName=i=>`code ${i+1}: ${CODES[i].map(x=>x>0?"+1":"−1").join(" ")}`;
  el.innerHTML=`<div class="dhead"><span class="tag">Model · code division multiple access</span><h3>Two senders, one channel</h3><p class="pages"><b>Builds on</b> pp. 539–542 CDMA (§7.2.1)</p></div>
  <p class="q">Each sender multiplies its data bit (+1 or −1) by its own 8-chip code; the channel adds the signals. A receiver multiplies what it hears by its sender's code, adds up, and divides by 8. Because the codes are orthogonal, the other sender's contribution cancels out. Try giving both senders the same code.</p>
  <div class="controls"><label for="cd-c1">Sender 1 <select id="cd-c1">${CODES.map((_,i)=>`<option value="${i}">${codeName(i)}</option>`).join("")}</select></label><label for="cd-d1">bit <select id="cd-d1"><option value="1">+1</option><option value="-1">−1</option></select></label></div>
  <div class="controls"><label for="cd-c2">Sender 2 <select id="cd-c2">${CODES.map((_,i)=>`<option value="${i}">${codeName(i)}</option>`).join("")}</select></label><label for="cd-d2">bit <select id="cd-d2"><option value="1">+1</option><option value="-1">−1</option></select></label><label><input type="checkbox" id="cd-on2"> sending</label></div>
  <div id="cd-tbl"></div><div class="readout" id="cd-out" aria-live="polite"></div>`;
  $("#cd-c1",el).value=c1;$("#cd-c2",el).value=c2;$("#cd-d1",el).value=d1;$("#cd-d2",el).value=d2;$("#cd-on2",el).checked=on2;
  const fmtS=x=>x>0?`+${x}`:x<0?`−${-x}`:"0";
  const draw=()=>{
    const z1=encode(d1,CODES[c1]),z2=on2?encode(d2,CODES[c2]):CODES[c2].map(()=>0),z=channel([z1,z2]);
    const r1=z.map((x,m)=>x*CODES[c1][m]),r2=z.map((x,m)=>x*CODES[c2][m]),o1=decode(z,CODES[c1]),o2=decode(z,CODES[c2]);
    const row=(h,v,cls="")=>`<tr${cls?` class="${cls}"`:""}><th>${h}</th>${v.map(x=>`<td>${fmtS(x)}</td>`).join("")}</tr>`;
    $("#cd-tbl",el).innerHTML=`<div class="tblwrap"><table class="cdma"><thead><tr><th></th>${[...Array(8)].map((_,m)=>`<th>m=${m+1}</th>`).join("")}</tr></thead><tbody>
      ${row(`Sender 1 sends d·c (d = ${fmtS(d1)})`,z1)}${row(on2?`Sender 2 sends d·c (d = ${fmtS(d2)})`:"Sender 2 (silent)",z2)}${row("Channel: sum",z,"sum")}
      ${row("Receiver 1: sum × code 1",r1)}${row("Receiver 2: sum × code 2",r2)}</tbody></table></div>`;
    const ok1=o1===d1,ok2=!on2||o2===d2;
    $("#cd-out",el).innerHTML=`Receiver 1: (${r1.map(fmtS).join(" + ")}) / 8 = <b>${fmtS(o1)}</b> ${ok1?"✓ sender 1's bit":"✗ not sender 1's bit"}. Receiver 2: ${fmtS(r2.reduce((a,b)=>a+b,0))} / 8 = <b>${fmtS(o2)}</b> ${on2?(ok2?"✓ sender 2's bit":"✗ not sender 2's bit"):"(nothing sent)"}.`+(c1===c2&&on2?" With the <b>same code</b>, the receivers can't tell the senders apart.":"");
    keep.set({c1,c2,d1,d2,on2});};
  el.addEventListener("change",()=>{c1=+$("#cd-c1",el).value;c2=+$("#cd-c2",el).value;d1=+$("#cd-d1",el).value;d2=+$("#cd-d2",el).value;on2=$("#cd-on2",el).checked;draw();});
  draw();return el;
}

// Indirect and direct routing to a mobile device (Mobile IP terms).
const MB={C:[90,150,"Correspondent","205.10.23.4"],H:[320,55,"Home network","home agent"],V:[550,150,"Visited network","foreign agent"],M:[550,255,"Mobile device","care-of 79.129.13.2"]};
const MB_STEPS={
  indirect:[
    ["C","H","The correspondent sends to the mobile's <b>permanent address</b> 128.119.40.186, as if it were at home. Mobility is invisible to it.","dst 128.119.40.186"],
    ["H","V","The <b>home agent</b> intercepts the datagram and <b>tunnels</b> it: it puts the whole datagram inside a new one addressed to the mobile's <b>care-of address</b> 79.129.13.2 in the visited network.","outer dst 79.129.13.2 · inner dst 128.119.40.186"],
    ["V","M","The <b>foreign agent</b> removes the outer datagram (decapsulates) and delivers the original one, unchanged, to the mobile.","dst 128.119.40.186"],
    ["M","C","The mobile replies <b>directly</b> to the correspondent, with its permanent address as source. Datagrams to the mobile always detour through the home network: the <b>triangle routing</b> problem. (4G instead tunnels replies back through the home network too.)","src 128.119.40.186 · dst correspondent"]],
  direct:[
    ["C","H","The correspondent first asks the home network (its home agent, or in 4G the HSS) <b>where the mobile is now</b>.","location query"],
    ["H","C","The home network answers with the mobile's current <b>care-of address</b> 79.129.13.2. This needs a location protocol between correspondent and home.","reply: care-of address 79.129.13.2"],
    ["C","V","The correspondent <b>tunnels</b> its datagram straight to the care-of address: no detour, no triangle routing.","outer dst 79.129.13.2 · inner dst 128.119.40.186"],
    ["V","M","The foreign agent decapsulates and delivers it. The cost: if the mobile moves to yet another network mid-conversation, the correspondent's address is stale, so the first visited network must forward (act as an anchor).","dst 128.119.40.186"]]};
export function widgetMobility(){
  const el=document.createElement("article");el.className="card";
  const keep=kept("mobility"),st=keep.get();
  let mode=st.mode==="direct"?"direct":"indirect",step=Number.isInteger(st.step)?st.step:0;
  el.innerHTML=`<div class="dhead"><span class="tag">Model · mobility management</span><h3>Indirect and direct routing to a mobile device</h3><p class="pages"><b>Builds on</b> pp. 580–587 direct and indirect routing (§7.5.3) and Mobile IP (§7.6.2)</p></div>
  <p class="q">A mobile device with permanent address 128.119.40.186 (in its home network) is visiting another network, where it has the care-of address 79.129.13.2. Step through how a correspondent's datagram reaches it.</p>
  <div class="controls"><label for="mb-mode">Approach <select id="mb-mode"><option value="indirect">Indirect routing</option><option value="direct">Direct routing</option></select></label><button class="btn" data-s="-1">← Back</button><button class="btn primary" data-s="1">Next step →</button><button class="btn ghost" data-s="0">Restart</button></div>
  <div class="svgbox"><svg id="mb-svg" viewBox="0 0 640 300" role="img" aria-label="Correspondent, home network, visited network and mobile device"><defs><marker id="mbah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker></defs><g id="mb-g"></g></svg></div>
  <div class="readout" id="mb-out" aria-live="polite"></div>`;
  $("#mb-mode",el).value=mode;
  const draw=()=>{const steps=MB_STEPS[mode];step=Math.max(0,Math.min(steps.length,step));
    let g="";
    steps.slice(0,step).forEach(([a,b],i)=>{const [x1,y1]=MB[a],[x2,y2]=MB[b],dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,off=(a==="H"&&b==="C")?14:(a==="C"&&b==="H")?-14:0,nx=-uy*off,ny=ux*off,on=i===step-1;
      g+=`<line class="arw${on?" on":""}" x1="${x1+ux*62+nx}" y1="${y1+uy*30+ny}" x2="${x2-ux*62+nx}" y2="${y2-uy*30+ny}" marker-end="url(#mbah)"/><text class="arwlbl${on?" on":""}" x="${(x1+x2)/2+nx*2}" y="${(y1+y2)/2+ny*2-6}" text-anchor="middle">${i+1}</text>`;});
    Object.entries(MB).forEach(([k,[x,y,t,s2]])=>{const cur=step>0&&(steps[step-1][0]===k||steps[step-1][1]===k);
      g+=`<g class="node${cur?" on":""}"><rect x="${x-62}" y="${y-24}" width="124" height="48" rx="6"/><text x="${x}" y="${y-3}" text-anchor="middle">${t}</text><text class="sm" x="${x}" y="${y+13}" text-anchor="middle">${s2}</text></g>`;});
    $("#mb-g",el).innerHTML=g;
    $("#mb-out",el).innerHTML=step?`<b>Step ${step} of ${steps.length}:</b> ${steps[step-1][2]} <span class="mono">[${steps[step-1][3]}]</span>`:`<b>${mode==="indirect"?"Indirect":"Direct"} routing.</b> Press “Next step”.`;
    keep.set({mode,step});};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const k=+b.dataset.s;step=k===0?0:step+k;draw();});
  $("#mb-mode",el).addEventListener("change",e=>{mode=e.target.value;step=0;draw();});
  draw();return el;
}

