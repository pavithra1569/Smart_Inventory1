const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Alert = require("../models/Alert");
const { sendLowStockAlert } = require("../services/whatsappService");

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single product
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add product
router.post("/", async (req, res) => {
    try {
        const { name, category, price, quantity, unit, expiry } = req.body;

        const product = new Product({ name, category, price, quantity, unit, expiry });
        await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update product
router.put("/:id", async (req, res) => {
    try {
        const { name, category, price, quantity, unit, expiry } = req.body;
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, category, price, quantity, unit, expiry },
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ error: "Product not found" });

        // Check for low stock and create alert
        if (quantity < LOW_STOCK_THRESHOLD) {
            const existingAlert = await Alert.findOne({
                productId: req.params.id,
                status: "pending"
            });

            if (!existingAlert) {
                const productName = product.name || name;
                const alert = new Alert({
                    productId: req.params.id,
                    productName,
                    currentQuantity: quantity,
                    threshold: LOW_STOCK_THRESHOLD,
                    message: `Low stock alert for ${productName}. Current: ${quantity}, Threshold: ${LOW_STOCK_THRESHOLD}`,
                    status: "pending"
                });
                await alert.save();

                // Send WhatsApp notification
                try {
                    await sendLowStockAlert(productName, quantity, LOW_STOCK_THRESHOLD);
                    alert.status = "sent";
                    alert.sentAt = new Date();
                    await alert.save();
                } catch (whatsappError) {
                    console.error("WhatsApp send failed:", whatsappError);
                    // Alert stays in pending status if WhatsApp fails
                }
            }
        }

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE product
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
