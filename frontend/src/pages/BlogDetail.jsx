import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = '/api';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`${API}/blogs/${id}`)
      .then(r => r.json())
      .then(data => { setBlog(data); setLoading(false); })
      .catch(() => setLoading(false));

    // Check if already liked
    try {
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
      setLiked(likedBlogs.includes(id));
    } catch {}
  }, [id]);

  const handleLike = async () => {
    if (!user) return navigate('/signin');
    const action = liked ? 'unlike' : 'like';
    try {
      const token = localStorage.getItem('beautify_token');
      const res = await fetch(`${API}/blogs/${id}/like`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setBlog(prev => ({ ...prev, likes: data.likes }));

      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
      const newLiked = liked ? likedBlogs.filter(i => i !== id) : [...likedBlogs, id];
      localStorage.setItem('likedBlogs', JSON.stringify(newLiked));
      setLiked(!liked);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Render markdown-like content (bold, line breaks)
  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="font-headline-sm text-lg text-primary mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.startsWith('*') && line.includes('*:')) {
        const parts = line.replace(/^\*/, '').split('*:');
        return (
          <p key={i} className="font-body-md text-on-surface leading-relaxed mb-3">
            <strong className="text-primary">{parts[0]}:</strong>{parts[1]}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="font-body-md text-on-surface leading-relaxed mb-3">{line}</p>;
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[140px]">
      <span className="text-on-surface-variant">Loading article...</span>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center pt-[140px]">
      <span className="text-on-surface-variant">Article not found.</span>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-6 pt-[140px] pb-section-gap">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-10 font-body-sm">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Blog
      </button>

      {/* Category + Meta */}
      <div className="mb-6">
        <Link to="/blog">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
            {blog.category}
          </span>
        </Link>
        <h1 className="font-headline-display text-3xl md:text-4xl text-primary mb-5 leading-tight">{blog.title}</h1>
        <p className="font-body-lg text-on-surface-variant leading-relaxed mb-6 text-lg">{blog.excerpt}</p>

        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="font-body-md text-primary font-semibold">{blog.author}</p>
              <p className="font-body-sm text-xs text-on-surface-variant">{blog.authorRole} · {blog.readTime}</p>
            </div>
          </div>

          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all duration-300 font-label-caps text-sm tracking-widest ${
              liked
                ? 'bg-red-50 border-red-300 text-red-500'
                : 'border-outline-variant text-on-surface-variant hover:border-red-300 hover:text-red-400'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span>{blog.likes} {liked ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden mb-10 h-80 md:h-[400px]">
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Content */}
      <article className="prose-custom">
        {renderContent(blog.content)}
      </article>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-outline-variant">
          <h4 className="font-label-caps text-xs tracking-widest uppercase text-on-surface-variant mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-surface-variant rounded-full text-xs text-on-surface-variant font-body-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back CTA */}
      <div className="mt-12 text-center">
        <Link to="/blog" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-label-caps tracking-widest uppercase hover:bg-primary/90 transition-colors">
          Read More Articles
        </Link>
      </div>
    </main>
  );
}

export default BlogDetail;
