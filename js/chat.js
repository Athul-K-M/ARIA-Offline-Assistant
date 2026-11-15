/* A.R.I.A. - Chat screen: message bubbles, sending text, speaking replies. */

const bub=(t,c)=>{const d=document.createElement("div");d.className="b "+c;d.textContent=t;$("#log").appendChild(d);$("main").scrollTop=1e5};
function speak(t){return Voice.speak(t)}
const say=t=>{bub(t,"ai");speak(t)};
$("#send").onsubmit=e=>{e.preventDefault();const v=$("#msg").value.trim();if(!v)return;$("#msg").value="";bub(v,"me");const r=run(v);if(r)say(r)};

