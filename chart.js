// chart.js (module)
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.esm.min.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const ctx = document.getElementById("graficoFinanceiro");
let chart = null;

function buildChart(data) {
  // aggregate totals
  const totals = { Receitas:0, Despesas:0, Investimentos:0, Saques:0 };
  for (const r of data) {
    if (r.tipo === "Receita") totals.Receitas += Number(r.valor);
    if (r.tipo === "Despesa") totals.Despesas += Number(r.valor);
    if (r.tipo === "Investimento") totals.Investimentos += Number(r.valor);
    if (r.tipo === "Saque") totals.Saques += Number(r.valor);
  }

  const values = [totals.Receitas, totals.Despesas, totals.Investimentos, totals.Saques];

  if (!chart && ctx) {
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Receitas","Despesas","Investimentos","Saques"],
        datasets: [{ data: values, backgroundColor: ["#10B981","#EF4444","#3B82F6","#F59E0B"] }]
      },
      options: { responsive:true, maintainAspectRatio:false }
    });
  } else if (chart) {
    chart.data.datasets[0].data = values;
    chart.update();
  }
}

// listen for data updates from script.js
window.addEventListener("cf:data:updated", (ev) => {
  const data = ev.detail || [];
  buildChart(data);
});

// initial empty chart
buildChart([]);
