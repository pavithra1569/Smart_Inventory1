require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { authenticate, authorize } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", authenticate, authorize(['admin', 'user']), require("./routes/productRoutes"));
app.use("/api/bills", authenticate, authorize(['admin', 'user']), require("./routes/billRoutes"));
app.use("/api/alerts", authenticate, authorize(['admin']), require("./routes/alertRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const { initializeWhatsApp } = require('./services/whatsappService');
  initializeWhatsApp();
});

