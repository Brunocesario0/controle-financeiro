let ctx = document.getElementById("financeChart");
let financeChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Entradas", "Saídas", "Investimentos"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ["#4caf50", "#f44336", "#2196f3"],
    }]
  },
  options: { responsive: true }
});

function updateChart() {
  const entradas = document.querySelectorAll("#listaEntradas li").length;
  const saidas = document.querySelectorAll("#listaSaidas li").length;
  const investimentos = document.querySelectorAll("#listaInvestimentos li").length;
  financeChart.data.datasets[0].data = [entradas, saidas, investimentos];
  financeChart.update();
}
