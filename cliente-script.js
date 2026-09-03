let VEICULOS = [];

// ── Auth guard ───────────────────────────────────────
const sessao = JSON.parse(localStorage.getItem('ae_sessao') || 'null');
if (!sessao || sessao.role !== 'cliente') window.location.href = 'login.html';

function sair() { 
  localStorage.removeItem('ae_sessao'); 
  window.location.href = 'login.html'; 
}

// ── Utilitários de Formatação ─────────────────────────
const formatarPreco = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
const formatarKm = v => Number(v).toLocaleString('pt-BR') + ' km';

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
  const selMarca = document.getElementById('filtroMarca');
  const selTipo  = document.getElementById('filtroTipo');
  const selComb  = document.getElementById('filtroComb');
  const rangePreco = document.getElementById('filtroPreco');

  const MARCAS = [...new Set(VEICULOS.map(v => v.marca))].filter(Boolean).sort();
  const TIPOS = [...new Set(VEICULOS.map(v => v.tipo))].filter(Boolean).sort();
  const COMBUSTIVEIS = [...new Set(VEICULOS.map(v => v.combustivel))].filter(Boolean).sort();

  if(selMarca) {
      selMarca.innerHTML = '<option value="">Todas as marcas</option>';
      MARCAS.forEach(m => selMarca.innerHTML += `<option value="${m}">${m}</option>`);
      selMarca.addEventListener('change', () => { estado.filtros.marca = selMarca.value; renderCards(); });
  }
  
  if(selTipo) {
      selTipo.innerHTML  = '<option value="">Todos os tipos</option>';
      TIPOS.forEach(t  => selTipo.innerHTML  += `<option value="${t}">${t}</option>`);
      selTipo.addEventListener('change',  () => { estado.filtros.tipo  = selTipo.value;  renderCards(); });
  }

  if(selComb) {
      selComb.innerHTML  = '<option value="">Todos</option>';
      COMBUSTIVEIS.forEach(c => selComb.innerHTML += `<option value="${c}">${c}</option>`);
      selComb.addEventListener('change',  () => { estado.filtros.combustivel = selComb.value; renderCards(); });
  }

  if(rangePreco) {
      const precoMax = VEICULOS.length > 0 ? Math.max(...VEICULOS.map(v => v.preco)) : 900000;
      rangePreco.max = precoMax;
      rangePreco.value = precoMax;
      estado.filtros.precoMax = precoMax;
      
      const lbl = document.getElementById('precoMaxLabel');
      if(lbl) lbl.textContent = formatarPreco(precoMax);

      rangePreco.addEventListener('input', () => {
        const val = +rangePreco.value;
        estado.filtros.precoMax = val;
        if(lbl) lbl.textContent = formatarPreco(val);
        renderCards();
      });
  }

  document.querySelectorAll('.chip[data-comb]').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.comb;
      document.querySelectorAll('.chip[data-comb]').forEach(c => c.classList.remove('ativo'));
      if (estado.filtros.combustivel === val) {
        estado.filtros.combustivel = '';
        if(selComb) selComb.value = '';
      } else {
        chip.classList.add('ativo');
        estado.filtros.combustivel = val;
        if(selComb) selComb.value = val;
      }
      renderCards();
    });
  });

  document.getElementById('buscaInput')?.addEventListener('input', e => {
    estado.filtros.busca = e.target.value.toLowerCase();
    renderCards();
  });

  document.getElementById('ordenacao')?.addEventListener('change', e => {
    estado.ordenacao = e.target.value;
    renderCards();
  });

  document.getElementById('btnResetFiltros')?.addEventListener('click', resetarFiltros);
}

function resetarFiltros() {
  const fPreco = document.getElementById('filtroPreco');
  estado.filtros = { busca: '', marca: '', tipo: '', combustivel: '', precoMax: fPreco ? +fPreco.max : 900000 };
  
  if(document.getElementById('buscaInput')) document.getElementById('buscaInput').value = '';
  if(document.getElementById('filtroMarca')) document.getElementById('filtroMarca').value = '';
  if(document.getElementById('filtroTipo')) document.getElementById('filtroTipo').value  = '';
  if(fPreco) fPreco.value = fPreco.max;
  
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('ativo'));
  
  const lbl = document.getElementById('precoMaxLabel');
  if(lbl && fPreco) lbl.textContent = formatarPreco(fPreco.max);
  
  renderCards();
}

// ── Render ────────────────────────────────────────────
function renderCards() {
  const { busca, marca, tipo, combustivel, precoMax } = estado.filtros;
  const ordem = document.getElementById('ordenacao')?.value || '';
  
  // Lê direto da nossa variável populada pelo banco
  let lista = VEICULOS.filter(v => v.status !== 'vendido');

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

  const resEl = document.getElementById('totalResultados');
  if(resEl) resEl.textContent = lista.length;
  
  const grid = document.getElementById('veiculosGrid') || document.getElementById('cardsGrid');
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<div class="sem-resultados"><div style="font-size:2.5rem;margin-bottom:1rem">🔍</div><h3>Nenhum resultado</h3><p>Ajuste os filtros para ver mais opções.</p></div>`;
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
          <div class="vcard-spec">🛣 ${formatarKm(v.km)}</div>
          <div class="vcard-spec">⛽ ${v.combustivel}</div>
          <div class="vcard-spec">⚙ ${v.cambio}</div>
        </div>
        <div class="vcard-footer">
          <div>
            <div class="vcard-preco-lbl">Preço</div>
            <div class="vcard-preco">${formatarPreco(v.preco)}</div>
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
  // Procura no array real
  const v = VEICULOS.find(x => x.id == id);
  if (!v) return;
  estado.veiculoAtivo = id;

  const mImg = document.getElementById('modalImg') || document.getElementById('mImg');
  if(mImg) mImg.src = v.imagem;
  
  const mMarca = document.getElementById('modalMarca') || document.getElementById('mMarca');
  if(mMarca) mMarca.textContent = v.marca;
  
  const mNome = document.getElementById('modalNome') || document.getElementById('mNome');
  if(mNome) mNome.textContent = v.nome;
  
  const mDesc = document.getElementById('modalDesc') || document.getElementById('mDesc');
  if(mDesc) mDesc.textContent = v.descricao || '';
  
  const mPreco = document.getElementById('modalPreco') || document.getElementById('mPreco');
  if(mPreco) mPreco.textContent = formatarPreco(v.preco);

  const mSpecs = document.getElementById('modalSpecs') || document.getElementById('mSpecs');
  if(mSpecs) {
      mSpecs.innerHTML = `
        <div class="modal-spec"><strong>Ano</strong>${v.ano}</div>
        <div class="modal-spec"><strong>Quilometragem</strong>${formatarKm(v.km)}</div>
        <div class="modal-spec"><strong>Combustível</strong>${v.combustivel}</div>
        <div class="modal-spec"><strong>Câmbio</strong>${v.cambio}</div>
        <div class="modal-spec"><strong>Cor</strong>${v.cor||'—'}</div>
        <div class="modal-spec"><strong>Potência</strong>${v.potencia||'—'}</div>
      `;
  }

  const mCarac = document.getElementById('modalCarac') || document.getElementById('mCarac');
  if (mCarac) {
      // Usa as características já transformadas em array pelo PHP
      mCarac.innerHTML = (v.caracteristicas || []).map(c => `<li>${c}</li>`).join('');
  }

  const btnFav = document.getElementById('modalBtnFav') || document.getElementById('mBtnFav');
  if(btnFav) {
      const isFav  = estado.favoritos.has(id);
      btnFav.textContent = isFav ? '❤ Favorito' : '♡ Favoritar';
      btnFav.onclick = () => {
        toggleFav({ stopPropagation: () => {} }, id);
        btnFav.textContent = estado.favoritos.has(id) ? '❤ Favorito' : '♡ Favoritar';
      };
  }

  const btnContato = document.getElementById('modalBtnWpp') || document.getElementById('mBtnContato');
  if(btnContato) {
      btnContato.onclick = () => {
        fecharModal('modalOverlay');
        abrirContato(id);
      };
  }

  const modal = document.getElementById('modalOverlay') || document.getElementById('modalDetalhe');
  if(modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
  }
}

// ── Modal de contato ──────────────────────────────────
function abrirContato(id) {
  const v = VEICULOS.find(x => x.id == id);
  if (!v) return;
  estado.contatoVeiculoId = id;
  
  const info = document.getElementById('contatoVeiculo');
  if(info) info.innerHTML = `Interesse em: <strong>${v.nome}</strong> · ${formatarPreco(v.preco)}`;
  
  const cNome = document.getElementById('cNome');
  const cEmail = document.getElementById('cEmail');
  const cMsg = document.getElementById('cMsg');
  
  if(cNome) cNome.value  = sessao.nome || '';
  if(cEmail) cEmail.value = sessao.email || '';
  if(cMsg) cMsg.value   = `Olá! Tenho interesse no ${v.nome} (${v.ano}). Poderia me dar mais informações?`;
  
  const mContato = document.getElementById('modalContato');
  if(mContato) {
      mContato.classList.add('open');
      document.body.style.overflow = 'hidden';
  }
}

function enviarContato() {
  const cNome = document.getElementById('cNome');
  const cTel = document.getElementById('cTel');
  const cEmail = document.getElementById('cEmail');
  const cMsg = document.getElementById('cMsg');

  const nome = cNome ? cNome.value.trim() : '';
  const telefone = cTel ? cTel.value.trim() : '';
  const email = cEmail ? cEmail.value.trim() : '';
  const mensagem = cMsg ? cMsg.value.trim() : '';

  // Validação básica
  if (!nome || !telefone) { 
    toast('⚠️ Preencha nome e telefone'); 
    return; 
  }

  // Efeito visual de carregamento
  const btnSalvar = document.querySelector('#modalContato .btn-ouro');
  const textoOriginal = btnSalvar.innerHTML;
  btnSalvar.innerHTML = '⏳ Enviando...';
  btnSalvar.disabled = true;

  // Monta o pacote de dados
  const pacote = {
    nome: nome,
    telefone: telefone,
    email: email,
    mensagem: mensagem,
    veiculoId: estado.contatoVeiculoId // ID do carro que ele clicou
  };

  // Envia para o servidor
  fetch('api_avaliacoes.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pacote)
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      fecharModal('modalContato');
      toast('✅ ' + data.mensagem);
      
      // Limpa os campos após o envio
      if(cMsg) cMsg.value = '';
      if(cTel) cTel.value = '';
    } else {
      alert('❌ Erro: ' + data.mensagem);
    }
  })
  .catch(erro => {
    console.error('Erro:', erro);
    alert('❌ Falha ao se conectar com o servidor.');
  })
  .finally(() => {
    btnSalvar.innerHTML = textoOriginal;
    btnSalvar.disabled = false;
  });
}

function fecharModal(id = 'modalOverlay') {
  const modal = document.getElementById(id);
  if(modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) fecharModal(ov.id); });
});

/* ─── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Preenche informações visuais da navbar do cliente
  const elAvatar = document.getElementById('userAvatar') || document.getElementById('userAv');
  const elName = document.getElementById('userName');
  if (elAvatar) elAvatar.textContent = sessao.avatar || '👤';
  if (elName) elName.textContent = sessao.nome || 'Cliente';

  // Busca os carros reais do MySQL
  fetch('api_carros.php')
    .then(response => response.json())
    .then(dados => {
      VEICULOS = dados;
      initFiltros();
      renderCards();
    })
    .catch(erro => {
      console.error("Erro ao carregar a vitrine do cliente:", erro);
    });
});