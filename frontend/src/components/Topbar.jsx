import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.nama}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        {user?.foto ? (
          <img src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || 'http://localhost:5000'}/${user.foto}`}
            className="w-9 h-9 rounded-full object-cover border-2 border-primary-200" alt="foto" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-800 text-white flex items-center justify-center text-sm font-bold">
            {user?.nama?.[0]?.toUpperCase()}
          </div>
        )}
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium ml-1">
          Keluar
        </button>
      </div>
    </header>
  );
}