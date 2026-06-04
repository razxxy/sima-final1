import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/mahasiswa', label: 'Mahasiswa', icon: '👥', adminOnly: true },
  { to: '/perusahaan', label: 'Perusahaan', icon: '🏢', adminOnly: true },
  { to: '/laporan', label: 'Laporan Magang', icon: '📄' },
  { to: '/profile', label: 'Profil Saya', icon: '👤' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-primary-800 text-white z-30 transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-auto`}>
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-xl font-bold tracking-wide">SIMA</h1>
          <p className="text-primary-200 text-xs mt-1">Sistem Informasi Magang</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
}