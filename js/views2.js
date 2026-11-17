/* Views: design studio, drawings & approvals, tasks, site visits, contractors, procurement */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;

  // ---------- design studio ----------
  H.V.design = () => {
    const d = db(), ps = d.projects.filter(p => ['survey', 'concept', 'drawings', 'approval'].includes(p.stage) || (p.stage === 'execution' && p.design.some(x => x < 100)));
    const queue = d.drawings.filter(x => x.status === 'Internal Review');
    const renders = d.drawings.filter(x => x.kind === '3D' && !['Issued for Construction'].includes(x.status)).sort((a, b) => b.submitted.localeCompare(a.submitted));
    return `<div class="pagehead"><div><h1>Design Studio: ${ps.length} projects in design, ${queue.length} sheets waiting for internal review</h1><p>Concept to construction documents — survey, space planning, 2D, 3D and approvals tracked stage by stage.</p></div><button class="btn pri" data-act="modal" data-id="drawing">${ic('upload')}Upload drawing / render</button></div>
<div class="grid g2">${ps.map(p => {
      const steps = ['Survey', 'Concept', '2D', '3D', 'Approvals'];
      const pend = d.drawings.filter(x => x.project === p.id && ['Internal Review', 'Client Review', 'Revision Required'].includes(x.status));
      return `<div class="card" data-k="design-${p.id}"><div class="hd"><div><h2>${H.plink(p.id)}</h2><div class="small muted">${esc(p.type)} · ${esc(H.stageName(p.stage))}</div></div>${H.pill(H.health(p))}</div>
<div class="stepper" style="margin:6px 0 12px">${steps.map((s, i) => `<div><i><b style="width:${p.design[i]}%"></b></i>${s} ${p.design[i]}%</div>`).join('')}</div>
<div class="row" style="gap:12px;flex-wrap:nowrap"><div style="width:42%;flex:none" class="thumbs"><figure>${H.thumb(H.hue(p.id) + 11, 'board', 'Material board')}<figcaption>Material board</figcaption></figure></div><div class="li-main small"><div>${H.who(p.designer)}</div><div style="margin-top:6px">${pend.length ? pend.slice(0, 3).map(x => `<div style="margin:3px 0">${H.pill(x.status)} <a class="lnk" href="#" data-act="drawer" data-type="drawing" data-id="${x.id}">${esc(x.title)}</a></div>`).join('') : '<span class="muted">No sheets pending review</span>'}</div></div></div></div>`;
    }).join('')}</div>
<div class="sect">3D visualisation — revision cycles</div>
<div class="thumbs" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${renders.slice(0, 10).map(x => `<figure data-act="drawer" data-type="drawing" data-id="${x.id}" style="cursor:pointer" data-k="dwg-${x.id}">${H.thumb(H.hue(x.id) + x.rev, 'render', x.title)}<figcaption><b style="color:var(--ink);font-weight:500">${esc(x.title.replace('3D render — ', ''))}</b> · R${x.rev}<br>${esc(H.P(x.project).name)} · ${esc(x.status)}</figcaption></figure>`).join('')}</div>
<div class="sect">Design QA before anything goes to a client</div><div class="card"><div class="grid g3">${['Dimensions verified against latest site measurement', 'Ceiling, lighting & HVAC levels coordinated', 'Switch & socket positions match furniture layout', 'Materials match approved finish schedule', 'Title block, revision and date filled', 'Structural coordination checked by architect'].map(t => `<label class="chk"><input type="checkbox" checked disabled> ${t}</label>`).join('')}</div><p class="small muted" style="margin-top:8px">Checklist runs on every sheet before “Send to client” — part of the internal review step.</p></div>`;
  };

  // ---------- drawings & approvals ----------
  const DSTAT = ['Draft', 'Internal Review', 'Client Review', 'Revision Required', 'Approved', 'Issued for Construction'];
  H.V.drawings = () => {
    const d = db(), f = S.ui.f, st = f.dst || 'pending', pj = f.dproj || 'all';
    let L = d.drawings.filter(x => (pj === 'all' || x.project === pj));
    if (st === 'pending') L = L.filter(x => ['Internal Review', 'Client Review', 'Revision Required'].includes(x.status)); else if (st !== 'all') L = L.filter(x => x.status === st);
    if (S.role === 'designer' && f.dmine !== 'all') L = L.filter(x => x.designer === S.user || x.reviewer === S.user || f.dmine === 'all');
    const cnt = s => d.drawings.filter(x => x.status === s).length;
    return `<div class="pagehead"><div><h1>Drawings & approvals: ${cnt('Client Review')} with clients, ${cnt('Internal Review')} in internal review</h1><p>Every sheet tracked individually: number, revision, reviewer, client status and issued-for-construction. Site and contractors only ever see the latest IFC revision.</p></div><button class="btn pri" data-act="modal" data-id="drawing">${ic('upload')}Upload drawing / render</button></div>
<div class="kpis" style="margin-bottom:14px">${DSTAT.map(s => `<a class="kpi" href="#" data-act="filt" data-k="dst" data-v="${s}"><div class="l">${s}</div><div class="v">${cnt(s)}</div></a>`).join('')}</div>
<div class="row" style="margin-bottom:12px">${R.seg('dst', [['pending', 'Needs action'], ['all', 'All']].concat(DSTAT.map(s => [s, s])), st)}${R.sel('dproj', R.projOpts(), pj, 'Project')}</div>
${R.dwgTable(L)}`;
  };
  R.dwgTable = L => L.length ? `<div class="tw"><table class="stack"><thead><tr><th>Drawing</th><th>Project</th><th>Designer</th><th>Rev</th><th>Status</th><th>Submitted</th><th>Waiting</th><th>Action</th></tr></thead><tbody>${L.sort((a, b) => DSTAT.indexOf(a.status) - DSTAT.indexOf(b.status) || a.submitted.localeCompare(b.submitted)).map(x => {
    const wait = ['Internal Review', 'Client Review'].includes(x.status) ? -H.dif(x.submitted) : null;
    return `<tr data-k="dwg-${x.id}"><td><a class="lnk" href="#" data-act="drawer" data-type="drawing" data-id="${x.id}">${esc(x.title)}</a><div class="small muted">${esc(x.no)} · ${x.kind}</div></td><td>${H.plink(x.project)}</td><td>${H.who(x.designer)}</td><td class="num">R${x.rev}</td><td>${H.pill(x.status)}</td><td class="nowrap">${H.fd(x.submitted)}</td><td class="num ${wait > 5 ? 'bad' : ''}">${wait != null ? wait + ' d' : '—'}</td><td>${R.dwgAction(x)}</td></tr>`;
  }).join('')}</tbody></table></div>` : R.empty('No drawings match.');
  R.dwgAction = x => {
    const pmish = ['owner', 'pm'].includes(S.role);
    if (x.status === 'Draft') return `<button class="btn sm" data-act="dwg-submit" data-id="${x.id}">Submit for review</button>`;
    if (x.status === 'Internal Review') return pmish || x.reviewer === S.user ? `<button class="btn sm pri" data-act="dwg-int-ok" data-id="${x.id}">Approve & send to client</button>` : '<span class="small muted">With reviewer</span>';
    if (x.status === 'Client Review') return `<button class="btn sm" data-act="dwg-nudge" data-id="${x.id}">Remind client</button>`;
    if (x.status === 'Revision Required') return `<button class="btn sm" data-act="modal" data-id="drawing" data-arg='{"revise":"${x.id}"}'>Upload revision</button>`;
    if (x.status === 'Approved') return pmish ? `<button class="btn sm pri" data-act="dwg-ifc" data-id="${x.id}">Issue for construction</button>` : '';
    return '<span class="small muted">Current IFC</span>';
  };
  H.Drawer.drawing = id => {
    const x = db().drawings.find(d => d.id === id), p = H.P(x.project);
    const superseded = []; for (let r = 0; r < x.rev; r++) superseded.push('R' + r);
    return `<h2 style="font-size:20px">${esc(x.title)}</h2><p class="muted">${esc(x.no)} · ${H.plink(x.project)} · ${x.kind}</p>
<div class="cover" style="margin-top:12px">${x.kind === '3D' ? H.thumb(H.hue(x.id) + x.rev, 'render', x.title) : H.plan(H.hue(x.id), x.title)}</div>
<div class="kv"><div>Revision<b>R${x.rev}</b></div><div>Status<b>${esc(x.status)}</b></div><div>Designer<b>${esc(H.name(x.designer))}</b></div><div>Reviewer<b>${esc(H.name(x.reviewer))}</b></div><div>Submitted<b>${H.fd(x.submitted)}</b></div><div>Client status<b>${['Approved', 'Issued for Construction'].includes(x.status) ? 'Approved' : x.status === 'Client Review' ? 'Awaiting' : '—'}</b></div></div>
${x.comments ? `<div class="callout" style="margin-top:14px"><b>Latest comments:</b> ${esc(x.comments)}</div>` : ''}
<div class="row" style="margin-top:14px">${R.dwgAction(x)}${x.status === 'Client Review' && S.role !== 'designer' ? `<button class="btn sm" data-act="dwg-client-ok" data-id="${x.id}">Record client approval</button><button class="btn sm" data-act="dwg-client-rev" data-id="${x.id}">Record client changes</button>` : ''}${x.status === 'Internal Review' && ['owner', 'pm'].includes(S.role) ? `<button class="btn sm" data-act="dwg-int-rev" data-id="${x.id}">Send back for revision</button>` : ''}</div>
<div class="sect">Revision history</div><div class="timeline">${x.history.slice().reverse().map(h => `<div><b>${h.rev} · ${esc(h.status)}</b> <span class="small muted">${H.fd(h.date)} · ${esc(h.by === 'Client' ? 'Client' : H.name(h.by))}</span>${h.note ? `<div class="muted small">${esc(h.note)}</div>` : ''}</div>`).join('')}</div>
${superseded.length ? `<p class="small muted" style="margin-top:6px">Superseded revisions ${superseded.join(', ')} are kept for audit and hidden from site and contractors.</p>` : ''}`;
  };
  const dh = (x, status, by, note) => { x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status, by, note: note || '' }); x.status = status; };
  Object.assign(H.A, {
    'dwg-submit': a => { const x = db().drawings.find(d => d.id === a.dataset.id); x.submitted = H.TODAY; dh(x, 'Internal Review', S.user, 'Submitted for internal review'); H.auto('r3', `Reviewer ${H.name(x.reviewer)} notified: ${x.title} (${H.P(x.project).name})`); H.notify('Approval', `${x.title} submitted for your review`, 'drawings', true); H.commit('Submitted — reviewer notified', 'dwg-' + x.id); },
    'dwg-int-ok': a => { const x = db().drawings.find(d => d.id === a.dataset.id); dh(x, 'Client Review', S.user, 'Internal review passed; sent to client portal'); x.submitted = H.TODAY; H.auto('r3', `Client approval request for ${x.title} sent via portal + WhatsApp template (queued)`); H.log(S.user, `Approved ${x.title} internally and sent to client`, x.project); H.commit('Approved internally — client asked to review in the portal', 'dwg-' + x.id); },
    'dwg-int-rev': a => { const x = db().drawings.find(d => d.id === a.dataset.id); x.comments = 'Reviewer: tighten dimensions and coordinate ceiling levels before client issue.'; dh(x, 'Revision Required', S.user, x.comments); H.commit('Sent back to designer for revision'); },
    'dwg-client-ok': a => { H.approveDrawing(a.dataset.id, 'Client'); H.commit('Client approval recorded'); },
    'dwg-client-rev': a => { const x = db().drawings.find(d => d.id === a.dataset.id); x.comments = 'Client requested changes (recorded by team after meeting).'; dh(x, 'Revision Required', 'Client', x.comments); H.commit('Client changes recorded — designer notified'); },
    'dwg-ifc': a => { const x = db().drawings.find(d => d.id === a.dataset.id); dh(x, 'Issued for Construction', S.user, 'Issued to site & contractors; earlier revisions superseded'); H.notify('Site', `${x.title} R${x.rev} issued for construction`, 'drawings'); H.log(S.user, `Issued ${x.no} R${x.rev} for construction`, x.project); H.commit('Issued for construction — site and contractors now see R' + x.rev, 'dwg-' + x.id); },
    'dwg-nudge': a => { const x = db().drawings.find(d => d.id === a.dataset.id); x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status: 'Client Review', by: S.user, note: 'Reminder sent to client (portal + WhatsApp template)' }); H.commit('Reminder sent to client'); }
  });
  H.approveDrawing = (id, by) => {
    const x = db().drawings.find(d => d.id === id); dh(x, 'Approved', by || 'Client', 'Approved by client in portal'); x.comments = '';
    const p = H.P(x.project);
    H.auto('r4', `Client approved ${x.title} — next stage released for ${p.name}`);
    db().tasks.push({ id: H.uid('t'), title: `Prepare IFC set after approval — ${x.title.replace('3D render — ', '')}`, project: x.project, assignee: x.kind === '3D' ? p.designer : 'e15', status: 'Not Started', priority: 'Medium', due: H.D(5), created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Design', who: 'e' });
    H.notify('Approval', `${H.CL(p.client).name} approved ${x.title}`, 'drawings');
    H.log(by === 'Client' ? p.pm : S.user, `Client approved ${x.title} (R${x.rev})`, x.project);
    if (p.stage === 'approval' && db().drawings.filter(d => d.project === p.id && d.status === 'Client Review').length === 0) p.design[4] = Math.min(100, p.design[4] + 30);
  };

  // ---------- tasks ----------
  const TSTAT = ['Not Started', 'In Progress', 'Submitted for Review', 'Revision Required', 'Approved', 'Completed'];
  H.V.tasks = () => {
    const d = db(), f = S.ui.f, pj = f.tproj || 'all', who = f.twho || (S.role === 'designer' ? S.user : 'all'), show = f.tshow || 'open', cat = f.tcat || 'all';
    let L = d.tasks.filter(t => (pj === 'all' || t.project === pj) && (who === 'all' || t.assignee === who) && (cat === 'all' || t.category === cat));
    if (show === 'overdue') L = L.filter(H.overdue); else if (show === 'blocked') L = L.filter(t => t.blocked && !H.done(t)); else if (show === 'stale') L = L.filter(H.stale); else if (show === 'open') L = L.filter(t => !H.done(t) || H.dif(t.done || t.due) >= -7);
    const od = d.tasks.filter(H.overdue).length, st = d.tasks.filter(H.stale).length, bl = d.tasks.filter(t => t.blocked && !H.done(t)).length;
    const people = [['all', 'Everyone']].concat(d.employees.filter(e => e.cap).map(e => [e.id, e.name])).concat(d.contractors.filter(c => c.kind === 'Contractor').map(c => [c.id, c.name + ' (contractor)']));
    return `<div class="pagehead"><div><h1>Tasks: ${od} overdue, ${bl} blocked, ${st} not updated for 5+ days</h1><p>${d.tasks.length} tasks across staff and contractors. Status moves Not started → In progress → Submitted for review → Approved → Completed; overdue work escalates by rule.</p></div><button class="btn pri" data-act="modal" data-id="task">${ic('plus')}New task</button></div>
<div class="row" style="margin-bottom:12px">${R.seg('tshow', [['open', 'Open & recent'], ['overdue', `Overdue (${od})`], ['blocked', `Blocked (${bl})`], ['stale', `Not updated (${st})`], ['all', 'All']], show)}${R.sel('tproj', R.projOpts(), pj, 'Project')}${R.sel('twho', people, who, 'Assignee')}${R.sel('tcat', [['all', 'All types'], ['Design', 'Design'], ['Site', 'Site'], ['Procurement', 'Procurement'], ['Finance', 'Finance'], ['Admin', 'Admin']], cat, 'Type')}</div>
${R.board(L, 't')}`;
  };
  R.board = (L, scope) => `<div class="kan">${TSTAT.map(s => { const cs = L.filter(t => t.status === s); return `<div class="col" data-drop="task:${s}"><h3><span>${s}</span><span class="muted">${cs.length}</span></h3>${cs.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 40).map(t => `<div class="kc" draggable="true" data-drag="${t.id}" data-act="drawer" data-type="task" data-id="${t.id}" data-k="task-${t.id}" tabindex="0"><div class="t">${esc(t.title)}</div>${scope !== 'p' ? `<div class="small muted" style="margin-top:3px">${esc(H.P(t.project).name)}</div>` : ''}<div class="m"><span class="${H.overdue(t) ? 'bad' : ''}">${H.overdue(t) ? (-H.dif(t.due)) + 'd late' : 'Due ' + H.fd(t.due)}</span>${t.blocked ? '<span class="pill warn">Blocked</span>' : ''}${H.stale(t) ? '<span class="pill">Stale</span>' : ''}${H.av(t.assignee)}</div></div>`).join('') || '<div class="small muted" style="padding:8px">Empty</div>'}${cs.length > 40 ? `<div class="small muted">+${cs.length - 40} more</div>` : ''}</div>`; }).join('')}</div>`;
  H.setTask = (t, status, note) => {
    const prev = t.status; t.status = status; t.updated = H.TODAY; if (H.done(t)) t.done = H.TODAY;
    (t.hist = t.hist || []).unshift({ date: H.TODAY, text: `${prev} → ${status}${note ? ' · ' + note : ''}`, by: S.user });
    if (t.activity && H.isCon(t.assignee)) {
      const a = db().activities.find(x => x.id === t.activity);
      if (a) { if (status === 'Completed') { a.prog = 100; a.ae = H.TODAY; } else if (status === 'In Progress' && !a.prog) { a.prog = 10; a.as = H.TODAY; } H.recalcProject(a.project); }
      if (status === 'Submitted for Review' || status === 'Completed') {
        const p = H.P(t.project);
        if (H.auto('r7', `Inspection task created for ${t.title} (${p.name})`)) db().tasks.push({ id: H.uid('t'), title: 'Inspect before acceptance — ' + t.title.toLowerCase(), project: t.project, assignee: p.site, status: 'Not Started', priority: 'High', due: H.D(1), created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Site', who: 'e' });
      }
    }
    if (status === 'Completed' && t.unblocks) { const u = db().tasks.find(x => x.id === t.unblocks); if (u) u.blocked = ''; }
    H.log(S.user, `${t.title}: ${prev} → ${status}`, t.project);
  };
  H.A['drop-task'] = (id, st) => { const t = db().tasks.find(x => x.id === id); if (!t || t.status === st) return; H.setTask(t, st); H.commit(`Task moved to ${st}`, 'task-' + id); };
  H.Drawer.task = id => {
    const t = db().tasks.find(x => x.id === id), act = t.activity ? db().activities.find(a => a.id === t.activity) : null;
    const nxt = { 'Not Started': ['In Progress'], 'In Progress': ['Submitted for Review', 'Completed'], 'Submitted for Review': ['Approved', 'Revision Required'], 'Revision Required': ['In Progress', 'Submitted for Review'], 'Approved': ['Completed'], 'Completed': [] }[t.status] || [];
    return `<h2 style="font-size:20px">${esc(t.title)}</h2><p class="muted">${H.plink(t.project)} · ${esc(t.category)}</p>
<div class="kv"><div>Status<b>${esc(t.status)}</b></div><div>Assigned to<b>${esc(H.name(t.assignee))}</b></div><div>Due<b class="${H.overdue(t) ? 'bad' : ''}">${H.fd(t.due)} (${H.rel(t.due)})</b></div><div>Priority<b>${t.priority}</b></div><div>Last update<b class="${H.stale(t) ? 'warn' : ''}">${H.rel(t.updated)}</b></div><div>Evidence<b>${t.evidence} file${t.evidence === 1 ? '' : 's'}</b></div></div>
${t.blocked ? `<div class="callout" style="margin-top:14px;border-left-color:var(--warn)"><b>Blocked:</b> ${esc(t.blocked)}. The system will not let this start until the dependency is closed.</div>` : ''}
${act ? `<div class="callout" style="margin-top:10px">Linked activity: <b>${esc(act.name)}</b> · ${act.prog}% · planned ${H.fd(act.ps)}–${H.fd(act.pe)}${act.note ? '<br>' + esc(act.note) : ''}</div>` : ''}
<div class="sect">Update status</div><div class="row">${nxt.map(s => `<button class="btn ${s === 'Completed' || s === 'Approved' ? 'pri' : ''}" data-act="task-set" data-id="${t.id}" data-v="${s}">${s}</button>`).join('') || '<span class="muted">Closed</span>'}${H.overdue(t) && S.role !== 'designer' ? `<button class="btn" data-act="task-escalate" data-id="${t.id}">${ic('flag')}Escalate</button>` : ''}</div>
<div class="sect">Evidence</div><label class="btn sm" style="cursor:pointer">${ic('upload')}Attach photos or files<input type="file" multiple hidden data-chg="evidence" data-id="${t.id}"></label>${(t.files || []).length ? `<div class="small muted" style="margin-top:6px">${t.files.map(esc).join(', ')}</div>` : ''}
<div class="sect">History</div><div class="timeline">${(t.hist || []).concat([{ date: t.created, text: 'Task created', by: '' }]).map(h => `<div><b>${H.fd(h.date)}</b> ${h.by ? '· ' + esc(H.name(h.by)) : ''}<div class="muted small">${esc(h.text)}</div></div>`).join('')}</div>`;
  };
  H.A['task-set'] = a => { const t = db().tasks.find(x => x.id === a.dataset.id); H.setTask(t, a.dataset.v); H.commit(`${t.title} → ${a.dataset.v}`); };
  H.A['task-open'] = a => { S.ui.drawer = { type: 'task', id: a.dataset.id }; H.render(); };
  H.A['task-escalate'] = a => { const t = db().tasks.find(x => x.id === a.dataset.id), p = H.P(t.project); (t.hist = t.hist || []).unshift({ date: H.TODAY, text: `Escalated to ${H.name(p.pm)} and owner`, by: S.user }); t.escalated = true; H.notify('Overdue', `Escalated: ${t.title} (${p.name}), ${-H.dif(t.due)} days late`, 'project-' + p.id, true); H.auto('r5', `Manual escalation: ${t.title} (${p.name})`); H.commit('Escalated to project manager and owner'); };
  H.Cg.evidence = el => { const t = db().tasks.find(x => x.id === el.dataset.id); const fs = Array.from(el.files || []).map(f => f.name); t.files = (t.files || []).concat(fs); t.evidence += fs.length; t.updated = H.TODAY; (t.hist = t.hist || []).unshift({ date: H.TODAY, text: `Attached ${fs.length} file(s)`, by: S.user }); H.commit(`${fs.length} file(s) attached (kept in this browser only in the demo)`); };

  // ---------- site visits ----------
  H.V.visits = () => {
    const d = db(), f = S.ui.f, pj = f.vproj || 'all';
    const today = d.visits.filter(v => v.date === H.TODAY), up = d.visits.filter(v => v.status === 'Scheduled' && v.date > H.TODAY).sort((a, b) => a.date.localeCompare(b.date));
    const L = d.visits.filter(v => v.status === 'Completed' && (pj === 'all' || v.project === pj)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const obsOpen = d.snags.filter(s => s.status !== 'Closed');
    return `<div class="pagehead"><div><h1>Site visits: ${today.length} today, ${today.filter(v => v.status === 'Completed').length} done · ${obsOpen.length} open observations</h1><p>Check-in with consent-based location, photos, observations and a report generated automatically. Every observation that needs action becomes a task with an owner and a date.</p></div><div class="row"><button class="btn" data-act="role" data-id="site">${ic('phone')}Open site supervisor app</button><button class="btn pri" data-act="modal" data-id="visit">${ic('plus')}Schedule visit</button></div></div>
<div class="grid g2"><div class="card"><h2>Today</h2>${R.today()}</div><div class="card"><h2>Next 7 days</h2>${up.length ? `<div class="list">${up.slice(0, 7).map(v => `<div><b class="num" style="width:56px;text-align:left">${H.fd(v.date)}</b><div class="li-main"><div class="t">${esc(H.P(v.project).name)}</div><div class="s">${v.time} · ${esc(H.name(v.by))}</div></div></div>`).join('')}</div>` : R.empty('Nothing scheduled.')}</div></div>
<div class="sect">Visit reports ${R.sel('vproj', R.projOpts(), pj, 'Project')}</div>${R.visitTable(L)}
<div class="sect">Open quality & safety observations</div>${R.snagTable(obsOpen.slice(0, 15))}`;
  };
  R.visitTable = L => L.length ? `<div class="tw"><table class="stack"><thead><tr><th>Report</th><th>Project</th><th>By</th><th>Date</th><th class="num">Photos</th><th class="num">Progress</th><th>Observations</th><th></th></tr></thead><tbody>${L.map(v => `<tr data-k="visit-${v.id}"><td><b style="font-weight:500">${esc(v.code)}</b><div class="small muted">${v.status}</div></td><td>${H.plink(v.project)}</td><td>${H.who(v.by)}</td><td class="nowrap">${H.fd(v.date)} ${v.time}</td><td class="num">${v.photos}</td><td class="num">${v.progress}%</td><td>${v.obs.length ? v.obs.map(o => H.pill(o.kind, o.sev === 'High' ? 'bad' : 'warn')).join(' ') : '<span class="muted small">None</span>'}</td><td>${v.status === 'Completed' ? `<button class="btn sm" data-act="drawer" data-type="visit" data-id="${v.id}">Report</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : R.empty('No visits yet.');
  H.Drawer.visit = id => {
    const v = db().visits.find(x => x.id === id), p = H.P(v.project);
    const tasks = db().tasks.filter(t => t.visit === v.id);
    return `<div id="rep-${v.id}"><div class="row between"><div><div class="small muted">Site visit report ${esc(v.code)}</div><h2 style="font-size:20px">${esc(p.name)}</h2><p class="muted small">${esc(p.location)} · ${esc(H.CL(p.client).name)}</p></div>${H.logo(120)}</div>
<div class="kv"><div>Visited by<b>${esc(H.name(v.by))}</b></div><div>Date<b>${H.fdy(v.date)}</b></div><div>Check-in / out<b>${v.time} – ${v.checkout || '—'}</b></div><div>Location<b>${esc(v.geo || '—')}</b></div><div>Progress<b>${v.progress}%</b></div><div>Weather<b>${esc(v.weather || '—')}</b></div></div>
<div class="sect">Photographs (${v.photos})</div><div class="thumbs">${Array.from({ length: Math.min(6, v.photos) }, (_, i) => `<figure>${H.thumb(v.seed * 3 + i, 'site')}<figcaption>${['Ceiling', 'Wall', 'Electrical', 'Flooring', 'Joinery', 'Overall'][i]} · ${v.time}</figcaption></figure>`).join('')}${(v.files || []).map(n => `<figure><div style="padding:18px 8px" class="small">${esc(n)}</div><figcaption>Uploaded</figcaption></figure>`).join('')}</div>
<div class="sect">Observations & actions</div>${v.obs.length ? `<div class="tw"><table><thead><tr><th>Observation</th><th>Type</th><th>Responsible</th><th>Target</th><th>Status</th></tr></thead><tbody>${v.obs.map(o => `<tr><td>${esc(o.text)}</td><td>${H.pill(o.kind, o.sev === 'High' ? 'bad' : 'warn')}</td><td>${esc(H.name(o.contractor))}</td><td>${H.fd(o.due)}</td><td>${H.pill(o.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No issues observed.</p>'}
<div class="grid g2" style="margin-top:12px"><div><b>Work completed</b><p class="muted">${esc(v.done || '—')}</p></div><div><b>Work pending</b><p class="muted">${esc(v.pending || '—')}</p></div><div><b>Next action</b><p class="muted">${esc(v.next || '—')}</p></div><div><b>Contractors on site</b><p class="muted">${v.present.map(H.name).map(esc).join(', ') || '—'}</p></div></div>
<p class="small muted" style="margin-top:10px">Distributed to: ${esc(H.name(p.pm))} (PM), ${esc(H.name(p.designer))} (designer), owner${v.obs.length ? ', responsible contractors' : ''}. Client sees selected photos only.</p></div>
${tasks.length ? `<div class="sect">Tasks created from this visit</div>${R.taskList(tasks)}` : ''}<div class="row" style="margin-top:12px"><button class="btn sm" data-act="copy" data-id="rep-${v.id}">${ic('copy')}Copy report text</button></div>`;
  };

  // ---------- contractors ----------
  H.conStats = c => {
    const d = db(), ts = d.tasks.filter(t => t.assignee === c.id);
    const missed = ts.filter(t => H.overdue(t) || (t.hist || []).some(h => /late/.test(h.text))).length + (c.missed || 0);
    const snags = d.snags.filter(s => s.contractor === c.id && s.status !== 'Closed').length;
    const projs = [...new Set(d.activities.filter(a => a.contractor === c.id && a.prog < 100).map(a => a.project).concat(ts.filter(t => !H.done(t)).map(t => t.project)))];
    const bills = d.bills.filter(b => b.contractor === c.id);
    const score = Math.max(1, Math.min(5, c.rating - missed * 0.25 - snags * 0.1)).toFixed(1);
    const doneWeek = ts.filter(t => H.done(t) && t.done && H.dif(t.done) >= -7);
    return { ts, missed, snags, projs, bills, score, doneWeek };
  };
  H.V.contractors = () => {
    const d = db(), f = S.ui.f, kind = f.ckind || 'all';
    const L = d.contractors.filter(c => kind === 'all' || c.kind === kind).map(c => ({ c, s: H.conStats(c) })).sort((a, b) => b.s.missed - a.s.missed || b.s.projs.length - a.s.projs.length);
    const late = L.filter(x => x.s.missed).length;
    return `<div class="pagehead"><div><h1>Contractors & vendors: ${late} with missed deadlines this cycle</h1><p>${d.contractors.length} partners. Each sees only its own work orders in the contractor portal — never your margins or other projects.</p></div><button class="btn" data-act="role" data-id="contractor">${ic('eye')}Open contractor portal</button></div>
<div class="row" style="margin-bottom:12px">${R.seg('ckind', [['all', 'All'], ['Contractor', 'Contractors'], ['Vendor', 'Vendors']], kind)}</div>
<div class="tw"><table class="stack"><thead><tr><th>Partner</th><th>Trade</th><th class="num">Rating</th><th>Active projects</th><th class="num">Open tasks</th><th class="num">Missed</th><th class="num">Open snags</th><th class="num">Bills pending</th><th></th></tr></thead><tbody>${L.map(({ c, s }) => `<tr data-k="con-${c.id}"><td><b style="font-weight:500">${esc(c.name)}</b><div class="small muted">${esc(c.person)} · ${c.kind}</div></td><td>${esc(c.trade)}</td><td class="num ${s.score < 3.5 ? 'bad' : ''}">${s.score}</td><td class="small">${s.projs.map(id => esc(H.P(id).name)).join(', ') || '—'}</td><td class="num">${s.ts.filter(t => !H.done(t)).length}</td><td class="num ${s.missed ? 'bad' : ''}">${s.missed || '—'}</td><td class="num">${s.snags || '—'}</td><td class="num">${s.bills.filter(b => b.status !== 'Paid').length || '—'}</td><td><button class="btn sm" data-act="drawer" data-type="contractor" data-id="${c.id}">Open</button></td></tr>`).join('')}</tbody></table></div><p class="small muted" style="margin-top:8px">Names, contacts and GST numbers are fictional sample data.</p>`;
  };
  H.Drawer.contractor = id => {
    const c = H.C(id), s = H.conStats(c), d = db();
    const wo = d.activities.filter(a => a.contractor === id);
    return `<h2 style="font-size:20px">${esc(c.name)}</h2><p class="muted">${esc(c.trade)} · ${c.kind} · ${esc(c.person)} · ${esc(c.phone)}</p>
<div class="kv"><div>GSTIN<b>${esc(c.gst)}</b></div><div>Performance<b>${s.score} / 5</b></div><div>Missed deadlines<b class="${s.missed ? 'bad' : ''}">${s.missed}</b></div><div>Open snags<b>${s.snags}</b></div><div>Retention<b>${c.retention}%</b></div><div>Done this week<b>${s.doneWeek.length} tasks</b></div></div>
<div class="sect">Work orders</div>${wo.length ? `<div class="tw"><table><thead><tr><th>Scope</th><th>Project</th><th>Planned</th><th class="num">Progress</th></tr></thead><tbody>${wo.map(a => `<tr><td>${esc(a.name)}</td><td>${esc(H.P(a.project).name)}</td><td class="nowrap">${H.fd(a.ps)}–${H.fd(a.pe)}</td><td class="num ${a.prog < 100 && a.pe < H.TODAY ? 'bad' : ''}">${a.prog}%</td></tr>`).join('')}</tbody></table></div>` : R.empty('Supply-only vendor — see purchase orders in Procurement.')}
<div class="sect">Open tasks</div>${R.taskList(s.ts.filter(t => !H.done(t)))}
<div class="sect">Bills</div>${R.billTable(s.bills)}
<div class="sect">Quality issues</div>${R.snagTable(d.snags.filter(x => x.contractor === id))}`;
  };

  // ---------- procurement ----------
  const MST = ['Requirement', 'Requisition', 'Approved', 'Quotes', 'Compared', 'PO issued', 'In transit', 'Delivered', 'Inspected', 'Consumed'];
  H.V.procurement = () => {
    const d = db(), f = S.ui.f, pj = f.mproj || 'all';
    const L = d.materials.filter(m => pj === 'all' || m.project === pj);
    const short = d.materials.filter(m => m.shortage);
    return `<div class="pagehead"><div><h1>Procurement: ${short.length} shortage alerts before they stop work</h1><p>Requirement → requisition → approval → quotations → comparison → PO → delivery → inspection → consumption, linked to drawings, BOQ and tasks.</p></div><button class="btn pri" data-act="mat-new">${ic('plus')}Material requirement</button></div>
${short.length ? `<div class="grid g2" style="margin-bottom:16px">${short.map(m => `<div class="card" style="border-left:3px solid var(--bad)" data-k="mat-${m.id}"><div class="hd"><h2>${esc(m.item)}</h2>${H.pill('Shortage risk', 'bad')}</div><p class="small">${H.plink(m.project)} · needed ${H.fd(m.needBy)} (${H.rel(m.needBy)}) · ${esc(m.qty)}</p><p class="small muted" style="margin-top:4px">${esc(m.note)}</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="drawer" data-type="material" data-id="${m.id}">Open</button><button class="btn sm" data-act="mat-expedite" data-id="${m.id}">Expedite & alert PM</button></div></div>`).join('')}</div>` : ''}
<div class="kpis" style="margin-bottom:14px">${MST.map(s => `<div class="kpi"><div class="l">${s}</div><div class="v">${d.materials.filter(m => m.stage === s).length}</div></div>`).join('')}</div>
<div class="row" style="margin-bottom:10px">${R.sel('mproj', R.projOpts(), pj, 'Project')}</div>${R.matTable(L)}`;
  };
  R.matTable = L => L.length ? `<div class="tw"><table class="stack"><thead><tr><th>Item</th><th>Project</th><th>Qty</th><th>Stage</th><th>Vendor</th><th>Needed by</th><th class="num">Value</th><th></th></tr></thead><tbody>${L.map(m => `<tr data-k="mat-${m.id}"><td><a class="lnk" href="#" data-act="drawer" data-type="material" data-id="${m.id}">${esc(m.item)}</a><div class="small muted">${esc(m.no)}</div></td><td>${H.plink(m.project)}</td><td class="nowrap">${esc(m.qty)}</td><td>${H.pill(m.stage, m.shortage ? 'bad' : ['Consumed', 'Inspected', 'Delivered'].includes(m.stage) ? 'good' : 'info')}</td><td class="small">${m.vendor ? esc(H.name(m.vendor)) : '—'}</td><td class="nowrap ${m.needBy < H.TODAY && MST.indexOf(m.stage) < 7 ? 'bad' : ''}">${H.fd(m.needBy)}</td><td class="num">${H.lk(m.value)}</td><td>${MST.indexOf(m.stage) < 9 && S.role !== 'designer' ? `<button class="btn sm" data-act="mat-next" data-id="${m.id}">→ ${MST[MST.indexOf(m.stage) + 1]}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : R.empty('No materials.');
  H.Drawer.material = id => {
    const m = db().materials.find(x => x.id === id), q = db().quotes.find(x => x.material === id);
    const best = q ? q.rows.reduce((b, r) => r[2] < b[2] ? r : b, q.rows[0]) : null;
    return `<h2 style="font-size:20px">${esc(m.item)}</h2><p class="muted">${esc(m.no)} · ${H.plink(m.project)}</p>
<div class="kv"><div>Quantity<b>${esc(m.qty)}</b></div><div>Stage<b>${esc(m.stage)}</b></div><div>Needed by<b>${H.fd(m.needBy)}</b></div><div>Value<b>${H.lk(m.value)}</b></div><div>Vendor<b>${m.vendor ? esc(H.name(m.vendor)) : '—'}</b></div></div>
${m.note ? `<div class="callout" style="margin-top:12px">${esc(m.note)}</div>` : ''}
${q ? `<div class="sect">Quotation comparison</div><div class="tw"><table><thead><tr><th>Vendor</th><th class="num">Rate (₹)</th><th class="num">Lead time</th><th></th></tr></thead><tbody>${q.rows.map(r => `<tr${r === best ? ' style="background:var(--goodbg)"' : ''}><td>${esc(r[1])}${r === best ? ' <span class="pill good">Lowest</span>' : ''}</td><td class="num">${r[2].toLocaleString('en-IN')}</td><td class="num">${r[3]} days</td><td>${['Quotes', 'Compared'].includes(m.stage) && S.role !== 'designer' ? `<button class="btn sm" data-act="mat-pick" data-id="${m.id}" data-v="${esc(r[1])}" data-c="${r[0]}">Select & raise PO</button>` : ''}</td></tr>`).join('')}</tbody></table></div><p class="small muted" style="margin-top:6px">Rates are sample quotes. POs above ₹2 L need owner approval.</p>` : ''}
<div class="sect">Move along</div><div class="stepper" style="grid-template-columns:repeat(5,minmax(0,1fr))">${MST.map((s, i) => `<div><i><b style="width:${i <= MST.indexOf(m.stage) ? 100 : 0}%"></b></i>${s}</div>`).join('')}</div>
<div class="row" style="margin-top:12px">${MST.indexOf(m.stage) < 9 ? `<button class="btn pri" data-act="mat-next" data-id="${m.id}">Move to ${MST[MST.indexOf(m.stage) + 1]}</button>` : ''}</div>`;
  };
  Object.assign(H.A, {
    'mat-next': a => { const m = db().materials.find(x => x.id === a.dataset.id); const i = MST.indexOf(m.stage); if (m.stage === 'Compared' && m.value > 2e5 && S.role !== 'owner') { H.toast('POs above ₹2 L need owner approval — sent to the owner’s decision list'); return; } m.stage = MST[i + 1]; if (m.stage === 'PO issued') m.no = m.no.replace('PR-', 'PO-'); if (['Delivered', 'Inspected'].includes(m.stage)) { m.shortage = false; m.note = ''; db().tasks.forEach(t => { if (t.blocked && t.blocked.includes(m.item.split(' ')[0])) t.blocked = ''; }); } H.log(S.user, `${m.item}: ${MST[i]} → ${m.stage}`, m.project); H.commit(`${m.item} → ${m.stage}`, 'mat-' + m.id); },
    'mat-approve-po': a => { const m = db().materials.find(x => x.id === a.dataset.id); m.stage = 'PO issued'; m.no = m.no.replace('PR-', 'PO-'); H.log(S.user, `Approved PO for ${m.item} (${H.lk(m.value)})`, m.project); H.commit('PO approved and issued'); },
    'mat-pick': a => { const m = db().materials.find(x => x.id === a.dataset.id); if (H.isCon(a.dataset.c)) m.vendor = a.dataset.c; m.note = 'Selected: ' + a.dataset.v; m.stage = m.value > 2e5 && S.role !== 'owner' ? 'Compared' : 'PO issued'; if (m.stage === 'PO issued') m.no = m.no.replace('PR-', 'PO-'); H.commit(m.stage === 'PO issued' ? 'PO raised with ' + a.dataset.v : 'Vendor selected — PO awaiting owner approval'); },
    'mat-expedite': a => { const m = db().materials.find(x => x.id === a.dataset.id), p = H.P(m.project); H.notify('Material', `Expedite: ${m.item} for ${p.name}`, 'procurement', true); db().tasks.push({ id: H.uid('t'), title: 'Expedite delivery — ' + m.item, project: m.project, assignee: 'e13', status: 'In Progress', priority: 'High', due: H.D(1), created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Procurement', who: 'e' }); H.commit(`Procurement asked to expedite; ${H.name(p.pm)} alerted`); },
    'mat-new': () => { const d = db(); d.materials.unshift({ id: H.uid('m'), no: 'PR-' + (2700 + d.materials.length), project: 'p2', item: 'Wardrobe profile handles — bronze', qty: '64 nos.', stage: 'Requirement', vendor: null, needBy: H.D(12), value: 38000, shortage: false, note: 'Raised from wardrobe detail drawing' }); H.commit('Material requirement added (sample) — move it through the pipeline'); }
  });
})();
