import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            } catch(e) { } // Ignore cross-origin canvas taint errors
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

      const customerName = (user?.firstName || user?.lastName) 
        ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() 
        : (user?.name || 'Valued Customer');

      doc.text(`Name: ${customerName}`, 14, 52);
      doc.text(`Email: ${user?.email || 'N/A'}`, 14, 58);
      
      const addr = order.shippingAddress;
      let uAddr = user?.address;
      
      // If local auth context hasn't synced the address, fetch it dynamically!
      if (user?._id || user?.id) {
         try {
           const profileRes = await fetch(`/api/auth/profile/${user._id || user.id}`);
           if (profileRes.ok) {
             const fullUser = await profileRes.json();
             uAddr = fullUser.address;
           }
         } catch(e) { console.error('Failed to fetch user profile:', e); }
      }

      if (addr && addr.address && addr.address !== 'TBD') {
          doc.text(`Address: ${addr.address}, ${addr.city || ''} - ${addr.postalCode || ''}`, 14, 64);
          doc.text(`Phone: ${addr.phone || 'N/A'}`, 14, 70);
      } else if (uAddr && (uAddr.street || uAddr.city || uAddr.phone)) {
          doc.text(`Address: ${uAddr.street || 'N/A'}, ${uAddr.city || ''} - ${uAddr.zipCode || ''}`, 14, 64);
          doc.text(`Phone: ${uAddr.phone || 'N/A'}`, 14, 70);
      } else {
          doc.text(`Address: Provided during checkout`, 14, 64);
          doc.text(`Phone: Provided during checkout`, 14, 70);
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
      if(order.shippingPrice !== undefined && order.shippingPrice !== null) {
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
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  {order.status?.toLowerCase() !== 'cancelled' && (
                    <button 
                      onClick={() => generateInvoice(order)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      Invoice
                    </button>
                  )}
                  <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status || 'Pending')}`}>
                    {order.status || 'Pending'}
                  </div>
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
                        <p className="text-xs text-zinc-500">Variant: <span className="font-medium">{item.size || 'Standard'}</span> • Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
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
