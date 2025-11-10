// Usuários fixos
const users = [
  { email: "ana@email.com", password: "ana123" },
  { email: "bruno@email.com", password: "bruno123" }
];

// Login
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    alert("Credenciais inválidas.");
  }
}

// Dashboard
if (window.location.pathname.includes("dashboard.html")) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  if (!user) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "index.html";
  } else {
    document.getElementById("user-name").textContent = user.email;
    renderHistory();
  }

  function addTransaction() {
    const type = document.getElementById("type").value;
    const value = parseFloat(document.getElementById("value").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const data = JSON.parse(localStorage.getItem("transactions")) || [];
    data.push({ user: user.email, type, value, category, date });
    localStorage.setItem("transactions", JSON.stringify(data));
    renderHistory();
  }

  function renderHistory() {
    const data = JSON.parse(localStorage.getItem("transactions")) || [];
    const tbody = document.getElementById("history-body");
    tbody.innerHTML = "";

    data.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.user}</td>
        <td>${d.type}</td>
        <td class="${d.type === 'receita' || d.type === 'investimento' ? 'value-positive' : 'value-negative'}">R$ ${d.value.toFixed(2)}</td>
        <td>${d.category}</td>
        <td>${d.date}</td>
      `;
      tbody.appendChild(row);
    });
  }
}