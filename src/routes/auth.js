const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// 🔎 Regex simples e eficaz para validar e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ======================
 * 📌 REGISTRO
 * ======================
 */
router.post("/register", async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Preencha nome, e-mail e senha."
      });
    }

    // Normaliza e-mail
    email = email.trim().toLowerCase();

    // ❌ Validação obrigatória de e-mail
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Informe um e-mail válido."
      });
    }

    // Verifica se já existe
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).json({
        error: "Este e-mail já está cadastrado."
      });
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    // 🔐 Gera token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      status: "ok",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({
      error: "Erro interno do servidor."
    });
  }
});

/**
 * ======================
 * 🔐 LOGIN
 * ======================
 */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Informe e-mail e senha."
      });
    }

    // Normaliza e-mail
    email = email.trim().toLowerCase();

    // ❌ Bloqueia login sem e-mail válido
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "O login deve ser feito com um e-mail válido."
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado."
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: "Senha incorreta."
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "ok",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({
      error: "Erro interno do servidor."
    });
  }
});

module.exports = router;
