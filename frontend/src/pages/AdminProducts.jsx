import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function AdminProducts() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    type: '',
    description: '',
    images: [''],
    variants: [{ size: 'Default', price: 0, stock: 0 }]
  });

  useEffect(() => {
    fetchProducts();
    if (location.search === '?new=true') {
      setShowModal(true);
    }
  }, [location]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    // Ensure variants have the correct structure for the form
    const variants = p.variants && p.variants.length > 0
      ? p.variants.map(v => ({ ...v, size: v.size || 'Default' }))
      : [{ size: 'Default', price: 0, stock: 0 }];

    setFormData({ ...p, variants });
    setShowModal(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const token = localStorage.getItem('beautify_token');

    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Product deleted successfully");
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("Error deleting product");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('beautify_token');

    if (!formData.images[0] || formData.images[0] === '') {
      toast.error("Please upload a product image");
      return;
    }

    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Check if backend is running.");
      }

      if (res.ok) {
        toast.success(editingProduct ? "Product updated" : "Product added");
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          brand: '',
          category: '',
          type: '',
          description: '',
          images: [''],
          variants: [{ size: 'Default', price: 0, stock: 0 }]
        });
        fetchProducts();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to save product");
      }
    } catch (err) {
      toast.error("Error saving product");
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 w-full max-w-lg relative">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
           <input
             className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl outline-none focus:border-rose-500 transition-all text-sm"
             placeholder="Search products by name or category..."
             value={searchQuery}
             onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
           />
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="bg-rose-50/80 text-rose-500 px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-50/80 hover:text-rose-800 shadow-lg shadow-rose-500/20 transition-all whitespace-nowrap"
        >
          Add Product
        </button>
      </div>

      {/* Product Cards */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-5">
          <div className="col-span-3 font-label-caps text-xs tracking-widest uppercase text-zinc-400">Product</div>
          <div className="col-span-2 font-label-caps text-xs tracking-widest uppercase text-zinc-400">Category</div>
          <div className="col-span-6 font-label-caps text-xs tracking-widest uppercase text-zinc-400">
            <div className="grid grid-cols-3">
              <span>Variants</span>
              <span>Price</span>
              <span>Stocks</span>
            </div>
          </div>
          <div className="col-span-1 font-label-caps text-xs tracking-widest uppercase text-zinc-400 text-right">Actions</div>
        </div>

        {/* Product Rows */}
        {currentProducts.map((p, index) => (
          <div key={p._id} className="group grid grid-cols-12 gap-4 items-center bg-white dark:bg-zinc-900 px-8 py-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/30 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300">

            {/* Product Info */}
            <div className="col-span-3 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
                <img src={p.images[0]} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-base text-zinc-900 dark:text-white truncate">{p.name}</h4>
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{p.brand}</span>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                {p.category}
              </span>
            </div>

            {/* Variants / Price / Stocks — unified rows */}
            <div className="col-span-6">
              <div className="flex flex-col gap-2">
                {p.variants?.map((v, i) => {
                  const stockColor = v.stock > 10
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : v.stock > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-500 dark:text-red-400';
                  const dotColor = v.stock > 10
                    ? 'bg-emerald-500'
                    : v.stock > 0
                    ? 'bg-amber-500'
                    : 'bg-red-500';
                  return (
                    <div key={i} className="grid grid-cols-3 items-center py-2 px-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100/60 dark:border-zinc-800">
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">{v.size}</span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">৳{v.price.toLocaleString()}</span>
                      <span className={`text-sm font-bold flex items-center gap-1.5 ${stockColor}`}>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        {v.stock}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-end gap-1">
              <button onClick={() => handleEdit(p)} className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button onClick={() => handleDelete(p)} className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {currentProducts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <span className="material-symbols-outlined text-5xl text-zinc-200 dark:text-zinc-700 mb-4">inventory_2</span>
            <p className="text-zinc-400 text-sm">No products found</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6 pb-2">
             <button
               disabled={currentPage === 1}
               onClick={() => setCurrentPage(prev => prev - 1)}
               className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center disabled:opacity-30 hover:border-rose-300 transition-all"
             >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
             </button>
             {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all duration-200 ${currentPage === i + 1 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-110' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-rose-300'}`}
                >
                  {i + 1}
                </button>
             ))}
             <button
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage(prev => prev + 1)}
               className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center disabled:opacity-30 hover:border-rose-300 transition-all"
             >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
             </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline-sm text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="material-symbols-outlined text-zinc-400 hover:text-zinc-600">close</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Product Name</label>
                  <input
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Brand</label>
                  <input
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition-all"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Category</label>
                  <input
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Type (e.g. Serum, EDP)</label>
                  <input
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition-all min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 flex items-center justify-center overflow-hidden">
                    {formData.images[0] ? (
                      <img src={formData.images[0]} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <span className="material-symbols-outlined text-zinc-300">image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setUploading(true);
                        const uploadData = new FormData();
                        uploadData.append('image', file);

                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: uploadData
                          });

                          const contentType = res.headers.get("content-type");
                          if (!contentType || !contentType.includes("application/json")) {
                            throw new Error("Server returned non-JSON response. Check if backend is running.");
                          }

                          const data = await res.json();
                          if (res.ok && data.url) {
                            setFormData(prev => ({ ...prev, images: [data.url] }));
                            toast.success("Image uploaded successfully");
                          } else {
                            toast.error(data.message || "Upload failed");
                          }
                        } catch (err) {
                          toast.error(err.message || "Upload error");
                          console.error("Upload failed:", err);
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer disabled:opacity-50"
                    />
                    {uploading && <span className="ml-2 text-[10px] text-rose-500 animate-pulse">Uploading...</span>}
                    <p className="mt-2 text-[10px] text-zinc-400">PNG, JPG or WebP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Variants (Sizes, Price, Stock)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      variants: [...formData.variants, { size: '', price: 0, stock: 0 }]
                    })}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span> ADD VARIANT
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="col-span-4">
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Size</label>
                      <input
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-lg text-sm"
                        placeholder="e.g. 50ml"
                        value={variant.size}
                        onChange={(e) => {
                          const v = [...formData.variants];
                          v[index].size = e.target.value;
                          setFormData({ ...formData, variants: v });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Price</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-lg text-sm"
                        value={variant.price}
                        onChange={(e) => {
                          const v = [...formData.variants];
                          v[index].price = Number(e.target.value);
                          setFormData({ ...formData, variants: v });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1">Stock</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-lg text-sm"
                        value={variant.stock}
                        onChange={(e) => {
                          const v = [...formData.variants];
                          v[index].stock = Number(e.target.value);
                          setFormData({ ...formData, variants: v });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        disabled={formData.variants.length === 1}
                        onClick={() => {
                          const v = formData.variants.filter((_, i) => i !== index);
                          setFormData({ ...formData, variants: v });
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={uploading} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50">
                {uploading ? 'Uploading Image...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Confirm Deletion</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{productToDelete?.name}"</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete Product
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
