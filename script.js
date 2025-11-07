// === Controle Financeiro Integrado com Login ===
// v3.0 - Inclui suporte a permissões e login local

// === Chaves de armazenamento ===
const STORAGE_KEY = "cf_lancamentos_v3";
const INVEST_KEY = "cf_investimentos_v3";

// === Dados em memória ===
let lancamentos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let investimentos = JSON.parse(localStorage.getItem(INVEST_KEY)) || [];

// === Utilidades ===
function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentos));
  localStorage.setItem(INVEST_KEY, JSON.stringify(investimentos));
}

// === Função principal para registrar lançamentos ===
function adicionarLancamento(tipo, descricao, valor, data) {
  const dataRegistro = new Date().toLocaleString("pt-BR");
  const registro = { tipo, descricao, valor: parseFloat(valor), data, dataRegistro };
  lancamentos.push(registro);
  salvarDados();
  atualizarTabelas();
}

// === Funções específicas ===
function adicionarReceita() {
  const desc = prompt("Descrição da receita:");
  const val = parseFloat(prompt("Valor:"));
  const data = prompt("Data (AAAA-MM-DD):");
  if (desc && val > 0 && data) adicionarLancamento("receita", desc, val, data);
}

function adicionarDespesa() {
  const desc = prompt("Descrição da despesa:");
  const val = parseFloat(prompt("Valor:"));
  const data = prompt("Data (AAAA-MM-DD):");
  if (desc && val > 0 && data) adicionarLancamento("despesa", desc, val, data);
}

function adicionarInvestimento() {
  const desc = prompt("Descrição do investimento:");
  const val = parseFloat(prompt("Valor:"));
  const data = prompt("Data (AAAA-MM-DD):");
  if (desc && val > 0 && data) {
    investimentos.push({
      descricao: desc,
      valor: val,
      tipo: "aporte",
      data,
      dataRegistro: new Date().toLocaleString("pt-BR"),
    });
    salvarDados();
    atualizarTabelas();
  }
}

function sacarInvestimento() {
  const desc = prompt("Descrição do saque:");
  const val = parseFloat(prompt("Valor:"));
  const data = prompt("Data (AAAA-MM-DD):");
  if (desc && val > 0 && data) {
    investimentos.push({
      descricao: desc,
      valor: -val,
      tipo: "saque",
      data,
      dataRegistro: new Date().toLocaleString("pt-BR"),
    });
    salvarDados();
    atualizarTabelas();
  }
}

// === Cálculos ===
function calcularTotais() {
  const receitas = lancamentos.filter(l => l.tipo === "receita").reduce((a, b) => a + b.valor, 0);
  const despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((a, b) => a + b.valor, 0);
  const investimentosTotais = investimentos.reduce((a, b) => a + b.valor, 0);
  const saldo = receitas - despesas - investimentosTotais;
  return { receitas, despesas, investimentosTotais, saldo };
}

// === Atualização das tabelas ===
function atualizarTabelas() {
  atualizarTabela("tabela-lancamentos", lancamentos);
  atualizarTabela("tabela-investimentos", investimentos, true);
  atualizarResumo();
}

// === Atualizar tabela genérica ===
function atualizarTabela(idTabela, dados, isInvest = false) {
  const tbody = document.querySelector(`#${idTabela} tbody`);
  tbody.innerHTML = "";

  const ordenados = dados.sort((a, b) => new Date(a.data) - new Date(b.data));

  for (const item of ordenados) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.data}</td>
      <td>${item.descricao}</td>
      <td class="valor">${item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
      <td>${item.dataRegistro}</td>
      ${sessaoAtual.tipo === "master" || sessaoAtual.tipo === "admin" ? `<td><button onclick="removerItem('${idTabela}','${item.dataRegistro}')">🗑️</button></td>` : ""}
    `;

    // cores
    if (item.tipo === "receita" || item.tipo === "aporte") {
      tr.querySelector(".valor").style.color = "green";
    } else if (item.tipo === "despesa" || item.tipo === "saque") {
      tr.querySelector(".valor").style.color = "red";
    }

    tbody.appendChild(tr);
  }
}

// === Ordenação por coluna ===
function ordenarTabela(tabelaId, colunaIndex) {
  const tabela = document.getElementById(tabelaId);
  const linhas = Array.from(tabela.querySelectorAll("tbody tr"));
  const asc = tabela.dataset.sortAsc === "true";
  tabela.dataset.sortAsc = !asc;

  linhas.sort((a, b) => {
    const aText = a.children[colunaIndex].textContent.replace(/[^\d,-]+/g, "").replace(",", ".");
    const bText = b.children[colunaIndex].textContent.replace(/[^\d,-]+/g, "").replace(",", ".");
    const aVal = parseFloat(aText) || aText;
    const bVal = parseFloat(bText) || bText;
    return asc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const tbody = tabela.querySelector("tbody");
  linhas.forEach(l => tbody.appendChild(l));
}

// === Resumo ===
function atualizarResumo() {
  const { receitas, despesas, investimentosTotais, saldo } = calcularTotais();
  document.getElementById("total-receitas").textContent = receitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("total-despesas").textContent = despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("total-invest").textContent = investimentosTotais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("saldo-geral").textContent = saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.getElementById("saldo-geral").style.color = saldo >= 0 ? "green" : "red";
}

// === Remover item ===
function removerItem(tabelaId, dataRegistro) {
  if (!confirm("Remover este registro?")) return;

  if (tabelaId === "tabela-lancamentos") {
    lancamentos = lancamentos.filter(i => i.dataRegistro !== dataRegistro);
  } else {
    investimentos = investimentos.filter(i => i.dataRegistro !== dataRegistro);
  }
  salvarDados();
  atualizarTabelas();
}

// === Inicialização ===
document.addEventListener("DOMContentLoaded", () => {
  if (sessaoAtual) atualizarTabelas();

  // Habilita ordenação nos cabeçalhos
  document.querySelectorAll("th.sortable").forEach((th, i) => {
    const tabelaId = th.closest("table").id;
    th.addEventListener("click", () => ordenarTabela(tabelaId, i));
  });
});
