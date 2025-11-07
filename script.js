// script.js - Versão com controle de último login e bloqueio de usuários

/* ---------- CONFIGURAÇÕES ---------- */
const MASTER = { email: "bruno.cesario@outlook.com", senha: "zxasQW!@", tipo: "master" };
const USERS_KEY = "cf_usuarios_v2";
const SESSION_KEY = "cf_sessao_v1";
const DATA_KEY = "cf_dados_v1";

/* ---------- HELPERS ---------- */
function loadUsers() {
  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  if (!users.some(u => u.email === MASTER.email)) {
    users.unshift({ ...MASTER, ultimoLogin: null, bloqueado: false });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return JSON.parse(localStorage.getItem(USERS_KEY));
}
function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function getSession() { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

/* ---------- LOGIN ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  if (path === "" || path === "index.html" || path === "login.html") {
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const msg = document.getElementById("login-msg");
        const users = loadUsers();
        const user = users.find(u => u.email === email && u.senha === senha);

        if (!user) {
          msg.style.color = "red";
          msg.textContent = "Usuário ou senha inválidos.";
          return;
        }

        if (user.bloqueado) {
          msg.style.color = "red";
          msg.textContent = "Usuário bloqueado. Contate o administrador.";
          return;
        }

        // Atualiza data de último login
        user.ultimoLogin = new Date().toLocaleString("pt-BR");
        saveUsers(users);

        setSession(user);
        msg.style.color = "green";
        msg.textContent = "Login efetuado! Redirecionando...";
        setTimeout(() => window.location.href = "inserir.html", 600);
      });
    }
    return;
  }

  /* ---------- PROTEÇÃO DAS PÁGINAS ---------- */
  const protectedPages = ["inserir.html", "graficos.html", "usuarios.html", "backup.html"];
  if (protectedPages.includes(path)) {
    const sess = getSession();
    if (!sess) {
      window.location.href = "index.html";
      return;
    }
    setupCommonUI(sess);
    if (path === "usuarios.html") setupUsersPage(sess);
    if (path === "backup.html") setupBackupPage(sess);
  }
});

/* ---------- UI COMUM ---------- */
function setupCommonUI(sess) {
  const btnLogout = document.getElementById("logout");
  if (btnLogout) btnLogout.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  const userInfo = document.getElementById("userInfo");
  if (userInfo) userInfo.textContent = `${sess.email} (${sess.tipo})`;

  const btnGerenciar = document.getElementById("btnGerenciarUsuarios");
  if (btnGerenciar) btnGerenciar.style.display = (sess.tipo === "master") ? "inline-block" : "none";
}

/* ---------- PÁGINA DE USUÁRIOS ---------- */
function setupUsersPage(sess) {
  const form = document.getElementById("user-form");
  const tbody = document.querySelector("#user-table tbody");
  renderUsersTable();

  // Criar novo usuário
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (sess.tipo !== "master") { alert("Apenas o usuário master pode criar novos usuários."); return; }
      const email = document.getElementById("new-email").value.trim();
      const senha = document.getElementById("new-password").value.trim();
      const role = document.getElementById("new-role").value;
      if (!email || !senha) return alert("Preencha todos os campos.");

      const users = loadUsers();
      if (users.some(u => u.email === email)) return alert("Usuário já cadastrado.");

      users.push({ email, senha, tipo: role, ultimoLogin: null, bloqueado: false });
      saveUsers(users);
      form.reset();
      renderUsersTable();
      alert("Usuário criado com sucesso!");
    });
  }

  // Ações na tabela
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-index"));
    const action = btn.getAttribute("data-action");
    const users = loadUsers();
    const user = users[idx];
    if (!user) return;

    if (action === "delete") {
      if (user.email === MASTER.email) return alert("Não é possível excluir o usuário master.");
      if (confirm(`Deseja realmente excluir ${user.email}?`)) {
        users.splice(idx, 1);
        saveUsers(users);
        renderUsersTable();
      }
    }

    if (action === "toggle") {
      if (user.email === MASTER.email) return alert("Não é possível bloquear o usuário master.");
      user.bloqueado = !user.bloqueado;
      saveUsers(users);
      renderUsersTable();
    }
  });

  // Renderizar tabela
  function renderUsersTable() {
    const users = loadUsers();
    tbody.innerHTML = "";
    users.forEach((u, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.email}</td>
        <td>${u.tipo}</td>
        <td>${u.ultimoLogin ? u.ultimoLogin : "Nunca"}</td>
        <td>${u.bloqueado ? "Bloqueado" : "Ativo"}</td>
        <td>
          ${u.email !== MASTER.email ? `
            <button data-index="${i}" data-action="toggle">
              ${u.bloqueado ? "Desbloquear" : "Bloquear"}
            </button>
            <button data-index="${i}" data-action="delete">Excluir</button>
          ` : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

/* ---------- BACKUP ---------- */
function setupBackupPage(sess) {
  const btnExport = document.getElementById("baixar-backup");
  const inputImport = document.getElementById("importar-backup");
  const status = document.getElementById("status");

  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const payload = {
        usuarios: JSON.parse(localStorage.getItem(USERS_KEY)) || [],
        dados: JSON.parse(localStorage.getItem(DATA_KEY)) || []
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup_financeiro.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (inputImport) {
    inputImport.addEventListener("change", (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const obj = JSON.parse(e.target.result);
          if (obj.usuarios) localStorage.setItem(USERS_KEY, JSON.stringify(obj.usuarios));
          if (obj.dados) localStorage.setItem(DATA_KEY, JSON.stringify(obj.dados));
          if (status) status.textContent = "Backup importado com sucesso!";
          alert("Backup importado com sucesso!");
        } catch {
          alert("Arquivo inválido.");
        }
      };
      reader.readAsText(file);
    });
  }
}
