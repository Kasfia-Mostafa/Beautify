import React from 'react';

function About() {
  return (
    <main className="max-w-container-max mx-auto px-8 pt-[140px] pb-section-gap flex-grow">
      <div className="text-center mb-20">
        <h1 className="font-headline-display text-headline-display text-primary mb-6">Our Story</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Born from a passion for botanical elegance, Beautify is dedicated to bringing you skincare that is as pure as it is effective.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-16 items-center mb-24">
        <div className="w-full md:w-1/2">
          <div className="aspect-[4/5] bg-surface-variant rounded-2xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop"
              alt="Botanical Ingredients"
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h2 className="font-headline-md text-headline-md text-primary">The Art of Purity</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            We believe that nature provides the most potent ingredients for radiant skin. Every product in our collection is meticulously crafted using sustainably sourced botanicals, cold-pressed oils, and advanced clinical actives.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Our formulations are free from harsh chemicals, synthetic fragrances, and artificial dyes. Instead, we rely on the inherent power of nature to restore, protect, and illuminate your complexion.
          </p>
        </div>
      </div>

      <div className="bg-surface p-12 md:p-20 rounded-3xl text-center mb-20 border border-outline-variant">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-12">Our Commitments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-rose-600">cruelty_free</span>
            <h3 className="font-headline-sm text-lg text-primary">Cruelty Free</h3>
            <p className="font-body-sm text-on-surface-variant">Never tested on animals, always tested on real people with real skin concerns.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-rose-600">eco</span>
            <h3 className="font-headline-sm text-lg text-primary">Sustainable</h3>
            <p className="font-body-sm text-on-surface-variant">Packaged in recyclable glass and post-consumer recycled materials.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-rose-600">science</span>
            <h3 className="font-headline-sm text-lg text-primary">Clinically Proven</h3>
            <p className="font-body-sm text-on-surface-variant">Formulated by dermatologists and backed by rigorous clinical testing.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default About;
