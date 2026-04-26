const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Skincare', 'Perfume'
  type: { type: String, required: true },     // e.g., 'Serum', 'EDP'
  images: [{ type: String, required: true }],
  
  // Array of variants for size-based pricing
  variants: [{
    size: { type: String, required: true },   // e.g., '50ml', '100ml', '30g'
    price: { type: Number, required: true },  // Price in Taka
    stock: { type: Number, required: true, default: 0 }
  }],
  
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
