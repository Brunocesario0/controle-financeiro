import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const uid = () => auth.currentUser?.uid;

// Função genérica para adicionar dados
async function addItem(tipo, desc, valor) {
  if (!uid()) return;
  await addDoc(collection(db, tipo), {
    descricao: desc,
    valor: parseFloat(valor),
    usuario: uid(),
    data: new Date().toISOString()
  });
}

// Função genérica para listar dados
function listarItens(tipo, listaId) {
  const q = query(collection(db, tipo));
  onSnapshot(q, (snapshot) => {
    const lista = document.getElementById(listaId);
    lista.innerHTML = "";
    snapshot.forEach((doc) => {
      const item = doc.data();
      if (item.usuario === uid()) {
        const li = document.createElement("li");
        li.textContent = `${item.descricao}: R$${item.valor.toFixed(2)}`;
        lista.appendChild(li);
      }
    });
  });
}

// Eventos
document.getElementById("addReceita")?.addEventListener("click", () => {
  addItem("receitas", descReceita.value, valorReceita.value);
});

document.getElementById("addDespesa")?.addEventListener("click", () => {
  addItem("despesas", descDespesa.value, valorDespesa.value);
});

document.getElementById("addInvest")?.addEventListener("click", () => {
  addItem("investimentos", descInvest.value, valorInvest.value);
});

document.getElementById("addSaque")?.addEventListener("click", () => {
  addItem("saques", descSaque.value, valorSaque.value);
});

listarItens("receitas", "listaReceitas");
listarItens("despesas", "listaDespesas");
listarItens("investimentos", "listaInvestimentos");
listarItens("saques", "listaSaques");
