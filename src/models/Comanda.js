const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  quantidade: { type: Number, default: 1 },
  subtotal: { type: Number, required: true },
});

const ComandaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    produtos: [ProdutoSchema],

    // 🔢 Total sem taxa
    total: { type: Number, default: 0 },

    // 🍽️ Taxa de serviço
    taxaServicoPercentual: {
      type: Number,
      default: 0, // ex: 10 (%)
    },

    taxaServicoValor: {
      type: Number,
      default: 0,
    },

    // 💰 Total com taxa
    totalFinal: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["aberta", "fechada"],
      default: "aberta",
    },

    dataFechamento: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ComandaSchema.pre("save", function (next) {
  // total dos produtos
  this.total = this.produtos.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  // valor da taxa
  this.taxaServicoValor =
    (this.total * this.taxaServicoPercentual) / 100;

  // total final
  this.totalFinal = this.total + this.taxaServicoValor;

  next();
});

module.exports = mongoose.model("Comanda", ComandaSchema);
