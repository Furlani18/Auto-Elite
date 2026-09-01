let roleSelecionada = 'admin';

// Redireciona se já logado
const sessao = DB.getSessao();
if (sessao) {
  window.location.href = sessao.role === 'admin' ? 'admin.html' : 'cliente.html';
}

function selecionarRole(role) {
  roleSelecionada = role;
  document.getElementById('tabAdmin').classList.toggle('ativo', role === 'admin');
  document.getElementById('tabCliente').classList.toggle('ativo', role === 'cliente');

  // Preenche demo
  const credEl = document.getElementById('demoCred');
  if (role === 'admin') {
    credEl.innerHTML = '<strong>E-mail:</strong> admin@autoelite.com<br><strong>Senha:</strong> admin123';
    document.getElementById('inputEmail').value = 'admin@autoelite.com';
    document.getElementById('inputSenha').value = 'admin123';
  } else {
    credEl.innerHTML = '<strong>E-mail:</strong> cliente@email.com<br><strong>Senha:</strong> cliente123';
    document.getElementById('inputEmail').value = 'cliente@email.com';
    document.getElementById('inputSenha').value = 'cliente123';
  }
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

function fazerLogin(e) {
  e.preventDefault();
  const email = document.getElementById('inputEmail').value.trim();
  const senha = document.getElementById('inputSenha').value;
  const btn   = document.getElementById('btnEntrar');
  const erro  = document.getElementById('erroMsg');

  btn.disabled = true;
  document.getElementById('btnTexto').textContent = 'Verificando...';
  erro.classList.remove('show');

  setTimeout(() => {
    const user = DB.login(email, senha);

    if (!user) {
      erro.classList.add('show');
      btn.disabled = false;
      document.getElementById('btnTexto').textContent = 'Entrar';
      return;
    }

    if (user.role !== roleSelecionada) {
      erro.textContent = `Este e-mail é de ${user.role === 'admin' ? 'um Administrador' : 'um Cliente'}. Selecione o perfil correto.`;
      erro.classList.add('show');
      btn.disabled = false;
      document.getElementById('btnTexto').textContent = 'Entrar';
      return;
    }

    DB.setSessao(user);
    document.getElementById('btnTexto').textContent = '✓ Redirecionando...';
    setTimeout(() => {
      window.location.href = user.role === 'admin' ? 'admin.html' : 'cliente.html';
    }, 600);
  }, 800);
}
