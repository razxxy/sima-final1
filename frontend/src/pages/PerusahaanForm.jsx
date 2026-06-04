import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function PerusahaanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ nama: '', alamat: '', kota: '', bidang_usaha: '', email: '', telepon: '', pic: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) api.get(`/perusahaan/${id}`).then(r => setForm(r.data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/perusahaan/${id}`, form);
      else await api.post('/perusahaan', form);
      navigate('/perusahaan');
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit' : 'Tambah'} Perusahaan</h1>
        <div className="card p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan *</label>
                <input type="text" required {...f('nama')} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea rows={2} {...f('alamat')} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <input type="text" {...f('kota')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Usaha</label>
                <input type="text" {...f('bidang_usaha')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" {...f('email')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="tel" {...f('telepon')} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">PIC (Person in Charge)</label>
                <input type="text" {...f('pic')} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => navigate('/perusahaan')} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}