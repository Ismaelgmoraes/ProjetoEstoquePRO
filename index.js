/**
 * =============================================================
 * 📄 ARQUIVO: index.js  (raiz do projeto)
 * CAMADA: Ponto de Entrada
 * =============================================================
 *
 * Responsabilidade ÚNICA: importar o app configurado e ligar
 * o servidor HTTP na porta definida no .env.
 *
 * Não há lógica de rotas, banco ou negócio aqui.
 * =============================================================
 */

// Carrega as variáveis do arquivo .env para o process.env
// Deve ser a PRIMEIRA linha executada na aplicação.
require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Produtos:     http://localhost:${PORT}/produtos`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('==============================================');
});