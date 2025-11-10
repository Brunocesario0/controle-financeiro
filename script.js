// Navegação de seções
const menuItems = document.querySelectorAll(".menu li");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(item.dataset.section).classList.add("active");
  });
});

// Entradas
const entradaDesc = document.getElementById("entradaDesc");
const entradaValor = document.getElementById("entradaValor");
const addEntrada = document.getElementById("addEntrada");
const listaEntradas = document.getElementById("listaEntradas");

addEntrada.addEventListener("click", () => {
  if (!entradaDesc.value || !entradaValor.value) return;
  const li = document.createElement("li");
  li.textContent = `${entradaDesc.value} - R$ ${entradaValor.value}`;
  listaEntradas.appendChild(li);
  entradaDesc.value = "";
  entradaValor.value = "";
  updateChart();
});

// Saídas
const saidaDesc = document.getElementById("saidaDesc");
const saidaValor = document.getElementById("saidaValor");
const addSaida = document.getElementById("addSaida");
const listaSaidas = document.getElementById("listaSaidas");

addSaida.addEventListener("click", () => {
  if (!saidaDesc.value || !saidaValor.value) return;
  const li = document.createElement("li");
  li.textContent = `${saidaDesc.value} - R$ ${saidaValor.value}`;
  listaSaidas.appendChild(li);
  saidaDesc.value = "";
  saidaValor.value = "";
  updateChart();
});

// Investimentos
const invDesc = document.getElementById("invDesc");
const invValor = document.getElementById("invValor");
const addInvestimento = document.getElementById("addInvestimento");
const listaInvestimentos = document.getElementById("listaInvestimentos");

addInvestimento.addEventListener("click", () => {
  if (!invDesc.value || !invValor.value) return;
  const li = document.createElement("li");
  li.textContent = `${invDesc.value} - R$ ${invValor.value}`;
  listaInvestimentos.appendChild(li);
  invDesc.value = "";
  invValor.value = "";
  updateChart();
});

// Backup
const exportBtn = document.getElementById("exportBackup");
const importInput = document.getElementById("importBackup");

exportBtn.addEventListener("click", () => {
  const data = {
    entradas: listaEntradas.innerHTML,
    saidas: listaSaidas.innerHTML,
    investimentos: listaInvestimentos.innerHTML
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup.json";
  a.click();
});

importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    listaEntradas.innerHTML = data.entradas || "";
    listaSaidas.innerHTML = data.saidas || "";
    listaInvestimentos.innerHTML = data.investimentos || "";
    updateChart();
  };
  reader.readAsText(file);
});
