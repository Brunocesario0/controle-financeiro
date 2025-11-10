import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-message");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      errorMsg.textContent = "E-mail ou senha inválidos.";
    }
  });
}

// MONITORAR LOGIN
onAuthStateChanged(auth, (user) => {
  if (window.location.pathname.includes("dashboard.html") && !user) {
    window.location.href = "index.html";
  }
});

// LOGOUT
const logout = document.getElementById("logout");
if (logout) {
  logout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
