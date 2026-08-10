const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);
const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2400)}
function stars(r){if(!r)return "";const f=Math.round(r);return `<span class="stars">${"\u2605".repeat(f)}${"\u2606".repeat(5-f)} <b>${r.toFixed(1)}</b></span>`}

function loadImgs(){
  $$("[data-src]").forEach(el=>{
    const src = el.getAttribute("data-src");
    el.removeAttribute("data-src");
    if(!src){el.classList.add("noimg");return}
    const im = new Image();
    im.onload = ()=>{el.style.backgroundImage=`url('${src}')`;el.classList.add("imgok")};
    im.onerror = ()=>el.classList.add("noimg");
    im.src = src;
  });
}
function initial(n){return (n||"?").trim().charAt(0).toUpperCase()}

const state = {
  filter:"ทั้งหมด",
  search:"",
  user: JSON.parse(localStorage.getItem("ptl_user")||"null"),
  users: JSON.parse(localStorage.getItem("ptl_users")||"[]"),
  favs: JSON.parse(localStorage.getItem("ptl_favs")||"[]"),
  profiles: JSON.parse(localStorage.getItem("ptl_profiles")||"{}"),
  currentPlace:null,
};
const params = new URLSearchParams(location.search);
const favMode = params.get("view")==="fav";

(function(){
  const page = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a").forEach(a=>a.classList.toggle("active", a.getAttribute("href")===page));
})();

$$("[data-close]").forEach(el=>el.onclick=e=>{
  e.target.closest(".modal").classList.add("hidden");
});

function openAuth(){
  const m=$("#authModal");
  if(!m) return;
  m.classList.remove("hidden");
  const active = document.querySelector(".auth-form:not(.hidden)");
  if(active){
    active.classList.remove("form-anim"); void active.offsetWidth;
    active.classList.add("form-anim");
  }
}
if($("#btnOpenAuth")) $("#btnOpenAuth").onclick = openAuth;

function playFormAnim(form){
  if(!form) return;
  form.classList.remove("form-anim");
  void form.offsetWidth;          // restart การเล่นอนิเมชัน
  form.classList.add("form-anim");
}
$$(".auth-tabs button").forEach(b=>b.onclick=()=>{
  const t = b.dataset.tab;
  const tabs = document.querySelector(".auth-tabs");
  if(tabs) tabs.dataset.active = t;          // ให้ pill เลื่อนตามแท็บ
  $$(".auth-tabs button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  $("#loginForm").classList.toggle("hidden", t!=="login");
  $("#signupForm").classList.toggle("hidden", t!=="signup");
  playFormAnim(t==="login" ? $("#loginForm") : $("#signupForm"));
});

if($("#signupForm")) $("#signupForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get("email").trim();
  const name = fd.get("name").trim();
  const password = fd.get("password");
  if(state.users.find(u=>u.email===email)){toast("อีเมลนี้ถูกใช้แล้ว");return}
  const user = {email,name,password,joined:new Date().toISOString()};
  state.users.push(user);
  save("ptl_users",state.users);
  if(window.Cloud) Cloud.saveUser(user);          // ↑ ขึ้นคลาวด์
  loginAs(user, true);
  toast("สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!");
};

/* บัญชีผู้ดูแลระบบ — กรอกที่ฟอร์มเข้าสู่ระบบปกติ แล้วระบบจะพาไปหลังบ้านเอง
   (ต้องตรงกับค่า ADMIN ในไฟล์ admin.js) */
const ADMIN_LOGIN = { email:"nattakit@gmail.com", password:"123456" };

if($("#loginForm")) $("#loginForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get("email").trim();
  const password = fd.get("password");

  /* ── เป็นผู้ดูแลระบบ → เข้าหลังบ้านทันที ── */
  if(email.toLowerCase() === ADMIN_LOGIN.email && password === ADMIN_LOGIN.password){
    localStorage.setItem("ptl_admin_session","1");
    toast("ยินดีต้อนรับผู้ดูแลระบบ กำลังเข้าสู่หลังบ้าน...");
    setTimeout(()=>{ location.href = "admin.html" }, 800);
    return;
  }

  const user = state.users.find(u=>u.email===email && u.password===password);
  if(!user){toast("อีเมลหรือรหัสผ่านไม่ถูกต้อง");return}
  loginAs(user);
  toast("เข้าสู่ระบบสำเร็จ");
};

/* บันทึกประวัติกิจกรรมสมาชิก (แสดงในหลังบ้าน) */
function logActivity(type, user){
  const rec = {type, name:user.name, email:user.email, time:new Date().toISOString()};
  if(window.Cloud){ Cloud.logActivity(rec); return }   // ขึ้นคลาวด์ แล้วซิงก์กลับเอง
  try{
    const log = JSON.parse(localStorage.getItem("ptl_activity")||"[]");
    log.unshift(rec);
    save("ptl_activity", log.slice(0,100));
  }catch(e){}
}

/* ดึงรายการโปรดของผู้ใช้คนปัจจุบันจากข้อมูลคลาวด์ */
function myFavs(){
  if(!state.user || !window.Cloud) return state.favs;
  try{
    const all = JSON.parse(localStorage.getItem("ptl_favs_all")||"{}");
    return all[Cloud.ek(state.user.email)] || [];
  }catch(e){ return [] }
}

function loginAs(user, isSignup){
  state.user = user;
  save("ptl_user",user);
  state.favs = myFavs();
  save("ptl_favs", state.favs);
  logActivity(isSignup ? "signup" : "login", user);
  $("#authModal").classList.add("hidden");
  syncAuthUI();
  if($("#profileForm")) fillProfile();
}

if($("#btnLogout")) $("#btnLogout").onclick = ()=>{
  state.user = null;
  localStorage.removeItem("ptl_user");
  syncAuthUI();
  toast("ออกจากระบบแล้ว");
  if($("#profileForm")||favMode) location.href = "index.html";
};

function syncAuthUI(){
  if(!$("#btnOpenAuth"))return;
  if(state.user){
    $("#btnOpenAuth").classList.add("hidden");
    $("#userMenu").classList.remove("hidden");
    const ini = initial(state.user.name);
    $("#avatarBtn").textContent = ini;
    $("#ddAvatar").textContent = ini;
    $("#ddName").textContent = state.user.name;
    $("#ddEmail").textContent = state.user.email;
  }else{
    $("#btnOpenAuth").classList.remove("hidden");
    $("#userMenu").classList.add("hidden");
    $("#userDropdown").classList.remove("open");
  }
}

if($("#avatarBtn")){
  $("#avatarBtn").onclick = e=>{
    e.stopPropagation();
    $("#userDropdown").classList.toggle("open");
  };
  document.addEventListener("click",e=>{
    if(!e.target.closest("#userMenu")) $("#userDropdown").classList.remove("open");
  });
  $$("#userDropdown [data-go]").forEach(b=>b.onclick=()=>{
    location.href = b.dataset.go;
  });
}

function openPlace(id){
  const p = PLACES.find(x=>x.id===id);
  if(!p || !$("#placeModal"))return;
  state.currentPlace = p;
  const mi=$("#modalImg");mi.className="modal-img";mi.style.backgroundImage="";
  mi.setAttribute("data-src",p.img);mi.setAttribute("data-cat",p.cat);loadImgs();
  $("#modalCat").textContent = p.cat;
  $("#modalName").innerHTML = `${p.name} ${stars(p.rating)}`;
  $("#modalAddr").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${p.addr}`;
  $("#modalDesc").textContent = p.desc;

  /* ── รายละเอียดเพิ่มเติม ── */
  const facts = $("#modalFacts");
  if(facts){
    const rows = [];
    if(p.hours)    rows.push(["fa-clock","เวลาเปิด",p.hours]);
    if(p.bestTime) rows.push(["fa-calendar-check","ช่วงที่แนะนำ",p.bestTime]);
    if(p.fee)      rows.push(["fa-tag","ค่าใช้จ่าย",p.fee]);
    facts.innerHTML = rows.map(([ic,label,val])=>
      `<div class="fact"><span class="fact-ic"><i class="fa-solid ${ic}"></i></span>
        <div><span class="fact-label">${label}</span><b>${val}</b></div></div>`).join("");
    facts.style.display = rows.length ? "grid" : "none";
  }
  const hl = $("#modalHighlights");
  if(hl){
    if(Array.isArray(p.highlights) && p.highlights.length){
      hl.innerHTML = `<h4><i class="fa-solid fa-star"></i> ไฮไลต์</h4><ul>` +
        p.highlights.map(h=>`<li>${h}</li>`).join("") + `</ul>`;
      hl.style.display = "block";
    }else hl.style.display = "none";
  }
  const tip = $("#modalTip");
  if(tip){
    if(p.tips){
      tip.innerHTML = `<i class="fa-solid fa-lightbulb"></i><span><b>เคล็ดลับ</b> ${p.tips}</span>`;
      tip.style.display = "flex";
    }else tip.style.display = "none";
  }
  $("#modalMap").href = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  const frame = $("#modalMapFrame");
  if(frame){
    frame.src = `https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&hl=th&output=embed`;
    $("#modalCoords").textContent = `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
  }
  updateFavBtn();
  stopNarration();                 // หยุดเสียงเก่าเมื่อเปิดสถานที่ใหม่
  resetSpeakBtn();
  $("#placeModal").classList.remove("hidden");
}

/* ═══ AI เล่าสถานที่ด้วยเสียง ═══
   ลำดับ: 1) Azure TTS ผ่าน Cloudflare Worker (เสียงคุณภาพสูง)
          2) ถ้าเรียกไม่ได้ → ใช้เสียงในเบราว์เซอร์ (Web Speech) แทนอัตโนมัติ
   ตั้งค่า URL ของ Worker ที่ตัวแปร window.TTS_WORKER_URL ใน cloud.js */
const synth = window.speechSynthesis;
let thaiVoice = null;
let ttsAudio = null;          // <audio> สำหรับเล่นเสียงจาก Azure
let ttsBusy = false;

function pickThaiVoice(){
  if(!synth) return;
  const voices = synth.getVoices();
  const isThai = v=>{
    const lang = (v.lang||"").toLowerCase().replace(/_/g,"-");
    const name = (v.name||"").toLowerCase();
    return lang==="th-th" || lang==="th" || lang.startsWith("th-")
        || /thai|ไทย|pattara|premwadee|niwat|achara/.test(name);
  };
  thaiVoice = voices.find(isThai) || null;
  window.__ptlThaiVoice = thaiVoice;   // ไว้ตรวจสอบใน Console
}
if(synth){
  pickThaiVoice();
  synth.onvoiceschanged = pickThaiVoice;
  /* Windows/Chrome บางเครื่องโหลด voice ช้า → ลองซ้ำอีกไม่กี่ครั้ง */
  let tries = 0;
  const retry = setInterval(()=>{
    if(thaiVoice || tries++ > 10){ clearInterval(retry); return; }
    pickThaiVoice();
  }, 400);
}

function buildNarration(p){
  const parts = [];
  parts.push(p.name);
  if(p.desc)     parts.push(p.desc);
  if(p.hours)    parts.push(`เปิดให้บริการ ${p.hours}`);
  if(p.bestTime) parts.push(`ช่วงเวลาที่แนะนำคือ ${p.bestTime}`);
  if(p.fee)      parts.push(`ค่าใช้จ่าย ${p.fee}`);
  return parts.join(". ");
}

function stopNarration(){
  if(synth && (synth.speaking || synth.pending)) synth.cancel();
  if(ttsAudio){ ttsAudio.pause(); ttsAudio.currentTime = 0; ttsAudio = null; }
  ttsBusy = false;
}
function setSpeakIcon(state){   // state: "idle" | "loading" | "speaking"
  const btn = $("#modalSpeak");
  if(!btn) return;
  btn.classList.toggle("speaking", state==="speaking");
  btn.classList.toggle("loading", state==="loading");
  const ic = btn.querySelector(".ms-ic i");
  if(ic){
    if(state==="loading")      ic.className = "fa-solid fa-spinner fa-spin";
    else if(state==="speaking")ic.className = "fa-solid fa-stop";
    else                       ic.className = "fa-solid fa-volume-high";
  }
}
function resetSpeakBtn(){ setSpeakIcon("idle"); }

/* เล่นด้วยเสียงในเบราว์เซอร์ (สำรอง) */
function speakBrowser(text){
  if(!synth){
    toast("เบราว์เซอร์นี้ยังไม่รองรับเสียงพูด ลองใช้ Chrome หรือ Safari");
    resetSpeakBtn();
    return;
  }
  pickThaiVoice();                       // สแกนเสียงใหม่อีกครั้ง เผื่อเพิ่งโหลดเสร็จ

  const doSpeak = ()=>{
    const u = new SpeechSynthesisUtterance(text);
    if(thaiVoice){ u.voice = thaiVoice; u.lang = thaiVoice.lang || "th-TH"; }
    else u.lang = "th-TH";               // ไม่เจอ voice ก็ยังลองสั่งเป็นภาษาไทย
    u.rate = 1.0; u.pitch = 1.05;
    u.onstart = ()=> setSpeakIcon("speaking");
    u.onend   = resetSpeakBtn;
    u.onerror = resetSpeakBtn;
    setSpeakIcon("speaking");
    synth.speak(u);
  };

  /* ถ้ายังไม่เจอเสียงไทย ลองรอ voice โหลดอีกครั้งสั้น ๆ ก่อนพูด */
  if(!thaiVoice){
    setSpeakIcon("loading");
    setTimeout(()=>{ pickThaiVoice(); doSpeak(); }, 350);
  }else{
    doSpeak();
  }
}

/* เล่นด้วย Azure ผ่าน Worker */
async function speakAzure(text){
  const url = window.TTS_WORKER_URL;
  if(!url) throw new Error("no-worker");        // ยังไม่ตั้งค่า → ไปใช้เบราว์เซอร์
  setSpeakIcon("loading");
  const res = await fetch(url, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ text, voice:"th-TH-PremwadeeNeural" })
  });
  if(!res.ok) throw new Error("worker-"+res.status);
  const blob = await res.blob();
  if(!blob.size || !/audio/.test(blob.type)) throw new Error("bad-audio");

  const audioUrl = URL.createObjectURL(blob);
  ttsAudio = new Audio(audioUrl);
  ttsAudio.onplay  = ()=> setSpeakIcon("speaking");
  ttsAudio.onended = ()=>{ resetSpeakBtn(); URL.revokeObjectURL(audioUrl); ttsAudio=null; };
  ttsAudio.onerror = ()=>{ throw new Error("play-error"); };
  await ttsAudio.play();
}

async function narratePlace(){
  /* กดซ้ำระหว่างเล่น = หยุด */
  if(ttsBusy || (synth && (synth.speaking||synth.pending)) || (ttsAudio && !ttsAudio.paused)){
    stopNarration();
    resetSpeakBtn();
    return;
  }
  const p = state.currentPlace;
  if(!p) return;
  const text = buildNarration(p);

  ttsBusy = true;
  try{
    await speakAzure(text);          // ลอง Azure ก่อน
  }catch(err){
    /* Azure ใช้ไม่ได้ (ยังไม่ตั้งค่า/เน็ตหลุด/โควตาหมด) → เบราว์เซอร์แทน */
    speakBrowser(text);
  }finally{
    ttsBusy = false;
  }
}
if($("#modalSpeak")) $("#modalSpeak").onclick = narratePlace;

/* ปิด modal → หยุดเสียงทันที */
document.querySelectorAll("#placeModal [data-close]").forEach(el=>{
  el.addEventListener("click", stopNarration);
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape") stopNarration(); });
function updateFavBtn(){
  if(!state.currentPlace)return;
  const isFav = state.favs.includes(state.currentPlace.id);
  $("#modalFav").innerHTML = isFav
    ? `<i class="fa-solid fa-heart" style="color:#e04a4a"></i> บันทึกแล้ว`
    : `<i class="fa-regular fa-heart"></i> บันทึก`;
}
if($("#modalFav")) $("#modalFav").onclick = ()=>{
  if(!state.user){toast("กรุณาเข้าสู่ระบบก่อน");openAuth();return}
  const id = state.currentPlace.id;
  if(state.favs.includes(id)) state.favs = state.favs.filter(x=>x!==id);
  else state.favs.push(id);
  save("ptl_favs",state.favs);
  if(window.Cloud) Cloud.saveFavs(state.user.email, state.favs);
  updateFavBtn();
  if(favMode) renderPlaces();
  toast("อัปเดตรายการโปรดแล้ว");
};

function cardHTML(p){
  return `
    <article class="card" data-id="${p.id}">
      <div class="card-imgwrap">
        <div class="card-img" data-src="${p.img}" data-cat="${p.cat}"></div>
        <span class="img-tag"><i class="fa-solid fa-tag"></i> ${p.tag}</span>
        ${p.rating?`<span class="img-rate">\u2605 ${p.rating.toFixed(1)}</span>`:""}
      </div>
      <div class="card-body">
        <span class="badge">${p.cat}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-meta"><i class="fa-solid fa-location-dot"></i><span>${p.addr}</span></div>
      </div>
    </article>`;
}

function renderTopPicks(){
  if(!$("#topPicks"))return;
  const top = [...PLACES].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,4);
  $("#topPicks").innerHTML = top.map((p,i)=>`
    <article class="pick" data-id="${p.id}">
      <div class="pick-img" data-src="${p.img}" data-cat="${p.cat}"></div>
      <div class="pick-body">
        <span class="pick-rank">0${i+1}</span>
        <div>
          <span class="badge">${p.cat}</span>
          <h3>${p.name}</h3>
          ${stars(p.rating)}
          <p><i class="fa-solid fa-location-dot"></i> ${p.addr}</p>
        </div>
      </div>
    </article>`).join("");
  $$("#topPicks .pick").forEach(el=>el.onclick=()=>openPlace(+el.dataset.id));
  loadImgs();
}
renderTopPicks();

function renderCatCards(){
  if(!$("#catCards"))return;
  $("#catCards").innerHTML = Object.entries(CAT_META).map(([name,m])=>{
    const count = PLACES.filter(p=>p.cat===name).length;
    return `
    <a class="cat-card" href="${m.page}">
      <span class="cat-card-img" style="background-image:url('${m.img}')"></span>
      <span class="cat-card-overlay"></span>
      <span class="cat-card-count"><b>${count}</b> ที่</span>
      <div class="cat-card-body">
        <span class="cat-card-icon"><i class="fa-solid ${m.icon}"></i></span>
        <h3>${name} <em>${m.en}</em></h3>
        <p class="cat-card-desc">${m.desc}</p>
        <span class="cat-card-go">เปิดหน้าหมวดนี้ <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </a>`;
  }).join("");
}
renderCatCards();

function filteredPlaces(){
  const q = state.search.toLowerCase().trim();
  let list = favMode ? PLACES.filter(p=>state.favs.includes(p.id)) : PLACES;
  return list.filter(p=>{
    if(state.filter!=="ทั้งหมด" && p.cat!==state.filter) return false;
    if(q && !(p.name.toLowerCase().includes(q)||p.addr.toLowerCase().includes(q)||p.tag.toLowerCase().includes(q))) return false;
    return true;
  });
}
function renderChips(){
  const box = $("#categoryChips");
  if(!box)return;
  box.innerHTML = CATS.map(c=>{
    const meta = CAT_META[c];
    const count = c==="ทั้งหมด" ? PLACES.length : PLACES.filter(p=>p.cat===c).length;
    return meta
      ? `<a class="chip chip-link" href="${meta.page}"><i class="fa-solid ${meta.icon}"></i> ${c} <b>${count}</b></a>`
      : `<button class="chip ${state.filter===c?"active":""}" data-cat="${c}">${c} <b>${count}</b></button>`;
  }).join("");
  box.querySelectorAll("button.chip").forEach(b=>b.onclick=()=>{state.filter=b.dataset.cat;renderChips();renderPlaces()});
}
function renderPlaces(){
  if(!$("#placesGrid"))return;
  const list = filteredPlaces();
  $("#placesCount").textContent = favMode ? `รายการโปรด (${list.length})` : `พบ ${list.length} สถานที่`;
  if(favMode && $("#placesTitle")) $("#placesTitle").innerHTML = `รายการโปรด <em>ของฉัน</em>`;
  $("#placesGrid").innerHTML = list.length
    ? list.map(cardHTML).join("")
    : `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">${favMode?"ยังไม่มีรายการโปรด":"ไม่พบสถานที่ที่ค้นหา"}</p>`;
  $$(".card").forEach(c=>c.onclick=()=>openPlace(+c.dataset.id));
  loadImgs();
}
if($("#searchInput")) $("#searchInput").oninput = e=>{state.search=e.target.value;renderPlaces()};
renderChips();
renderPlaces();

/* ═══ AI Trip Planner ═══ */
if($("#btnAI")){
  const sel = {style:"ธรรมชาติ", with:"any", budget:"any"};

  /* ปุ่มเลือกตัวเลือกแต่ละกลุ่ม */
  [["#aiStyle","style"],["#aiWith","with"],["#aiBudget","budget"]].forEach(([box,key])=>{
    $$(`${box} .ai-opt`).forEach(b=>b.onclick=()=>{
      $$(`${box} .ai-opt`).forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      sel[key] = b.dataset.val;
    });
  });

  /* ให้คะแนนความเข้ากันของแต่ละสถานที่ */
  const isFree = p => /ฟรี|ไม่มีค่า|ไม่เสีย/.test(p.fee||"");
  function scorePlace(p){
    let s = 50;
    if(sel.style==="any") s += 12;
    else if(p.cat===sel.style) s += 34;
    else s -= 8;

    /* ไปกับใคร */
    if(sel.with==="couple"   && /พระอาทิตย์|วิว|คาเฟ่|ทะเลสาบ|แหลม|บัวแดง|สะพาน|แลนด์มาร์ก/.test((p.tag||"")+(p.desc||""))) s += 14;
    if(sel.with==="family"   && (p.cat==="ครอบครัว" || /บ่อน้ำ|สวน|เล่นน้ำ|ตลาด|โฮมสเตย์/.test((p.tag||"")+(p.desc||"")))) s += 14;
    if(sel.with==="friends"  && (p.cat==="ผจญภัย" || /น้ำตก|เดินป่า|ทะเลหมอก|เขา|แคมป์|กางเต็นท์/.test((p.tag||"")+(p.desc||"")))) s += 14;

    /* งบประมาณ */
    if(sel.budget==="free" && isFree(p)) s += 16;
    if(sel.budget==="free" && !isFree(p)) s -= 10;
    if(sel.budget==="paid" && !isFree(p)) s += 6;

    /* เรตติ้งช่วยดันอันดับเล็กน้อย + สุ่มนิดหน่อยให้ผลไม่ซ้ำเป๊ะ */
    s += (p.rating||4)*3;
    s += Math.random()*6;
    return Math.min(99, Math.round(s));
  }

  function reasonText(p){
    const bits = [];
    if(p.cat===sel.style) bits.push(`ตรงสไตล์${sel.style}`);
    if(sel.budget==="free" && isFree(p)) bits.push("เข้าฟรี");
    if(sel.with==="couple") bits.push("บรรยากาศโรแมนติก");
    if(sel.with==="family") bits.push("เหมาะทั้งครอบครัว");
    if(sel.with==="friends") bits.push("สนุกกับเพื่อน ๆ");
    if(p.rating>=4.5) bits.push(`เรตติ้งสูง ${p.rating.toFixed(1)}`);
    if(p.bestTime) bits.push(`ช่วงแนะนำ ${p.bestTime.split("(")[0].trim()}`);
    return bits.slice(0,2).join(" · ") || "น่าสนใจสำหรับคุณ";
  }

  function runAI(){
    const box = $("#aiResult");
    box.innerHTML = `<div class="ai-loading">
        <div class="ai-empty-orb spin"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <p>AI กำลังจับคู่สถานที่ที่ใช่สำหรับคุณ...</p></div>`;

    setTimeout(()=>{
      const ranked = PLACES.map(p=>({p, score:scorePlace(p)}))
        .sort((a,b)=>b.score-a.score)
        .slice(0,5);
      const top = ranked[0];

      box.innerHTML = `
        <div class="ai-result-head">
          <span class="ai-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> AI จัดให้แล้ว</span>
          <h3>ทริป${sel.style==="any"?"":sel.style}ที่ใช่สำหรับคุณ</h3>
          <p>${ranked.length} สถานที่ เรียงตามความเข้ากับสไตล์ของคุณ</p>
        </div>
        <div class="ai-list">
          ${ranked.map((r,i)=>`
            <div class="ai-item ${i===0?"ai-top":""}" data-id="${r.p.id}">
              <div class="ai-item-img" data-src="${r.p.img}" data-cat="${r.p.cat}"></div>
              <div class="ai-item-body">
                <div class="ai-item-top">
                  <span class="badge">${r.p.cat}</span>
                  <span class="ai-match"><b>${r.score}%</b> เข้ากัน</span>
                </div>
                <h4>${i===0?'<i class="fa-solid fa-crown"></i> ':""}${r.p.name}</h4>
                <p class="ai-item-addr"><i class="fa-solid fa-location-dot"></i> ${r.p.addr}</p>
                <p class="ai-reason"><i class="fa-solid fa-wand-magic-sparkles"></i> ${reasonText(r.p)}</p>
                <span class="ai-match-bar"><span style="width:${r.score}%"></span></span>
              </div>
            </div>`).join("")}
        </div>
        <button class="ai-redo" id="aiRedo"><i class="fa-solid fa-rotate"></i> จัดทริปใหม่อีกครั้ง</button>`;

      $$("#aiResult .ai-item").forEach(el=>el.onclick=()=>openPlace(+el.dataset.id));
      $("#aiRedo").onclick = runAI;
      loadImgs();
    }, 650);
  }

  $("#btnAI").onclick = runAI;
}

function fillProfile(){
  if(!state.user)return;
  const u = state.user;
  const p = state.profiles[u.email] || {};
  const f = $("#profileForm");
  f.name.value = p.name || u.name;
  f.email.value = u.email;
  f.phone.value = p.phone || "";
  f.city.value = p.city || "";
  f.style.value = p.style || "";
  f.bio.value = p.bio || "";
  $("#profileAvatar").textContent = initial(f.name.value);
  $("#profileTitle").textContent = `สวัสดี, ${f.name.value}`;
  $("#pfFavCount").textContent = state.favs.length;
  $("#pfJoined").textContent = new Date(u.joined||Date.now()).toLocaleDateString("th-TH",{year:"numeric",month:"short"});
}
if($("#profileForm")){
  if(!state.user){toast("กรุณาเข้าสู่ระบบก่อน");openAuth()}
  else fillProfile();

  $("#profileForm").onsubmit = e=>{
    e.preventDefault();
    if(!state.user){openAuth();return}
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    state.profiles[state.user.email] = data;
    save("ptl_profiles",state.profiles);
    state.user.name = data.name;
    save("ptl_user",state.user);
    const idx = state.users.findIndex(u=>u.email===state.user.email);
    if(idx>=0){state.users[idx].name=data.name;save("ptl_users",state.users)}
    if(window.Cloud){
      Cloud.saveProfile(state.user.email, data);
      Cloud.saveUser({...state.user, name:data.name});
    }
    syncAuthUI();
    fillProfile();
    toast("บันทึกโปรไฟล์แล้ว");
  };
  $("#pfCancel").onclick = ()=>{location.href="index.html"};
}

/* อัปเดตตัวเลขจำนวนสถานที่ทุกจุดที่มี data-place-count ให้ตรงกับข้อมูลจริง */
function updatePlaceCounts(){
  const n = PLACES.length;
  document.querySelectorAll("[data-place-count]").forEach(el=>el.textContent = n);
  if($("#statPlaces")) $("#statPlaces").textContent = n;
}
updatePlaceCounts();
syncAuthUI();

/* ═══ อัปเดตสดจากคลาวด์ — ไม่ต้องรีเฟรชหน้า ═══ */
window.addEventListener("ptlcloud", e=>{
  const k = e.detail.key;

  if(k==="places"){
    try{
      const list = JSON.parse(localStorage.getItem("ptl_admin_places")||"[]");
      if(!list.length) return;
      /* ถ้าเพิ่งบังคับอัปเดตจากไฟล์ อย่าให้ข้อมูลคลาวด์เก่า (จำนวนน้อยกว่า) มาทับ */
      if(window.PLACES_FORCE_REFRESH && list.length < PLACES.length) return;
      if(JSON.stringify(list) === JSON.stringify(PLACES)) return;   // ไม่มีอะไรเปลี่ยน
      PLACES.length = 0; list.forEach(p=>PLACES.push(p));
      renderTopPicks(); renderCatCards(); renderChips(); renderPlaces();
      updatePlaceCounts();
    }catch(err){}
  }

  if(k==="users"){
    try{ state.users = JSON.parse(localStorage.getItem("ptl_users")||"[]") }catch(err){}
  }

  if(k==="favs" && state.user){
    const f = myFavs();
    if(JSON.stringify(f) !== JSON.stringify(state.favs)){
      state.favs = f;
      save("ptl_favs", f);
      if(favMode) renderPlaces();
      if(state.currentPlace) updateFavBtn();
      if($("#pfFavCount")) $("#pfFavCount").textContent = f.length;
    }
  }

  if(k==="profiles" && state.user && $("#profileForm")){
    try{
      const all = JSON.parse(localStorage.getItem("ptl_profiles_all")||"{}");
      const mine = all[Cloud.ek(state.user.email)];
      if(mine){ state.profiles[state.user.email] = mine; fillProfile() }
    }catch(err){}
  }
});

(function(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}
  }),{threshold:.12});
  $$(".card,.pick,.cat-card,.section-head,.ai-card,.about-grid,.profile-card,.hero-content").forEach((el,i)=>{
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i%6,4)*60}ms`;
    io.observe(el);
  });

  const btn=document.createElement("button");
  btn.id="backTop";btn.setAttribute("aria-label","กลับขึ้นด้านบน");
  btn.innerHTML='<i class="fa-solid fa-arrow-up"></i>';
  btn.onclick=()=>scrollTo({top:0,behavior:"smooth"});
  document.body.appendChild(btn);
  const nav=document.querySelector(".navbar");
  const onScroll=()=>{
    btn.classList.toggle("show",scrollY>500);
    if(nav)nav.classList.toggle("scrolled",scrollY>10);
  };
  addEventListener("scroll",onScroll,{passive:true});
  onScroll();
})();

/* ═══════════════════════════════════════════
   ลูกเล่นเพิ่มเติม — ทำให้เว็บมีชีวิตชีวาขึ้น
   ═══════════════════════════════════════════ */

/* 1) แถบแสดงความคืบหน้าการเลื่อนหน้า (บนสุด) */
(function(){
  const bar = document.createElement("div");
  bar.id = "scrollProgress";
  document.body.appendChild(bar);
  const upd = ()=>{
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = `scaleX(${max>0 ? scrollY/max : 0})`;
  };
  addEventListener("scroll", upd, {passive:true});
  addEventListener("resize", upd);
  upd();
})();

/* 2) ตัวเลขนับขึ้น (count-up) เมื่อเลื่อนมาเห็น */
(function(){
  const nums = $$(".hero-stats b, .pf-stats b");
  if(!nums.length) return;
  const animateCount = el=>{
    const raw = el.textContent.trim();
    const target = parseFloat(raw.replace(/[^0-9.]/g,""));
    if(isNaN(target)) return;                 // ข้ามค่าที่ไม่ใช่ตัวเลข เช่น "AI"
    const isFloat = raw.includes(".");
    const suffix = raw.replace(/[0-9.,]/g,""); // เก็บ + หรือหน่วยท้าย
    const dur = 1100; const t0 = performance.now();
    const tick = now=>{
      const p = Math.min((now-t0)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);      // ease-out
      const val = target*eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if(p<1) requestAnimationFrame(tick);
      else el.textContent = raw;               // จบแล้วคืนค่าเดิมเป๊ะ
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ animateCount(e.target); io.unobserve(e.target); }
  }),{threshold:.5});
  nums.forEach(n=>io.observe(n));
})();

/* 3) เอียงการ์ดตามเมาส์ (3D tilt) — เฉพาะเครื่องที่มีเมาส์ */
(function(){
  if(window.matchMedia("(hover:none)").matches) return;
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const bind = el=>{
    el.addEventListener("mousemove", e=>{
      const r = el.getBoundingClientRect();
      const px = (e.clientX-r.left)/r.width - .5;
      const py = (e.clientY-r.top)/r.height - .5;
      el.style.transform = `perspective(800px) rotateY(${px*6}deg) rotateX(${-py*6}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", ()=>{ el.style.transform = ""; });
  };
  const attach = ()=> $$(".cat-card, .pick").forEach(el=>{
    if(!el.dataset.tilt){ el.dataset.tilt="1"; bind(el); }
  });
  attach();
  /* การ์ดหมวดถูกสร้างด้วย JS หลังโหลด → ผูกซ้ำหลัง repaint */
  setTimeout(attach, 400);
  window.addEventListener("ptlcloud", ()=>setTimeout(attach, 200));
})();

/* 4) ระลอกคลื่น (ripple) เวลากดปุ่ม */
(function(){
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  document.addEventListener("click", e=>{
    const btn = e.target.closest(".btn-primary, .btn-ghost, .chip, .ai-opt, .sort-btn");
    if(!btn) return;
    const r = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple";
    const size = Math.max(r.width, r.height);
    span.style.width = span.style.height = size+"px";
    span.style.left = (e.clientX-r.left-size/2)+"px";
    span.style.top  = (e.clientY-r.top-size/2)+"px";
    btn.appendChild(span);
    span.addEventListener("animationend", ()=>span.remove());
  });
})();

/* 5) หิ่งห้อยลอยในหน้าแรก (canvas) — เข้าธีมทะเลสาบยามค่ำ */
(function(){
  const hero = document.querySelector(".home-hero");
  if(!hero) return;
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-particles";
  hero.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w, h, particles = [], raf;
  const COLORS = ["255,235,180", "243,195,99", "255,255,255", "150,220,225"];

  function resize(){
    w = canvas.width  = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    const count = Math.min(46, Math.floor(w/26));   // ปรับตามความกว้างจอ
    particles = Array.from({length:count}, ()=>newParticle());
  }
  function newParticle(){
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*2 + 0.6,
      sp: Math.random()*0.4 + 0.1,           // ความเร็วลอยขึ้น
      drift: (Math.random()-0.5)*0.3,        // เอนซ้าย-ขวา
      a: Math.random()*0.5 + 0.2,            // ความสว่าง
      tw: Math.random()*0.02 + 0.005,        // ความเร็วกะพริบ
      tp: Math.random()*Math.PI*2,           // เฟสกะพริบ
      c: COLORS[Math.floor(Math.random()*COLORS.length)],
    };
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.y -= p.sp;
      p.x += p.drift;
      p.tp += p.tw;
      const glow = p.a * (0.5 + 0.5*Math.sin(p.tp));   // กะพริบนุ่ม ๆ
      if(p.y < -6){ p.y = h+6; p.x = Math.random()*w; }
      if(p.x < -6) p.x = w+6;
      if(p.x > w+6) p.x = -6;

      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      grad.addColorStop(0, `rgba(${p.c},${glow})`);
      grad.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  resize();
  draw();
  addEventListener("resize", ()=>{ cancelAnimationFrame(raf); resize(); draw(); });

  /* หยุดวาดเมื่อ hero เลื่อนพ้นจอ (ประหยัดแบต) */
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ if(!raf) draw(); }
    else{ cancelAnimationFrame(raf); raf = null; }
  }),{threshold:0});
  io.observe(hero);
})();

/* 6) กลีบบัวแดงร่วง — ลอยผ่านหน้าจอเป็นระยะ (เข้าธีมทะเลบัวแดง) */
(function(){
  const hero = document.querySelector(".home-hero");
  if(!hero) return;
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  function dropPetal(){
    const petal = document.createElement("span");
    petal.className = "petal";
    const size = 10 + Math.random()*12;
    petal.style.width  = size+"px";
    petal.style.height = size*1.25+"px";
    petal.style.left = Math.random()*100 + "%";
    petal.style.setProperty("--sway", (Math.random()*80-40)+"px");
    petal.style.setProperty("--spin", (Math.random()*720-360)+"deg");
    petal.style.animationDuration = (7 + Math.random()*6)+"s";
    petal.style.opacity = 0.5 + Math.random()*0.4;
    hero.appendChild(petal);
    petal.addEventListener("animationend", ()=>petal.remove());
  }
  /* ปล่อยกลีบเป็นระยะ เฉพาะตอน hero อยู่ในจอ */
  let timer = null;
  const start = ()=>{ if(!timer) timer = setInterval(dropPetal, 1400); };
  const stop  = ()=>{ clearInterval(timer); timer = null; };
  const io = new IntersectionObserver(es=>es.forEach(e=> e.isIntersecting ? start() : stop() ),{threshold:0});
  io.observe(hero);
  dropPetal();
})();

/* 7) นกบินผ่านขอบฟ้าในหน้าแรก */
(function(){
  const hero = document.querySelector(".home-hero");
  if(!hero) return;
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  function flock(){
    const wrap = document.createElement("div");
    wrap.className = "birds";
    const n = 3 + Math.floor(Math.random()*3);      // ฝูงละ 3–5 ตัว
    const top = 12 + Math.random()*24;              // ระดับความสูง (%)
    wrap.style.top = top+"%";
    wrap.style.animationDuration = (16 + Math.random()*8)+"s";
    for(let i=0;i<n;i++){
      const b = document.createElement("span");
      b.className = "bird";
      b.style.setProperty("--d", (i*0.18)+"s");
      b.style.marginLeft = (Math.random()*40)+"px";
      b.style.transform = `scale(${0.7+Math.random()*0.5})`;
      wrap.appendChild(b);
    }
    hero.appendChild(wrap);
    wrap.addEventListener("animationend", ()=>wrap.remove());
  }
  let timer = null;
  const start = ()=>{ if(!timer){ flock(); timer = setInterval(flock, 12000); } };
  const stop  = ()=>{ clearInterval(timer); timer = null; };
  const io = new IntersectionObserver(es=>es.forEach(e=> e.isIntersecting ? start() : stop() ),{threshold:0});
  io.observe(hero);
})();

/* 8) ประกายตามเมาส์ (cursor trail) — เฉพาะเครื่องที่มีเมาส์ */
(function(){
  if(window.matchMedia("(hover:none)").matches) return;
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  let last = 0;
  document.addEventListener("mousemove", e=>{
    const now = performance.now();
    if(now - last < 40) return;          // จำกัดความถี่ ~25 จุด/วินาที
    last = now;
    const dot = document.createElement("span");
    dot.className = "cursor-spark";
    dot.style.left = e.clientX + "px";
    dot.style.top  = e.clientY + "px";
    const s = 4 + Math.random()*5;
    dot.style.width = dot.style.height = s+"px";
    document.body.appendChild(dot);
    dot.addEventListener("animationend", ()=>dot.remove());
  }, {passive:true});
})();

/* ═══ เมนูมือถือ (แฮมเบอร์เกอร์) ═══ */
(function(){
  const toggle = document.getElementById("navToggle");
  const links  = document.querySelector(".nav-links");
  const navbar = document.querySelector(".navbar");
  if(!toggle || !links) return;

  const setOpen = open=>{
    navbar.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.onclick = ()=> setOpen(!navbar.classList.contains("nav-open"));

  /* กดลิงก์ในเมนูแล้วปิดเอง */
  links.querySelectorAll("a").forEach(a=> a.addEventListener("click", ()=> setOpen(false)));

  /* กดนอกเมนู / กด Esc → ปิด */
  document.addEventListener("click", e=>{
    if(navbar.classList.contains("nav-open") &&
       !e.target.closest(".nav-links") && !e.target.closest(".nav-toggle")) setOpen(false);
  });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") setOpen(false) });

  /* หมุนจอ/ขยายจอกว้างขึ้น → รีเซ็ต */
  addEventListener("resize", ()=>{ if(innerWidth>840) setOpen(false) });
})();
