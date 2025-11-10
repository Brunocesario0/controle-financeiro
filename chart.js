import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ctx = document.getElementById("graficoFinanceiro");

async function gerarGrafico() {
  const lancamentos = await getDocs(collection(db, "lancamentos"));
  let receitas = 0, despesas = 0, investimentos = 0, saques = 0;

  lancamentos.forEach((doc) => {
    const d = doc.data();
    if (d.tipo === "Receita") receitas += d.valor;
    if (d.tipo === "Despesa") despesas += d.valor;
    if (d.tipo === "Investimento") investimentos += d.valor;
    if (d.tipo === "Saque") saques += d.valor;
  });

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Receitas", "Despesas", "Investimentos", "Saques"],
      datasets: [{
        data: [receitas, despesas, investimentos, saques],
        backgroundColor: ["#4CAF50", "#F44336", "#2196F3", "#FF9800"],
      }],
    },
  });
}

gerarGrafico();
