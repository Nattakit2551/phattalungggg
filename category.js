const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);
const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2400)}
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

const CAT = document.body.dataset.cat;
const META = CAT_META[CAT];
let catPlaces = PLACES.filter(p=>p.cat===CAT);

const state = {
  search:"",
  sort:"default",
  user: JSON.parse(localStorage.getItem("ptl_user")||"null"),
  favs: JSON.parse(localStorage.getItem("ptl_favs")||"[]"),
  currentPlace:null,
};

function renderHero(){
  $(".cat-hero-bg").style.backgroundImage = `url('${META.img}')`;
  $("#catIcon").className = `fa-solid ${META.icon}`;
  $("#catTitle").innerHTML = `${CAT} <em>${META.en}</em>`;
  $("#catDesc").textContent = META.desc;
  document.title = `${CAT} — พัทลุงไกด์ AI`;
  renderStats();
  if($("#catSectionTitle")) $("#catSectionTitle").innerHTML = `สถานที่หมวด <em>${CAT}</em>`;
}

/* สถิติในหัวหน้า: จำนวน / เรตติ้งเฉลี่ย / จำนวนอำเภอ */
function renderStats(){
  $("#catCount").textContent = catPlaces.length;
  const rated = catPlaces.filter(p=>p.rating);
  const avg = rated.length ? rated.reduce((n,p)=>n+p.rating,0)/rated.length : 0;
  if($("#catRating")) $("#catRating").textContent = avg.toFixed(1);
  if($("#catAmphoe")){
    const set = new Set(catPlaces.map(p=>(String(p.addr).match(/อ\.[^\s]+/)||["-"])[0]));
    $("#catAmphoe").textContent = set.size;
  }
}

function renderCatNav(){
  $("#catNav").innerHTML =
    `<a class="chip" href="places.html"><i class="fa-solid fa-border-all"></i> ทั้งหมด <b>${PLACES.length}</b></a>` +
    Object.entries(CAT_META).map(([name,m])=>{
      const n = PLACES.filter(p=>p.cat===name).length;
      return `<a class="chip ${name===CAT?"active":""}" href="${m.page}"><i class="fa-solid ${m.icon}"></i> ${name} <b>${n}</b></a>`;
    }).join("");
}

function filtered(){
  const q = state.search.toLowerCase().trim();
  let list = q
    ? catPlaces.filter(p=>p.name.toLowerCase().includes(q)||p.addr.toLowerCase().includes(q)||p.tag.toLowerCase().includes(q))
    : [...catPlaces];
  if(state.sort==="rating") list.sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(state.sort==="name")   list.sort((a,b)=>a.name.localeCompare(b.name,"th"));
  return list;
}
function renderPlaces(){
  const list = filtered();
  $("#placesCount").textContent = `พบ ${list.length} สถานที่ในหมวด${CAT}`;
  $("#placesGrid").innerHTML = list.length ? list.map(p=>`
    <article class="card" data-id="${p.id}">
      <div class="card-imgwrap">
        <div class="card-img" data-src="${p.img}" data-cat="${p.cat}"></div>
        <span class="img-tag"><i class="fa-solid fa-tag"></i> ${p.tag}</span>
        ${p.rating?`<span class="img-rate">\u2605 ${p.rating.toFixed(1)}</span>`:""}
      </div>
      <div class="card-body">
        <span class="badge">${(String(p.addr).match(/อ\.[^\s]+/)||[p.cat])[0]}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-meta"><i class="fa-solid fa-location-dot"></i><span>${p.addr}</span></div>
      </div>
    </article>`).join("")
    : `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">ไม่พบสถานที่ที่ค้นหา</p>`;
  $$(".card").forEach(c=>c.onclick=()=>openPlace(+c.dataset.id));
  loadImgs();
}

function openPlace(id){
  const p = PLACES.find(x=>x.id===id);
  if(!p)return;
  state.currentPlace = p;
  const mi=$("#modalImg");mi.className="modal-img";mi.style.backgroundImage="";
  mi.setAttribute("data-src",p.img);mi.setAttribute("data-cat",p.cat);loadImgs();
  $("#modalCat").textContent = p.cat;
  $("#modalName").innerHTML = `${p.name} ${stars(p.rating)}`;
  $("#modalAddr").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${p.addr}`;
  $("#modalDesc").textContent = p.desc;
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
  stopNarration();
  resetSpeakBtn();
  $("#placeModal").classList.remove("hidden");
}

/* ═══ AI เล่าสถานที่ด้วยเสียง (Azure ผ่าน Worker + สำรองเบราว์เซอร์) ═══ */
const synth = window.speechSynthesis;
let thaiVoice = null;
let ttsAudio = null, ttsBusy = false;
function pickThaiVoice(){
  if(!synth) return;
  const vs = synth.getVoices();
  const isThai = v=>{
    const lang=(v.lang||"").toLowerCase().replace(/_/g,"-");
    const name=(v.name||"").toLowerCase();
    return lang==="th-th"||lang==="th"||lang.startsWith("th-")
        || /thai|ไทย|pattara|premwadee|niwat|achara/.test(name);
  };
  thaiVoice = vs.find(isThai) || null;
}
if(synth){
  pickThaiVoice();
  synth.onvoiceschanged = pickThaiVoice;
  let tries=0;
  const retry=setInterval(()=>{ if(thaiVoice||tries++>10){clearInterval(retry);return;} pickThaiVoice(); },400);
}
function buildNarration(p){
  const parts = [p.name];
  if(p.desc)     parts.push(p.desc);
  if(p.hours)    parts.push(`เปิดให้บริการ ${p.hours}`);
  if(p.bestTime) parts.push(`ช่วงเวลาที่แนะนำคือ ${p.bestTime}`);
  if(p.fee)      parts.push(`ค่าใช้จ่าย ${p.fee}`);
  return parts.join(". ");
}
function stopNarration(){
  if(synth&&(synth.speaking||synth.pending)) synth.cancel();
  if(ttsAudio){ ttsAudio.pause(); ttsAudio.currentTime=0; ttsAudio=null; }
  ttsBusy=false;
}
function setSpeakIcon(st){
  const btn=$("#modalSpeak"); if(!btn) return;
  btn.classList.toggle("speaking", st==="speaking");
  btn.classList.toggle("loading", st==="loading");
  const ic=btn.querySelector(".ms-ic i");
  if(ic) ic.className = st==="loading" ? "fa-solid fa-spinner fa-spin"
                       : st==="speaking" ? "fa-solid fa-stop" : "fa-solid fa-volume-high";
}
function resetSpeakBtn(){ setSpeakIcon("idle"); }
function speakBrowser(text){
  if(!synth){ toast("เบราว์เซอร์นี้ยังไม่รองรับเสียงพูด ลองใช้ Chrome หรือ Safari"); resetSpeakBtn(); return; }
  pickThaiVoice();
  const doSpeak = ()=>{
    const u = new SpeechSynthesisUtterance(text);
    if(thaiVoice){ u.voice=thaiVoice; u.lang=thaiVoice.lang||"th-TH"; } else u.lang="th-TH";
    u.rate=1.0; u.pitch=1.05;
    u.onstart=()=>setSpeakIcon("speaking"); u.onend=resetSpeakBtn; u.onerror=resetSpeakBtn;
    setSpeakIcon("speaking"); synth.speak(u);
  };
  if(!thaiVoice){ setSpeakIcon("loading"); setTimeout(()=>{ pickThaiVoice(); doSpeak(); }, 350); }
  else doSpeak();
}
async function speakAzure(text){
  const url = window.TTS_WORKER_URL;
  if(!url) throw new Error("no-worker");
  setSpeakIcon("loading");
  const res = await fetch(url, {method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({text, voice:"th-TH-PremwadeeNeural"})});
  if(!res.ok) throw new Error("worker-"+res.status);
  const blob = await res.blob();
  if(!blob.size || !/audio/.test(blob.type)) throw new Error("bad-audio");
  const audioUrl = URL.createObjectURL(blob);
  ttsAudio = new Audio(audioUrl);
  ttsAudio.onplay=()=>setSpeakIcon("speaking");
  ttsAudio.onended=()=>{ resetSpeakBtn(); URL.revokeObjectURL(audioUrl); ttsAudio=null; };
  ttsAudio.onerror=()=>{ throw new Error("play-error"); };
  await ttsAudio.play();
}
async function narratePlace(){
  if(ttsBusy || (synth&&(synth.speaking||synth.pending)) || (ttsAudio&&!ttsAudio.paused)){
    stopNarration(); resetSpeakBtn(); return;
  }
  const p = state.currentPlace; if(!p) return;
  const text = buildNarration(p);
  ttsBusy = true;
  try{ await speakAzure(text); }
  catch(err){ speakBrowser(text); }
  finally{ ttsBusy = false; }
}
if($("#modalSpeak")) $("#modalSpeak").onclick = narratePlace;
document.querySelectorAll("#placeModal [data-close]").forEach(el=>el.addEventListener("click", stopNarration));
document.addEventListener("keydown", e=>{ if(e.key==="Escape") stopNarration(); });
function updateFavBtn(){
  if(!state.currentPlace)return;
  const isFav = state.favs.includes(state.currentPlace.id);
  $("#modalFav").innerHTML = isFav
    ? `<i class="fa-solid fa-heart" style="color:#e04a4a"></i> บันทึกแล้ว`
    : `<i class="fa-regular fa-heart"></i> บันทึก`;
}
$("#modalFav").onclick = ()=>{
  if(!state.user){toast("กรุณาเข้าสู่ระบบก่อน");openAuth();return}
  const id = state.currentPlace.id;
  if(state.favs.includes(id)) state.favs = state.favs.filter(x=>x!==id);
  else state.favs.push(id);
  save("ptl_favs",state.favs);
  if(window.Cloud && state.user) Cloud.saveFavs(state.user.email, state.favs);
  updateFavBtn();
  toast("อัปเดตรายการโปรดแล้ว");
};
$$("[data-close]").forEach(el=>el.onclick=e=>{
  e.target.closest(".modal").classList.add("hidden");
});

$("#searchInput").oninput = e=>{state.search=e.target.value;renderPlaces()};

$$(".sort-btn").forEach(b=>b.onclick=()=>{
  $$(".sort-btn").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  state.sort = b.dataset.sort;
  renderPlaces();
});

/* ── ระบบสมาชิก (เหมือนหน้าอื่น) ── */
const ADMIN_LOGIN = { email:"nattakit@gmail.com", password:"123456" };
const users = ()=>{ try{ return JSON.parse(localStorage.getItem("ptl_users")||"[]") }catch(e){ return [] } };
function initial(n){return (n||"?").trim().charAt(0).toUpperCase()}
function openAuth(){ const m=$("#authModal"); if(m) m.classList.remove("hidden") }

function syncAuthUI(){
  if(!$("#btnOpenAuth")) return;
  if(state.user){
    $("#btnOpenAuth").classList.add("hidden");
    $("#userMenu").classList.remove("hidden");
    const ini = initial(state.user.name);
    $("#avatarBtn").textContent = ini;
    $("#ddAvatar").textContent  = ini;
    $("#ddName").textContent    = state.user.name;
    $("#ddEmail").textContent   = state.user.email;
  }else{
    $("#btnOpenAuth").classList.remove("hidden");
    $("#userMenu").classList.add("hidden");
  }
}
if($("#btnOpenAuth")) $("#btnOpenAuth").onclick = openAuth;
if($("#avatarBtn")){
  $("#avatarBtn").onclick = e=>{ e.stopPropagation(); $("#userDropdown").classList.toggle("open") };
  document.addEventListener("click", e=>{ if(!e.target.closest("#userMenu")) $("#userDropdown").classList.remove("open") });
  $$("#userDropdown [data-go]").forEach(b=>b.onclick=()=>{ location.href = b.dataset.go });
}
if($("#btnLogout")) $("#btnLogout").onclick = ()=>{
  state.user=null; localStorage.removeItem("ptl_user"); syncAuthUI(); toast("ออกจากระบบแล้ว");
};
$$(".auth-tabs button").forEach(b=>b.onclick=()=>{
  $$(".auth-tabs button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  $("#loginForm").classList.toggle("hidden", b.dataset.tab!=="login");
  $("#signupForm").classList.toggle("hidden", b.dataset.tab!=="signup");
});
if($("#loginForm")) $("#loginForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get("email").trim(), password = fd.get("password");
  if(email.toLowerCase()===ADMIN_LOGIN.email && password===ADMIN_LOGIN.password){
    localStorage.setItem("ptl_admin_session","1");
    toast("ยินดีต้อนรับผู้ดูแลระบบ กำลังเข้าสู่หลังบ้าน...");
    setTimeout(()=>{location.href="admin.html"},800);
    return;
  }
  const u = users().find(x=>x.email===email && x.password===password);
  if(!u){ toast("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); return }
  state.user=u; save("ptl_user",u);
  if(window.Cloud) Cloud.logActivity({type:"login",name:u.name,email:u.email,time:new Date().toISOString()});
  $("#authModal").classList.add("hidden"); syncAuthUI(); toast("เข้าสู่ระบบสำเร็จ");
};
if($("#signupForm")) $("#signupForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get("email").trim();
  if(users().find(x=>x.email===email)){ toast("อีเมลนี้ถูกใช้แล้ว"); return }
  const u = {email, name:fd.get("name").trim(), password:fd.get("password"), joined:new Date().toISOString()};
  const list = users(); list.push(u); save("ptl_users", list);
  if(window.Cloud){ Cloud.saveUser(u); Cloud.logActivity({type:"signup",name:u.name,email:u.email,time:new Date().toISOString()}) }
  state.user=u; save("ptl_user",u);
  $("#authModal").classList.add("hidden"); syncAuthUI(); toast("สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!");
};
syncAuthUI();

renderHero();
renderCatNav();
renderPlaces();

/* อัปเดตสดจากคลาวด์ */
window.addEventListener("ptlcloud", e=>{
  if(e.detail.key!=="places") return;
  try{
    const list = JSON.parse(localStorage.getItem("ptl_admin_places")||"[]");
    if(!list.length || JSON.stringify(list)===JSON.stringify(PLACES)) return;
    PLACES.length = 0; list.forEach(p=>PLACES.push(p));
    catPlaces = PLACES.filter(p=>p.cat===CAT);
    renderStats();
    renderCatNav();
    renderPlaces();
  }catch(err){}
});

(function(){

  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}
  }),{threshold:.12});
  $$(".card,.cat-card,.section-head,.ai-card,.about-grid,.profile-card,.hero-content").forEach((el,i)=>{
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
  addEventListener("scroll",()=>{
    btn.classList.toggle("show",scrollY>500);
    if(nav)nav.classList.toggle("scrolled",scrollY>10);
  },{passive:true});
})();
