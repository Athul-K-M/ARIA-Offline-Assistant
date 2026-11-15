/* A.R.I.A. service worker: keeps the app working offline.
   Serves from the cache first, then refreshes the cache in the background.
   If you ADD or RENAME a file, add it to FILES and change VERSION. */
const VERSION="aria-v2";
const FILES=["./", "index.html", "manifest.webmanifest", "css/style.css", "js/ui.js", "js/engine.js", "js/commands.js", "js/chat.js", "js/memory.js", "js/system.js", "js/voice.js", "js/pwa.js", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
  const net=fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(VERSION).then(c=>c.put(e.request,copy))}return r}).catch(()=>hit||caches.match("index.html"));
  return hit||net}))});
