const express = require("express");
const router = express.Router();
const Comanda = require("../models/Comanda");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Criar comanda
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nome obrigatório" });

    const comanda = await Comanda.create({ name, userId: req.user.userId });
    res.status(201).json(comanda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar comandas do usuário logado
router.get("/", auth, async (req, res) => {
  try {
    const comandas = await Comanda.find({ userId: req.user.userId });
    res.json(comandas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar uma comanda específica
router.get("/:id", auth, async (req, res) => {
  try {
    const comanda = await Comanda.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!comanda) {
      return res.status(404).json({ error: "Comanda não encontrada" });
    }

    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ---------------------- //
// 🧾 ADICIONAR PRODUTOS  //
// ---------------------- //

// Adicionar produto à comanda
router.post("/:id/produtos", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { produtoId, quantidade = 1 } = req.body;

    const comanda = await Comanda.findById(id);
    const produto = await Product.findById(produtoId);

    if (!comanda || !produto)
      return res.status(404).json({ error: "Comanda ou produto não encontrado" });

    // Verifica se o produto já existe na comanda
    const existente = comanda.produtos.find(
      (p) => p.produto.toString() === produtoId
    );

    if (existente) {
      existente.quantidade += quantidade;
      existente.subtotal = existente.quantidade * existente.preco;
    } else {
      comanda.produtos.push({
        produto: produto._id,
        nome: produto.name,
        preco: produto.price,
        quantidade,
        subtotal: produto.price * quantidade,
      });
    }

    // Atualiza o total
    comanda.total = comanda.produtos.reduce((acc, item) => acc + item.subtotal, 0);
    await comanda.save();

    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

// Atualizar quantidade de produto
router.put("/:id/produtos/:produtoId", auth, async (req, res) => {
  try {
    const { id, produtoId } = req.params;
    const { quantidade } = req.body;

    const comanda = await Comanda.findById(id);
    if (!comanda) return res.status(404).json({ error: "Comanda não encontrada" });

    const item = comanda.produtos.find((p) => p.produto.toString() === produtoId);
    if (!item) return res.status(404).json({ error: "Produto não encontrado na comanda" });

    item.quantidade = quantidade;
    item.subtotal = item.preco * quantidade;

    comanda.total = comanda.produtos.reduce((acc, p) => acc + p.subtotal, 0);
    await comanda.save();

    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar quantidade" });
  }
});

// Remover produto da comanda
router.delete("/:id/produtos/:produtoId", auth, async (req, res) => {
  try {
    const { id, produtoId } = req.params;
    const comanda = await Comanda.findById(id);
    if (!comanda) return res.status(404).json({ error: "Comanda não encontrada" });

    comanda.produtos = comanda.produtos.filter(
      (p) => p.produto.toString() !== produtoId
    );

    comanda.total = comanda.produtos.reduce((acc, p) => acc + p.subtotal, 0);
    await comanda.save();

    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover produto" });
  }
});

module.exports = router;
