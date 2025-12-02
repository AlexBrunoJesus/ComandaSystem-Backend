const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./src/routes/auth");
const comandasRoutes = require("./src/routes/comandas");
const productRoutes = require("./src/routes/products");

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

app.use("/auth", authRoutes);
app.use("/comandas", comandasRoutes);
app.use("/products", productRoutes);

app.get("/", (req, res) => res.json({ status: "Server is running" }));

app.listen(3000, '0.0.0.0', () => console.log("🚀 Server started on port 3000"));

