// ============================================================
// T2_FEATURES.JS — PayFlow Tracker UI
// ============================================================

const T2UI = (() => {

  let _plan     = null;
  let _tab      = 'bycheck';
  let _setupSub = 'expenses';
  let _checkIdx = 0;

  function plan(force) { if (!_plan||force) _plan=T2.buildPlan(); return _plan; }
  function refresh()   { _plan=null; renderApp(); }

  function upcomingIdx() {
    const today = T2.fmtDate(new Date());
    const { checks } = plan();
    const i = checks.findIndex(c => c.date >= today);
    return i >= 0 ? i : Math.max(0, checks.length-1);
  }

  // ══════════════════════════════════════════════════════════
  // ROOT RENDER
  // ══════════════════════════════════════════════════════════
  function renderApp() {
    const root = document.getElementById('app');
    const tabs = [
      { id:'bycheck', icon:'💳', label:'By Check' },
      { id:'overview',icon:'📋', label:'Overview'  },
      { id:'bnpl',    icon:'🔗', label:'BNPL'      },
      { id:'cc',      icon:'💰', label:'Cards'     },
      { id:'streaks', icon:'🔥', label:'Streaks'   },
      { id:'stats',   icon:'📊', label:'Stats'     },
      { id:'setup',   icon:'⚙️', label:'Setup'     },
    ];
    root.innerHTML = `
      <header class="pf-header">
        <div class="pf-header-inner">
          <div class="pf-logo"><span class="pf-logo-icon">⚡</span>PayFlow</div>
          <div class="pf-date">${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
        </div>
      </header>
      <nav class="pf-nav" id="pfNav">
        ${tabs.map(t=>`
          <button class="pf-tab ${t.id===_tab?'active':''}" data-tab="${t.id}">
            <span class="pf-tab-icon">${t.icon}</span>
            <span class="pf-tab-label">${t.label}</span>
          </button>`).join('')}
      </nav>
      <main class="pf-content" id="pfContent">${renderTab(_tab)}</main>`;
    bindNav(); bindTab(_tab);
  }

  function renderTab(t) {
    switch(t) {
      case 'bycheck':  return renderByCheck();
      case 'overview': return renderOverview();
      case 'bnpl':     return renderBNPL();
      case 'cc':       return renderCC();
      case 'streaks':  return renderStreaks();
      case 'stats':    return renderStats();
      case 'setup':    return renderSetup();
      default: return '';
    }
  }

  function bindNav() {
    document.getElementById('pfNav').addEventListener('click', e => {
      const btn = e.target.closest('.pf-tab');
      if (!btn) return;
      _tab = btn.dataset.tab;
      if (_tab==='bycheck') _checkIdx = upcomingIdx();
      refresh();
      btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    });
  }
  function bindTab(t) {
    switch(t) {
      case 'bycheck':  bindByCheck();  break;
      case 'overview': bindOverview(); break;
      case 'bnpl':     break;
      case 'cc':       bindCC();        break;
      case 'streaks':  bindStreaks();   break;
      case 'setup':    bindSetup();    break;
    }
  }

  // Type badge
  const TC = {
    'Affirm':'tc-affirm','Klarna':'tc-klarna','Pay in 4':'tc-pay4',
    'Credit Card':'tc-cc','Loan':'tc-loan','Subscription':'tc-sub',
    'Debt Mgmt':'tc-dmp','Student Loan':'tc-student',
  };
  function badge(type) {
    return `<span class="type-badge ${TC[type]||'tc-other'}">${type}</span>`;
  }

  // ══════════════════════════════════════════════════════════
  // BY CHECK
  // ══════════════════════════════════════════════════════════
  function renderByCheck() {
    const { checks, cfg } = plan();
    if (!checks.length) return '<p class="empty">No checks.</p>';
    if (_checkIdx >= checks.length) _checkIdx = 0;
    const c       = checks[_checkIdx];
    const paidSet = new Set(c.paidExpenses);
    const paidAmt = c.expenses.filter(e=>paidSet.has(e.occId)).reduce((s,e)=>s+e.amount,0);
    const totalIn = c.grossIncome + c.prnIncome;
    const warn    = cfg.surplusWarning;

    // Period label
    const periodEnd = c.nextDate
      ? T2.fmtShort(T2.fmtDate(T2.addDays(T2.parseDate(c.nextDate),-1)))
      : 'end of plan';

    // Group expenses by type
    const groups = {};
    for (const e of c.expenses) {
      if (!groups[e.type]) groups[e.type]=[];
      groups[e.type].push(e);
    }
    const typeOrder = ['Loan','Credit Card','Debt Mgmt','Student Loan','Affirm','Klarna','Pay in 4','Subscription'];
    const sortedGroups = [...typeOrder.filter(t=>groups[t]), ...Object.keys(groups).filter(t=>!typeOrder.includes(t))];

    const surpCls = c.surplus < 0 ? 'surplus-neg' : c.surplus < 400 ? 'surplus-warn' : 'surplus-ok';

    return `
      <div class="bc-wrap">
        <!-- Nav -->
        <div class="bc-nav">
          <button class="pf-nav-btn" id="prevC" ${_checkIdx===0?'disabled':''}>‹</button>
          <div class="bc-head">
            <div class="bc-date">${T2.fmtShort(c.date)}</div>
            <div class="bc-period">Covers ${T2.fmtShort(c.date)} → ${periodEnd}</div>
            <div class="bc-sub">Check ${_checkIdx+1} of ${checks.length}</div>
          </div>
          <button class="pf-nav-btn" id="nextC" ${_checkIdx>=checks.length-1?'disabled':''}>›</button>
        </div>

        <select id="jumpSel" class="pf-select small">
          ${checks.map((ch,i)=>`<option value="${i}" ${i===_checkIdx?'selected':''}>${T2.fmtShort(ch.date)} — ${ch.expenses.length} expenses</option>`).join('')}
        </select>

        <!-- PRN / Extra Income -->
        <div class="prn-row">
          <div class="prn-label">
            <span>⚡ PRN / Extra Income</span>
            ${c.prnIncome>0?`<span class="prn-badge">+${T2.fmtMoney(c.prnIncome)} added</span>`:''}
          </div>
          <div class="prn-inputs">
            <input type="number" id="prnAmt" class="pf-input" placeholder="Amount" min="0" step="0.01">
            <button class="pf-btn-sm" id="addPRN">Add</button>
            <button class="pf-btn-sm ghost" id="setPRN">Set</button>
          </div>
        </div>

        ${c.surplus < warn ? `
          <div class="alert-box ${c.surplus<0?'alert-neg':'alert-warn'}">
            ${c.surplus<0?'🔴':'⚠️'} ${c.surplus<0?'Deficit':'Low surplus'}: ${T2.fmtMoney(c.surplus)}
          </div>` : ''}

        <!-- Summary cards -->
        <div class="bc-cards">
          <div class="bc-card green">
            <div class="bc-card-lbl">Income</div>
            <div class="bc-card-val">${T2.fmtMoney(totalIn)}</div>
            ${c.prnIncome>0?`<div class="bc-card-sub">+${T2.fmtMoney(c.prnIncome)} PRN</div>`:''}
          </div>
          <div class="bc-card red">
            <div class="bc-card-lbl">Expenses</div>
            <div class="bc-card-val">${T2.fmtMoney(c.totalExpenses)}</div>
            <div class="bc-card-sub">${c.expenses.length} items</div>
          </div>
          <div class="bc-card orange">
            <div class="bc-card-lbl">Living</div>
            <div class="bc-card-val">${T2.fmtMoney(c.living + c.extraTotal)}</div>
            <div class="bc-card-sub">${c.extraTotal>0?`+${T2.fmtMoney(c.extraTotal)} extra`:'food·gas·out'}</div>
          </div>
          <div class="bc-card ${surpCls}">
            <div class="bc-card-lbl">Left Over</div>
            <div class="bc-card-val">${T2.fmtMoney(c.surplus)}</div>
          </div>
        </div>

        <!-- Paid progress -->
        <div class="paid-track">
          <div class="paid-track-lbl"><span>Bills Paid</span><span>${T2.fmtMoney(paidAmt)} / ${T2.fmtMoney(c.totalExpenses)}</span></div>
          <div class="paid-track-bar"><div class="paid-track-fill" style="width:${c.totalExpenses>0?Math.min(100,paidAmt/c.totalExpenses*100):0}%"></div></div>
        </div>

        <!-- Expenses by type -->
        ${sortedGroups.map(type => {
          const items = groups[type];
          if (!items) return '';
          const groupTotal = items.reduce((s,e)=>s+e.amount,0);
          return `
            <div class="exp-group">
              <div class="exp-group-hdr">
                ${badge(type)}
                <span class="exp-group-total">${T2.fmtMoney(groupTotal)}</span>
              </div>
              ${items.map(e => {
                const paid = paidSet.has(e.occId);
                const name = e.label || e.provider;
                const endTxt = e.lastPayment ? `ends ${T2.fmtShort(e.lastPayment)}` : 'ongoing';
                return `
                  <div class="exp-row ${paid?'exp-paid':''}" data-occ="${e.occId}">
                    <label class="exp-ck-wrap">
                      <input type="checkbox" class="exp-cb" data-check="${c.id}" data-occ="${e.occId}" ${paid?'checked':''}>
                    </label>
                    <div class="exp-info">
                      <div class="exp-name">${name}</div>
                      <div class="exp-meta">Due ${T2.fmtShort(e.dueDate)} · ${endTxt}${e.moved?' · moved':''}</div>
                    </div>
                    <div class="exp-amt ${paid?'exp-paid-amt':''}">${T2.fmtMoney(e.amount)}</div>
                    <button class="move-btn" data-occ="${e.occId}">↕</button>
                  </div>`;
              }).join('')}
            </div>`;
        }).join('')}

        ${c.expenses.length === 0 ? '<div class="empty">No expenses this period 🎉</div>' : ''}

        <!-- Living expenses breakdown -->
        <div class="sec-title">Living Expenses This Check</div>
        <div class="living-grid">
          <div class="living-item"><span>🛒 Food</span><span>${T2.fmtMoney(cfg.living.food||0)}</span></div>
          <div class="living-item"><span>⛽ Gas</span><span>${T2.fmtMoney(cfg.living.gas||0)}</span></div>
          <div class="living-item"><span>🍽 Eating Out</span><span>${T2.fmtMoney(cfg.living.eatingOut||0)}</span></div>
          <div class="living-item"><span>🗂 Misc</span><span>${T2.fmtMoney(cfg.living.misc||0)}</span></div>
        </div>

        <!-- Extra / Misc expenses logged this check -->
        <div class="sec-title">Extra & Misc Expenses</div>
        <div class="extra-form">
          <input type="text"   id="extraDesc" class="pf-input" placeholder="Description (e.g. tire repair)">
          <div class="extra-form-row">
            <input type="number" id="extraAmt"  class="pf-input" placeholder="Amount" min="0" step="0.01">
            <select id="extraCat" class="pf-select">
              <option>Misc</option><option>Food</option><option>Clothing</option>
              <option>Medical</option><option>Home</option><option>Entertainment</option><option>Other</option>
            </select>
          </div>
          <button class="pf-btn" id="addExtraBtn">+ Log Expense</button>
        </div>
        ${c.extraItems.length > 0 ? `
          <div class="extra-list">
            ${c.extraItems.map(item=>`
              <div class="extra-item">
                <div>
                  <div class="extra-item-desc">${item.desc}</div>
                  <div class="extra-item-cat">${item.category}</div>
                </div>
                <div class="extra-item-right">
                  <span class="neg">${T2.fmtMoney(item.amount)}</span>
                  <button class="del-btn" data-eid="${item.id}">✕</button>
                </div>
              </div>`).join('')}
            <div class="extra-total">
              <span>Extra total</span>
              <span class="neg">${T2.fmtMoney(c.extraTotal)}</span>
            </div>
          </div>` : '<div class="empty-sm">No extra expenses logged.</div>'}

        <!-- Move modal -->
        <div id="moveModal" class="pf-modal hidden">
          <div class="pf-modal-box">
            <div class="pf-modal-title">Move to Which Check?</div>
            <div id="moveOpts"></div>
            <button class="pf-btn ghost sm-btn" id="closeMoveModal">Cancel</button>
          </div>
        </div>

        <!-- Notes -->
        <div class="sec-title">Notes</div>
        <textarea id="checkNotes" class="pf-textarea">${c.notes}</textarea>
        <button class="pf-btn ghost" id="saveNotes">Save Notes</button>
      </div>`;
  }

  function bindByCheck() {
    const { checks } = plan();
    const c = checks[_checkIdx];
    if (!c) return;

    document.getElementById('prevC')?.addEventListener('click',()=>{ if(_checkIdx>0){_checkIdx--;refresh();} });
    document.getElementById('nextC')?.addEventListener('click',()=>{ if(_checkIdx<checks.length-1){_checkIdx++;refresh();} });
    document.getElementById('jumpSel')?.addEventListener('change',e=>{ _checkIdx=parseInt(e.target.value); refresh(); });

    // Paid checkboxes
    document.querySelectorAll('.exp-cb').forEach(cb=>{
      cb.addEventListener('change',()=>{ T2.togglePaid(cb.dataset.check, cb.dataset.occ); refresh(); });
    });

    // PRN
    document.getElementById('addPRN')?.addEventListener('click',()=>{
      const v=parseFloat(document.getElementById('prnAmt').value);
      if(v>0){ T2.addPRN(c.id,v); refresh(); }
    });
    document.getElementById('setPRN')?.addEventListener('click',()=>{
      const v=parseFloat(document.getElementById('prnAmt').value);
      if(!isNaN(v)&&v>=0){ T2.setPRN(c.id,v); refresh(); }
    });

    // Move expense
    document.querySelectorAll('.move-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const modal=document.getElementById('moveModal');
        const opts=document.getElementById('moveOpts');
        // Show nearby checks (±4)
        const nearby=checks.slice(Math.max(0,_checkIdx-3),_checkIdx+5)
          .filter(ch=>ch.id!==c.id);
        opts.innerHTML=nearby.map(ch=>
          `<button class="pf-move-opt" data-occ="${btn.dataset.occ}" data-cid="${ch.id}">
             ${T2.fmtShort(ch.date)} <span style="color:var(--text3);font-size:11px;">(${ch.expenses.length} exp)</span>
           </button>`
        ).join('');
        modal.classList.remove('hidden');
        opts.querySelectorAll('.pf-move-opt').forEach(ob=>{
          ob.addEventListener('click',()=>{ T2.moveBill(ob.dataset.occ,ob.dataset.cid); modal.classList.add('hidden'); refresh(); });
        });
      });
    });
    document.getElementById('closeMoveModal')?.addEventListener('click',()=>
      document.getElementById('moveModal').classList.add('hidden'));

    // Extra items
    document.getElementById('addExtraBtn')?.addEventListener('click',()=>{
      const desc=document.getElementById('extraDesc').value.trim();
      const amt =parseFloat(document.getElementById('extraAmt').value);
      const cat =document.getElementById('extraCat').value;
      if(!desc||!amt||amt<=0) return;
      T2.addExtraItem(c.id,{desc,amount:amt,category:cat});
      refresh();
    });
    document.querySelectorAll('.del-btn[data-eid]').forEach(btn=>{
      btn.addEventListener('click',()=>{ T2.deleteExtraItem(c.id,parseInt(btn.dataset.eid)); refresh(); });
    });

    // Notes
    document.getElementById('saveNotes')?.addEventListener('click',()=>{
      T2.saveNotes(c.id,document.getElementById('checkNotes').value);
      showToast('Notes saved');
    });
  }

  // ══════════════════════════════════════════════════════════
  // OVERVIEW
  // ══════════════════════════════════════════════════════════
  function renderOverview() {
    const { checks } = plan();
    const today = T2.fmtDate(new Date());
    const byMonth = {};
    checks.forEach(c=>{ const mo=c.date.substring(0,7); if(!byMonth[mo])byMonth[mo]=[]; byMonth[mo].push(c); });

    return `
      <div class="ov-wrap">
        <div class="sec-title">All Checks <span class="badge">${checks.length}</span></div>
        <div class="ov-table-wrap">
          <table class="ov-table">
            <thead><tr>
              <th>Date</th><th>Period Ends</th><th>Expenses</th><th>Living</th><th>PRN</th><th>Left Over</th>
            </tr></thead>
            <tbody>
              ${Object.entries(byMonth).map(([mo,mch])=>{
                const moS=mch.reduce((s,c)=>s+c.surplus,0);
                return `
                  <tr class="mo-row"><td colspan="5">${fmtMo(mo)}</td><td class="${moS>=0?'pos':'neg'}">${T2.fmtMoney(moS)}</td></tr>
                  ${mch.map(c=>{
                    const end = c.nextDate ? T2.fmtShort(T2.fmtDate(T2.addDays(T2.parseDate(c.nextDate),-1))) : '—';
                    return `
                      <tr class="ov-row ${c.date===today?'today-row':''}" data-idx="${checks.indexOf(c)}">
                        <td>${T2.fmtShort(c.date)}</td>
                        <td style="color:var(--text3);font-size:11px">${end}</td>
                        <td class="neg">${T2.fmtMoney(c.totalExpenses)} <span style="color:var(--text3);font-size:10px">(${c.expenses.length})</span></td>
                        <td>${T2.fmtMoney(c.living+c.extraTotal)}</td>
                        <td class="${c.prnIncome>0?'pos':''}">${c.prnIncome>0?T2.fmtMoney(c.prnIncome):'—'}</td>
                        <td class="${c.surplus>=0?'pos':'neg'}">${T2.fmtMoney(c.surplus)}</td>
                      </tr>`;
                  }).join('')}`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }
  function bindOverview() {
    document.querySelectorAll('.ov-row').forEach(r=>{
      r.addEventListener('click',()=>{ _checkIdx=parseInt(r.dataset.idx); _tab='bycheck'; refresh(); });
    });
  }
  function fmtMo(mo){ const [y,m]=mo.split('-'); return new Date(y,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'}); }

  // ══════════════════════════════════════════════════════════
  // BNPL TAB
  // ══════════════════════════════════════════════════════════
  function renderBNPL() {
    const { cfg } = plan();
    const recoup   = T2.buildRecoupTimeline(cfg);
    const active   = recoup.tempExp;
    const total    = recoup.totalBNPLMonthly;
    const ongoing  = cfg.expenses.filter(e=>e.active && !e.lastPayment);
    const ongoingT = ongoing.reduce((s,e)=>s+e.amount,0);

    return `
      <div class="bnpl-wrap">
        <div class="sec-title">BNPL Overview</div>
        <div class="bnpl-hero">
          <div class="bnpl-metric"><div class="bm-val red">${T2.fmtMoney(total)}</div><div class="bm-lbl">BNPL / month</div></div>
          <div class="bnpl-metric"><div class="bm-val teal">${T2.fmtMoney(total/2)}</div><div class="bm-lbl">Per paycheck</div></div>
          <div class="bnpl-metric"><div class="bm-val orange">${active.length}</div><div class="bm-lbl">Active plans</div></div>
        </div>

        <div class="sec-title">Active Plans <span class="badge">${active.length}</span></div>
        <div class="bnpl-list">
          ${active.sort((a,b)=>a.lastPayment.localeCompare(b.lastPayment)).map(e=>{
            const lbl = e.label || e.provider;
            const now = new Date();
            const end = T2.parseDate(e.lastPayment);
            const moLeft = Math.max(0,(end.getFullYear()-now.getFullYear())*12+(end.getMonth()-now.getMonth())+1);
            return `
              <div class="bnpl-item">
                <div class="bnpl-item-left">${badge(e.type)}<div class="bnpl-item-name">${lbl}</div></div>
                <div class="bnpl-item-right">
                  <div class="bnpl-item-amt">${T2.fmtMoney(e.amount)}/mo</div>
                  <div class="bnpl-item-end">ends ${T2.fmtShort(e.lastPayment)}</div>
                  <div class="bnpl-item-mo">${moLeft} mo left</div>
                </div>
              </div>`;
          }).join('')}
        </div>

        <div class="sec-title">Income Recoup Timeline</div>
        <div class="recoup-intro">As BNPL plans end, this income returns to you each paycheck:</div>
        <div class="recoup-timeline">
          ${recoup.timeline.map(item=>{
            const [y,m]=item.month.split('-');
            const moLbl=new Date(y,m-1,1).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
            const pct=Math.min(100,(item.cumulativePerCheck/(total/2||1))*100);
            return `
              <div class="recoup-row">
                <div class="recoup-mo">${moLbl}</div>
                <div class="recoup-bar-wrap"><div class="recoup-bar-fill" style="width:${pct}%"></div></div>
                <div class="recoup-nums">
                  <span class="green">+${T2.fmtMoney(item.perCheckFreed)}</span>
                  <span class="teal" style="font-size:10px">≈${T2.fmtMoney(item.cumulativePerCheck)} freed</span>
                </div>
              </div>
              <div class="recoup-expiring">
                ${item.expiring.map(e=>`<span class="exp-pill">${e.label||e.provider} (${T2.fmtMoney(e.amount)})</span>`).join('')}
              </div>`;
          }).join('')}
        </div>

        <div class="sec-title">If No New BNPL Taken</div>
        <div class="whatif-box">
          <div class="whatif-row"><span>Current BNPL burden</span><span class="neg">${T2.fmtMoney(total)}/mo</span></div>
          <div class="whatif-row"><span>Fully freed by</span><span class="teal">${recoup.timeline.length?fmtMo(recoup.timeline[recoup.timeline.length-1].month):'—'}</span></div>
          <div class="whatif-row"><span>Paycheck increase then</span><span class="green">+${T2.fmtMoney(total/2)}/check</span></div>
          <div class="whatif-divider"></div>
          ${[3,6,12].map(n=>{
            const fd=T2.addMonths(new Date(),n);
            const freed=total-recoup.stillActiveAt(T2.fmtDate(fd));
            return `<div class="whatif-row">
              <span>In ${n} months (${fd.toLocaleDateString('en-US',{month:'short',year:'numeric'})})</span>
              <span class="${freed>0?'green':'text-dim'}">+${T2.fmtMoney(freed/2)}/check freed</span>
            </div>`;
          }).join('')}
        </div>

        <div class="sec-title">Ongoing Obligations</div>
        <div class="ongoing-list">
          ${ongoing.map(e=>`
            <div class="ongoing-item">
              <div>${badge(e.type)}<span class="ongoing-name">${e.label||e.provider}</span>${e.balance!=null?`<span class="ongoing-bal">Bal: ${T2.fmtMoney(e.balance)}</span>`:''}</div>
              <div class="neg">${T2.fmtMoney(e.amount)}/mo</div>
            </div>`).join('')}
          <div class="ongoing-total"><span>Total ongoing</span><span class="neg">${T2.fmtMoney(ongoingT)}/mo</span></div>
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════
  // CREDIT CARD / DEBT PAYOFF TAB
  // ══════════════════════════════════════════════════════════
  let _ccStrategy = 'avalanche';
  let _ccExtra    = 0;

  function renderCC() {
    const { cfg } = plan();
    const debtExps = cfg.expenses.filter(e =>
      e.active && e.balance != null && e.balance > 0 &&
      (e.type === 'Credit Card' || e.type === 'Loan' || e.type === 'Debt Mgmt')
    );
    const totalBalance = debtExps.reduce((s,e) => s + e.balance, 0);
    const totalMinPay  = debtExps.reduce((s,e) => s + e.amount,  0);
    const result       = T2.calcPayoff(debtExps, _ccStrategy, _ccExtra);
    const step = Math.max(1, Math.floor(result.history.length / 48));
    const pts  = result.history.filter((_,i) => i % step === 0 || i === result.history.length - 1);
    const dfDate  = T2.parseDate(result.freeDate);
    const dfLabel = dfDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const sorted = [...debtExps];
    if (_ccStrategy === 'avalanche') sorted.sort((a,b) => (b.apr||0)-(a.apr||0));
    else sorted.sort((a,b) => a.balance - b.balance);

    return `
      <div class="cc-wrap">
        <div class="sec-title">Debt Overview</div>
        <div class="cc-cards">
          ${debtExps.map(e => {
            const pct  = Math.min(100, (e.balance / (totalBalance||1)) * 100);
            const name = e.label || e.provider;
            return `
              <div class="cc-card">
                <div class="cc-card-row">
                  <div class="cc-card-left">${badge(e.type)}<span class="cc-card-name">${name}</span></div>
                  <span class="cc-balance neg">${T2.fmtMoney(e.balance)}</span>
                </div>
                <div class="cc-bar"><div class="cc-bar-fill" style="width:${pct}%"></div></div>
                <div class="cc-card-sub">Min: ${T2.fmtMoney(e.amount)}/mo${e.apr?` · ${e.apr}% APR`:''}</div>
              </div>`;
          }).join('')}
        </div>
        <div class="cc-totals">
          <div class="cc-total-item"><span>Total Balance</span><span class="neg">${T2.fmtMoney(totalBalance)}</span></div>
          <div class="cc-total-item"><span>Total Min Pay</span><span>${T2.fmtMoney(totalMinPay)}/mo</span></div>
        </div>

        <div class="sec-title">Payoff Strategy</div>
        <div class="strategy-toggle">
          <button class="strat-btn ${_ccStrategy==='avalanche'?'active':''}" data-strat="avalanche">
            <span class="strat-icon">🏔</span>
            <span class="strat-label">Avalanche</span>
            <span class="strat-sub">Highest APR first · saves the most interest</span>
          </button>
          <button class="strat-btn ${_ccStrategy==='snowball'?'active':''}" data-strat="snowball">
            <span class="strat-icon">⛄</span>
            <span class="strat-label">Snowball</span>
            <span class="strat-sub">Lowest balance first · fastest wins</span>
          </button>
        </div>

        <div class="cc-extra-row">
          <label class="pf-label">Extra monthly payment (above minimums)</label>
          <div class="cc-extra-inputs">
            <input type="number" id="ccExtraAmt" class="pf-input" value="${_ccExtra}" min="0" step="5" placeholder="$0">
            <button class="pf-btn-sm" id="ccCalcBtn">Recalculate</button>
          </div>
        </div>

        <div class="cc-result-banner">
          <div class="cc-rb-left">
            <div class="cc-rb-lbl">Debt-Free Date</div>
            <div class="cc-rb-val teal">${dfLabel}</div>
            <div class="cc-rb-sub">${result.months} months · ${_ccStrategy}${_ccExtra>0?` · +${T2.fmtMoney(_ccExtra)}/mo extra`:''}</div>
          </div>
        </div>

        <div class="sec-title">Balance Over Time</div>
        <div class="cc-chart-wrap">
          <div class="cc-chart">
            ${pts.map(p => {
              const h   = Math.max(2, (p.total / (totalBalance||1)) * 100);
              const mo  = T2.addMonths(new Date(), p.month);
              const lbl = mo.toLocaleDateString('en-US',{month:'short',year:'2-digit'});
              return `<div class="cc-bar-col" title="${lbl}: ${T2.fmtMoney(p.total)}"><div class="cc-bar-seg" style="height:${h}%"></div></div>`;
            }).join('')}
          </div>
          <div class="cc-chart-labels">
            <span>${T2.fmtMoney(totalBalance)}</span>
            <span style="margin-left:auto">${dfLabel}</span>
          </div>
        </div>

        <div class="sec-title">Payoff Order</div>
        <div class="cc-order-list">
          ${sorted.map((e,i) => `
            <div class="cc-order-item">
              <div class="cc-order-num ${i===0?'first-num':''}">${i+1}</div>
              <div class="cc-order-info">
                <div class="cc-order-name">${e.label||e.provider}</div>
                <div class="cc-order-meta">${T2.fmtMoney(e.balance)} bal${e.apr?` · ${e.apr}% APR`:''} · ${T2.fmtMoney(e.amount)}/mo min</div>
              </div>
              ${i===0?'<span class="cc-first-badge">Pay first</span>':''}
            </div>`).join('')}
        </div>

        <div class="sec-title">Set APR</div>
        <div class="cc-apr-list">
          ${debtExps.map(e => `
            <div class="cc-apr-row">
              <span class="cc-apr-name">${e.label||e.provider}</span>
              <div class="cc-apr-input-wrap">
                <input type="number" class="pf-input cc-apr-input" data-id="${e.id}"
                  value="${e.apr||0}" min="0" step="0.1" style="width:90px;margin:0">
                <span class="cc-apr-pct">%</span>
              </div>
            </div>`).join('')}
          <button class="pf-btn ghost" id="saveAprBtn" style="margin-top:8px">Save APRs & Recalculate</button>
        </div>
      </div>`;
  }

  function bindCC() {
    document.querySelectorAll('.strat-btn').forEach(btn => {
      btn.addEventListener('click', () => { _ccStrategy = btn.dataset.strat; refresh(); });
    });
    document.getElementById('ccCalcBtn')?.addEventListener('click', () => {
      _ccExtra = parseFloat(document.getElementById('ccExtraAmt').value) || 0;
      refresh();
    });
    document.getElementById('ccExtraAmt')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { _ccExtra = parseFloat(e.target.value) || 0; refresh(); }
    });
    document.getElementById('saveAprBtn')?.addEventListener('click', () => {
      const cfg = T2.getConfig();
      document.querySelectorAll('.cc-apr-input').forEach(inp => {
        const exp = cfg.expenses.find(e => e.id === inp.dataset.id);
        if (exp) exp.apr = parseFloat(inp.value) || 0;
      });
      T2.saveConfig(cfg);
      showToast('APRs saved');
      refresh();
    });
  }


  // ══════════════════════════════════════════════════════════
  // STREAKS
  // ══════════════════════════════════════════════════════════
  function renderStreaks() {
    const ns    = T2.getNoSpend();
    const s     = T2.streak(ns);
    const today = T2.fmtDate(new Date());
    const mos   = [-1,0].map(m=>{ const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+m); return d; });
    return `
      <div class="str-wrap">
        <div class="str-hero">
          <div class="str-flame">🔥</div>
          <div class="str-num">${s}</div>
          <div class="str-lbl">Day Streak</div>
        </div>
        <div class="str-tip">Tap any day to mark as no-spend</div>
        ${mos.map(mo=>renderCal(mo,ns,today)).join('')}
        <div class="str-stats">
          <div class="stat-pill"><span class="sp-l">Total No-Spend</span><span class="sp-v orange">${ns.size}</span></div>
          <div class="stat-pill"><span class="sp-l">This Month</span><span class="sp-v orange">${[...ns].filter(d=>d.startsWith(today.substring(0,7))).length}</span></div>
        </div>
      </div>`;
  }
  function renderCal(mo,ns,today) {
    const y=mo.getFullYear(),m=mo.getMonth();
    const days=new Date(y,m+1,0).getDate(), dow=new Date(y,m,1).getDay();
    let cells='';
    for(let i=0;i<dow;i++) cells+='<div class="cal-c empty"></div>';
    for(let d=1;d<=days;d++){
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells+=`<div class="cal-c ${ns.has(ds)?'ns':''} ${ds===today?'cal-today':''} ${ds>today?'future':''}" data-date="${ds}">${d}</div>`;
    }
    return `<div class="cal-mo"><div class="cal-mo-lbl">${mo.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
      <div class="cal-dows">${['S','M','T','W','T','F','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}</div>
      <div class="cal-grid">${cells}</div></div>`;
  }
  function bindStreaks() {
    document.querySelectorAll('.cal-c[data-date]').forEach(c=>{
      if(c.classList.contains('future')) return;
      c.addEventListener('click',()=>{ T2.toggleNoSpend(c.dataset.date); refresh(); });
    });
  }

  // ══════════════════════════════════════════════════════════
  // STATS
  // ══════════════════════════════════════════════════════════
  function renderStats() {
    const { checks } = plan();
    const s  = T2.computeStats(checks);
    const tI = checks.reduce((x,c)=>x+c.grossIncome+c.prnIncome,0);
    const tE = checks.reduce((x,c)=>x+c.totalExpenses,0);
    const tP = checks.reduce((x,c)=>x+c.prnIncome,0);
    const tL = checks.reduce((x,c)=>x+c.living+c.extraTotal,0);
    const byMonth={};
    checks.forEach(c=>{ const mo=c.date.substring(0,7); byMonth[mo]=(byMonth[mo]||0)+c.surplus; });
    const mos=Object.entries(byMonth).slice(0,24);
    const maxA=Math.max(...mos.map(([,v])=>Math.abs(v)),1);
    return `
      <div class="stats-wrap">
        <div class="sec-title">Plan Summary</div>
        <div class="stats-grid">
          <div class="stat-card"><div class="sc-lbl">Total Income</div><div class="sc-val pos">${T2.fmtMoney(tI)}</div><div class="sc-sub">${checks.length} checks</div></div>
          <div class="stat-card"><div class="sc-lbl">Total Expenses</div><div class="sc-val neg">${T2.fmtMoney(tE)}</div></div>
          <div class="stat-card"><div class="sc-lbl">Total Living</div><div class="sc-val">${T2.fmtMoney(tL)}</div></div>
          <div class="stat-card"><div class="sc-lbl">PRN Earned</div><div class="sc-val pos">${T2.fmtMoney(tP)}</div></div>
          <div class="stat-card ${s.net>=0?'gc':'rc'}"><div class="sc-lbl">Net Balance</div><div class="sc-val">${T2.fmtMoney(s.net)}</div></div>
          <div class="stat-card rc"><div class="sc-lbl">Deficit Checks</div><div class="sc-val">${s.negCount}/${checks.length}</div></div>
        </div>
        <div class="st-highlights">
          <div class="st-hl best"><div class="hl-l">🏆 Best</div><div class="hl-d">${s.best?T2.fmtShort(s.best.date):'—'}</div><div class="hl-v pos">${s.best?T2.fmtMoney(s.best.surplus):'—'}</div></div>
          <div class="st-hl worst"><div class="hl-l">💔 Worst</div><div class="hl-d">${s.worst?T2.fmtShort(s.worst.date):'—'}</div><div class="hl-v neg">${s.worst?T2.fmtMoney(s.worst.surplus):'—'}</div></div>
        </div>
        <div class="sec-title">Monthly Surplus</div>
        <div class="mo-chart">
          ${mos.map(([mo,v])=>{
            const pct=Math.max(2,(Math.abs(v)/maxA)*100);
            return `<div class="mc-col"><div class="mc-bw"><div class="mc-b ${v>=0?'mc-pos':'mc-neg'}" style="height:${pct}%" title="${fmtMo(mo)}: ${T2.fmtMoney(v)}"></div></div><div class="mc-l">${mo.substring(5)}</div></div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════
  // SETUP
  // ══════════════════════════════════════════════════════════
  function renderSetup() {
    const subs=[{id:'expenses',label:'💳 Expenses'},{id:'living',label:'🛒 Living'},{id:'income',label:'💵 Income'},{id:'settings',label:'⚙️ Settings'}];
    return `
      <div class="su-wrap">
        <div class="su-nav">
          ${subs.map(s=>`<button class="su-btn ${s.id===_setupSub?'active':''}" data-sub="${s.id}">${s.label}</button>`).join('')}
        </div>
        <div id="suContent">${renderSetupSub(_setupSub)}</div>
      </div>`;
  }

  function renderSetupSub(sub) {
    const cfg=T2.getConfig();
    switch(sub) {
      case 'expenses': return renderSetupExpenses(cfg);
      case 'living':   return renderSetupLiving(cfg);
      case 'income':   return renderSetupIncome(cfg);
      case 'settings': return renderSetupSettings(cfg);
      default: return '';
    }
  }

  function renderSetupExpenses(cfg) {
    const grouped={};
    for(const e of cfg.expenses){ if(!grouped[e.type])grouped[e.type]=[]; grouped[e.type].push(e); }
    const typeOrder=['Loan','Credit Card','Debt Mgmt','Student Loan','Affirm','Klarna','Pay in 4','Subscription'];
    const sorted=[...typeOrder.filter(t=>grouped[t]),...Object.keys(grouped).filter(t=>!typeOrder.includes(t))];
    return `
      <div class="su-sec">
        <div class="sec-title">All Expenses <span class="badge">${cfg.expenses.filter(e=>e.active).length} active</span></div>
        ${sorted.map(type=>`
          <div class="su-group">
            <div class="su-group-hdr">${badge(type)}</div>
            ${(grouped[type]||[]).map(e=>{
              const lbl=e.label||e.provider;
              return `
                <div class="su-item">
                  <div class="su-item-info">
                    <span class="su-name ${!e.active?'inactive':''}">${lbl}</span>
                    <span class="su-meta">${T2.fmtMoney(e.amount)}/mo · Day ${e.dueDay} · ${e.lastPayment?'ends '+T2.fmtShort(e.lastPayment):'ongoing'}</span>
                  </div>
                  <div class="su-actions">
                    <button class="icon-btn toggle-exp" data-id="${e.id}" title="${e.active?'Deactivate':'Activate'}">${e.active?'✅':'⭕'}</button>
                    <button class="icon-btn edit-exp" data-id="${e.id}" title="Edit amount">✏️</button>
                    <button class="icon-btn del-exp" data-id="${e.id}" title="Delete (paid off)">🗑</button>
                  </div>
                </div>`;
            }).join('')}
          </div>`).join('')}

        <div class="sec-title">Add Expense</div>
        <div class="su-form">
          <input type="text"   id="nProvider" class="pf-input" placeholder="Provider / Name">
          <input type="text"   id="nLabel"    class="pf-input" placeholder="Label (optional)">
          <input type="number" id="nAmount"   class="pf-input" placeholder="Amount" min="0" step="0.01">
          <input type="number" id="nDueDay"   class="pf-input" placeholder="Due day (1–31)" min="1" max="31">
          <select id="nType" class="pf-select">
            ${Object.values(T2.TYPE).map(t=>`<option value="${t}">${t}</option>`).join('')}
          </select>
          <label class="pf-label">Last payment date (leave blank = ongoing)</label>
          <input type="date" id="nLastPay" class="pf-input">
          <input type="number" id="nBalance" class="pf-input" placeholder="Balance (loans/CC, optional)">
          <button class="pf-btn" id="addExpBtn">+ Add Expense</button>
        </div>
      </div>`;
  }

  function renderSetupLiving(cfg) {
    return `
      <div class="su-sec">
        <div class="sec-title">Living Expenses Per Check</div>
        <div class="living-note">These are deducted from every paycheck automatically.</div>
        <div class="su-form">
          <label class="pf-label">🛒 Food / Groceries</label>
          <input type="number" id="lvFood"  class="pf-input" value="${cfg.living.food||0}" min="0" step="1">
          <label class="pf-label">⛽ Gas</label>
          <input type="number" id="lvGas"   class="pf-input" value="${cfg.living.gas||0}" min="0" step="1">
          <label class="pf-label">🍽 Eating Out</label>
          <input type="number" id="lvEat"   class="pf-input" value="${cfg.living.eatingOut||0}" min="0" step="1">
          <label class="pf-label">🗂 Misc</label>
          <input type="number" id="lvMisc"  class="pf-input" value="${cfg.living.misc||0}" min="0" step="1">
          <div class="living-total-preview">
            Total per check: <strong>${T2.fmtMoney((cfg.living.food||0)+(cfg.living.gas||0)+(cfg.living.eatingOut||0)+(cfg.living.misc||0))}</strong>
          </div>
          <button class="pf-btn" id="saveLivingBtn">Save Living Expenses</button>
        </div>
      </div>`;
  }

  function renderSetupIncome(cfg) {
    return `
      <div class="su-sec">
        <div class="sec-title">Income</div>
        <div class="su-form">
          <label class="pf-label">Amount per check</label>
          <input type="number" id="incAmt"   class="pf-input" value="${cfg.income.amount}" step="0.01">
          <label class="pf-label">Next check date</label>
          <input type="date"   id="incNext"  class="pf-input" value="${cfg.income.nextDate}">
          <label class="pf-label">Label</label>
          <input type="text"   id="incLabel" class="pf-input" value="${cfg.income.label}">
          <button class="pf-btn" id="saveIncBtn">Save Income</button>
        </div>
      </div>`;
  }

  function renderSetupSettings(cfg) {
    return `
      <div class="su-sec">
        <div class="sec-title">Settings</div>
        <div class="su-form">
          <label class="pf-label">Surplus warning threshold ($)</label>
          <input type="number" id="swarn"   class="pf-input" value="${cfg.surplusWarning}" min="0">
          <label class="pf-label">Plan end date</label>
          <input type="date"   id="planEnd" class="pf-input" value="${cfg.planEndDate}">
          <button class="pf-btn" id="saveSettBtn">Save Settings</button>
        </div>
        <div class="sec-title danger-title">Danger Zone</div>
        <button class="pf-btn danger" id="resetBtn">🗑 Reset All Data</button>
      </div>`;
  }

  function bindSetup() {
    document.querySelectorAll('.su-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        _setupSub=btn.dataset.sub;
        document.querySelectorAll('.su-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('suContent').innerHTML=renderSetupSub(_setupSub);
        bindSetupSub(_setupSub);
      });
    });
    bindSetupSub(_setupSub);
  }

  function bindSetupSub(sub) {
    switch(sub) {
      case 'expenses': bindSetupExpenses(); break;
      case 'living':   bindSetupLiving();   break;
      case 'income':   bindSetupIncome();   break;
      case 'settings': bindSetupSettings(); break;
    }
  }

  function bindSetupExpenses() {
    // Toggle active
    document.querySelectorAll('.toggle-exp').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const cfg=T2.getConfig(); const e=cfg.expenses.find(x=>x.id===btn.dataset.id);
        if(e){ e.active=!e.active; T2.saveConfig(cfg); refresh(); }
      });
    });
    // Edit amount
    document.querySelectorAll('.edit-exp').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const cfg=T2.getConfig(); const e=cfg.expenses.find(x=>x.id===btn.dataset.id);
        if(!e) return;
        const v=parseFloat(prompt(`New amount for "${e.label||e.provider}":`,e.amount));
        if(!isNaN(v)&&v>=0){ e.amount=v; T2.saveConfig(cfg); refresh(); }
      });
    });
    // Delete (paid off)
    document.querySelectorAll('.del-exp').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const cfg=T2.getConfig(); const e=cfg.expenses.find(x=>x.id===btn.dataset.id);
        if(!e) return;
        if(!confirm(`Delete "${e.label||e.provider}"? Use this when you've paid it off or it's been cancelled.`)) return;
        cfg.expenses=cfg.expenses.filter(x=>x.id!==btn.dataset.id);
        T2.saveConfig(cfg); refresh();
      });
    });
    // Add new
    document.getElementById('addExpBtn')?.addEventListener('click',()=>{
      const cfg=T2.getConfig();
      const provider=document.getElementById('nProvider').value.trim();
      const label   =document.getElementById('nLabel').value.trim();
      const amount  =parseFloat(document.getElementById('nAmount').value);
      const dueDay  =parseInt(document.getElementById('nDueDay').value);
      const type    =document.getElementById('nType').value;
      const lastPay =document.getElementById('nLastPay').value||null;
      const balance =parseFloat(document.getElementById('nBalance').value)||null;
      if(!provider||isNaN(amount)||isNaN(dueDay)) { showToast('Fill in provider, amount, and due day'); return; }
      cfg.expenses.push({id:'e'+Date.now(),dueDay,provider,label,amount,type,lastPayment:lastPay,balance,active:true});
      T2.saveConfig(cfg); refresh();
    });
  }

  function bindSetupLiving() {
    document.getElementById('saveLivingBtn')?.addEventListener('click',()=>{
      const cfg=T2.getConfig();
      cfg.living={
        food:     parseFloat(document.getElementById('lvFood').value)||0,
        gas:      parseFloat(document.getElementById('lvGas').value)||0,
        eatingOut:parseFloat(document.getElementById('lvEat').value)||0,
        misc:     parseFloat(document.getElementById('lvMisc').value)||0,
      };
      T2.saveConfig(cfg); showToast('Living expenses saved'); refresh();
    });
  }

  function bindSetupIncome() {
    document.getElementById('saveIncBtn')?.addEventListener('click',()=>{
      const cfg=T2.getConfig();
      cfg.income.amount  =parseFloat(document.getElementById('incAmt').value)||cfg.income.amount;
      cfg.income.nextDate=document.getElementById('incNext').value||cfg.income.nextDate;
      cfg.income.label   =document.getElementById('incLabel').value||cfg.income.label;
      T2.saveConfig(cfg); showToast('Income saved'); refresh();
    });
  }

  function bindSetupSettings() {
    document.getElementById('saveSettBtn')?.addEventListener('click',()=>{
      const cfg=T2.getConfig();
      cfg.surplusWarning=parseFloat(document.getElementById('swarn').value)||0;
      cfg.planEndDate   =document.getElementById('planEnd').value||cfg.planEndDate;
      T2.saveConfig(cfg); showToast('Settings saved'); refresh();
    });
    document.getElementById('resetBtn')?.addEventListener('click',()=>{
      if(confirm('Reset ALL data? This cannot be undone.')){ T2.resetAll(); showToast('Reset complete'); refresh(); }
    });
  }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(msg) {
    const el=document.createElement('div');
    el.className='pf-toast'; el.textContent=msg;
    document.body.appendChild(el);
    setTimeout(()=>el.classList.add('show'),30);
    setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),300); },2200);
  }

  return { renderApp, refresh };
})();

document.addEventListener('DOMContentLoaded', ()=>T2UI.renderApp());
