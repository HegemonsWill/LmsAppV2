import React from 'react';
import { User, UserRole } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">{children}</div>;
  }

  const NavItem = ({ path, label, icon }: { path: string; label: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full flex items-center px-6 py-4 text-sm font-semibold transition-all duration-300 rounded-2xl mb-2 ${
          isActive 
            ? 'brand-gradient text-white shadow-lg shadow-red-500/30' 
            : 'text-gray-500 hover:bg-red-50 hover:text-[#D81814]'
        }`}
      >
        <span className="mr-4 text-xl">{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white m-4 rounded-[32px] shadow-xl flex flex-col hidden md:flex border border-gray-100">
        <div className="h-24 flex items-center px-8 border-b border-gray-50">
          <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center mr-3 shadow-md">
             <span className="text-white font-display font-bold text-lg">lt</span>
          </div>
          <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">LibraTech</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-8">
            <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</p>
            <NavItem path="/" label="Dashboard" icon="📊" />
            <NavItem path="/books" label="Catalog" icon="📚" />
          </div>

          {(user.role === UserRole.ADMIN || user.role === UserRole.LIBRARIAN) && (
            <div className="mb-8">
              <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Admin</p>
              <NavItem path="/manage-books" label="Manage Books" icon="✏️" />
              <NavItem path="/reservations" label="Reservations" icon="📅" />
              <NavItem path="/active-loans" label="Active Loans" icon="🔄" />
            </div>
          )}

          {user.role === UserRole.USER && (
            <div className="mb-8">
              <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal</p>
              <NavItem path="/my-books" label="My Loans" icon="📖" />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-4 mb-6 p-2 rounded-2xl bg-gray-50 border border-gray-100">
            <img src={user.avatarUrl || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate font-display">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-gray-500 hover:text-[#D81814] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>Log Out</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto focus:outline-none p-4 md:p-6">
        <header className="bg-white shadow-xl rounded-2xl mb-6 md:hidden h-20 flex items-center justify-between px-6">
             <div className="flex items-center">
                <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-display font-bold text-sm">lt</span>
                </div>
                <span className="text-xl font-display font-bold text-gray-900">LibraTech</span>
             </div>
             <button onClick={onLogout} className="text-gray-500 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
             </button>
        </header>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;