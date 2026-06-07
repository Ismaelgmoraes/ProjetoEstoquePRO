/**
 * 📄 public/produtos.js — Página de Produtos
 */
let categorias   = [];
let limiteAlerta = 10;

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([carregarCategorias(), carregarConfiguracoes()]);
  await aplicarFiltros();
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

    const sel = document.getElementById('filtro-categoria');
    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nome;
      sel.appendChild(opt);
    });
    renderizarChips();
  } catch { mostrarToast('Erro ao carregar categorias.', 'error'); }
}

function renderizarChips() {
  const container = document.getElementById('categorias-chips');
  if (categorias.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <span style="font-size:12px;color:var(--text-muted);margin-right:4px">Categorias:</span>
    ${categorias.map(c => `
      <span class="cat-chip" style="background:${c.cor}22;color:${c.cor};border-color:${c.cor}44">
        ${escapeHtml(c.nome)}
        <button onclick="deletarCategoria(${c.id},'${escapeHtml(c.nome)}')" title="Remover categoria" style="background:none;border:none;cursor:pointer;color:${c.cor};padding:0;margin-left:4px;font-size:14px;line-height:1">×</button>
      </span>
    `).join('')}
  `;
}

async function aplicarFiltros() {
  const params = new URLSearchParams();
  const cat    = document.getElementById('filtro-categoria').value;
  const pMin   = document.getElementById('filtro-preco-min').value;
  const pMax   = document.getElementById('filtro-preco-max').value;
  const qMin   = document.getElementById('filtro-qtd-min').value;
  const qMax   = document.getElementById('filtro-qtd-max').value;

  if (cat)  params.append('categoria_id', cat);
  if (pMin) params.append('preco_min', pMin);
  if (pMax) params.append('preco_max', pMax);
  if (qMin) params.append('qtd_min', qMin);
  if (qMax) params.append('qtd_max', qMax);

  mostrarLoading();
  try {
    const res     = await fetch(`/produtos?${params}`);
    const produtos = await res.json();
    renderizarTabela(produtos);
    document.getElementById('table-count').textContent = `${produtos.length} produto(s) encontrado(s)`;
  } catch {
    mostrarToast('Erro ao buscar produtos.', 'error');
    mostrarVazio('Erro ao carregar.');
  }
}

function limparFiltros() {
  ['filtro-categoria','filtro-preco-min','filtro-preco-max','filtro-qtd-min','filtro-qtd-max']
    .forEach(id => { document.getElementById(id).value = ''; });
  aplicarFiltros();
}

function renderizarTabela(produtos) {
  const tbody = document.getElementById('tabela-body');
  if (produtos.length === 0) { mostrarVazio('Nenhum produto encontrado para esses filtros.'); return; }

  tbody.innerHTML = produtos.map(p => {
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
      <td><span class="cell-valor total">${formatarMoeda(p.preco * p.quantidade)}</span></td>
      <td><span class="badge ${classe}">${label}</span></td>
      <td><div class="action-btns">
        <button class="btn-icon delete" onclick="confirmarDelete(${p.id})" title="Excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div></td>
    </tr>`;
  }).join('');
}

// ── Importação CSV ────────────────────────────────────────────
async function importarCSV(input) {
  const arquivo = input.files[0];
  if (!arquivo) return;

  const formData = new FormData();
  formData.append('arquivo', arquivo);

  mostrarToast('Importando...', 'info');
  try {
    const res  = await fetch('/produtos/importar', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      mostrarToast(`${data.totalImportados} produto(s) importado(s)!`, 'success');
      if (data.erros?.length) console.warn('Linhas com erro:', data.erros);
      aplicarFiltros();
    } else {
      mostrarToast(data.mensagem || 'Erro na importação.', 'error');
    }
  } catch { mostrarToast('Erro ao enviar o arquivo.', 'error'); }
  input.value = '';
}

function baixarModeloCSV() {
  const conteudo = 'nome,preco,quantidade,categoria_id\nParafuso M10,0.80,2000,1\nChave Philips,9.90,50,2';
  const blob     = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href = url; a.download = 'modelo_importacao.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── Categorias ────────────────────────────────────────────────
function abrirModalCategoria() {
  document.getElementById('cat-nome').value = '';
  document.getElementById('cat-cor').value  = '#e8a020';
  document.getElementById('modal-categoria').classList.add('open');
  setTimeout(() => document.getElementById('cat-nome').focus(), 100);
}
function fecharModalCategoria() { document.getElementById('modal-categoria').classList.remove('open'); }

async function salvarCategoria() {
  const nome = document.getElementById('cat-nome').value.trim();
  const cor  = document.getElementById('cat-cor').value;
  if (!nome) { mostrarToast('Informe o nome da categoria.', 'error'); return; }

  try {
    const res  = await fetch('/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cor }),
    });
    const data = await res.json();
    if (res.ok) {
      fecharModalCategoria();
      mostrarToast('Categoria criada!', 'success');
      await carregarCategorias();
    } else mostrarToast(data.mensagem || 'Erro.', 'error');
  } catch { mostrarToast('Erro ao conectar.', 'error'); }
}

async function deletarCategoria(id, nome) {
  if (!confirm(`Remover categoria "${nome}"? Os produtos vinculados ficam sem categoria.`)) return;
  try {
    const res = await fetch(`/categorias/${id}`, { method: 'DELETE' });
    if (res.ok) { mostrarToast('Categoria removida.', 'success'); await carregarCategorias(); aplicarFiltros(); }
    else mostrarToast('Erro ao remover.', 'error');
  } catch { mostrarToast('Erro ao conectar.', 'error'); }
}

function confirmarDelete(id) {
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('btn-confirmar-delete').onclick = async () => {
    fecharConfirm();
    try {
      const res = await fetch(`/produtos/${id}`, { method: 'DELETE' });
      if (res.ok) { mostrarToast('Produto excluído.', 'success'); aplicarFiltros(); }
      else mostrarToast('Erro ao excluir.', 'error');
    } catch { mostrarToast('Erro.', 'error'); }
  };
}
function fecharConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); }

function mostrarLoading() {
  document.getElementById('tabela-body').innerHTML = `<tr class="loading-row"><td colspan="8"><div class="loading-spinner"></div><span>Carregando...</span></td></tr>`;
}
function mostrarVazio(msg) {
  document.getElementById('tabela-body').innerHTML = `<tr class="empty-row"><td colspan="8">${msg}</td></tr>`;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { fecharModalCategoria(); fecharConfirm(); } });