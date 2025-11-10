import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === LOGIN ===
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("loggedUser", email);
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  });
}

// === DASHBOARD ===
if (window.location.pathname.includes("dashboard.html")) {
  const formLancamento = document.getElementById("form-lancamento");
  const logoutBtn = document.getElementById("logout");
  const tbody = document.querySelector("#tabela-lancamentos tbody");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.body.style.display = "block";
    } else {
      window.location.href = "index.html";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      localStorage.removeItem("loggedUser");
      window.location.href = "index.html";
    });
  }

  if (formLancamento) {
    formLancamento.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pessoa = document.getElementById("pessoa").value;
      const tipo = document.getElementById("tipo").value;
      const descricao = document.getElementById("descricao").value;
      const valor = parseFloat(document.getElementById("valor").value);
      const dataRef = document.getElementById("dataRef").value;

      await addDoc(collection(db, "lancamentos"), {
        pessoa, tipo, descricao, valor, dataRef,
        dataRegistro: serverTimestamp(),
      });
      alert("Lançamento salvo!");
      formLancamento.reset();
      carregarLancamentos();
    });
  }

  async function carregarLancamentos() {
    const q = query(collection(db, "lancamentos"), orderBy("dataRegistro", "desc"));
    const querySnapshot = await getDocs(q);
    tbody.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.pessoa}</td>
        <td>${d.descricao}</td>
        <td>R$ ${d.valor.toFixed(2)}</td>
        <td>${d.tipo}</td>
        <td>${d.dataRef || "-"}</td>
        <td>${d.dataRegistro?.toDate?.().toLocaleString?.() || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  }

  carregarLancamentos();
}
