import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { name: 'Orders', icon: 'shopping_cart', path: '/admin/orders' },
    { name: 'Products', icon: 'inventory_2', path: '/admin/products' },
    { name: 'Blogs', icon: 'article', path: '/admin/blogs' },
    { name: 'Users', icon: 'group', path: '/admin/users' },
    { name: 'Profile', icon: 'person', path: '/admin/profile' },
  ].filter(item => {
    if (user?.role === 'manager') {
      return !['Blogs', 'Users'].includes(item.name);
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="bg-rose-50/90 dark:bg-zinc-950/90 backdrop-blur-lg text-zinc-900 dark:text-rose-50 font-serif tracking-wide fixed left-0 top-0 h-full w-64 border-r border-rose-200/50 dark:border-zinc-800 shadow-xl shadow-rose-200/10 flex flex-col py-8 z-40 hidden md:flex">
        <div className="px-6 mb-10">
          <h1 className="font-serif text-xl font-bold text-zinc-900 dark:text-rose-100">Beautify Dashboard</h1>

        </div>

        <nav className="flex-1 flex flex-col gap-2 pr-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-rose-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white font-medium rounded-r-full'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-rose-100/30 dark:hover:bg-zinc-800/30'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-sm font-sans font-medium">{item.name}</span>
            </Link>
          ))}

          <Link
            to="/"
            className="flex items-center gap-3 px-6 py-3 mt-4 text-zinc-500 dark:text-zinc-400 hover:bg-rose-100/30 dark:hover:bg-zinc-800/30 transition-all duration-300 group"
          >
            <span className="material-symbols-outlined group-hover:text-rose-300 transition-colors">open_in_new</span>
            <span className="font-body-sm font-sans font-medium group-hover:text-rose-500 transition-colors">View Site</span>
          </Link>
        </nav>

        {/* User Info and Sign Out at Sidebar Bottom */}
        <div className="px-6 mt-auto">
          <div className="flex items-center gap-3 py-4 border-t border-rose-200/50 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold object-cover">
              {user?.firstName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium font-sans text-zinc-900 dark:text-zinc-100 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] font-sans text-zinc-500 truncate uppercase tracking-widest">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-rose-100/50 dark:hover:bg-zinc-800 hover:text-red-500 rounded-lg transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto bg-[url('https://images.unsplash.com/photo-1615397323605-231a47738222?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-fixed bg-center relative">
        <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-[1280px] mx-auto p-8 pt-10">
          {!['/admin', '/admin/users'].includes(location.pathname) && (
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="font-headline-sm text-2xl text-zinc-900 dark:text-rose-100">
                  {menuItems.find(m => m.path === location.pathname)?.name || 'Admin Panel'}
                </h1>
                <p className="text-zinc-500 text-xs mt-1">Welcome back, {user?.firstName}. Here's what's happening today.</p>
              </div>
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
