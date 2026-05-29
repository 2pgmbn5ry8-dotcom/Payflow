// ============================================================
// T2_CORE.JS — PayFlow Tracker Core Engine
// ============================================================

const T2 = (() => {

  const TYPE = {
    AFFIRM:  'Affirm',
    KLARNA:  'Klarna',
    PAY4:    'Pay in 4',
    CC:      'Credit Card',
    LOAN:    'Loan',
    SUB:     'Subscription',
    DMP:     'Debt Mgmt',
    STUDENT: 'Student Loan',
  };

  const DEFAULT_CONFIG = {
    version: 3,
    income: {
      amount: 1932.53,
      frequency: 'biweekly',
      nextDate: '2026-06-11',
      label: 'Primary Job'
    },
    living: { food: 250, gas: 100, eatingOut: 75, misc: 0 },
    planEndDate: '2027-12-31',
    surplusWarning: 150,
    expenses: [
      { id:'e01',  dueDay:9,  provider:'Affirm',     label:'',                              amount:9.74,   type:'Affirm',       lastPayment:'2026-10-02', balance:null,     active:true },
      { id:'e02',  dueDay:3,  provider:'Affirm',     label:'',                              amount:19.09,  type:'Affirm',       lastPayment:'2026-11-03', balance:null,     active:true },
      { id:'e03',  dueDay:3,  provider:'Affirm',     label:'',                              amount:12.14,  type:'Affirm',       lastPayment:'2027-04-03', balance:null,     active:true },
      { id:'e04',  dueDay:3,  provider:'Affirm',     label:'',                              amount:17.34,  type:'Affirm',       lastPayment:'2026-07-03', balance:null,     active:true },
      { id:'e05',  dueDay:3,  provider:'Klarna',     label:'',                              amount:10.00,  type:'Klarna',       lastPayment:'2026-07-03', balance:null,     active:true },
      { id:'e06',  dueDay:4,  provider:'Klarna',     label:'',                              amount:13.93,  type:'Klarna',       lastPayment:'2026-12-04', balance:null,     active:true },
      { id:'e07',  dueDay:5,  provider:'Affirm',     label:'',                              amount:22.76,  type:'Affirm',       lastPayment:'2026-12-05', balance:null,     active:true },
      { id:'e08',  dueDay:5,  provider:'Affirm',     label:'',                              amount:26.72,  type:'Affirm',       lastPayment:'2026-11-05', balance:null,     active:true },
      { id:'e09',  dueDay:6,  provider:'Affirm',     label:'',                              amount:16.28,  type:'Affirm',       lastPayment:'2027-04-06', balance:null,     active:true },
      { id:'e10',  dueDay:7,  provider:'Klarna',     label:'',                              amount:29.17,  type:'Klarna',       lastPayment:'2026-06-07', balance:null,     active:true },
      { id:'e11',  dueDay:8,  provider:'Affirm',     label:'',                              amount:10.04,  type:'Affirm',       lastPayment:'2026-12-08', balance:null,     active:true },
      { id:'e12',  dueDay:9,  provider:'OneMain',    label:'Loan (OneMain)',                amount:298.24, type:'Loan',         lastPayment:null,          balance:9930.85,  active:true },
      { id:'e13',  dueDay:10, provider:'Klarna',     label:'',                              amount:67.37,  type:'Klarna',       lastPayment:'2026-06-24', balance:null,     active:true },
      { id:'e14',  dueDay:11, provider:'Affirm',     label:'',                              amount:40.48,  type:'Affirm',       lastPayment:'2027-02-11', balance:null,     active:true },
      { id:'e15',  dueDay:11, provider:'Affirm',     label:'',                              amount:10.55,  type:'Affirm',       lastPayment:'2027-03-11', balance:null,     active:true },
      { id:'e16',  dueDay:11, provider:'Affirm',     label:'',                              amount:10.86,  type:'Affirm',       lastPayment:'2027-12-11', balance:null,     active:true },
      { id:'e17',  dueDay:11, provider:'Hulu',       label:'Subscription (Hulu)',           amount:35.46,  type:'Subscription', lastPayment:null,          balance:null,     active:true },
      { id:'e18',  dueDay:12, provider:'Paypal',     label:'Credit Card (Paypal)',          amount:179.00, type:'Credit Card',  lastPayment:null,          balance:4112.54,  active:true },
      { id:'e19',  dueDay:12, provider:'Affirm',     label:'',                              amount:20.39,  type:'Affirm',       lastPayment:'2027-03-12', balance:null,     active:true },
      { id:'e20',  dueDay:12, provider:'Affirm',     label:'',                              amount:8.02,   type:'Affirm',       lastPayment:'2026-08-12', balance:null,     active:true },
      { id:'e21',  dueDay:13, provider:'Pay in 4',   label:'',                              amount:10.10,  type:'Pay in 4',     lastPayment:'2026-11-13', balance:null,     active:true },
      { id:'e22',  dueDay:13, provider:'CapOne1',    label:'Credit Card (Capital One)',     amount:39.00,  type:'Credit Card',  lastPayment:null,          balance:300.53,   active:true },
      { id:'e23',  dueDay:13, provider:'Upstart1',   label:'Loan (Upstart)',                amount:125.08, type:'Loan',         lastPayment:null,          balance:3866.22,  active:true },
      { id:'e24',  dueDay:13, provider:'Klarna',     label:'',                              amount:39.70,  type:'Klarna',       lastPayment:'2026-06-13', balance:null,     active:true },
      { id:'e25',  dueDay:14, provider:'CapOne2',    label:'Credit Card (Capital One #2)',  amount:25.00,  type:'Credit Card',  lastPayment:null,          balance:401.79,   active:true },
      { id:'e26',  dueDay:14, provider:'CareCredit', label:'Credit Card (Care Credit)',     amount:96.00,  type:'Credit Card',  lastPayment:null,          balance:861.56,   active:true },
      { id:'e27',  dueDay:14, provider:'Klarna',     label:'',                              amount:10.74,  type:'Klarna',       lastPayment:'2026-12-14', balance:null,     active:true },
      { id:'e28',  dueDay:15, provider:'Affirm',     label:'Jag',                           amount:14.38,  type:'Affirm',       lastPayment:'2026-12-15', balance:null,     active:true },
      { id:'e29',  dueDay:16, provider:'DMP',        label:'Debt Management Plan',          amount:320.00, type:'Debt Mgmt',    lastPayment:'2027-07-22', balance:null,     active:true },
      { id:'e30',  dueDay:16, provider:'StudentLoan',label:'Student Loan',                  amount:11.98,  type:'Student Loan', lastPayment:null,          balance:null,     active:true },
      { id:'e31',  dueDay:16, provider:'Affirm',     label:'',                              amount:18.05,  type:'Affirm',       lastPayment:'2027-03-16', balance:null,     active:true },
      { id:'e32',  dueDay:17, provider:'Affirm',     label:'',                              amount:14.57,  type:'Affirm',       lastPayment:'2027-04-17', balance:null,     active:true },
      { id:'e33',  dueDay:17, provider:'Affirm',     label:'',                              amount:16.14,  type:'Affirm',       lastPayment:'2027-02-17', balance:null,     active:true },
      { id:'e34',  dueDay:17, provider:'Affirm',     label:'',                              amount:10.48,  type:'Affirm',       lastPayment:'2027-04-17', balance:null,     active:true },
      { id:'e35',  dueDay:17, provider:'Klarna',     label:'',                              amount:22.23,  type:'Klarna',       lastPayment:'2026-11-17', balance:null,     active:true },
      { id:'e36',  dueDay:19, provider:'Affirm',     label:'',                              amount:10.06,  type:'Affirm',       lastPayment:'2026-12-19', balance:null,     active:true },
      { id:'e37',  dueDay:19, provider:'Affirm',     label:'',                              amount:11.65,  type:'Affirm',       lastPayment:'2026-12-19', balance:null,     active:true },
      { id:'e38',  dueDay:19, provider:'Upstart2',   label:'Loan (Upstart #2)',             amount:24.42,  type:'Loan',         lastPayment:null,          balance:417.80,   active:true },
      { id:'e39',  dueDay:19, provider:'Affirm',     label:'',                              amount:16.35,  type:'Affirm',       lastPayment:'2026-11-19', balance:null,     active:true },
      { id:'e40',  dueDay:20, provider:'Ally',       label:'Loan (Ally)',                   amount:499.00, type:'Loan',         lastPayment:null,          balance:20774.42, active:true },
      { id:'e41',  dueDay:22, provider:'Klarna',     label:'',                              amount:15.71,  type:'Klarna',       lastPayment:'2027-03-22', balance:null,     active:true },
      { id:'e42',  dueDay:23, provider:'Affirm',     label:'',                              amount:21.07,  type:'Affirm',       lastPayment:'2027-09-23', balance:null,     active:true },
      { id:'e43',  dueDay:23, provider:'Affirm',     label:'',                              amount:30.14,  type:'Affirm',       lastPayment:'2027-02-23', balance:null,     active:true },
      { id:'e44',  dueDay:23, provider:'BofA',       label:'Credit Card (Bank of America)', amount:35.00,  type:'Credit Card',  lastPayment:null,          balance:1350.00,  active:true },
      { id:'e45',  dueDay:23, provider:'Affirm',     label:'',                              amount:13.25,  type:'Affirm',       lastPayment:'2026-11-23', balance:null,     active:true },
      { id:'e46',  dueDay:23, provider:'Affirm',     label:'',                              amount:36.32,  type:'Affirm',       lastPayment:'2027-09-23', balance:null,     active:true },
      { id:'e47',  dueDay:24, provider:'Affirm',     label:'',                              amount:16.01,  type:'Affirm',       lastPayment:'2027-03-24', balance:null,     active:true },
      { id:'e48',  dueDay:24, provider:'Klarna',     label:'',                              amount:67.37,  type:'Klarna',       lastPayment:'2026-06-24', balance:null,     active:true },
      { id:'e49',  dueDay:25, provider:'Pay in 4',   label:'',                              amount:19.01,  type:'Pay in 4',     lastPayment:'2026-11-25', balance:null,     active:true },
      { id:'e50',  dueDay:25, provider:'Affirm',     label:'',                              amount:22.60,  type:'Affirm',       lastPayment:'2027-02-25', balance:null,     active:true },
      { id:'e51',  dueDay:25, provider:'Affirm',     label:'',                              amount:35.16,  type:'Affirm',       lastPayment:'2027-02-25', balance:null,     active:true },
      { id:'e52',  dueDay:26, provider:'Affirm',     label:'',                              amount:19.49,  type:'Affirm',       lastPayment:'2027-01-26', balance:null,     active:true },
      { id:'e53',  dueDay:26, provider:'Peacock',    label:'Subscription (Peacock)',        amount:3.99,   type:'Subscription', lastPayment:null,          balance:null,     active:true },
      { id:'e54',  dueDay:26, provider:'Netflix',    label:'Subscription (Netflix)',        amount:26.99,  type:'Subscription', lastPayment:null,          balance:null,     active:true },
      { id:'e55',  dueDay:27, provider:'Affirm',     label:'',                              amount:16.09,  type:'Affirm',       lastPayment:'2027-03-27', balance:null,     active:true },
      { id:'e56',  dueDay:27, provider:'Paramount',  label:'Subscription (Paramount)',      amount:11.28,  type:'Subscription', lastPayment:null,          balance:null,     active:true },
      { id:'e57',  dueDay:28, provider:'Affirm',     label:'',                              amount:15.54,  type:'Affirm',       lastPayment:'2026-08-27', balance:null,     active:true },
      { id:'e58',  dueDay:28, provider:'iCloud',     label:'Subscription (iCloud)',         amount:9.90,   type:'Subscription', lastPayment:null,          balance:null,     active:true },
      { id:'e59',  dueDay:28, provider:'Affirm',     label:'',                              amount:17.54,  type:'Affirm',       lastPayment:'2026-06-28', balance:null,     active:true },
      { id:'e60',  dueDay:28, provider:'Affirm',     label:'',                              amount:13.06,  type:'Affirm',       lastPayment:'2027-01-28', balance:null,     active:true },
      { id:'e61',  dueDay:28, provider:'Affirm',     label:'',                              amount:11.81,  type:'Affirm',       lastPayment:'2027-01-28', balance:null,     active:true },
      { id:'e62',  dueDay:28, provider:'Klarna',     label:'',                              amount:9.67,   type:'Klarna',       lastPayment:'2027-11-28', balance:null,     active:true },
      { id:'e63',  dueDay:28, provider:'Klarna',     label:'',                              amount:24.84,  type:'Klarna',       lastPayment:'2026-07-28', balance:null,     active:true },
    ]
  };

  const KEYS = {
    config:  't2_config',
    checks:  't2_checks',
    noSpend: 't2_nospend',
    moved:   't2_billmoved',
  };

  // ── Storage ──────────────────────────────────────────────────
  function load(key, fallback = null) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch(e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }

  function getConfig() {
    const s = load(KEYS.config);
    if (!s) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const out = JSON.parse(JSON.stringify(s));
    if (!out.expenses)         out.expenses        = DEFAULT_CONFIG.expenses;
    if (!out.income)           out.income          = DEFAULT_CONFIG.income;
    if (!out.planEndDate)      out.planEndDate      = DEFAULT_CONFIG.planEndDate;
    if (out.surplusWarning == null) out.surplusWarning = DEFAULT_CONFIG.surplusWarning;
    if (!out.living)           out.living          = DEFAULT_CONFIG.living;
    return out;
  }
  function saveConfig(c) { save(KEYS.config, c); }

  // ── Date helpers ─────────────────────────────────────────────
  function parseDate(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
  function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function fmtShort(s) {
    return parseDate(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'});
  }
  function fmtMoney(n) {
    return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function addDays(d,n)   { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
  function addMonths(d,n) { const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }

  // ── Generate paycheck dates ───────────────────────────────────
  function generateCheckDates(cfg) {
    const end = parseDate(cfg.planEndDate);
    const dates = [];
    let cur = parseDate(cfg.income.nextDate);
    while (cur <= end) { dates.push(fmtDate(cur)); cur = addDays(cur, 14); }
    return dates;
  }

  // ══════════════════════════════════════════════════════════════
  // EXPENSE ASSIGNMENT
  //
  // Rule: each monthly bill occurrence goes to the first check whose
  // date is >= the bill's due date ("pay with the next check after due").
  //
  // Occurrences due BEFORE the first check date are skipped entirely —
  // they're assumed already paid. They resume naturally next month.
  //
  // Examples (first check = June 11):
  //   OneMain  due June  9  → SKIP (before June 11, already paid)
  //   OneMain  due July  9  → July 9 check ✓
  //   Klarna   due June  7  → SKIP
  //   Klarna   due July  7  → July 9 check ✓
  //   Affirm   due June 11  → June 11 check ✓
  //   Affirm   due June 13  → June 25 check ✓
  //   Affirm   due June 28  → June 25 check ✓  (first check >= June 28 is June 25? No—
  //                            June 25 < June 28, so first check >= June 28 is July 9)
  //   Wait: June 25 check covers June 25 → July 8 bills, so June 28 goes to June 25 ✓
  //   Actually "first check >= dueDate" means checkDate >= dueDate, so June 28 →
  //   first checkDate that is >= June 28 → that's July 9 (June 25 < June 28).
  //   BUT that's wrong for the user's mental model. The user expects June 28 bills to
  //   be on the June 25 check (you pay upcoming bills with the check before they're due).
  //
  // Revised rule: bill goes to the LAST check whose date is <= dueDate + grace,
  // OR equivalently: the check that is closest before or on the due date.
  // i.e., "pay the bill with the most recent check before it comes due."
  //
  //   June 28 bill → last check on or before June 28 = June 25 ✓
  //   June 11 bill → last check on or before June 11 = June 11 ✓
  //   June 13 bill → last check on or before June 13 = June 11 ✓
  //   July  9 bill → last check on or before July  9 = July  9 ✓
  //   Aug  20 bill → last check on or before Aug  20 = Aug  20 ✓
  //   June  9 bill → last check on or before June 9  = none (before first check) → SKIP ✓
  // ══════════════════════════════════════════════════════════════

  function buildAssignmentMap(cfg, checkDates) {
    const movedMap   = load(KEYS.moved, {});
    const firstCheck = checkDates[0] ? parseDate(checkDates[0]) : new Date();
    const lastCheck  = checkDates[checkDates.length - 1];
    const endDate    = lastCheck ? parseDate(lastCheck) : new Date();
    const assignment = {};  // occId → checkId

    for (const exp of cfg.expenses) {
      if (!exp.active) continue;

      // Scan from one month before the first check to catch bills just before it
      let scanDate = new Date(firstCheck.getFullYear(), firstCheck.getMonth() - 1, exp.dueDay);

      for (let iter = 0; iter < 42; iter++) {
        const dueDate    = new Date(scanDate);
        const dueDateStr = fmtDate(dueDate);

        // Stop once past the end of plan
        if (dueDate > addDays(endDate, 35)) break;

        // ── Skip occurrences before the first check (assumed already paid) ──
        if (dueDate < firstCheck) {
          scanDate = addMonths(scanDate, 1);
          continue;
        }

        // ── Skip if expense's final payment has already passed ──
        if (exp.lastPayment && parseDate(exp.lastPayment) < dueDate) {
          scanDate = addMonths(scanDate, 1);
          continue;
        }

        const occId = `${exp.id}_${dueDateStr}`;

        // Manual override wins
        let overrideCheckId = null;
        for (const [cid, arr] of Object.entries(movedMap)) {
          if (arr.includes(occId)) { overrideCheckId = cid; break; }
        }

        if (overrideCheckId) {
          assignment[occId] = overrideCheckId;
        } else {
          // Last check whose date <= dueDate (pay upcoming bill with most recent check)
          let target = null;
          for (const cd of checkDates) {
            if (cd <= dueDateStr) target = cd;
            else break;
          }
          if (target) {
            assignment[occId] = `check_${target}`;
          }
        }

        scanDate = addMonths(scanDate, 1);
      }
    }

    return assignment;
  }

  function getExpensesForCheck(checkId, assignmentMap, cfg) {
    const result = [];
    const seen   = new Set();

    for (const exp of cfg.expenses) {
      if (!exp.active) continue;
      for (const [occId, cid] of Object.entries(assignmentMap)) {
        if (cid !== checkId) continue;
        if (!occId.startsWith(exp.id + '_')) continue;
        if (seen.has(occId)) continue;
        seen.add(occId);
        const dueDateStr = occId.slice(exp.id.length + 1);
        result.push({ ...exp, occId, dueDate: dueDateStr });
      }
    }

    result.sort((a,b) => a.dueDate.localeCompare(b.dueDate) || a.provider.localeCompare(b.provider));
    return result;
  }

  // ── Build full plan ───────────────────────────────────────────
  function buildPlan() {
    const cfg         = getConfig();
    const dates       = generateCheckDates(cfg);
    const checkData   = load(KEYS.checks, {});
    const livingTotal = (cfg.living.food||0) + (cfg.living.gas||0) +
                        (cfg.living.eatingOut||0) + (cfg.living.misc||0);
    const assignmentMap = buildAssignmentMap(cfg, dates);

    const checks = dates.map((dateStr, idx) => {
      const nextDateStr = dates[idx + 1] || null;
      const id          = `check_${dateStr}`;
      const stored      = checkData[id] || {};
      const expenses    = getExpensesForCheck(id, assignmentMap, cfg);
      const prnIncome   = stored.prnIncome || 0;
      const extraItems  = stored.extraItems || [];
      const extraTotal  = extraItems.reduce((s,i) => s + i.amount, 0);
      const totalExp    = expenses.reduce((s,e) => s + e.amount, 0);
      const surplus     = cfg.income.amount + prnIncome - totalExp - livingTotal - extraTotal;

      return {
        id, date: dateStr, nextDate: nextDateStr,
        grossIncome: cfg.income.amount, prnIncome,
        expenses, totalExpenses: totalExp,
        living: livingTotal, extraItems, extraTotal,
        surplus,
        paidExpenses: stored.paidExpenses || [],
        notes: stored.notes || '',
      };
    });

    return { cfg, checks };
  }

  // ── BNPL Recoup Analysis ──────────────────────────────────────
  function buildRecoupTimeline(cfg) {
    const bnplTypes = new Set(['Affirm','Klarna','Pay in 4']);
    const tempExp   = cfg.expenses.filter(e => e.active && e.lastPayment && bnplTypes.has(e.type));
    const byMonth   = {};
    for (const exp of tempExp) {
      const key = exp.lastPayment.substring(0,7);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(exp);
    }
    let running = 0;
    const timeline = Object.keys(byMonth).sort().map(mo => {
      const expiring = byMonth[mo];
      const freed    = expiring.reduce((s,e) => s + e.amount, 0);
      running += freed;
      return { month: mo, expiring, monthlyFreed: freed, cumulativeMonthly: running,
               perCheckFreed: freed/2, cumulativePerCheck: running/2 };
    });
    const totalBNPLMonthly = tempExp.reduce((s,e) => s + e.amount, 0);
    const stillActiveAt = ds => {
      const d = parseDate(ds);
      return tempExp.filter(e => parseDate(e.lastPayment) >= d).reduce((s,e)=>s+e.amount,0);
    };
    return { timeline, totalBNPLMonthly, tempExp, stillActiveAt };
  }

  // ── CC payoff calculator ──────────────────────────────────────
  function calcPayoff(cards, strategy, extraMonthly) {
    // Only include CC and Loan type with a balance
    let debts = cards
      .filter(e => e.active && e.balance != null && e.balance > 0)
      .map(e => ({
        id:       e.id,
        name:     e.label || e.provider,
        balance:  e.balance,
        minPay:   e.amount,
        apr:      e.apr || 0,
        rate:     (e.apr || 0) / 100 / 12,
      }));

    if (strategy === 'avalanche') debts.sort((a,b) => b.apr - a.apr);
    else                          debts.sort((a,b) => a.balance - b.balance);

    const history = [];
    let month = 0;
    const MAX = 360;

    while (debts.some(d => d.balance > 0.01) && month < MAX) {
      month++;
      let snowball = extraMonthly;

      // Interest + minimum payments
      for (const d of debts) {
        if (d.balance <= 0) continue;
        d.balance += d.balance * d.rate;
        const pay = Math.min(d.minPay, d.balance);
        d.balance = Math.max(0, d.balance - pay);
      }

      // Extra payment to priority debt (first non-zero)
      for (const d of debts) {
        if (d.balance <= 0 || snowball <= 0) continue;
        const pay = Math.min(snowball, d.balance);
        d.balance = Math.max(0, d.balance - pay);
        snowball -= pay;
      }

      history.push({
        month,
        total: debts.reduce((s,d) => s + d.balance, 0),
        debts: debts.map(d => ({ name: d.name, balance: +d.balance.toFixed(2) })),
      });
    }

    const freeDate = addMonths(new Date(), month);
    return { months: month, freeDate: fmtDate(freeDate), history };
  }

  // ── Check data persistence ────────────────────────────────────
  function cd(checkId) {
    const d = load(KEYS.checks, {});
    if (!d[checkId]) d[checkId] = { paidExpenses:[], prnIncome:0, notes:'', extraItems:[] };
    return d;
  }
  function sc(d) { save(KEYS.checks, d); }

  function togglePaid(checkId, occId) {
    const d = cd(checkId); const arr = d[checkId].paidExpenses;
    const i = arr.indexOf(occId); i>=0 ? arr.splice(i,1) : arr.push(occId);
    sc(d);
  }
  function setPRN(checkId, amount)  { const d=cd(checkId); d[checkId].prnIncome=Number(amount); sc(d); }
  function addPRN(checkId, amount)  { const d=cd(checkId); d[checkId].prnIncome=(d[checkId].prnIncome||0)+Number(amount); sc(d); }
  function saveNotes(checkId, n)    { const d=cd(checkId); d[checkId].notes=n; sc(d); }
  function addExtraItem(checkId, item) {
    const d=cd(checkId); if(!d[checkId].extraItems) d[checkId].extraItems=[];
    d[checkId].extraItems.push({id:Date.now(),...item}); sc(d);
  }
  function deleteExtraItem(checkId, itemId) {
    const d=cd(checkId); if(!d[checkId].extraItems) return;
    d[checkId].extraItems=d[checkId].extraItems.filter(i=>i.id!==itemId); sc(d);
  }
  function moveBill(occId, targetCheckId) {
    const m=load(KEYS.moved,{});
    for(const cid of Object.keys(m)) m[cid]=m[cid].filter(o=>o!==occId);
    if(!m[targetCheckId]) m[targetCheckId]=[];
    m[targetCheckId].push(occId);
    save(KEYS.moved,m);
  }

  // No-spend streak
  function getNoSpend() { return new Set(load(KEYS.noSpend,[])); }
  function toggleNoSpend(ds) { const s=getNoSpend(); s.has(ds)?s.delete(ds):s.add(ds); save(KEYS.noSpend,[...s]); }
  function streak(ns) { let n=0,d=new Date(); while(ns.has(fmtDate(d))){ n++; d=addDays(d,-1); } return n; }

  // Stats
  function computeStats(checks) {
    const best  = checks.reduce((a,b)=>b.surplus>a.surplus?b:a, checks[0]);
    const worst = checks.reduce((a,b)=>b.surplus<a.surplus?b:a, checks[0]);
    const net   = checks.reduce((s,c)=>s+c.surplus,0);
    return { best, worst, net, avg: net/(checks.length||1), negCount: checks.filter(c=>c.surplus<0).length };
  }

  function resetAll() { Object.values(KEYS).forEach(k=>localStorage.removeItem(k)); }

  return {
    TYPE, KEYS, DEFAULT_CONFIG,
    load, save, getConfig, saveConfig,
    parseDate, fmtDate, fmtShort, fmtMoney, addDays, addMonths,
    buildPlan, buildRecoupTimeline, calcPayoff,
    togglePaid, setPRN, addPRN, saveNotes, moveBill,
    addExtraItem, deleteExtraItem,
    getNoSpend, toggleNoSpend, streak,
    computeStats, resetAll,
  };
})();
