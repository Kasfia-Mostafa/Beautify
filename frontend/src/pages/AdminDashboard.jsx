import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, blogs: 0, users: 0, orders: 0, revenue: 0 });
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revRes] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()),
          fetch('/api/admin/revenue-chart').then(r => r.json())
        ]);
        setStats(statsRes);
        setRevenueData(revRes);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProfit = stats.revenue * 0.25; // Assuming 25% margin
  const avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;

  const cards = [
    { name: 'Total Revenue', value: `৳${stats.revenue.toLocaleString()}`, icon: 'payments', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Total Profit', value: `৳${Math.round(totalProfit).toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Avg Order Value', value: `৳${Math.round(avgOrderValue).toLocaleString()}`, icon: 'receipt_long', color: 'text-rose-300', bg: 'bg-rose-600' },
    { name: 'Total Orders', value: stats.orders, icon: 'shopping_cart', color: 'text-rose-300', bg: 'bg-rose-600' },
  ].filter(card => {
    if (user?.role === 'manager') {
       return !['Total Blogs', 'Active Users'].includes(card.name);
    }
    return true;
  });

  if (loading) return <div className="animate-pulse flex flex-col gap-8">
    <div className="grid grid-cols-4 gap-6 h-32 bg-zinc-100 rounded-3xl" />
    <div className="h-64 bg-zinc-100 rounded-3xl" />
  </div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end mb-8 pt-2">
        <div>
           <h2 className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 mb-2">Admin Dashboard</h2>
           <p className="font-body-sm text-zinc-500">Overview of store performance, orders, and recent activity.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          // Highlight Revenue and Profit cards
          const isHighlighted = card.name === 'Total Revenue';
          const isProfit = card.name === 'Total Profit';
          return (
            <div key={i} className={`${
              isHighlighted ? 'bg-zinc-900 dark:bg-rose-50 text-white dark:text-zinc-900' :
              isProfit ? 'bg-rose-500 text-white' :
              'bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-rose-100'
            } backdrop-blur-2xl rounded-xl p-6 border ${
              isHighlighted || isProfit ? 'border-transparent' : 'border-rose-100/50 dark:border-zinc-800'
            } shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 relative overflow-hidden group`}>
              <div className={`absolute -right-4 -top-4 w-28 h-28 ${
                isHighlighted ? 'bg-rose-500 dark:bg-rose-200 opacity-20' :
                isProfit ? 'bg-white opacity-10' :
                card.bg + ' dark:bg-zinc-800 opacity-50'
              } rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700`}></div>
              <span className={`font-label-caps text-xs ${
                isHighlighted ? 'text-zinc-400 dark:text-zinc-600' :
                isProfit ? 'text-rose-100' :
                'text-zinc-500'
              } uppercase tracking-widest relative z-10`}>{card.name}</span>
              <div className="flex items-baseline gap-2 relative z-10 mt-auto">
                <span className={`font-headline-sm text-3xl font-bold ${
                  isHighlighted ? 'text-white dark:text-zinc-900' :
                  isProfit ? 'text-white' :
                  'text-zinc-900 dark:text-rose-100'
                }`}>{card.value}</span>
              </div>
              <span className={`material-symbols-outlined absolute right-6 bottom-6 text-4xl opacity-10 ${
                isHighlighted || isProfit ? 'text-white dark:text-zinc-900' : card.color
              } z-0`}>{card.icon}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-xl border border-rose-100/50 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-xl">Revenue Performance</h3>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Last 7 Days</span>
          </div>
          {!revenueData?.weekly ? (
            <div className="h-56 flex items-center justify-center text-zinc-400 text-sm">Loading...</div>
          ) : (
            <div className="relative">
              {/* Chart bars */}
              <div className="flex items-end gap-3" style={{ height: '180px' }}>
                {revenueData.weekly.map((val, i) => {
                  const max = Math.max(...revenueData.weekly);
                  const barH = max > 0 ? Math.max((val / max) * 160, val > 0 ? 16 : 4) : 4;
                  const isToday = i === revenueData.weekly.length - 1;
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col items-center gap-1 group relative">
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        ৳{val.toLocaleString()}
                      </div>
                      {/* Bar track */}
                      <div className="w-full rounded-lg flex-1 border border-rose-500/5 dark:border-rose-400/5" style={{ background: 'rgba(244,63,94,0.04)' }}></div>
                      {/* Actual bar */}
                      <div
                        className={`w-full rounded-lg transition-all duration-700 ${
                          isToday
                            ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                            : val > 0 ? 'bg-rose-400' : 'bg-rose-200 dark:bg-zinc-700'
                        }`}
                        style={{ height: `${barH}px`, flexShrink: 0 }}
                      ></div>
                    </div>
                  );
                })}
              </div>
              {/* Labels */}
              <div className="flex gap-3 mt-3">
                {revenueData.weekly.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase whitespace-nowrap">
                      {revenueData.labels[i]}
                    </span>
                    {val > 0 && <span className="text-[9px] text-rose-500 font-bold mt-0.5">৳{(val/1000).toFixed(1)}k</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highest Product Sell List */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-xl border border-rose-100/50 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-xl">Highest Product Sell List</h3>
          
          </div>
          <div className="space-y-5 flex-1">
            {!revenueData?.topProducts || revenueData.topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">No sales data yet.</div>
            ) : revenueData.topProducts.map((p, i) => (
              <div key={p._id || i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-zinc-800 flex items-center justify-center text-rose-500 font-bold text-sm shadow-inner group-hover:bg-rose-500 group-hover:text-white transition-colors flex-shrink-0">
                     {i + 1}
                   </div>
                   <div>
                     <p className="font-body-sm font-bold text-zinc-900 dark:text-rose-100 line-clamp-1 text-sm">{p.name}</p>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.sales} Sales</p>
                   </div>
                </div>
                <p className="font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full text-xs flex-shrink-0">৳{p.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
