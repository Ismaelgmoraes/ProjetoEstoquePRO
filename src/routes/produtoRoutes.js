/**
 * =============================================================
 * 📄 ARQUIVO: src/routes/produtoRoutes.js
 * CAMADA: Rotas
 * =============================================================
 *
 * Responsabilidade: mapear cada endpoint (URL + método HTTP)
 * para a função correta do Controller.
 *
 * Esta camada NÃO sabe nada sobre SQL ou lógica de negócio.
 * Ela só responde: "quando chamar X, execute Y."
 *
 * O prefixo '/produtos' é definido no app.js.
 * Aqui, '/' já significa '/produtos'.
 *
 * FLUXO DE CONEXÃO:
 * ← Registrado pelo src/app.js com app.use('/produtos', ...)
 * → Chama os métodos de src/controllers/produtoController.js
 * =============================================================
 */

const { Router } = require('express');
const {
  listarProdutos,
  buscarProdutoPorId,
  criarProdutos,
  atualizarProduto,
  deletarProduto,
} = require('../controllers/produtoController');

const router = Router();

// GET    /produtos        → lista todos
router.get('/',      listarProdutos);

// GET    /produtos/:id   → busca um por ID
router.get('/:id',   buscarProdutoPorId);

// POST   /produtos        → cria um ou vários (lote)
router.post('/',     criarProdutos);

// PUT    /produtos/:id   → atualiza por ID
router.put('/:id',   atualizarProduto);

// DELETE /produtos/:id   → deleta por ID
router.delete('/:id', deletarProduto);

module.exports = router;