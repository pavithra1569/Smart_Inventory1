const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],
    grandTotal: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
