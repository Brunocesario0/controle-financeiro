// === Controle de Login e Usuários Locais ===
// v3.0 - Controle de acesso local + master admin + gestão de usuários

const USERS_KEY = "cf_users_v3";
const SESSION_KEY = "cf_session_v3";

// Usuário master fixo
const MASTER_EMAIL = "bruno.cesario@outlook.com";
const MASTER_PASSWORD = "zxasQW!@";

let usuarios = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
let sessaoAtual = JSON.parse(localStorage.getItem(SESSION_KEY)) || null;

// === Salvar dados de usuários ===
function salvarUsuarios() {
  localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

// === Criar usuário ===
function criarUsuario(email, senha, tipo = "usuario") {
  if (!email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }
  if (usuarios.some(u => u.email === email)) {
    alert("Este e-mail já está cadastrado.");
    return;
  }
  usuarios.push({ email, senha, tipo });
  salvarUsuarios();
  alert("Usuário criado com sucesso!");
  atualizarTabelaUsuarios();
}

// === Login ===
function login(email, senha) {
  if (email === MASTER_EMAIL && senha === MASTER_PASSWORD) {
    sessaoAtual = { email, tipo: "master" };
  } else {
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    if (!user) {
      alert("Usuário ou senha incorretos.");
      return false;
    }
    sessaoAtual = { email, tipo: user.tipo };
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessaoAtual));
  carregarInterface();
  return true;
}

// === Logout ===
function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessaoAtual = null;
  carregarInterface();
}

// === Interface ===
function carregarInterface() {
  const loginScreen = document.getElementById("login-screen");
  const mainApp = document.getElementById("main-app");
  const userEmail = document.getElementById("user-email");
  const manageUsersBtn = document.getElementById("manage-users-btn");

  if (sessaoAtual) {
    loginScreen.style.display = "none";
    mainApp.style.display = "block";
    userEmail.textContent = sessaoAtual.email;

    // Master e administradores podem gerenciar usuários
    if (sessaoAtual.tipo === "master" || sessaoAtual.tipo === "admin") {
      manageUsersBtn.style.display = "inline-block";
    } else {
      manageUsersBtn.style.display = "none";
    }
  } else {
    loginScreen.style.display = "flex";
    mainApp.style.display = "none";
  }
}

// === Modal de Gerenciamento de Usuários ===
const modal = document.getElementById("user-modal");
const abrirModalBtn = document.getElementById("manage-users-btn");
const fecharModalBtn = document.getElementById("close-modal");
const formNovoUsuario = document.getElementById("user-form");
const tabelaUsuarios = document.getElementById("user-table").querySelector("tbody");

abrirModalBtn?.addEventListener("click", () => {
  modal.style.display = "block";
  atualizarTabelaUsuarios();
});

fecharModalBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

formNovoUsuario?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("novo-email").value.trim();
  const senha = document.getElementById("nova-senha").value.trim();
  const tipo = document.getElementById("novo-tipo").value;
  criarUsuario(email, senha, tipo);
  formNovoUsuario.reset();
});

// === Atualiza tabela de usuários no modal ===
function atualizarTabelaUsuarios() {
  if (!tabelaUsuarios) return;
  tabelaUsuarios.innerHTML = "";

  const lista = [...usuarios];
  for (const u of lista) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.tipo}</td>
      <td>
        ${(sessaoAtual.tipo === "master") ? 
          `<button onclick="removerUsuario('${u.email}')">🗑️</button>` : ""}
      </td>
    `;
    tabelaUsuarios.appendChild(tr);
  }
}

// === Remover usuário (somente master) ===
function removerUsuario(email) {
  if (!confirm(`Remover usuário ${email}?`)) return;
  usuarios = usuarios.filter(u => u.email !== email);
  salvarUsuarios();
  atualizarTabelaUsuarios();
}

// === Eventos de Login ===
document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-password").value.trim();
  login(email, senha);
});

document.getElementById("logout-btn")?.addEventListener("click", logout);

// === Inicialização ===
document.addEventListener("DOMContentLoaded", carregarInterface);
