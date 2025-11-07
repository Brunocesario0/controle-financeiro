const form = document.getElementById("finance-form");
const tabela = document.querySelector("#tabela tbody");
const exportarBtn = document.getElementById("exportar");
let registros = JSON.parse(localStorage.getItem("registros")) || [];

function atualizarTabela() {
  tabela.innerHTML = "";
  registros.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.pessoa}</td>
      <td>${item.descricao}</td>
      <td>R$ ${item.valor.toFixed(2)}</td>
      <td>${item.tipo}</td>
      <td>${item.data}</td>
      <td><button onclick="remover(${i})">🗑️</button></td>
    `;
    tabela.appendChild(tr);
  });
  atualizarResumo();
}

function atualizarResumo() {
  const bruno = registros.filter(r => r.pessoa === "Bruno");
  const giovana = registros.filter(r => r.pessoa === "Giovana");

  const calc = (arr) => arr.reduce((acc, r) => acc + (r.tipo === "Despesa" ? -r.valor : r.valor), 0);
  
  const saldoBruno = calc(bruno);
  const saldoGiovana = calc(giovana);
  const saldoTotal = saldoBruno + saldoGiovana;

  document.getElementById("saldo-bruno").textContent = `R$ ${saldoBruno.toFixed(2)}`;
  document.getElementById("saldo-giovana").textContent = `R$ ${saldoGiovana.toFixed(2)}`;
  document.getElementById("saldo-total").textContent = `R$ ${saldoTotal.toFixed(2)}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const pessoa = document.getElementById("pessoa").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const data = new Date().toLocaleDateString("pt-BR");

  registros.push({ pessoa, descricao, valor, tipo, data });
  localStorage.setItem("registros", JSON.stringify(registros));

  form.reset();
  atualizarTabela();
});

function remover(i) {
  registros.splice(i, 1);
  localStorage.setItem("registros", JSON.stringify(registros));
  atualizarTabela();
}

exportarBtn.addEventListener("click", () => {
  let csv = "Pessoa,Descrição,Valor,Tipo,Data\n";
  registros.forEach(r => {
    csv += `${r.pessoa},${r.descricao},${r.valor},${r.tipo},${r.data}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "controle_financeiro.csv";
  a.click();
});

atualizarTabela();
