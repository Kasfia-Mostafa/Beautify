import React, { useState, useEffect } from 'react';

function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/revenue-chart')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse space-y-10">
    <div className="h-64 bg-zinc-100 rounded-[2.5rem]" />
    <div className="grid grid-cols-2 gap-10 h-64 bg-zinc-100 rounded-[2.5rem]" />
  </div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Revenue Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-zinc-900 dark:bg-rose-100 p-10 rounded-[2.5rem] text-rose-50 dark:text-zinc-900">
            <p className="opacity-60 text-xs uppercase tracking-widest font-bold mb-2">Total Profit</p>
            <h3 className="text-4xl font-bold italic font-serif">৳450,200</h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 dark:text-emerald-600 text-xs font-bold">
               <span className="material-symbols-outlined text-[16px]">trending_up</span>
               <span>+24% this month</span>
            </div>
         </div>
         <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2">Average Order Value</p>
            <h3 className="text-4xl font-bold text-zinc-900 dark:text-rose-100 italic font-serif">৳3,450</h3>
            <div className="mt-6 flex items-center gap-2 text-rose-400 text-xs font-bold">
               <span className="material-symbols-outlined text-[16px]">trending_down</span>
               <span>-2% vs last week</span>
            </div>
         </div>
         <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2">Refund Rate</p>
            <h3 className="text-4xl font-bold text-zinc-900 dark:text-rose-100 italic font-serif">0.8%</h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-bold">
               <span className="material-symbols-outlined text-[16px]">check_circle</span>
               <span>Healthy Level</span>
            </div>
         </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
         <div className="flex justify-between items-center mb-16">
            <div>
               <h3 className="font-headline-sm text-2xl mb-1">Revenue Performance</h3>
               <p className="text-zinc-500 text-sm">Weekly sales volume comparison</p>
            </div>
            <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl">
               <button className="px-6 py-2 bg-white dark:bg-zinc-700 shadow-sm rounded-xl text-xs font-bold">Weekly</button>
               <button className="px-6 py-2 text-zinc-400 text-xs font-bold">Monthly</button>
            </div>
         </div>

         {/* Visual Chart (Tailwind-based) */}
         <div className="flex items-end justify-between gap-4 h-64 mt-10 px-4">
            {data.weekly.map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative">
                     <div
                        className="w-full bg-zinc-900 dark:bg-rose-100 rounded-t-2xl transition-all duration-700 ease-out group-hover:bg-rose-500 group-hover:scale-105"
                        style={{ height: `${(val / 10000) * 100}%` }}
                     >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-rose-100 text-white dark:text-zinc-900 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                           ৳{val}
                        </div>
                     </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{data.labels[i]}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Top Selling Products */}
         <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-headline-sm text-xl mb-10 italic font-serif">Highest Product Sell List</h3>
            <div className="space-y-8">
               {data.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-6 group">
                     <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-zinc-300">
                        0{i+1}
                     </div>
                     <div className="flex-1">
                        <p className="font-body-sm font-semibold text-zinc-900 dark:text-rose-100">{p.name}</p>
                        <p className="text-xs text-zinc-400">{p.sales} sales</p>
                     </div>
                     <div className="text-right">
                        <p className="font-body-sm font-bold text-zinc-900 dark:text-rose-100">৳{p.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">+12%</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Profit Summary / Highest Seller */}
         <div className="bg-zinc-50 dark:bg-zinc-800/50 p-12 rounded-[3rem] border border-zinc-200/50 dark:border-zinc-700/50 flex flex-col justify-between">
            <div>
               <h3 className="font-headline-sm text-xl mb-6">Profit Insights</h3>
               <p className="text-zinc-500 text-sm leading-relaxed mb-10">Your highest seller this week is <span className="font-bold text-zinc-900 dark:text-rose-100">"Celestial Cream"</span>, contributing to 30% of total profit. Consider running a campaign for the Radiant series next month.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600">
                     <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                  </div>
                  <div>
                     <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Highest Seller</p>
                     <p className="font-headline-sm text-lg font-bold">Radiant Glow Serum</p>
                  </div>
               </div>
               <div className="flex justify-between items-center pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <div>
                     <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">Revenue</p>
                     <p className="font-bold">৳120,700</p>
                  </div>
                  <button className="bg-rose-500 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors">Campaign</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default AdminRevenue;
