require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/mahasiswa', require('./routes/mahasiswa'));
app.use('/api/perusahaan', require('./routes/perusahaan'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => res.json({ message: 'SIMA API Running' }));

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
}).catch(err => {
  console.error('Gagal inisialisasi DB:', err);
  process.exit(1);
});