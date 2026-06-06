/**
 * =============================================================
 * 📄 ARQUIVO: src/controllers/produtoController.js
 * CAMADA: Controller (Controlador)
 * =============================================================
 *
 * Responsabilidade: gerenciar o ciclo HTTP de cada operação.
 *   1. Extrair dados da requisição (req.body, req.params)
 *   2. Chamar o método correto do Model
 *   3. Devolver a resposta HTTP com o status correto (res)
 *
 * O Controller NÃO escreve SQL — isso é responsabilidade do Model.
 * O Controller NÃO sabe em qual URL é chamado — isso é da Rota.
 *
 * FLUXO DE CONEXÃO:
 * ← Chamado por src/routes/produtoRoutes.js
 * → Delega as operações de banco para src/models/produtoModel.js
 * =============================================================
 */

const ProdutoModel = require('../models/produtoModel');

// ── GET /produtos ─────────────────────────────────────────────
const listarProdutos = async (req, res) => {
  try {
    const produtos = await ProdutoModel.findAll();
    return res.status(200).json(produtos);
  } catch (error) {
    console.error('[listarProdutos]', error.message);
    return res.status(500).json({ mensagem: 'Erro ao buscar produtos.', erro: error.message });
  }
};

// ── GET /produtos/:id ─────────────────────────────────────────
const buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await ProdutoModel.findById(id);

    if (!produto) {
      return res.status(404).json({ mensagem: `Produto com id ${id} não encontrado.` });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error('[buscarProdutoPorId]', error.message);
    return res.status(500).json({ mensagem: 'Erro ao buscar produto.', erro: error.message });
  }
};

// ── POST /produtos ────────────────────────────────────────────
const criarProdutos = async (req, res) => {
  try {
    // Normaliza: aceita objeto único ou array (inserção em lote)
    const produtos = Array.isArray(req.body) ? req.body : [req.body];

    if (produtos.length === 0) {
      return res.status(400).json({ mensagem: 'Nenhum produto enviado.' });
    }

    // Valida se todos os itens têm os campos obrigatórios
    for (const p of produtos) {
      if (!p.nome || p.preco === undefined || p.quantidade === undefined) {
        return res.status(400).json({
          mensagem: 'Cada produto deve ter: nome, preco e quantidade.',
        });
      }
    }

    const result = await ProdutoModel.createMany(produtos);

    return res.status(201).json({
      mensagem: `${result.affectedRows} produto(s) inserido(s) com sucesso.`,
      totalInseridos: result.affectedRows,
      primeiroIdInserido: result.insertId,
    });
  } catch (error) {
    console.error('[criarProdutos]', error.message);
    return res.status(500).json({ mensagem: 'Erro ao criar produto(s).', erro: error.message });
  }
};

// ── PUT /produtos/:id ─────────────────────────────────────────
const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, quantidade } = req.body;

    if (!nome && preco === undefined && quantidade === undefined) {
      return res.status(400).json({
        mensagem: 'Informe ao menos um campo para atualizar: nome, preco ou quantidade.',
      });
    }

    // Verifica se o produto existe antes de tentar atualizar
    const produtoExistente = await ProdutoModel.findById(id);
    if (!produtoExistente) {
      return res.status(404).json({ mensagem: `Produto com id ${id} não encontrado.` });
    }

    await ProdutoModel.update(id, { nome, preco, quantidade });

    return res.status(200).json({ mensagem: `Produto com id ${id} atualizado com sucesso.` });
  } catch (error) {
    console.error('[atualizarProduto]', error.message);
    return res.status(500).json({ mensagem: 'Erro ao atualizar produto.', erro: error.message });
  }
};

// ── DELETE /produtos/:id ──────────────────────────────────────
const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o produto existe antes de tentar deletar
    const produtoExistente = await ProdutoModel.findById(id);
    if (!produtoExistente) {
      return res.status(404).json({ mensagem: `Produto com id ${id} não encontrado.` });
    }

    await ProdutoModel.remove(id);

    return res.status(200).json({ mensagem: `Produto com id ${id} deletado com sucesso.` });
  } catch (error) {
    console.error('[deletarProduto]', error.message);
    return res.status(500).json({ mensagem: 'Erro ao deletar produto.', erro: error.message });
  }
};

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProdutos,
  atualizarProduto,
  deletarProduto,
};