const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// 🔹 HEALTH CHECK (ANTES das rotas)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Rotas
app.use("/auth", require("./src/routes/auth"));
app.use("/comandas", require("./src/routes/comandas"));
app.use("/products", require("./src/routes/products"));

// Rota raiz (opcional)
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) =>
    console.error("❌ Database connection error:", err)
  );

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
