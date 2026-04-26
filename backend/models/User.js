const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
  isAdmin:   { type: Boolean, default: false }, // Keeping for backward compatibility
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
  
  // Sync isAdmin with role
  this.isAdmin = this.role === 'admin';
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
