// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// 🔧 Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDoz4Ui6iKJ2xQUDJcliSHNtye7D1cQ3s",
  authDomain: "controle-financeiro-fin.firebaseapp.com",
  projectId: "controle-financeiro-fin",
  storageBucket: "controle-financeiro-fin.firebasestorage.app",
  messagingSenderId: "168274245445",
  appId: "1:168274245445:web:dbe5ef5c208b77cc02302c",
  measurementId: "G-DTW26HLVJ3"
};

// 🔥 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
