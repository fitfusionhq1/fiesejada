import "./style.css";
import "./map.css";
import "./admin.css";
import { groups, stations, rules } from "./content.js";
import { session, createTeam, getTeam, scanStation, addHint, submitPhoto, listTeams, listStationHints, getFieldTestWithoutQrEnabled, saveFieldTestWithoutQrEnabled, saveStationHints, resetStationHints, isDemo } from "./db.js";

const app = document.querySelector("#app");
const path = () => location.pathname;
const nav = p => { history.pushState({}, "", p); render(); };
const esc = s => String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shell = (body, step="") => `<header><button class="brand" data-nav="/">⚓ FIESEYA</button>${step?`<span class="step">${step}</span>`:""}</header><main>${body}</main><footer>Odiseja po Fiesi · Igrajte varno</footer>`;
const button = (label, attrs="") => `<button class="primary" ${attrs}>${label}</button>`;
let activeStations = stations;
let fieldTestWithoutQrEnabled = true;

async function refreshStationHints() {
  const overrides = await listStationHints();
  activeStations = Object.fromEntries(Object.entries(stations).map(([id, station]) => [
    id,
    { ...station, ...(overrides[id] || {}) },
  ]));
}

async function refreshGameSettings() {
  fieldTestWithoutQrEnabled = await getFieldTestWithoutQrEnabled();
}

function home(){
  return shell(`<section class="hero"><div class="sun"></div><p class="eyebrow">VELIKA IGRA PO MOTIVIH ODISEJE</p><h1>FIESEYA</h1><p class="lead">Pozejdon je razburkal morje in raztresel vaše posadke med otoke Fiese. Opravite preizkušnje. Premagajte njegove pasti. Vrnite se na Itako.</p><div class="actions">${button("Zberi posadko","data-nav='/prijava'")}<button class="ghost" data-nav="/nadaljuj">Nadaljuj igro</button></div><div class="wave">〰 〰 〰</div></section>`);
}

function register(){
  const cards=Object.entries(groups).map(([k,g])=>`<label class="group-card" style="--group:${g.color}"><input type="radio" name="group" value="${k}" required><span class="symbol">${g.symbol}</span><b>${k}</b><small>${g.name}</small></label>`).join("");
  return shell(`<section class="panel"><p class="eyebrow">PRVI KORAK</p><h2>Zberite svojo posadko</h2><p>Izberite barvo, ki vam je bila dodeljena. Barva določi vašo pot med otoki.</p><form id="register"><div class="group-grid">${cards}</div><label>Ime posadke<input name="team_name" required maxlength="40" placeholder="npr. Morski volkovi"></label><label>Člani posadke<textarea name="members" required rows="4" placeholder="Vsakega člana vpišite v novo vrstico"></textarea></label><label class="check"><input type="checkbox" required> Prebrali smo in sprejemamo varnostna pravila.</label>${button("Ustvari posadko","type='submit'")}<p class="notice">${isDemo?"Predstavitveni način je vključen; podatki se hranijo na tej napravi.":"Varna povezava s podatkovno bazo je vzpostavljena."}</p></form></section>`,"Prijava");
}

async function game(){
  await Promise.all([refreshStationHints(), refreshGameSettings()]);
  const s=session.get(); if(!s) return shell(`<section class="panel center"><h2>Posadka ni prijavljena</h2><p>Najprej se vrnite na Itako in ustvarite posadko.</p>${button("Na prijavo","data-nav='/prijava'")}</section>`);
  const team=await getTeam(s.id); if(!team){session.clear();return register();}
  const g=groups[team.group_code], route=g.route;
  if(team.status==="finished" || team.current_step>=route.length) return finish(team,g);
  if(team.current_step===0) return intro(team,g);
  const target=route[team.current_step];
  return clue(team,g,target);
}

function intro(team,g){
  return shell(`<section class="panel"><div class="crew" style="--group:${g.color}"><span>${g.symbol}</span><div><small>POSADKA ${team.group_code}</small><h2>${esc(team.team_name)}</h2></div></div><h3>Preden odplujete</h3><ul class="rules">${rules.map(r=>`<li>${r}</li>`).join("")}</ul><div class="story"><b>Prva preizkušnja: spomin na odhod</b><p>${activeStations[4].task}</p></div><form id="photo" data-station="4"><label class="upload">📷 <span>Dodaj začetno fotografijo</span><input id="file" type="file" accept="image/*" capture="environment" required></label>${button("Oddaj in odpluj","type='submit'")}</form></section>`,"Itaka · začetek");
}

function clue(team,g,target){
  const st=activeStations[target], done=Math.max(0,team.current_step-1);
  const fieldTest = fieldTestWithoutQrEnabled ? `<div class="devscan"><small>TERENSKI PREIZKUS BREZ QR-KODE</small><button class="link" data-nav="/postaja/${target}">Simuliraj pravilen QR-sken →</button></div>` : "";
  return shell(`<section class="panel"><div class="progress"><span style="width:${done/7*100}%"></span></div><p class="eyebrow">${done} OD 7 PREIZKUŠENJ</p><div class="story"><span class="big">${g.symbol}</span><h2>Pozejdonov naslednji otok</h2><p class="clue">»${st.hint}«</p><figure class="clue-map"><img src="${st.map}" alt="Okvirno območje naslednje postaje ${target}"><figcaption>Okvirno območje naslednjega otoka</figcaption></figure></div><p>Ko najdete oznako, skenirajte QR-kodo. Če ste na pravem otoku, se bo odprla preizkušnja.</p><div class="actions"><button class="ghost" id="extra" data-station="${target}">Atenin dodatni namig (−1)</button></div><div id="extraText"></div>${fieldTest}</section>`,`Pot do ${done+1}. otoka`);
}

async function station(id){
  await refreshStationHints();
  const s=session.get(); if(!s) return shell(`<section class="panel center"><h2>Vaša posadka še ni prijavljena</h2>${button("Na začetno prijavo","data-nav='/prijava'")}</section>`);
  const team=await getTeam(s.id), g=groups[team.group_code], expected=g.route[team.current_step];
  const ok=await scanStation(team,id,expected);
  if(!ok) return shell(`<section class="panel center warning"><div class="poseidon">♆</div><p class="eyebrow">NAPAČEN OTOK · −2 TOČKI</p><h2>Pozejdon vas je zavedel</h2><p>Ta otok še ni del vaše poti. Vrnite se k zadnjemu namigu.</p>${button("Nazaj k namigu","data-nav='/igra'")}</section>`);
  const st=activeStations[id], final=id===4 && team.current_step===g.route.length-1;
  return shell(`<section class="panel"><p class="eyebrow">${final?"VRNITEV DOMOV":`OTOK ${id}`}</p><h2>${st.title}</h2><p class="place">${st.place}</p><div class="story"><p>${st.story}</p></div><h3>${final?"Ponovite začetni kader":"Vaša preizkušnja"}</h3><p class="task">${st.task}</p><div class="success"><b>Uspeh:</b> ${st.success}</div><form id="photo" data-station="${id}" data-final="${final}"><label class="upload">📷 <span>Fotografiraj dokaz</span><input id="file" type="file" accept="image/*" capture="environment" required></label>${button(final?"Zaključi Odisejo":"Oddaj dokaz","type='submit'")}</form></section>`,final?"Itaka · cilj":st.title);
}

function finish(team,g){
  return shell(`<section class="hero compact"><p class="eyebrow">ODISEJA JE KONČANA</p><div class="laurel">☙ ${g.symbol} ❧</div><h1>Dobrodošli doma</h1><p class="lead">Posadka <b>${esc(team.team_name)}</b> je premagala Pozejdonove ovire in se varno vrnila na Itako.</p><div class="scorecard"><span>Opravljenih preizkušenj</span><b>7 / 7</b></div><p>Fotografije bo organizator ocenil po izvirnosti in upoštevanju navodil.</p><button class="ghost" id="logout">Zaključi na tej napravi</button></section>`);
}

async function admin(){
  const unlocked=sessionStorage.getItem("fieseya-admin")==="yes";
  if(!unlocked) return shell(`<section class="panel narrow"><p class="eyebrow">ORGANIZATOR</p><h2>Nadzorna paluba</h2><form id="adminLogin"><label>PIN organizatorja<input name="pin" type="password" inputmode="numeric" required></label>${button("Odpri pregled","type='submit'")}</form></section>`);
  const teams=await listTeams();
  await Promise.all([refreshStationHints(), refreshGameSettings()]);
  const hintEditor=Object.entries(activeStations).map(([id,st])=>`<form class="hint-editor" data-station="${id}"><div class="hint-editor-head"><div><small>POSTAJA ${id}</small><h3>${esc(st.title)}</h3></div><span>${esc(st.place)}</span></div><label>Osnovni namig<textarea name="hint" rows="3" required>${esc(st.hint)}</textarea></label><label>Atenin dodatni namig<textarea name="extra" rows="3" required>${esc(st.extra)}</textarea></label><div class="actions"><button class="primary" type="submit">Shrani namiga</button><button class="ghost reset-hints" type="button">Povrni privzeto</button></div><p class="save-status" aria-live="polite"></p></form>`).join("");
  return shell(`<section class="panel wide"><div class="admin-head"><div><p class="eyebrow">ORGANIZATOR</p><h2>Nadzorna paluba</h2></div><button class="ghost small" id="refresh">Osveži</button></div><div class="stats"><div><b>${teams.length}</b><span>posadk</span></div><div><b>${teams.filter(t=>t.status==="finished").length}</b><span>na cilju</span></div><div><b>${teams.reduce((a,t)=>a+(t.penalty_points?Math.abs(t.penalty_points):(t.penalties||[]).reduce((s,p)=>s+Math.abs(p.points),0)),0)}</b><span>kazenskih točk</span></div></div><div class="table"><div class="tr th"><span>Posadka</span><span>Pot</span><span>Status</span><span>Kazni</span></div>${teams.map(t=>`<div class="tr"><span><b>${esc(t.team_name)}</b><small>${t.group_code} · ${(t.members||[]).length||"—"} članov</small></span><span>${Math.min(7,Math.max(0,t.current_step-1))}/7</span><span class="status ${t.status}">${t.status==="finished"?"Doma":"Na poti"}</span><span>${t.penalty_points??(t.penalties||[]).reduce((s,p)=>s+p.points,0)}</span></div>`).join("")||`<p>Prijavljena ni še nobena posadka.</p>`}</div><div class="admin-section-head"><p class="eyebrow">NAČIN PREIZKUŠANJA</p><h2>Terenski preizkus brez QR-kode</h2><form id="fieldTestSettings"><label class="check"><input name="enabled" type="checkbox" ${fieldTestWithoutQrEnabled ? "checked" : ""}> Omogoči ekipam gumb za simulacijo pravilnega QR-skena</label><button class="primary" type="submit">Shrani nastavitev</button><p class="save-status" aria-live="polite"></p></form></div><div class="admin-section-head"><p class="eyebrow">UREJANJE VSEBINE</p><h2>Namigi postaj</h2><p>Spremembe se uporabijo pri vseh ekipah ob naslednjem odprtju ali osvežitvi strani igre.</p></div><div class="hint-editors">${hintEditor}</div></section>`,"Administracija");
}

async function render(){
  try {
    const p=path(); let out;
    if(p==="/") out=home(); else if(p==="/prijava") out=register(); else if(p==="/nadaljuj"||p==="/igra") out=await game(); else if(p.startsWith("/postaja/")) out=await station(Number(p.split("/").pop())); else if(p==="/admin") out=await admin(); else out=home();
    app.innerHTML=out; bind();
  } catch(e){app.innerHTML=shell(`<section class="panel warning"><h2>Nekaj je ustavilo plovbo</h2><p>${esc(e.message)}</p><button class="primary" data-nav="/">Na začetek</button></section>`);}
}

function bind(){
  document.querySelectorAll("[data-nav]").forEach(el=>el.onclick=()=>nav(el.dataset.nav));
  document.querySelector("#register")?.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);try{const team=await createTeam({group_code:f.get("group"),team_name:f.get("team_name"),members:String(f.get("members")).split("\n").map(x=>x.trim()).filter(Boolean)});session.set({id:team.id});nav("/igra");}catch(err){alert(err.message)}});
  document.querySelector("#photo")?.addEventListener("submit",async e=>{e.preventDefault();const btn=e.target.querySelector("button");btn.disabled=true;btn.textContent="Nalaganje …";const s=session.get(),team=await getTeam(s.id),file=e.target.querySelector("#file").files[0];try{await submitPhoto(team,Number(e.target.dataset.station),file,e.target.dataset.final==="true");nav("/igra");}catch(err){btn.disabled=false;btn.textContent="Poskusi znova";alert(err.message)}});
  document.querySelector("#extra")?.addEventListener("click",async e=>{const s=session.get(),team=await getTeam(s.id),id=Number(e.target.dataset.station);await addHint(team,id);document.querySelector("#extraText").innerHTML=`<div class="extra"><b>Atena šepeta:</b> ${activeStations[id].extra}</div>`;e.target.disabled=true;});
  document.querySelector("#adminLogin")?.addEventListener("submit",async e=>{e.preventDefault();const pin=String(new FormData(e.target).get("pin")),submit=e.target.querySelector('button[type="submit"]');submit.disabled=true;try{const response=await fetch("/api/admin/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});if(!response.ok)throw new Error("Napačen PIN.");sessionStorage.setItem("fieseya-admin","yes");sessionStorage.setItem("fieseya-admin-pin",pin);render()}catch(err){alert(err.message)}finally{submit.disabled=false}});
  document.querySelector("#refresh")?.addEventListener("click",render);
  document.querySelector("#fieldTestSettings")?.addEventListener("submit",async e=>{e.preventDefault();const form=e.target,status=form.querySelector(".save-status"),submit=form.querySelector('button[type="submit"]'),enabled=form.elements.enabled.checked;submit.disabled=true;status.textContent="Shranjujem …";try{await saveFieldTestWithoutQrEnabled(enabled);fieldTestWithoutQrEnabled=enabled;status.textContent=enabled?"Terenski preizkus brez QR-kode je vključen.":"Terenski preizkus brez QR-kode je izključen."}catch(err){status.textContent=`Shranjevanje ni uspelo: ${err.message}`}finally{submit.disabled=false}});
  document.querySelectorAll(".hint-editor").forEach(form=>form.addEventListener("submit",async e=>{e.preventDefault();const id=Number(form.dataset.station),status=form.querySelector(".save-status"),submit=form.querySelector('button[type="submit"]');submit.disabled=true;status.textContent="Shranjujem …";try{const data=new FormData(form);await saveStationHints(id,String(data.get("hint")).trim(),String(data.get("extra")).trim());status.textContent="Shranjeno. Ekipe bodo spremembo videle ob osvežitvi.";await refreshStationHints()}catch(err){status.textContent=`Shranjevanje ni uspelo: ${err.message}`}finally{submit.disabled=false}}));
  document.querySelectorAll(".reset-hints").forEach(btn=>btn.addEventListener("click",async()=>{const form=btn.closest(".hint-editor"),id=Number(form.dataset.station),status=form.querySelector(".save-status");try{await resetStationHints(id);if(!isDemo)await saveStationHints(id,stations[id].hint,stations[id].extra);form.elements.hint.value=stations[id].hint;form.elements.extra.value=stations[id].extra;status.textContent="Povrnjena so privzeta besedila.";await refreshStationHints()}catch(err){status.textContent=`Ponastavitev ni uspela: ${err.message}`}}));
  document.querySelector("#logout")?.addEventListener("click",()=>{session.clear();nav("/")});
}
addEventListener("popstate",render); render();
