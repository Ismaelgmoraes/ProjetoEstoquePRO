/**
 * 📄 public/script.js — Dashboard
 */
const API = '/produtos';
let produtosCache = [];
let categorias    = [];
let limiteAlerta  = 10;

document.addEventListener('DOMContentLoaded', async () => {
  await carregarCategorias();
  await carregarConfiguracoes();
  await carregarProdutos();
});

async function carregarConfiguracoes() {
  try {
    const res  = await fetch('/configuracoes');
    const data = await res.json();
    limiteAlerta = parseInt(data.config?.alerta_estoque_baixo || 10);
  } catch { limiteAlerta = 10; }
}

async function carregarCategorias() {
  try {
    const res = await fetch('/categorias');
    categorias = await res.json();
    const sel = document.getElementById('input-categoria');
    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nome;
      sel.appendChild(opt);
    });
  } catch { /* silencioso */ }
}

async function carregarProdutos() {
  mostrarLoading();
  try {
    const res = await fetch(API);
    produtosCache = await res.json();
    renderizarTabela(produtosCache);
    atualizarMetricas(produtosCache);
  } catch {
    mostrarToast('Erro ao conectar com a API.', 'error');
    mostrarVazio('Não foi possível carregar os produtos.');
  }
}

function renderizarTabela(produtos) {
  const tbody = document.getElementById('tabela-body');
  if (produtos.length === 0) { mostrarVazio('Nenhum produto encontrado.'); return; }

  tbody.innerHTML = produtos.map(p => {
    const valorTotal = (p.preco * p.quantidade).toFixed(2);
    const { classe, label } = getStatusBadge(p.quantidade, limiteAlerta);
    const catBadge = p.categoria_nome
      ? `<span class="cat-badge" style="background:${p.categoria_cor}22;color:${p.categoria_cor};border-color:${p.categoria_cor}44">${escapeHtml(p.categoria_nome)}</span>`
      : '<span style="color:var(--text-muted);font-size:12px">—</span>';

    return `<tr>
      <td><span class="cell-id">#${String(p.id).padStart(3,'0')}</span></td>
      <td><span class="cell-nome">${escapeHtml(p.nome)}</span></td>
      <td>${catBadge}</td>
      <td><span class="cell-valor">${formatarMoeda(p.preco)}</span></td>
      <td><span class="cell-valor">${Number(p.quantidade).toLocaleString('pt-BR')}</span></td>
      <td><span class="cell-valor total">${formatarMoeda(parseFloat(valorTotal))}</span></td>
      <td><span class="badge ${classe}">${label}</span></td>
      <td><div class="action-btns">
        <button class="btn-icon" onclick="abrirModal('editar',${p.id})" title="Editar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon delete" onclick="confirmarDelete(${p.id})" title="Excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div></td>
    </tr>`;
  }).join('');
}

function atualizarMetricas(produtos) {
  const total = produtos.length;
  const valor = produtos.reduce((a, p) => a + p.preco * p.quantidade, 0);
  const medio = total > 0 ? produtos.reduce((a, p) => a + p.preco, 0) / total : 0;
  const falta = produtos.filter(p => p.quantidade === 0).length;
  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-valor').textContent = formatarMoeda(valor);
  document.getElementById('metric-medio').textContent = formatarMoeda(medio);
  document.getElementById('metric-falta').textContent = falta;
}

function filtrarTabela() {
  const termo = document.getElementById('busca').value.toLowerCase().trim();
  renderizarTabela(produtosCache.filter(p =>
    p.nome.toLowerCase().includes(termo) || String(p.id).includes(termo)
  ));
}

async function abrirModal(modo, id = null) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('edit-id').value = '';
  document.getElementById('input-nome').value = '';
  document.getElementById('input-preco').value = '';
  document.getElementById('input-quantidade').value = '';
  document.getElementById('input-categoria').value = '';
  document.getElementById('modal-title').textContent = modo === 'criar' ? 'Novo Produto' : 'Editar Produto';
  document.getElementById('btn-salvar').textContent  = modo === 'criar' ? 'Salvar' : 'Atualizar';

  if (modo === 'editar' && id) {
    try {
      const res = await fetch(`${API}/${id}`);
      const p   = await res.json();
      document.getElementById('edit-id').value          = p.id;
      document.getElementById('input-nome').value       = p.nome;
      document.getElementById('input-preco').value      = p.preco;
      document.getElementById('input-quantidade').value = p.quantidade;
      document.getElementById('input-categoria').value  = p.categoria_id || '';
    } catch { mostrarToast('Erro ao carregar produto.', 'error'); return; }
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('input-nome').focus(), 100);
}

function fecharModal() { document.getElementById('modal-overlay').classList.remove('open'); }

async function salvarProduto() {
  const id         = document.getElementById('edit-id').value;
  const nome       = document.getElementById('input-nome').value.trim();
  const preco      = parseFloat(document.getElementById('input-preco').value);
  const quantidade = parseInt(document.getElementById('input-quantidade').value);
  const categoria_id = document.getElementById('input-categoria').value || null;

  if (!nome)                      { mostrarToast('Informe o nome.', 'error'); return; }
  if (isNaN(preco) || preco < 0)  { mostrarToast('Preço inválido.', 'error'); return; }
  if (isNaN(quantidade) || quantidade < 0) { mostrarToast('Quantidade inválida.', 'error'); return; }

  const body = { nome, preco, quantidade, categoria_id: categoria_id ? parseInt(categoria_id) : null };

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) { fecharModal(); mostrarToast(id ? 'Produto atualizado!' : 'Produto criado!', 'success'); carregarProdutos(); }
    else mostrarToast(data.mensagem || 'Erro ao salvar.', 'error');
  } catch { mostrarToast('Erro ao conectar com a API.', 'error'); }
}

function confirmarDelete(id) {
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('btn-confirmar-delete').onclick = () => deletarProduto(id);
}
function fecharConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); }

async function deletarProduto(id) {
  fecharConfirm();
  try {
    const res  = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { mostrarToast('Produto excluído.', 'success'); carregarProdutos(); }
    else mostrarToast(data.mensagem || 'Erro.', 'error');
  } catch { mostrarToast('Erro ao conectar com a API.', 'error'); }
}

function mostrarLoading() {
  document.getElementById('tabela-body').innerHTML = `<tr class="loading-row"><td colspan="8"><div class="loading-spinner"></div><span>Carregando...</span></td></tr>`;
}
function mostrarVazio(msg) {
  document.getElementById('tabela-body').innerHTML = `<tr class="empty-row"><td colspan="8">${msg}</td></tr>`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fecharModal(); fecharConfirm(); }
});