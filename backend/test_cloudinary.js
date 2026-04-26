require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function test() {
  try {
    console.log('Testing Cloudinary config...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    const result = await cloudinary.api.ping();
    console.log('Cloudinary Ping Result:', result);
  } catch (err) {
    console.error('Cloudinary Test Failed:', err);
  }
}

test();
