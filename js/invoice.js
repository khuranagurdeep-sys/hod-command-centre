/* Invoice designer: GST tax invoice / proforma / quotation with live A4 preview, print & PDF */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;
  const INV = H.INV = {};
  const TYPES = ['Tax invoice', 'Proforma invoice', 'Quotation'];
  const STATES = ['Delhi', 'Haryana', 'Uttar Pradesh', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Maharashtra', 'Karnataka', 'Other state'];
  INV.state = p => /gurugram|gurgaon|faridabad/i.test(p.location || '') ? 'Haryana' : /noida|ghaziabad|meerut/i.test(p.location || '') ? 'Uttar Pradesh' : 'Delhi';
  INV.sac = p => /architecture/i.test(p.service || '') ? (/resid|villa|apartment|duplex|farmhouse/i.test(p.type || '') ? '998322' : '998323') : /turnkey|renovation|execution/i.test(p.service || '') ? '9954' : '998391';
  const billing = () => (db().company.billing = db().company.billing || { gstin: '', pan: '', bank: '', acname: 'Hands On Design', acno: '', ifsc: '', upi: '' });

  // Indian-system amount in words
  const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  const three = n => (n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : '');
  INV.words = amt => {
    let n = Math.floor(Math.abs(amt)), paise = Math.round((Math.abs(amt) - n) * 100);
    if (!n && !paise) return 'Rupees Zero Only';
    const parts = [], cr = Math.floor(n / 1e7); n %= 1e7; const lk = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1e3); n %= 1e3;
    if (cr) parts.push((cr >= 100 ? three(cr) : two(cr)) + ' Crore'); if (lk) parts.push(two(lk) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (n) parts.push(three(n));
    return 'Rupees ' + parts.join(' ') + (paise ? ' and ' + two(paise) + ' Paise' : '') + ' Only';
  };
  INV.calc = v => {
    const sub = v.items.reduce((s, it) => s + (+it.q || 0) * (+it.rate || 0), 0);
    const disc = Math.min(sub, +v.disc || 0), taxable = sub - disc, rate = +v.gst || 0;
    const tax = Math.round(taxable * rate) / 100, half = Math.round(tax * 50) / 100;
    const raw = taxable + tax, total = Math.round(raw);
    return { sub, disc, taxable, rate, tax, cgst: v.inter ? 0 : half, sgst: v.inter ? 0 : tax - half, igst: v.inter ? tax : 0, round: total - raw, total };
  };
  INV.fromInvoice = i => {
    const p = H.P(i.project), st = INV.state(p);
    return { id: i.id, no: i.no, type: i.type || 'Tax invoice', project: i.project, date: i.raised, due: i.due, pos: i.pos || st, inter: i.inter != null ? i.inter : st !== 'Delhi', gst: i.gstRate || 18, disc: i.disc || 0, notes: i.notes || 'Thank you for choosing Hands On Design.', items: i.items || [{ d: `${i.milestone}`, sub: `${p.name} · ${p.service}`, sac: INV.sac(p), q: 1, rate: i.taxable }], status: H.invStatus(i), paid: i.paid, total: i.total };
  };
  const inr = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  INV.qr = (v, c) => {
    const b = billing();
    if (!b.upi) return `<div class="qr">UPI QR appears here once a UPI ID is added in Settings</div>`;
    try { const q = window.qrcode(0, 'M'); q.addData(`upi://pay?pa=${encodeURIComponent(b.upi)}&pn=${encodeURIComponent('Hands On Design')}&am=${c.total}&cu=INR&tn=${encodeURIComponent(v.no || 'Invoice')}`); q.make(); return `<div class="qr" title="Scan to pay by UPI">${q.createSvgTag({ cellSize: 2, margin: 0, scalable: true })}</div>`; } catch (e) { return `<div class="qr">UPI: ${esc(b.upi)}</div>`; }
  };
  INV.a4 = v => {
    const p = H.P(v.project), cl = H.CL(p.client) || {}, co = db().company, b = billing(), c = INV.calc(v);
    const stamp = v.status === 'Paid' ? '<div class="stamp paid">PAID</div>' : v.status === 'Overdue' ? '<div class="stamp">OVERDUE</div>' : !v.id ? '<div class="stamp" style="border-color:#8a7346;color:#8a7346">DRAFT</div>' : '';
    const isInv = v.type !== 'Quotation';
    return `<div class="a4">${stamp}
<div class="ah"><div style="color:#16191a">${H.logo(150)}<div class="co"><b style="color:#16191a">Hands On Design</b><br>${esc(co.address)}<br>${esc(co.phone)}<br>${esc(co.email)} · ${esc(co.web)}<br>GSTIN: ${b.gstin ? esc(b.gstin) : '<span class="muted">add in Settings</span>'}${b.pan ? ' · PAN: ' + esc(b.pan) : ''}</div></div>
<div><div class="ttl2">${esc(v.type.toUpperCase())}</div><div class="meta"><span>${isInv ? 'Invoice' : 'Quotation'} no.</span><b>${esc(v.no || 'Assigned on issue')}</b><span>Date</span><b>${H.fdy(v.date)}</b><span>${isInv ? 'Due date' : 'Valid until'}</span><b>${H.fdy(v.due)}</b><span>Place of supply</span><b>${esc(v.pos)}</b><span>Project</span><b>${esc(p.code)}</b></div></div></div>
<div class="parties"><div><div class="lab">BILLED TO</div><b>${esc(cl.name || '')}</b><br>${esc(cl.contact && cl.contact !== cl.name ? cl.contact : '')}${cl.contact && cl.contact !== cl.name ? '<br>' : ''}${esc(p.location)}<br>${cl.gstin ? 'GSTIN ' + esc(cl.gstin) : 'Unregistered (B2C)'}<br><span class="muted">${esc(cl.email || '')}</span></div>
<div><div class="lab">PROJECT / SITE</div><b>${esc(p.name)}</b><br>${esc(p.type)}<br>${esc(p.location)}<br>${p.area ? p.area.toLocaleString('en-IN') + ' sq ft' : ''}<br><span class="muted">${esc(p.service)}</span></div>
<div><div class="lab">PAY TO</div>${b.bank || b.acno ? `<b>${esc(b.acname || 'Hands On Design')}</b><br>${esc(b.bank)}<br>A/c ${esc(b.acno)}<br>IFSC ${esc(b.ifsc)}` : '<span class="muted">Bank details: add in Settings → Invoice settings</span>'}${b.upi ? `<br>UPI ${esc(b.upi)}` : ''}</div></div>
<table><thead><tr><th style="width:34px">#</th><th>Description</th><th>SAC</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${v.items.map((it, k) => `<tr><td>${k + 1}</td><td><b>${esc(it.d || '')}</b>${it.sub ? `<div class="muted" style="font-size:11.5px">${esc(it.sub)}</div>` : ''}</td><td>${esc(it.sac || '')}</td><td class="num">${+it.q || 0}</td><td class="num">${inr(+it.rate || 0)}</td><td class="num">${inr((+it.q || 0) * (+it.rate || 0))}</td></tr>`).join('')}</tbody></table>
<div class="tot"><div><div class="words"><div class="lab">AMOUNT IN WORDS</div>${INV.words(c.total)}</div><div style="margin-top:14px;font-size:11.5px;color:#4b5251"><div class="lab">NOTES</div>${esc(v.notes || '')}</div></div>
<table><tbody><tr><td>Subtotal</td><td class="num">${inr(c.sub)}</td></tr>${c.disc ? `<tr><td>Discount</td><td class="num">− ${inr(c.disc)}</td></tr>` : ''}<tr><td>Taxable value</td><td class="num">${inr(c.taxable)}</td></tr>${v.inter ? `<tr><td>IGST ${c.rate}%</td><td class="num">${inr(c.igst)}</td></tr>` : `<tr><td>CGST ${c.rate / 2}%</td><td class="num">${inr(c.cgst)}</td></tr><tr><td>SGST ${c.rate / 2}%</td><td class="num">${inr(c.sgst)}</td></tr>`}${Math.abs(c.round) >= 0.005 ? `<tr><td>Round off</td><td class="num">${c.round > 0 ? '' : '− '}${inr(Math.abs(c.round))}</td></tr>` : ''}<tr class="grand"><td>Total</td><td class="num">₹${c.total.toLocaleString('en-IN')}</td></tr>${v.paid ? `<tr><td>Received</td><td class="num">${inr(v.paid)}</td></tr><tr><td><b>Balance due</b></td><td class="num"><b>${inr(Math.max(0, c.total - v.paid))}</b></td></tr>` : ''}</tbody></table></div>
<div class="foot"><div><div class="lab">TERMS</div>1. Payment within the due date by bank transfer or UPI; please quote the ${isInv ? 'invoice' : 'quotation'} number.<br>2. Interest may apply on payments made after the due date.<br>3. Work proceeds to the next milestone on receipt of payment.<br>4. Subject to Delhi jurisdiction.</div>
<div style="display:flex;gap:12px;align-items:flex-start">${INV.qr(v, c)}<div><div class="lab">SCAN TO PAY</div>Any UPI app. Bank transfers are confirmed after matching with our bank statement.</div></div>
<div class="sign">For Hands On Design<div class="ln">Authorised signatory</div></div></div>
<div class="note">This is a ${v.id ? 'computer-generated document' : 'draft preview'} from the Hands On Design Command Centre demo. Sample values; SAC codes and tax treatment to be confirmed by your accountant.</div></div>`;
  };

  // ---------- designer state ----------
  const newDraft = pid => {
    const p = H.P(pid || (H.active().find(x => (x.milestones || []).some(m => !m.invoiced)) || H.active()[0]).id), ms = (p.milestones || []).find(m => !m.invoiced), st = INV.state(p);
    return { key: 'new', type: 'Tax invoice', project: p.id, date: H.TODAY, due: H.D(15), pos: st, inter: st !== 'Delhi', gst: 18, disc: 0, notes: 'Thank you for choosing Hands On Design.', ms: ms ? ms.name : '', items: [ms ? { d: ms.name, sub: `${p.name} · ${p.service}`, sac: INV.sac(p), q: 1, rate: ms.amount } : { d: 'Design fee', sub: p.name, sac: INV.sac(p), q: 1, rate: 100000 }] };
  };
  const field = (lab, inner, full) => `<div${full ? ' class="full"' : ''}><label class="f">${lab}</label>${inner}</div>`;
  H.V.invoice = param => {
    const d = db();
    if (param && !param.startsWith('new')) {
      const i = d.invoices.find(x => x.id === param); if (!i) return R.empty('Invoice not found.');
      const v = INV.fromInvoice(i), pays = d.payments.filter(x => x.invoice === i.id), st = H.invStatus(i);
      return `<div class="pagehead"><div><div class="eyebrow"><a class="lnk" href="#finance" data-go="finance">Finance</a> / ${esc(i.no)}</div><h1>${esc(i.no)} · ${H.lk(i.total)} ${st === 'Paid' ? 'paid' : st === 'Overdue' ? `overdue by ${-H.dif(i.due)} days` : 'due ' + H.fd(i.due)}</h1><p>${esc(H.P(i.project).name)} · ${esc(i.milestone)}</p></div><div class="row"><button class="btn" data-act="inv-dup" data-id="${i.id}">${ic('copy')}Duplicate as draft</button><button class="btn pri" data-act="inv-print">${ic('doc')}Print / save PDF</button></div></div>
<div class="inv-wrap"><div class="stack inv-ed"><div class="card"><div class="hd"><h2>Status</h2>${H.pill(st)}</div><div class="kv" style="margin-top:0"><div>Total<b>${H.inr(i.total)}</b></div><div>Received<b>${H.inr(i.paid)}</b></div><div>Balance<b>${H.inr(H.invOut(i))}</b></div><div>Reminders<b>${i.reminders.length}</b></div></div>${H.invOut(i) ? `<div class="row" style="margin-top:14px"><button class="btn sm pri" data-act="modal" data-id="payment" data-arg='{"inv":"${i.id}"}'>Record payment</button><button class="btn sm" data-act="modal" data-id="reminder" data-arg='{"inv":"${i.id}"}'>Send reminder</button></div>` : ''}</div>
<div class="card"><h2>Payments</h2>${pays.length ? `<div class="list">${pays.map(x => `<div><div class="li-main"><div class="t">${H.inr(x.amount)} · ${esc(x.mode)}</div><div class="s">${H.fd(x.date)} · ${esc(x.ref)}</div></div>${x.verified ? H.pill('Verified', 'good') : H.pill('Awaiting bank match', 'warn')}</div>`).join('')}</div>` : R.empty('No payments yet.')}</div>
<div class="card"><h2>Delivery</h2><p class="small muted">In production the invoice is emailed as a PDF and shared on WhatsApp from accounts after approval, and posted to Tally / Zoho Books. Here you can print it or save it as a PDF.</p></div></div>
<div class="paper"><div id="print-area">${INV.a4(v)}</div></div></div>`;
    }
    const pid = param && param.startsWith('new-') ? param.slice(4) : null;
    if (!S.ui.invd || S.ui.invd.key !== (param || 'new')) { S.ui.invd = newDraft(pid); S.ui.invd.key = param || 'new'; }
    const v = S.ui.invd, p = H.P(v.project), ms = (p.milestones || []).filter(m => !m.invoiced), c = INV.calc(v);
    return `<div class="pagehead"><div><div class="eyebrow"><a class="lnk" href="#finance" data-go="finance">Finance</a> / New document</div><h1>Invoice designer</h1><p>GST-ready tax invoices, proforma invoices and quotations with a live A4 preview. Issue it to add it to receivables, then print or save as PDF.</p></div><div class="row"><button class="btn" data-act="inv-print">${ic('doc')}Print / save PDF</button><button class="btn pri" data-act="inv-issue">${ic('check')}${v.type === 'Tax invoice' ? 'Issue invoice' : 'Save ' + v.type.toLowerCase()}</button></div></div>
<div class="inv-wrap"><div class="card inv-ed"><div class="fgrid">
${field('Document', `<select class="in" data-chg="invf" data-k="type">${TYPES.map(t => `<option${t === v.type ? ' selected' : ''}>${t}</option>`).join('')}</select>`)}
${field('Project', `<select class="in" data-chg="invf" data-k="project">${H.active().map(x => `<option value="${x.id}"${x.id === v.project ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`)}
${field('Date', `<input class="in" type="date" value="${v.date}" data-chg="invf" data-k="date">`)}
${field(v.type === 'Quotation' ? 'Valid until' : 'Due date', `<input class="in" type="date" value="${v.due}" data-chg="invf" data-k="due">`)}
${field('Place of supply', `<select class="in" data-chg="invf" data-k="pos">${STATES.map(t => `<option${t === v.pos ? ' selected' : ''}>${t}</option>`).join('')}</select>`)}
${field('GST rate', `<select class="in" data-chg="invf" data-k="gst">${[18, 12, 5, 0].map(t => `<option value="${t}"${+v.gst === t ? ' selected' : ''}>${t}%</option>`).join('')}</select>`)}
</div>
<div class="sect" style="margin-top:20px">Line items <span class="muted">${v.inter ? 'IGST (inter-state)' : 'CGST + SGST (Delhi)'}</span></div>
${ms.length ? `<div class="chips" style="margin-bottom:10px">${ms.map(m => `<button class="chip" data-act="inv-ms" data-v="${esc(m.name)}">${ic('plus')} ${esc(m.name)} · ${H.lk(m.amount)}</button>`).join('')}</div>` : ''}
<div class="row-it small muted" style="margin-bottom:4px"><span>Description</span><span>Qty</span><span>Rate (₹)</span><span></span></div>
${v.items.map((it, k) => `<div class="row-it"><input class="in" value="${esc(it.d)}" data-inp="invit" data-i="${k}" data-k="d" aria-label="Description"><input class="in" type="number" min="0" value="${it.q}" data-inp="invit" data-i="${k}" data-k="q" aria-label="Quantity"><input class="in" type="number" min="0" value="${it.rate}" data-inp="invit" data-i="${k}" data-k="rate" aria-label="Rate"><button class="btn icon sm ghost" data-act="inv-del" data-v="${k}" aria-label="Remove line">${ic('x')}</button></div>`).join('')}
<button class="btn sm" data-act="inv-add">${ic('plus')}Add line</button>
<div class="fgrid" style="margin-top:16px">${field('Discount (₹)', `<input class="in" type="number" min="0" value="${v.disc}" data-inp="invf" data-k="disc">`)}${field('Total', `<div style="font:800 22px var(--display);padding-top:6px" id="inv-total">₹${c.total.toLocaleString('en-IN')}</div>`)}${field('Notes on the document', `<textarea class="in" rows="2" data-inp="invf" data-k="notes">${esc(v.notes)}</textarea>`, true)}</div>
<p class="small muted" style="margin-top:12px">GSTIN, bank details and UPI ID come from <a class="lnk" href="#configuration" data-go="configuration">Settings → Invoice settings</a>. SAC ${esc(INV.sac(p))} is suggested from the service type.</p></div>
<div class="paper"><div id="print-area">${INV.a4(v)}</div></div></div>`;
  };
  const refresh = () => { const v = S.ui.invd, el = document.getElementById('print-area'), t = document.getElementById('inv-total'); if (el && v) el.innerHTML = INV.a4(v); if (t && v) t.textContent = '₹' + INV.calc(v).total.toLocaleString('en-IN'); };
  H.Cg.invf = el => {
    const v = S.ui.invd, k = el.dataset.k; if (!v) return;
    v[k] = el.value;
    if (k === 'project') { const keep = v.key; S.ui.invd = newDraft(el.value); S.ui.invd.key = keep; S.ui.invd.type = v.type; }
    if (k === 'pos') v.inter = el.value !== 'Delhi';
    H.render();
  };
  H.I.invf = el => { const v = S.ui.invd; if (!v) return; v[el.dataset.k] = el.value; refresh(); };
  H.I.invit = el => { const v = S.ui.invd; if (!v) return; v.items[+el.dataset.i][el.dataset.k] = el.value; refresh(); };
  Object.assign(H.A, {
    'inv-add': () => { const v = S.ui.invd, p = H.P(v.project); v.items.push({ d: 'Additional work', sub: p.name, sac: INV.sac(p), q: 1, rate: 0 }); H.render(); },
    'inv-del': a => { const v = S.ui.invd; if (v.items.length > 1) v.items.splice(+a.dataset.v, 1); H.render(); },
    'inv-ms': a => { const v = S.ui.invd, p = H.P(v.project), m = p.milestones.find(x => x.name === a.dataset.v); if (v.items.length === 1 && !(+v.items[0].rate)) v.items = []; v.items.push({ d: m.name, sub: `${p.name} · ${p.service}`, sac: INV.sac(p), q: 1, rate: m.amount }); v.ms = v.ms || m.name; H.render(); },
    'inv-print': () => { try { window.print(); } catch (e) { /* sandbox */ } H.toast('If no print dialog opened, use Ctrl+P (or ⌘P) or open the web link'); },
    'inv-dup': a => { const i = db().invoices.find(x => x.id === a.dataset.id), v = INV.fromInvoice(i); S.ui.invd = Object.assign(v, { key: 'new', id: null, no: null, status: null, paid: 0, date: H.TODAY, due: H.D(15), ms: '' }); H.go('invoice-new'); },
    'inv-issue': () => {
      const v = S.ui.invd, d = db(), p = H.P(v.project), c = INV.calc(v);
      if (!c.taxable) return H.toast('Add an amount first');
      if (v.type !== 'Tax invoice') {
        d.docs.unshift({ id: H.uid('doc'), project: p.id, name: `${v.type} — ${v.items.map(x => x.d).join(', ').slice(0, 60)} (₹${c.total.toLocaleString('en-IN')})`, type: v.type === 'Quotation' ? 'Proposal' : 'Finance', ver: 'v1', by: S.user, date: H.TODAY, access: 'Internal + client', status: 'Current' });
        H.log(S.user, `Saved ${v.type.toLowerCase()} for ${p.name}: ₹${c.total.toLocaleString('en-IN')}`, p.id); S.ui.invd = null; H.save(); H.go('documents'); return H.toast(`${v.type} saved to Documents and shared with the client portal`);
      }
      v.items.forEach(it => { const m = (p.milestones || []).find(x => x.name === it.d && !x.invoiced); if (m) m.invoiced = true; });
      const i = { id: H.uid('i'), no: H.nextInvNo(), project: p.id, milestone: v.items.map(x => x.d).join(' + '), taxable: c.taxable, gst: c.total - c.taxable, total: c.total, raised: v.date, due: v.due, paid: 0, reminders: [], items: v.items.map(x => Object.assign({}, x)), inter: v.inter, pos: v.pos, gstRate: +v.gst, disc: +v.disc || 0, notes: v.notes, type: v.type };
      d.invoices.push(i); H.log(S.user, `Issued ${i.no} for ${H.inr(i.total)}`, p.id); H.notify('Payment', `Invoice ${i.no} (${H.lk(i.total)}) issued to ${H.CL(p.client).name} — visible in the client portal`, 'finance');
      S.ui.invd = null; H.save(); H.go('invoice-' + i.id); H.toast(`${i.no} issued — added to receivables and the client portal`);
    }
  });
  const fit = () => { document.querySelectorAll('.paper').forEach(el => { const z = Math.min(1, (el.clientWidth - 44) / 794); el.style.setProperty('--z', z.toFixed(3)); }); };
  (H.afterRender = H.afterRender || []).push(fit); window.addEventListener('resize', fit);
  H.Cg.billing = el => { billing()[el.dataset.k] = el.value.trim(); H.commit('Invoice settings saved'); };
})();
