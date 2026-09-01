// ============================================================
//  AutoElite — Banco de dados (localStorage)
//  Compartilhado entre login, admin e cliente
// ============================================================

const DB = {

  // ── Usuários ─────────────────────────────────────────────
  USUARIOS_KEY: 'ae_usuarios',
  SESSAO_KEY:   'ae_sessao',
  VEICULOS_KEY: 'ae_veiculos',
  LEADS_KEY:    'ae_leads',

  _usuariosDefault: [
    {
      id: 1,
      nome: 'Administrador',
      email: 'admin@autoelite.com',
      senha: 'admin123',
      role: 'admin',
      avatar: 'AD',
      criadoEm: '2024-01-01'
    },
    {
      id: 2,
      nome: 'Carlos Silva',
      email: 'cliente@email.com',
      senha: 'cliente123',
      role: 'cliente',
      avatar: 'CS',
      criadoEm: '2024-03-15'
    },
    {
      id: 3,
      nome: 'Maria Fernanda',
      email: 'maria@email.com',
      senha: 'maria123',
      role: 'cliente',
      avatar: 'MF',
      criadoEm: '2024-05-20'
    }
  ],

  // ── Veículos padrão (seed) ────────────────────────────────
  _veiculosDefault: [
    {
      id: 1, nome: 'BMW Série 3 330i', marca: 'BMW', tipo: 'Sedan',
      ano: 2024, km: 12000, preco: 289900, combustivel: 'Gasolina',
      cambio: 'Automático', cor: 'Preto', potencia: '258 cv',
      destaque: true, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      descricao: 'Desempenho esportivo aliado ao requinte alemão. Motor TwinPower Turbo, painel digital e sistema iDrive.',
      caracteristicas: 'Teto solar panorâmico, Bancos em couro, Câmera 360°, Carregamento wireless, Head-up display',
      criadoEm: '2024-11-01', visualizacoes: 142
    },
    {
      id: 2, nome: 'Mercedes-Benz GLC 300', marca: 'Mercedes-Benz', tipo: 'SUV',
      ano: 2024, km: 8500, preco: 389900, combustivel: 'Gasolina',
      cambio: 'Automático', cor: 'Prata', potencia: '258 cv',
      destaque: true, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      descricao: 'Sofisticação e tecnologia em cada detalhe. Interior luxuoso com MBUX e assistência ativa ao condutor.',
      caracteristicas: 'MBUX com IA, Suspensão air body, Ambient light 64 cores, Piloto automático adaptativo',
      criadoEm: '2024-11-10', visualizacoes: 98
    },
    {
      id: 3, nome: 'Porsche Cayenne', marca: 'Porsche', tipo: 'SUV',
      ano: 2023, km: 21000, preco: 529900, combustivel: 'Gasolina',
      cambio: 'Automático', cor: 'Branco', potencia: '340 cv',
      destaque: false, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      descricao: 'O SUV esportivo por excelência. DNA Porsche com conforto para o dia a dia.',
      caracteristicas: 'PASM adaptativo, Banco 18 vias, PCM com GPS, Bose Surround Sound',
      criadoEm: '2024-10-15', visualizacoes: 215
    },
    {
      id: 4, nome: 'Audi A5 Sportback', marca: 'Audi', tipo: 'Hatch',
      ano: 2024, km: 5200, preco: 319900, combustivel: 'Gasolina',
      cambio: 'Automático', cor: 'Cinza', potencia: '249 cv',
      destaque: false, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      descricao: 'Design progressivo e quattro permanente. Virtual Cockpit Plus e matrix LED.',
      caracteristicas: 'Quattro all-wheel drive, Virtual Cockpit Plus, Matrix LED, Bang & Olufsen',
      criadoEm: '2024-12-01', visualizacoes: 77
    },
    {
      id: 5, nome: 'Tesla Model 3 LR', marca: 'Tesla', tipo: 'Sedan',
      ano: 2024, km: 6700, preco: 319900, combustivel: 'Elétrico',
      cambio: 'Automático', cor: 'Branco', potencia: '498 cv',
      destaque: true, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      descricao: 'Autopilot, 629 km de autonomia e aceleração de 3.1s até 100 km/h.',
      caracteristicas: 'Autopilot, 629 km autonomia, Tela 15.4\", OTA updates, Supercharger V3',
      criadoEm: '2024-12-05', visualizacoes: 310
    },
    {
      id: 6, nome: 'Volvo XC60 B5', marca: 'Volvo', tipo: 'SUV',
      ano: 2023, km: 18000, preco: 409900, combustivel: 'Híbrido',
      cambio: 'Automático', cor: 'Azul', potencia: '250 cv',
      destaque: true, status: 'reservado',
      imagem: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
      descricao: 'Segurança escandinava com design minimalista. Mild hybrid com tração integral.',
      caracteristicas: 'Pilot Assist, Harman Kardon 600W, Google nativo, 360° câmera',
      criadoEm: '2024-09-20', visualizacoes: 189
    },
    {
      id: 7, nome: 'Honda Civic Type R', marca: 'Honda', tipo: 'Hatch',
      ano: 2024, km: 1200, preco: 299900, combustivel: 'Gasolina',
      cambio: 'Manual', cor: 'Vermelho', potencia: '330 cv',
      destaque: false, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&q=80',
      descricao: 'O hatch mais rápido de Nürburgring. Bancos Alcantara e tração dianteira visceral.',
      caracteristicas: 'Banco Alcantara, Brembo 6 pistões, Rev match, Log mode',
      criadoEm: '2024-12-10', visualizacoes: 403
    },
    {
      id: 8, nome: 'Porsche 911 Carrera S', marca: 'Porsche', tipo: 'Esportivo',
      ano: 2024, km: 2100, preco: 849900, combustivel: 'Gasolina',
      cambio: 'Automático', cor: 'Prata', potencia: '450 cv',
      destaque: true, status: 'disponivel',
      imagem: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
      descricao: 'O esportivo de referência há 60 anos. Boxer 3.0T biturbo, PDK 8 marchas.',
      caracteristicas: 'PDK 8 velocidades, PASM+, Sport Chrono, Burmester High-End',
      criadoEm: '2024-11-25', visualizacoes: 521
    }
  ],

  _leadsDefault: [
    { id: 1, nome: 'João Pereira', email: 'joao@email.com', tel: '(11) 98888-1111', veiculoId: 3, mensagem: 'Interesse no Cayenne', data: '2024-12-10', status: 'novo' },
    { id: 2, nome: 'Ana Costa',   email: 'ana@email.com',  tel: '(11) 97777-2222', veiculoId: 5, mensagem: 'Gostaria de agendar test drive', data: '2024-12-11', status: 'contato' },
    { id: 3, nome: 'Paulo Lima',  email: 'paulo@email.com', tel: '(11) 96666-3333', veiculoId: 8, mensagem: 'Qual o valor de entrada?', data: '2024-12-12', status: 'negociando' },
    { id: 4, nome: 'Sofia Ramos', email: 'sofia@email.com', tel: '(11) 95555-4444', veiculoId: 1, mensagem: 'Tem financiamento?', data: '2024-12-13', status: 'novo' },
  ],

  // ── Init ──────────────────────────────────────────────────
  init() {
    if (!localStorage.getItem(this.USUARIOS_KEY))
      localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(this._usuariosDefault));
    if (!localStorage.getItem(this.VEICULOS_KEY))
      localStorage.setItem(this.VEICULOS_KEY, JSON.stringify(this._veiculosDefault));
    if (!localStorage.getItem(this.LEADS_KEY))
      localStorage.setItem(this.LEADS_KEY, JSON.stringify(this._leadsDefault));
  },

  // ── Usuários ──────────────────────────────────────────────
  getUsuarios()  { return JSON.parse(localStorage.getItem(this.USUARIOS_KEY) || '[]'); },
  saveUsuarios(u) { localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(u)); },

  login(email, senha) {
    const users = this.getUsuarios();
    return users.find(u => u.email === email && u.senha === senha) || null;
  },

  setSessao(user) {
    localStorage.setItem(this.SESSAO_KEY, JSON.stringify({
      id: user.id, nome: user.nome, email: user.email,
      role: user.role, avatar: user.avatar
    }));
  },

  getSessao() {
    return JSON.parse(localStorage.getItem(this.SESSAO_KEY) || 'null');
  },

  logout() { localStorage.removeItem(this.SESSAO_KEY); },

  // ── Veículos ──────────────────────────────────────────────
  getVeiculos()     { return JSON.parse(localStorage.getItem(this.VEICULOS_KEY) || '[]'); },
  saveVeiculos(v)   { localStorage.setItem(this.VEICULOS_KEY, JSON.stringify(v)); },

  getVeiculoById(id) { return this.getVeiculos().find(v => v.id === id) || null; },

  addVeiculo(dados) {
    const lista = this.getVeiculos();
    const novoId = lista.length ? Math.max(...lista.map(v => v.id)) + 1 : 1;
    const novo = {
      ...dados,
      id: novoId,
      criadoEm: new Date().toISOString().slice(0, 10),
      visualizacoes: 0,
      status: dados.status || 'disponivel'
    };
    lista.push(novo);
    this.saveVeiculos(lista);
    return novo;
  },

  updateVeiculo(id, dados) {
    const lista = this.getVeiculos();
    const idx   = lista.findIndex(v => v.id === id);
    if (idx === -1) return null;
    lista[idx] = { ...lista[idx], ...dados };
    this.saveVeiculos(lista);
    return lista[idx];
  },

  deleteVeiculo(id) {
    const lista = this.getVeiculos().filter(v => v.id !== id);
    this.saveVeiculos(lista);
  },

  incrementarView(id) {
    const v = this.getVeiculoById(id);
    if (v) this.updateVeiculo(id, { visualizacoes: (v.visualizacoes || 0) + 1 });
  },

  // ── Leads ─────────────────────────────────────────────────
  getLeads()       { return JSON.parse(localStorage.getItem(this.LEADS_KEY) || '[]'); },
  saveLeads(l)     { localStorage.setItem(this.LEADS_KEY, JSON.stringify(l)); },

  addLead(dados) {
    const lista  = this.getLeads();
    const novoId = lista.length ? Math.max(...lista.map(l => l.id)) + 1 : 1;
    const novo   = { ...dados, id: novoId, data: new Date().toISOString().slice(0,10), status: 'novo' };
    lista.push(novo);
    this.saveLeads(lista);
    return novo;
  },

  updateLeadStatus(id, status) {
    const lista = this.getLeads();
    const idx   = lista.findIndex(l => l.id === id);
    if (idx !== -1) { lista[idx].status = status; this.saveLeads(lista); }
  },

  deleteLead(id) {
    this.saveLeads(this.getLeads().filter(l => l.id !== id));
  },

  // ── Stats para dashboard ──────────────────────────────────
  getStats() {
    const veiculos  = this.getVeiculos();
    const leads     = this.getLeads();
    return {
      total:        veiculos.length,
      disponiveis:  veiculos.filter(v => v.status === 'disponivel').length,
      reservados:   veiculos.filter(v => v.status === 'reservado').length,
      vendidos:     veiculos.filter(v => v.status === 'vendido').length,
      valorEstoque: veiculos.filter(v => v.status !== 'vendido').reduce((s, v) => s + v.preco, 0),
      totalLeads:   leads.length,
      leadsNovos:   leads.filter(l => l.status === 'novo').length,
      visualizacoes:veiculos.reduce((s, v) => s + (v.visualizacoes || 0), 0),
      porTipo:      veiculos.reduce((acc, v) => { acc[v.tipo] = (acc[v.tipo]||0)+1; return acc; }, {}),
      porCombust:   veiculos.reduce((acc, v) => { acc[v.combustivel] = (acc[v.combustivel]||0)+1; return acc; }, {}),
      maisVistos:   [...veiculos].sort((a,b) => (b.visualizacoes||0)-(a.visualizacoes||0)).slice(0,5)
    };
  },

  // ── Utilitários ───────────────────────────────────────────
  formatarPreco: v => 'R$ ' + (+v).toLocaleString('pt-BR', { minimumFractionDigits: 0 }),
  formatarKm:    v => (+v).toLocaleString('pt-BR') + ' km'
};

// Inicializa ao carregar
DB.init();