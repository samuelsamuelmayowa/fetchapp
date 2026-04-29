   // js/admin.js
// Admin dashboard logic - login with password for admin/manager/moderator,
// post admin tasks, manage users, finance, keep everything in localStorage
// Keys: 'ppt_users', 'ppt_tasks', 'ppt_transactions', 'ppt_settings'

(function(){
  /* ---------- Utilities & storage helpers ---------- */
  const STORAGE = {
    USERS: "ppt_users",
    TASKS: "ppt_tasks",
    TXNS: "ppt_transactions",
    SETTINGS: "ppt_settings",
  };

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (e) {
      return null;
    }
  }
  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // initialize default data if missing
  function ensureInit() {
    if (!read(STORAGE.USERS)) {
      const adminPass = "PPT@Admin2025"; // fixed admin password
      const users = [
        {
          id: "u_admin",
          name: "SuperAdmin",
          role: "admin",
          email: "admin@example.com",
          password: adminPass,
          suspended: false,
          verified: true,
          balance: 0,
          history: [],
        },
        {
          id: "u_manager",
          name: "ManagerJoe",
          role: "manager",
          password: "manager123",
          suspended: false,
          verified: true,
          balance: 0,
          history: [],
        },
        {
          id: "u_mod",
          name: "ModMary",
          role: "moderator",
          password: "mod123",
          suspended: false,
          verified: true,
          balance: 0,
          history: [],
        },
        {
          id: "u_creator",
          name: "CreatorSam",
          role: "creator",
          plan: "Premium",
          balance: 100,
          suspended: false,
          verified: true,
          history: [],
        },
        {
          id: "u_earner1",
          name: "Aisha",
          role: "earner",
          balance: 0,
          suspended: false,
          verified: false,
          history: [],
        },
        {
          id: "u_earner2",
          name: "Tunde",
          role: "earner",
          balance: 0,
          suspended: false,
          verified: false,
          history: [],
        },
      ];
      write(STORAGE.USERS, users);
      write(STORAGE.TASKS, []); // tasks list
      write(STORAGE.TXNS, []); // transactions
      write(STORAGE.SETTINGS, { adminPassword: adminPass });
      console.log("Initialized storage. Admin password:", adminPass);
      // only alert during first init to show credentials
      try {
        alert(
          "Initialized demo users:\nAdmin: PPT@Admin2025\nManager: manager123\nModerator: mod123"
        );
      } catch (e) {}
    }
    if (!read(STORAGE.TASKS)) write(STORAGE.TASKS, []);
    if (!read(STORAGE.TXNS)) write(STORAGE.TXNS, []);
  }

  function uid(prefix = "id") {
    return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 9000);
  }

  /* ---------- Bootstrap ---------- */
  ensureInit();
  const settings = () => read(STORAGE.SETTINGS) || {};
  const usersFn = () => read(STORAGE.USERS) || [];
  const tasksFn = () => read(STORAGE.TASKS) || [];
  const txnsFn = () => read(STORAGE.TXNS) || [];

  /* ---------- UI references ---------- */
  const pwInput = document.getElementById("pw");
  const loginBtn = document.getElementById("loginBtn");
  const loginBox = document.getElementById("loginBox");
  const loginError = document.getElementById("loginError");
  const dash = document.getElementById("dash");
  const whoSpan = document.getElementById("who");
  const logoutBtn = document.getElementById("logoutBtn");

  const aTitle = document.getElementById("aTitle");
  const aLink = document.getElementById("aLink");
  const aBudget = document.getElementById("aBudget");
  const aCount = document.getElementById("aCount");
  const aPost = document.getElementById("aPost");

  const taskFilter = document.getElementById("taskFilter");
  const taskList = document.getElementById("taskList");
  const searchUser = document.getElementById("searchUser");
  const userList = document.getElementById("userList");

  const payEligible = document.getElementById("payEligible");
  const payHistory = document.getElementById("payHistory");

  let currentAdmin = null;
  /* ---------- Auth handlers (login with password for the 3 roles) ---------- */
  loginBtn.addEventListener("click", () => {
    const entered = pwInput.value.trim();
    const s = settings();
    const allUsers = usersFn();

    // 1️⃣ Quick SuperAdmin access (uses global admin password)
    if (s.adminPassword && entered === s.adminPassword) {
      const adminUser =
        allUsers.find((u) => u.role === "admin") ||
        allUsers.find((u) =>
          ["admin", "manager", "moderator"].includes(u.role)
        );
      currentAdmin = adminUser || {
        id: "u_admin",
        name: "SuperAdmin",
        role: "admin",
      };
      showDashboard();
      return;
    }

    // 2️⃣ Match any admin/manager/moderator by password only
    const match = allUsers.find(
      (u) =>
        ["admin", "manager", "moderator"].includes(u.role) &&
        u.password === entered
    );

    if (match) {
      currentAdmin = match;
      showDashboard();
      return;
    }

    // 3️⃣ Invalid password case
    loginError.classList.remove("hidden");
    setTimeout(() => loginError.classList.add("hidden"), 2500);
  });

  // Automatic re-render if other tab modified storage
  window.addEventListener("storage", (ev) => {
    if (
      ev.key === STORAGE.TASKS ||
      ev.key === STORAGE.USERS ||
      ev.key === STORAGE.TXNS
    ) {
      // re-render UI if dashboard visible
      if (!dash.classList.contains("hidden")) {
        renderTasks();
        renderUsers();
        renderPayHistory();
      }
    }
  });

  logoutBtn.addEventListener("click", () => {
    currentAdmin = null;
    dash.classList.add("hidden");
    loginBox.classList.remove("hidden");
    pwInput.value = "";
  });

  function showDashboard() {
    loginBox.classList.add("hidden");
    loginError.classList.add("hidden");
    dash.classList.remove("hidden");
    whoSpan.textContent = `${currentAdmin.name} (${currentAdmin.role})`;
    renderTasks();
    renderUsers();
    renderPayHistory();
  }

  /* ---------- Posting admin tasks (visible to earners) ---------- */
  aPost.addEventListener("click", () => {
    // ensure admin logged in
    if (!currentAdmin) return alert("Login first");
    const title = String(aTitle.value || "").trim();
    const link = String(aLink.value || "").trim();
    const budget = parseFloat(aBudget.value) || 0;
    const count = parseInt(aCount.value) || 1;
    if (!title || !link || count <= 0)
      return alert("Please fill title, link and count");

    const newTask = {
      id: uid("task"),
      title,
      link,
      budget,
      count,
      remaining: count,
      createdAt: new Date().toISOString(),
      postedBy: currentAdmin.id || "u_admin",
      postedByName: currentAdmin.name || "Admin",
      type: "admin", // admin vs creator
      plan: null,
      creatorId: null,
      creatorPaymentMethod: null,
      earnerSharePercent: 0.2, // admin tasks -> 20% to earners
      status: "active",
      claims: [],
    };

    const all = tasksFn();
    all.unshift(newTask);
    write(STORAGE.TASKS, all);
    // notify other pages (storage event only fires across windows - trigger manual event)
    renderTasks();
    // clear fields
    aTitle.value = aLink.value = aBudget.value = aCount.value = "";
    // also update other UIs by writing the same key (already done)
  });

  /* ---------- Helpers for colors & sorting ---------- */
  function colorForPlan(plan) {
    if (!plan) return "#f5f5f5";
    // diamond: user wanted purple instead of #e6ffed earlier; use light purple
    if (plan.toLowerCase() === "diamond") return "#E6E6FF"; // purple tinted
    if (plan.toLowerCase() === "premium") return "#fff8e1"; // yellow tinted
    return "#e8f0ff"; // blue tinted for standard
  }

  /* ---------- Task rendering & filtering ---------- */
  taskFilter && taskFilter.addEventListener("change", renderTasks);

  function renderTasks() {
    const filter = (taskFilter && taskFilter.value) || "all";
    let list = tasksFn().slice() || [];

    // sort: creator posts prioritized by plan: Diamond > Premium > Standard, then admin posts
    const order = { diamond: 3, premium: 2, standard: 1, null: 0 };
    list.sort((a, b) => {
      const aord = a.plan ? order[(a.plan || "").toLowerCase()] || 0 : 0;
      const bord = b.plan ? order[(b.plan || "").toLowerCase()] || 0 : 0;
      if (aord !== bord) return bord - aord;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    let html = "";
    list.forEach((t) => {
      if (filter === "active" && t.status !== "active") return;
      if (filter === "completed" && t.status !== "completed") return;
      if (filter === "expired" && t.status !== "expired") return;

      const planColor = colorForPlan(t.plan);
      const badge =
        t.type === "creator"
          ? `<span class="small">Plan: ${t.plan || "Standard"}</span>`
          : `<span class="small">Admin Task</span>`;
      html += `
        <div class="box ${
          t.status === "expired"
            ? "expired"
            : t.status === "completed"
            ? "completed"
            : ""
        }" style="background:${planColor}; margin-bottom:10px;">
          <div class="is-flex is-justify-content-space-between">
            <div>
              <strong>${escapeHtml(t.title)}</strong>
              <div class="small">By: ${escapeHtml(t.postedByName || "")}</div>
              <div class="small">Budget: $${Number(t.budget || 0).toFixed(
                2
              )} • Count: ${t.count} • Remaining: ${t.remaining}</div>
              ${badge}
            </div>
            <div>
              <button class="button is-small" data-action="view" data-id="${
                t.id
              }">View</button>
              <button class="button is-danger is-small" data-action="suspend" data-id="${
                t.id
              }">Suspend</button>
            </div>
          </div>
        </div>
      `;
    });

    taskList.innerHTML = html || "<div>No tasks yet</div>";
    // attach handlers safely
    taskList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const act = btn.dataset.action;
        const id = btn.dataset.id;
        if (act === "view") viewTask(id);
        if (act === "suspend") suspendTask(id);
      });
    });
  }

  function viewTask(id) {
    const t = tasksFn().find((x) => x.id === id);
    if (!t) return alert("Task not found");
    const info = `Title: ${t.title}\nBy: ${t.postedByName}\nBudget: $${
      t.budget
    }\nCount: ${t.count}\nRemaining: ${t.remaining}\nStatus: ${
      t.status
    }\nClaims: ${t.claims ? t.claims.length : 0}`;
    alert(info);
  }

  function suspendTask(id) {
    const all = tasksFn().map((t) => {
      if (t.id === id) {
        t.status = "suspended";
      }
      return t;
    });
    write(STORAGE.TASKS, all);
    renderTasks();
  }

  /* ---------- User management rendering & actions ---------- */
  searchUser && searchUser.addEventListener("input", renderUsers);

  function renderUsers() {
    const q = (searchUser && searchUser.value.trim().toLowerCase()) || "";
    const list = usersFn().filter(
      (u) =>
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
    let html = "";
    list.forEach((u) => {
      html += `
        <div class="box" style="margin-bottom:8px;">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>${escapeHtml(u.name)}</strong>
              <div class="small">${escapeHtml(u.role)} ${
        u.verified ? '<span class="verified">(verified)</span>' : ""
      } ${
        u.suspended ? '<span class="has-text-danger">(suspended)</span>' : ""
      }</div>
              <div class="small">Balance: $${Number(u.balance || 0).toFixed(
                2
              )}</div>
            </div>
            <div>
              <button class="button is-small" data-act="view" data-id="${
                u.id
              }">View</button>
              <button class="button is-warning is-small" data-act="verify" data-id="${
                u.id
              }">${u.verified ? "Unverify" : "Verify"}</button>
              <button class="button is-danger is-small" data-act="suspend" data-id="${
                u.id
              }">${u.suspended ? "Unsuspend" : "Suspend"}</button>
            </div>
          </div>
        </div>
      `;
    });
    userList.innerHTML = html || "<div>No users found</div>";
    userList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        if (act === "view") viewUser(id);
        if (act === "verify") toggleVerifyUser(id);
        if (act === "suspend") toggleSuspendUser(id);
      });
    });
  }

  function viewUser(id) {
    const u = usersFn().find((x) => x.id === id);
    if (!u) return alert("User not found");
    const history =
      (u.history || []).map((h) => `${h.when}: ${h.note}`).join("\n") ||
      "No history";
    alert(
      `Name: ${u.name}\nRole: ${u.role}\nVerified: ${u.verified}\nSuspended: ${
        u.suspended
      }\nBalance: $${(u.balance || 0).toFixed(2)}\nHistory:\n${history}`
    );
  }

  function toggleVerifyUser(id) {
    const us = usersFn().map((u) => {
      if (u.id === id) {
        u.verified = !u.verified;
        (u.history = u.history || []).push({
          when: new Date().toISOString(),
          note: u.verified ? "Verified by admin" : "Unverified by admin",
        });
      }
      return u;
    });
    write(STORAGE.USERS, us);
    renderUsers();
  }

  function toggleSuspendUser(id) {
    const us = usersFn().map((u) => {
      if (u.id === id) {
        u.suspended = !u.suspended;
        (u.history = u.history || []).push({
          when: new Date().toISOString(),
          note: u.suspended ? "Suspended by admin" : "Unsuspended by admin",
        });
      }
      return u;
    });
    write(STORAGE.USERS, us);
    renderUsers();
  }

  /* ---------- Finance: pay eligible users (simple simulation) ---------- */
  payEligible &&
    payEligible.addEventListener("click", () => {
      const MIN = 10;
      let allUsers = usersFn();
      let tx = txnsFn();
      allUsers = allUsers.map((u) => {
        if (u.balance && u.balance >= MIN && !u.suspended) {
          tx.push({
            id: uid("txn"),
            userId: u.id,
            name: u.name,
            amount: u.balance,
            when: new Date().toISOString(),
            method: "manual-payout",
            status: "paid",
          });
          (u.history = u.history || []).push({
            when: new Date().toISOString(),
            note: `Paid out $${u.balance.toFixed(2)}`,
          });
          u.balance = 0;
        }
        return u;
      });
      write(STORAGE.USERS, allUsers);
      write(STORAGE.TXNS, tx);
      renderUsers();
      renderPayHistory();
      alert(
        "Payment simulation complete (paid users with balance >= $" + MIN + ")."
      );
    });

  function renderPayHistory() {
    const tx = txnsFn();
    let html = '<div class="box">';
    if (!tx.length) html += "<div>No payments yet</div>";
    tx.slice()
      .reverse()
      .forEach((t) => {
        html += `<div class="small">${t.when} • ${t.name} • $${t.amount.toFixed(
          2
        )} • ${t.status}</div>`;
      });
    html += "</div>";
    payHistory.innerHTML = html;
  }

  /* ---------- Helper: create transaction & update balances ---------- */
  function recordTransaction({ userId, amount, type = "credit", note = "" }) {
    const tx = txnsFn();
    tx.push({
      id: uid("txn"),
      userId,
      amount,
      type,
      note,
      when: new Date().toISOString(),
    });
    write(STORAGE.TXNS, tx);
  }

  /* ---------- Utility ---------- */
  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(
      /[&<>"'`]/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
          "`": "&#96;",
        }[m])
    );
  }

  /* expose some helpers globally so creator/earner pages can call them if needed */
  window.PPT_ADMIN = {
    readSettings: () => read(STORAGE.SETTINGS),
    getUsers: usersFn,
    getTasks: tasksFn,
    saveUsers: (u) => write(STORAGE.USERS, u),
    saveTasks: (t) => write(STORAGE.TASKS, t),
    saveTxns: (x) => write(STORAGE.TXNS, x),
    recordTransaction,
  };

  // Initial render (if admin was previously logged in in this session, we don't auto login)
  renderTasks();
  renderUsers();
  renderPayHistory();
})();
