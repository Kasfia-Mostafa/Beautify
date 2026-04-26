require('dotenv').config();
const mongoose = require('mongoose');
const products = require('./data/products');
const Product = require('./models/Product');
const User = require('./models/User');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany();

    const mappedProducts = products.map(p => ({
      name: p.title,
      description: p.description,
      brand: 'Beautify',
      category: p.category,
      type: p.type,
      images: p.images,
      variants: Object.entries(p.price || {}).map(([size, price]) => ({
        size: size,
        price: price,
        stock: typeof p.inStock === 'number' ? p.inStock : (p.inStock ? 50 : 0)
      })),
      isFeatured: p.popular || false
    }));

    await Product.insertMany(mappedProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
