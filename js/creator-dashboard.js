/** @format */

// creator-dashboard.js (updated + password login + admin/earner sync)
(function () {
  const STORAGE = {
    USERS: "ppt_users",
    TASKS: "ppt_tasks",
    TXNS: "ppt_transactions",
    SETTINGS: "ppt_settings",
  };
  function read(k) {
    return JSON.parse(localStorage.getItem(k) || "null");
  }
  function write(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }
  function uid(p = "id") {
    return p + "_" + Date.now() + "_" + Math.floor(Math.random() * 9000);
  }

  /* ---------------- LOGIN / AUTH SECTION ---------------- */
  const CREATOR_KEY = "ppt_current_creator";
  let currentCreator = JSON.parse(localStorage.getItem(CREATOR_KEY) || "null");

  if (!currentCreator) {
    const allUsers = read(STORAGE.USERS) || [];
    let name = prompt("Enter your creator name to login or register:");
    let password = prompt(
      "Enter password (for new creator, this will be saved):"
    );
    if (!name) return alert("Creator name required.");

    let user = allUsers.find(
      (u) => u.name.toLowerCase() === name.toLowerCase() && u.role === "creator"
    );
    if (!user) {
      // create new creator with password
      user = {
        id: uid("u"),
        name,
        role: "creator",
        plan: "Standard",
        password,
        balance: 0,
        suspended: false,
        verified: false,
        history: [{ when: new Date().toISOString(), note: "Account created" }],
      };
      allUsers.push(user);
      write(STORAGE.USERS, allUsers);
      alert("Creator account created and logged in.");
    } else {
      if (user.password !== password) return alert("Incorrect password.");
      alert("Welcome back, " + user.name);
    }
    localStorage.setItem(CREATOR_KEY, JSON.stringify(user));
    currentCreator = user;
  }

  /* ---------------- UI BINDINGS ---------------- */
  document.getElementById("creatorName").value = currentCreator.name;

  // plan cards
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".plan-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const plan = card.dataset.plan;
      const discount = parseFloat(card.dataset.discount) || 0;
      const monthly = parseFloat(card.dataset.monthly) || 0;
      document.getElementById("selectedPlan").textContent = plan;
      document.getElementById("selectedDiscount").textContent = discount;
      document.getElementById("monthlyPrice").textContent = monthly.toFixed(2);
      document.getElementById("sixMonth").textContent = (
        monthly *
        6 *
        (1 - discount / 100)
      ).toFixed(2);
      document.getElementById("twelveMonth").textContent = (
        monthly *
        12 *
        (1 - discount / 100)
      ).toFixed(2);
      document.getElementById("pricingSummary").classList.add("show");
      window.pptCreatorPlan = { plan, discount, monthly };
      recalcTotal();
    });
  });

  const platformSelect = document.getElementById("platform");
  const actionCount = document.getElementById("actionCount");
  const cLink = document.getElementById("cLink");
  const totalCostSpan = document.getElementById("totalCost");
  const createBtn = document.getElementById("createBtn");

  const pricing = {
    facebook_follow: 0.01,
    facebook_view: 0.007,
    youtube_sub: 0.02,
    youtube_view: 0.007,
    tiktok_follow: 0.01,
    tiktok_view: 0.005,
    instagram_follow: 0.01,
    instagram_view: 0.005,
    app_install: 0.03,
  };

  function recalcTotal() {
    const plan = window.pptCreatorPlan || { discount: 0 };
    const priceKey = platformSelect.value;
    const perAction = pricing[priceKey] || 0;
    const count = parseInt(actionCount.value || 0);
    let total = perAction * count;
    total = total * (1 - (plan.discount || 0) / 100);
    totalCostSpan.textContent = total.toFixed(2);
    window.pptCreatorPendingTotal = total;
  }

  platformSelect.addEventListener("change", recalcTotal);
  actionCount.addEventListener("input", recalcTotal);

  /* ---------------- CREATE TASK ---------------- */
  createBtn.addEventListener("click", () => {
    const planObj = window.pptCreatorPlan || { plan: "Standard", discount: 0 };
    const link = cLink.value.trim();
    const platform = platformSelect.value;
    const count = parseInt(actionCount.value) || 1;
    const budget = parseFloat(window.pptCreatorPendingTotal || 0);

    const payMethod = prompt("Enter payment method: (card / crypto / bank)");

    if (!["card", "crypto", "bank"].includes((payMethod || "").toLowerCase())) {
      return alert("Invalid payment method. Use card / crypto / bank.");
    }

    let allUsers = read(STORAGE.USERS) || [];
    let creator = allUsers.find((u) => u.id === currentCreator.id);
    if (!creator) {
      alert("Error: Creator record not found.");
      return;
    }

    const creatorBalanceInput = parseFloat(
      document.getElementById("creatorBalance").value || 0
    );
    if (creatorBalanceInput < budget) {
      if (
        !confirm(
          `Balance $${creatorBalanceInput.toFixed(2)} < cost $${budget.toFixed(
            2
          )}. Proceed anyway?`
        )
      ) {
        return;
      }
    }

    const task = {
      id: uid("task"),
      title: `${platform} • ${link}`,
      link,
      budget,
      count,
      remaining: count,
      createdAt: new Date().toISOString(),
      postedBy: creator.id,
      postedByName: creator.name,
      type: "creator",
      plan: planObj.plan || "Standard",
      creatorPaymentMethod: payMethod,
      earnerSharePercent: 0.4,
      status: "active",
      claims: [],
    };

    const allTasks = read(STORAGE.TASKS) || [];
    allTasks.unshift(task);
    write(STORAGE.TASKS, allTasks);

    // record transaction
    const txns = read(STORAGE.TXNS) || [];
    txns.push({
      id: uid("txn"),
      when: new Date().toISOString(),
      from: creator.id,
      amount: budget,
      note: `Creator post (${task.id})`,
      method: payMethod,
    });
    write(STORAGE.TXNS, txns);

    // update user balance
    allUsers = allUsers.map((u) => {
      if (u.id === creator.id) {
        u.balance = (u.balance || 0) - budget;
        (u.history = u.history || []).push({
          when: new Date().toISOString(),
          note: `Posted task ${task.id}, paid $${budget}`,
        });
      }
      return u;
    });
    write(STORAGE.USERS, allUsers);

    alert(
      "✅ Task posted successfully! It will now appear for earners and admin."
    );

    renderCreatorTasks(creator.id);
    renderCreatorPayments(creator.id);
  });

  /* ---------------- RENDER FUNCTIONS ---------------- */
  function renderCreatorTasks(creatorId) {
    const tasks = read(STORAGE.TASKS) || [];
    const my = tasks.filter((t) => t.postedBy === creatorId);
    const container = document.getElementById("creatorTasks");
    if (!container) return;
    let html = "";
    if (!my.length) html = "<div>No tasks posted yet</div>";
    my.forEach((t) => {
      const color =
        t.plan === "Diamond"
          ? "#8000FF"
          : t.plan === "Premium"
          ? "#fff8e1"
          : "#e8f0ff";
      html += `
        <div class="box" style="background:${color}; margin-bottom:8px;">
          <div><strong>${t.title}</strong></div>
          <div class="small">Budget $${t.budget.toFixed(2)} • Count ${
        t.count
      } • Remaining ${t.remaining} • Plan: ${t.plan}</div>
          <div class="mt-2"><button class="button is-small" data-act="view" data-id="${
            t.id
          }">View</button></div>
        </div>
      `;
    });
    container.innerHTML = html;
    container.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => alert("Task ID: " + b.dataset.id));
    });
  }

  function renderCreatorPayments(creatorId) {
    const tx = read(STORAGE.TXNS) || [];
    const my = tx.filter((t) => t.from === creatorId);
    const container = document.getElementById("creatorPayments");
    if (!container) return;
    let html =
      '<div class="box"><strong>Creator Payments / History</strong><div class="mt-2">';
    if (!my.length) html += "<div>No payments yet</div>";
    my.forEach(
      (t) =>
        (html += `<div class="small">${t.when} • $${t.amount.toFixed(2)} • ${
          t.note
        } • ${t.method || ""}</div>`)
    );
    html += "</div></div>";
    container.innerHTML = html;
  }

  renderCreatorTasks(currentCreator.id);
  renderCreatorPayments(currentCreator.id);

  window.addEventListener("focus", () => {
    renderCreatorTasks(currentCreator.id);
    renderCreatorPayments(currentCreator.id);
  });

  recalcTotal();
})();
