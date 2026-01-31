require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

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
    if (!req.file) {
      return res.status(400).send('Tidak ada file yang diunggah.');
    }

    // Nanti di sini kita panggil geminiService
    console.log('File diterima:', req.file.path);
    
    res.json({ 
      message: "Gambar berhasil diterima!",
      filePath: req.file.path 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});