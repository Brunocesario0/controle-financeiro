// ===== CONFIGURAÇÃO MASTER FIXA =====
const MASTER = {
  email: "bruno.cesario@outlook.com",
  senha: "zxasQW!@",
  tipo: "master"
};

// ===== FUNÇÕES AUXILIARES =====
function getUsers() {
  const stored = JSON.parse(localStorage.getItem("usuarios")) || [];
  const masterExists = stored.some(u => u.email === MASTER.email);
  if (!masterExists) stored.push(MASTER);
  localStorage.setItem("usuarios", JSON.stringify(stored));
  return stored;
}

function saveUsers(users) {
  localStorage.setItem("usuarios", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

// ===== LOGIN =====
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();
      const msg = document.getElementById("login-msg");

      const users = getUsers();
      const user = users.find(u => u.email === email && u.senha === senha);

      if (user) {
        localStorage.setItem("usuarioLogado", JSON.stringify(user));
        msg.style.color = "green";
        msg.textContent = "✅ Login realizado com sucesso!";
        setTimeout(() => (window.location.href = "inserir.html"), 1000);
      } else {
        msg.style.color = "red";
        msg.textContent = "❌ Usuário ou senha incorretos.";
      }
    });
  }

  // ===== PROTEÇÃO DE PÁGINAS =====
  const protectedPages = ["inserir.html", "graficos.html", "usuarios.html", "backup.html"];
  const currentPage = window.location.pathname.split("/").pop();
  if (protectedPages.includes(currentPage)) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "index.html";
      });
    }

    // Bloqueio de acesso de usuários comuns à tela de gerenciamento
    if (currentPage === "usuarios.html" && user.tipo !== "master") {
      document.getElementById("admin-only").innerHTML = "<p>⚠️ Acesso restrito ao usuário master.</p>";
    }
  }

  // ===== GERENCIAMENTO DE USUÁRIOS =====
  const userForm = document.getElementById("user-form");
  if (userForm) {
    userForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = document.getElementById("novo-email").value.trim();
      const senha = document.getElementById("nova-senha").value.trim();
      const tipo = document.getElementById("tipo").value;

      const users = getUsers();
      if (users.find(u => u.email === email)) {
        alert("⚠️ Usuário já existe!");
        return;
      }

      users.push({ email, senha, tipo });
      saveUsers(users);
      alert("✅ Usuário criado com sucesso!");
      userForm.reset();
    });
  }

  // ===== BACKUP =====
  const btnBackup = document.getElementById("baixar-backup");
  if (btnBackup) {
    btnBackup.addEventListener("click", () => {
      const dados = localStorage.getItem("dadosFinanceiros") || "[]";
      const blob = new Blob([dados], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup_financeiro.json";
      a.click();
    });
  }

  const importar = document.getElementById("importar-backup");
  if (importar) {
    importar.addEventListener("change", e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        localStorage.setItem("dadosFinanceiros", event.target.result);
        document.getElementById("status").textContent = "✅ Backup importado com sucesso!";
      };
      reader.readAsText(file);
    });
  }
});
