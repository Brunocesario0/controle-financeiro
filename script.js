// armazenamento local
const STORAGE_KEY = "cf_casal_v2";
let registros = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// elementos DOM
const form = document.getElementById("finance-form");
const tabelaLanc = document.querySelector("#tabela-lancamentos tbody");
const tabelaInv = document.querySelector("#tabela-investimentos tbody");
const filtroPessoa = document.getElementById("filtroPessoa");
const filtroTipo = document.getElementById("filtroTipo");

const saldoBrunoEl = document.getElementById("saldo-bruno");
const saldoGiovanaEl = document.getElementById("saldo-giovana");
const saldoTotalEl = document.getElementById("saldo-total");

const exportLancBtn = document.getElementById("export-lancamentos");
const exportInvBtn = document.getElementById("export-investimentos");
const exportAllBtn = document.getElementById("export-tudo");
const limparBtn = document.getElementById("limpar");

// util helpers
const hojePadrao = () => new Date().toISOString().split('T')[0];
const fmt = v => 'R$ ' + Number(v || 0).toFixed(2);

// carregar e salvar
function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

function novoId() {
  return Date.now() + Math.floor(Math.random()*999);
}

// render
function atualizarTabelas() {
  // filtros
  const pessoaFiltro = filtroPessoa.value || "all";
  const tipoFiltro = filtroTipo.value || "all";

  tabelaLanc.innerHTML = "";
  tabelaInv.innerHTML = "";

  const lancamentos = registros.filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
  const investimentos = registros.filter(r => r.tipo === "Investimento");

  // Lançamentos (aplica filtros)
  const lancFiltrados = lancamentos.filter(r => {
    if (pessoaFiltro !== "all" && r.pessoa !== pessoaFiltro) return false;
    if (tipoFiltro !== "all" && r.tipo !== tipoFiltro) return false;
    return true;
  });

  lancFiltrados.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.pessoa}</td>
      <td>${escapeHtml(item.descricao)}</td>
      <td>${fmt(item.valor)}</td>
      <td>${item.tipo}</td>
      <td>${item.data}</td>
      <td>
        <button onclick="removerRegistro('${item.id}')" title="Remover">🗑️</button>
      </td>
    `;
    tabelaLanc.appendChild(tr);
  });

  // Investimentos (sem filtros de pessoa/tipo aplicados aqui)
  investimentos.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.pessoa}</td>
      <td>${escapeHtml(item.descricao)}</td>
      <td>${fmt(item.valor)}</td>
      <td>${item.data}</td>
      <td>
        <button onclick="removerRegistro('${item.id}')" title="Remover">🗑️</button>
      </td>
    `;
    tabelaInv.appendChild(tr);
  });

  atualizarResumo();
}

// evita injeção simples ao mostrar texto
function escapeHtml(text){
  if(!text) return "";
  return text.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function atualizarResumo(){
  const bruno = registros.filter(r => r.pessoa === "Bruno");
  const giovana = registros.filter(r => r.pessoa === "Giovana");

  const soma = arr => arr.reduce((acc, r) => {
    if (r.tipo === "Receita") return acc + Number(r.valor);
    // Despesa e Investimento deduzem do saldo
    return acc - Number(r.valor);
  }, 0);

  const saldoBruno = soma(bruno);
  const saldoGiovana = soma(giovana);
  const total = saldoBruno + saldoGiovana;

  saldoBrunoEl.textContent = fmt(saldoBruno);
  saldoGiovanaEl.textContent = fmt(saldoGiovana);
  saldoTotalEl.textContent = fmt(total);
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

  const registro = {
    id: novoId().toString(),
    pessoa, tipo, descricao, valor: Number(valor), data
  };

  registros.push(registro);
  salvar();
  form.reset();
  document.getElementById("data").value = hojePadrao();
  atualizarTabelas();
});

// remover por id
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

// export CSV util
function toCSV(rows, headers){
  const esc = v => `"${String(v||"").replaceAll('"','""')}"`;
  let csv = headers.map(esc).join(",") + "\n";
  rows.forEach(r => {
    csv += headers.map(h => esc(r[h]===undefined?"":r[h])).join(",") + "\n";
  });
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

// exports
exportLancBtn.addEventListener("click", () => {
  const lancamentos = registros.filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
  const rows = lancamentos.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data"]);
  downloadCSV("lancamentos.csv", csv);
});

exportInvBtn.addEventListener("click", () => {
  const invs = registros.filter(r => r.tipo === "Investimento");
  const rows = invs.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, data: r.data }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","data"]);
  downloadCSV("investimentos.csv", csv);
});

exportAllBtn.addEventListener("click", () => {
  const rows = registros.map(r => ({ pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data }));
  const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data"]);
  downloadCSV("controle_financeiro_tudo.csv", csv);
});

// filtros
filtroPessoa.addEventListener("change", atualizarTabelas);
filtroTipo.addEventListener("change", atualizarTabelas);

// inicialização
document.addEventListener("DOMContentLoaded", () => {
  // se não tiver data predefinida, coloca hoje
  if(!document.getElementById("data").value) document.getElementById("data").value = hojePadrao();
  atualizarTabelas();
});
