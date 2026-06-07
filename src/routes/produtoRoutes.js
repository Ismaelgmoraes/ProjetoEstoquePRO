/**
 * 📄 src/routes/produtoRoutes.js
 * Rotas de produtos — inclui endpoint de importação CSV.
 */
const { Router } = require('express');
const multer = require('multer');
const {
  listarProdutos, buscarProdutoPorId, criarProdutos,
  importarCSV, atualizarProduto, deletarProduto
} = require('../controllers/produtoController');

const router = Router();

// multer com memoryStorage — não salva em disco, mantém em buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // máx 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .csv são aceitos.'));
    }
  }
});

router.get('/',              listarProdutos);
router.get('/:id',           buscarProdutoPorId);
router.post('/',             criarProdutos);
router.post('/importar',     upload.single('arquivo'), importarCSV);
router.put('/:id',           atualizarProduto);
router.delete('/:id',        deletarProduto);

module.exports = router;