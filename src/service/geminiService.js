const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Inisialisasi API dengan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Mengubah path file lokal menjadi objek yang dipahami Gemini
 */
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType,
        },
    };
}

async function generateGoStruct(imagePath, mimeType) {
    // Gunakan model flash karena cepat dan sangat baik untuk vision task sederhana
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // System Prompt: Kunci agar outputnya presisi
    const prompt = `
    Anda adalah pakar backend developer Golang. 
    Tugas Anda adalah menganalisis gambar yang diberikan (bisa berupa UI formulir, skema database, atau DDL SQL).
    
    Ekstrak semua field yang ada dan buatkan Struct Golang yang idiomatik:
    1. Gunakan PascalCase untuk nama field.
    2. Tambahkan tag json dalam snake_case.
    3. Jika gambar terlihat seperti skema database, tambahkan tag gorm.
    4. Jika ada field seperti email, password, atau umur, tambahkan tag 'binding' untuk validasi (misal: binding:"required,email").
    5. Gunakan tipe data Go yang tepat (misal: time.Time untuk tanggal, google/uuid untuk ID).
    
    Hanya berikan kode saja, tanpa penjelasan basa-basi di awal atau di akhir.
  `;

    const imagePart = fileToGenerativePart(imagePath, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
}

module.exports = { generateGoStruct };