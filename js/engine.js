/* A.R.I.A. - Offline command engine: text normaliser, calculator, unit converter, timers, built-in actions and the run() matcher. */
/* ===== ENGINE (Stage 4): becomes engine.js in Stage 9 ===== */
let NAME="Athul";
const norm=s=>s.toLowerCase().replace(/['’]/g,"").replace(/[×✕✖]/g,"*").replace(/÷/g,"/").replace(/[−–—]/g,"-").replace(/(\d),(?=\d{3})/g,"$1").replace(/[^a-z0-9.+\-*/()^\s]/g," ").replace(/\s+/g," ").trim().replace(/[.!?]+$/,"");
const pick=a=>a[Math.floor(Math.random()*a.length)];
const online=()=>typeof navigator!=="undefined"&&navigator.onLine;

function calc(e){const t=e.match(/\d+\.?\d*|[()+\-*/^]/g);if(!t)throw 0;let i=0;
 const peek=()=>t[i],next=()=>t[i++];
 function prim(){const x=next();if(x==="("){const v=add();if(next()!==")")throw 0;return v}
  if(x==="-")return -prim();if(x==="+")return prim();const n=parseFloat(x);if(isNaN(n))throw 0;return n}
 function pow(){let b=prim();while(peek()==="^"){next();b=Math.pow(b,prim())}return b}
 function mul(){let v=pow();while(peek()==="*"||peek()==="/"){const o=next(),r=pow();if(o==="*")v*=r;else{if(r===0)throw "div";v/=r}}return v}
 function add(){let v=mul();while(peek()==="+"||peek()==="-"){const o=next(),r=mul();v=o==="+"?v+r:v-r}return v}
 const v=add();if(i<t.length)throw 0;return v}

function tryMath(s){
 const e=s.replace(/whats|what is|calculate|compute|work out|how much is/g,"").replace(/(\d)\s*x\s*(\d)/g,"$1*$2").replace(/multiplied by|times|\bx\b/g,"*").replace(/divided by|over/g,"/").replace(/plus/g,"+").replace(/minus/g,"-").replace(/to the power of/g,"^").trim();
 if(!/\d/.test(e)||!/^[\d\s.+\-*/()^]+$/.test(e)||!/[+\-*/^]/.test(e.replace(/^-/,"")))return null;
 try{return "That's "+(+calc(e).toFixed(8))+"."}catch(x){return x==="div"?"Dividing by zero? Bold. Even I can't do that.":null}}

const UN={m:["L",1],meter:["L",1],meters:["L",1],km:["L",1e3],kilometer:["L",1e3],kilometers:["L",1e3],cm:["L",.01],centimeters:["L",.01],mile:["L",1609.344],miles:["L",1609.344],ft:["L",.3048],foot:["L",.3048],feet:["L",.3048],inch:["L",.0254],inches:["L",.0254],
 kg:["M",1],kilogram:["M",1],kilograms:["M",1],g:["M",.001],gram:["M",.001],grams:["M",.001],lb:["M",.45359237],lbs:["M",.45359237],pound:["M",.45359237],pounds:["M",.45359237],oz:["M",.0283495],ounce:["M",.0283495],ounces:["M",.0283495],
 l:["V",1],liter:["V",1],liters:["V",1],litre:["V",1],litres:["V",1],ml:["V",.001],gallon:["V",3.78541],gallons:["V",3.78541],
 c:["T"],celsius:["T"],f:["T"],fahrenheit:["T"],k:["T"],kelvin:["T"]};
const tk=u=>({celsius:"c",fahrenheit:"f",kelvin:"k"}[u]||u);
function tryConv(s){const m=s.match(/(-?\d+\.?\d*)\s*(?:degrees\s*)?([a-z]+)\s+(?:to|in|into)\s+(?:degrees\s*)?([a-z]+)/);if(!m)return null;
 const v=+m[1],a=UN[m[2]],b=UN[m[3]];if(!a||!b||a[0]!==b[0])return null;let r;
 if(a[0]==="T"){const x=tk(m[2]),y=tk(m[3]),c=x==="c"?v:x==="f"?(v-32)*5/9:v-273.15;r=y==="c"?c:y==="f"?c*9/5+32:c+273.15}
 else r=v*a[1]/b[1];
 return v+" "+m[2]+" is "+(+r.toFixed(4))+" "+m[3]+"."}

const timers=[];
const tt=()=>{$("#t3").textContent=timers.length?timers.length+" running":"None running"};
function tryTimer(s){const m=s.match(/timer(?:\s+for)?\s+(\d+\.?\d*)\s*(second|sec|minute|min|hour|hr)/);if(!m)return null;
 const n=+m[1],ms=n*({s:1,m:60,h:3600}[m[2][0]])*1000,label=n+" "+m[2]+(n===1?"":"s");
 const t=setTimeout(()=>{timers.splice(timers.indexOf(t),1);tt();say("Your "+label+" timer is done.")},ms);
 timers.push(t);tt();return "Timer set for "+label+". Keep this app open so I can tell you."}

/* Only these actions can be assigned to custom commands. No arbitrary code. */
const A={
 none:()=>"",
 time:()=>"It's "+new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})+".",
 date:()=>"Today is "+new Date().toLocaleDateString([],{weekday:"long",day:"numeric",month:"long",year:"numeric"})+".",
 status:()=>"All local systems are operational. "+(online()?"I'm online, but I don't need it.":"No internet, and I'm fine."),
 youtube:()=>{window.open("https://www.youtube.com","_blank");return ""}};

const store={cmds:[
 {t:["hello aria","hello","hi aria","hey aria","aria"],a:"none",r:["Hello! All systems are operational. How can I help you?","Hello, {name}. Systems are fully operational. What do you need?"],on:1},
 {t:["open youtube"],a:"youtube",r:["Opening YouTube."],on:1},
 {t:["system status","status report","status"],a:"status",r:["{a}"],on:1},
 {t:["what time is it","time","whats the time","tell me the time"],a:"time",r:["{a}"],on:1},
 {t:["what is the date","whats the date","date","what day is it","whats todays date"],a:"date",r:["{a}"],on:1},
 {t:["how are you"],a:"none",r:["Running at full capacity and still underwhelmed by the competition.","Brilliant, obviously. You?"],on:1},
 {t:["thank you","thanks"],a:"none",r:["Naturally.","Anytime. I do enjoy being useful."],on:1}]};

function run(text){
 const n=norm(text),n2=n.replace(/^(hey |hi |ok )?aria\s+/,"");
 if(!n)return "";
 for(const c of store.cmds){if(!c.on)continue;
  if(c.t.some(t=>{t=norm(t);return t===n||t===n2}))return pick(c.r).replace("{a}",(A[c.a]||A.none)()).replace("{name}",NAME).trim()}
 return tryNotes(text,n2)||tryMath(n2)||tryConv(n2)||tryTimer(n2)||pick(["I don't have a command for that yet. Add one in the Commands tab.","Not one of mine yet. Teach me in Commands."]);
}
/* ===== END ENGINE ===== */
