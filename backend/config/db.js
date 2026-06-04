const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await conn.query(`USE \`${process.env.DB_NAME}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','mahasiswa') DEFAULT 'mahasiswa',
        nim VARCHAR(20),
        prodi VARCHAR(100),
        angkatan YEAR,
        no_hp VARCHAR(20),
        foto VARCHAR(255),
        status_magang ENUM('aktif','selesai','belum') DEFAULT 'belum',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS perusahaan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(150) NOT NULL,
        alamat TEXT,
        kota VARCHAR(100),
        bidang_usaha VARCHAR(100),
        email VARCHAR(100),
        telepon VARCHAR(20),
        pic VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS laporan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        judul VARCHAR(200) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('menunggu','disetujui','ditolak') DEFAULT 'menunggu',
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const bcrypt = require('bcryptjs');
    const [rows] = await conn.query(`SELECT id FROM users WHERE email = 'admin@sima.ac.id'`);
    if (rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await conn.query(
        `INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Administrator', 'admin@sima.ac.id', hashed, 'admin']
      );
      console.log('✅ Admin default dibuat: admin@sima.ac.id / admin123');
    }

    console.log('✅ Database siap');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDB };