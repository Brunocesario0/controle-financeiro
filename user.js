const userForm = document.getElementById("user-form");
const userTable = document.getElementById("user-table").querySelector("tbody");

const loadUsers = () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  userTable.innerHTML = "";
  users.forEach((u, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td><button class="btn danger small" data-index="${i}">Remover</button></td>
    `;
    userTable.appendChild(tr);
  });
};

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value.trim();
  const role = document.getElementById("new-role").value;

  if (!email || !password || !role) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.email === email)) {
    alert("Usuário já existe!");
    return;
  }

  users.push({ email, password, role });
  localStorage.setItem("users", JSON.stringify(users));
  userForm.reset();
  loadUsers();
});

userTable.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const index = e.target.dataset.index;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
});

document.getElementById("voltar").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
});

loadUsers();
