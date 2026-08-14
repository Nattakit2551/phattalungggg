/* ═══════════════════════════════════════════════════════════
   Cloudflare Worker — ตัวกลางเรียก Azure Text-to-Speech
   ซ่อน API Key ไว้บนเซิร์ฟเวอร์ ไม่โผล่ในโค้ดหน้าเว็บ
   ───────────────────────────────────────────────────────────
   วิธีใช้ (สรุป — ดูคู่มือเต็มในไฟล์ SETUP-เสียง-AI.md):
     1. สมัคร Cloudflare (ฟรี ไม่ต้องผูกบัตร)
     2. สร้าง Worker ใหม่ วางโค้ดนี้ทั้งหมด
     3. ตั้งค่า Environment Variables 2 ตัว:
          AZURE_KEY    = คีย์จาก Azure Speech Service
          AZURE_REGION = รีเจียนของคุณ เช่น southeastasia
     4. Deploy แล้วเอา URL ของ Worker ไปใส่ใน cloud.js (ตัวแปร TTS_WORKER_URL)
   ═══════════════════════════════════════════════════════════ */

export default {
  async fetch(request, env) {
    /* ── CORS: อนุญาตให้หน้าเว็บเรียกได้ ── */
    const cors = {
      "Access-Control-Allow-Origin": "*",              // ใช้งานจริงควรใส่โดเมนเว็บคุณแทน *
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("ใช้ POST เท่านั้น", { status: 405, headers: cors });

    try {
      const { text, voice } = await request.json();

      /* กันข้อความยาวเกิน / ว่างเปล่า */
      if (!text || typeof text !== "string")
        return json({ error: "ไม่มีข้อความ" }, 400, cors);
      const clean = text.slice(0, 3000);               // จำกัดความยาวกันโดนถล่ม

      const region = env.AZURE_REGION || "southeastasia";
      const voiceName = voice || "th-TH-PremwadeeNeural";

      /* ── ประกอบ SSML ── */
      const ssml =
        `<speak version='1.0' xml:lang='th-TH'>` +
        `<voice name='${voiceName}'>` +
        `<prosody rate='0%' pitch='0%'>${escapeXml(clean)}</prosody>` +
        `</voice></speak>`;

      /* ── ยิงไปที่ Azure ── */
      const azureRes = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": env.AZURE_KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "phatthalung-guide",
          },
          body: ssml,
        }
      );

      if (!azureRes.ok) {
        const detail = await azureRes.text();
        return json({ error: "Azure ตอบกลับผิดพลาด", status: azureRes.status, detail }, 502, cors);
      }

      /* ── ส่งไฟล์เสียง mp3 กลับไปให้หน้าเว็บเล่น ── */
      return new Response(azureRes.body, {
        headers: {
          ...cors,
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",     // แคชเสียงเดิม 1 วัน ประหยัดโควตา
        },
      });
    } catch (err) {
      return json({ error: "เกิดข้อผิดพลาด", detail: String(err) }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
function escapeXml(s) {
  return s.replace(/[<>&'"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );
}
