import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('beautify_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState(user);

  useEffect(() => {
    localStorage.setItem('beautify_cart', JSON.stringify(cart));
  }, [cart]);

  // Clear cart only when transitioning from logged-in to logged-out
  useEffect(() => {
    if (prevUser && !user) {
      setCart([]);
      localStorage.removeItem('beautify_cart');
    }
    setPrevUser(user);
  }, [user, prevUser]);

  const addToCart = (product, quantityToAdd = 1) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      toast.success("Increased quantity in cart");
    } else {
      toast.success("Added to cart");
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => item._id === product._id);
      if (existingItem) {
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { ...product, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item._id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.variants[0]?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
