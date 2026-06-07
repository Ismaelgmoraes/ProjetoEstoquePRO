/**
 * 📄 src/models/configuracaoModel.js
 * Leitura e escrita de configurações (chave/valor).
 */
const pool = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM configuracoes');
  // Transforma array [{chave, valor}] em objeto { chave: valor }
  return rows.reduce((acc, row) => { acc[row.chave] = row.valor; return acc; }, {});
};

const upsert = async (chave, valor) => {
  await pool.query(
    'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
    [chave, valor]
  );
};

module.exports = { findAll, upsert };