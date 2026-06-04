import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/axios';

const statusBadge = (s) => {
  const map = { menunggu: 'bg-yellow-100 text-yellow-700', disetujui: 'bg-green-100 text-green-700', ditolak: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/activities')])
      .then(([s, a]) => { setStats(s.data); setActivities(a.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang di SIMA</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label="Total Mahasiswa" value={stats.total_mahasiswa || 0} icon="👥" color="blue" />
              <StatCard label="Total Perusahaan" value={stats.total_perusahaan || 0} icon="🏢" color="purple" />
              <StatCard label="Total Laporan" value={stats.total_laporan || 0} icon="📄" color="orange" />
              <StatCard label="Laporan Disetujui" value={stats.laporan_disetujui || 0} icon="✅" color="green" />
              <StatCard label="Mahasiswa Aktif" value={stats.mahasiswa_aktif || 0} icon="🎓" color="teal" />
            </div>

            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
              {activities.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Belum ada aktivitas</p>
              ) : (
                <div className="space-y-3">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.judul}</p>
                        <p className="text-xs text-gray-500 mt-0.5">oleh {a.mahasiswa} · {new Date(a.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}