/* Guided demo scenarios: each step changes real records, switches interface and highlights the result */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic;
  const to = (role, route, extra) => {
    S.role = role; S.user = H.ROLES[role].user; S.ui.drawer = null; S.ui.modal = null; S.ui.pop = null; S.ui.side = false;
    if (route) { S.ui.route = route; try { if (location.hash.slice(1) !== route) history.replaceState(null, '', '#' + route); } catch (e) { /* sandbox */ } }
    if (extra) extra();
  };
  const A = (name, id, v) => H.A[name]({ dataset: { id, v } });
  const fin = (msg, hl) => { H.save(); if (hl) H.hl(hl); H.render(); if (msg) H.toast(msg); window.scrollTo(0, 0); if (hl) setTimeout(() => { const el = document.querySelector(`[data-k="${hl}"]`); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60); };
  const sc = () => S.ui.scen;
  const ctx = () => (S.ui.scen.ctx = S.ui.scen.ctx || {});

  const LIST = [
    {
      id: 'enquiry', t: 'New client enquiry', d: 'Website enquiry → scored & assigned → consultation → proposal → project created.', steps: [
        ['Enquiry arrives from handsondesign.in', 'A family fills the website form. Rule 1 creates the lead, scores it and assigns an owner with a call due within 2 hours — no WhatsApp forwarding.', 'Receive enquiry', () => {
          to('owner', 'leads'); const l = H.newLead({ name: 'Kavya & Nikhil Bedi', phone: '+91 98110 45672', source: 'Website', type: '4BHK apartment', location: 'Rajouri Garden, New Delhi', area: 2400, budget: 6500000, service: 'Turnkey interiors', notes: 'Possession in January; warm modern interiors; two children’s rooms' });
          ctx().lead = l.id; S.ui.drawer = { type: 'lead', id: l.id }; fin(`Lead scored ${l.score} and assigned to ${H.name(l.owner)}`, 'lead-' + l.id);
        }],
        ['Call made, consultation booked', 'Simran logs the call and books a studio consultation. The calendar and the lead history update; a WhatsApp confirmation is queued.', 'Log call & book', () => { to('owner', 'leads'); const id = ctx().lead; H.A['lead-call']({ dataset: { id } }); H.A['lead-consult']({ dataset: { id } }); S.ui.drawer = { type: 'lead', id }; fin('Consultation booked for tomorrow 11:30', 'lead-' + id); }],
        ['Site visit done, proposal generated', 'After the consultation and a site visit, the proposal (design fee, execution estimate, timeline) is generated from the lead record.', 'Generate proposal', () => { to('owner', 'leads'); const l = db().leads.find(x => x.id === ctx().lead); l.stage = 'Site Visit'; H.A['lead-proposal']({ dataset: { id: l.id } }); S.ui.drawer = { type: 'lead', id: l.id }; fin('Proposal ' + l.proposal.no + ' ready', 'lead-' + l.id); }],
        ['Client signs — project created', 'Marking the lead won converts it into a project with a client record, survey visit and onboarding tasks (rule 2).', 'Convert to project', () => { const l = db().leads.find(x => x.id === ctx().lead); l.stage = 'Won'; const pid = H.convertLead(l.id); to('owner', 'project-' + pid); fin('Project created with survey visit and onboarding tasks'); }]
      ]
    },
    {
      id: 'design', t: 'Design approval', d: 'Revised 3D render → internal review → client approves in the portal → next stage released.', steps: [
        ['Designer uploads the revision', 'Saffron Table’s client asked for changes to the dining-hall render. Devansh uploads R2; R1 is marked superseded and the reviewer is notified (rule 3).', 'Upload revision', () => {
          const x = db().drawings.find(d => d.project === 'p4' && d.status === 'Revision Required') || db().drawings.find(d => d.project === 'p4' && d.status === 'Internal Review');
          ctx().dwg = x.id; to('designer', 'drawings', () => { S.ui.f.dst = 'pending'; S.ui.f.dproj = 'p4'; });
          if (x.status === 'Revision Required') { x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status: 'Superseded', by: 'e8', note: 'Superseded by R' + (x.rev + 1) }); x.rev += 1; x.comments = ''; x.submitted = H.TODAY; x.history.push({ rev: 'R' + x.rev, date: H.TODAY, status: 'Internal Review', by: 'e8', note: 'Warmer lighting, banquette fabric changed to client’s choice' }); x.status = 'Internal Review'; H.auto('r3', `Reviewer ${H.name(x.reviewer)} notified: ${x.title} R${x.rev} (Saffron Table)`); }
          S.ui.drawer = { type: 'drawing', id: x.id }; fin(`R${x.rev} uploaded — reviewer notified`, 'dwg-' + x.id);
        }],
        ['PM approves internally', 'The project manager checks it against the brief and releases it to the client portal. The client gets a WhatsApp/email alert (queued in the demo).', 'Approve & send to client', () => { to('pm', 'drawings', () => { S.ui.f.dst = 'pending'; S.ui.f.dproj = 'p4'; }); A('dwg-int-ok', ctx().dwg); S.ui.drawer = { type: 'drawing', id: ctx().dwg }; fin('Sent to the client portal', 'dwg-' + ctx().dwg); }],
        ['Client approves in the portal', 'Gaurav (Saffron Table) sees the render with its revision number and approves with one tap. The approval is timestamped in the drawing history.', 'Open client portal & approve', () => { to('client', null, () => { S.clientId = 'cl4'; S.ui.tab.cp = 'home'; }); H.approveDrawing(ctx().dwg, 'Client'); fin('Approved by client — next stage released'); }],
        ['Next stage released automatically', 'Rule 4 released the next stage and created the IFC task for the team. Every step is in the automation log and the drawing’s audit trail.', 'See the result', () => { to('owner', 'automation'); fin('Rule 4 fired — see the log'); }]
      ]
    },
    {
      id: 'site', t: 'Site monitoring', d: 'Supervisor visit on mobile → electrical work found incomplete → contractor task & PM alert.', steps: [
        ['Supervisor checks in at Kapoor Residence', 'Rakesh opens the site app on his phone. He checks in with location consent — no GPS tracking, only visit confirmation.', 'Check in', () => {
          let v = db().visits.find(x => x.project === 'p1' && x.by === 'e9' && x.status === 'Scheduled');
          if (!v) { v = { id: H.uid('v'), code: H.nextVisitCode(), project: 'p1', by: 'e9', date: H.TODAY, time: '11:00', status: 'Scheduled', photos: 0, obs: [], present: [], seed: 321 }; db().visits.push(v); }
          ctx().visit = v.id; to('site', null, () => { S.ui.site = { tab: 'visit', visit: v.id, offline: false, report: null }; });
          const dr = v.dr || (v.dr = { consent: false, ci: null, prog: {}, photos: [], obs: [], done: '', pending: '', next: '' }); dr.consent = true; dr.ci = new Date().toTimeString().slice(0, 5); fin('Checked in — location confirmed');
        }],
        ['Progress and photos recorded', 'He moves the progress sliders for the active work packages and takes photos. (On a real phone this opens the camera.)', 'Record progress & photos', () => {
          const v = db().visits.find(x => x.id === ctx().visit), dr = v.dr; to('site');
          db().activities.filter(a => a.project === 'p1' && a.prog > 0 && a.prog < 100 && a.contractor !== 'c1').forEach(a => { dr.prog[a.id] = Math.min(100, a.prog + 5); });
          ['Lounge ceiling', 'Kitchen', 'Master bedroom'].forEach((n, i) => dr.photos.push({ name: n, seed: 140 + i * 13 }));
          dr.done = 'Kitchen base units fixed; carpentry team on wardrobe shutters'; dr.next = 'Volt Electricals to add a second crew from tomorrow'; fin('Progress and 3 photos added');
        }],
        ['Electrical work found incomplete', 'He logs an observation against Volt Electricals: conduits in the lounge and dining ceiling are not done, so the ceiling team can’t start. “Create task” is ticked.', 'Log observation', () => {
          const v = db().visits.find(x => x.id === ctx().visit); to('site');
          v.dr.obs.push({ text: 'Electrical conduits incomplete in lounge & dining ceiling — 14 points pending; false ceiling cannot start', kind: 'Incomplete work', sev: 'High', contractor: 'c1', due: H.D(2), task: true, status: 'Open' });
          v.dr.pending = 'Lounge & dining ceiling conduits pending — blocks false ceiling'; fin('Observation added');
        }],
        ['Report submitted — tasks created automatically', 'On submit, rule 6 builds the visit report, the contractor gets a task with a due date, and the PM is alerted. Nobody has to call anyone.', 'Submit report', () => { const v = db().visits.find(x => x.id === ctx().visit); H.submitVisit(v); to('site', null, () => { S.ui.site.report = v.id; S.ui.site.visit = null; }); fin('Report submitted — PM notified'); }],
        ['What the contractor sees', 'Volt Electricals sees the new work order in their portal, with the visit reference. Completion needs photos and triggers an inspection (rule 7).', 'Open contractor portal', () => { to('contractor', null, () => { S.contractorId = 'c1'; S.ui.tab.ct = 'work'; }); const t = db().tasks.filter(x => x.assignee === 'c1' && x.fromVisit).pop(); fin('New work order in the contractor portal', t ? 'ctask-' + t.id : null); }]
      ]
    },
    {
      id: 'escalate', t: 'Delayed contractor escalation', d: 'Electrical 6 days late → escalated → recovery plan → contractor commits a date.', steps: [
        ['The delay is visible on the schedule', 'Electrical conduiting at Kapoor Residence is 6 days late and blocks the false ceiling (critical path). Rule 5 already reminded the contractor and escalated to the PM.', 'Escalate to owner', () => { to('pm', 'project-p1', () => { S.ui.tab['p-p1'] = 'schedule'; }); A('task-escalate', 't1'); to('pm', 'project-p1', () => { S.ui.tab['p-p1'] = 'schedule'; }); fin('Escalated to the owner'); }],
        ['PM issues a recovery plan', 'Second crew plus extended hours, with a committed finish date. It becomes a dated task for the contractor and a daily check for the site supervisor.', 'Issue recovery plan', () => { to('pm', 'project-p1', () => { S.ui.tab['p-p1'] = 'tasks'; }); H.F.recovery({ act: 'a6', o_crew: 'on', o_hours: 'on', commit: H.D(4), esc: 'e0' }); }],
        ['Contractor commits in the portal', 'Rajinder (Volt Electricals) records the reason and commits a date with 4 extra workers. The PM is notified; missing it again escalates automatically.', 'Commit as contractor', () => { to('contractor', null, () => { S.contractorId = 'c1'; S.ui.tab.ct = 'work'; }); S.ui.modal = null; H.F['ct-commit']({ task: 't1', date: H.D(4), crew: '4', why: 'Conduit pipes delivered late; second crew deployed from tomorrow' }); }],
        ['Owner sees it without a phone call', 'The briefing and the decisions list now carry the escalation and the commitment.', 'Open owner dashboard', () => { to('owner', 'dashboard'); fin('Escalation visible in the briefing', 'brief'); }]
      ]
    },
    {
      id: 'payment', t: 'Overdue payment reminder', d: 'Invoice 12 days late → drafted reminder approved → client shares UTR → bank-matched.', steps: [
        ['Rule 8 drafted a reminder', 'Luxe Living’s invoice is overdue. The system drafted a reminder from the invoice record and is holding it for approval — money messages never go out on their own.', 'Approve reminder', () => {
          const i = db().invoices.find(x => x.project === 'p7' && H.invStatus(x) === 'Overdue'); ctx().inv = i.id;
          to('owner', 'finance', () => { S.ui.tab.fin = 'recv'; });
          const l = db().autolog.find(x => x.rule === 'r8' && x.status === 'Awaiting approval'); if (l) { l.status = 'Success'; l.text = l.text.replace('awaiting accounts approval', 'approved and sent'); }
          H.F.reminder({ inv: i.id, channel: 'WhatsApp + email', level: String(Math.min(3, i.reminders.length + 1)) });
        }],
        ['Client pays and shares the UTR', 'Pooja (Luxe Living) pays by NEFT and enters the UTR in her portal. It shows as “being verified”, not paid.', 'Pay as client', () => { const i = db().invoices.find(x => x.id === ctx().inv); to('client', null, () => { S.clientId = 'cl7'; S.ui.tab.cp = 'pay'; }); H.F['cl-pay']({ inv: i.id, amount: H.invOut(i), mode: 'NEFT', ref: 'UTR 9921 4410 2087' }); }],
        ['Accounts matches the bank entry', 'Only after matching with the bank statement is the money counted as received. In production this comes from bank-statement import or Tally.', 'Match bank entry', () => { to('owner', 'finance', () => { S.ui.tab.fin = 'pay'; }); const x = db().payments.filter(p => p.invoice === ctx().inv && !p.verified).pop(); H.verifyPayment(x.id); fin('Payment verified — invoice settled', 'pay-' + x.id); }]
      ]
    },
    {
      id: 'change', t: 'Client design change', d: 'Client request → impact on cost, time, drawings → owner & client approve → everything updates.', steps: [
        ['Client asks for a change in the portal', 'Vikram Sharma wants the study converted into a walk-in wardrobe. It becomes a formal change request, not a phone call.', 'Raise as client', () => { to('client', null, () => { S.clientId = 'cl2'; S.ui.tab.cp = 'home'; }); const c = H.newChange({ project: 'p2', title: 'Convert study into a walk-in wardrobe', raisedBy: 'Client', via: 'client portal', note: 'Keep the window; add mirror and lighting' }); ctx().cr = c.id; fin(`${c.no} raised`); }],
        ['Architect estimates the impact', 'The team reviews it and records cost and time impact plus affected drawings, tasks and materials.', 'Estimate impact', () => { const c = db().changes.find(x => x.id === ctx().cr); to('pm', 'project-p2', () => { S.ui.tab['p-p2'] = 'changes'; }); c.status = 'Under review'; c.log.push({ date: H.TODAY, text: 'Architect review started' }); H.crEstimate(c); fin(`Impact: +${H.lk(c.cost)}, +${c.days} days`, 'cr-' + c.id); }],
        ['Owner approves the commercials', 'It appears in the owner’s decision list. Approving sends it to the client.', 'Approve as owner', () => { to('owner', 'dashboard'); A('cr-owner-approve', ctx().cr); to('owner', 'dashboard'); fin('Sent to the client for acceptance', 'decisions'); }],
        ['Client accepts digitally', 'The client sees the revised cost and handover date and accepts (e-signature in production).', 'Accept as client', () => { const c = db().changes.find(x => x.id === ctx().cr); to('client', null, () => { S.clientId = 'cl2'; S.ui.tab.cp = 'home'; }); H.crApprove(c); c.log.push({ date: H.TODAY, text: 'Accepted digitally by client in portal' }); fin('Change accepted'); }],
        ['Budget, schedule and drawings update', 'Contract value and handover date are updated, affected drawings are reopened for revision and a task is created for the designer (rule 9).', 'See the project', () => { to('owner', 'project-p2', () => { S.ui.tab['p-p2'] = 'changes'; }); fin('Contract, dates and drawings updated', 'cr-' + ctx().cr); }]
      ]
    },
    {
      id: 'owner', t: 'Owner daily review', d: 'Briefing → approve a bill → ask the copilot → rebalance work → weekly report.', steps: [
        ['Morning briefing', 'Everything that needs Rohit Ji’s attention, computed from records, with links to the source.', 'Open briefing', () => { to('owner', 'dashboard'); fin('', 'brief'); }],
        ['Approve a contractor bill', 'Measurements were verified by the site engineer; the owner approves in one click.', 'Approve bill', () => { to('owner', 'dashboard'); const b = db().bills.find(x => x.status === 'PM verified'); if (b) A('bill-approve', b.id); fin(b ? `${b.no} approved` : 'No bills waiting', 'decisions'); }],
        ['Ask the copilot', 'Plain-language questions answered from records, with sources.', 'Ask two questions', () => { to('owner', 'ai'); S.ui.chat = []; H.F.ask({ q: 'Which project is likely to miss handover?' }); H.F.ask({ q: 'Which payments are overdue?' }); }],
        ['Rebalance workload', 'Move a task from an overloaded designer to someone with capacity.', 'Reassign a task', () => {
          to('owner', 'team'); const w = H.workload(), o = w.filter(x => x.util > 110).sort((a, b) => b.util - a.util)[0], u = o && w.filter(x => x.util < 60 && x.e.loc !== 'Leave' && x.e.dept === o.e.dept).sort((a, b) => a.util - b.util)[0];
          const t = o && u && db().tasks.find(x => x.assignee === o.e.id && !H.done(x) && x.status === 'Not Started');
          if (t) { A('reassign', t.id, u.e.id); fin(`Moved “${t.title}” to ${u.e.name}`); } else fin('Workload already balanced');
        }],
        ['Weekly report in one click', 'The client report is drafted from this week’s records. Copy it, or send after approval once email/WhatsApp is connected.', 'Draft weekly report', () => { to('owner', 'reports', () => { S.ui.f.rproj = 'p1'; }); fin('Weekly report drafted', null); setTimeout(() => { const el = document.getElementById('wkrep'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80); }]
      ]
    },
    {
      id: 'handover', t: 'Final handover', d: 'Snag list closed → handover documents → client acceptance → final invoice & warranty follow-up.', steps: [
        ['Handover checklist generated', 'Rule 10 generated the snag list and handover checklist for Verma Duplex, due in 6 days.', 'Open handover', () => { to('pm', 'project-p6', () => { S.ui.tab['p-p6'] = 'handover'; }); fin(''); }],
        ['Snags fixed and reinspected', 'Contractors fix the snags with photos; the site engineer reinspects and closes each one.', 'Close snags', () => { to('pm', 'project-p6', () => { S.ui.tab['p-p6'] = 'handover'; }); db().snags.filter(s => s.project === 'p6' && s.handover && s.status !== 'Closed').forEach(s => { s.status = 'Closed'; H.log('e11', `Reinspected & closed: ${s.text}`, 'p6'); }); fin('All final snags closed'); }],
        ['Handover documents uploaded', 'As-built drawings, warranties and equipment manuals are uploaded and shared with the client.', 'Upload documents', () => { to('pm', 'project-p6', () => { S.ui.tab['p-p6'] = 'handover'; }); A('ho-docs', 'p6'); }],
        ['Client accepts in the portal', 'Anil Verma walks through, ticks acceptance and signs digitally.', 'Accept as client', () => { to('client', null, () => { S.clientId = 'cl6'; S.ui.tab.cp = 'home'; }); const p = H.P('p6'); p.accepted = true; H.log('e1', `${H.CL(p.client).name} accepted handover digitally in the portal`, 'p6'); fin('Handover accepted by client'); }],
        ['Project closed', 'The final invoice is raised, the project moves to completed, and a defects-liability check is scheduled.', 'Close project', () => { to('owner', 'project-p6', () => { S.ui.tab['p-p6'] = 'handover'; }); H.closeProject('p6'); fin('Closed — final invoice raised, warranty check scheduled'); }]
      ]
    },
    {
      id: 'model3d', t: '3D design review with the client', d: 'Interactive 3D model → shared in the portal → client explores it and approves.', steps: [
        ['Designer opens the 3D model', 'Devansh opens the living-room concept for Mehra Farmhouse in the Design Studio. Anyone can orbit, zoom and pan it; .glb models from SketchUp, 3ds Max or Blender open the same way.', 'Open Design Studio', () => { to('designer', 'design', () => { S.ui.f.d3proj = 'p5'; }); fin('Drag the model to look around'); }],
        ['Share it with the client', 'After internal review, the model is shared in the client portal with a WhatsApp alert. It becomes a revision-tracked sheet like any drawing.', 'Share with client', () => { to('pm', 'design', () => { S.ui.f.d3proj = 'p5'; }); ctx().dwg = H.V3D.sendToClient('p5'); fin('Shared in the client portal', 'dwg-' + ctx().dwg); }],
        ['Client explores it in 3D', 'Rajiv Mehra opens his portal and walks around the room on his phone or laptop before approving.', 'Open as client', () => { to('client', null, () => { S.clientId = 'cl5'; S.ui.tab.cp = 'home'; S.ui.modal = { type: 'v3dview', id: ctx().dwg }; }); fin(''); }],
        ['Client approves the design', 'One tap records the approval with date and revision; rule 4 releases the next stage.', 'Approve as client', () => { to('client', null, () => { S.clientId = 'cl5'; S.ui.tab.cp = 'designs'; }); H.approveDrawing(ctx().dwg, 'Client'); fin('Approved — next stage released'); }]
      ]
    },
    {
      id: 'invoice', t: 'GST invoice in one minute', d: 'Invoice designer → milestone billed with GST → issued → client sees and pays it.', steps: [
        ['Open the invoice designer', 'The next billing milestone of Aurum Capital Office is pre-filled with SAC code, place of supply and IGST (Gurugram is inter-state).', 'Open designer', () => { S.ui.invd = null; to('owner', 'invoice-new-p3'); fin('Live A4 preview on the right'); }],
        ['Issue the invoice', 'Issuing numbers it, adds it to receivables and the client portal, and marks the milestone as billed. Print or save as PDF from the same screen.', 'Issue invoice', () => { to('owner', 'invoice-new-p3'); H.A['inv-issue'](); }],
        ['Client sees it in the portal', 'Aurum’s admin head sees the invoice with its total, due date and payment options.', 'Open client portal', () => { to('client', null, () => { S.clientId = 'cl3'; S.ui.tab.cp = 'pay'; }); fin(''); }]
      ]
    }
  ];
  H.Scen = {
    list: LIST,
    panel: () => {
      const s = sc();
      if (s === 'menu') return `<div class="guide" role="dialog" aria-label="Demo scenarios"><div class="row between"><h3>Demo scenarios</h3><button class="btn icon sm" data-act="scen-exit" aria-label="Close">${ic('x')}</button></div><p>Each scenario changes real records step by step and switches between the owner, team, site, client and contractor views.</p><div class="stack" style="margin-top:10px;max-height:58vh;overflow:auto">${LIST.map((x, i) => `<button class="btn" style="width:100%;justify-content:flex-start;text-align:left;height:auto;padding:9px 12px;white-space:normal" data-act="scen-start" data-id="${x.id}"><span><b style="font-weight:600">${i + 1}. ${esc(x.t)}</b><br><span class="small" style="color:var(--charmuted)">${esc(x.d)}</span></span></button>`).join('')}</div><p class="small" style="margin-top:10px;color:var(--charmuted)">Settings → Demo data resets everything.</p></div>`;
      const x = LIST.find(l => l.id === s.id), st = x.steps[s.step];
      if (!st) return `<div class="guide" role="dialog" aria-label="${esc(x.t)}"><div class="stp">Scenario complete</div><h3>${esc(x.t)}</h3><p>All steps ran against the live demo records. Look around — every change is in the activity log, notifications and automation log.</p><div class="row" style="margin-top:12px"><button class="btn gold" data-act="scen-menu">More scenarios</button><button class="btn" data-act="scen-exit">Close</button></div></div>`;
      return `<div class="guide" role="dialog" aria-label="${esc(x.t)}"><div class="row between"><span class="stp">Step ${s.step + 1} of ${x.steps.length}</span><button class="btn icon sm" data-act="scen-exit" aria-label="Close">${ic('x')}</button></div><h3>${esc(x.t)}: ${esc(st[0])}</h3><p>${esc(st[1])}</p><ol>${x.steps.map((y, i) => `<li class="${i < s.step ? 'done' : i === s.step ? 'on' : ''}">${esc(y[0])}</li>`).join('')}</ol><div class="row" style="margin-top:12px"><button class="btn gold" data-act="scen-run">${ic('play')}${esc(st[2])}</button><button class="btn" data-act="scen-menu">All scenarios</button></div></div>`;
    }
  };
  Object.assign(H.A, {
    'scen-menu': () => { S.ui.pop = null; S.ui.scen = 'menu'; H.render(); },
    'scen-exit': () => { S.ui.scen = null; H.render(); },
    'scen-start': a => { S.ui.scen = { id: a.dataset.id, step: 0, ctx: {} }; H.render(); },
    'scen-run': () => {
      const s = sc(), x = LIST.find(l => l.id === s.id), st = x.steps[s.step];
      s.step += 1;
      try { st[3](); } catch (err) { console.error(err); s.step -= 1; H.render(); H.toast('This step needs the starting data — reset the demo in Settings and run again'); }
    }
  });
})();
