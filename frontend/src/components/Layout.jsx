import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Bell, X } from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items grouped to mirror the daily business workflow:
  //   1. From the owner — receive sarees
  //   2. Polish at the workshop — assign work & track who's in
  //   3. Money — collect from owners, pay employees
  const menuItems = {
    ADMIN: [
      { type: 'item', label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },

      { type: 'section', label: '① From the Owner' },
      { type: 'item', label: 'Owners', href: '/admin/owners', icon: '🧵' },
      { type: 'item', label: 'Inventory', href: '/admin/inventory', icon: '📦' },

      { type: 'section', label: '② Polish at Workshop' },
      { type: 'item', label: 'Employees', href: '/admin/employees', icon: '👥' },
      { type: 'item', label: 'Daily Work', href: '/admin/daily-work', icon: '📝' },
      { type: 'item', label: 'Attendance', href: '/admin/attendance', icon: '📍' },

      { type: 'section', label: '③ Money' },
      { type: 'item', label: 'Owner Payments', href: '/admin/payments', icon: '💳' },
      { type: 'item', label: 'Employee Salary', href: '/admin/salary', icon: '💰' },

      { type: 'section', label: 'Insights' },
      { type: 'item', label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    ],
    WORKER: [
      { type: 'item', label: 'Dashboard', href: '/employee/dashboard', icon: '📊' },
      { type: 'item', label: 'Profile', href: '/employee/profile', icon: '👤' },

      { type: 'section', label: 'My Work' },
      { type: 'item', label: 'Daily Work', href: '/employee/daily-work', icon: '📝' },
      { type: 'item', label: 'Attendance', href: '/employee/attendance', icon: '📍' },

      { type: 'section', label: 'My Earnings' },
      { type: 'item', label: 'Salary', href: '/employee/salary', icon: '💰' },
    ],
    SAREE_OWNER: [
      { type: 'item', label: 'Dashboard', href: '/owner/dashboard', icon: '📊' },
      { type: 'item', label: 'Profile', href: '/owner/profile', icon: '👤' },

      { type: 'section', label: 'My Sarees' },
      { type: 'item', label: 'Inventory', href: '/owner/inventory', icon: '📦' },
      { type: 'item', label: 'Transactions', href: '/owner/transactions', icon: '📊' },

      { type: 'section', label: 'Money' },
      { type: 'item', label: 'Payments', href: '/owner/payments', icon: '💳' },
    ],
  };

  const role = user?.role?.toUpperCase() || 'WORKER';
  const items = menuItems[role] || menuItems.WORKER;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-secondary-950/50 backdrop-blur-sm md:hidden z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-secondary-900 text-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) md:relative md:translate-x-0 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                Nool<span className="text-primary-400">.erp</span>
              </h1>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 mb-6">
          <div className="p-4 bg-secondary-800/50 backdrop-blur-md rounded-2xl border border-secondary-700/50">
            <p className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-bold text-white truncate">{user?.role || 'User'}</p>
            {user?.mobileNumber && (
              <p className="text-xs text-secondary-400 mt-1">{user.mobileNumber}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-1 scrollbar-hide">
          {items.map((item, index) => {
            // Section divider — non-clickable label that groups the items below it.
            if (item.type === 'section') {
              return (
                <div
                  key={`sec-${index}`}
                  className={`px-4 pt-5 pb-1 text-[11px] font-bold uppercase tracking-wider text-secondary-500 ${
                    index === 0 ? '!pt-2' : ''
                  }`}
                >
                  {item.label}
                </div>
              );
            }
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={index}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-secondary-800/50 text-secondary-300 rounded-xl hover:bg-danger/10 hover:text-danger hover:border-danger/20 border border-transparent transition-all duration-300 font-medium group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border shadow-soft">
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Menu Button (Mobile) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2.5 hover:bg-secondary-50 text-secondary-600 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title / spacer on desktop */}
        <div className="hidden md:flex flex-1 items-center">
          <span className="text-sm text-secondary-400 font-medium">Nool ERP</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-secondary-50 text-secondary-600 rounded-full transition-colors group"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-bold text-text-main text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
                    <X className="w-4 h-4 text-secondary-500" />
                  </button>
                </div>
                <div className="p-4 text-center text-sm text-secondary-500 py-8">
                  <Bell className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-text-main leading-tight">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'WORKER' ? 'Employee' : user?.role === 'SAREE_OWNER' ? 'Saree Owner' : 'User'}
              </p>
              <p className="text-xs text-secondary-500 mt-0.5">{user?.mobileNumber || 'Online'}</p>
            </div>
            <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 border-2 border-white text-sm">
              {user?.role?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Close notification on outside click */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </header>
  );
};

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

