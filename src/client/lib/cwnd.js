// TCP Tahoe/Reno congestion-window trace, one row per RTT round.
export function cwndTrace(S0,events,rounds,variant,plus3){
  let cw=1,ss=S0;const rows=[];
  for(let r=1;r<=rounds;r++){rows.push({r,cw,ss,phase:cw<ss?"Slow start":"Cong. avoid.",ev:events[r]||null});
    const ev=events[r];
    if(ev==="to"){ss=Math.max(1,Math.floor(cw/2));cw=1;}
    else if(ev==="3dup"){ss=Math.max(1,Math.floor(cw/2));cw=variant==="tahoe"?1:(plus3?ss+3:ss);}
    else{cw=cw<ss?Math.min(cw*2,ss):cw+1;}}
  return rows;
}
