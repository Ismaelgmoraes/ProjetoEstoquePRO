/**
 * 📄 src/controllers/produtoController.js
 * Gerencia req/res. Suporta filtros avançados e importação CSV.
 */
const ProdutoModel = require('../models/produtoModel');

const listarProdutos = async (req, res) => {
  try {
    // Filtros via query string: /produtos?categoria_id=1&preco_min=5&preco_max=50
    const { categoria_id, preco_min, preco_max, qtd_min, qtd_max } = req.query;
    const filtros = {};
    if (categoria_id) filtros.categoria_id = Number(categoria_id);
    if (preco_min !== undefined) filtros.preco_min = Number(preco_min);
    if (preco_max !== undefined) filtros.preco_max = Number(preco_max);
    if (qtd_min   !== undefined) filtros.qtd_min   = Number(qtd_min);
    if (qtd_max   !== undefined) filtros.qtd_max   = Number(qtd_max);

    const produtos = await ProdutoModel.findAll(filtros);
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar produtos.', erro: error.message });
  }
};

const buscarProdutoPorId = async (req, res) => {
  try {
    const produto = await ProdutoModel.findById(req.params.id);
    if (!produto) return res.status(404).json({ mensagem: `Produto ${req.params.id} não encontrado.` });
    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar produto.', erro: error.message });
  }
};

const criarProdutos = async (req, res) => {
  try {
    const produtos = Array.isArray(req.body) ? req.body : [req.body];
    if (produtos.length === 0) return res.status(400).json({ mensagem: 'Nenhum produto enviado.' });

    for (const p of produtos) {
      if (!p.nome || p.preco === undefined || p.quantidade === undefined) {
        return res.status(400).json({ mensagem: 'Cada produto deve ter: nome, preco e quantidade.' });
      }
    }

    const result = await ProdutoModel.createMany(produtos);
    return res.status(201).json({
      mensagem: `${result.affectedRows} produto(s) inserido(s) com sucesso.`,
      totalInseridos: result.affectedRows,
      primeiroIdInserido: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao criar produto(s).', erro: error.message });
  }
};

const importarCSV = async (req, res) => {
  try {
    // O multer já processou e disponibilizou o arquivo em req.file
    if (!req.file) return res.status(400).json({ mensagem: 'Nenhum arquivo CSV enviado.' });

    const conteudo = req.file.buffer.toString('utf-8');
    const linhas   = conteudo.split('\n').map(l => l.trim()).filter(Boolean);

    // Ignora o cabeçalho (primeira linha)
    const [cabecalho, ...dados] = linhas;

    if (dados.length === 0) return res.status(400).json({ mensagem: 'O CSV não contém dados.' });

    const produtos = [];
    const erros    = [];

    dados.forEach((linha, idx) => {
      // Suporta vírgula e ponto-e-vírgula como separador
      const cols = linha.split(/[;,]/).map(c => c.trim().replace(/^"|"$/g, ''));
      const [nome, preco, quantidade, categoria_id] = cols;

      if (!nome || isNaN(parseFloat(preco)) || isNaN(parseInt(quantidade))) {
        erros.push(`Linha ${idx + 2}: dados inválidos — "${linha}"`);
        return;
      }

      produtos.push({
        nome,
        preco:       parseFloat(preco),
        quantidade:  parseInt(quantidade),
        categoria_id: categoria_id ? parseInt(categoria_id) : null,
      });
    });

    if (produtos.length === 0) {
      return res.status(400).json({ mensagem: 'Nenhum produto válido encontrado no CSV.', erros });
    }

    const result = await ProdutoModel.createMany(produtos);
    return res.status(201).json({
      mensagem:       `${result.affectedRows} produto(s) importado(s).`,
      totalImportados: result.affectedRows,
      erros,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao importar CSV.', erro: error.message });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, quantidade, categoria_id } = req.body;

    if (!nome && preco === undefined && quantidade === undefined && categoria_id === undefined) {
      return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
    }

    const existe = await ProdutoModel.findById(id);
    if (!existe) return res.status(404).json({ mensagem: `Produto ${id} não encontrado.` });

    await ProdutoModel.update(id, { nome, preco, quantidade, categoria_id });
    return res.status(200).json({ mensagem: `Produto ${id} atualizado com sucesso.` });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar produto.', erro: error.message });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await ProdutoModel.findById(id);
    if (!existe) return res.status(404).json({ mensagem: `Produto ${id} não encontrado.` });

    await ProdutoModel.remove(id);
    return res.status(200).json({ mensagem: `Produto ${id} deletado com sucesso.` });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao deletar produto.', erro: error.message });
  }
};

module.exports = { listarProdutos, buscarProdutoPorId, criarProdutos, importarCSV, atualizarProduto, deletarProduto };