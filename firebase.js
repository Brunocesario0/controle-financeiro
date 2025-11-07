// Import the functions you need from the SDKs you need
//000import { initializeApp } from "firebase/app";
//000import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDoz4Ui6iKJ2xQUDJcliSHNtye7D1cQ3s",
  authDomain: "controle-financeiro-fin.firebaseapp.com",
  projectId: "controle-financeiro-fin",
  storageBucket: "controle-financeiro-fin.firebasestorage.app",
  messagingSenderId: "168274245445",
  appId: "1:168274245445:web:dbe5ef5c208b77cc02302c",
  measurementId: "G-DTW26HLVJ3"
};

// Initialize Firebase
//000const app = initializeApp(firebaseConfig);
//000const analytics = getAnalytics(app);

// Inicializa o Firebase
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}