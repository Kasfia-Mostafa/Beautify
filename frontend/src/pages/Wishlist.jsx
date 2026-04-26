import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Wishlist() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[140px]">
      <span className="text-on-surface-variant text-lg">Loading wishlist...</span>
    </div>
  );
  if (!user) return null;

  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      <div className="text-center mb-16">
        <h1 className="font-headline-display text-headline-display text-primary mb-4">My Wishlist</h1>
        <p className="font-body-lg text-on-surface-variant">Products you've saved for later.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-6">
          <span className="material-symbols-outlined text-6xl text-outline">favorite</span>
          <p className="text-on-surface-variant font-body-lg">Your wishlist is empty.</p>
          <Link to="/shop" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-caps tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <article key={product._id} className="group flex flex-col bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all duration-500 relative">
              <Link to={`/product/${product._id}`}>
                <div className="relative aspect-square overflow-hidden bg-white/50 p-4">
                  <img
                    alt={product.name}
                    src={product.images[0]}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                  />
                </div>
              </Link>
              <div className="p-4 flex flex-col flex-grow">
                <span className="font-label-caps text-xs text-secondary tracking-widest mb-1">{product.category}</span>
                <Link to={`/product/${product._id}`}>
                  <h2 className="font-headline-sm text-primary mb-2 line-clamp-2 min-h-[2.5rem] hover:underline">{product.name}</h2>
                </Link>
                <div className="mt-auto pt-3 flex flex-col gap-3">
                  <span className="font-body-lg font-medium text-primary">৳ {product.variants[0]?.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 py-2 bg-primary text-on-primary font-label-caps text-xs tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Wishlist;
