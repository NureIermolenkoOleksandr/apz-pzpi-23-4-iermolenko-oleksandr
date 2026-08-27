import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Server, 
  Users, 
  ShieldAlert, 
  LogOut, 
  Lock 
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true },
    { to: '/admin/devices', icon: Server, label: 'Пристрої' },
    { to: '/admin/users', icon: Users, label: 'Користувачі' },
    { to: '/admin/logs', icon: ShieldAlert, label: 'Журнал подій' },
    {to: '/admin/alerts', icon: ShieldAlert, label: 'Сповіщення', },
    {to: '/admin/buildings', icon: Server, label: 'Будівлі та кімнати', },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-textPrimary">
      <aside className="w-full md:w-64 bg-surface border-r border-[#2C2C35] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#2C2C35]">
          <Lock className="text-primary mr-3" size={24} />
          <span className="font-bold text-xl text-white tracking-wide">Smart Admin</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-textSecondary hover:bg-[#13131A] hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2C2C35]">
          <div className="mb-4 px-4">
            <p className="text-sm text-white font-medium truncate">{user?.fullName || 'Адміністратор'}</p>
            <p className="text-xs text-textSecondary uppercase mt-1">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A] hover:text-white rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} /> Вийти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};