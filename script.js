// script.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// --- VERIFICA LOGIN ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userEmail").textContent = user.email;
    carregarLancamentos();
  }
});

// --- LOGOUT ---
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --- NAVEGAÇÃO ENTRE TELAS ---
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const view = document.getElementById("view-" + btn.dataset.view);
    if (view) view.classList.remove("hidden");
  });
});

// --- ADICIONAR LANÇAMENTO ---
const formAdd = document.getElementById("formAdd");
formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pessoa = campoPessoa.value;
  const tipo = campoTipo.value;
  const descricao = campoDescricao.value;
  const valor = parseFloat(campoValor.value);
  const data = campoData.value || new Date().toISOString().split("T")[0];

  try {
    await addDoc(collection(db, "lancamentos"), { pessoa, tipo, descricao, valor, data });
    alert("Lançamento adicionado!");
    formAdd.reset();
    carregarLancamentos();
  } catch (error) {
    alert("Erro ao salvar: " + error.message);
  }
});

// --- LISTAR LANÇAMENTOS ---
async function carregarLancamentos() {
  const tbody = document.querySelector("#recentTable tbody");
  tbody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "lancamentos"));
  let totalBruno = 0, totalGiovana = 0;

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${d.pessoa}</td>
      <td>${d.descricao}</td>
      <td>R$ ${d.valor.toFixed(2)}</td>
      <td>${d.tipo}</td>
      <td>${d.data}</td>
      <td><button data-id="${docSnap.id}" class="btn small danger excluir">🗑️</button></td>
    `;
    tbody.appendChild(linha);

    if (d.tipo === "Receita") {
      d.pessoa === "Bruno" ? totalBruno += d.valor : totalGiovana += d.valor;
    } else if (d.tipo === "Despesa") {
      d.pessoa === "Bruno" ? totalBruno -= d.valor : totalGiovana -= d.valor;
    }
  });

  // Atualiza saldos
  document.getElementById("saldoBruno").textContent = `R$ ${totalBruno.toFixed(2)}`;
  document.getElementById("saldoGiovana").textContent = `R$ ${totalGiovana.toFixed(2)}`;
  document.getElementById("saldoTotal").textContent = `R$ ${(totalBruno + totalGiovana).toFixed(2)}`;

  // Ações de exclusão
  document.querySelectorAll(".excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Deseja excluir este lançamento?")) {
        await deleteDoc(doc(db, "lancamentos", btn.dataset.id));
        carregarLancamentos();
      }
    });
  });
}
