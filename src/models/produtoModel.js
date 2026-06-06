/**
 * =============================================================
 * 📄 ARQUIVO: src/models/produtoModel.js
 * CAMADA: Model (Modelo)
 * =============================================================
 *
 * Responsabilidade: ser o ÚNICO lugar do sistema que escreve
 * e executa comandos SQL. Representa a tabela `produtos` no banco.
 *
 * O Model não sabe nada sobre HTTP, req ou res.
 * Ele só recebe dados, faz a operação no banco e retorna o resultado.
 *
 * FLUXO DE CONEXÃO:
 * ← Chamado pelo src/controllers/produtoController.js
 * → Usa o pool de src/config/database.js para executar SQL
 * =============================================================
 */

const pool = require('../config/database');

// ── findAll ───────────────────────────────────────────────────
// Retorna todos os produtos da tabela
const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM produtos');
  return rows;
};

// ── findById ──────────────────────────────────────────────────
// Retorna um único produto pelo ID, ou undefined se não existir
const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM produtos WHERE id = ?',
    [id]
  );
  return rows[0];
};

// ── createMany ────────────────────────────────────────────────
// Insere um ou mais produtos em lote com uma única query
// Recebe um array de objetos: [{ nome, preco, quantidade }, ...]
const createMany = async (produtos) => {
  const valores = produtos.map(({ nome, preco, quantidade }) => [
    nome,
    preco,
    quantidade,
  ]);

  const [result] = await pool.query(
    'INSERT INTO produtos (nome, preco, quantidade) VALUES ?',
    [valores]
  );

  return result;
};

// ── update ────────────────────────────────────────────────────
// Atualiza apenas os campos enviados (monta a query dinamicamente)
const update = async (id, campos) => {
  const setClauses = [];
  const valores = [];

  if (campos.nome !== undefined) {
    setClauses.push('nome = ?');
    valores.push(campos.nome);
  }
  if (campos.preco !== undefined) {
    setClauses.push('preco = ?');
    valores.push(campos.preco);
  }
  if (campos.quantidade !== undefined) {
    setClauses.push('quantidade = ?');
    valores.push(campos.quantidade);
  }

  // Adiciona o id para a cláusula WHERE
  valores.push(id);

  const query = `UPDATE produtos SET ${setClauses.join(', ')} WHERE id = ?`;
  const [result] = await pool.query(query, valores);

  return result;
};

// ── remove ────────────────────────────────────────────────────
// Remove um produto pelo ID
const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM produtos WHERE id = ?',
    [id]
  );
  return result;
};

module.exports = { findAll, findById, createMany, update, remove };