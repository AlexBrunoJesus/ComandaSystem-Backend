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
  this.total = this.produtos.reduce((acc, item) => acc + item.subtotal, 0);
  next();
});

module.exports = mongoose.model("Comanda", ComandaSchema);
