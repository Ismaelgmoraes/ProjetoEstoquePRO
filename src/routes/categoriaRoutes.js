/**
 * 📄 src/routes/categoriaRoutes.js
 * GET /categorias, POST /categorias, DELETE /categorias/:id
 */
const { Router } = require('express');
const { listarCategorias, criarCategoria, deletarCategoria } = require('../controllers/categoriaController');

const router = Router();

router.get('/',     listarCategorias);
router.post('/',    criarCategoria);
router.delete('/:id', deletarCategoria);

module.exports = router;