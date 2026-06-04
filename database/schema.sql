CREATE DATABASE IF NOT EXISTS sima_db;
USE sima_db;

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
);

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
);

CREATE TABLE IF NOT EXISTS laporan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  judul VARCHAR(200) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  status ENUM('menunggu','disetujui','ditolak') DEFAULT 'menunggu',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);