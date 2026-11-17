/* Hands On Design — Command Centre demo data.
   Company facts (name, founder, address, contact, services, founding year) are from handsondesign.in and its company presentation.
   Every project, person (other than the founder), contractor, client, amount and date below is FICTIONAL sample data for the demo. */
(function () {
  const HOD = (window.HOD = window.HOD || {});
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  HOD.iso = iso;
  HOD.today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };

  HOD.buildData = function () {
    const T0 = HOD.today();
    const D = n => { const x = new Date(T0); x.setDate(x.getDate() + n); return iso(x); };
    const dd = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
    const addDays = (s, n) => { const x = new Date(s + 'T00:00'); x.setDate(x.getDate() + n); return iso(x); };
    let seed = 20261117;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const pick = a => a[Math.floor(rnd() * a.length)];
    const L = 1e5;
    const db = { meta: { built: iso(T0), version: 3 } };

    db.company = {
      name: 'Hands On Design', tagline: 'Designing elegant and functional spaces', founded: 2008, founder: 'Rohit Mitra',
      address: 'A-4/35, First Floor, Paschim Vihar, New Delhi 110063', phone: '+91 98188 49975 · 011 4226 7211',
      email: 'info@handsondesign.in', hours: 'Monday to Saturday, 10 am to 7 pm', web: 'handsondesign.in',
      services: ['Space planning', 'Building construction', 'Architecture & interior design', 'Furniture design & manufacturing'],
      stats: '17+ years · 1000+ clients · 60+ cities (company presentation)'
    };

    db.employees = [
      { id: 'e0', name: 'Rohit Mitra', role: 'Founder & Principal', dept: 'Management', kind: 'owner', loc: 'Office', cap: 0 },
      { id: 'e1', name: 'Ankit Bansal', role: 'Project Manager', dept: 'Execution', kind: 'pm', loc: 'Site', cap: 12 },
      { id: 'e2', name: 'Priya Nair', role: 'Operations Manager', dept: 'Execution', kind: 'pm', loc: 'Office', cap: 12 },
      { id: 'e3', name: 'Ishita Kohli', role: 'Senior Interior Designer', dept: 'Design', kind: 'designer', loc: 'Office', cap: 9 },
      { id: 'e4', name: 'Kabir Sethi', role: 'Architect', dept: 'Design', kind: 'architect', loc: 'Office', cap: 9 },
      { id: 'e5', name: 'Sana Qureshi', role: 'Architect', dept: 'Design', kind: 'architect', loc: 'Site', cap: 9 },
      { id: 'e6', name: 'Rhea Dutta', role: 'Interior Designer', dept: 'Design', kind: 'designer', loc: 'Office', cap: 9 },
      { id: 'e7', name: 'Varun Chawla', role: 'Interior Designer', dept: 'Design', kind: 'designer', loc: 'Leave', cap: 9 },
      { id: 'e8', name: 'Devansh Arora', role: '3D Visualiser', dept: 'Design', kind: 'visualiser', loc: 'Office', cap: 8 },
      { id: 'e9', name: 'Rakesh Yadav', role: 'Site Supervisor', dept: 'Execution', kind: 'site', loc: 'Site', cap: 10 },
      { id: 'e10', name: 'Manoj Rawat', role: 'Site Engineer', dept: 'Execution', kind: 'site', loc: 'Site', cap: 10 },
      { id: 'e11', name: 'Sunil Kumar', role: 'Site Supervisor', dept: 'Execution', kind: 'site', loc: 'Site', cap: 10 },
      { id: 'e12', name: 'Meenakshi Gupta', role: 'Accounts Manager', dept: 'Office', kind: 'accounts', loc: 'Office', cap: 10 },
      { id: 'e13', name: 'Tarun Batra', role: 'Procurement Executive', dept: 'Office', kind: 'procurement', loc: 'Office', cap: 10 },
      { id: 'e14', name: 'Simran Kaur', role: 'Client Relations (CRM)', dept: 'Office', kind: 'crm', loc: 'Office', cap: 10 },
      { id: 'e15', name: 'Neha Joshi', role: 'CAD Draughtsperson', dept: 'Design', kind: 'drafter', loc: 'Office', cap: 9 }
    ];
    db.employees.forEach((e, i) => { e.phone = '+91 98' + String(10000000 + i * 7311 + 4521).slice(0, 8); e.email = e.name.split(' ')[0].toLowerCase() + '@handsondesign.in'; });
    db.employees[0].email = 'info@handsondesign.in';

    const CT = [
      ['c1', 'Volt Electricals', 'Electrical', 'Contractor', 'Rajinder Singh'],
      ['c2', 'BrightWire Services', 'Electrical', 'Contractor', 'Imran Ali'],
      ['c3', 'AquaFlow Plumbing', 'Plumbing & sanitary', 'Contractor', 'Satish Verma'],
      ['c4', 'CoolAir HVAC Solutions', 'HVAC', 'Contractor', 'Nikhil Sood'],
      ['c5', 'Skyline Ceilings', 'False ceiling & gypsum', 'Contractor', 'Pradeep Mishra'],
      ['c6', 'Shree Balaji Civil Works', 'Civil & masonry', 'Contractor', 'Ramesh Chand'],
      ['c7', 'SealTech Waterproofing', 'Waterproofing', 'Contractor', 'Joseph Mathew'],
      ['c8', 'Colour Craft Painters', 'Painting & polish', 'Contractor', 'Mohd. Salim'],
      ['c9', 'Stone & Tile Studio', 'Flooring, tiling & stone', 'Contractor', 'Vinod Jangid'],
      ['c10', 'Woodline Interiors', 'Carpentry & joinery', 'Contractor', 'Harish Sharma'],
      ['c11', 'Kraftwood Modular', 'Modular kitchen & storage', 'Contractor', 'Ajay Malik'],
      ['c12', 'ClearView Glass & Aluminium', 'Glass & aluminium', 'Contractor', 'Gurpreet Singh'],
      ['c13', 'MetalForm Fabricators', 'MS / SS fabrication', 'Contractor', 'Dinesh Lohar'],
      ['c14', 'Lumina Lighting Studio', 'Lighting supply', 'Vendor', 'Shruti Kapoor'],
      ['c15', 'Urban Seating Co.', 'Loose furniture', 'Vendor', 'Faizan Ahmed'],
      ['c16', 'Sanitary House', 'Sanitaryware & CP fittings', 'Vendor', 'Mukesh Goyal'],
      ['c17', 'Prime Hardware Traders', 'Hardware & fittings', 'Vendor', 'Anand Bhatia'],
      ['c18', 'SmartNest Automation', 'Automation, CCTV & data', 'Contractor', 'Rohan Das'],
      ['c19', 'Laminates Plus', 'Laminates & veneers', 'Vendor', 'Kamal Arora'],
      ['c20', 'Demolition Pro Services', 'Demolition & debris', 'Contractor', 'Bhupinder Singh']
    ];
    db.contractors = CT.map(([id, name, trade, kind, person], i) => ({
      id, name, trade, kind, person, phone: '+91 99' + String(10234567 + i * 91373).slice(0, 8),
      gst: '07AAD' + 'FGHJKLMNPQRSTUVWXYZA'[i] + 'X' + (2310 + i * 37) + 'R1Z' + ((i % 9) + 1), rating: +(3.4 + rnd() * 1.4).toFixed(1),
      retention: 5, missed: 0, quality: 0
    }));

    db.clients = [
      { id: 'cl1', name: 'Arjun & Ritu Kapoor', contact: 'Arjun Kapoor', kind: 'Individual' },
      { id: 'cl2', name: 'Vikram Sharma', contact: 'Vikram Sharma', kind: 'Individual' },
      { id: 'cl3', name: 'Aurum Capital Advisors Pvt. Ltd.', contact: 'Nitin Arora (Admin Head)', kind: 'Company' },
      { id: 'cl4', name: 'Saffron Table Hospitality LLP', contact: 'Gaurav Bhatia (Partner)', kind: 'Company' },
      { id: 'cl5', name: 'Rajiv Mehra', contact: 'Rajiv Mehra', kind: 'Individual' },
      { id: 'cl6', name: 'Anil Verma', contact: 'Anil Verma', kind: 'Individual' },
      { id: 'cl7', name: 'Luxe Living Furnishings', contact: 'Pooja Jain (Director)', kind: 'Company' },
      { id: 'cl8', name: 'Grand Celebrations Banquets', contact: 'Harpreet Sodhi (MD)', kind: 'Company' },
      { id: 'cl9', name: 'Sanjay Gupta', contact: 'Sanjay Gupta', kind: 'Individual' },
      { id: 'cl10', name: 'Nimbus Workspaces Pvt. Ltd.', contact: 'Aditi Rao (Facilities)', kind: 'Company' },
      { id: 'cl11', name: 'Deepak Malhotra', contact: 'Deepak Malhotra', kind: 'Individual' },
      { id: 'cl12', name: 'Brew & Co. Cafés', contact: 'Karan Khanna (Founder)', kind: 'Company' }
    ];
    db.clients.forEach((c, i) => { c.phone = '+91 97' + String(11203040 + i * 55331).slice(0, 8); c.email = c.contact.split(' ')[0].toLowerCase() + '@example.com'; c.gstin = c.kind === 'Company' ? '07AAKC' + 'BCDEFGHJKL'[i % 10] + (4411 + i * 13) + 'Q1Z' + ((i % 8) + 2) : ''; });

    // project: id, code, name, client, type, service, location, area, value, start, due, stage, health, team
    const PJ = [
      ['p1', 'Kapoor Residence', 'cl1', 'Residential villa', 'Turnkey interiors', 'Vasant Kunj, New Delhi', 6800, 285 * L, -150, 40, 'execution', 'at-risk', { pm: 'e1', designer: 'e3', architect: 'e4', site: 'e9', viz: 'e8' }],
      ['p2', 'Sharma Residence', 'cl2', 'Apartment', 'Interior design + execution', 'DLF Phase 5, Gurugram', 3200, 96 * L, -110, 55, 'execution', 'on-track', { pm: 'e2', designer: 'e6', architect: 'e4', site: 'e10', viz: 'e8' }],
      ['p3', 'Aurum Capital Office', 'cl3', 'Commercial office', 'Turnkey fit-out', 'Golf Course Road, Gurugram', 14500, 340 * L, -120, 20, 'execution', 'delayed', { pm: 'e1', designer: 'e7', architect: 'e5', site: 'e10', viz: 'e8' }],
      ['p4', 'Saffron Table Restaurant', 'cl4', 'Hospitality (restaurant)', 'Interior design + turnkey', 'Rajouri Garden, New Delhi', 4200, 135 * L, -45, 120, 'approval', 'at-risk', { pm: 'e2', designer: 'e3', architect: 'e5', site: 'e11', viz: 'e8' }],
      ['p5', 'Mehra Farmhouse', 'cl5', 'Farmhouse', 'Architecture + interiors', 'Chhatarpur, New Delhi', 12000, 420 * L, -30, 330, 'concept', 'on-track', { pm: 'e2', designer: 'e6', architect: 'e4', site: 'e10', viz: 'e8' }],
      ['p6', 'Verma Duplex', 'cl6', 'Residential duplex', 'Renovation turnkey', 'Punjabi Bagh, New Delhi', 2600, 58 * L, -140, 6, 'handover', 'on-track', { pm: 'e2', designer: 'e7', architect: 'e4', site: 'e11', viz: 'e8' }],
      ['p7', 'Luxe Living Showroom', 'cl7', 'Retail showroom', 'Turnkey fit-out', 'Kirti Nagar, New Delhi', 5500, 110 * L, -80, 35, 'execution', 'on-track', { pm: 'e1', designer: 'e6', architect: 'e5', site: 'e11', viz: 'e8' }],
      ['p8', 'Grand Celebrations Banquet', 'cl8', 'Hospitality (banquet)', 'Turnkey interiors', 'Sector 15, Faridabad', 18000, 390 * L, -70, 120, 'execution', 'at-risk', { pm: 'e2', designer: 'e3', architect: 'e5', site: 'e9', viz: 'e8' }],
      ['p9', 'Gupta Apartment', 'cl9', 'Apartment', 'Interior design + execution', 'Dwarka Sector 12, New Delhi', 1850, 42 * L, -190, -20, 'completed', 'on-track', { pm: 'e1', designer: 'e7', architect: 'e4', site: 'e11', viz: 'e8' }],
      ['p10', 'Nimbus Coworking', 'cl10', 'Commercial office', 'Design + project management', 'Sector 62, Noida', 9800, 185 * L, -35, 140, 'drawings', 'on-track', { pm: 'e1', designer: 'e7', architect: 'e5', site: 'e10', viz: 'e8' }],
      ['p11', 'Malhotra Villa', 'cl11', 'Residential villa (new build)', 'Architecture consultancy', 'Sonipat, Haryana', 7500, 32 * L, -10, 210, 'survey', 'on-track', { pm: 'e2', designer: 'e6', architect: 'e4', site: 'e10', viz: 'e8' }],
      ['p12', 'Brew & Co. Café', 'cl12', 'Hospitality (café)', 'Interior design + turnkey', 'Indirapuram, Ghaziabad', 1600, 38 * L, -20, 75, 'approval', 'at-risk', { pm: 'e2', designer: 'e6', architect: 'e4', site: 'e11', viz: 'e8' }]
    ];
    const DESIGNPCT = {
      p1: [100, 100, 100, 100, 100], p2: [100, 100, 100, 100, 100], p3: [100, 100, 100, 100, 100], p4: [100, 100, 65, 80, 35],
      p5: [100, 45, 0, 10, 0], p6: [100, 100, 100, 100, 100], p7: [100, 100, 100, 100, 100], p8: [100, 100, 92, 100, 85],
      p9: [100, 100, 100, 100, 100], p10: [100, 100, 55, 40, 20], p11: [40, 0, 0, 0, 0], p12: [100, 80, 20, 30, 10]
    };
    db.projects = PJ.map(([id, name, client, type, service, location, area, value, s, e, stage, health, team], i) => ({
      id, code: 'HOD-' + (i < 9 ? '25' : '26') + '-' + String(31 + i * 3).padStart(3, '0'), name, client, type, service, location, area, value,
      start: D(s), due: D(e), stage, health, ...team, design: DESIGNPCT[id], co: 0, budgetCost: Math.round(value * (id === 'p11' ? 0.42 : 0.76)),
      closed: stage === 'completed' ? D(-20) : null, dlpUntil: stage === 'completed' ? D(345) : null, accepted: stage === 'completed'
    }));
    const P = id => db.projects.find(p => p.id === id);
    const isExec = p => ['execution', 'handover', 'completed'].includes(p.stage);
    const commercial = p => /office|retail|hospitality/i.test(p.type);

    // ---------- execution plan (WBS) ----------
    const LIB = [
      ['Site mobilisation & protection', 'Civil', 'c6'], ['Demolition & debris removal', 'Demolition', 'c20'], ['Civil & masonry works', 'Civil', 'c6'],
      ['Waterproofing', 'Waterproofing', 'c7'], ['Plumbing first fix', 'Plumbing', 'c3'], ['Electrical conduiting & wiring', 'Electrical', 'c1'],
      ['HVAC ducting & piping', 'HVAC', 'c4'], ['False ceiling framing & boarding', 'False ceiling', 'c5'], ['Flooring, tiling & stone', 'Flooring', 'c9'],
      ['Carpentry & joinery', 'Carpentry', 'c10'], ['Modular kitchen & storage', 'Modular', 'c11'], ['Glass & aluminium', 'Glass', 'c12'],
      ['Painting & polishing', 'Painting', 'c8'], ['Lighting & fixtures', 'Lighting', 'c14'], ['Loose furniture installation', 'Furniture', 'c15'],
      ['Final cleaning', 'Housekeeping', 'c6'], ['Snagging & handover', 'Handover', null]
    ];
    const FR = [[0, .04], [.02, .1], [.06, .3], [.2, .3], [.22, .38], [.24, .45], [.28, .48], [.4, .58], [.45, .68], [.4, .8], [.62, .82], [.7, .85], [.72, .92], [.82, .92], [.88, .96], [.94, .98], [.96, 1]];
    const FACTOR = { p1: .95, p2: 1.02, p3: .8, p6: 1, p7: 1, p8: .9, p9: 1 };
    db.activities = [];
    let aid = 1;
    db.projects.filter(isExec).forEach(p => {
      const s0 = addDays(p.start, Math.round(dd(p.start, p.due) * 0.25));
      const span = dd(s0, p.due);
      LIB.forEach(([name, trade, con], k) => {
        if (k === 10 && commercial(p) && p.id !== 'p8') return;
        let ps = addDays(s0, Math.round(span * FR[k][0])), pe = addDays(s0, Math.round(span * FR[k][1]));
        let exp = Math.max(0, Math.min(1, dd(ps, iso(T0)) / Math.max(1, dd(ps, pe))));
        let prog = Math.round(Math.min(1, exp * (FACTOR[p.id] || 1)) * 100);
        if (dd(pe, iso(T0)) > (p.id === 'p3' ? 8 : 0)) prog = 100;
        if (p.stage === 'completed') prog = 100;
        if (p.stage === 'handover') prog = k === 16 ? 60 : 100;
        const a = { id: 'a' + aid++, project: p.id, name, trade, contractor: con, ps, pe, as: prog > 0 ? ps : null, ae: prog >= 100 ? pe : null, prog, dep: k ? 'a' + (aid - 2) : null, critical: [2, 5, 7, 8, 9, 12, 16].includes(k), note: '' };
        db.activities.push(a);
      });
    });
    const act = (pid, re) => db.activities.find(a => a.project === pid && re.test(a.name));
    // specific situations
    let a1 = act('p1', /Electrical/); a1.pe = D(-6); a1.prog = 70; a1.note = 'Master bedroom & lounge conduits pending; DB not installed';
    let a1b = act('p1', /False ceiling/); a1b.prog = 0; a1b.as = null; a1b.ps = D(-2); a1b.pe = D(14); a1b.note = 'Cannot start: electrical conduiting incomplete';
    let a3 = act('p3', /False ceiling/); a3.ps = D(-24); a3.pe = D(-1); a3.prog = 60; a3.note = 'Milestone: ceiling closure in open office by ' + D(-1);
    let a3b = act('p3', /HVAC/); a3b.prog = 72; a3b.pe = D(-5); a3b.note = 'Ducting delayed 5 days (material at site late)';
    let a8 = act('p8', /Flooring/); a8.ps = D(4); a8.pe = D(32); a8.prog = 0; a8.as = null; a8.note = 'Statuario marble delivery delayed by supplier';
    db.activities.forEach(a => { if (a.prog < 100) a.ae = null; });
    db.projects.filter(isExec).forEach(p => {
      const acts = db.activities.filter(a => a.project === p.id);
      p.progress = Math.round(acts.reduce((s, a) => s + a.prog, 0) / acts.length);
    });
    db.projects.filter(p => !isExec(p)).forEach(p => { p.progress = Math.round(p.design.reduce((s, x) => s + x, 0) / 5 * 0.35); });
    P('p6').progress = 96; P('p9').progress = 100;

    // ---------- drawings ----------
    const DWG = [['AR', 'Architectural floor plan'], ['IN', 'Furniture layout'], ['AR', 'Demolition & partition plan'], ['FC', 'False ceiling layout'],
      ['LT', 'Lighting layout'], ['EL', 'Electrical layout'], ['EL', 'Switch & socket layout'], ['HV', 'HVAC layout'], ['PL', 'Plumbing & drainage layout'],
      ['PL', 'Sanitary fixture layout'], ['FL', 'Flooring layout'], ['IN', 'Wall elevations'], ['IN', 'Kitchen layout & elevations'], ['JN', 'Wardrobe details'],
      ['IN', 'Bathroom detailing'], ['AR', 'Door & window schedule'], ['JN', 'Joinery & carpentry details'], ['JN', 'Furniture fabrication drawings'],
      ['FS', 'Fire & life-safety layout'], ['EL', 'Data, CCTV & automation layout'], ['ST', 'Structural coordination drawing']];
    const R3D = {
      res: ['3D render — living & dining', '3D render — master bedroom', '3D render — kitchen', 'Walkthrough — full home'],
      off: ['3D render — reception', '3D render — open workstations', '3D render — boardroom', 'Walkthrough — office'],
      hos: ['3D render — dining hall', '3D render — bar counter', '3D render — façade & entrance', 'Walkthrough — guest journey'],
      ret: ['3D render — display zones', '3D render — façade', 'Walkthrough — showroom']
    };
    db.drawings = [];
    let did = 1;
    const hist = (status, rev, sub, by, rv) => {
      const h = []; let d = sub;
      for (let r = 0; r <= rev; r++) {
        const last = r === rev;
        h.push({ rev: 'R' + r, date: d, status: 'Submitted', by, note: r ? 'Revised as per comments' : 'First issue' });
        if (!last) { h.push({ rev: 'R' + r, date: addDays(d, 2), status: 'Revision Required', by: rv, note: pick(['Align ceiling levels with HVAC', 'Client wants warmer palette', 'Update dimensions after site measurement', 'Add section through counter', 'Coordinate with structural beam']) }); d = addDays(d, 5); }
      }
      const tail = { 'Internal Review': [], 'Client Review': ['Internal Review'], 'Approved': ['Internal Review', 'Client Review'], 'Issued for Construction': ['Internal Review', 'Client Review', 'Approved'], 'Revision Required': ['Internal Review'] }[status] || [];
      tail.forEach((st, i) => h.push({ rev: 'R' + rev, date: addDays(d, i + 1), status: st, by: st === 'Client Review' ? rv : st === 'Approved' ? 'Client' : rv, note: st === 'Approved' ? 'Approved by client in portal' : '' }));
      if (status === 'Issued for Construction') h.push({ rev: 'R' + rev, date: addDays(d, tail.length + 1), status: 'Issued for Construction', by: rv, note: 'Issued to site & contractors' });
      if (status === 'Revision Required') h.push({ rev: 'R' + rev, date: addDays(d, 2), status: 'Revision Required', by: rv, note: 'See reviewer comments' });
      return h;
    };
    const addDwg = (p, disc, title, status, rev, sub, designer, extra) => {
      const no = p.code.replace('HOD-', '') + '-' + disc + '-' + String(did).padStart(3, '0');
      const h = status === 'Draft' ? [{ rev: 'R0', date: sub, status: 'Draft', by: designer, note: 'Work in progress' }] : hist(status, rev, sub, designer, p.pm);
      const d = Object.assign({ id: 'd' + did++, no, title, disc, project: p.id, designer, rev, status, submitted: sub, reviewer: p.pm, comments: '', history: h, kind: disc === '3D' ? '3D' : '2D' }, extra || {});
      if (status === 'Revision Required') d.comments = h[h.length - 1].note === 'See reviewer comments' ? 'Dimensions to be re-verified at site; update detail sections.' : h[h.length - 1].note;
      db.drawings.push(d); return d;
    };
    db.projects.forEach(p => {
      const set = commercial(p) ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 15, 16, 18, 19] : [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const r3 = /office|cowork/i.test(p.type + p.name) ? R3D.off : /retail/i.test(p.type) ? R3D.ret : /hospitality/i.test(p.type) ? R3D.hos : R3D.res;
      const dz = p.id === 'p3' || p.id === 'p1' ? p.designer : p.designer;
      if (isExec(p)) {
        set.slice(0, p.id === 'p9' ? 9 : 12).forEach((k, j) => {
          const st = (p.id === 'p1' && k === 12) ? 'Client Review' : (p.id === 'p3' && k === 7) ? 'Revision Required' : (p.id === 'p7' && k === 4) ? 'Client Review' : 'Issued for Construction';
          addDwg(p, DWG[k][0], DWG[k][1], st, st === 'Client Review' ? 1 : j % 3 === 0 ? 2 : j % 2, st === 'Client Review' ? D(p.id === 'p1' ? -5 : -8) : addDays(p.start, 10 + j * 3), j % 4 === 3 ? 'e15' : dz);
        });
        r3.slice(0, 2).forEach((t, j) => addDwg(p, '3D', t, 'Approved', 1, addDays(p.start, 15 + j * 4), p.viz));
      } else if (p.stage === 'approval' || p.stage === 'drawings') {
        const n = p.id === 'p10' ? 10 : p.id === 'p4' ? 9 : 5;
        const sts = { p4: ['Approved', 'Approved', 'Client Review', 'Internal Review', 'Internal Review', 'Draft', 'Draft', 'Draft', 'Draft'], p10: ['Approved', 'Approved', 'Client Review', 'Client Review', 'Internal Review', 'Revision Required', 'Internal Review', 'Draft', 'Draft', 'Draft'], p12: ['Client Review', 'Internal Review', 'Draft', 'Draft', 'Draft'] }[p.id];
        set.slice(0, n).forEach((k, j) => addDwg(p, DWG[k][0], DWG[k][1], sts[j], sts[j] === 'Approved' ? 1 : 0, sts[j] === 'Client Review' ? D(p.id === 'p12' ? -6 : -4) : D(-ri(1, 12)), j % 3 === 2 ? 'e15' : p.designer));
        r3.slice(0, 3).forEach((t, j) => {
          if (p.id === 'p4' && j === 0) return;
          const cr = p.id === 'p4' ? j === 1 : j === 0;
          addDwg(p, '3D', t, cr ? 'Client Review' : 'Internal Review', cr ? 1 : 0, cr ? D(p.id === 'p12' ? -6 : -9) : D(-3), p.viz);
        });
      } else if (p.stage === 'concept') {
        [['AR', 'Concept site plan — option A'], ['AR', 'Concept site plan — option B'], ['IN', 'Space planning — ground floor'], ['IN', 'Mood board — living spaces']].forEach((x, j) => addDwg(p, x[0], x[1], j < 2 ? 'Internal Review' : 'Draft', 0, D(-ri(1, 6)), j < 2 ? p.architect : p.designer));
      } else if (p.stage === 'survey') {
        addDwg(p, 'AR', 'Measured drawing — existing site & contours', 'Draft', 0, D(-2), 'e15');
      }
    });
    // Scenario 2 drawing: Saffron Table dining hall render, client asked for changes
    const ds2 = addDwg(P('p4'), '3D', '3D render — dining hall', 'Revision Required', 1, D(-12), 'e8', { id: 'd-s2' });
    ds2.comments = 'Client: make the ceiling warmer, swap blue upholstery for rust and olive, add brass pendant cluster.';
    ds2.history[ds2.history.length - 1].note = ds2.comments; ds2.history[ds2.history.length - 1].by = 'Client';

    // ---------- tasks ----------
    db.tasks = [];
    let tid = 1;
    const TS = ['Not Started', 'In Progress', 'Submitted for Review', 'Revision Required', 'Approved', 'Completed'];
    const addTask = t => { const x = Object.assign({ id: 't' + tid++, status: 'Not Started', priority: 'Medium', created: D(-ri(5, 20)), updated: D(-ri(0, 3)), blocked: '', evidence: 0, category: 'Design', who: 'e' }, t); db.tasks.push(x); return x; };
    // execution tasks from activities
    db.activities.forEach(a => {
      const p = P(a.project);
      if (p.stage === 'completed') return;
      const live = a.prog > 0 && a.prog < 100, soon = a.prog === 0 && dd(iso(T0), a.ps) <= 7, recent = a.prog === 100 && dd(a.pe, iso(T0)) <= 6;
      if (!(live || soon || recent)) return;
      const st = a.prog >= 100 ? 'Completed' : a.prog > 0 ? 'In Progress' : 'Not Started';
      addTask({ title: a.name, project: a.project, who: a.contractor ? 'c' : 'e', assignee: a.contractor || p.site, status: st, due: a.pe, category: 'Site', priority: a.critical ? 'High' : 'Medium', activity: a.id, evidence: a.prog === 100 ? ri(3, 8) : ri(0, 3), done: st === 'Completed' ? a.pe : null });
      if (live && a.critical) addTask({ title: 'Inspect & record progress — ' + a.name.toLowerCase(), project: a.project, assignee: p.site, status: 'In Progress', due: addDays(iso(T0), ri(0, 4)), category: 'Site', activity: a.id });
    });
    const t1 = db.tasks.find(t => t.activity === a1.id && t.who === 'c'); t1.status = 'In Progress'; t1.due = D(-6); t1.priority = 'High'; t1.updated = D(-5);
    const tb = db.tasks.find(t => t.activity === a1b.id && t.who === 'c'); if (tb) { tb.blocked = 'Waiting for electrical conduiting (Volt Electricals)'; tb.status = 'Not Started'; }
    const t3 = db.tasks.find(t => t.activity === a3.id && t.who === 'c'); t3.status = 'In Progress'; t3.due = D(-1); t3.priority = 'High'; t3.id = 't-s4'; t3.updated = D(-3);
    const t8 = db.tasks.find(t => t.activity === a8.id && t.who === 'c'); if (t8) t8.blocked = 'Material not delivered: Statuario marble (PO-2611)';
    // design tasks
    const DT = ['Verify site measurements', 'Space planning options', 'Furniture layout', 'False ceiling layout', 'Lighting layout', 'Electrical layout', 'Plumbing & drainage layout', 'Wall elevations', 'Material & finishes board', '3D renders — key spaces', 'BOQ preparation', 'Client presentation deck', 'Door & window schedule', 'Joinery details'];
    db.projects.filter(p => !isExec(p)).forEach(p => {
      const n = p.stage === 'survey' ? 2 : p.stage === 'concept' ? 7 : 9;
      DT.slice(0, n).forEach((title, j) => {
        const due = D(-8 + j * 3 + ri(-2, 2));
        let st = dd(due, iso(T0)) > 4 ? pick(['Completed', 'Approved', 'Completed']) : dd(due, iso(T0)) > 0 ? pick(['Submitted for Review', 'In Progress', 'Completed']) : pick(['In Progress', 'Not Started', 'Submitted for Review', 'In Progress']);
        if (p.id === 'p4' && j === 9) st = 'Revision Required';
        const who = /3D/.test(title) ? p.viz : /BOQ/.test(title) ? 'e13' : /measure/i.test(title) ? p.site : j % 3 === 2 ? 'e15' : /plumb|electr|door/i.test(title) ? p.architect : p.designer;
        addTask({ title, project: p.id, assignee: who, status: st, due, category: 'Design', priority: j < 3 ? 'High' : 'Medium', done: ['Completed', 'Approved'].includes(st) ? addDays(due, -1) : null });
      });
    });
    // revisions during execution
    [['p1', 'Revise kitchen elevations after client feedback', 'e3', 2, 'Revision Required'], ['p3', 'Update HVAC layout — revised diffuser positions', 'e5', -2, 'In Progress'], ['p7', 'Lighting layout — track light option', 'e6', 3, 'Submitted for Review'], ['p8', 'Stage backdrop detailing', 'e3', 5, 'In Progress'], ['p2', 'Wardrobe internal detailing', 'e6', 4, 'In Progress'], ['p6', 'As-built drawings set', 'e15', 2, 'In Progress']].forEach(([pid, title, who, due, st]) => addTask({ title, project: pid, assignee: who, status: st, due: D(due), category: 'Design', priority: 'High' }));
    // office & admin
    [['p1', 'Raise invoice — Completion milestone (prepare)', 'e12', 6, 'Not Started', 'Finance'], ['p3', 'Payment follow-up — overdue execution invoice', 'e12', -3, 'In Progress', 'Finance'], ['p7', 'Payment follow-up — 50% execution invoice', 'e12', -2, 'In Progress', 'Finance'],
     ['p8', 'Expedite Statuario marble delivery', 'e13', -1, 'In Progress', 'Procurement'], ['p3', 'Compare gypsum board quotations', 'e13', 1, 'Submitted for Review', 'Procurement'], ['p2', 'Issue PO — kitchen hardware', 'e13', 2, 'Not Started', 'Procurement'],
     ['p4', 'Chase client approval — 3D & layouts', 'e14', -2, 'In Progress', 'Admin'], ['p12', 'Follow up proposal decision with Karan', 'e14', -1, 'In Progress', 'Admin'], ['p5', 'Schedule concept presentation', 'e14', 3, 'Not Started', 'Admin'],
     ['p11', 'Contour survey & soil test coordination', 'e10', 4, 'In Progress', 'Site'], ['p6', 'Handover documents compilation', 'e2', 3, 'In Progress', 'Admin'], ['p9', 'Collect client feedback (NPS)', 'e14', -4, 'Not Started', 'Admin'],
     ['p8', 'Weekly progress report to client', 'e2', 1, 'Not Started', 'Admin'], ['p10', 'Design fee invoice follow-up', 'e12', 0, 'In Progress', 'Finance'], ['p1', 'Home theatre change order — update BOQ', 'e13', -4, 'In Progress', 'Procurement'],
     ['p7', 'Signage vendor shortlisting', 'e13', 6, 'Not Started', 'Procurement'], ['p2', 'Client walkthrough — mid-execution', 'e2', 5, 'Not Started', 'Admin']
    ].forEach(([pid, title, who, due, st, cat]) => addTask({ title, project: pid, assignee: who, status: st, due: D(due), category: cat }));
    // top up to at least 100 with inspection / QA tasks
    const QA = ['Quality check — tile lippage', 'Quality check — paint finish', 'Verify carpentry against drawings', 'Measurement for RA bill', 'Material receipt inspection', 'Safety walk & PPE check'];
    let qi = 0;
    while (db.tasks.length < 104) {
      const p = db.projects.filter(x => ['execution', 'handover'].includes(x.stage))[qi % 6];
      const due = D(ri(-6, 9));
      const st = dd(due, iso(T0)) > 2 ? pick(['Completed', 'Completed', 'Approved']) : pick(['Not Started', 'In Progress', 'Submitted for Review', 'Completed']);
      addTask({ title: QA[qi % QA.length], project: p.id, assignee: p.site, status: st, due, category: 'Site', done: st === 'Completed' ? due : null });
      qi++;
    }
    db.tasks.forEach(t => { if (['Completed', 'Approved'].includes(t.status) && !t.done) t.done = dd(t.due, iso(T0)) > 0 ? t.due : D(-ri(0, 3)); if (t.status === 'In Progress' && dd(t.due, iso(T0)) > 3) t.updated = D(-ri(4, 7)); });

    // ---------- site visits ----------
    db.visits = [];
    const OBS = [
      ['Tile lippage in guest bathroom — regrouting needed', 'Workmanship', 'Medium', 'c9'], ['Conduit missing for TV unit wall', 'Design deviation', 'High', 'c1'],
      ['Waterproofing ponding test pending before tiling', 'Workmanship', 'High', 'c7'], ['False ceiling level variation of 8 mm in lobby', 'Workmanship', 'Medium', 'c5'],
      ['Material stacked unsafely near staircase', 'Safety', 'High', 'c6'], ['Paint touch-up needed on staircase wall', 'Workmanship', 'Low', 'c8'],
      ['Wardrobe shutter alignment off by 3 mm', 'Workmanship', 'Low', 'c10'], ['AC drain pipe slope inadequate', 'Workmanship', 'Medium', 'c4'],
      ['Granite edge chipped at kitchen counter', 'Material', 'Medium', 'c9'], ['Debris near entrance; site cleaning not done', 'Safety', 'Low', 'c6'],
      ['Door frame not as per approved drawing', 'Design deviation', 'High', 'c10'], ['Gypsum boards short by ~40 sheets for next week', 'Material', 'High', 'c5']
    ];
    let vid = 1;
    const nv = () => { const n = vid++; return { id: 'v' + n, code: 'SV-' + (2600 + n) }; };
    const visitPlan = [];
    for (let k = 0; k < 30; k++) visitPlan.push(-1 - Math.floor(k * 27 / 30));
    const vProjects = ['p1', 'p3', 'p2', 'p7', 'p8', 'p6', 'p1', 'p3', 'p11', 'p8'];
    visitPlan.forEach((off, k) => {
      const p = P(vProjects[k % vProjects.length]);
      const by = k % 5 === 4 ? p.designer : p.site;
      const n = ri(0, 2);
      const obs = [];
      for (let j = 0; j < n; j++) { const o = pick(OBS); obs.push({ text: o[0], kind: o[1], sev: o[2], contractor: o[3], status: off < -6 ? 'Closed' : 'Open', due: D(off + 4) }); }
      db.visits.push({
        ...nv(), project: p.id, by, date: D(off), time: pick(['09:40', '10:15', '11:05', '12:30', '14:10', '15:45', '16:20']), status: 'Completed',
        checkout: pick(['11:20', '12:45', '13:30', '16:00', '17:10', '18:05']), geo: 'Verified with consent', photos: ri(3, 8), progress: Math.max(5, p.progress - Math.round(-off * 0.8)),
        obs, done: pick(['Ceiling framing completed in east wing', 'Kitchen base units installed', 'Electrical first fix 80% done', 'Stone flooring in lobby laid', 'Primer coat completed', 'Plumbing pressure test passed', 'Partition walls closed', 'Site measurements re-verified']),
        pending: pick(['Ceiling boarding in conference room', 'Wardrobe shutters awaited', 'DB installation', 'Polishing of marble', 'Light fixtures pending delivery', 'Bathroom fixtures installation']),
        next: pick(['Inspect again on Friday with PM', 'Contractor to add 4 workers', 'Client walkthrough next week', 'Measurement for RA bill']),
        present: [act(p.id, /Electrical/)?.contractor, act(p.id, /Carpentry/)?.contractor].filter(Boolean), weather: pick(['Clear', 'Hazy', 'Clear']), seed: 100 + vid
      });
    });
    // today
    db.visits.push({ ...nv(), project: 'p7', by: 'e11', date: D(0), time: '09:50', status: 'Completed', checkout: '11:35', geo: 'Verified with consent', photos: 6, progress: P('p7').progress, obs: [{ text: 'Glass partition channel not fixed at display zone B', kind: 'Workmanship', sev: 'Medium', contractor: 'c12', status: 'Open', due: D(3) }], done: 'Display niche carcasses installed', pending: 'Track light fixtures', next: 'Glass partition re-check Thursday', present: ['c12', 'c10'], weather: 'Clear', seed: 300 });
    [['p1', 'e9', '12:30'], ['p3', 'e10', '14:00'], ['p8', 'e9', '16:30'], ['p11', 'e10', '11:00']].forEach(([pid, by, time], j) => db.visits.push({ ...nv(), project: pid, by, date: D(0), time, status: j === 3 ? 'Completed' : 'Scheduled', checkout: j === 3 ? '12:40' : '', geo: j === 3 ? 'Verified with consent' : '', photos: j === 3 ? 9 : 0, progress: P(pid).progress, obs: [], done: j === 3 ? 'Contour survey started; soil test pits marked' : '', pending: '', next: '', present: [], weather: 'Clear', seed: 310 + j }));
    [['p2', 'e10', 1, '10:30'], ['p6', 'e11', 1, '15:00'], ['p8', 'e5', 2, '11:00'], ['p3', 'e1', 2, '12:00'], ['p5', 'e4', 3, '10:00']].forEach(([pid, by, off, time], j) => db.visits.push({ ...nv(), project: pid, by, date: D(off), time, status: 'Scheduled', checkout: '', geo: '', photos: 0, progress: P(pid).progress, obs: [], done: '', pending: '', next: '', present: [], weather: '', seed: 320 + j }));

    // ---------- snags / quality observations ----------
    db.snags = [];
    let sid = 1;
    db.visits.filter(v => v.status === 'Completed').forEach(v => v.obs.forEach(o => db.snags.push({ id: 's' + sid++, project: v.project, area: pick(['Living', 'Master bedroom', 'Kitchen', 'Lobby', 'Conference room', 'Guest bath', 'Display zone', 'Banquet hall']), trade: db.contractors.find(c => c.id === o.contractor).trade, text: o.text, sev: o.sev, kind: o.kind, status: o.status === 'Closed' ? 'Closed' : pick(['Open', 'In progress', 'Ready for reinspection']), contractor: o.contractor, due: o.due, raised: v.date, visit: v.id, seed: v.seed })));
    // handover snags on p6
    [['Master bath', 'Silicone joint uneven at vanity', 'Low', 'c16'], ['Staircase', 'Paint touch-up on handrail', 'Low', 'c8'], ['Kitchen', 'Drawer soft-close not working (1 no.)', 'Medium', 'c11'], ['Terrace', 'Glass railing gasket loose', 'Medium', 'c12']].forEach(([area, text, sev, c], j) =>
      db.snags.push({ id: 's' + sid++, project: 'p6', area, trade: db.contractors.find(x => x.id === c).trade, text, sev, kind: 'Snag', status: j === 0 ? 'Ready for reinspection' : 'Open', contractor: c, due: D(2), raised: D(-3), visit: null, seed: 400 + j, handover: true }));

    // ---------- finance: invoices & payments ----------
    const MS_T = [['Advance on signing', .10], ['Design approval', .15], ['Execution start', .25], ['50% execution', .25], ['Completion', .20], ['Handover', .05]];
    const MS_D = [['Advance', .20], ['Concept approval', .25], ['Working drawings', .30], ['Final drawings & PMC', .25]];
    const PLAN = { // per project: [count invoiced, special states]
      p1: [4, { 3: ['overdue', -21, -6] }], p2: [3, { 2: ['due', -11, 4] }], p3: [4, { 3: ['overdue', -40, -25] }], p4: [1, {}], p5: [1, {}], p6: [5, { 4: ['due', -8, 7] }],
      p7: [4, { 3: ['overdue', -27, -12] }], p8: [3, { 2: ['due', -10, 5] }], p9: [6, {}], p10: [2, { 1: ['overdue', -18, -3] }], p11: [1, {}], p12: [1, { 0: ['partial', -18, -8] }]
    };
    db.invoices = []; db.payments = [];
    let inv = 401, pay = 1;
    db.projects.forEach(p => {
      const ms = /design|consult|architecture/i.test(p.service) && !/turnkey|execution|interiors/i.test(p.service) ? MS_D : MS_T;
      p.milestones = ms.map(([name, pct], k) => ({ name, pct, amount: Math.round(p.value * pct), invoiced: false, expected: addDays(p.start, Math.round(dd(p.start, p.due) * (k + 0.5) / ms.length)) }));
      const [n, sp] = PLAN[p.id];
      for (let k = 0; k < n; k++) {
        const m = p.milestones[k]; m.invoiced = true;
        const s = sp[k];
        const raised = s ? D(s[1]) : addDays(p.start, Math.round(dd(p.start, iso(T0)) * (k + 0.3) / Math.max(n, 1)));
        const due = s ? D(s[2]) : addDays(raised, 15);
        const total = Math.round(m.amount * 1.18);
        const x = { id: 'i' + inv, no: 'HOD/25-26/' + String(inv).padStart(4, '0'), project: p.id, milestone: m.name, taxable: m.amount, gst: Math.round(m.amount * 0.18), total, raised, due, paid: 0, reminders: [] };
        if (!s) { x.paid = total; db.payments.push({ id: 'pay' + pay++, invoice: x.id, project: p.id, amount: total, date: addDays(due, -ri(0, 5)), mode: pick(['NEFT', 'RTGS', 'IMPS', 'Cheque']), ref: 'UTR' + (88123400 + inv * 17), verified: true, verifiedBy: 'e12', source: 'Bank reconciliation' }); }
        if (s && s[0] === 'partial') { x.paid = Math.round(total / 2); db.payments.push({ id: 'pay' + pay++, invoice: x.id, project: p.id, amount: x.paid, date: D(-15), mode: 'NEFT', ref: 'UTR' + (88123400 + inv * 17), verified: true, verifiedBy: 'e12', source: 'Bank reconciliation' }); }
        if (s && s[0] === 'overdue') x.reminders.push({ date: D(s[2] + 3), channel: 'Email', by: 'e12', note: 'Gentle reminder sent' });
        db.invoices.push(x); inv++;
      }
      if (p.id === 'p12') db.payments.push({ id: 'pay' + pay++, invoice: 'i' + (inv - 1), project: 'p12', amount: Math.round(p.milestones[0].amount * 1.18 / 2), date: D(-1), mode: 'NEFT', ref: 'Client shared screenshot', verified: false, verifiedBy: '', source: 'Client message (WhatsApp)' });
    });
    db.invoices.find(i => i.project === 'p7' && i.milestone === '50% execution').id = 'i-s5';
    db.history = []; // last 6 months billed vs collected (₹), includes earlier projects not in the active list
    for (let m = 5; m >= 0; m--) { const d = new Date(T0); d.setDate(1); d.setMonth(d.getMonth() - m); db.history.push({ month: d.toLocaleString('en-IN', { month: 'short' }), billed: Math.round((88 + rnd() * 70) * L), collected: Math.round((70 + rnd() * 60) * L) }); }
    db.history[5].billed = Math.round(db.invoices.filter(i => dd(i.raised, iso(T0)) <= T0.getDate()).reduce((s, i) => s + i.total, 0) || 96 * L);

    // contractor bills (₹ excl. GST)
    db.bills = [
      ['c1', 'p1', 'RA bill 2 — electrical first fix', 6.4, 'Submitted', -3], ['c10', 'p1', 'RA bill 1 — carpentry', 11.8, 'PM verified', -5], ['c5', 'p3', 'RA bill 1 — false ceiling', 7.2, 'Approved', -8],
      ['c4', 'p3', 'RA bill 2 — HVAC ducting', 14.5, 'PM verified', -4], ['c9', 'p2', 'RA bill 1 — flooring', 5.6, 'Submitted', -2], ['c3', 'p2', 'Final bill — plumbing', 2.9, 'Paid', -16],
      ['c8', 'p6', 'Final bill — painting & polish', 3.4, 'Approved', -12], ['c12', 'p7', 'RA bill 1 — glass partitions', 4.1, 'Submitted', -1], ['c6', 'p8', 'RA bill 1 — civil & masonry', 9.8, 'PM verified', -6],
      ['c11', 'p2', 'Advance — modular kitchen', 6.0, 'Paid', -24]
    ].map(([c, pid, title, amt, status, off], i) => ({ id: 'b' + (i + 1), no: 'CB-' + (1180 + i), contractor: c, project: pid, title, amount: Math.round(amt * L), status, date: D(off), due: D(off + 14), retention: Math.round(amt * L * 0.05), measuredBy: status === 'Submitted' ? '' : P(pid).site }));

    // change requests
    db.changes = [
      ['p1', 'Add home theatre acoustic panels in basement', 'Client', 'Approved', 6.8, 10, ['Wall elevations', 'Electrical layout'], 'Implementation in progress'],
      ['p3', 'Additional meeting room with glass partition', 'Client', 'Awaiting client approval', 9.2, 8, ['Architectural floor plan', 'False ceiling layout', 'HVAC layout'], ''],
      ['p7', 'Display niche lighting changed to track lights', 'Designer', 'Impact estimated', 1.4, 3, ['Lighting layout'], 'Owner approval needed (margin impact)'],
      ['p8', 'Upgrade stage backdrop to fluted stone', 'Client', 'Under review', 0, 0, ['Wall elevations'], ''],
      ['p6', 'Replace bathroom vanity top with quartz', 'Client', 'Implemented', 0.85, 0, ['Bathroom detailing'], 'Closed'],
      ['p10', 'Add six phone booths in open office', 'Client', 'Raised', 0, 0, [], '']
    ].map(([pid, title, by, status, cost, days, dwg, note], i) => ({ id: 'cr' + (i + 1), no: 'CR-' + (51 + i), project: pid, title, raisedBy: by, status, cost: Math.round(cost * L), days, drawings: dwg, tasks: [], materials: [], note, date: D(-ri(3, 30)), log: [{ date: D(-ri(15, 30)), text: 'Raised by ' + by.toLowerCase() }] }));
    P('p1').co = 6.8 * L; P('p6').co = 0.85 * L;

    // procurement
    const MAT = [
      ['p1', 'Modular switch plates — matte black', '62 nos.', 'Requisition', 'c14', 4, 0.9, false], ['p1', 'Teak veneer — quarter cut', '85 sheets', 'Delivered', 'c19', -6, 3.4, false],
      ['p1', 'Acoustic fabric panels (change order)', '42 sqm', 'Quotes', null, 10, 2.1, false], ['p3', 'Gypsum boards 12.5 mm', '420 sheets', 'Compared', 'c5', 2, 2.6, true],
      ['p3', 'Carpet tiles — charcoal loop', '1,250 sqm', 'PO issued', 'c15', 9, 11.2, false], ['p3', 'Glass for cabins — 12 mm toughened', '310 sqm', 'Inspected', 'c12', -5, 7.4, false],
      ['p2', 'Kitchen hardware set', '1 lot', 'Approved', 'c17', 6, 1.6, false], ['p2', 'Vitrified tiles 1200×1200', '2,900 sq ft', 'Consumed', 'c9', -20, 3.1, false],
      ['p2', 'CP fittings — master & guest bath', '1 lot', 'PO issued', 'c16', 8, 2.2, false], ['p7', 'Track lights 24 W', '96 nos.', 'Quotes', null, 12, 1.9, false],
      ['p7', 'Display plinths — MDF duco', '18 nos.', 'Delivered', 'c10', -2, 2.4, false], ['p8', 'Statuario marble slabs', '3,600 sq ft', 'PO issued', 'c9', 2, 38, true],
      ['p8', 'Crystal chandeliers', '6 nos.', 'Quotes', null, 30, 14.5, false], ['p8', 'Fluted wall panels', '640 sq ft', 'Requirement', null, 25, 3.8, false],
      ['p6', 'Quartz vanity top', '2 nos.', 'Consumed', 'c16', -14, 0.6, false], ['p6', 'Curtain tracks (motorised)', '5 nos.', 'Inspected', 'c18', -4, 1.1, false],
      ['p4', 'Brass pendant cluster (sample)', '1 no.', 'Requirement', null, 20, 0.4, false], ['p10', 'Workstation system — sample bay', '1 set', 'Requisition', 'c11', 15, 1.2, false],
      ['p3', 'HVAC diffusers — linear slot', '140 nos.', 'Delivered', 'c4', -1, 4.3, false], ['p1', 'Laminate — fluted oak', '60 sheets', 'In transit', 'c19', 2, 1.4, false],
      ['p7', 'Signage letters — brushed brass', '1 lot', 'Requirement', null, 22, 1.8, false], ['p8', 'Stage truss & rigging', '1 lot', 'Approved', 'c13', 18, 6.2, false],
      ['p2', 'Wardrobe glass shutters — bronze tint', '14 nos.', 'Quotes', null, 9, 1.3, false], ['p1', 'Smart lighting controller', '1 lot', 'PO issued', 'c18', 5, 2.7, false]
    ];
    db.materials = MAT.map(([pid, item, qty, stage, vendor, need, lakh, short], i) => ({ id: 'm' + (i + 1), no: (['PO issued', 'In transit', 'Delivered', 'Inspected', 'Consumed'].includes(stage) ? 'PO-' : 'PR-') + (2600 + i), project: pid, item, qty, stage, vendor, needBy: D(need), value: Math.round(lakh * L), shortage: short, note: short ? (pid === 'p8' ? 'Supplier delayed dispatch by 9 days; flooring start blocked' : 'Stock covers 3 days of work; next lot needed by ' + D(need)) : '' }));
    db.quotes = [
      { material: 'm4', rows: [['c5', 'Skyline Ceilings (supply + fix)', 615, 4], ['c17', 'Prime Hardware Traders', 598, 7], ['x', 'Delhi Gypsum Depot (new)', 572, 10]] },
      { material: 'm10', rows: [['c14', 'Lumina Lighting Studio', 1980, 6], ['x', 'Spectra Lights (new)', 1720, 12], ['c2', 'BrightWire Services', 2050, 5]] },
      { material: 'm13', rows: [['c14', 'Lumina Lighting Studio', 245000, 28], ['x', 'Crystal Arts Moradabad (new)', 212000, 35], ['x', 'Imported via agent', 290000, 50]] }
    ];

    // leads / CRM
    const LN = ['Rahul Khanna', 'Meera Iyer', 'Siddharth Jain', 'Pooja Bhalla', 'Amit Saxena', 'Kavita Reddy', 'Harsh Vardhan', 'Tanya Grover', 'Rohan Mehta', 'Anjali Chopra', 'Vivek Taneja', 'Shalini Bose', 'Mohit Agarwal', 'Ritika Sood', 'Gautam Oberoi', 'Nisha Pillai', 'Kunal Bedi', 'Ayesha Khan', 'Prateek Goel', 'Divya Menon', 'Sameer Ahuja', 'Isha Bajaj', 'Aakash Thakur', 'Farah Siddiqui', 'Yash Raheja'];
    const STG = ['New Lead', 'New Lead', 'New Lead', 'New Lead', 'Qualified', 'Qualified', 'Qualified', 'Qualified', 'Consultation', 'Consultation', 'Consultation', 'Site Visit', 'Site Visit', 'Site Visit', 'Proposal', 'Proposal', 'Proposal', 'Proposal', 'Negotiation', 'Negotiation', 'Won', 'Won', 'Lost', 'Lost', 'New Lead'];
    const LT = ['3BHK apartment', '4BHK apartment', 'Builder floor', 'Villa', 'Farmhouse', 'Office', 'Retail store', 'Restaurant', 'Café', 'Clinic', 'Banquet hall', 'Penthouse'];
    const LOC = ['Paschim Vihar', 'Punjabi Bagh', 'Dwarka', 'Rajouri Garden', 'Janakpuri', 'Gurugram Sector 54', 'Noida Sector 50', 'Greater Kailash', 'Vasant Vihar', 'Faridabad', 'Indirapuram', 'Sonipat', 'Rohini', 'Saket', 'Golf Course Ext. Road'];
    const SRC = ['Website', 'Instagram', 'WhatsApp', 'Referral', 'Walk-in', 'Phone call', 'Email'];
    db.leads = LN.map((name, i) => {
      const type = LT[i % LT.length], budget = Math.round((/office|banquet|farm|villa|restaurant/i.test(type) ? ri(60, 300) : ri(18, 90)) * L), src = SRC[(i * 3) % SRC.length];
      const area = /office|banquet|farm/i.test(type) ? ri(4000, 15000) : ri(1400, 5200);
      const score = Math.min(97, Math.round(35 + budget / L / 6 + (src === 'Referral' ? 18 : src === 'Website' ? 8 : 4) + ri(0, 14)));
      const stage = STG[i];
      return { id: 'l' + (i + 1), name, phone: '+91 96' + String(20304050 + i * 61027).slice(0, 8), source: src, type, location: LOC[i % LOC.length], area, budget, service: pick(['Interior design', 'Turnkey interiors', 'Architecture', 'Renovation', 'Turnkey interiors', 'Project management']), stage, score, owner: i % 4 === 3 ? 'e2' : i % 7 === 5 ? 'e1' : 'e14', created: D(-ri(1, 40)), next: stage === 'Won' || stage === 'Lost' ? null : D(ri(-3, 6)), notes: pick(['Wants Italian kitchen; moving in by March', 'Referred by an earlier client; values detailing', 'Comparing three firms; price-sensitive', 'Needs design + execution; site in possession', 'Office for 80 seats; landlord fit-out period 60 days', 'Looking for modern minimal; budget flexible']), lost: stage === 'Lost' ? pick(['Chose a cheaper local contractor', 'Project postponed']) : '', expectedClose: D(ri(5, 40)) };
    });

    // calendar
    db.events = [
      { id: 'ev1', title: 'Client presentation — Saffron Table 3D & layouts', type: 'Client meeting', date: D(0), time: '11:30', dur: 60, project: 'p4', people: ['e3', 'e8', 'e2'], where: 'Video call' },
      { id: 'ev2', title: 'Internal design review — Nimbus Coworking', type: 'Internal review', date: D(0), time: '16:00', dur: 45, project: 'p10', people: ['e5', 'e7', 'e1'], where: 'Studio, Paschim Vihar' },
      { id: 'ev3', title: 'Consultation — Rohan Mehta (penthouse)', type: 'Sales', date: D(1), time: '12:00', dur: 60, project: null, people: ['e14', 'e0'], where: 'Studio, Paschim Vihar' },
      { id: 'ev4', title: 'Contractor coordination — Aurum Capital', type: 'Site meeting', date: D(1), time: '15:30', dur: 60, project: 'p3', people: ['e1', 'e10'], where: 'Site' },
      { id: 'ev5', title: 'Mid-execution walkthrough — Sharma Residence', type: 'Client meeting', date: D(5), time: '11:00', dur: 90, project: 'p2', people: ['e2', 'e6', 'e10'], where: 'Site' },
      { id: 'ev6', title: 'Weekly project review', type: 'Internal review', date: D(2), time: '10:00', dur: 60, project: null, people: ['e0', 'e1', 'e2'], where: 'Studio, Paschim Vihar' },
      { id: 'ev7', title: 'Handover walkthrough — Verma Duplex', type: 'Handover', date: D(6), time: '11:00', dur: 120, project: 'p6', people: ['e2', 'e7', 'e11'], where: 'Site' },
      { id: 'ev8', title: 'Concept presentation — Mehra Farmhouse', type: 'Client meeting', date: D(4), time: '17:00', dur: 90, project: 'p5', people: ['e4', 'e6', 'e0'], where: 'Studio, Paschim Vihar' }
    ];
    db.leaves = [{ who: 'e7', from: D(-1), to: D(2), type: 'Planned leave' }, { who: 'e15', from: D(6), to: D(7), type: 'Planned leave' }, { who: 'e8', from: D(12), to: D(16), type: 'Planned leave' }];

    // documents
    db.docs = [];
    let docid = 1;
    db.projects.forEach(p => {
      [['Signed contract & scope', 'Contract', 'Internal + client'], ['Commercial proposal (final)', 'Proposal', 'Internal + client'], ['BOQ & rate analysis', 'BOQ', 'Internal'], ['Payment schedule', 'Finance', 'Internal + client']].forEach(([n, t, acc], j) => {
        if (p.stage === 'survey' && j > 1) return;
        db.docs.push({ id: 'doc' + docid++, project: p.id, name: n, type: t, ver: j === 2 ? 'v3' : 'v1', by: j === 2 ? 'e13' : 'e2', date: addDays(p.start, j * 2), access: acc, status: 'Current' });
      });
      if (j6(p)) [['Warranty — modular kitchen hardware', 'Warranty'], ['Operation manual — VRV system', 'Manual'], ['As-built drawings set', 'As-built']].forEach(([n, t]) => db.docs.push({ id: 'doc' + docid++, project: p.id, name: n, type: t, ver: 'v1', by: 'e2', date: p.stage === 'completed' ? D(-22) : D(-1), access: 'Internal + client', status: p.stage === 'completed' ? 'Current' : 'Pending' }));
      if (p.id === 'p11') db.docs.push({ id: 'doc' + docid++, project: p.id, name: 'Site survey — existing photos', type: 'Survey', ver: 'v1', by: 'e10', date: D(0), access: 'Internal', status: 'Current' });
      if (['p1', 'p3', 'p8'].includes(p.id)) db.docs.push({ id: 'doc' + docid++, project: p.id, name: 'Society / building NOC for interior works', type: 'Approval', ver: 'v1', by: 'e2', date: addDays(p.start, 20), access: 'Internal', status: 'Current' });
    });
    function j6(p) { return p.stage === 'handover' || p.stage === 'completed'; }

    // conversations
    db.threads = [
      { id: 'th1', project: 'p1', title: 'Kapoor Residence — client', msgs: [['cl', 'Arjun Kapoor', 'Can we see the lounge ceiling before closing it?', -3], ['e', 'e1', 'Yes — ceiling starts once electrical is complete. We will share photos for your approval first.', -3], ['cl', 'Arjun Kapoor', 'Great, thanks. Also please confirm the theatre panel colour.', -1]] },
      { id: 'th2', project: 'p4', title: 'Saffron Table — design', msgs: [['cl', 'Gaurav Bhatia', 'The dining hall feels a bit cold in the render. Can we warm it up?', -12], ['e', 'e3', 'Noted. Revised render with warmer ceiling and rust/olive upholstery coming this week.', -11]] },
      { id: 'th3', project: 'p7', title: 'Luxe Living — accounts', msgs: [['e', 'e12', 'Gentle reminder: invoice for 50% execution is due. PDF attached in your portal.', -9], ['cl', 'Pooja Jain', 'Will be processed in the next payment run.', -8]] },
      { id: 'th4', project: 'p2', title: 'Sharma Residence — client', msgs: [['cl', 'Vikram Sharma', 'Loving the progress photos. Kitchen looks great.', -2]] }
    ].map(t => ({ ...t, msgs: t.msgs.map(([k, who, text, off]) => ({ kind: k, who, text, date: D(off) })) }));

    // automation rules
    db.rules = [
      ['r1', 'New lead → create record & assign owner', 'Enquiry received (website, WhatsApp, Instagram, call log)', 'Create lead, score it, assign by location and load, schedule first follow-up within 2 hours', 0, false],
      ['r2', 'Site survey done → design brief review', 'Site survey report submitted', 'Create "Design brief review" task for lead designer, due in 2 days', 0, false],
      ['r3', 'Drawing submitted → notify reviewer', 'Designer submits drawing or render', 'Notify reviewer (PM / principal); remind after 1 day; escalate after 3 days', 3, false],
      ['r4', 'Client approval → release next stage', 'Client approves drawing in portal', 'Mark approved, release next workflow stage, notify team & site', 0, false],
      ['r5', 'Task overdue → remind & escalate', 'Task passes due date without completion', 'Remind assignee at once; escalate to PM after 1 day and to owner after 3 days', 3, false],
      ['r6', 'Site visit done → report & action items', 'Supervisor submits site visit', 'Generate visit report draft, create a task for every observation needing action', 0, false],
      ['r7', 'Contractor completion → inspection', 'Contractor marks work complete', 'Create inspection task for site engineer before acceptance & billing', 0, false],
      ['r8', 'Invoice overdue → payment reminder', 'Invoice crosses due date', 'Draft reminder for accounts approval, send on approval, repeat every 7 days, escalate to owner at 15 days', 15, true],
      ['r9', 'Change approved → notify stakeholders', 'Change request approved', 'Update budget & schedule, revise affected drawings, notify contractors and team', 0, true],
      ['r10', 'Handover approaching → snag checklist', 'Project within 14 days of handover', 'Generate snag list & handover checklist, book client walkthrough', 0, false]
    ].map(([id, name, trigger, action, esc, gate]) => ({ id, name, trigger, action, esc, gate, on: true, runs: ri(12, 140), fails: 0 }));
    db.rules.find(r => r.id === 'r8').fails = 1;
    db.autolog = [
      ['r5', 'Escalated to Ankit Bansal: "Electrical conduiting & wiring" (Kapoor Residence) overdue 6 days', 'Success', -1],
      ['r8', 'WhatsApp reminder for HOD/25-26/0413 (Aurum Capital) — template not yet approved by Meta', 'Failed', -1],
      ['r6', 'Site visit report SV-2631 drafted; 1 action item created (Luxe Living)', 'Success', 0],
      ['r3', 'Reviewer Priya Nair notified: 3 drawings submitted (Nimbus Coworking)', 'Success', 0],
      ['r1', 'New Instagram enquiry (Yash Raheja) assigned to Simran Kaur', 'Success', -2],
      ['r10', 'Snag checklist generated for Verma Duplex (handover in 6 days)', 'Success', -2],
      ['r8', 'Reminder drafted for HOD/25-26/0419 (Luxe Living) — awaiting accounts approval', 'Awaiting approval', 0],
      ['r7', 'Inspection task created: glass partitions (Luxe Living)', 'Success', -1],
      ['r4', 'Released stage "Working drawings" for Nimbus Coworking after client approval', 'Success', -3]
    ].map(([rule, text, status, off], i) => ({ id: 'al' + (i + 1), rule, text, status, date: D(off), time: pick(['08:05', '09:30', '10:12', '13:45', '17:20', '19:02']) }));

    // notifications
    db.notes = [
      ['Overdue', 'Electrical conduiting at Kapoor Residence is 6 days late — blocks false ceiling', 'project-p1', true, -1],
      ['Approval', 'Contractor bill CB-1181 (Woodline, ₹11.8 L) verified by PM — needs your approval', 'finance', true, 0],
      ['Approval', 'Change CR-53 (Luxe Living, +₹1.4 L) needs your approval', 'project-p7', true, 0],
      ['Payment', 'HOD/25-26/0412 (Aurum Capital) overdue 25 days', 'finance', true, -1],
      ['Client', 'Saffron Table has not responded to 3D renders for 9 days', 'drawings', true, 0],
      ['Site', 'Site visit SV-2631 submitted for Luxe Living (1 observation)', 'visits', false, 0],
      ['Material', 'Statuario marble for Grand Celebrations delayed 9 days', 'procurement', true, -1],
      ['Lead', '4 new enquiries this week; 2 follow-ups overdue', 'leads', false, -1],
      ['System', 'WhatsApp reminder failed: template pending Meta approval', 'automation', false, -1],
      ['Payment', 'Brew & Co. says ₹' + (Math.round(P('p12').milestones[0].amount * 1.18 / 2)).toLocaleString('en-IN') + ' paid — verify in bank statement', 'finance', true, -1]
    ].map(([kind, text, go, action, off], i) => ({ id: 'n' + (i + 1), kind, text, go, action, read: false, date: D(off) }));

    db.activity = [
      ['e11', 'Submitted site visit SV-2631 with 6 photos', 'p7', 0], ['e8', 'Uploaded 3D render — reception R0 for internal review', 'p10', 0], ['e12', 'Verified payment UTR88130217 against invoice', 'p9', -1],
      ['e3', 'Revised kitchen elevations sent for client review', 'p1', -1], ['e1', 'Escalated delayed electrical work to Volt Electricals', 'p1', -1], ['e13', 'Raised PR-2603 gypsum boards', 'p3', -2],
      ['e14', 'Converted lead Sanjay Gupta referral into consultation', null, -2], ['e2', 'Approved snag checklist for Verma Duplex', 'p6', -2]
    ].map(([who, text, project, off], i) => ({ id: 'ac' + (i + 1), who, text, project, date: D(off), time: pick(['09:12', '10:40', '12:05', '15:22', '17:48']) }));

    db.scenarios = {};
    db.clock = 0;
    return db;
  };
})();
