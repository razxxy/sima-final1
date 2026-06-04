import { useState, useEffect, useRef } from 'react';
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

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nama: '', no_hp: '', prodi: '', angkatan: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ lama: false, baru: false, konfirmasi: false });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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
      .catch(() => setErr('Gagal memuat profil'));
  }, []);

  const showMsg = (m, isErr = false) => {
    if (isErr) { setErr(m); setMsg(''); }
    else { setMsg(m); setErr(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', form);
      const r = await api.get('/profile');
      setProfile(r.data);
      setUser(prev => ({ ...prev, ...r.data }));
      setEditMode(false);
      showMsg('Profil berhasil diperbarui');
    } catch {
      showMsg('Gagal memperbarui profil', true);
    } finally { setLoading(false); }
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const r = await api.post('/profile/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(prev => ({ ...prev, foto: r.data.foto }));
      setProfile(prev => ({ ...prev, foto: r.data.foto }));
      showMsg('Foto berhasil diupload');
    } catch {
      showMsg('Gagal upload foto', true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFoto = async () => {
    if (!window.confirm('Hapus foto profil?')) return;
    try {
      await api.delete('/profile/foto');
      setUser(prev => ({ ...prev, foto: null }));
      setProfile(prev => ({ ...prev, foto: null }));
      showMsg('Foto dihapus');
    } catch {
      showMsg('Gagal menghapus foto', true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return showMsg('Konfirmasi password tidak cocok', true);
    try {
      await api.put('/profile/password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showMsg('Password berhasil diubah');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Gagal mengubah password', true);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{msg}</div>}
        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{err}</div>}

        {/* Foto & Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {profile.foto ? (
                <img src={`/${profile.foto}`} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" alt="foto" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xl font-bold">
                  {profile.nama?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">{profile.nama}</h2>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              <div className="flex gap-2 mt-3">
                <label className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  Ganti Foto
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
                </label>
                {profile.foto && (
                  <button onClick={handleDeleteFoto} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition-colors">
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text" required
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <input
                    type="tel"
                    value={form.no_hp}
                    onChange={e => setForm({ ...form, no_hp: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="bg-blue-800 text-white px-5 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-2"><span className="font-medium w-28 shrink-0">Nama</span><span>{profile.nama}</span></div>
              <div className="flex gap-2"><span className="font-medium w-28 shrink-0">Email</span><span>{profile.email}</span></div>
              <div className="flex gap-2"><span className="font-medium w-28 shrink-0">Role</span><span className="capitalize">{profile.role}</span></div>
              {profile.no_hp && <div className="flex gap-2"><span className="font-medium w-28 shrink-0">No. HP</span><span>{profile.no_hp}</span></div>}
              <button
                onClick={() => setEditMode(true)}
                className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Edit Profil
              </button>
            </div>
          )}
        </div>

        {/* Ubah Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Ubah Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'oldPassword', label: 'Password Lama', show: 'lama' },
              { key: 'newPassword', label: 'Password Baru', show: 'baru' },
              { key: 'confirmPassword', label: 'Konfirmasi Password Baru', show: 'konfirmasi' },
            ].map(({ key, label, show }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative max-w-sm">
                  <input
                    type={showPw[show] ? 'text' : 'password'}
                    required
                    minLength={key === 'oldPassword' ? 1 : 6}
                    value={pwForm[key]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
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
            <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded-lg hover:bg-blue-900 transition-colors text-sm">
              Ubah Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
