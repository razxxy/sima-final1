const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Email atau password salah' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email atau password salah' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role, foto: user.foto } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { nama, email, password, nim, prodi, angkatan, no_hp } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });

    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) return res.status(400).json({ message: 'Email sudah digunakan' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (nama, email, password, role, nim, prodi, angkatan, no_hp) VALUES (?,?,?,?,?,?,?,?)',
      [nama, email, hashed, 'mahasiswa', nim || null, prodi || null, angkatan || null, no_hp || null]
    );

    res.status(201).json({ message: 'Registrasi berhasil, silakan login' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};