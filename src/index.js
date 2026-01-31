require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const { generateGoStruct } = require('./services/geminiService');

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
app.post('/generate', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded.');

        // Panggil service
        const goCode = await generateGoStruct(req.file.path, req.file.mimetype);

        // Hapus file setelah diproses agar tidak memenuhi storage
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            data: goCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal memproses gambar" });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});