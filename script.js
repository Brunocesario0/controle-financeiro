// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === LOGIN PAGE ===
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

// === DASHBOARD PAGE ===
if (window.location.pathname.includes("dashboard.html")) {
  const userEmail = localStorage.getItem("loggedUser");
  const logoutBtn = document.getElementById("logout");

  // ✅ Aguarda confirmação do login antes de exibir o dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuário autenticado:", user.email);
      document.body.style.display = "block";
    } else {
      console.log("Usuário não autenticado. Redirecionando...");
      window.location.href = "index.html";
    }
  });

  // === Logout ===
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      localStorage.removeItem("loggedUser");
      window.location.href = "index.html";
    });
  }

  // === Exemplo de carregamento de dados do Firestore ===
  async function carregarLancamentos() {
    const q = query(collection(db, "lancamentos"), orderBy("dataRegistro", "desc"));
    const querySnapshot = await getDocs(q);
    const tbody = document.querySelector("#tabela-lancamentos tbody");
    tbody.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.pessoa}</td>
        <td>${data.descricao}</td>
        <td>${data.valor}</td>
        <td>${data.tipo}</td>
        <td>${data.dataRef}</td>
        <td>${data.dataRegistro}</td>
      `;
      tbody.appendChild(row);
    });
  }

  carregarLancamentos();
}
