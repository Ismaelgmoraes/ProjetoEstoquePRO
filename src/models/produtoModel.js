/**
 * 📄 src/models/produtoModel.js
 * Único lugar com SQL da tabela produtos.
 * Atualizado para suportar categoria_id e filtros avançados.
 */
const pool = require('../config/database');

const findAll = async (filtros = {}) => {
  let query = `
    SELECT p.*, c.nome AS categoria_nome, c.cor AS categoria_cor
    FROM produtos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE 1=1
  `;
  const valores = [];

  if (filtros.categoria_id) {
    query += ' AND p.categoria_id = ?';
    valores.push(filtros.categoria_id);
  }
  if (filtros.preco_min !== undefined) {
    query += ' AND p.preco >= ?';
    valores.push(filtros.preco_min);
  }
  if (filtros.preco_max !== undefined) {
    query += ' AND p.preco <= ?';
    valores.push(filtros.preco_max);
  }
  if (filtros.qtd_min !== undefined) {
    query += ' AND p.quantidade >= ?';
    valores.push(filtros.qtd_min);
  }
  if (filtros.qtd_max !== undefined) {
    query += ' AND p.quantidade <= ?';
    valores.push(filtros.qtd_max);
  }

  query += ' ORDER BY p.id DESC';
  const [rows] = await pool.query(query, valores);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.nome AS categoria_nome
     FROM produtos p
     LEFT JOIN categorias c ON p.categoria_id = c.id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0];
};

const createMany = async (produtos) => {
  const valores = produtos.map(({ nome, preco, quantidade, categoria_id }) => [
    nome, preco, quantidade, categoria_id || null
  ]);
  const [result] = await pool.query(
    'INSERT INTO produtos (nome, preco, quantidade, categoria_id) VALUES ?',
    [valores]
  );
  return result;
};

const update = async (id, campos) => {
  const setClauses = [];
  const valores = [];

  if (campos.nome !== undefined)         { setClauses.push('nome = ?');         valores.push(campos.nome); }
  if (campos.preco !== undefined)        { setClauses.push('preco = ?');        valores.push(campos.preco); }
  if (campos.quantidade !== undefined)   { setClauses.push('quantidade = ?');   valores.push(campos.quantidade); }
  if (campos.categoria_id !== undefined) { setClauses.push('categoria_id = ?'); valores.push(campos.categoria_id || null); }

  valores.push(id);
  const [result] = await pool.query(
    `UPDATE produtos SET ${setClauses.join(', ')} WHERE id = ?`,
    valores
  );
  return result;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
  return result;
};

module.exports = { findAll, findById, createMany, update, remove };