/**
 * 📄 src/models/usuarioModel.js
 * Leitura e atualização do usuário principal (id=1).
 */
const pool = require('../config/database');

const findOne = async () => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = 1');
  return rows[0];
};

const update = async ({ nome, cargo, email }) => {
  await pool.query(
    'UPDATE usuarios SET nome = ?, cargo = ?, email = ? WHERE id = 1',
    [nome, cargo, email]
  );
};

module.exports = { findOne, update };