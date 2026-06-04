import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusBadge = (s) => {
  const map = { menunggu: 'bg-yellow-100 text-yellow-700', disetujui: 'bg-green-100 text-green-700', ditolak: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
};

export default function LaporanList() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [judul, setJudul] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan', { params: { search, page, limit: 10 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !judul) return setError('Judul dan file wajib diisi');
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('judul', judul);
      fd.append('file', file);
      await api.post('/laporan/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowUpload(false);
      setJudul('');
      setFile(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload');
    } finally {
      setUploading(false);
    }
  };

  const handleStatus = async (id, status) => {
    const catatan = status === 'ditolak' ? prompt('Masukkan catatan penolakan:') : '';
    await api.put(`/laporan/${id}/status`, { status, catatan });
    fetchData();
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

  const columns = [
    ...(user?.role === 'admin' ? [{ key: 'mahasiswa', label: 'Mahasiswa' }, { key: 'nim', label: 'NIM' }] : []),
    { key: 'judul', label: 'Judul Laporan' },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: 'catatan', label: 'Catatan' },
    { key: 'created_at', label: 'Tanggal', render: r => new Date(r.created_at).toLocaleDateString('id-ID') },
    { key: 'aksi', label: 'Aksi', render: r => (
      <div className="flex gap-2">
        <a href={`${baseUrl}/${r.file_path}`} target="_blank" rel="noreferrer"
          className="text-primary-700 hover:underline text-xs font-medium">Unduh</a>
        {user?.role === 'admin' && r.status === 'menunggu' && (
          <>
            <button onClick={() => handleStatus(r.id, 'disetujui')} className="text-green-600 hover:underline text-xs font-medium">Setujui</button>
            <button onClick={() => handleStatus(r.id, 'ditolak')} className="text-red-500 hover:underline text-xs font-medium">Tolak</button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Laporan Magang</h1>
          {user?.role === 'mahasiswa' && (
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">+ Upload Laporan</button>
          )}
        </div>

        {showUpload && (
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Upload Laporan Baru</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">{error}</div>}
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan *</label>
                <input type="text" required value={judul} onChange={e => setJudul(e.target.value)} className="input-field max-w-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF/DOCX, max 10MB) *</label>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} className="input-field max-w-md" required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Mengupload...' : 'Upload'}</button>
                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        )}

        <div className="card p-5">
          <input type="text" placeholder="Cari judul atau mahasiswa..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field max-w-xs mb-4" />
          <DataTable columns={columns} data={data} loading={loading} />
          <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
        </div>
      </div>
    </Layout>
  );
}