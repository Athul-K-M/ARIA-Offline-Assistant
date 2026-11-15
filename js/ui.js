/* A.R.I.A. - Navigation between screens, section list, shared helpers ($, $$, row). */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const names={core:["Core","Dashboard"],chat:["Chat","Talk to ARIA"],commands:["Commands","Actions and triggers"],replies:["Custom replies","Phrases and answers"],persona:["Personality","Her character"],voice:["Voice","Speech settings"],memory:["Memory","Local notes"],status:["System status","Offline checks"],settings:["Settings","Options and backup"]};
function go(id){$$("section").forEach(s=>s.classList.toggle("on",s.id===id));$$("nav [data-go]").forEach(b=>b.classList.toggle("on",b.dataset.go===id));$("#menu").classList.toggle("on",!$("nav [data-go="+id+"]"));$("#sheet").classList.remove("on");$("main").scrollTop=0}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("#grid").innerHTML=Object.keys(names).map(k=>`<button data-go="${k}">${names[k][0]}<small>${names[k][1]}</small></button>`).join("");
$$("#grid [data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("#menu").onclick=()=>$("#sheet").classList.toggle("on");
$("#sheet").onclick=e=>{if(e.target.id==="sheet")e.target.classList.remove("on")};

const row=(t,s,on)=>`<div class="row"><div><b>${t}</b><small>${s}</small></div><label class="sw"><input type="checkbox" ${on?"checked":""}><span></span></label></div>`;
