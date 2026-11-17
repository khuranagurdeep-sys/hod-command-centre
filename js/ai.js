/* HOD AI Project Copilot: answers only from records, cites sources, never invents */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;
  const AI = H.AI = {};
  const gb = (L, f) => L.reduce((o, x) => { const k = f(x); (o[k] = o[k] || []).push(x); return o; }, {});
  const link = (go, t) => `<a href="#${go}" data-go="${go}">${t}</a>`;
  const scope = () => {
    const A = H.active();
    return S.role === 'designer' ? A.filter(p => [p.designer, p.architect, p.viz, p.pm].includes(S.user)) : A;
  };

  // ---------- daily briefing ----------
  AI.briefing = () => {
    const d = db(), A = scope(), f = H.fin();
    const risky = A.map(p => ({ p, r: H.risk(p), h: H.health(p) })).filter(x => x.h !== 'on-track').sort((a, b) => b.r.score - a.r.score);
    const od = d.invoices.filter(i => H.invStatus(i) === 'Overdue' && A.some(p => p.id === i.project)).sort((a, b) => a.due.localeCompare(b.due));
    const visits = d.visits.filter(v => v.date === H.TODAY && v.status === 'Scheduled' && A.some(p => p.id === v.project));
    const meets = d.events.filter(e => e.date === H.TODAY);
    const waiting = d.drawings.filter(x => x.status === 'Client Review' && H.dif(x.submitted) <= -3 && A.some(p => p.id === x.project));
    const dec = H.isOwner() ? H.decisions() : [];
    const over = H.workload().filter(w => w.util > 110);
    const yest = d.visits.filter(v => v.status === 'Completed' && H.dif(v.date) >= -1);
    const obs = yest.reduce((s, v) => s + v.obs.filter(o => o.status !== 'Closed').length, 0);
    return { A, f, risky, od, visits, meets, waiting, dec, over, yest, obs, unv: f.unverified };
  };
  AI.briefCard = full => {
    const b = AI.briefing(), u = H.E(S.user);
    const hello = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
    const fin = S.role !== 'designer';
    const sec = (t, items) => items.length ? `<div class="bsec"><h3>${t}</h3><ul>${items.join('')}</ul></div>` : '';
    return `<div class="brief" data-k="brief"><div class="bg">${H.mark(260)}</div><div class="row between" style="align-items:flex-start"><div><div class="small" style="color:var(--gold2)">${ic('spark')} HOD AI · daily briefing · ${H.fdy(H.TODAY)}</div><h2 style="margin-top:6px;font-size:20px">${hello}, ${esc(u ? u.name.split(' ')[0] : '')}${H.isOwner() ? ' Ji' : ''}. ${b.risky.length} of ${b.A.length} projects need attention${fin ? `, ${H.lk(b.f.overdue)} is overdue` : ''}${b.dec.length ? ` and ${b.dec.length} decisions are waiting for you` : ''}.</h2></div></div>
${sec('Projects that need attention', b.risky.slice(0, full ? 4 : 3).map(x => `<li>${link('project-' + x.p.id, esc(x.p.name))} — ${esc(x.r.reasons.slice(0, 2).join('; ') || 'behind plan')}${x.r.slip > 0 ? `; handover may slip ~${x.r.slip} days` : ''}.</li>`))}
${fin ? sec('Money', b.od.slice(0, 3).map(i => `<li>${link('finance', esc(i.no))} ${esc(H.P(i.project).name)} — ${H.lk(H.invOut(i))}, ${-H.dif(i.due)} days overdue, ${i.reminders.length} reminder${i.reminders.length === 1 ? '' : 's'} sent.</li>`).concat(b.unv.map(x => `<li>${H.lk(x.amount)} from ${esc(H.P(x.project).name)} is a client claim (${esc(x.ref.toLowerCase())}) — ${link('finance', 'not counted until bank-matched')}.</li>`))) : ''}
${sec('Today', [b.visits.length ? `<li>${b.visits.length} site visit${b.visits.length > 1 ? 's' : ''}: ${b.visits.map(v => esc(H.P(v.project).name) + ' (' + esc(H.first(v.by)) + ')').join(', ')}.</li>` : '', ...b.meets.map(e => `<li>${e.time} ${esc(e.title)}.</li>`)].filter(Boolean))}
${full ? sec('Waiting on clients', b.waiting.slice(0, 3).map(x => `<li>${link('drawings', esc(x.title))} (${esc(H.P(x.project).name)}) — ${-H.dif(x.submitted)} days with the client.</li>`)) : ''}
${full ? sec('Since yesterday', [`<li>${b.yest.length} site reports submitted with ${b.obs} open observation${b.obs === 1 ? '' : 's'} — ${link('visits', 'review')}.</li>`].concat(b.over.length ? [`<li>${b.over.map(w => esc(w.e.name.split(' ')[0])).join(', ')} over capacity — ${link('team', 'rebalance')}.</li>`] : [])) : ''}
<div class="row between" style="margin-top:14px"><span class="small" style="color:var(--charmuted)">Computed from live records at ${new Date().toTimeString().slice(0, 5)}. Every line links to its source.</span><div class="row" style="gap:8px"><button class="btn sm" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff;box-shadow:none" data-act="brief-say">${ic('mic')}Listen</button>${S.ui.route === 'ai' ? '' : `<a class="btn sm gold" href="#ai" data-go="ai" style="border-bottom:0">${ic('spark')}Ask the copilot</a>`}</div></div></div>`;
  };

  // ---------- copilot ----------
  const findProject = q => {
    const ps = db().projects;
    return ps.find(p => q.includes(p.name.toLowerCase())) || ps.find(p => q.includes(p.code.toLowerCase())) || ps.find(p => { const w = p.name.toLowerCase().split(/[\s&.]+/)[0]; return w.length >= 4 && new RegExp('\\b' + w).test(q); });
  };
  const findCon = q => db().contractors.find(c => q.includes(c.name.toLowerCase()) || q.includes(c.name.toLowerCase().split(' ')[0]) && c.name.split(' ')[0].length > 4);
  const tbl = (head, rows) => rows.length ? `<div class="tw"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const out = (html, src) => ({ html, src: src || [] });
  const SUG = ['Which projects are delayed?', 'What is pending on Kapoor Residence?', 'Who visited Sharma Residence site yesterday?', 'Which drawings are awaiting approval?', 'Which payments are overdue?', 'What work is pending with contractors this week?', 'Which employees have overdue tasks?', 'Which project is likely to miss handover?', 'What decisions need my approval today?', 'Prepare weekly report for Aurum Capital Office'];

  AI.answer = raw => {
    const q = raw.toLowerCase().trim(), d = db(), A = scope(), p = findProject(q), fin = S.role !== 'designer', own = H.isOwner();
    if (p && S.role === 'designer' && !A.includes(p) && p.stage !== 'completed') return out(`You are not on the ${esc(p.name)} team, so I can’t show its records. Ask the project manager or owner.`);
    // weekly report
    if (/weekly|progress report|status report|\breport\b/.test(q)) {
      return out(`Here is the draft, built from this week’s tasks, visits, risks and invoices${p ? '' : ' for all active projects'}. Review it before it goes to the client:<div class="callout" style="margin-top:8px;max-height:300px;overflow:auto">${H.weeklyReport(p ? p.id : null)}</div>`, [[p ? p.name + ' records' : 'All active projects', p ? 'project-' + p.id : 'projects'], ['Reports & copy', 'reports']]);
    }
    // who visited
    if (/visit|who went|inspected|was at site|on site/.test(q)) {
      const day = /yesterday/.test(q) ? H.D(-1) : /today/.test(q) ? H.TODAY : null;
      let L = d.visits.filter(v => v.status === 'Completed' && (!p || v.project === p.id) && (!day || v.date === day)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      if (!L.length && day && p) { const any = d.visits.filter(v => v.status === 'Completed' && v.project === p.id).sort((a, b) => b.date.localeCompare(a.date))[0]; return out(`No site visit to ${esc(p.name)} is recorded for ${day === H.TODAY ? 'today' : 'yesterday'}.${any ? ` The last recorded visit was ${esc(any.code)} by ${esc(H.name(any.by))} on ${H.fdy(any.date)}.` : ''}`, any ? [[any.code, 'visits']] : []); }
      L = L.slice(0, p ? 3 : 6);
      if (!L.length) return out('No completed site visits match that in the records.');
      return out(`${L.length === 1 ? 'One visit' : L.length + ' visits'} on record${p ? ' for ' + esc(p.name) : ''}${day ? (day === H.TODAY ? ' today' : ' yesterday') : ''}:` + tbl(['Visit', 'Project', 'By', 'When', 'Progress', 'Open points'], L.map(v => [esc(v.code), esc(H.P(v.project).name), esc(H.name(v.by)), `${H.fd(v.date)} ${v.time}`, v.progress + '%', v.obs.filter(o => o.status !== 'Closed').map(o => esc(o.text)).join('; ') || '—'])), L.map(v => [v.code, 'visits']));
    }
    // project status
    if (p && /pending|status|update|how is|how's|where are|summary|stuck|open/.test(q) && !/drawing|payment|invoice/.test(q)) return AI.projectStatus(p);
    // payments
    if (/payment|invoice|outstanding|receivable|collect|money|owe|dues|unpaid/.test(q) || (/overdue/.test(q) && !/task|work|employee|staff/.test(q))) {
      if (!fin) return out('Finance records are not available for your role.');
      const L = d.invoices.filter(i => H.invStatus(i) === 'Overdue' && (!p || i.project === p.id)).sort((a, b) => a.due.localeCompare(b.due));
      const tot = L.reduce((s, i) => s + H.invOut(i), 0), unv = H.fin().unverified;
      if (!L.length) return out(`No overdue invoices${p ? ' on ' + esc(p.name) : ''} in the records.`, [['Finance', 'finance']]);
      return out(`${L.length} invoice${L.length > 1 ? 's are' : ' is'} overdue, ${H.lk(tot)} in total:` + tbl(['Invoice', 'Project', 'Outstanding', 'Days late', 'Reminders'], L.map(i => [esc(i.no), esc(H.P(i.project).name), H.inr(H.invOut(i)), -H.dif(i.due), i.reminders.length])) + (unv.length ? `<p style="margin-top:8px">Not included as received: ${unv.map(x => `${H.lk(x.amount)} from ${esc(H.P(x.project).name)} (${esc(x.source.toLowerCase())})`).join(', ')} — it needs a bank match.</p>` : '') + `<p style="margin-top:8px">I can draft reminders; each one needs your approval before it is sent.</p>`, L.map(i => [i.no, 'finance']));
    }
    // drawings
    if (/drawing|approval|render|sign.?off|design/.test(q) && !/decision|need my|my approval/.test(q)) {
      const L = d.drawings.filter(x => ['Client Review', 'Internal Review'].includes(x.status) && (!p || x.project === p.id) && (A.some(a => a.id === x.project))).sort((a, b) => a.submitted.localeCompare(b.submitted));
      if (!L.length) return out(`Nothing is awaiting approval${p ? ' on ' + esc(p.name) : ''}.`);
      const cl = L.filter(x => x.status === 'Client Review'), inn = L.filter(x => x.status === 'Internal Review');
      return out(`${cl.length} with clients and ${inn.length} in internal review. Oldest first:` + tbl(['Drawing', 'Project', 'Waiting with', 'Days'], L.slice(0, 10).map(x => [esc(x.title) + ` <span class="muted">R${x.rev}</span>`, esc(H.P(x.project).name), x.status === 'Client Review' ? 'Client' : esc(H.name(x.reviewer)), -H.dif(x.submitted)])) + (L.length > 10 ? `<p class="small muted">and ${L.length - 10} more.</p>` : ''), [['Drawings & approvals', 'drawings']]);
    }
    // delays and handover risk
    if (/delay|late|behind|slip|miss|handover|risk|at risk|on time/.test(q) && !/task|employee|staff/.test(q)) {
      const L = A.filter(x => ['execution', 'handover', 'approval'].includes(x.stage) && (!p || x.id === p.id)).map(x => ({ x, r: H.risk(x), h: H.health(x) })).filter(o => o.h !== 'on-track' || p).sort((a, b) => b.r.score - a.r.score);
      if (!L.length) return out('All active projects are on plan as per the latest records.');
      const top = L[0];
      return out((/miss|likely|handover/.test(q) ? `${esc(top.x.name)} is the most likely to miss its handover date (${H.fdy(top.x.due)}): forecast slip about ${top.r.slip} days. ` : '') + `${L.length} project${L.length > 1 ? 's are' : ' is'} off plan:` + tbl(['Project', 'Health', 'Progress vs plan', 'Forecast slip', 'Why'], L.map(o => [esc(o.x.name), H.pill(o.h), `${o.x.progress}% / ${H.expected(o.x)}%`, o.r.slip > 0 ? '+' + o.r.slip + ' days' : '—', esc(o.r.reasons.join('; '))])) + '<p class="small muted" style="margin-top:6px">Forecast = progress gap against the plan, blocked tasks and pending approvals. It is an estimate from records, not a promise.</p>', L.map(o => [o.x.name, 'project-' + o.x.id]));
    }
    // contractors
    if (/contractor|vendor|subcontract|work orders?/.test(q)) {
      const c = findCon(q);
      const L = d.tasks.filter(t => H.isCon(t.assignee) && !H.done(t) && H.dif(t.due) <= 7 && (!c || t.assignee === c.id) && (!p || t.project === p.id)).sort((a, b) => a.due.localeCompare(b.due));
      if (!L.length) return out('No contractor work is due in the next 7 days in the records.');
      const g = gb(L, t => t.assignee);
      return out(`${L.length} contractor tasks due by ${H.fd(H.D(7))} across ${Object.keys(g).length} contractors (${L.filter(H.overdue).length} already overdue):` + tbl(['Contractor', 'Task', 'Project', 'Due', 'Status'], L.slice(0, 14).map(t => [esc(H.name(t.assignee)), esc(t.title), esc(H.P(t.project).name), `<span class="${H.overdue(t) ? 'bad' : ''}">${H.fd(t.due)}</span>`, esc(t.status)])), [['Contractors', 'contractors'], ['Tasks', 'tasks']]);
    }
    // employees with overdue tasks
    if (/employee|staff|team|who.*overdue|overdue task|pending with|people/.test(q) && !/workload|capacity/.test(q)) {
      const L = d.employees.map(e => ({ e, ts: d.tasks.filter(t => t.assignee === e.id && H.overdue(t)) })).filter(x => x.ts.length).sort((a, b) => b.ts.length - a.ts.length);
      if (!L.length) return out('No employee has an overdue task right now.');
      return out(`${L.length} people have overdue tasks:` + tbl(['Person', 'Overdue', 'Oldest'], L.map(x => { const o = x.ts.sort((a, b) => a.due.localeCompare(b.due))[0]; return [esc(x.e.name), x.ts.length, `${esc(o.title)} (${-H.dif(o.due)} days)`]; })), [['Team & HR', 'team'], ['Tasks', 'tasks']]);
    }
    // decisions
    if (/decision|approve|my approval|need me|sign/.test(q)) {
      if (!own) return out('Owner approvals are shown only to the owner. Your own approvals are in Drawings & Approvals and Task Management.', [['Drawings', 'drawings']]);
      const L = H.decisions();
      if (!L.length) return out('Nothing is waiting for your decision.');
      return out(`${L.length} items need your decision:<ol style="margin:6px 0 0;padding-left:18px">${L.map(x => `<li><b style="font-weight:500">${esc(x.kind)}</b> — ${esc(x.text)}${x.project ? ' · ' + esc(H.P(x.project).name) : ''}</li>`).join('')}</ol><p style="margin-top:6px">Approve them from the dashboard; nothing is approved from chat.</p>`, [['Dashboard decisions', 'dashboard']]);
    }
    // workload
    if (/workload|overload|capacity|free|busy|bandwidth|balance/.test(q)) {
      const w = H.workload().sort((a, b) => b.util - a.util);
      return out('Load = open tasks plus upcoming visits against each person’s capacity:' + tbl(['Person', 'Open', 'Overdue', 'Load'], w.map(x => [esc(x.e.name), x.open, x.od, `<span class="${x.util > 110 ? 'bad' : ''}">${x.util}%</span>`])) + `<p style="margin-top:6px">${w.filter(x => x.util > 110).map(x => esc(x.e.name.split(' ')[0])).join(', ') || 'Nobody'} over capacity. Suggested moves are in ${link('team', 'Team & HR')}.</p>`, [['Team & HR', 'team']]);
    }
    // leads
    if (/lead|enquir|pipeline|sales|conversion|prospect|proposal/.test(q)) {
      if (S.role === 'designer') return out('Sales records are not available for your role.');
      const open = d.leads.filter(l => !['Won', 'Lost'].includes(l.stage)), g = gb(open, l => l.stage);
      const hot = open.filter(l => l.score >= 70).sort((a, b) => b.score - a.score);
      return out(`${open.length} open enquiries worth ${H.lk(open.reduce((s, l) => s + l.budget, 0))} in indicative budgets:` + tbl(['Stage', 'Count', 'Value'], Object.entries(g).map(([k, v]) => [esc(k), v.length, H.lk(v.reduce((s, l) => s + l.budget, 0))])) + (hot.length ? `<p style="margin-top:6px">Highest scored: ${hot.slice(0, 3).map(l => `${esc(l.name)} (${l.score}, ${esc(l.stage)})`).join(', ')}.</p>` : ''), [['Leads & CRM', 'leads']]);
    }
    if (p) return AI.projectStatus(p);
    return out(`I answer only from records in the Command Centre, and I couldn’t match “${esc(raw)}” to projects, drawings, tasks, visits, contractors, invoices, leads or team records. I won’t guess. Try one of the questions below, or name a project.`);
  };
  AI.projectStatus = p => {
    const d = db(), r = H.risk(p), fin = S.role !== 'designer';
    const od = d.tasks.filter(t => t.project === p.id && H.overdue(t)), open = d.tasks.filter(t => t.project === p.id && !H.done(t));
    const dw = d.drawings.filter(x => x.project === p.id && ['Internal Review', 'Client Review', 'Revision Required'].includes(x.status));
    const inv = d.invoices.filter(i => i.project === p.id && H.invOut(i));
    const ms = (p.milestones || []).find(m => !m.invoiced), last = d.visits.filter(v => v.project === p.id && v.status === 'Completed').sort((a, b) => b.date.localeCompare(a.date))[0];
    const crs = d.changes.filter(c => c.project === p.id && !['Approved', 'Implemented', 'Rejected'].includes(c.status));
    const sn = d.snags.filter(s => s.project === p.id && s.status !== 'Closed');
    return out(`<b>${esc(p.name)}</b> — ${esc(H.stageName(p.stage))}, ${p.progress}% complete${['execution', 'handover'].includes(p.stage) ? ` against ${H.expected(p)}% planned` : ''}; ${H.pill(H.health(p))}. Handover ${H.fdy(p.due)}${r.slip > 0 ? `, forecast +${r.slip} days` : ''}.
<ul style="margin:8px 0 0;padding-left:18px">
<li>${open.length} open tasks, ${od.length} overdue${od.length ? ': ' + od.slice(0, 3).map(t => `${esc(t.title)} (${esc(H.name(t.assignee))}, ${-H.dif(t.due)} days)`).join('; ') : ''}.</li>
${dw.length ? `<li>Drawings pending: ${dw.slice(0, 4).map(x => `${esc(x.title)} — ${esc(x.status.toLowerCase())}`).join('; ')}.</li>` : ''}
${crs.length ? `<li>Open change: ${crs.map(c => `${esc(c.no)} ${esc(c.title)} (${esc(c.status.toLowerCase())})`).join('; ')}.</li>` : ''}
${sn.length ? `<li>${sn.length} open site observations / snags.</li>` : ''}
${fin && inv.length ? `<li>Money due: ${inv.map(i => `${esc(i.no)} ${H.lk(H.invOut(i))} (${H.invStatus(i).toLowerCase()})`).join('; ')}.</li>` : ''}
${fin && ms ? `<li>Next billing milestone: ${esc(ms.name)}, ${H.lk(ms.amount)} + GST, expected ${H.fd(ms.expected)}.</li>` : ''}
${last ? `<li>Last site visit: ${esc(last.code)} by ${esc(H.name(last.by))} ${H.rel(last.date)} — ${esc(last.pending || last.done || '')}.</li>` : ''}
${r.reasons.length ? `<li>Risks: ${esc(r.reasons.join('; '))}.</li>` : ''}</ul>`, [[p.name, 'project-' + p.id]].concat(od.slice(0, 2).map(t => [t.title.slice(0, 28), 'project-' + p.id])));
  };
  H.F.ask = (fd, f) => {
    const q = (fd.q || '').trim(); if (!q) return;
    S.ui.chat.push({ me: true, text: q }); S.ui.chat.push(Object.assign({ ai: true }, AI.answer(q)));
    H.render(); const c = document.querySelector('.chat'); if (c) c.scrollTop = c.scrollHeight; const i = document.getElementById('askq'); if (i) i.focus();
  };
  H.A.ask = a => H.F.ask({ q: a.dataset.q });
  H.A['chat-clear'] = () => { S.ui.chat = []; H.render(); };

  // ---------- predictions ----------
  AI.predictions = () => scope().filter(p => ['execution', 'handover'].includes(p.stage)).map(p => { const r = H.risk(p); return { p, r, fc: H.addDays(p.due, Math.max(0, r.slip)), conf: r.reasons.length >= 2 ? 'Medium' : 'High' }; }).sort((a, b) => b.r.slip - a.r.slip);
  AI.anomalies = () => {
    const d = db(), L = [];
    if (S.role !== 'designer') H.fin().unverified.forEach(x => L.push([`Payment of ${H.lk(x.amount)} on ${H.P(x.project).name} is only a client claim (${x.ref.toLowerCase()})`, 'finance']));
    d.drawings.filter(x => x.rev >= 3 && x.status !== 'Issued for Construction').forEach(x => L.push([`${x.title} (${H.P(x.project).name}) is on revision R${x.rev} — check the brief`, 'drawings']));
    d.tasks.filter(H.stale).slice(0, 3).forEach(t => L.push([`“${t.title}” not updated for ${-H.dif(t.updated)} days (${H.name(t.assignee)})`, 'tasks']));
    d.materials.filter(m => m.shortage).forEach(m => L.push([`Shortage: ${m.item} for ${H.P(m.project).name}`, 'procurement']));
    if (H.isOwner()) H.active().filter(p => p.value && H.margin(p).pct < 0.2).forEach(p => L.push([`${p.name} forecast margin ${Math.round(H.margin(p).pct * 100)}% — below the 20% floor`, 'finance']));
    return L;
  };

  H.V.ai = () => {
    const pr = AI.predictions(), an = AI.anomalies(), w = H.workload().filter(x => x.util > 110 || x.util < 50).sort((a, b) => b.util - a.util);
    const chat = S.ui.chat.length ? S.ui.chat : [{ ai: true, html: `Namaste${H.isOwner() ? ' Rohit Ji' : ''}. I’m the HOD Project Copilot. I answer from the Command Centre’s records — projects, drawings, tasks, visits, contractors, invoices and the team — and show the records behind every answer. If the records don’t have it, I’ll say so.`, src: [] }];
    return `<div class="pagehead"><div><h1>AI Command Centre</h1><p>Briefing, questions in plain language, delay forecasts and early warnings — computed from records you are allowed to see.</p></div></div>
<div class="grid g2"><div class="card" style="display:flex;flex-direction:column"><div class="hd"><h2>${ic('spark')} Ask HOD AI</h2>${S.ui.chat.length ? '<button class="btn sm ghost" data-act="chat-clear">Clear</button>' : ''}</div><div class="chat" aria-live="polite">${chat.map(m => m.me ? `<div class="msg me">${esc(m.text)}</div>` : `<div class="msg ai">${m.html}${m.src && m.src.length ? `<div class="src">${m.src.map(([l, g]) => `<a href="#${g}" data-go="${g}">${ic('doc')} ${esc(l)}</a>`).join('')}</div>` : ''}</div>`).join('')}</div>
<div class="chips" style="margin:8px 0 10px">${SUG.slice(0, S.ui.chat.length ? 4 : 10).map(s => `<button class="btn sm" data-act="ask" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
<form data-form="ask" class="row" style="flex-wrap:nowrap"><input class="in" id="askq" name="q" placeholder="Ask about any project, payment, drawing or person…" autocomplete="off" aria-label="Question"><button class="btn pri" type="submit" aria-label="Ask">${ic('send')}</button></form>
<p class="small muted" style="margin-top:8px">Read-only: the copilot can draft reports and reminders, but sending, approving or changing dates always needs a person. Production uses an LLM with retrieval over the live database; answers here are computed from the demo records.</p></div>
${AI.briefCard(true)}</div>
<div class="grid g3" style="margin-top:16px"><div class="card"><h2>Delay forecast</h2><p class="small muted">Predicted handover vs contract date.</p><div class="list" style="margin-top:6px">${pr.map(x => `<a class="li" href="#project-${x.p.id}" data-go="project-${x.p.id}"><div class="li-main"><div class="t">${esc(x.p.name)}</div><div class="s">${H.fd(x.p.due)} → <b class="${x.r.slip > 0 ? 'bad' : 'good'}">${H.fd(x.fc)}</b>${x.r.slip > 0 ? ` (+${x.r.slip}d)` : ''} · confidence ${x.conf.toLowerCase()}</div></div>${H.pill(H.health(x.p))}</a>`).join('') || R.empty('No projects in execution.')}</div></div>
<div class="card"><h2>Workload signals</h2><div class="list" style="margin-top:6px">${w.map(x => `<div>${H.av(x.e.id)}<div class="li-main"><div class="t">${esc(x.e.name)}</div><div class="s">${x.util}% load · ${x.open} open, ${x.od} overdue</div></div>${H.pill(x.util > 110 ? 'Overloaded' : 'Has capacity', x.util > 110 ? 'bad' : 'good')}</div>`).join('') || R.empty('Balanced.')}</div><a class="btn sm" style="margin-top:8px" href="#team" data-go="team">Rebalance in Team & HR</a></div>
<div class="card"><h2>Early warnings</h2><div class="list" style="margin-top:6px">${an.map(([t, g]) => `<a class="li" href="#${g}" data-go="${g}">${ic('alert')}<div class="li-main"><div class="t" style="font-weight:400">${esc(t)}</div></div></a>`).join('') || R.empty('No anomalies.')}</div></div></div>`;
  };
})();
