// script.js (module)
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ---------- Configs ---------- */
const MASTER_EMAIL = "b.cesario@outlook.com"; // master
const STORAGE_COLLECTION = "lancamentos";

/* ---------- Helpers ---------- */
const hojePadrao = () => new Date().toISOString().split("T")[0];
const agoraISO = () => new Date().toISOString();
const fmt = v => "R$ " + Number(v || 0).toFixed(2).replace(".", ",");

function novoId() { return Date.now().toString(36) + Math.floor(Math.random() * 9999).toString(36); }
function escapeHtml(t) { return t ? String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;") : ""; }

async function toArraySnapshot(q) {
  const snap = await getDocs(q);
  const arr = [];
  snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
  return arr;
}

/* ---------- Login page (index.html) ---------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const loginMsg = document.getElementById("loginMsg");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMsg.textContent = "Entrando...";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // redirect handled by onAuthStateChanged in dashboard
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      loginMsg.textContent = "E-mail ou senha inválidos / usuário não cadastrado.";
    }
  });
}

/* ---------- Protected pages (dashboard.html) ---------- */
if (window.location.pathname.includes("dashboard.html")) {
  // Show a loading screen while we check auth
  document.body.style.display = "none";

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    // user authenticated — initialize app
    document.body.style.display = "block";
    initApp(user);
  });
}

async function initApp(user) {
  // Elements
  const userEmailEl = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");
  const navBtns = document.querySelectorAll(".nav-btn");
  const views = document.querySelectorAll(".view");

  // display user
  if (userEmailEl) userEmailEl.textContent = user.email;

  // hide users menu if not master
  const navUsuarios = document.getElementById("navUsuarios");
  if (navUsuarios && user.email !== MASTER_EMAIL) navUsuarios.style.display = "none";

  // logout
  if (logoutBtn) logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  // navigation
  navBtns.forEach(b => {
    b.addEventListener("click", () => {
      navBtns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const view = b.dataset.view;
      views.forEach(v => v.classList.add("hidden"));
      const el = document.getElementById("view-" + view);
      if (el) el.classList.remove("hidden");
      // on view change, re-render appropriate tables
      if (view === "dashboard") renderRecent();
      if (view === "investimentos") renderInvestimentos();
      if (view === "usuarios") renderUsers();
      if (view === "graficos") renderChart();
    });
  });

  // set default date inputs
  const campoData = document.getElementById("campoData");
  if (campoData && !campoData.value) campoData.value = hojePadrao();

  // Form add
  const formAdd = document.getElementById("formAdd");
  if (formAdd) {
    formAdd.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pessoa = document.getElementById("campoPessoa").value;
      const tipo = document.getElementById("campoTipo").value;
      const descricao = document.getElementById("campoDescricao").value.trim();
      const valor = Number(document.getElementById("campoValor").value || 0);
      const dataRef = document.getElementById("campoData").value || hojePadrao();

      if (!pessoa || !tipo || !descricao || valor <= 0) {
        alert("Preencha corretamente (valor > 0).");
        return;
      }

      try {
        await addDoc(collection(db, STORAGE_COLLECTION), {
          pessoa,
          tipo,
          descricao,
          valor: Number(valor.toFixed(2)),
          data: dataRef,
          dataRegistro: serverTimestamp(),
          criadoPor: user.email
        });
        formAdd.reset();
        document.getElementById("campoData").value = hojePadrao();
        alert("Lançamento salvo!");
        renderAll();
      } catch (err) {
        console.error("Erro addDoc:", err);
        alert("Erro ao salvar lançamento.");
      }
    });
  }

  // Buttons: limpar tudo (apenas local collection clear via deleting docs would require doc ids; here we warn)
  const btnLimparTudo = document.getElementById("btnLimparTudo");
  if (btnLimparTudo) btnLimparTudo.addEventListener("click", async () => {
    if (!confirm("Apagar todos os registros? Isso não pode ser desfeito.")) return;
    alert("Remoção em massa não implementada por segurança (use console/firestore).");
  });

  // Exports
  document.getElementById("btnExportCSV")?.addEventListener("click", exportLancamentosCSV);
  document.getElementById("exportAllBtn")?.addEventListener("click", exportAllCSV);
  document.getElementById("exportInvCSV")?.addEventListener("click", exportInvestimentosCSV);

  // Filters event
  ["filtroPessoa","filtroTipo","filtroDescricao","filtroData"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderRecent);
  });
  ["filtroInvDescricao","filtroInvData","filtroInvPessoa"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderInvestimentos);
  });

  // Recent table click (delete)
  document.querySelector("#recentTable tbody")?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const criadoPor = btn.getAttribute("data-createdby");
    if (criadoPor !== user.email && user.email !== MASTER_EMAIL) { alert("Você só pode remover seus próprios registros."); return; }
    if (!confirm("Remover este registro?")) return;
    try {
      await setDoc(doc(db, STORAGE_COLLECTION, id), { _deleted: true }, { merge: true });
      // we mark _deleted true (soft delete) — can also use deleteDoc if desired
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover.");
    }
  });

  // Investments table click remove
  document.querySelector("#tabelaInvestimentos tbody")?.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const criadoPor = btn.getAttribute("data-createdby");
    if (criadoPor !== user.email && user.email !== MASTER_EMAIL) { alert("Você só pode remover seus próprios registros."); return; }
    if (!confirm("Remover este registro?")) return;
    try {
      await setDoc(doc(db, STORAGE_COLLECTION, id), { _deleted: true }, { merge: true });
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover.");
    }
  });

  // Backup export/import
  document.getElementById("btnBackup")?.addEventListener("click", async () => {
    try {
      const q = query(collection(db, STORAGE_COLLECTION), orderBy("dataRegistro", "desc"));
      const arr = await toArraySnapshot(q);
      const payload = { registros: arr };
      const blob = new Blob([JSON.stringify(payload, null,2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "backup_financeiro.json"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar backup.");
    }
  });

  document.getElementById("inputImport")?.addEventListener("change", (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (!obj.registros) { alert("Arquivo inválido"); return; }
        alert("Import recebido. Importar registros para o Firestore não é automático por segurança. Você pode abrir o JSON e enviar manualmente no console do Firestore.");
      } catch (err) {
        alert("Arquivo inválido.");
      }
    };
    reader.readAsText(f);
  });

  // User management (master only) — create user (createAuth user)
  const formNovoUsuario = document.getElementById("formNovoUsuario");
  if (formNovoUsuario) {
    formNovoUsuario.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (user.email !== MASTER_EMAIL) { alert("Ação permitida apenas ao master."); return; }
      const novoEmail = document.getElementById("novoEmail").value.trim();
      const novaSenha = document.getElementById("novaSenha").value;
      if (!novoEmail || !novaSenha) return alert("Preencha email e senha.");
      try {
        await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
        alert("Usuário criado no Firebase Auth. Ele poderá logar com a senha escolhida.");
        document.getElementById("novoEmail").value = "";
        document.getElementById("novaSenha").value = "";
      } catch (err) {
        console.error(err);
        alert("Erro ao criar usuário: " + err.message);
      }
    });
  }

  // initial render
  await renderAll();

  /* ---------- Renderers ---------- */

  async function fetchAllRecords() {
    const q = query(collection(db, STORAGE_COLLECTION), orderBy("dataRegistro", "desc"));
    const arr = await toArraySnapshot(q);
    // filter out items marked _deleted true
    return arr.filter(x => !x._deleted);
  }

  async function renderAll() {
    await Promise.all([renderResumo(), renderRecent(), renderInvestimentos(), renderUsers(), renderChart()]);
  }

  async function renderResumo() {
    const all = await fetchAllRecords();
    const saldoBruno = calcularSaldoPorPessoa(all, "Bruno");
    const saldoGiovana = calcularSaldoPorPessoa(all, "Giovana");
    document.getElementById("saldoBruno").textContent = fmt(saldoBruno);
    document.getElementById("saldoGiovana").textContent = fmt(saldoGiovana);
    document.getElementById("saldoTotal").textContent = fmt(saldoBruno + saldoGiovana);

    const invResumo = calcularResumoInvestimentos(all);
    document.getElementById("totalInvestido").textContent = fmt(invResumo.totalInvestido);
    document.getElementById("totalSacado").textContent = fmt(invResumo.totalSacado);
    document.getElementById("saldoInvest").textContent = fmt(invResumo.saldoInvestimentos);
  }

  function calcularSaldoPorPessoa(arr, nome) {
    const itens = arr.filter(r => r.pessoa === nome);
    let saldo = 0;
    for (const r of itens) {
      if (r.tipo === "Receita") saldo += Number(r.valor);
      else if (r.tipo === "Despesa") saldo -= Number(r.valor);
      else if (r.tipo === "Investimento") saldo -= Number(r.valor);
      else if (r.tipo === "Saque") saldo += Number(r.valor);
    }
    return saldo;
  }

  function calcularResumoInvestimentos(arr) {
    const invs = arr.filter(r => r.tipo === "Investimento");
    const saques = arr.filter(r => r.tipo === "Saque");
    const totalInvestido = invs.reduce((s, v) => s + Number(v.valor), 0);
    const totalSacado = saques.reduce((s, v) => s + Number(v.valor), 0);
    return { totalInvestido, totalSacado, saldoInvestimentos: totalInvestido - totalSacado };
  }

  async function renderRecent() {
    const tbody = document.querySelector("#recentTable tbody");
    tbody.innerHTML = "";
    let all = await fetchAllRecords();

    // apply filters
    const p = document.getElementById("filtroPessoa")?.value || "all";
    const t = document.getElementById("filtroTipo")?.value || "all";
    const ds = (document.getElementById("filtroDescricao")?.value || "").toLowerCase();
    const d = document.getElementById("filtroData")?.value || "";

    all = all.filter(r => (p === "all" || r.pessoa === p) &&
                          (t === "all" || r.tipo === t) &&
                          (ds === "" || r.descricao.toLowerCase().includes(ds)) &&
                          (d === "" || r.data === d)
    );

    // sorting state via data attribute on table headers
    const ths = document.querySelectorAll("#recentTable thead th[data-col]");
    let sortCol = null, asc = true;
    ths.forEach(th => {
      if (th.dataset.sort) { sortCol = th.dataset.col; asc = th.dataset.sort === 'asc'; }
      // add click handler for sorting
      th.onclick = () => {
        const current = th.dataset.sort;
        const newSort = current === 'asc' ? 'desc' : 'asc';
        ths.forEach(x => delete x.dataset.sort);
        th.dataset.sort = newSort;
        renderRecent();
      };
    });

    // if a column has sort state, apply it
    const thSorted = Array.from(ths).find(t => t.dataset.sort);
    if (thSorted) {
      const col = thSorted.dataset.col;
      const ascSort = thSorted.dataset.sort === 'asc';
      all.sort((a,b) => {
        const av = a[col] || ""; const bv = b[col] || "";
        if (col === "valor") return ascSort ? av - bv : bv - av;
        return ascSort ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }

    for (const r of all) {
      const tr = document.createElement("tr");
      const valorClass = (r.tipo === "Receita" || r.tipo === "Investimento") ? "valor-positivo" : "valor-negativo";
      tr.innerHTML = `
        <td>${r.pessoa}</td>
        <td>${escapeHtml(r.descricao)}</td>
        <td class="${valorClass}">${ r.tipo === "Despesa" || r.tipo === "Saque" ? "-" + fmt(r.valor) : fmt(r.valor) }</td>
        <td>${r.tipo}</td>
        <td>${r.data || "-"}</td>
        <td>${ r.dataRegistro ? new Date(r.dataRegistro.seconds * 1000).toLocaleString() : "-" }</td>
        <td>${ r.criadoPor === user.email || user.email === MASTER_EMAIL ? `<button data-id="${r.id}" data-createdby="${r.criadoPor}" class="btn small danger">🗑️</button>` : "" }</td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function renderInvestimentos() {
    const tbody = document.querySelector("#tabelaInvestimentos tbody");
    tbody.innerHTML = "";
    let all = await fetchAllRecords();
    all = all.filter(r => r.tipo === "Investimento" || r.tipo === "Saque");

    const ds = (document.getElementById("filtroInvDescricao")?.value || "").toLowerCase();
    const d = document.getElementById("filtroInvData")?.value || "";
    const p = document.getElementById("filtroInvPessoa")?.value || "all";

    all = all.filter(r => (p === "all" || r.pessoa === p) &&
                          (ds === "" || r.descricao.toLowerCase().includes(ds)) &&
                          (d === "" || r.data === d) );

    for (const r of all) {
      const tr = document.createElement("tr");
      const valClass = r.tipo === "Investimento" ? "valor-positivo" : "valor-negativo";
      const displayed = r.tipo === "Saque" ? "-" + fmt(r.valor) : fmt(r.valor);
      tr.innerHTML = `
        <td>${r.pessoa}</td>
        <td>${escapeHtml(r.descricao)}</td>
        <td class="${valClass}">${displayed}</td>
        <td>${r.tipo}</td>
        <td>${r.data || "-"}</td>
        <td>${ r.dataRegistro ? new Date(r.dataRegistro.seconds * 1000).toLocaleString() : "-" }</td>
        <td>${ r.criadoPor === user.email || user.email === MASTER_EMAIL ? `<button data-id="${r.id}" data-createdby="${r.criadoPor}" class="btn small danger">🗑️</button>` : "" }</td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function renderUsers() {
    const tbody = document.querySelector("#userTable tbody");
    if (!tbody) return;
    // we will show the current auth users only with last signInTime not accessible from client easily - show email and role via simple approach
    // For simplicity list two known users; in production you'd query a roles collection in Firestore
    tbody.innerHTML = `
      <tr><td>${MASTER_EMAIL}</td><td>master</td><td>-</td><td>Ativo</td><td>-</td></tr>
      <tr><td>giovanaaparecidapenariol@gmail.com</td><td>user</td><td>-</td><td>Ativo</td><td>-</td></tr>
    `;
  }

  /* ---------- CSV / Export ---------- */
  function toCSV(rows, headers) {
    const esc = v => `"${String(v==null?"":v).replace(/"/g,'""')}"`;
    let csv = headers.map(esc).join(",") + "\n";
    for (const r of rows) {
      csv += headers.map(h => esc(r[h])).join(",") + "\n";
    }
    return csv;
  }
  async function exportAllCSV() {
    const all = await fetchAllRecords();
    const rows = all.map(r => ({
      pessoa: r.pessoa, descricao: r.descricao, valor: r.valor, tipo: r.tipo, data: r.data, dataRegistro: r.dataRegistro ? new Date(r.dataRegistro.seconds * 1000).toLocaleString() : "", criadoPor: r.criadoPor
    }));
    const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro","criadoPor"]);
    downloadContent("controle_financeiro_tudo.csv", csv, "text/csv");
  }
  async function exportLancamentosCSV() {
    const all = await fetchAllRecords();
    const lanc = all.filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
    const rows = lanc.map(r => ({ pessoa:r.pessoa, descricao:r.descricao, valor:r.valor, tipo:r.tipo, data:r.data, dataRegistro:r.dataRegistro ? new Date(r.dataRegistro.seconds*1000).toLocaleString() : "", criadoPor:r.criadoPor }));
    const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro","criadoPor"]);
    downloadContent("lancamentos.csv", csv, "text/csv");
  }
  async function exportInvestimentosCSV() {
    const all = await fetchAllRecords();
    const inv = all.filter(r => r.tipo === "Investimento" || r.tipo === "Saque");
    const rows = inv.map(r => ({ pessoa:r.pessoa, descricao:r.descricao, valor:r.valor, tipo:r.tipo, data:r.data, dataRegistro:r.dataRegistro ? new Date(r.dataRegistro.seconds*1000).toLocaleString() : "", criadoPor:r.criadoPor }));
    const csv = toCSV(rows, ["pessoa","descricao","valor","tipo","data","dataRegistro","criadoPor"]);
    downloadContent("investimentos.csv", csv, "text/csv");
  }

  function downloadContent(filename, content, mime) {
    const blob = new Blob([content], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- Charts ---------- */
  // chart.js module handles Chart rendering; call renderChart to update
  async function renderChart() {
    // dispatch a custom event that chart.js listens to
    const all = await fetchAllRecords();
    window.dispatchEvent(new CustomEvent("cf:data:updated", { detail: all }));
  }

} // end initApp
