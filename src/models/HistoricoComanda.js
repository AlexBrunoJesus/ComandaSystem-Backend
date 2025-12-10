const mongoose = require("mongoose");

const HistoricoComandaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    produtos: { type: Array, required: true },
    total: { type: Number, required: true },
    dataFechamento: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HistoricoComanda", HistoricoComandaSchema);
