import { $, store } from "./lib/util.js";

// Each model remembers its settings in this browser between visits.
const kept=k=>({get:()=>store.get("w:"+k)||{},set:v=>store.set("w:"+k,v)});
import { cwndTrace } from "./lib/cwnd.js";
import { dijkstra, dijkstraTable, INF, showCost, nextHop } from "./lib/routing.js";

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

