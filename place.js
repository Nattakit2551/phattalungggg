/* ═══ หน้ารายละเอียดเต็มของสถานที่ (place.html?id=..) ═══ */
(function(){
  const $ = s=>document.querySelector(s);
  const box = document.getElementById("placeDetail");
  if(!box) return;

  const CAT_COLOR = {
    "ธรรมชาติ":"#106a75","วัฒนธรรม":"#e29a2f","ผจญภัย":"#1a6b8f",
    "อาหาร":"#c4402f","ครอบครัว":"#6b4f8f"
  };

  function findPlace(){
    const id = +new URLSearchParams(location.search).get("id");
    if(typeof PLACES === "undefined") return null;
    return PLACES.find(p=>p.id===id) || null;
  }

  function render(){
    const p = findPlace();
    if(!p){
      box.innerHTML = `<div class="pd-empty">
        <i class="fa-solid fa-map-location-dot"></i>
        <h2>ไม่พบสถานที่นี้</h2>
        <a href="places.html" class="btn-primary">← กลับไปหน้าสถานที่</a>
      </div>`;
      return;
    }
    document.title = `${p.name} — พัทลุงไกด์ AI`;
    const color = CAT_COLOR[p.cat] || "#106a75";

    const facts = [];
    if(p.hours)    facts.push(["fa-clock","เวลาเปิด",p.hours]);
    if(p.bestTime) facts.push(["fa-calendar-check","ช่วงที่แนะนำ",p.bestTime]);
    if(p.fee)      facts.push(["fa-tag","ค่าใช้จ่าย",p.fee]);
    facts.push(["fa-location-dot","พิกัด",`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`]);

    const stars = "★".repeat(Math.round(p.rating||0)) + "☆".repeat(5-Math.round(p.rating||0));

    box.innerHTML = `
      <header class="pd-hero" id="pdHero" style="background-image:linear-gradient(180deg,rgba(15,36,41,.25),rgba(15,36,41,.75)),url('${p.img}')">
        <video class="pd-hero-video" id="pdHeroVideo" muted loop playsinline preload="auto"></video>
        <div class="container pd-hero-in">
          <a href="places.html" class="pd-back"><i class="fa-solid fa-arrow-left"></i> สถานที่ทั้งหมด</a>
          <span class="pd-cat" style="background:${color}">${p.cat}</span>
          <h1>${p.name}</h1>
          <div class="pd-meta">
            <span class="pd-stars">${stars} <b>${(p.rating||0).toFixed(1)}</b></span>
            <span><i class="fa-solid fa-location-dot"></i> ${p.addr}</span>
          </div>
          <div class="pd-actions">
            <button class="btn-primary" id="pdSpeak"><i class="fa-solid fa-volume-high"></i> ฟัง AI เล่า</button>
            <button class="btn-ghost" id="pdFav"><i class="fa-regular fa-heart"></i> บันทึกโปรด</button>
            <a class="btn-ghost" target="_blank" rel="noopener"
               href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">
               <i class="fa-solid fa-diamond-turn-right"></i> นำทาง</a>
          </div>
        </div>
      </header>

      <div class="container pd-body">
        <div class="pd-main">
          <section class="pd-block">
            <h2><i class="fa-solid fa-circle-info"></i> เกี่ยวกับสถานที่นี้</h2>
            <p class="pd-desc">${p.desc || ""}</p>
          </section>

          ${Array.isArray(p.highlights)&&p.highlights.length ? `
          <section class="pd-block">
            <h2><i class="fa-solid fa-star"></i> ไฮไลต์</h2>
            <ul class="pd-highlights">
              ${p.highlights.map(h=>`<li><i class="fa-solid fa-check"></i> ${h}</li>`).join("")}
            </ul>
          </section>` : ""}

          ${p.tips ? `
          <section class="pd-block">
            <div class="pd-tip"><i class="fa-solid fa-lightbulb"></i>
              <span><b>เคล็ดลับ</b> ${p.tips}</span></div>
          </section>` : ""}

          <section class="pd-block">
            <h2><i class="fa-solid fa-map-location-dot"></i> แผนที่</h2>
            <div id="pdMap" class="pd-map"></div>
          </section>
        </div>

        <aside class="pd-side">
          <div class="pd-card">
            <h3>ข้อมูลสำคัญ</h3>
            <ul class="pd-facts">
              ${facts.map(([ic,label,val])=>`
                <li><span class="pd-fact-ic" style="background:${color}"><i class="fa-solid ${ic}"></i></span>
                  <div><span>${label}</span><b>${val}</b></div></li>`).join("")}
            </ul>
          </div>
          <div class="pd-card" id="pdRelated"></div>
        </aside>
      </div>
    `;

    initMap(p, color);
    wireActions(p);
    renderRelated(p);
    /* วิดีโอ/ซูมภาพใน hero */
    if(window.applyPlaceMedia){
      applyPlaceMedia(p, document.getElementById("pdHero"), document.getElementById("pdHeroVideo"));
    }
  }

  function initMap(p, color){
    const el = document.getElementById("pdMap");
    if(!el || typeof L === "undefined") return;
    const map = L.map(el,{scrollWheelZoom:false}).setView([p.lat,p.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      attribution:"© OpenStreetMap", maxZoom:18
    }).addTo(map);
    const icon = L.divIcon({
      className:"pin-wrap",
      html:`<span class="map-pin" style="background:${color}"></span>`,
      iconSize:[26,26], iconAnchor:[13,26]
    });
    L.marker([p.lat,p.lng],{icon}).addTo(map).bindPopup(`<b>${p.name}</b>`).openPopup();
    map.on("focus", ()=>map.scrollWheelZoom.enable());
    map.on("blur",  ()=>map.scrollWheelZoom.disable());
  }

  function wireActions(p){
    /* ฟังเสียง — ใช้ฟังก์ชันเดียวกับ app.js ผ่านตัวแปร global */
    const speakBtn = document.getElementById("pdSpeak");
    if(speakBtn && typeof narrateText === "function"){
      speakBtn.onclick = ()=> narrateText(buildText(p), speakBtn);
    }
    /* บันทึกโปรด — reuse state/cloud จาก app.js ถ้ามี */
    const favBtn = document.getElementById("pdFav");
    if(favBtn && window.state){
      const paint = ()=>{
        const on = (state.favs||[]).includes(p.id);
        favBtn.innerHTML = on
          ? '<i class="fa-solid fa-heart"></i> บันทึกแล้ว'
          : '<i class="fa-regular fa-heart"></i> บันทึกโปรด';
        favBtn.classList.toggle("active", on);
      };
      paint();
      favBtn.onclick = ()=>{
        if(!state.user){ if(window.openAuth) openAuth(); return; }
        if(typeof toggleFav === "function"){ toggleFav(p.id); paint(); }
      };
    }
  }

  function buildText(p){
    const parts = [p.name];
    if(p.desc) parts.push(p.desc);
    if(p.hours) parts.push(`เปิดให้บริการ ${p.hours}`);
    if(p.bestTime) parts.push(`ช่วงเวลาที่แนะนำคือ ${p.bestTime}`);
    if(p.fee) parts.push(`ค่าใช้จ่าย ${p.fee}`);
    return parts.join(". ");
  }

  function renderRelated(p){
    const el = document.getElementById("pdRelated");
    if(!el) return;
    const rel = PLACES.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4);
    if(!rel.length){ el.remove(); return; }
    el.innerHTML = `<h3>ที่เที่ยวใกล้เคียง</h3>
      <div class="pd-rel-list">
        ${rel.map(r=>`
          <a class="pd-rel" href="place.html?id=${r.id}">
            <span class="pd-rel-img" style="background-image:url('${r.img}')"></span>
            <div><b>${r.name}</b><span>${r.addr}</span></div>
          </a>`).join("")}
      </div>`;
  }

  /* รอ PLACES พร้อม (เผื่อ cloud sync มาช้า) */
  render();
  window.addEventListener("ptlcloud", e=>{ if(e.detail && e.detail.key==="places") render(); });
})();
