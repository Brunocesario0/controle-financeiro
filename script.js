// =============== CONFIGURAÇÃO INICIAL ===============
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();

  // Se não existir usuário master, cria
  if (!localStorage.getItem("usuarios")) {
    const usuarios = [{
      email: "bruno.cesario@outlook.com",
      senha: "zxasQW!@",
      tipo: "master",
      bloqueado: false,
      ultimoLogin: null
    }];
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  // =============== LOGIN ===============
  if (page === "login.html" || page === "") {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMsg");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const user = usuarios.find(u => u.email === email && u.senha === senha);

      if (!user) {
        msg.textContent = "Usuário ou senha incorretos.";
        msg.style.color = "red";
        return;
      }

      if (user.bloqueado) {
        msg.textContent = "Este usuário está bloqueado.";
        msg.style.color = "red";
        return;
      }

      user.ultimoLogin = new Date().toLocaleString();
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      localStorage.setItem("usuarioLogado", JSON.stringify(user));
      window.location.href = "index.html";
    });
  }

  // =============== VERIFICAÇÃO DE LOGIN NAS OUTRAS PÁGINAS ===============
  if (page !== "login.html" && page !== "") {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      window.location.href = "login.html";
      return;
    }

    // Logout
    const sair = document.getElementById("logout");
    if (sair) sair.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "login.html";
    });

    // Esconder menu "Usuários" para quem não é master
    const menuUsuarios = document.getElementById("menuUsuarios");
    if (menuUsuarios && usuarioLogado.tipo !== "master") {
      menuUsuarios.style.display = "none";
    }
  }

  // =============== GERENCIAMENTO DE USUÁRIOS ===============
  if (page === "usuarios.html") {
    const tabela = document.querySelector("#tabelaUsuarios tbody");
    const form = document.getElementById("formNovoUsuario");

    function atualizarTabela() {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      tabela.innerHTML = "";
      usuarios.forEach((u, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.email}</td>
          <td>${u.tipo}</td>
          <td>${u.ultimoLogin || "-"}</td>
          <td>
            <button data-acao="bloquear" data-i="${i}" class="btn small">${u.bloqueado ? "Desbloquear" : "Bloquear"}</button>
            <button data-acao="excluir" data-i="${i}" class="btn small danger">Excluir</button>
          </td>`;
        tabela.appendChild(tr);
      });
    }

    atualizarTabela();

    tabela.addEventListener("click", (e) => {
      const btn = e.target;
      if (!btn.dataset.acao) return;
      const i = btn.dataset.i;
      const usuarios = JSON.parse(localStorage.getItem("usuarios"));
      if (btn.dataset.acao === "bloquear") {
        usuarios[i].bloqueado = !usuarios[i].bloqueado;
      } else if (btn.dataset.acao === "excluir") {
        if (usuarios[i].tipo === "master") {
          alert("Não é possível excluir o usuário master.");
          return;
        }
        usuarios.splice(i, 1);
      }
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      atualizarTabela();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("novoEmail").value.trim();
      const senha = document.getElementById("novaSenha").value.trim();
      const tipo = document.getElementById("novoTipo").value;
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      if (usuarios.find(u => u.email === email)) {
        alert("Usuário já existe!");
        return;
      }

      usuarios.push({
        email,
        senha,
        tipo,
        bloqueado: false,
        ultimoLogin: null
      });

      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      form.reset();
      atualizarTabela();
    });
  }
});
