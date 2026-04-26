import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Success() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Only clear if there are items to avoid infinite re-render loop
    if (cart.length > 0) {
      clearCart();
    }
  }, [cart.length, clearCart]);

  return (
    <main className="min-h-screen flex items-center justify-center pt-[140px] pb-section-gap bg-rose-50/20">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-rose-100 dark:border-zinc-800 p-12 text-center shadow-2xl shadow-rose-500/10 transition-all">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 animate-bounce">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h1 className="font-headline-display text-3xl text-zinc-900 dark:text-rose-100 mb-4">Payment Successful!</h1>
        <p className="font-body-md text-zinc-500 mb-10 leading-relaxed">
          Thank you for your purchase. Your radiance journey begins now. We've sent a confirmation email with your order details.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="bg-zinc-900 dark:bg-rose-100 text-white dark:text-zinc-900 py-4 rounded-2xl font-label-caps tracking-widest uppercase hover:opacity-90 transition-all shadow-lg shadow-zinc-900/10 cursor-pointer"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-rose-500 font-label-caps text-xs tracking-widest uppercase transition-all cursor-pointer bg-transparent border-none"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default Success;
