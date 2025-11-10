/* script.js — Controle Financeiro em Casal (single-file logic)
   - Pré-cria contas para Bruno e Giovana (emails que você forneceu)
   - Guarda dados em localStorage na chave CF_CASAL_V1
   - app.html é o painel; index.html é login
*/

/* ---------- CONFIG ---------- */
const STORAGE_KEY = "CF_CASAL_V1";
const USERS_KEY = "CF_USERS_V1";
const SESSION_KEY = "CF_SESSION_V1";

/* ---------- INITIAL USERS (only created once) ---------- */
function ensureInitialUsers() {
  const u = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const existsBruno = u.some(x => x.email.toLowerCase() === "b.cesario@outlook.com");
  if (!existsBruno) {
    u.push({
      email: "b.cesario@outlook.com",
      name: "Bruno",
      senha: "zxasQW!@",
      role: "master",
      ultimoLogin: null,
      ativo: true
    });
  }
  const existsGiovana = u.some(x => x.email.toLowerCase() === "giovanaaparecidapenariol@gmail.com");
  if (!existsGiovana) {
    u.push({
      email: "giovanaaparecidapenariol@gmail.com",
      name: "Giovana",
      senha: "giovana123",
      role: "user",
      ultimoLogin: null,
      ativo: true
    });
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
ensureInitialUsers();

/* ---------- UTILS ---------- */
function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY)) || [] }
function saveUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)) }
function getSession(){ return JSON.parse(localStorage.getItem(SESSION_KEY)) || null }
function setSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)) }
function clearSession(){ localStorage.removeItem(SESSION_KEY) }
function readData(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
function saveData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

function novoId(){ return Date.now().toString(36) + Math.floor(Math.random()*999).toString(36) }
function hojePadrao(){ return new Date().toISOString().split("T")[0] }
function agoraISO(){ return new Date().toISOString() }
function fmtMoney(v){ return "R$ " + Number(v||0).toFixed(2).replace('.',',') }

/* ---------- LOGIN (index.html) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  // LOGIN PAGE
  if (path === "" || path === "index.html") {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMsg");
    const demoBtn = document.getElementById("demoBtn");
    if (demoBtn) demoBtn.addEventListener("click", () => {
      // quick demo: fills Bruno
      document.getElementById("email").value = "b.cesario@outlook.com";
      document.getElementById("password").value = "zxasQW!@";
    });

    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const senha = document.getElementById("password").value;
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email && u.senha === senha && u.ativo !== false);
      if (!user) {
        msg.textContent = "E-mail ou senha inválidos (ou conta inativa).";
        msg.style.color = "crimson";
        return;
      }
      user.ultimoLogin = new Date().toLocaleString();
      saveUsers(users);
      setSession({ email: user.email, name: user.name, role: user.role });
      // open app
      window.location.href = "app.html";
    });
    return;
  }

  /* ---------- PROTECTED PAGES: require session ---------- */
  const session = getSession();
  if (!session) { window.location.href = "index.html"; return; }

  /* ---------- common UI wiring ---------- */
  // show logged email
  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) userEmailEl.textContent = session.email + (session.role === "master" ? " • master" : "");

  // nav show/hide users
  const navUsuarios = document.getElementById("navUsuarios");
  if (navUsuarios) {
    if (session.role !== "master") navUsuarios.style.display = "none";
    else navUsuarios.style.display = "";
  }

  // logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  // nav buttons (SPA-like)
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(b => b.addEventListener("click", () => {
    navBtns.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    showView(b.dataset.view);
  }));

  // initial render
  renderAll();

  // form submit add registro
  const formAdd = document.getElementById("formAdd");
  if (formAdd) {
    formAdd.addEventListener("submit", (e) => {
      e.preventDefault();
      const pessoa = document.getElementById("campoPessoa").value;
      const tipo = document.getElementById("campoTipo").value;
      const descricao = document.getElementById("campoDescricao").value.trim();
      const valor = Number(document.getElementById("campoValor").value || 0);
      const data = document.getElementById("campoData").value || hojePadrao();

      if (!pessoa || !tipo || !descricao || valor <= 0) {
        alert("Preencha todos os campos corretamente. Valor maior que zero.");
        return;
      }

      const registro = {
        id: novoId(),
        pessoa,
        tipo, // Receita / Despesa / Investimento / Saque
        descricao,
        valor: Number(valor.toFixed(2)),
        data,
        dataRegistro: agoraISO(),
        criadoPor: session.email
      };

      // salvar
      const all = readData();
      all.push(registro);
      saveData(all);
      formAdd.reset();
      document.getElementById("campoData").value = hojePadrao();
      renderAll();
      showView("dashboard");
    });
  }

  // limpar tudo (danger)
  const btnLimparTudo = document.getElementById("btnLimparTudo");
  if (btnLimparTudo) btnLimparTudo.addEventListener("click", () => {
    if (!confirm("Apagar todos os registros (irrevogável)?")) return;
    saveData([]);
    renderAll();
  });

  // export lancamentos CSV
  const btnExportCSV = document.getElementById("btnExportCSV");
  if (btnExportCSV) btnExportCSV.addEventListener("click", () => {
    const lanc = readData().filter(r => r.tipo === "Receita" || r.tipo === "Despesa");
    downloadCSV("lancamentos.csv", lanc);
  });

  const btnExportInv = document.getElementById("exportInvCSV");
  if (btnExportInv) btnExportInv.addEventListener("click", () => {
    const inv = readData().filter(r => r.tipo === "Investimento" || r.tipo === "Saque");
    downloadCSV("investimentos.csv", inv);
  });

  // tabela recent actions
  document.querySelector("#recentTable tbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    removeRegistro(id);
  });

  // investimentos table actions
  document.querySelector("#tabelaInvestimentos tbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    removeRegistro(id);
  });

  // backup export/import
  const btnBackup = document.getElementById("btnBackup");
  if (btnBackup) btnBackup.addEventListener("click", () => {
    const payload = {
      users: getUsers(),
      registros: readData()
    };
    const blob = new Blob([JSON.stringify(payload, null,2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backup_financeiro.json"; a.click();
    URL.revokeObjectURL(url);
  });
  const inputImport = document.getElementById("inputImport");
  if (inputImport) inputImport.addEventListener("change", (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (obj.users) saveUsers(obj.users);
        if (obj.registros) saveData(obj.registros);
        renderAll();
        const s = document.getElementById("backupStatus");
        if (s) s.textContent = "Backup importado com sucesso.";
        alert("Backup importado com sucesso.");
      } catch(err){
        alert("Arquivo inválido.");
      }
    };
    r.readAsText(f);
  });

  // USERS view: render list & block/delete (only master)
  const userTableBody = document.querySelector("#userTable tbody");
  if (userTableBody) {
    userTableBody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-idx]");
      if (!btn) return;
      const idx = Number(btn.getAttribute("data-idx"));
      const action = btn.getAttribute("data-action");
      const users = getUsers();
      const target = users[idx];
      if (!target) return;
      if (action === "toggle") {
        if (target.role === "master") { alert("Não é possível bloquear o master."); return; }
        target.ativo = !target.ativo;
      } else if (action === "delete") {
        if (target.role === "master") { alert("Não é possível excluir o master."); return; }
        if (!confirm(`Excluir usuário ${target.email}?`)) return;
        users.splice(idx,1);
      }
      saveUsers(users);
      renderUsersTable();
    });
  }

  // quick init functions
  function renderAll(){
    renderResumo();
    renderRecent();
    renderInvestimentos();
    renderUsersTable();
    showView("dashboard");
  }

  /* ---------- VIEWS ---------- */
  function showView(view){
    document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
    const el = document.getElementById("view-"+view);
    if (el) el.classList.remove("hidden");
  }

  /* ---------- RENDER: resumo / tabelas ---------- */
  function calcularSaldoPorPessoa(nome){
    const regs = readData().filter(r=>r.pessoa===nome);
    let saldo=0;
    for(const r of regs){
      if(r.tipo==="Receita") saldo += Number(r.valor);
      else if(r.tipo==="Despesa") saldo -= Number(r.valor);
      else if(r.tipo==="Investimento") saldo -= Number(r.valor);
      else if(r.tipo==="Saque") saldo += Number(r.valor);
    }
    return saldo;
  }

  function calcularResumoInvestimentos(){
    const invs = readData().filter(r => r.tipo === "Investimento");
    const saques = readData().filter(r => r.tipo === "Saque");
    const totalInvest = invs.reduce((s,i)=>s+Number(i.valor),0);
    const totalSaque = saques.reduce((s,i)=>s+Number(i.valor),0);
    return { totalInvest, totalSaque, saldoInvest: totalInvest - totalSaque };
  }

  function renderResumo(){
    const sb = calcularSaldoPorPessoa("Bruno");
    const sg = calcularSaldoPorPessoa("Giovana");
    document.getElementById("saldoBruno").textContent = fmtMoney(sb);
    document.getElementById("saldoGiovana").textContent = fmtMoney(sg);
    document.getElementById("saldoTotal").textContent = fmtMoney(sb+sg);

    const inv = calcularResumoInvestimentos();
    document.getElementById("totalInvestido").textContent = fmtMoney(inv.totalInvest);
    document.getElementById("totalSacado").textContent = fmtMoney(inv.totalSaque);
    document.getElementById("saldoInvest").textContent = fmtMoney(inv.saldoInvest);
  }

  function renderRecent(){
    const tbody = document.querySelector("#recentTable tbody");
    const all = readData().slice().sort((a,b)=> (b.dataRegistro||"").localeCompare(a.dataRegistro||""));
    tbody.innerHTML = "";
    const slice = all.slice(0,12);
    for(const r of slice){
      const tr = document.createElement("tr");
      const valClass = (r.tipo==="Receita"||r.tipo==="Investimento") ? "valor-positivo" : "valor-negativo";
      tr.innerHTML = `<td>${r.pessoa}</td>
        <td>${escapeHtml(r.descricao)}</td>
        <td class="${valClass}">${ (r.tipo==="Despesa"||r.tipo==="Saque") ? "-" + fmtMoney(r.valor) : fmtMoney(r.valor) }</td>
        <td>${r.tipo}</td>
        <td>${r.data}</td>
        <td>${ r.criadoPor === session.email || session.role==="master" ? `<button data-id="${r.id}" class="btn small danger">🗑️</button>` : "" }</td>`;
      tbody.appendChild(tr);
    }
  }

  function renderInvestimentos(){
    const tbody = document.querySelector("#tabelaInvestimentos tbody");
    const inv = readData().filter(r=> r.tipo==="Investimento" || r.tipo==="Saque").sort((a,b)=> (b.dataRegistro||"").localeCompare(a.dataRegistro||""));
    tbody.innerHTML = "";
    for(const r of inv){
      const valClass = (r.tipo==="Investimento") ? "valor-positivo" : "valor-negativo";
      const display = r.tipo==="Saque" ? "-" + fmtMoney(r.valor) : fmtMoney(r.valor);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.pessoa}</td>
        <td>${escapeHtml(r.descricao)}</td>
        <td class="${valClass}">${display}</td>
        <td>${r.tipo}</td>
        <td>${r.data}</td>
        <td>${ r.criadoPor === session.email || session.role==="master" ? `<button data-id="${r.id}" class="btn small danger">🗑️</button>` : "" }</td>`;
      tbody.appendChild(tr);
    }
  }

  function renderUsersTable(){
    const tbody = document.querySelector("#userTable tbody");
    if(!tbody) return;
    const users = getUsers();
    tbody.innerHTML = "";
    users.forEach((u,i)=>{
      tbody.innerHTML += `<tr>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.ultimoLogin || "-"}</td>
        <td>${u.ativo === false ? "Inativo" : "Ativo"}</td>
        <td>
          ${ session.role === "master" ? `<button data-idx="${i}" data-action="toggle" class="btn small">${u.ativo===false?"Ativar":"Bloquear"}</button>
          <button data-idx="${i}" data-action="delete" class="btn small danger">Excluir</button>` : "" }
        </td>
      </tr>`;
    });
  }

  /* ---------- HELPERS: remove registro ---------- */
  function removeRegistro(id){
    if(!confirm("Remover este registro?")) return;
    const arr = readData();
    const idx = arr.findIndex(x=>x.id===id);
    if(idx===-1) return;
    const reg = arr[idx];
    // check permission
    if(reg.criadoPor !== session.email && session.role !== "master"){
      alert("Você só pode remover seus próprios registros.");
      return;
    }
    arr.splice(idx,1);
    saveData(arr);
    renderAll();
  }

  /* ---------- CSV helpers ---------- */
  function toCSVRows(rows, headers){
    const esc = v => `"${String(v==null?"":v).replace(/"/g,'""')}"`;
    let csv = headers.map(esc).join(",") + "\n";
    for(const r of rows){
      const vals = headers.map(h => r[h]==null?"":r[h]);
      csv += vals.map(esc).join(",") + "\n";
    }
    return csv;
  }
  function downloadCSV(filename, rows){
    if(!rows) rows = [];
    // derive headers from first object
    const h = rows.length ? Object.keys(rows[0]) : ["pessoa","descricao","valor","tipo","data","dataRegistro","criadoPor"];
    const csv = toCSVRows(rows, h);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- small util ---------- */
  function escapeHtml(t){ return t ? String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;") : ""; }

  /* ---------- end of main DOMLoaded handler ---------- */
});

/* ---------- END OF FILE ---------- */
