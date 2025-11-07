document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("login-error");

  // Usuário master
  const masterUser = {
    email: "bruno.cesario@outlook.com",
    password: "zxasQW!@",
    role: "master"
  };

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Login master
  if (email === masterUser.email && password === masterUser.password) {
    localStorage.setItem("loggedUser", JSON.stringify(masterUser));
    window.location.href = "index.html";
    return;
  }

  // Login usuários criados
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
    window.location.href = "index.html";
  } else {
    errorMsg.textContent = "E-mail ou senha incorretos.";
  }
});
