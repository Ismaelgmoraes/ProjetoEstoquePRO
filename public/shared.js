/**
 * 📄 public/shared.js
 * Funções e componentes compartilhados entre todas as páginas.
 */

// ── Sidebar ativa o link da página atual ─────────────────────
document.querySelectorAll('.nav-item').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
  else link.classList.remove('active');
});

// ── Toast notification ────────────────────────────────────────
let _toastTimer;
function mostrarToast(msg, tipo = 'info') {
  const toast = document.getElementById('toast');
  const icones = { success: '✓', error: '✕', info: '·' };
  toast.textContent = `${icones[tipo] || '·'}  ${msg}`;
  toast.className = `toast ${tipo} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ── Formatar moeda ────────────────────────────────────────────
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Escape HTML (previne XSS) ─────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// ── Status badge de estoque ───────────────────────────────────
function getStatusBadge(quantidade, limite = 10) {
  if (quantidade === 0)        return { classe: 'badge-empty', label: 'Sem estoque' };
  if (quantidade <= limite)    return { classe: 'badge-low',   label: 'Estoque baixo' };
  return                              { classe: 'badge-ok',    label: 'Em estoque' };
}

// ── Carregar dados do usuário na sidebar ──────────────────────
async function carregarUsuarioSidebar() {
  try {
    const res  = await fetch('/configuracoes');
    const data = await res.json();
    if (data.usuario) {
      const el = document.getElementById('sidebar-user-name');
      const er = document.getElementById('sidebar-user-role');
      const av = document.getElementById('sidebar-avatar');
      if (el) el.textContent = data.usuario.nome;
      if (er) er.textContent = data.usuario.cargo;
      if (av) av.textContent = data.usuario.nome.slice(0, 2).toUpperCase();
    }
  } catch { /* silencioso */ }
}

document.addEventListener('DOMContentLoaded', carregarUsuarioSidebar);