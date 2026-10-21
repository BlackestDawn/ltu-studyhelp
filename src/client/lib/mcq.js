import { $, shuffle, store, hash } from "./util.js";

/* ---------- MCQ engine ---------- */
// Saves each question's shuffled option order and the visitor's pick in this
// browser, keyed by a fingerprint of the question, so answers survive a reload
// and an edited question simply starts fresh.
export function renderMCQ(list,id){
  const wrap=document.createElement("div");
  const head=document.createElement("div");head.className="mcqhead";
  head.innerHTML=`<p class="sub">Pick an answer to see the reasoning. Aim to explain <i>why</i> the wrong options are wrong.</p><div><span class="mono" data-score></span> <button class="btn ghost" data-reset>Reset</button></div>`;
  const ol=document.createElement("ol");ol.className="mcq";
  const key="mcq:"+id,qkey=m=>hash([m.q,...m.o,m.a].join("|"));
  let right=0,done=0,saved={};
  const upd=()=>{$("[data-score]",head).textContent=`${right}/${done} right · ${list.length} questions`;};
  function build(restore){right=0;done=0;ol.innerHTML="";
    const prev=restore?store.get(key,{}):{};saved={};
    list.forEach(m=>{const li=document.createElement("li"),k=qkey(m),st=prev[k];
    // Options appear in a fresh random order on every build; data-i keeps the original index.
    const order=st&&Array.isArray(st.o)&&st.o.length===m.o.length?st.o:shuffle(m.o.map((_,i)=>i));
    saved[k]={o:order};
    li.innerHTML=`<p class="mq">${m.q}</p><div class="opts">${order.map(i=>`<button class="opt" data-i="${i}">${m.o[i]}</button>`).join("")}</div><p class="why" hidden></p>`;
    const answer=i=>{
      li.querySelectorAll(".opt").forEach(x=>x.disabled=true);$(`.opt[data-i="${m.a}"]`,li).classList.add("right");
      if(i!==m.a)$(`.opt[data-i="${i}"]`,li).classList.add("wrong");else right++;done++;upd();
      const w=$(".why",li);w.hidden=false;w.innerHTML=(i===m.a?'<b class="r">Correct.</b> ':'<b class="w">Not quite.</b> ')+m.why;
      saved[k].p=i;store.set(key,saved);};
    li.addEventListener("click",e=>{const b=e.target.closest(".opt");if(!b||b.disabled)return;answer(+b.dataset.i);});
    if(st&&Number.isInteger(st.p)&&st.p>=0&&st.p<m.o.length)answer(st.p);
    ol.appendChild(li);});
    store.set(key,saved);upd();}
  $("[data-reset]",head).addEventListener("click",()=>build(false));
  build(true);wrap.append(head,ol);return wrap;
}
