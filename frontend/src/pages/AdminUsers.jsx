import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const updateRole = async (userId, role) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success('Role updated successfully');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update role');
      console.error(err);
    }
  };

  // Filter and Pagination Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end mb-8 pt-2">
        <div>
           <h2 className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 mb-2">User Management</h2>
           <p className="font-body-sm text-zinc-500">Oversee customer accounts, permissions, and administrative access.</p>
        </div>
      </header>

      {/* Role Summary Grid matching Stitch HTML layout */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group border border-rose-100/50 dark:border-zinc-800 shadow-sm">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-200 dark:bg-zinc-800 rounded-full opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
           <span className="font-label-caps text-xs text-zinc-500 uppercase tracking-widest relative z-10">Total Accounts</span>
           <div className="flex items-baseline gap-2 relative z-10 mt-auto">
             <span className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 font-bold">{users.length}</span>
           </div>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group border border-rose-100/50 dark:border-zinc-800 shadow-sm">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-200 dark:bg-zinc-800 rounded-full opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
           <span className="font-label-caps text-xs text-zinc-500 uppercase tracking-widest relative z-10">Customers</span>
           <div className="flex items-baseline gap-2 relative z-10 mt-auto">
             <span className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 font-bold">{roleCounts.user}</span>
           </div>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group border border-rose-100/50 dark:border-zinc-800 shadow-sm">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-200 dark:bg-zinc-800 rounded-full opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
           <span className="font-label-caps text-xs text-zinc-500 uppercase tracking-widest relative z-10">Managers</span>
           <div className="flex items-baseline gap-2 relative z-10 mt-auto">
             <span className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 font-bold">{roleCounts.manager} <span className="text-zinc-400 dark:text-zinc-500 text-lg font-normal">/ 3</span></span>
           </div>
        </div>
        <div className="bg-zinc-900 dark:bg-rose-50 text-white dark:text-zinc-900 backdrop-blur-2xl rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm border border-transparent">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500 dark:bg-rose-200 rounded-full opacity-20 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
           <span className="font-label-caps text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest relative z-10">Admins</span>
           <div className="flex items-baseline gap-2 relative z-10 mt-auto">
             <span className="font-headline-sm text-3xl text-white dark:text-zinc-900 font-bold">{roleCounts.admin} <span className="text-zinc-400 dark:text-zinc-500 text-lg font-normal">/ 2</span></span>
           </div>
        </div>
      </section>

      {/* Search and User Table */}
      <section className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-xl border border-rose-100/50 dark:border-zinc-800 overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-rose-100/50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/50 dark:bg-zinc-900/50">
           <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-rose-50/50 dark:bg-zinc-800/50 border border-rose-200/50 dark:border-zinc-700 rounded-full font-body-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-colors"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">User Details</th>
                <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Role</th>
                <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Joined Date</th>
                <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-zinc-400">Loading users...</td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-zinc-400">No users found matching your search.</td>
                </tr>
              ) : (
                currentUsers.map(u => (
                  <tr key={u._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold uppercase">
                            {u.firstName[0]}
                         </div>
                         <div>
                            <p className="font-body-sm font-semibold text-zinc-900 dark:text-rose-100">{u.firstName} {u.lastName}</p>
                            <p className="text-[10px] text-zinc-400">{u.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                         u.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                         u.role === 'manager' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-zinc-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end">
                         <select
                           value={u.role}
                           onChange={(e) => updateRole(u._id, e.target.value)}
                           className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
                         >
                           <option value="user">USER</option>
                           <option value="manager">MANAGER</option>
                           <option value="admin">ADMIN</option>
                         </select>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
             <button
               disabled={currentPage === 1}
               onClick={() => setCurrentPage(prev => prev - 1)}
               className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 disabled:opacity-30 disabled:hover:border-zinc-200 transition-all bg-white dark:bg-zinc-900 shadow-sm"
             >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
             </button>

             {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all shadow-sm ${
                    currentPage === i + 1
                    ? 'bg-rose-500 text-white'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-rose-500'
                  }`}
                >
                  {i + 1}
                </button>
             ))}

             <button
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage(prev => prev + 1)}
               className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 disabled:opacity-30 disabled:hover:border-zinc-200 transition-all bg-white dark:bg-zinc-900 shadow-sm"
             >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
             </button>
          </div>
        )}
    </div>
  );
}

export default AdminUsers;
