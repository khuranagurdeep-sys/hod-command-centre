/* Views: login, dashboards, projects, project detail, leads, clients + shared renderers */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic;
  const R = H.R = {};

  // ---------- shared renderers ----------
  R.spark = (vals, tone) => { if (!vals || vals.length < 2) return ''; const mn = Math.min(...vals), mx = Math.max(...vals), rg = mx - mn || 1; const pts = vals.map((v, i) => [(i / (vals.length - 1) * 70 + 1).toFixed(1), (26 - (v - mn) / rg * 22).toFixed(1)]); const c = tone === 'bad' ? 'var(--bad)' : tone === 'warn' ? 'var(--warn)' : 'var(--acc)'; return `<svg class="spark" viewBox="0 0 72 28" aria-hidden="true"><path d="M${pts.map(p => p.join(' ')).join(' L')} L71 28 L1 28Z" fill="${c}" opacity=".08"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.4" fill="${c}"/></svg>`; };
  // a deterministic 8-week history ending at the current value (sample data for the demo)
  R.series = (seed, end, vol) => { let x = Math.abs(H.hue(String(seed))) + 7; const r = () => (x = (x * 16807) % 2147483647) / 2147483647; const out = [end]; let v = end; for (let i = 0; i < 7; i++) { v = Math.max(0, v * (1 + (r() - 0.55) * (vol || 0.18))); out.unshift(v); } return out; };
  R.delta = (vals, goodUp) => { if (!vals) return ''; const a = vals[vals.length - 2], b = vals[vals.length - 1]; if (!a) return ''; const pc = Math.round((b - a) / a * 100); if (!pc) return '<span class="delta">0%</span>'; const up = pc > 0; return `<span class="delta ${(up === (goodUp !== false)) ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(pc)}%</span>`; };
  R.kpis = items => `<div class="kpis">${items.map(([l, v, d, go, tone, sp, goodUp]) => `<${go ? `a href="#${go}" data-go="${go}"` : 'div'} class="kpi ${tone || ''}">${sp ? R.spark(sp, tone === 'alert' ? 'bad' : tone === 'warnk' ? 'warn' : '') : ''}<div class="l">${l}</div><div class="v${String(v).length > 9 ? ' sm' : ''}">${v}</div>${d || sp ? `<div class="d">${sp ? R.delta(sp, goodUp) + ' <span>vs last week</span>' : ''}${d ? `<span>${d}</span>` : ''}</div>` : ''}</${go ? 'a' : 'div'}>`).join('')}</div>`;
  R.mini = items => `<div class="mini">${items.map(([l, v, d, go, tone]) => `<${go ? `a href="#${go}" data-go="${go}"` : 'div'} class="${tone || ''}"><div class="l">${l}</div><div class="v">${v}</div>${d ? `<div class="small muted">${d}</div>` : ''}</${go ? 'a' : 'div'}>`).join('')}</div>`;
  R.donut = (rows, center, sub) => { const tot = rows.reduce((s, r) => s + r[1], 0) || 1; let a = -Math.PI / 2; const arcs = rows.map(([l, v, c]) => { const a2 = a + v / tot * Math.PI * 2 - 0.0001; const large = a2 - a > Math.PI ? 1 : 0; const p = (ang, r) => [60 + r * Math.cos(ang), 60 + r * Math.sin(ang)]; const [x1, y1] = p(a, 50), [x2, y2] = p(a2, 50); const d = v ? `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A50 50 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${c}" stroke-width="16"><title>${esc(l)}</title></path>` : ''; a = a2 + 0.0001; return d; }).join(''); return `<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="${esc(sub || 'Breakdown')}"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--panel3)" stroke-width="16"/>${arcs}<text x="60" y="58" text-anchor="middle" style="font:800 15px var(--display);fill:var(--ink)">${center}</text><text x="60" y="74" text-anchor="middle" style="font:11px Inter,sans-serif;fill:var(--muted)">${esc(sub || '')}</text></svg><div class="lg">${rows.map(([l, v, c, fv]) => `<div><span><i style="background:${c}"></i>${esc(l)}</span><b class="num">${fv || v}</b></div>`).join('')}</div></div>`; };
  R.pcard = p => { const hl = H.health(p), r = H.risk(p), exp = ['execution', 'handover'].includes(p.stage) ? H.expected(p) : null; return `<a class="pcard" href="#project-${p.id}" data-go="project-${p.id}" data-k="pc-${p.id}"><div class="pimg"><img class="ph" src="${H.cover(p.id)}" alt="${esc(p.name)}" loading="lazy">${H.pill(hl)}<span class="code">${esc(p.code)}</span></div><div class="pbody"><div class="row between" style="flex-wrap:nowrap"><b>${esc(p.name)}</b><span class="small num" style="font-weight:700">${p.progress}%</span></div><div class="small muted" style="margin-top:-4px">${esc(H.CL(p.client).name)} · ${esc(p.location)}</div>${R.prog(p.progress, exp, hl === 'delayed' ? 'bad' : hl === 'at-risk' ? 'warn' : '')}<div class="row between small" style="flex-wrap:nowrap"><span class="muted">${H.stageName(p.stage)}</span><span class="avs">${[p.pm, p.designer, p.site].map(id => H.av(id)).join('')}</span></div><div class="row between small" style="flex-wrap:nowrap;margin-top:-2px"><span class="muted">${p.stage === 'completed' ? 'Handed over' : 'Handover ' + H.fd(p.due)}</span>${r.slip > 0 && hl !== 'on-track' ? `<span class="bad" style="font-weight:600">+${r.slip} days</span>` : `<span class="good" style="font-weight:600">${p.stage === 'completed' ? 'Closed' : 'On date'}</span>`}</div></div></a>`; };
  R.prog = (val, exp, tone) => `<div class="prog ${tone || ''}" title="Actual ${val}%${exp != null ? ' · planned ' + exp + '%' : ''}"><i style="width:${Math.min(100, val)}%"></i>${exp != null ? `<b style="left:${Math.min(100, exp)}%"></b>` : ''}</div>`;
  R.hbars = (rows, fmt, color) => { const max = Math.max(1, ...rows.map(r => r[1])); return rows.map(([l, v, extra, c]) => `<div class="hbar"><span>${l}</span><span class="tr"><i style="width:${(v / max * 100).toFixed(1)}%;background:${c || color || 'var(--gold2)'}"></i></span><span class="num">${fmt ? fmt(v) : v}${extra ? ' ' + extra : ''}</span></div>`).join(''); };
  R.empty = t => `<div class="empty">${t}</div>`;
  R.tabs = (k, items, cur) => `<div class="tabs" role="tablist">${items.map(([v, l, n]) => `<button role="tab" class="${cur === v ? 'on' : ''}" data-act="tab" data-k="${k}" data-v="${v}">${l}${n ? ` <span class="muted">(${n})</span>` : ''}</button>`).join('')}</div>`;
  R.seg = (k, items, cur) => `<div class="seg">${items.map(([v, l]) => `<button class="${cur === v ? 'on' : ''}" data-act="filt" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  R.sel = (k, opts, cur, label) => `<select class="in" style="width:auto;min-width:150px;min-height:38px;font-size:14px" data-chg="f" data-k="${k}" aria-label="${esc(label || k)}">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  R.projOpts = (all) => [[all ? '' : 'all', 'All projects']].concat(db().projects.map(p => [p.id, p.name]));
  R.healthPill = p => H.pill(H.health(p));

  // floor-plan style drawing preview
  H.plan = (seed, label) => {
    let s = Math.abs(seed | 0) * 48271 + 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const x1 = 50 + r() * 30, y1 = 40 + r() * 20;
    let f = '';
    for (let k = 0; k < 4; k++) f += `<rect x="${20 + r() * 110}" y="${18 + r() * 60}" width="${8 + r() * 14}" height="${6 + r() * 10}" fill="none" stroke="#9a8a6a" stroke-width=".8"/>`;
    return `<svg viewBox="0 0 160 100" role="img" aria-label="${esc(label || 'Drawing preview')}"><rect width="160" height="100" fill="#fbfaf6"/><g stroke="#2c2a26" stroke-width="2.4" fill="none"><rect x="10" y="10" width="140" height="80"/><path d="M${x1} 10 V${y1} M10 ${y1 + 10} H${x1 - 14} M${x1} ${y1 + 22} V90 M${x1} ${y1 + 10} H150"/></g><path d="M${x1 - 14} ${y1 + 10} a14 14 0 0 1 14 -14" fill="none" stroke="#2c2a26" stroke-width=".8"/>${f}<path d="M10 96 H150 M10 94 V98 M150 94 V98" stroke="#B48C55" stroke-width=".8"/><rect x="118" y="78" width="30" height="10" fill="#fff" stroke="#B48C55" stroke-width=".8"/></svg>`;
  };

  // ---------- login ----------
  H.V.login = () => {
    const sel = S.ui.loginRole || 'owner';
    const c = db().company;
    return `<div class="login"><section class="art"><img src="${H.photoUrl('dining_arches')}" alt="Hands On Design restaurant interior with arched booths">
<div class="cap" style="color:#fff">${H.logo(190)}</div>
<div class="cap"><h1>Every project, person and payment, on one screen.</h1><p>The Command Centre for architecture, interiors and turnkey execution: what is moving, what is late, who owns it and what money is due, without thirty follow-up calls a day.</p><div class="stats"><div><b>17+</b>years</div><div><b>1000+</b>clients</div><div><b>60+</b>cities</div></div></div>
<div class="cap" style="font-size:12.5px;color:#b9c4bf">Demo with fictional sample projects, people and amounts. Company details, logo and portfolio photographs from handsondesign.in. Est. ${c.founded} · Paschim Vihar, New Delhi.</div></section>
<section class="pane"><div style="max-width:470px;width:100%;margin:0 auto"><h2 style="font-size:24px">Sign in <span class="pill gold" style="vertical-align:middle">Demo</span></h2><p class="muted" style="margin-top:4px">Choose who you want to sign in as. Each role sees only its own interface and data.</p>
<form data-form="login" style="margin-top:18px" class="stack"><div class="callout small">Demo sign-in: pick a role below. No email or password is needed or collected here. The production system uses each person’s work email, password and a one-time code.</div>
<div class="users">${Object.entries(H.ROLES).filter(([k]) => k !== 'ownerm').map(([k, r]) => `<button type="button" class="ucard${sel === k ? ' on' : ''}" data-act="login-role" data-id="${k}">${H.av(r.user)}<span><b>${r.label}</b><span>${esc(H.name(r.user))} · ${r.desc}</span></span></button>`).join('')}</div>
${sel === 'owner' ? '<p class="notice">' + ic('eye') + 'Owner and finance sign-ins use a one-time code (MFA) in production. Skipped in this demo.</p>' : ''}
<button class="btn pri" style="width:100%;min-height:48px;font-size:15px" type="submit">Sign in as ${esc(H.ROLES[sel].label)} ${ic('arrow')}</button><button type="button" class="btn gold" style="width:100%;min-height:46px;font-size:15px" data-act="tour-start">${ic('play')}Watch the 2-minute guided tour</button></form>
<p class="small muted" style="margin-top:16px">No real accounts exist in this demo. Your changes stay in this browser; Settings → Demo data resets them.</p></div></section></div>`;
  };
  H.A['login-role'] = a => { S.ui.loginRole = a.dataset.id; H.render(); };
  H.F.login = () => { const r = S.ui.loginRole || 'owner'; S.session = { at: Date.now() }; S.role = r; S.user = H.ROLES[r].user; S.ui.route = 'dashboard'; try { history.replaceState(null, '', '#dashboard'); } catch (e) { /* sandbox */ } H.save(); H.render(); H.top(); H.toast('Welcome, ' + H.first(S.user)); };

  // ---------- dashboards ----------
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const dateLine = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  R.portfolio = (list, showMoney) => `<div class="tw"><table><thead><tr><th>Project</th><th>Stage</th><th style="min-width:150px">Progress <span class="muted">(| = planned)</span></th><th>Health</th><th>Owner</th><th>Handover</th>${showMoney ? '<th class="num">Outstanding</th>' : ''}<th class="num">Issues</th></tr></thead><tbody>${list.map(p => {
    const exp = ['execution', 'handover'].includes(p.stage) ? H.expected(p) : null, hl = H.health(p), r = H.risk(p);
    const out = db().invoices.filter(i => i.project === p.id).reduce((s, i) => s + H.invOut(i), 0);
    const iss = db().tasks.filter(t => t.project === p.id && H.overdue(t)).length + db().snags.filter(x => x.project === p.id && x.status !== 'Closed').length;
    return `<tr class="click" data-go="project-${p.id}" data-k="row-${p.id}"><td><div class="row" style="flex-wrap:nowrap;gap:12px"><img src="${H.cover(p.id)}" alt="" loading="lazy" style="width:64px;height:42px;object-fit:cover;border-radius:9px;flex:none"><div><div style="font-weight:600">${esc(p.name)}</div><div class="small muted">${esc(H.CL(p.client).name)} · ${esc(p.type)}</div></div></div></td><td class="small">${H.stageName(p.stage)}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap">${R.prog(p.progress, exp, hl === 'delayed' ? 'bad' : hl === 'at-risk' ? 'warn' : '')}<span class="small num">${p.progress}%</span></div></td><td>${H.pill(hl)}${r.slip > 0 && hl !== 'on-track' ? `<div class="small bad" style="margin-top:3px">~${r.slip} days slip</div>` : ''}</td><td>${H.who(p.pm)}</td><td class="nowrap">${H.fd(p.due)}<div class="small muted">${H.rel(p.due)}</div></td>${showMoney ? `<td class="num">${out ? H.lk(out) : '—'}</td>` : ''}<td class="num">${iss || '—'}</td></tr>`;
  }).join('')}</tbody></table></div>`;

  R.decisionList = (limit) => {
    const d = H.decisions();
    if (!d.length) return R.empty('Nothing waiting for your decision.');
    return `<div class="list">${d.slice(0, limit || 99).map(x => `<div data-k="dec-${x.id}"><div class="li-main"><div class="row" style="gap:8px"><span class="pill ${x.kind === 'Escalation' ? 'bad' : 'gold'}">${x.kind}</span><span class="small muted">${x.project ? esc(H.P(x.project).name) : 'Sales pipeline'}</span></div><div class="t" style="margin-top:5px">${esc(x.text)}</div><div class="row" style="gap:6px;margin-top:8px">${['bill-approve', 'cr-owner-approve', 'mat-approve-po'].includes(x.act) && S.role === 'owner' ? `<button class="btn sm pri" data-act="${x.act}" data-id="${x.id}">Approve</button>` : ''}<button class="btn sm" data-go="${x.go}">Open</button></div></div></div>`).join('')}</div>`;
  };

  H.V.dashboard = () => S.role === 'designer' ? R.myWork(S.user) : S.role === 'pm' ? R.opsDash() : R.ownerDash();

  R.ownerDash = () => {
    const d = db(), act = H.active(), f = H.fin(), dec = H.decisions();
    const risky = act.filter(p => H.health(p) !== 'on-track');
    const od = d.tasks.filter(H.overdue);
    const g = s => act.filter(p => H.group(p) === s).length;
    const visitsToday = d.visits.filter(v => v.date === H.TODAY);
    const awaitingDwg = d.drawings.filter(x => ['Internal Review', 'Client Review'].includes(x.status));
    const pendClient = d.drawings.filter(x => x.status === 'Client Review').length + d.changes.filter(c => c.status === 'Awaiting client approval').length;
    const pendCon = d.tasks.filter(t => H.isCon(t.assignee) && !H.done(t) && t.due <= H.D(3)).length;
    const snagsOpen = d.snags.filter(s => s.status !== 'Closed').length;
    const leadsNew = d.leads.filter(l => H.dif(l.created) >= -7).length, won = d.leads.filter(l => l.stage === 'Won').length, closed = d.leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length;
    const head = `${dec.length} decision${dec.length === 1 ? '' : 's'} need you today · ${risky.length} projects at risk · ${H.lk(f.overdue)} overdue`;
    const emp = d.employees.filter(e => e.cap);
    const mOwner = act.filter(p => p.value > 0).map(p => H.margin(p));
    const avgM = mOwner.reduce((s, m) => s + m.m, 0) / Math.max(1, mOwner.reduce((s, m) => s + m.rev, 0));
    const ag = H.ageing(), pal = ['var(--acc)', 'var(--brass)', '#D08A5B', 'var(--bad)'];
    const tab = S.ui.tab.pulse || 'biz';
    const pulse = {
      biz: [['Total active', act.length, '', 'projects'], ['Enquiry stage', d.leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length, 'open leads', 'leads'], ['In designing', g('design'), 'survey, concept, drawings', 'design'], ['Awaiting client approval', g('approval'), '', 'drawings'], ['Under execution', g('execution'), '', 'projects'], ['Approaching completion', act.filter(p => p.stage === 'handover' || (p.stage === 'execution' && H.dif(p.due) <= 30)).length, 'handover in 30 days', 'projects'], ['Completed', d.projects.filter(p => p.stage === 'completed').length, 'this year', 'projects'], ['Delayed', act.filter(p => H.health(p) === 'delayed').length, '', 'projects', 'alert'], ['Owner intervention', risky.length, '', 'projects', 'warnk'], ['New leads (7 days)', leadsNew, `${Math.round(won / Math.max(1, closed) * 100)}% win rate`, 'leads']],
      ops: [['Active employees', emp.length, `${emp.filter(e => e.loc === 'Leave').length} on leave`, 'team'], ['In office', emp.filter(e => e.loc === 'Office').length, '', 'team'], ['On sites', emp.filter(e => e.loc === 'Site').length, '', 'team'], ['Site visits today', visitsToday.length, `${visitsToday.filter(v => v.status === 'Completed').length} completed`, 'visits'], ['Overdue tasks', od.length, '', 'tasks', od.length ? 'warnk' : ''], ['Drawings awaiting approval', awaitingDwg.length, '', 'drawings'], ['Pending client decisions', pendClient, 'drawings + changes', 'drawings'], ['Contractor deliverables (3 days)', pendCon, 'due or overdue', 'contractors'], ['Open site observations', snagsOpen, 'quality & safety', 'visits']],
      fin: [['Contract value (active)', H.lk(f.contract), 'excl. GST', 'finance'], ['Invoiced', H.lk(f.invoiced), '', 'finance'], ['Payments received', H.lk(f.received), 'bank-verified only', 'finance'], ['Outstanding', H.lk(f.outstanding), '', 'finance'], ['Overdue receivables', H.lk(f.overdue), '', 'finance', 'alert'], ['Billing due (30 days)', H.lk(f.upcoming.reduce((s, x) => s + x.m.amount * 1.18, 0)), `${f.upcoming.length} milestones`, 'finance'], ['Contractor bills to verify', f.billsPending.length, H.lk(f.billsPending.reduce((s, b) => s + b.amount, 0)), 'finance'], ['Vendor payments due', H.lk(f.vendorDue.reduce((s, b) => s + b.amount - b.retention, 0)), `${f.vendorDue.length} approved bills`, 'finance'], ['Approved change orders', H.lk(f.coValue), '', 'finance'], ['Budget vs actual', H.lk(f.actual - f.earned), f.actual > f.earned ? 'over budget' : 'under budget', 'finance', f.actual > f.earned ? 'warnk' : ''], ['Est. gross margin', Math.round(avgM * 100) + '%', 'owner only', 'finance', 'goldk']]
    };
    return `<div class="pagehead"><div><div class="eyebrow"><span>${greet()}, Rohit Ji · ${dateLine()}</span></div><h1>${head}</h1><p>Live from ${act.length} active projects, ${emp.length} people and ${d.contractors.length} contractors and vendors.</p></div>
<div class="row"><button class="btn" data-go="ai">${ic('spark')}Ask HOD AI</button><button class="btn" data-go="reports">${ic('chart')}Weekly report</button><button class="btn pri" data-go="invoice-new">${ic('rupee')}New invoice</button></div></div>
${R.kpis([['Active projects', act.length, `${g('execution')} executing · ${g('design')} in design`, 'projects', '', R.series('ap', act.length, .08)], ['Need intervention', risky.length, risky.map(p => p.name.split(' ')[0]).join(', '), 'projects', 'alert', R.series('ni', risky.length, .3), false], ['Overdue tasks', od.length, `${od.filter(t => H.dif(t.due) <= -3).length} over 3 days`, 'tasks', od.length ? 'warnk' : '', R.series('ot', od.length, .25), false], ['Awaiting approval', awaitingDwg.length, `${d.drawings.filter(x => x.status === 'Client Review').length} with clients`, 'drawings', '', R.series('aa', awaitingDwg.length, .2), false], ['Overdue receivables', H.lk(f.overdue), `${d.invoices.filter(i => H.invStatus(i) === 'Overdue').length} invoices`, 'finance', 'alert', R.series('or', f.overdue, .15), false], ['Collected this month', H.lk(d.history[d.history.length - 1].collected), `${Math.round(d.history[d.history.length - 1].collected / Math.max(1, d.history[d.history.length - 1].billed) * 100)}% of billing`, 'finance', '', d.history.map(h => h.collected)]])}
<div class="grid g21" style="margin-top:18px">${H.AI.briefCard(true)}<div class="card" data-k="decisions"><div class="hd"><h2>Needs your decision</h2><span class="pill gold">${dec.length}</span></div>${R.decisionList(6)}${dec.length > 6 ? `<p class="small muted" style="margin-top:10px">and ${dec.length - 6} more in the approvals queues.</p>` : ''}</div></div>
<div class="sect">Active portfolio <span class="muted">most at risk first</span><a class="small gold" style="margin-left:auto;font-family:Inter,sans-serif;font-weight:600;text-decoration:none" href="#projects" data-go="projects">All projects →</a></div>
<div class="rail">${act.slice().sort((a, b) => H.risk(b).score - H.risk(a).score).map(R.pcard).join('')}</div>
<div class="grid g21" style="margin-top:18px"><div class="card"><div class="hd"><h2>Billed vs collected</h2><div class="legend"><span><i style="background:var(--acc)"></i>Collected</span><span><i style="background:var(--brass)"></i>Billed</span></div></div>${H.chart('ch-coll', { type: 'area', label: 'Billed vs collected, last 6 months', labels: d.history.map(h => h.month), series: [{ name: 'Billed', values: d.history.map(h => h.billed), color: 'var(--brass)', dash: true }, { name: 'Collected', values: d.history.map(h => h.collected), color: 'var(--acc)', fill: true }], fmt: v => (v / 1e5).toFixed(0) + 'L' }, 250)}</div>
<div class="card"><div class="hd"><h2>Receivables ageing</h2><a class="small gold" style="text-decoration:none;font-weight:600" href="#finance" data-go="finance">Finance →</a></div>${R.donut(ag.map(([l, v], i) => [l, v, pal[i], H.lk(v)]), H.lk(f.outstanding), 'outstanding')}</div></div>
<div class="grid g21" style="margin-top:18px"><div class="card" data-k="ncr"><div class="hd"><h2>Live sites across Delhi NCR</h2><div class="legend"><span><i style="background:var(--acc)"></i>On track</span><span><i style="background:var(--warn)"></i>At risk</span><span><i style="background:var(--bad)"></i>Delayed</span><span><i style="background:hsl(30 24% 40%);border-radius:50%"></i>On site today</span></div></div>${R.ncrMap ? R.ncrMap() : ''}</div><div class="card"><div class="hd"><h2>Live activity</h2>${H.Live ? H.Live.pill(true) : ''}</div><div id="feed">${H.Live ? H.Live.feed(6) : ''}</div></div></div>
<div class="grid g2" style="margin-top:18px"><div class="card"><div class="hd"><h2>Today</h2><a class="small gold" style="text-decoration:none;font-weight:600" href="#calendar" data-go="calendar">Calendar →</a></div>${R.today()}</div>
<div class="card"><div class="hd"><h2>Team load</h2><a class="small gold" style="text-decoration:none;font-weight:600" href="#team" data-go="team">Capacity plan →</a></div>${R.hbars(H.workload().sort((a, b) => b.util - a.util).slice(0, 7).map(w => [w.e.name, w.util, '', w.util > 110 ? 'var(--bad)' : w.util < 50 ? 'var(--brass)' : null]), v => v + '%')}</div></div>
<div class="sect">Business pulse <span class="muted">every number opens its module</span></div>
<div class="card">${R.tabs('pulse', [['biz', 'Business'], ['ops', 'Operations'], ['fin', 'Finance']], tab)}${R.mini(pulse[tab])}</div>
<div class="sect">Project register</div>
${R.portfolio(act.slice().sort((a, b) => H.risk(b).score - H.risk(a).score), true)}`;
  };

  R.today = (uid) => {
    const d = db();
    const items = d.visits.filter(v => v.date === H.TODAY && (!uid || v.by === uid)).map(v => ({ t: v.time, html: `<div><span class="pill ${v.status === 'Completed' ? 'good' : 'info'}">${v.status === 'Completed' ? 'Visited' : 'Site visit'}</span></div><div class="li-main"><div class="t">${esc(H.P(v.project).name)} — ${esc(H.name(v.by))}</div><div class="s">${v.status === 'Completed' ? `Checked in ${v.time}, out ${v.checkout} · ${v.photos} photos` : 'Planned ' + v.time}</div></div>${v.status === 'Completed' ? `<button class="btn sm" data-act="drawer" data-type="visit" data-id="${v.id}">Report</button>` : ''}` }))
      .concat(d.events.filter(e => e.date === H.TODAY && (!uid || e.people.includes(uid))).map(e => ({ t: e.time, html: `<div><span class="pill gold">${esc(e.type)}</span></div><div class="li-main"><div class="t">${esc(e.title)}</div><div class="s">${e.time} · ${e.dur} min · ${esc(e.where)}</div></div>` })));
    items.sort((a, b) => a.t.localeCompare(b.t));
    return items.length ? `<div class="list">${items.map(i => `<div><b class="num" style="width:46px;text-align:left">${i.t}</b>${i.html}</div>`).join('')}</div>` : R.empty('Nothing scheduled today.');
  };

  R.opsDash = () => {
    const d = db(), act = H.active(), mine = act.filter(p => p.pm === S.user), od = d.tasks.filter(t => H.overdue(t) && mine.some(p => p.id === t.project)), f = H.fin();
    return `<div class="pagehead"><div><h1>Operations: ${mine.length} projects, ${od.length} overdue tasks</h1><p>${greet()}, ${esc(H.first(S.user))} · ${dateLine()} · project manager view (no margins or profitability).</p></div><div class="row"><button class="btn" data-act="modal" data-id="visit">${ic('pin')}Schedule visit</button><button class="btn pri" data-act="modal" data-id="task">${ic('plus')}New task</button></div></div>
${R.kpis([['My projects', mine.length, '', 'projects'], ['Overdue tasks', od.length, '', 'tasks', od.length ? 'alert' : ''], ['Visits today', d.visits.filter(v => v.date === H.TODAY).length, '', 'visits'], ['Drawings to review', d.drawings.filter(x => x.status === 'Internal Review' && x.reviewer === S.user).length, '', 'drawings'], ['Contractor bills to verify', d.bills.filter(b => b.status === 'Submitted' && mine.some(p => p.id === b.project)).length, '', 'finance'], ['Material shortages', d.materials.filter(m => m.shortage).length, '', 'procurement', 'warnk'], ['Overdue receivables', H.lk(f.overdue), 'follow up with accounts', 'finance']])}
<div class="sect">My projects</div>${R.portfolio(mine.sort((a, b) => H.risk(b).score - H.risk(a).score), false)}
<div class="grid g2" style="margin-top:16px"><div class="card"><h2>Overdue on my projects</h2>${R.taskList(od.slice(0, 10))}</div><div class="card"><h2>Today</h2>${R.today()}</div></div>`;
  };

  R.taskList = (ts, small) => ts.length ? `<div class="list">${ts.map(t => `<a href="#" class="li" data-act="drawer" data-type="task" data-id="${t.id}" data-k="task-${t.id}">${H.av(t.assignee)}<div class="li-main"><div class="t">${esc(t.title)}</div><div class="s">${esc(H.P(t.project).name)} · ${esc(H.name(t.assignee))} · due ${H.fd(t.due)}${H.overdue(t) ? ` <span class="bad">(${-H.dif(t.due)}d late)</span>` : ''}${t.blocked ? ` · <span class="warn">blocked</span>` : ''}</div></div>${H.pill(t.status)}</a>`).join('')}</div>` : R.empty('No tasks here.');

  R.myWork = uid => {
    const d = db(), e = H.E(uid), mine = d.tasks.filter(t => t.assignee === uid && !H.done(t));
    const todayT = mine.filter(t => t.due <= H.D(1)), upcoming = mine.filter(t => t.due > H.D(1)).sort((a, b) => a.due.localeCompare(b.due));
    const dw = d.drawings.filter(x => x.designer === uid && !['Issued for Construction', 'Approved'].includes(x.status));
    const fb = d.drawings.filter(x => x.designer === uid && x.status === 'Revision Required');
    const projs = d.projects.filter(p => [p.pm, p.designer, p.architect, p.site, p.viz].includes(uid) && p.stage !== 'completed');
    return `<div class="pagehead"><div><h1>${esc(e.name.split(' ')[0])}, ${todayT.length} task${todayT.length === 1 ? '' : 's'} due by tomorrow and ${fb.length} revision${fb.length === 1 ? '' : 's'} from clients</h1><p>${esc(e.role)} · ${dateLine()} · update a task’s status here and your manager sees it — no calls needed.</p></div><button class="btn pri" data-act="modal" data-id="drawing">${ic('upload')}Upload drawing / render</button></div>
${R.kpis([['Assigned projects', projs.length], ['Due by tomorrow', todayT.length, '', null, todayT.some(H.overdue) ? 'alert' : ''], ['Upcoming', upcoming.length], ['My drawings in progress', dw.length, '', 'drawings'], ['Client feedback to action', fb.length, '', 'drawings', fb.length ? 'warnk' : ''], ['Awaiting review', mine.filter(t => t.status === 'Submitted for Review').length]])}
<div class="grid g2" style="margin-top:16px"><div class="card"><h2>Due now</h2>${R.taskList(todayT)}</div><div class="card"><h2>Client feedback requiring action</h2>${fb.length ? `<div class="list">${fb.map(x => `<a href="#" class="li" data-act="drawer" data-type="drawing" data-id="${x.id}"><span class="pill bad">R${x.rev}</span><div class="li-main"><div class="t">${esc(x.title)}</div><div class="s">${esc(H.P(x.project).name)} · ${esc(x.comments)}</div></div></a>`).join('')}</div>` : R.empty('No revisions requested.')}</div></div>
<div class="grid g2" style="margin-top:16px"><div class="card"><h2>Upcoming deadlines</h2>${R.taskList(upcoming.slice(0, 8))}</div><div class="card"><h2>Today</h2>${R.today(uid)}<div class="sect">My projects</div><div class="chips">${projs.map(p => `<a class="chip" href="#project-${p.id}" data-go="project-${p.id}" style="text-decoration:none">${esc(p.name)}</a>`).join('')}</div></div></div>`;
  };

  // ---------- projects ----------
  H.V.projects = () => {
    const d = db(), f = S.ui.f, grp = f.pgrp || 'active';
    let list = d.projects.filter(p => grp === 'all' ? true : grp === 'active' ? p.stage !== 'completed' : H.group(p) === grp);
    if (f.phealth && f.phealth !== 'all') list = list.filter(p => H.health(p) === f.phealth);
    if (S.role === 'designer') list = list.filter(p => [p.designer, p.architect, p.viz].includes(S.user));
    const c = k => d.projects.filter(p => H.group(p) === k).length;
    return `<div class="pagehead"><div><h1>Projects</h1><p>${d.projects.length} projects · register with stage, planned vs actual progress, health and responsibility.</p></div>${S.role !== 'designer' ? `<button class="btn pri" data-go="leads">${ic('plus')}New project from a won lead</button>` : ''}</div>
<div class="row" style="margin-bottom:14px">${R.seg('pgrp', [['active', 'Active'], ['design', `Design (${c('design')})`], ['approval', `Client approval (${c('approval')})`], ['execution', `Execution (${c('execution')})`], ['handover', `Handover (${c('handover')})`], ['completed', `Completed (${c('completed')})`], ['all', 'All']], grp)}${R.sel('phealth', [['all', 'Any health'], ['on-track', 'On track'], ['at-risk', 'At risk'], ['delayed', 'Delayed']], f.phealth || 'all', 'Health filter')}<span class="sp"></span>${R.seg('pview', [['grid', 'Cards'], ['table', 'Table']], f.pview || 'grid')}</div>
${list.length ? ((f.pview || 'grid') === 'grid' ? `<div class="pcards">${list.map(R.pcard).join('')}</div>` : R.portfolio(list, S.role !== 'designer')) : R.empty('No projects match these filters.')}`;
  };

  H.V.project = pid => {
    const p = H.P(pid); if (!p) return R.empty('Project not found.');
    const d = db(), tab = S.ui.tab['p-' + pid] || 'overview', r = H.risk(p), hl = H.health(p), exp = H.expected(p), cl = H.CL(p.client);
    const money = S.role !== 'designer';
    const n = {
      tasks: d.tasks.filter(t => t.project === pid && !H.done(t)).length, dw: d.drawings.filter(x => x.project === pid).length, v: d.visits.filter(v => v.project === pid).length,
      cr: d.changes.filter(c => c.project === pid).length, sn: d.snags.filter(s => s.project === pid && s.status !== 'Closed').length, m: d.materials.filter(m => m.project === pid).length, doc: d.docs.filter(x => x.project === pid).length
    };
    const tabs = [['overview', 'Overview'], ['schedule', 'Schedule'], ['tasks', 'Tasks', n.tasks], ['drawings', 'Drawings', n.dw], ['selections', 'Selections'], ['visits', 'Site visits', n.v]].concat(money ? [['finance', 'Finance']] : []).concat([['changes', 'Changes', n.cr], ['quality', 'Quality & snags', n.sn], ['materials', 'Materials', n.m], ['documents', 'Documents', n.doc], ['messages', 'Messages'], ['activity', 'Activity']]).concat(['handover', 'completed'].includes(p.stage) ? [['handover', 'Handover']] : []);
    const body = R['pt_' + tab] ? R['pt_' + tab](p) : '';
    return `<div class="hero"><img class="ph" src="${H.cover(p.id)}" alt="${esc(p.name)}"><div class="in"><div class="crumbs"><a href="#projects" data-go="projects">Projects</a> / ${esc(p.code)}</div><div class="row">${H.pill(hl)}${p.stage === 'completed' ? '' : `<span class="pill plain">${H.stageName(p.stage)}</span>`}</div>
<h1 style="margin-top:10px">${esc(p.name)}</h1><div class="meta">${esc(cl.name)} · ${esc(p.type)} · ${esc(p.service)} · ${esc(p.location)} · ${p.area.toLocaleString('en-IN')} sq ft</div>
<div class="facts"><div>Progress<b>${p.progress}%${exp != null && ['execution', 'handover'].includes(p.stage) ? ` <span style="font-weight:500;font-size:13px;color:#cbd5d0">/ ${exp}% plan</span>` : ''}</b></div><div>Handover<b>${H.fdy(p.due)}</b></div><div>Forecast<b style="color:${r.slip > 3 ? '#FFB4A6' : '#B9F0D3'}">${r.slip > 0 && p.stage !== 'completed' ? '+' + r.slip + ' days' : 'On date'}</b></div>${money ? `<div>Contract value<b>${H.lk(p.value + (p.co || 0))}</b></div>` : ''}<div>Project manager<b>${esc(H.name(p.pm))}</b></div><div>Lead designer<b>${esc(H.name(p.designer))}</b></div></div>
<div class="acts"><button class="btn sm" data-act="modal" data-id="visit" data-arg='{"project":"${pid}"}'>${ic('pin')}Site visit</button><button class="btn sm" data-act="modal" data-id="task" data-arg='{"project":"${pid}"}'>${ic('plus')}Task</button><button class="btn sm" data-act="modal" data-id="change" data-arg='{"project":"${pid}"}'>${ic('refresh')}Change request</button><button class="btn sm" data-act="modal" data-id="drawing" data-arg='{"project":"${pid}"}'>${ic('upload')}Drawing / 3D</button>${money ? `<button class="btn sm" data-go="invoice-new-${pid}">${ic('rupee')}Invoice</button>` : ''}<button class="btn sm" data-act="weekly" data-id="${pid}">${ic('doc')}Weekly report</button><button class="btn sm" data-act="gallery" data-id="${pid}">${ic('eye')}Photos</button></div></div></div>
${R.tabs('p-' + pid, tabs, tab)}${body}`;
  };

  R.pt_overview = p => {
    const d = db(), r = H.risk(p), lv = d.visits.filter(v => v.project === p.id && v.status === 'Completed').sort((a, b) => b.date.localeCompare(a.date))[0];
    const nextM = (p.milestones || []).find(m => !m.invoiced);
    const steps = ['Survey', 'Concept', '2D drawings', '3D', 'Approvals'];
    const od = d.tasks.filter(t => t.project === p.id && H.overdue(t));
    return `<div class="grid g21"><div class="stack"><div class="card"><div class="hd"><h2>${r.reasons.length ? 'Why this project needs attention' : 'Status'}</h2>${H.pill(H.health(p))}</div>${r.reasons.length ? `<ul style="margin:0;padding-left:18px">${r.reasons.map(x => `<li>${esc(x[0].toUpperCase() + x.slice(1))}</li>`).join('')}</ul><p class="small muted" style="margin-top:8px">Risk score ${r.score}/100 · predicted handover ${r.slip > 0 ? H.fdy(H.addDays(p.due, r.slip)) + ` (+${r.slip} days)` : 'on the committed date'}.</p>` : '<p>No overdue work, blocked activities or stuck approvals. On course for ' + H.fdy(p.due) + '.</p>'}</div>
<div class="card"><h2>Design journey</h2><div class="stepper">${steps.map((s, i) => `<div><i><b style="width:${p.design[i]}%"></b></i>${s} · ${p.design[i]}%</div>`).join('')}</div></div>
<div class="card"><div class="hd"><h2>Overdue & blocked</h2><button class="btn sm" data-act="tab" data-k="p-${p.id}" data-v="tasks">All tasks</button></div>${R.taskList(od.concat(d.tasks.filter(t => t.project === p.id && t.blocked && !H.done(t) && !H.overdue(t))).slice(0, 6))}</div></div>
<div class="stack"><div class="card"><h2>Latest site visit</h2>${lv ? `<p><b>${H.fd(lv.date)}</b> · ${esc(H.name(lv.by))} · ${lv.photos} photos</p><p class="small muted" style="margin-top:4px">Done: ${esc(lv.done)}. Pending: ${esc(lv.pending || '—')}.</p><div class="thumbs" style="margin-top:10px;grid-template-columns:repeat(3,1fr)">${[0, 1, 2].map(i => `<figure>${H.thumb(lv.seed * 3 + i, 'site', 'Site photo', p.id)}</figure>`).join('')}</div><button class="btn sm" style="margin-top:10px" data-act="drawer" data-type="visit" data-id="${lv.id}">Open report</button>` : R.empty('No visits yet.')}</div>
<div class="card"><h2>Team</h2><div class="list">${[['Project manager', p.pm], ['Lead designer', p.designer], ['Architect', p.architect], ['Site', p.site], ['3D', p.viz]].map(([l, id]) => `<div>${H.av(id)}<div class="li-main"><div class="t">${esc(H.name(id))}</div><div class="s">${l}</div></div></div>`).join('')}</div></div>
${S.role !== 'designer' && nextM ? `<div class="card"><h2>Next billing milestone</h2><p><b>${esc(nextM.name)}</b> — ${H.lk(nextM.amount)} + GST</p><p class="small muted">Expected ${H.fd(nextM.expected)} (${H.rel(nextM.expected)})</p><button class="btn sm" style="margin-top:10px" data-act="modal" data-id="invoice" data-arg='{"project":"${p.id}"}'>Raise invoice</button></div>` : ''}</div></div>`;
  };

  R.pt_schedule = p => {
    const acts = db().activities.filter(a => a.project === p.id);
    if (!acts.length) {
      const st = ['Site survey & requirements', 'Space planning & concepts', 'Detailed 2D drawings', '3D visualisation', 'Approvals & IFC'];
      return `<div class="card"><h2>Design-stage plan</h2><p class="muted small" style="margin-bottom:10px">Execution plan (WBS, Gantt, critical path) is generated automatically when the design is approved and the project converts to execution.</p>${R.hbars(st.map((s, i) => [s, p.design[i]]), v => v + '%')}</div>`;
    }
    return R.gantt(acts, p);
  };
  R.gantt = (acts, p) => {
    const min = acts.reduce((m, a) => a.ps < m ? a.ps : m, acts[0].ps), max = acts.reduce((m, a) => a.pe > m ? a.pe : m, p.due);
    const span = Math.max(1, H.dif(max) - H.dif(min)), pos = s => ((H.dif(s) - H.dif(min)) / span * 100).toFixed(2);
    const tdy = pos(H.TODAY);
    const months = []; { const x = new Date(min + 'T00:00'); x.setDate(1); while (H.iso(x) <= max) { const s = H.iso(x); if (s >= min) months.push(s); x.setMonth(x.getMonth() + 1); } }
    return `<div class="row between" style="margin-bottom:10px"><div class="legend"><span><i style="background:var(--acc)"></i>Actual progress</span><span><i style="background:var(--bad)"></i>Behind plan</span><span><i style="background:var(--muted);height:3px"></i>Baseline</span><span><i style="background:var(--brass);width:2px"></i>Today</span></div><span class="small muted">Critical-path activities marked ◆. Blocked activities cannot start until their dependency is done.</span></div>
<div class="gantt"><div class="gr"><div class="gl small muted">Activity · contractor</div><div class="gt ghead">${months.map(m => `<span style="left:${pos(m)}%">${H.fd(m).split(' ')[1]}</span>`).join('')}<div class="gtoday" style="left:${tdy}%"></div></div></div>
${acts.map(a => {
      const exp = Math.max(0, Math.min(100, -H.dif(a.ps) / Math.max(1, H.dif(a.pe) - H.dif(a.ps)) * 100));
      const late = a.prog < 100 && (a.pe < H.TODAY || exp - a.prog > 15);
      const blocked = db().tasks.some(t => t.activity === a.id && t.blocked && !H.done(t));
      return `<div class="gr" data-k="act-${a.id}"><div class="gl"><span>${a.critical ? '<span class="gold" title="Critical path">◆</span> ' : ''}<span style="font-weight:600">${esc(a.name)}</span><br><span class="small muted">${a.contractor ? esc(H.name(a.contractor)) : 'In-house'} · ${a.prog}%${blocked ? ' · <span class="warn">blocked</span>' : ''}</span></span></div>
<div class="gt"><div class="gb${late ? ' late' : ''}" style="left:${pos(a.ps)}%;width:${Math.max(0.6, pos(a.pe) - pos(a.ps))}%" title="${esc(a.name)}: ${H.fd(a.ps)} – ${H.fd(a.pe)}${a.note ? ' · ' + esc(a.note) : ''}"><i style="width:${a.prog}%"></i></div><div class="gb base" style="left:${pos(a.ps)}%;width:${Math.max(0.6, pos(a.pe) - pos(a.ps))}%"></div><div class="gtoday" style="left:${tdy}%"></div>${late && S.role !== 'designer' ? `<button class="btn sm" style="position:absolute;right:6px;top:4px;min-height:28px;font-size:12px" data-act="modal" data-id="recovery" data-arg='{"act":"${a.id}"}'>Recovery plan</button>` : ''}</div></div>`;
    }).join('')}</div>`;
  };
  R.pt_tasks = p => R.board(db().tasks.filter(t => t.project === p.id), 'p');
  R.pt_drawings = p => R.dwgTable(db().drawings.filter(x => x.project === p.id));
  R.pt_visits = p => R.visitTable(db().visits.filter(v => v.project === p.id));
  R.pt_finance = p => {
    const inv = db().invoices.filter(i => i.project === p.id), m = H.margin(p);
    return `${R.kpis([['Contract value', H.lk(p.value), 'excl. GST'], ['Approved changes', H.lk(p.co || 0)], ['Invoiced', H.lk(inv.reduce((s, i) => s + i.total, 0)), 'incl. GST'], ['Received', H.lk(inv.reduce((s, i) => s + i.paid, 0))], ['Outstanding', H.lk(inv.reduce((s, i) => s + H.invOut(i), 0)), '', null, inv.some(i => H.invStatus(i) === 'Overdue') ? 'alert' : ''], ['Cost to date', H.lk(H.costToDate(p)), `budget ${H.lk(p.budgetCost)}`]].concat(S.role === 'owner' ? [['Forecast margin', Math.round(m.pct * 100) + '%', H.lk(m.m) + ' (owner only)', null, 'goldk']] : []))}
<div class="sect">Billing milestones</div><div class="tw"><table><thead><tr><th>Milestone</th><th class="num">Share</th><th class="num">Amount (excl. GST)</th><th>Expected</th><th>Status</th></tr></thead><tbody>${(p.milestones || []).map(ms => { const i = inv.find(x => x.milestone === ms.name); return `<tr><td>${esc(ms.name)}</td><td class="num">${Math.round(ms.pct * 100)}%</td><td class="num">${H.inr(ms.amount)}</td><td>${H.fd(ms.expected)}</td><td>${i ? H.pill(H.invStatus(i)) + ' <span class="small muted">' + esc(i.no) + '</span>' : `<button class="btn sm" data-act="modal" data-id="invoice" data-arg='{"project":"${p.id}"}'>Raise</button>`}</td></tr>`; }).join('')}</tbody></table></div>
<div class="sect">Invoices</div>${R.invTable(inv)}<div class="sect">Contractor bills</div>${R.billTable(db().bills.filter(b => b.project === p.id))}`;
  };
  R.pt_changes = p => `<div class="row between" style="margin-bottom:10px"><span class="muted small">Unapproved changes cannot alter scope, cost or dates. Every step is logged.</span><button class="btn sm pri" data-act="modal" data-id="change" data-arg='{"project":"${p.id}"}'>${ic('plus')}Change request</button></div>${R.crList(db().changes.filter(c => c.project === p.id))}`;
  R.pt_quality = p => R.snagTable(db().snags.filter(s => s.project === p.id));
  R.pt_materials = p => R.matTable(db().materials.filter(m => m.project === p.id));
  R.pt_documents = p => R.docTable(db().docs.filter(x => x.project === p.id), p.id);
  R.pt_messages = p => R.thread(p.id, 'staff');
  R.pt_activity = p => { const a = db().activity.filter(x => x.project === p.id); return a.length ? `<div class="card"><div class="timeline">${a.map(x => `<div><b>${H.fd(x.date)} ${x.time}</b> · ${esc(H.name(x.who))}<div class="muted">${esc(x.text)}</div></div>`).join('')}</div></div>` : R.empty('No activity logged yet.'); };
  R.pt_handover = p => H.HO.view(p);

  // ---------- messages ----------
  R.thread = (pid, as) => {
    const d = db(); let th = d.threads.find(t => t.project === pid);
    const msgs = th ? th.msgs : [];
    return `<div class="card"><div class="hd"><h2>Project conversation</h2><span class="small muted">Client, team and site in one place — replaces scattered WhatsApp groups</span></div><div class="chat" style="max-height:420px">${msgs.length ? msgs.map(m => `<div class="msg ${(as === 'client' ? m.kind === 'cl' : m.kind !== 'cl') ? 'me' : 'ai'}"><div class="small" style="opacity:.75">${esc(m.kind === 'cl' ? m.who : H.name(m.who))} · ${H.fd(m.date)}</div>${esc(m.text)}</div>`).join('') : R.empty('No messages yet.')}</div>
<form data-form="msg" class="row" style="margin-top:10px;flex-wrap:nowrap"><input type="hidden" name="project" value="${pid}"><input type="hidden" name="as" value="${as}"><input class="in" name="text" placeholder="Write a message…" required aria-label="Message"><button class="btn pri" type="submit">${ic('send')}Send</button></form></div>`;
  };
  H.F.msg = fd => {
    const d = db(); let th = d.threads.find(t => t.project === fd.project);
    if (!th) { th = { id: H.uid('th'), project: fd.project, title: H.P(fd.project).name, msgs: [] }; d.threads.push(th); }
    const isClient = fd.as === 'client';
    th.msgs.push({ kind: isClient ? 'cl' : 'e', who: isClient ? H.CL(H.P(fd.project).client).contact.split(' (')[0] : S.user, text: fd.text, date: H.TODAY });
    if (isClient) H.notify('Client', `${H.P(fd.project).name}: new client message`, 'project-' + fd.project, true);
    H.commit('Message sent');
  };

  // ---------- leads & CRM ----------
  const STAGES = ['New Lead', 'Qualified', 'Consultation', 'Site Visit', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  H.V.leads = () => {
    const d = db(), f = S.ui.f, src = f.lsrc || 'all';
    let L = d.leads.filter(l => src === 'all' || l.source === src);
    const open = d.leads.filter(l => !['Won', 'Lost'].includes(l.stage));
    const pipe = open.reduce((s, l) => s + l.budget, 0), weighted = open.reduce((s, l) => s + l.budget * (STAGES.indexOf(l.stage) + 1) / 8, 0);
    const odf = open.filter(l => l.next && l.next < H.TODAY);
    return `<div class="pagehead"><div><h1>Sales pipeline: ${open.length} open enquiries worth ${H.lk(pipe)}</h1><p>Every enquiry — website, Instagram, WhatsApp, calls, walk-ins, referrals — lands here, gets scored and has one accountable owner.</p></div><button class="btn pri" data-act="modal" data-id="lead">${ic('plus')}New enquiry</button></div>
${R.kpis([['Open enquiries', open.length, '', null], ['Pipeline value', H.lk(pipe), 'budget stated'], ['Weighted pipeline', H.lk(weighted), 'by stage'], ['Follow-ups overdue', odf.length, odf.map(l => l.name.split(' ')[0]).slice(0, 3).join(', '), null, odf.length ? 'alert' : ''], ['Won', d.leads.filter(l => l.stage === 'Won').length, ''], ['Win rate', Math.round(d.leads.filter(l => l.stage === 'Won').length / Math.max(1, d.leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length) * 100) + '%', 'closed enquiries']])}
<div class="row" style="margin:14px 0">${R.sel('lsrc', [['all', 'All sources'], ['Website', 'Website'], ['Instagram', 'Instagram'], ['WhatsApp', 'WhatsApp'], ['Referral', 'Referral'], ['Walk-in', 'Walk-in'], ['Phone call', 'Phone call'], ['Email', 'Email']], src, 'Source')}<span class="small muted">Drag a card to another stage, or open it to log a call and schedule the next step.</span></div>
<div class="kan">${STAGES.map(st => { const cs = L.filter(l => l.stage === st); return `<div class="col" data-drop="lead:${st}"><h3><span>${st}</span><span class="muted">${cs.length}</span></h3>${cs.sort((a, b) => b.score - a.score).map(l => `<div class="kc" draggable="true" data-drag="${l.id}" data-act="drawer" data-type="lead" data-id="${l.id}" data-k="lead-${l.id}" tabindex="0"><div class="row between"><span class="t">${esc(l.name)}</span><span class="pill ${l.score >= 75 ? 'good' : l.score >= 55 ? 'gold' : ''}" title="Lead score">${l.score}</span></div><div class="small muted" style="margin-top:3px">${esc(l.type)} · ${esc(l.location)}</div><div class="m"><span>${H.lk(l.budget)}</span><span class="tag">${esc(l.source)}</span>${H.av(l.owner)}</div>${l.next ? `<div class="small ${l.next < H.TODAY ? 'bad' : 'muted'}" style="margin-top:6px">Follow-up ${H.rel(l.next)}</div>` : ''}${l.lost ? `<div class="small muted" style="margin-top:6px">${esc(l.lost)}</div>` : ''}</div>`).join('') || '<div class="small muted" style="padding:8px">Empty</div>'}</div>`; }).join('')}</div>`;
  };
  H.A['drop-lead'] = (id, st) => { const l = db().leads.find(x => x.id === id); if (!l || l.stage === st) return; const prev = l.stage; l.stage = st; H.log(S.user, `Moved lead ${l.name} from ${prev} to ${st}`, null); if (st === 'Won') { H.commit(`${l.name} marked as won — convert it to a project from the card`, 'lead-' + id); S.ui.drawer = { type: 'lead', id }; H.render(); return; } H.commit(`${l.name} → ${st}`, 'lead-' + id); };
  H.A['lead-open'] = a => { S.ui.drawer = { type: 'lead', id: a.dataset.id }; H.go('leads'); S.ui.drawer = { type: 'lead', id: a.dataset.id }; H.render(); };

  H.Drawer.lead = id => {
    const l = db().leads.find(x => x.id === id);
    const parts = [['Budget', Math.min(40, Math.round(l.budget / 1e5 / 6))], ['Source', l.source === 'Referral' ? 18 : l.source === 'Website' ? 8 : 4], ['Fit (type & location)', 20], ['Timeline & readiness', Math.max(0, l.score - Math.min(40, Math.round(l.budget / 1e5 / 6)) - (l.source === 'Referral' ? 18 : l.source === 'Website' ? 8 : 4) - 20)]];
    const idx = STAGES.indexOf(l.stage);
    return `<h2 style="font-size:22px">${esc(l.name)}</h2><p class="muted">${esc(l.type)} · ${esc(l.location)} · ${l.area.toLocaleString('en-IN')} sq ft · ${esc(l.service)}</p>
<div class="kv"><div>Stage<b>${l.stage}</b></div><div>Score<b>${l.score}/100</b></div><div>Budget<b>${H.lk(l.budget)}</b></div><div>Source<b>${esc(l.source)}</b></div><div>Owner<b>${esc(H.name(l.owner))}</b></div><div>Next follow-up<b class="${l.next && l.next < H.TODAY ? 'bad' : ''}">${l.next ? H.fd(l.next) : '—'}</b></div><div>Phone<b>${esc(l.phone)}</b></div><div>Expected close<b>${H.fd(l.expectedClose)}</b></div></div>
<div class="callout" style="margin-top:14px">${esc(l.notes)}</div>
<div class="sect">Lead score breakdown</div>${R.hbars(parts, v => v + ' pts')}
<div class="sect">Next step</div><div class="row">${idx < 5 ? `<button class="btn pri" data-act="lead-advance" data-id="${l.id}">Move to ${STAGES[idx + 1]}</button>` : ''}<button class="btn" data-act="lead-call" data-id="${l.id}">${ic('phone')}Log call</button><button class="btn" data-act="lead-consult" data-id="${l.id}">${ic('cal')}Schedule consultation</button>${idx >= 3 && idx < 6 ? `<button class="btn" data-act="lead-proposal" data-id="${l.id}">${ic('doc')}Generate proposal</button>` : ''}${l.stage === 'Won' && !l.project ? `<button class="btn gold" data-act="lead-convert" data-id="${l.id}">Convert to project</button>` : ''}${l.project ? `<button class="btn" data-go="project-${l.project}">Open project</button>` : ''}${!['Won', 'Lost'].includes(l.stage) ? `<button class="btn" data-act="lead-won" data-id="${l.id}">Mark won</button><button class="btn ghost" data-act="lead-lost" data-id="${l.id}">Mark lost</button>` : ''}</div>
${l.proposal ? `<div class="sect">Proposal ${esc(l.proposal.no)}</div><div class="card flat" id="prop-${l.id}"><p><b>${esc(l.name)} — ${esc(l.type)}, ${esc(l.location)}</b></p><p class="small muted" style="margin-top:4px">Scope: ${esc(l.service)} for ${l.area.toLocaleString('en-IN')} sq ft. Design fee ${H.inr(l.proposal.fee)} + GST; execution estimate ${H.lk(l.proposal.exec)} (±10%). Timeline ${l.proposal.weeks} weeks. Payment: 10% advance, then by milestones.</p></div><div class="row" style="margin-top:8px"><button class="btn sm" data-act="copy" data-id="prop-${l.id}">${ic('copy')}Copy</button><span class="small muted">Digital acceptance & e-signature need an e-sign integration in production.</span></div>` : ''}
<div class="sect">History</div><div class="timeline">${(l.log || [{ date: l.created, text: 'Enquiry received via ' + l.source }]).map(x => `<div><b>${H.fd(x.date)}</b><div class="muted">${esc(x.text)}</div></div>`).join('')}</div>`;
  };
  const llog = (l, text) => { (l.log = l.log || [{ date: l.created, text: 'Enquiry received via ' + l.source }]).unshift({ date: H.TODAY, text }); };
  Object.assign(H.A, {
    'lead-advance': a => { const l = db().leads.find(x => x.id === a.dataset.id); const n = STAGES[STAGES.indexOf(l.stage) + 1]; llog(l, `Moved to ${n} by ${H.name(S.user)}`); l.stage = n; l.next = H.D(2); H.commit(`${l.name} → ${n}`); },
    'lead-call': a => { const l = db().leads.find(x => x.id === a.dataset.id); llog(l, `Call logged by ${H.name(S.user)}; follow-up set for ${H.fd(H.D(3))}`); l.next = H.D(3); H.commit('Call logged, next follow-up in 3 days'); },
    'lead-consult': a => { const l = db().leads.find(x => x.id === a.dataset.id); const ev = { id: H.uid('ev'), title: `Consultation — ${l.name} (${l.type})`, type: 'Sales', date: H.D(1), time: '11:30', dur: 60, project: null, people: [l.owner, 'e0'], where: 'Studio, Paschim Vihar' }; db().events.push(ev); if (STAGES.indexOf(l.stage) < 2) l.stage = 'Consultation'; l.next = H.D(1); llog(l, `Consultation booked for ${H.fd(ev.date)} 11:30 at the studio; confirmation queued on WhatsApp`); H.commit('Consultation booked for tomorrow 11:30'); },
    'lead-proposal': a => { const l = db().leads.find(x => x.id === a.dataset.id); l.proposal = { no: 'PRO-' + (2700 + db().leads.indexOf(l)), fee: Math.round(l.area * 120 / 1000) * 1000, exec: Math.round(l.budget * 0.92), weeks: l.area > 5000 ? 26 : 16 }; if (STAGES.indexOf(l.stage) < 4) l.stage = 'Proposal'; llog(l, `Proposal ${l.proposal.no} generated`); H.commit('Proposal generated'); },
    'lead-won': a => { const l = db().leads.find(x => x.id === a.dataset.id); l.stage = 'Won'; l.next = null; llog(l, 'Marked won'); H.commit(`${l.name} won`); },
    'lead-lost': a => { const l = db().leads.find(x => x.id === a.dataset.id); l.stage = 'Lost'; l.next = null; l.lost = 'Reason to be recorded'; llog(l, 'Marked lost'); H.commit(`${l.name} marked lost`); },
    'lead-convert': a => { const pid = H.convertLead(a.dataset.id); S.ui.drawer = null; H.save(); H.go('project-' + pid); H.toast('Project created with survey tasks and an advance invoice draft'); }
  });
  H.convertLead = id => {
    const d = db(), l = d.leads.find(x => x.id === id), n = d.projects.length + 1, pid = 'p' + (n + Date.now() % 1000);
    const cid = 'cl' + (d.clients.length + 1);
    d.clients.push({ id: cid, name: l.name, contact: l.name, kind: 'Individual', phone: l.phone, email: l.name.split(' ')[0].toLowerCase() + '@example.com', gstin: '' });
    const value = Math.round(l.budget * 0.95);
    const p = { id: pid, code: 'HOD-26-' + String(70 + n).padStart(3, '0'), name: l.name.split(' ').slice(-1)[0] + ' ' + (/office|store|restaurant|café|clinic|banquet/i.test(l.type) ? 'Project' : 'Residence'), client: cid, type: l.type, service: l.service, location: l.location, area: l.area, value, start: H.TODAY, due: H.D(l.area > 5000 ? 210 : 140), stage: 'survey', health: 'on-track', pm: 'e2', designer: 'e6', architect: 'e4', site: 'e10', viz: 'e8', design: [0, 0, 0, 0, 0], co: 0, budgetCost: Math.round(value * 0.76), progress: 0, milestones: [['Advance on signing', .10], ['Design approval', .15], ['Execution start', .25], ['50% execution', .25], ['Completion', .20], ['Handover', .05]].map(([name, pct], k) => ({ name, pct, amount: Math.round(value * pct), invoiced: false, expected: H.D(k * 25) })) };
    d.projects.push(p); l.project = pid;
    [['Site survey & measurements', 'e10', 3], ['Client requirement questionnaire', 'e6', 4], ['Existing drawings & documents upload', 'e15', 5]].forEach(([title, who, due]) => d.tasks.push({ id: H.uid('t'), title, project: pid, assignee: who, status: 'Not Started', priority: 'High', due: H.D(due), created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Design', who: 'e' }));
    d.visits.push({ id: H.uid('v'), code: 'SV-' + (2700 + d.visits.length), project: pid, by: 'e10', date: H.D(2), time: '11:00', status: 'Scheduled', checkout: '', geo: '', photos: 0, progress: 0, obs: [], done: '', pending: '', next: '', present: [], weather: '', seed: 900 + n });
    H.log(S.user, `Converted lead ${l.name} into project ${p.code}`, pid);
    H.auto('r2', `Survey scheduled and onboarding tasks created for ${p.name}`);
    return pid;
  };

  // ---------- clients ----------
  H.V.clients = () => {
    const d = db();
    return `<div class="pagehead"><div><h1>Clients</h1><p>${d.clients.length} clients · what each owes, what they need to approve and when they were last contacted.</p></div></div>
<div class="tw"><table class="stack"><thead><tr><th>Client</th><th>Projects</th><th class="num">Contract value</th><th class="num">Outstanding</th><th>Pending approvals</th><th>Contact</th><th></th></tr></thead><tbody>${d.clients.map(c => {
      const ps = d.projects.filter(p => p.client === c.id), val = ps.reduce((s, p) => s + p.value + (p.co || 0), 0);
      const out = d.invoices.filter(i => ps.some(p => p.id === i.project)).reduce((s, i) => s + H.invOut(i), 0);
      const od = d.invoices.some(i => ps.some(p => p.id === i.project) && H.invStatus(i) === 'Overdue');
      const pa = d.drawings.filter(x => x.status === 'Client Review' && ps.some(p => p.id === x.project)).length + d.changes.filter(x => x.status === 'Awaiting client approval' && ps.some(p => p.id === x.project)).length;
      return `<tr><td><b style="font-weight:500">${esc(c.name)}</b><div class="small muted">${esc(c.contact)}</div></td><td>${ps.map(p => H.plink(p.id)).join(', ') || '—'}</td><td class="num">${S.role === 'designer' ? '—' : H.lk(val)}</td><td class="num ${od ? 'bad' : ''}">${out ? H.lk(out) : '—'}</td><td>${pa ? `<span class="pill gold">${pa} waiting</span>` : '—'}</td><td class="small">${esc(c.phone)}<br>${esc(c.email)}</td><td><button class="btn sm" data-act="as-client" data-id="${c.id}">Open portal</button></td></tr>`;
    }).join('')}</tbody></table></div><p class="small muted" style="margin-top:8px">Contact details are fictional sample data.</p>`;
  };
  H.A['as-client'] = a => { S.clientId = a.dataset.id; S.role = 'client'; S.user = 'cl1'; H.save(); H.render(); H.toast('Viewing the client portal as ' + H.CL(a.dataset.id).name); };
})();
