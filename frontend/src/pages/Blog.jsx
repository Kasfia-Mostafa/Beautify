import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = '/api';

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedBlogs') || '[]'); } catch { return []; }
  });
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(`${API}/blogs`)
      .then(r => r.json())
      .then(data => { setBlogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(blogs.map(b => b.category))];

  const filteredBlogs = activeCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === activeCategory);

  const handleLike = async (e, blogId) => {
    e.preventDefault();
    const alreadyLiked = likedPosts.includes(blogId);
    const action = alreadyLiked ? 'unlike' : 'like';

    try {
      const res = await fetch(`${API}/blogs/${blogId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      setBlogs(prev => prev.map(b => b._id === blogId ? { ...b, likes: data.likes } : b));

      const newLiked = alreadyLiked
        ? likedPosts.filter(id => id !== blogId)
        : [...likedPosts, blogId];
      setLikedPosts(newLiked);
      localStorage.setItem('likedBlogs', JSON.stringify(newLiked));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-headline-display text-headline-display text-primary mb-4">Beauty Journal</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Expert tips, ingredient breakdowns, and skincare rituals curated by our team of beauty specialists.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full font-label-caps text-xs tracking-widest uppercase transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-primary text-on-primary shadow-md'
                : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-24 text-on-surface-variant">Loading articles...</div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-24 text-on-surface-variant">No articles found.</div>
      ) : (
        <>
          {/* Featured Post (first one) */}
          {activeCategory === 'All' && blogs[0] && (
            <Link to={`/blog/${blogs[0]._id}`} className="group block mb-12">
              <div className="relative rounded-2xl overflow-hidden h-[420px] bg-surface-variant">
                <img
                  src={blogs[0].image}
                  alt={blogs[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-block bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">Featured</span>
                  <h2 className="font-headline-display text-2xl md:text-3xl text-white mb-3 group-hover:underline decoration-rose-400">{blogs[0].title}</h2>
                  <p className="text-white/80 font-body-md line-clamp-2 mb-4 max-w-2xl">{blogs[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-white/70 font-body-sm">
                    <span>{blogs[0].author}</span>
                    <span>·</span>
                    <span>{blogs[0].readTime}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                      {blogs[0].likes}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(activeCategory === 'All' ? filteredBlogs.slice(1) : filteredBlogs).map(blog => {
              const liked = likedPosts.includes(blog._id);
              return (
                <article key={blog._id} className="group flex flex-col bg-surface border border-outline-variant rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500">
                  <Link to={`/blog/${blog._id}`} className="relative h-52 overflow-hidden block">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                      {blog.category}
                    </span>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <Link to={`/blog/${blog._id}`}>
                      <h2 className="font-headline-sm text-lg text-primary mb-2 line-clamp-2 leading-snug group-hover:underline decoration-rose-400">
                        {blog.title}
                      </h2>
                    </Link>
                    <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-4 leading-relaxed flex-grow">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                        </div>
                        <div>
                          <p className="font-body-sm text-xs text-primary font-medium">{blog.author}</p>
                          <p className="font-body-sm text-[10px] text-on-surface-variant">{blog.readTime}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleLike(e, blog._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                          liked
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'border-outline-variant text-on-surface-variant hover:border-red-300 hover:text-red-400'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                        <span className="text-xs font-medium">{blog.likes}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

export default Blog;
