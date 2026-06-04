const { pool } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[{ total_mahasiswa }]] = await pool.query(`SELECT COUNT(*) AS total_mahasiswa FROM users WHERE role='mahasiswa'`);
    const [[{ total_perusahaan }]] = await pool.query(`SELECT COUNT(*) AS total_perusahaan FROM perusahaan`);
    const [[{ total_laporan }]] = await pool.query(`SELECT COUNT(*) AS total_laporan FROM laporan`);
    const [[{ laporan_disetujui }]] = await pool.query(`SELECT COUNT(*) AS laporan_disetujui FROM laporan WHERE status='disetujui'`);
    const [[{ mahasiswa_aktif }]] = await pool.query(`SELECT COUNT(*) AS mahasiswa_aktif FROM users WHERE role='mahasiswa' AND status_magang='aktif'`);

    res.json({ total_mahasiswa, total_perusahaan, total_laporan, laporan_disetujui, mahasiswa_aktif });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.id, l.judul, l.status, l.created_at, u.nama AS mahasiswa
      FROM laporan l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};