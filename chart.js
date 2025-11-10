// chart.js — responsável por exibir os gráficos no painel

document.addEventListener("DOMContentLoaded", () => {
  const ctxReceitas = document.getElementById("graficoReceitasDespesas");
  const ctxInvestimentos = document.getElementById("graficoInvestimentos");

  // Função para gerar cores aleatórias para os gráficos
  const randomColor = () => {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };

  // Carrega dados das receitas e despesas
  function gerarGraficoFinanceiro(dados) {
    const receitas = dados.filter(d => d.tipo === "Receita");
    const despesas = dados.filter(d => d.tipo === "Despesa");

    const totalReceitas = receitas.reduce((acc, v) => acc + parseFloat(v.valor), 0);
    const totalDespesas = despesas.reduce((acc, v) => acc + parseFloat(v.valor), 0);

    new Chart(ctxReceitas, {
      type: "doughnut",
      data: {
        labels: ["Receitas", "Despesas"],
        datasets: [{
          data: [totalReceitas, totalDespesas],
          backgroundColor: ["#4caf50", "#f44336"]
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "Receitas x Despesas" }
        }
      }
    });
  }

  // Carrega dados de investimentos
  function gerarGraficoInvestimentos(dados) {
    const investimentos = dados.filter(d => d.tipo === "Investimento");
    const saques = dados.filter(d => d.tipo === "Saque");

    const totalInvestimentos = investimentos.reduce((acc, v) => acc + parseFloat(v.valor), 0);
    const totalSaques = saques.reduce((acc, v) => acc + parseFloat(v.valor), 0);

    new Chart(ctxInvestimentos, {
      type: "bar",
      data: {
        labels: ["Investimentos", "Saques"],
        datasets: [{
          label: "Valores (R$)",
          data: [totalInvestimentos, totalSaques],
          backgroundColor: ["#2196f3", "#ff9800"]
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Investimentos x Saques" }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Listener para atualizar os gráficos quando houver novos dados
  document.addEventListener("atualizarGraficos", e => {
    const { dados } = e.detail;
    gerarGraficoFinanceiro(dados);
    gerarGraficoInvestimentos(dados);
  });
});
