import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cartCount, clearCart } = useCart();
  const { wishlist, setWishlist } = useWishlist();
  const { user, logout } = useAuth();
  const wishlistCount = wishlist.length;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-rose-50/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-rose-200/30 dark:border-zinc-800/50 shadow-[0_4px_30px_rgba(244,215,212,0.2)]">
      <div className="flex justify-between items-center h-20 px-8 max-w-[1280px] mx-auto">
        <Link className="font-headline-sm font-serif text-3xl italic tracking-tighter text-zinc-900 dark:text-rose-100" to="/">
          Beautify
        </Link>
        <div className="hidden md:flex gap-8">
          <Link className="font-body-sm font-serif tracking-tight text-sm uppercase text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors duration-500 ease-out" to="/">Home</Link>
          <Link className="font-body-sm font-serif tracking-tight text-sm uppercase text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors duration-500 ease-out" to="/shop">Collection</Link>
          <Link className="font-body-sm font-serif tracking-tight text-sm uppercase text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors duration-500 ease-out" to="/about">About Us</Link>
          <Link className="font-body-sm font-serif tracking-tight text-sm uppercase text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors duration-500 ease-out" to="/contact">Contact Us</Link>
          <Link className="font-body-sm font-serif tracking-tight text-sm uppercase text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors duration-500 ease-out" to="/blog">Blog</Link>
        </div>
        <div className="flex gap-4 items-center">
          {/* Wishlist / Heart with badge */}
          <Link to="/wishlist" className="relative text-zinc-900 dark:text-rose-50 hover:text-rose-500 transition-colors duration-500 ease-out">
            <span className="material-symbols-outlined" data-icon="favorite">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-400 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart with badge */}
          <Link to="/cart" className="relative text-zinc-900 dark:text-rose-50 hover:text-rose-500 transition-colors duration-500 ease-out">
            <span className="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User / Logout */}
          {user ? (
            <div className="flex items-center gap-4">
              {(user.isAdmin || user.role === 'manager') && (
                <Link
                  to="/admin"
                  className="font-label-caps text-[10px] tracking-widest uppercase bg-rose-500/10 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                >
                  {user.role === 'manager' ? 'Manager' : 'Admin'}
                </Link>
              )}
              <Link to="/profile" className="font-body-sm text-zinc-900 dark:text-rose-100 hidden sm:block hover:text-rose-500 transition-colors">Hi, {user.firstName}</Link>
              <button
                onClick={handleLogout}
                className="text-zinc-900 dark:text-rose-50 hover:text-rose-500 transition-colors duration-500 ease-out"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          ) : (
            <Link to="/signin" className="text-zinc-900 dark:text-rose-50 hover:text-rose-500 transition-colors duration-500 ease-out">
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
