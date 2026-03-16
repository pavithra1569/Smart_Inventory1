const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    currentQuantity: { type: Number, required: true },
    threshold: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'sent', 'resolved'], default: 'pending' },
    message: { type: String },
    sentAt: { type: Date },
    resolvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
