// ── Auth guard ───────────────────────────────────────
const sessao = DB.getSessao();
if (!sessao || sessao.role !== 'cliente') window.location.href = 'login.html';

document.getElementById('userAv').textContent   = sessao.avatar;
document.getElementById('userName').textContent = sessao.nome;

function sair() { DB.logout(); window.location.href = 'login.html'; }

// ── Estado ────────────────────────────────────────────
const estado = {
  filtros: { busca: '', marca: '', tipo: '', combustivel: '', precoMax: 0 },
  favoritos: new Set(JSON.parse(localStorage.getItem('ae_fav_cli_' + sessao.id) || '[]')),
  veiculoAtivo: null, contatoVeiculoId: null
};

function salvarFav() { localStorage.setItem('ae_fav_cli_' + sessao.id, JSON.stringify([...estado.favoritos])); }
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ── Init filtros ──────────────────────────────────────
function initFiltros() {
  const lista   = DB.getVeiculos().filter(v => v.status !== 'vendido');
  const marcas  = [...new Set(lista.map(v => v.marca))].sort();
  const tipos   = [...new Set(lista.map(v => v.tipo))].sort();
  const precoMax = Math.max(...lista.map(v => v.preco));

  const selM = document.getElementById('fMarca');
  marcas.forEach(m => selM.innerHTML += `<option value="${m}">${m}</option>`);
  const selT = document.getElementById('fTipo');
  tipos.forEach(t => selT.innerHTML += `<option value="${t}">${t}</option>`);

  const range = document.getElementById('fPreco');
  range.max = precoMax; range.value = precoMax;
  estado.filtros.precoMax = precoMax;
  atualizarPrecoLabel();
}

function atualizarPrecoLabel() {
  const v = +document.getElementById('fPreco').value;
  estado.filtros.precoMax = v;
  document.getElementById('labelPreco').textContent = DB.formatarPreco(v);
}

function toggleChip(el, campo) {
  const val = el.dataset.c;
  const ativo = el.classList.contains('on');
  document.querySelectorAll(`.chip[data-c]`).forEach(c => c.classList.remove('on'));
  if (!ativo) { el.classList.add('on'); estado.filtros[campo] = val; }
  else         { estado.filtros[campo] = ''; }
  renderCards();
}

function resetarFiltros() {
  estado.filtros = { busca: '', marca: '', tipo: '', combustivel: '', precoMax: +document.getElementById('fPreco').max };
  document.getElementById('busca').value = '';
  document.getElementById('fMarca').value = '';
  document.getElementById('fTipo').value  = '';
  document.getElementById('fPreco').value = document.getElementById('fPreco').max;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  atualizarPrecoLabel();
  renderCards();
}

document.getElementById('busca').addEventListener('input', e => { estado.filtros.busca = e.target.value.toLowerCase(); renderCards(); });
document.getElementById('fMarca').addEventListener('change', e => { estado.filtros.marca = e.target.value; renderCards(); });
document.getElementById('fTipo').addEventListener('change', e => { estado.filtros.tipo  = e.target.value; renderCards(); });

// ── Render ────────────────────────────────────────────
function renderCards() {
  const { busca, marca, tipo, combustivel, precoMax } = estado.filtros;
  const ordem = document.getElementById('ordem').value;
  let lista = DB.getVeiculos().filter(v => v.status !== 'vendido');

  if (busca)       lista = lista.filter(v => `${v.nome} ${v.marca} ${v.tipo}`.toLowerCase().includes(busca));
  if (marca)       lista = lista.filter(v => v.marca === marca);
  if (tipo)        lista = lista.filter(v => v.tipo === tipo);
  if (combustivel) lista = lista.filter(v => v.combustivel === combustivel);
  lista = lista.filter(v => v.preco <= precoMax);

  switch (ordem) {
    case 'preco_asc':  lista.sort((a,b) => a.preco - b.preco); break;
    case 'preco_desc': lista.sort((a,b) => b.preco - a.preco); break;
    case 'ano_desc':   lista.sort((a,b) => b.ano   - a.ano);   break;
    case 'km_asc':     lista.sort((a,b) => a.km    - b.km);    break;
    default: lista.sort((a,b) => (b.destaque?1:0)-(a.destaque?1:0));
  }

  document.getElementById('totalResultados').textContent = lista.length;
  const grid = document.getElementById('cardsGrid');

  if (!lista.length) {
    grid.innerHTML = `<div class="empty-state"><div class="ico">🔍</div><h3>Nenhum resultado</h3><p>Ajuste os filtros para ver mais opções.</p></div>`;
    return;
  }

  grid.innerHTML = lista.map(v => {
    const fav = estado.favoritos.has(v.id);
    const badgeStatus = v.status === 'reservado' ? '<span class="badge badge-res">Reservado</span>' : '';
    return `
    <div class="vcard" onclick="abrirDetalhe(${v.id})">
      <div class="vcard-img">
        <img src="${v.imagem}" alt="${v.nome}" loading="lazy">
        <div class="vcard-badges">
          ${v.destaque ? '<span class="badge badge-dest">★ Destaque</span>' : ''}
          ${badgeStatus}
        </div>
        <div class="vcard-fav ${fav?'on':''}" onclick="toggleFav(event,${v.id})">${fav?'❤':'♡'}</div>
      </div>
      <div class="vcard-body">
        <div class="vcard-marca">${v.marca}</div>
        <div class="vcard-nome">${v.nome}</div>
        <div class="vcard-specs">
          <div class="vcard-spec">📅 ${v.ano}</div>
          <div class="vcard-spec">🛣 ${DB.formatarKm(v.km)}</div>
          <div class="vcard-spec">⛽ ${v.combustivel}</div>
          <div class="vcard-spec">⚙ ${v.cambio}</div>
        </div>
        <div class="vcard-footer">
          <div>
            <div class="vcard-preco-lbl">Preço</div>
            <div class="vcard-preco">${DB.formatarPreco(v.preco)}</div>
          </div>
          <button class="vcard-btn" title="Ver detalhes">→</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Favoritos ─────────────────────────────────────────
function toggleFav(e, id) {
  e.stopPropagation();
  if (estado.favoritos.has(id)) { estado.favoritos.delete(id); toast('Removido dos favoritos'); }
  else { estado.favoritos.add(id); toast('❤ Adicionado aos favoritos'); }
  salvarFav(); renderCards();
}

// ── Modal de detalhe ──────────────────────────────────
function abrirDetalhe(id) {
  const v = DB.getVeiculoById(id);
  if (!v) return;
  DB.incrementarView(id);
  estado.veiculoAtivo = id;

  document.getElementById('mImg').src = v.imagem;
  document.getElementById('mMarca').textContent = v.marca;
  document.getElementById('mNome').textContent  = v.nome;
  document.getElementById('mDesc').textContent  = v.descricao || '';
  document.getElementById('mPreco').textContent = DB.formatarPreco(v.preco);

  document.getElementById('mSpecs').innerHTML = `
    <div class="modal-spec"><strong>Ano</strong>${v.ano}</div>
    <div class="modal-spec"><strong>Quilometragem</strong>${DB.formatarKm(v.km)}</div>
    <div class="modal-spec"><strong>Combustível</strong>${v.combustivel}</div>
    <div class="modal-spec"><strong>Câmbio</strong>${v.cambio}</div>
    <div class="modal-spec"><strong>Cor</strong>${v.cor||'—'}</div>
    <div class="modal-spec"><strong>Potência</strong>${v.potencia||'—'}</div>
  `;

  const caracs = (v.caracteristicas||'').split(',').map(c => c.trim()).filter(Boolean);
  document.getElementById('mCarac').innerHTML = caracs.map(c => `<li>${c}</li>`).join('');

  // Botão favoritar
  const btnFav = document.getElementById('mBtnFav');
  const isFav  = estado.favoritos.has(id);
  btnFav.textContent = isFav ? '❤ Favorito' : '♡ Favoritar';
  btnFav.onclick = () => {
    if (estado.favoritos.has(id)) { estado.favoritos.delete(id); btnFav.textContent = '♡ Favoritar'; toast('Removido dos favoritos'); }
    else { estado.favoritos.add(id); btnFav.textContent = '❤ Favorito'; toast('❤ Adicionado'); }
    salvarFav(); renderCards();
  };

  document.getElementById('mBtnContato').onclick = () => {
    fecharModal('modalDetalhe');
    abrirContato(id);
  };

  document.getElementById('modalDetalhe').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── Modal de contato ──────────────────────────────────
function abrirContato(id) {
  const v = DB.getVeiculoById(id);
  if (!v) return;
  estado.contatoVeiculoId = id;
  document.getElementById('contatoVeiculo').innerHTML =
    `Interesse em: <strong>${v.nome}</strong> · ${DB.formatarPreco(v.preco)}`;
  // Pré-preenche com dados da sessão
  document.getElementById('cNome').value  = sessao.nome;
  document.getElementById('cEmail').value = sessao.email;
  document.getElementById('cMsg').value   = `Olá! Tenho interesse no ${v.nome} (${v.ano}). Poderia me dar mais informações?`;
  document.getElementById('modalContato').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function enviarContato() {
  const nome = document.getElementById('cNome').value.trim();
  const tel  = document.getElementById('cTel').value.trim();
  const msg  = document.getElementById('cMsg').value.trim();
  if (!nome || !tel) { toast('⚠ Preencha nome e telefone'); return; }
  DB.addLead({
    nome, email: document.getElementById('cEmail').value.trim(),
    tel, veiculoId: estado.contatoVeiculoId, mensagem: msg
  });
  fecharModal('modalContato');
  toast('✅ Mensagem enviada! Entraremos em contato em breve.');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// Fecha ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) fecharModal(ov.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    fecharModal('modalDetalhe');
    fecharModal('modalContato');
  }
});

// ── Boot ─────────────────────────────────────────────
initFiltros();
renderCards();
