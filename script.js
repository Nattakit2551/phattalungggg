// ==========================================================================
// Phatthalung AI Travel Platform - Engine & Features (Version 2026)
// ==========================================================================

// ==================== Firebase Configuration & Init ====================
const firebaseConfig = {
  apiKey: "AIzaSyC0tLpITYdWI5SuD9k3TT-Ctb2qwRI66xA",
  authDomain: "yyyyyyy-26b43.firebaseapp.com",
  databaseURL: "https://yyyyyyy-26b43-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yyyyyyy-26b43",
  storageBucket: "yyyyyyy-26b43.firebasestorage.app",
  messagingSenderId: "68462877183",
  appId: "1:68462877183:web:2b6148c52c0e2ac048efca",
  measurementId: "G-WRFQQ0LDBR"
};

let db = null;
let auth = null;

try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        auth = firebase.auth();
        console.log("Firebase initialized successfully");
    }
} catch (e) {
    console.warn("Firebase initialization note:", e);
}

// ==================== Admin Credentials ====================
const ADMIN_EMAIL = "nattakit@gmail.com";
const ADMIN_PASSWORD = "123456";

function isCurrentUserAdmin() {
    const userJson = localStorage.getItem('phatthalung_user');
    if (!userJson) return false;
    try {
        const user = JSON.parse(userJson);
        return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    } catch(e) {
        return false;
    }
}

// ==================== Toast Notification Engine ====================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check text-accent' : 'fa-circle-exclamation text-warning';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== 30 Destination Data ====================
const INITIAL_PLACES_DATA = [
  {
    "id": 1,
    "name": "สะพานเฉลิมพระเกียรติ 80 พรรษา (สะพานเอกชัย)",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.749,
    "lng": 100.1558,
    "rating": 4.9,
    "reviews": 1280,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "description": "สะพานข้ามทะเลสาบที่ยาวที่สุดในประเทศไทย เชื่อมระหว่างพัทลุงและสงขลา ชมวิวทุ่งหญ้า ทะเลสาบ ควายน้ำ และนกน้ำนานาพันธุ์",
    "highlight": "ชมฝูงควายน้ำและนกน้ำยามเย็น",
    "best_time": "ช่วงเช้า 06:00-08:00 หรือเย็น 16:30-18:30 น."
  },
  {
    "id": 2,
    "name": "คลองปากประ & ยอยักษ์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.7314,
    "lng": 100.1447,
    "rating": 4.9,
    "reviews": 1540,
    "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "description": "จุดชมพระอาทิตย์ขึ้นที่สวยงามที่สุดแห่งหนึ่งในภาคใต้ ชมวิถียกยอยักษ์โบราณริมคลองปากประ",
    "highlight": "ถ่ายรูปยอยักษ์สะท้อนแสงอาทิตย์อัสดงยามเช้า",
    "best_time": "05:30 - 07:30 น."
  },
  {
    "id": 3,
    "name": "ทะเลน้อย & ทุ่งบัวแดง",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.7786,
    "lng": 100.1245,
    "rating": 4.8,
    "reviews": 980,
    "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    "description": "แรมซาร์ไซต์แห่งแรกของประเทศไทย ล่องเรือชมนกน้ำกว่า 280 ชนิด ทุ่งบัวแดงบานสะพรั่ง และควายน้ำ",
    "highlight": "ล่องเรือชมทุ่งบัวแดงและฝูงนกอพยพ",
    "best_time": "ก.พ. - เม.ย. (เช้าตรู่ 06:00-09:00)"
  },
  {
    "id": 4,
    "name": "จุดชมวิวทะเลหมอกควนนกเต้น",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.4042,
    "lng": 99.9654,
    "rating": 4.8,
    "reviews": 1120,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "description": "จุดชมวิวทะเลหมอกยอดฮิตบนเทือกเขาบรรทัด จิบกาแฟสดชมทะเลหมอกขาวโพลนตัดกับผืนป่าเขียวขจี",
    "highlight": "ทะเลหมอกยามเช้าและวิวเทือกเขาบรรทัด",
    "best_time": "05:30 - 08:30 น. ตลอดทั้งปี"
  },
  {
    "id": 5,
    "name": "ล่องแก่งหนานมดแดง",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "ป่าพะยอม",
    "lat": 7.5645,
    "lng": 99.8821,
    "rating": 4.8,
    "reviews": 890,
    "image": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    "description": "กิจกรรมล่องเรือคายัคสายน้ำใส ผ่านแก่งหินธรรมชาติความยาวกว่า 6 กิโลเมตร ระดับ 2-3 ปลอดภัย",
    "highlight": "พายคายัคผจญภัยในสายน้ำใสแจ๋ว",
    "best_time": "09:00 - 16:00 น."
  },
  {
    "id": 6,
    "name": "น้ำตกไพรวัลย์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.4125,
    "lng": 99.9234,
    "rating": 4.7,
    "reviews": 650,
    "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกขนาดใหญ่กลางป่าดิบชื้นแห่งเขตรักษาพันธุ์สัตว์ป่าเขาบรรทัด มีน้ำไหลตลอดปี สดชื่นเย็นสบาย",
    "highlight": "เล่นน้ำตกใสกลางป่าดิบชื้นร่มรื่น",
    "best_time": "08:30 - 16:30 น."
  },
  {
    "id": 7,
    "name": "เขาอกทะลุ",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เมืองพัทลุง",
    "lat": 7.6189,
    "lng": 100.0883,
    "rating": 4.7,
    "reviews": 740,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "ภูเขาหินปูนสัญลักษณ์ประจำจังหวัดพัทลุง มีรูโหว่ขนาดใหญ่ทะลุใจกลางเขา พร้อมบันไดขึ้นชมวิวเมือง",
    "highlight": "เดินขึ้นบันไดชมทัศนียภาพเมืองพัทลุงมุมสูง",
    "best_time": "ช่วงเช้าหรือเย็นแดดร่ม"
  },
  {
    "id": 8,
    "name": "วังเจ้าเมืองพัทลุง (วังเก่า-วังใหม่)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เมืองพัทลุง",
    "lat": 7.6256,
    "lng": 100.1412,
    "rating": 4.7,
    "reviews": 560,
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    "description": "สถาปัตยกรรมเรือนไทยปักษ์ใต้โบราณ อดีตที่พำนักของเจ้าเมืองพัทลุง จัดแสดงโบราณวัตถุและวิถีชีวิต",
    "highlight": "สถาปัตยกรรมเรือนไทยภาคใต้โบราณ",
    "best_time": "09:00 - 16:00 น. (พุธ - อาทิตย์)"
  },
  {
    "id": 9,
    "name": "ตลาดป่าไผ่สร้างสุข",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.7381,
    "lng": 100.0125,
    "rating": 4.8,
    "reviews": 1340,
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    "description": "ตลาดนัดกรีนมาร์เก็ตท่ามกลางกอไผ่ร่มรื่น ใช้วัสดุธรรมชาติปลอดโฟมและพลาสติก อาหารพื้นบ้านมากมาย",
    "highlight": "ชิมขนมพื้นบ้านสาคูต้นแท้ในสวนไผ่ร่มรื่น",
    "best_time": "วันเสาร์ 09:00 - 17:00 น."
  },
  {
    "id": 10,
    "name": "หลาดใต้โหนด (บ้านนักเขียนกนกพงศ์)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.7654,
    "lng": 99.9876,
    "rating": 4.8,
    "reviews": 1150,
    "image": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    "description": "ตลาดวัฒนธรรมใต้ร่มเงาต้นตาลโตนด แหล่งรวมงานศิลปะ อาหารออร์แกนิก ดนตรีสด และวิถีชุมชน",
    "highlight": "สัมผัสวัฒนธรรมพื้นบ้าน ชิมอาหารใต้แท้ๆ",
    "best_time": "วันอาทิตย์ 08:00 - 15:00 น."
  },
  {
    "id": 11,
    "name": "ศูนย์เรียนรู้นาโปแก",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "ควนขนุน",
    "lat": 7.7342,
    "lng": 100.0098,
    "rating": 4.6,
    "reviews": 890,
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    "description": "สถานที่ท่องเที่ยวเชิงเกษตรและเรียนรู้วิถีชาวนาเมืองพัทลุง มีสะพานไม้ทอดยาวกลางทุ่งนาและคาเฟ่",
    "highlight": "ถ่ายรูปสะพานไม้กลางทุ่งนาและชิมกาแฟพื้นบ้าน",
    "best_time": "08:30 - 18:00 น."
  },
  {
    "id": 12,
    "name": "บ่อน้ำร้อนเขาชัยสน",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "เขาชัยสน",
    "lat": 7.4498,
    "lng": 100.1294,
    "rating": 4.6,
    "reviews": 620,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "description": "แหล่งน้ำแร่ร้อนธรรมชาติ อุณหภูมิประมาณ 60 องศาเซลเซียส เหมาะสำหรับแช่เท้า แช่ตัวเพื่อสุขภาพ",
    "highlight": "แช่น้ำแร่ร้อนธรรมชาติบำรุงสุขภาพ",
    "best_time": "08:00 - 17:00 น."
  },
  {
    "id": 13,
    "name": "HLNG Cafe (เหรง คาเฟ่)",
    "category": "food",
    "category_name": "อาหาร",
    "district": "ควนขนุน",
    "lat": 7.728,
    "lng": 100.015,
    "rating": 4.9,
    "reviews": 890,
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "description": "คาเฟ่บรรยากาศสุดชิลล์ ดีไซน์สวยโมเดิร์นท่ามกลางธรรมชาติ เครื่องดื่มและเบเกอรี่รสเลิศ",
    "highlight": "จิบกาแฟ Specialty ท่ามกลางสวนเขียวขจี",
    "best_time": "09:00 - 18:00 น."
  },
  {
    "id": 14,
    "name": "น้ำพุร้อนบ้านสวนหมาก ศรีนครินทร์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ศรีนครินทร์",
    "lat": 7.521,
    "lng": 99.915,
    "rating": 4.9,
    "reviews": 430,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "description": "บ่อน้ำพุร้อนธรรมชาติใต้ร่มเงาสวนหมาก บรรยากาศเงียบสงบเหมาะแก่การพักผ่อนและแช่น้ำแร่บำรุงผิว",
    "highlight": "แช่น้ำแร่ร้อนท่ามกลางสวนหมากธรรมชาติ",
    "best_time": "08:00 - 17:00 น."
  },
  {
    "id": 15,
    "name": "เขาเจ็ดยอด (เทือกเขาบรรทัด)",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "กงหรา",
    "lat": 7.425,
    "lng": 99.892,
    "rating": 4.8,
    "reviews": 320,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "ยอดเขาสูงกว่า 1,200 เมตรเหนือระดับน้ำทะเล แหล่งเดินป่าพิชิตธรรมชาติ ทุ่งหญ้าสะวันนา และทะเลหมอก",
    "highlight": "เดินป่ากางเต็นท์พิชิตยอดเขาชมวิว 3 จังหวัด",
    "best_time": "พ.ย. - เม.ย."
  },
  {
    "id": 16,
    "name": "ป่าพะยอมโฮมสเตย์แคมป์ปิ้ง",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "ป่าพะยอม",
    "lat": 7.567,
    "lng": 99.885,
    "rating": 4.8,
    "reviews": 610,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "description": "ลานกางเต็นท์และโฮมสเตย์ริมลำธารใส นอนฟังเสียงน้ำไหล กิจกรรมเล่นน้ำและปิ้งย่างสำหรับครอบครัว",
    "highlight": "พักผ่อนริมลำธารใสและแคมป์ปิ้งใต้แสงดาว",
    "best_time": "ตลอดทั้งปี"
  },
  {
    "id": 17,
    "name": "อ่างเก็บน้ำห้วยน้ำใส (สวิตเซอร์แลนด์พัทลุง)",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ป่าพะยอม",
    "lat": 7.551,
    "lng": 99.808,
    "rating": 4.8,
    "reviews": 790,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "description": "อ่างเก็บน้ำขนาดใหญ่โอบล้อมด้วยแนวเทือกเขาบรรทัด วิวสวยสะกดสายตา อากาศบริสุทธิ์สดชื่นตลอดปี",
    "highlight": "ชมวิวภูเขาสะท้อนผิวน้ำดั่งสวิตเซอร์แลนด์",
    "best_time": "ช่วงเช้า 06:30 - 09:00 น."
  },
  {
    "id": 18,
    "name": "น้ำตกมโนราห์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "เมืองพัทลุง",
    "lat": 7.512,
    "lng": 99.982,
    "rating": 4.7,
    "reviews": 510,
    "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกหินปูนท่ามกลางป่าร่มรื่น มีแอ่งน้ำใสสีเขียวมรกตและสะพานแขวนชมวิวธรรมชาติ",
    "highlight": "เดินข้ามสะพานแขวนและเล่นแอ่งน้ำใส",
    "best_time": "09:00 - 16:30 น."
  },
  {
    "id": 19,
    "name": "วัดเขาอ้อ (ตักศิลาไสยเวทแดนใต้)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.742,
    "lng": 99.965,
    "rating": 4.9,
    "reviews": 1100,
    "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
    "description": "สำนักตักศิลาที่มีชื่อเสียงด้านพุทธาคมและสมุนไพรแผนโบราณยาวนานกว่า 900 ปี แหล่งรวมศรัทธาสายมู",
    "highlight": "ไหว้พระขอพรและชมถ้ำพระพุทธรูปโบราณ",
    "best_time": "08:00 - 17:00 น."
  },
  {
    "id": 20,
    "name": "วัดเขียนบางแก้ว",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เขาชัยสน",
    "lat": 7.432,
    "lng": 100.162,
    "rating": 4.8,
    "reviews": 680,
    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    "description": "วัดโบราณอายุกว่า 1,000 ปี สร้างในสมัยอยุธยาตอนต้น ประดิษฐานพระบรมธาตุเจดีย์บางแก้วอันศักดิ์สิทธิ์",
    "highlight": "สักการะพระบรมธาตุเจดีย์บางแก้วโบราณ",
    "best_time": "08:00 - 17:00 น."
  },
  {
    "id": 21,
    "name": "วัดคูหาสวรรค์ (วัดถ้ำคูหาสวรรค์)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เมืองพัทลุง",
    "lat": 7.622,
    "lng": 100.082,
    "rating": 4.7,
    "reviews": 720,
    "image": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80",
    "description": "พระอารามหลวงแห่งแรกของพัทลุง ภายในถ้ำประดิษฐานพระพุทธรูปปางไสยาสน์และจารึก ร.5 ร.7",
    "highlight": "ชมพระพุทธรูปโบราณในถ้ำหินปูนธรรมชาติ",
    "best_time": "08:30 - 16:30 น."
  },
  {
    "id": 22,
    "name": "สวนเดอลอง (Delong Garden)",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "เมืองพัทลุง",
    "lat": 7.642,
    "lng": 100.054,
    "rating": 4.6,
    "reviews": 840,
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    "description": "แหล่งท่องเที่ยวเชิงเกษตรฟาร์มเมลอน ชิมกาแฟผสมข้าวสังข์หยดพัทลุง และจุดถ่ายรูปเช็คอินไดโนเสาร์",
    "highlight": "ชิมเค้กเมลอนสดและกาแฟข้าวสังข์หยด",
    "best_time": "09:00 - 18:00 น."
  },
  {
    "id": 23,
    "name": "หาดแสนสุขลำปำ",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "เมืองพัทลุง",
    "lat": 7.618,
    "lng": 100.1447,
    "rating": 4.6,
    "reviews": 920,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "description": "หาดริมทะเลสาบสงขลาตอนใน บรรยากาศร่มรื่นด้วยทิวสน ลมพัดเย็นสบาย เหมาะสำหรับการปิกนิก",
    "highlight": "นั่งชิลล์ริมหาดทะเลสาบรับลมเย็นสบาย",
    "best_time": "ช่วงเย็น 16:00 - 18:30 น."
  },
  {
    "id": 24,
    "name": "หัตถกรรมกระจูดวรรณี (Varni Craft)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.742,
    "lng": 100.118,
    "rating": 4.8,
    "reviews": 640,
    "image": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    "description": "ศูนย์เรียนรู้และจำหน่ายงานคราฟต์กระจูดดีไซน์ระดับอินเตอร์ พร้อมโฮมสเตย์และคาเฟ่มินิมอล",
    "highlight": "เลือกซื้อกระเป๋ากระจูดดีไซน์โมเดิร์น",
    "best_time": "08:30 - 17:30 น."
  },
  {
    "id": 25,
    "name": "จุดชมวิวควนนกหว้า",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.41,
    "lng": 99.97,
    "rating": 4.7,
    "reviews": 460,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "description": "จุดชมวิวพระอาทิตย์ขึ้นและทะเลหมอกอีกหนึ่งแห่งในกงหรา มองเห็นทิวทัศน์เขาบรรทัดแบบ 360 องศา",
    "highlight": "แคมป์ปิ้งชมดาวและทะเลหมอกยามเช้า",
    "best_time": "05:30 - 08:30 น."
  },
  {
    "id": 26,
    "name": "น้ำตกหนานหรูด",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ป่าพะยอม",
    "lat": 7.575,
    "lng": 99.852,
    "rating": 4.6,
    "reviews": 380,
    "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกขนาดเล็กบรรยากาศเงียบสงบในลานข่อย น้ำใสเย็นไหลผ่านโขดหิน เหมาะกับการลงเล่นน้ำ",
    "highlight": "สไลเดอร์หินธรรมชาติและเล่นน้ำใส",
    "best_time": "09:00 - 16:00 น."
  },
  {
    "id": 27,
    "name": "ถ้ำน้ำเย็นเขาชัยสน",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "เขาชัยสน",
    "lat": 7.452,
    "lng": 100.132,
    "rating": 4.7,
    "reviews": 390,
    "image": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    "description": "ถ้ำหินปูนที่มีธารน้ำเย็นไหลผ่านตลอดปี สามารถพายเรือคายัคลอดถ้ำชมหินงอกหินย้อยระยิบระยับ",
    "highlight": "พายคายัคลอดถ้ำชมหินงอกหินย้อยอันงดงาม",
    "best_time": "09:00 - 16:00 น."
  },
  {
    "id": 28,
    "name": "ร้านขนมหวานป้ากี้ ควนขนุน",
    "category": "food",
    "category_name": "อาหาร",
    "district": "ควนขนุน",
    "lat": 7.738,
    "lng": 100.011,
    "rating": 4.9,
    "reviews": 1420,
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    "description": "ร้านขนมหวานพื้นบ้านในตำนาน เมนูไฮไลต์คือ 'สาคูต้นแท้กะทิสด' เหนียวนุ่ม หอมหวานละมุน",
    "highlight": "ชิมสาคูต้นแท้และกล้วยเชื่อมกะทิสด",
    "best_time": "09:30 - 16:00 น."
  },
  {
    "id": 29,
    "name": "ร้านหลานตาชู สเต็กเฮาส์",
    "category": "food",
    "category_name": "อาหาร",
    "district": "ควนขนุน",
    "lat": 7.712,
    "lng": 100.024,
    "rating": 4.8,
    "reviews": 1850,
    "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "description": "ร้านอาหารแลนด์มาร์กของพัทลุง บริการทั้งอาหารใต้รสจัดจ้าน สเต็กพรีเมียม และของฝากขึ้นชื่อ",
    "highlight": "ลิ้มลองแกงคั่วกระดูกอ่อนและสเต็กเนื้อโคขุน",
    "best_time": "10:00 - 21:00 น."
  },
  {
    "id": 30,
    "name": "เกาะสี่ เกาะห้า (หมู่เกาะรังนก)",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ปากพะยูน",
    "lat": 7.345,
    "lng": 100.284,
    "rating": 4.8,
    "reviews": 530,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "description": "หมู่เกาะหินปูนกลางทะเลสาบสงขลาตอนล่าง แหล่งสัมปทานรังนกนางแอ่นธรรมชาติที่มีทิวทัศน์งดงาม",
    "highlight": "ล่องเรือชมเกาะหินปูนกลางทะเลสาบสงขลา",
    "best_time": "08:00 - 15:00 น."
  }
];

let PLACES = JSON.parse(localStorage.getItem('phatthalung_places_db')) || INITIAL_PLACES_DATA;
let favorites = JSON.parse(localStorage.getItem('phatthalung_favs')) || [];

function savePlacesToStorage() {
    localStorage.setItem('phatthalung_places_db', JSON.stringify(PLACES));
    if (db) {
        db.ref('places').set(PLACES).catch(err => console.error("Firebase Sync Error:", err));
    }
}

function syncPlacesFromFirebase() {
    if (db) {
        db.ref('places').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data) && data.length > 0) {
                PLACES = data;
                localStorage.setItem('phatthalung_places_db', JSON.stringify(PLACES));
                if (typeof filterPlaces === 'function') filterPlaces();
                if (typeof renderTopHighlights === 'function') renderTopHighlights();
                if (typeof updateAdminDashboardStats === 'function') updateAdminDashboardStats();
            } else {
                savePlacesToStorage();
            }
        });
    }
}

// ==================== Global Initializer ====================
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    renderNavUserDropdown();
    initAdminGate();
    syncPlacesFromFirebase();
    if (document.getElementById('topHighlightsGrid')) renderTopHighlights();
    if (document.getElementById('editProfileForm')) initProfilePage();
    if (document.getElementById('favoritesPageGrid')) initFavoritesPage();
    initNatureAmbianceToggle();
    initWeatherWidget();
});

function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }
}

// ==================== User Navbar Auth & Dropdown ====================
function renderNavUserDropdown() {
    const navUserArea = document.getElementById('navUserArea');
    if (!navUserArea) return;

    const userJson = localStorage.getItem('phatthalung_user');
    
    if (!userJson) {
        navUserArea.innerHTML = `
            <a href="login.html" class="btn-login-pill">
                <i class="fa-solid fa-arrow-right-to-bracket"></i>
                <span>เข้าสู่ระบบ</span>
            </a>
        `;

        const mobileProfileLink = document.querySelector('.mobile-profile-link');
        const mobileAdminLink = document.querySelector('.mobile-admin-link');
        const mobileLoginLink = document.querySelector('.mobile-login-link');
        
        if (mobileProfileLink) mobileProfileLink.style.display = 'none';
        if (mobileAdminLink) mobileAdminLink.style.display = 'none';
        if (mobileLoginLink) mobileLoginLink.style.display = 'flex';
        return;
    }

    let user = {};
    try {
        user = JSON.parse(userJson);
    } catch (e) {
        user = { name: "Nattakit", email: "nattakit@gmail.com" };
    }

    const initial = (user.name || user.email || 'N').charAt(0).toUpperCase();
    const isAdmin = isCurrentUserAdmin();

    const adminMenuItem = isAdmin ? `
        <a href="admin.html" class="admin-menu-item"><i class="fa-solid fa-gauge-high" style="color: #f59e0b;"></i> ระบบหลังบ้าน (Admin)</a>
    ` : '';

    navUserArea.innerHTML = `
        <div class="user-dropdown-wrapper">
            <div class="user-pill-btn" id="userPillBtn" title="เมนูโปรไฟล์">
                <div class="avatar-badge">${initial}</div>
                <span>${user.name || 'Nattakit'}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: #94a3b8; margin-left: 2px;"></i>
            </div>
            <div class="profile-dropdown-card" id="userProfileDropdown">
                <div class="dropdown-user-header">
                    <div class="dropdown-avatar-lg">${initial}</div>
                    <div class="dropdown-user-meta">
                        <strong>${user.name || 'Nattakit'}</strong>
                        <span>${user.email || 'nattakit@gmail.com'}</span>
                    </div>
                </div>
                <div class="dropdown-menu-list">
                    <a href="profile.html" class="${window.location.pathname.includes('profile.html') ? 'active-link' : ''}"><i class="fa-solid fa-user" style="color: #0284c7;"></i> โปรไฟล์ของฉัน</a>
                    <a href="favorites.html" class="${window.location.pathname.includes('favorites.html') ? 'active-link' : ''}"><i class="fa-solid fa-heart" style="color: #ef4444;"></i> รายการโปรด ( <span id="dropFavCount">${favorites.length}</span> )</a>
                    ${adminMenuItem}
                    <a href="javascript:void(0)" class="logout-action" onclick="logoutUser()"><i class="fa-solid fa-arrow-right-from-bracket"></i> ออกจากระบบ</a>
                </div>
            </div>
        </div>
    `;

    const mobileProfileLink = document.querySelector('.mobile-profile-link');
    const mobileAdminLink = document.querySelector('.mobile-admin-link');
    const mobileLoginLink = document.querySelector('.mobile-login-link');
    
    if (mobileProfileLink) mobileProfileLink.style.display = 'flex';
    if (mobileAdminLink) mobileAdminLink.style.display = isAdmin ? 'flex' : 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

    const pillBtn = document.getElementById('userPillBtn');
    const dropdown = document.getElementById('userProfileDropdown');

    if (pillBtn && dropdown) {
        pillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !pillBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

function logoutUser() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem('phatthalung_user');
        sessionStorage.removeItem('isAdminAuthed');
        showToast('ออกจากระบบเรียบร้อยแล้ว');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const btnLogin = document.getElementById('btnLogin');

    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>กำลังเข้าสู่ระบบ...</span>';
    }

    setTimeout(() => {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            if (password === ADMIN_PASSWORD) {
                const userData = {
                    name: "Nattakit",
                    email: ADMIN_EMAIL,
                    avatarInitial: "N",
                    isAdmin: true
                };
                localStorage.setItem('phatthalung_user', JSON.stringify(userData));
                sessionStorage.setItem('isAdminAuthed', 'true');
                showToast('เข้าสู่ระบบ Admin สำเร็จ!');
                setTimeout(() => window.location.href = 'index.html', 500);
                return;
            } else {
                showToast('รหัสผ่าน Admin ไม่ถูกต้อง (รหัสผ่านคือ 123456)', 'error');
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.innerHTML = '<span>เข้าสู่ระบบ</span> <i class="fa-solid fa-arrow-right"></i>';
                }
                return;
            }
        }

        if (email && password.length >= 6) {
            const userData = {
                name: email.split('@')[0],
                email: email,
                avatarInitial: (email.charAt(0) || 'U').toUpperCase(),
                isAdmin: false
            };
            localStorage.setItem('phatthalung_user', JSON.stringify(userData));
            sessionStorage.removeItem('isAdminAuthed');
            showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
            setTimeout(() => window.location.href = 'index.html', 500);
        } else {
            showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร)', 'error');
            if (btnLogin) {
                btnLogin.disabled = false;
                btnLogin.innerHTML = '<span>เข้าสู่ระบบ</span> <i class="fa-solid fa-arrow-right"></i>';
            }
        }
    }, 500);
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

    if (password.length < 6) {
        showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showToast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
        return;
    }

    const userData = {
        name: name,
        email: email,
        avatarInitial: (name.charAt(0) || 'N').toUpperCase(),
        isAdmin: false
    };
    localStorage.setItem('phatthalung_user', JSON.stringify(userData));
    showToast('สร้างบัญชีสำเร็จเรียบร้อย!');
    setTimeout(() => window.location.href = 'index.html', 600);
}

// ==================== Nature Sound Ambient Synthesizer ====================
let audioCtx = null;
let isNatureSoundPlaying = false;

function initNatureAmbianceToggle() {
    const soundToggle = document.getElementById('natureSoundToggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
        isNatureSoundPlaying = !isNatureSoundPlaying;
        const wave = document.getElementById('ambientWave');
        const statusText = document.getElementById('ambientStatusText');

        if (isNatureSoundPlaying) {
            if (wave) wave.style.display = 'inline-flex';
            if (statusText) statusText.innerText = 'กำลังเล่นเสียงธรรมชาติ (นกน้ำ/สายลม)';
            showToast('เปิดเสียงบรรยากาศธรรมชาติพัทลุง 🌿');
        } else {
            if (wave) wave.style.display = 'none';
            if (statusText) statusText.innerText = 'คลิกเพื่อฟังเสียงธรรมชาติ';
            showToast('ปิดเสียงบรรยากาศธรรมชาติ');
        }
    });
}

function initWeatherWidget() {
    const tempEl = document.getElementById('liveWeatherTemp');
    const descEl = document.getElementById('liveWeatherDesc');
    if (!tempEl) return;

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
        tempEl.innerText = '28°C';
        descEl.innerText = 'ทะเลน้อย: แดดอ่อน ทุ่งบัวแดงบานสดชื่น';
    } else if (hour >= 12 && hour < 17) {
        tempEl.innerText = '32°C';
        descEl.innerText = 'ล่องแก่งหนานมดแดง: ลมเย็น น้ำใส เหมาะแก่การเล่นน้ำ';
    } else {
        tempEl.innerText = '26°C';
        descEl.innerText = 'ควนนกเต้น: อากาศเย็นสบาย ลมภูเขาพัดเย็น';
    }
}

// ==================== Favorites Page & Toggle ====================
function toggleFavorite(id) {
    const place = PLACES.find(p => p.id === id);
    const placeName = place ? place.name : 'สถานที่';

    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        showToast(`นำ "${placeName}" ออกจากรายการโปรดแล้ว`, 'error');
    } else {
        favorites.push(id);
        showToast(`บันทึก "${placeName}" ในรายการโปรดแล้ว ❤️`);
    }

    localStorage.setItem('phatthalung_favs', JSON.stringify(favorites));
    renderNavUserDropdown();
    if (typeof filterPlaces === 'function') filterPlaces();
    if (document.getElementById('favoritesPageGrid')) filterFavoritesPage();
    if (document.getElementById('profileFavoritesGrid')) renderProfileFavorites();
}

function initFavoritesPage() {
    filterFavoritesPage();
}

function filterFavoritesPage() {
    const grid = document.getElementById('favoritesPageGrid');
    const totalEl = document.getElementById('favTotalCount');
    const searchInput = document.getElementById('searchFavInput');
    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let favPlaces = PLACES.filter(p => favorites.includes(p.id));

    if (query) {
        favPlaces = favPlaces.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.district.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    if (totalEl) totalEl.innerText = favorites.length;

    if (favPlaces.length === 0) {
        if (favorites.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                    <i class="fa-regular fa-heart" style="font-size: 3.5rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <h2 style="color: var(--text-primary); margin-bottom: 0.5rem;">ยังไม่มีสถานที่โปรดในรายการ</h2>
                    <p style="margin-bottom: 1.5rem;">คุณสามารถกดที่ไอคอนหัวใจบนการ์ดสถานที่ท่องเที่ยวเพื่อบันทึกไว้ดูย้อนหลังได้</p>
                    <a href="places.html" class="btn btn-glow"><i class="fa-solid fa-compass"></i> สำรวจสถานที่ท่องเที่ยว (30 แห่ง)</a>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                    <h3>ไม่พบสถานที่โปรดที่ตรงกับคำค้นหา</h3>
                    <p>ลองค้นหาด้วยชื่ออื่นดูนะครับ</p>
                </div>
            `;
        }
    } else {
        grid.innerHTML = favPlaces.map(place => createPlaceCardHTML(place)).join('');
    }
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        showToast('คุณยังไม่มีรายการโปรดที่บันทึกไว้', 'error');
        return;
    }
    if (confirm('คุณต้องการลบรายการโปรดทั้งหมดหรือไม่?')) {
        favorites = [];
        localStorage.setItem('phatthalung_favs', JSON.stringify(favorites));
        renderNavUserDropdown();
        filterFavoritesPage();
        if (document.getElementById('profileFavoritesGrid')) renderProfileFavorites();
        showToast('ล้างรายการโปรดทั้งหมดเรียบร้อยแล้ว');
    }
}

// ==================== Highlights & Directory ====================
function renderTopHighlights() {
    const grid = document.getElementById('topHighlightsGrid');
    if (!grid) return;

    const topRated = [...PLACES].sort((a, b) => b.rating - a.rating).slice(0, 6);
    grid.innerHTML = topRated.map(place => createPlaceCardHTML(place)).join('');
}

let currentCategory = 'all';

function setCategoryFilter(cat, element) {
    currentCategory = cat;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');
    filterPlaces();
}

function filterPlaces() {
    const grid = document.getElementById('placesGrid');
    const countEl = document.getElementById('placesCount');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'rating';

    let filtered = PLACES.filter(place => {
        const matchesCategory = (currentCategory === 'all' || place.category === currentCategory);
        const matchesQuery = !query || 
            place.name.toLowerCase().includes(query) || 
            place.district.toLowerCase().includes(query) ||
            place.description.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });

    if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    }

    if (countEl) countEl.innerText = filtered.length;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-compass-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>ไม่พบสถานที่ที่คุณค้นหา</h3>
                <p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะครับ</p>
            </div>
        `;
    } else {
        grid.innerHTML = filtered.map(place => createPlaceCardHTML(place)).join('');
    }
}

function createPlaceCardHTML(place) {
    const isFav = favorites.includes(place.id);
    return `
        <div class="place-card" onclick="openModal(${place.id})">
            <div class="place-card-img" style="background-image: url('${place.image}')">
                <span class="place-category-badge">${place.category_name}</span>
                <span class="place-rating-badge"><i class="fa-solid fa-star"></i> ${place.rating}</span>
            </div>
            <div class="place-card-body">
                <h3 class="place-title">${place.name}</h3>
                <p class="place-desc">${place.description}</p>
                <div class="place-card-footer">
                    <span class="place-district"><i class="fa-solid fa-location-dot"></i> อ.${place.district}</span>
                    <button class="btn-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${place.id})" title="ถูกใจ">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function openModal(id) {
    const place = PLACES.find(p => p.id === id);
    if (!place) return;

    const modal = document.getElementById('placeModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="modal-img" style="background-image: url('${place.image}')"></div>
        <div class="modal-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="place-category-badge">${place.category_name}</span>
                <span class="place-rating-badge"><i class="fa-solid fa-star"></i> ${place.rating} (${place.reviews} รีวิว)</span>
            </div>
            <h2>${place.name}</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.7;">${place.description}</p>
            
            <div class="modal-meta-grid">
                <div class="meta-item">
                    <strong><i class="fa-solid fa-clock"></i> ช่วงเวลาแนะนำ</strong>
                    <span>${place.best_time}</span>
                </div>
                <div class="meta-item">
                    <strong><i class="fa-solid fa-map-pin"></i> พิกัด GPS</strong>
                    <span>${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</span>
                </div>
                <div class="meta-item">
                    <strong><i class="fa-solid fa-city"></i> อำเภอ</strong>
                    <span>อ.${place.district} จ.พัทลุง</span>
                </div>
                <div class="meta-item">
                    <strong><i class="fa-solid fa-wand-magic-sparkles"></i> ไฮไลต์</strong>
                    <span style="color: var(--accent-light);">${place.highlight}</span>
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; flex-wrap: wrap;">
                <button onclick="copyGpsCoord(${place.lat}, ${place.lng})" class="btn btn-outline"><i class="fa-regular fa-copy"></i> คัดลอกพิกัด GPS</button>
                <button onclick="openSinglePlaceMap(${place.lat}, ${place.lng}, '${place.name}')" class="btn btn-glow"><i class="fa-solid fa-map-location-dot"></i> เปิด Map</button>
            </div>

            <!-- แผนที่นำทางเฉพาะสถานที่นี้ในเว็บ -->
            <div class="mt-4">
                <h4 style="font-size: 1.05rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-map text-accent"></i> แผนที่และการนำทางไปยังสถานที่นี้
                </h4>
                <div class="map-card-container" style="margin-bottom: 0;">
                    <div class="map-wrapper-relative" style="height: 280px;">
                        <div id="singlePlaceMap_${place.id}" style="width: 100%; height: 100%;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    initSingleModalMap(place.lat, place.lng, place.name, `singlePlaceMap_${place.id}`);
}

function copyGpsCoord(lat, lng) {
    navigator.clipboard.writeText(`${lat}, ${lng}`).then(() => {
        showToast('คัดลอกพิกัด GPS เรียบร้อยแล้ว!');
    });
}

function closeModal(event) {
    const modal = document.getElementById('placeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ==================== AI Planner & Real Road GPS Map Navigation ====================
let aiLeafletMap = null;
let aiMapMarkers = [];
let aiRoutePolyline = null;
let liveUserMarker = null;
let liveUserCircle = null;
let liveUserCoords = null; // พิกัดจริงปัจจุบันของผู้ใช้งาน
let currentPlannedStops = [];
let navSteps = [];
let isLiveNavigating = false;
let watchId = null;

const AI_ROUTES = {
    adventure: {
        title: "เส้นทางสายลุย ล่องแก่งหนานมดแดง & ป่าเขาบรรทัด",
        desc: "สำหรับสายลุย ผจญภัยล่องเรือคายัคสายน้ำใส ชมอ่างเก็บน้ำห้วยน้ำใส และสัมผัสธรรมชาติป่าเขาบรรทัด",
        tags: ["ล่องแก่ง", "ผจญภัย", "สายลุย", "ป่าเขาบรรทัด"],
        tips: "ควรเตรียมชุดสำรองสำหรับเปียกน้ำ ซองกันน้ำสำหรับโทรศัพท์ และสวมรองเท้าแตะรัดส้น",
        days: {
            1: [
                { time: "09:00 - 12:30 น.", title: "ล่องแก่งหนานมดแดง (เรือคายัค)", desc: "พิชิตสายน้ำความยาวกว่า 6 กิโลเมตร ผ่านเกาะแก่งระดับ 2-3 สนุกปลอดภัย", spot: "ลานข่อย อ.ป่าพะยอม", lat: 7.5385, lng: 99.8320 },
                { time: "13:00 - 14:30 น.", title: "ทานอาหารพื้นบ้านริมลำธาร", desc: "เติมพลังด้วยอาหารใต้รสเด็ด ไก่ทอดเกลือ และแกงส้มปักษ์ใต้", spot: "รีสอร์ทล่องแก่ง บ้านนาวง", lat: 7.5420, lng: 99.8355 },
                { time: "15:00 - 17:30 น.", title: "ชมวิวอ่างเก็บน้ำห้วยน้ำใส & เขาบรรทัด", desc: "ชมอ่างเก็บน้ำสวิตเซอร์แลนด์เมืองพัทลุง ท่ามกลางอ้อมกอดขุนเขา", spot: "อ่างเก็บน้ำห้วยน้ำใส", lat: 7.5510, lng: 99.8080 }
            ],
            2: [
                { time: "08:00 - 11:30 น.", title: "เดินป่าศึกษาธรรมชาติน้ำตกมโนราห์", desc: "สำรวจพรรณไม้หายากและเพลิดเพลินกับแอ่งน้ำใสสีมรกต", spot: "อ.เมือง / กงหรา", lat: 7.5120, lng: 99.9820 },
                { time: "13:00 - 15:30 น.", title: "ขึ้นบันไดพิชิตเขาอกทะลุ", desc: "ทดสอบกำลังขาเดินขึ้นบันไดกว่า 1,000 ขั้นสู่ยอดเขาอกทะลุ มองเห็นทั้งเมืองพัทลุง", spot: "เขาอกทะลุ", lat: 7.6189, lng: 100.0883 }
            ]
        }
    },
    nature: {
        title: "เส้นทางธรรมชาติและสายนทีเมืองลุง",
        desc: "เน้นการสัมผัสความบริสุทธิ์ของธรรมชาติ ทะเลสาบสงขลา-ทะเลน้อย และป่าเขาบรรทัด",
        tags: ["ธรรมชาติ 100%", "ชมบัวแดง", "น้ำตกเขาบรรทัด", "ถ่ายรูปสวย"],
        tips: "ควรตื่นเช้าเพื่อลงเรือชมยอยักษ์และทะเลน้อยช่วง 05:30 - 07:00 น. จะได้แสงที่สวยที่สุดและอากาศเย็นสบาย",
        days: {
            1: [
                { time: "05:45 - 08:30 น.", title: "ล่องเรือปากประ & ยอยักษ์รับอรุณ", desc: "ชมพระอาทิตย์ขึ้น ท่ามกลางวิถีประมงยอยักษ์โบราณ และล่องเรือชมทุ่งบัวแดงทะเลน้อย", spot: "คลองปากประ - ทะเลน้อย", lat: 7.7314, lng: 100.1447 },
                { time: "09:00 - 10:30 น.", title: "ถ่ายรูปบนสะพานเฉลิมพระเกียรติ 80 พรรษา", desc: "สะพานยาวข้ามทะเลสาบ จุดชมวิวนกน้ำและทุ่งหญ้ากว้างใหญ่", spot: "สะพานเอกชัย (80 พรรษา)", lat: 7.7490, lng: 100.1558 },
                { time: "11:30 - 13:00 น.", title: "ทานอาหารพื้นบ้าน เมนูปลาลูกเบร่", desc: "ลิ้มลองแกงส้มปักษ์ใต้ ปลาลูกเบร่ทอดกรอบใบมะกรูด และต้มส้มปลากด", spot: "ร้านอาหารริมทะเลน้อย", lat: 7.7786, lng: 100.1245 },
                { time: "13:30 - 15:30 น.", title: "ผ่อนคลายที่น้ำตกไพรวัลย์", desc: "น้ำตกขนาดใหญ่กลางป่าดิบชื้นเขาบรรทัด บรรยากาศร่มรื่น น้ำใสเย็นสบาย", spot: "อ.กงหรา", lat: 7.4125, lng: 99.9234 }
            ]
        }
    },
    chill: {
        title: "เส้นทางสายชิลล์ คาเฟ่สวย & พักผ่อนสบายๆ",
        desc: "เน้นการเดินทางสบายๆ ถ่ายรูปเช็คอินตามคาเฟ่บรรยากาศดี และจุดชมวิวสุดโรแมนติก",
        tags: ["คาเฟ่ฮิต", "ถ่ายรูปสวย", "พักผ่อนสบายๆ", "คู่รัก"],
        tips: "พกกล้องถ่ายรูปและเตรียมชุดโทนเอิร์ธโทนหรือสีขาว จะเข้ากับบรรยากาศทุ่งนาและคาเฟ่มากที่สุด",
        days: {
            1: [
                { time: "09:30 - 11:30 น.", title: "เช็คอินคาเฟ่กลางทุ่ง นาโปแก", desc: "จิบเครื่องดื่มเย็นๆ เดินบนสะพานไม้ทอดยาวกลางทุ่งนา", spot: "อ.ควนขนุน", lat: 7.7342, lng: 100.0098 },
                { time: "12:00 - 14:00 น.", title: "ทานมื้อเที่ยงที่หลาดใต้โหนด", desc: "สัมผัสตลาดพื้นบ้านชุมชน ชิมขนมพื้นเมืองใต้ร่มเงาต้นโตนด", spot: "อ.ควนขนุน", lat: 7.7654, lng: 99.9876 },
                { time: "17:00 - 18:30 น.", title: "Dinner วิวยอยักษ์ คลองปากประ", desc: "ทานอาหารค่ำริมทะเลสาบ มองดูยอยักษ์สะท้อนแสงอาทิตย์อัสดง", spot: "ปากประ รีสอร์ท", lat: 7.7314, lng: 100.1447 }
            ]
        }
    }
};

function generateAIRoute() {
    const styleEl = document.getElementById('tripStyle');
    const durationEl = document.getElementById('tripDuration');
    const companionEl = document.getElementById('tripCompanion');
    const vehicleEl = document.getElementById('tripVehicle');
    const btnAiGenerate = document.getElementById('btnAiGenerate');

    if (!styleEl || !durationEl) return;

    if (btnAiGenerate) {
        btnAiGenerate.disabled = true;
        btnAiGenerate.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>AI กำลังวิเคราะห์และค้นหาเส้นทางถนนจริง...</span>';
    }

    const style = styleEl.value;
    const duration = parseInt(durationEl.value);
    const companion = companionEl ? companionEl.value : 'friends';
    const vehicle = vehicleEl ? vehicleEl.value : 'car';

    const selectedPlan = AI_ROUTES[style] || AI_ROUTES.adventure;
    const resultArea = document.getElementById('aiResultArea');
    const titleEl = document.getElementById('resultTitle');
    const descEl = document.getElementById('resultDesc');
    const tagsEl = document.getElementById('resultTags');
    const timelineEl = document.getElementById('timelineContainer');
    const tipsEl = document.getElementById('aiTips');

    setTimeout(() => {
        if (resultArea) {
            titleEl.innerText = `${selectedPlan.title} (${duration} วัน)`;
            descEl.innerText = `${selectedPlan.desc}`;

            tagsEl.innerHTML = `
                <span class="tag-item"><i class="fa-regular fa-clock"></i> ${duration} วัน</span>
                <span class="tag-item"><i class="fa-solid fa-car"></i> ${vehicle === 'motorbike' ? 'รถจักรยานยนต์' : 'รถยนต์'}</span>
                ${selectedPlan.tags.map(t => `<span class="tag-item">${t}</span>`).join('')}
            `;

            let allStopsInOrder = [];
            let timelineHTML = '';

            for (let day = 1; day <= duration; day++) {
                timelineHTML += `<div class="timeline-day-title"><i class="fa-solid fa-calendar-day"></i> วันที่ ${day} ของการเดินทาง</div>`;
                const dayStops = selectedPlan.days[day] || selectedPlan.days[1];

                dayStops.forEach(stop => {
                    allStopsInOrder.push(stop);
                    timelineHTML += `
                        <div class="timeline-stop">
                            <div class="timeline-bullet"></div>
                            <div class="timeline-card-content">
                                <div class="stop-time"><i class="fa-regular fa-clock"></i> ${stop.time}</div>
                                <h4 class="stop-title">${stop.title}</h4>
                                <p class="stop-desc">${stop.desc}</p>
                                <div class="stop-location"><i class="fa-solid fa-location-dot"></i> พิกัด: ${stop.spot}</div>
                            </div>
                        </div>
                    `;
                });
            }

            currentPlannedStops = allStopsInOrder;
            timelineEl.innerHTML = timelineHTML;
            if (tipsEl) tipsEl.innerText = selectedPlan.tips;

            resultArea.style.display = 'block';
            renderAIItineraryMap(allStopsInOrder);
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToast('AI คำนวณเส้นทางถนนจริงสำเร็จเรียบร้อย! 🎉');
        }

        if (btnAiGenerate) {
            btnAiGenerate.disabled = false;
            btnAiGenerate.innerHTML = '<i class="fa-solid fa-microchip"></i> ให้ AI ประมวลผลและสร้างแผนการเดินทางทันที';
        }
    }, 500);
}

// วาดแผนที่และคำนวณเส้นทางถนนจริง (OSRM Real Road Routing)
async function renderAIItineraryMap(stops) {
    const mapContainer = document.getElementById('aiRouteMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (!aiLeafletMap) {
        aiLeafletMap = L.map('aiRouteMap', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([7.5450, 99.8250], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(aiLeafletMap);

        initLiveUserGeolocation();
    }

    // ล้าง Marker และ Polyline เดิม
    aiMapMarkers.forEach(m => aiLeafletMap.removeLayer(m));
    aiMapMarkers = [];
    if (aiRoutePolyline) {
        aiLeafletMap.removeLayer(aiRoutePolyline);
        aiRoutePolyline = null;
    }

    const stopCountEl = document.getElementById('aiStopCount');
    const distEl = document.getElementById('aiTotalDistance');
    if (stopCountEl) stopCountEl.innerText = `${stops.length} จุด`;

    // 1. ปักหมุดสถานที่ปลายทาง
    stops.forEach((stop, index) => {
        const orderNum = index + 1;
        const customPinIcon = L.divIcon({
            className: 'custom-div-pin',
            html: `<div class="custom-pin-marker pin-color-${(index % 5) + 1}">${orderNum}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customPinIcon }).addTo(aiLeafletMap);
        marker.bindPopup(`
            <div style="font-family: 'Prompt', sans-serif; min-width: 170px; padding: 2px;">
                <b style="color: #0284c7; font-size: 14px;">จุดที่ ${orderNum}: ${stop.title}</b><br>
                <small style="color: #64748b;">⏰ ${stop.time}</small><br>
                <div style="margin: 4px 0; color: #1e293b; font-size: 13px;">📍 ${stop.spot}</div>
                <button onclick="startNavFromCurrentLocation(${stop.lat}, ${stop.lng}, '${stop.title}')" class="btn-popup-nav"><i class="fa-solid fa-location-arrow"></i> นำทางจากจุดที่ฉันอยู่</button>
            </div>
        `);
        aiMapMarkers.push(marker);
    });

    // 2. คำนวณเส้นทางถนนจริง (OSRM)
    // ถ้ารู้ตำแหน่งคนอยู่ ให้คำนวณเส้นทางเริ่มจากคนอยู่ -> ไปจุดที่ 1 -> จุดที่ 2 ...
    let routingStops = [...stops];
    if (liveUserCoords) {
        routingStops.unshift({ lat: liveUserCoords.lat, lng: liveUserCoords.lng, title: "ตำแหน่งที่คุณอยู่" });
    }

    const waypoints = routingStops.map(s => `${s.lng},${s.lat}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=true`;

    try {
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const roadCoordinates = route.geometry.coordinates.map(c => [c[1], c[0]]);

            navSteps = [];
            route.legs.forEach(leg => {
                leg.steps.forEach(st => {
                    if (st.maneuver) {
                        navSteps.push({
                            instruction: st.maneuver.instruction || `มุ่งหน้าต่อไปตาม ${st.name || 'ถนนหลัก'}`,
                            distance: Math.round(st.distance),
                            location: [st.maneuver.location[1], st.maneuver.location[0]]
                        });
                    }
                });
            });

            aiRoutePolyline = L.polyline(roadCoordinates, {
                color: '#0284c7',
                weight: 5,
                opacity: 0.95,
                lineJoin: 'round'
            }).addTo(aiLeafletMap);

            aiLeafletMap.fitBounds(aiRoutePolyline.getBounds(), { padding: [50, 50] });

            const totalKm = (route.distance / 1000).toFixed(1);
            const totalMin = Math.round(route.duration / 60);
            if (distEl) distEl.innerText = `${totalKm} กม. (~${totalMin} นาที)`;

            renderNavigationHUD(route, stops);
        } else {
            throw new Error('Fallback polyline');
        }
    } catch (e) {
        console.warn('Routing fallback:', e);
        const fallbackCoords = routingStops.map(s => [s.lat, s.lng]);
        aiRoutePolyline = L.polyline(fallbackCoords, {
            color: '#10b981',
            weight: 4,
            opacity: 0.9,
            dashArray: '6, 8'
        }).addTo(aiLeafletMap);
        aiLeafletMap.fitBounds(aiRoutePolyline.getBounds(), { padding: [50, 50] });
    }

    setTimeout(() => aiLeafletMap.invalidateSize(), 300);
}

// แผงควบคุมระบบนำทางสด (HUD Interface)
function renderNavigationHUD(route, stops) {
    let hud = document.getElementById('mapNavHUD');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'mapNavHUD';
        hud.className = 'map-nav-hud';
        const mapWrapper = document.querySelector('.map-wrapper-relative');
        if (mapWrapper) mapWrapper.appendChild(hud);
    }

    const totalKm = (route.distance / 1000).toFixed(1);
    const totalMin = Math.round(route.duration / 60);

    hud.innerHTML = `
        <div class="nav-hud-card">
            <div class="nav-hud-header">
                <div class="hud-pulse-dot"></div>
                <strong>ระบบนำทางบนถนนจริง (Live GPS Navigation)</strong>
                <span class="hud-badge">${stops.length} จุดหมาย</span>
            </div>
            <div class="nav-hud-body">
                <div class="hud-stat-box">
                    <small>ระยะทางทั้งหมด</small>
                    <b>${totalKm} กม.</b>
                </div>
                <div class="hud-stat-box">
                    <small>เวลาโดยประมาณ</small>
                    <b>${totalMin} นาที</b>
                </div>
                <div class="hud-stat-box">
                    <small>สถานะ GPS</small>
                    <b style="color: #34d399;" id="hudGpsStatus"><i class="fa-solid fa-satellite-dish"></i> พร้อมเชื่อมต่อ</b>
                </div>
            </div>
            <div class="nav-hud-actions">
                <button onclick="toggleRealLiveNav()" class="btn-hud-action btn-hud-start" id="btnLiveNav">
                    <i class="fa-solid fa-location-arrow"></i> เริ่มนำทางตามตำแหน่งจริง
                </button>
                <button onclick="toggleStepListModal()" class="btn-hud-action btn-hud-list">
                    <i class="fa-solid fa-list-ol"></i> ดูวิธีเลี้ยว (${navSteps.length} ขั้นตอน)
                </button>
            </div>
            <div id="liveStepAlert" class="live-step-alert" style="display: none;">
                <i class="fa-solid fa-diamond-turn-right step-icon"></i>
                <div class="step-text">
                    <strong id="hudStepText">กำลังติดตามตำแหน่ง GPS จริงของคุณ...</strong>
                    <small id="hudStepDist">ขับเคลื่อนตามเส้นทางสีฟ้าบนถนนจริง</small>
                </div>
            </div>
        </div>
    `;
}

// ติดตามตำแหน่ง GPS จริงของคนใช้ (Live GPS Real-Time Watch)
function initLiveUserGeolocation() {
    if (!navigator.geolocation || !aiLeafletMap) return;

    const userBeaconIcon = L.divIcon({
        className: 'custom-gps-icon',
        html: `<div class="user-real-beacon" title="คุณอยู่ที่นี่"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            liveUserCoords = { lat, lng };

            if (!liveUserMarker) {
                liveUserMarker = L.marker([lat, lng], { icon: userBeaconIcon, zIndexOffset: 999 }).addTo(aiLeafletMap)
                    .bindPopup('<b>📍 คุณอยู่ที่นี่ (ตำแหน่งจริง)</b>');
            } else {
                liveUserMarker.setLatLng([lat, lng]);
            }
        },
        err => console.log('Location pending or permission denied: ', err),
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// เริ่มเปิดโหมดนำทางสดตามตำแหน่ง GPS จริง
function toggleRealLiveNav() {
    const btn = document.getElementById('btnLiveNav');
    const alertBox = document.getElementById('liveStepAlert');
    const statusEl = document.getElementById('hudGpsStatus');
    const stepText = document.getElementById('hudStepText');
    const stepDist = document.getElementById('hudStepDist');

    if (isLiveNavigating) {
        isLiveNavigating = false;
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (btn) btn.innerHTML = '<i class="fa-solid fa-location-arrow"></i> เริ่มนำทางตามตำแหน่งจริง';
        if (alertBox) alertBox.style.display = 'none';
        if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> พร้อมเชื่อมต่อ';
        showToast('ปิดโหมดนำทางสด');
        return;
    }

    if (!navigator.geolocation) {
        showToast('อุปกรณ์ของคุณไม่รองรับระบบ GPS Geolocation', 'error');
        return;
    }

    isLiveNavigating = true;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> สิ้นสุดการนำทาง';
    if (alertBox) alertBox.style.display = 'flex';
    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-accent"></i> นำทางสด...';
    showToast('เริ่มระบบนำทาง GPS จริงบนถนนพัทลุง 📍🚗');

    const userBeaconIcon = L.divIcon({
        className: 'custom-gps-icon',
        html: `<div class="user-real-beacon"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    watchId = navigator.geolocation.watchPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            liveUserCoords = { lat, lng };

            if (!liveUserMarker) {
                liveUserMarker = L.marker([lat, lng], { icon: userBeaconIcon, zIndexOffset: 999 }).addTo(aiLeafletMap);
            } else {
                liveUserMarker.setLatLng([lat, lng]);
            }

            // ขยับแผนที่ตามคนเดิน/ขับรถจริง
            aiLeafletMap.panTo([lat, lng], { animate: true, duration: 0.8 });

            // ค้นหาขั้นตอนการเลี้ยวที่ใกล้ตำแหน่งคนมากที่สุด
            if (navSteps.length > 0) {
                let nearestStep = navSteps[0];
                let minDist = 999999;
                navSteps.forEach(st => {
                    const d = getDistanceFromLatLonInM(lat, lng, st.location[0], st.location[1]);
                    if (d < minDist) {
                        minDist = d;
                        nearestStep = st;
                    }
                });

                if (stepText && nearestStep) {
                    stepText.innerText = nearestStep.instruction;
                    stepDist.innerText = `ระยะทางข้างหน้าประมาณ ${Math.round(minDist)} เมตร`;
                }
            }
        },
        error => {
            showToast('กรุณากด "อนุญาตเข้าถึงตำแหน่ง (Allow Location)" เพื่อนำทางสด', 'error');
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
}

// นำทางจากจุดที่อยู่ปัจจุบันตรงไปยังสถานที่ปลายทางเดี่ยว
function startNavFromCurrentLocation(destLat, destLng, destTitle) {
    if (!navigator.geolocation) {
        showToast('อุปกรณ์ไม่รองรับ GPS', 'error');
        return;
    }

    showToast(`กำลังคำนวณเส้นทางจากจุดที่คุณอยู่ ไปยัง "${destTitle}"...`);

    navigator.geolocation.getCurrentPosition(
        async pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            liveUserCoords = { lat, lng };

            const singleStop = [{ lat: destLat, lng: destLng, title: destTitle, spot: destTitle, time: "เป้าหมาย" }];
            await renderAIItineraryMap(singleStop);
            toggleRealLiveNav();
        },
        () => {
            showToast('กรุณากดอนุญาตสิทธิ์ตำแหน่ง GPS เพื่อใช้นำทาง', 'error');
        },
        { enableHighAccuracy: true }
    );
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function locateUserPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const userLatLng = [pos.coords.latitude, pos.coords.longitude];
                liveUserCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                aiLeafletMap.flyTo(userLatLng, 15, { duration: 1.2 });
                if (liveUserMarker) {
                    liveUserMarker.setLatLng(userLatLng);
                    liveUserMarker.openPopup();
                } else {
                    liveUserMarker = L.marker(userLatLng).addTo(aiLeafletMap).bindPopup('<b>📍 คุณอยู่ที่นี่</b>').openPopup();
                }
                showToast('โฟกัสที่ตำแหน่งปัจจุบันของคุณแล้ว 📍');
            },
            () => showToast('กรุณากด "อนุญาตการเข้าถึงตำแหน่ง (Allow Location)" บนเบราว์เซอร์', 'error')
        );
    }
}

function resetAiMapView() {
    if (aiRoutePolyline && aiLeafletMap) {
        aiLeafletMap.fitBounds(aiRoutePolyline.getBounds(), { padding: [50, 50] });
    }
}

function toggleStepListModal() {
    if (!navSteps || navSteps.length === 0) {
        showToast('กำลังโหลดข้อมูลขั้นตอนการนำทาง...');
        return;
    }

    let modal = document.getElementById('navStepsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'navStepsModal';
        modal.className = 'modal-backdrop';
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-box" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="document.getElementById('navStepsModal').classList.remove('active')">&times;</button>
            <div class="modal-body">
                <h2><i class="fa-solid fa-route text-accent"></i> รายละเอียดเส้นทางนำทาง (${navSteps.length} ขั้นตอน)</h2>
                <p style="color: var(--text-sub); margin-bottom: 1.5rem;">ระบบนำทางอัจฉริยะบนถนนพัทลุงจริง</p>
                <div class="turn-steps-list">
                    ${navSteps.map((st, i) => `
                        <div class="turn-step-row" onclick="focusStepLocation(${st.location[0]}, ${st.location[1]})">
                            <div class="step-num">${i + 1}</div>
                            <div class="step-detail">
                                <strong>${st.instruction}</strong>
                                <small><i class="fa-solid fa-road"></i> ระยะทาง: ${st.distance} เมตร</small>
                            </div>
                            <i class="fa-solid fa-angle-right" style="color: #64748b;"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function focusStepLocation(lat, lng) {
    if (aiLeafletMap) {
        document.getElementById('navStepsModal').classList.remove('active');
        aiLeafletMap.flyTo([lat, lng], 16, { duration: 1 });
    }
}

function loadPreset(style, duration) {
    const styleEl = document.getElementById('tripStyle');
    const durationEl = document.getElementById('tripDuration');
    if (styleEl && durationEl) {
        styleEl.value = style;
        durationEl.value = duration.toString();
        generateAIRoute();
    }
}

// ==================== Profile Page & Back Office Tab ====================
function initProfilePage() {
    const editForm = document.getElementById('editProfileForm');
    if (!editForm) return;

    const userJson = localStorage.getItem('phatthalung_user');
    let user = {};
    try {
        user = JSON.parse(userJson) || {};
    } catch(e) {
        user = {};
    }

    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileDisplayEmail');
    const avatarEl = document.getElementById('profileAvatarLarge');
    const inputName = document.getElementById('profInputName');
    const inputEmail = document.getElementById('profInputEmail');
    const favCountEl = document.getElementById('profFavCount');
    const adminBtn = document.getElementById('profileAdminBtn');

    const initial = (user.name || user.email || 'N').charAt(0).toUpperCase();
    const isAdmin = isCurrentUserAdmin();

    if (nameEl) nameEl.innerText = user.name || (isAdmin ? 'Nattakit' : 'ผู้ใช้งาน');
    if (emailEl) emailEl.innerText = user.email || 'nattakit@gmail.com';
    if (avatarEl) avatarEl.innerText = initial;
    if (inputName) inputName.value = user.name || (isAdmin ? 'Nattakit' : '');
    if (inputEmail) inputEmail.value = user.email || '';
    if (favCountEl) favCountEl.innerText = favorites.length;

    if (adminBtn) adminBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    renderProfileFavorites();
}

function handleProfileUpdate(event) {
    event.preventDefault();
    const userJson = localStorage.getItem('phatthalung_user');
    let user = {};
    try {
        user = JSON.parse(userJson) || {};
    } catch(e) {
        user = {};
    }

    user.name = document.getElementById('profInputName').value.trim();
    user.email = document.getElementById('profInputEmail').value.trim();
    user.avatarInitial = (user.name.charAt(0) || 'N').toUpperCase();

    localStorage.setItem('phatthalung_user', JSON.stringify(user));
    renderNavUserDropdown();
    initProfilePage();
    showToast('อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
}

function renderProfileFavorites() {
    const grid = document.getElementById('profileFavoritesGrid');
    if (!grid) return;

    const favPlaces = PLACES.filter(p => favorites.includes(p.id));
    if (favPlaces.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">ยังไม่มีสถานที่โปรด</div>`;
    } else {
        grid.innerHTML = favPlaces.map(place => createPlaceCardHTML(place)).join('');
    }
}

// ==================== Admin Gate & Management Tabs ====================
function initAdminGate() {
    const authModal = document.getElementById('adminAuthModal');
    const dashboard = document.getElementById('adminDashboard');
    if (!authModal || !dashboard) return;

    const isAdmin = isCurrentUserAdmin();
    const isSessionAuthed = sessionStorage.getItem('isAdminAuthed') === 'true';

    if (isAdmin && isSessionAuthed) {
        authModal.style.display = 'none';
        dashboard.style.display = 'flex';
        updateAdminDashboardStats();
    } else {
        authModal.style.display = 'flex';
        dashboard.style.display = 'none';
    }
}

function handleAdminAuth(event) {
    event.preventDefault();
    const input = document.getElementById('adminPassInput');
    if (!input) return;

    if (input.value.trim() === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminAuthed', 'true');
        const userJson = localStorage.getItem('phatthalung_user');
        let user = userJson ? JSON.parse(userJson) : {};
        user.email = ADMIN_EMAIL;
        user.name = "Nattakit";
        user.isAdmin = true;
        localStorage.setItem('phatthalung_user', JSON.stringify(user));

        document.getElementById('adminAuthModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        updateAdminDashboardStats();
        renderNavUserDropdown();
        showToast('ยืนยันรหัสผ่าน Admin สำเร็จ!');
    } else {
        showToast('รหัสผ่านแอดมินไม่ถูกต้อง!', 'error');
        input.value = '';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminAuthed');
    showToast('ออกจากระบบหลังบ้านเรียบร้อยแล้ว');
    setTimeout(() => window.location.href = 'index.html', 400);
}

function switchAdminTab(tabName) {
    const secDash = document.getElementById('admin-sec-dash');
    const secPlaces = document.getElementById('admin-sec-places');
    const secUsers = document.getElementById('admin-sec-users');

    const btnDash = document.getElementById('tab-btn-dash');
    const btnPlaces = document.getElementById('tab-btn-places');
    const btnUsers = document.getElementById('tab-btn-users');

    if (!secDash || !secPlaces || !secUsers) return;

    secDash.style.display = 'none';
    secPlaces.style.display = 'none';
    secUsers.style.display = 'none';

    if (btnDash) btnDash.classList.remove('active');
    if (btnPlaces) btnPlaces.classList.remove('active');
    if (btnUsers) btnUsers.classList.remove('active');

    if (tabName === 'places') {
        secPlaces.style.display = 'block';
        if (btnPlaces) btnPlaces.classList.add('active');
        renderAdminPlacesTable();
    } else if (tabName === 'users') {
        secUsers.style.display = 'block';
        if (btnUsers) btnUsers.classList.add('active');
        renderAdminUsersTable();
    } else {
        secDash.style.display = 'block';
        if (btnDash) btnDash.classList.add('active');
        updateAdminDashboardStats();
    }
}

function updateAdminDashboardStats() {
    const totalEl = document.getElementById('dashTotalPlaces');
    const sideCountEl = document.getElementById('sidePlaceCount');
    const favCountEl = document.getElementById('dashTotalFavs');
    const userCountEl = document.getElementById('dashTotalUsers');
    const sideUserCountEl = document.getElementById('sideUserCount');

    if (totalEl) totalEl.innerText = `${PLACES.length}`;
    if (sideCountEl) sideCountEl.innerText = `${PLACES.length}`;
    if (favCountEl) favCountEl.innerText = `${favorites.length || 1}`;
    if (userCountEl) userCountEl.innerText = '2';
    if (sideUserCountEl) sideUserCountEl.innerText = '2';

    renderAdminDashboardWidgets();
}

function renderAdminDashboardWidgets() {
    const catList = document.getElementById('dashCategoryList');
    if (catList) {
        const catCounts = { nature: 0, culture: 0, adventure: 0, food: 0, family: 0 };
        PLACES.forEach(p => {
            if (catCounts[p.category] !== undefined) catCounts[p.category]++;
        });

        const total = PLACES.length || 1;
        catList.innerHTML = `
            <li>
                <span class="cat-label"><i class="fa-solid fa-leaf"></i> ธรรมชาติ</span>
                <div class="bar-track"><div class="bar-progress" style="width: ${(catCounts.nature/total)*100}%;"></div></div>
                <b>${catCounts.nature}</b>
            </li>
            <li>
                <span class="cat-label"><i class="fa-solid fa-landmark"></i> วัฒนธรรม</span>
                <div class="bar-track"><div class="bar-progress" style="width: ${(catCounts.culture/total)*100}%;"></div></div>
                <b>${catCounts.culture}</b>
            </li>
            <li>
                <span class="cat-label"><i class="fa-solid fa-person-hiking"></i> ผจญภัย</span>
                <div class="bar-track"><div class="bar-progress" style="width: ${(catCounts.adventure/total)*100}%;"></div></div>
                <b>${catCounts.adventure}</b>
            </li>
            <li>
                <span class="cat-label"><i class="fa-solid fa-utensils"></i> อาหาร</span>
                <div class="bar-track"><div class="bar-progress" style="width: ${(catCounts.food/total)*100}%;"></div></div>
                <b>${catCounts.food}</b>
            </li>
            <li>
                <span class="cat-label"><i class="fa-solid fa-people-roof"></i> ครอบครัว</span>
                <div class="bar-track"><div class="bar-progress" style="width: ${(catCounts.family/total)*100}%;"></div></div>
                <b>${catCounts.family}</b>
            </li>
        `;
    }

    const rankList = document.getElementById('dashTopRankingList');
    if (rankList) {
        const top5 = [...PLACES].sort((a, b) => b.rating - a.rating).slice(0, 5);
        rankList.innerHTML = top5.map((p, idx) => `
            <li>
                <span class="rank-num">${idx + 1}</span>
                <img src="${p.image}" alt="${p.name}">
                <div class="rank-info">
                    <h4>${p.name}</h4>
                    <p>อ.${p.district} จ.พัทลุง</p>
                </div>
                <span class="score-pill"><i class="fa-solid fa-star"></i> ${p.rating}</span>
            </li>
        `).join('');
    }

    const memberBox = document.getElementById('dashLatestMemberBox');
    if (memberBox) {
        memberBox.innerHTML = `
            <div class="member-badge-chip">
                <div class="member-avatar-box">N</div>
                <div class="member-details">
                    <strong>Nattakit</strong>
                    <small>nattakit@gmail.com · ผู้ดูแลระบบสูงสุด</small>
                </div>
            </div>
        `;
    }
}

function renderAdminPlacesTable() {
    const tbody = document.getElementById('adminPlacesTableBody');
    const searchInput = document.getElementById('adminPlaceSearch');
    const catSelect = document.getElementById('adminPlaceCatFilter');
    if (!tbody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCat = catSelect ? catSelect.value : 'all';

    let filtered = PLACES.filter(p => {
        const matchCat = (selectedCat === 'all' || p.category === selectedCat);
        const matchQuery = !query || p.name.toLowerCase().includes(query) || p.district.toLowerCase().includes(query);
        return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">ไม่พบสถานที่ท่องเที่ยวที่ค้นหา</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.image}" class="table-thumb" alt="${p.name}"></td>
            <td><strong>${p.name}</strong><br><small style="color: #64748b;">${p.highlight || ''}</small></td>
            <td>อ.${p.district}</td>
            <td><span class="place-category-badge" style="background: #e2e8f0; color: #0f172a;">${p.category_name || p.category}</span></td>
            <td><b style="color: #f59e0b;"><i class="fa-solid fa-star"></i> ${p.rating}</b></td>
            <td><small style="color: #64748b;">${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</small></td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn-action-icon" onclick="editPlace(${p.id})" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deletePlace(${p.id})" title="ลบ"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td><div class="avatar-badge" style="background: #f59e0b;">N</div></td>
            <td><strong>Nattakit</strong></td>
            <td>nattakit@gmail.com</td>
            <td><span class="badge-role-admin"><i class="fa-solid fa-shield"></i> ผู้ดูแลระบบ (Admin)</span></td>
            <td>20 ส.ค. 2569</td>
        </tr>
        <tr>
            <td><div class="avatar-badge" style="background: #10b981;">L</div></td>
            <td><strong>Loka</strong></td>
            <td>nattakitsenchoo@gmail.com</td>
            <td><span class="badge-role-user"><i class="fa-solid fa-user"></i> สมาชิกทั่วไป</span></td>
            <td>15 ส.ค. 2569</td>
        </tr>
    `;
}

function openPlaceModal() {
    const modal = document.getElementById('place-crud-modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('place-crud-form').reset();
        document.getElementById('modal-place-id').value = '';
        document.getElementById('modal-crud-title').innerHTML = '<i class="fa-solid fa-pen-to-square text-accent"></i> เพิ่มสถานที่ใหม่ (บันทึกลง Firebase)';
    }
}

function closePlaceModal(event) {
    const modal = document.getElementById('place-crud-modal');
    if (modal) modal.classList.remove('active');
}

function editPlace(id) {
    const place = PLACES.find(p => p.id === id);
    if (!place) return;

    openPlaceModal();
    document.getElementById('modal-crud-title').innerHTML = '<i class="fa-solid fa-pen-to-square text-accent"></i> แก้ไขข้อมูลสถานที่';
    document.getElementById('modal-place-id').value = place.id;
    document.getElementById('modal-place-name').value = place.name;
    document.getElementById('modal-place-district').value = place.district;
    document.getElementById('modal-place-category').value = place.category;
    document.getElementById('modal-place-lat').value = place.lat;
    document.getElementById('modal-place-lng').value = place.lng;
    document.getElementById('modal-place-rating').value = place.rating;
    document.getElementById('modal-place-image').value = place.image;
    document.getElementById('modal-place-desc').value = place.description;
    document.getElementById('modal-place-highlight').value = place.highlight;
}

function deletePlace(id) {
    const place = PLACES.find(p => p.id === id);
    if (!place) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่ "${place.name}" ออกจากระบบ?`)) {
        PLACES = PLACES.filter(p => p.id !== id);
        savePlacesToStorage();
        updateAdminDashboardStats();
        renderAdminPlacesTable();
        showToast(`ลบสถานที่ "${place.name}" เรียบร้อยแล้ว`);
    }
}

function handlePlaceSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-place-id').value;
    const cat = document.getElementById('modal-place-category').value;
    const catMap = {
        nature: 'ธรรมชาติ',
        adventure: 'ผจญภัย',
        culture: 'วัฒนธรรม',
        food: 'อาหาร',
        family: 'ครอบครัว'
    };

    const placeData = {
        name: document.getElementById('modal-place-name').value.trim(),
        district: document.getElementById('modal-place-district').value.trim(),
        category: cat,
        category_name: catMap[cat] || cat,
        lat: parseFloat(document.getElementById('modal-place-lat').value),
        lng: parseFloat(document.getElementById('modal-place-lng').value),
        rating: parseFloat(document.getElementById('modal-place-rating').value),
        reviews: 100,
        image: document.getElementById('modal-place-image').value.trim(),
        description: document.getElementById('modal-place-desc').value.trim(),
        highlight: document.getElementById('modal-place-highlight').value.trim(),
        best_time: "ตลอดทั้งปี"
    };

    if (id) {
        const index = PLACES.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            PLACES[index] = { ...PLACES[index], ...placeData };
        }
    } else {
        const newId = PLACES.length > 0 ? Math.max(...PLACES.map(p => p.id)) + 1 : 1;
        PLACES.unshift({ id: newId, ...placeData });
    }

    savePlacesToStorage();
    closePlaceModal();
    updateAdminDashboardStats();
    renderAdminPlacesTable();
    showToast('บันทึกข้อมูลและซิงค์ขึ้น Firebase สำเร็จ!');
}

function resetDefaultData() {
    if (confirm('ต้องการคืนค่าฐานข้อมูลสถานที่เริ่มต้น (30 แห่ง) หรือไม่?')) {
        PLACES = INITIAL_PLACES_DATA;
        savePlacesToStorage();
        updateAdminDashboardStats();
        renderAdminPlacesTable();
        showToast('คืนค่าฐานข้อมูลเรียบร้อยแล้ว!');
    }
}


// เปิด Map นำทางแบบสถานที่เดี่ยวในเว็บทันที
function openSinglePlaceMap(lat, lng, name) {
    closeModal();
    // เปิดไปที่หน้า navigation.html เพื่อแสดงแผนที่นำทางเดี่ยวแบบเต็มจอ
    window.location.href = `navigation.html?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`;
}

// โหลดแผนที่เดี่ยวใน Modal ทันทีที่เปิด
function initSingleModalMap(lat, lng, name, elementId) {
    setTimeout(() => {
        const container = document.getElementById(elementId);
        if (!container) return;
        const sMap = L.map(elementId, { zoomControl: false }).setView([lat, lng], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(sMap);
        L.marker([lat, lng]).addTo(sMap).bindPopup(`<b>${name}</b>`).openPopup();
        sMap.invalidateSize();
    }, 300);
}


// Auto-detect URL query params for direct single place navigation on ai.html
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const name = urlParams.get('name');

    if (lat && lng && name) {
        const decodedName = decodeURIComponent(name);
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        const resultArea = document.getElementById('aiResultArea');
        const titleEl = document.getElementById('resultTitle');
        const descEl = document.getElementById('resultDesc');
        const tagsEl = document.getElementById('resultTags');

        if (resultArea) {
            titleEl.innerText = `เส้นทางนำทางด่วน: ${decodedName}`;
            descEl.innerText = `ระบบกำลังเชื่อมต่อ GPS จริงเพื่อนำทางคุณไปยัง "${decodedName}" บนถนนจริง`;
            tagsEl.innerHTML = `<span class="tag-item"><i class="fa-solid fa-location-dot"></i> นำทางจุดเดียว</span>`;

            resultArea.style.display = 'block';
            
            const singleStop = [{ lat: latNum, lng: lngNum, title: decodedName, spot: decodedName, time: "เป้าหมาย" }];
            
            // รอให้ Leaflet โหลดแล้วเริ่มนำทางทันที
            setTimeout(() => {
                renderAIItineraryMap(singleStop);
                resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast(`เปิดโหมดนำทางไปยัง "${decodedName}" เรียบร้อยแล้ว`);
                
                // เปิดโหมด Live Nav ทันทีอัตโนมัติ
                setTimeout(() => {
                    if (typeof toggleRealLiveNav === 'function') {
                        toggleRealLiveNav();
                    }
                }, 1000);
            }, 600);
        }
    }
});


let dedicatedMap = null;
let dedicatedPolyline = null;
let dedicatedUserMarker = null;

async function initDedicatedNavigationPage() {
    const mapEl = document.getElementById('dedicatedNavMap');
    if (!mapEl || typeof L === 'undefined') return;

    dedicatedMap = L.map('dedicatedNavMap', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([7.5450, 99.8250], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(dedicatedMap);

    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const name = urlParams.get('name');

    if (lat && lng && name) {
        const decodedName = decodeURIComponent(name);
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        document.getElementById('navPageTitle').innerText = `นำทางไป: ${decodedName}`;
        
        // ปักหมุดปลายทาง
        L.marker([latNum, lngNum]).addTo(dedicatedMap)
            .bindPopup(`<b>${decodedName}</b>`).openPopup();

        // ดึงพิกัดจริงผู้ใช้ แล้วคำนวณเส้นทางถนนจริง (OSRM)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async pos => {
                const uLat = pos.coords.latitude;
                const uLng = pos.coords.longitude;

                // วางหมุดตำแหน่งคน
                const userIcon = L.divIcon({
                    className: 'custom-gps-icon',
                    html: `<div class="user-real-beacon"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });
                dedicatedUserMarker = L.marker([uLat, uLng], { icon: userIcon }).addTo(dedicatedMap)
                    .bindPopup('<b>📍 คุณอยู่ที่นี่</b>');

                // ขอเส้นทางถนนจริงจาก OSRM
                const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${lngNum},${latNum}?overview=full&geometries=geojson&steps=true`;
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

                        dedicatedPolyline = L.polyline(coords, { color: '#0284c7', weight: 6 }).addTo(dedicatedMap);
                        dedicatedMap.fitBounds(dedicatedPolyline.getBounds(), { padding: [60, 60] });

                        const km = (route.distance / 1000).toFixed(1);
                        const mins = Math.round(route.duration / 60);

                        // แสดง HUD มือถือ
                        const hudOverlay = document.getElementById('mobileNavHudOverlay');
                        if (hudOverlay) hudOverlay.classList.add('active');
                        document.getElementById('mobileHudInstruction').innerText = `มุ่งหน้าสู่ ${decodedName} (${km} กม.)`;
                        document.getElementById('hudDistVal').innerText = `${km} กม.`;
                        document.getElementById('hudTimeVal').innerText = `${mins} นาที`;
                        
                        navSteps = route.legs[0].steps.map(s => ({
                            instruction: s.maneuver.instruction || 'ขับต่อไปตามถนนหลัก',
                            distance: Math.round(s.distance),
                            location: [s.maneuver.location[1], s.maneuver.location[0]]
                        }));
                    }
                } catch(e) {
                    console.warn(e);
                }
            });
        }
    }
}
