/* Pro features: BOQ estimator, client material selections, concept→render slider, NCR site map,
   capacity heatmap, WhatsApp previews, spoken briefing and the auto-play guided tour */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;
  const inr0 = n => '₹' + Math.round(n).toLocaleString('en-IN');

  // =================== BOQ & ESTIMATES ===================
  // sample Delhi-NCR rates for the demo (replace with the studio's own rate library)
  const LIB = [
    ['C1', 'Civil & flooring', 'Brickwork 115 mm partition', 'sq ft', 95], ['C2', 'Civil & flooring', 'Vitrified tiles 600×1200, laid', 'sq ft', 165], ['C3', 'Civil & flooring', 'Italian marble flooring, polished', 'sq ft', 520], ['C4', 'Civil & flooring', 'Engineered oak flooring', 'sq ft', 380], ['C5', 'Civil & flooring', 'Bathroom tiling & waterproofing', 'sq ft', 240],
    ['F1', 'False ceiling', 'Gypsum false ceiling with cove', 'sq ft', 110], ['F2', 'False ceiling', 'Wooden slat ceiling feature', 'sq ft', 420],
    ['E1', 'Electrical & lighting', 'Point wiring with modular switches', 'point', 1350], ['E2', 'Electrical & lighting', 'COB downlights, warm white', 'nos', 1250], ['E3', 'Electrical & lighting', 'Decorative pendant / chandelier', 'nos', 18000], ['E4', 'Electrical & lighting', 'Profile lighting', 'rft', 650],
    ['W1', 'Carpentry & joinery', 'Wardrobe, laminate finish', 'sq ft', 1650], ['W2', 'Carpentry & joinery', 'Wardrobe, veneer / PU finish', 'sq ft', 2250], ['W3', 'Carpentry & joinery', 'Modular kitchen, base + wall units', 'rft', 9500], ['W4', 'Carpentry & joinery', 'TV & storage unit', 'sq ft', 1450], ['W5', 'Carpentry & joinery', 'Fluted wall panelling', 'sq ft', 650], ['W6', 'Carpentry & joinery', 'Bar / service counter', 'rft', 14500], ['W7', 'Carpentry & joinery', 'Banquette seating, upholstered', 'rft', 7800],
    ['P1', 'Paint & finishes', 'Premium emulsion, 2 coats', 'sq ft', 32], ['P2', 'Paint & finishes', 'Lime-plaster texture feature wall', 'sq ft', 160], ['P3', 'Paint & finishes', 'Designer wallpaper, fixed', 'roll', 4500],
    ['G1', 'Glass & aluminium', '12 mm toughened glass partition', 'sq ft', 650], ['G2', 'Glass & aluminium', 'Shower enclosure', 'nos', 38000],
    ['U1', 'Furniture & décor', 'Custom 3-seater sofa', 'nos', 85000], ['U2', 'Furniture & décor', '6-seater dining table with chairs', 'set', 145000], ['U3', 'Furniture & décor', 'King bed with storage', 'nos', 110000], ['U4', 'Furniture & décor', 'Restaurant chairs', 'nos', 9500], ['U5', 'Furniture & décor', 'Restaurant tables, stone top', 'nos', 16500], ['U6', 'Furniture & décor', 'Curtains & blinds', 'sq ft', 180],
    ['S1', 'Services', 'Split AC supply & installation', 'TR', 42000], ['S2', 'Services', 'Plumbing & CP fittings', 'bathroom', 145000]
  ];
  const ITEM = c => LIB.find(x => x[0] === c);
  const CATS = [...new Set(LIB.map(x => x[1]))];
  const CATC = ['#1E4A40', '#B48C55', '#5E8C7E', '#C9774F', '#8A9AA6', '#D9B984', '#3B6B5E', '#9A6A3E', '#6E7F8C'];
  const TPL = {
    villa: { label: 'Villa / large home', rooms: [['Living & dining', [['C3', 900], ['F1', 900], ['E1', 38], ['E2', 34], ['E3', 2], ['W4', 90], ['W5', 160], ['P1', 2600], ['U1', 2], ['U2', 1], ['U6', 220]]], ['Kitchen', [['C2', 220], ['W3', 26], ['E1', 16], ['E2', 10], ['P1', 600]]], ['Master suite', [['C4', 420], ['F1', 420], ['W2', 160], ['E1', 18], ['E2', 14], ['P2', 140], ['U3', 1], ['U6', 120], ['S2', 1], ['G2', 1]]], ['Bedrooms (3)', [['C4', 900], ['F1', 900], ['W1', 330], ['E1', 42], ['E2', 30], ['P1', 2700], ['U3', 3], ['S2', 3]]], ['Services', [['S1', 14]]]] },
    apartment: { label: '3BHK apartment', rooms: [['Living & dining', [['C2', 520], ['F1', 520], ['E1', 22], ['E2', 18], ['E3', 1], ['W4', 60], ['P1', 1500], ['U1', 1], ['U2', 1], ['U6', 140]]], ['Kitchen', [['C2', 110], ['W3', 18], ['E1', 10], ['P1', 350]]], ['Bedrooms (3)', [['C4', 520], ['F1', 520], ['W1', 260], ['E1', 30], ['E2', 18], ['P1', 2100], ['U3', 3], ['S2', 2]]], ['Services', [['S1', 6]]]] },
    restaurant: { label: 'Restaurant / café', rooms: [['Dining hall', [['C2', 1600], ['F2', 600], ['F1', 1000], ['E1', 60], ['E2', 70], ['E3', 8], ['E4', 140], ['W7', 85], ['W5', 260], ['P2', 420], ['U4', 110], ['U5', 28]]], ['Bar & service', [['W6', 24], ['G1', 120], ['E1', 18]]], ['Kitchen & back of house', [['C5', 600], ['E1', 40], ['P1', 1500]]], ['Washrooms', [['C5', 260], ['S2', 3]]], ['Services', [['S1', 22]]]] }
  };
  const est = () => { const d = db(); if (!d.estimates) { const mk = (id, no, title, client, ref, area, tpl, status, date) => ({ id, no, title, client, ref, area, tpl, status, date, margin: 22, cont: 5, fee: 8, disc: 0, rooms: TPL[tpl].rooms.map(([n, it]) => ({ n, items: it.map(([c, q]) => ({ c, q, r: ITEM(c)[4] })) })) }); d.estimates = [mk('es1', 'EST-2611', 'Pillai Villa — turnkey interiors', 'Nisha Pillai', 'l16', 2848 * 2, 'villa', 'Shared with client', H.D(-3)), mk('es2', 'EST-2612', 'Divya Menon — restaurant fit-out', 'Divya Menon', 'l20', 4231, 'restaurant', 'Draft', H.D(-1)), mk('es3', 'EST-2613', 'Malhotra Villa — budget estimate', 'Deepak Malhotra', 'p11', 7500, 'villa', 'Internal review', H.D(-6))]; } return d.estimates; };
  H.BOQ = {};
  H.BOQ.calc = e => {
    const byCat = {}; let sub = 0; e.rooms.forEach(r => r.items.forEach(it => { const v = (+it.q || 0) * (+it.r || 0), cat = ITEM(it.c)[1]; byCat[cat] = (byCat[cat] || 0) + v; sub += v; }));
    const cont = sub * (+e.cont || 0) / 100, fee = (sub + cont) * (+e.fee || 0) / 100, before = sub + cont + fee - (+e.disc || 0), gst = before * .18, total = before + gst;
    const cost = sub / (1 + (+e.margin || 0) / 100);
    return { byCat, sub, cont, fee, before, gst, total, cost, profit: before - cost - fee * .55, psf: e.area ? before / e.area : 0 };
  };
  const sumHtml = e => {
    const c = H.BOQ.calc(e), own = S.role === 'owner', rows = Object.entries(c.byCat).sort((a, b) => b[1] - a[1]);
    return `<div class="kv" style="margin-top:0"><div>Built-up area<b>${(+e.area || 0).toLocaleString('en-IN')} sq ft</b></div><div>Rate<b>${inr0(c.psf)}/sq ft</b></div></div>
${R.donut(rows.map(([k, v]) => [k, v, CATC[CATS.indexOf(k) % CATC.length], H.lk(v)]), H.lk(c.before), 'before GST')}
<div class="tw" style="margin-top:14px;box-shadow:none"><table><tbody><tr><td>Works & supply</td><td class="num">${inr0(c.sub)}</td></tr><tr><td>Contingency ${e.cont}%</td><td class="num">${inr0(c.cont)}</td></tr><tr><td>Design & PMC fee ${e.fee}%</td><td class="num">${inr0(c.fee)}</td></tr>${+e.disc ? `<tr><td>Discount</td><td class="num">− ${inr0(+e.disc)}</td></tr>` : ''}<tr><td>GST 18%</td><td class="num">${inr0(c.gst)}</td></tr><tr><td><b>Total to client</b></td><td class="num"><b style="font:800 17px var(--display)">${inr0(c.total)}</b></td></tr></tbody></table></div>
${own ? `<div class="callout small" style="margin-top:12px"><b>Owner only:</b> estimated cost ${H.lk(c.cost)} · gross margin ${H.lk(c.profit)} (${Math.round(c.profit / Math.max(1, c.before) * 100)}%) at ${e.margin}% mark-up on works.</div>` : ''}`;
  };
  H.V.estimates = param => {
    const L = est();
    if (param) {
      const e = L.find(x => x.id === param); if (!e) return R.empty('Estimate not found.');
      return `<div class="pagehead"><div><div class="eyebrow"><a class="lnk" href="#estimates" data-go="estimates">Estimates & BOQ</a> / ${esc(e.no)}</div><h1>${esc(e.title)}</h1><p>${esc(e.client)} · ${esc(TPL[e.tpl].label)} · ${H.pill(e.status)} · rates from the studio rate library (sample values)</p></div><div class="row"><button class="btn" data-act="boq-share" data-id="${e.id}">${ic('send')}Share with client</button><button class="btn pri" data-act="boq-quote" data-id="${e.id}">${ic('doc')}Create quotation</button></div></div>
<div class="grid g21" style="align-items:start"><div class="stack">${e.rooms.map((r, ri) => `<div class="card" style="padding:0;overflow:hidden"><div class="hd" style="padding:14px 18px;margin:0;border-bottom:1px solid var(--line);background:var(--panel2)"><h2 style="font-size:15px">${esc(r.n)}</h2><span class="small muted" id="boq-r${ri}">${inr0(r.items.reduce((s, it) => s + it.q * it.r, 0))}</span></div><div class="tw" style="border:0;border-radius:0;box-shadow:none"><table><thead><tr><th>Item</th><th>Unit</th><th class="num" style="width:110px">Qty</th><th class="num" style="width:130px">Rate ₹</th><th class="num">Amount</th></tr></thead><tbody>${r.items.map((it, ii) => { const li = ITEM(it.c); return `<tr><td><b style="font-weight:600">${esc(li[2])}</b><div class="small muted">${esc(li[1])} · ${li[0]}</div></td><td class="small">${li[3]}</td><td><input class="in" style="min-height:34px;text-align:right" type="number" min="0" value="${it.q}" data-inp="boq" data-e="${e.id}" data-r="${ri}" data-i="${ii}" data-k="q" aria-label="Quantity"></td><td><input class="in" style="min-height:34px;text-align:right" type="number" min="0" value="${it.r}" data-inp="boq" data-e="${e.id}" data-r="${ri}" data-i="${ii}" data-k="r" aria-label="Rate"></td><td class="num" id="boq-${ri}-${ii}">${inr0(it.q * it.r)}</td></tr>`; }).join('')}</tbody></table></div><div style="padding:10px 14px;border-top:1px solid var(--line)"><select class="in" style="max-width:420px;min-height:36px;font-size:13.5px" data-chg="boq-add" data-e="${e.id}" data-r="${ri}" aria-label="Add item"><option value="">+ Add item from rate library…</option>${CATS.map(c => `<optgroup label="${esc(c)}">${LIB.filter(x => x[1] === c).map(x => `<option value="${x[0]}">${esc(x[2])} — ₹${x[4].toLocaleString('en-IN')}/${x[3]}</option>`).join('')}</optgroup>`).join('')}</select></div></div>`).join('')}</div>
<div class="card" style="position:sticky;top:76px"><div class="hd"><h2>Estimate summary</h2><span class="pill gold">${esc(e.no)}</span></div><div id="boq-sum">${sumHtml(e)}</div>
<div class="fgrid" style="margin-top:14px">${[['area', 'Area (sq ft)'], ['cont', 'Contingency %'], ['fee', 'Design & PMC %'], ['disc', 'Discount ₹']].concat(S.role === 'owner' ? [['margin', 'Mark-up on works %']] : []).map(([k, l]) => `<div><label class="f">${l}</label><input class="in" type="number" min="0" value="${e[k]}" data-inp="boqf" data-e="${e.id}" data-k="${k}"></div>`).join('')}</div></div></div>`;
    }
    const tot = L.reduce((s, e) => s + H.BOQ.calc(e).total, 0);
    return `<div class="pagehead"><div><h1>Estimates & BOQ: ${L.length} live estimates worth ${H.lk(tot)}</h1><p>Room-by-room bills of quantities from the studio’s rate library: cost, margin and a client quotation in minutes, then the budget and contractor work orders for the project.</p></div><div class="row">${Object.entries(TPL).map(([k, t]) => `<button class="btn${k === 'villa' ? ' pri' : ''}" data-act="boq-new" data-v="${k}">${ic('plus')}${esc(t.label)}</button>`).join('')}</div></div>
<div class="pcards">${L.map(e => { const c = H.BOQ.calc(e); return `<a class="pcard" href="#estimates-${e.id}" data-go="estimates-${e.id}"><div class="pimg" style="aspect-ratio:16/7"><img class="ph" src="${H.photoUrl(e.tpl === 'restaurant' ? 'dining_booths' : e.tpl === 'villa' ? 'bed_jaali' : 'bed_suite')}" alt="" loading="lazy">${H.pill(e.status)}<span class="code">${esc(e.no)}</span></div><div class="pbody"><b>${esc(e.title)}</b><div class="small muted" style="margin-top:-4px">${esc(e.client)} · ${(+e.area).toLocaleString('en-IN')} sq ft · ${H.fd(e.date)}</div><div class="row between"><span class="small muted">${e.rooms.reduce((s, r) => s + r.items.length, 0)} line items</span><b style="font:800 18px var(--display)">${H.lk(c.total)}</b></div></div></a>`; }).join('')}</div>
<div class="sect">Rate library <span class="muted">${LIB.length} items · sample Delhi NCR rates</span></div>
<div class="tw"><table class="stack"><thead><tr><th>Code</th><th>Item</th><th>Category</th><th>Unit</th><th class="num">Rate</th></tr></thead><tbody>${LIB.map(x => `<tr><td class="small muted">${x[0]}</td><td>${esc(x[2])}</td><td class="small">${esc(x[1])}</td><td class="small">${x[3]}</td><td class="num">${inr0(x[4])}</td></tr>`).join('')}</tbody></table></div>`;
  };
  const findE = id => est().find(x => x.id === id);
  H.I.boq = el => { const e = findE(el.dataset.e), it = e.rooms[+el.dataset.r].items[+el.dataset.i]; it[el.dataset.k] = +el.value || 0; const c = document.getElementById(`boq-${el.dataset.r}-${el.dataset.i}`); if (c) c.textContent = inr0(it.q * it.r); const rr = document.getElementById('boq-r' + el.dataset.r); if (rr) rr.textContent = inr0(e.rooms[+el.dataset.r].items.reduce((s, x) => s + x.q * x.r, 0)); const sm = document.getElementById('boq-sum'); if (sm) sm.innerHTML = sumHtml(e); H.save(); };
  H.I.boqf = el => { const e = findE(el.dataset.e); e[el.dataset.k] = +el.value || 0; const sm = document.getElementById('boq-sum'); if (sm) sm.innerHTML = sumHtml(e); H.save(); };
  H.Cg['boq-add'] = el => { if (!el.value) return; const e = findE(el.dataset.e), li = ITEM(el.value); e.rooms[+el.dataset.r].items.push({ c: li[0], q: 1, r: li[4] }); H.commit(`${li[2]} added`); };
  Object.assign(H.A, {
    'boq-new': a => { const L = est(), t = a.dataset.v, n = 2611 + L.length; const e = { id: H.uid('es'), no: 'EST-' + n, title: `New ${TPL[t].label.toLowerCase()} estimate`, client: 'New client', ref: '', area: t === 'restaurant' ? 2400 : t === 'villa' ? 5200 : 1850, tpl: t, status: 'Draft', date: H.TODAY, margin: 22, cont: 5, fee: 8, disc: 0, rooms: TPL[t].rooms.map(([nm, it]) => ({ n: nm, items: it.map(([c, q]) => ({ c, q, r: ITEM(c)[4] })) })) }; L.unshift(e); H.save(); H.go('estimates-' + e.id); H.toast('Estimate created from the template — adjust quantities'); },
    'boq-share': a => { const e = findE(a.dataset.id); e.status = 'Shared with client'; H.log(S.user, `Shared estimate ${e.no} (${H.lk(H.BOQ.calc(e).total)}) with ${e.client}`, ''); H.commit('Shared — the client gets a WhatsApp link to review it'); },
    'boq-quote': a => {
      const e = findE(a.dataset.id), c = H.BOQ.calc(e), p = e.ref && e.ref[0] === 'p' ? H.P(e.ref) : H.active().find(x => x.stage === 'survey') || H.active()[0];
      const k = (c.before) / Math.max(1, c.sub + c.cont + c.fee - (+e.disc || 0) + 0);
      const items = Object.entries(c.byCat).map(([cat, v]) => ({ d: cat, sub: e.title, sac: '9954', q: 1, rate: Math.round(v * (1 + (+e.cont || 0) / 100)) }));
      items.push({ d: 'Design & project management', sub: `${e.fee}% of works`, sac: '998391', q: 1, rate: Math.round(c.fee) });
      S.ui.invd = { key: 'new', type: 'Quotation', project: p.id, date: H.TODAY, due: H.D(30), pos: 'Delhi', inter: false, gst: 18, disc: +e.disc || 0, notes: `${e.no}: ${e.title} for ${e.client}. Detailed room-wise BOQ attached. Valid for 30 days; rates subject to final measurement.`, items, ms: '' };
      e.status = 'Quotation drafted'; H.save(); H.go('invoice-new'); H.toast('Quotation drafted from the BOQ — review and save');
    }
  });

  // =================== CLIENT MATERIAL SELECTIONS ===================
  const SEL = [
    ['Flooring', [['Statuario marble', 'marble', '#F3F1EE'], ['Oak engineered wood', 'wood', '#B8875A'], ['Grey terrazzo', 'terrazzo', '#D9D6CF']]],
    ['Kitchen shutters', [['Matte sage acrylic', 'solid', '#7F9A86'], ['Walnut veneer', 'wood', '#6B4A33'], ['Ivory lacquer', 'solid', '#EFE8DA']]],
    ['Wardrobe finish', [['Fluted oak', 'flute', '#C49A6C'], ['Charcoal laminate', 'solid', '#3A3D3C'], ['Fabric-wrapped panels', 'fabric', '#C8B9A3']]],
    ['Feature wall', [['Lime-plaster texture', 'plaster', '#D8CDBD'], ['Evergreen paint', 'solid', '#2E5A4F'], ['Terracotta paint', 'solid', '#C9774F']]],
    ['Countertop', [['Calacatta quartz', 'marble', '#F6F4F0'], ['Black granite', 'granite', '#2A2A2A'], ['Ivory terrazzo', 'terrazzo', '#E6E0D6']]],
    ['Hardware', [['Brushed brass', 'metal', '#B48C55'], ['Matte black', 'solid', '#1D1F1E'], ['Satin nickel', 'metal', '#A9ADAE']]]
  ];
  R.swatch = (k, c) => {
    const bg = { marble: `radial-gradient(120% 80% at 20% 30%,transparent 55%,rgba(120,118,112,.18) 56%,transparent 58%),linear-gradient(115deg,transparent 40%,rgba(110,108,104,.28) 41%,transparent 43%,transparent 70%,rgba(140,136,128,.22) 71%,transparent 73%),${c}`, wood: `repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 2px,transparent 2px 9px),repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 1px,transparent 1px 23px),linear-gradient(180deg,${c},color-mix(in srgb,${c} 80%,#000))`, terrazzo: `radial-gradient(circle at 20% 30%,#9a948a 0 3px,transparent 4px),radial-gradient(circle at 70% 60%,#b48c55 0 2.5px,transparent 3.5px),radial-gradient(circle at 40% 80%,#5e6b66 0 3px,transparent 4px),radial-gradient(circle at 85% 20%,#c9774f 0 2px,transparent 3px),${c}`, flute: `repeating-linear-gradient(90deg,color-mix(in srgb,${c} 75%,#000) 0 3px,${c} 3px 14px)`, fabric: `repeating-linear-gradient(45deg,rgba(0,0,0,.06) 0 2px,transparent 2px 5px),repeating-linear-gradient(-45deg,rgba(255,255,255,.08) 0 2px,transparent 2px 5px),${c}`, plaster: `radial-gradient(60% 50% at 30% 40%,rgba(255,255,255,.35),transparent),radial-gradient(50% 40% at 70% 70%,rgba(0,0,0,.08),transparent),${c}`, granite: `radial-gradient(circle at 30% 30%,#555 0 1.5px,transparent 2px),radial-gradient(circle at 60% 70%,#777 0 1px,transparent 2px),radial-gradient(circle at 80% 30%,#444 0 2px,transparent 3px),${c}`, metal: `linear-gradient(135deg,color-mix(in srgb,${c} 70%,#fff) 0%,${c} 45%,color-mix(in srgb,${c} 70%,#000) 100%)` }[k] || c;
    return `<span class="sw" style="background:${bg};background-size:${k === 'terrazzo' ? '38px 38px' : k === 'granite' ? '18px 18px' : 'auto'}"></span>`;
  };
  const sels = pid => { const d = db(); d.selections = d.selections || {}; if (!d.selections[pid]) { const p = H.P(pid), n = H.hue(pid); d.selections[pid] = SEL.map(([cat], i) => ({ cat, chosen: ['completed', 'handover'].includes(p.stage) || (p.stage === 'execution' && i < 4) ? (n + i) % 3 : null, date: H.D(-20 + i), locked: ['completed', 'handover'].includes(p.stage) || (p.stage === 'execution' && i < 2) })); } return d.selections[pid]; };
  R.selBoard = (p, as) => {
    const L = sels(p.id), done = L.filter(x => x.chosen != null).length, client = as === 'client';
    return `<div class="card" style="margin-bottom:16px"><div class="hd"><div><h2>Material & finish selections</h2><div class="small muted">${done} of ${L.length} chosen · every choice is signed off with date and becomes part of the drawings and purchase orders</div></div>${R.prog(Math.round(done / L.length * 100))}</div></div>
<div class="grid g3">${L.map((s, si) => { const opts = SEL.find(x => x[0] === s.cat)[1]; return `<div class="card" data-k="sel-${si}"><div class="hd"><h2 style="font-size:15px">${esc(s.cat)}</h2>${s.locked ? H.pill('Locked for ordering', 'good') : s.chosen != null ? H.pill('Selected', 'info') : H.pill('Choose one', 'warn')}</div><div class="swatches">${opts.map(([nm, k, c], oi) => `<button class="swo${s.chosen === oi ? ' on' : ''}" ${s.locked || (!client && S.role === 'designer' && false) ? 'disabled' : ''} data-act="sel-pick" data-p="${p.id}" data-i="${si}" data-v="${oi}" aria-pressed="${s.chosen === oi}">${R.swatch(k, c)}<span>${esc(nm)}</span></button>`).join('')}</div><div class="small muted" style="margin-top:8px">${s.chosen != null ? `${esc(opts[s.chosen][0])} · signed off ${H.fd(s.date)}${s.by ? ' by ' + esc(s.by) : ' by client'}` : 'Pending — the designer’s recommendation is first'}</div>${!client && s.chosen != null && !s.locked && S.role !== 'designer' ? `<button class="btn sm" style="margin-top:8px" data-act="sel-lock" data-p="${p.id}" data-i="${si}">Lock for ordering</button>` : ''}</div>`; }).join('')}</div>`;
  };
  R.pt_selections = p => R.selBoard(p, 'internal');
  Object.assign(H.A, {
    'sel-pick': a => { const L = sels(a.dataset.p), s = L[+a.dataset.i]; if (s.locked) return H.toast('Locked — items are being ordered'); s.chosen = +a.dataset.v; s.date = H.TODAY; const p = H.P(a.dataset.p), nm = SEL.find(x => x[0] === s.cat)[1][s.chosen][0]; s.by = S.role === 'client' ? H.CL(p.client).contact.split(' (')[0] : H.name(S.user); H.log(S.role === 'client' ? p.designer : S.user, `${s.cat}: ${nm} selected${S.role === 'client' ? ' by client in portal' : ''}`, p.id); if (S.role === 'client') H.notify('Client', `${H.CL(p.client).name} chose ${nm} for ${s.cat.toLowerCase()}`, 'project-' + p.id); H.commit(`${s.cat}: ${nm} — signed off`, 'sel-' + a.dataset.i); },
    'sel-lock': a => { const s = sels(a.dataset.p)[+a.dataset.i]; s.locked = true; H.log(S.user, `${s.cat} locked for ordering`, a.dataset.p); H.commit('Locked — procurement can raise the purchase order'); }
  });

  // =================== CONCEPT → RENDER SLIDER ===================
  R.compare = (src, cap) => `<div class="cmp" style="--p:50%"><img src="${src}" alt="Final render" class="cb"><img src="${src}" alt="Concept sketch" class="ca"><span class="cl l">Concept sketch</span><span class="cl r">Final render</span><i class="hnd"></i><input type="range" min="0" max="100" value="50" data-inp="cmp" aria-label="Compare concept sketch and final render"></div>${cap ? `<p class="small muted" style="margin-top:8px">${cap}</p>` : ''}`;
  H.I.cmp = el => el.parentElement.style.setProperty('--p', el.value + '%');

  // =================== NCR SITE MAP ===================
  const LOC = [['paschim vihar', 168, 150], ['punjabi bagh', 205, 140], ['rajouri', 200, 162], ['kirti nagar', 222, 158], ['janakpuri', 172, 176], ['dwarka', 140, 214], ['vasant kunj', 222, 250], ['vasant vihar', 238, 232], ['chhatarpur', 262, 276], ['saket', 270, 252], ['greater kailash', 292, 236], ['dlf phase', 160, 300], ['golf course', 182, 312], ['gurugram', 150, 318], ['faridabad', 338, 334], ['noida', 398, 246], ['indirapuram', 420, 170], ['ghaziabad', 440, 160], ['sonipat', 222, 34], ['rohini', 196, 96]];
  const where = s => { s = (s || '').toLowerCase(); const m = LOC.find(l => s.includes(l[0])); if (m) return [m[1], m[2]]; const h = Math.abs(H.hue(s)); return [180 + h % 160, 120 + (h * 7) % 160]; };
  R.ncrMap = () => {
    const d = db(), ps = d.projects.filter(p => p.stage !== 'completed'), col = h => h === 'delayed' ? 'var(--bad)' : h === 'at-risk' ? 'var(--warn)' : 'var(--acc)';
    const todayV = d.visits.filter(v => v.date === H.TODAY);
    const placed = [[where('paschim vihar')[0] - 16, where('paschim vihar')[1] + 14, 40]];
    ps.forEach(p => { if (todayV.find(t => t.project === p.id)) { const [x, y] = where(p.location); placed.push([x - 28, y - 12, 24]); } });
    const lab = (x, y, w) => { for (const [dx, dy] of [[10, 4], [10, 17], [10, -9], [-w - 10, 4], [10, 30], [-w - 10, 17], [-w - 10, -9]]) { const bx = x + dx, by = y + dy; if (!placed.some(([px, py, pw]) => bx < px + pw + 4 && bx + w + 4 > px && Math.abs(by - py) < 12)) { placed.push([bx, by, w]); return [bx, by]; } } placed.push([x + 10, y + 4, w]); return [x + 10, y + 4]; };
    const pins = ps.slice().sort((a, b) => where(a.location)[1] - where(b.location)[1]).map(p => { const [x, y] = where(p.location), h = H.health(p), v = todayV.find(t => t.project === p.id), nm = p.name.replace(/ (Residence|Office|Restaurant|Showroom|Banquet|Coworking|Villa|Farmhouse|Duplex|Apartment|Café)$/, ''), [lx, ly] = lab(x, y, nm.length * 6.1); return `<g class="pin" data-go="project-${p.id}" style="cursor:pointer"><title>${esc(p.name)} — ${esc(H.stageName(p.stage))}, ${p.progress}%</title>${h !== 'on-track' ? `<circle cx="${x}" cy="${y}" r="9" fill="${col(h)}" opacity=".25"><animate attributeName="r" values="7;16;7" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite"/></circle>` : ''}<circle cx="${x}" cy="${y}" r="6.5" fill="${col(h)}" stroke="var(--panel)" stroke-width="2.5"/><text x="${lx}" y="${ly}" class="pl">${esc(nm)}</text>${v ? `<g transform="translate(${x - 26},${y - 26})"><circle cx="10" cy="10" r="10" fill="hsl(${H.hue(H.name(v.by))} 24% 40%)" stroke="var(--panel)" stroke-width="2"/><text x="10" y="13.5" text-anchor="middle" style="font:700 8.5px Inter;fill:#fff">${H.name(v.by).split(' ').map(w => w[0]).join('').slice(0, 2)}</text></g>` : ''}</g>`; }).join('');
    return `<svg class="ncr" viewBox="0 0 520 380" role="img" aria-label="Active sites across Delhi NCR"><rect width="520" height="380" rx="14" fill="var(--panel2)"/>
<path d="M60 70 Q140 40 250 60 Q340 50 380 110 Q395 190 360 230 Q320 300 250 300 Q170 300 120 260 Q70 210 60 150Z" fill="var(--panel)" stroke="var(--line2)"/>
<path d="M90 270 Q140 250 210 290 Q230 340 170 360 Q110 360 90 320Z" fill="var(--panel)" stroke="var(--line2)" opacity=".9"/><path d="M300 300 Q350 290 380 320 Q380 360 330 365 Q290 355 300 300Z" fill="var(--panel)" stroke="var(--line2)" opacity=".9"/><path d="M360 200 Q420 190 460 220 Q470 280 420 290 Q370 280 360 240Z" fill="var(--panel)" stroke="var(--line2)" opacity=".9"/><path d="M380 120 Q450 110 490 140 Q495 190 450 200 Q400 195 385 160Z" fill="var(--panel)" stroke="var(--line2)" opacity=".9"/>
<path d="M330 20 Q320 90 345 150 Q360 200 335 250 Q312 300 340 380" fill="none" stroke="#8CB8C9" stroke-width="7" stroke-linecap="round" opacity=".55"/>
<ellipse cx="235" cy="185" rx="95" ry="70" fill="none" stroke="var(--line2)" stroke-dasharray="4 5"/><ellipse cx="235" cy="185" rx="150" ry="115" fill="none" stroke="var(--line2)" stroke-dasharray="2 6" opacity=".7"/>
<g class="rl"><text x="230" y="80">DELHI</text><text x="112" y="350">GURUGRAM</text><text x="398" y="300">NOIDA</text><text x="300" y="372">FARIDABAD</text><text x="430" y="130">GHAZIABAD</text><text x="350" y="40">Yamuna</text></g>
${(() => { const [sx, sy] = where('paschim vihar'); return `<g><rect x="${sx - 13}" y="${sy - 10}" width="26" height="20" rx="6" fill="var(--char)"/>${H.mark(11).replace('<svg ', `<svg x="${sx - 9}" y="${sy - 5}" style="color:#fff" `)}<text x="${sx - 14}" y="${sy + 24}" class="pl" style="font-weight:700">Studio</text></g>`; })()}${pins}</svg>`;
  };

  // =================== CAPACITY HEATMAP ===================
  R.heat = () => {
    const d = db(), emps = d.employees.filter(e => e.cap), weeks = Array.from({ length: 6 }, (_, k) => [H.D(k * 7), H.D(k * 7 + 6)]);
    const load = (e, [a, b], k) => { const t = d.tasks.filter(x => x.assignee === e.id && !H.done(x) && (k === 0 ? x.due <= b && H.dif(x.due) >= -7 : x.due >= a && x.due <= b)).length, v = d.visits.filter(x => x.by === e.id && x.date >= a && x.date <= b).length, plan = 26 + ((Math.abs(H.hue(e.id)) + k * 17) % 38) - k * 3; return Math.round(plan + (t + v * .5) / Math.max(1, e.cap / 2.2) * 55); };
    const color = v => v > 105 ? 'var(--bad)' : v > 85 ? 'var(--warn)' : 'var(--acc)';
    return `<div class="tw"><table class="heat"><thead><tr><th>Person</th>${weeks.map(([a], k) => `<th class="num">${k ? 'w/c ' + H.fd(a) : 'This week'}</th>`).join('')}</tr></thead><tbody>${emps.map(e => `<tr><td>${H.who(e.id)}</td>${weeks.map((w, k) => { const v = e.loc === 'Leave' && k === 0 ? -1 : load(e, w, k); return `<td class="num"><span class="hc" style="--c:${v < 0 ? 'var(--muted)' : color(v)};--o:${v < 0 ? .12 : Math.min(.3, .08 + v / 500)}">${v < 0 ? 'Leave' : v + '%'}</span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  };

  // =================== WHATSAPP PREVIEW ===================
  R.wa = (to, text, btns) => `<div class="wa"><div class="wah"><span class="wav">${H.mark(14)}</span><div><b>Hands On Design</b> <span class="wtick" title="Verified business">✓</span><div class="small">WhatsApp Business · to ${esc(to)}</div></div></div><div class="wab"><div class="bub">${esc(text).replace(/\n/g, '<br>')}<span class="wt">${new Date().toTimeString().slice(0, 5)} ✓✓</span></div>${btns ? `<div class="wbtns">${btns.map(b => `<span>${esc(b)}</span>`).join('')}</div>` : ''}</div></div>`;

  // =================== SPOKEN BRIEFING ===================
  H.say = (text, onend) => { try { const s = window.speechSynthesis; if (!s) return H.toast('Speech is not available in this browser'); s.cancel(); const u = new SpeechSynthesisUtterance(text); const vs = s.getVoices(); u.voice = vs.find(v => /en-IN/i.test(v.lang)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; u.rate = 1; u.pitch = 1; if (onend) u.onend = onend; s.speak(u); } catch (e) { H.toast('Speech is not available here'); } };
  H.A['brief-say'] = () => {
    const b = H.AI.briefing(), f = H.fin(), u = H.E(S.user);
    const t = `${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} ${u ? u.name.split(' ')[0] : ''}${S.role === 'owner' ? ' ji' : ''}. ${b.risky.length} of ${b.A.length} projects need attention. ${b.risky.slice(0, 3).map(x => `${x.p.name}: ${x.r.reasons.slice(0, 1).join('')}${x.r.slip > 0 ? `, handover may slip about ${x.r.slip} days` : ''}.`).join(' ')} ${S.role !== 'designer' ? `Overdue receivables are ${(f.overdue / 1e5).toFixed(1)} lakh rupees across ${b.od.length} invoices.` : ''} ${b.dec.length ? `${b.dec.length} decisions are waiting for your approval.` : ''} ${b.visits.length ? `${b.visits.length} site visits are planned today.` : ''} Have a productive day.`;
    H.say(t.replace(/\s+/g, ' ')); H.toast('Playing your briefing');
  };

  // =================== GUIDED TOUR (auto-play) ===================
  const T = H.Tour = { i: 0, on: false, paused: false, voice: false, timer: null };
  const go = (role, route, extra) => { S.role = role; S.user = H.ROLES[role].user; S.session = S.session || { at: Date.now() }; S.ui.drawer = null; S.ui.modal = null; S.ui.pop = null; S.ui.lb = null; S.ui.cmdk = null; S.ui.scen = null; if (route) { S.ui.route = route; try { history.replaceState(null, '', '#' + route); } catch (e) { /* sandbox */ } } if (extra) extra(); };
  const STEPS = [
    ['Welcome', 'This is the Hands On Design Command Centre: every project, person and payment of the studio on one screen. Let’s take two minutes.', () => { S.session = null; }, 7000],
    ['Owner dashboard', 'Rohit ji opens one screen in the morning: decisions waiting, projects at risk and overdue money, with trends against last week.', () => go('owner', 'dashboard'), 9000],
    ['AI morning briefing', 'HOD AI reads every record overnight and writes the briefing — every line links to the project, invoice or drawing behind it. It can even read it aloud.', () => { go('owner', 'dashboard'); H.hl('brief'); }, 9000],
    ['Live sites across NCR', 'Every active site on one map. Pulsing pins need attention; avatars show who checked in on site today.', () => { go('owner', 'dashboard'); H.hl('ncr'); }, 8000],
    ['Portfolio', 'All projects with real photography, progress against plan, health and the team responsible.', () => go('owner', 'projects', () => { S.ui.f.pview = 'grid'; S.ui.f.pgrp = 'active'; }), 7000],
    ['Project command view', 'Each project has its own control room: schedule with critical path, tasks, drawings, site visits, finance, changes, snags and handover.', () => go('owner', 'project-p1', () => { S.ui.tab['p-p1'] = 'schedule'; }), 9000],
    ['Design Studio in 3D', 'Designers upload 3D models and renders. Clients explore them in 3D and approve from their phone — no more PDFs on WhatsApp.', () => go('designer', 'design'), 9000],
    ['Estimates & BOQ', 'Room-by-room bills of quantities from the studio’s rate library, with cost, margin and a client quotation in minutes.', () => go('owner', 'estimates-es1'), 8000],
    ['GST invoices', 'Tax invoices, proformas and quotations with GST worked out, amount in words and scan-to-pay — printed or saved as PDF.', () => { S.ui.invd = null; go('owner', 'invoice-new-p3'); }, 8000],
    ['Site supervisor app', 'On site, supervisors check in with consent, record progress and photos, and log issues that become contractor tasks automatically — even offline.', () => go('site', null, () => { S.ui.site = { tab: 'today', visit: null, offline: false, report: null }; }), 8000],
    ['Client portal', 'Clients see progress photos, approve designs, choose finishes and pay invoices — and never see internal costs.', () => go('client', null, () => { S.clientId = 'cl1'; S.ui.tab.cp = 'sel'; }), 9000],
    ['Contractor portal', 'Contractors get work orders, upload completion photos, request inspections and submit bills. Late work escalates automatically.', () => go('contractor', null, () => { S.contractorId = 'c1'; S.ui.tab.ct = 'work'; }), 8000],
    ['Automation & WhatsApp', 'Ten rules do the follow-ups: reminders, escalations, approvals and reports through WhatsApp Business templates, with a human gate for anything involving money.', () => go('owner', 'automation'), 9000],
    ['Ready to build', 'The blueprint shows the production architecture and a four-phase roadmap. Phase one replaces calls and Excel within eight to ten weeks. Try the demo scenarios next.', () => go('owner', 'blueprint', () => { S.ui.tab.bp = 'road'; }), 10000]
  ];
  const run = () => {
    clearTimeout(T.timer); const st = STEPS[T.i]; if (!st) return T.stop();
    try { st[2](); } catch (e) { console.error(e); }
    H.render(); window.scrollTo(0, 0);
    setTimeout(() => { const el = document.querySelector('.hl'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 120);
    if (T.voice) H.say(st[1]);
    if (!T.paused) T.timer = setTimeout(() => { if (T.on && !T.paused) { T.i++; run(); } }, st[3]);
  };
  T.start = () => { T.on = true; T.i = 0; T.paused = false; run(); };
  T.stop = () => { clearTimeout(T.timer); T.on = false; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } if (!S.session) { S.session = { at: Date.now() }; go('owner', 'dashboard'); } H.render(); };
  (H.extraOverlays = H.extraOverlays || []).push(() => { if (!T.on) return ''; const st = STEPS[T.i]; if (!st) return ''; return `<div class="tour" role="dialog" aria-label="Guided tour"><div class="tbar"><i style="animation-duration:${st[3]}ms;${T.paused ? 'animation-play-state:paused' : ''}" key="${T.i}"></i></div><div class="row between" style="align-items:flex-start;flex-wrap:nowrap;gap:14px"><div style="min-width:0"><div class="stp">Guided tour · ${T.i + 1} of ${STEPS.length}</div><h3>${esc(st[0])}</h3><p>${esc(st[1])}</p></div><div class="row" style="gap:6px;flex-wrap:nowrap;flex:none"><button class="btn icon sm" data-act="tour-prev" aria-label="Previous">←</button><button class="btn icon sm" data-act="tour-pause" aria-label="${T.paused ? 'Play' : 'Pause'}">${T.paused ? ic('play') : '❚❚'}</button><button class="btn icon sm" data-act="tour-next" aria-label="Next">→</button><button class="btn sm${T.voice ? ' gold' : ''}" data-act="tour-voice" aria-pressed="${T.voice}">${ic('mic')}<span class="hide-sm">Narrate</span></button><button class="btn icon sm" data-act="tour-stop" aria-label="Exit tour">${ic('x')}</button></div></div></div>`; });
  Object.assign(H.A, {
    'tour-start': () => T.start(),
    'tour-next': () => { T.i = Math.min(STEPS.length, T.i + 1); if (T.i >= STEPS.length) return T.stop(); run(); },
    'tour-prev': () => { T.i = Math.max(0, T.i - 1); run(); },
    'tour-pause': () => { T.paused = !T.paused; if (!T.paused) run(); else { clearTimeout(T.timer); H.render(); } },
    'tour-voice': () => { T.voice = !T.voice; if (T.voice) H.say(STEPS[T.i][1]); else try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } H.render(); },
    'tour-stop': () => T.stop()
  });
})();
