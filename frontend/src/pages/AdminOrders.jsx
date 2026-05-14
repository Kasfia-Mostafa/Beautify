import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(); // Refresh the list
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'shipped': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'processing':
      case 'pending': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-zinc-100 text-zinc-500 border-zinc-200';
    }
  };

  const generateInvoice = async (order) => {
    try {
      const doc = new jsPDF();

      // Load Logo
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = '/favicon.ico';
        img.onload = () => {
          if (img.width > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
              const dataUrl = canvas.toDataURL('image/png');
              doc.addImage(dataUrl, 'PNG', 14, 15, 10, 10);
            } catch (e) { } // Ignore cross-origin canvas taint errors
          }
          resolve();
        };
        img.onerror = resolve; // Ignore errors and continue
      });

      // Header
      doc.setFontSize(22);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('Beautify', 28, 23); // Shifted right to accommodate logo

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Your glow up starts here.', 28, 29);

      // Invoice Title
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('INVOICE', 160, 20);

      doc.setFontSize(10);
      doc.text(`Order ID: #${order._id?.slice(-8).toUpperCase() || 'N/A'}`, 160, 26);
      doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}`, 160, 32);

      // Customer Details
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Billed To:', 14, 45);
      doc.setFontSize(10);

      const customerName = (order.user?.firstName || order.user?.lastName)
        ? `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()
        : (order.user?.name || order.user?.email || 'Valued Customer');

      doc.text(`Name: ${customerName}`, 14, 52);
      doc.text(`Email: ${order.user?.email || 'N/A'}`, 14, 58);

      const addr = order.shippingAddress;
      let uAddr = order.user?.address;
      let debugMsg = "No fetch attempted";
      
      // If backend hasn't populated address or it's missing, fetch it dynamically!
      const userId = typeof order.user === 'object' ? order.user?._id : order.user;
      if (userId) {
         try {
           const profileRes = await fetch(`/api/auth/profile/${userId}`);
           if (profileRes.ok) {
             const fullUser = await profileRes.json();
             uAddr = fullUser.address;
             debugMsg = uAddr ? "Fetch OK, Address found" : "Fetch OK, No Address";
           } else {
             debugMsg = `Fetch failed: ${profileRes.status}`;
           }
         } catch(e) { 
           debugMsg = `Fetch error: ${e.message}`; 
           console.error('Failed to fetch user profile:', e); 
         }
      } else {
         debugMsg = "No userId found in order";
      }

      if (addr && addr.address && addr.address !== 'TBD') {
          doc.text(`Address: ${addr.address}, ${addr.city || ''} - ${addr.postalCode || ''}`, 14, 64);
          doc.text(`Phone: ${addr.phone || 'N/A'}`, 14, 70);
      } else if (uAddr && (uAddr.street || uAddr.city || uAddr.phone)) {
          doc.text(`Address: ${uAddr.street || 'N/A'}, ${uAddr.city || ''} - ${uAddr.zipCode || ''}`, 14, 64);
          doc.text(`Phone: ${uAddr.phone || 'N/A'}`, 14, 70);
      } else {
          doc.text(`Address: Provided during checkout [DEBUG: ${debugMsg}]`, 14, 64);
          doc.text(`Phone: Provided during checkout [DEBUG ID: ${userId}]`, 14, 70);
      }

      // Items Table
      const tableData = order.orderItems?.map(item => [
        item.name || 'Unknown Item',
        item.size || 'Standard',
        item.quantity || 1,
        `Tk ${Number(item.price || 0).toLocaleString()}`,
        `Tk ${(Number(item.quantity || 1) * Number(item.price || 0)).toLocaleString()}`
      ]) || [];

      autoTable(doc, {
        startY: 80,
        head: [['Item Name', 'Variant', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [225, 29, 72] }, // rose color
        styles: { fontSize: 10 }
      });

      const finalY = doc.lastAutoTable?.finalY || 80;

      // Totals
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      const subTotal = Number(order.itemsPrice || order.totalPrice || 0);
      doc.text(`Subtotal: Tk ${subTotal.toLocaleString()}`, 140, finalY + 10);
      if (order.shippingPrice !== undefined && order.shippingPrice !== null) {
        doc.text(`Shipping: Tk ${Number(order.shippingPrice).toLocaleString()}`, 140, finalY + 16);
      }

      doc.setFontSize(12);
      doc.setTextColor(225, 29, 72);
      const grandTotal = Number(order.totalPrice || 0);
      doc.text(`Grand Total: Tk ${grandTotal.toLocaleString()}`, 140, finalY + 26);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for shopping with Beautify!', 105, 280, { align: 'center' });

      // Save the PDF
      doc.save(`Beautify_Invoice_${order._id?.slice(-8).toUpperCase() || 'ORDER'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF invoice. Please try again.");
    }
  };

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => {
      const s = (o.status || '').toLowerCase();
      const f = filter.toLowerCase();
      if (f === 'pending') return s === 'pending' || s === 'processing';
      return s === f;
    });

  const filterOptions = ['All', 'Pending', 'Delivered', 'Cancelled'];

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-10">
      {/* Header & Improved Filter UI */}
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="font-headline-sm text-2xl font-bold">Order Management</h2>
            <p className="text-zinc-500 text-sm mt-1">Total {orders.length} orders found in the system</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${filter === opt
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-rose-500 hover:text-rose-500'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Order Ref</th>
              <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Customer</th>
              <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Items</th>
              <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Amount</th>
              <th className="px-8 py-6 font-label-caps text-[10px] tracking-widest uppercase text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {currentOrders.length > 0 ? currentOrders.map(o => (
              <tr key={o._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="px-8 py-6 font-mono text-xs font-bold text-zinc-400">#{o._id.substring(18).toUpperCase()}</td>
                <td className="px-8 py-6">
                  <p className="font-body-sm font-semibold text-zinc-900 dark:text-rose-100">{o.user?.firstName} {o.user?.lastName}</p>
                  <p className="text-[10px] text-zinc-400 tracking-wider">{o.user?.email}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    {o.orderItems?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg border border-zinc-100 dark:border-zinc-800 object-cover bg-zinc-100 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-rose-100 line-clamp-1 max-w-[120px]">{item.name}</p>
                          <p className="text-[10px] text-zinc-400">{item.size} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-body-sm font-bold text-zinc-900 dark:text-rose-100">৳{o.totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400">Paid via {o.paymentMethod || 'SSL'}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col items-start gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer shadow-sm ${getStatusColor(o.status)}`}
                    >
                      <option value="Pending" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">PENDING</option>
                      <option value="Delivered" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">DELIVERED</option>
                      <option value="Cancelled" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">CANCELLED</option>
                    </select>
                    {o.status?.toLowerCase() === 'delivered' && (
                      <button
                        onClick={() => generateInvoice(o)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                        Invoice
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <span className="material-symbols-outlined text-6xl">inventory_2</span>
                    <p className="font-headline-sm text-xl italic font-serif">No orders in this category</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-8 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-50 dark:border-zinc-800">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center disabled:opacity-30 hover:border-rose-500 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === i + 1
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-rose-500 hover:text-rose-500'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center disabled:opacity-30 hover:border-rose-500 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
