require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const blogs = require('./data/blogs');

const seedBlogs = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautify';
    await mongoose.connect(uri);
    console.log('MongoDB Connected');

    await Blog.deleteMany({});
    console.log('Existing blogs cleared');

    await Blog.insertMany(blogs);
    console.log(`${blogs.length} blogs seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Blog seeding failed:', error.message);
    process.exit(1);
  }
};

seedBlogs();
