/* 3D design viewer (three.js), uploads of models and renders, photo lightbox, and the Design Studio view */
(function () {
  const H = window.HOD, S = H.S, esc = H.esc, db = H.db, ic = H.ic, R = H.R;
  const V = H.V3D = { lib: null, loading: false, ready: false, spin: true, name: 'Sample: living room by HOD', files: {}, kinds: {} };

  // ---------- picture helper for a drawing (uploaded render > portfolio photo > plan) ----------
  H.dwgImg = x => {
    if (V.files[x.id] && V.kinds[x.id] === 'image') return `<img class="ph" src="${V.files[x.id]}" alt="${esc(x.title)}">`;
    if (x.kind === '3D') return H.thumb(H.hue(x.id) + x.rev, 'render', x.title, x.project);
    return H.plan(H.hue(x.id), x.title);
  };

  // ---------- viewer markup ----------
  V.html = h => `<div class="v3d" id="v3d" style="min-height:${h || 460}px"><div class="load">${ic('layers')}&nbsp; Loading the 3D viewer…</div><div class="ov"><span class="pill plain" id="v3d-name">${esc(V.name)}</span><div class="row" style="gap:6px">${S.role === 'client' ? '' : `<button class="btn sm" data-act="v3d-sample">Sample room</button><label class="btn sm">${ic('upload')}Open .glb<input type="file" accept=".glb,.gltf" hidden data-chg="v3d-file"></label>`}<button class="btn sm" data-act="v3d-spin">${V.spin ? 'Pause' : 'Rotate'}</button><button class="btn sm" data-act="v3d-reset">Reset</button></div></div><div class="hint">Drag to orbit · scroll or pinch to zoom · right-drag to pan</div></div>`;

  const loadLib = async () => {
    if (V.lib) return V.lib;
    const THREE = await import('three');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    V.lib = { THREE, OrbitControls, GLTFLoader };
    return V.lib;
  };
  const canvasTex = (THREE, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  // a furnished living room built from primitives, in the studio's palette
  const buildRoom = THREE => {
    const g = new THREE.Group();
    const mat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .75, metalness: 0 }, o || {}));
    const box = (w, h, d, m, x, y, z, ry) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); if (ry) b.rotation.y = ry; b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
    const cyl = (rt, rb, h, m, x, y, z, seg) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 32), m); c.position.set(x, y, z); c.castShadow = true; c.receiveShadow = true; g.add(c); return c; };
    const wood = canvasTex(THREE, 512, 512, (x, w, h) => { for (let i = 0; i < 8; i++) { const l = 120 + (i * 37) % 30; x.fillStyle = `rgb(${l + 40},${l + 6},${l - 34})`; x.fillRect(0, i * h / 8, w, h / 8); x.strokeStyle = 'rgba(60,35,15,.35)'; x.beginPath(); x.moveTo(0, i * h / 8); x.lineTo(w, i * h / 8); x.stroke(); for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(80,50,25,.12)'; x.beginPath(); const y0 = i * h / 8 + Math.random() * h / 8; x.moveTo(0, y0); x.bezierCurveTo(w * .3, y0 + 4, w * .6, y0 - 4, w, y0 + 2); x.stroke(); } x.fillStyle = 'rgba(40,20,5,.35)'; x.fillRect(((i * 211) % w), i * h / 8, 2, h / 8); } });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), mat('#ffffff', { map: wood, roughness: .55 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
    const wallM = mat('#ECE5DA', { roughness: .95 }), wall2 = mat('#E4DCCD', { roughness: .95 });
    box(9, 3.4, .14, wallM, 0, 1.7, -4.5); box(.14, 3.4, 9, wall2, -4.5, 1.7, 0);
    // fluted walnut feature wall with brass inlay and arched niche
    const walnut = mat('#6B4A33', { roughness: .5 }), brass = mat('#B48C55', { metalness: .85, roughness: .28 });
    for (let i = 0; i < 26; i++) box(.09, 2.9, .06, walnut, -1.6 + i * .125, 1.45, -4.39);
    box(3.3, .04, .08, brass, 0, 2.92, -4.36);
    const arch = canvasTex(THREE, 512, 640, (x, w, h) => { x.fillStyle = '#F3EEE6'; x.fillRect(0, 0, w, h); const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#C9774F'); gr.addColorStop(1, '#B48C55'); x.fillStyle = gr; x.beginPath(); x.moveTo(70, h - 40); x.lineTo(70, 230); x.arc(w / 2, 230, w / 2 - 70, Math.PI, 0); x.lineTo(w - 70, h - 40); x.closePath(); x.fill(); x.fillStyle = '#1E4A40'; x.beginPath(); x.arc(w / 2, 300, 90, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, 420, 150, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); });
    const art = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.32), mat('#ffffff', { map: arch, roughness: .9 })); art.position.set(2.75, 1.75, -4.42); g.add(art); box(1.13, 1.4, .04, brass, 2.75, 1.75, -4.45);
    // window with daylight
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.1), new THREE.MeshBasicMaterial({ color: '#EAF3F4' })); glass.rotation.y = Math.PI / 2; glass.position.set(-4.42, 1.75, -.6); g.add(glass);
    const frame = mat('#2A2C2B', { roughness: .4 }); [[-1.05], [1.05]].forEach(([z]) => box(.06, 2.2, .06, frame, -4.4, 1.75, -.6 + z)); box(.06, .06, 2.2, frame, -4.4, 2.8, -.6); box(.06, .06, 2.2, frame, -4.4, .7, -.6); box(.06, 2.1, .04, frame, -4.4, 1.75, -.6);
    const sheer = new THREE.Mesh(new THREE.PlaneGeometry(.9, 2.6), mat('#F6F1E8', { transparent: true, opacity: .85, side: THREE.DoubleSide })); sheer.rotation.y = Math.PI / 2; sheer.position.set(-4.3, 1.55, -2.1); g.add(sheer);
    // rug
    const rugT = canvasTex(THREE, 512, 340, (x, w, h) => { x.fillStyle = '#D9CDB8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#B48C55'; x.lineWidth = 10; x.strokeRect(22, 22, w - 44, h - 44); x.strokeStyle = 'rgba(30,74,64,.5)'; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(w / 2, h + 40, 80 + i * 34, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), mat('#ffffff', { map: rugT, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(.2, .012, -1.3); rug.receiveShadow = true; g.add(rug);
    // sofa (evergreen velvet)
    const vel = mat('#2E5A4F', { roughness: .9 }), vel2 = mat('#3B6B5E', { roughness: .95 });
    box(3, .42, 1, vel, .2, .29, -3.45); box(3, .62, .24, vel, .2, .72, -3.86); box(.24, .55, 1, vel, -1.38, .5, -3.45); box(.24, .55, 1, vel, 1.78, .5, -3.45);
    [-.85, .2, 1.25].forEach(x => box(.98, .14, .82, vel2, x, .57, -3.38));
    [-1.05, 1.45].forEach((x, i) => { const c = box(.48, .42, .14, mat(i ? '#B48C55' : '#E9DFCF', { roughness: .9 }), x, .86, -3.66); c.rotation.z = i ? -.12 : .12; });
    [-1.3, 1.7].forEach(x => cyl(.035, .025, .12, brass, x, .06, -3.05, 12));
    // coffee table: marble on brass
    const marble = canvasTex(THREE, 512, 512, (x, w, h) => { x.fillStyle = '#F4F2EE'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(120,120,125,${.08 + Math.random() * .12})`; x.lineWidth = .5 + Math.random() * 2; x.beginPath(); let px = Math.random() * w, py = 0; x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += (Math.random() - .5) * 120; py += h / 8; x.lineTo(px, py); } x.stroke(); } });
    cyl(.7, .7, .06, mat('#ffffff', { map: marble, roughness: .25 }), .2, .42, -1.45, 48); cyl(.5, .5, .32, brass, .2, .21, -1.45, 48);
    const vase = cyl(.08, .12, .3, mat('#1E4A40', { roughness: .3 }), .45, .6, -1.35, 24); vase.castShadow = true;
    // lounge chairs (cognac leather)
    const leather = mat('#9A6A3E', { roughness: .55 });
    [[2.6, -1.1, -.7], [-1.9, -.9, .7]].forEach(([x, z, ry]) => { const c = new THREE.Group(); const p = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); b.castShadow = true; c.add(b); }; p(.85, .18, .8, leather, 0, .42, 0); p(.85, .62, .14, leather, 0, .72, -.35); p(.1, .3, .8, leather, -.42, .58, 0); p(.1, .3, .8, leather, .42, .58, 0); [[-.36, -.3], [.36, -.3], [-.36, .3], [.36, .3]].forEach(([a, b]) => p(.04, .34, .04, brass, a, .17, b)); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); });
    // floor lamp & pendant
    cyl(.18, .2, .03, brass, 3.6, .015, -3.7, 24); cyl(.015, .015, 1.7, brass, 3.6, .86, -3.7, 8);
    const shade = cyl(.18, .3, .34, mat('#F4EBDD', { emissive: '#FFE3B0', emissiveIntensity: .55, side: THREE.DoubleSide }), 3.6, 1.82, -3.7, 32);
    const bulb = new THREE.PointLight('#FFD9A0', 6, 6, 1.6); bulb.position.set(3.6, 1.75, -3.7); g.add(bulb);
    cyl(.006, .006, 1.1, mat('#222'), .2, 2.85, -1.45, 6); const globe = new THREE.Mesh(new THREE.SphereGeometry(.22, 32, 16), mat('#FFF4E0', { emissive: '#FFE0A8', emissiveIntensity: .9 })); globe.position.set(.2, 2.25, -1.45); g.add(globe);
    const pend = new THREE.PointLight('#FFD39A', 7, 7, 1.7); pend.position.set(.2, 2.1, -1.45); pend.castShadow = true; pend.shadow.mapSize.set(512, 512); g.add(pend);
    // plant & sideboard
    cyl(.24, .19, .5, mat('#D8CFC2', { roughness: .8 }), -3.7, .25, -3.8, 24);
    const leaf = mat('#4F7A4A', { roughness: .8 }); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.22 + (i % 3) * .05, 0), leaf); l.position.set(-3.7 + Math.sin(i * 1.7) * .25, .75 + i * .12, -3.8 + Math.cos(i * 1.3) * .22); l.castShadow = true; g.add(l); }
    box(2.2, .7, .45, walnut, -2.9, .35, -4.15); box(2.24, .03, .5, brass, -2.9, .715, -4.15);
    [-3.5, -3.0, -2.5].forEach((x, i) => cyl(.07, .07, .22 + i * .08, mat(['#E9DFCF', '#1E4A40', '#B48C55'][i], { roughness: .4 }), x, .83 + i * .04, -4.15, 16));
    return g;
  };
  V.init = () => {
    const { THREE, OrbitControls } = V.lib;
    const r = V.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = V.scene = new THREE.Scene();
    sc.add(new THREE.HemisphereLight('#FFF6E8', '#4A4438', 1.1));
    const sun = new THREE.DirectionalLight('#FFF1DC', 2.4); sun.position.set(-6, 7, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); sun.shadow.bias = -.0004; sc.add(sun);
    const cam = V.camera = new THREE.PerspectiveCamera(42, 1.6, .05, 200);
    const ctl = V.controls = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.dampingFactor = .07; ctl.maxPolarAngle = Math.PI * .49; ctl.minDistance = 2.5; ctl.maxDistance = 18; ctl.autoRotateSpeed = .6;
    V.sample = buildRoom(THREE); sc.add(V.sample); V.reset();
    V.ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .28 })); V.ground.rotation.x = -Math.PI / 2; V.ground.receiveShadow = true; V.ground.visible = false; sc.add(V.ground);
    V.ro = new ResizeObserver(() => V.size()); V.ready = true;
  };
  V.reset = () => { V.camera.position.set(5.6, 3.6, 5.4); V.controls.target.set(.1, 1, -1.6); V.controls.update(); };
  V.size = () => { const el = V.renderer && V.renderer.domElement.parentElement; if (!el) return; const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; V.renderer.setSize(w, h, false); V.camera.aspect = w / h; V.camera.updateProjectionMatrix(); };
  const loop = () => { V.raf = 0; const c = V.renderer && V.renderer.domElement; if (!c || !document.body.contains(c)) return; V.controls.autoRotate = V.spin; V.controls.update(); V.renderer.render(V.scene, V.camera); V.raf = requestAnimationFrame(loop); };
  V.mount = async () => {
    if (!document.getElementById('v3d')) return;
    if (!V.ready) { if (V.loading) return; V.loading = true; try { await loadLib(); V.init(); } catch (e) { console.error(e); V.loading = false; const l = document.querySelector('#v3d .load'); if (l) l.textContent = 'The 3D viewer needs an internet connection to load three.js.'; return; } }
    const el = document.getElementById('v3d'); if (!el) return;
    const c = V.renderer.domElement; if (c.parentElement !== el) { el.appendChild(c); V.ro.disconnect(); V.ro.observe(el); }
    const l = el.querySelector('.load'); if (l) l.remove();
    const n = document.getElementById('v3d-name'); if (n) n.textContent = V.name;
    V.size(); if (!V.raf) V.raf = requestAnimationFrame(loop);
  };
  V.loadUrl = (url, name) => new Promise((res, rej) => {
    const { THREE, GLTFLoader } = V.lib;
    new GLTFLoader().load(url, gltf => {
      if (V.model) V.scene.remove(V.model);
      const o = gltf.scene; o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      const b = new THREE.Box3().setFromObject(o), sz = b.getSize(new THREE.Vector3()), k = 5 / Math.max(sz.x, sz.y, sz.z, .001);
      o.scale.setScalar(k); const b2 = new THREE.Box3().setFromObject(o), ctr = b2.getCenter(new THREE.Vector3()); o.position.sub(new THREE.Vector3(ctr.x, b2.min.y, ctr.z));
      V.sample.visible = false; V.ground.visible = true; V.scene.add(o); V.model = o; V.name = name; V.camera.position.set(5.5, 3.8, 5.5); V.controls.target.set(0, Math.min(2, (b2.max.y - b2.min.y) * .4), 0); V.controls.update();
      const n = document.getElementById('v3d-name'); if (n) n.textContent = name; res();
    }, undefined, rej);
  });
  V.showSample = () => { V.curId = null; if (!V.ready) return; if (V.model) { V.scene.remove(V.model); V.model = null; } V.sample.visible = true; V.ground.visible = false; V.name = 'Sample: living room by HOD'; V.reset(); const n = document.getElementById('v3d-name'); if (n) n.textContent = V.name; };
  V.open = async id => { // show a stored drawing's model, or the sample
    await V.mount(); if (!V.ready) return;
    if (id && V.files[id] && V.kinds[id] === 'model') { const x = db().drawings.find(d => d.id === id); try { await V.loadUrl(V.files[id], x ? x.title : 'Model'); } catch (e) { H.toast('Could not open this model'); } } else V.showSample();
  };
  // a model or render added to a project: recorded as a 3D drawing awaiting internal review
  V.addUpload = (file, pid, kind) => {
    const d = db(), p = H.P(pid), id = H.uid('d'), n = d.drawings.filter(x => x.project === p.id).length + 1;
    const title = (kind === 'model' ? '3D model — ' : '3D render — ') + file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    V.files[id] = URL.createObjectURL(file); V.kinds[id] = kind;
    d.drawings.push({ id, no: `${p.code.slice(4)}-3D-${String(n).padStart(3, '0')}`, title, disc: '3D', project: p.id, designer: S.user.startsWith('e') ? S.user : p.viz, rev: 0, status: 'Internal Review', submitted: H.TODAY, reviewer: p.pm, comments: '', kind: '3D', file: file.name, model: kind === 'model', history: [{ rev: 'R0', date: H.TODAY, status: 'Internal Review', by: S.user, note: `Uploaded ${file.name} (${(file.size / 1048576).toFixed(1)} MB)` }] });
    H.auto('r3', `Reviewer ${H.name(p.pm)} notified: ${title} (${p.name})`);
    H.log(S.user, `Uploaded ${kind === 'model' ? '3D model' : 'render'} ${file.name}`, p.id);
    return id;
  };
  V.sendToClient = pid => {
    const d = db(), p = H.P(pid), id = H.uid('d'), n = d.drawings.filter(x => x.project === p.id).length + 1, src = V.curId && d.drawings.find(x => x.id === V.curId);
    const title = src ? src.title.replace('3D render — ', '3D model — ') : '3D model — living room concept (interactive)';
    if (src) { V.files[id] = V.files[src.id]; V.kinds[id] = 'model'; }
    d.drawings.push({ id, no: `${p.code.slice(4)}-3D-${String(n).padStart(3, '0')}`, title, disc: '3D', project: p.id, designer: p.viz, rev: 0, status: 'Client Review', submitted: H.TODAY, reviewer: p.pm, comments: '', kind: '3D', model: true, sample: !src, history: [{ rev: 'R0', date: H.TODAY, status: 'Internal Review', by: p.viz, note: 'Interactive 3D model prepared' }, { rev: 'R0', date: H.TODAY, status: 'Client Review', by: p.pm, note: 'Approved internally; shared in the client portal with an interactive 3D view' }] });
    H.auto('r3', `Client approval request for ${title} sent via portal (WhatsApp alert queued) — ${p.name}`);
    H.notify('Client', `${H.CL(p.client).name} can now explore ${title} in 3D`, 'drawings');
    H.log(p.pm, `Shared interactive 3D model with ${H.CL(p.client).name}`, p.id);
    return id;
  };
  Object.assign(H.A, {
    'v3d-send': () => { const pid = S.ui.f.d3proj || (H.active().find(p => ['concept', 'drawings', 'approval'].includes(p.stage)) || H.active()[0]).id; const id = V.sendToClient(pid); H.commit(`Shared with ${H.CL(H.P(pid).client).name} in the client portal`, 'dwg-' + id); },
    'v3d-sample': () => V.showSample(),
    'v3d-spin': a => { V.spin = !V.spin; a.textContent = V.spin ? 'Pause' : 'Rotate'; },
    'v3d-reset': () => { if (V.ready) { if (V.model) { V.camera.position.set(5.5, 3.8, 5.5); V.controls.update(); } else V.reset(); } },
    'v3d-open': a => { S.ui.modal = { type: 'v3dview', id: a.dataset.id }; H.render(); V.open(a.dataset.id); }
  });
  H.Cg['v3d-file'] = async el => {
    const f = el.files && el.files[0]; if (!f) return;
    await V.mount(); if (!V.ready) return;
    const pid = S.ui.f.d3proj || (H.active().find(p => ['concept', 'drawings', 'approval'].includes(p.stage)) || H.active()[0]).id;
    const id = V.addUpload(f, pid, 'model');
    try { await V.loadUrl(V.files[id], f.name); V.curId = id; H.save(); H.toast(`${f.name} opened and sent for internal review`); } catch (e) { H.toast('Could not read this file. Export it as a single .glb and try again.'); }
  };
  H.Cg['d3-upload'] = async el => {
    const fs = Array.from(el.files || []); if (!fs.length) return;
    const pid = S.ui.f.d3proj || (H.active().find(p => ['concept', 'drawings', 'approval'].includes(p.stage)) || H.active()[0]).id;
    let last = null, model = null;
    fs.forEach(f => { const isModel = /\.(glb|gltf)$/i.test(f.name); const id = V.addUpload(f, pid, isModel ? 'model' : 'image'); last = id; if (isModel) model = { id, f }; });
    H.commit(`${fs.length} file${fs.length > 1 ? 's' : ''} uploaded to ${H.P(pid).name} — sent for internal review`, 'dwg-' + last);
    if (model) { await V.mount(); if (V.ready) try { await V.loadUrl(V.files[model.id], model.f.name); V.curId = model.id; } catch (e) { H.toast('Could not read the model. Export it as a single .glb.'); } }
  };
  H.Modal.v3dview = m => { const x = m.id && db().drawings.find(d => d.id === m.id); return `<h2>${esc(x ? x.title : 'Interactive 3D preview')}</h2><p class="muted small" style="margin:4px 0 14px">${x ? esc(H.P(x.project).name) + ' · R' + x.rev + ' · ' + esc(x.status) : 'Sample living room built by the studio'}${x && !x.sample && !(V.files[x.id] && V.kinds[x.id] === 'model') ? ' — the studio sample room is shown because this sheet’s model file is not stored in this browser' : ''}</p>${V.html(480)}${x && x.status === 'Client Review' && S.role === 'client' ? `<div class="row" style="margin-top:14px"><button class="btn pri" data-act="cl-dwg-ok" data-id="${x.id}">${ic('check')}Approve this design</button></div>` : ''}`; };

  // ---------- lightbox ----------
  H.LB = {
    html: () => { const L = S.ui.lb; if (!L) return ''; const it = L.items[L.i]; return `<div class="lightbox" role="dialog" aria-label="Photo viewer"><div class="lt"><div><b>${esc(it.cap || '')}</b><div class="small" style="color:#b8c5bf">${L.i + 1} of ${L.items.length}${L.title ? ' · ' + esc(L.title) : ''}</div></div><div class="row"><button class="btn sm" data-act="lb-step" data-v="-1" aria-label="Previous">←</button><button class="btn sm" data-act="lb-step" data-v="1" aria-label="Next">→</button><button class="btn sm" data-act="lb-close" aria-label="Close">${ic('x')}</button></div></div><div class="stage"><img src="${it.src}" alt="${esc(it.cap || '')}"></div><div class="strip">${L.items.map((x, k) => `<img src="${x.src}" alt="" class="${k === L.i ? 'on' : ''}" data-act="lb-step" data-v="${k - L.i}">`).join('')}</div></div>`; },
    open: (items, i, title) => { S.ui.lb = { items, i: i || 0, title }; H.render(); }
  };
  Object.assign(H.A, {
    gallery: a => { const p = H.P(a.dataset.id), L = H.projPhotos(p.id).slice(0, 8).map((k, i) => ({ src: H.photoUrl(k), cap: i < 3 ? `${p.name} — design render ${i + 1}` : `Reference — studio portfolio` })); H.LB.open(L, 0, p.name); },
    'lb-dwg': a => { S.ui.drawer = null; const L = db().drawings.filter(x => x.kind === '3D').sort((x, y) => y.submitted.localeCompare(x.submitted)).slice(0, 16); const i = Math.max(0, L.findIndex(x => x.id === a.dataset.id)); H.LB.open(L.map(x => ({ src: V.files[x.id] && V.kinds[x.id] === 'image' ? V.files[x.id] : H.cover(x.project, H.hue(x.id) + x.rev), cap: `${x.title.replace('3D render — ', '')} · R${x.rev} · ${H.P(x.project).name}` })), i, 'Renders'); },
    'lb-step': a => { const L = S.ui.lb; if (!L) return; L.i = (L.i + +a.dataset.v + L.items.length) % L.items.length; H.render(); },
    'lb-close': () => { S.ui.lb = null; H.render(); }
  });
  document.addEventListener('keydown', e => { if (!S.ui.lb) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { S.ui.lb.i = (S.ui.lb.i + (e.key === 'ArrowRight' ? 1 : -1) + S.ui.lb.items.length) % S.ui.lb.items.length; H.render(); } if (e.key === 'Escape') { S.ui.lb = null; H.render(); } });
  (H.extraOverlays = H.extraOverlays || []).push(() => H.LB.html());
  (H.afterRender = H.afterRender || []).push(() => { if (document.getElementById('v3d')) V.mount(); });

  // ---------- Design Studio ----------
  H.V.design = () => {
    const d = db(), ps = d.projects.filter(p => ['survey', 'concept', 'drawings', 'approval'].includes(p.stage) || (p.stage === 'execution' && p.design.some(x => x < 100)));
    const queue = d.drawings.filter(x => x.status === 'Internal Review');
    const renders = d.drawings.filter(x => x.kind === '3D').sort((a, b) => b.submitted.localeCompare(a.submitted));
    const pj = S.ui.f.d3proj || (H.active().find(p => ['concept', 'drawings', 'approval'].includes(p.stage)) || H.active()[0]).id;
    return `<div class="pagehead"><div><h1>Design Studio: ${ps.length} projects in design, ${queue.length} sheets in internal review</h1><p>Concept to construction documents: 2D sheets, 3D models and renders, reviewed internally and approved by clients in their portal.</p></div><button class="btn pri" data-act="modal" data-id="drawing">${ic('upload')}Upload drawing</button></div>
<div class="grid g21"><div>${V.html(470)}</div>
<div class="stack"><div class="card"><h2>Upload 3D models & renders</h2><label class="f" for="d3p">Project</label>${R.sel('d3proj', H.active().map(p => [p.id, p.name]), pj, 'Project for uploads').replace('style="width:auto;min-width:150px;', 'id="d3p" style="width:100%;')}<label class="drop" style="margin-top:12px">${ic('upload')}<div style="margin-top:6px"><b>Drop or choose files</b></div><div class="small">3D models (.glb) open in the viewer · renders (JPG, PNG, WebP) go to the gallery</div><input type="file" multiple accept=".glb,.gltf,image/*" hidden data-chg="d3-upload"></label><button class="btn pri" style="width:100%;margin-top:12px" data-act="v3d-send">${ic('send')}Share the 3D view with the client</button><p class="small muted" style="margin-top:10px">Every upload becomes a revision-tracked sheet: internal review, then the client explores and approves it in the portal.</p></div>
<div class="card"><div class="hd"><h2>Latest 3D work</h2><a class="small gold" style="text-decoration:none;font-weight:600" href="#drawings" data-go="drawings">All sheets →</a></div><div class="list">${renders.slice(0, 5).map(x => `<a href="#" class="li" data-act="drawer" data-type="drawing" data-id="${x.id}" data-k="dwg-${x.id}"><div style="width:58px;height:38px;border-radius:8px;overflow:hidden;flex:none">${H.dwgImg(x)}</div><div class="li-main"><div class="t">${esc(x.title.replace(/^3D (render|model) — /, ''))}</div><div class="s">${esc(H.P(x.project).name)} · R${x.rev}</div></div>${H.pill(x.status)}</a>`).join('')}</div></div></div></div>
<div class="grid g2" style="margin-top:18px"><div class="card"><div class="hd"><h2>From concept sketch to final render</h2><span class="small muted">Drag the handle</span></div>${R.compare(H.photoUrl('dining_arches'), 'Saffron Table Restaurant. The sketch layer is generated from the render for presentation.')}</div>
<div class="card"><div class="hd"><h2>Client selections pending</h2><a class="small gold" style="text-decoration:none;font-weight:600" href="#project-p2" data-go="project-p2">Open a project →</a></div><div class="list">${H.active().filter(p => !['survey'].includes(p.stage)).slice(0, 6).map(p => { const L = (db().selections || {})[p.id]; const done = L ? L.filter(x => x.chosen != null).length : (['execution', 'handover'].includes(p.stage) ? 4 : 0); return `<a class="li" href="#project-${p.id}" data-go="project-${p.id}"><div style="width:52px;height:36px;border-radius:8px;overflow:hidden;flex:none"><img class="ph" src="${H.cover(p.id)}" alt=""></div><div class="li-main"><div class="t">${esc(p.name)}</div><div class="s">${done} of 6 finishes chosen</div></div>${R.prog(Math.round(done / 6 * 100))}</a>`; }).join('')}</div></div></div>
<div class="sect">Render gallery <span class="muted">click to view full screen</span></div>
<div class="thumbs" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${renders.slice(0, 12).map(x => `<figure data-act="lb-dwg" data-id="${x.id}" style="cursor:zoom-in" data-k="dwg-${x.id}">${H.dwgImg(x)}<figcaption><b>${esc(x.title.replace(/^3D (render|model) — /, ''))}</b> · R${x.rev}<br>${esc(H.P(x.project).name)} · ${esc(x.status)}</figcaption></figure>`).join('')}</div>
<div class="sect">Projects in design</div>
<div class="grid g2">${ps.map(p => {
      const steps = ['Survey', 'Concept', '2D', '3D', 'Approvals'];
      const pend = d.drawings.filter(x => x.project === p.id && ['Internal Review', 'Client Review', 'Revision Required'].includes(x.status));
      return `<div class="card" data-k="design-${p.id}"><div class="row" style="gap:14px;flex-wrap:nowrap;align-items:flex-start"><div style="width:120px;height:80px;border-radius:12px;overflow:hidden;flex:none"><img class="ph" src="${H.cover(p.id)}" alt="" loading="lazy"></div><div class="li-main"><div class="hd" style="margin:0"><h2 style="font-size:16px">${H.plink(p.id)}</h2>${H.pill(H.health(p))}</div><div class="small muted">${esc(p.type)} · ${esc(H.stageName(p.stage))} · ${esc(H.name(p.designer))}</div></div></div>
<div class="stepper" style="margin:14px 0 12px">${steps.map((s, i) => `<div><i><b style="width:${p.design[i]}%"></b></i>${s} ${p.design[i]}%</div>`).join('')}</div>
<div class="small">${pend.length ? pend.slice(0, 3).map(x => `<div style="margin:5px 0" class="row">${H.pill(x.status)} <a class="lnk" href="#" data-act="drawer" data-type="drawing" data-id="${x.id}">${esc(x.title)}</a></div>`).join('') : '<span class="muted">No sheets pending review</span>'}</div></div>`;
    }).join('')}</div>
<div class="sect">Design QA before anything goes to a client</div><div class="card"><div class="grid g3">${['Dimensions verified against latest site measurement', 'Ceiling, lighting & HVAC levels coordinated', 'Switch & socket positions match furniture layout', 'Materials match approved finish schedule', 'Title block, revision and date filled', 'Structural coordination checked by architect'].map(t => `<label class="chk"><input type="checkbox" checked disabled> ${t}</label>`).join('')}</div><p class="small muted" style="margin-top:8px">Runs on every sheet before “Send to client” as part of internal review.</p></div>`;
  };
})();
