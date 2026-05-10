import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    ADMIN: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { label: 'Employees', href: '/admin/employees', icon: '👥' },
      { label: 'Owners', href: '/admin/owners', icon: '🧵' },
      { label: 'Attendance', href: '/admin/attendance', icon: '📍' },
      { label: 'Salary', href: '/admin/salary', icon: '💰' },
      { label: 'Payments', href: '/admin/payments', icon: '💳' },
      { label: 'Inventory', href: '/admin/inventory', icon: '📦' },
      { label: 'Daily Work', href: '/admin/daily-work', icon: '📝' },
      { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    ],
    WORKER: [
      { label: 'Dashboard', href: '/employee/dashboard', icon: '📊' },
      { label: 'Profile', href: '/employee/profile', icon: '👤' },
      { label: 'Attendance', href: '/employee/attendance', icon: '📍' },
      { label: 'Salary', href: '/employee/salary', icon: '💰' },
      { label: 'Daily Work', href: '/employee/daily-work', icon: '📝' },
    ],
    SAREE_OWNER: [
      { label: 'Dashboard', href: '/owner/dashboard', icon: '📊' },
      { label: 'Profile', href: '/owner/profile', icon: '👤' },
      { label: 'Inventory', href: '/owner/inventory', icon: '📦' },
      { label: 'Transactions', href: '/owner/transactions', icon: '📊' },
      { label: 'Payments', href: '/owner/payments', icon: '💳' },
    ],
  };

  const role = user?.role?.toLowerCase() || 'employee';
  const items = menuItems[role] || menuItems.employee;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:relative md:translate-x-0 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="slide-in">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🎀 NOOL
            </h1>
            <p className="text-xs text-gray-600 mt-1">Enterprise Resource Planning</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 mx-2 my-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <p className="text-xs font-medium text-gray-600">Logged in as</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{user?.role}</p>
          {user?.mobileNumber && (
            <p className="text-xs text-gray-600 mt-1">{user.mobileNumber}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-2 py-4">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-700 hover:bg-indigo-50 transition-all duration-200 group"
              onClick={() => setActiveMenu(item.label)}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-2 right-2 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Menu Button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* Left Spacer */}
        <div className="hidden md:block" />

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full pulse" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.role?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.role}</p>
              <p className="text-xs text-gray-600">{user?.mobileNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
