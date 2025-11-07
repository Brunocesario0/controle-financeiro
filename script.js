// ======================= CONFIGURAÇÃO GERAL ======================
const usarFirebase = false; // Mude para true se quiser usar Firebase Auth

const usuariosLocais = [
  { email: "bruno@email.com", senha: "123", tipo: "admin" },
  { email: "giovana@email.com", senha: "123", tipo: "usuario" }
];

let usuarioAtual = null;

// ======================= LOGIN / LOGOUT ==========================
document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("login-form");
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      usarFirebase ? loginFirebase() : loginLocal();
    });

    document.getElementById("esqueci-senha").addEventListener("click", (e) => {
      e.preventDefault();
      alert("Para redefinir sua senha, contate o administrador.");
    });
  } else {
    verificarLogin();
  }
});

function loginLocal() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const user = usuariosLocais.find(u => u.email === email && u.senha === senha);
  if (!user) {
    document.getElementById("erro-login").textContent = "Email ou senha incorretos!";
    return;
  }
  localStorage.setItem("usuarioAtivo", JSON.stringify(user));
  window.location.href = "main.html";
}

function verificarLogin() {
  usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtivo"));
  if (!usuarioAtual) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("usuario-logado").textContent = usuarioAtual.email;
}

function logout() {
  localStorage.removeItem("usuarioAtivo");
  window.location.href = "index.html";
}

// ======================= FIREBASE LOGIN ==========================
function loginFirebase() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(userCredential => {
      const user = { email: email, tipo: "usuario" };
      localStorage.setItem("usuarioAtivo", JSON.stringify(user));
      window.location.href = "main.html";
    })
    .catch(error => {
      document.getElementById("erro-login").textContent = "Erro no login: " + error.message;
    });
}

// ======================= LÓGICA DO APP ==========================
let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-lancamento");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      adicionarLancamento();
    });
    atualizarTabela();
  }
});

function adicionarLancamento() {
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const dataRegistro = new Date().toISOString();

  const lancamento = { data, descricao, valor, tipo, dataRegistro };
  lancamentos.push(lancamento);
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));

  atualizarTabela();
  document.getElementById("form-lancamento").reset();
}

function atualizarTabela() {
  const tbody = document.querySelector("#tabela-lancamentos tbody");
  tbody.innerHTML = "";

  lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

  lancamentos.forEach((l, i) => {
    const tr = document.createElement("tr");
    tr.classList.add(l.tipo);

    tr.innerHTML = `
      <td>${l.data}</td>
      <td>${l.descricao}</td>
      <td>R$ ${l.valor.toFixed(2)}</td>
      <td>${l.tipo}</td>
      <td>${usuarioAtual?.tipo === "admin" ? `<button onclick="excluirLancamento(${i})">🗑</button>` : ""}</td>
    `;

    tbody.appendChild(tr);
  });

  atualizarResumo();
}

function excluirLancamento(i) {
  if (usuarioAtual.tipo !== "admin") {
    alert("Apenas o administrador pode excluir lançamentos.");
    return;
  }
  lancamentos.splice(i, 1);
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
  atualizarTabela();
}

function atualizarResumo() {
  const receitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0);
  const despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);
  const investimentos = lancamentos.filter(l => l.tipo === "investimento").reduce((acc, l) => acc + l.valor, 0);
  const saques = lancamentos.filter(l => l.tipo === "saque").reduce((acc, l) => acc + l.valor, 0);

  document.getElementById("saldo").textContent = "R$ " + (receitas - despesas - investimentos + saques).toFixed(2);
  document.getElementById("total-investido").textContent = "R$ " + (investimentos - saques).toFixed(2);
}

function ordenarTabela(campo) {
  lancamentos.sort((a, b) => {
    if (campo === "valor") return b.valor - a.valor;
    if (campo === "data") return new Date(a.data) - new Date(b.data);
    return a[campo].localeCompare(b[campo]);
  });
  atualizarTabela();
}
