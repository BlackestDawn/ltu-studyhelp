import { $ } from "./util.js";

/* ---------- MCQ engine ---------- */
export function renderMCQ(list){
  const wrap=document.createElement("div");
  const head=document.createElement("div");head.className="mcqhead";
  head.innerHTML=`<p class="sub">Pick an answer to see the reasoning. Aim to explain <i>why</i> the wrong options are wrong.</p><div><span class="mono" data-score></span> <button class="btn ghost" data-reset>Reset</button></div>`;
  const ol=document.createElement("ol");ol.className="mcq";
  let right=0,done=0;
  const upd=()=>{$("[data-score]",head).textContent=`${right}/${done} right · ${list.length} questions`;};
  function build(){right=0;done=0;ol.innerHTML="";list.forEach(m=>{const li=document.createElement("li");
    li.innerHTML=`<p class="mq">${m.q}</p><div class="opts">${m.o.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}</div><p class="why" hidden></p>`;
    li.addEventListener("click",e=>{const b=e.target.closest(".opt");if(!b||b.disabled)return;const i=+b.dataset.i;
      li.querySelectorAll(".opt").forEach(x=>x.disabled=true);li.querySelectorAll(".opt")[m.a].classList.add("right");
      if(i!==m.a)b.classList.add("wrong");else right++;done++;upd();
      const w=$(".why",li);w.hidden=false;w.innerHTML=(i===m.a?'<b class="r">Correct.</b> ':'<b class="w">Not quite.</b> ')+m.why;});
    ol.appendChild(li);});upd();}
  $("[data-reset]",head).addEventListener("click",build);
  build();wrap.append(head,ol);return wrap;
}
