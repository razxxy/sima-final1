import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);

export default function Profile() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ nama: '', no_hp: '', prodi: '', angkatan: '' });
  const [pwForm, setPwForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [showPw, setShowPw] = useState({ lama: false, baru: false, konfirmasi: false });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    api.get('/profile')
      .then(r => {
        setProfile(r.data);
        setForm({
          nama: r.data.nama || '',
          no_hp: r.data.no_hp || '',
          prodi: r.data.prodi || '',
          angkatan: r.data.angkatan || '',
        });
      })
      .catch(() => setErr('Gagal memuat profil'))
      .finally(() => setLoadingPage(false));
  }, []);

  const showMsg = (m, isErr = false) => {
    if (isErr) { setErr(m); setMsg(''); }
    else { setMsg(m); setErr(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 3000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', form);
      const r = await api.get('/profile');
      setProfile(r.data);
      login({ ...user, nama: r.data.nama, foto: r.data.foto }, token);
      showMsg('Profil berhasil diperbarui');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Gagal memperbarui', true);
    } finally {
      setLoading(false);
    }
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const r = await api.post('/profile/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(p => ({ ...p, foto: r.data.foto }));
      login({ ...user, foto: r.data.foto }, token);
      showMsg('Foto diperbarui');
    } catch {
      showMsg('Gagal upload foto', true);
    }
  };

  const handleDeleteFoto = async () => {
    if (!confirm('Hapus foto profil?')) return;
    try {
      await api.delete('/profile/foto');
      setProfile(p => ({ ...p, foto: null }));
      login({ ...user, foto: null }, token);
      showMsg('Foto dihapus');
    } catch {
      showMsg('Gagal hapus foto', true);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.konfirmasi) return showMsg('Konfirmasi password tidak cocok', true);
    try {
      await api.put('/profile/password', {
        password_lama: pwForm.password_lama,
        password_baru: pwForm.password_baru,
      });
      setPwForm({ password_lama: '', password_baru: '', konfirmasi: '' });
      showMsg('Password berhasil diubah');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Gagal mengubah password', true);
    }
  };

  if (loadingPage) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-20 text-red-500">Gagal memuat profil. Coba refresh halaman.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{msg}</div>}
        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{err}</div>}

        {/* Foto & Info */}
        <div className="card p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {profile.foto ? (
                <img
                  src={`${baseUrl}/${profile.foto}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                  alt="foto profil"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-800 text-white flex items-center justify-center text-2xl font-bold">
                  {profile.nama?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">{profile.nama}</h2>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              {profile.nim && <p className="text-xs text-gray-400 mt-0.5">NIM: {profile.nim}</p>}
              <div className="flex gap-2 mt-3">
                <label className="btn-secondary text-xs cursor-pointer">
                  Ganti Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
                {profile.foto && (
                  <button onClick={handleDeleteFoto} className="btn-danger text-xs">
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} disabled className="input-field bg-gray-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                <input
                  type="tel"
                  value={form.no_hp}
                  onChange={e => setForm({ ...form, no_hp: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <input
                  type="text"
                  value={form.prodi}
                  onChange={e => setForm({ ...form, prodi: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  value={form.angkatan}
                  onChange={e => setForm({ ...form, angkatan: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Ubah Password */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Ubah Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            {[
              { key: 'password_lama', label: 'Password Lama', show: 'lama' },
              { key: 'password_baru', label: 'Password Baru', show: 'baru' },
              { key: 'konfirmasi', label: 'Konfirmasi Password Baru', show: 'konfirmasi' },
            ].map(({ key, label, show }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative max-w-sm">
                  <input
                    type={showPw[show] ? 'text' : 'password'}
                    required
                    minLength={key === 'password_lama' ? 1 : 6}
                    value={pwForm[key]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => ({ ...s, [show]: !s[show] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw[show] ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn-primary">Ubah Password</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}