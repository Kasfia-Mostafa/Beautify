import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState(user);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clear wishlist only when transitioning from logged-in to logged-out
  useEffect(() => {
    if (prevUser && !user) {
      setWishlist([]);
      localStorage.removeItem('beautify_wishlist');
    }
    setPrevUser(user);
  }, [user, prevUser]);

  // Initial load
  useEffect(() => {
    const loadWishlist = async () => {
      if (user && user.id) {
        try {
          const res = await fetch(`/api/user/wishlist?userId=${user.id}`);
          const data = await res.json();
          setWishlist(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch wishlist:", err);
        }
      } else if (!user) {
        try {
          const saved = localStorage.getItem('beautify_wishlist');
          setWishlist(saved ? JSON.parse(saved) : []);
        } catch {
          setWishlist([]);
        }
      }
      setLoading(false);
    };

    loadWishlist();
  }, [user]);

  // Persistence for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('beautify_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = async (product) => {
    const isAlreadyThere = wishlist.find(p => p._id === product._id);
    if (isAlreadyThere) return;

    if (user && user.id) {
      try {
        await fetch(`/api/user/wishlist/${product._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      } catch (err) {
        console.error("Failed to sync wishlist:", err);
      }
    }
    
    setWishlist(prev => [...prev, product]);
    toast.success("Added to wishlist");
  };

  const removeFromWishlist = async (productId) => {
    if (user && user.id) {
      try {
        await fetch(`/api/user/wishlist/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      } catch (err) {
        console.error("Failed to sync wishlist:", err);
      }
    }

    setWishlist(prev => prev.filter(p => p._id !== productId));
    toast.success("Removed from wishlist");
  };

  const isWishlisted = (productId) => wishlist.some(p => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, addToWishlist, removeFromWishlist, isWishlisted, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
