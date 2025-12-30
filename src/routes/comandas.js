const express = require("express");
const router = express.Router();
const Comanda = require("../models/Comanda");
const Product = require("../models/Product");
const HistoricoComanda = require("../models/HistoricoComanda");
const auth = require("../middleware/auth");

/* ============================
   🆕 CRIAR COMANDA
============================ */
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nome obrigatório" });

    const comanda = await Comanda.create({
      name,
      userId: req.user.userId,
    });

    res.status(201).json(comanda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   📋 LISTAR COMANDAS
============================ */
router.get("/", auth, async (req, res) => {
  try {
    const comandas = await Comanda.find({ userId: req.user.userId });
    res.json(comandas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   🔍 BUSCAR COMANDA
============================ */
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

/* ============================
   🧾 ADICIONAR PRODUTO
============================ */
router.post("/:id/produtos", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { produtoId, quantidade = 1 } = req.body;

    const comanda = await Comanda.findById(id);
    const produto = await Product.findById(produtoId);

    if (!comanda || !produto) {
      return res.status(404).json({ error: "Comanda ou produto não encontrado" });
    }

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

    await comanda.save();
    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

/* ============================
   ✏️ ATUALIZAR QUANTIDADE
============================ */
router.put("/:id/produtos/:produtoId", auth, async (req, res) => {
  try {
    const { id, produtoId } = req.params;
    const { quantidade } = req.body;

    const comanda = await Comanda.findById(id);
    if (!comanda)
      return res.status(404).json({ error: "Comanda não encontrada" });

    const item = comanda.produtos.find(
      (p) => p.produto.toString() === produtoId
    );

    if (!item)
      return res
        .status(404)
        .json({ error: "Produto não encontrado na comanda" });

    item.quantidade = quantidade;
    item.subtotal = item.preco * quantidade;

    await comanda.save();
    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar quantidade" });
  }
});

/* ============================
   🗑️ REMOVER PRODUTO
============================ */
router.delete("/:id/produtos/:produtoId", auth, async (req, res) => {
  try {
    const { id, produtoId } = req.params;

    const comanda = await Comanda.findById(id);
    if (!comanda)
      return res.status(404).json({ error: "Comanda não encontrada" });

    comanda.produtos = comanda.produtos.filter(
      (p) => p.produto.toString() !== produtoId
    );

    await comanda.save();
    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover produto" });
  }
});

/* ============================
   🔄 ATUALIZAR TAXA
============================ */
router.put("/:id/taxa", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { taxaServicoPercentual } = req.body;

    if (![0, 5, 10].includes(taxaServicoPercentual)) {
      return res.status(400).json({ error: "Taxa inválida" });
    }

    const comanda = await Comanda.findOne({
      _id: id,
      userId: req.user.userId,
      status: "aberta",
    });

    if (!comanda) {
      return res
        .status(404)
        .json({ error: "Comanda não encontrada ou fechada" });
    }

    comanda.taxaServicoPercentual = taxaServicoPercentual;
    await comanda.save();

    res.json(comanda);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar taxa" });
  }
});

/* ============================
   ✅ FECHAR COMANDA
============================ */
router.put("/:id/fechar", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const comanda = await Comanda.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!comanda)
      return res.status(404).json({ error: "Comanda não encontrada" });

    // 🧾 Salva histórico COMPLETO
    await HistoricoComanda.create({
      name: comanda.name,
      userId: comanda.userId,
      produtos: comanda.produtos,
      total: comanda.total,
      taxaServicoPercentual: comanda.taxaServicoPercentual,
      taxaServicoValor: comanda.taxaServicoValor,
      totalFinal: comanda.totalFinal,
      dataFechamento: new Date(),
    });

    // 🔄 Reseta comanda
    comanda.produtos = [];
    comanda.total = 0;
    comanda.taxaServicoPercentual = 0;
    comanda.taxaServicoValor = 0;
    comanda.totalFinal = 0;
    comanda.status = "aberta";
    comanda.dataFechamento = null;

    await comanda.save();

    res.json({ message: "Comanda fechada e reiniciada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fechar comanda" });
  }
});

/* ============================
   📊 RELATÓRIO DE TAXA
============================ */
router.get("/relatorios/taxa", auth, async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    const relatorio = await HistoricoComanda.aggregate([
      {
        $match: {
          userId: req.user.userId,
          dataFechamento: {
            $gte: new Date(inicio),
            $lte: new Date(fim),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTaxa: { $sum: "$taxaServicoValor" },
          totalVendas: { $sum: "$totalFinal" },
          quantidadeComandas: { $sum: 1 },
        },
      },
    ]);

    res.json(
      relatorio[0] || {
        totalTaxa: 0,
        totalVendas: 0,
        quantidadeComandas: 0,
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

module.exports = router;
