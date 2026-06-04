import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function MahasiswaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ nama: '', email: '', password: '', nim: '', prodi: '', angkatan: '', no_hp: '', status_magang: 'belum' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) api.get(`/mahasiswa/${id}`).then(r => setForm({ ...r.data, password: '' }));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) await api.put(`/mahasiswa/${id}`, payload);
      else await api.post('/mahasiswa', payload);
      navigate('/mahasiswa');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k] || '', onChange: e => setForm({...form, [k]: e.target.value}) });

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit' : 'Tambah'} Mahasiswa</h1>
        <div className="card p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input type="text" required {...f('nama')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required={!isEdit} {...f('email')} className="input-field" disabled={isEdit} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'Password Baru (opsional)' : 'Password *'}</label>
                <input type="password" required={!isEdit} {...f('password')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                <input type="text" {...f('nim')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <input type="text" {...f('prodi')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                <input type="number" min="2000" max="2099" {...f('angkatan')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                <input type="tel" {...f('no_hp')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Magang</label>
                <select {...f('status_magang')} className="input-field">
                  <option value="belum">Belum</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => navigate('/mahasiswa')} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}