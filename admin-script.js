let veiculosDoBanco = [];
let leadsDoBanco = []; 

// ── Utilitários de Formatação ─────────────────────────
const formatarPreco = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
const formatarKm = v => Number(v).toLocaleString('pt-BR') + ' km';

// ── Guard de autenticação ──────────────────────────────
const sessao = JSON.parse(localStorage.getItem('ae_sessao') || 'null');
if (!sessao || sessao.role !== 'admin') window.location.href = 'login.html';

// ── Preenche usuário na sidebar ───────────────────────
document.getElementById('userAvatar').textContent = sessao.avatar || 'AD';
document.getElementById('userName').textContent   = sessao.nome || 'Admin';

// ── Atualiza badge de leads ────────────────────────────
function atualizarBadge() {
  const n = leadsDoBanco.filter(l => l.status === 'novo').length;
  const el = document.getElementById('badgeLeads');
  if (el) {
    el.textContent = n;
    el.style.display = n ? 'inline-block' : 'none';
  }
}

// ── Navegação ─────────────────────────────────────────
const TITULOS = {
  dashboard: ['Dashboard', 'Visão geral do sistema'],
  veiculos:  ['Veículos', 'Gerencie o estoque completo'],
  leads:     ['Leads', 'Contatos e oportunidades'],
};

function irPara(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('ativa'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('ativo'));
  
  const pageEl = document.getElementById('page-' + pagina);
  const navEl = document.getElementById('nav-' + pagina);
  
  if(pageEl) pageEl.classList.add('ativa');
  if(navEl) navEl.classList.add('ativo');
  
  const [t, s] = TITULOS[pagina];
  document.getElementById('topbarTitulo').textContent = t;
  document.getElementById('topbarSub').textContent    = s;

  if (pagina === 'dashboard') renderDashboard();
  if (pagina === 'veiculos')  renderTabelaVeiculos();
  if (pagina === 'leads')     renderTabelaLeads();
}

function fazerLogout() {
  localStorage.removeItem('ae_sessao');
  window.location.href = 'login.html';
}

// ── Toast ─────────────────────────────────────────────
function toast(msg, tipo = '') {
  const el = document.getElementById('toast');
  el.textContent = msg; 
  el.className = 'toast ' + tipo;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

// ── Dashboard ─────────────────────────────────────────
function renderDashboard() {
  const ativos = veiculosDoBanco.filter(v => v.status !== 'vendido');
  const vendidos = veiculosDoBanco.filter(v => v.status === 'vendido');
  const totalEstoque = ativos.length + vendidos.length;
  const valorTotal = ativos.reduce((soma, v) => soma + Number(v.preco), 0);
  const totalViews = veiculosDoBanco.reduce((soma, v) => soma + (Number(v.views) || 0), 0);
  const leadsNovos = leadsDoBanco.filter(l => l.status === 'novo');

  atualizarBadge();

  const kpiGrid = document.getElementById('kpiGrid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-ico">🚗</div>
        <div class="kpi-val">${totalEstoque}</div>
        <div class="kpi-lbl">Total em estoque</div>
        <div class="kpi-sub kpi-pos">▲ ${ativos.length} disponíveis</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-ico">💰</div>
        <div class="kpi-val">${formatarPreco(valorTotal)}</div>
        <div class="kpi-lbl">Valor total do estoque</div>
        <div class="kpi-sub">${vendidos.length} vendidos</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-ico">👁</div>
        <div class="kpi-val">${totalViews}</div>
        <div class="kpi-lbl">Total de visualizações</div>
        <div class="kpi-sub kpi-pos">▲ No período</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-ico">📋</div>
        <div class="kpi-val">${leadsDoBanco.length}</div>
        <div class="kpi-lbl">Leads cadastrados</div>
        <div class="kpi-sub ${leadsNovos.length > 0 ? 'kpi-neg' : ''}">● ${leadsNovos.length} novos</div>
      </div>
    `;
  }

  const chartCombust = document.getElementById('chartCombust');
  if (chartCombust) {
    const contagemCombustivel = ativos.reduce((acc, v) => {
      acc[v.combustivel] = (acc[v.combustivel] || 0) + 1;
      return acc;
    }, {});
    
    chartCombust.innerHTML = Object.entries(contagemCombustivel).map(([nome, qtd]) => {
      const porcentagem = (qtd / ativos.length) * 100;
      return `
        <div class="bar-item">
          <div class="bar-label"><span>${nome}</span><span>${qtd}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width: ${porcentagem}%; background: #c5a86d;"></div></div>
        </div>`;
    }).join('');
  }

  const chartTipo = document.getElementById('chartTipo');
  if (chartTipo) {
    const contagemTipo = ativos.reduce((acc, v) => {
      acc[v.tipo] = (acc[v.tipo] || 0) + 1;
      return acc;
    }, {});
    
    chartTipo.innerHTML = Object.entries(contagemTipo).map(([nome, qtd]) => `
      <div class="type-item">
        <span class="dot"></span> ${nome}
        <span class="type-val">${qtd}</span>
      </div>`).join('');
  }
}

function carregarDadosAdmin() {
  Promise.all([
    fetch('api_carros.php').then(res => res.json()),
    fetch('api_leads.php').then(res => res.json())
  ])
  .then(([carros, leads]) => {
    veiculosDoBanco = carros;
    leadsDoBanco = leads;
    
    // Identifica qual página está ativa para renderizar os dados certos
    const paginaAtiva = document.querySelector('.page.ativa').id;
    if(paginaAtiva === 'page-dashboard') renderDashboard();
    if(paginaAtiva === 'page-veiculos') renderTabelaVeiculos();
    if(paginaAtiva === 'page-leads') renderTabelaLeads();
  })
  .catch(erro => console.error("Erro ao carregar os dados do painel:", erro));
}

// ── Tabela de veículos ────────────────────────────────
function renderTabelaVeiculos() {
  const busca  = (document.getElementById('buscaVeiculos')?.value || '').toLowerCase();
  const status = document.getElementById('filtroStatusV')?.value || '';
  let lista = veiculosDoBanco; 
  if (busca)  lista = lista.filter(v => `${v.nome} ${v.marca} ${v.tipo}`.toLowerCase().includes(busca));
  if (status) lista = lista.filter(v => v.status === status);

  const badge = s => ({ disponivel:'<span class="badge badge-disp">Disponível</span>', reservado:'<span class="badge badge-res">Reservado</span>', vendido:'<span class="badge badge-vend">Vendido</span>' }[s]||s);

  const tbody = document.getElementById('tbodyVeiculos');
  if (!tbody) return;

  tbody.innerHTML = lista.map(v => `
    <tr>
      <td><img class="td-img" src="${v.imagem}" alt="" loading="lazy"></td>
      <td>
        <div class="td-nome">${v.nome}</div>
        <div class="td-marca">${v.marca}</div>
      </td>
      <td>${v.ano}<br><small style="color:var(--cinza)">${formatarKm(v.km)}</small></td>
      <td><strong style="color:var(--ouro)">${formatarPreco(v.preco)}</strong></td>
      <td>${badge(v.status)} ${v.destaque ? '<span class="badge" style="background:rgba(201,168,76,.1);color:var(--ouro);border:1px solid var(--borda);margin-left:.3rem">⭐</span>' : ''}</td>
      <td style="color:var(--cinza)">👁 ${v.visualizacoes||0}</td>
      <td>
        <div class="td-acoes">
          <button class="btn btn-ghost btn-xs" onclick="editarVeiculo(${v.id})">✏ Editar</button>
          <button class="btn btn-danger btn-xs" onclick="excluirVeiculo(${v.id})">🗑</button>
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('emptyVeiculos').style.display = lista.length ? 'none' : 'block';
}

function excluirVeiculo(id) {
  if (!confirm('Tem certeza que deseja excluir este veículo? Essa ação não pode ser desfeita.')) return;

  // Envia o ID para o PHP deletar do banco
  fetch('api_excluir_carro.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      toast('🗑 ' + data.mensagem, 'sucesso');
      carregarDadosAdmin(); // Recarrega a tabela (o carro vai sumir na hora)
    } else {
      alert("❌ Erro: " + data.mensagem);
    }
  })
  .catch(erro => {
    console.error("Erro:", erro);
    alert("❌ Falha ao se conectar com o servidor para excluir.");
  });
}

// ── Tabela de leads ───────────────────────────────────
function renderTabelaLeads() {
  const busca  = (document.getElementById('buscaLeads')?.value || '').toLowerCase();
  const status = document.getElementById('filtroStatusL')?.value || '';
  let lista = leadsDoBanco;
  
  if (busca)  lista = lista.filter(l => `${l.nome} ${l.email}`.toLowerCase().includes(busca));
  if (status) lista = lista.filter(l => l.status === status);

  const tbody = document.getElementById('tbodyLeads');
  if (!tbody) return;

  tbody.innerHTML = lista.map(l => {
    const v = veiculosDoBanco.find(carro => carro.id == l.veiculo_id);
    return `<tr>
      <td><strong>${l.nome}</strong></td>
      <td><a href="tel:${l.telefone}" style="color:var(--ouro)">${l.telefone}</a><br><small style="color:var(--cinza)">${l.email}</small></td>
      <td>${v ? v.nome : '—'}</td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cinza)">${l.mensagem}</td>
      <td style="white-space:nowrap;color:var(--cinza)">${l.data_criacao}</td>
      <td>
        <select class="select-sm" style="font-size:.7rem;padding:.3rem .5rem" onchange="mudarStatusLead(${l.id}, this.value)">
          ${['novo','contato','negociando','concluido'].map(s => `<option value="${s}" ${l.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-xs" onclick="excluirLead(${l.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
  
  document.getElementById('emptyLeads').style.display = lista.length ? 'none' : 'block';
  atualizarBadge();
}

function mudarStatusLead(id, status) {
  // TODO: Criaremos o api_status_lead.php depois!
  toast('O PHP de atualizar status ainda será criado!');
}

function excluirLead(id) {
  if (!confirm('Excluir este lead?')) return;
  // TODO: Criaremos o api_excluir_lead.php depois!
  toast('O PHP de exclusão ainda será criado!', 'erro');
}

// ── Modal de veículo ──────────────────────────────────
function abrirModalVeiculo(id = null) {
  const isEdicao = id !== null;
  document.getElementById('modalTitulo').textContent = isEdicao ? '✏ Editar Veículo' : '+ Novo Veículo';
  document.getElementById('veiculoId').value = id || '';
  limparFormVeiculo();

  if (isEdicao) {
    const v = veiculosDoBanco.find(carro => carro.id == id);
    if (!v) return;
    
    document.getElementById('vMarca').value          = v.marca;
    document.getElementById('vNome').value           = v.nome;
    document.getElementById('vTipo').value           = v.tipo;
    document.getElementById('vAno').value            = v.ano;
    document.getElementById('vCor').value            = v.cor;
    document.getElementById('vCombustivel').value    = v.combustivel;
    document.getElementById('vCambio').value         = v.cambio;
    document.getElementById('vPotencia').value       = v.potencia;
    document.getElementById('vKm').value             = v.km;
    document.getElementById('vPreco').value          = v.preco;
    document.getElementById('vStatus').value         = v.status;
    document.getElementById('vDestaque').checked     = v.destaque;
    document.getElementById('vImagem').value         = v.imagem;
    document.getElementById('vDescricao').value      = v.descricao;
    
    // Reconstrói as características separadas por vírgula para o input
    document.getElementById('vCaracteristicas').value = v.caracteristicas ? v.caracteristicas.join(', ') : '';
    
    previewImagem();
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function editarVeiculo(id) { abrirModalVeiculo(id); }

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function limparFormVeiculo() {
  ['vMarca','vNome','vTipo','vAno','vCor','vCombustivel','vCambio','vPotencia','vKm','vPreco','vImagem','vDescricao','vCaracteristicas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('vStatus').value   = 'disponivel';
  document.getElementById('vDestaque').checked = false;
  document.getElementById('previewImg').classList.remove('show');
}

function previewImagem() {
  const url = document.getElementById('vImagem').value.trim();
  const img = document.getElementById('previewImg');
  if (url.startsWith('http')) { 
    img.src = url; 
    img.classList.add('show'); 
  } else { 
    img.classList.remove('show'); 
  }
}

function salvarVeiculo() {
  const id = document.getElementById('veiculoId').value;
  const marca = document.getElementById('vMarca').value;
  const nome = document.getElementById('vNome').value;
  const tipo = document.getElementById('vTipo').value;
  const ano = document.getElementById('vAno').value;
  const cor = document.getElementById('vCor').value;
  const combustivel = document.getElementById('vCombustivel').value;
  const cambio = document.getElementById('vCambio').value;
  const potencia = document.getElementById('vPotencia').value;
  const km = document.getElementById('vKm').value;
  const preco = document.getElementById('vPreco').value;
  const status = document.getElementById('vStatus').value;
  const destaque = document.getElementById('vDestaque').checked; 
  const imagem = document.getElementById('vImagem').value;
  const descricao = document.getElementById('vDescricao').value;
  const caracteristicas = document.getElementById('vCaracteristicas').value;

  if (!marca || !nome || !tipo || !ano || !combustivel || !cambio || km === '' || preco === '' || !imagem) {
    alert("⚠️ Por favor, preencha todos os campos obrigatórios (*).");
    return;
  }

  const carroParaSalvar = {
    id, marca, nome, tipo, ano, cor, combustivel, cambio, potencia, km, preco, status, destaque, imagem, descricao, caracteristicas
  };

  const btnSalvar = document.querySelector('.modal-footer .btn-ouro');
  const textoOriginal = btnSalvar.innerHTML;
  btnSalvar.innerHTML = '⏳ Salvando...';
  btnSalvar.disabled = true;

  // Se tem ID, vai para a API de edição (que criaremos). Se não, vai para a de cadastro!
  const urlApi = id ? 'api_editar_carro.php' : 'api_cadastrar_carro.php';

  fetch(urlApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carroParaSalvar)
  })
  .then(response => response.json())
  .then(data => {
    if (data.sucesso) {
      toast(data.mensagem || "Veículo salvo!", 'sucesso');
      fecharModal();
      carregarDadosAdmin(); 
    } else {
      alert("❌ Erro no banco: " + data.mensagem);
    }
  })
  .catch(erro => {
    console.error("Erro na requisição:", erro);
    // Se a api_editar_carro.php ainda não existir, vai cair aqui no erro 404 por enquanto
    alert("❌ O arquivo PHP para esta ação ainda não foi criado ou falhou.");
  })
  .finally(() => {
    btnSalvar.innerHTML = textoOriginal;
    btnSalvar.disabled = false;
  });
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

// ── Init ──────────────────────────────────────────────
carregarDadosAdmin();