require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const { generateGoStruct } = require('./service/geminiService');

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public')); // Sajikan file statis (HTML/CSS)
app.use(express.json());

// Endpoint untuk Upload dan Generate
app.post('/generate', (req, res, next) => {
    // Wrapper agar Multer tidak langsung throw error ke user jika file kosong
    upload.single('image')(req, res, (err) => {
        if (err) {
            // Error multer spesifik (misal file terlalu besar)
            return res.status(400).json({ error: err.message });
        }
        next(); // Lanjut ke controller utama kita
    });
}, async (req, res) => {
    try {
        let goCode = "";

        // Cek Mode: Apakah ada file?
        if (req.file) {
            console.log('Processing Image Mode...');
            goCode = await generateGoStruct({
                path: req.file.path,
                mimeType: req.file.mimetype
            }, 'image');

            // Bersihkan file
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        // Cek Mode: Apakah ada text input?
        else if (req.body.textInput) {
            console.log('Processing Text Mode...');
            goCode = await generateGoStruct(req.body.textInput, 'text');
        }
        else {
            // Jika keduanya kosong
            return res.status(400).json({ error: 'Harap upload gambar atau masukkan teks.' });
        }

        res.json({
            success: true,
            data: goCode
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Gagal memproses permintaan: " + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});