/**
 * ============================================================
 * 📄 public/script.js
 * Lógica do Front-End — se comunica com a API via fetch()
 * ============================================================
 *
 * Este arquivo é responsável por:
 *   1. Buscar dados da API (GET /produtos)
 *   2. Renderizar a tabela e os cards de métricas
 *   3. Abrir o modal de criação/edição
 *   4. Enviar dados para a API (POST, PUT, DELETE)
 *   5. Mostrar feedback visual (toast notifications)
 * ============================================================
 */

// URL base da API — como o front é servido pelo mesmo servidor,
// usamos apenas o caminho relativo.
const API = '/produtos';

// Cache local dos produtos para filtro sem nova requisição
let produtosCache = [];

// ── Inicialização ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});

// ── Carregar todos os produtos ───────────────────────────────
async function carregarProdutos() {
  mostrarLoading();
  try {
    const res = await fetch(API);
    const dados = await res.json();
    produtosCache = dados;
    renderizarTabela(dados);
    atualizarMetricas(dados);
  } catch (err) {
    mostrarToast('Erro ao conectar com a API.', 'error');
    mostrarVazio('Não foi possível carregar os produtos.');
  }
}

// ── Renderizar tabela ────────────────────────────────────────
function renderizarTabela(produtos) {
  const tbody = document.getElementById('tabela-body');

  if (produtos.length === 0) {
    mostrarVazio('Nenhum produto encontrado.');
    return;
  }

  tbody.innerHTML = produtos.map(p => {
    const valorTotal = (p.preco * p.quantidade).toFixed(2);
    const { classe, label } = getStatus(p.quantidade);

    return `
      <tr>
        <td><span class="cell-id">#${String(p.id).padStart(3, '0')}</span></td>
        <td><span class="cell-nome">${escapeHtml(p.nome)}</span></td>
        <td><span class="cell-valor">${formatarMoeda(p.preco)}</span></td>
        <td><span class="cell-valor">${Number(p.quantidade).toLocaleString('pt-BR')}</span></td>
        <td><span class="cell-valor total">${formatarMoeda(parseFloat(valorTotal))}</span></td>
        <td><span class="badge ${classe}">${label}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" onclick="abrirModal('editar', ${p.id})" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon delete" onclick="confirmarDelete(${p.id})" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Atualizar cards de métricas ──────────────────────────────
function atualizarMetricas(produtos) {
  const total  = produtos.length;
  const valor  = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
  const medio  = total > 0 ? produtos.reduce((acc, p) => acc + p.preco, 0) / total : 0;
  const falta  = produtos.filter(p => p.quantidade === 0).length;

  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-valor').textContent = formatarMoeda(valor);
  document.getElementById('metric-medio').textContent = formatarMoeda(medio);
  document.getElementById('metric-falta').textContent = falta;
}

// ── Filtrar tabela localmente ────────────────────────────────
function filtrarTabela() {
  const termo = document.getElementById('busca').value.toLowerCase().trim();
  const filtrados = produtosCache.filter(p =>
    p.nome.toLowerCase().includes(termo) ||
    String(p.id).includes(termo)
  );
  renderizarTabela(filtrados);
}

// ── Modal: Abrir ─────────────────────────────────────────────
async function abrirModal(modo, id = null) {
  const overlay   = document.getElementById('modal-overlay');
  const titulo    = document.getElementById('modal-title');
  const btnSalvar = document.getElementById('btn-salvar');

  // Limpa os campos
  document.getElementById('edit-id').value = '';
  document.getElementById('input-nome').value = '';
  document.getElementById('input-preco').value = '';
  document.getElementById('input-quantidade').value = '';

  if (modo === 'criar') {
    titulo.textContent = 'Novo Produto';
    btnSalvar.textContent = 'Salvar Produto';
  } else {
    titulo.textContent = 'Editar Produto';
    btnSalvar.textContent = 'Atualizar Produto';

    // Busca o produto na API para preencher o form
    try {
      const res = await fetch(`${API}/${id}`);
      const produto = await res.json();

      document.getElementById('edit-id').value        = produto.id;
      document.getElementById('input-nome').value     = produto.nome;
      document.getElementById('input-preco').value    = produto.preco;
      document.getElementById('input-quantidade').value = produto.quantidade;
    } catch {
      mostrarToast('Erro ao carregar produto.', 'error');
      return;
    }
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('input-nome').focus(), 100);
}

// ── Modal: Fechar ────────────────────────────────────────────
function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ── Salvar (criar ou atualizar) ──────────────────────────────
async function salvarProduto() {
  const id         = document.getElementById('edit-id').value;
  const nome       = document.getElementById('input-nome').value.trim();
  const preco      = parseFloat(document.getElementById('input-preco').value);
  const quantidade = parseInt(document.getElementById('input-quantidade').value);

  // Validação no front antes de chamar a API
  if (!nome) {
    mostrarToast('Informe o nome do produto.', 'error');
    return;
  }
  if (isNaN(preco) || preco < 0) {
    mostrarToast('Informe um preço válido.', 'error');
    return;
  }
  if (isNaN(quantidade) || quantidade < 0) {
    mostrarToast('Informe uma quantidade válida.', 'error');
    return;
  }

  const body = { nome, preco, quantidade };

  try {
    let res;

    if (!id) {
      // POST — criar novo produto
      res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      // PUT — atualizar produto existente
      res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const dados = await res.json();

    if (res.ok) {
      fecharModal();
      mostrarToast(id ? 'Produto atualizado!' : 'Produto criado!', 'success');
      carregarProdutos(); // Recarrega a tabela com os dados atualizados
    } else {
      mostrarToast(dados.mensagem || 'Erro ao salvar.', 'error');
    }
  } catch {
    mostrarToast('Erro ao conectar com a API.', 'error');
  }
}

// ── Delete: Confirmar ────────────────────────────────────────
function confirmarDelete(id) {
  const overlay = document.getElementById('confirm-overlay');
  overlay.classList.add('open');

  // Atribui a ação ao botão de confirmar
  document.getElementById('btn-confirmar-delete').onclick = () => deletarProduto(id);
}

function fecharConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
}

// ── Deletar produto ──────────────────────────────────────────
async function deletarProduto(id) {
  fecharConfirm();
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const dados = await res.json();

    if (res.ok) {
      mostrarToast('Produto excluído.', 'success');
      carregarProdutos();
    } else {
      mostrarToast(dados.mensagem || 'Erro ao excluir.', 'error');
    }
  } catch {
    mostrarToast('Erro ao conectar com a API.', 'error');
  }
}

// ── Helpers: UI ──────────────────────────────────────────────
function mostrarLoading() {
  document.getElementById('tabela-body').innerHTML = `
    <tr class="loading-row">
      <td colspan="7">
        <div class="loading-spinner"></div>
        <span>Carregando produtos...</span>
      </td>
    </tr>
  `;
}

function mostrarVazio(msg) {
  document.getElementById('tabela-body').innerHTML = `
    <tr class="empty-row">
      <td colspan="7">${msg}</td>
    </tr>
  `;
}

let toastTimer;
function mostrarToast(msg, tipo = 'info') {
  const toast = document.getElementById('toast');
  const icones = { success: '✓', error: '✕', info: '·' };
  toast.textContent = `${icones[tipo]}  ${msg}`;
  toast.className = `toast ${tipo} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ── Helpers: Formatação ──────────────────────────────────────
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getStatus(quantidade) {
  if (quantidade === 0)  return { classe: 'badge-empty', label: 'Sem estoque' };
  if (quantidade <= 10)  return { classe: 'badge-low',   label: 'Estoque baixo' };
  return                        { classe: 'badge-ok',    label: 'Em estoque' };
}

// Previne XSS ao inserir texto do usuário no HTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Fecha modal ao pressionar Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    fecharModal();
    fecharConfirm();
  }
});