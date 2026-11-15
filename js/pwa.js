/* A.R.I.A. - Registers the offline cache (sw.js). Works on https:// and localhost, not file://. */
if("serviceWorker" in navigator&&location.protocol!=="file:"){addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}
