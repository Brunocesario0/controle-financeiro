import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ctx = document.getElementById("graficoFinanceiro");
const chart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Receitas", "Despesas", "Investimentos", "Saques"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#4CAF50", "#F44336", "#2196F3", "#FF9800"] }]
  }
});

async function atualizarGrafico() {
  const snapshot = await getDocs(collection(db, "lancamentos"));
  let receitas = 0, despesas = 0, investimentos = 0, saques = 0;

  snapshot.forEach((doc) => {
    const d = doc.data();
    if (d.tipo === "receita") receitas += d.valor;
    if (d.tipo === "despesa") despesas += d.valor;
    if (d.tipo === "investimento") investimentos += d.valor;
    if (d.tipo === "saque") saques += d.valor;
  });

  chart.data.datasets[0].data = [receitas, despesas, investimentos, saques];
  chart.update();
}

atualizarGrafico();
