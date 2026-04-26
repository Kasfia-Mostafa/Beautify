import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function AdminBlogs() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', category: '', image: '', excerpt: '', content: '', tags: '', readTime: '5 min read'
  });

  useEffect(() => {
    fetchBlogs();
    if (location.search === '?new=true') {
      setShowModal(true);
    }
  }, [location]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const handleEdit = (b) => {
    setEditingBlog(b);
    setFormData({
      ...b,
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags
    });
    setShowModal(true);
  };

  const handleDelete = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    const token = localStorage.getItem('beautify_token');

    try {
      const res = await fetch(`/api/blogs/${blogToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Article deleted successfully");
        setShowDeleteModal(false);
        setBlogToDelete(null);
        fetchBlogs();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete article");
      }
    } catch (err) {
      toast.error("Error deleting article");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('beautify_token');
    
    if (!formData.image) {
      toast.error("Please upload or provide an image URL");
      return;
    }

    const url = editingBlog ? `/api/blogs/${editingBlog._id}` : '/api/blogs';
    const method = editingBlog ? 'PUT' : 'POST';

    // Slug generation
    const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Format tags
    const tagsArray = typeof formData.tags === 'string' 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : formData.tags;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, slug, tags: tagsArray }),
      });

      if (res.ok) {
        toast.success(editingBlog ? "Article updated successfully" : "Article published successfully");
        setShowModal(false);
        setEditingBlog(null);
        setFormData({ title: '', author: '', category: '', image: '', excerpt: '', content: '', tags: '', readTime: '5 min read' });
        fetchBlogs();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to save article");
      }
    } catch (err) {
      toast.error("Error saving article");
    }
  };

  const handleImageUpload = async (e) => {
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

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="font-headline-sm text-lg">Blog Management</h2>
          <p className="font-body-sm text-zinc-500">Create and edit articles for your journal</p>
        </div>
        <button
          onClick={() => { setEditingBlog(null); setFormData({ title: '', author: '', category: '', image: '', excerpt: '', content: '', tags: '', readTime: '5 min read' }); setShowModal(true); }}
          className="bg-zinc-900 dark:bg-rose-100 text-rose-50 dark:text-zinc-900 px-6 py-3 rounded-2xl font-label-caps text-xs tracking-widest uppercase hover:opacity-90 transition-all"
        >
          New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(b => (
          <article key={b._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden group">
            <div className="relative h-48">
              <img src={b.image} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleEdit(b)} className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-blue-500 shadow-sm hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => handleDelete(b)} className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <span className="font-label-caps text-[10px] tracking-widest uppercase text-rose-500 mb-2 block">{b.category}</span>
              <h3 className="font-headline-sm text-lg mb-2 line-clamp-2">{b.title}</h3>
              <p className="font-body-sm text-zinc-500 line-clamp-2 mb-4">{b.excerpt}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                 <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                   <span className="material-symbols-outlined text-[16px]">person</span>
                 </div>
                 <span className="font-body-sm text-xs text-zinc-600">{b.author}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100 dark:border-zinc-800">
             <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline-sm text-xl">{editingBlog ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={() => setShowModal(false)} className="material-symbols-outlined text-zinc-400 hover:text-zinc-600">close</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Title</label>
                  <input
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Author</label>
                    <input
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Category</label>
                    <input
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Read Time</label>
                    <input
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Tags (comma separated)</label>
                    <input
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="skincare, beauty, tips"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Article Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 flex items-center justify-center overflow-hidden">
                      {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <span className="material-symbols-outlined text-zinc-300">image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer disabled:opacity-50"
                      />
                      {uploading && <span className="ml-2 text-[10px] text-rose-500 animate-pulse">Uploading...</span>}
                      <p className="mt-2 text-[10px] text-zinc-400">PNG, JPG or WebP. Max 5MB.</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Or Image URL</label>
                    <input
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Excerpt</label>
                  <textarea
                    rows="2"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 mb-2">Content</label>
                  <textarea
                    rows="6"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100 font-mono text-sm"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" disabled={uploading} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-label-caps text-xs tracking-widest uppercase hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20">
                  {uploading ? 'Uploading...' : (editingBlog ? 'Update Article' : 'Publish Article')}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Delete Article</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{blogToDelete?.title}"</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete Article
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

export default AdminBlogs;
