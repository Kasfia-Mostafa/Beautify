require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beautify').then(async () => {
  const result = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, sales: { $sum: '$orderItems.quantity' }, revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
    { $sort: { sales: -1 } },
    { $limit: 5 }
  ]);
  console.log(JSON.stringify(result, null, 2));
  mongoose.disconnect();
});
