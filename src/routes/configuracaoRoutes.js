/**
 * 📄 src/routes/configuracaoRoutes.js
 * GET /configuracoes, POST /configuracoes
 */
const { Router } = require('express');
const { getConfiguracoes, salvarConfiguracoes } = require('../controllers/configuracaoController');

const router = Router();

router.get('/',  getConfiguracoes);
router.post('/', salvarConfiguracoes);

module.exports = router;