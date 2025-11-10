// === CONFIGURAÇÃO FIREBASE ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDoz4Ui6iKJ2xQUDJcliSHNtye7D1cQ3s",
  authDomain: "controle-financeiro-fin.firebaseapp.com",
  projectId: "controle-financeiro-fin",
  storageBucket: "controle-financeiro-fin.firebasestorage.app",
  messagingSenderId: "168274245445",
  appId: "1:168274245445:web:dbe5ef5c208b77cc02302c",
  measurementId: "G-DTW26HLVJ3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// ===  LOGIN PAGE  (index.html)
// ===============================
if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("Login realizado com sucesso!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Erro ao logar:", error.message);
      alert("❌ Erro no login: " + error.message);
    }
  });
}

// ===============================
// ===  DASHBOARD PAGE
// ===============================
if (window.location.pathname.includes("dashboard.html")) {
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
      <h2>Verificando autenticação...</h2>
    </div>
  `;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Carrega o conteúdo real do dashboard
      fetch("dashboard.html")
        .then((res) => res.text())
        .then((html) => {
          document.open();
          document.write(html);
          document.close();
          initDashboard();
        });
    } else {
      window.location.href = "index.html";
    }
  });

  function initDashboard() {
    const formLancamento = document.getElementById("form-lancamento");
    const logoutBtn = document.getElementById("logout");
    const tbody = document.querySelector("#tabela-lancamentos tbody");

    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });

    formLancamento.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pessoa = document.getElementById("pessoa").value;
      const tipo = document.getElementById("tipo").value;
      const descricao = document.getElementById("descricao").value;
      const valor = parseFloat(document.getElementById("valor").value);
      const dataRef = document.getElementById("dataRef").value;

      try {
        await addDoc(collection(db, "lancamentos"), {
          pessoa,
          tipo,
          descricao,
          valor,
          dataRef,
          dataRegistro: serverTimestamp(),
        });
        alert("✅ Lançamento salvo!");
        formLancamento.reset();
        carregarLancamentos();
      } catch (error) {
        alert("❌ Erro ao salvar: " + error.message);
      }
    });

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
}
