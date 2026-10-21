import { $, shuffle, esc, fmt, store, hash } from "./util.js";
import { addSolved } from "./progress.js";

/* ---------- drill engine ---------- */
// Possible numeric readings of a typed answer. Both "." and "," work as the
// decimal separator; spaces are ignored. With both present, the last one is
// the decimal separator and the other groups thousands. Repeated separators
// group thousands ("1,000,000", "1.000.000"). A lone comma followed by exactly
// three digits ("1,500") is ambiguous, so both readings are returned.
export function readNumber(raw){
  const s=String(raw).replace(/\s/g,""),d=s.lastIndexOf("."),c=s.lastIndexOf(",");
  let cands;
  if(d>=0&&c>=0)cands=[d>c?s.replace(/,/g,""):s.replace(/\./g,"").replace(",",".")];
  else if(c>=0)cands=s.indexOf(",")!==c?[s.replace(/,/g,"")]:/,\d{3}$/.test(s)?[s.replace(",","."),s.replace(",","")]:[s.replace(",",".")];
  else cands=[s.indexOf(".")!==d?s.replace(/\./g,""):s];
  return cands.map(parseFloat).filter(v=>!isNaN(v));
}
export function judge(f,raw){
  raw=String(raw).trim(); if(raw==="")return null;
  if(f.type==="num"){const vs=readNumber(raw);if(!vs.length)return false;const tol=Math.max(f.abs??1e-9,Math.abs(f.ans)*(f.rel??0.01));return vs.some(v=>Math.abs(v-f.ans)<=tol);}
  if(f.type==="bin")return raw.replace(/[^01]/g,"")===f.ans;
  if(f.type==="seq")return raw.replace(/[^0-9]/g,"")===String(f.ans).replace(/[^0-9]/g,"");
  if(f.type==="select")return [].concat(f.ans).includes(raw);
  const norm=s=>s.toLowerCase().replace(/\s+/g,"");return [].concat(f.ans).map(norm).includes(norm(raw));
}
export const showAns=f=>f.show??(f.type==="num"?fmt(f.ans):f.type==="bin"?f.ans.replace(/(.{4})(?=.)/g,"$1 "):[].concat(f.ans)[0]);
// Each lab saves its generated problem, typed answers and open/checked state in
// this browser, so a reload or app update brings the visitor back to the same
// problem. The fingerprint drops saved state when the lab's text changes; bump
// a lab's `v` to drop it after changing only its generator logic.
export function renderDrill(d,mod){
  const el=document.createElement("article");el.className="card drill";el.id="d-"+d.id;
  let inst,solved=false,checked=false;
  const fid=i=>`${d.id}-f${i}`;
  const key="drill:"+d.id,ver=hash([d.title,d.tag,d.pages,d.gen.src,d.v].join("|"));
  const save=()=>store.set(key,{ver,inst,solved,checked,sol:!$(".sol",el).hidden,vals:inst.fields.map((_,i)=>$("#"+fid(i),el).value)});
  function build(saved){
    inst=saved?saved.inst:d.gen();solved=saved?!!saved.solved:false;checked=false;
    el.innerHTML=`<div class="dhead"><span class="tag">${d.tag}</span><h3>${d.title}</h3>${d.pages?`<p class="pages"><b>Builds on</b> ${d.pages}</p>`:""}</div>
    <div class="q">${inst.q}</div>
    <div class="fields">${inst.fields.map((f,i)=>{const id=fid(i);let ctl;
      if(f.type==="select")ctl=`<select id="${id}"><option value="">Choose…</option>${f.opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select>`;
      else ctl=`<input id="${id}" type="text" inputmode="${f.type==="num"?"decimal":"text"}" autocomplete="off" spellcheck="false" placeholder="${f.ph||""}">`;
      return `<div class="fld"><label for="${id}">${f.label}</label><div class="ctl">${ctl}${f.unit!==undefined?`<span class="unit">${f.unit}</span>`:""}<span class="mark" id="m-${id}"></span></div></div>`;}).join("")}</div>
    <div class="actions"><button class="btn primary" data-act="check">Check answers</button><button class="btn" data-act="sol" aria-expanded="false">Show worked solution</button><button class="btn ghost" data-act="new">${d.fixed?"Shuffle questions":"New numbers"}</button></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="sol" hidden><div class="key"><b>Answer key</b><ul>${inst.fields.map(f=>`<li>${f.label}: <code>${esc(showAns(f))}</code>${f.unit?" "+f.unit:""}</li>`).join("")}</ul></div>${inst.sol}</div>`;
    if(saved){
      inst.fields.forEach((_,i)=>{const v=saved.vals?.[i];if(v!=null)$("#"+fid(i),el).value=v;});
      if(saved.sol)toggleSol(true);
      if(saved.checked)check();
    }
    save();
  }
  function toggleSol(show){const s=$(".sol",el),b=$('[data-act="sol"]',el);s.hidden=!show;b.textContent=show?"Hide solution":"Show worked solution";b.setAttribute("aria-expanded",String(show));}
  function check(){checked=true;let right=0,blank=0;inst.fields.forEach((f,i)=>{const inp=$("#"+fid(i),el),mk=$("#m-"+fid(i),el),r=judge(f,inp.value);inp.classList.remove("ok","bad");
        if(r===null){blank++;mk.textContent="";mk.className="mark";}else if(r){right++;inp.classList.add("ok");mk.textContent="✓";mk.className="mark ok";}else{inp.classList.add("bad");mk.textContent="✗";mk.className="mark bad";}});
      const fb=$(".feedback",el),n=inst.fields.length;
      if(right===n){fb.className="feedback ok";fb.textContent=`All ${n} correct.`+(solved?"":" Added to your progress. Try “New numbers” to lock it in.");if(!solved){solved=true;addSolved(mod);}}
      else{fb.className="feedback";fb.textContent=`${right} of ${n} correct${blank?`, ${blank} blank`:""}. Rework the ✗ fields, or open the worked solution.`;}
  }
  el.addEventListener("click",e=>{const b=e.target.closest("button[data-act]");if(!b)return;const act=b.dataset.act;
    if(act==="new")build();
    else if(act==="sol"){toggleSol($(".sol",el).hidden);save();}
    else{check();save();}
  });
  el.addEventListener("input",save);el.addEventListener("change",save);
  const saved=store.get(key);
  build(saved&&saved.ver===ver&&saved.inst?saved:null);
  return el;
}
export function bankDrill(bank,n){const gen=()=>{const qs=shuffle(bank).slice(0,n);return{q:"<p>Answer each question.</p>",fields:qs.map(x=>({...x})),sol:qs.filter(x=>x.why).map(x=>`<p><b>${x.short||x.label}</b> ${x.why}</p>`).join("")};};gen.src=JSON.stringify(bank)+n;return gen;}
