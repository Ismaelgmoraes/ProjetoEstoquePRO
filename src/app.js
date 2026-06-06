/**
 * =============================================================
 * 📄 ARQUIVO: src/app.js
 * CAMADA: Aplicação
 * =============================================================
 *
 * Responsabilidade: configurar o Express — registrar middlewares
 * globais e conectar os roteadores. NÃO liga o servidor.
 *
 * FLUXO DE CONEXÃO:
 * ← Importado pelo index.js
 * → Registra as rotas de src/routes/produtoRoutes.js
 * =============================================================
 */

const express = require('express');
const produtoRoutes = require('./routes/produtoRoutes');

const app = express();

// ── Middlewares Globais ────────────────────────────────────────

// Permite receber body em JSON nas requisições POST e PUT
app.use(express.json());

// ── Rotas ─────────────────────────────────────────────────────

// Todas as rotas de /produtos serão gerenciadas pelo produtoRoutes
app.use('/produtos', produtoRoutes);

// Health check: útil para verificar se a API está no ar
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware 404: captura qualquer rota não mapeada
app.use((req, res) => {
  res.status(404).json({
    mensagem: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
  });
});

module.exports = app;