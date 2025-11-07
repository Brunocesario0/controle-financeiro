// =============== CONFIGURAÇÃO DE USUÁRIOS ===============
const STORAGE_USERS = "usuarios_casal";
let usuarios = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];

// Cria o master fixo se não existir
if (!usuarios.find(u => u.email === "bruno.cesario@outlook.com")) {
  usuarios.push({
    email: "bruno.cesario@outlook.com",
    senha: "zxasQW!@",
    tipo: "master"
  });
  localStorage.setItem(STORAGE_USERS, JSON.stringify(usuarios));
}

function salvarUsuarios() {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(usuarios));
}

// =============== LOGIN ===============
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  } else {
    iniciarApp();
  }
});

function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const msg = document.getElementById("mensagem");

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    msg.textContent = "E-mail ou senha incorretos.";
    msg.style.color = "red";
    return;
  }

  localStorage.setItem("usuarioAtivo", JSON.stringify(user));
  window.location.href = "main.html";
}

function logout() {
  localStorage.removeItem("usuarioAtivo");
  window.location.href = "index.html";
}

// =============== PAINEL PRINCIPAL ===============
function iniciarApp() {
  const user = JSON.parse(localStorage.getItem("usuarioAtivo"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("usuario-logado").textContent =
    `${user.email} (${user.tipo})`;

  // Se for master, exibe a seção de gerenciamento de usuários
  if (user.tipo === "master") {
    document.getElementById("secao-usuarios").style.display = "block";
    carregarUsuarios();
  }

  // Carregar o app financeiro
  carregarAppFinanceiro(user);
}

// =============== GERENCIAMENTO DE USUÁRIOS ===============
function carregarUsuarios() {
  const tbody = document.querySelector("#tabela-usuarios tbody");
  tbody.innerHTML = "";
  usuarios.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.tipo}</td>
      <td>
        ${u.tipo !== "master" ? `<button onclick="removerUsuario('${u.email}')">🗑️</button>` : ""}
      </td>
    `;
    tbody.appendChild(tr);
  });

  const formNovo = document.getElementById("form-novo-usuario");
  formNovo.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("novo-email").value.trim();
    const senha = document.getElementById("nova-senha").value.trim();
    const tipo = document.getElementById("novo-tipo").value;

    if (!email || !senha) return alert("Preencha todos os campos!");

    if (usuarios.find(u => u.email === email)) {
      alert("Usuário já existe!");
      return;
    }

    usuarios.push({ email, senha, tipo });
    salvarUsuarios();
    formNovo.reset();
    carregarUsuarios();
  };
}

function removerUsuario(email) {
  if (!confirm("Remover este usuário?")) return;
  usuarios = usuarios.filter(u => u.email !== email);
  salvarUsuarios();
  carregarUsuarios();
}

// =============== APP FINANCEIRO ===============
function carregarAppFinanceiro(user) {
  fetch("app.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("app-container").innerHTML = html;
      initFinanceApp(user);
    });
}
