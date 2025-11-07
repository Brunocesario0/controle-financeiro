// v2.2 - armazenamento local com dataRegistro, cores, saque e resumo de investimentos

const STORAGE_KEY = "cf_casal_v2.2";
let registros = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// DOM
const form = document.getElementById("finance-form");
const tabelaLanc = document.querySelector("#tabela-lancamentos tbody");
const tabelaInv = document.querySelector("#tabela-investimentos tbody");
const filtroPessoa = document.getElementById("filtroPessoa");
const filtroTipo = document.getElementById("filtroTipo");

const saldoBrunoEl = document.getElementById("saldo-bruno");
const saldoGiovanaEl = document.getElementById("saldo-giovana");
const saldoTotalEl = document.getElementById("saldo-total");

const totalInvestidoEl = document.getElementById("total-investido");
const totalSacadoEl = document.getElementById("total-sacado");
const saldoInvestimentosEl = document.getElementById("saldo-investimentos");

const exportLancBtn = document.getElementById("export-lancamentos");
const exportInvBtn = document.getElementById("export-investimentos");
const exportAllBtn = document.getElementById("export-tudo");
const limparBtn = document.getElementById("limpar");

// helpers
const hojePadrao = () => new Date().toISOString().split('T')[0];
const agoraISO = () => new Date().toISOString();
const fmt = v => 'R$ ' + Number(v || 0).toFixed(2);
const novoId = () => Date.now().toString(36) + Math.floor(Math.random()*9999).toString(36);
const escapeHtml = (t) => t ? String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;") : "";

// persistência
function salvar(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

// lógica de saldo
function calcularSaldoPorPessoa(nome){
  const arr = registros.filter(r => r.pessoa === nome);
  let saldo = 0;
  for (const r of arr) {
    if (r.tipo === "Receita") saldo += Number(r.valor);
    else if (r.tipo === "Despesa") saldo -= Number(r.valor);
    else if (r.tipo === "Investimento") saldo -= Number(r.valor); // aplica como saída
    else if (r.tipo === "Saque") saldo += Number(r.valor); // saque retorna para caixa
  }
  return saldo;
}

function calcularResumoInvestimentos(){
  const invs = registros.filter(r => r.tipo === "Investimento");
  const saques = registros.filter(r => r.tipo === "Saque");
  const totalInvestido = invs.reduce((s,v)=> s + Number(v.valor),0);
  const totalSacado = saques.reduce((s,v)=> s + Number(v.valor),0);
  return { totalInvestido, totalSacado, saldoInvestimentos: totalInvestido - totalSacado };
}

// render das tabelas (ordenar por dataRegistro decrescente)
function atualizarTabelas(){
  tabelaLanc.innerHTML = "";
  tabelaInv.innerHTML = "";

  const pessoaFiltro = filtroPessoa.value || "all";
  const tipoFiltro = filtroTipo.value || "all";

  // separa registros
  const lancamentos = registros.filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
  const investimentos = registros.filter(r => r.tipo === "Investimento" || r.tipo === "Saque");

  // ordenar por dataRegistro (mais recente primeiro)
  lancamentos.sort((a,b) => (b.dataRegistro || "").localeCompare(a.dataRegistro || ""));
  investimentos.sort((a,b) => (b.dataRegistro || "").localeCompare(a.dataRegistro || ""));

  // aplicar filtros e renderizar lançamentos (Receita/Despesa)
  const lancFiltrados = lancamentos.filter(r => {
    if (pessoaFiltro !== "all" && r.pessoa !== pessoaFiltro) return false;
    if (tipoFiltro !== "all" && r.tipo !== tipoFiltro) return false;
    return true;
  });

  for (const item of lancFiltrados) {
    const tr = document.createElement("tr");
    const valorClass = (item.tipo === "Receita" || item.tipo === "Investimento") ? "positivo" : "negativo";
    tr.innerHTML = `
      <td>${item.pessoa}</td>
      <td>${escapeHtml(item.descricao)}</td>
      <td class="${valorClass}">${fmt(item.tipo === "Receita" ? item.valor : -item.valor)}</td>
      <td>${item.tipo}</td>
      <td>${item.data}</td>
      <td>${item.dataRegistro ? (new Date(item.dataRegistro)).toLocaleString() : ""}</td>
      <td><button onclick="removerRegistro('${item.id}')">🗑️</button></td>
    `;
    tabelaLanc.appendChild(tr);
  }

  // render investimentos (Investimento e Saque)
  for (const item of investimentos) {
    const tr = document.createElement("tr");
    // Investimento aparece verde (positivo visualmente), Saque vermelho
    const valorClass = (item.tipo === "Investimento") ? "positivo" : "negativo";
    // exibir valor: aportes como - do caixa (mostrar negativo?) -> para exibir visual, seguimos seu pedido:
    // Investimento mostra em verde (mas a lógica deduz do saldo); Saque em vermelho (retirada)
    const displayed = item.tipo === "Saque" ? `-${fmt(item.valor)}` : `${fmt(item.valor)}`;
    tr.innerHTML = `
      <td>${item.pessoa}</td>
      <td>${escapeHtml(item.descricao)}</td>
      <td class="${valorClass}">${displayed}</td>
      <td>${item.tipo}</td>
      <td>${item.data}</td>
      <td>${item.dataRegistro ? (new Date(item.dataRegistro)).toLocaleString() : ""}</td>
      <td><button onclick="removerRegistro('${item.id}')">🗑️</button></td>
    `;
    tabelaInv.appendChild(tr);
  }

  atualizarResumo();
}

// atualiza resumos na UI
function atualizarResumo(){
  const saldoBruno = calcularSaldoPorPessoa("Bruno");
  const saldoGiovana = calcularSaldoPorPessoa("Giovana");
  const total = saldoBruno + saldoGiovana;

  saldoBrunoEl.textContent = fmt(saldoBruno);
  saldoGiovanaEl.textContent = fmt(saldoGiovana);
  saldoTotalEl.textContent = fmt(total);

  const invResumo = calcularResumoInvestimentos();
  totalInvestidoEl.textContent = fmt(invResumo.totalInvestido);
  totalSacadoEl.textContent = fmt(invResumo.totalSacado);
  saldoInvestimentosEl.textContent = fmt(invResumo.saldoInvestimentos);
}

// adicionar novo registro
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const pessoa = document.getElementById("pessoa").value;
  const tipo = document.getElementById("tipo").value;
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value || 0);
  const data = document.getElementById("data").value || hojePadrao();

  if(!pessoa || !tipo || !descricao || !valor || valor <= 0){
    alert("Preencha todos os campos corretamente. Valor deve ser maior que zero.");
    return;
  }

  // se tipo for Saque e não houver investimentos suficientes, permitimos (sem bloqueio)
  // (poderíamos validar aqui se desejar)

  const registro = {
    id: novoId(),
    pessoa,
    tipo,
    descricao,
    valor: Number(valor),
    data,
    dataRegistro: agoraISO()
  };

  registros.push(registro);
  salvar();
  form.reset();
  document.getElementById("data").value = hojePadrao();
  atualizarTabelas();
});

// remover
window.removerRegistro = function(id){
  if(!confirm("Remover esse registro?")) return;
  registros = registros.filter(r => r.id !== id);
  salvar();
  atualizarTabelas();
};

// limpar tudo
limparBtn.addEventListener("click", () => {
  if(!confirm("Apagar todos os registros (isso não pode ser desfeito)?")) return;
  registros = [];
  salvar();
  atualizarTabelas();
});

// export CSV (ordenado por data (manual) crescente)
function toCSV(rows, headers){
  const esc = v => `"${String(v===undefined?"":v).replaceAll('"','""')}"`;
  let csv = headers.map(esc).join(",") + "\n";
  for (const r of rows) {
    csv += headers.map(h => esc(r[h])).join(",") + "\n";
  }
  return csv;
}

function downloadCSV(filename, content){
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// exportar lançamentos (Receita/Despesa) ordenados por data (referência) asc
exportLancBtn.addEventListener("click", () => {
  const lanc = registros.filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
  lanc.sort((a,b) => (a.data || "").localeCompare(b.data || "") || (a.dataRegistro||"").localeCompare(b.dataRegistro||""));
  const rows = lanc.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data, dataRegistro: r.dataRegistro }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro"]);
  downloadCSV("lancamentos.csv", csv);
});

// exportar investimentos (Investimento e Saque)
exportInvBtn.addEventListener("click", () => {
  const inv = registros.filter(r => r.tipo === "Investimento" || r.tipo === "Saque");
  inv.sort((a,b) => (a.data || "").localeCompare(b.data || "") || (a.dataRegistro||"").localeCompare(b.dataRegistro||""));
  const rows = inv.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data, dataRegistro: r.dataRegistro }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro"]);
  downloadCSV("investimentos.csv", csv);
});

// exportar tudo
exportAllBtn.addEventListener("click", () => {
  const all = [...registros].sort((a,b) => (a.data || "").localeCompare(b.data || "") || (a.dataRegistro||"").localeCompare(b.dataRegistro||""));
  const rows = all.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data, dataRegistro: r.dataRegistro }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro"]);
  downloadCSV("controle_financeiro_tudo.csv", csv);
});

// filtros
filtroPessoa.addEventListener("change", atualizarTabelas);
filtroTipo.addEventListener("change", atualizarTabelas);

// init
document.addEventListener("DOMContentLoaded", () => {
  if(!document.getElementById("data").value) document.getElementById("data").value = hojePadrao();
  atualizarTabelas();
});
