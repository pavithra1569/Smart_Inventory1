require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const newProduct = new Product({
      name: "Super Fertilizer A",
      category: "Fertilizer",
      price: 19.99,
      quantity: 50, // Start with plenty of stock
      unit: "kg",
      expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Expires in 1 year
    });
    await newProduct.save();
    console.log("✅ Successfully created a test product!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Database seed error:", err);
    process.exit(1);
  });
