/**
 * 📄 src/models/categoriaModel.js
 * Único lugar com SQL da tabela categorias.
 */
const pool = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nome');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ nome, cor }) => {
  const [result] = await pool.query(
    'INSERT INTO categorias (nome, cor) VALUES (?, ?)',
    [nome, cor || '#e8a020']
  );
  return result;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
  return result;
};

module.exports = { findAll, findById, create, remove };