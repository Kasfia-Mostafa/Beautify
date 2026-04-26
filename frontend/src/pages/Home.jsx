import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products`);
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="flex-grow pt-20">
      {/* Hero Section */}
      <section className="relative h-[819px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Floral Background" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_1DXmCI9nZL_Az5jEFdtM6DAJgOiOWH0BQBo-IeFpe2SIg9-vSUIzJVbwWEc2Xqq429yZknnahd1wYF2RT6sALpDDMUcrpVMX1uW1oVo-KFoC2Kt7HRzdEnM1stNZhZbzmrRB47ZjmL7qiyQ3VgwoEHrP8VyMty3BqiVWi1c90OLGm5y7GOsIlB7ggRn6WYFeR7qVhzqDAWvIIQHjXIglsktSpAdoqMiaYd-klSMQIJc75q-LQGXxkDSJeI_1Y2OLddOGGv1z9w2i" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 text-center max-w-3xl px-8 flex flex-col items-center gap-6 glass-panel p-12 rounded-2xl mx-4">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] uppercase">The New Botanical Collection</span>
          <h1 className="font-headline-display text-headline-display text-on-background">Radiance, Bottled.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Discover our latest synergy of rare orchids and cold-pressed botanical oils. Formulated for the quiet luxury of your daily ritual.</p>
          <Link to="/shop" className="btn-primary font-label-caps text-label-caps px-8 py-4 rounded-full uppercase tracking-widest mt-4 transition-colors duration-300 inline-block">Explore Collection</Link>
        </div>
      </section>

      {/* Dynamic Products (Featured Categories) */}
      <section className="max-w-container-max mx-auto px-8 py-section-gap">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Curated Essences</h2>
          <div className="h-px w-24 bg-primary mx-auto mt-6"></div>
        </div>
        {loading ? (
           <div className="text-center py-20">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {products.filter(p => p.isFeatured).slice(0, 3).map((product, index) => (
              <div key={product._id} className={`relative group rounded-xl overflow-hidden ${index === 0 ? 'md:col-span-2 md:row-span-2 h-[400px] md:h-full' : 'h-[300px] md:h-auto'}`}>
                <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.images[0]} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) return navigate('/signin');
                    isWishlisted(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);
                  }}
                  className={`absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-all z-10 ${isWishlisted(product._id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white/20 border-white/40 text-white hover:bg-white/40'}`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isWishlisted(product._id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                </button>

                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className={`font-headline-md text-white mb-2 ${index === 0 ? 'text-headline-md' : 'text-headline-sm'}`}>{product.name}</h3>
                  <p className="font-body-md text-body-md text-white/90 mb-4">{product.category} - ৳{product.variants[0]?.price}</p>
                  <Link to={`/product/${product._id}`} className="font-label-caps text-label-caps text-white uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                    View Details <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Philosophy Section */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Soft texture" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6nw6hveIrDKiyO-MPjAdSc7-5v4RpWtpTBl6CnZcokB2x41mxB2ezrJPK46rGhgP536XAfynZzfV9tj-R2ybKUyLTPPkCK1JYKMWrxi_RQqgAzBuBrXGoq0cAilViBP4HlqxApyadr-9mjRl63HC8il5A1G87EFexXY9dpTubS1PjNBDUl9Qx2tieQFyuA6_65JQjfOEOHuyyls3sbIrdwZWZhkHg0w792mUoAsk7aDGZe6AvAX6P4i-rjfy2h1ed0Mh2eluUjcUr" />
          <div className="absolute inset-0 bg-background/80"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-8 flex flex-col items-center gap-6">
          <h2 className="font-headline-display text-headline-lg md:text-headline-display text-on-background">The Art of Mindful Beauty</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">We believe that skincare is more than a routine—it is a moment of pause, a daily meditation. Every drop of our carefully crafted formulas is designed to reconnect you with the earth's most potent botanicals, honoring both your skin and your spirit.</p>
        </div>
      </section>

      {/* Ingredient Spotlight */}
      <section className="max-w-container-max mx-auto px-8 py-section-gap">
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] uppercase">Pure Elements</span>
          <h2 className="font-headline-lg text-headline-lg text-on-background mt-4">Botanical Core</h2>
          <div className="h-px w-24 bg-primary mx-auto mt-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-8 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-primary mb-6" data-icon="local_florist">local_florist</span>
            <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Damask Rose</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Sourced from the Valley of Roses, delivering intense hydration and calming properties to soothe tired skin.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-primary mb-6" data-icon="yard">yard</span>
            <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Night-Blooming Jasmine</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Hand-harvested at dusk to capture its peak essential oils, promoting cellular renewal and a radiant glow.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-primary mb-6" data-icon="eco">eco</span>
            <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Calabrian Bergamot</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Rich in vitamin C and antioxidants, this vibrant citrus extract clarifies the complexion and uplifts the senses.</p>
          </div>
        </div>
      </section>

      {/* The Ritual Guide */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="max-w-container-max mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background">The Ritual</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4 max-w-xl mx-auto">Three simple steps to awaken your skin's natural vitality.</p>
            <div className="h-px w-24 bg-primary mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[2rem] left-[16.66%] w-[66.66%] h-px bg-outline-variant z-0"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary-fixed mb-6 shadow-sm bg-background">
                <span className="font-headline-sm text-headline-sm text-primary">01</span>
              </div>
              <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Cleanse</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Gently dissolve impurities with our botanical oil cleanser, leaving the skin barrier perfectly balanced.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary-fixed mb-6 shadow-sm bg-background">
                <span className="font-headline-sm text-headline-sm text-primary">02</span>
              </div>
              <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Treat</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Press the essence into your skin to deliver a concentrated dose of active flora and targeted hydration.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary-fixed mb-6 shadow-sm bg-background">
                <span className="font-headline-sm text-headline-sm text-primary">03</span>
              </div>
              <h3 className="font-headline-md text-headline-sm text-on-background mb-3">Nourish</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Seal in moisture with our rich barrier cream, massaging in upward strokes to stimulate circulation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Join the Club */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Soft floral blur" className="w-full h-full object-cover opacity-70 blur-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNY1UbZYe5822p7OPBXzxPk9TZ6KArY_Fxy9-xCUNMjTI5MJjqJLbN_uyG-C2Phet8GJJf8UsCGiY6r4yYqE_MPVLgmc9oaa1w18IgwF5aytXGdAbbtkPNwl0wmt00t5RtGEdltHhTnRSsMkcwvJeuHGOFbdSjrmssZWs6gYvb6KAdTxXDIAfoFvJX1MwI7i7T1r5_4ABp8w4hu6VipgEDQJv_eaBUM-8QG0-7NabDOBUHjySz9_4a9I-u_UdHQ5Hq2VE3RW9XVlMj" />
          <div className="absolute inset-0 bg-primary-container/40"></div>
        </div>
        <div className="relative z-10 text-center max-w-2xl px-8 glass-panel p-12 rounded-3xl mx-4">
          <h2 className="font-headline-lg text-headline-md text-on-background mb-4">Join The Society</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">Subscribe to receive exclusive access to new releases, mindful beauty tips, and special privileges.</p>
          <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <input className="flex-grow px-6 py-4 rounded-full bg-white/80 border border-outline-variant text-on-background placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-md" placeholder="Your email address" type="email" />
            <button className="btn-primary font-label-caps text-label-caps px-8 py-4 rounded-full uppercase tracking-widest whitespace-nowrap transition-colors duration-300" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Home;
