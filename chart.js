import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

async function atualizarGrafico() {
  const ctx = document.getElementById("financeChart").getContext("2d");

  const tipos = ["receitas", "despesas", "investimentos", "saques"];
  const valores = [];

  for (const tipo of tipos) {
    const snap = await getDocs(collection(db, tipo));
    let total = 0;
    snap.forEach((doc) => {
      if (doc.data().usuario === auth.currentUser?.uid) {
        total += doc.data().valor;
      }
    });
    valores.push(total);
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: tipos,
      datasets: [{
        label: "Totais (R$)",
        data: valores,
        backgroundColor: ["#4CAF50", "#F44336", "#2196F3", "#FF9800"]
      }]
    }
  });
}

auth.onAuthStateChanged((user) => {
  if (user) atualizarGrafico();
});
