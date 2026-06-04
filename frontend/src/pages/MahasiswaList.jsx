import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import api from '../api/axios';

const statusBadge = (s) => {
  const map = { aktif: 'bg-green-100 text-green-700', selesai: 'bg-blue-100 text-blue-700', belum: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
};

export default function MahasiswaList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mahasiswa', { params: { search, page, limit: 10 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus mahasiswa ini?')) return;
    await api.delete(`/mahasiswa/${id}`);
    fetchData();
  };

  const columns = [
    { key: 'nim', label: 'NIM' },
    { key: 'nama', label: 'Nama' },
    { key: 'prodi', label: 'Prodi' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'no_hp', label: 'No HP' },
    { key: 'status_magang', label: 'Status', render: r => statusBadge(r.status_magang) },
    { key: 'aksi', label: 'Aksi', render: r => (
      <div className="flex gap-2">
        <Link to={`/mahasiswa/edit/${r.id}`} className="text-primary-700 hover:underline text-xs font-medium">Edit</Link>
        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs font-medium">Hapus</button>
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Data Mahasiswa</h1>
          <Link to="/mahasiswa/tambah" className="btn-primary text-sm">+ Tambah</Link>
        </div>
        <div className="card p-5">
          <input type="text" placeholder="Cari nama, NIM, atau prodi..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field max-w-xs mb-4" />
          <DataTable columns={columns} data={data} loading={loading} />
          <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
        </div>
      </div>
    </Layout>
  );
}