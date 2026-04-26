import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) return navigate('/signin');
    addToCart(product, quantity);
    setAddedToCart(true);
  };

  const handleWishlist = () => {
    if (!user) return navigate('/signin');
    if (isWishlisted(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[140px]">
      <span className="text-on-surface-variant text-lg">Loading product...</span>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-[140px]">
      <span className="text-on-surface-variant text-lg">Product not found.</span>
    </div>
  );

  const price = product.variants[selectedVariant]?.price;
  const wishlisted = isWishlisted(product._id);

  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-10 font-body-sm">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Image */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square rounded-2xl bg-white/60 border border-outline-variant flex items-center justify-center overflow-hidden p-8">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div>
            <span className="font-label-caps text-label-caps text-secondary tracking-widest">{product.category} · {product.type}</span>
            <h1 className="font-headline-display text-3xl text-primary mt-2 mb-3">{product.name}</h1>
            <p className="font-body-md text-on-surface-variant leading-relaxed">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <h3 className="font-label-caps text-label-caps text-primary tracking-widest mb-3">Size / Variant</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i)}
                    className={`px-4 py-2 rounded-lg border font-body-sm transition-all ${selectedVariant === i ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}
                  >
                    {v.size || `Option ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price & Stock */}
          <div className="flex items-center justify-between py-2">
            <div className="text-3xl font-bold text-primary">
              ৳ {price}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              product.variants[selectedVariant]?.stock > 10 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : product.variants[selectedVariant]?.stock > 0
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {product.variants[selectedVariant]?.stock > 0 
                ? `${product.variants[selectedVariant]?.stock} in stock` 
                : 'Out of stock'}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">Quantity</span>
            <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-primary hover:bg-surface-variant transition-colors">−</button>
              <span className="px-5 py-2 font-body-md border-x border-outline-variant">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-primary hover:bg-surface-variant transition-colors">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.variants[selectedVariant]?.stock === 0}
              className={`flex-1 py-4 rounded-xl font-label-caps tracking-widest uppercase transition-all duration-300 ${
                product.variants[selectedVariant]?.stock === 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : addedToCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }`}
            >
              {product.variants[selectedVariant]?.stock === 0 
                ? 'Out of Stock' 
                : addedToCart 
                ? '✓ Added!' 
                : 'Add to Bag'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-14 h-14 flex items-center justify-center rounded-xl border transition-all duration-300 ${wishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          </div>

          {/* Details */}
          {product.ingredients && (
            <div className="border-t border-outline-variant pt-6 mt-2">
              <h3 className="font-label-caps text-label-caps text-primary tracking-widest mb-3">Key Ingredients</h3>
              <p className="font-body-sm text-on-surface-variant leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          <div className="flex gap-6 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
              <span className="material-symbols-outlined text-[18px] text-rose-600">local_shipping</span> Free shipping over ৳ 10,000
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
              <span className="material-symbols-outlined text-[18px] text-rose-600">verified</span> 100% Authentic
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
