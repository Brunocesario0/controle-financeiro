const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
const btnGerenciar = document.getElementById("gerenciar-usuarios");

// Mostra botão de gerenciamento apenas para master
if (loggedUser && loggedUser.role === "master") {
  btnGerenciar.style.display = "inline-block";
  btnGerenciar.addEventListener("click", () => {
    window.location.href = "users.html";
  });
} else {
  btnGerenciar.style.display = "none";
}

// Logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
});

// --- RESTANTE DO SEU SCRIPT ORIGINAL ABAIXO ---
// Tudo que lida com lançamentos, exportações, filtros, resumo etc.
