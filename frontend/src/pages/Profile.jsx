import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    api.get('/profile').then(r => {
      setProfile(r.data);
      setForm({ nama: r.data.nama, no_hp: r.data.no_hp || '', prodi: r.data.prodi || '', angkatan: r.data.angkatan || '' });
    });
  }, []);

  const showMsg = (m, isErr = false) => {
    if (isErr) { setErr(m); setMsg(''); } else { setMsg(m); setErr(''); }
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
    await api.delete('/profile/foto');
    setProfile(p => ({ ...p, foto: null }));
    login({ ...user, foto: null }, token);
    showMsg('Foto dihapus');
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.konfirmasi) return showMsg('Konfirmasi password tidak cocok', true);
    try {
      await api.put('/profile/password', { password_lama: pwForm.password_lama, password_baru: pwForm.password_baru });
      setPwForm({ password_lama: '', password_baru: '', konfirmasi: '' });
      showMsg('Password berhasil diubah');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Gagal mengubah password', true);
    }
  };

  if (!profile) return <Layout><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{msg}</div>}
        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{err}</div>}

        <div className="card p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {profile.foto ? (
                <img src={`${baseUrl}/${profile.foto}`} className="w-20 h-20 rounded-full object-cover border-4 border-primary-100" alt="foto" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-800 text-white flex items-center justify-center text-2xl font-bold">
                  {profile.nama?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{profile.nama}</h2>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              <div className="flex gap-2 mt-2">
                <label className="btn-secondary text-xs cursor-pointer">
                  Ganti Foto <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
                {profile.foto && <button onClick={handleDeleteFoto} className="btn-danger text-xs">Hapus Foto</button>}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" required value={form.nama || ''} onChange={e => setForm({...form, nama: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} disabled className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                <input type="tel" value={form.no_hp || ''} onChange={e => setForm({...form, no_hp: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <input type="text" value={form.prodi || ''} onChange={e => setForm({...form, prodi: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                <input type="number" min="2000" max="2099" value={form.angkatan || ''} onChange={e => setForm({...form, angkatan: e.target.value})} className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Ubah Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input type="password" required value={pwForm.password_lama} onChange={e => setPwForm({...pwForm, password_lama: e.target.value})} className="input-field max-w-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input type="password" required minLength={6} value={pwForm.password_baru} onChange={e => setPwForm({...pwForm, password_baru: e.target.value})} className="input-field max-w-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input type="password" required value={pwForm.konfirmasi} onChange={e => setPwForm({...pwForm, konfirmasi: e.target.value})} className="input-field max-w-sm" />
            </div>
            <button type="submit" className="btn-primary">Ubah Password</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}