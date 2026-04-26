import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import UserLayout from './components/UserLayout';
import UserOrders from './pages/UserOrders';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminBlogs from './pages/AdminBlogs';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminRevenue from './pages/AdminRevenue';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import Success from './pages/Success';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isProfilePath = location.pathname.startsWith('/profile');

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="bg-background text-on-background font-body-md antialiased flex flex-col min-h-screen">
            {!isAdminPath && <Navbar />}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/success" element={<Success />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />

                {/* User Dashboard Routes */}
                <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
                <Route path="/profile/orders" element={<UserLayout><UserOrders /></UserLayout>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
                <Route path="/admin/blogs" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><AdminBlogs /></AdminLayout></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute roles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><AdminRevenue /></AdminLayout></AdminRoute>} />
                <Route path="/admin/profile" element={<AdminRoute roles={['admin', 'manager']}><AdminLayout><Profile /></AdminLayout></AdminRoute>} />
              </Routes>
            </div>

            {!isAdminPath && !isProfilePath && (
              <footer className="w-full mt-auto bg-surface-variant border-t border-outline-variant pt-20 pb-10">
                <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                  <div className="flex flex-col gap-6">
                    <Link className="font-headline-sm font-serif text-2xl italic tracking-tighter text-primary" to="/">
                      Beautify
                    </Link>
                    <p className="font-body-sm text-on-surface-variant leading-relaxed">
                      Crafted for radiant living. Discover our collection of transformative skincare formulated with ethereal botanicals.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-label-caps text-label-caps tracking-widest uppercase text-primary">Explore</h4>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="/">Home</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="/shop">Collection</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="/about">About Us</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="/contact">Contact Us</Link>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-label-caps text-label-caps tracking-widest uppercase text-primary">Customer Care</h4>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="#">Shipping &amp; Returns</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="#">FAQ</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="#">Terms &amp; Conditions</Link>
                    <Link className="font-body-sm text-on-surface-variant hover:text-rose-600 transition-colors" to="#">Privacy Policy</Link>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-label-caps text-label-caps tracking-widest uppercase text-primary">Newsletter</h4>
                    <p className="font-body-sm text-on-surface-variant">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="bg-background border border-outline-variant rounded-l-md px-4 py-2 w-full focus:outline-none focus:border-rose-500 font-body-sm text-on-surface"
                      />
                      <button className="bg-primary text-on-primary px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="max-w-[1280px] mx-auto px-8 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="font-body-sm text-on-surface-variant text-center md:text-left">
                    © 2026 Beautify. All rights reserved.
                  </p>
                  <div className="flex gap-6">
                    <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">camera_alt</span>
                    </Link>
                    <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">share</span>
                    </Link>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
