const mongoose = require("mongoose");

const HistoricoComandaSchema = new mongoose.Schema(
  {
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    produtos: Array,

    total: Number,
    taxaServicoPercentual: Number,
    taxaServicoValor: Number,
    totalFinal: Number,

    dataFechamento: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HistoricoComanda",
  HistoricoComandaSchema
);
