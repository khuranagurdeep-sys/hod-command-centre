/* Modals (create & edit forms) and their submit handlers */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic;
  const opt = (L, cur) => L.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur || '') ? ' selected' : ''}>${esc(l)}</option>`).join('');
  const fld = (label, name, inner, full) => `<div${full ? ' class="full"' : ''}><label class="f" for="f-${name}">${label}</label>${inner}</div>`;
  const inp = (name, val, type, extra) => `<input class="in" id="f-${name}" name="${name}" type="${type || 'text'}" value="${esc(val == null ? '' : val)}" ${extra || ''}>`;
  const sel = (name, L, cur, extra) => `<select class="in" id="f-${name}" name="${name}" ${extra || ''}>${opt(L, cur)}</select>`;
  const ta = (name, val, rows, extra) => `<textarea class="in" id="f-${name}" name="${name}" rows="${rows || 3}" ${extra || ''}>${esc(val || '')}</textarea>`;
  const projL = (filter) => db().projects.filter(filter || (p => p.stage !== 'completed')).map(p => [p.id, p.name]);
  const peopleL = () => db().employees.map(e => [e.id, `${e.name} — ${e.role}`]);
  const conL = () => db().contractors.map(c => [c.id, `${c.name} — ${c.trade}`]);
  const foot = (label, note) => `<div class="row between" style="margin-top:16px"><span class="small muted">${note || ''}</span><div class="row"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn pri" type="submit">${label}</button></div></div>`;
  const done = (msg, hl) => { S.ui.modal = null; H.commit(msg, hl); };
  const goto = r => { S.ui.route = r; S.ui.drawer = null; try { history.replaceState(null, '', '#' + r); } catch (e) { /* sandbox */ } };

  H.nextInvNo = () => { const n = Math.max(...db().invoices.map(i => +i.no.split('/').pop())) + 1; return 'HOD/25-26/' + String(n).padStart(4, '0'); };
  H.nextVisitCode = () => 'SV-' + (Math.max(...db().visits.map(v => +v.code.split('-')[1])) + 1);

  // ---------- lead / enquiry ----------
  H.leadScore = l => {
    let s = 30;
    s += Math.min(30, Math.round((+l.budget || 0) / 1e6) * 2);
    s += (+l.area || 0) > 3000 ? 10 : (+l.area || 0) > 1500 ? 6 : 2;
    s += { Referral: 15, Website: 8, Instagram: 6, WhatsApp: 8, 'Walk-in': 12, Call: 8 }[l.source] || 5;
    s += /turnkey/i.test(l.service || '') ? 8 : 4;
    return Math.min(96, s);
  };
  H.newLead = f => {
    const d = db();
    const owner = /gurgaon|gurugram|noida|ghaziabad|faridabad/i.test(f.location || '') ? 'e2' : 'e14';
    const l = { id: H.uid('l'), name: f.name, phone: f.phone, source: f.source || 'Website', type: f.type, location: f.location, area: +f.area || 0, budget: +f.budget || 0, service: f.service || 'Turnkey interiors', stage: 'New Lead', score: 0, owner, created: H.TODAY, next: H.TODAY, notes: f.notes || '', lost: '', expectedClose: H.D(45) };
    l.score = H.leadScore(l);
    d.leads.unshift(l);
    if (H.auto('r1', `New ${l.source} enquiry (${l.name}) scored ${l.score}, assigned to ${H.name(owner)}; first call due within 2 hours`)) {
      d.tasks.push({ id: H.uid('t'), title: `First call — ${l.name} (${l.type || 'enquiry'})`, project: '', lead: l.id, assignee: owner, status: 'Not Started', priority: l.score >= 70 ? 'High' : 'Medium', due: H.TODAY, created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Admin', who: 'e' });
      H.notify('Client', `New enquiry: ${l.name} — ${l.type || ''} ${l.location ? 'in ' + l.location : ''} (score ${l.score})`, 'leads', true);
    }
    H.log(owner, `New enquiry captured: ${l.name} via ${l.source}`, '');
    return l;
  };
  H.Modal.lead = () => `<h2>New client enquiry</h2><p class="muted small" style="margin:4px 0 14px">In production this record is created automatically from the website form, WhatsApp, Instagram DMs and call logs.</p>
<form data-form="lead"><div class="fgrid">${fld('Client name', 'name', inp('name', '', 'text', 'required'))}${fld('Phone', 'phone', inp('phone', '+91 ', 'tel', 'required'))}${fld('Source', 'source', sel('source', ['Website', 'WhatsApp', 'Instagram', 'Referral', 'Call', 'Walk-in'].map(x => [x, x])))}${fld('Service', 'service', sel('service', ['Turnkey interiors', 'Interior design', 'Architecture', 'Architecture + interiors', 'Furniture design & manufacturing', 'Space planning'].map(x => [x, x])))}${fld('Property type', 'type', inp('type', '', 'text', 'placeholder="e.g. 4BHK apartment, office, café"'))}${fld('Location', 'location', inp('location', '', 'text', 'placeholder="e.g. Dwarka, New Delhi"'))}${fld('Area (sq ft)', 'area', inp('area', '', 'number', 'min="0"'))}${fld('Indicative budget (₹)', 'budget', inp('budget', '', 'number', 'min="0" step="100000"'))}${fld('Requirement notes', 'notes', ta('notes', ''), true)}</div>${foot('Create lead', 'Rule 1 scores and assigns it')}</form>`;
  H.F.lead = fd => { const l = H.newLead(fd); goto('leads'); done(`Lead created, scored ${l.score} and assigned to ${H.name(l.owner)}`, 'lead-' + l.id); };

  // ---------- task ----------
  H.Modal.task = m => `<h2>New task</h2><form data-form="task" style="margin-top:12px"><div class="fgrid">${fld('Task', 'title', inp('title', '', 'text', 'required'), true)}${fld('Project', 'project', sel('project', projL(), m.project))}${fld('Category', 'category', sel('category', ['Site', 'Design', 'Procurement', 'Finance', 'Admin'].map(x => [x, x]), 'Site'))}${fld('Assign to', 'assignee', `<select class="in" id="f-assignee" name="assignee"><optgroup label="Team">${opt(peopleL())}</optgroup><optgroup label="Contractors & vendors">${opt(conL())}</optgroup></select>`)}${fld('Priority', 'priority', sel('priority', [['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']], 'Medium'))}${fld('Due date', 'due', inp('due', H.D(3), 'date', 'required'))}${fld('Needs photo evidence to close', 'evid', sel('evid', [['1', 'Yes'], ['0', 'No']], '1'))}${fld('Notes', 'note', ta('note', '', 2), true)}</div>${foot('Create task')}</form>`;
  H.F.task = fd => {
    const t = { id: H.uid('t'), title: fd.title, project: fd.project, assignee: fd.assignee, status: 'Not Started', priority: fd.priority, due: fd.due, created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, needEvidence: fd.evid === '1', category: fd.category, who: H.isCon(fd.assignee) ? 'c' : 'e', note: fd.note, hist: [{ date: H.TODAY, text: 'Created', by: S.user }] };
    db().tasks.push(t); H.log(S.user, `Created task “${t.title}” for ${H.name(t.assignee)}`, t.project);
    if (H.isCon(t.assignee)) H.auto('r5', `Work order sent to ${H.name(t.assignee)} in contractor portal: ${t.title} (WhatsApp alert queued)`);
    done('Task created and assigned to ' + H.name(t.assignee));
  };

  // ---------- site visit ----------
  H.Modal.visit = m => `<h2>Schedule site visit</h2><form data-form="visit" style="margin-top:12px"><div class="fgrid">${fld('Project', 'project', sel('project', projL(p => ['execution', 'handover', 'survey', 'drawings', 'concept', 'approval'].includes(p.stage)), m.project))}${fld('Visit by', 'by', sel('by', db().employees.filter(e => ['site', 'pm', 'architect', 'designer'].includes(e.kind)).map(e => [e.id, e.name + ' — ' + e.role]), m.project ? H.P(m.project).site : 'e9'))}${fld('Date', 'date', inp('date', H.D(1), 'date', 'required'))}${fld('Time', 'time', inp('time', '11:00', 'time', 'required'))}${fld('Purpose', 'purpose', sel('purpose', ['Progress inspection', 'Measurement / survey', 'Quality check', 'Contractor coordination', 'Client walkthrough', 'Snag inspection'].map(x => [x, x])), true)}</div>${foot('Schedule', 'Appears in the supervisor app and calendar')}</form>`;
  H.F.visit = fd => { const v = { id: H.uid('v'), code: H.nextVisitCode(), project: fd.project, by: fd.by, date: fd.date, time: fd.time, purpose: fd.purpose, status: 'Scheduled', photos: 0, obs: [], present: [], seed: Math.floor(Math.random() * 900) }; db().visits.push(v); H.log(S.user, `Scheduled ${v.code} (${fd.purpose}) for ${H.name(fd.by)}`, fd.project); done(`${v.code} scheduled for ${H.fd(v.date)}`); };

  // ---------- change request ----------
  H.newChange = f => {
    const d = db(), n = Math.max(...d.changes.map(c => +c.no.split('-')[1])) + 1;
    const c = { id: H.uid('cr'), no: 'CR-' + n, project: f.project, title: f.title, raisedBy: f.raisedBy || 'Client', status: 'Raised', cost: 0, days: 0, drawings: [], tasks: [], materials: [], note: f.note || '', date: H.TODAY, log: [{ date: H.TODAY, text: `Raised by ${(f.raisedBy || 'client').toLowerCase()}${f.via ? ' via ' + f.via : ''}` }] };
    d.changes.unshift(c);
    H.notify('Approval', `Change request ${c.no} raised on ${H.P(c.project).name}: ${c.title}`, 'project-' + c.project, true);
    H.log(H.P(c.project).pm, `Change request ${c.no} raised: ${c.title}`, c.project);
    return c;
  };
  H.Modal.change = m => `<h2>Change request</h2><p class="muted small" style="margin:4px 0 14px">Nothing changes on site until cost and time impact are estimated, the owner approves and the client accepts.</p><form data-form="change"><div class="fgrid">${fld('Project', 'project', sel('project', projL(), m.project))}${fld('Raised by', 'raisedBy', sel('raisedBy', [['Client', 'Client'], ['Design team', 'Design team'], ['Site', 'Site team'], ['Contractor', 'Contractor']]))}${fld('What should change', 'title', inp('title', '', 'text', 'required placeholder="e.g. Convert study into walk-in wardrobe"'), true)}${fld('Details', 'note', ta('note', ''), true)}</div>${foot('Raise change')}</form>`;
  H.F.change = fd => { const c = H.newChange(fd); goto('project-' + c.project); S.ui.tab['p-' + c.project] = 'changes'; done(`${c.no} raised — goes to review`, 'cr-' + c.id); };

  // ---------- drawing upload / revision ----------
  H.Modal.drawing = m => {
    if (m.revise) {
      const x = db().drawings.find(d => d.id === m.revise);
      return `<h2>Upload revision R${x.rev + 1}</h2><p class="muted small" style="margin:4px 0 14px">${esc(x.no)} · ${esc(x.title)} · ${esc(H.P(x.project).name)}. R${x.rev} will be marked superseded; site keeps seeing the last IFC until this one is issued.</p><form data-form="drawing"><input type="hidden" name="revise" value="${x.id}"><div class="fgrid">${fld('File', 'file', `<input class="in" id="f-file" name="file" type="file" accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png">`, true)}${fld('What changed', 'note', ta('note', x.comments ? 'Addressed: ' + x.comments : '', 3, 'required'), true)}</div>${foot('Submit for review')}</form>`;
    }
    return `<h2>Upload drawing / render</h2><form data-form="drawing" style="margin-top:12px"><div class="fgrid">${fld('Project', 'project', sel('project', projL(), m.project))}${fld('Discipline', 'disc', sel('disc', [['AR', 'Architectural'], ['ID', 'Interior'], ['EL', 'Electrical'], ['PL', 'Plumbing'], ['HV', 'HVAC'], ['FU', 'Furniture / joinery'], ['3D', '3D visual']]))}${fld('Title', 'title', inp('title', '', 'text', 'required placeholder="e.g. Master bedroom wardrobe elevation"'), true)}${fld('Type', 'kind', sel('kind', [['2D', '2D drawing'], ['3D', '3D render']]))}${fld('Reviewer', 'reviewer', sel('reviewer', db().employees.filter(e => ['pm', 'architect', 'designer'].includes(e.kind)).map(e => [e.id, e.name]), 'e1'))}${fld('File', 'file', `<input class="in" id="f-file" name="file" type="file" accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png">`, true)}</div>${foot('Upload & submit')}</form>`;
  };
  H.F.drawing = (fd, f) => {
    const file = f.querySelector('[name=file]').files[0];
    if (fd.revise) {
      const x = db().drawings.find(d => d.id === fd.revise);
      x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status: 'Superseded', by: S.user, note: 'Superseded by R' + (x.rev + 1) });
      x.rev += 1; x.comments = ''; x.submitted = H.TODAY; x.file = file ? file.name : x.file;
      x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status: 'Internal Review', by: S.user, note: fd.note + (file ? ` (${file.name})` : '') }); x.status = 'Internal Review';
      H.auto('r3', `Reviewer ${H.name(x.reviewer)} notified: ${x.title} R${x.rev} (${H.P(x.project).name})`);
      H.log(S.user, `Uploaded ${x.no} R${x.rev}`, x.project);
      return done(`R${x.rev} submitted — ${H.name(x.reviewer)} notified`, 'dwg-' + x.id);
    }
    const p = H.P(fd.project), n = db().drawings.filter(d => d.project === p.id).length + 1;
    const x = { id: H.uid('d'), no: `${p.code.slice(4)}-${fd.disc}-${String(n).padStart(3, '0')}`, title: (fd.kind === '3D' && !/^3D/.test(fd.title) ? '3D render — ' : '') + fd.title, disc: fd.disc, project: p.id, designer: S.user.startsWith('e') ? S.user : p.designer, rev: 0, status: 'Internal Review', submitted: H.TODAY, reviewer: fd.reviewer, comments: '', kind: fd.kind, file: file ? file.name : '', history: [{ rev: 'R0', date: H.TODAY, status: 'Internal Review', by: S.user, note: 'First issue' + (file ? ` (${file.name})` : '') }] };
    db().drawings.push(x);
    H.auto('r3', `Reviewer ${H.name(x.reviewer)} notified: ${x.title} (${p.name})`);
    H.notify('Approval', `${x.title} submitted for review`, 'drawings', true);
    S.ui.f.dst = 'pending'; S.ui.f.dproj = 'all'; goto('drawings');
    done(`${x.no} uploaded — ${H.name(x.reviewer)} asked to review`, 'dwg-' + x.id);
  };

  // ---------- meeting ----------
  H.Modal.meeting = m => `<h2>New meeting</h2><form data-form="meeting" style="margin-top:12px"><div class="fgrid">${fld('Title', 'title', inp('title', m.title || '', 'text', 'required'), true)}${fld('Type', 'type', sel('type', ['Client meeting', 'Internal review', 'Contractor coordination', 'Site walkthrough', 'Consultation'].map(x => [x, x])))}${fld('Project', 'project', sel('project', [['', '— None —']].concat(projL()), m.project))}${fld('Date', 'date', inp('date', H.D(1), 'date', 'required'))}${fld('Time', 'time', inp('time', '15:00', 'time', 'required'))}${fld('Duration (min)', 'dur', inp('dur', 60, 'number', 'min="15" step="15"'))}${fld('Where', 'where', sel('where', ['Studio, Paschim Vihar', 'Site', 'Video call', 'Client office'].map(x => [x, x])))}<div class="full"><span class="f" style="display:block;font-size:13px;color:var(--muted);margin-bottom:4px">Attendees</span><div class="chips">${db().employees.filter(e => e.id !== 'e0' || S.role === 'owner').map(e => `<label class="chk" style="border:1px solid var(--line);border-radius:8px;padding:2px 8px;min-height:32px"><input type="checkbox" name="p_${e.id}"${['e1', 'e3'].includes(e.id) ? ' checked' : ''}> ${esc(e.name.split(' ')[0])}</label>`).join('')}</div></div></div>${foot('Create meeting', 'Invites go out once calendar sync is connected')}</form>`;
  H.F.meeting = fd => { const people = Object.keys(fd).filter(k => k.startsWith('p_')).map(k => k.slice(2)); const ev = { id: H.uid('ev'), title: fd.title, type: fd.type, date: fd.date, time: fd.time, dur: +fd.dur || 60, project: fd.project, people, where: fd.where }; db().events.push(ev); H.log(S.user, `Scheduled “${ev.title}” on ${H.fd(ev.date)}`, ev.project); done('Meeting added to the calendar'); };

  // ---------- invoice ----------
  H.Modal.invoice = m => {
    const pid = m.project || (H.active().find(p => (p.milestones || []).some(x => !x.invoiced)) || {}).id;
    const p = H.P(pid), ms = (p.milestones || []).filter(x => !x.invoiced);
    return `<h2>Raise invoice</h2><form data-form="invoice" style="margin-top:12px"><div class="fgrid">${fld('Project', 'project', sel('project', H.active().map(x => [x.id, x.name]), pid, 'data-chg="inv-proj"'))}${fld('Milestone', 'ms', sel('ms', ms.map((x, i) => [i, `${x.name} — ${H.inr(x.amount)}`]).concat([['custom', 'Other amount']])))}${fld('Taxable amount (₹, if other)', 'amount', inp('amount', '', 'number', 'min="0"'))}${fld('Payment terms', 'terms', sel('terms', [['7', '7 days'], ['15', '15 days'], ['30', '30 days']], '15'))}</div><p class="small muted" style="margin-top:10px">GST at 18% (CGST + SGST for Delhi). Invoice number ${esc(H.nextInvNo())}. In production this posts to Tally / Zoho Books and sends from accounts after approval.</p>${foot('Raise invoice')}</form>`;
  };
  H.Cg['inv-proj'] = el => { S.ui.modal.project = el.value; H.render(); };
  H.F.invoice = fd => {
    const p = H.P(fd.project); let name, taxable;
    if (fd.ms === 'custom' || fd.ms == null) { name = 'Additional work'; taxable = +fd.amount || 0; } else { const m = p.milestones.filter(x => !x.invoiced)[+fd.ms]; m.invoiced = true; name = m.name; taxable = m.amount; }
    if (!taxable) { H.toast('Enter an amount'); return; }
    const gst = Math.round(taxable * 0.18), i = { id: H.uid('i'), no: H.nextInvNo(), project: p.id, milestone: name, taxable, gst, total: taxable + gst, raised: H.TODAY, due: H.D(+fd.terms), paid: 0, reminders: [] };
    db().invoices.push(i); H.log(S.user, `Raised ${i.no} for ${H.inr(i.total)}`, p.id); H.notify('Payment', `Invoice ${i.no} (${H.lk(i.total)}) raised to ${H.CL(p.client).name}`, 'finance');
    goto('finance'); S.ui.tab.fin = 'recv'; done(`${i.no} raised for ${H.inr(i.total)}`, 'inv-' + i.id);
  };

  // ---------- payment ----------
  H.Modal.payment = m => {
    const i = db().invoices.find(x => x.id === m.inv);
    return `<h2>Record payment</h2><p class="muted small" style="margin:4px 0 14px">${esc(i.no)} · ${esc(H.P(i.project).name)} · outstanding ${H.inr(H.invOut(i))}</p><form data-form="payment"><input type="hidden" name="inv" value="${i.id}"><div class="fgrid">${fld('Amount (₹)', 'amount', inp('amount', H.invOut(i), 'number', 'min="1" required'))}${fld('Date received', 'date', inp('date', H.TODAY, 'date', 'required'))}${fld('Mode', 'mode', sel('mode', ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].map(x => [x, x])))}${fld('UTR / cheque no.', 'ref', inp('ref', '', 'text', 'required'))}<div class="full"><label class="chk"><input type="checkbox" name="verified" checked> Matched with the bank statement</label><p class="small muted">Unticked, the payment stays “unverified” and is not counted as received.</p></div></div>${foot('Record payment')}</form>`;
  };
  H.F.payment = fd => {
    const i = db().invoices.find(x => x.id === fd.inv), amt = +fd.amount, ok = !!fd.verified;
    const x = { id: H.uid('pay'), invoice: i.id, project: i.project, amount: amt, date: fd.date, mode: fd.mode, ref: fd.ref, verified: ok, verifiedBy: ok ? S.user : '', source: ok ? 'Bank reconciliation' : 'Recorded by ' + H.first(S.user) };
    db().payments.push(x); if (ok) i.paid = Math.min(i.total, i.paid + amt);
    H.log(S.user, `Recorded ${H.inr(amt)} against ${i.no}${ok ? ' (bank-matched)' : ' (awaiting bank match)'}`, i.project);
    done(ok ? (H.invStatus(i) === 'Paid' ? `${i.no} fully paid` : `${H.inr(amt)} received; ${H.inr(H.invOut(i))} still due`) : 'Recorded as unverified — not counted until matched', 'inv-' + i.id);
  };

  // ---------- reminder ----------
  H.reminderText = i => { const p = H.P(i.project), c = H.CL(p.client), late = -H.dif(i.due); return `Dear ${c.contact.split(' ')[0]} ji,\n\nA gentle reminder that invoice ${i.no} for ${p.name} (${i.milestone}) of ${H.inr(H.invOut(i))} was due on ${H.fdy(i.due)}${late > 0 ? ` — now ${late} days past due` : ''}. You can pay by bank transfer or UPI from your client portal; please share the UTR once done.\n\nWork at site is progressing as per plan and we want to keep it that way. Thank you for your support.\n\nAccounts, Hands On Design\n${db().company.phone.split(' · ')[0]}`; };
  H.Modal.reminder = m => {
    const i = db().invoices.find(x => x.id === m.inv);
    return `<h2>Payment reminder</h2><p class="muted small" style="margin:4px 0 14px">${esc(i.no)} · ${esc(H.CL(H.P(i.project).client).name)} · ${i.reminders.length} sent before</p><form data-form="reminder"><input type="hidden" name="inv" value="${i.id}"><div class="fgrid">${fld('Channel', 'channel', sel('channel', [['WhatsApp + email', 'WhatsApp + email'], ['Email', 'Email only'], ['WhatsApp', 'WhatsApp only']]))}${fld('Escalation level', 'level', sel('level', [['1', 'Polite reminder'], ['2', 'Firm reminder (copy PM)'], ['3', 'Owner call + hold next stage']], String(Math.min(3, i.reminders.length + 1))))}${fld('Message (drafted from the invoice record)', 'msg', ta('msg', H.reminderText(i), 9), true)}</div>${foot('Approve & send', 'Queued — needs the WhatsApp/email integration to deliver')}</form>`;
  };
  H.F.reminder = fd => {
    const i = db().invoices.find(x => x.id === fd.inv);
    i.reminders.push({ date: H.TODAY, channel: fd.channel, note: ['', 'Polite reminder', 'Firm reminder, PM copied', 'Owner call; next stage on hold'][+fd.level] + ' (approved by ' + H.first(S.user) + ')' });
    H.auto('r8', `Reminder ${i.reminders.length} for ${i.no} (${H.P(i.project).name}) approved by ${H.name(S.user)} — queued via ${fd.channel}`, 'Queued');
    if (fd.level === '3') db().tasks.push({ id: H.uid('t'), title: `Call ${H.CL(H.P(i.project).client).contact} about ${i.no}`, project: i.project, assignee: 'e0', status: 'Not Started', priority: 'High', due: H.TODAY, created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Finance', who: 'e' });
    H.log(S.user, `Sent reminder ${i.reminders.length} for ${i.no}`, i.project);
    done('Reminder approved and queued', 'inv-' + i.id);
  };

  // ---------- document ----------
  H.Modal.doc = m => `<h2>Upload document</h2><form data-form="doc" style="margin-top:12px"><div class="fgrid">${fld('Project', 'project', sel('project', db().projects.map(p => [p.id, p.name]), m.project))}${fld('Type', 'type', sel('type', ['Contract', 'Proposal', 'BOQ', 'Approval', 'Finance', 'Warranty', 'Manual', 'As-built', 'Survey', 'Other'].map(x => [x, x])))}${fld('Name', 'name', inp('name', '', 'text', 'required placeholder="e.g. Kitchen appliance warranties"'), true)}${fld('Who can see it', 'access', sel('access', [['Internal', 'Internal only'], ['Internal + client', 'Internal + client'], ['Internal + contractors', 'Internal + contractors']]))}${fld('File', 'file', `<input class="in" id="f-file" name="file" type="file">`)}</div>${foot('Upload', 'Same name → new version; old one superseded')}</form>`;
  H.F.doc = (fd, f) => {
    const file = f.querySelector('[name=file]').files[0], d = db();
    const prev = d.docs.filter(x => x.project === fd.project && x.name.toLowerCase() === fd.name.toLowerCase());
    prev.forEach(x => x.status = 'Superseded');
    d.docs.unshift({ id: H.uid('doc'), project: fd.project, name: fd.name, type: fd.type, ver: 'v' + (prev.length + 1), by: S.user, date: H.TODAY, access: fd.access, status: 'Current', file: file ? file.name : '' });
    H.log(S.user, `Uploaded document “${fd.name}”${file ? ' (' + file.name + ')' : ''}`, fd.project);
    done(prev.length ? `Saved as v${prev.length + 1}; previous version superseded` : 'Document uploaded');
  };

  // ---------- recovery plan for a delayed activity ----------
  H.Modal.recovery = m => {
    const a = db().activities.find(x => x.id === m.act), p = H.P(a.project), c = H.C(a.contractor);
    const late = Math.max(0, -H.dif(a.pe)), alt = db().contractors.find(x => x.trade === (c || {}).trade && x.id !== a.contractor);
    const deps = db().activities.filter(x => x.dep === a.id);
    return `<h2>Recovery plan — ${esc(a.name)}</h2><p class="muted small" style="margin:4px 0 14px">${esc(p.name)} · ${esc(c ? c.name : 'Unassigned')} · ${a.prog}% done, planned finish ${H.fd(a.pe)}${late ? ` (${late} days late)` : ''}. ${deps.length ? 'Blocks: ' + deps.map(x => esc(x.name)).join(', ') + '.' : ''}</p>
<form data-form="recovery"><input type="hidden" name="act" value="${a.id}"><div class="stack">${[['crew', `Add a second crew${alt ? ' from ' + alt.name : ''} for the remaining ${100 - a.prog}%`], ['hours', 'Extended hours and Sunday working until back on plan'], ['seq', `Start ${deps[0] ? esc(deps[0].name.toLowerCase()) : 'the next activity'} in areas already finished`]].map(([v, l], i) => `<label class="chk" style="border:1px solid var(--line);border-radius:10px;padding:8px 10px"><input type="checkbox" name="o_${v}"${i < 2 ? ' checked' : ''}> ${l}</label>`).join('')}</div><div class="fgrid" style="margin-top:12px">${fld('Committed finish', 'commit', inp('commit', H.D(Math.max(3, Math.round((100 - a.prog) / 12))), 'date', 'required'))}${fld('Escalate to', 'esc', sel('esc', [['e1', 'Project manager'], ['e0', 'Owner']], 'e1'))}</div>${foot('Issue plan to contractor', 'Creates a dated commitment task and daily check')}</form>`;
  };
  H.F.recovery = fd => {
    const a = db().activities.find(x => x.id === fd.act), p = H.P(a.project);
    const opts = [fd.o_crew && 'second crew', fd.o_hours && 'extended hours', fd.o_seq && 'parallel start in finished areas'].filter(Boolean);
    a.note = `Recovery plan: ${opts.join(', ') || 'contractor to propose'}; commit ${H.fd(fd.commit)}`; a.recovery = { date: H.TODAY, commit: fd.commit, opts };
    db().tasks.push({ id: H.uid('t'), title: `Recovery commitment — finish ${a.name.toLowerCase()} by ${H.fd(fd.commit)}`, project: p.id, assignee: a.contractor, status: 'In Progress', priority: 'High', due: fd.commit, created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, needEvidence: true, category: 'Site', who: 'c', activity: a.id, hist: [{ date: H.TODAY, text: 'Issued: ' + opts.join(', '), by: S.user }] });
    db().tasks.push({ id: H.uid('t'), title: `Daily progress check — ${a.name.toLowerCase()}`, project: p.id, assignee: p.site, status: 'Not Started', priority: 'High', due: H.D(1), created: H.TODAY, updated: H.TODAY, blocked: '', evidence: 0, category: 'Site', who: 'e' });
    H.auto('r5', `Recovery plan issued to ${H.name(a.contractor)} for ${a.name} (${p.name}); escalation to ${H.name(fd.esc)} if not on plan in 2 days`);
    H.log(S.user, `Issued recovery plan for ${a.name}: ${opts.join(', ')}`, p.id);
    done('Recovery plan issued — contractor notified, daily check scheduled');
  };

  // ---------- automation rule builder ----------
  H.Modal.rule = () => `<h2>New automation rule</h2><form data-form="rule" style="margin-top:12px"><div class="fgrid">${fld('Name', 'name', inp('name', '', 'text', 'required placeholder="e.g. Material delivery tomorrow → remind site"'), true)}${fld('When', 'trigger', sel('trigger', ['Lead not contacted in 24 hours', 'Drawing waiting for client > 3 days', 'Material need-by date in 2 days and not dispatched', 'Contractor bill submitted', 'Site visit not submitted by 7 pm', 'Client hasn’t logged into portal for 14 days', 'Project margin falls below 20%'].map(x => [x, x]), '', ''), true)}${fld('Then', 'action', sel('action', ['Notify owner of record', 'Notify project manager', 'Create task for owner of record', 'Send WhatsApp template to client', 'Escalate to owner', 'Add to owner’s daily briefing'].map(x => [x, x])), true)}${fld('Escalate after (days, 0 = never)', 'esc', inp('esc', 2, 'number', 'min="0" max="30"'))}<div><label class="chk" style="margin-top:22px"><input type="checkbox" name="gate"> Needs human approval before acting</label></div></div>${foot('Create rule')}</form>`;
  H.F.rule = fd => { const r = { id: H.uid('r'), name: fd.name, trigger: fd.trigger, action: fd.action, esc: +fd.esc || 0, gate: !!fd.gate, on: true, runs: 0, fails: 0 }; db().rules.push(r); done('Rule created and switched on', 'rule-' + r.id); };
})();
