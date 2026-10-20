// Shared helpers: random picks, number formatting, local storage and IPv4 bit maths.
export const $=(s,el=document)=>el.querySelector(s);
export const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
export const pick=a=>a[Math.floor(Math.random()*a.length)];
export const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
export function fmt(x){if(typeof x!=="number")return String(x);if(!isFinite(x))return String(x);const a=Math.abs(x);if(a===0)return"0";if(Number.isInteger(x))return String(x);if(a>=1000)return String(Math.round(x*10)/10);if(a>=1)return String(+x.toFixed(3));return String(+x.toPrecision(3));}
export const store={get(k,d){try{const v=localStorage.getItem("nmw:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("nmw:"+k,JSON.stringify(v))}catch(e){}}};
export const ip2n=s=>s.split(".").reduce((a,o)=>a*256+(+o),0)>>>0;
export const n2ip=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
export const maskOf=p=>p===0?0:(0xffffffff<<(32-p))>>>0;
export const bin8=n=>n.toString(2).padStart(8,"0");
export const bin16=n=>n.toString(2).padStart(16,"0").replace(/(.{4})(?=.)/g,"$1 ");
export const tbl=(head,rows,hl)=>`<div class="tblwrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r,i)=>`<tr>${r.map(c=>`<td${hl&&hl(i)?' class="hl"':""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
