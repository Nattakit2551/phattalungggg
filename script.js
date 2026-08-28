
// อัปเดตพิกัดเก่าที่แคชไว้ในเครื่องให้เป็นพิกัดจริงล่าสุด (ทำครั้งเดียวต่อเวอร์ชัน)
const DB_SCHEMA_VERSION = '2026.2';

(function migrateLocalCache() {
    const cachedTrip = localStorage.getItem('phatthalung_ai_trip');
    if (cachedTrip) {
        try {
            let trip = JSON.parse(cachedTrip);
            if (Array.isArray(trip)) {
                trip = trip.map(t => {
                    if (t && t.title && t.title.includes('เขาอกทะลุ')) {
                        t.lat = 7.6250;
                        t.lng = 100.0917;
                    }
                    return t;
                });
                localStorage.setItem('phatthalung_ai_trip', JSON.stringify(trip));
            }
        } catch (e) {
            localStorage.removeItem('phatthalung_ai_trip');
        }
    }

    // รีเซ็ตฐานข้อมูลเฉพาะตอนที่โครงสร้างข้อมูลเปลี่ยนเวอร์ชันเท่านั้น
    // (ของเดิมลบทิ้งทุกครั้งที่โหลดหน้า ทำให้ข้อมูลที่แอดมินเพิ่ม/แก้ไขหายหมด)
    if (localStorage.getItem('phatthalung_db_version') !== DB_SCHEMA_VERSION) {
        localStorage.removeItem('phatthalung_places_db');
        localStorage.setItem('phatthalung_db_version', DB_SCHEMA_VERSION);
    }
})();

// ==========================================================================
// Phatthalung AI Travel Platform - Engine & Features (Version 2026)
// ==========================================================================

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
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        auth = firebase.auth();
    }
} catch (e) {
    console.warn("Firebase note:", e);
}

const ADMIN_EMAIL = "nattakit@gmail.com";
const ADMIN_PASSWORD = "123456";

function isCurrentUserAdmin() {
    const userJson = localStorage.getItem('phatthalung_user');
    if (!userJson) return false;
    try {
        const user = JSON.parse(userJson);
        return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    } catch(e) { return false; }
}

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

const INITIAL_PLACES_DATA = [
  {
    "id": 1,
    "name": "ทะเลน้อย & ทุ่งบัวแดง",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.7767,
    "lng": 100.1238,
    "rating": 4.4,
    "reviews": 1637,
    "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    "description": "พื้นที่ชุ่มน้ำโลก (Ramsar Site) แห่งแรกของประเทศไทย และเป็นเขตห้ามล่าสัตว์ป่าแห่งแรกของไทย ผืนน้ำกว้างใหญ่เต็มไปด้วยดอกบัวสายสีชมพูบานสะพรั่ง เป็นแหล่งอาศัยของนกน้ำประจำถิ่นและนกอพยพนับร้อยชนิด จุดเด่นที่หาชมได้ยากคือฝูงควายน้ำที่ว่ายน้ำเล็มหญ้าใต้ผิวน้ำอย่างเป็นธรรมชาติ",
    "highlight": "ล่องเรือชมทุ่งบัวสาย ฝูงควายน้ำ และนกน้ำนานาพันธุ์ยามเช้า",
    "best_time": "ช่วงเช้า 06:00 - 09:00 น. (ดอกบัวบานสวยที่สุดช่วง ก.พ. - พ.ค.)",
    "fee": "ค่าเรือนำเที่ยว 500 - 800 บาท / ลำ (นั่งได้ 6-8 ท่าน) แล้วแต่ระยะเวลา 1-2 ชม.",
    "facilities": "ศูนย์บริการนักท่องเที่ยว, ท่าเรือ, หอชมนก, ร้านอาหาร, ห้องน้ำ, ลานจอดรถ",
    "hours": "05:00 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 2,
    "name": "คลองปากประ & ยอยักษ์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.7289,
    "lng": 100.1429,
    "rating": 4.4,
    "reviews": 65,
    "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "description": "ปากคลองที่ไหลลงสู่ทะเลสาบสงขลา เป็นจุดชมพระอาทิตย์ขึ้นที่ขึ้นชื่อที่สุดของภาคใต้ ภาพเงาดำของ 'ยอยักษ์' ซึ่งเป็นเครื่องมือจับปลาพื้นบ้านขนาดใหญ่ตัดกับแสงอาทิตย์สีทองสะท้อนผิวน้ำคือภาพจำของพัทลุง มีบริการเรือหางยาวออกจากท่าตั้งแต่ก่อนฟ้าสาง",
    "highlight": "ถ่ายภาพยอยักษ์รับแสงแรกของวัน และล่องเรือชมวิถีประมงพื้นบ้าน",
    "best_time": "05:30 - 07:30 น. (ควรถึงท่าเรือก่อน 05:30 น.)",
    "fee": "ค่าเหมาเรือล่องชม 500 - 1,200 บาท / ลำ ขึ้นกับเส้นทางและระยะเวลา",
    "facilities": "โฮมสเตย์ริมน้ำ, ร้านอาหารพื้นบ้าน, ท่าเทียบเรือนำเที่ยว, ลานจอดรถ",
    "hours": "ท่าเรือเริ่มให้บริการ 05:00 น."
  },
  {
    "id": 3,
    "name": "สะพานเฉลิมพระเกียรติ 80 พรรษา (สะพานเอกชัย)",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ควนขนุน",
    "lat": 7.7599,
    "lng": 100.1565,
    "rating": 4.5,
    "reviews": 144,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "description": "สะพานข้ามทะเลสาบที่ยาวที่สุดในประเทศไทย เชื่อม อ.ควนขนุน จ.พัทลุง กับ อ.ระโนด จ.สงขลา ตลอดเส้นทางเป็นทัศนียภาพของผืนน้ำทะเลสาบสงขลา ทุ่งหญ้าชุ่มน้ำ ฝูงควายน้ำ และนกน้ำ มีจุดจอดรถชมวิวพร้อมป้าย 'พัทลุง' ขนาดใหญ่สำหรับถ่ายรูป",
    "highlight": "ชมพระอาทิตย์ตกเหนือทะเลสาบ และฝูงควายน้ำเดินกลับคอกยามเย็น",
    "best_time": "ช่วงเย็น 16:30 - 18:30 น. (ช่วงที่ควายน้ำออกหากินมากที่สุด)",
    "fee": "ฟรี (ไม่มีค่าเข้าชม)",
    "facilities": "จุดชมวิว, ลานจอดรถ, ห้องน้ำ, ร้านค้าเล็กๆ ริมสะพาน",
    "hours": "เปิดตลอด 24 ชั่วโมง (จุดจอดชมวิว)"
  },
  {
    "id": 4,
    "name": "จุดชมวิวทะเลหมอกควนนกเต้น",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.4396,
    "lng": 99.9259,
    "rating": 4.4,
    "reviews": 427,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "description": "ยอดเขาชมทะเลหมอกยอดนิยมบนแนวเทือกเขาบรรทัด มีระเบียงชมวิวหลายชั้นมองเห็นทิวทัศน์หุบเขาได้กว้างราว 270 องศา ยามเช้าสายหมอกสีขาวจะลอยปกคลุมผืนป่าเบื้องล่าง ด้านบนมีร้านกาแฟ ลานกางเต็นท์ และห้องพักให้ค้างคืนเพื่อรอชมพระอาทิตย์ขึ้น",
    "highlight": "ชมทะเลหมอกยามเช้าและวิวเทือกเขาบรรทัดแบบพาโนรามา",
    "best_time": "05:30 - 08:00 น. (ชมพระอาทิตย์ตกได้เช่นกัน)",
    "fee": "ค่ารถ 4WD รับ-ส่งขึ้นยอดเขา ประมาณ 30 - 60 บาท / ท่าน (ถนนชันมาก ไม่แนะนำให้ขับรถเก๋งขึ้นเอง)",
    "facilities": "ลานกางเต็นท์, ร้านกาแฟและอาหารฮาลาล, ระเบียงชมวิว, ห้องพัก, ลานจอดรถด้านล่าง",
    "hours": "05:30 - 19:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 5,
    "name": "น้ำตกไพรวัลย์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.3612,
    "lng": 99.9616,
    "rating": 4.8,
    "reviews": 34,
    "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกขนาดใหญ่ที่มีน้ำไหลตลอดทั้งปี ตั้งอยู่ในเขตรักษาพันธุ์สัตว์ป่าเขาบรรทัด ตัวน้ำตกมีหลายชั้นและเดินขึ้นชมได้สะดวก มีแอ่งน้ำธรรมชาติขนาดใหญ่ให้ลงเล่นน้ำ น้ำเย็นใสและร่มรื่นด้วยไม้ใหญ่ เหมาะกับการพักผ่อนแบบครอบครัว",
    "highlight": "เล่นน้ำในแอ่งธรรมชาติขนาดใหญ่กลางป่าดิบชื้น",
    "best_time": "08:30 - 16:00 น.",
    "fee": "ผู้ใหญ่ 30 บาท, เด็ก 20 บาท (ชาวต่างชาติ 200 บาท)",
    "facilities": "ลานจอดรถ, ร้านอาหารบริเวณทางเข้า, ห้องน้ำ, ศาลาพักผ่อน",
    "hours": "08:00 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 6,
    "name": "น้ำตกมโนราห์",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.3917,
    "lng": 99.9363,
    "rating": 4.3,
    "reviews": 358,
    "image": "https://images.unsplash.com/photo-1467890947394-8171244e5410?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกในเขตรักษาพันธุ์สัตว์ป่าเขาบรรทัด สายน้ำไหลผ่านโขดหินขนาดใหญ่ลดหลั่นลงมาหลายชั้น มีแอ่งน้ำให้ลงเล่นได้หลายจุด บรรยากาศร่มรื่น เดินทางสะดวก มีลานจอดรถกว้าง เหมาะสำหรับมาปิกนิกกับครอบครัว",
    "highlight": "เล่นน้ำและปีนโขดหินสำรวจน้ำตกหลายชั้น",
    "best_time": "08:30 - 16:00 น. (เลี่ยงช่วงวันหยุดยาวเพราะคนเยอะ)",
    "fee": "ค่าเข้าชมประมาณ 20 - 30 บาท / ท่าน",
    "facilities": "ลานจอดรถกว้าง, ร้านอาหารและเครื่องดื่ม, ห้องน้ำ (สภาพพอใช้)",
    "hours": "08:00 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 7,
    "name": "น้ำตกหนานหรูด",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "กงหรา",
    "lat": 7.4389,
    "lng": 99.9199,
    "rating": 4.4,
    "reviews": 41,
    "image": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำตกเล็กๆ ที่ยังคงความเป็นธรรมชาติสูง น้ำใสมากจนมองเห็นพื้นหิน เงียบสงบและคนไม่พลุกพล่านโดยเฉพาะวันธรรมดา อยู่ใกล้กับจุดชมวิวควนนกเต้น สามารถแวะต่อเนื่องกันได้ในทริปเดียว ทางเข้าค่อนข้างหายาก แนะนำให้สอบถามคนในพื้นที่",
    "highlight": "แช่น้ำใสในแอ่งธรรมชาติที่เงียบสงบ ไม่พลุกพล่าน",
    "best_time": "09:00 - 16:00 น. (วันธรรมดาคนน้อยที่สุด)",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ลานจอดรถขนาดเล็ก, ร้านกาแฟบริเวณใกล้เคียง",
    "hours": "ช่วงกลางวัน (ไม่แนะนำให้เข้าช่วงค่ำ)"
  },
  {
    "id": 8,
    "name": "บ่อน้ำร้อนเขาชัยสน",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "เขาชัยสน",
    "lat": 7.4508,
    "lng": 100.1307,
    "rating": 4.2,
    "reviews": 1549,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "description": "บ่อน้ำแร่ร้อนธรรมชาติเชิงเขาหินปูน มีบ่อแช่รวมกลางแจ้งหลายบ่อที่อุณหภูมิต่างกัน และห้องอาบน้ำแร่ส่วนตัวให้เช่า พื้นที่ได้รับการปรับปรุงใหม่ สะอาด มีห้องเปลี่ยนเสื้อผ้าและห้องอาบน้ำครบ ระวังลิงบริเวณรอบๆ ที่มักคุ้ยกระเป๋าของนักท่องเที่ยว",
    "highlight": "แช่น้ำแร่ร้อนธรรมชาติผ่อนคลาย มีทั้งบ่อรวมและห้องส่วนตัว",
    "best_time": "ช่วงเช้า 08:00 - 11:00 น. (แดดไม่แรงและคนน้อย)",
    "fee": "คนไทย 20 บาท, ชาวต่างชาติ 40 บาท (ห้องแช่ส่วนตัวคิดเพิ่ม)",
    "facilities": "บ่อแช่รวม, ห้องอาบน้ำแร่ส่วนตัว, ห้องเปลี่ยนเสื้อผ้า, ร้านอาหารฝั่งตรงข้าม, ลานจอดรถ",
    "hours": "05:00 - 20:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 9,
    "name": "น้ำพุร้อนธรรมชาติบ้านสวนหมาก",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ศรีนครินทร์",
    "lat": 7.5498,
    "lng": 99.9456,
    "rating": 4.8,
    "reviews": 13,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "description": "น้ำพุร้อนที่ผุดขึ้นมาจากใต้ท้องลำธารโดยตรง ทำให้เกิดแอ่งน้ำอุ่นผสมกับน้ำเย็นของลำธารได้อย่างลงตัว เป็นรูปแบบที่หาได้ยากมาก บรรยากาศเงียบสงบเป็นส่วนตัว มีปูและกุ้งฝอยให้เด็กๆ ตามหาบริเวณท้ายน้ำ ใกล้ๆ มีคาเฟ่ให้นั่งพัก",
    "highlight": "แช่น้ำพุร้อนที่ผุดจากใต้ท้องลำธาร บรรยากาศธรรมชาติแท้ๆ",
    "best_time": "09:00 - 16:00 น. (วันธรรมดาคนน้อย)",
    "fee": "ไม่มีค่าเข้าชม (มีกล่องรับบริจาคบำรุงสถานที่)",
    "facilities": "ห้องน้ำ, คาเฟ่และร้านอาหารใกล้เคียง, ลานจอดรถ",
    "hours": "ช่วงกลางวัน"
  },
  {
    "id": 10,
    "name": "อ่างเก็บน้ำห้วยน้ำใส",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ป่าพะยอม",
    "lat": 7.8789,
    "lng": 99.7983,
    "rating": 4.8,
    "reviews": 48,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "อ่างเก็บน้ำขนาดใหญ่ที่มีผืนน้ำสีฟ้าโอบล้อมด้วยทิวเขาสลับซับซ้อนของเทือกเขาบรรทัด บรรยากาศเงียบสงบ อากาศเย็นสบาย มีสันเขื่อนทอดยาวสำหรับเดินเล่นและชมวิว อยู่เส้นทางเดียวกับล่องแก่งหนานมดแดง แวะต่อเนื่องกันได้",
    "highlight": "ชมวิวผืนน้ำสะท้อนเงาภูเขาจากสันเขื่อน",
    "best_time": "ช่วงเช้า 06:30 - 09:00 น. และเย็น 16:30 - 18:30 น.",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ถนนเลียบสันเขื่อน, จุดชมวิว, ลานจอดรถ",
    "hours": "ช่วงกลางวัน (ทางเข้าใช้เส้นเดียวกับล่องแก่งหนานมดแดง)"
  },
  {
    "id": 11,
    "name": "อ่างเก็บน้ำคลองหัวช้าง",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "ตะโหมด",
    "lat": 7.3155,
    "lng": 100.0176,
    "rating": 4.4,
    "reviews": 40,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "อ่างเก็บน้ำกว้างใหญ่โอบล้อมด้วยภูเขาสีเขียว บรรยากาศเงียบสงบและอากาศบริสุทธิ์ เป็นจุดเช็กอินธรรมชาติที่คนยังไม่พลุกพล่าน เหมาะกับการมาปั่นจักรยาน เดินเล่นบนสันเขื่อน กางเต็นท์ หรือขับรถมาเปลี่ยนบรรยากาศ ยามเช้าและเย็นแสงจะสวยเป็นพิเศษ",
    "highlight": "วิวอ่างเก็บน้ำโอบภูเขา เงียบสงบ เหมาะกางเต็นท์และปั่นจักรยาน",
    "best_time": "ช่วงเช้าตรู่ และช่วงเย็นก่อนพระอาทิตย์ตก",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ลานกางเต็นท์, ถนนเลียบสันเขื่อน, ลานจอดรถ",
    "hours": "05:00 - 18:30 น."
  },
  {
    "id": 12,
    "name": "หาดแสนสุขลำปำ",
    "category": "nature",
    "category_name": "ธรรมชาติ",
    "district": "เมืองพัทลุง",
    "lat": 7.626,
    "lng": 100.157,
    "rating": 4.3,
    "reviews": 1461,
    "image": "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=800&q=80",
    "description": "ชายหาดน้ำจืดริมทะเลสาบสงขลา ห่างจากตัวเมืองพัทลุงเพียงไม่กี่กิโลเมตร มีทิวสนร่มรื่นและลมพัดเย็นตลอดวัน เป็นที่พักผ่อนยอดนิยมของคนท้องถิ่น มีร้านอาหารทะเลและร้านอาหารพื้นบ้านเรียงรายริมหาด ยามเช้าเห็นดอกบัวและฝูงนกน้ำเป็นฉากหลัง",
    "highlight": "นั่งรับลมริมทะเลสาบใต้ทิวสน พร้อมชิมอาหารพื้นบ้าน",
    "best_time": "ช่วงเย็น 16:00 - 19:00 น. (ชมพระอาทิตย์ตกเหนือทะเลสาบ)",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ร้านอาหารริมหาด, ศาลานั่งพัก, ห้องน้ำ, ลานจอดรถกว้าง",
    "hours": "06:00 - 20:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 13,
    "name": "ล่องแก่งหนานมดแดง",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "ป่าพะยอม",
    "lat": 7.8873,
    "lng": 99.8524,
    "rating": 4.4,
    "reviews": 1304,
    "image": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    "description": "กิจกรรมพายเรือคายัคล่องแก่งบนสายน้ำใสที่ไหลลงมาจากเทือกเขาบรรทัด เป็นแหล่งล่องแก่งที่มีชื่อเสียงที่สุดของภาคใต้ ระยะทางล่องประมาณ 2.5 - 3 ชั่วโมง มีทั้งช่วงแก่งตื่นเต้นและช่วงน้ำนิ่งสลับกัน เรือรองรับได้ 1-3 ท่าน มีเจ้าหน้าที่ดูแลตลอดเส้นทาง ปลอดภัยสำหรับผู้เริ่มต้นและเด็ก",
    "highlight": "พายคายัคล่องแก่งสายน้ำใสท่ามกลางป่าเขาบรรทัด",
    "best_time": "08:30 - 15:00 น. (ควรเริ่มไม่เกินบ่ายสาม)",
    "fee": "ค่าล่องแก่งประมาณ 200 - 350 บาท / ท่าน (รวมชูชีพ ไม้พาย และเจ้าหน้าที่)",
    "facilities": "ที่พักรีสอร์ท, ร้านอาหาร, คาเฟ่, ห้องอาบน้ำเปลี่ยนเสื้อผ้า, สปา, ลานเด็กเล่น, ลานจอดรถกว้าง",
    "hours": "08:00 - 18:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 14,
    "name": "ล่องแก่งลานข่อย",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "ป่าพะยอม",
    "lat": 7.8891,
    "lng": 99.8859,
    "rating": 4.2,
    "reviews": 83,
    "image": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    "description": "อีกหนึ่งจุดล่องแก่งในตำบลลานข่อย บรรยากาศเป็นธรรมชาติและคนน้อยกว่าหนานมดแดง เหมาะกับกลุ่มครอบครัวที่อยากได้ความเป็นส่วนตัว สามารถนำอาหารมาทำกินเองริมน้ำได้ มีพื้นที่ให้นั่งพักผ่อนริมลำธาร",
    "highlight": "ล่องแก่งแบบไม่แออัด พร้อมพื้นที่ปิกนิกริมน้ำ",
    "best_time": "09:00 - 16:00 น.",
    "fee": "ค่าบริการล่องแก่งประมาณ 150 - 300 บาท / ท่าน",
    "facilities": "ลานปิกนิกริมน้ำ, ลานจอดรถ, ห้องน้ำ (ควรเตรียมของใช้ส่วนตัวไปเอง)",
    "hours": "09:00 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 15,
    "name": "ถ้ำน้ำเย็น (ถ้ำเขาชัยสน)",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "เขาชัยสน",
    "lat": 7.456,
    "lng": 100.1274,
    "rating": 4.3,
    "reviews": 863,
    "image": "https://images.unsplash.com/photo-1520496938502-d0e4b3d6bc2f?auto=format&fit=crop&w=800&q=80",
    "description": "ถ้ำหินปูนที่ต้องนั่งเรือพายลอดเข้าไปสำรวจ ช่วงปากถ้ำเพดานเตี้ยมากจนต้องนอนราบกับลำเรือเพื่อไม่ให้ศีรษะชนหินย้อย เมื่อผ่านเข้าไปด้านในจะเปิดโล่งให้เห็นหินงอกหินย้อยรูปร่างแปลกตาและฝูงค้างคาว ใช้เวลาราว 30 นาที มีไกด์ท้องถิ่นพายเรือและบรรยายให้ตลอดทาง",
    "highlight": "นั่งเรือพายลอดถ้ำหินปูน ชมหินงอกหินย้อยและฝูงค้างคาว",
    "best_time": "09:00 - 15:00 น.",
    "fee": "ค่าเรือ 200 - 300 บาท / ลำ (นั่งได้ 4 ท่าน) ชาวต่างชาติประมาณ 400 บาท / ลำ",
    "facilities": "ท่าเรือ, สวนหย่อม, ร้านอาหารพื้นบ้าน, ศูนย์นวดแผนไทย, ห้องน้ำ, ลานจอดรถ",
    "hours": "08:30 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 16,
    "name": "แกรนด์แคนยอนพัทลุง (ควนน้อย)",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "ควนขนุน",
    "lat": 7.674,
    "lng": 99.9959,
    "rating": 3.9,
    "reviews": 242,
    "image": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80",
    "description": "บ่อดินลูกรังเก่าที่น้ำท่วมขังจนกลายเป็นแอ่งน้ำสีเขียวมรกตล้อมรอบด้วยผาดินสูงชัน เป็นจุดถ่ายรูปที่ได้รับความนิยมในโซเชียล ควรทราบว่าที่นี่ยังเป็นพื้นที่ธรรมชาติที่ไม่ได้พัฒนาเป็นแหล่งท่องเที่ยวเต็มรูปแบบ ไม่มีสิ่งอำนวยความสะดวกมากนัก และไม่ควรลงเล่นน้ำเพราะน้ำลึกมาก",
    "highlight": "ถ่ายรูปมุมสูงกับผาดินและแอ่งน้ำสีเขียวมรกต",
    "best_time": "ช่วงเช้าตรู่ หรือช่วงเย็นใกล้พระอาทิตย์ตก",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ร้านอาหารเล็กๆ บริเวณใกล้เคียง, ที่จอดรถริมทาง (ไม่มีห้องน้ำสาธารณะ)",
    "hours": "เข้าชมได้ตลอด (ไม่มีเจ้าหน้าที่ดูแล ควรระมัดระวังบริเวณขอบผา)"
  },
  {
    "id": 17,
    "name": "จุดชมวิวควนเลียบ",
    "category": "adventure",
    "category_name": "ผจญภัย",
    "district": "เขาชัยสน",
    "lat": 7.3846,
    "lng": 100.0054,
    "rating": 4.4,
    "reviews": 13,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "จุดชมวิวธรรมชาติที่ยังไม่ถูกพัฒนา คงสภาพดั้งเดิมไว้เกือบทั้งหมด วิวเปิดโล่งเห็นทิวเขาและท้องทุ่งเบื้องล่าง อากาศเย็นสบาย เหมาะกับสายลุยที่ชอบธรรมชาติแบบดิบๆ ถนนขึ้นค่อนข้างชำรุด ไม่แนะนำให้นำรถเก๋งขึ้น ควรใช้รถกระบะหรือมอเตอร์ไซค์ หรือเดินขึ้นไป",
    "highlight": "วิวธรรมชาติดั้งเดิมที่ยังไม่ถูกพัฒนา เงียบสงบมาก",
    "best_time": "ช่วงเช้า (มีโอกาสเห็นหมอกบางๆ)",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ไม่มีสิ่งอำนวยความสะดวก ควรเตรียมน้ำและของใช้ไปเอง",
    "hours": "เข้าได้ตลอด (ถนนไม่เหมาะกับรถเก๋ง)"
  },
  {
    "id": 18,
    "name": "เขาอกทะลุ",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เมืองพัทลุง",
    "lat": 7.625,
    "lng": 100.0917,
    "rating": 4.6,
    "reviews": 132,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "description": "ภูเขาสัญลักษณ์ประจำจังหวัดพัทลุง มีลักษณะเด่นคือช่องโหว่ทะลุบริเวณใกล้ยอดเขาจนมองเห็นท้องฟ้าอีกฝั่ง มีบันไดคอนกรีตสภาพดีทอดขึ้นไปเกือบถึงยอด ช่วงสุดท้ายเป็นบันไดเหล็กมีกรงครอบเพื่อความปลอดภัย ใช้เวลาขึ้น-ลงราว 1 ชั่วโมงครึ่ง บนยอดเห็นวิวเมืองพัทลุงและทะเลสาบสงขลาได้รอบทิศ",
    "highlight": "พิชิตยอดเขาสัญลักษณ์ประจำจังหวัด ชมวิวเมืองพัทลุง 360 องศา",
    "best_time": "05:30 - 09:00 น. (เลี่ยงแดดแรงช่วงกลางวัน)",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "บันไดทางขึ้นมีราวจับ, จุดพักระหว่างทาง, ลานจอดรถ, ร้านค้าด้านล่าง",
    "hours": "05:00 - 18:00 น."
  },
  {
    "id": 19,
    "name": "วัดคูหาสวรรค์ (วัดถ้ำคูหาสวรรค์)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เมืองพัทลุง",
    "lat": 7.6199,
    "lng": 100.0808,
    "rating": 4.4,
    "reviews": 399,
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80",
    "description": "พระอารามหลวงเก่าแก่อายุกว่าพันปี ตั้งอยู่เชิงเขาคูหาสวรรค์ใจกลางเมือง จุดเด่นอยู่ที่ถ้ำด้านหลังวัดซึ่งประดิษฐานพระพุทธรูปปางต่างๆ จำนวนมาก รวมถึงพระพุทธไสยาสน์ ภายในถ้ำยังปรากฏพระปรมาภิไธยย่อของรัชกาลที่ 5 สลักไว้บนผนังหิน บริเวณวัดมีหลายระดับให้เดินชมมุมมองที่ต่างกัน",
    "highlight": "สักการะพระพุทธรูปในถ้ำโบราณ และชมพระปรมาภิไธยย่อ ร.5",
    "best_time": "08:00 - 16:00 น.",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ลานจอดรถ, ห้องน้ำ, ร้านค้าบริเวณหน้าวัด (ระวังสุนัขภายในวัด)",
    "hours": "เปิดทุกวันช่วงกลางวัน"
  },
  {
    "id": 20,
    "name": "วัดเขียนบางแก้ว (พระบรมธาตุเจดีย์)",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "เขาชัยสน",
    "lat": 7.5003,
    "lng": 100.1919,
    "rating": 4.6,
    "reviews": 458,
    "image": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80",
    "description": "วัดโบราณที่เชื่อกันว่าเป็นจุดกำเนิดพระพุทธศาสนาในภาคใต้ตอนล่าง มีอายุกว่า 1,000 ปี จุดเด่นคือพระบรมธาตุเจดีย์สีขาวทรงระฆังคว่ำที่งดงามและพระพุทธไสยาสน์ ตั้งอยู่ริมคลองในบรรยากาศชนบทที่เงียบสงบ ทุกปีจะมีงานประเพณีแห่ผ้าขึ้นห่มพระธาตุที่ผู้คนจากทั่วภาคใต้และมาเลเซียเดินทางมาร่วม",
    "highlight": "สักการะพระบรมธาตุเจดีย์อายุกว่าพันปี ต้นกำเนิดพุทธศาสนาภาคใต้",
    "best_time": "08:30 - 16:00 น. (ช่วงงานแห่ผ้าห่มพระธาตุประมาณเดือน ก.พ. - มี.ค.)",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ลานจอดรถ, ห้องน้ำ, พิพิธภัณฑ์วัตถุโบราณภายในวัด",
    "hours": "08:00 - 17:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 21,
    "name": "วัดถ้ำสุมะโน",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ศรีนครินทร์",
    "lat": 7.5838,
    "lng": 99.8697,
    "rating": 4.6,
    "reviews": 289,
    "image": "https://images.unsplash.com/photo-1520496938502-d0e4b3d6bc2f?auto=format&fit=crop&w=800&q=80",
    "description": "วัดถ้ำและสำนักปฏิบัติธรรมวิปัสสนากรรมฐานที่มีชื่อเสียง ภายในถ้ำกว้างขวาง อากาศเย็นสบายไม่อึดอัด มีทางเดินคอนกรีตทอดยาวเลียบลำธารใต้ดิน สะอาดและเดินชมได้สบาย มีค้างคาวเกาะอยู่ตามเพดานถ้ำ ผู้สนใจสามารถเข้าร่วมปฏิบัติธรรมได้ โดยเริ่มทำวัตรเช้าเวลา 06:00 น.",
    "highlight": "เดินชมถ้ำใหญ่เลียบลำธารใต้ดิน และปฏิบัติธรรมในบรรยากาศสงบ",
    "best_time": "08:00 - 16:00 น.",
    "fee": "ไม่มีค่าเข้าชม (ต้องถอดรองเท้าก่อนเข้าถ้ำ)",
    "facilities": "ที่พักสำหรับผู้ปฏิบัติธรรม, ห้องน้ำ, ลานจอดรถกว้าง",
    "hours": "เปิดตลอด 24 ชั่วโมง (ทำวัตรเช้า 06:00 น.)"
  },
  {
    "id": 22,
    "name": "หลาดใต้โหนด",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.7356,
    "lng": 99.9578,
    "rating": 4.4,
    "reviews": 1961,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "description": "ตลาดชุมชนใต้ร่มต้นตาลโตนดที่โด่งดังที่สุดของพัทลุง เปิดเฉพาะวันอาทิตย์วันเดียว บรรยากาศเหมือนเทศกาลอาหารเล็กๆ มีดนตรีสดเล่นตลอดวัน จุดเด่นคือแนวคิดลดการใช้พลาสติก ใช้ภาชนะจากวัสดุธรรมชาติ มีอาหารพื้นบ้าน ผักผลไม้ท้องถิ่น งานหัตถกรรม และมุมคาเฟ่กาแฟดริปผสมน้ำตาลโตนด",
    "highlight": "ชิมอาหารพื้นบ้านใต้ร่มตาลโตนด ฟังดนตรีสด และช้อปงานคราฟต์",
    "best_time": "08:00 - 12:00 น. (ไปเช้าจะได้ของครบและคนไม่แน่น)",
    "fee": "ไม่มีค่าเข้าชม (ค่าจอดรถประมาณ 20 บาท)",
    "facilities": "ลานจอดรถ, ห้องน้ำ, โซนคาเฟ่, เวทีดนตรีสด",
    "hours": "เปิดเฉพาะวันอาทิตย์ 08:00 - 17:00 น."
  },
  {
    "id": 23,
    "name": "ตลาดป่าไผ่สร้างสุข",
    "category": "culture",
    "category_name": "วัฒนธรรม",
    "district": "ควนขนุน",
    "lat": 7.7267,
    "lng": 100.0071,
    "rating": 4.4,
    "reviews": 1119,
    "image": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
    "description": "ตลาดชุมชนใต้ร่มเงาป่าไผ่ บรรยากาศร่มรื่นและเป็นธรรมชาติมาก ร้านค้าสร้างจากไม้ไผ่ทั้งหมด เน้นแนวคิดรักษ์สิ่งแวดล้อม ลดการใช้ถุงพลาสติกและโฟม จำหน่ายอาหารพื้นบ้าน ผักผลไม้ปลอดสาร และงานหัตถกรรมราคาย่อมเยา อยู่ห่างจากตัวเมืองพัทลุงประมาณ 20 กิโลเมตร",
    "highlight": "เดินตลาดใต้ร่มป่าไผ่ ชิมอาหารพื้นบ้านและซื้อของฝากงานคราฟต์",
    "best_time": "08:00 - 11:00 น.",
    "fee": "ไม่มีค่าเข้าชม (ค่าจอดรถประมาณ 20 บาท)",
    "facilities": "ลานจอดรถโดยรอบ, ห้องน้ำ, โซนที่นั่งรับประทานอาหาร",
    "hours": "เปิดเฉพาะเสาร์ - อาทิตย์ 07:00 - 17:00 น."
  },
  {
    "id": 24,
    "name": "ศูนย์เรียนรู้นาโปแก",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "ควนขนุน",
    "lat": 7.7361,
    "lng": 100.0442,
    "rating": 4.3,
    "reviews": 346,
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    "description": "ศูนย์เรียนรู้วิถีชีวิตชาวนาและวัฒนธรรมท้องถิ่นพัทลุง มีสะพานไม้ทอดยาวเชื่อมเรือนไม้หลังต่างๆ กลางทุ่งนา มีกิจกรรมให้อาหารแกะและควาย มุมถ่ายรูปสวยหลายจุด รวมถึงรูปปั้นวัวขนาดยักษ์ที่ทางเข้า มีร้านกาแฟ ร้านนวด และร้านขายสินค้า OTOP ราคาย่อมเยา เหมาะพาเด็กๆ มาเรียนรู้",
    "highlight": "เดินสะพานไม้กลางทุ่งนา ให้อาหารแกะและควาย เรียนรู้วิถีชาวนา",
    "best_time": "07:00 - 10:00 น. และ 16:00 - 18:00 น.",
    "fee": "ค่าเข้าชมประมาณ 30 บาท / ท่าน (บางช่วงเก็บเป็นค่าเครื่องดื่มสมุนไพร)",
    "facilities": "ร้านกาแฟ, ร้านนวดแผนไทย, ร้าน OTOP, ที่พักโฮมสเตย์, ห้องน้ำ, ลานจอดรถกว้าง",
    "hours": "เปิดทุกวันช่วงกลางวัน"
  },
  {
    "id": 25,
    "name": "เดอลอง การ์เด้น (Delong Garden)",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "เมืองพัทลุง",
    "lat": 7.4996,
    "lng": 100.0649,
    "rating": 4.6,
    "reviews": 819,
    "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
    "description": "สวนกิจกรรมกลางแจ้งขนาดใหญ่สำหรับครอบครัว มีเครื่องเล่นและกิจกรรมหลากหลาย ทั้งซิปไลน์ รถ ATV โรงหนัง 3 มิติ เกมยิงปืน มอเตอร์ไซค์ไฟฟ้า สวนไดโนเสาร์ และสวนสัตว์เล็กๆ พื้นที่กว้างขวางตกแต่งสีสันสดใส มีคาเฟ่และร้านอาหารให้นั่งพัก เด็กๆ เล่นได้ทั้งวัน",
    "highlight": "ซิปไลน์ รถ ATV สวนไดโนเสาร์ และกิจกรรมกลางแจ้งสำหรับเด็ก",
    "best_time": "09:00 - 16:00 น. (เลี่ยงช่วงแดดจัดกลางวัน)",
    "fee": "ค่าเข้าผู้ใหญ่ 60 บาท หรือ 99 บาท (รวมเครื่องดื่ม/ของว่าง) กิจกรรมบางอย่างคิดเพิ่ม",
    "facilities": "คาเฟ่, ศูนย์อาหาร, เครื่องเล่นหลากหลาย, ห้องน้ำ, ลานจอดรถกว้าง",
    "hours": "จันทร์-ศุกร์ 08:00 - 18:00 น. / เสาร์-อาทิตย์ 08:00 - 19:00 น."
  },
  {
    "id": 26,
    "name": "กลุ่มหัตถกรรมกระจูดทะเลน้อย",
    "category": "family",
    "category_name": "ครอบครัว",
    "district": "ควนขนุน",
    "lat": 7.7825,
    "lng": 100.1202,
    "rating": 4.2,
    "reviews": 11,
    "image": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
    "description": "ศูนย์รวมงานหัตถกรรมจากต้นกระจูดซึ่งเป็นภูมิปัญญาประจำถิ่นทะเลน้อย มีทั้งกระเป๋า เสื่อ ตะกร้า และของตกแต่งบ้าน ฝีมือประณีตในราคาย่อมเยา บางแห่งเปิดให้ชมขั้นตอนการสานและทดลองสานด้วยตัวเอง เหมาะแวะต่อจากทะเลน้อยเพื่อซื้อของฝากติดไม้ติดมือ",
    "highlight": "ชมการสานกระจูดและเลือกซื้อของฝางานหัตถกรรมท้องถิ่น",
    "best_time": "09:00 - 16:00 น.",
    "fee": "ไม่มีค่าเข้าชม",
    "facilities": "ร้านจำหน่ายสินค้า, ลานจอดรถ, อยู่ใกล้ศูนย์บริการนักท่องเที่ยวทะเลน้อย",
    "hours": "08:00 - 18:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 27,
    "name": "HLNG Cafe",
    "category": "food",
    "category_name": "อาหาร",
    "district": "ควนขนุน",
    "lat": 7.74,
    "lng": 100.0755,
    "rating": 4.9,
    "reviews": 3768,
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "description": "คาเฟ่ที่ได้รับคะแนนรีวิวสูงที่สุดในพัทลุง ออกแบบเป็นเรือนกระจกโปร่งท่ามกลางสวนขนาดใหญ่ ตกแต่งด้วยงานศิลปะรูปนกยูงและนกนานาชนิด บรรยากาศเย็นสบายแม้เป็นเรือนกระจก มีทั้งกาแฟ เบเกอรี่ พิซซ่า และเบอร์เกอร์ มุมถ่ายรูปสวยแทบทุกจุด",
    "highlight": "จิบกาแฟในเรือนกระจกกลางสวน พร้อมงานตกแต่งรูปนกยูงที่เป็นเอกลักษณ์",
    "best_time": "09:00 - 12:00 น. (ช่วงบ่ายวันหยุดคนค่อนข้างเยอะ)",
    "fee": "เครื่องดื่มและของว่างประมาณ 60 - 150 บาท",
    "facilities": "โซนแอร์, สวนกลางแจ้ง, Wi-Fi, ที่จอดรถกว้าง, ห้องน้ำ",
    "hours": "09:00 - 18:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 28,
    "name": "ตลาดนัดหน้าสถานีรถไฟพัทลุง",
    "category": "food",
    "category_name": "อาหาร",
    "district": "เมืองพัทลุง",
    "lat": 7.6201,
    "lng": 100.0857,
    "rating": 4.3,
    "reviews": 300,
    "image": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80",
    "description": "ตลาดนัดของกินยามเย็นหน้าสถานีรถไฟพัทลุง แผงเรียงยาวตลอดทางเดินเข้าสถานี มีอาหารใต้และอาหารตามสั่งให้เลือกหลากหลาย ทั้งข้าวมันไก่ ผัดหมี่ ส้มตำ ไก่ทอด อาหารทะเลสด และของหวานพื้นบ้าน ราคาย่อมเยา เป็นจุดที่เห็นวิถีชีวิตคนพัทลุงได้ชัดที่สุด",
    "highlight": "ตะลอนชิมอาหารใต้และของหวานพื้นบ้านในราคาท้องถิ่น",
    "best_time": "17:00 - 19:30 น. (ของครบและบรรยากาศคึกคักที่สุด)",
    "fee": "อาหารจานละประมาณ 30 - 60 บาท",
    "facilities": "ที่จอดรถบริเวณสถานีรถไฟ, ร้านค้าจำนวนมาก",
    "hours": "15:30 - 22:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 29,
    "name": "ภูมิใจ คาเฟ่ ริมทะเลสาบลำปำ",
    "category": "food",
    "category_name": "อาหาร",
    "district": "เมืองพัทลุง",
    "lat": 7.5955,
    "lng": 100.1605,
    "rating": 4.6,
    "reviews": 104,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "description": "คาเฟ่และร้านอาหารริมทะเลสาบ ตกแต่งเป็นสวนสไตล์อังกฤษพร้อมศาลานั่งกลางสวน มีทั้งโซนแอร์และโซนกลางแจ้งวิวทะเลสาบ อาหารเน้นรสชาติใต้แท้ เช่น แกงส้มปลากะพงยอดมะพร้าว ของหวานและกาแฟก็ได้รับคำชม เหมาะกับการนั่งยาวๆ ชมวิว",
    "highlight": "นั่งชมวิวทะเลสาบในสวนสไตล์อังกฤษ พร้อมอาหารใต้รสจัดจ้าน",
    "best_time": "15:00 - 18:00 น. (แสงสวยและอากาศเย็นสบาย)",
    "fee": "อาหารและเครื่องดื่มประมาณ 80 - 250 บาท",
    "facilities": "โซนแอร์, สวนกลางแจ้ง, ศาลาริมน้ำ, ที่จอดรถ, ห้องน้ำ",
    "hours": "10:00 - 18:00 น. (เปิดทุกวัน)"
  },
  {
    "id": 30,
    "name": "เดอะควนนาโหนดคาเฟ่",
    "category": "food",
    "category_name": "อาหาร",
    "district": "เมืองพัทลุง",
    "lat": 7.5001,
    "lng": 100.064,
    "rating": 4.2,
    "reviews": 26,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "description": "คาเฟ่บนเนินเขาที่มองเห็นวิวเทือกเขาบรรทัดและเขาอกทะลุได้ในมุมกว้าง ต้องจอดรถด้านล่างแล้วนั่งรถกระบะของทางร้านขึ้นไป ซึ่งเป็นประสบการณ์ที่สนุกในตัวเอง ด้านบนมีลมพัดตลอดเวลา บรรยากาศสบาย มีรูปปั้นเจ้าแม่กวนอิมให้สักการะข้างโซนที่นั่ง เมนูไม่เยอะแต่วิวคุ้มค่า",
    "highlight": "นั่งจิบกาแฟบนเนินเขา มองเห็นเทือกเขาบรรทัดและเขาอกทะลุ",
    "best_time": "ช่วงเช้า 08:00 - 10:00 น.",
    "fee": "ค่ารถขึ้นเขา 50 บาท / ท่าน (ใช้เป็นส่วนลดค่าเครื่องดื่มได้บางส่วน) เครื่องดื่มประมาณ 60 - 120 บาท",
    "facilities": "รถรับ-ส่งขึ้นเขา, ระเบียงชมวิว, ที่จอดรถด้านล่าง (ไม่มีที่จอดด้านบน)",
    "hours": "08:00 - 18:00 น. (ปิดวันพุธ)"
  }
];

// โหลดฐานข้อมูลสถานที่: ถ้ามีของที่แอดมินแก้ไว้ให้ใช้อันนั้น ถ้าไม่มีค่อยใช้ค่าเริ่มต้น
function loadPlacesFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem('phatthalung_places_db'));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
        console.warn('places_db เสียหาย ใช้ข้อมูลเริ่มต้นแทน');
    }
    // clone เพื่อไม่ให้ไปแก้ค่าใน INITIAL_PLACES_DATA โดยตรง
    const fresh = JSON.parse(JSON.stringify(INITIAL_PLACES_DATA));
    localStorage.setItem('phatthalung_places_db', JSON.stringify(fresh));
    return fresh;
}

function savePlacesToStorage() {
    try {
        localStorage.setItem('phatthalung_places_db', JSON.stringify(PLACES));
    } catch (e) {
        showToast('บันทึกข้อมูลลงเครื่องไม่สำเร็จ (พื้นที่เก็บข้อมูลเต็ม)', 'error');
    }
}

let PLACES = loadPlacesFromStorage();

let favorites = [];
try {
    const rawFavs = JSON.parse(localStorage.getItem('phatthalung_favs'));
    // กรองเฉพาะ id ที่เป็นตัวเลขจริง กัน id ที่เป็น string ทำให้หัวใจไม่ติด
    if (Array.isArray(rawFavs)) favorites = rawFavs.map(Number).filter(n => !isNaN(n));
} catch (e) {
    favorites = [];
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    renderNavUserDropdown();

    if (document.getElementById('profInputName')) initProfilePage();
    if (document.getElementById('placesGrid')) initPlacesPage();
    if (document.getElementById('favoritesPageGrid')) filterFavoritesPage();
    if (document.getElementById('adminAuthModal')) initAdminGate();
    if (document.getElementById('topHighlightsGrid')) renderTopHighlights();

    // ตัวเลขสถานที่บนหน้าแรกเคยเป็นค่าตายตัว 30 ไม่ตรงกับข้อมูลจริง
    const heroCount = document.getElementById('heroPlaceCount');
    if (heroCount) heroCount.innerText = PLACES.length;
    if (document.getElementById('dedicatedNavMap')) initDedicatedNavigationPage();

    // ปิดเมนูโปรไฟล์เมื่อคลิกที่อื่น
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userProfileDropdown');
        if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.user-dropdown-wrapper')) {
            dropdown.classList.remove('show');
        }
    });

    // กด ESC เพื่อปิด modal ที่เปิดอยู่
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
        }
    });
});

// อ่านค่า ?cat= จาก URL เพื่อให้ลิงก์หมวดหมู่จากหน้าอื่นกรองได้จริง
function initPlacesPage() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const validCats = ['all', 'nature', 'adventure', 'culture', 'food', 'family'];

    if (cat && validCats.includes(cat)) {
        currentCategory = cat;
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-cat') === cat);
        });
    }

    populateDistrictOptions('districtSelect');

    // รองรับลิงก์แบบ places.html?district=ควนขนุน
    const district = params.get('district');
    const districtSelect = document.getElementById('districtSelect');
    if (district && districtSelect) {
        const exists = [...districtSelect.options].some(o => o.value === district);
        if (exists) districtSelect.value = district;
    }

    filterPlaces();
    updateChipCounts();

    // เปิดรายละเอียดทันทีเมื่อมาจากปุ่ม "ดูหน้าเว็บจริง" ในระบบหลังบ้าน
    const previewId = parseInt(params.get('preview'), 10);
    if (!isNaN(previewId) && PLACES.some(p => p.id === previewId)) {
        setTimeout(() => openModal(previewId), 150);
    }
}

// สร้างตัวเลือกอำเภอจากข้อมูลจริง เพื่อให้อำเภอที่แอดมินเพิ่มใหม่ขึ้นเองอัตโนมัติ
function populateDistrictOptions(selectId, sourcePlaces) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const previous = select.value || 'all';
    const districts = [...new Set(
        (sourcePlaces || PLACES).map(p => (p.district || '').trim()).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'th'));

    select.innerHTML = '<option value="all">ทุกอำเภอ</option>'
        + districts.map(d => {
            const count = (sourcePlaces || PLACES).filter(p => p.district === d).length;
            return `<option value="${d}">อ.${d} (${count})</option>`;
        }).join('');

    // คงค่าที่ผู้ใช้เลือกไว้ ถ้าอำเภอนั้นยังมีอยู่
    select.value = districts.includes(previous) ? previous : 'all';
}

// อัปเดตตัวเลขจำนวนสถานที่บนปุ่มหมวดหมู่ให้ตรงกับข้อมูลจริง
function updateChipCounts() {
    const allChip = document.querySelector('.chip[data-cat="all"]');
    if (allChip) allChip.innerHTML = `ทั้งหมด (${PLACES.length})`;
}

function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }
}

// ==================== Places Filtering ====================
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
    const districtSelect = document.getElementById('districtSelect');
    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'rating';
    const selectedDistrict = districtSelect ? districtSelect.value : 'all';

    let filtered = PLACES.filter(place => {
        const matchesCategory = (currentCategory === 'all' || place.category === currentCategory);
        const matchesDistrict = (selectedDistrict === 'all' || place.district === selectedDistrict);
        const name = (place.name || '').toLowerCase();
        const district = (place.district || '').toLowerCase();
        const matchesQuery = !query || name.includes(query) || district.includes(query);
        return matchesCategory && matchesDistrict && matchesQuery;
    });

    if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'));

    if (countEl) countEl.innerText = filtered.length;

    // เดิมถ้าค้นหาไม่เจอจะได้หน้าว่างเปล่าโดยไม่บอกอะไรเลย
    if (filtered.length === 0) {
        const active = [];
        if (currentCategory !== 'all') active.push('หมวดหมู่');
        if (selectedDistrict !== 'all') active.push(`อ.${selectedDistrict}`);
        if (query) active.push(`คำค้น "${query}"`);
        const hint = active.length
            ? `กำลังกรองด้วย ${active.join(' + ')} ลองปลดเงื่อนไขบางอย่างออกดู`
            : 'ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดู';

        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>ไม่พบสถานที่ที่ตรงกับเงื่อนไข</h3>
                <p>${hint}</p>
                <button class="btn btn-outline btn-sm mt-3" onclick="resetPlaceFilters()">
                    <i class="fa-solid fa-rotate-left"></i> ล้างตัวกรองทั้งหมด
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(place => createPlaceCardHTML(place)).join('');
}

// แปลงพิกัดให้ปลอดภัย กัน error เวลาข้อมูลไม่มี lat/lng หรือกรอกมาไม่ใช่ตัวเลข
function fmtCoord(value, digits = 4) {
    const n = parseFloat(value);
    return isNaN(n) ? '-' : n.toFixed(digits);
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

function createPlaceCardHTML(place) {
    const isFav = favorites.includes(place.id);
    return `
        <article class="place-card" onclick="openModal(${place.id})">
            <div class="place-card-img" style="background-image: url('${place.image || FALLBACK_IMAGE}')">
                <span class="place-category-badge">${place.category_name || place.category || 'ทั่วไป'}</span>
                <span class="place-rating-badge"><i class="fa-solid fa-star"></i> ${place.rating}</span>
            </div>
            <div class="place-card-body">
                <span class="place-district"><i class="fa-solid fa-location-dot"></i> อ.${place.district}</span>
                <h3 class="place-title">${place.name}</h3>
                <p class="place-desc">${place.description}</p>
            </div>
            <div class="place-card-footer">
                <span class="card-cta">ดูรายละเอียด <i class="fa-solid fa-arrow-right"></i></span>
                <button class="btn-action-icon${isFav ? ' active' : ''}"
                        onclick="event.stopPropagation(); toggleFavorite(${place.id})"
                        aria-label="${isFav ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>
        </article>
    `;
}

// ล้างตัวกรองทั้งหมดกลับสู่ค่าเริ่มต้น
function resetPlaceFilters() {
    currentCategory = 'all';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const districtSelect = document.getElementById('districtSelect');
    if (districtSelect) districtSelect.value = 'all';

    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-cat') === 'all');
    });

    filterPlaces();
    showToast('ล้างตัวกรองแล้ว');
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        showToast('ลบออกจากรายการโปรด');
    } else {
        favorites.push(id);
        showToast('เพิ่มในรายการโปรดแล้ว ❤️');
    }
    localStorage.setItem('phatthalung_favs', JSON.stringify(favorites));

    // อัปเดตทุกจุดที่แสดงจำนวนรายการโปรด แทนที่จะ re-render navbar ทั้งแถบ
    // (การ re-render navbar ทำให้เมนูโปรไฟล์ที่เปิดอยู่ถูกปิดไปด้วย)
    filterPlaces();
    filterFavoritesPage();
    renderTopHighlights();

    const profFavCount = document.getElementById('profFavCount');
    if (profFavCount) profFavCount.innerText = favorites.length;
    const dashFavCount = document.getElementById('dashTotalFavs');
    if (dashFavCount) dashFavCount.innerText = favorites.length;
}

function openModal(id) {
    const place = PLACES.find(p => p.id === id);
    if (!place) return;
    const modal = document.getElementById('placeModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    const feeText = place.fee || 'ไม่มีข้อมูลค่าธรรมเนียม';
    const bestTimeText = place.best_time || 'ตลอดทั้งวัน';
    const hoursText = place.hours || 'ไม่ระบุเวลาทำการ';
    const highlightText = place.highlight || place.name;
    const facilitiesText = place.facilities || 'มีที่จอดรถและสิ่งอำนวยความสะดวกพื้นฐาน';

    content.innerHTML = `
        <img class="modal-img" src="${place.image || FALLBACK_IMAGE}" alt="${place.name}">
        <div class="modal-body">
            <div class="flex-between" style="margin-bottom: 14px;">
                <span class="place-category-badge" style="position: static;">${place.category_name || 'ทั่วไป'}</span>
                <span class="result-count"><i class="fa-solid fa-star" style="color: var(--gold);"></i> <b>${place.rating}</b> จาก ${(place.reviews || 0).toLocaleString('th-TH')} รีวิว</span>
            </div>

            <h2>${place.name}</h2>
            <p class="mt-2" style="line-height: 1.85;">${place.description}</p>

            <div class="detail-grid">
                <div>
                    <small>จุดเด่น</small>
                    <strong style="color: var(--gold-lt);">${highlightText}</strong>
                </div>
                <div>
                    <small>ช่วงเวลาที่แนะนำ</small>
                    <strong>${bestTimeText}</strong>
                </div>
                <div>
                    <small>เวลาทำการ</small>
                    <strong style="color: var(--jade);">${hoursText}</strong>
                </div>
                <div>
                    <small>ค่าเข้าชม</small>
                    <strong>${feeText}</strong>
                </div>
                <div style="grid-column: 1 / -1;">
                    <small>ที่ตั้ง</small>
                    <strong>อ.${place.district} จ.พัทลุง
                        <span style="font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; color: var(--faint);">
                            · ${fmtCoord(place.lat)}, ${fmtCoord(place.lng)}
                        </span>
                    </strong>
                </div>
                <div style="grid-column: 1 / -1;">
                    <small>สิ่งอำนวยความสะดวก</small>
                    <strong style="font-weight: 400; color: var(--sub); line-height: 1.7;">${facilitiesText}</strong>
                </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="window.location.href='navigation.html?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.name)}'" class="btn btn-glow" style="flex: 1; min-width: 190px;">
                    <i class="fa-solid fa-map-location-dot"></i> นำทางไปที่นี่
                </button>
                <button onclick="copyGpsCoord(${place.lat}, ${place.lng})" class="btn btn-outline">
                    <i class="fa-regular fa-copy"></i> คัดลอกพิกัด
                </button>
            </div>
        </div>
    `;
    modal.classList.add('active');
}


function closeModal(event) {
    // หน้าเว็บเรียกทั้งแบบ closeModal() และ closeModal(event) จึงต้องรองรับทั้งสองแบบ
    if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
    const modal = document.getElementById('placeModal');
    if (modal) modal.classList.remove('active');
}

function renderTopHighlights() {
    const grid = document.getElementById('topHighlightsGrid');
    if (!grid) return;
    const topRated = [...PLACES].sort((a, b) => b.rating - a.rating).slice(0, 6);
    grid.innerHTML = topRated.map(place => createPlaceCardHTML(place)).join('');
}

// ==================== AI Trip Planner ====================
let currentPlannedStops = [];

const AI_ROUTES = {
    adventure: {
        title: "เส้นทางสายลุย ล่องแก่งหนานมดแดง & ป่าเขาบรรทัด",
        desc: "สำหรับสายลุย ผจญภัยล่องเรือคายัคสายน้ำใส ชมอ่างเก็บน้ำห้วยน้ำใส",
        tags: ["ล่องแก่ง", "ผจญภัย", "สายลุย"],
        days: {
            1: [
                { time: "09:00 - 12:30 น.", title: "ล่องแก่งหนานมดแดง", spot: "ป่าพะยอม", lat: 7.8873, lng: 99.8524 },
                { time: "14:00 - 17:00 น.", title: "อ่างเก็บน้ำห้วยน้ำใส", spot: "ป่าพะยอม", lat: 7.8789, lng: 99.7983 }
            ],
            2: [
                { time: "09:00 - 12:00 น.", title: "น้ำตกมโนราห์", spot: "กงหรา", lat: 7.3917, lng: 99.9363 },
                { time: "14:00 - 16:30 น.", title: "เขาอกทะลุ", spot: "เมืองพัทลุง", lat: 7.6250, lng: 100.0917 }
            ]
        }
    },
    nature: {
        title: "เส้นทางธรรมชาติและสายนทีเมืองลุง",
        desc: "สัมผัสความบริสุทธิ์ของธรรมชาติ ทะเลน้อย และคลองปากประ",
        tags: ["ธรรมชาติ", "ชมบัวแดง", "คลองปากประ"],
        days: {
            1: [
                { time: "05:45 - 08:30 น.", title: "คลองปากประ & ยอยักษ์", spot: "ควนขนุน", lat: 7.7289, lng: 100.1429 },
                { time: "09:00 - 11:30 น.", title: "สะพานเอกชัย 80 พรรษา", spot: "ควนขนุน", lat: 7.7599, lng: 100.1565 },
                { time: "13:00 - 16:00 น.", title: "ทะเลน้อย & ทุ่งบัวแดง", spot: "ควนขนุน", lat: 7.7767, lng: 100.1238 }
            ],
            2: [
                { time: "08:30 - 11:30 น.", title: "น้ำตกไพรวัลย์", spot: "กงหรา", lat: 7.3612, lng: 99.9616 },
                { time: "13:30 - 16:30 น.", title: "อ่างเก็บน้ำห้วยน้ำใส", spot: "ป่าพะยอม", lat: 7.8789, lng: 99.7983 }
            ],
            3: [
                { time: "09:00 - 12:00 น.", title: "น้ำพุร้อนบ้านสวนหมาก", spot: "ศรีนครินทร์", lat: 7.5498, lng: 99.9456 },
                { time: "14:00 - 16:30 น.", title: "เขาอกทะลุ", spot: "เมืองพัทลุง", lat: 7.6250, lng: 100.0917 }
            ]
        }
    },
    // 3 หมวดนี้มีให้เลือกในหน้าเว็บ แต่เดิมไม่มีข้อมูลเลย ระบบจึงเงียบๆ สลับไปใช้ทริป "ผจญภัย" แทน
    chill: {
        title: "เส้นทางสายชิลล์ คาเฟ่ & จุดชมวิวถ่ายรูป",
        desc: "จิบกาแฟชมทะเลหมอก เก็บภาพสวยแบบไม่ต้องรีบ เหมาะกับสายพักผ่อน",
        tags: ["คาเฟ่", "ทะเลหมอก", "ถ่ายรูป"],
        days: {
            1: [
                { time: "05:30 - 08:30 น.", title: "จุดชมวิวทะเลหมอกควนนกเต้น", spot: "กงหรา", lat: 7.4396, lng: 99.9259 },
                { time: "10:00 - 12:30 น.", title: "HLNG Cafe", spot: "ควนขนุน", lat: 7.7400, lng: 100.0755 },
                { time: "16:00 - 18:30 น.", title: "สะพานเอกชัย 80 พรรษา (ชมพระอาทิตย์ตก)", spot: "ควนขนุน", lat: 7.7599, lng: 100.1565 }
            ],
            2: [
                { time: "08:00 - 10:30 น.", title: "อ่างเก็บน้ำห้วยน้ำใส", spot: "ป่าพะยอม", lat: 7.8789, lng: 99.7983 },
                { time: "13:00 - 16:00 น.", title: "น้ำพุร้อนบ้านสวนหมาก", spot: "ศรีนครินทร์", lat: 7.5498, lng: 99.9456 }
            ],
            3: [
                { time: "07:00 - 09:30 น.", title: "คลองปากประ & ยอยักษ์", spot: "ควนขนุน", lat: 7.7289, lng: 100.1429 },
                { time: "11:00 - 14:00 น.", title: "ทะเลน้อย & ทุ่งบัวแดง", spot: "ควนขนุน", lat: 7.7767, lng: 100.1238 }
            ]
        }
    },
    culture: {
        title: "เส้นทางวิถีชีวิต วัฒนธรรม & วัดวาอาราม",
        desc: "ตามรอยประวัติศาสตร์และศรัทธาของคนเมืองลุง",
        tags: ["วัฒนธรรม", "ประวัติศาสตร์", "สายบุญ"],
        days: {
            1: [
                { time: "08:30 - 11:00 น.", title: "เขาอกทะลุ", spot: "เมืองพัทลุง", lat: 7.6250, lng: 100.0917 },
                { time: "13:00 - 16:00 น.", title: "วัดคูหาสวรรค์", spot: "เมืองพัทลุง", lat: 7.6199, lng: 100.0808 }
            ],
            2: [
                { time: "09:00 - 12:00 น.", title: "กลุ่มหัตถกรรมกระจูดทะเลน้อย", spot: "ควนขนุน", lat: 7.7825, lng: 100.1202 },
                { time: "14:00 - 17:00 น.", title: "สะพานเอกชัย 80 พรรษา", spot: "ควนขนุน", lat: 7.7599, lng: 100.1565 }
            ],
            3: [
                { time: "08:30 - 11:30 น.", title: "น้ำตกไพรวัลย์", spot: "กงหรา", lat: 7.3612, lng: 99.9616 },
                { time: "13:30 - 16:00 น.", title: "น้ำพุร้อนบ้านสวนหมาก", spot: "ศรีนครินทร์", lat: 7.5498, lng: 99.9456 }
            ]
        }
    },
    foodie: {
        title: "เส้นทางตะลอนกิน & ของหรอยเมืองลุง",
        desc: "ตระเวนชิมของอร่อยประจำถิ่น สลับกับจุดแวะพักสวยๆ",
        tags: ["อาหารพื้นบ้าน", "คาเฟ่", "ของฝาก"],
        days: {
            1: [
                { time: "07:00 - 09:00 น.", title: "คลองปากประ (ชิมอาหารเช้าริมน้ำ)", spot: "ควนขนุน", lat: 7.7289, lng: 100.1429 },
                { time: "10:30 - 13:00 น.", title: "คาเฟ่ริมสวน ควนขนุน", spot: "ควนขนุน", lat: 7.7280, lng: 100.0150 },
                { time: "15:00 - 18:00 น.", title: "ตลาดนัดหน้าสถานีรถไฟพัทลุง", spot: "เมืองพัทลุง", lat: 7.6201, lng: 100.0857 }
            ],
            2: [
                { time: "09:00 - 12:00 น.", title: "หลาดใต้โหนด (เฉพาะวันอาทิตย์)", spot: "ควนขนุน", lat: 7.7356, lng: 99.9578 },
                { time: "14:00 - 17:00 น.", title: "อ่างเก็บน้ำห้วยน้ำใส", spot: "ป่าพะยอม", lat: 7.8789, lng: 99.7983 }
            ],
            3: [
                { time: "06:00 - 09:00 น.", title: "ทะเลหมอกควนนกเต้น (กาแฟยามเช้า)", spot: "กงหรา", lat: 7.4396, lng: 99.9259 },
                { time: "12:00 - 15:00 น.", title: "น้ำตกไพรวัลย์", spot: "กงหรา", lat: 7.3612, lng: 99.9616 }
            ]
        }
    }
};

function generateAIRoute() {
    const styleEl = document.getElementById('tripStyle');
    const durationEl = document.getElementById('tripDuration');
    if (!styleEl || !durationEl) return;

    const style = styleEl.value;
    const duration = parseInt(durationEl.value, 10) || 1;
    const selectedPlan = AI_ROUTES[style] || AI_ROUTES.adventure;

    let allStops = [];
    let timelineHTML = '';
    let actualDays = 0;

    for (let day = 1; day <= duration; day++) {
        const dayStops = selectedPlan.days[day];
        // ถ้าแผนนี้ไม่มีข้อมูลวันที่ N ให้ข้ามไปเลย ดีกว่าเอาวันที่ 1 มาใส่ซ้ำ
        // (ของเดิมทำให้เส้นทางบนแผนที่วนกลับที่เดิม และระยะทางเพี้ยน)
        if (!dayStops || dayStops.length === 0) continue;

        actualDays++;
        timelineHTML += `<div class="day-marker"><i class="fa-regular fa-calendar"></i> วันที่ ${day}</div>`;
        dayStops.forEach(st => {
            allStops.push(st);
            timelineHTML += `
                <div class="timeline-stop">
                    <b>${st.time}</b>
                    <strong style="display: block; margin-top: 3px;">${st.title}</strong>
                    <p><i class="fa-solid fa-location-dot"></i> อ.${st.spot}</p>
                </div>
            `;
        });
    }

    if (allStops.length === 0) {
        showToast('ยังไม่มีข้อมูลเส้นทางสำหรับรูปแบบทริปนี้', 'error');
        return;
    }

    if (actualDays < duration) {
        timelineHTML += `<p class="form-hint mt-3">
            <i class="fa-solid fa-circle-info"></i> ทริปรูปแบบนี้มีข้อมูลแนะนำ ${actualDays} วัน
        </p>`;
    }

    currentPlannedStops = allStops;

    const titleEl = document.getElementById('resultTitle');
    const descEl = document.getElementById('resultDesc');
    const tagsEl = document.getElementById('resultTags');
    const timelineEl = document.getElementById('timelineContainer');
    const areaEl = document.getElementById('aiResultArea');

    if (titleEl) titleEl.innerText = `${selectedPlan.title} (${actualDays} วัน)`;
    if (descEl) descEl.innerText = selectedPlan.desc;
    // กล่องแท็กมีอยู่ในหน้าเว็บแต่ไม่เคยถูกเติมข้อมูลเลย
    if (tagsEl) {
        tagsEl.innerHTML = (selectedPlan.tags || [])
            .map(t => `<span class="ai-tag-pill"># ${t}</span>`).join('');
    }
    if (timelineEl) timelineEl.innerHTML = timelineHTML;
    if (areaEl) {
        areaEl.style.display = 'block';
        areaEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderInAppAiMap(allStops);
    showToast('AI วางแผนเส้นทางสำเร็จ!');
}

function openFullAiMapNavigation() {
    if (!currentPlannedStops || currentPlannedStops.length === 0) {
        showToast('กรุณากดสร้างทริป AI ก่อน', 'error');
        return;
    }
    localStorage.setItem('phatthalung_ai_trip', JSON.stringify(currentPlannedStops));
    window.location.href = 'navigation.html?mode=trip';
}

// In-App Preview Map on ai.html
let inAppMap = null;
let inAppPolyline = null;
let inAppMarkers = [];

async function renderInAppAiMap(stops) {
    const container = document.getElementById('aiRouteMap');
    if (!container || typeof L === 'undefined') return;
    if (!Array.isArray(stops) || stops.length === 0) return;

    if (!inAppMap) {
        inAppMap = L.map('aiRouteMap').setView([7.6250, 100.0917], 11);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(inAppMap);
    }

    // แผนที่เพิ่งถูกแสดง (display:none -> block) ต้องสั่งคำนวณขนาดใหม่ ไม่งั้นจะขึ้นเป็นสีเทา
    setTimeout(() => { if (inAppMap) inAppMap.invalidateSize(); }, 150);

    // ล้างเส้นทางและหมุดเดิมทั้งหมด (เดิมล้างแค่เส้น หมุดเลยทับกันเรื่อยๆ ทุกครั้งที่กดสร้างทริป)
    if (inAppPolyline) {
        inAppMap.removeLayer(inAppPolyline);
        inAppPolyline = null;
    }
    inAppMarkers.forEach(m => inAppMap.removeLayer(m));
    inAppMarkers = [];

    const validStops = stops.filter(s => !isNaN(parseFloat(s.lat)) && !isNaN(parseFloat(s.lng)));
    if (validStops.length === 0) return;

    const distEl = document.getElementById('aiTotalDistance');
    const countEl = document.getElementById('aiStopCount');
    if (countEl) countEl.innerText = `${validStops.length} จุด`;

    // ปักหมุดก่อนเสมอ ไม่ต้องรอ API
    validStops.forEach((st, idx) => {
        const pinIcon = L.divIcon({
            className: 'custom-div-pin',
            html: `<div class="custom-pin-marker pin-color-${(idx % 5) + 1}">${idx + 1}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18]
        });
        const marker = L.marker([parseFloat(st.lat), parseFloat(st.lng)], { icon: pinIcon })
            .addTo(inAppMap)
            .bindPopup(`<b style="color: #059669;">${idx + 1}. ${st.title || ''}</b><br><small>📍 ${st.spot || ''}</small>`);
        inAppMarkers.push(marker);
    });

    if (validStops.length < 2) {
        inAppMap.setView([parseFloat(validStops[0].lat), parseFloat(validStops[0].lng)], 14);
        if (distEl) distEl.innerText = '- กม.';
        return;
    }

    const waypoints = validStops.map(s => `${s.lng},${s.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM ' + res.status);
        const data = await res.json();
        if (!data.routes || data.routes.length === 0) throw new Error('ไม่พบเส้นทาง');

        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        inAppPolyline = L.polyline(coords, { color: '#059669', weight: 6 }).addTo(inAppMap);
        inAppMap.fitBounds(inAppPolyline.getBounds(), { padding: [40, 40] });
        if (distEl) distEl.innerText = `${(data.routes[0].distance / 1000).toFixed(1)} กม.`;
    } catch (e) {
        console.warn('โหลดเส้นทางไม่สำเร็จ ใช้เส้นตรงแทน:', e);
        const straight = validStops.map(s => [parseFloat(s.lat), parseFloat(s.lng)]);
        inAppPolyline = L.polyline(straight, {
            color: '#f59e0b', weight: 4, dashArray: '8, 10'
        }).addTo(inAppMap);
        inAppMap.fitBounds(inAppPolyline.getBounds(), { padding: [40, 40] });
        if (distEl) distEl.innerText = `~${calcTotalStraightKm(straight)} กม.`;
    }
}

// ปุ่ม "ตำแหน่งของฉัน" บนหน้า ai.html เรียกฟังก์ชันนี้ แต่เดิมไม่มีการเขียนไว้เลย
function locateUserPosition() {
    if (!inAppMap) {
        showToast('กรุณากดสร้างทริปเพื่อเปิดแผนที่ก่อน', 'error');
        return;
    }
    if (!navigator.geolocation) {
        showToast('อุปกรณ์ของคุณไม่รองรับระบบ GPS', 'error');
        return;
    }

    showToast('กำลังค้นหาตำแหน่งปัจจุบันของคุณ...');

    navigator.geolocation.getCurrentPosition(
        pos => {
            const latLng = [pos.coords.latitude, pos.coords.longitude];
            liveUserCoords = { lat: latLng[0], lng: latLng[1] };

            const beacon = L.divIcon({
                className: 'custom-gps-icon',
                html: '<div class="user-real-beacon" title="คุณอยู่ที่นี่"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
            });
            const marker = L.marker(latLng, { icon: beacon, zIndexOffset: 9999 })
                .addTo(inAppMap).bindPopup('<b>📍 คุณอยู่ที่นี่</b>');
            inAppMarkers.push(marker);

            inAppMap.flyTo(latLng, 15, { animate: true, duration: 1.2 });
            marker.openPopup();
        },
        () => showToast('กรุณากด "อนุญาตเข้าถึงตำแหน่ง" บนเบราว์เซอร์', 'error'),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ปุ่ม "ดูเส้นทางทั้งหมด" บนหน้า ai.html — เดิมก็ไม่มีฟังก์ชันนี้เช่นกัน
function resetAiMapView() {
    if (!inAppMap) {
        showToast('กรุณากดสร้างทริปเพื่อเปิดแผนที่ก่อน', 'error');
        return;
    }
    inAppMap.invalidateSize();

    if (inAppPolyline) {
        inAppMap.fitBounds(inAppPolyline.getBounds(), { padding: [40, 40] });
    } else if (inAppMarkers.length > 0) {
        inAppMap.fitBounds(L.featureGroup(inAppMarkers).getBounds(), { padding: [40, 40] });
    } else {
        inAppMap.setView([7.6250, 100.0917], 11);
    }
    showToast('จัดมุมมองแผนที่ให้พอดีเส้นทางแล้ว');
}

// ==================== Dedicated Fullscreen Navigation (navigation.html) ====================
let dedMapInstance = null;
let dedRouteLine = null;
let dedUserMarker = null;
let dedStopMarkers = [];
let dedWatchId = null;
let isDedNavigating = false;
let liveUserCoords = null; // เดิมใช้ตัวแปรนี้โดยไม่ประกาศ ทำให้พังใน strict mode

// ฟังก์ชันนี้ถูกเรียกใช้อยู่แต่ "ไม่เคยถูกเขียนไว้เลย" ทำให้หน้า navigation.html
// พังทั้งหน้า (ไม่มีเส้นทาง ไม่มีระยะทาง ปุ่มดูวิธีเลี้ยวใช้ไม่ได้)
async function drawDedRoadRoute(stops, userCoords) {
    if (!dedMapInstance || !Array.isArray(stops) || stops.length === 0) return;

    const hudTitle = document.getElementById('dedicatedHudTitle');
    const hudDist = document.getElementById('dedHudDist');
    const hudTime = document.getElementById('dedHudTime');

    // ล้างของเดิมก่อนวาดใหม่ ไม่ให้เส้น/หมุดซ้อนกัน
    if (dedRouteLine) {
        dedMapInstance.removeLayer(dedRouteLine);
        dedRouteLine = null;
    }
    dedStopMarkers.forEach(m => dedMapInstance.removeLayer(m));
    dedStopMarkers = [];

    // กรองเฉพาะจุดที่พิกัดใช้งานได้จริง
    const validStops = stops.filter(s => !isNaN(parseFloat(s.lat)) && !isNaN(parseFloat(s.lng)));
    if (validStops.length === 0) {
        if (hudTitle) hudTitle.innerText = 'ไม่พบพิกัดจุดหมายที่ถูกต้อง';
        return;
    }

    // ปักหมุดจุดแวะทุกจุดก่อน เพื่อให้เห็นบางอย่างทันทีแม้เส้นทางจะยังโหลดไม่เสร็จ
    validStops.forEach((st, idx) => {
        const pinIcon = L.divIcon({
            className: 'custom-div-pin',
            html: `<div class="custom-pin-marker pin-color-${(idx % 5) + 1}">${idx + 1}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18]
        });
        const marker = L.marker([parseFloat(st.lat), parseFloat(st.lng)], { icon: pinIcon })
            .addTo(dedMapInstance)
            .bindPopup(`<b style="color: #059669;">${idx + 1}. ${st.title || 'จุดหมาย'}</b><br><small>📍 ${st.spot || ''}</small>`);
        dedStopMarkers.push(marker);
    });

    // สร้างลำดับพิกัด: ถ้ารู้ตำแหน่งผู้ใช้ ให้เริ่มนำทางจากตำแหน่งผู้ใช้
    const routePoints = [];
    if (userCoords && !isNaN(parseFloat(userCoords.lat))) {
        routePoints.push([parseFloat(userCoords.lng), parseFloat(userCoords.lat)]);
    }
    validStops.forEach(s => routePoints.push([parseFloat(s.lng), parseFloat(s.lat)]));

    // มีจุดเดียว: ไม่ต้องคำนวณเส้นทาง แค่ซูมไปที่จุดนั้น
    if (routePoints.length < 2) {
        dedMapInstance.setView([parseFloat(validStops[0].lat), parseFloat(validStops[0].lng)], 14);
        if (hudTitle) hudTitle.innerText = validStops[0].title || 'จุดหมายปลายทาง';
        if (hudDist) hudDist.innerText = 'เปิด GPS เพื่อคำนวณ';
        if (hudTime) hudTime.innerText = '-';
        return;
    }

    if (hudTitle) hudTitle.innerText = 'กำลังคำนวณเส้นทางถนนจริง...';

    const waypoints = routePoints.map(p => `${p[0]},${p[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=true`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM ตอบกลับผิดพลาด ' + res.status);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) throw new Error('ไม่พบเส้นทาง');

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

        dedRouteLine = L.polyline(coords, {
            color: '#10b981',
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round'
        }).addTo(dedMapInstance);

        dedMapInstance.fitBounds(dedRouteLine.getBounds(), { padding: [50, 50] });

        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);
        if (hudDist) hudDist.innerText = `${km} กม.`;
        if (hudTime) hudTime.innerText = mins >= 60
            ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที`
            : `${mins} นาที`;
        if (hudTitle) hudTitle.innerText = validStops.length === 1
            ? `นำทางไป ${validStops[0].title}`
            : `ทริป ${validStops.length} จุดหมาย`;

        // เก็บขั้นตอนการเลี้ยวไว้ให้ปุ่ม "ดูวิธีเลี้ยว" ใช้งาน
        navSteps = [];
        (route.legs || []).forEach(leg => {
            (leg.steps || []).forEach(step => {
                navSteps.push({
                    instruction: buildThaiInstruction(step),
                    distance: Math.round(step.distance),
                    location: [step.maneuver.location[1], step.maneuver.location[0]]
                });
            });
        });
    } catch (e) {
        console.warn('คำนวณเส้นทางไม่สำเร็จ:', e);

        // แผนสำรอง: ลากเส้นตรงเชื่อมจุดต่างๆ ให้ยังพอใช้งานได้ ไม่ปล่อยแผนที่ว่างเปล่า
        const straight = validStops.map(s => [parseFloat(s.lat), parseFloat(s.lng)]);
        if (straight.length >= 2) {
            dedRouteLine = L.polyline(straight, {
                color: '#f59e0b',
                weight: 4,
                dashArray: '8, 10',
                opacity: 0.85
            }).addTo(dedMapInstance);
            dedMapInstance.fitBounds(dedRouteLine.getBounds(), { padding: [50, 50] });
        }
        if (hudTitle) hudTitle.innerText = 'แสดงเส้นทางโดยประมาณ (เชื่อมต่อเซิร์ฟเวอร์แผนที่ไม่ได้)';
        if (hudDist) hudDist.innerText = `~${calcTotalStraightKm(straight)} กม.`;
        if (hudTime) hudTime.innerText = '-';
    }
}

// ระยะทางเส้นตรงรวม (Haversine) ใช้ตอนเรียก OSRM ไม่ได้
function calcTotalStraightKm(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        const [lat1, lng1] = points[i - 1];
        const [lat2, lng2] = points[i];
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return total.toFixed(1);
}

// แปลงคำสั่งนำทางของ OSRM (ภาษาอังกฤษ) เป็นภาษาไทย
function buildThaiInstruction(step) {
    const road = step.name ? ` เข้าสู่ ${step.name}` : '';
    const type = step.maneuver.type;
    const modifier = step.maneuver.modifier || '';

    const dirMap = {
        'left': 'เลี้ยวซ้าย',
        'right': 'เลี้ยวขวา',
        'sharp left': 'เลี้ยวซ้ายหักศอก',
        'sharp right': 'เลี้ยวขวาหักศอก',
        'slight left': 'เบี่ยงซ้าย',
        'slight right': 'เบี่ยงขวา',
        'straight': 'ตรงไป',
        'uturn': 'กลับรถ'
    };

    if (type === 'depart') return `เริ่มต้นการเดินทาง${road}`;
    if (type === 'arrive') return 'ถึงจุดหมายปลายทางแล้ว';
    if (type === 'roundabout' || type === 'rotary') {
        const exit = step.maneuver.exit ? ` ออกทางออกที่ ${step.maneuver.exit}` : '';
        return `เข้าวงเวียน${exit}${road}`;
    }
    if (type === 'merge') return `รวมช่องทาง${road}`;
    if (type === 'new name') return `เดินทางต่อ${road}`;

    return `${dirMap[modifier] || 'เดินทางต่อ'}${road}`;
}


async function initDedicatedNavigationPage() {
    const mapContainer = document.getElementById('dedicatedNavMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (dedMapInstance) {
        dedMapInstance.remove();
        dedMapInstance = null;
        dedRouteLine = null;
        dedUserMarker = null;
        dedStopMarkers = [];
    }

    dedMapInstance = L.map('dedicatedNavMap', { zoomControl: true }).setView([7.6189, 100.0883], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(dedMapInstance);

    setTimeout(() => { if (dedMapInstance) dedMapInstance.invalidateSize(); }, 200);

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const name = urlParams.get('name');

    let destinationStops = [];

    if (mode === 'trip') {
        const tripData = localStorage.getItem('phatthalung_ai_trip');
        if (tripData) {
            try { destinationStops = JSON.parse(tripData); } catch(e) { destinationStops = []; }
        }
    } else if (lat && lng) {
        destinationStops = [{
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            title: decodeURIComponent(name || 'จุดหมายปลายทาง'),
            spot: decodeURIComponent(name || 'จุดหมาย')
        }];
    }

    if (!destinationStops || destinationStops.length === 0) {
        destinationStops = [
            { lat: 7.7289, lng: 100.1429, title: "คลองปากประ & ยอยักษ์", spot: "ควนขนุน" },
            { lat: 7.7599, lng: 100.1565, title: "สะพานเอกชัย 80 พรรษา", spot: "ควนขนุน" },
            { lat: 7.6250, lng: 100.0917, title: "เขาอกทะลุ", spot: "เมืองพัทลุง" }
        ];
    }

    const titleEl = document.getElementById('navPageTitle');
    if (titleEl) titleEl.innerText = destinationStops.length === 1 ? `นำทางไป: ${destinationStops[0].title}` : `ทริปนำทาง (${destinationStops.length} จุดหมาย)`;

    // วาดเส้นทางทันทีแบบรวดเร็ว (ไม่รอ Geolocation timeout)
    await drawDedRoadRoute(destinationStops, null);

    // ลองดึง GPS เบื้องหลังแบบเงียบๆ ถ้าได้ค่อยใส่หมุดตำแหน่งคนและคำนวณเส้นทางใหม่
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const uLat = pos.coords.latitude;
                const uLng = pos.coords.longitude;
                liveUserCoords = { lat: uLat, lng: uLng };

                if (dedMapInstance && !dedUserMarker) {
                    const beacon = L.divIcon({
                        className: 'custom-gps-icon',
                        html: '<div class="user-real-beacon" title="คุณอยู่ที่นี่"></div>',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                    });
                    dedUserMarker = L.marker([uLat, uLng], { icon: beacon, zIndexOffset: 999 }).addTo(dedMapInstance)
                        .bindPopup('<b>📍 คุณอยู่ที่นี่</b>');
                }

                // วาดเส้นทางใหม่โดยเริ่มจากตำแหน่งจริงของผู้ใช้
                drawDedRoadRoute(destinationStops, liveUserCoords);
            },
            () => {},
            { timeout: 8000, maximumAge: 60000 }
        );
    }
}


function locateDedicatedUser() {
    if (!navigator.geolocation) {
        showToast('อุปกรณ์ของคุณไม่รองรับระบบ GPS', 'error');
        return;
    }
    
    if (!dedMapInstance) {
        showToast('แผนที่ยังโหลดไม่เสร็จ กรุณารอสักครู่', 'error');
        return;
    }

    showToast('กำลังค้นหาตำแหน่ง GPS ปัจจุบันของคุณ...');

    navigator.geolocation.getCurrentPosition(
        pos => {
            const uLat = pos.coords.latitude;
            const uLng = pos.coords.longitude;
            const latLng = [uLat, uLng];
            liveUserCoords = { lat: uLat, lng: uLng };

            if (!dedUserMarker) {
                const beacon = L.divIcon({
                    className: 'custom-gps-icon',
                    html: '<div class="user-real-beacon" title="คุณอยู่ที่นี่"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });
                dedUserMarker = L.marker(latLng, { icon: beacon, zIndexOffset: 9999 }).addTo(dedMapInstance)
                    .bindPopup('<b>📍 คุณอยู่ที่นี่ (ตำแหน่งจริง)</b>');
            } else {
                dedUserMarker.setLatLng(latLng);
            }

            dedMapInstance.flyTo(latLng, 16, { animate: true, duration: 1.2 });
            dedUserMarker.openPopup();
            showToast('ซูมไปยังตำแหน่งปัจจุบันของคุณแล้ว 📍');
        },
        err => {
            console.warn('Geolocation error:', err);
            showToast('กรุณากด "อนุญาตเข้าถึงตำแหน่ง (Allow Location)" บนเบราว์เซอร์', 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function toggleDedicatedLiveNav() {
    const btn = document.getElementById('btnDedicatedLiveNav');
    if (isDedNavigating) {
        isDedNavigating = false;
        // watchId เป็น 0 ได้ ทำให้เงื่อนไขเดิม (if (dedWatchId)) ไม่ยอมหยุดติดตาม
        if (dedWatchId !== null && dedWatchId !== undefined) {
            navigator.geolocation.clearWatch(dedWatchId);
            dedWatchId = null;
        }
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> เริ่มนำทางสด';
        showToast('ปิดโหมดนำทางสด');
        return;
    }

    if (!navigator.geolocation) {
        showToast('ไม่พบระบบ GPS บนอุปกรณ์', 'error');
        return;
    }

    isDedNavigating = true;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> หยุดนำทาง';
    showToast('เริ่มนำทางสดตามตำแหน่ง GPS 📍🚗');

    dedWatchId = navigator.geolocation.watchPosition(
        pos => {
            const uLat = pos.coords.latitude;
            const uLng = pos.coords.longitude;
            liveUserCoords = { lat: uLat, lng: uLng };

            // เดิมถ้ายังไม่มีหมุด GPS จะไม่เกิดอะไรขึ้นเลย ตอนนี้สร้างให้อัตโนมัติ
            if (!dedUserMarker && dedMapInstance) {
                const beacon = L.divIcon({
                    className: 'custom-gps-icon',
                    html: '<div class="user-real-beacon" title="คุณอยู่ที่นี่"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });
                dedUserMarker = L.marker([uLat, uLng], { icon: beacon, zIndexOffset: 9999 })
                    .addTo(dedMapInstance).bindPopup('<b>📍 คุณอยู่ที่นี่</b>');
            } else if (dedUserMarker) {
                dedUserMarker.setLatLng([uLat, uLng]);
            }

            if (dedMapInstance) dedMapInstance.panTo([uLat, uLng], { animate: true, duration: 0.8 });
        },
        err => {
            console.warn('watchPosition error:', err);
            isDedNavigating = false;
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> เริ่มนำทางสด';
            showToast('กรุณากด Allow Location เพื่อนำทาง', 'error');
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
    );
}

function toggleDedicatedHudCollapse() {
    const hud = document.getElementById('dedicatedFloatingHud');
    const btn = document.getElementById('btnDedHudToggle');
    if (!hud) return;
    hud.classList.toggle('collapsed');
    const isCol = hud.classList.contains('collapsed');
    if (btn) btn.innerHTML = isCol ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
}


// ==================== Turn-by-Turn Navigation Steps Modal ====================
let navSteps = [];

function toggleStepListModal() {
    if (!navSteps || navSteps.length === 0) {
        showToast('กำลังประมวลผลขั้นตอนการนำทาง กรุณารอสักครู่...');
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

    const list = document.getElementById('navStepsList');
    if (list) {
        list.innerHTML = navSteps.map((st, i) => `
            <div class="turn-step-row" onclick="focusStepLocation(${st.location[0]}, ${st.location[1]})">
                <div class="step-num">${i + 1}</div>
                <div class="step-detail" style="flex: 1;">
                    <strong>${st.instruction}</strong>
                    <small>ประมาณ ${st.distance} เมตร</small>
                </div>
                <i class="fa-solid fa-angle-right" style="color: var(--faint); margin-top: 4px;"></i>
            </div>
        `).join('');
    }

    modal.classList.add('active');
}

function focusStepLocation(lat, lng) {
    const targetMap = dedMapInstance || inAppMap;
    if (targetMap) {
        const modal = document.getElementById('navStepsModal');
        if (modal) modal.classList.remove('active');
        targetMap.flyTo([lat, lng], 16, { duration: 1 });
    }
}

function copyGpsCoord(lat, lng) {
    const text = `${lat}, ${lng}`;

    // navigator.clipboard ใช้ได้เฉพาะ https/localhost เท่านั้น
    // ของเดิมถ้าเปิดผ่าน http:// จะ error เงียบๆ ไม่มีอะไรเกิดขึ้น
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('คัดลอกพิกัด GPS เรียบร้อยแล้ว!'))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('คัดลอกพิกัด GPS เรียบร้อยแล้ว!');
    } catch (e) {
        showToast(`คัดลอกไม่สำเร็จ พิกัดคือ ${text}`, 'error');
    }
}


// ==================== User Navbar Auth & Profile Logic ====================
function renderNavUserDropdown() {
    const navUserArea = document.getElementById('navUserArea');
    if (!navUserArea) return;

    const userJson = localStorage.getItem('phatthalung_user');
    
    // ถ้ายังไม่ได้ล็อกอิน ให้แสดงปุ่ม "เข้าสู่ระบบ" ปกติ
    if (!userJson) {
        navUserArea.innerHTML = `
            <a href="login.html" class="btn-login-pill">
                <i class="fa-solid fa-arrow-right-to-bracket"></i>
                <span>เข้าสู่ระบบ</span>
            </a>
        `;
        const mobileProfileLink = document.querySelector('.mobile-profile-link');
        const mobileAdminLink = document.querySelector('.mobile-admin-link');
        if (mobileProfileLink) mobileProfileLink.style.display = 'none';
        if (mobileAdminLink) mobileAdminLink.style.display = 'none';
        return;
    }

    let user = {};
    try {
        user = JSON.parse(userJson) || {};
    } catch(e) {
        user = {};
    }

    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
    const isAdmin = isCurrentUserAdmin();

    const adminMenuItem = isAdmin ? `
        <a href="admin.html" style="color: #f59e0b; font-weight: 600;"><i class="fa-solid fa-gauge-high"></i> ระบบหลังบ้าน (Admin)</a>
    ` : '';

    navUserArea.innerHTML = `
        <div class="user-dropdown-wrapper">
            <div class="user-pill-btn" onclick="document.getElementById('userProfileDropdown').classList.toggle('show')">
                <div class="avatar-badge">${initial}</div>
                <span>${user.name || (user.email ? user.email.split('@')[0] : 'ผู้ใช้งาน')}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem;"></i>
            </div>
            <div class="profile-dropdown-card" id="userProfileDropdown">
                <div class="dropdown-user-header">
                    <div class="dropdown-avatar-lg">${initial}</div>
                    <div class="dropdown-user-meta">
                        <strong>${user.name || 'ผู้ใช้งาน'}</strong>
                        <span>${user.email || ''}</span>
                    </div>
                </div>
                <div class="dropdown-menu-list">
                    <a href="profile.html"><i class="fa-solid fa-user"></i> โปรไฟล์ของฉัน</a>
                    <a href="favorites.html"><i class="fa-solid fa-heart" style="color: #ef4444;"></i> รายการโปรด</a>
                    ${adminMenuItem}
                    <a href="javascript:void(0)" onclick="logoutUser()" class="logout-action"><i class="fa-solid fa-arrow-right-from-bracket"></i> ออกจากระบบ</a>
                </div>
            </div>
        </div>
    `;

    const mobileProfileLink = document.querySelector('.mobile-profile-link');
    const mobileAdminLink = document.querySelector('.mobile-admin-link');
    if (mobileProfileLink) mobileProfileLink.style.display = 'flex';
    if (mobileAdminLink) mobileAdminLink.style.display = isAdmin ? 'flex' : 'none';
}

function logoutUser() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem('phatthalung_user');
        sessionStorage.removeItem('isAdminAuthed');
        showToast('ออกจากระบบเรียบร้อยแล้ว');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }
}


function initProfilePage() {
    const userJson = localStorage.getItem('phatthalung_user');
    let user = { name: "Nattakit", email: "nattakit@gmail.com", isAdmin: true };
    if (userJson) {
        try { user = JSON.parse(userJson); } catch(e) {}
    }

    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileDisplayEmail');
    const avatarEl = document.getElementById('profileAvatarLarge');
    const inputName = document.getElementById('profInputName');
    const inputEmail = document.getElementById('profInputEmail');
    const favCountEl = document.getElementById('profFavCount');
    const adminBtn = document.getElementById('profileAdminBtn');
    const roleBadge = document.getElementById('profileRoleBadge');

    const initial = (user.name || user.email || 'N').charAt(0).toUpperCase();
    const isAdmin = isCurrentUserAdmin();

    if (nameEl) nameEl.innerText = user.name || 'Nattakit';
    if (emailEl) emailEl.innerText = user.email || 'nattakit@gmail.com';
    if (avatarEl) avatarEl.innerText = initial;
    if (inputName) inputName.value = user.name || 'Nattakit';
    if (inputEmail) inputEmail.value = user.email || 'nattakit@gmail.com';
    if (favCountEl) favCountEl.innerText = favorites.length;

    if (adminBtn) adminBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    if (roleBadge) {
        roleBadge.className = isAdmin ? 'badge-role-admin' : 'badge-role-user';
        roleBadge.innerHTML = isAdmin ? '<i class="fa-solid fa-shield-halved"></i> ผู้ดูแลระบบ (Admin)' : '<i class="fa-solid fa-user"></i> สมาชิกนักเดินทาง';
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const userJson = localStorage.getItem('phatthalung_user');
    let user = userJson ? JSON.parse(userJson) : {};

    const readValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    const newEmail = readValue('profInputEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        return;
    }

    user.name = readValue('profInputName');
    user.email = newEmail;
    user.phone = readValue('profInputPhone');
    user.location = readValue('profInputLocation');
    user.bio = readValue('profInputBio');
    user.isAdmin = (newEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    localStorage.setItem('phatthalung_user', JSON.stringify(user));
    showToast('บันทึกการแก้ไขโปรไฟล์สำเร็จ!');
    renderNavUserDropdown();
    initProfilePage();
}


// ==================== Favorites Page & Toggle Sync ====================
function filterFavoritesPage() {
    const grid = document.getElementById('favoritesPageGrid');
    const countEl = document.getElementById('favTotalCount');
    const searchInput = document.getElementById('searchFavInput');
    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let favPlaces = PLACES.filter(p => favorites.includes(p.id));

    // ตัวเลือกอำเภอในหน้านี้สร้างจากเฉพาะที่อยู่ในรายการโปรด ไม่ใช่ทั้งจังหวัด
    populateDistrictOptions('favDistrictSelect', favPlaces);

    const favDistrictSelect = document.getElementById('favDistrictSelect');
    const selectedDistrict = favDistrictSelect ? favDistrictSelect.value : 'all';
    if (selectedDistrict !== 'all') {
        favPlaces = favPlaces.filter(p => p.district === selectedDistrict);
    }

    if (query) {
        favPlaces = favPlaces.filter(p =>
            (p.name || '').toLowerCase().includes(query) ||
            (p.district || '').toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query)
        );
    }

    if (countEl) countEl.innerText = favorites.length;

    if (favPlaces.length === 0) {
        if (favorites.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-heart" style="color: var(--rose); opacity: 1;"></i>
                    <h3>ยังไม่มีอะไรในรายการโปรด</h3>
                    <p>กดรูปหัวใจบนการ์ดสถานที่เพื่อเก็บไว้ดูทีหลัง</p>
                    <a href="places.html" class="btn btn-glow mt-3"><i class="fa-solid fa-compass"></i> ไปดูสถานที่ทั้งหมด</a>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>ไม่พบรายการโปรดที่ตรงกับคำค้นหา</h3>
                    <p>ลองพิมพ์ชื่อสถานที่หรืออำเภอแบบสั้นลง</p>
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
        if (typeof filterPlaces === 'function') filterPlaces();
        showToast('ล้างรายการโปรดทั้งหมดเรียบร้อยแล้ว');
    }
}

// ==================== Admin Dashboard Management ====================
function initAdminGate() {
    const authModal = document.getElementById('adminAuthModal');
    const dashboard = document.getElementById('adminDashboard');
    if (!authModal || !dashboard) return;

    const isAdmin = isCurrentUserAdmin();
    const isAuthed = sessionStorage.getItem('isAdminAuthed') === 'true';

    if (isAdmin || isAuthed) {
        authModal.style.display = 'none';
        dashboard.style.display = 'grid';
        updateAdminDashboardStats();
        renderAdminUsersTable();
    } else {
        authModal.style.display = 'flex';
        dashboard.style.display = 'none';
    }
}

// กด Enter ในช่องรหัสผ่านแล้วยืนยันได้เลย
function handleAdminKeyup(event) {
    if (event && event.key === 'Enter') handleAdminAuth();
}

function handleAdminAuth(e) {
    // เดิมเรียก e.preventDefault() ตรงๆ ถ้าเรียกจากปุ่มธรรมดา (ไม่มี event) จะพังทันที
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const input = document.getElementById('adminPassInput');
    if (!input) return;

    if (input.value.trim() === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminAuthed', 'true');
        const user = { name: "Nattakit", email: ADMIN_EMAIL, isAdmin: true };
        localStorage.setItem('phatthalung_user', JSON.stringify(user));
        document.getElementById('adminAuthModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'grid';
        updateAdminDashboardStats();
        renderAdminUsersTable();
        renderNavUserDropdown();
        showToast('ยืนยันรหัสผ่าน Admin สำเร็จ!');
    } else {
        showToast('รหัสผ่านแอดมินไม่ถูกต้อง!', 'error');
        input.value = '';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminAuthed');
    showToast('ออกจากระบบหลังบ้านแล้ว');
    setTimeout(() => window.location.href = 'index.html', 400);
}

function switchAdminTab(tab) {
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

    if (tab === 'places') {
        secPlaces.style.display = 'block';
        if (btnPlaces) btnPlaces.classList.add('active');
        renderAdminPlacesTable();
    } else if (tab === 'users') {
        secUsers.style.display = 'block';
        if (btnUsers) btnUsers.classList.add('active');
        renderAdminUsersTable();
    } else {
        secDash.style.display = 'block';
        if (btnDash) btnDash.classList.add('active');
        updateAdminDashboardStats();
    }
}

// ==================== บัญชีสมาชิก ====================
function loadAccounts() {
    try {
        const raw = JSON.parse(localStorage.getItem('phatthalung_accounts'));
        if (Array.isArray(raw)) return raw.filter(a => a && a.email);
    } catch (e) { /* ข้อมูลเสีย ใช้รายการว่าง */ }
    return [];
}

function saveAccounts(accounts) {
    try {
        localStorage.setItem('phatthalung_accounts', JSON.stringify(accounts));
        return true;
    } catch (e) {
        showToast('บันทึกข้อมูลสมาชิกไม่สำเร็จ (พื้นที่เก็บข้อมูลเต็ม)', 'error');
        return false;
    }
}

// รวมบัญชีที่สมัครไว้ เข้ากับบัญชีแอดมินและคนที่ล็อกอินอยู่ตอนนี้
function getAllUsers() {
    const accounts = loadAccounts();
    const list = accounts.map(a => ({
        name: a.name || (a.email ? a.email.split('@')[0] : 'ผู้ใช้งาน'),
        email: a.email,
        role: a.role || (a.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'member'),
        registeredAt: a.registeredAt || null
    }));

    // บัญชีแอดมินมีอยู่เสมอ แม้ไม่เคยกดสมัคร
    if (!list.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())) {
        list.unshift({ name: 'Nattakit', email: ADMIN_EMAIL, role: 'admin', registeredAt: null });
    }
    return list;
}

function formatThaiDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function getCurrentUserEmail() {
    try {
        const u = JSON.parse(localStorage.getItem('phatthalung_user'));
        return u && u.email ? u.email : null;
    } catch (e) { return null; }
}

// ==================== ภาพรวมระบบ ====================
function updateAdminDashboardStats() {
    const users = getAllUsers();

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    set('dashTotalPlaces', PLACES.length);
    set('sidePlaceCount', PLACES.length);
    set('dashTotalFavs', favorites.length);
    set('dashTotalUsers', users.length);
    set('sideUserCount', users.length);

    const rated = PLACES.filter(p => !isNaN(parseFloat(p.rating)));
    const avg = rated.length
        ? (rated.reduce((sum, p) => sum + parseFloat(p.rating), 0) / rated.length).toFixed(2)
        : '0';
    set('dashAvgRating', avg);

    renderBreakdown('dashCategoryList', 'category_name');
    renderBreakdown('dashDistrictList', 'district', 'อ.');
    renderTopRanking();
    renderDataHealth();
}

// แถบสัดส่วน — เดิม <b> อยู่นอก .cat-label ทำให้ตัวเลขตกลงมาใต้แถบ
function renderBreakdown(listId, field, prefix = '') {
    const list = document.getElementById(listId);
    if (!list) return;

    const counts = {};
    PLACES.forEach(p => {
        const key = (p[field] || 'ไม่ระบุ').trim();
        counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = PLACES.length || 1;

    if (entries.length === 0) {
        list.innerHTML = '<li class="form-hint">ยังไม่มีข้อมูล</li>';
        return;
    }

    list.innerHTML = entries.map(([key, count]) => `
        <li>
            <div class="cat-label">
                <span>${prefix}${key}</span>
                <b>${count} <small style="color: var(--faint);">(${Math.round((count / total) * 100)}%)</small></b>
            </div>
            <div class="bar-track"><div class="bar-progress" style="width: ${(count / total) * 100}%;"></div></div>
        </li>
    `).join('');
}

// รายการ 5 อันดับ — เดิมใช้ <img> ที่ไม่มีการกำหนดขนาด รูปจึงล้นกรอบจนข้อความซ้อนกัน
function renderTopRanking() {
    const list = document.getElementById('dashTopRankingList');
    if (!list) return;

    const top5 = [...PLACES]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

    if (top5.length === 0) {
        list.innerHTML = '<li class="form-hint">ยังไม่มีข้อมูล</li>';
        return;
    }

    list.innerHTML = top5.map((p, i) => `
        <li>
            <span class="rank-num">${i + 1}</span>
            <img class="rank-thumb" src="${p.image || FALLBACK_IMAGE}" alt="${p.name}">
            <div class="rank-info">
                <strong>${p.name}</strong>
                <small>อ.${p.district}</small>
            </div>
            <span class="score-pill"><i class="fa-solid fa-star"></i> ${p.rating}</span>
        </li>
    `).join('');
}

// ตรวจหาข้อมูลที่ขาดหรือผิดปกติ ซึ่งจะทำให้หน้าเว็บแสดงผลเพี้ยน
function renderDataHealth() {
    const list = document.getElementById('dashHealthList');
    if (!list) return;

    const badCoord = PLACES.filter(p => {
        const lat = parseFloat(p.lat), lng = parseFloat(p.lng);
        return isNaN(lat) || isNaN(lng) || lat < 7.0 || lat > 8.0 || lng < 99.6 || lng > 100.4;
    });
    const noImage = PLACES.filter(p => !p.image);
    const noHours = PLACES.filter(p => !p.hours);
    const noDesc = PLACES.filter(p => !p.description || p.description.length < 40);

    const seen = {};
    const dupCoord = [];
    PLACES.forEach(p => {
        const key = `${fmtCoord(p.lat, 4)},${fmtCoord(p.lng, 4)}`;
        if (seen[key]) dupCoord.push(p); else seen[key] = true;
    });

    const checks = [
        { label: 'พิกัดอยู่นอกเขตจังหวัดพัทลุง', items: badCoord, hint: 'กดนำทางแล้วจะพาไปผิดที่' },
        { label: 'พิกัดซ้ำกับที่อื่น', items: dupCoord, hint: 'หมุดจะทับกันบนแผนที่' },
        { label: 'ไม่มีรูปภาพ', items: noImage, hint: 'การ์ดจะใช้รูปสำรองแทน' },
        { label: 'ไม่ได้ระบุเวลาทำการ', items: noHours, hint: 'ผู้ใช้ไม่รู้ว่าเปิดวันไหน' },
        { label: 'คำอธิบายสั้นเกินไป', items: noDesc, hint: 'ต่ำกว่า 40 ตัวอักษร' }
    ];

    list.innerHTML = checks.map(c => {
        const ok = c.items.length === 0;
        const names = c.items.slice(0, 3).map(p => p.name).join(', ');
        const more = c.items.length > 3 ? ` และอีก ${c.items.length - 3} แห่ง` : '';
        return `
            <li class="health-row ${ok ? 'ok' : 'warn'}">
                <i class="fa-solid ${ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
                <div>
                    <strong>${c.label}</strong>
                    <small>${ok ? 'ไม่พบปัญหา' : `${c.items.length} แห่ง — ${names}${more} · ${c.hint}`}</small>
                </div>
                <b>${c.items.length}</b>
            </li>
        `;
    }).join('');
}

function renderAdminPlacesTable() {
    const tbody = document.getElementById('adminPlacesTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminPlaceSearch');
    const cat = document.getElementById('adminPlaceCatFilter');
    const sortEl = document.getElementById('adminPlaceSort');
    const query = search ? search.value.toLowerCase().trim() : '';
    const selectedCat = cat ? cat.value : 'all';
    const sortBy = sortEl ? sortEl.value : 'id';

    populateDistrictOptions('adminDistrictFilter');
    populateDistrictDatalist();
    const distEl = document.getElementById('adminDistrictFilter');
    const selectedDistrict = distEl ? distEl.value : 'all';

    let filtered = PLACES.filter(p => {
        const matchCat = (selectedCat === 'all' || p.category === selectedCat);
        const matchDistrict = (selectedDistrict === 'all' || p.district === selectedDistrict);
        const matchQuery = !query
            || (p.name || '').toLowerCase().includes(query)
            || (p.district || '').toLowerCase().includes(query);
        return matchCat && matchDistrict && matchQuery;
    });

    if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'));
    else if (sortBy === 'district') filtered.sort((a, b) => (a.district || '').localeCompare(b.district || '', 'th'));
    else filtered.sort((a, b) => (a.id || 0) - (b.id || 0));

    const summary = document.getElementById('adminPlacesSummary');
    if (summary) summary.innerText = `แสดง ${filtered.length} จาก ${PLACES.length} แห่ง`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--faint);">
            <i class="fa-solid fa-folder-open" style="font-size: 1.8rem; display: block; margin-bottom: 10px;"></i>
            ไม่พบข้อมูลสถานที่ตามเงื่อนไขที่เลือก
        </td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.image || FALLBACK_IMAGE}" class="table-thumb" alt="${p.name}"></td>
            <td>
                <strong>${p.name}</strong>
                ${p.hours ? '' : '<small style="display:block; color: var(--amber); font-size: 0.7rem;"><i class="fa-solid fa-triangle-exclamation"></i> ยังไม่ระบุเวลาทำการ</small>'}
            </td>
            <td>อ.${p.district}</td>
            <td><span class="place-category-badge" style="position: static;">${p.category_name || p.category}</span></td>
            <td><b style="font-family: 'IBM Plex Mono', monospace; color: var(--gold-lt);"><i class="fa-solid fa-star" style="font-size: 0.72rem;"></i> ${p.rating}</b></td>
            <td><small style="font-family: 'IBM Plex Mono', monospace; color: var(--faint);">${fmtCoord(p.lat, 3)}, ${fmtCoord(p.lng, 3)}</small></td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn-action-icon" onclick="previewPlace(${p.id})" title="ดูหน้าเว็บจริง"><i class="fa-solid fa-eye"></i></button>
                <button class="btn-action-icon" onclick="editPlace(${p.id})" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deletePlace(${p.id})" title="ลบ"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// เติมรายชื่ออำเภอที่มีอยู่ลงในช่องกรอก เพื่อลดการพิมพ์ชื่อผิดจนกลายเป็นอำเภอใหม่
function populateDistrictDatalist() {
    const dl = document.getElementById('districtOptions');
    if (!dl) return;
    const districts = [...new Set(PLACES.map(p => (p.district || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'th'));
    dl.innerHTML = districts.map(d => `<option value="${d}"></option>`).join('');
}

function previewPlace(id) {
    window.open(`places.html?preview=${id}`, '_blank');
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    const searchEl = document.getElementById('adminUserSearch');
    const roleEl = document.getElementById('adminUserRoleFilter');
    const query = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const roleFilter = roleEl ? roleEl.value : 'all';

    const all = getAllUsers();
    const currentEmail = getCurrentUserEmail();

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const setStat = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setStat('userStatTotal', all.length);
    setStat('userStatAdmin', all.filter(u => u.role === 'admin').length);
    setStat('userStatNew', all.filter(u => u.registeredAt && new Date(u.registeredAt).getTime() > thirtyDaysAgo).length);
    const me = currentEmail ? all.find(u => u.email.toLowerCase() === currentEmail.toLowerCase()) : null;
    setStat('userStatOnline', me ? me.name : (currentEmail || 'ยังไม่ได้เข้าสู่ระบบ'));

    const filtered = all.filter(u => {
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchQuery = !query
            || (u.name || '').toLowerCase().includes(query)
            || (u.email || '').toLowerCase().includes(query);
        return matchRole && matchQuery;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--faint);">
            <i class="fa-solid fa-user-slash" style="font-size: 1.8rem; display: block; margin-bottom: 10px;"></i>
            ${all.length === 0 ? 'ยังไม่มีใครสมัครสมาชิกบนเครื่องนี้' : 'ไม่พบสมาชิกตามเงื่อนไขที่เลือก'}
        </td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(u => {
        const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();
        const isAdmin = u.role === 'admin';
        const isProtected = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const isMe = currentEmail && u.email.toLowerCase() === currentEmail.toLowerCase();
        const safeEmail = u.email.replace(/'/g, "\\'");
        const lockAttr = isProtected ? 'disabled style="opacity: .35; cursor: not-allowed;"' : '';

        return `
        <tr>
            <td><div class="avatar-badge"${isAdmin ? ' style="background: linear-gradient(145deg, var(--gold-lt), var(--gold)); color: var(--ink);"' : ''}>${initial}</div></td>
            <td>
                <strong>${u.name}</strong>
                ${isMe ? '<small style="display: block; color: var(--jade); font-size: 0.72rem;">กำลังใช้งานอยู่</small>' : ''}
            </td>
            <td><small style="font-family: 'IBM Plex Mono', monospace; color: var(--sub);">${u.email}</small></td>
            <td>
                <span class="${isAdmin ? 'badge-role-admin' : 'badge-role-user'}">
                    <i class="fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-user'}"></i>
                    ${isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'}
                </span>
            </td>
            <td><small style="color: var(--faint);">${formatThaiDate(u.registeredAt)}</small></td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn-action-icon" onclick="toggleUserRole('${safeEmail}')" ${lockAttr}
                        title="${isProtected ? 'บัญชีแอดมินหลัก เปลี่ยนสิทธิ์ไม่ได้' : (isAdmin ? 'ลดเป็นสมาชิกทั่วไป' : 'เลื่อนเป็นผู้ดูแลระบบ')}">
                    <i class="fa-solid ${isAdmin ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </button>
                <button class="btn-action-icon" onclick="editUser('${safeEmail}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteUser('${safeEmail}')" ${lockAttr}
                        title="${isProtected ? 'ลบบัญชีแอดมินหลักไม่ได้' : 'ลบสมาชิก'}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function openUserModal() {
    const modal = document.getElementById('user-crud-modal');
    if (!modal) return;
    modal.classList.add('active');
    const form = document.getElementById('user-crud-form');
    if (form) form.reset();
    const orig = document.getElementById('user-original-email');
    if (orig) orig.value = '';
    const title = document.getElementById('user-crud-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: var(--gold);"></i> เพิ่มสมาชิก';
}

function closeUserModal() {
    const modal = document.getElementById('user-crud-modal');
    if (modal) modal.classList.remove('active');
}

function editUser(email) {
    const user = getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        showToast('ไม่พบสมาชิกรายนี้', 'error');
        return;
    }
    openUserModal();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('user-original-email', user.email);
    set('user-name', user.name);
    set('user-email', user.email);
    set('user-role', user.role);
    const title = document.getElementById('user-crud-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--gold);"></i> แก้ไขสมาชิก';
}

function handleUserSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const role = document.getElementById('user-role').value;
    const originalEmail = document.getElementById('user-original-email').value;

    if (!name) {
        showToast('กรุณากรอกชื่อที่ใช้แสดง', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        return;
    }

    let accounts = loadAccounts();
    const duplicate = accounts.some(a =>
        a.email.toLowerCase() === email.toLowerCase() &&
        a.email.toLowerCase() !== originalEmail.toLowerCase());
    if (duplicate) {
        showToast('อีเมลนี้มีอยู่ในระบบแล้ว', 'error');
        return;
    }

    if (originalEmail) {
        const idx = accounts.findIndex(a => a.email.toLowerCase() === originalEmail.toLowerCase());
        if (idx !== -1) accounts[idx] = { ...accounts[idx], name, email, role };
        else accounts.push({ name, email, role, registeredAt: new Date().toISOString() });
    } else {
        accounts.push({ name, email, role, registeredAt: new Date().toISOString() });
    }

    if (!saveAccounts(accounts)) return;

    closeUserModal();
    renderAdminUsersTable();
    updateAdminDashboardStats();
    showToast(originalEmail ? 'บันทึกข้อมูลสมาชิกแล้ว' : 'เพิ่มสมาชิกใหม่แล้ว');
}

function toggleUserRole(email) {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showToast('บัญชีแอดมินหลักเปลี่ยนสิทธิ์ไม่ได้', 'error');
        return;
    }

    let accounts = loadAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
        showToast('ไม่พบสมาชิกรายนี้', 'error');
        return;
    }

    const next = (accounts[idx].role || 'member') === 'admin' ? 'member' : 'admin';
    if (next === 'admin' && !confirm(`ให้สิทธิ์ผู้ดูแลระบบกับ ${accounts[idx].name || email}?\n\nผู้ดูแลระบบจะเพิ่ม แก้ไข และลบข้อมูลสถานที่ได้ทั้งหมด`)) return;

    accounts[idx].role = next;
    if (!saveAccounts(accounts)) return;

    renderAdminUsersTable();
    updateAdminDashboardStats();
    showToast(next === 'admin' ? 'เลื่อนเป็นผู้ดูแลระบบแล้ว' : 'ลดเป็นสมาชิกทั่วไปแล้ว');
}

function deleteUser(email) {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showToast('ลบบัญชีแอดมินหลักไม่ได้', 'error');
        return;
    }

    const user = getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!confirm(`ลบสมาชิก "${user ? user.name : email}" ออกจากระบบ?\n\nการลบนี้ย้อนกลับไม่ได้`)) return;

    const accounts = loadAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
    if (!saveAccounts(accounts)) return;

    const current = getCurrentUserEmail();
    if (current && current.toLowerCase() === email.toLowerCase()) {
        localStorage.removeItem('phatthalung_user');
    }

    renderAdminUsersTable();
    updateAdminDashboardStats();
    showToast('ลบสมาชิกเรียบร้อยแล้ว');
}

function exportUsersCSV() {
    const users = getAllUsers();
    if (users.length === 0) {
        showToast('ยังไม่มีข้อมูลสมาชิกให้ส่งออก', 'error');
        return;
    }

    const esc = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = [['ชื่อ', 'อีเมล', 'สิทธิ์', 'วันที่สมัคร']];
    users.forEach(u => rows.push([
        u.name, u.email,
        u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป',
        formatThaiDate(u.registeredAt)
    ]));

    // \ufeff คือ BOM ทำให้ Excel เปิดไฟล์แล้วอ่านภาษาไทยไม่เป็นตัวต่างดาว
    const csv = '\ufeff' + rows.map(r => r.map(esc).join(',')).join('\n');
    downloadFile(csv, `members-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    showToast(`ส่งออกข้อมูลสมาชิก ${users.length} รายแล้ว`);
}

// ==================== สำรอง / กู้คืนข้อมูล ====================
function downloadFile(content, filename, mime) {
    try {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
        showToast('ดาวน์โหลดไฟล์ไม่สำเร็จ', 'error');
    }
}

function exportPlacesJSON() {
    if (PLACES.length === 0) {
        showToast('ยังไม่มีข้อมูลให้สำรอง', 'error');
        return;
    }
    const payload = {
        exportedAt: new Date().toISOString(),
        schemaVersion: DB_SCHEMA_VERSION,
        count: PLACES.length,
        places: PLACES
    };
    downloadFile(JSON.stringify(payload, null, 2),
        `phatthalung-places-${new Date().toISOString().slice(0, 10)}.json`,
        'application/json');
    showToast(`สำรองข้อมูล ${PLACES.length} แห่งแล้ว`);
}

function importPlacesJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            const incoming = Array.isArray(data) ? data : data.places;

            if (!Array.isArray(incoming) || incoming.length === 0) {
                showToast('ไฟล์นี้ไม่มีข้อมูลสถานที่', 'error');
                return;
            }

            const valid = incoming.filter(p =>
                p && p.name && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)));

            if (valid.length === 0) {
                showToast('ข้อมูลในไฟล์ไม่ถูกต้อง ต้องมีชื่อและพิกัดครบ', 'error');
                return;
            }

            const skipped = incoming.length - valid.length;
            const msg = `กู้คืนข้อมูล ${valid.length} แห่ง แทนที่ข้อมูลปัจจุบัน ${PLACES.length} แห่ง?`
                + (skipped ? `\n\nมี ${skipped} รายการที่ข้อมูลไม่ครบและจะถูกข้าม` : '')
                + '\n\nแนะนำให้กดสำรองข้อมูลปัจจุบันไว้ก่อน';
            if (!confirm(msg)) return;

            // ออก id ใหม่ให้เรียงกัน กันไฟล์ที่มี id ซ้ำหรือหายไป
            PLACES = valid.map((p, i) => ({ ...p, id: i + 1 }));
            savePlacesToStorage();

            // ตัดรายการโปรดที่ชี้ไปยัง id ที่ไม่มีแล้วออก
            const ids = PLACES.map(p => p.id);
            favorites = favorites.filter(f => ids.includes(f));
            localStorage.setItem('phatthalung_favs', JSON.stringify(favorites));

            updateAdminDashboardStats();
            renderAdminPlacesTable();
            showToast(`กู้คืนข้อมูล ${PLACES.length} แห่งเรียบร้อยแล้ว`);
        } catch (err) {
            showToast('อ่านไฟล์ไม่สำเร็จ ต้องเป็นไฟล์ JSON ที่ถูกต้อง', 'error');
        } finally {
            event.target.value = '';
        }
    };
    reader.onerror = () => {
        showToast('อ่านไฟล์ไม่สำเร็จ', 'error');
        event.target.value = '';
    };
    reader.readAsText(file);
}

function openPlaceModal() {
    const modal = document.getElementById('place-crud-modal');
    if (!modal) return;

    modal.classList.add('active');
    const form = document.getElementById('place-crud-form');
    if (form) form.reset();
    const idField = document.getElementById('modal-place-id');
    if (idField) idField.value = '';

    populateDistrictDatalist();

    const title = document.getElementById('modal-crud-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-plus" style="color: var(--gold);"></i> เพิ่มสถานที่ใหม่';
}

function closePlaceModal() {
    const modal = document.getElementById('place-crud-modal');
    if (modal) modal.classList.remove('active');
}

function editPlace(id) {
    const place = PLACES.find(p => p.id === id);
    if (!place) {
        showToast('ไม่พบข้อมูลสถานที่ที่ต้องการแก้ไข', 'error');
        return;
    }

    openPlaceModal();

    const setValue = (elId, value) => {
        const el = document.getElementById(elId);
        if (el) el.value = value !== undefined && value !== null ? value : '';
    };

    setValue('modal-place-id', place.id);
    setValue('modal-place-name', place.name);
    setValue('modal-place-district', place.district);
    setValue('modal-place-category', place.category);
    setValue('modal-place-rating', place.rating);
    setValue('modal-place-lat', place.lat);
    setValue('modal-place-lng', place.lng);
    setValue('modal-place-image', place.image);
    setValue('modal-place-desc', place.description);
    setValue('modal-place-highlight', place.highlight);
    setValue('modal-place-hours', place.hours);
    setValue('modal-place-fee', place.fee);

    const title = document.getElementById('modal-crud-title');
    if (title) title.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--gold);"></i> แก้ไขสถานที่';
}

function deletePlace(id) {
    const place = PLACES.find(p => p.id === id);
    const label = place ? `"${place.name}"` : 'นี้';

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่ ${label}?`)) {
        PLACES = PLACES.filter(p => p.id !== id);
        savePlacesToStorage();

        // ลบออกจากรายการโปรดด้วย ไม่งั้นตัวนับรายการโปรดจะค้างที่จำนวนเดิมตลอด
        if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
            localStorage.setItem('phatthalung_favs', JSON.stringify(favorites));
        }

        updateAdminDashboardStats();
        renderAdminPlacesTable();
        populateDistrictOptions('adminDistrictFilter');
        showToast('ลบสถานที่เรียบร้อยแล้ว');
    }
}

function handlePlaceSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-place-id').value;
    const cat = document.getElementById('modal-place-category').value;
    const catMap = { nature: 'ธรรมชาติ', adventure: 'ผจญภัย', culture: 'วัฒนธรรม', food: 'อาหาร', family: 'ครอบครัว' };

    const lat = parseFloat(document.getElementById('modal-place-lat').value);
    const lng = parseFloat(document.getElementById('modal-place-lng').value);
    const rating = parseFloat(document.getElementById('modal-place-rating').value);

    // ของเดิมบันทึก NaN ลงฐานข้อมูลได้ ทำให้แผนที่และตารางพังตามไปด้วย
    if (isNaN(lat) || lat < -90 || lat > 90) {
        showToast('ค่าละติจูด (lat) ไม่ถูกต้อง ต้องอยู่ระหว่าง -90 ถึง 90', 'error');
        return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
        showToast('ค่าลองจิจูด (lng) ไม่ถูกต้อง ต้องอยู่ระหว่าง -180 ถึง 180', 'error');
        return;
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
        showToast('คะแนนต้องอยู่ระหว่าง 1.0 ถึง 5.0', 'error');
        return;
    }

    const placeData = {
        name: document.getElementById('modal-place-name').value.trim(),
        district: document.getElementById('modal-place-district').value.trim(),
        category: cat,
        category_name: catMap[cat] || cat,
        lat: lat,
        lng: lng,
        rating: rating,
        image: document.getElementById('modal-place-image').value.trim(),
        description: document.getElementById('modal-place-desc').value.trim(),
        highlight: document.getElementById('modal-place-highlight').value.trim()
    };

    // ช่องที่เพิ่มเข้ามาใหม่ ถ้าปล่อยว่างให้คงค่าเดิมไว้ ไม่ใช่เขียนทับด้วยค่าว่าง
    const optional = { hours: 'modal-place-hours', fee: 'modal-place-fee' };
    Object.keys(optional).forEach(key => {
        const el = document.getElementById(optional[key]);
        if (el && el.value.trim()) placeData[key] = el.value.trim();
    });

    // ไม่ให้ข้อมูลรายละเอียด (เวลาทำการ/ค่าเข้า/สิ่งอำนวยความสะดวก) หายตอนแก้ไขผ่านฟอร์ม
    // เพราะฟอร์มไม่มีช่องกรอกฟิลด์เหล่านี้

    if (id) {
        const idx = PLACES.findIndex(p => p.id === parseInt(id, 10));
        if (idx !== -1) PLACES[idx] = { ...PLACES[idx], ...placeData };
    } else {
        const numericIds = PLACES.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n));
        const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        PLACES.unshift({ id: newId, reviews: 0, ...placeData });
    }

    savePlacesToStorage();
    closePlaceModal();
    updateAdminDashboardStats();
    renderAdminPlacesTable();
    showToast('บันทึกข้อมูลสถานที่สำเร็จ!');
}

function loadPreset(style, duration) {
    const styleEl = document.getElementById('tripStyle');
    const durationEl = document.getElementById('tripDuration');
    if (!styleEl || !durationEl) return;

    styleEl.value = style;
    durationEl.value = duration.toString();

    // ถ้า select ไม่มี option ตรงกับค่าที่ส่งมา ค่าจะกลายเป็นว่าง ต้องเช็คก่อน
    if (!styleEl.value) styleEl.value = 'adventure';
    if (!durationEl.value) durationEl.value = '1';

    generateAIRoute();
}


// register.html เรียก handleRegister(event) แต่ฟังก์ชันนี้ไม่เคยถูกเขียนไว้
// ผลคือกดสมัครสมาชิกแล้วหน้าเว็บรีเฟรชเฉยๆ ไม่มีอะไรเกิดขึ้น
function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = document.getElementById('btnRegister');

    if (!name) {
        showToast('กรุณากรอกชื่อของคุณ', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showToast('รหัสผ่านทั้งสองช่องไม่ตรงกัน', 'error');
        return;
    }

    const resetBtn = () => {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>สมัครสมาชิก</span> <i class="fa-solid fa-arrow-right"></i>';
        }
    };

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังสร้างบัญชี...';
    }

    setTimeout(() => {
        let accounts = [];
        try {
            const raw = JSON.parse(localStorage.getItem('phatthalung_accounts'));
            if (Array.isArray(raw)) accounts = raw;
        } catch (e) {
            accounts = [];
        }

        const exists = accounts.some(a => a.email && a.email.toLowerCase() === email.toLowerCase());
        if (exists || email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            showToast('อีเมลนี้ถูกใช้สมัครไปแล้ว', 'error');
            resetBtn();
            return;
        }

        accounts.push({ name: name, email: email, role: 'member', registeredAt: new Date().toISOString() });
        localStorage.setItem('phatthalung_accounts', JSON.stringify(accounts));

        const userData = {
            name: name,
            email: email,
            avatarInitial: name.charAt(0).toUpperCase(),
            isAdmin: false
        };
        localStorage.setItem('phatthalung_user', JSON.stringify(userData));
        sessionStorage.removeItem('isAdminAuthed');

        showToast('สมัครสมาชิกสำเร็จ ยินดีต้อนรับ! 🎉');
        setTimeout(() => window.location.href = 'index.html', 600);
    }, 400);
}

// login.html มีฟังก์ชันนี้เขียนซ้ำอยู่ในหน้า ย้ายมาไว้ตรงกลางให้ทุกหน้าใช้ได้
function togglePasswordVisibility(fieldId, btn) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const isHidden = field.type === 'password';
    field.type = isHidden ? 'text' : 'password';
    if (btn) {
        btn.innerHTML = isHidden
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const btn = document.getElementById('btnLogin');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังเข้าสู่ระบบ...';
    }

    setTimeout(() => {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            if (password === ADMIN_PASSWORD) {
                const adminData = {
                    name: "Nattakit",
                    email: ADMIN_EMAIL,
                    avatarInitial: "N",
                    isAdmin: true
                };
                localStorage.setItem('phatthalung_user', JSON.stringify(adminData));
                sessionStorage.setItem('isAdminAuthed', 'true');
                showToast('เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ!');
                setTimeout(() => window.location.href = 'index.html', 500);
                return;
            } else {
                showToast('รหัสผ่าน Admin ไม่ถูกต้อง (รหัสผ่านคือ 123456)', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<span>เข้าสู่ระบบ</span> <i class="fa-solid fa-arrow-right"></i>';
                }
                return;
            }
        }

        if (email && password.length >= 6) {
            // ถ้าเคยสมัครสมาชิกไว้ ให้ดึงชื่อจริงมาใช้แทนการตัดข้อความหน้า @
            let displayName = email.split('@')[0];
            try {
                const accounts = JSON.parse(localStorage.getItem('phatthalung_accounts'));
                if (Array.isArray(accounts)) {
                    const found = accounts.find(a => a.email && a.email.toLowerCase() === email.toLowerCase());
                    if (found && found.name) displayName = found.name;
                }
            } catch (e) { /* ใช้ค่าเริ่มต้น */ }

            const userData = {
                name: displayName,
                email: email,
                avatarInitial: displayName.charAt(0).toUpperCase(),
                isAdmin: false
            };
            localStorage.setItem('phatthalung_user', JSON.stringify(userData));
            sessionStorage.removeItem('isAdminAuthed');

            // บันทึกลงรายชื่อสมาชิกถ้ายังไม่มี ไม่งั้นคนที่ล็อกอินตรงๆ จะไม่ขึ้นในหน้าแอดมิน
            const accounts = loadAccounts();
            if (!accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
                accounts.push({
                    name: displayName,
                    email: email,
                    role: 'member',
                    registeredAt: new Date().toISOString()
                });
                saveAccounts(accounts);
            }

            showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
            setTimeout(() => window.location.href = 'index.html', 500);
        } else {
            showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร)', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>เข้าสู่ระบบ</span> <i class="fa-solid fa-arrow-right"></i>';
            }
        }
    }, 400);
}
