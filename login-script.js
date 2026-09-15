let roleSelecionada = 'admin';

// 1. Redireciona se já estiver logado (usando o LocalStorage padrão do navegador)
const sessaoStr = localStorage.getItem('ae_sessao');
if (sessaoStr) {
  const sessao = JSON.parse(sessaoStr);
  window.location.href = sessao.role === 'admin' ? 'admin.html' : 'cliente.html';
}

function selecionarRole(role) {
  roleSelecionada = role;
  document.getElementById('tabAdmin').classList.toggle('ativo', role === 'admin');
  document.getElementById('tabCliente').classList.toggle('ativo', role === 'cliente');
  document.getElementById('erroMsg').classList.remove('show');
}

// Preenche admin por padrão
selecionarRole('admin');

function toggleSenha() {
  const input = document.getElementById('inputSenha');
  const btn   = document.getElementById('btnMostrarSenha');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁';
}

// 2. Função principal de Login integrada com PHP/MySQL
function fazerLogin(e) {
  e.preventDefault();
  const email = document.getElementById('inputEmail').value.trim();
  const senha = document.getElementById('inputSenha').value;
  const btn   = document.getElementById('btnEntrar');
  const erro  = document.getElementById('erroMsg');

  // Efeito visual de carregamento
  btn.disabled = true;
  document.getElementById('btnTexto').textContent = 'Verificando...';
  erro.classList.remove('show');

  // Faz a requisição ao servidor
  fetch('api_login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, senha: senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      const user = data.usuario;

      // Valida se a aba escolhida (Admin/Cliente) bate com o perfil real do banco
      if (user.role !== roleSelecionada) {
        erro.textContent = `Este e-mail é de ${user.role === 'admin' ? 'um Administrador' : 'um Cliente'}. Selecione o perfil correto.`;
        erro.classList.add('show');
        btn.disabled = false;
        document.getElementById('btnTexto').textContent = 'Entrar';
        return;
      }

      // Salva a sessão confirmada no navegador
      localStorage.setItem('ae_sessao', JSON.stringify(user));
      
      document.getElementById('btnTexto').textContent = '✓ Redirecionando...';
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'cliente.html';
      }, 600);

    } else {
      // Exibe a mensagem de erro que veio do PHP (ex: "Senha incorreta" ou "Usuário não encontrado")
      erro.textContent = data.mensagem;
      erro.classList.add('show');
      btn.disabled = false;
      document.getElementById('btnTexto').textContent = 'Entrar';
    }
  })
  .catch(error => {
    console.error("Erro na requisição:", error);
    erro.textContent = "Erro ao conectar com o servidor.";
    erro.classList.add('show');
    btn.disabled = false;
    document.getElementById('btnTexto').textContent = 'Entrar';
  });
}


/* ─── CADASTRO DE CLIENTES ───────────────────────────────── */
function abrirModalCadastro() {
  const modal = document.getElementById('modalCadastro');
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
}

function fecharModalCadastro() {
  document.getElementById('modalCadastro').style.display = 'none';
}

function fazerCadastro(e) {
  e.preventDefault();
  
  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;
  const btn = document.getElementById('btnCadastrar');
  const erro = document.getElementById('erroCadMsg');

  // Efeito de loading
  btn.disabled = true;
  btn.textContent = '⏳ Criando conta...';
  erro.style.display = 'none';

  // Envia para o PHP que criamos no passo anterior
  fetch('api_cadastrar_cliente.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      alert('✅ ' + data.mensagem + ' Faça o login para acessar a vitrine.');
      fecharModalCadastro();
      
      // Um toque de mestre: já preenche os campos do login para o cliente!
      selecionarRole('cliente');
      document.getElementById('inputEmail').value = email;
      document.getElementById('inputSenha').value = senha;
      document.getElementById('cadSenha').value = ''; 
      
    } else {
      erro.textContent = '❌ ' + data.mensagem;
      erro.style.display = 'block';
    }
  })
  .catch(err => {
    console.error(err);
    erro.textContent = '❌ Erro ao conectar com o servidor.';
    erro.style.display = 'block';
  })
  .finally(() => {
    btn.disabled = false;
    btn.textContent = 'Cadastrar e Entrar';
  });
}