/**
 * 📄 public/configuracoes.js — Página de Configurações
 */
document.addEventListener('DOMContentLoaded', carregarConfiguracoes);

async function carregarConfiguracoes() {
  try {
    const res  = await fetch('/configuracoes');
    const data = await res.json();

    // Preenche dados do usuário
    if (data.usuario) {
      document.getElementById('user-nome').value  = data.usuario.nome  || '';
      document.getElementById('user-cargo').value = data.usuario.cargo || '';
      document.getElementById('user-email').value = data.usuario.email || '';
    }

    // Preenche configurações
    if (data.config) {
      document.getElementById('alerta-limite').value = data.config.alerta_estoque_baixo || 10;
      const tema = data.config.tema || 'dark';
      document.querySelector(`input[name="tema"][value="${tema}"]`).checked = true;
    }
  } catch {
    mostrarToast('Erro ao carregar configurações.', 'error');
  }
}

async function salvarConfiguracoes() {
  const nome   = document.getElementById('user-nome').value.trim();
  const cargo  = document.getElementById('user-cargo').value.trim();
  const email  = document.getElementById('user-email').value.trim();
  const limite = document.getElementById('alerta-limite').value;
  const tema   = document.querySelector('input[name="tema"]:checked')?.value || 'dark';

  if (!nome) { mostrarToast('O nome do usuário é obrigatório.', 'error'); return; }

  const body = {
    usuario: { nome, cargo, email },
    config:  { alerta_estoque_baixo: limite, tema },
  };

  try {
    const res  = await fetch('/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      mostrarToast('Configurações salvas!', 'success');
      // Atualiza o avatar e nome na sidebar
      const av = document.getElementById('sidebar-avatar');
      const nm = document.getElementById('sidebar-user-name');
      const cr = document.getElementById('sidebar-user-role');
      if (av) av.textContent = nome.slice(0, 2).toUpperCase();
      if (nm) nm.textContent = nome;
      if (cr) cr.textContent = cargo;
    } else {
      mostrarToast(data.mensagem || 'Erro ao salvar.', 'error');
    }
  } catch {
    mostrarToast('Erro ao conectar com a API.', 'error');
  }
}