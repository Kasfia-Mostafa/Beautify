import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51TQK5UEhXABT5oTbQwhH1RiIqhNwVZbiGIlBOLaFhUcmHIGSwifJ8QhF0efmQ1rWYftptL6YWEnE0Qi3WeXlScfK0026g5PXVu');

function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async (paymentType) => {
    try {
      const token = localStorage.getItem('beautify_token');

      const orderData = {
        orderItems: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.images && item.images[0] ? item.images[0] : 'https://placehold.co/100x100',
          size: item.variants && item.variants[0]?.size ? item.variants[0].size : 'Standard',
          price: item.variants && item.variants[0]?.price ? item.variants[0].price : 0,
          product: item._id
        })),
        shippingAddress: {
          address: user.address?.street || 'TBD',
          city: user.address?.city || 'TBD',
          postalCode: user.address?.zipCode || '0000',
          phone: user.address?.phone || '0000'
        },
        paymentMethod: paymentType === 'stripe' ? 'Stripe' : 'Cash on Delivery',
        itemsPrice: cartTotal,
        shippingPrice: cartTotal >= 10000 ? 0 : 60,
        totalPrice: cartTotal + (cartTotal >= 10000 ? 0 : 60)
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.message || 'Server error');
      }

      if (paymentType === 'stripe') {
        const stripeRes = await fetch('/api/stripe-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: cart })
        });
        const stripeSession = await stripeRes.json();

        if (!stripeRes.ok) throw new Error(stripeSession.message || 'Stripe error');

        if (stripeSession.url) {
          window.location.href = stripeSession.url;
        } else {
          throw new Error('No checkout URL received from Stripe');
        }
      } else {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/profile/orders');
      }
    } catch (error) {
      console.error('Checkout Error Detail:', error);
      toast.error(`Checkout failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      <div className="text-center mb-12">
        <h1 className="font-headline-display text-headline-display text-primary mb-4">Your Bag</h1>
        <p className="font-body-lg text-on-surface-variant">{cart.length} item{cart.length !== 1 ? 's' : ''} in your bag</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-6">
          <span className="material-symbols-outlined text-6xl text-outline">shopping_bag</span>
          <p className="text-on-surface-variant font-body-lg">Your bag is empty.</p>
          <Link to="/shop" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-caps tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 flex flex-col gap-4">
            {cart.map(item => (
              <div key={item._id} className="flex gap-5 bg-surface border border-outline-variant rounded-xl p-5 items-start">
                <Link to={`/product/${item._id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white/60 rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                </Link>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="font-label-caps text-xs text-secondary tracking-widest">{item.category}</span>
                  <Link to={`/product/${item._id}`}>
                    <h3 className="font-headline-sm text-primary hover:underline">{item.name}</h3>
                  </Link>
                  <span className="font-body-md text-on-surface-variant">৳ {item.variants[0]?.price} each</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 text-primary hover:bg-surface-variant transition-colors">−</button>
                      <span className="px-4 py-1 font-body-md border-x border-outline-variant">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 text-primary hover:bg-surface-variant transition-colors">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="font-bold text-primary text-lg flex-shrink-0">
                  ৳ {(item.variants[0]?.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="self-start text-sm text-red-400 hover:text-red-600 underline mt-2 transition-colors">
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 sticky top-[130px]">
              <h2 className="font-headline-sm text-xl text-primary mb-6">Order Summary</h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>৳ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-green-600">{cartTotal >= 10000 ? 'Free' : '৳ 60'}</span>
                </div>
                <div className="h-px bg-outline-variant my-2"></div>
                <div className="flex justify-between font-bold text-primary text-lg">
                  <span>Total</span>
                  <span>৳ {(cartTotal + (cartTotal >= 10000 ? 0 : 60)).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleCheckout('stripe')}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-caps tracking-widest uppercase hover:bg-primary/90 transition-colors duration-300 mb-4"
              >
                Proceed to Payment
              </button>
              <Link to="/shop" className="block text-center text-on-surface-variant hover:text-primary transition-colors font-body-sm">
                ← Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t border-outline-variant flex flex-col gap-2">
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">lock</span> Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">local_shipping</span> Free shipping over ৳ 10,000
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">replay</span> Easy 7-day returns
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;
