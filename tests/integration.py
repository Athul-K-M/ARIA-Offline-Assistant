import subprocess,time,json,os,tempfile
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..");TMP=tempfile.mkdtemp()
from playwright.sync_api import sync_playwright
srv=subprocess.Popen(["python3","-m","http.server","8765","--directory",ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
URL="http://localhost:8765/index.html";res=[];errs=[]
def T(name,ok,info=""):res.append(ok);print(("PASS " if ok else "FAIL ")+name+(" | "+str(info) if info and not ok else ""))
FAKE="""window.SpeechRecognition=window.webkitSpeechRecognition=function(){const r=this;r.start=()=>setTimeout(()=>{
 if(window.__sr==='deny'){r.onerror({error:'not-allowed'});r.onend();return}
 r.onresult({resultIndex:0,results:[Object.assign([{transcript:'what is 6 times 7'}],{isFinal:true})]});r.onend()},60);r.stop=()=>r.onend&&r.onend()};"""
try:
 with sync_playwright() as p:
  b=p.chromium.launch();ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True,accept_downloads=True)
  pg=ctx.new_page();pg.add_init_script(FAKE)
  pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:m.type=="error" and errs.append(m.text))
  pg.on("dialog",lambda d:d.accept())
  pg.goto(URL);pg.wait_for_timeout(400)
  chat=lambda q:(pg.fill("#msg",q),pg.press("#msg","Enter"),pg.wait_for_timeout(120),pg.inner_text("#log .b:last-child"))[-1]
  go=lambda t:(pg.click(f'nav [data-go="{t}"]'),pg.wait_for_timeout(80))
  # 1 load + nav
  T("loads with ARIA in the core",pg.inner_text(".read b")=="ARIA")
  T("dashboard tiles show counts",pg.inner_text("#t1")=="7 active" and pg.inner_text("#t2")=="0 notes",(pg.inner_text("#t1"),pg.inner_text("#t2")))
  ok=True
  for t in ["chat","commands","voice","core"]:
   go(t);ok&=pg.is_visible(f"section#{t}")
  for t in ["replies","persona","memory","status","settings"]:
   pg.click("#menu");pg.click(f'#grid [data-go="{t}"]');pg.wait_for_timeout(80);ok&=pg.is_visible(f"section#{t}")
  T("all 9 sections reachable",ok)
  ov=[]
  for t in ["core","chat","commands","replies","persona","voice","memory","status","settings"]:
   pg.click("#menu");pg.click(f'#grid [data-go="{t}"]');pg.wait_for_timeout(60)
   if pg.evaluate("document.documentElement.scrollWidth>innerWidth"):ov.append(t)
  T("no sideways overflow on any screen",not ov,ov)
  # 2 engine via chat
  go("chat")
  T("chat: greeting",("Hello" in chat("Hello ARIA")))
  T("chat: math",chat("what is 12 plus 5 times 3")=="That's 27.")
  T("chat: conversion",chat("convert 5 km to miles")=="5 km is 3.1069 miles.")
  T("chat: time",chat("what time is it").startswith("It's "))
  T("chat: date",chat("what's the date").startswith("Today is"))
  T("chat: status",chat("system status").startswith("All local systems"))
  T("chat: unknown",("Commands" in chat("blorp zork")))
  chat("set a timer for 1 second");pg.wait_for_timeout(1500)
  T("chat: timer fires",("timer is done" in pg.inner_text("#log .b:last-child")))
  T("chat: tile timers reset",pg.inner_text("#t3")=="None running")
  # 3 command manager
  go("commands");pg.click("#addc");pg.fill("#e-t","open maps");pg.fill("#e-alt","show maps\nmaps please");pg.select_option("#e-a","date");pg.fill("#e-r","Here you go. {a}");pg.click("#e-save")
  T("add command",("open maps" in pg.inner_text("#cmds")) and pg.inner_text("#t1")=="8 active")
  go("chat");T("custom command + alt phrase + {a}",chat("maps please").startswith("Here you go. Today is"))
  go("commands");pg.click('[data-e="7"]');pg.fill("#e-r","Maps ready.");pg.click("#e-save");go("chat")
  T("edit command",chat("show maps")=="Maps ready.")
  go("commands");pg.click('#cmds input[data-i="7"] + span');go("chat")
  T("disable command",("Commands" in chat("open maps")) and pg.inner_text("#t1")=="7 active" or "Teach me" in pg.inner_text("#log .b:last-child") or "don't have" in pg.inner_text("#log .b:last-child"))
  go("commands");pg.click('[data-e="7"]');pg.click("#e-del");T("delete command",("open maps" not in pg.inner_text("#cmds")))
  pg.click("#addc");pg.fill("#e-t","");pg.click("#e-save");T("empty command blocked",pg.inner_text("#e-err")!="");pg.click("#e-cancel")
  pg.click("#menu");pg.click('#grid [data-go="replies"]');pg.click("#addr");pg.fill("#e-t"," good morning ");pg.fill("#e-r","Morning, {name}.\nUp already?");pg.click("#e-save")
  T("add custom reply",("good morning" in pg.inner_text("#reps")))
  go("chat");T("custom reply works",chat("Good morning!") in ("Morning, Athul.","Up already?"))
  # 4 notes
  T("note via chat",chat("Remember that my dentist is on Thursday")!="" and pg.inner_text("#t2")=="1 note")
  pg.click("#menu");pg.click('#grid [data-go="memory"]');pg.click("#addn");pg.fill("#n-t","Buy milk");pg.click("#n-save")
  T("note via UI",("Buy milk" in pg.inner_text("#mem")) and pg.inner_text("#t2")=="2 notes")
  pg.fill("#nq","dentist");T("note search",("dentist" in pg.inner_text("#mem")) and ("milk" not in pg.inner_text("#mem")));pg.fill("#nq","")
  pg.click('[data-n="1"]');pg.fill("#n-t","Buy oat milk");pg.click("#n-save");T("note edit",("oat milk" in pg.inner_text("#mem")))
  pg.click('[data-n="1"]');pg.click("#n-del");T("note delete",("oat milk" not in pg.inner_text("#mem")) and pg.inner_text("#t2")=="1 note")
  go("chat");T("note recall",("dentist" in chat("what did I ask you to remember")))
  # 5 settings + persistence
  pg.click("#menu");pg.click('#grid [data-go="persona"]');pg.fill("#nm","Boss")
  pg.click("#menu");pg.click('#grid [data-go="voice"]');pg.evaluate("[['#rate','1.3'],['#pitch','1.4']].forEach(([s,v])=>{const e=document.querySelector(s);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))})")
  pg.reload();pg.wait_for_timeout(400)
  T("reload keeps commands/replies",("good morning" in (pg.click("#menu"),pg.click('#grid [data-go="replies"]'),pg.inner_text("#reps"))[2]))
  T("reload keeps notes",pg.inner_text("#t2")=="1 note")
  T("reload keeps name/rate/pitch",pg.input_value("#nm")=="Boss" and pg.input_value("#rate")=="1.3" and pg.input_value("#pitch")=="1.4" and pg.evaluate("NAME")=="Boss",(pg.input_value("#nm"),pg.input_value("#rate")))
  # 6 backup / restore
  pg.click("#menu");pg.click('#grid [data-go="settings"]')
  with pg.expect_download() as d:pg.click("#bk")
  path=TMP+"/bk.json";d.value.save_as(path);j=json.load(open(path))
  T("backup file valid",j["app"]=="aria" and len(j["cmds"])==8 and len(j["notes"])==1 and j["settings"]["nm"]=="Boss",(len(j["cmds"]),len(j["notes"])))
  pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(300)
  T("wiped state is defaults",pg.inner_text("#t1")=="7 active" and pg.inner_text("#t2")=="0 notes")
  pg.click("#menu");pg.click('#grid [data-go="settings"]');pg.set_input_files("#rf",path);pg.wait_for_timeout(300)
  T("restore brings everything back",pg.inner_text("#t1")=="8 active" and pg.inner_text("#t2")=="1 note" and pg.input_value("#nm")=="Boss")
  bad=TMP+"/bad.json";open(bad,"w").write('{"app":"x","cmds":"no"}');msgs=[];pg.on("dialog",lambda d:msgs.append(d.message))
  pg.set_input_files("#rf",bad);pg.wait_for_timeout(300);T("bad backup rejected",any("valid" in m for m in msgs),msgs)
  xss=TMP+"/xss.json";json.dump({"app":"aria","cmds":[{"t":["<img src=x onerror=window.__x=1>"],"a":"none","r":["hi"],"on":1}],"notes":[{"text":"<b onclick=1>n</b>","ts":1}]},open(xss,"w"))
  pg.set_input_files("#rf",xss);pg.wait_for_timeout(300);T("restored text is escaped (no HTML injection)",pg.evaluate("window.__x")is None and pg.locator("#cmds img").count()==0 and pg.locator("#mem b").count()==1 and pg.evaluate("document.querySelector('#mem b').textContent")=="<b onclick=1>n</b>")
  pg.click("#reset");T("reset commands",pg.inner_text("#t1")=="7 active")
  # 7 voice input
  pg.click('nav [data-go="core"]');pg.click("#hud");pg.wait_for_timeout(400)
  T("tap core: hears and answers",pg.inner_text("#hint")=="That's 42." and pg.inner_text("#st")=="STANDING BY")
  pg.evaluate("window.__sr='deny'");pg.click("#hud");pg.wait_for_timeout(300)
  T("tap core: blocked-permission message",("blocked" in pg.inner_text("#hint")),pg.inner_text("#hint"))
  pg.click('nav [data-go="chat"]');pg.evaluate("window.__sr=''");pg.click("#mic");pg.wait_for_timeout(300)
  T("Talk button in chat",("42" in pg.inner_text("#log .b:last-child")))
  pg.evaluate("document.querySelector('#calm').click()");T("reduce motion toggles",pg.evaluate("document.body.classList.contains('calm')"))
  # extra
  pg.click('nav [data-go="commands"]');pg.click("#addc");pg.fill("#e-t","open maps");pg.click("#e-cancel")
  pg.click('nav [data-go="voice"]');pass
  r=pg.request.get("http://localhost:8765/manifest.webmanifest");T("manifest served",r.ok and json.loads(r.text())["short_name"]=="ARIA")
  T("icons served",all(pg.request.get("http://localhost:8765/icons/"+i).ok for i in ["icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","icon.svg"]))
  pg.goto(URL);pg.evaluate("navigator.serviceWorker.ready.then(()=>1)");pg.wait_for_timeout(800);pg.reload();pg.wait_for_timeout(500)
  T("service worker controls the page",pg.evaluate("!!navigator.serviceWorker.controller"))
  ctx.set_offline(True);pg.reload();pg.wait_for_timeout(600)
  T("app loads with no internet",pg.inner_text(".read b")=="ARIA" and pg.is_visible("#hud"))
  go("chat");T("works offline: chat answers",chat("what is 9 times 9")=="That's 81.")
  b.close()
finally:srv.kill()
print(f"\n{sum(res)}/{len(res)} passed");print("JS errors:",errs or "none")
