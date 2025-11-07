// ====================== LOGIN E AUTENTICAÇÃO =========================
function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(userCredential => {
      localStorage.setItem("usuarioAtivo", userCredential.user.email);
      window.location.href = "main.html";
    })
    .catch(error => alert("Erro ao fazer login: " + error.message));
}

function resetSenha() {
  const email = document.getElementById('email').value;
  if (!email) return alert("Digite seu e-mail para redefinir a senha.");
  auth.sendPasswordResetEmail(email)
    .then(() => alert("E-mail de redefinição enviado!"))
    .catch(error => alert("Erro: " + error.message));
}

function logout() {
  auth.signOut().then(() => {
    localStorage.removeItem("usuarioAtivo");
    window.location.href = "index.html";
  });
}

// ====================== PROTEÇÃO DE PÁGINAS =========================
if (window.location.pathname.includes("main.html")) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      document.getElementById("user-info").textContent = "Logado como: " + user.email;
      document.getElementById("app-container").classList.remove("hidden");
      carregarDados();
    }
  });
}

// ====================== SISTEMA FINANCEIRO =========================
let registros = JSON.parse(localStorage.getItem("registros")) || [];

function adicionarRegistro() {
  const pessoa = document.getElementById("pessoa").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const data = document.getElementById("data").value;
  const dataRegistro = new Date().toISOString();

  if (!pessoa || !descricao || isNaN(valor) || !tipo) {
    alert("Preencha todos os campos!");
    return;
  }

  registros.push({ pessoa, descricao, valor, tipo, data, dataRegistro });
  localStorage.setItem("registros", JSON.stringify(registros));
  carregarDados();
}

function carregarDados() {
  const tbodyDesp = document.querySelector("#tabelaDespesas tbody");
  const tbodyInv = document.querySelector("#tabelaInvestimentos tbody");
  tbodyDesp.innerHTML = "";
  tbodyInv.innerHTML = "";

  registros.sort((a,b)=> new Date(b.dataRegistro)-new Date(a.dataRegistro));

  let totalBruno=0, totalGiovana=0, investido=0, sacado=0;

  registros.forEach((r,i)=>{
    const valorClass = (r.tipo==="Receita"||r.tipo==="Saque de Investimento") ? "valor-positivo" : "valor-negativo";
    const tr = `<tr>
      <td>${r.pessoa}</td>
      <td>${r.descricao}</td>
      <td class="${valorClass}">R$ ${r.valor.toFixed(2)}</td>
      <td>${r.data}</td>
      <td><button class="btn-excluir" onclick="excluirRegistro(${i})">Excluir</button></td>
    </tr>`;

    if (r.tipo==="Despesa") tbodyDesp.innerHTML += tr;
    if (r.tipo==="Investimento"||r.tipo==="Saque de Investimento") tbodyInv.innerHTML += tr;

    const fator = (r.tipo==="Receita"||r.tipo==="Saque de Investimento") ? 1 : -1;
    if(r.pessoa==="Bruno") totalBruno += valor*r.fator;
    if(r.pessoa==="Giovana") totalGiovana += valor*r.fator;

    if(r.tipo==="Investimento") investido += r.valor;
    if(r.tipo==="Saque de Investimento") sacado += r.valor;
  });

  document.getElementById("resumoPessoas").innerHTML = `
    Bruno: R$ ${totalBruno.toFixed(2)} | Giovana: R$ ${totalGiovana.toFixed(2)}
  `;
  document.getElementById("resumoCasal").innerHTML = `
    Total Casal: R$ ${(totalBruno+totalGiovana).toFixed(2)}
  `;
  document.getElementById("resumoInvestimentos").innerHTML = `
    Investido: R$ ${investido.toFixed(2)} | Sacado: R$ ${sacado.toFixed(2)} | Saldo Investido: R$ ${(investido-sacado).toFixed(2)}
  `;

  const usuario = auth.currentUser?.email || "";
  const isAdmin = usuario.includes("bruno");
  if(!isAdmin){
    document.querySelectorAll(".btn-excluir").forEach(btn=>btn.style.display="none");
  }
}

function excluirRegistro(i){
  if(!confirm("Excluir registro?")) return;
  registros.splice(i,1);
  localStorage.setItem("registros", JSON.stringify(registros));
  carregarDados();
}

function ordenarTabela(id,col){
  const tabela=document.getElementById(id);
  const tbody=tabela.tBodies[0];
  const linhas=[...tbody.rows];
  const asc=!tabela.dataset.sortAsc;
  linhas.sort((a,b)=>{
    const A=a.cells[col].innerText;
    const B=b.cells[col].innerText;
    return asc ? A.localeCompare(B,undefined,{numeric:true}) : B.localeCompare(A,undefined,{numeric:true});
  });
  tbody.innerHTML="";
  linhas.forEach(l=>tbody.appendChild(l));
  tabela.dataset.sortAsc=asc;
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginLocal();
    });
  } else {
    checkLogin();
  }
});

const usuarios = [
  { email: "bruno@email.com", senha: "123", tipo: "admin" },
  { email: "giovana@email.com", senha: "123", tipo: "usuario" }
];

function loginLocal() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    alert("Email ou senha incorretos!");
    return;
  }

  localStorage.setItem("usuarioAtivo", JSON.stringify(user));
  alert("Login realizado com sucesso!");
  window.location.href = "main.html";
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem("usuarioAtivo"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("usuario-logado").textContent = user.email;

  // Permissões
  if (user.tipo !== "admin") {
    const botoesExcluir = document.querySelectorAll(".btn-excluir");
    botoesExcluir.forEach(btn => btn.style.display = "none");
  }
}

function logout() {
  localStorage.removeItem("usuarioAtivo");
  window.location.href = "index.html";
}
