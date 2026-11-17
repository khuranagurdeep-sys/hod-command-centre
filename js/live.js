/* Live layer: simulated real-time activity, activity feed, and the Ctrl/⌘+K command palette */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;
  const L = H.Live = { on: true, n: 0, timer: null };
  try { L.on = localStorage.getItem('hod-live') !== 'off'; } catch (e) { /* storage unavailable */ }

  const ago = a => { if (a.date !== H.TODAY) return H.rel(a.date); const [h, m] = (a.time || '00:00').split(':').map(Number), now = new Date(), mins = now.getHours() * 60 + now.getMinutes() - (h * 60 + m); return mins <= 0 ? 'just now' : mins < 60 ? mins + ' min ago' : Math.floor(mins / 60) + ' h ago'; };
  L.pill = small => `<button class="live${L.on ? '' : ' off'}" data-act="live-toggle" title="${L.on ? 'Live updates on: click to pause' : 'Live updates paused: click to resume'}"><i></i>${L.on ? 'Live' : 'Paused'}</button>`;
  L.feed = n => { const A = db().activity.slice(0, n || 8); return A.length ? `<div class="feed">${A.map((a, k) => `<div class="${a.fresh && k < 2 ? 'new' : ''}">${H.av(a.who)}<div class="li-main"><div class="t">${esc(a.text)}</div><div class="s">${esc(H.name(a.who))}${a.project ? ' · ' + esc(H.P(a.project).name) : ''} · ${ago(a)}</div></div></div>`).join('')}</div>` : R.empty('No activity yet.'); };

  // scripted events that arrive while the demo is open (sample data, nothing financial changes)
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const EVENTS = [
    () => { const v = pick(db().visits.filter(x => x.status === 'Scheduled' && x.date === H.TODAY)) || pick(db().visits); return [v.by, `Checked in at ${H.P(v.project).name} — location confirmed`, v.project, 'Site']; },
    () => { const t = pick(db().tasks.filter(x => H.isCon(x.assignee) && !H.done(x))); return t ? [t.assignee, `Uploaded ${2 + Math.floor(Math.random() * 5)} progress photos for “${t.title}”`, t.project, 'Site'] : null; },
    () => { const x = pick(db().drawings.filter(d => d.status === 'Client Review')); if (!x) return null; const cl = H.CL(H.P(x.project).client); return [x.designer, `${cl.contact.split(' (')[0]} opened “${x.title}” in the client portal`, x.project, 'Client']; },
    () => { const p = pick(H.active().filter(x => x.stage === 'execution')); return [p.site, `Daily labour count: ${10 + Math.floor(Math.random() * 14)} workers on site`, p.id, null]; },
    () => { const m = pick(db().materials.filter(x => ['PO issued', 'In transit'].includes(x.stage))); return m ? ['e13', `Vendor dispatch update: ${m.item} — expected ${H.fd(H.addDays(m.needBy, -1))}`, m.project, 'Material'] : null; },
    () => { const p = pick(H.active()), c = H.CL(p.client); return [p.pm, `WhatsApp from ${c.contact.split(' (')[0]}: “${pick(['Can we move the meeting to Saturday?', 'Please share this week’s photos', 'Loved the latest render!', 'When will the kitchen be installed?'])}”`, p.id, 'Client']; },
    () => { const e = pick(db().employees.filter(x => ['designer', 'visualiser', 'drafter', 'architect'].includes(x.kind))); const t = pick(db().tasks.filter(x => x.assignee === e.id && !H.done(x))); return t ? [e.id, `Updated “${t.title}” — ${pick(['70% done', 'sent for review', 'working on revisions', 'shared draft with PM'])}`, t.project, null] : null; },
    () => { if (L.n > 6 || Math.random() > .35) return null; const nm = pick(['Ananya Bhatia', 'Rohan Gupta', 'Mehak Arora', 'Sameer Khanna', 'Tanvi Malhotra']), src = pick(['Instagram', 'Website', 'WhatsApp']); const l = H.newLead({ name: nm, phone: '+91 98' + Math.floor(10000000 + Math.random() * 89999999), source: src, type: pick(['3BHK apartment', 'Café fit-out', 'Villa interiors', 'Office floor']), location: pick(['Dwarka', 'Rajouri Garden', 'Gurugram', 'Punjabi Bagh']), area: 1400 + Math.floor(Math.random() * 3000), budget: (25 + Math.floor(Math.random() * 60)) * 1e5, service: 'Turnkey interiors' }); return ['__done', `New ${src} enquiry: ${l.name} (score ${l.score})`, '', 'Client']; }
  ];
  L.tick = () => {
    if (!L.on || !S.session || document.hidden) return;
    let ev = null; for (let k = 0; k < 4 && !ev; k++) ev = pick(EVENTS)();
    if (!ev) return;
    L.n++;
    const [who, text, project, kind] = ev;
    if (who !== '__done') H.log(who, text, project);
    const a = db().activity[0]; if (a) a.fresh = true; db().activity.slice(1, 4).forEach(x => { x.fresh = false; });
    if (kind === 'Client' && Math.random() < .5) H.notify(kind, text, project ? 'project-' + project : 'leads');
    H.save();
    // update in place so nobody loses their place, focus or scroll
    const f = document.getElementById('feed'); if (f) f.innerHTML = L.feed(7);
    const b = document.querySelector('[aria-label="Notifications"]'); if (b) { const n = db().notes.filter(x => !x.read).length; let sp = b.querySelector('span'); if (!sp && n) { sp = document.createElement('span'); sp.style.cssText = 'position:absolute;top:3px;right:3px;background:var(--bad);color:#fff;border-radius:10px;font-size:10.5px;font-weight:700;padding:0 5px;line-height:16px'; b.appendChild(sp); } if (sp) sp.textContent = n; }
    if (!S.ui.modal && !S.ui.drawer && !S.ui.cmdk && !S.ui.lb && ['owner', 'pm'].includes(S.role)) H.toast(text.length > 90 ? text.slice(0, 88) + '…' : text);
  };
  L.start = () => { if (L.timer) clearInterval(L.timer); L.timer = setInterval(L.tick, 24000); };
  H.A['live-toggle'] = () => { L.on = !L.on; try { localStorage.setItem('hod-live', L.on ? 'on' : 'off'); } catch (e) { /* ignore */ } H.render(); H.toast(L.on ? 'Live updates on' : 'Live updates paused'); };
  setTimeout(L.start, 4000);

  // ---------- command palette ----------
  const MODS = () => H.NAV.flatMap(([, items]) => items).filter(([k]) => H.can(k)).map(([k, l, i]) => ({ g: 'Go to', l, i, go: k }));
  const ACTS = () => [
    { g: 'Create', l: 'New client enquiry', i: 'funnel', act: 'modal', id: 'lead' },
    S.role !== 'designer' && { g: 'Create', l: 'Design an invoice', i: 'rupee', go: 'invoice-new' },
    { g: 'Create', l: 'New task', i: 'check', act: 'modal', id: 'task' },
    { g: 'Create', l: 'Schedule site visit', i: 'pin', act: 'modal', id: 'visit' },
    { g: 'Create', l: 'Upload 3D model or render', i: 'layers', go: 'design' },
    { g: 'Create', l: 'Change request', i: 'refresh', act: 'modal', id: 'change' },
    { g: 'Demo', l: 'Run a demo scenario', i: 'play', act: 'scen-menu' },
    { g: 'Demo', l: 'Open client portal', i: 'users', act: 'role', id: 'client' },
    { g: 'Demo', l: 'Open site supervisor app', i: 'phone', act: 'role', id: 'site' },
    { g: 'Demo', l: 'Open contractor portal', i: 'hammer', act: 'role', id: 'contractor' }
  ].filter(Boolean);
  const RECS = q => {
    const d = db(), out = [];
    d.projects.forEach(p => { if ((p.name + p.code + p.location + p.type).toLowerCase().includes(q)) out.push({ g: 'Projects', l: p.name, s: p.code + ' · ' + H.stageName(p.stage), img: H.cover(p.id), go: 'project-' + p.id }); });
    if (S.role !== 'designer') d.invoices.forEach(i => { if ((i.no + H.P(i.project).name + i.milestone).toLowerCase().includes(q)) out.push({ g: 'Invoices', l: i.no, s: H.P(i.project).name + ' · ' + H.lk(i.total) + ' · ' + H.invStatus(i), i: 'rupee', go: 'invoice-' + i.id }); });
    d.drawings.forEach(x => { if ((x.no + x.title).toLowerCase().includes(q)) out.push({ g: 'Drawings', l: x.title, s: x.no + ' · ' + x.status, i: 'layers', act: 'drawer', type: 'drawing', id: x.id }); });
    d.clients.forEach(c => { if ((c.name + c.contact).toLowerCase().includes(q)) out.push({ g: 'Clients', l: c.name, s: c.contact, i: 'users', go: 'clients' }); });
    d.employees.forEach(e => { if ((e.name + e.role).toLowerCase().includes(q)) out.push({ g: 'People', l: e.name, s: e.role, i: 'team', act: 'drawer', type: 'employee', id: e.id }); });
    d.contractors.forEach(c => { if ((c.name + c.trade).toLowerCase().includes(q)) out.push({ g: 'Contractors', l: c.name, s: c.trade, i: 'hammer', act: 'drawer', type: 'contractor', id: c.id }); });
    d.leads.forEach(l => { if ((l.name + l.type + l.location).toLowerCase().includes(q)) out.push({ g: 'Leads', l: l.name, s: l.type + ' · ' + l.stage, i: 'funnel', act: 'lead-open', id: l.id }); });
    return out;
  };
  const items = q => { q = (q || '').trim().toLowerCase(); const base = ACTS().concat(MODS()); return q ? base.filter(x => x.l.toLowerCase().includes(q)).concat(RECS(q)).slice(0, 40) : base; };
  const row = (x, k) => { const attrs = x.go ? `data-go="${x.go}"` : `data-act="${x.act}"${x.id ? ` data-id="${x.id}"` : ''}${x.type ? ` data-type="${x.type}"` : ''}`; return `<button ${attrs} data-cmdk="${k}" class="${k === (S.ui.cmdk.sel || 0) ? 'sel' : ''}">${x.img ? `<img src="${x.img}" alt="" style="width:36px;height:24px;object-fit:cover;border-radius:6px">` : ic(x.i || 'arrow')}<span class="li-main"><span class="t" style="display:block">${esc(x.l)}</span>${x.s ? `<span class="s" style="display:block">${esc(x.s)}</span>` : ''}</span></button>`; };
  const list = q => { const L2 = items(q); let g = '', h = ''; L2.forEach((x, k) => { if (x.g !== g) { g = x.g; h += `<div class="grp">${esc(g)}</div>`; } h += row(x, k); }); return h || `<div class="grp" style="padding:16px">No results for “${esc(q)}”.</div>`; };
  (H.extraOverlays = H.extraOverlays || []).push(() => S.ui.cmdk ? `<div class="mscrim" data-act="cmdk-close"></div><div class="cmdk" role="dialog" aria-label="Command palette"><span class="ico">${ic('search')}</span><input id="cmdk-in" value="${esc(S.ui.cmdk.q || '')}" placeholder="Search or jump to… projects, invoices, people, actions" data-inp="cmdk" autocomplete="off" aria-label="Command search"><div class="res" id="cmdk-res">${list(S.ui.cmdk.q)}</div><div class="small muted" style="padding:8px 14px;border-top:1px solid var(--line)"><span class="kbd">↑</span> <span class="kbd">↓</span> to move · <span class="kbd">Enter</span> to open · <span class="kbd">Esc</span> to close</div></div>` : '');
  (H.afterRender = H.afterRender || []).push(() => { if (S.ui.cmdk) { const i = document.getElementById('cmdk-in'); if (i && document.activeElement !== i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } });
  H.I.cmdk = el => { S.ui.cmdk.q = el.value; S.ui.cmdk.sel = 0; const r = document.getElementById('cmdk-res'); if (r) r.innerHTML = list(el.value); };
  const open = () => { if (!S.session || ['site', 'client', 'contractor'].includes(S.role)) return; S.ui.cmdk = { q: '', sel: 0 }; S.ui.pop = null; H.render(); };
  H.A['cmdk-open'] = open;
  H.A['cmdk-close'] = () => { S.ui.cmdk = null; H.render(); };
  document.addEventListener('click', e => { if (S.ui.cmdk && e.target.closest('[data-cmdk]')) { setTimeout(() => { if (S.ui.cmdk) { S.ui.cmdk = null; H.render(); } }, 0); } if (e.target.closest('.search .kbd')) open(); }, true);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (S.ui.cmdk) { S.ui.cmdk = null; H.render(); } else open(); return; }
    if (!S.ui.cmdk) return;
    const btns = Array.from(document.querySelectorAll('#cmdk-res [data-cmdk]'));
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); S.ui.cmdk = null; H.render(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); S.ui.cmdk.sel = Math.max(0, Math.min(btns.length - 1, (S.ui.cmdk.sel || 0) + (e.key === 'ArrowDown' ? 1 : -1))); btns.forEach((b, k) => b.classList.toggle('sel', k === S.ui.cmdk.sel)); const s = btns[S.ui.cmdk.sel]; if (s) s.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); const b = btns[S.ui.cmdk.sel || 0]; if (b) b.click(); }
  }, true);
})();
