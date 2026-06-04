const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const laporanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/laporan';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `laporan_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/foto';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `foto_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const laporanFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Hanya file PDF/DOC/DOCX yang diperbolehkan'));
};

const fotoFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Hanya file gambar yang diperbolehkan'));
};

exports.uploadLaporan = multer({ storage: laporanStorage, fileFilter: laporanFilter, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadFoto = multer({ storage: fotoStorage, fileFilter: fotoFilter, limits: { fileSize: 2 * 1024 * 1024 } });