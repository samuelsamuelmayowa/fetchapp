 // earner-dashboard.js
// Attach to earner HTML (ids: uname, uReg, notify, tasksArea, myAccount, withdrawBtn, activity)
// This file shows available tasks (both admin and creator posts), allows earners to register/switch username (local), complete tasks and claim earnings.
// Uses the same localStorage keys as other files.

(function(){
  const STORAGE = { USERS:'ppt_users', TASKS:'ppt_tasks', TXNS:'ppt_transactions', SETTINGS:'ppt_settings' };
  function read(k){ return JSON.parse(localStorage.getItem(k) || 'null'); }
  function write(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function uid(p='id'){ return p + '_' + Date.now() + '_' + Math.floor(Math.random()*9000); }

  const uname = document.getElementById('uname');
  const uReg = document.getElementById('uReg');
  const notify = document.getElementById('notify');
  const tasksArea = document.getElementById('tasksArea');
  const myAccount = document.getElementById('myAccount');
  const withdrawBtn = document.getElementById('withdrawBtn');
  const activity = document.getElementById('activity');

  // session user stored in sessionStorage for demo
  function setSessionUser(user){
    sessionStorage.setItem('ppt_session_user', JSON.stringify(user));
    notifyUser(`Switched to ${user.name}`, 'is-info');
    renderDashboard();
  }
  function getSessionUser(){
    return JSON.parse(sessionStorage.getItem('ppt_session_user') || 'null');
  }

  // Register / switch username (creates or grabs existing user)
  uReg.addEventListener('click', () => {
    const name = uname.value.trim();
    if(!name) return notifyUser('Enter a username to register/switch', 'is-warning');
    let all = read(STORAGE.USERS) || [];
    let user = all.find(u => u.name.toLowerCase() === name.toLowerCase());
    if(!user){
      user = { id: uid('u'), name, role:'earner', balance:0, suspended:false, verified:false, history:[] };
      all.push(user);
      write(STORAGE.USERS, all);
    }
    setSessionUser(user);
  });

  function notifyUser(msg, cls='is-success'){
    notify.className = 'notification ' + (cls||'is-success') + ' mt-2';
    notify.textContent = msg;
    setTimeout(()=> { notify.className = 'notification is-hidden'; notify.textContent = ''; }, 3000);
  }

  // Render tasks (both admin & creator), with plan color coding and ordering
  function colorForPlan(plan){
    if(!plan) return '#f5f5f5';
    if(plan.toLowerCase() === 'diamond') return '#E6E6FF'; // light purple tone
    if(plan.toLowerCase() === 'premium') return '#fff8e1';
    return '#e8f0ff';
  }

  function renderDashboard(){
    const sess = getSessionUser();
    if(!sess) {
      tasksArea.innerHTML = '<div class="notification is-warning">Please register / switch your username above to participate.</div>';
      myAccount.innerHTML = '';
      activity.innerHTML = '';
      return;
    }
    if(sess.suspended) {
      tasksArea.innerHTML = '<div class="notification is-danger">Your account is suspended. Contact admin.</div>';
      return;
    }

    // Load and normalize tasks
    let list = (read(STORAGE.TASKS) || []).map(t => ({
      ...t,
      status: t.status || 'active',
      claims: t.claims || [],
      earnerSharePercent: t.earnerSharePercent ?? 0.4,
      postedByName: t.postedByName || 'Admin',
      plan: t.plan || 'Standard'
    }));

    // Filter active tasks only
    list = list.filter(t => t.status === 'active');

    // Sort by plan priority (Diamond → Premium → Standard → others)
    const order = { diamond:3, premium:2, standard:1, admin:0 };
    list.sort((a,b) => {
      const aord = order[a.plan?.toLowerCase()] || 0;
      const bord = order[b.plan?.toLowerCase()] || 0;
      if (aord !== bord) return bord - aord;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    let html = '';
    list.forEach(t => {
      const planColor = colorForPlan(t.plan);
      const perActionReward = computePerActionReward(t);
      html += `
        <div class="box" style="background:${planColor}; margin-bottom:8px;">
          <div><strong>${t.title}</strong></div>
          <div class="small">By: ${t.postedByName} • Budget: $${t.budget.toFixed(2)} • Count: ${t.count} • Remaining: ${t.remaining}</div>
          <div class="mt-2">
            <button class="button is-small" data-act="do" data-id="${t.id}">Do Task</button>
            <button class="button is-light is-small" data-act="claim" data-id="${t.id}">Claim ($${perActionReward.toFixed(2)} per action)</button>
          </div>
        </div>
      `;
    });
    tasksArea.innerHTML = html || '<div>No tasks available</div>';

    // Attach handlers
    tasksArea.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        if(act === 'do') doTask(id);
        if(act === 'claim') claimTask(id);
      });
    });

    // Account section
    const users = read(STORAGE.USERS) || [];
    const me = users.find(u => u.id === sess.id) || sess;
    myAccount.innerHTML = `<div class="box"><div><strong>${me.name}</strong></div><div class="small">Balance: $${(me.balance||0).toFixed(2)} • Verified: ${me.verified ? 'Yes' : 'No'} • Suspended: ${me.suspended ? 'Yes' : 'No'}</div></div>`;

    // Activity section
    const hist = (me.history || []).slice().reverse().map(h => `<div class="small">${h.when}: ${h.note}</div>`).join('');
    activity.innerHTML = `<div class="box"><strong>Activity</strong>${hist || '<div class="small">No activity</div>'}</div>`;
  }

  function computePerActionReward(task){
    const earnerTotal = (task.budget || 0) * (task.earnerSharePercent || 0);
    const perAction = task.count > 0 ? (earnerTotal / task.count) : 0;
    return perAction;
  }

  function doTask(taskId){
    const sess = getSessionUser();
    if(!sess) return notifyUser('Register first', 'is-warning');
    let all = read(STORAGE.TASKS) || [];
    const t = all.find(x => x.id === taskId);
    if(!t) return notifyUser('Task not found', 'is-danger');
    if(t.remaining <= 0) return notifyUser('No remaining slots for this task', 'is-warning');
    if(sess.suspended) return notifyUser('Account suspended', 'is-danger');

    const already = t.claims && t.claims.find(c => c.earnerId === sess.id && c.action === 'attempt');
    if(already) return notifyUser('You already did this task. Click Claim to claim reward if eligible.', 'is-info');

    t.claims = t.claims || [];
    t.claims.push({ earnerId: sess.id, earnerName: sess.name, when:new Date().toISOString(), action:'attempt', reward:0, claimed:false });
    write(STORAGE.TASKS, all);

    if(t.link) window.open(t.link, '_blank');
    notifyUser('Task action recorded. Now click Claim to claim reward when eligible.', 'is-success');
    renderDashboard();
  }

  function claimTask(taskId){
    const sess = getSessionUser();
    if(!sess) return notifyUser('Register first', 'is-warning');
    let allTasks = read(STORAGE.TASKS) || [];
    let t = allTasks.find(x => x.id === taskId);
    if(!t) return notifyUser('Task not found', 'is-danger');
    if(t.remaining <= 0) return notifyUser('No remaining rewards', 'is-warning');
    if(sess.suspended) return notifyUser('Account suspended', 'is-danger');

    const attemptIndex = (t.claims||[]).findIndex(c => c.earnerId === sess.id && c.action === 'attempt' && !c.claimed);
    if(attemptIndex === -1) return notifyUser('You must "Do Task" first before claiming.', 'is-warning');

    const perAction = computePerActionReward(t);
    const users = read(STORAGE.USERS) || [];
    const me = users.find(u => u.id === sess.id);
    if(!me) return notifyUser('User record not found', 'is-danger');

    me.balance = (me.balance || 0) + perAction;
    (me.history = me.history || []).push({ when:new Date().toISOString(), note:`Claimed $${perAction.toFixed(2)} for task ${t.id}` });

    const tx = read(STORAGE.TXNS) || [];
    tx.push({ id: uid('txn'), userId: me.id, amount: perAction, when:new Date().toISOString(), type:'earn', note:`Claim for task ${t.id}` });

    t.claims[attemptIndex].claimed = true;
    t.claims[attemptIndex].reward = perAction;
    t.remaining = Math.max(0, t.remaining - 1);
    if(t.remaining === 0) t.status = 'completed';

    const platformShare = (t.budget || 0) * (1 - (t.earnerSharePercent || 0)) / t.count;
    tx.push({ id: uid('txn'), userId: 'platform', amount: platformShare, when:new Date().toISOString(), type:'platform', note:`Platform share for task ${t.id}` });

    write(STORAGE.USERS, users.map(u => u.id === me.id ? me : u));
    write(STORAGE.TASKS, allTasks);
    write(STORAGE.TXNS, tx);

    setSessionUser(me);
    notifyUser(`Claim successful: $${perAction.toFixed(2)} added to your balance.`, 'is-success');
    renderDashboard();
  }

  withdrawBtn && withdrawBtn.addEventListener('click', () => {
    const sess = getSessionUser();
    if(!sess) return notifyUser('Register first', 'is-warning');
    const users = read(STORAGE.USERS) || [];
    const me = users.find(u => u.id === sess.id);
    if(!me) return notifyUser('User record missing', 'is-danger');
    if((me.balance||0) < 10) return notifyUser('Minimum withdraw is $10', 'is-warning');

    const tx = read(STORAGE.TXNS) || [];
    tx.push({ id: uid('txn'), userId: me.id, amount: me.balance, when:new Date().toISOString(), type:'withdraw', status:'requested' });
    me.history = me.history || [];
    me.history.push({ when:new Date().toISOString(), note:`Requested withdraw of $${me.balance.toFixed(2)}`});
    me.balance = 0;
    write(STORAGE.USERS, users.map(u => u.id===me.id ? me : u));
    write(STORAGE.TXNS, tx);
    setSessionUser(me);
    notifyUser('Withdraw requested. Admin will process payment.', 'is-info');
    renderDashboard();
  });

  (function init(){
    const sess = getSessionUser();
    if(sess) uname.value = sess.name;
    renderDashboard();
  })();

  window.addEventListener('focus', renderDashboard);
  window.PPT_EARNER = { renderDashboard, computePerActionReward };
})();
