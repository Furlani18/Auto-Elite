// ============================================================
//  AutoElite — Script principal
// ============================================================

/* ─── Estado da aplicação ─────────────────────────────────── */
const estado = {
  veiculosFiltrados: [],
  filtros: {
    marca: '',
    tipo: '',
    combustivel: '',
    precoMax: 900000,
    busca: ''
  },
  ordenacao: 'destaque',
  favoritos: new Set(JSON.parse(localStorage.getItem('ae_favoritos') || '[]')),
  modalAberto: null
};

/* ─── Utilitários ─────────────────────────────────────────── */
const formatarPreco = v =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

const formatarKm = v =>
  v.toLocaleString('pt-BR') + ' km';

function salvarFavoritos() {
  localStorage.setItem('ae_favoritos', JSON.stringify([...estado.favoritos]));
}

function mostrarToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

/* ─── Navbar ──────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Links ativos por seção
  const secoes = document.querySelectorAll('section[id]');
  const links  = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: .3 });
  secoes.forEach(s => io.observe(s));

  // Mobile menu
  const ham   = document.getElementById('hamburger');
  const menu  = document.getElementById('navMobile');
  const ov    = document.getElementById('navOverlay');
  const close = document.getElementById('navMobileClose');

  const abrirMenu = () => { menu.classList.add('open'); ov.classList.add('open'); };
  const fecharMenu = () => { menu.classList.remove('open'); ov.classList.remove('open'); };

  ham.addEventListener('click', abrirMenu);
  close.addEventListener('click', fecharMenu);
  ov.addEventListener('click', fecharMenu);
  document.querySelectorAll('.nav-mobile a').forEach(l => l.addEventListener('click', fecharMenu));
}

/* ─── Hero ────────────────────────────────────────────────── */
function initHero() {
  document.getElementById('heroScroll')?.addEventListener('click', () => {
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ─── Destaques ───────────────────────────────────────────── */
function renderDestaques() {
  const destq = VEICULOS.filter(v => v.destaque);
  const container = document.getElementById('destaquesGrid');
  if (!container) return;

  container.innerHTML = destq.map((v, i) => `
    <div class="destaque-card ${i === 0 ? 'destaque-card-main' : ''}" onclick="abrirModal(${v.id})">
      <img src="${v.imagem}" alt="${v.nome}" loading="lazy">
      <div class="destaque-card-overlay">
        <div class="nome">${v.nome}</div>
        <div class="preco">${formatarPreco(v.preco)}</div>
      </div>
      ${v.novo ? '<span class="tag tag-novo badge-destq">Novo</span>' : ''}
    </div>
  `).join('');
}

/* ─── Filtros ─────────────────────────────────────────────── */
function initFiltros() {
  const selMarca = document.getElementById('filtroMarca');
  const selTipo  = document.getElementById('filtroTipo');
  const selComb  = document.getElementById('filtroComb');
  const rangePreco = document.getElementById('filtroPreco');

  // Popula selects
  MARCAS.forEach(m => selMarca.innerHTML += `<option value="${m}">${m}</option>`);
  TIPOS.forEach(t  => selTipo.innerHTML  += `<option value="${t}">${t}</option>`);
  COMBUSTIVEIS.forEach(c => selComb.innerHTML += `<option value="${c}">${c}</option>`);

  // Range de preço
  const precoMax = Math.max(...VEICULOS.map(v => v.preco));
  rangePreco.max = precoMax;
  rangePreco.value = precoMax;
  estado.filtros.precoMax = precoMax;
  atualizarLabelPreco(precoMax);

  rangePreco.addEventListener('input', () => {
    const val = +rangePreco.value;
    estado.filtros.precoMax = val;
    atualizarLabelPreco(val);
    aplicarFiltros();
  });

  selMarca.addEventListener('change', () => { estado.filtros.marca = selMarca.value; aplicarFiltros(); });
  selTipo.addEventListener('change',  () => { estado.filtros.tipo  = selTipo.value;  aplicarFiltros(); });
  selComb.addEventListener('change',  () => { estado.filtros.combustivel = selComb.value; aplicarFiltros(); });

  // Chips de combustível
  document.querySelectorAll('.chip[data-comb]').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.comb;
      document.querySelectorAll('.chip[data-comb]').forEach(c => c.classList.remove('ativo'));
      if (estado.filtros.combustivel === val) {
        estado.filtros.combustivel = '';
        selComb.value = '';
      } else {
        chip.classList.add('ativo');
        estado.filtros.combustivel = val;
        selComb.value = val;
      }
      aplicarFiltros();
    });
  });

  // Busca
  document.getElementById('buscaInput')?.addEventListener('input', e => {
    estado.filtros.busca = e.target.value.toLowerCase();
    aplicarFiltros();
  });

  // Ordenação
  document.getElementById('ordenacao')?.addEventListener('change', e => {
    estado.ordenacao = e.target.value;
    aplicarFiltros();
  });

  // Reset
  document.getElementById('btnResetFiltros')?.addEventListener('click', resetarFiltros);
}

function atualizarLabelPreco(val) {
  document.getElementById('precoMaxLabel').textContent = formatarPreco(val);
}

function resetarFiltros() {
  estado.filtros = { marca: '', tipo: '', combustivel: '', precoMax: +document.getElementById('filtroPreco').max, busca: '' };
  document.getElementById('filtroMarca').value = '';
  document.getElementById('filtroTipo').value  = '';
  document.getElementById('filtroComb').value  = '';
  document.getElementById('filtroPreco').value = document.getElementById('filtroPreco').max;
  document.getElementById('buscaInput').value  = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('ativo'));
  atualizarLabelPreco(estado.filtros.precoMax);
  aplicarFiltros();
  mostrarToast('Filtros removidos');
}

function aplicarFiltros() {
  let lista = [...VEICULOS];
  const { marca, tipo, combustivel, precoMax, busca } = estado.filtros;

  if (marca)      lista = lista.filter(v => v.marca === marca);
  if (tipo)       lista = lista.filter(v => v.tipo === tipo);
  if (combustivel) lista = lista.filter(v => v.combustivel === combustivel);
  lista = lista.filter(v => v.preco <= precoMax);
  if (busca)      lista = lista.filter(v =>
    v.nome.toLowerCase().includes(busca) ||
    v.marca.toLowerCase().includes(busca) ||
    v.tipo.toLowerCase().includes(busca)
  );

  // Ordenação
  switch (estado.ordenacao) {
    case 'preco_asc':   lista.sort((a, b) => a.preco - b.preco);  break;
    case 'preco_desc':  lista.sort((a, b) => b.preco - a.preco);  break;
    case 'ano_desc':    lista.sort((a, b) => b.ano - a.ano);      break;
    case 'km_asc':      lista.sort((a, b) => a.km - b.km);        break;
    case 'destaque':
    default:
      lista.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
  }

  estado.veiculosFiltrados = lista;
  renderVeiculos();
}

/* ─── Grade de veículos ───────────────────────────────────── */
function renderVeiculos() {
  const grid = document.getElementById('veiculosGrid');
  const info = document.getElementById('totalResultados');
  if (!grid) return;

  const lista = estado.veiculosFiltrados;
  info.textContent = lista.length;

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="sem-resultados">
        <div style="font-size:2.5rem;margin-bottom:1rem">🔍</div>
        <h3>Nenhum veículo encontrado</h3>
        <p>Tente ajustar os filtros para ver mais resultados.</p>
        <br>
        <button class="btn btn-ouro btn-sm" onclick="resetarFiltros()">Limpar filtros</button>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map(v => `
    <div class="veiculo-card fade-in" onclick="abrirModal(${v.id})">
      <div class="card-img-wrap">
        <img src="${v.imagem}" alt="${v.nome}" loading="lazy">
        <div class="card-tags">
          ${v.novo     ? '<span class="tag tag-novo">Novo</span>' : ''}
          ${v.destaque ? '<span class="tag tag-destq">★ Destaque</span>' : ''}
        </div>
        <button class="card-fav ${estado.favoritos.has(v.id) ? 'ativo' : ''}"
          onclick="toggleFav(event, ${v.id})"
          title="${estado.favoritos.has(v.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          ${estado.favoritos.has(v.id) ? '❤' : '♡'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-marca">${v.marca}</div>
        <div class="card-nome">${v.nome}</div>
        <div class="card-specs">
          <div class="card-spec"><span class="ico">📅</span>${v.ano}</div>
          <div class="card-spec"><span class="ico">🛣</span>${formatarKm(v.km)}</div>
          <div class="card-spec"><span class="ico">⛽</span>${v.combustivel}</div>
          <div class="card-spec"><span class="ico">⚙</span>${v.cambio}</div>
        </div>
        <div class="card-footer">
          <div>
            <div class="card-preco-lbl">Preço</div>
            <div class="card-preco-val">${formatarPreco(v.preco)}</div>
          </div>
          <button class="card-btn" title="Ver detalhes">→</button>
        </div>
      </div>
    </div>
  `).join('');

  // Observer para animações
  requestAnimationFrame(() => {
    document.querySelectorAll('.fade-in').forEach(el => {
      if (!el.classList.contains('visible')) observerFade.observe(el);
    });
  });
}

/* ─── Favoritos ───────────────────────────────────────────── */
function toggleFav(e, id) {
  e.stopPropagation();
  if (estado.favoritos.has(id)) {
    estado.favoritos.delete(id);
    mostrarToast('Removido dos favoritos');
  } else {
    estado.favoritos.add(id);
    mostrarToast('❤ Adicionado aos favoritos');
  }
  salvarFavoritos();
  renderVeiculos();
}

/* ─── Modal de detalhe ────────────────────────────────────── */
function abrirModal(id) {
  const v = VEICULOS.find(x => x.id === id);
  if (!v) return;
  estado.modalAberto = id;

  document.getElementById('modalImg').src = v.imagem;
  document.getElementById('modalImg').alt = v.nome;
  document.getElementById('modalMarca').textContent = v.marca;
  document.getElementById('modalNome').textContent = v.nome;
  document.getElementById('modalDesc').textContent = v.descricao;
  document.getElementById('modalPreco').textContent = formatarPreco(v.preco);

  document.getElementById('modalSpecs').innerHTML = `
    <div class="modal-spec"><strong>Ano</strong>${v.ano}</div>
    <div class="modal-spec"><strong>Quilometragem</strong>${formatarKm(v.km)}</div>
    <div class="modal-spec"><strong>Combustível</strong>${v.combustivel}</div>
    <div class="modal-spec"><strong>Câmbio</strong>${v.cambio}</div>
    <div class="modal-spec"><strong>Cor</strong>${v.cor}</div>
    <div class="modal-spec"><strong>Potência</strong>${v.potencia}</div>
  `;

  document.getElementById('modalCarac').innerHTML = v.caracteristicas.map(c => `<li>${c}</li>`).join('');

  const btnFav = document.getElementById('modalBtnFav');
  const isFav  = estado.favoritos.has(id);
  btnFav.textContent = isFav ? '❤ Favorito' : '♡ Favoritar';
  btnFav.onclick = () => {
    toggleFav({ stopPropagation: () => {} }, id);
    const nowFav = estado.favoritos.has(id);
    btnFav.textContent = nowFav ? '❤ Favorito' : '♡ Favoritar';
  };

  document.getElementById('modalBtnWpp').onclick = () => {
    const msg = encodeURIComponent(
      `Olá! Tenho interesse no ${v.nome} (${v.ano}) — ${formatarPreco(v.preco)}. Poderia me dar mais informações?`
    );
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  };

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  estado.modalAberto = null;
}

function initModal() {
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && estado.modalAberto) fecharModal();
  });
}

/* ─── Formulário de avaliação ─────────────────────────────── */
function initFormAvaliacao() {
  const form = document.getElementById('formAvaliacao');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Solicitação enviada!';
      btn.style.background = '#2ecc71';
      form.reset();
      mostrarToast('🎉 Entraremos em contato em breve!');
      setTimeout(() => {
        btn.textContent = 'Solicitar avaliação gratuita';
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1800);
  });
}

/* ─── Animações de entrada ────────────────────────────────── */
const observerFade = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observerFade.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

function initAnimacoes() {
  document.querySelectorAll('.dif-card, .dep-card, .section-header').forEach(el => {
    el.classList.add('fade-in');
    observerFade.observe(el);
  });
}

/* ─── Contador animado ────────────────────────────────────── */
function animarContadores() {
  const els = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const fim = +el.dataset.count;
      const dur = 1800;
      const ini = performance.now();
      const tick = now => {
        const p  = Math.min((now - ini) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * fim) + (el.dataset.suffix || '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(el => io.observe(el));
}

/* ─── Scroll suave para links âncora ─────────────────────── */
function initScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) {
        e.preventDefault();
        alvo.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Popula dados iniciais
  estado.veiculosFiltrados = [...VEICULOS];

  initNavbar();
  initHero();
  renderDestaques();
  initFiltros();
  aplicarFiltros();
  initModal();
  initFormAvaliacao();
  initAnimacoes();
  animarContadores();
  initScrollLinks();
});