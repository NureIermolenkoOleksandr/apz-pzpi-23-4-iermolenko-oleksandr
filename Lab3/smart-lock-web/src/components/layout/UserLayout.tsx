import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col">
      <header className="h-16 bg-surface border-b border-[#2C2C35] flex items-center justify-between px-4 sm:px-8">
        <div className="font-bold text-xl text-primary">Smart Lock</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-textSecondary bg-[#13131A] px-3 py-1.5 rounded-lg">
            <UserIcon size={16} />
            <span className="hidden sm:inline text-sm">{user?.fullName || user?.email}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-textSecondary hover:text-[#FF453A] transition-colors rounded-lg hover:bg-[#FF453A]/10"
            title="Вийти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};