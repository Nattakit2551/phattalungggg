/* ═══════════════════════════════════════════════
   ระบบหลังบ้าน — พัทลุงไกด์ AI
   จัดการสถานที่ / สมาชิก / สำรองข้อมูล
   ข้อมูลเก็บใน localStorage (ptl_admin_places)
   ═══════════════════════════════════════════════ */

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ── บัญชีผู้ดูแล (แก้ได้ตรงนี้) ── */
const ADMIN = { email: "nattakit@gmail.com", password: "123456" };

const VIEW_TITLES = {
  dashboard: ["Dashboard",   "ภาพรวมระบบ"],
  places:    ["Places",      "จัดการสถานที่ท่องเที่ยว"],
  members:   ["Members",     "สมาชิกเว็บไซต์"],
  data:      ["Data",        "สำรองและคืนค่าข้อมูล"],
};

const A = {
  places: JSON.parse(JSON.stringify(PLACES)),           // สำเนาที่ทำงาน (PLACES ถูก merge จาก localStorage แล้ว)
  users:    JSON.parse(localStorage.getItem("ptl_users")    || "[]"),
  favs:     [],
  activity: JSON.parse(localStorage.getItem("ptl_activity") || "[]"),
  search: "",
  catFilter: "ทั้งหมด",
  editingId: null,                                      // null = เพิ่มใหม่
};

const CAT_LIST = Object.keys(CAT_META);                 // 5 หมวดจริง

function toast(msg){
  const t = $("#toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove("show"), 2400);
}
function savePlaces(){
  localStorage.setItem("ptl_admin_places", JSON.stringify(A.places));
  if(window.Cloud) Cloud.savePlaces(A.places);      // ↑ ขึ้นคลาวด์ ทุกเครื่องเห็นทันที
}
function saveUsers(){
  localStorage.setItem("ptl_users", JSON.stringify(A.users));
}
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
/* ═══════════ เข้าสู่ระบบ ═══════════ */
function isLoggedIn(){
  return localStorage.getItem("ptl_admin_session") === "1"
      || sessionStorage.getItem("ptl_admin_session") === "1";
}

function showApp(){
  $("#adminLogin").classList.add("hidden");
  $("#adminApp").classList.remove("hidden");
  $("#sideAdminEmail").textContent = ADMIN.email;
  renderAll();
}
function showLogin(){
  $("#adminApp").classList.add("hidden");
  $("#adminLogin").classList.remove("hidden");
}

/* ปุ่มกรอกบัญชีทดสอบให้อัตโนมัติ */
if($("#btnFill")) $("#btnFill").onclick = ()=>{
  const f = $("#adminLoginForm");
  f.email.value = ADMIN.email;
  f.password.value = ADMIN.password;
  f.querySelector("button[type=submit]").focus();
};

$("#adminLoginForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  if(fd.get("email").trim().toLowerCase() === ADMIN.email && fd.get("password") === ADMIN.password){
    if(e.target.remember.checked) localStorage.setItem("ptl_admin_session","1");
    else sessionStorage.setItem("ptl_admin_session","1");
    toast("ยินดีต้อนรับสู่ระบบหลังบ้าน");
    showApp();
  }else{
    toast("อีเมลหรือรหัสผ่านผู้ดูแลไม่ถูกต้อง");
  }
};
$("#btnAdminLogout").onclick = ()=>{
  localStorage.removeItem("ptl_admin_session");
  sessionStorage.removeItem("ptl_admin_session");
  toast("ออกจากระบบแล้ว");
  showLogin();
};

/* ═══════════ สลับหน้า (view) ═══════════ */
function switchView(name){
  $$(".side-link[data-view]").forEach(b=>b.classList.toggle("active", b.dataset.view===name));
  $$(".admin-view").forEach(v=>v.classList.toggle("hidden", v.dataset.view!==name));
  const [eye,title] = VIEW_TITLES[name];
  $("#topEyebrow").textContent = eye;
  $("#topTitle").textContent = title;
  $("#btnQuickAdd").classList.toggle("hidden", name==="members" || name==="data");
}
$$(".side-link[data-view]").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
$$("[data-goview]").forEach(b=>b.onclick=()=>switchView(b.dataset.goview));

/* ═══════════ แดชบอร์ด ═══════════ */
function renderDashboard(){
  $("#stPlaces").textContent = A.places.length;
  $("#stUsers").textContent  = A.users.length;
  $("#stFavs").textContent   = A.favs.length;
  const rated = A.places.filter(p=>p.rating);
  const avg = rated.length ? rated.reduce((s,p)=>s+p.rating,0)/rated.length : 0;
  $("#stRating").textContent = avg.toFixed(1);
  $("#sideCountPlaces").textContent = A.places.length;
  $("#sideCountUsers").textContent  = A.users.length;

  /* กราฟแท่งหมวด */
  const max = Math.max(...CAT_LIST.map(c=>A.places.filter(p=>p.cat===c).length), 1);
  $("#catBars").innerHTML = CAT_LIST.map(c=>{
    const n = A.places.filter(p=>p.cat===c).length;
    const icon = CAT_META[c]?.icon || "fa-tag";
    return `
      <div class="cat-bar-row">
        <span class="cb-name"><i class="fa-solid ${icon}"></i> ${c}</span>
        <span class="cb-track"><span class="cb-fill" data-w="${(n/max*100).toFixed(0)}"></span></span>
        <b>${n}</b>
      </div>`;
  }).join("");
  requestAnimationFrame(()=>$$(".cb-fill").forEach(el=>el.style.width = el.dataset.w+"%"));

  /* 5 อันดับเรตติ้ง */
  const top = [...A.places].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,5);
  $("#topRated").innerHTML = top.map((p,i)=>`
    <li>
      <span class="tr-rank">${i+1}</span>
      <span class="tr-thumb ${p.img?"":"noimg"}" ${p.img?`style="background-image:url('${esc(p.img)}')"`:`data-cat="${esc(p.cat)}"`}></span>
      <div><h4>${esc(p.name)}</h4><p>${esc(p.addr)}</p></div>
      <span class="tr-score">★ ${(p.rating||0).toFixed(1)}</span>
    </li>`).join("");

  /* สมาชิกล่าสุด */
  const recent = [...A.users].sort((a,b)=>new Date(b.joined||0)-new Date(a.joined||0)).slice(0,4);
  $("#recentUsers").innerHTML = recent.length
    ? recent.map(u=>`
        <div class="ru-card">
          <div class="dd-avatar">${esc((u.name||"?").trim().charAt(0).toUpperCase())}</div>
          <div>
            <h4>${esc(u.name)}</h4>
            <p>${esc(u.email)} · ${u.joined ? new Date(u.joined).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"}) : "-"}</p>
          </div>
        </div>`).join("")
    : `<p class="recent-empty">ยังไม่มีสมาชิก — เมื่อมีคนสมัครจากหน้าเว็บ รายชื่อจะแสดงที่นี่</p>`;
}

/* ═══════════ ตารางสถานที่ ═══════════ */
function filteredAdminPlaces(){
  const q = A.search.toLowerCase().trim();
  return A.places.filter(p=>{
    if(A.catFilter!=="ทั้งหมด" && p.cat!==A.catFilter) return false;
    if(q && !(String(p.name).toLowerCase().includes(q)
           || String(p.addr).toLowerCase().includes(q)
           || String(p.tag||"").toLowerCase().includes(q))) return false;
    return true;
  });
}
function renderPlacesTable(){
  const list = filteredAdminPlaces();
  $("#placesEmpty").classList.toggle("hidden", list.length>0);
  $("#placesTbody").innerHTML = list.map((p,i)=>`
    <tr>
      <td class="td-num">${i+1}</td>
      <td>
        <div class="td-place">
          <span class="td-thumb ${p.img?"":"noimg"}" ${p.img?`style="background-image:url('${esc(p.img)}')"`:`data-cat="${esc(p.cat)}"`}></span>
          <div><h4>${esc(p.name)}</h4><p><i class="fa-solid fa-tag" style="font-size:9px;color:var(--gold)"></i> ${esc(p.tag||"-")}</p></div>
        </div>
      </td>
      <td><span class="cat-pill" data-cat="${esc(p.cat)}">${esc(p.cat)}</span></td>
      <td>${esc(p.addr)}</td>
      <td class="td-rate"><i class="fa-solid fa-star"></i>${p.rating ? p.rating.toFixed(1) : "-"}</td>
      <td class="td-coords">${(+p.lat).toFixed(4)}, ${(+p.lng).toFixed(4)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="แก้ไข" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn del" title="ลบ" data-del="${p.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join("");

  $$("#placesTbody [data-edit]").forEach(b=>b.onclick=()=>openForm(+b.dataset.edit));
  $$("#placesTbody [data-del]").forEach(b=>b.onclick=()=>deletePlace(+b.dataset.del));
}
$("#admSearch").oninput = e=>{A.search=e.target.value; renderPlacesTable()};
$("#admCatFilter").onchange = e=>{A.catFilter=e.target.value; renderPlacesTable()};

/* ตัวเลือกหมวดใน filter + ฟอร์ม */
(function(){
  $("#admCatFilter").innerHTML =
    `<option value="ทั้งหมด">ทุกหมวดหมู่</option>` +
    CAT_LIST.map(c=>`<option value="${c}">${c}</option>`).join("");
  $("#pfCat").innerHTML = CAT_LIST.map(c=>`<option value="${c}">${c}</option>`).join("");
})();

/* ═══════════ เพิ่ม / แก้ไข / ลบ ═══════════ */
function openForm(id=null){
  A.editingId = id;
  const f = $("#placeForm");
  f.reset();
  updatePreview("");
  if(id!=null){
    const p = A.places.find(x=>x.id===id);
    if(!p) return;
    $("#pfEyebrow").textContent = "แก้ไขสถานที่";
    $("#pfTitle").textContent = p.name;
    f.name.value = p.name; f.cat.value = p.cat; f.tag.value = p.tag||"";
    f.addr.value = p.addr; f.desc.value = p.desc||""; f.img.value = p.img||"";
    f.hours.value = p.hours||""; f.bestTime.value = p.bestTime||""; f.fee.value = p.fee||"";
    f.highlights.value = Array.isArray(p.highlights) ? p.highlights.join(", ") : "";
    f.tips.value = p.tips||"";
    f.lat.value = p.lat; f.lng.value = p.lng; f.rating.value = p.rating ?? "";
    updatePreview(p.img||"", p.cat);
  }else{
    $("#pfEyebrow").textContent = "เพิ่มสถานที่";
    $("#pfTitle").textContent = "เพิ่มสถานที่ใหม่";
  }
  $("#placeFormModal").classList.remove("hidden");
}
$("#btnAddPlace").onclick = ()=>openForm();
$("#btnQuickAdd").onclick = ()=>{switchView("places"); openForm()};

function updatePreview(url, cat){
  const pv = $("#pfPreview");
  pv.style.backgroundImage = "";
  pv.classList.add("noimg");
  pv.setAttribute("data-cat", cat || $("#pfCat").value || "ธรรมชาติ");
  if(!url) return;
  const im = new Image();
  im.onload = ()=>{pv.style.backgroundImage=`url('${url}')`; pv.classList.remove("noimg")};
  im.src = url;
}
$("#pfImg").oninput  = e=>updatePreview(e.target.value.trim());
$("#pfCat").onchange = ()=>{ if(!$("#pfImg").value.trim()) updatePreview(""); };

$("#placeForm").onsubmit = e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {
    name:  fd.get("name").trim(),
    cat:   fd.get("cat"),
    tag:   fd.get("tag").trim(),
    addr:  fd.get("addr").trim(),
    desc:  fd.get("desc").trim(),
    img:   fd.get("img").trim(),
    hours: fd.get("hours").trim(),
    bestTime: fd.get("bestTime").trim(),
    fee:   fd.get("fee").trim(),
    tips:  fd.get("tips").trim(),
    highlights: fd.get("highlights").split(",").map(x=>x.trim()).filter(Boolean),
    lat:   parseFloat(fd.get("lat")),
    lng:   parseFloat(fd.get("lng")),
  };
  const r = parseFloat(fd.get("rating"));
  if(!Number.isNaN(r)) data.rating = Math.min(5, Math.max(0, r));

  if(A.editingId!=null){
    const idx = A.places.findIndex(p=>p.id===A.editingId);
    if(idx>=0) A.places[idx] = {...A.places[idx], ...data};
    toast(`บันทึกการแก้ไข "${data.name}" แล้ว`);
  }else{
    const newId = A.places.reduce((m,p)=>Math.max(m,p.id),0)+1;
    A.places.push({id:newId, ...data});
    toast(`เพิ่ม "${data.name}" แล้ว`);
  }
  savePlaces();
  $("#placeFormModal").classList.add("hidden");
  renderAll();
};

function deletePlace(id){
  const p = A.places.find(x=>x.id===id);
  if(!p) return;
  if(!confirm(`ลบ "${p.name}" ออกจากเว็บไซต์?\nการลบมีผลกับหน้าเว็บทันที`)) return;
  A.places = A.places.filter(x=>x.id!==id);
  savePlaces();
  renderAll();
  toast(`ลบ "${p.name}" แล้ว`);
}

/* ═══════════ สมาชิก ═══════════ */
function renderUsers(){
  const list = [...A.users].sort((a,b)=>new Date(b.joined||0)-new Date(a.joined||0));
  $("#usersEmpty").classList.toggle("hidden", list.length>0);
  $("#usersTbody").innerHTML = list.map(u=>`
    <tr>
      <td><div class="dd-avatar">${esc((u.name||"?").trim().charAt(0).toUpperCase())}</div></td>
      <td style="font-weight:600;color:var(--ink)">${esc(u.name)}</td>
      <td>${esc(u.email)}</td>
      <td>${u.joined ? new Date(u.joined).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"}) : "-"}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn del" title="ลบสมาชิก" data-deluser="${esc(u.email)}"><i class="fa-solid fa-user-xmark"></i></button>
        </div>
      </td>
    </tr>`).join("");
  $$("#usersTbody [data-deluser]").forEach(b=>b.onclick=()=>{
    const email = b.dataset.deluser;
    if(!confirm(`ลบสมาชิก ${email}?`)) return;
    A.users = A.users.filter(u=>u.email!==email);
    saveUsers();
    if(window.Cloud) Cloud.deleteUser(email);
    /* ถ้าสมาชิกคนนี้ล็อกอินค้างอยู่บนหน้าเว็บ ให้ล็อกเอาต์ด้วย */
    try{
      const cur = JSON.parse(localStorage.getItem("ptl_user")||"null");
      if(cur && cur.email===email) localStorage.removeItem("ptl_user");
    }catch(e){}
    renderAll();
    toast("ลบสมาชิกแล้ว");
  });
}

/* ═══════════ ประวัติกิจกรรมสมาชิก ═══════════ */
function timeAgo(iso){
  const diff = (Date.now() - new Date(iso)) / 1000;
  if(diff < 60)      return "เมื่อสักครู่";
  if(diff < 3600)    return `${Math.floor(diff/60)} นาทีที่แล้ว`;
  if(diff < 86400)   return `${Math.floor(diff/3600)} ชั่วโมงที่แล้ว`;
  if(diff < 604800)  return `${Math.floor(diff/86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"});
}
function renderActivity(){
  const box = $("#activityList");
  if(!box) return;
  if(!A.activity.length){
    box.innerHTML = `<p class="act-empty">ยังไม่มีกิจกรรม — เมื่อมีคนสมัครหรือเข้าสู่ระบบจากหน้าเว็บ ประวัติจะแสดงที่นี่ทันที</p>`;
    return;
  }
  box.innerHTML = A.activity.slice(0,30).map(a=>`
    <div class="act-row">
      <span class="act-ic ${a.type==="signup"?"signup":"login"}">
        <i class="fa-solid ${a.type==="signup"?"fa-user-plus":"fa-right-to-bracket"}"></i>
      </span>
      <div>
        <h4>${esc(a.name)} <span>${a.type==="signup"?"สมัครสมาชิกใหม่":"เข้าสู่ระบบ"}</span></h4>
        <p>${esc(a.email)}</p>
      </div>
      <span class="act-time">${timeAgo(a.time)}<br>${new Date(a.time).toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})} น.</span>
    </div>`).join("");
}

/* ═══════════ อัปเดตสด — โหลดข้อมูลใหม่เมื่อมีความเปลี่ยนแปลง ═══════════ */
function countAllFavs(){
  try{
    const all = JSON.parse(localStorage.getItem("ptl_favs_all") || "null");
    if(all) return Object.values(all).reduce((n,arr)=>n+(arr?arr.length:0),0);
    return JSON.parse(localStorage.getItem("ptl_favs") || "[]").length;
  }catch(e){ return 0 }
}
function reloadStores(){
  A.users    = JSON.parse(localStorage.getItem("ptl_users")    || "[]");
  A.activity = JSON.parse(localStorage.getItem("ptl_activity") || "[]");
  A.favs     = new Array(countAllFavs());
}

/* ── อัปเดตสดจากคลาวด์ ── */
window.addEventListener("ptlcloud", e=>{
  if(!isLoggedIn()) return;
  if(e.detail.key === "places"){
    try{
      const list = JSON.parse(localStorage.getItem("ptl_admin_places")||"[]");
      if(list.length && JSON.stringify(list)!==JSON.stringify(A.places)){
        A.places = list;
        renderAll();
      }
    }catch(err){}
    return;
  }
  reloadStores();
  renderAll();
});

window.addEventListener("storage", e=>{
  if(!isLoggedIn()) return;
  if(["ptl_users","ptl_activity","ptl_favs"].includes(e.key)){
    reloadStores();
    renderAll();
  }
});
/* เผื่อสมัครในแท็บเดียวกันแล้วสลับกลับมา */
window.addEventListener("focus", ()=>{
  if(!isLoggedIn()) return;
  reloadStores();
  renderAll();
});

$("#btnExport").onclick = ()=>{
  const blob = new Blob([JSON.stringify(A.places, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "phatthalung-places.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("ดาวน์โหลดไฟล์สำรองแล้ว");
};
$("#importFile").onchange = e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const arr = JSON.parse(reader.result);
      if(!Array.isArray(arr) || !arr.every(p=>p.name && p.cat)) throw new Error();
      if(!confirm(`นำเข้า ${arr.length} สถานที่ แทนที่ข้อมูลปัจจุบันทั้งหมด?`)) return;
      A.places = arr.map((p,i)=>({...p, id: p.id ?? i+1}));
      savePlaces();
      renderAll();
      toast(`นำเข้า ${arr.length} สถานที่แล้ว`);
    }catch(err){
      toast("ไฟล์ไม่ถูกต้อง — ต้องเป็น JSON รายการสถานที่");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
};
$("#btnReset").onclick = ()=>{
  if(!confirm("รีเซ็ตข้อมูลสถานที่ทั้งหมดกลับเป็นค่าเริ่มต้น 32 แห่ง?\nการแก้ไขทั้งหมดจากหลังบ้านจะหายไป")) return;
  localStorage.removeItem("ptl_admin_places");
  if(window.PLACES_VERSION) localStorage.setItem("ptl_places_version", String(window.PLACES_VERSION));
  if(window.Cloud && typeof PLACES_DEFAULT!=="undefined") Cloud.savePlaces(PLACES_DEFAULT);
  toast("รีเซ็ตแล้ว กำลังโหลดใหม่...");
  setTimeout(()=>location.reload(), 700);
};

$$("[data-close]").forEach(el=>el.onclick=e=>{
  e.target.closest(".modal").classList.add("hidden");
});
document.addEventListener("keydown", e=>{
  if(e.key==="Escape") $("#placeFormModal").classList.add("hidden");
});

function renderAll(){
  if($("#defCount") && typeof PLACES_DEFAULT!=="undefined") $("#defCount").textContent = PLACES_DEFAULT.length;
  renderDashboard();
  renderPlacesTable();
  renderUsers();
  renderActivity();
}
A.favs = new Array(countAllFavs());
if(isLoggedIn()) showApp();
else showLogin();   /* เข้าตรง admin.html โดยไม่ได้ล็อกอิน → ยังกรอกที่นี่ได้เหมือนเดิม */
