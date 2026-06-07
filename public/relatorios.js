/**
 * 📄 public/relatorios.js — Página de Relatórios com Chart.js
 */
let graficos = {};
let limiteAlerta = 10;

document.addEventListener('DOMContentLoaded', carregarRelatorios);

async function carregarRelatorios() {
  try {
    const [resProdutos, resCategorias, resConfig] = await Promise.all([
      fetch('/produtos'),
      fetch('/categorias'),
      fetch('/configuracoes'),
    ]);
    const produtos    = await resProdutos.json();
    const categorias  = await resCategorias.json();
    const configData  = await resConfig.json();
    limiteAlerta      = parseInt(configData.config?.alerta_estoque_baixo || 10);

    atualizarMetricas(produtos, categorias);
    renderizarGraficoQuantidade(produtos, categorias);
    renderizarGraficoValor(produtos, categorias);
    renderizarGraficoTop(produtos);
    renderizarTabelaCriticos(produtos);
  } catch (err) {
    mostrarToast('Erro ao carregar relatórios.', 'error');
  }
}

function atualizarMetricas(produtos, categorias) {
  const valor   = produtos.reduce((a, p) => a + p.preco * p.quantidade, 0);
  const critico = produtos.filter(p => p.quantidade <= limiteAlerta).length;
  document.getElementById('r-total').textContent     = produtos.length;
  document.getElementById('r-valor').textContent     = formatarMoeda(valor);
  document.getElementById('r-categorias').textContent = categorias.length;
  document.getElementById('r-critico').textContent   = critico;
}

// ── Paleta de cores âmbar/industrial ─────────────────────────
const CORES = [
  '#e8a020','#2ea86e','#378add','#d4537e',
  '#8b6fd4','#e05252','#3ac4c4','#d4a017',
];

function destruirGrafico(id) {
  if (graficos[id]) { graficos[id].destroy(); delete graficos[id]; }
}

function agruparPorCategoria(produtos, categorias) {
  const mapa = {};
  categorias.forEach(c => { mapa[c.id] = { nome: c.nome, cor: c.cor, quantidade: 0, valor: 0 }; });
  mapa['null'] = { nome: 'Sem categoria', cor: '#4a4a52', quantidade: 0, valor: 0 };

  produtos.forEach(p => {
    const chave = p.categoria_id ? p.categoria_id : 'null';
    if (!mapa[chave]) return;
    mapa[chave].quantidade += p.quantidade;
    mapa[chave].valor      += p.preco * p.quantidade;
  });

  return Object.values(mapa).filter(g => g.quantidade > 0);
}

function renderizarGraficoQuantidade(produtos, categorias) {
  destruirGrafico('quantidade');
  const grupos = agruparPorCategoria(produtos, categorias);
  const ctx    = document.getElementById('grafico-quantidade').getContext('2d');

  graficos['quantidade'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels:   grupos.map(g => g.nome),
      datasets: [{ data: grupos.map(g => g.quantidade), backgroundColor: grupos.map(g => g.cor), borderColor: '#13161b', borderWidth: 3, hoverOffset: 8 }],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8a8a8f', font: { family: 'Outfit', size: 12 }, padding: 16, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('pt-BR')} un.` } },
      },
    },
  });
}

function renderizarGraficoValor(produtos, categorias) {
  destruirGrafico('valor');
  const grupos = agruparPorCategoria(produtos, categorias);
  const ctx    = document.getElementById('grafico-valor').getContext('2d');

  graficos['valor'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels:   grupos.map(g => g.nome),
      datasets: [{ data: grupos.map(g => parseFloat(g.valor.toFixed(2))), backgroundColor: grupos.map(g => g.cor + 'cc'), borderColor: '#13161b', borderWidth: 3, hoverOffset: 8 }],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8a8a8f', font: { family: 'Outfit', size: 12 }, padding: 16, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}` } },
      },
    },
  });
}

function renderizarGraficoTop(produtos) {
  destruirGrafico('top');
  const top = [...produtos]
    .map(p => ({ nome: p.nome, valor: p.preco * p.quantidade }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  const ctx = document.getElementById('grafico-top').getContext('2d');
  graficos['top'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels:   top.map(p => p.nome.length > 20 ? p.nome.slice(0, 20) + '…' : p.nome),
      datasets: [{
        label: 'Valor em Estoque',
        data:  top.map(p => parseFloat(p.valor.toFixed(2))),
        backgroundColor: top.map((_, i) => CORES[i % CORES.length] + 'bb'),
        borderColor:     top.map((_, i) => CORES[i % CORES.length]),
        borderWidth: 1, borderRadius: 6, borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${Number(ctx.raw).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}` } },
      },
      scales: {
        x: { ticks: { color: '#8a8a8f', font: { family: 'DM Mono', size: 11 }, callback: v => 'R$ ' + Number(v).toLocaleString('pt-BR') }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'rgba(255,255,255,0.08)' } },
        y: { ticks: { color: '#edeae3', font: { family: 'Outfit', size: 13 } }, grid: { display: false }, border: { color: 'rgba(255,255,255,0.08)' } },
      },
    },
  });
}

function renderizarTabelaCriticos(produtos) {
  const criticos = produtos
    .filter(p => p.quantidade <= limiteAlerta)
    .sort((a, b) => a.quantidade - b.quantidade);

  const tbody = document.getElementById('tabela-criticos');
  if (criticos.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">✅ Nenhum produto em estado crítico</td></tr>`;
    return;
  }

  tbody.innerHTML = criticos.map(p => {
    const { classe, label } = getStatusBadge(p.quantidade, limiteAlerta);
    const catBadge = p.categoria_nome
      ? `<span class="cat-badge" style="background:${p.categoria_cor}22;color:${p.categoria_cor};border-color:${p.categoria_cor}44">${escapeHtml(p.categoria_nome)}</span>`
      : '<span style="color:var(--text-muted);font-size:12px">—</span>';
    return `<tr>
      <td><span class="cell-id">#${String(p.id).padStart(3,'0')}</span></td>
      <td><span class="cell-nome">${escapeHtml(p.nome)}</span></td>
      <td>${catBadge}</td>
      <td><span class="cell-valor">${Number(p.quantidade).toLocaleString('pt-BR')}</span></td>
      <td><span class="cell-valor">${formatarMoeda(p.preco)}</span></td>
      <td><span class="badge ${classe}">${label}</span></td>
    </tr>`;
  }).join('');
}