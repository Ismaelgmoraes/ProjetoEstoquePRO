/**
 * 📄 src/controllers/configuracaoController.js
 * Gerencia configurações e dados do usuário.
 */
const ConfigModel  = require('../models/configuracaoModel');
const UsuarioModel = require('../models/usuarioModel');

const getConfiguracoes = async (req, res) => {
  try {
    const config  = await ConfigModel.findAll();
    const usuario = await UsuarioModel.findOne();
    return res.status(200).json({ config, usuario });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar configurações.', erro: error.message });
  }
};

const salvarConfiguracoes = async (req, res) => {
  try {
    const { config, usuario } = req.body;

    // Salva cada chave/valor de configuração
    if (config) {
      for (const [chave, valor] of Object.entries(config)) {
        await ConfigModel.upsert(chave, String(valor));
      }
    }

    // Atualiza dados do usuário
    if (usuario) {
      const { nome, cargo, email } = usuario;
      if (!nome) return res.status(400).json({ mensagem: 'Nome do usuário é obrigatório.' });
      await UsuarioModel.update({ nome, cargo: cargo || 'Administrador', email: email || '' });
    }

    return res.status(200).json({ mensagem: 'Configurações salvas com sucesso.' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao salvar configurações.', erro: error.message });
  }
};

module.exports = { getConfiguracoes, salvarConfiguracoes };