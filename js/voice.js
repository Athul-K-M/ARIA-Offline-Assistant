/* A.R.I.A. - Voice engine: speech output and speech input behind one Voice object, plus the tap-to-talk core. */
/* ===== VOICE ENGINE (Stage 7): swap this object for a neural or online provider later ===== */
const MSG={unsupported:"Speech input isn't available in this browser. Use the Chat tab instead.","not-allowed":"Speech recognition is blocked. Allow Microphone and Speech Recognition for this site in iOS Settings.","service-not-allowed":"Speech recognition is blocked. Allow Microphone and Speech Recognition for this site in iOS Settings.","no-speech":"I didn't catch that. Tap the core and try again.",network:"Speech input needs an internet connection on this device right now. Typing still works offline.","audio-capture":"I can't reach the microphone.",aborted:""};
const Voice={provider:"system",
 speak(t){if(!window.speechSynthesis||!$("#vo").checked||!t)return;try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(x){}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.voice=V[$("#vsel").value]||null;u.rate=+$("#rate").value;u.pitch=+$("#pitch").value;speechSynthesis.speak(u)},
 listen(on){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){on.error("unsupported");return null}
  const r=new SR();r.lang=(V[$("#vsel").value]||{}).lang||"en-US";r.interimResults=true;r.continuous=false;
  let got="",done=false;
  r.onresult=e=>{let t="",fin=false;for(let i=0;i<e.results.length;i++){t+=e.results[i][0].transcript;if(e.results[i].isFinal)fin=true}got=t;if(fin){if(!done){done=true;on.final(t);try{r.stop()}catch(x){}}}else on.interim(t)};
  r.onerror=e=>on.error(e.error);r.onend=()=>{if(!done&&got.trim()){done=true;on.final(got)}on.end()};
  try{r.start()}catch(x){on.error("aborted");return null}return r}};
let rec=null,pending=null;
function talk(){
 if(rec){rec.stop();return}
 if(window.speechSynthesis)speechSynthesis.cancel();
 const setS=(live,st,h)=>{$("#hud").classList.toggle("live",live);$("#st").textContent=st;$("#mic").textContent=live?"Stop":"Talk";if(h!==undefined)$("#hint").textContent=h};
 rec=Voice.listen({
  interim:t=>{setS(true,"LISTENING","“"+t+"”");$("#msg").value=t},
  final:t=>{const v=t.trim();$("#msg").value="";if(!v)return;bub(v,"me");const r=run(v);$("#hint").textContent=r||"";if(r){bub(r,"ai");pending=r}},
  end:()=>{rec=null;setS(false,"STANDING BY");if(pending){const t=pending;pending=null;setTimeout(()=>Voice.speak(t),600)}},
  error:c=>{rec=null;$("#msg").value="";setS(false,"STANDING BY",c in MSG?MSG[c]:"Speech input failed: "+c)}});
 if(rec)setS(true,"LISTENING","Listening…")}
$("#hud").onclick=talk;$("#hud").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();talk()}};$("#mic").onclick=talk;
