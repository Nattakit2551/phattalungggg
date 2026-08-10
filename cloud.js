/* ═══════════════════════════════════════════════════════════
   cloud.js — เชื่อมเว็บกับ Firebase Realtime Database
   ข้อมูลสถานที่ / สมาชิก / โปรไฟล์ / รายการโปรด / ประวัติ
   จะถูกซิงก์ขึ้นคลาวด์ ทุกเครื่องเห็นชุดเดียวกัน
   ═══════════════════════════════════════════════════════════ */

import { initializeApp }  from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics }   from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getDatabase, ref, onValue, set, push }
  from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcgmc6sf3q5wBdW3JhEIaDyrgbcf9BaHU",
  authDomain: "phattalung-guide.firebaseapp.com",
  databaseURL: "https://phattalung-guide-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phattalung-guide",
  storageBucket: "phattalung-guide.firebasestorage.app",
  messagingSenderId: "458250781522",
  appId: "1:458250781522:web:afa4807f844ab69966308b",
  measurementId: "G-H5GJQTHGN3"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch(e){ /* analytics ใช้ไม่ได้บน file:// — ข้ามไป */ }
const db = getDatabase(app);

/* อีเมลมี . @ ซึ่งใช้เป็น key ใน RTDB ไม่ได้ → แปลงเป็น _ */
const ek = e => String(e||"").toLowerCase().replace(/[.#$/\[\]@]/g, "_");
const lsSet = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} };
const emit = key => window.dispatchEvent(new CustomEvent("ptlcloud", {detail:{key}}));

/* ── API ที่หน้าเว็บและหลังบ้านเรียกใช้ ── */
const Cloud = {
  online: false,
  ek,
  savePlaces : list        => set(ref(db,"places"), {updated:Date.now(), list}),
  saveUser   : u           => set(ref(db,"users/"+ek(u.email)), u),
  deleteUser : email       => set(ref(db,"users/"+ek(email)), null),
  saveProfile: (email,d)   => set(ref(db,"profiles/"+ek(email)), d),
  saveFavs   : (email,ids) => set(ref(db,"favs/"+ek(email)), ids),
  logActivity: a           => push(ref(db,"activity"), a),
};
window.Cloud = Cloud;

/* ── สถานที่ ── */
let placesPushed = false;

/* ถ้าไฟล์เพิ่งอัปเวอร์ชัน → ดันชุดใหม่ขึ้นคลาวด์ทันที ไม่ต้องรอ snapshot
   (กันกรณีคลาวด์ยังมีข้อมูลเก่าค้างอยู่ แล้ว snapshot เก่ามาก่อน) */
if(window.PLACES_FORCE_REFRESH && typeof PLACES !== "undefined" && PLACES.length){
  placesPushed = true;
  const fresh = (typeof PLACES_DEFAULT !== "undefined") ? PLACES_DEFAULT : PLACES;
  Cloud.savePlaces(fresh).catch(err=>console.warn("[cloud] force push:", err.message));
  lsSet("ptl_admin_places", fresh);
}

onValue(ref(db,"places"), snap=>{
  const v = snap.val();

  /* เพิ่งบังคับอัปเดตแล้ว → ถ้า snapshot ยังเป็นของเก่า (จำนวนน้อยกว่า) ให้ข้ามไป */
  if(placesPushed && v && Array.isArray(v.list) && typeof PLACES!=="undefined" && v.list.length < PLACES.length){
    Cloud.online = true; emit("ready");
    return;
  }

  if(v && Array.isArray(v.list) && v.list.length){
    lsSet("ptl_admin_places", v.list);
    emit("places");
  }else if(v === null && typeof PLACES !== "undefined" && PLACES.length){
    /* คลาวด์ยังว่าง → อัปโหลดข้อมูลเริ่มต้นขึ้นไปครั้งแรก */
    Cloud.savePlaces(PLACES);
  }
  Cloud.online = true;
  emit("ready");
}, err=>console.warn("[cloud] places:", err.message));

/* ── สมาชิก ── */
onValue(ref(db,"users"), snap=>{
  lsSet("ptl_users", Object.values(snap.val() || {}));
  emit("users");
}, err=>console.warn("[cloud] users:", err.message));

/* ── ประวัติกิจกรรม (เก็บล่าสุด 100) ── */
onValue(ref(db,"activity"), snap=>{
  const list = Object.values(snap.val() || {})
    .sort((a,b)=> new Date(b.time) - new Date(a.time))
    .slice(0,100);
  lsSet("ptl_activity", list);
  emit("activity");
}, err=>console.warn("[cloud] activity:", err.message));

/* ── โปรไฟล์ ── */
onValue(ref(db,"profiles"), snap=>{
  lsSet("ptl_profiles_all", snap.val() || {});
  emit("profiles");
}, err=>console.warn("[cloud] profiles:", err.message));

/* ── รายการโปรด (แยกตามสมาชิก) ── */
onValue(ref(db,"favs"), snap=>{
  lsSet("ptl_favs_all", snap.val() || {});
  emit("favs");
}, err=>console.warn("[cloud] favs:", err.message));
