import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Profile', icon: 'person', path: '/profile' },
    { name: 'My Orders', icon: 'shopping_bag', path: '/profile/orders' },
    { name: 'My Cart', icon: 'shopping_cart', path: '/cart' },
    { name: 'Wishlist', icon: 'favorite', path: '/wishlist' },
  ];

  const currentPage = menuItems.find(item => item.path === location.pathname)?.name || 'User Panel';

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20">
      {/* Sidebar - Matching Admin Style */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed top-20 h-[calc(100vh-5rem)] z-30">


        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-rose-50/80 text-rose-500 shadow-sm border border-rose-100 dark:bg-zinc-800 dark:text-rose-400 dark:border-zinc-700'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>


      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 p-8 pt-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="font-headline-sm text-2xl text-zinc-900 dark:text-rose-100">
                {currentPage}
              </h1>
              <p className="text-zinc-500 text-xs mt-1">Hello, {user?.firstName}. Welcome to your dashboard.</p>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
