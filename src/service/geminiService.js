const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType,
        },
    };
}

async function generateGoStruct(inputData, type = 'image') {
    // Gunakan model flash-latest agar lebih stabil
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // System Prompt: Kunci agar outputnya presisi
    const prompt = `
        Anda adalah pakar backend developer Golang. 
        Tugas Anda adalah menganalisis INPUT yang diberikan. Input bisa berupa:
        1. Gambar (Screenshot UI atau DDL SQL).
        2. Teks (Raw SQL, JSON, atau skema lain).
        
        Ekstrak semua field yang ada dan buatkan Struct Golang yang idiomatik:
        1. Gunakan PascalCase untuk nama field.
        2. Tambahkan tag json dalam snake_case.
        3. Jika gambar terlihat seperti skema database, tambahkan tag db.
        
        Hanya berikan kode saja, tanpa penjelasan basa-basi di awal atau di akhir.
    `;

    let parts = [prompt];

    if (type === 'image') {
        // Jika input adalah path file gambar
        const imagePart = fileToGenerativePart(inputData.path, inputData.mimeType);
        parts.push(imagePart);
    } else {
        // Jika input adalah text raw
        parts.push(`INPUT DATA:\n${inputData}`);
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
}

module.exports = { generateGoStruct };