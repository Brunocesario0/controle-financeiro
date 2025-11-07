// ===================== LOGIN =====================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  // Configuração inicial do usuário master
  if (!localStorage.getItem("usuarios")) {
    const master = [{
      email: "bruno.cesario@outlook.com",
      senha: "zxasQW!@",
      tipo: "master",
      ultimoLogin: null,
      bloqueado: false
    }];
    localStorage.setItem("usuarios", JSON.stringify(master));
  }

  // Função de logout
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "login.html";
    });
  }

  // Página de login
  if (currentPage === "login.html" || currentPage === "") {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMessage");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("password").value.trim();

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const user = usuarios.find(u => u.email === email && u.senha === senha);

      if (user && !user.bloqueado) {
        user.ultimoLogin = new Date().toLocaleString();
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("usuarioLogado", JSON.stringify(user));
        window.location.href = "index.html";
      } else {
        msg.textContent = "Usuário ou senha incorretos ou conta bloqueada.";
        msg.style.color = "red";
      }
    });
  }

  // Verificação de acesso (para todas as páginas)
  if (currentPage !== "login.html" && currentPage !== "") {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) window.location.href = "login.html";

    // Esconder menu de usuários se não for master
    const menuUsuarios = document.getElementById("menuUsuarios");
    if (menuUsuarios && usuarioLogado.tipo !== "master") {
      menuUsuarios.style.display = "none";
    }
  }

  // ===================== GERENCIAMENTO DE USUÁRIOS =====================
  if (currentPage === "usuarios.html") {
    const tabela = document.querySelector("#tabelaUsuarios tbody");
    const form = document.getElementById("cadastroUsuarioForm");

    function renderUsuarios() {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      tabela.innerHTML = "";
      usuarios.forEach((u, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${u.email}</td>
          <td>${u.tipo}</td>
          <td>${u.ultimoLogin || "-"}</td>
          <td>
            <button class="btn small danger" data-action="bloquear" data-index="${index}">${u.bloqueado ? "Desbloquear" : "Bloquear"}</button>
            <button class="btn small danger" data-action="excluir" data-index="${index}">Excluir</button>
          </td>`;
        tabela.appendChild(row);
      });
    }

    renderUsuarios();

    tabela.addEventListener("click", (e) => {
      if (e.target.dataset.action) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios"));
        const index = e.target.dataset.index;
        const action = e.target.dataset.action;

        if (action === "bloquear") {
          usuarios[index].bloqueado = !usuarios[index].bloqueado;
        } else if (action === "excluir") {
          if (usuarios[index].tipo === "master") {
            alert("Não é possível excluir o usuário master.");
            return;
          }
          usuarios.splice(index, 1);
        }
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        renderUsuarios();
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const novoEmail = document.getElementById("novoEmail").value.trim();
      const novaSenha = document.getElementById("novaSenha").value.trim();
      const novoTipo = document.getElementById("novoTipo").value;

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      if (usuarios.find(u => u.email === novoEmail)) {
        alert("Usuário já cadastrado.");
        return;
      }

      usuarios.push({
        email: novoEmail,
        senha: novaSenha,
        tipo: novoTipo,
        ultimoLogin: null,
        bloqueado: false
      });

      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      renderUsuarios();
      form.reset();
    });
  }
});
