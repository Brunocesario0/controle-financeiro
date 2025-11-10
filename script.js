import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import "./charts.js";

const usuario = localStorage.getItem("usuario");
const logoutBtn = document.getElementById("logoutBtn");
const tabela = document.querySelector("#tabela-dados tbody");

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
});

async function carregarDados(filtros = {}) {
  tabela.innerHTML = "";
  const q = query(collection(db, "lancamentos"), orderBy("data", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const d = doc.data();
    if (
      (!filtros.tipo || d.tipo === filtros.tipo) &&
      (!filtros.descricao || d.descricao.toLowerCase().includes(filtros.descricao.toLowerCase()))
    ) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.usuario}</td>
        <td>${d.tipo}</td>
        <td>${d.descricao}</td>
        <td>R$ ${d.valor}</td>
        <td>${new Date(d.data).toLocaleDateString()}</td>
      `;
      tabela.appendChild(tr);
    }
  });
}

document.getElementById("adicionarBtn").addEventListener("click", async () => {
  const tipo = document.getElementById("tipo").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);

  if (!descricao || isNaN(valor)) return alert("Preencha os campos corretamente!");

  await addDoc(collection(db, "lancamentos"), {
    usuario,
    tipo,
    descricao,
    valor,
    data: Date.now()
  });

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  carregarDados();
});

document.getElementById("filtrarBtn").addEventListener("click", () => {
  const descricao = document.getElementById("filtroDescricao").value;
  const tipo = document.getElementById("filtroTipo").value;
  carregarDados({ descricao, tipo });
});

carregarDados();
