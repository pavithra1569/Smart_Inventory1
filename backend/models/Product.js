const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Fertilizer', 'Seed', 'Medicine','Herbicides','Fungicides','Insecticides'], required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum:['pcs','kg','litre'], default:'pcs' },
    expiry: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
