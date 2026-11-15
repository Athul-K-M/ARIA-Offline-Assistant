/* A.R.I.A. - Voice settings screen (voice list, speed, pitch, preview), personality sliders, system status checks. */
const ss=window.speechSynthesis;let V=[];
const MALE=/^(alex|daniel|fred|oliver|tom|rishi|aaron|arthur|gordon|lee|reed|eddy|rocko|grandpa|ralph|albert|bruce|junior)\b/i,
 NOVEL=/^(bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ)\b/i,
 FEM=/^(samantha|ava|allison|susan|serena|kate|karen|moira|tessa|fiona|nicky|zoe|martha|stephanie|joelle|siri)\b/i;
const rank=v=>(/premium/i.test(v.name)?0:/enhanced/i.test(v.name)?1:2)*2+(FEM.test(v.name)?0:1);
function loadV(){if(!ss)return;const fo=$("#fo").checked;
 V=ss.getVoices().filter(v=>v.lang.startsWith("en")&&!NOVEL.test(v.name)&&!(fo&&MALE.test(v.name))).sort((a,b)=>rank(a)-rank(b));
 $("#vsel").innerHTML=!V.length?"<option>No voices found</option>":V.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join("");setVoice();
 $("#s2").textContent=V.length?V.length+" English voices installed":"No voices found";
 $("#vhint").textContent=V.some(v=>/enhanced|premium/i.test(v.name))?"":"Only standard voices found. For a more natural sound, open iOS Settings, Accessibility, Spoken Content, Voices, and download an Enhanced or Premium voice."}
if(ss){loadV();ss.onvoiceschanged=loadV;$("#fo").addEventListener("change",()=>{loadV();saveS()})}else $("#s2").textContent="Not supported";
$("#rate").oninput=e=>$("#rv").textContent=(+e.target.value).toFixed(2);
$("#pitch").oninput=e=>$("#pv").textContent=(+e.target.value).toFixed(2);
$("#prev").onclick=()=>{if(!ss)return;ss.cancel();const u=new SpeechSynthesisUtterance("Hello. All systems are operational. How can I help you?");u.voice=V[$("#vsel").value]||null;u.rate=+$("#rate").value;u.pitch=+$("#pitch").value;ss.speak(u)};
$$("#persona input[type=range]").forEach(r=>r.oninput=()=>r.previousElementSibling.querySelector("em").textContent=r.value);

function net(){const o=navigator.onLine;$("#net").textContent=o?"Online":"Offline ready";$("#t4").textContent=o?"Online":"Offline ready";$("#s1").textContent=o?"Online. Not needed for offline features.":"Offline. All v1 features still work."}
net();addEventListener("online",net);addEventListener("offline",net);
$("#s3").textContent=(window.SpeechRecognition||window.webkitSpeechRecognition)?"Available. Offline support depends on your iOS version.":"Not available in this browser";
if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>$("#s4").textContent=(e.usage/1048576).toFixed(1)+" MB used of "+Math.round(e.quota/1048576)+" MB");else $("#s4").textContent="Unknown";
