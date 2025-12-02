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
  },
  { timestamps: true }
);

// Atualiza o total automaticamente antes de salvar
ComandaSchema.pre("save", function (next) {
  this.total = this.produtos.reduce((acc, item) => acc + item.subtotal, 0);
  next();
});

module.exports = mongoose.model("Comanda", ComandaSchema);
