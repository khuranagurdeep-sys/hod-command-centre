/* Hands On Design Command Centre — core: state, helpers, calculations, shell, router, overlays, charts */
(function () {
  const H = window.HOD;
  const T0 = H.today(), TODAY = H.iso(T0);
  const KEY = 'hod-command-centre-v3';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const S = H.S = { session: null, role: 'owner', user: 'e0', clientId: 'cl1', contractorId: 'c1', data: null, ui: { route: 'dashboard', drawer: null, modal: null, tab: {}, f: {}, side: false, chat: [], scen: null, pop: null, charts: {}, hl: null, site: { tab: 'today', visit: null, offline: false } } };
  H.TODAY = TODAY; H.T0 = T0;

  // ---------- persistence ----------
  // keep a saved demo fresh: move every stored date forward by the days elapsed since it was built
  H.shiftDates = data => {
    const n = Math.round((new Date(H.iso(H.today()) + 'T00:00') - new Date(data.meta.built + 'T00:00')) / 864e5);
    if (!n) return;
    const re = /^\d{4}-\d{2}-\d{2}$/, mv = v => { const x = new Date(v + 'T00:00'); x.setDate(x.getDate() + n); return H.iso(x); };
    const walk = o => { if (Array.isArray(o)) o.forEach((v, i) => { if (typeof v === 'string' && re.test(v)) o[i] = mv(v); else if (v && typeof v === 'object') walk(v); }); else Object.keys(o).forEach(k => { const v = o[k]; if (typeof v === 'string' && re.test(v)) o[k] = mv(v); else if (v && typeof v === 'object') walk(v); }); };
    walk(data); data.meta.built = H.iso(H.today());
  };
  H.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.data && o.data.meta && o.data.meta.version === 3) { if (o.data.meta.built && o.data.meta.built !== H.iso(H.today())) H.shiftDates(o.data); Object.assign(S, { data: o.data, session: o.session, role: o.role || 'owner', user: o.user || 'e0', clientId: o.clientId || 'cl1', contractorId: o.contractorId || 'c1' }); return; }
      }
    } catch (e) { /* storage unavailable */ }
    S.data = H.buildData();
  };
  H.save = function () { try { localStorage.setItem(KEY, JSON.stringify({ data: S.data, session: S.session, role: S.role, user: S.user, clientId: S.clientId, contractorId: S.contractorId })); } catch (e) { /* ignore */ } };
  H.reset = function () { S.data = H.buildData(); S.ui.chat = []; S.ui.scen = null; S.ui.drawer = null; S.ui.modal = null; H.save(); };

  // ---------- helpers ----------
  const esc = H.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pd = s => new Date(s + 'T00:00');
  H.dif = s => Math.round((pd(s) - T0) / 864e5);
  H.addDays = (s, n) => { const x = pd(s); x.setDate(x.getDate() + n); return H.iso(x); };
  H.D = n => H.addDays(TODAY, n);
  H.fd = s => { if (!s) return '—'; const d = pd(s); return d.getDate() + ' ' + MON[d.getMonth()]; };
  H.fdy = s => { if (!s) return '—'; const d = pd(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
  H.rel = s => { const n = H.dif(s); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : n > 0 ? 'in ' + n + ' days' : (-n) + ' days ago'; };
  H.inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  H.lk = n => { const a = Math.abs(n), sg = n < 0 ? '−' : ''; if (a >= 1e7) return sg + '₹' + (a / 1e7).toFixed(2) + ' Cr'; if (a >= 1e5) return sg + '₹' + (a / 1e5).toFixed(a >= 1e6 ? 1 : 2) + ' L'; return sg + '₹' + Math.round(a).toLocaleString('en-IN'); };
  H.pc = x => Math.round(x) + '%';
  const db = () => S.data;
  H.db = db;
  const by = (k, id) => db()[k].find(x => x.id === id);
  const NOP = { id: '', name: 'Sales & admin', code: '—', client: '', pm: 'e1', site: 'e9', designer: 'e3', milestones: [], stage: '', progress: 0, location: '' };
  H.P = id => id ? by('projects', id) : NOP; H.E = id => by('employees', id); H.C = id => by('contractors', id); H.CL = id => by('clients', id);
  H.isEmp = id => /^e\d+$/.test(id || ''); H.isCon = id => /^c\d+$/.test(id || '');
  H.name = id => !id ? '—' : H.isEmp(id) ? (H.E(id) || {}).name : H.isCon(id) ? (H.C(id) || {}).name : /^cl/.test(id) ? (H.CL(id) || {}).name : id;
  H.first = id => (H.name(id) || '').split(' ')[0];
  H.ini = n => (n || '?').replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  H.hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  H.av = (id, lg) => { const n = H.name(id); return `<span class="av${lg ? ' lg' : ''}" style="--h:${H.hue(n)}" title="${esc(n)}">${H.ini(n)}</span>`; };
  H.who = id => `<span class="who">${H.av(id)}<span>${esc(H.name(id))}</span></span>`;
  H.plink = id => { const p = H.P(id); return p && p.id ? `<a class="lnk" href="#project-${p.id}" data-go="project-${p.id}">${esc(p.name)}</a>` : '—'; };

  // ---------- icons ----------
  const IP = {
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', spark: 'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z',
    funnel: 'M3 5h18l-7 8v6l-4 2v-8z', folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', pen: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', check: 'M4 5h16v14H4zM8 12l3 3 5-6', pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    hammer: 'M14 4l6 6-3 3-6-6zM11 7l-8 8 3 3 8-8', box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10', users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a5 5 0 0 0-4-5',
    rupee: 'M6 4h12M6 9h12M6 4c6 0 8 2.5 8 5s-2 5-8 5l8 7', team: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    chart: 'M4 20V10M10 20V4M16 20v-7M3 20h18', bell: 'M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4', doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1', map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5', plus: 'M12 5v14M5 12h14', menu: 'M4 7h16M4 12h16M4 17h16', x: 'M6 6l12 12M18 6L6 18', play: 'M7 5l12 7-12 7z',
    camera: 'M4 8h4l2-3h4l2 3h4v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3', arrow: 'M5 12h14M13 6l6 6-6 6',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10', send: 'M4 12l16-8-6 16-3-7z',
    upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', alert: 'M12 3l10 18H2zM12 10v5M12 18v.5', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    home: 'M3 11l9-7 9 7v9H3zM9 20v-6h6v6', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', flag: 'M5 21V4h12l-2 4 2 4H5', refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7', copy: 'M8 8h12v12H8zM4 16V4h12'
  };
  H.ic = (n, cls) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}><path d="${IP[n] || ''}"/></svg>`;
  H.mark = (sz) => `<svg width="${sz || 36}" height="${sz || 36}" viewBox="0 0 40 40" aria-hidden="true"><rect x="1.5" y="1.5" width="37" height="37" rx="3" fill="none" stroke="#c9a14a" stroke-width="2"/><path d="M10 9v22M10 20h10M20 9v22" stroke="#fff" stroke-width="2.6" stroke-linecap="square"/><path d="M25 9h5v22h-5" fill="none" stroke="#c9a14a" stroke-width="2.6"/><circle cx="30" cy="20" r="1.6" fill="#c9a14a"/></svg>`;

  // ---------- status tones ----------
  const TONE = {
    'on-track': 'good', 'at-risk': 'warn', 'delayed': 'bad', 'completed': 'info', 'Completed': 'good', 'Approved': 'good', 'In Progress': 'info', 'Not Started': '', 'Submitted for Review': 'gold', 'Revision Required': 'bad',
    'Draft': '', 'Internal Review': 'info', 'Client Review': 'gold', 'Issued for Construction': 'good', 'Superseded': '', 'Open': 'bad', 'In progress': 'warn', 'Ready for reinspection': 'gold', 'Closed': 'good',
    'Submitted': 'warn', 'PM verified': 'gold', 'Paid': 'good', 'Raised': 'warn', 'Under review': 'info', 'Impact estimated': 'gold', 'Awaiting client approval': 'warn', 'Implemented': 'good', 'Rejected': '',
    'Scheduled': 'info', 'Overdue': 'bad', 'Due': 'warn', 'Part-paid': 'warn', 'Not due': '', 'Success': 'good', 'Failed': 'bad', 'Awaiting approval': 'gold', 'Won': 'good', 'Lost': '', 'High': 'bad', 'Medium': 'warn', 'Low': ''
  };
  const LABEL = { 'on-track': 'On track', 'at-risk': 'At risk', 'delayed': 'Delayed', 'completed': 'Completed' };
  H.pill = (s, tone) => `<span class="pill ${tone != null ? tone : (TONE[s] || '')}">${esc(LABEL[s] || s)}</span>`;

  // ---------- calculations ----------
  const done = H.done = t => ['Completed', 'Approved'].includes(t.status);
  H.overdue = t => !done(t) && t.due < TODAY;
  H.stale = t => !done(t) && t.status !== 'Not Started' && H.dif(t.updated) <= -5;
  H.stageName = s => ({ survey: 'Site survey', concept: 'Concept & space planning', drawings: 'Detailed drawings', approval: 'Awaiting client approval', execution: 'Under execution', handover: 'Snagging & handover', completed: 'Completed' }[s] || s);
  H.group = p => ['survey', 'concept', 'drawings'].includes(p.stage) ? 'design' : p.stage;
  H.active = () => db().projects.filter(p => p.stage !== 'completed');
  H.expected = p => {
    const acts = db().activities.filter(a => a.project === p.id);
    if (!acts.length || p.stage === 'completed') return p.progress;
    const v = acts.reduce((s, a) => s + Math.max(0, Math.min(1, H.dif(a.ps) * -1 / Math.max(1, H.dif(a.pe) - H.dif(a.ps)))) * 100, 0) / acts.length;
    return Math.round(v);
  };
  H.recalcProject = pid => {
    const p = H.P(pid), acts = db().activities.filter(a => a.project === pid);
    if (acts.length && p.stage !== 'completed') p.progress = Math.round(acts.reduce((s, a) => s + a.prog, 0) / acts.length);
  };
  H.invOut = i => Math.max(0, i.total - i.paid);
  H.invStatus = i => i.paid >= i.total ? 'Paid' : i.due < TODAY ? 'Overdue' : i.paid > 0 ? 'Part-paid' : H.dif(i.due) <= 7 ? 'Due' : 'Not due';
  H.fin = () => {
    const d = db(), act = H.active();
    const contract = act.reduce((s, p) => s + p.value + (p.co || 0), 0);
    const invoiced = d.invoices.reduce((s, i) => s + i.total, 0);
    const received = d.payments.filter(x => x.verified).reduce((s, x) => s + x.amount, 0);
    const outstanding = d.invoices.reduce((s, i) => s + H.invOut(i), 0);
    const overdue = d.invoices.filter(i => i.due < TODAY).reduce((s, i) => s + H.invOut(i), 0);
    const upcoming = [];
    act.forEach(p => { const m = (p.milestones || []).find(m => !m.invoiced); if (m && H.dif(m.expected) <= 30) upcoming.push({ p, m }); });
    const billsPending = d.bills.filter(b => ['Submitted', 'PM verified'].includes(b.status));
    const vendorDue = d.bills.filter(b => b.status === 'Approved');
    const coValue = d.changes.filter(c => ['Approved', 'Implemented'].includes(c.status)).reduce((s, c) => s + c.cost, 0);
    const budget = act.reduce((s, p) => s + p.budgetCost, 0);
    const actual = act.reduce((s, p) => s + H.costToDate(p), 0);
    const earned = act.reduce((s, p) => s + p.budgetCost * p.progress / 100, 0);
    const unverified = d.payments.filter(x => !x.verified);
    return { contract, invoiced, received, outstanding, overdue, upcoming, billsPending, vendorDue, coValue, budget, actual, earned, unverified };
  };
  const OVR = { p1: 1.04, p3: 1.09, p8: 1.03, p7: 0.99 };
  H.costToDate = p => Math.round(p.budgetCost * (p.progress / 100) * (OVR[p.id] || 1));
  H.margin = p => { const rev = p.value + (p.co || 0); const fc = p.budgetCost * (OVR[p.id] || 1) + (p.co || 0) * 0.78; return { rev, fc, m: rev - fc, pct: (rev - fc) / rev }; };
  H.ageing = () => {
    const b = [['Not yet due', 0], ['1–30 days', 0], ['31–60 days', 0], ['60+ days', 0]];
    db().invoices.forEach(i => { const o = H.invOut(i); if (!o) return; const late = -H.dif(i.due); const k = late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : 3; b[k][1] += o; });
    return b;
  };
  H.risk = p => {
    if (p.stage === 'completed') return { score: 0, slip: 0, reasons: [] };
    const d = db(), reasons = [];
    let score = 0;
    const exp = H.expected(p), gap = Math.max(0, exp - p.progress);
    if (['execution', 'handover'].includes(p.stage) && gap > 3) { score += gap * 1.6; reasons.push(`progress ${p.progress}% vs ${exp}% planned`); }
    const od = d.tasks.filter(t => t.project === p.id && H.overdue(t));
    if (od.length) { score += od.length * 4; reasons.push(`${od.length} overdue task${od.length > 1 ? 's' : ''}`); }
    const bl = d.tasks.filter(t => t.project === p.id && t.blocked && !done(t));
    if (bl.length) { score += bl.length * 8; reasons.push(bl[0].blocked.toLowerCase()); }
    const pend = d.drawings.filter(x => x.project === p.id && x.status === 'Client Review' && H.dif(x.submitted) <= -5);
    if (pend.length) { score += pend.length * 6; reasons.push(`${pend.length} client approval${pend.length > 1 ? 's' : ''} waiting 5+ days`); }
    const mat = d.materials.filter(m => m.project === p.id && m.shortage);
    if (mat.length) { score += 12; reasons.push('material shortage: ' + mat[0].item.toLowerCase()); }
    const cr = d.changes.filter(c => c.project === p.id && ['Raised', 'Under review', 'Impact estimated', 'Awaiting client approval'].includes(c.status));
    if (cr.length) { score += 4; reasons.push('open change request'); }
    const daysLeft = Math.max(1, H.dif(p.due));
    const slip = ['execution', 'handover'].includes(p.stage) ? Math.round(gap / 100 * (H.dif(p.due) - H.dif(p.start)) * 0.6 + bl.length * 3) : Math.round(pend.length * 4);
    return { score: Math.round(Math.min(100, score)), slip, reasons, daysLeft };
  };
  H.health = p => { if (p.stage === 'completed') return 'completed'; const r = H.risk(p); return r.score >= 45 || (r.slip > 6 && H.dif(p.due) < 30) ? 'delayed' : r.score >= 18 ? 'at-risk' : 'on-track'; };
  H.decisions = () => {
    const d = db(), out = [];
    d.bills.filter(b => b.status === 'PM verified').forEach(b => out.push({ kind: 'Contractor bill', text: `${H.name(b.contractor)} — ${b.title} (${H.lk(b.amount)})`, project: b.project, act: 'bill-approve', id: b.id, go: 'finance' }));
    d.changes.filter(c => c.status === 'Impact estimated').forEach(c => out.push({ kind: 'Change order', text: `${c.no}: ${c.title} (+${H.lk(c.cost)}, +${c.days} days)`, project: c.project, act: 'cr-owner-approve', id: c.id, go: 'project-' + c.project }));
    d.materials.filter(m => m.stage === 'Compared').forEach(m => out.push({ kind: 'Purchase order', text: `${m.item} — ${H.lk(m.value)} (quotes compared)`, project: m.project, act: 'mat-approve-po', id: m.id, go: 'procurement' }));
    d.leads.filter(l => l.stage === 'Negotiation').forEach(l => out.push({ kind: 'Discount approval', text: `${l.name} — ${l.type}, budget ${H.lk(l.budget)} asks 5% off`, project: null, act: 'lead-open', id: l.id, go: 'leads' }));
    d.tasks.filter(t => H.overdue(t) && H.dif(t.due) <= -3 && t.priority === 'High').forEach(t => out.push({ kind: 'Escalation', text: `${t.title} — ${H.name(t.assignee)}, ${-H.dif(t.due)} days late`, project: t.project, act: 'task-open', id: t.id, go: 'project-' + t.project }));
    return out;
  };
  H.workload = () => db().employees.filter(e => e.cap).map(e => {
    const ts = db().tasks.filter(t => t.assignee === e.id && !done(t));
    const od = ts.filter(H.overdue).length;
    const visits = db().visits.filter(v => v.by === e.id && v.status === 'Scheduled' && H.dif(v.date) >= 0 && H.dif(v.date) <= 7).length;
    const load = ts.length + visits * 0.5;
    return { e, open: ts.length, od, visits, load, util: Math.round(load / e.cap * 100) };
  });

  // ---------- records ----------
  H.log = (who, text, project) => db().activity.unshift({ id: 'ac' + Date.now() + Math.floor(Math.random() * 99), who, text, project, date: TODAY, time: new Date().toTimeString().slice(0, 5) });
  H.notify = (kind, text, go, action) => db().notes.unshift({ id: 'n' + Date.now() + Math.floor(Math.random() * 99), kind, text, go, action: !!action, read: false, date: TODAY });
  H.auto = (rule, text, status) => { const r = db().rules.find(x => x.id === rule); if (r && !r.on) return false; db().autolog.unshift({ id: 'al' + Date.now() + Math.floor(Math.random() * 99), rule, text, status: status || 'Success', date: TODAY, time: new Date().toTimeString().slice(0, 5) }); if (r) r.runs++; return true; };
  H.uid = p => p + Date.now().toString(36) + Math.floor(Math.random() * 1e3);

  // ---------- toasts & highlight ----------
  H.toast = msg => {
    let c = document.getElementById('toasts');
    if (!c) { c = document.createElement('div'); c.id = 'toasts'; c.className = 'toasts'; c.setAttribute('role', 'status'); document.body.appendChild(c); }
    while (c.children.length >= 2) c.firstChild.remove(); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; c.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  };
  H.hl = key => { S.ui.hl = key; };

  // ---------- access ----------
  H.NAV = [
    ['Command', [['dashboard', 'Executive Dashboard', 'grid'], ['ai', 'AI Command Centre', 'spark']]],
    ['Business', [['leads', 'Leads & CRM', 'funnel'], ['estimates', 'Estimates & BOQ', 'list'], ['projects', 'Projects', 'folder'], ['clients', 'Clients', 'users']]],
    ['Design', [['design', 'Design Studio', 'pen'], ['drawings', 'Drawings & Approvals', 'layers']]],
    ['Execution', [['tasks', 'Task Management', 'check'], ['visits', 'Site Visits', 'pin'], ['contractors', 'Contractors', 'hammer'], ['procurement', 'Procurement & Materials', 'box']]],
    ['Office', [['finance', 'Finance & Payments', 'rupee'], ['team', 'Team & HR', 'team'], ['calendar', 'Calendar & Meetings', 'cal'], ['reports', 'Reports & Analytics', 'chart'], ['notifications', 'Notifications', 'bell'], ['documents', 'Documents', 'doc']]],
    ['System', [['automation', 'Automation Centre', 'bolt'], ['configuration', 'Settings', 'gear'], ['blueprint', 'System Blueprint', 'map']]]
  ];
  const ACCESS = {
    owner: null,
    pm: ['dashboard', 'ai', 'leads', 'estimates', 'projects', 'project', 'clients', 'design', 'drawings', 'tasks', 'visits', 'contractors', 'procurement', 'finance', 'invoice', 'team', 'calendar', 'reports', 'notifications', 'documents', 'automation'],
    designer: ['dashboard', 'ai', 'projects', 'project', 'design', 'drawings', 'tasks', 'visits', 'calendar', 'notifications', 'documents']
  };
  H.can = key => { const a = ACCESS[S.role]; return !a || a.includes(key); };
  H.ROLES = {
    owner: { user: 'e0', label: 'Owner — Command Centre', desc: 'Everything, incl. margins & approvals' },
    pm: { user: 'e1', label: 'Project Manager', desc: 'Projects, sites, contractors; no margins' },
    designer: { user: 'e3', label: 'Designer / office staff', desc: 'My work, drawings, approvals' },
    site: { user: 'e9', label: 'Site supervisor app', desc: 'Mobile: visits, photos, snags' },
    client: { user: 'cl1', label: 'Client portal', desc: 'Approvals, payments, progress' },
    contractor: { user: 'c1', label: 'Contractor portal', desc: 'Work orders, evidence, bills' }
  };

  // ---------- charts ----------
  H.chart = (id, cfg, h) => { S.ui.charts[id] = cfg; return `<div class="fig" id="${id}" style="min-height:${h || 230}px"></div>`; };
  const smooth = pts => pts.length < 3 ? 'M' + pts.map(p => p.join(' ')).join(' L') : pts.reduce((acc, p, i, a) => { if (!i) return `M${p[0]} ${p[1]}`; const p0 = a[i - 2] || a[i - 1], p1 = a[i - 1], p2 = p, p3 = a[i + 1] || p; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; return acc + ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; }, '');
  const draw = (el, cfg) => {
    const W = el.clientWidth, Hh = el.clientHeight; if (!W) return;
    const m = { l: 46, r: 12, t: 14, b: 28 }, iw = W - m.l - m.r, ih = Hh - m.t - m.b;
    const all = cfg.series.flatMap(s => s.values), max = Math.max(1, ...all) * 1.12;
    const step = Math.pow(10, Math.floor(Math.log10(max / 4))), tick = Math.ceil(max / 4 / step) * step;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(cfg.label || '')}"><defs>${cfg.series.map((se, j) => `<linearGradient id="${el.id}-g${j}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${se.color}" stop-opacity=".28"/><stop offset="1" stop-color="${se.color}" stop-opacity="0"/></linearGradient>`).join('')}</defs>`;
    for (let v = 0; v <= max; v += tick) { const y = m.t + ih - v / max * ih; s += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="var(--line)" ${v ? 'stroke-dasharray="3 4"' : ''}/><text x="${m.l - 8}" y="${y + 4}" text-anchor="end">${cfg.fmt ? cfg.fmt(v) : v}</text>`; }
    const n = cfg.labels.length, gw = iw / n;
    if (cfg.type === 'bars') {
      const k = cfg.series.length, bw = Math.min(22, gw * 0.62 / k);
      cfg.series.forEach((se, j) => se.values.forEach((v, i) => { const x = m.l + gw * i + gw / 2 - (bw + 3) * k / 2 + j * (bw + 3), hgt = Math.max(0, v / max * ih), y = m.t + ih - hgt, r = Math.min(5, bw / 2, hgt); s += `<path d="M${x.toFixed(1)} ${(m.t + ih).toFixed(1)} V${(y + r).toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${(x + r).toFixed(1)} ${y.toFixed(1)} H${(x + bw - r).toFixed(1)} Q${(x + bw).toFixed(1)} ${y.toFixed(1)} ${(x + bw).toFixed(1)} ${(y + r).toFixed(1)} V${(m.t + ih).toFixed(1)}Z" fill="${se.color}"><title>${esc(cfg.labels[i] + ' · ' + se.name + ': ' + (cfg.fmt ? cfg.fmt(v) : v))}</title></path>`; }));
    } else {
      cfg.series.forEach((se, j) => {
        const pts = se.values.map((v, i) => [+(m.l + gw * i + gw / 2).toFixed(1), +(m.t + ih - v / max * ih).toFixed(1)]);
        const path = smooth(pts);
        if (se.fill || cfg.type === 'area') if (se.fill) s += `<path d="${path} L${pts[pts.length - 1][0]} ${m.t + ih} L${pts[0][0]} ${m.t + ih}Z" fill="url(#${el.id}-g${j})"/>`;
        s += `<path d="${path}" fill="none" stroke="${se.color}" stroke-width="2.4" stroke-linecap="round" ${se.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
        pts.forEach((p, i) => s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 4.5 : 3}" fill="var(--panel)" stroke="${se.color}" stroke-width="2"><title>${esc(cfg.labels[i] + ' · ' + se.name + ': ' + (cfg.fmt ? cfg.fmt(se.values[i]) : se.values[i]))}</title></circle>`);
      });
    }
    cfg.labels.forEach((l, i) => { if (W < 520 && n > 8 && i % 2) return; s += `<text x="${m.l + gw * i + gw / 2}" y="${Hh - 8}" text-anchor="middle">${esc(l)}</text>`; });
    el.innerHTML = s + '</svg>';
  };
  const ro = window.ResizeObserver ? new ResizeObserver(es => es.forEach(e => { const c = S.ui.charts[e.target.id]; if (c) draw(e.target, c); })) : null;
  H.drawCharts = () => { document.querySelectorAll('.fig[id]').forEach(el => { const c = S.ui.charts[el.id]; if (!c) return; draw(el, c); if (ro) ro.observe(el); }); };

  // ---------- generated pictures (renders, site photos, boards) ----------
  H.thumb = (seed, kind, label) => {
    let s = Math.abs(seed | 0) * 7919 + 13;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const P1 = [['#d9cbb4', '#8a6a4a', '#2f3b3a', '#c9a14a'], ['#e6ddd0', '#6f4e37', '#7b8b6f', '#b5543c'], ['#cfd4cf', '#5c4a3d', '#30363d', '#c9a14a'], ['#efe6da', '#9a7b5b', '#4a5d6a', '#a67c52'], ['#dcd2c4', '#4b3b31', '#5f6b4e', '#c9a14a']];
    const pal = P1[Math.floor(r() * P1.length)];
    if (kind === 'site') {
      const w = '#b9b2a6', fl = '#8f887d';
      let bricks = '';
      for (let y = 18; y < 62; y += 7) for (let x = (y / 7 % 2 ? 6 : 0); x < 160; x += 14) bricks += `<rect x="${x}" y="${y}" width="12" height="5" fill="${['#b6694e', '#a85f46', '#bf7457'][Math.floor(r() * 3)]}" opacity="${r() < .25 ? 0 : .9}"/>`;
      return `<svg viewBox="0 0 160 100" role="img" aria-label="${esc(label || 'Site photo')}"><rect width="160" height="100" fill="${w}"/>${bricks}<polygon points="0,62 160,62 160,100 0,100" fill="${fl}"/><path d="M${20 + r() * 40} 14 V60 M${80 + r() * 50} 14 V58 H150" stroke="#e8822f" stroke-width="2.2" fill="none"/><rect x="${100 + r() * 20}" y="38" width="10" height="16" fill="#dcdcdc" stroke="#777"/><path d="M28 100 L44 52 M52 100 L44 52 M32 88 H48 M36 76 H46 M39 64 H45" stroke="#c9a14a" stroke-width="2.2"/><rect x="0" y="0" width="160" height="12" fill="#3a3632"/><circle cx="${60 + r() * 60}" cy="6" r="3" fill="#ffe8a3"/><rect x="${118 - r() * 30}" y="70" width="${18 + r() * 14}" height="8" fill="#d8d0c2" stroke="#6b645a"/></svg>`;
    }
    if (kind === 'board') {
      let sw = '';
      const cs = [pal[0], pal[1], pal[2], pal[3], '#f4efe6', '#3a332c'];
      cs.forEach((c, i) => { const x = 8 + (i % 3) * 50, y = 8 + Math.floor(i / 3) * 44; sw += `<rect x="${x}" y="${y}" width="44" height="38" rx="3" fill="${c}"/>`; if (i === 1) for (let k = 0; k < 6; k++) sw += `<path d="M${x} ${y + 6 + k * 6} q22 ${-4 + r() * 8} 44 0" stroke="#000" stroke-opacity=".12" fill="none"/>`; if (i === 4) sw += `<path d="M${x + 6} ${y + 30} l12-20 l10 14 l8-8" stroke="#a89f90" fill="none"/>`; });
      return `<svg viewBox="0 0 160 100" role="img" aria-label="${esc(label || 'Material board')}"><rect width="160" height="100" fill="#fbf8f2"/>${sw}</svg>`;
    }
    const [wall, wood, fab, acc] = pal;
    const winX = 70 + r() * 40;
    return `<svg viewBox="0 0 160 100" role="img" aria-label="${esc(label || '3D render')}"><defs><linearGradient id="g${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient></defs>
<rect width="160" height="100" fill="url(#g${seed})"/><polygon points="0,0 22,12 22,70 0,100" fill="${wall}" opacity=".7"/><polygon points="160,0 138,12 138,70 160,100" fill="#000" opacity=".06"/>
<rect x="22" y="12" width="116" height="58" fill="${wall}"/><polygon points="0,100 22,70 138,70 160,100" fill="${wood}"/><path d="M0 100 L22 70 M40 100 L48 70 M80 100 L80 70 M120 100 L112 70" stroke="#000" stroke-opacity=".1"/>
<rect x="${winX}" y="20" width="34" height="34" fill="#f6efd8" stroke="${wood}" stroke-width="2"/><path d="M${winX + 17} 20 v34" stroke="${wood}"/><rect x="0" y="0" width="160" height="12" fill="#000" opacity=".05"/>
<path d="M${40 + r() * 20} 12 v14" stroke="#333"/><circle cx="${40 + r() * 20}" cy="28" r="4" fill="${acc}"/>
<rect x="30" y="52" width="58" height="16" rx="4" fill="${fab}"/><rect x="30" y="46" width="58" height="9" rx="4" fill="${fab}" opacity=".85"/><rect x="26" y="50" width="8" height="18" rx="3" fill="${fab}"/><rect x="84" y="50" width="8" height="18" rx="3" fill="${fab}"/>
<ellipse cx="68" cy="82" rx="22" ry="5" fill="#000" opacity=".12"/><rect x="50" y="74" width="36" height="5" rx="2" fill="${acc}"/><path d="M128 70 q-6-20 0-28 q6 8 0 28" fill="#5d7a52"/><rect x="123" y="62" width="10" height="8" fill="${wood}"/></svg>`;
  };

  // ---------- router & render ----------
  H.go = h => { S.ui.drawer = null; S.ui.modal = null; S.ui.pop = null; S.ui.side = false; S.ui.route = h; try { if (location.hash.slice(1) !== h) location.hash = h; } catch (e) { /* sandbox */ } H.render(); window.scrollTo(0, 0); };
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== S.ui.route) { S.ui.route = h; S.ui.drawer = null; S.ui.modal = null; H.render(); } });
  H.counts = () => {
    const d = db(); const ntf = d.notes.filter(n => !n.read).length;
    return {
      dashboard: H.decisions().length, leads: d.leads.filter(l => !['Won', 'Lost'].includes(l.stage) && l.next && l.next <= TODAY).length,
      projects: H.active().filter(p => H.health(p) !== 'on-track').length, drawings: d.drawings.filter(x => ['Internal Review', 'Client Review'].includes(x.status)).length,
      tasks: d.tasks.filter(H.overdue).length, visits: d.visits.filter(v => v.date === TODAY && v.status === 'Scheduled').length, procurement: d.materials.filter(m => m.shortage).length,
      finance: d.invoices.filter(i => H.invStatus(i) === 'Overdue').length, notifications: ntf, automation: d.autolog.filter(a => a.status !== 'Success').length
    };
  };
  const RED = { tasks: 1, finance: 1, projects: 1, procurement: 1 };
  H.shell = content => {
    const c = H.counts(), r = S.ui.route.split('-')[0];
    const nav = H.NAV.map(([g, items]) => {
      const vis = items.filter(([k]) => H.can(k));
      if (!vis.length) return '';
      return `<div class="navgrp">${g}</div>` + vis.map(([k, l, i]) => `<a class="nav${r === k || (k === 'projects' && r === 'project') || (k === 'finance' && r === 'invoice') ? ' on' : ''}" href="#${k}" data-go="${k}">${H.ic(i)}<span>${l}</span>${c[k] ? `<span class="cnt${RED[k] ? ' red' : ''}">${c[k]}</span>` : ''}</a>`).join('');
    }).join('');
    const u = H.E(S.user);
    return `<div class="app${S.ui.side ? ' side-open' : ''}">
<aside class="side" aria-label="Main navigation"><div class="brand">${H.mark(30)}<div><b>Hands On Design</b><span>Command Centre</span></div></div>${nav}
<div class="foot">Demo with fictional sample data. Company details, logo and photographs from handsondesign.in.</div>
<div class="me">${H.av(S.user)}<div class="li-main"><div class="t" style="font-size:13.5px">${esc(u ? u.name : '')}</div><div class="s" style="font-size:12px">${esc(H.ROLES[S.role].label)}</div></div><button class="btn icon sm ghost" data-act="pop" data-id="role" aria-label="Switch interface">${H.ic('users')}</button></div></aside>
${S.ui.side ? '<div class="scrim" data-act="side"></div>' : ''}
<div class="main"><header class="top">
<button class="btn icon menu-btn" data-act="side" aria-label="Open menu">${H.ic('menu')}</button>
<div class="search">${H.ic('search')}<input id="gsearch" type="search" placeholder="Search projects, clients, drawings, invoices…" autocomplete="off" data-inp="search" aria-label="Global search"><span class="kbd">Ctrl K</span><div id="sres"></div></div>
<div class="sp"></div>
<span class="hide-sm">${H.Live ? H.Live.pill() : ''}</span>
${S.role === 'owner' ? `<button class="btn icon hide-sm" data-act="role" data-id="ownerm" aria-label="Open the owner phone app" title="Owner phone app">${H.ic('phone')}</button>` : ''}<button class="btn gold" data-act="scen-menu">${H.ic('play')}<span class="hide-sm">Demo scenarios</span></button>
<div class="relw"><button class="btn icon" data-act="pop" data-id="create" aria-label="Quick create">${H.ic('plus')}</button>${S.ui.pop === 'create' ? H.createMenu() : ''}</div>
<button class="btn icon relw" data-go="notifications" aria-label="Notifications">${H.ic('bell')}${c.notifications ? `<span style="position:absolute;top:3px;right:3px;background:var(--bad);color:#fff;border-radius:10px;font-size:10.5px;font-weight:700;padding:0 5px;line-height:16px">${c.notifications}</span>` : ''}</button>
<div class="relw"><button class="btn" data-act="pop" data-id="role" style="padding-left:5px">${H.av(S.user)}<span class="hide-sm">${esc(u ? u.name.split(' ')[0] : '')}</span></button>${S.ui.pop === 'role' ? H.roleMenu() : ''}</div>
</header><main class="view" id="view">${content}</main></div></div>`;
  };
  H.createMenu = () => `<div class="pop" role="menu">${[['lead', 'New client enquiry', 'funnel'], ['task', 'New task', 'check'], ['visit', 'Schedule site visit', 'pin'], ['change', 'Change request', 'refresh'], ['drawing', 'Upload drawing / render', 'layers'], ['meeting', 'New meeting', 'cal'], ['invoice', 'Design an invoice', 'rupee'], ['doc', 'Upload document', 'upload'], ['3d', 'Upload 3D model or render', 'layers']].filter(x => x[0] !== 'invoice' || S.role !== 'designer').map(([k, l, i]) => k === 'invoice' ? `<button data-go="invoice-new" role="menuitem">${H.ic(i)}${l}</button>` : k === '3d' ? `<button data-go="design" role="menuitem">${H.ic(i)}${l}</button>` : `<button data-act="modal" data-id="${k}" role="menuitem">${H.ic(i)}${l}</button>`).join('')}</div>`;
  H.roleMenu = () => `<div class="pop" role="menu" style="min-width:280px"><div class="small muted" style="padding:6px 10px">Switch interface (demo)</div>${Object.entries(H.ROLES).map(([k, r]) => `<button data-act="role" data-id="${k}" role="menuitem">${H.av(r.user)}<span><b style="font-weight:500">${r.label}</b><br><span class="small muted">${r.desc}</span></span></button>`).join('')}<button data-act="logout" role="menuitem">${H.ic('out')}Sign out</button></div>`;
  H.render = () => {
    const root = document.getElementById('root');
    S.ui.charts = {};
    let html;
    try {
      if (!S.session) html = H.V.login();
      else if (S.role === 'site') html = H.Portal.site();
      else if (S.role === 'ownerm' && H.Portal.ownerm) html = H.Portal.ownerm();
      else if (S.role === 'client') html = H.Portal.client();
      else if (S.role === 'contractor') html = H.Portal.contractor();
      else {
        const [k, ...rest] = S.ui.route.split('-');
        const param = rest.join('-');
        const fn = H.V[k] || H.V.dashboard;
        html = H.shell(H.can(k) ? fn(param) : `<div class="card"><h2>Not available for this role</h2><p class="muted" style="margin-top:6px">This module is restricted by role-based access. Switch to the owner view to see it.</p></div>`);
      }
    } catch (err) {
      console.error(err);
      html = `<div style="padding:30px"><h2>Something went wrong drawing this screen</h2><p class="muted">${esc(err.message)}</p><button class="btn" data-act="reset">Reset demo data</button></div>`;
    }
    root.innerHTML = html + H.overlays();
    H.drawCharts();
    (H.afterRender || []).forEach(f => { try { f(); } catch (e) { console.error(e); } });
    if (S.ui.hl) { const el = document.querySelector(`[data-k="${S.ui.hl}"]`); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } S.ui.hl = null; }
  };
  H.commit = (msg, hl) => { H.save(); if (hl) H.hl(hl); H.render(); if (msg) H.toast(msg); };

  // ---------- overlays ----------
  H.overlays = () => {
    let o = '';
    if (S.ui.drawer && H.Drawer[S.ui.drawer.type]) o += `<div class="dscrim" data-act="close"></div><aside class="drawer" role="dialog" aria-modal="true"><div class="row between" style="margin-bottom:10px"><span class="muted small">${esc(S.ui.drawer.type.replace(/^\w/, c => c.toUpperCase()))} details</span><button class="btn icon ghost" data-act="close" aria-label="Close">${H.ic('x')}</button></div>${H.Drawer[S.ui.drawer.type](S.ui.drawer.id)}</aside>`;
    if (S.ui.modal && H.Modal[S.ui.modal.type]) o += `<div class="mscrim" data-act="close"></div><div class="modal" role="dialog" aria-modal="true"><div class="row between" style="margin-bottom:12px"><span></span><button class="btn icon ghost" data-act="close" aria-label="Close">${H.ic('x')}</button></div>${H.Modal[S.ui.modal.type](S.ui.modal)}</div>`;
    if (S.ui.scen) o += H.Scen.panel();
    (H.extraOverlays || []).forEach(f => { try { o += f(); } catch (e) { console.error(e); } });
    return o;
  };

  // ---------- events ----------
  H.A = {}; H.F = {}; H.Cg = {}; H.I = {}; H.Drawer = {}; H.Modal = {}; H.V = {}; H.Portal = {};
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act],[data-go]');
    if (!a) { if (S.ui.pop && !e.target.closest('.pop')) { S.ui.pop = null; H.render(); } const sr = document.getElementById('sres'); if (sr && !e.target.closest('.search')) sr.innerHTML = ''; return; }
    if (a.dataset.go) { e.preventDefault(); H.go(a.dataset.go); return; }
    const fn = H.A[a.dataset.act];
    if (fn) { e.preventDefault(); try { fn(a, e); } catch (err) { console.error(err); H.toast('Action failed: ' + err.message); } }
  });
  document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); const fd = {}; new FormData(f).forEach((v, k) => { fd[k] = v; }); try { H.F[f.dataset.form](fd, f); } catch (err) { console.error(err); H.toast('Could not save: ' + err.message); } });
  document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el && H.Cg[el.dataset.chg]) H.Cg[el.dataset.chg](el, e); });
  document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el && H.I[el.dataset.inp]) H.I[el.dataset.inp](el, e); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (S.ui.drawer || S.ui.modal || S.ui.pop)) { S.ui.drawer = null; S.ui.modal = null; S.ui.pop = null; H.render(); } });
  // drag & drop for kanban boards
  document.addEventListener('dragstart', e => { const c = e.target.closest('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); e.dataTransfer.effectAllowed = 'move'; } });
  document.addEventListener('dragover', e => { const c = e.target.closest('[data-drop]'); if (c) { e.preventDefault(); c.classList.add('over'); } });
  document.addEventListener('dragleave', e => { const c = e.target.closest('[data-drop]'); if (c) c.classList.remove('over'); });
  document.addEventListener('drop', e => { const c = e.target.closest('[data-drop]'); if (!c) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const [kind, val] = c.dataset.drop.split(':'); if (H.A['drop-' + kind]) H.A['drop-' + kind](id, val); });

  // common actions
  Object.assign(H.A, {
    side: () => { S.ui.side = !S.ui.side; H.render(); },
    pop: a => { S.ui.pop = S.ui.pop === a.dataset.id ? null : a.dataset.id; H.render(); },
    close: () => { S.ui.drawer = null; S.ui.modal = null; H.render(); },
    modal: a => { S.ui.pop = null; S.ui.modal = Object.assign({ type: a.dataset.id }, a.dataset.arg ? JSON.parse(a.dataset.arg) : {}); H.render(); },
    drawer: a => { S.ui.drawer = { type: a.dataset.type, id: a.dataset.id }; H.render(); },
    tab: a => { S.ui.tab[a.dataset.k] = a.dataset.v; H.render(); },
    filt: a => { S.ui.f[a.dataset.k] = a.dataset.v; H.render(); },
    role: a => { const r = a.dataset.id; S.role = r; S.user = H.ROLES[r].user; if (r === 'client') S.clientId = S.clientId || 'cl1'; if (r === 'contractor') S.contractorId = S.contractorId || 'c1'; S.ui.pop = null; S.ui.route = 'dashboard'; H.save(); H.render(); H.toast('Switched to ' + H.ROLES[r].label); },
    logout: () => { S.session = null; S.ui.pop = null; H.save(); H.render(); },
    reset: () => { H.reset(); S.ui.route = 'dashboard'; H.render(); H.toast('Demo data reset to the starting state'); },
    'read-all': () => { db().notes.forEach(n => n.read = true); H.commit('All notifications marked as read'); },
    note: a => { const n = db().notes.find(x => x.id === a.dataset.id); if (n) { n.read = true; H.save(); H.go(n.go || 'dashboard'); } },
    copy: a => { const el = document.getElementById(a.dataset.id); const txt = el ? el.innerText : ''; try { navigator.clipboard.writeText(txt).then(() => H.toast('Copied to clipboard'), () => H.toast('Select the text and copy it manually')); } catch (e) { H.toast('Select the text and copy it manually'); } }
  });
  H.Cg.f = el => { S.ui.f[el.dataset.k] = el.value; H.render(); };
  H.Cg.client = el => { S.clientId = el.value; H.save(); H.render(); };
  H.Cg.contractor = el => { S.contractorId = el.value; H.save(); H.render(); };
  H.I.search = el => {
    const q = el.value.trim().toLowerCase(), box = document.getElementById('sres');
    if (!box) return;
    if (q.length < 2) { box.innerHTML = ''; return; }
    const d = db(), res = [];
    d.projects.forEach(p => { if ((p.name + p.code + p.location + p.type).toLowerCase().includes(q)) res.push(['Project', p.name + ' · ' + p.code, 'project-' + p.id]); });
    d.clients.forEach(c => { if ((c.name + c.contact).toLowerCase().includes(q)) res.push(['Client', c.name, 'clients']); });
    d.contractors.forEach(c => { if ((c.name + c.trade).toLowerCase().includes(q)) res.push(['Contractor', c.name + ' · ' + c.trade, 'contractors']); });
    d.drawings.forEach(x => { if ((x.no + x.title).toLowerCase().includes(q)) res.push(['Drawing', x.no + ' · ' + x.title, 'drawings']); });
    d.tasks.forEach(t => { if (t.title.toLowerCase().includes(q)) res.push(['Task', t.title + ' · ' + H.P(t.project).name, 'project-' + t.project]); });
    d.leads.forEach(l => { if ((l.name + l.type + l.location).toLowerCase().includes(q)) res.push(['Lead', l.name + ' · ' + l.type, 'leads']); });
    d.employees.forEach(e => { if ((e.name + e.role).toLowerCase().includes(q)) res.push(['Team', e.name + ' · ' + e.role, 'team']); });
    box.innerHTML = res.length ? `<div class="sres">${res.slice(0, 12).map(([k, t, g]) => `<a href="#${g}" data-go="${g}"><span class="tag">${k}</span><span>${esc(t)}</span></a>`).join('')}</div>` : `<div class="sres"><div style="padding:12px" class="muted small">No records match “${esc(q)}”.</div></div>`;
  };

  H.start = () => {
    H.load();
    const h = (location.hash || '').slice(1);
    if (h) S.ui.route = h;
    H.render();
  };
})();
