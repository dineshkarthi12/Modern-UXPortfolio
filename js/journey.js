/*
 * A scroll-driven ride through a low-poly Chennai.
 * Everything in the city is built from primitives here, no model files.
 * Copy for the panels comes from js/data.js (window.SITE).
 */
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const S = window.SITE;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 760px)").matches;

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/\[TODO:[^\]]*\]/g, "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

const gate = $(".gate");
const pctEl = $(".gate__pct");
const startBtn = $(".gate__start");
let progress = 0;
function setProgress(p) {
  progress = Math.max(progress, p);
  pctEl.textContent = String(Math.round(progress * 100)).padStart(3, "0");
}

/* ---------- palette ---------- */

const C = {
  skyTop: new THREE.Color("#8C93C8"),
  skyMid: new THREE.Color("#E9A2A0"),
  horizon: new THREE.Color("#F7CBA6"),
  ground: "#E7B995",
  road: "#C46D57",
  roadLine: "#F7E3CC",
  sand: "#F3D9B5",
  sea: "#3F7BA6",
  buildings: ["#F4D6B8", "#E9A27F", "#D98F86", "#F1E4CF", "#A9C1BC", "#E8C27E", "#C9B7D6", "#F0B9A0"],
  leaf: "#6E9A5E",
  trunk: "#8A5A3C",
  auto: "#F2C230",
  autoTop: "#24282C"
};

/* ---------- stops along the road (u = 0..1 along the curve) ---------- */

const STOPS = [
  { id: "intro", label: "Start", from: 0, to: 0.075, at: 0 },
  { id: "about", label: "About", from: 0.13, to: 0.25, at: 0.19 },
  ...S.projects.map((p, i) => {
    const at = 0.34 + i * 0.1;
    return { id: "work-" + p.slug, label: p.name, from: at - 0.04, to: at + 0.035, at, project: p, index: i };
  }),
  { id: "experience", label: "Experience", from: 0.73, to: 0.83, at: 0.78 },
  { id: "contact", label: "Contact", from: 0.9, to: 1.01, at: 0.97 }
];

/* ---------- panels (real HTML, so the content stays readable and focusable) ---------- */

function renderPanels() {
  const panels = $(".panels");
  const ext = 'target="_blank" rel="noopener"';
  const html = STOPS.map((s) => {
    let inner = "";
    if (s.id === "intro") {
      inner = `<p class="mono panel__kicker">${esc(S.hero.label)}</p>
        <h2>${esc(S.person.name)}</h2>
        <p>${esc(S.hero.line)}</p>`;
    } else if (s.id === "about") {
      inner = `<p class="mono panel__kicker">01 · About · Marina lighthouse</p>
        <h2>${esc(S.about.title)}</h2>
        ${S.about.paragraphs.slice(0, 2).map((t) => `<p>${esc(t)}</p>`).join("")}
        <ul class="panel__stats">${S.stats.map((st) => `<li><b>${esc(st.value)}${esc(st.suffix)}</b><span>${esc(st.label)}</span></li>`).join("")}</ul>`;
    } else if (s.project) {
      const p = s.project, m = p.metric;
      inner = `<p class="mono panel__kicker">0${s.index + 2} · Work · ${esc(p.category)}</p>
        <h2>${esc(p.name)}</h2>
        <p><strong>${esc(p.sector)}</strong> at ${esc(p.company)}.</p>
        <p>${esc(p.summary)}</p>
        <div class="panel__metric"><b>${esc(m.prefix)}${esc(m.value)}${esc(m.suffix)}</b><span>${esc(m.label)}</span></div>
        <a class="btn" href="case-studies/${esc(p.slug)}.html">Read the case study <span aria-hidden="true">→</span></a>`;
    } else if (s.id === "experience") {
      inner = `<p class="mono panel__kicker">06 · Experience · Kapaleeshwarar gopuram</p>
        <h2>Two companies, seven years.</h2>
        <ul class="panel__roles">${S.experience.map((r) => `<li><b>${esc(r.role)}</b><span>${esc(r.company)} · ${esc(r.dates)}</span></li>`).join("")}</ul>
        <ul class="panel__tags">${S.skills.map((k) => `<li>${esc(k[0])}</li>`).join("")}</ul>`;
    } else if (s.id === "contact") {
      const L = S.links;
      inner = `<p class="mono panel__kicker">07 · Contact · Central station</p>
        <h2>${esc(S.contact.title)}</h2>
        <p>${esc(S.contact.line)}</p>
        <ul class="panel__links">
          <li><a href="mailto:${esc(L.email)}">Email <small>${esc(L.email)}</small></a></li>
          <li><a href="${esc(L.phoneHref)}">Phone <small>${esc(L.phone)}</small></a></li>
          <li><a href="${esc(L.whatsapp)}" ${ext}>WhatsApp <small>Chat</small></a></li>
          <li><a href="${esc(L.linkedin)}" ${ext}>LinkedIn <small>${esc(L.linkedinLabel)}</small></a></li>
        </ul>
        <a class="btn" href="${esc(L.resume)}" ${ext}>Download resume</a><a class="btn" href="index.html">Classic site</a>`;
    }
    return `<section class="panel panel--${s.project ? "work" : s.id}" id="stop-${s.id}" aria-label="${esc(s.label)}" inert>${inner}</section>`;
  }).join("");
  panels.innerHTML = html;

  $(".stops ol").innerHTML = STOPS.map((s, i) =>
    `<li><button type="button" data-stop="${i}"><span>${esc(s.label)}</span></button></li>`).join("");
}

/* ---------- scene ---------- */

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

const canvas = $(".scene");
let renderer, scene, camera, curve, sun, auto, wheels = [], sea, seaBase, clickables = [];
const seaClock = { t: 0 };

const ROAD_POINTS = [
  [0, 0, 60], [0, 0, 20], [8, 0, -20], [16, 0, -60], [4, 0, -100], [-10, 0, -140],
  [-6, 0, -180], [8, 0, -220], [18, 0, -260], [6, 0, -300], [-4, 0, -340], [0, 0, -370]
];

function frameAt(u) {
  const p = curve.getPointAt(clamp(u, 0, 1));
  const t = curve.getTangentAt(clamp(u, 0, 1));
  const right = new THREE.Vector3(-t.z, 0, t.x).normalize();
  return { p, t, right };
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...opts });
}

function shadowy(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}

function buildSky() {
  const geo = new THREE.SphereGeometry(900, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C.skyTop }, mid: { value: C.skyMid }, bottom: { value: C.horizon } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(bottom, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h)); gl_FragColor = vec4(c, 1.0); }"
  });
  scene.add(new THREE.Mesh(geo, m));

  // Low sun disc on the horizon, behind the city.
  const disc = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshBasicMaterial({ color: "#FFE2B8", fog: false, transparent: true, opacity: 0.9 }));
  disc.position.set(-120, 60, -760);
  scene.add(disc);
}

function buildGround() {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), mat(C.ground));
  g.rotation.x = -Math.PI / 2;
  g.receiveShadow = true;
  scene.add(g);

  // Road ribbon following the curve.
  const N = 400, W = 3.6, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const { p, right } = frameAt(i / N);
    pos.push(p.x - right.x * W, 0.02, p.z - right.z * W, p.x + right.x * W, 0.02, p.z + right.z * W);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const rg = new THREE.BufferGeometry();
  rg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  rg.setIndex(idx);
  rg.computeVertexNormals();
  const road = new THREE.Mesh(rg, mat(C.road, { side: THREE.DoubleSide }));
  road.receiveShadow = true;
  scene.add(road);

  // Dashed centre line.
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.03, 1.6), mat(C.roadLine), 160);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 160; i++) {
    const { p, t } = frameAt(i / 160);
    q.setFromAxisAngle(up, Math.atan2(t.x, t.z));
    m4.compose(new THREE.Vector3(p.x, 0.04, p.z), q, new THREE.Vector3(1, 1, 1));
    dashes.setMatrixAt(i, m4);
  }
  scene.add(dashes);
}

// Marina Beach: sand strip and an animated sea to the left of the About stop.
function buildBeach() {
  const { p, t, right } = frameAt(0.19);
  const ang = Math.atan2(t.x, t.z);
  const left = right.clone().multiplyScalar(-1);

  const sand = new THREE.Mesh(new THREE.PlaneGeometry(40, 260), mat(C.sand));
  sand.rotation.x = -Math.PI / 2;
  sand.rotation.z = ang;
  sand.position.copy(p).addScaledVector(left, 26).setY(0.01);
  sand.receiveShadow = true;
  scene.add(sand);

  const geo = new THREE.PlaneGeometry(260, 420, small ? 30 : 60, small ? 50 : 100);
  geo.rotateX(-Math.PI / 2);
  sea = new THREE.Mesh(geo, mat(C.sea, { roughness: 0.35, metalness: 0.1 }));
  sea.rotation.y = ang;
  sea.position.copy(p).addScaledVector(left, 46 + 130).setY(0.6);
  sea.receiveShadow = true;
  seaBase = Float32Array.from(geo.attributes.position.array);
  scene.add(sea);

  // Lighthouse: tapered tower with red and white bands, lit lantern.
  const lh = new THREE.Group();
  const bands = 7;
  for (let i = 0; i < bands; i++) {
    const r0 = 2.6 - i * 0.18, r1 = 2.6 - (i + 1) * 0.18;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, 3.4, 8), mat(i % 2 ? "#F6EFE6" : "#C94B3F"));
    seg.position.y = 1.7 + i * 3.4;
    lh.add(seg);
  }
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.4, 8), mat("#2B2F33"));
  deck.position.y = bands * 3.4 + 0.2;
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2, 8), new THREE.MeshStandardMaterial({ color: "#FFE7A8", emissive: "#FFC860", emissiveIntensity: 1.4 }));
  lantern.position.y = bands * 3.4 + 1.4;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.6, 8), mat("#2B2F33"));
  cap.position.y = bands * 3.4 + 3.2;
  lh.add(deck, lantern, cap);
  const glow = new THREE.PointLight("#FFC860", 30, 40, 2);
  glow.position.y = bands * 3.4 + 1.4;
  lh.add(glow);
  lh.position.copy(p).addScaledVector(left, 16).addScaledVector(t, 10);
  scene.add(shadowy(lh));
  return lh.position.clone();
}

// Kapaleeshwarar-style gopuram: stacked, tapering tiers with a barrel crown.
function buildGopuram(u, side) {
  const { p, t, right } = frameAt(u);
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 10), mat("#E4C59A"));
  base.position.y = 3;
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.6, 10.2), mat("#4A2E25"));
  door.position.y = 2.3;
  g.add(base, door);
  const tones = ["#E7A86C", "#D9775C", "#7FB0A8", "#E9C46A", "#C98FB0", "#E7A86C", "#D9775C", "#7FB0A8"];
  let y = 6;
  for (let i = 0; i < 8; i++) {
    const w = 14 - i * 1.4, d = 8.6 - i * 0.75, h = 2.4;
    const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(tones[i]));
    tier.position.y = y + h / 2;
    g.add(tier);
    // Little shrine niches along the front and back of each tier.
    const n = Math.max(2, Math.floor(w / 2.2));
    for (let k = 0; k < n; k++) {
      const x = -w / 2 + (k + 0.5) * (w / n);
      for (const zs of [1, -1]) {
        const niche = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), mat(tones[(i + 3) % tones.length]));
        niche.position.set(x, y + h / 2, zs * (d / 2 + 0.2));
        g.add(niche);
      }
    }
    y += h;
  }
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.4, 12, 1, false, 0, Math.PI), mat("#E9C46A"));
  crown.rotation.z = Math.PI / 2;
  crown.position.y = y + 0.1;
  g.add(crown);
  for (let k = 0; k < 5; k++) {
    const kal = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.9, 6), mat("#D4A019", { metalness: 0.4, roughness: 0.4 }));
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), mat("#E9B52A", { metalness: 0.4, roughness: 0.4 }));
    pot.position.y = 0.6;
    kal.add(stem, pot);
    kal.position.set(-1.4 + k * 0.7, y + 1.8, 0);
    g.add(kal);
  }
  g.position.copy(p).addScaledVector(right, side * 20);
  g.rotation.y = Math.atan2(t.x, t.z) + side * Math.PI / 2;
  scene.add(shadowy(g));
  return g.position.clone().setY(16);
}

// Chennai Central: red brick hall with a clock tower, closing the road.
function buildStation() {
  const { p, t } = frameAt(1);
  const g = new THREE.Group();
  const brick = "#B9553F", trim = "#F4EADB";
  const hall = new THREE.Mesh(new THREE.BoxGeometry(46, 10, 10), mat(brick));
  hall.position.y = 5;
  g.add(hall);
  for (let i = -5; i <= 5; i++) {
    if (Math.abs(i) < 1) continue;
    const arch = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 0.4), mat(trim));
    arch.position.set(i * 4, 3.2, 5.1);
    g.add(arch);
  }
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(47, 0.8, 11), mat(trim));
  cornice.position.y = 10.4;
  g.add(cornice);
  for (const x of [-21, 21]) {
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(5, 16, 5), mat(brick));
    t2.position.set(x, 8, 0);
    const r2 = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4, 4), mat(trim));
    r2.position.set(x, 18, 0);
    r2.rotation.y = Math.PI / 4;
    g.add(t2, r2);
  }
  const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 30, 8), mat(brick));
  tower.position.y = 15;
  const band = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.8, 8.6), mat(trim));
  band.position.y = 22;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.4, 7, 4), mat(trim));
  roof.position.y = 33.5;
  roof.rotation.y = Math.PI / 4;
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.25, 4, 6), mat("#2B2F33"));
  spire.position.y = 39;
  g.add(tower, band, roof, spire);

  const face = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshStandardMaterial({ color: "#FFF6E6", emissive: "#FFE2B0", emissiveIntensity: 0.5 }));
  face.position.set(0, 26, 4.05);
  g.add(face);
  const handMat = mat("#1E2328");
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.5, 0.08), handMat);
  const mh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.08), handMat);
  hh.geometry.translate(0, 0.75, 0);
  mh.geometry.translate(0, 1.1, 0);
  hh.position.set(0, 26, 4.12);
  mh.position.set(0, 26, 4.14);
  g.add(hh, mh);
  // The clock shows Chennai time.
  const now = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  hh.rotation.z = -((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6);
  mh.rotation.z = -now.getMinutes() * (Math.PI / 30);

  g.position.copy(p).addScaledVector(t, 34);
  g.rotation.y = Math.atan2(t.x, t.z) + Math.PI;
  scene.add(shadowy(g));
  return g.position.clone().setY(14);
}

// Roadside hoardings for the four projects: canvas texture, click to open.
function hoardingTexture(p, i) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 600;
  const x = c.getContext("2d");
  const bg = ["#1E2328", "#2E4A62", "#5A2F3B", "#2F4A3A"][i % 4];
  x.fillStyle = bg; x.fillRect(0, 0, 1024, 600);
  x.fillStyle = "#F2C230"; x.fillRect(0, 0, 1024, 14);
  const font = '"Geist", system-ui, sans-serif';
  x.fillStyle = "rgba(255,255,255,.65)";
  x.font = `500 30px ${font}`;
  x.fillText(`0${i + 1}  ·  ${p.category.toUpperCase()}  ·  ${p.company}`, 56, 92);
  x.fillStyle = "#FFFFFF";
  x.font = `700 128px ${font}`;
  x.fillText(p.name, 52, 238);
  x.font = `400 34px ${font}`;
  x.fillStyle = "rgba(255,255,255,.85)";
  const words = p.summary.split(" "); let line = "", y = 310;
  for (const w of words) {
    if (x.measureText(line + w).width > 900) { x.fillText(line, 56, y); line = ""; y += 46; }
    line += w + " ";
  }
  x.fillText(line, 56, y);
  const m = p.metric;
  x.fillStyle = "#F2C230";
  x.font = `700 92px ${font}`;
  const big = `${m.prefix}${m.value}${m.suffix}`;
  x.fillText(big, 56, 528);
  const bw = x.measureText(big).width;
  x.fillStyle = "rgba(255,255,255,.8)";
  x.font = `400 32px ${font}`;
  x.fillText(m.label, 56 + bw + 24, 522);
  x.textAlign = "right";
  x.font = `500 28px ${font}`;
  x.fillText("Open case study →", 968, 522);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildHoardings() {
  const spots = [];
  STOPS.filter((s) => s.project).forEach((s) => {
    const side = s.index % 2 ? -1 : 1;
    const { p, t, right } = frameAt(s.at + 0.045);
    const g = new THREE.Group();
    const postMat = mat("#3A3F45");
    for (const x of [-4.5, 4.5]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 0.4), postMat);
      post.position.set(x, 3.5, -0.3);
      g.add(post);
    }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(13, 7.8, 0.5), postMat);
    frame.position.y = 9.6;
    const board = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 7.25), new THREE.MeshBasicMaterial({ map: hoardingTexture(s.project, s.index), toneMapped: false }));
    board.position.set(0, 9.6, 0.26);
    board.userData.href = `case-studies/${s.project.slug}.html`;
    clickables.push(board);
    g.add(frame, board);
    g.position.copy(p).addScaledVector(right, side * 15);
    // Face the oncoming ride, angled in towards the road.
    g.rotation.y = Math.atan2(-t.x, -t.z) - side * 0.45;
    scene.add(shadowy(g));
    spots.push(g.position.clone().setY(9.6));
  });
  return spots;
}

function buildAuto() {
  const g = new THREE.Group();
  const yellow = mat(C.auto, { roughness: 0.5 }), black = mat(C.autoTop), green = mat("#2F7D4F", { roughness: 0.6 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.4), green);
  floor.position.set(0, 0.55, 0);
  const rear = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 1.1), yellow);
  rear.position.set(0, 1.25, -0.55);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.7), yellow);
  nose.position.set(0, 1.0, 1.2);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.06), new THREE.MeshStandardMaterial({ color: "#9FC6D8", roughness: 0.1, transparent: true, opacity: 0.6 }));
  screen.position.set(0, 1.85, 0.95);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 2.3), black);
  roof.position.set(0, 2.35, -0.05);
  const roofBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.12), yellow);
  roofBack.position.set(0, 1.8, -1.15);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: "#FFF6D8", emissive: "#FFE9A0", emissiveIntensity: 2 }));
  lamp.position.set(0, 1.3, 1.57);
  g.add(floor, rear, nose, screen, roof, roofBack, lamp);
  for (const [x, z] of [[0, 1.2], [-0.72, -0.75], [0.72, -0.75]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12), black);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.34, z);
    wheels.push(w);
    g.add(w);
  }
  auto = shadowy(g);
  scene.add(auto);
}

function buildWords(font, avoid) {
  const words = [
    { text: "VANAKKAM", u: 0.06, side: -1 },
    { text: "ABOUT", u: 0.16, side: 1 },
    { text: "WORK", u: 0.3, side: -1 },
    { text: "CONTACT", u: 0.93, side: -1 }
  ];
  const red = mat("#C8644A", { roughness: 0.7 });
  for (const w of words) {
    const geo = new TextGeometry(w.text, { font, size: 3.2, height: 1.2, curveSegments: 3, bevelEnabled: false });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-(bb.max.x + bb.min.x) / 2, 0, 0);
    const mesh = new THREE.Mesh(geo, red);
    const { p, t, right } = frameAt(w.u);
    mesh.position.copy(p).addScaledVector(right, w.side * 16);
    mesh.rotation.y = Math.atan2(-t.x, -t.z) + w.side * 0.35;
    scene.add(shadowy(mesh));
    avoid.push(mesh.position.clone());
  }
}

// Fill the roadsides with low-poly buildings and coconut palms (instanced).
function buildCity(avoid) {
  const samples = [];
  for (let i = 0; i <= 300; i++) samples.push(curve.getPointAt(i / 300));
  const roadDist = (x, z) => {
    let d = Infinity;
    for (const s of samples) d = Math.min(d, (s.x - x) ** 2 + (s.z - z) ** 2);
    return Math.sqrt(d);
  };
  const near = (x, z, r) => avoid.some((a) => (a.x - x) ** 2 + (a.z - z) ** 2 < r * r);
  const beach = frameAt(0.19);
  const onBeach = (x, z) => {
    const dx = x - beach.p.x, dz = z - beach.p.z;
    const along = dx * beach.t.x + dz * beach.t.z;
    const across = -(dx * beach.right.x + dz * beach.right.z);
    return across > 2 && Math.abs(along) < 140;
  };

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const boxes = [];
  const count = small ? 260 : 520;
  for (let i = 0; i < count * 3 && boxes.length < count; i++) {
    const u = rnd() * 1.05 - 0.02;
    const side = rnd() < 0.5 ? -1 : 1;
    const { p, t, right } = frameAt(clamp(u));
    const off = 10 + rnd() * 70;
    const x = p.x + right.x * side * off + t.x * (rnd() - 0.5) * 6;
    const z = p.z + right.z * side * off + t.z * (rnd() - 0.5) * 6;
    if (roadDist(x, z) < 9 || near(x, z, 16) || onBeach(x, z)) continue;
    const w = 4 + rnd() * 6, d = 4 + rnd() * 6;
    const h = 3 + rnd() * rnd() * 16;
    if (boxes.some((b) => Math.abs(b.x - x) < (b.w + w) / 2 + 0.6 && Math.abs(b.z - z) < (b.d + d) / 2 + 0.6)) continue;
    boxes.push({ x, z, w, d, h, rot: Math.atan2(t.x, t.z), c: C.buildings[Math.floor(rnd() * C.buildings.length)] });
  }

  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  const inst = new THREE.InstancedMesh(geo, mat("#ffffff"), boxes.length);
  const roofs = new THREE.InstancedMesh(geo, mat("#ffffff"), boxes.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  boxes.forEach((b, i) => {
    q.setFromAxisAngle(up, b.rot);
    m4.compose(new THREE.Vector3(b.x, 0, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    inst.setMatrixAt(i, m4);
    inst.setColorAt(i, col.set(b.c));
    // A slim parapet on every roof.
    m4.compose(new THREE.Vector3(b.x, b.h, b.z), q, new THREE.Vector3(b.w + 0.3, 0.4, b.d + 0.3));
    roofs.setMatrixAt(i, m4);
    roofs.setColorAt(i, col.set(b.c).multiplyScalar(0.82));
  });
  inst.castShadow = inst.receiveShadow = true;
  roofs.castShadow = roofs.receiveShadow = true;
  scene.add(inst, roofs);

  // Window strips: a darker band per floor on the front of taller buildings.
  const wins = boxes.filter((b) => b.h > 6);
  const winGeo = new THREE.BoxGeometry(1, 1, 1);
  const floors = wins.reduce((n, b) => n + Math.floor(b.h / 3), 0);
  const winInst = new THREE.InstancedMesh(winGeo, mat("#5C4A5A", { roughness: 0.4 }), floors * 2);
  let k = 0;
  for (const b of wins) {
    q.setFromAxisAngle(up, b.rot);
    for (let f = 0; f < Math.floor(b.h / 3); f++) {
      for (const s of [1, -1]) {
        const local = new THREE.Vector3(0, 1.6 + f * 3, s * (b.d / 2 + 0.02)).applyQuaternion(q);
        m4.compose(new THREE.Vector3(b.x + local.x, local.y, b.z + local.z), q, new THREE.Vector3(b.w * 0.75, 0.9, 0.06));
        winInst.setMatrixAt(k++, m4);
      }
    }
  }
  winInst.count = k;
  scene.add(winInst);

  // Coconut palms: along the beach and scattered between buildings.
  const palms = [];
  for (let i = 0; i < 40; i++) {
    const along = -120 + i * 6 + rnd() * 3;
    const across = 5 + rnd() * 10;
    palms.push(new THREE.Vector3(
      beach.p.x + beach.t.x * along - beach.right.x * across, 0,
      beach.p.z + beach.t.z * along - beach.right.z * across));
  }
  for (let i = 0; palms.length < (small ? 110 : 180) && i < 2000; i++) {
    const { p, right } = frameAt(rnd());
    const side = rnd() < 0.5 ? -1 : 1;
    const off = 6 + rnd() * 4;
    const v = new THREE.Vector3(p.x + right.x * side * off, 0, p.z + right.z * side * off);
    if (near(v.x, v.z, 10) || onBeach(v.x, v.z)) continue;
    palms.push(v);
  }
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 1, 6);
  trunkGeo.translate(0, 0.5, 0);
  const leafGeo = new THREE.ConeGeometry(2.2, 1.2, 7, 1, true);
  const trunks = new THREE.InstancedMesh(trunkGeo, mat(C.trunk), palms.length);
  const leaves = new THREE.InstancedMesh(leafGeo, mat(C.leaf, { side: THREE.DoubleSide }), palms.length);
  palms.forEach((v, i) => {
    const h = 5 + rnd() * 4, lean = (rnd() - 0.5) * 0.25;
    q.setFromEuler(new THREE.Euler(lean, rnd() * 6.28, lean));
    m4.compose(v, q, new THREE.Vector3(1, h, 1));
    trunks.setMatrixAt(i, m4);
    const top = new THREE.Vector3(0, h, 0).applyQuaternion(q).add(v);
    q.setFromEuler(new THREE.Euler(0, rnd() * 6.28, 0));
    m4.compose(top.setY(top.y - 0.2), q, new THREE.Vector3(1, 1, 1));
    leaves.setMatrixAt(i, m4);
  });
  trunks.castShadow = leaves.castShadow = true;
  scene.add(trunks, leaves);
}

async function build() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(C.horizon, 60, small ? 230 : 320);
  camera = new THREE.PerspectiveCamera(small ? 62 : 52, innerWidth / innerHeight, 0.1, 2000);

  curve = new THREE.CatmullRomCurve3(ROAD_POINTS.map((a) => new THREE.Vector3(...a)), false, "catmullrom", 0.4);

  scene.add(new THREE.HemisphereLight("#FFE6CF", "#C98A6E", 1.1));
  sun = new THREE.DirectionalLight("#FFD2A6", 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 300 });
  sun.shadow.bias = -0.0006;
  scene.add(sun, sun.target);
  setProgress(0.15);

  buildSky();
  buildGround();
  setProgress(0.3);
  const lighthouse = buildBeach();
  const boards = buildHoardings();
  const gopuram = buildGopuram(0.83, 1);
  const station = buildStation();
  const avoid = [lighthouse, ...boards, gopuram, station];
  buildAuto();
  setProgress(0.55);

  try {
    const font = await new FontLoader().loadAsync("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json");
    buildWords(font, avoid);
  } catch (e) { /* The words are decoration; the ride works without them. */ }
  setProgress(0.8);

  buildCity(avoid);
  // Look-at targets for the camera at each stop.
  const byId = (id) => STOPS.find((s) => s.id === id);
  byId("about").look = lighthouse.clone().setY(12);
  STOPS.filter((s) => s.project).forEach((s, i) => { s.look = boards[i]; });
  byId("experience").look = gopuram;
  byId("contact").look = station;

  renderer.compile(scene, camera);
  setProgress(1);
}

/* ---------- ride ---------- */

let target = 0, current = 0, lenis = null, started = false, last = performance.now();
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

function scrollMax() { return document.documentElement.scrollHeight - innerHeight; }
function readScroll() { target = clamp(scrollY / Math.max(1, scrollMax())); }

function place(u, dt) {
  const ride = clamp(u * 1.02 - 0.0, 0, 0.985);
  // Opening: drop from an aerial view of the city to just behind the auto.
  const intro = smooth(0, 0.07, u);
  const { p, t } = frameAt(ride);
  const ahead = curve.getPointAt(clamp(ride + 0.035));

  const road = tmp.copy(p).addScaledVector(t, -1).setY(3.4);
  const air = tmp2.set(p.x - 30, 70, p.z + 70);
  camPos.lerpVectors(air, road, intro);

  const look = ahead.clone().setY(1.6);
  const airLook = curve.getPointAt(0.2).setY(0);
  look.lerp(airLook, 1 - intro);

  // Turn the head towards the landmark of the stop we are passing.
  for (const s of STOPS) {
    if (!s.look) continue;
    const w = smooth(s.from - 0.02, s.at, u) * (1 - smooth(s.at + 0.01, s.to + 0.02, u));
    if (w > 0) look.lerp(s.look, w * (s.project ? 0.35 : 0.5));
  }
  camera.position.copy(camPos);
  camera.lookAt(look);

  // The auto rides a little ahead of the camera.
  const au = clamp(ride + 0.016, 0, 1);
  const a = frameAt(au);
  auto.position.copy(a.p).setY(0);
  auto.rotation.y = Math.atan2(a.t.x, a.t.z);
  const speed = Math.abs(target - current) * 600;
  for (const w of wheels) w.rotation.x += (0.6 + speed) * dt * 6;
  auto.position.y = Math.sin(performance.now() / 90) * 0.02 * Math.min(1, speed);

  sun.position.copy(camPos).add(new THREE.Vector3(-60, 80, -40));
  sun.target.position.copy(camPos).addScaledVector(t, 30);
}

function animateSea(dt) {
  if (!sea || reduced) return;
  seaClock.t += dt;
  const a = sea.geometry.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = seaBase[i * 3], z = seaBase[i * 3 + 2];
    a.array[i * 3 + 1] = Math.sin(x * 0.12 + seaClock.t * 1.2) * 0.25 + Math.cos(z * 0.09 + seaClock.t) * 0.2;
  }
  a.needsUpdate = true;
  sea.geometry.computeVertexNormals();
}

const panels = [], stopBtns = [];
const pctBar = $(".bar__pct"), hint = $(".hint");
let activeStop = -1;

function updateUI(u) {
  pctBar.textContent = String(Math.round(u * 100)).padStart(3, "0") + "%";
  hint.classList.toggle("is-off", u > 0.02);
  let active = -1;
  STOPS.forEach((s, i) => {
    const on = u >= s.from && u <= s.to;
    if (on) active = i;
    const el = panels[i];
    if (el.classList.contains("is-on") !== on) {
      el.classList.toggle("is-on", on);
      el.inert = !on;
    }
  });
  if (active !== activeStop) {
    activeStop = active;
    stopBtns.forEach((b, i) => (i === active ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  current += (target - current) * (reduced ? 1 : 1 - Math.pow(0.0015, dt));
  if (Math.abs(target - current) < 1e-5) current = target;
  place(current, dt);
  animateSea(dt);
  if (started) updateUI(current);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function goTo(i) {
  const y = STOPS[i].at * scrollMax() + (i === 0 ? 0 : 1);
  if (lenis) lenis.scrollTo(y, { duration: reduced ? 0 : 2.4 });
  else scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
}

function reveal() {
  const brush = $(".brush");
  gate.classList.add("is-gone");
  document.body.classList.remove("is-locked");
  if (lenis) lenis.start();
  started = true;
  const paths = [...brush.querySelectorAll("path")];
  if (reduced) { brush.classList.add("is-gone"); return; }
  paths.forEach((p, i) => {
    p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, delay: 120 + i * 160, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" });
  });
  setTimeout(() => brush.classList.add("is-gone"), 120 + paths.length * 160 + 800);
}

function bindPointer() {
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const hit = (e) => {
    ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    return ray.intersectObjects(clickables, false)[0];
  };
  // Panels sit above the canvas, so listen on the window and ignore UI clicks.
  addEventListener("pointermove", (e) => {
    if (e.target.closest("a, button, .panel")) return;
    document.body.style.cursor = started && hit(e) ? "pointer" : "";
  });
  addEventListener("click", (e) => {
    if (!started || e.target.closest("a, button, .panel")) return;
    const h = hit(e);
    if (h) location.href = h.object.userData.href;
  });
}

async function main() {
  renderPanels();
  panels.push(...document.querySelectorAll(".panel"));
  stopBtns.push(...document.querySelectorAll(".stops button"));
  stopBtns.forEach((b) => b.addEventListener("click", () => goTo(+b.dataset.stop)));

  if (!webglOK()) {
    $(".gate__error").hidden = false;
    $(".gate__progress").hidden = true;
    startBtn.hidden = true;
    return;
  }

  document.body.classList.add("is-locked");
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.8 });
    lenis.stop();
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  history.scrollRestoration = "manual";
  scrollTo(0, 0);

  try {
    await build();
  } catch (e) {
    console.error(e);
    $(".gate__error").hidden = false;
    return;
  }

  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    readScroll();
  });
  bindPointer();
  requestAnimationFrame(frame);

  startBtn.disabled = false;
  $(".gate__progress span:last-child").textContent = "City ready";
  startBtn.addEventListener("click", reveal, { once: true });
  startBtn.focus();
}

// data.js and Lenis are deferred classic scripts; modules run after them.
main();
