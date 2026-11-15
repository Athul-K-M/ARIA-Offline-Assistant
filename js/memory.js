/* A.R.I.A. - Notes, saved settings, and backup/restore. */
/* ===== MEMORY, SETTINGS, BACKUP (Stage 6) ===== */
let NOTES=[];try{const d=JSON.parse(localStorage.getItem("aria.notes"));if(Array.isArray(d))NOTES=d.filter(n=>n&&typeof n.text==="string")}catch(e){}
const saveN=()=>{try{localStorage.setItem("aria.notes",JSON.stringify(NOTES))}catch(e){}};
function drawNotes(){const q=$("#nq").value.trim().toLowerCase();
 const L=NOTES.map((n,i)=>[n,i]).filter(([n])=>!q||n.text.toLowerCase().includes(q)).reverse();
 $("#mem").innerHTML=L.length?L.map(([n,i])=>`<div class="row"><div data-n="${i}" style="cursor:pointer"><b style="white-space:normal">${esc(n.text)}</b><small>${new Date(n.ts).toLocaleDateString([],{day:"numeric",month:"short"})}</small></div></div>`).join(""):`<p class="sub">${q?"No notes match.":"No notes yet. Tap Add note, or tell ARIA: remember that my dentist is on Thursday."}</p>`;
 $$("[data-n]").forEach(d=>d.onclick=()=>editNote(+d.dataset.n));$("#t2").textContent=NOTES.length+(NOTES.length===1?" note":" notes")}
let ni=-1;
function editNote(i){ni=i;$("#n-title").textContent=i>=0?"Edit note":"New note";$("#n-t").value=i>=0?NOTES[i].text:"";$("#n-err").textContent="";$("#n-del").style.display=i>=0?"":"none";$("#ne").classList.add("on")}
$("#addn").onclick=()=>editNote(-1);$("#nq").oninput=drawNotes;
$("#n-cancel").onclick=()=>$("#ne").classList.remove("on");
$("#n-save").onclick=()=>{const t=$("#n-t").value.trim();if(!t){$("#n-err").textContent="Write something first.";return}
 if(ni>=0)NOTES[ni].text=t;else NOTES.push({text:t,ts:Date.now()});saveN();drawNotes();$("#ne").classList.remove("on")};
$("#n-del").onclick=()=>{if(confirm("Delete this note?")){NOTES.splice(ni,1);saveN();drawNotes();$("#ne").classList.remove("on")}};
const top3=a=>a.slice(-3).reverse().map(n=>n.text).join(". ");
function tryNotes(text,n){
 let m=text.match(/^\s*(?:(?:hey|hi|ok)\s+)?(?:aria[,\s]+)?(?:remember(?:\s+that)?|(?:take|save|make)\s+a\s+note(?:\s+that)?|note\s+that)\s+(.+?)\s*$/i);
 if(m){NOTES.push({text:m[1].replace(/[.!]+$/,""),ts:Date.now()});saveN();drawNotes();return pick(["Noted. I'll remember that.","Done. It's filed away, and I don't forget."])}
 if(/^(what did i ask you to remember|what do you remember|read (my )?notes|my notes|list (my )?notes|show (my )?notes)$/.test(n))
  return NOTES.length?"You have "+NOTES.length+(NOTES.length===1?" note":" notes")+". Latest: "+top3(NOTES)+".":"You haven't asked me to remember anything yet.";
 if(/^how many notes/.test(n))return "You have "+NOTES.length+(NOTES.length===1?" note.":" notes.");
 if(/^(delete|forget|remove) (the )?last note$/.test(n)){if(!NOTES.length)return "There's nothing to forget.";NOTES.pop();saveN();drawNotes();return "Gone. I never saw it."}
 m=n.match(/^(?:search notes for|do i have a note about|what do you know about|what did i say about)\s+(.+)$/);
 if(m){const h=NOTES.filter(x=>x.text.toLowerCase().includes(m[1]));return h.length?"Found "+h.length+". "+top3(h)+".":"Nothing about "+m[1]+" in my notes."}
 return null}

let SET={};try{SET=JSON.parse(localStorage.getItem("aria.set"))||{}}catch(e){}
const sl=()=>$$("#persona input[type=range]");
function saveS(){NAME=$("#nm").value||"Athul";document.body.classList.toggle("calm",$("#calm").checked);SET={vo:$("#vo").checked,rate:$("#rate").value,pitch:$("#pitch").value,voice:(V[$("#vsel").value]||{}).name||SET.voice||"",nm:$("#nm").value,calm:$("#calm").checked,fo:$("#fo").checked,pers:sl().map(r=>r.value)};
 try{localStorage.setItem("aria.set",JSON.stringify(SET))}catch(e){}}
function applyS(){if("vo" in SET){$("#vo").checked=!!SET.vo;$("#rate").value=SET.rate;$("#pitch").value=SET.pitch;$("#nm").value=SET.nm||"Athul";$("#calm").checked=!!SET.calm;$("#fo").checked=SET.fo!==false;
  (SET.pers||[]).forEach((v,i)=>{const r=sl()[i];if(r){r.value=v;r.previousElementSibling.querySelector("em").textContent=r.value}});
  $("#rv").textContent=(+$("#rate").value).toFixed(2);$("#pv").textContent=(+$("#pitch").value).toFixed(2)}
 NAME=$("#nm").value||"Athul";document.body.classList.toggle("calm",$("#calm").checked)}
function setVoice(){const k=V.findIndex(v=>v.name===SET.voice);if(k>=0)$("#vsel").value=k}
["input","change"].forEach(ev=>{["#vo","#rate","#pitch","#vsel","#nm","#calm","#fo"].forEach(s=>$(s).addEventListener(ev,saveS));sl().forEach(r=>r.addEventListener(ev,saveS))});

const okCmd=c=>c&&Array.isArray(c.t)&&c.t.length&&c.t.every(x=>typeof x==="string")&&Array.isArray(c.r)&&c.r.every(x=>typeof x==="string")&&(c.a==="none"||LBL[c.a]);
async function backup(){const j=JSON.stringify({app:"aria",v:1,at:new Date().toISOString(),cmds:store.cmds,notes:NOTES,settings:SET},null,1),n="aria-backup-"+new Date().toISOString().slice(0,10)+".json";
 try{const f=new File([j],n,{type:"application/json"});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:n});return}}catch(e){if(e.name==="AbortError")return}
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([j],{type:"application/json"}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
$("#bk").onclick=backup;$("#rs").onclick=()=>$("#rf").click();
$("#rf").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
 try{const d=JSON.parse(await f.text());if(d.app!=="aria"||!Array.isArray(d.cmds)||!d.cmds.length||!d.cmds.every(okCmd))throw 0;
  const nn=Array.isArray(d.notes)?d.notes.filter(n=>n&&typeof n.text==="string").map(n=>({text:n.text,ts:+n.ts||Date.now()})):[];
  if(!confirm("Restore this backup? It replaces your current commands, replies, notes and settings."))return;
  store.cmds=d.cmds.map(c=>({t:c.t,a:c.a,r:c.r.length?c.r:["{a}"],on:c.on?1:0}));NOTES=nn;SET=d.settings&&typeof d.settings==="object"?d.settings:{};
  save();saveN();try{localStorage.setItem("aria.set",JSON.stringify(SET))}catch(x){}
  applyS();setVoice();draw();drawNotes();alert("Backup restored.")}catch(x){alert("That file isn't a valid ARIA backup.")}};
applyS();drawNotes();
