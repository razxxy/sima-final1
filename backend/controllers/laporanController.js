const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const like = `%${search}%`;

    let baseQuery, countQuery, params, countParams;

    if (req.user.role === 'admin') {
      baseQuery = `SELECT l.*, u.nama AS mahasiswa, u.nim FROM laporan l JOIN users u ON l.user_id=u.id WHERE l.judul LIKE ? OR u.nama LIKE ? ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
      params = [like, like, parseInt(limit), parseInt(offset)];
      countQuery = `SELECT COUNT(*) AS total FROM laporan l JOIN users u ON l.user_id=u.id WHERE l.judul LIKE ? OR u.nama LIKE ?`;
      countParams = [like, like];
    } else {
      baseQuery = `SELECT l.*, u.nama AS mahasiswa, u.nim FROM laporan l JOIN users u ON l.user_id=u.id WHERE l.user_id=? AND l.judul LIKE ? ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
      params = [req.user.id, like, parseInt(limit), parseInt(offset)];
      countQuery = `SELECT COUNT(*) AS total FROM laporan WHERE user_id=? AND judul LIKE ?`;
      countParams = [req.user.id, like];
    }

    const [rows] = await pool.query(baseQuery, params);
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File laporan wajib diupload' });
    const { judul } = req.body;
    if (!judul) return res.status(400).json({ message: 'Judul laporan wajib diisi' });

    const filePath = req.file.path.replace(/\\/g, '/');
    await pool.query(
      'INSERT INTO laporan (user_id, judul, file_path) VALUES (?,?,?)',
      [req.user.id, judul, filePath]
    );
    res.status(201).json({ message: 'Laporan berhasil diunggah' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Hanya admin yang dapat mengubah status' });
    const { status, catatan } = req.body;
    await pool.query('UPDATE laporan SET status=?, catatan=? WHERE id=?', [status, catatan || null, req.params.id]);
    res.json({ message: 'Status laporan diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};