# 🔊 คู่มือตั้งค่าเสียง AI (Azure TTS + Cloudflare Worker)

เสียงผู้หญิงไทย **Premwadee** คุณภาพสูง โดย **ไม่ต้องผูกบัตรเครดิต**
เว็บจะเรียกเสียงผ่าน Cloudflare Worker ที่ซ่อน API Key ไว้ให้ปลอดภัย
ถ้ายังไม่ตั้งค่า หรือเน็ตหลุด เว็บจะใช้เสียงในเบราว์เซอร์แทนอัตโนมัติ — ไม่พังแน่นอน

---

## ขั้นที่ 1 — ขอ API Key จาก Azure (ฟรี)

1. เข้า https://azure.microsoft.com/free/students (นักศึกษา ใช้อีเมลสถานศึกษา ได้เครดิตฟรีไม่ต้องใช้บัตร)
   หรือ https://azure.microsoft.com/free สำหรับบัญชีทั่วไป
2. เข้า **Azure Portal** → ค้นหา **"Speech services"** → กด **Create**
3. ตั้งค่า:
   - Resource group: สร้างใหม่ ตั้งชื่ออะไรก็ได้
   - Region: เลือก **Southeast Asia** (ใกล้ไทย เสียงมาเร็ว)
   - Name: เช่น `ptl-tts`
   - Pricing tier: เลือก **Free F0** (ฟรี 500,000 ตัวอักษร/เดือน)
4. กด Create รอสักครู่ → เข้าไปที่ resource ที่สร้าง
5. เมนูซ้าย **Keys and Endpoint** → ก๊อป **KEY 1** และจำ **Location/Region** ไว้ (เช่น `southeastasia`)

---

## ขั้นที่ 2 — สร้าง Cloudflare Worker (ฟรี ไม่ต้องผูกบัตร)

1. สมัคร https://dash.cloudflare.com/sign-up (ใช้อีเมลอย่างเดียว)
2. เมนูซ้าย **Workers & Pages** → **Create** → **Create Worker**
3. ตั้งชื่อ เช่น `ptl-tts` → **Deploy** (มันจะสร้างตัวอย่างก่อน)
4. กด **Edit code** → ลบโค้ดเดิมทั้งหมด → วางโค้ดจากไฟล์ **`cloudflare-worker.js`** ทั้งไฟล์ → **Deploy**

### ใส่ Key แบบปลอดภัย (Environment Variables)
5. กลับหน้า Worker → แท็บ **Settings** → **Variables and Secrets**
6. เพิ่ม 2 ตัว (แนะนำเลือกชนิด **Secret** สำหรับ AZURE_KEY):
   | ชื่อ | ค่า |
   |------|-----|
   | `AZURE_KEY` | KEY 1 ที่ก๊อปจาก Azure |
   | `AZURE_REGION` | region ของคุณ เช่น `southeastasia` |
7. กด **Deploy** อีกครั้งให้ค่ามีผล

---

## ขั้นที่ 3 — เชื่อมกับเว็บ

1. ก๊อป **URL ของ Worker** (อยู่หน้า Worker เช่น `https://ptl-tts.ชื่อคุณ.workers.dev`)
2. เปิดไฟล์ **`places-data.js`** บรรทัดบน ๆ จะเห็น:
   ```js
   window.TTS_WORKER_URL = "";
   ```
   ใส่ URL ลงไปในเครื่องหมายคำพูด:
   ```js
   window.TTS_WORKER_URL = "https://ptl-tts.ชื่อคุณ.workers.dev";
   ```
3. บันทึกไฟล์ → เปิดเว็บ → กดปุ่ม **🔊 ฟัง AI เล่า** ในหน้าสถานที่

เสร็จแล้ว! ถ้าตั้งค่าถูก จะได้ยินเสียง Premwadee อ่านให้ฟัง 🎉

---

## เปลี่ยนเสียงเป็นผู้ชาย (ถ้าต้องการ)

ในไฟล์ `app.js` และ `category.js` ค้นหา `PremwadeeNeural` แล้วเปลี่ยนเป็น:
- ผู้ชาย: `th-TH-NiwatNeural`
- เสียงอื่น: `th-TH-AcharaNeural` (หญิง อีกโทน)

---

## เช็กเมื่อไม่มีเสียง

เปิดเว็บ กด **F12** → แท็บ **Console**:
- ถ้าเห็น error เกี่ยวกับ `worker-401` หรือ `worker-403` → Key ผิด หรือ region ไม่ตรง กลับไปแก้ Variables ในขั้นที่ 2
- ถ้าเห็น `worker-429` → ใช้โควตา Azure หมดเดือนนี้ (เดี๋ยวเดือนหน้ารีเซ็ต) ระหว่างนี้เว็บจะใช้เสียงเบราว์เซอร์แทนให้เอง
- ถ้าไม่มี error แต่ยังเป็นเสียงเบราว์เซอร์ → ตรวจว่าใส่ `TTS_WORKER_URL` ถูกต้อง และ URL ไม่มี `/` ต่อท้าย

---

## เรื่องค่าใช้จ่าย (สำคัญ)

- **Azure Free F0**: ฟรี 500,000 ตัวอักษร/เดือน — โครงงานใช้ไม่ถึงเศษเสี้ยว ไม่มีบัตรก็ใช้ได้
- **Cloudflare Worker**: ฟรี 100,000 requests/วัน — เหลือเฟือ
- Worker ตั้งให้ **แคชเสียงเดิมไว้ 1 วัน** สถานที่ที่มีคนกดฟังแล้ว กดซ้ำจะไม่กินโควตา Azure เพิ่ม
- ทั้งสองเจ้า **ไม่ตัดเงินอัตโนมัติ** ถ้าเกินโควตาฟรีมันจะหยุดให้บริการ ไม่ใช่เรียกเก็บเงิน — สบายใจได้สำหรับโครงงาน
