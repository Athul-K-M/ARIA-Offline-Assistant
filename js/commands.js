/* A.R.I.A. - Command and reply manager: stored commands, the list screens and the add/edit/delete editor. */
/* ===== COMMAND MANAGER (Stage 5) ===== */
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LBL={time:"Tell the time",date:"Tell the date",status:"Check system status",youtube:"Open YouTube"};
const DEF=JSON.stringify(store.cmds);
const save=()=>{try{localStorage.setItem("aria.cmds",JSON.stringify(store.cmds))}catch(e){}};
try{const d=JSON.parse(localStorage.getItem("aria.cmds"));if(Array.isArray(d)&&d.length)store.cmds=d}catch(e){}
const cnt=()=>{$("#t1").textContent=store.cmds.filter(c=>c.on).length+" active"};
let cur=-1,mode="cmd";
function draw(){
 for(const [id,m] of [["#cmds","cmd"],["#reps","rep"]]){
  const L=store.cmds.map((c,i)=>[c,i]).filter(([c])=>(c.a!=="none")===(m==="cmd"));
  $(id).innerHTML=L.length?L.map(([c,i])=>`<div class="row"><div data-e="${i}" data-m="${m}"><b>${esc(c.t[0])}</b><small>${c.t.length>1?"+"+(c.t.length-1)+" phrases, ":""}${c.a!=="none"?LBL[c.a]+", ":""}${c.r.length} repl${c.r.length===1?"y":"ies"}</small></div><label class="sw"><input type="checkbox" data-i="${i}" ${c.on?"checked":""}><span></span></label></div>`).join(""):`<p class="sub">Nothing here yet. Tap Add to create one.</p>`}
 $$("[data-e]").forEach(d=>d.onclick=()=>edit(+d.dataset.e,d.dataset.m));
 $$("#cmds input,#reps input").forEach(x=>x.onchange=()=>{store.cmds[x.dataset.i].on=x.checked?1:0;save();cnt()});
 cnt()}
function edit(i,m){
 cur=i;mode=m;const c=i>=0?store.cmds[i]:{t:[""],a:m==="cmd"?"time":"none",r:[],on:1};
 $("#e-title").textContent=(i>=0?"Edit ":"New ")+(m==="cmd"?"command":"reply");
 $("#e-t").value=c.t[0];$("#e-alt").value=c.t.slice(1).join("\n");
 $("#e-a").innerHTML=Object.keys(LBL).map(k=>`<option value="${k}">${LBL[k]}</option>`).join("");$("#e-a").value=c.a==="none"?"time":c.a;
 $("#e-arow").style.display=m==="cmd"?"block":"none";
 $("#e-r").value=c.r.join("\n");$("#e-on").checked=!!c.on;$("#e-del").style.display=i>=0?"":"none";$("#e-err").textContent="";
 $("#ed").classList.add("on");$("#ed").scrollTop=0}
$("#addc").onclick=()=>edit(-1,"cmd");$("#addr").onclick=()=>edit(-1,"rep");
$("#e-cancel").onclick=()=>$("#ed").classList.remove("on");
$("#e-save").onclick=()=>{
 const t=[$("#e-t").value,...$("#e-alt").value.split("\n")].map(x=>x.trim()).filter(Boolean);
 const r=$("#e-r").value.split("\n").map(x=>x.trim()).filter(Boolean);
 const a=mode==="cmd"?$("#e-a").value:"none";
 if(!t.length){$("#e-err").textContent="Add at least one thing you say.";return}
 if(!r.length&&a==="none"){$("#e-err").textContent="Add at least one reply.";return}
 const o={t,a,r:r.length?r:["{a}"],on:$("#e-on").checked?1:0};
 if(cur>=0)store.cmds[cur]=o;else store.cmds.push(o);
 save();draw();$("#ed").classList.remove("on")};
$("#e-del").onclick=()=>{if(confirm("Delete this? This can't be undone.")){store.cmds.splice(cur,1);save();draw();$("#ed").classList.remove("on")}};
$("#reset").onclick=()=>{if(confirm("Restore the default commands and replies? Your changes will be lost.")){store.cmds=JSON.parse(DEF);save();draw()}};
draw();

