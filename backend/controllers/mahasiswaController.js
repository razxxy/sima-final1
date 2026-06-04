const { pool } = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const like = `%${search}%`;

    const [rows] = await pool.query(
      `SELECT id, nama, email, nim, prodi, angkatan, no_hp, status_magang, foto, created_at
       FROM users WHERE role='mahasiswa' AND (nama LIKE ? OR nim LIKE ? OR prodi LIKE ?)
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [like, like, like, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE role='mahasiswa' AND (nama LIKE ? OR nim LIKE ? OR prodi LIKE ?)`,
      [like, like, like]
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nama, email, nim, prodi, angkatan, no_hp, status_magang, foto FROM users WHERE id=? AND role='mahasiswa'`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, email, password, nim, prodi, angkatan, no_hp, status_magang } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ message: 'Nama, email, password wajib diisi' });

    const [exist] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (exist.length > 0) return res.status(400).json({ message: 'Email sudah digunakan' });

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (nama, email, password, role, nim, prodi, angkatan, no_hp, status_magang) VALUES (?,?,?,?,?,?,?,?,?)`,
      [nama, email, hashed, 'mahasiswa', nim || null, prodi || null, angkatan || null, no_hp || null, status_magang || 'belum']
    );
    res.status(201).json({ message: 'Mahasiswa berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nama, nim, prodi, angkatan, no_hp, status_magang } = req.body;
    await pool.query(
      `UPDATE users SET nama=?, nim=?, prodi=?, angkatan=?, no_hp=?, status_magang=? WHERE id=? AND role='mahasiswa'`,
      [nama, nim || null, prodi || null, angkatan || null, no_hp || null, status_magang || 'belum', req.params.id]
    );
    res.json({ message: 'Data mahasiswa diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id=? AND role='mahasiswa'`, [req.params.id]);
    res.json({ message: 'Mahasiswa dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};