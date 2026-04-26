const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorRole: { type: String, default: 'Beauty Writer' },
  category: { type: String, required: true },
  tags: [String],
  image: { type: String, required: true },
  likes: { type: Number, default: 0 },
  readTime: { type: String, default: '5 min read' },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
