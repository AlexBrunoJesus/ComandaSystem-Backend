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

    total: { type: Number, default: 0 },

    taxaServicoPercentual: {
      type: Number,
      default: 0,
      enum: [0, 5, 10],
    },

    taxaServicoValor: {
      type: Number,
      default: 0,
    },

    totalFinal: {
      type: Number,
      default: 0,
    },

    taxaServicoAplicadaEm: {
      type: Date,
      default: null,
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
  if (this.status === "fechada") return next();

  this.total = this.produtos.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  this.taxaServicoValor =
    (this.total * this.taxaServicoPercentual) / 100;

  this.totalFinal = this.total + this.taxaServicoValor;

  next();
});

module.exports = mongoose.model("Comanda", ComandaSchema);
