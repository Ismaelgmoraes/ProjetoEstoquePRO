/**
 * 📄 src/app.js — Configuração do Express com todas as rotas.
 */
const express = require('express');

const produtoRoutes      = require('./routes/produtoRoutes');
const categoriaRoutes    = require('./routes/categoriaRoutes');
const configuracaoRoutes = require('./routes/configuracaoRoutes');

const app = express();

// Serve os arquivos estáticos da pasta public (front-end)
app.use(express.static('public'));

// Interpreta body JSON
app.use(express.json());

// ── Rotas da API ───────────────────────────────────────────────
app.use('/produtos',      produtoRoutes);
app.use('/categorias',    categoriaRoutes);
app.use('/configuracoes', configuracaoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ mensagem: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

module.exports = app;