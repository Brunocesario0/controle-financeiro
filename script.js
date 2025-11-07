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
  data.push({ user: currentUser.username, type, value, category, date });
  localStorage.setItem(key, JSON.stringify(data));
  alert("Transação adicionada!");
  renderTables();
}

function renderTables() {
  const key = `finance_${currentUser.username}`;
  const data = JSON.parse(localStorage.getItem(key)) || [];

  const mainBody = document.querySelector("#main-table tbody");
  const investBody = document.querySelector("#invest-table tbody");
  mainBody.innerHTML = "";
  investBody.innerHTML = "";

  data.forEach(d => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.user}</td>
      <td>${d.type}</td>
      <td class="${d.value >= 0 ? 'value-positive' : 'value-negative'}">R$ ${d.value.toFixed(2)}</td>
      <td>${d.category}</td>
      <td>${d.date}</td>
    `;

    if (d.type === "receita" || d.type === "despesa") {
      mainBody.appendChild(row);
    } else if (d.type === "investimento" || d.type === "saque") {
      investBody.appendChild(row);
    }
  });
}

function showDataScreen() {
  hideAll();
  document.getElementById("data-screen").classList.remove("hidden");
  renderTables();
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

function showBackupScreen() {
  hideAll();
  document.getElementById("backup-screen").classList.remove("hidden");
}

function exportBackup() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const dataKey = `finance_${currentUser.username}`;
  const financeData = JSON.parse(localStorage.getItem(dataKey)) || [];

  const backup = {
    users,
    financeData
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_finance_app.json";
  a.click();
  URL.revokeObjectURL(url);
}

function restoreBackup() {
  try {
    const input = document.getElementById("restore-input").value;
    const backup = JSON.parse(input);

    if (backup.users) localStorage.setItem("users", JSON.stringify(backup.users));
    if (backup.financeData && currentUser) {
      const key = `finance_${currentUser.username}`;
      localStorage.setItem(key, JSON.stringify(backup.financeData));
    }

    alert("Backup restaurado com sucesso!");
  } catch (e) {
    alert("Erro ao restaurar backup. Verifique o formato.");
  }
}

function exportToExcel() {
  const key = `finance_${currentUser.username}`;
  const data = JSON.parse(localStorage.getItem(key)) || [];

  let csv = "Tipo,Valor,Categoria,Data\n";
  data.forEach(d => {
    csv += `${d.type},${d.value},${d.category},${d.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dados_financeiros.csv";
  a.click();
  URL.revokeObjectURL(url);
}

showLogin();