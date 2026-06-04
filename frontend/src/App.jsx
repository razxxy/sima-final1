import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MahasiswaList from './pages/MahasiswaList';
import MahasiswaForm from './pages/MahasiswaForm';
import PerusahaanList from './pages/PerusahaanList';
import PerusahaanForm from './pages/PerusahaanForm';
import LaporanList from './pages/LaporanList';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mahasiswa" element={<ProtectedRoute adminOnly><MahasiswaList /></ProtectedRoute>} />
          <Route path="/mahasiswa/tambah" element={<ProtectedRoute adminOnly><MahasiswaForm /></ProtectedRoute>} />
          <Route path="/mahasiswa/edit/:id" element={<ProtectedRoute adminOnly><MahasiswaForm /></ProtectedRoute>} />
          <Route path="/perusahaan" element={<ProtectedRoute adminOnly><PerusahaanList /></ProtectedRoute>} />
          <Route path="/perusahaan/tambah" element={<ProtectedRoute adminOnly><PerusahaanForm /></ProtectedRoute>} />
          <Route path="/perusahaan/edit/:id" element={<ProtectedRoute adminOnly><PerusahaanForm /></ProtectedRoute>} />
          <Route path="/laporan" element={<ProtectedRoute><LaporanList /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}