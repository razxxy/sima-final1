import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import api from '../api/axios';

export default function PerusahaanList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/perusahaan', { params: { search, page, limit: 10 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus perusahaan ini?')) return;
    await api.delete(`/perusahaan/${id}`);
    fetchData();
  };

  const columns = [
    { key: 'nama', label: 'Nama Perusahaan' },
    { key: 'kota', label: 'Kota' },
    { key: 'bidang_usaha', label: 'Bidang Usaha' },
    { key: 'telepon', label: 'Telepon' },
    { key: 'pic', label: 'PIC' },
    { key: 'aksi', label: 'Aksi', render: r => (
      <div className="flex gap-2">
        <Link to={`/perusahaan/edit/${r.id}`} className="text-primary-700 hover:underline text-xs font-medium">Edit</Link>
        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs font-medium">Hapus</button>
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Data Perusahaan</h1>
          <Link to="/perusahaan/tambah" className="btn-primary text-sm">+ Tambah</Link>
        </div>
        <div className="card p-5">
          <input type="text" placeholder="Cari nama, kota, bidang usaha..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field max-w-xs mb-4" />
          <DataTable columns={columns} data={data} loading={loading} />
          <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
        </div>
      </div>
    </Layout>
  );
}