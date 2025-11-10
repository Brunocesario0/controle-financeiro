import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logout");
const errorMsg = document.getElementById("error-message");

// LOGIN
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      errorMsg.textContent = "E-mail ou senha incorretos.";
    }
  });
}

// MANTER LOGADO
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;
  if (user && path.includes("index.html")) {
    window.location.href = "dashboard.html";
  } else if (!user && path.includes("dashboard.html")) {
    window.location.href = "index.html";
  }
});

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
