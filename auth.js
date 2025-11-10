// auth.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  });
}

// --- CADASTRO ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Usuário criado com sucesso! Faça login.");
    } catch (error) {
      alert("Erro ao criar usuário: " + error.message);
    }
  });
}

// --- MONITORA LOGIN ---
onAuthStateChanged(auth, (user) => {
  const currentPage = window.location.pathname;

  if (user && currentPage.includes("index.html")) {
    // Usuário logado tentando acessar login → redireciona ao painel
    window.location.href = "dashboard.html";
  } else if (!user && currentPage.includes("dashboard.html")) {
    // Sem login → volta para index
    window.location.href = "index.html";
  }
});
