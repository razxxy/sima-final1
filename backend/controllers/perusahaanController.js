const { pool } = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const like = `%${search}%`;

    const [rows] = await pool.query(
      `SELECT * FROM perusahaan WHERE nama LIKE ? OR kota LIKE ? OR bidang_usaha LIKE ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [like, like, like, parseInt(limit), parseInt(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM perusahaan WHERE nama LIKE ? OR kota LIKE ? OR bidang_usaha LIKE ?`,
      [like, like, like]
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM perusahaan WHERE id=?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, alamat, kota, bidang_usaha, email, telepon, pic } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama perusahaan wajib diisi' });

    const [result] = await pool.query(
      `INSERT INTO perusahaan (nama, alamat, kota, bidang_usaha, email, telepon, pic) VALUES (?,?,?,?,?,?,?)`,
      [nama, alamat || null, kota || null, bidang_usaha || null, email || null, telepon || null, pic || null]
    );
    res.status(201).json({ message: 'Perusahaan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nama, alamat, kota, bidang_usaha, email, telepon, pic } = req.body;
    await pool.query(
      `UPDATE perusahaan SET nama=?, alamat=?, kota=?, bidang_usaha=?, email=?, telepon=?, pic=? WHERE id=?`,
      [nama, alamat || null, kota || null, bidang_usaha || null, email || null, telepon || null, pic || null, req.params.id]
    );
    res.json({ message: 'Perusahaan diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM perusahaan WHERE id=?', [req.params.id]);
    res.json({ message: 'Perusahaan dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};