document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("usuarioAtivo"));
  const path = window.location.pathname.split("/").pop();

  // Página de login
  if (path === "login.html" || path === "") {
    document.getElementById("btnLogin").addEventListener("click", login);
  } else {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("userInfo").textContent = `${user.email} (${user.tipo})`;
    document.getElementById("btnLogout").addEventListener("click", logout);
  }
});

const usuarios = [
  { email: "bruno.cesario@outlook.com", senha: "zxasQW!@", tipo: "master" },
];

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();
  const msg = document.getElementById("loginMsg");

  const allUsers = JSON.parse(localStorage.getItem("usuarios")) || usuarios;
  const user = allUsers.find(u => u.email === email && u.senha === senha);

  if (!user) {
    msg.textContent = "❌ E-mail ou senha incorretos!";
    msg.style.color = "red";
    return;
  }

  localStorage.setItem("usuarioAtivo", JSON.stringify(user));
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("usuarioAtivo");
  window.location.href = "login.html";
}

// Permite apenas que o master crie novos usuários
function criarUsuario(email, senha, tipo) {
  const user = JSON.parse(localStorage.getItem("usuarioAtivo"));
  if (!user || user.tipo !== "master") {
    alert("Apenas o usuário master pode criar novos usuários.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("usuarios")) || usuarios;
  users.push({ email, senha, tipo });
  localStorage.setItem("usuarios", JSON.stringify(users));
  alert(`Usuário ${email} criado como ${tipo}`);
}
