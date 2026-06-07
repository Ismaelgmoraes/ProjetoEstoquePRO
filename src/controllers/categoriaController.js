/**
 * 📄 src/controllers/categoriaController.js
 * Gerencia req/res para categorias.
 */
const CategoriaModel = require('../models/categoriaModel');

const listarCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaModel.findAll();
    return res.status(200).json(categorias);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar categorias.', erro: error.message });
  }
};

const criarCategoria = async (req, res) => {
  try {
    const { nome, cor } = req.body;
    if (!nome) return res.status(400).json({ mensagem: 'O campo nome é obrigatório.' });

    const result = await CategoriaModel.create({ nome, cor });
    return res.status(201).json({ mensagem: 'Categoria criada.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Já existe uma categoria com esse nome.' });
    }
    return res.status(500).json({ mensagem: 'Erro ao criar categoria.', erro: error.message });
  }
};

const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await CategoriaModel.findById(id);
    if (!existe) return res.status(404).json({ mensagem: `Categoria ${id} não encontrada.` });

    await CategoriaModel.remove(id);
    return res.status(200).json({ mensagem: 'Categoria removida. Produtos vinculados ficaram sem categoria.' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao deletar categoria.', erro: error.message });
  }
};

module.exports = { listarCategorias, criarCategoria, deletarCategoria };