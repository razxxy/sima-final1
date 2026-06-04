const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, email, nim, prodi, angkatan, no_hp, foto, role, status_magang FROM users WHERE id=?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama, no_hp, prodi, angkatan } = req.body;
    await pool.query(
      'UPDATE users SET nama=?, no_hp=?, prodi=?, angkatan=? WHERE id=?',
      [nama, no_hp || null, prodi || null, angkatan || null, req.user.id]
    );
    res.json({ message: 'Profil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadFoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File foto wajib diupload' });

    const [rows] = await pool.query('SELECT foto FROM users WHERE id=?', [req.user.id]);
    if (rows[0].foto && fs.existsSync(rows[0].foto)) fs.unlinkSync(rows[0].foto);

    const filePath = req.file.path.replace(/\\/g, '/');
    await pool.query('UPDATE users SET foto=? WHERE id=?', [filePath, req.user.id]);
    res.json({ message: 'Foto profil diperbarui', foto: filePath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFoto = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT foto FROM users WHERE id=?', [req.user.id]);
    if (rows[0].foto && fs.existsSync(rows[0].foto)) fs.unlinkSync(rows[0].foto);
    await pool.query('UPDATE users SET foto=NULL WHERE id=?', [req.user.id]);
    res.json({ message: 'Foto profil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password_lama, password_baru } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id=?', [req.user.id]);
    const valid = await bcrypt.compare(password_lama, rows[0].password);
    if (!valid) return res.status(400).json({ message: 'Password lama salah' });

    const hashed = await bcrypt.hash(password_baru, 10);
    await pool.query('UPDATE users SET password=? WHERE id=?', [hashed, req.user.id]);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};