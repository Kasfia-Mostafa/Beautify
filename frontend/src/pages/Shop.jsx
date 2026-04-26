import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Shop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(15000);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products`);
        const data = await response.json();
        setProducts(data);
        if (data.length > 0) {
          const highestPrice = Math.max(...data.map(p => p.variants[0]?.price || 0));
          setMaxPrice(highestPrice);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const types = useMemo(() => [...new Set(products.map(p => p.type))], [products]);
  const absoluteMaxPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.variants[0]?.price || 0)) : 15000, [products]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    setCurrentPage(1);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTypes([]);
    setMaxPrice(absoluteMaxPrice);
    setCurrentPage(1);
  };

  const hasFilters = searchQuery.trim() !== "" || selectedCategories.length > 0 || selectedTypes.length > 0 || maxPrice < absoluteMaxPrice;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const basePrice = product.variants[0]?.price || 0;
      const searchMatch = searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const priceMatch = basePrice <= maxPrice;
      return searchMatch && categoryMatch && typeMatch && priceMatch;
    });
  }, [products, searchQuery, selectedCategories, selectedTypes, maxPrice]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      <div className="text-center mb-16">
        <h1 className="font-headline-display text-headline-display text-primary mb-4">Curated Radiance</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Discover our collection of transformative skincare, formulated with ethereal botanicals to illuminate your natural grace.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto pr-4 flex flex-col gap-8 pb-8 custom-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-primary">Filters</h2>
              <button
                onClick={clearFilters}
                disabled={!hasFilters}
                className={`font-label-caps text-label-caps tracking-widest uppercase transition-all duration-300 ${hasFilters ? 'text-secondary hover:text-primary underline decoration-rose-200 underline-offset-4 opacity-100' : 'text-outline opacity-50 cursor-not-allowed'}`}
              >
                Clear All
              </button>
            </div>

            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-surface/50 border border-outline-variant rounded-full pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md transition-colors"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              </div>
            </div>

            <div>
              <h3 className="font-body-lg text-body-lg text-primary border-b border-outline-variant pb-2 mb-4">Max Price (৳)</h3>
              <div className="flex flex-col gap-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max={absoluteMaxPrice}
                  step="100"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-on-surface-variant font-body-sm">
                  <span>৳ 0</span>
                  <span className="font-medium text-primary">৳ {maxPrice}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-body-lg text-body-lg text-primary border-b border-outline-variant pb-2 mb-4">Category</h3>
              <ul className="flex flex-col gap-3">
                {categories.map((cat, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        className="form-checkbox h-4 w-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-offset-surface focus:ring-offset-2 transition duration-200"
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                      />
                      <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-body-lg text-body-lg text-primary border-b border-outline-variant pb-2 mb-4">Type</h3>
              <ul className="flex flex-col gap-3">
                {types.map((type, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        className="form-checkbox h-4 w-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-offset-surface focus:ring-offset-2 transition duration-200"
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                      />
                      <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">{type}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20">Loading products...</div>
            ) : currentProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-on-surface-variant text-lg">
                No products found matching your filters.
                <br />
                <button onClick={clearFilters} className="mt-4 text-primary hover:text-primary-dark underline font-label-caps text-label-caps tracking-widest uppercase">Clear Filters</button>
              </div>
            ) : (
              currentProducts.map((product) => (
                <article key={product._id} className="group flex flex-col bg-surface/60 backdrop-blur-3xl border border-outline-variant rounded-xl overflow-hidden hover:shadow-[0_8px_40px_rgba(244,215,212,0.4)] transition-all duration-500 h-full relative">
                  <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden bg-white/50 flex-shrink-0 p-4 block">
                    <img alt={product.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply" src={product.images[0]}/>
                    <button
                      aria-label="Add to Wishlist"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!user) return navigate('/signin');
                        isWishlisted(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);
                      }}
                      className={`absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-colors z-10 ${isWishlisted(product._id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-surface-bright/40 border-white/20 text-primary hover:bg-surface-bright/80'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isWishlisted(product._id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    </button>
                  </Link>
                  <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-surface/0 to-surface/80">
                    <span className="font-label-caps text-label-caps text-secondary tracking-widest mb-2">{product.category}</span>
                    <Link to={`/product/${product._id}`}>
                      <h2 className="font-headline-sm text-headline-sm text-primary mb-2 line-clamp-2 leading-snug min-h-[3rem] hover:underline">{product.name}</h2>
                    </Link>
                    <div className="mt-auto pt-4 flex flex-col gap-4">
                      <span className="font-body-lg text-body-lg text-on-primary-fixed-variant font-medium">৳ {product.variants[0]?.price}</span>
                      <button
                        onClick={() => {
                          if (!user) return navigate('/signin');
                          addToCart(product);
                        }}
                        className="w-full py-2.5 bg-primary-container/30 hover:bg-primary-container text-primary font-label-caps text-label-caps tracking-widest uppercase border border-primary/10 rounded-md transition-colors duration-300"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 py-8 border-t border-rose-100 dark:border-zinc-800">
               <button
                 disabled={currentPage === 1}
                 onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                 className="w-12 h-12 rounded-2xl border border-rose-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 disabled:opacity-20 transition-all"
               >
                  <span className="material-symbols-outlined">chevron_left</span>
               </button>

               {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${
                      currentPage === i + 1
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 text-zinc-500 hover:border-rose-500'
                    }`}
                  >
                    {i + 1}
                  </button>
               ))}

               <button
                 disabled={currentPage === totalPages}
                 onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                 className="w-12 h-12 rounded-2xl border border-rose-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 disabled:opacity-20 transition-all"
               >
                  <span className="material-symbols-outlined">chevron_right</span>
               </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Shop;
