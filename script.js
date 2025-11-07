let currentUser = null;

// Inicializa usuário master padrão
(function initializeMasterUser() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const masterEmail = "bruno.cesario@outlook.com";
  const masterPassword = btoa("zxasQW!@");

  const exists = users.some(u => u.username === masterEmail);
  if (!exists) {
    users.push({
      username: masterEmail,
      password: masterPassword,
      isMaster: true,
      isBlocked: false,
      lastLogin: null
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
})();

function hideAll() {
  document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
}

function showLogin() {
  hideAll();
  document.getElementById("login-screen").classList.remove("hidden");
}

function showRegister() {
  hideAll();
  document.getElementById("register-screen").classList.remove("hidden");
}

function showDataScreen() {
  hideAll();
  document.getElementById("data-screen").classList.remove("hidden");
}

function showChart() {
  hideAll();
  document.getElementById("chart-screen").classList.remove("hidden");
  renderChart();
}

function showUserManagement() {
  if (!currentUser?.isMaster) return alert("Acesso restrito!");
  hideAll();
  document.getElementById("user-screen").classList.remove("hidden");
  renderUserList();
}

function register() {
  const username = document.getElementById("register-username").value;
  const password = btoa(document.getElementById("register-password").value);
  const isMaster = document.getElementById("register-master").checked;

  if (!username.includes("@") || !username.includes(".")) {
    alert("Digite um e-mail válido.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.username === username)) {
    alert("Usuário já existe!");
    return;
  }

  users.push({ username, password, isMaster, isBlocked: false, lastLogin: null });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Usuário registrado!");
  showLogin();
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = btoa(document.getElementById("login-password").value);
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    alert("Credenciais inválidas!");
    return;
  }

  if (user.isBlocked) {
    alert("Usuário bloqueado.");
    return;
  }

  user.lastLogin = new Date().toISOString();
  localStorage.setItem("users", JSON.stringify(users));
  currentUser = user;
  showDataScreen();
}

function addTransaction() {
  const type = document.getElementById("type").value;
  const value = parseFloat(document.getElementById("value").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const key = `finance_${currentUser.username}`;
  const data = JSON.parse(localStorage.getItem(key)) || [];
  data.push({ type, value, category, date });
  localStorage.setItem(key, JSON.stringify(data));
  alert("Transação adicionada!");
}

function renderChart() {
  const key = `finance_${currentUser.username}`;
  const data = JSON.parse(localStorage.getItem(key)) || [];

  const receitas = data.filter(d => d.type === "receita").reduce((sum, d) => sum + d.value, 0);
  const despesas = data.filter(d => d.type === "despesa").reduce((sum, d) => sum + d.value, 0);

  new Chart(document.getElementById("financeChart"), {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });
}

function createUserFromMaster() {
  const email = document.getElementById("new-user-email").value;
  const password = btoa(document.getElementById("new-user-password").value);
  const isMaster = document.getElementById("new-user-master").checked;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.username === email)) {
    alert("Usuário já existe!");
    return;
  }

  users.push({ username: email, password, isMaster, isBlocked: false, lastLogin: null });
  localStorage.setItem("users", JSON.stringify(users));
  renderUserList();
  alert("Usuário criado!");
}

function deleteUser(email) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.username !== email);
  localStorage.setItem("users", JSON.stringify(users));
  renderUserList();
}

function toggleBlockUser(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === email);
  if (user) {
    user.isBlocked = !user.isBlocked;
    localStorage.setItem("users", JSON.stringify(users));
    renderUserList();
  }
}

function renderUserList() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const list = document.getElementById("user-list");
  list.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${u.username}</strong> ${u.isMaster ? "(Master)" : ""}
      <br>Status: ${u.isBlocked ? "Bloqueado" : "Ativo"}
      <br>Último login: ${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Nunca"}
      <br>
      <button onclick="deleteUser('${u.username}')">Excluir</button>
      <button onclick="toggleBlockUser('${u.username}')">
        ${u.isBlocked ? "Desbloquear" : "Bloquear"}
      </button>
    `;
    list.appendChild(li);
  });
}

showLogin();