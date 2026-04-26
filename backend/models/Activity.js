const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'product_update', 'new_order', 'new_user', 'blog_published'
  message: { type: String, required: true },
  details: { type: Object },
  admin: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
