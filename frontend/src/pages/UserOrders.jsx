import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/my-orders?email=${user.email}`);
        const data = await response.json();
        if (response.ok) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100';
    }
  };

  return (
    <div className="max-w-6xl">

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 bg-rose-50/80 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-16 border border-rose-100 dark:border-zinc-800 text-center shadow-sm">
          <span className="material-symbols-outlined text-6xl text-rose-100 mb-4">shopping_bag</span>
          <h2 className="font-headline-sm text-xl text-zinc-900 dark:text-rose-100 mb-2">No orders found</h2>
          <p className="text-zinc-500 mb-8">You haven't placed any orders yet. Ready to start your radiance journey?</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b border-rose-50 dark:border-zinc-800 bg-rose-50/10 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-label-caps tracking-widest text-zinc-400 uppercase mb-1">Order Date</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-rose-100">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-label-caps tracking-widest text-zinc-400 uppercase mb-1">Order ID</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-rose-100 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-label-caps tracking-widest text-zinc-400 uppercase mb-1">Total Amount</p>
                    <p className="text-sm font-medium text-rose-600 font-serif italic">৳ {order.totalPrice?.toLocaleString()}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status || 'Pending')}`}>
                  {order.status || 'Pending'}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-rose-50/30 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-rose-100">{item.name}</h4>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserOrders;
