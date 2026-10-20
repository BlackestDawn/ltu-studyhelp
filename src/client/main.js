import { $, store } from "./lib/util.js";
import { getProgress, onProgress } from "./lib/progress.js";
import { renderDrill } from "./lib/drill.js";
import { renderMCQ } from "./lib/mcq.js";
import { MODULES, GA } from "./modules/index.js";

/* ---------- build page ---------- */
const tabsEl=$("#tabs"),panelsEl=$("#panels");
let objState=store.get("obj",{});
MODULES.forEach((m,mi)=>{
  const t=document.createElement("button");t.className="tab";t.id="tab-"+m.id;t.setAttribute("role","tab");t.setAttribute("aria-controls","panel-"+m.id);
  t.innerHTML=`<span class="n">M${mi+1}</span>${m.short}<span class="sc" data-sc="${m.id}"></span>`;t.addEventListener("click",()=>show(m.id));tabsEl.appendChild(t);
  const p=document.createElement("section");p.id="panel-"+m.id;p.setAttribute("role","tabpanel");p.setAttribute("aria-labelledby","tab-"+m.id);p.hidden=true;
  p.innerHTML=`<h2 style="margin-top:1.4rem">${m.title}</h2>
   <div class="brief"><div class="focus"><div class="objhead">How to use this module</div><p>${m.focus}</p></div>
   <div><div class="objhead">Learning objectives: tick when you can explain it aloud</div><ul class="objs">${m.obj.map((o,i)=>`<li><label><input type="checkbox" id="o-${m.id}-${i}" ${objState[m.id+i]?"checked":""}><span>${o}</span></label></li>`).join("")}</ul></div></div>
   <h2>Hands-on labs</h2><p class="sub">Fresh numbers every time. Use “New numbers” until you get each type right twice in a row.</p><div class="stack" data-drills></div>
   <h2>Concept check</h2><div data-mcq></div>
   <h2>More practice</h2><div class="more">
    <div class="card"><h3>Course reading</h3><p class="sub" style="margin-top:4px">The pages your course lists as supporting material. Tick each one off as you read it.</p><ul class="objs" style="margin-top:6px">${m.read.map(([t,pg],i)=>`<li><label><input type="checkbox" id="r-${m.id}-${i}" ${objState["r"+m.id+i]?"checked":""}><span>${t} <span class="mono" style="color:var(--muted)">pp. ${pg}</span></span></label></li>`).join("")}</ul><p class="sub" style="margin-top:12px">Then try these end-of-chapter problems:</p><div>${m.probs.map(x=>`<span class="pill">${x}</span>`).join(" ")}</div></div>
    <div class="card"><h3>Authors' interactive problems</h3><p class="sub" style="margin-top:4px">Randomised problems from the book's authors, with answers.</p><ul>${m.inter.map(([n,u])=>`<li><a href="${GA}${u}" target="_blank" rel="noopener">${n}</a></li>`).join("")}</ul><p style="font-size:.9rem;margin-top:8px"><a href="https://gaia.cs.umass.edu/kurose_ross/wireshark.php" target="_blank" rel="noopener">${m.lab}</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/knowledgechecks/" target="_blank" rel="noopener">Knowledge checks</a> · <a href="https://gaia.cs.umass.edu/kurose_ross/tutor.php?bot=${m.tutor}" target="_blank" rel="noopener">Chapter ${m.tutor} AI tutor</a></p></div>
   </div>`;
  const st=$("[data-drills]",p);
  m.drills.forEach((d,i)=>{st.appendChild(renderDrill(d,m.id));if(i===m.widgetAfter)m.widgets.forEach(w=>st.appendChild(w()));});
  $("[data-mcq]",p).appendChild(renderMCQ(m.mcq,m.id));
  p.addEventListener("change",e=>{if(e.target.matches(".objs input")){const [k,mid,i]=e.target.id.split("-");objState[(k==="r"?"r":"")+mid+i]=e.target.checked;store.set("obj",objState);}});
  panelsEl.appendChild(p);
});
function updateTabs(){MODULES.forEach(m=>{const n=getProgress()[m.id]||0;const el=document.querySelector(`[data-sc="${m.id}"]`);el.textContent=n?`${n} solved`:"";el.hidden=!n;});}
function show(id){MODULES.forEach(m=>{const on=m.id===id;$("#panel-"+m.id).hidden=!on;$("#tab-"+m.id).setAttribute("aria-selected",String(on));});store.set("tab",id);}
const h=(location.hash||"").slice(1);
show(MODULES.some(m=>m.id===h)?h:store.get("tab","m1"));updateTabs();
onProgress(updateTabs);
