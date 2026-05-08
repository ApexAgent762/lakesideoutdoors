import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdPeople, MdLeaderboard, MdRequestQuote, MdWork, MdCalendarMonth, MdLogout } from 'react-icons/md';

export default function Layout({ crewOnly }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = crewOnly ? [
    { to: '/schedule', icon: <MdCalendarMonth size={20} />, label: 'My Schedule' }
  ] : [
    { to: '/', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { to: '/customers', icon: <MdPeople size={20} />, label: 'Customers' },
    { to: '/leads', icon: <MdLeaderboard size={20} />, label: 'Leads' },
    { to: '/quotes', icon: <MdRequestQuote size={20} />, label: 'Quotes' },
    { to: '/jobs', icon: <MdWork size={20} />, label: 'Jobs' },
  ];

  return (
    <div className="flex h-screen bg-lakeside-darker overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-lakeside-dark border-r border-lakeside-border flex flex-col">
        <div className="p-6 border-b border-lakeside-border">
          <h1 className="text-lakeside-blue font-bold text-xl tracking-wide">LAKESIDE</h1>
          <p className="text-lakeside-teal text-xs tracking-widest uppercase">Outdoors</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lakeside-blue/20 text-lakeside-blue border border-lakeside-blue/30'
                    : 'text-gray-400 hover:text-white hover:bg-lakeside-card'
                }`
              }
            >
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-lakeside-border">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-lakeside-blue/30 flex items-center justify-center text-lakeside-blue font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-500 text-xs capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-lakeside-card w-full transition-colors"
          >
            <MdLogout size={20} />Logout
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
