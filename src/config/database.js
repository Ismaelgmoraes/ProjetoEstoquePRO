/**
 * =============================================================
 * 📄 ARQUIVO: src/config/database.js
 * CAMADA: Configuração
 * =============================================================
 *
 * Responsabilidade: criar e exportar o pool de conexões MySQL.
 * Lê as credenciais do arquivo .env via process.env.
 * Nenhuma lógica de negócio ou SQL existe aqui.
 *
 * FLUXO DE CONEXÃO:
 * ← Importado por src/models/produtoModel.js
 * =============================================================
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // Lê as variáveis injetadas pelo dotenv (definidas no .env)
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Fila de espera quando todas as conexões estiverem ocupadas
  waitForConnections: true,

  // Máximo de conexões simultâneas abertas com o MySQL
  connectionLimit: 10,

  // 0 = sem limite de requisições na fila de espera
  queueLimit: 0,
});

module.exports = pool;