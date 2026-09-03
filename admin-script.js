let veiculosDoBanco = []; // Variável para armazenar os dados reais
// ── Guard de autenticação ──────────────────────────────
const sessao = DB.getSessao();
if (!sessao || sessao.role !== 'admin') window.location.href = 'login.html';

// ── Preenche usuário na sidebar ───────────────────────
document.getElementById('userAvatar').textContent = sessao.avatar;
document.getElementById('userName').textContent   = sessao.nome;

// ── Atualiza badge de leads ────────────────────────────
function atualizarBadge() {
  const n = DB.getLeads().filter(l => l.status === 'novo').length;
  const el = document.getElementById('badgeLeads');
  el.textContent = n;
  el.style.display = n ? 'inline-block' : 'none';
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
  document.getElementById('page-' + pagina).classList.add('ativa');
  document.getElementById('nav-' + pagina).classList.add('ativo');
  const [t, s] = TITULOS[pagina];
  document.getElementById('topbarTitulo').textContent = t;
  document.getElementById('topbarSub').textContent    = s;

  if (pagina === 'dashboard') renderDashboard();
  if (pagina === 'veiculos')  renderTabelaVeiculos();
  if (pagina === 'leads')     renderTabelaLeads();
}

function fazerLogout() {
  DB.logout();
  window.location.href = 'login.html';
}

// ── Toast ─────────────────────────────────────────────
function toast(msg, tipo = '') {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = 'toast ' + tipo;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

// ── Dashboard ─────────────────────────────────────────
function renderDashboard() {
  const s = DB.getStats();

  // KPIs
  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi-card k-ouro">
      <div class="kpi-ico">🚗</div>
      <div class="kpi-val">${s.total}</div>
      <div class="kpi-lbl">Total em estoque</div>
      <div class="kpi-delta delta-pos">▲ ${s.disponiveis} disponíveis</div>
    </div>
    <div class="kpi-card k-verde">
      <div class="kpi-ico">💰</div>
      <div class="kpi-val">${DB.formatarPreco(s.valorEstoque)}</div>
      <div class="kpi-lbl">Valor total do estoque</div>
      <div class="kpi-delta">${s.vendidos} vendidos</div>
    </div>
    <div class="kpi-card k-azul">
      <div class="kpi-ico">👁</div>
      <div class="kpi-val">${s.visualizacoes.toLocaleString('pt-BR')}</div>
      <div class="kpi-lbl">Total de visualizações</div>
      <div class="kpi-delta delta-pos">▲ No período</div>
    </div>
    <div class="kpi-card k-lrj">
      <div class="kpi-ico">📋</div>
      <div class="kpi-val">${s.totalLeads}</div>
      <div class="kpi-lbl">Leads cadastrados</div>
      <div class="kpi-delta delta-neg">● ${s.leadsNovos} novos</div>
    </div>
  `;

  // Combustível barras
  const maxC = Math.max(...Object.values(s.porCombust));
  const cores = { Gasolina:'#C9A84C', Híbrido:'#3498db', Elétrico:'#2ecc71', Diesel:'#e74c3c', Flex:'#9b59b6', Etanol:'#f39c12' };
  document.getElementById('chartCombust').innerHTML = Object.entries(s.porCombust).map(([k,v]) => `
    <div class="bar-item">
      <span class="bar-label">${k}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.round(v/maxC*100)}%;background:${cores[k]||'var(--ouro)'}"></div>
      </div>
      <span class="bar-val">${v}</span>
    </div>`).join('');

  // Tipo grid
  const paleta = ['#C9A84C','#3498db','#2ecc71','#e74c3c','#9b59b6','#f39c12','#1abc9c'];
  document.getElementById('chartTipo').innerHTML = Object.entries(s.porTipo).map(([k,v],i) => `
    <div class="tipo-item">
      <div class="tipo-dot" style="background:${paleta[i%paleta.length]}"></div>
      <span class="tipo-nome">${k}</span>
      <span class="tipo-qtd">${v}</span>
    </div>`).join('');

  // Mais vistos
  document.getElementById('maisVistos').innerHTML = s.maisVistos.map((v,i) => `
    <div class="mv-item">
      <div class="mv-rank">${i+1}</div>
      <div class="mv-info">
        <div class="mv-nome">${v.nome}</div>
        <div class="mv-marca">${v.marca}</div>
      </div>
      <span class="mv-views">👁 ${v.visualizacoes}</span>
    </div>`).join('');

  // Leads recentes
  const leads = DB.getLeads().slice(-4).reverse();
  const badgeLead = s => ({ novo:'badge-novo', contato:'badge-cont', negociando:'badge-neg', concluido:'badge-conc' }[s]||'badge-novo');
  document.getElementById('leadsRecentes').innerHTML = leads.map(l => {
    const v = DB.getVeiculoById(l.veiculoId);
    return `<div style="display:flex;align-items:center;gap:.75rem;padding:.65rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div style="width:36px;height:36px;background:var(--esc3);border-radius:50%;display:grid;place-items:center;font-size:.8rem;font-weight:700;color:var(--ouro);flex-shrink:0">${l.nome.slice(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.83rem;font-weight:600">${l.nome}</div>
        <div style="font-size:.72rem;color:var(--cinza)">${v ? v.nome : '—'}</div>
      </div>
      <span class="badge ${badgeLead(l.status)}">${l.status}</span>
    </div>`;
  }).join('') || '<p style="color:var(--cinza);font-size:.85rem">Nenhum lead ainda.</p>';
}

function carregarVeiculosAdmin() {
  fetch('api_carros.php')
    .then(res => res.json())
    .then(dados => {
      veiculosDoBanco = dados;
      renderTabelaVeiculos(); // Desenha a tabela após receber os dados
      renderDashboard(); // Atualiza os números do dashboard
    })
    .catch(erro => console.error("Erro ao carregar veículos:", erro));
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
  tbody.innerHTML = lista.map(v => `
    <tr>
      <td><img class="td-img" src="${v.imagem}" alt="" loading="lazy"></td>
      <td>
        <div class="td-nome">${v.nome}</div>
        <div class="td-marca">${v.marca}</div>
      </td>
      <td>${v.ano}<br><small style="color:var(--cinza)">${DB.formatarKm(v.km)}</small></td>
      <td><strong style="color:var(--ouro)">${DB.formatarPreco(v.preco)}</strong></td>
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
  if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
  DB.deleteVeiculo(id);
  renderTabelaVeiculos();
  toast('🗑 Veículo excluído', 'erro');
}

// ── Tabela de leads ───────────────────────────────────
function renderTabelaLeads() {
  const busca  = (document.getElementById('buscaLeads')?.value || '').toLowerCase();
  const status = document.getElementById('filtroStatusL')?.value || '';
  let lista = DB.getLeads();
  if (busca)  lista = lista.filter(l => `${l.nome} ${l.email}`.toLowerCase().includes(busca));
  if (status) lista = lista.filter(l => l.status === status);

  const badgeMap = { novo:'badge-novo', contato:'badge-cont', negociando:'badge-neg', concluido:'badge-conc' };
  const tbody = document.getElementById('tbodyLeads');
  tbody.innerHTML = lista.map(l => {
    const v = DB.getVeiculoById(l.veiculoId);
    return `<tr>
      <td><strong>${l.nome}</strong></td>
      <td><a href="tel:${l.tel}" style="color:var(--ouro)">${l.tel}</a><br><small style="color:var(--cinza)">${l.email}</small></td>
      <td>${v ? v.nome : '—'}</td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cinza)">${l.mensagem}</td>
      <td style="white-space:nowrap;color:var(--cinza)">${l.data}</td>
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
  DB.updateLeadStatus(id, status);
  atualizarBadge();
  toast('Status do lead atualizado');
}
function excluirLead(id) {
  if (!confirm('Excluir este lead?')) return;
  DB.deleteLead(id);
  renderTabelaLeads();
  toast('Lead excluído', 'erro');
}

// ── Modal de veículo ──────────────────────────────────
function abrirModalVeiculo(id = null) {
  const isEdicao = id !== null;
  document.getElementById('modalTitulo').textContent = isEdicao ? '✏ Editar Veículo' : '+ Novo Veículo';
  document.getElementById('veiculoId').value = id || '';
  limparFormVeiculo();

  if (isEdicao) {
    const v = DB.getVeiculoById(id);
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
    document.getElementById('vCaracteristicas').value = v.caracteristicas;
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
  
  // Só tenta carregar a imagem se o texto começar com "http" (for um link real)
  if (url.startsWith('http')) { 
    img.src = url; 
    img.classList.add('show'); 
  } else { 
    img.classList.remove('show'); 
  }
}

function salvarVeiculo() {
  // 1. Coleta todos os valores digitados nos inputs do HTML
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
  const destaque = document.getElementById('vDestaque').checked; // Checkbox usa .checked
  const imagem = document.getElementById('vImagem').value;
  const descricao = document.getElementById('vDescricao').value;
  const caracteristicas = document.getElementById('vCaracteristicas').value;

  // 2. Validação simples (Garante que os campos com * foram preenchidos)
  if (!marca || !nome || !tipo || !ano || !combustivel || !cambio || km === '' || preco === '' || !imagem) {
    alert("⚠️ Por favor, preencha todos os campos obrigatórios (*).");
    return;
  }

  // 3. Monta o objeto para enviar
  const novoCarro = {
    marca, nome, tipo, ano, cor, combustivel, cambio, potencia, km, preco, status, destaque, imagem, descricao, caracteristicas
  };

  // 4. Efeito visual no botão enquanto salva
  const btnSalvar = document.querySelector('.modal-footer .btn-ouro');
  const textoOriginal = btnSalvar.innerHTML;
  btnSalvar.innerHTML = '⏳ Salvando...';
  btnSalvar.disabled = true;

  // 5. Envia os dados para o PHP
  fetch('api_cadastrar_carro.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoCarro)
  })
  .then(response => response.json())
  .then(data => {
    if (data.sucesso) {
      // Usa sua função de toast existente para mostrar o sucesso
      toast(data.mensagem || "Veículo cadastrado!", 'sucesso');
      
      // Fecha o modal
      fecharModal();
      
      
      // DICA: Aqui você chamaria a função que recarrega a tabela de veículos
      carregarVeiculosAdmin(); 
    } else {
      alert("❌ Erro no banco: " + data.mensagem);
    }
  })
  .catch(erro => {
    console.error("Erro na requisição:", erro);
    alert("❌ Erro ao tentar se conectar com o servidor.");
  })
  .finally(() => {
    // Volta o botão ao estado normal
    btnSalvar.innerHTML = textoOriginal;
    btnSalvar.disabled = false;
  });
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

// ── Init ──────────────────────────────────────────────
atualizarBadge();
carregarVeiculosAdmin();
