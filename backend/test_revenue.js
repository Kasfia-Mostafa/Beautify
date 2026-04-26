require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beautify').then(async () => {
  const now = new Date();
  const days = [], labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  const weekly = await Promise.all(days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    return Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: day, $lt: nextDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]).then(r => r[0]?.total || 0);
  }));
  console.log('Labels:', labels);
  console.log('Weekly:', weekly);
  mongoose.disconnect();
});
