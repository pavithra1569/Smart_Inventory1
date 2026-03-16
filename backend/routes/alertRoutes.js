const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// GET all low stock alerts
router.get("/", async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate("productId", "name quantity category")
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET pending alerts only
router.get("/pending", async (req, res) => {
    try {
        const alerts = await Alert.find({ status: "pending" })
            .populate("productId", "name quantity category")
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single alert
router.get("/:id", async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id).populate("productId");
        if (!alert) return res.status(404).json({ error: "Alert not found" });
        res.json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create alert (internal use - called when stock is low)
router.post("/", async (req, res) => {
    try {
        const { productId, productName, currentQuantity, threshold, message } = req.body;

        // Check if alert already exists for this product
        const existingAlert = await Alert.findOne({
            productId,
            status: "pending"
        });

        if (existingAlert) {
            return res.status(400).json({ error: "Alert already exists for this product" });
        }

        const alert = new Alert({
            productId,
            productName,
            currentQuantity,
            threshold,
            message,
            status: "pending"
        });

        await alert.save();
        res.status(201).json({ message: "Alert created", alert });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT mark alert as sent
router.put("/:id/sent", async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: "sent", sentAt: new Date() },
            { new: true }
        );

        if (!alert) return res.status(404).json({ error: "Alert not found" });
        res.json({ message: "Alert marked as sent", alert });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT mark alert as resolved
router.put("/:id/resolve", async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: "resolved", resolvedAt: new Date() },
            { new: true }
        );

        if (!alert) return res.status(404).json({ error: "Alert not found" });
        res.json({ message: "Alert resolved", alert });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE alert
router.delete("/:id", async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) return res.status(404).json({ error: "Alert not found" });
        res.json({ message: "Alert deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
