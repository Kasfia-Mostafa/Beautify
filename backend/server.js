require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Beautify API is running' });
});

// ─── USER WISHLIST ────────────────────────────────────────────────────────
app.get('/api/user/wishlist', async (req, res) => {
  try {
    const user = await User.findById(req.query.userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user/wishlist/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const productId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isWishlisted = user.wishlist.includes(productId);
    if (isWishlisted) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── CLOUDINARY CONFIG ──────────────────────────────────────────────────────
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'beautify_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      console.error('Upload failed: No file provided');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded to Cloudinary:', req.file.path);
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error during upload' });
  }
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Order = require('./models/Order');
const Activity = require('./models/Activity');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY?.trim(), {
  apiVersion: '2023-10-16',
});
const JWT_SECRET = process.env.JWT_SECRET || 'beautify_secret_2026';

// Helper to log admin activity
const logActivity = async (type, message, details = {}) => {
  try {
    await Activity.create({ type, message, details });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

// Auth Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Make the first user an admin automatically
    const count = await User.countDocuments({});
    const role = count === 0 ? 'admin' : 'user';

    const user = await User.create({ firstName, lastName, email, password, role });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isAdmin: user.isAdmin }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET PROFILE
app.get('/api/auth/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PROFILE (Consolidated)
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, password, address, oldEmail } = req.body;
    
    // Find user
    const user = await User.findById(userId || req.body.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    
    if (address) {
      // Map state to country if provided
      if (address.state && !address.country) {
        address.country = address.state;
      }
      delete address.state;

      // Safely merge address to ensure we don't lose any subfields
      const currentAddress = user.address 
        ? (typeof user.address.toObject === 'function' ? user.address.toObject() : user.address)
        : {};

      user.address = {
        ...currentAddress,
        ...address
      };
      user.markModified('address');
    }
    
    if (password) {
      user.password = password;
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role, 
        isAdmin: user.isAdmin, 
        address: user.address 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const Product = require('./models/Product');
const Blog = require('./models/Blog');

// ─── PUBLIC PRODUCTS ────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUBLIC BLOGS ───────────────────────────────────────────────────────────
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/blogs/:id/like', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const increment = action === 'like' ? 1 : -1;
    const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { likes: increment } }, { new: true });
    res.json({ likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ─── PAYMENTS (STRIPE) ────────────────────────────────────────────────────────
app.post('/api/stripe-checkout', protect, async (req, res) => {
  try {
    const { items } = req.body;
    console.log('Creating checkout session for items:', items.length);
    
    const line_items = items.map(item => {
      const price = item.variants[0]?.price || 0;
      const imageUrl = item.images[0] && item.images[0].startsWith('http') ? item.images[0] : null;
      
      console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${item.quantity}`);

      return {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : [],
            description: item.category,
          },
          unit_amount: Math.round(price * 100), 
        },
        quantity: item.quantity,
      };
    });

    // Add shipping if necessary
    const totalItemsPrice = items.reduce((sum, item) => sum + (item.variants[0]?.price || 0) * item.quantity, 0);
    if (totalItemsPrice < 10000) {
      line_items.push({
        price_data: {
          currency: 'bdt',
          product_data: {
            name: 'Shipping Fee',
            description: 'Standard delivery charge',
          },
          unit_amount: 60 * 100, // 60 BDT
        },
        quantity: 1,
      });
    }

    if (line_items.length === 0) {
       return res.status(400).json({ message: 'Cart is empty' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        itemCount: items.length.toString(),
      }
    });

    console.log('Stripe Session URL:', session.url);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error.type === 'StripeCardError') {
      console.error('Stripe Card Error:', error.message);
    } else {
      console.error('Stripe API Error:', error);
    }
    res.status(error.statusCode || 500).json({ 
      message: error.message, 
      type: error.type,
      detail: error.raw?.message || error.message
    });
  }
});



// User Order History
app.get('/api/orders/my-orders', async (req, res) => {
  try {
    // In a real app, use req.user.id from auth middleware
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const orders = await Order.find({ user: user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Order (Backend direct checkout)
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;
    
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      status: 'Pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Search (Admin)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const products = await Product.countDocuments({});
    const blogs = await Blog.countDocuments({});
    const users = await User.countDocuments({});
    const orders = await Order.countDocuments({});
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      products, blogs, users, orders,
      revenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/activity', async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN USERS ─────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    // Check limits
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount >= 2) return res.status(400).json({ message: 'Maximum 2 admins allowed' });
    }
    if (role === 'manager') {
      const managerCount = await User.countDocuments({ role: 'manager' });
      if (managerCount >= 3) return res.status(400).json({ message: 'Maximum 3 managers allowed' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role, isAdmin: role === 'admin' }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN ORDERS ────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Decrease stock if status is changed to Delivered
    if (status === 'Delivered' && order.status !== 'Delivered') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const variantIndex = product.variants.findIndex(v => v.size === item.size);
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - item.quantity);
            await product.save();
          }
        }
      }
    }
    
    order.status = status;
    await order.save();
    
    // Log activity
    await logActivity('order_update', `Order #${order._id.toString().substring(18).toUpperCase()} status changed to ${status}`);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── REVENUE CHART DATA ──────────────────────────────────────────────────────
app.get('/api/admin/revenue-chart', async (req, res) => {
  try {
    // Last 7 days revenue per day
    const days = [], labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });
      const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(`${date} ${day}`);
    }

    const weeklyPromises = days.map(day => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      return Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: day, $lt: nextDay } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]).then(r => r[0]?.total || 0);
    });
    const weekly = await Promise.all(weeklyPromises);

    // Top products by total quantity sold (from all Delivered/Paid orders)
    const topProductsAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          sales: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    res.json({ weekly, labels, topProducts: topProductsAgg.map(p => ({ name: p.name, sales: p.sales, revenue: p.revenue })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN PRODUCTS CRUD ───────────────────────────────────────────────────
app.post('/api/products', protect, async (req, res) => {
  try {
    console.log('Adding product:', req.body.name);
    const product = await Product.create(req.body);
    await logActivity('product_create', `New product "${product.name}" added`);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', protect, async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await logActivity('product_update', `Product "${product.name}" updated`);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', protect, async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await logActivity('product_delete', `Product "${product.name}" removed`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN BLOGS CRUD ──────────────────────────────────────────────────────
app.post('/api/blogs', protect, async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    await logActivity('blog_create', `New article "${blog.title}" published`);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/blogs/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await logActivity('blog_update', `Article "${blog.title}" edited`);
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/blogs/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await logActivity('blog_delete', `Article "${blog.title}" deleted`);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautify';
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
  }
};

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    error: err
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
