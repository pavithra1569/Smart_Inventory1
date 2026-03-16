const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Product = require("../models/Product");

// POST generate bill and update stocks
router.post("/", async (req, res) => {
    try {
        const { items, grandTotal } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items in bill" });
        }

        // Process each item and update product quantities
        const billItems = [];
        
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
                });
            }

            // Update product quantity
            product.quantity -= item.quantity;
            await product.save();

            billItems.push({
                productId: product._id,
                quantity: item.quantity,
                unitPrice: product.price,
                total: product.price * item.quantity
            });
        }

        // Create and save bill
        const bill = new Bill({
            items: billItems,
            grandTotal
        });

        await bill.save();

        res.status(201).json({
            message: "Bill generated successfully and stocks updated",
            bill
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all bills
router.get("/", async (req, res) => {
    try {
        const bills = await Bill.find().populate('items.productId').sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
