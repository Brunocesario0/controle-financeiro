// ======== CONFIG FIREBASE ========
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
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

// =========================================
// ========== TELA DE LOGIN ================
// =========================================
if (document.getElementById("login-form")) {
  const loginForm = document.getElementById("login-form");
  const msg = document.getElementById("login-msg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Entrando...";

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      msg.textContent = "Login bem-sucedido!";
      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } catch (error) {
      msg.textContent = "Erro: " + error.message;
    }
  });
}

// =========================================
// ========== DASHBOARD ====================
// =========================================
if (document.getElementById("form-lancamento")) {
  const formLanc = document.getElementById("form-lancamento");
  const tbody = document.querySelector("#tabela-lancamentos tbody");
  const logoutBtn = document.getElementById("logout");

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      carregarLancamentos();
    }
  });

  formLanc.addEventListener("submit", async (e) => {
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
      formLanc.reset();
      carregarLancamentos();
    } catch (error) {
      alert("❌ Erro: " + error.message);
    }
  });

  async function carregarLancamentos() {
    const q = query(collection(db, "lancamentos"), orderBy("dataRegistro", "desc"));
    const docs = await getDocs(q);
    tbody.innerHTML = "";
    docs.forEach((d) => {
      const item = d.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.pessoa}</td>
        <td>${item.descricao}</td>
        <td>R$ ${item.valor.toFixed(2)}</td>
        <td>${item.tipo}</td>
        <td>${item.dataRef || "-"}</td>
        <td>${item.dataRegistro?.toDate?.().toLocaleString?.() || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
