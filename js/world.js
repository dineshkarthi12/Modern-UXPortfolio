/* ==========================================================================
   The world: the hero photograph rebuilt as a 3D point cloud.
   Every pixel of assets/hero-poster.webp becomes a particle, pushed back to
   the depth stored in assets/house/depth.png. From the starting camera it
   reads as the photograph; as the page scrolls the camera flies over the
   pool, turns to the glass house and finally rises to look at the mountains.
   Raw WebGL, no library. Exposes DK.world.ready (resolves once drawn).
   ========================================================================== */

(function () {
  "use strict";

  const DK = (window.DK = window.DK || {});
  const canvas = document.querySelector(".world");
  const motion = document.documentElement.classList.contains("motion");
  let resolveReady;
  DK.world = { ready: new Promise((r) => (resolveReady = r)) };
  if (!canvas || !motion) return resolveReady(false);

  const gl = canvas.getContext("webgl", { antialias: false, alpha: true, powerPreference: "high-performance" });
  if (!gl) return resolveReady(false);

  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const GRID_W = mobile ? 640 : 960;          // particles across
  const GRID_H = Math.round(GRID_W * 9 / 16);
  const F = GRID_W * 0.7729;                  // focal length in grid pixels (40deg vertical fov at 16:9)
  const Z_NEAR = 5, Z_FAR = 300;
  const FOV_Y = 40 * Math.PI / 180;

  /* --- shaders --- */
  const VS = `
    attribute vec3 aHome;
    attribute vec3 aColor;
    attribute vec4 aRand;         // xyz: scatter direction, w: seed
    uniform mat4 uProj, uView;
    uniform float uAssemble, uTime, uTurb, uSize;
    varying vec3 vColor;
    varying float vFade;
    void main() {
      float t = clamp((uAssemble - aRand.w * 0.45) / 0.55, 0.0, 1.0);
      t = 1.0 - pow(1.0 - t, 3.0);
      float z = -aHome.z;
      vec3 scatter = aHome + aRand.xyz * (6.0 + z * 0.35);
      vec3 p = mix(scatter, aHome, t);
      // drift: a quiet shimmer at rest, a gust when the page moves fast
      float n = sin(aHome.x * 1.7 + uTime * 0.9 + aRand.w * 30.0) * cos(aHome.y * 1.3 - uTime * 0.7);
      p += aRand.xyz * (0.004 * z * (0.15 + uTurb * 3.0)) * n;
      p.y += uTurb * aRand.w * 0.02 * z;
      vec4 mv = uView * vec4(p, 1.0);
      gl_Position = uProj * mv;
      // a splat covers its pixel at the depth it was captured, a touch larger to close gaps
      float world = z / ${F.toFixed(2)} * 1.3;
      gl_PointSize = clamp(world * uSize / -mv.z, 1.0, 9.0);
      vColor = aColor;
      vFade = t;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vColor;
    varying float vFade;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      if (dot(c, c) > 0.25) discard;
      gl_FragColor = vec4(vColor * (0.82 + 0.18 * vFade), 1.0);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    return resolveReady(false);
  }
  gl.useProgram(prog);
  const U = {};
  ["uProj", "uView", "uAssemble", "uTime", "uTurb", "uSize"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  /* --- matrices --- */
  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function lookAt(e, c) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = zz, xy = 0, xz = -zx;                     // up = (0,1,0) x z
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1
    ]);
  }

  /* --- camera path: one keyframe per stretch of the page --- */
  // world units: camera starts at the photographer's eye, 1.5 above the water, looking down -z
  // stays within ~20deg of the original view: a single photograph only holds what that lens saw
  const KEYS = [
    { pos: [0, 0, 0], look: [0, 0, -100] },              // the photograph
    { pos: [0.8, 0.2, -6], look: [2, 0.1, -100] },        // pushing in over the water
    { pos: [-2.2, 0.6, -11], look: [1.5, 0.5, -100] },    // gliding left, the house slides past
    { pos: [1.8, 0.9, -15], look: [3.5, 0.8, -100] },     // drifting toward the corner of the house
    { pos: [-1.2, 1.3, -17], look: [-0.5, 1.2, -120] },   // over the far edge of the pool
    { pos: [0.6, 1.0, -12], look: [0.8, 0.9, -120] },     // easing back
    { pos: [0, 0.3, -2], look: [0, 0.2, -100] }           // home again: the photograph
  ];
  let stops = KEYS.map((_, i) => i / (KEYS.length - 1));

  function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function sample(key, p) {
    let i = 0;
    while (i < stops.length - 2 && p > stops[i + 1]) i++;
    const t = Math.min(1, Math.max(0, (p - stops[i]) / (stops[i + 1] - stops[i] || 1)));
    const s = t * t * (3 - 2 * t);
    const a = KEYS[Math.max(0, i - 1)][key], b = KEYS[i][key], c = KEYS[i + 1][key], d = KEYS[Math.min(KEYS.length - 1, i + 2)][key];
    return [0, 1, 2].map((k) => catmull(a[k], b[k], c[k], d[k], s));
  }

  // stops follow the page: hero end, then each chapter
  DK.world.setStops = function (list) {
    if (list && list.length === KEYS.length) stops = list;
  };

  /* --- point cloud from photograph + depth --- */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  function pixels(img, smooth) {
    const c = document.createElement("canvas");
    c.width = GRID_W; c.height = GRID_H;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.imageSmoothingEnabled = smooth;   // depth must not blend across edges
    x.drawImage(img, 0, 0, GRID_W, GRID_H);
    return x.getImageData(0, 0, GRID_W, GRID_H).data;
  }

  let count = 0;
  function build(color, depth, back) {
    // one particle per pixel, plus a hidden layer behind the house for when the camera looks past it
    const N = GRID_W * GRID_H;
    let extra = 0;
    for (let i = 0; i < N; i++) if (depth[i * 4 + 1] > 0) extra++;
    count = N + extra;
    const home = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    const inv = (1 / Z_NEAR - 1 / Z_FAR);
    let k = 0;
    for (let i = 0; i < N + N; i++) {
      const layer = i < N ? 0 : 1;
      const o = (i % N) * 4;
      if (layer && depth[o + 1] === 0) continue;
      const u = (i % N) % GRID_W, v = Math.floor((i % N) / GRID_W);
      const src = layer ? back : color;
      const d = depth[o + layer] / 255;
      const z = 1 / (d * d * inv + 1 / Z_FAR);
      const ju = u + Math.random() - 0.5, jv = v + Math.random() - 0.5;
      home[k * 3] = (ju - GRID_W / 2) / F * z;
      home[k * 3 + 1] = -(jv - GRID_H / 2) / F * z;
      home[k * 3 + 2] = -z;
      col[k * 3] = src[o] / 255;
      col[k * 3 + 1] = src[o + 1] / 255;
      col[k * 3 + 2] = src[o + 2] / 255;
      const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      rand[k * 4] = Math.sin(b) * Math.cos(a);
      rand[k * 4 + 1] = Math.cos(b) * 0.6 + 0.4;
      rand[k * 4 + 2] = Math.sin(b) * Math.sin(a);
      rand[k * 4 + 3] = Math.random();
      k++;
    }
    const attr = (name, data, size) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    attr("aHome", home, 3);
    attr("aColor", col, 3);
    attr("aRand", rand, 4);
  }

  /* --- frame loop --- */
  const state = { assemble: 0, progress: 0, target: 0, turb: 0, mx: 0, my: 0, tmx: 0, tmy: 0 };
  let width = 0, height = 0, dpr = 1, proj = null, running = false, visible = true;
  const t0 = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = width / height;
    // cover: never show past the photograph's edges at the starting camera
    const fov = aspect > 16 / 9 ? 2 * Math.atan(Math.tan(FOV_Y / 2) * (16 / 9) / aspect) : FOV_Y;
    proj = perspective(fov, aspect, 0.1, 600);
    // narrow screens: slide the frame (off-axis, so the photograph stays undistorted) toward the house
    if (aspect < 16 / 9) {
      const half = 0.5 * aspect / (16 / 9);             // half the visible width, in photo widths
      const centre = Math.min(0.64, 0.99 - half);
      proj[8] = (centre - 0.5) * 2 * (16 / 9) / aspect;
    }
    gl.uniformMatrix4fv(U.uProj, false, proj);
    // splat size in device pixels per world unit at distance 1
    gl.uniform1f(U.uSize, canvas.height / 2 / Math.tan(fov / 2));
  }

  let last = 0;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    // frame-rate independent easing
    const ease = (rate) => 1 - Math.exp(-dt * rate);
    state.progress += (state.target - state.progress) * ease(5);
    state.turb *= 1 - ease(3.5);
    state.mx += (state.tmx - state.mx) * ease(3);
    state.my += (state.tmy - state.my) * ease(3);
    const pos = sample("pos", state.progress);
    const look = sample("look", state.progress);
    pos[0] += state.mx * 0.35; pos[1] += state.my * 0.2;
    gl.uniformMatrix4fv(U.uView, false, lookAt(pos, look));
    gl.uniform1f(U.uAssemble, state.assemble);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1f(U.uTurb, Math.min(1, state.turb));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  DK.world.setProgress = (p) => { state.target = p; };
  DK.world.gust = (v) => { state.turb = Math.max(state.turb, v); };
  DK.world.count = () => count;

  Promise.all([canvas.dataset.color, canvas.dataset.depth, canvas.dataset.back].map(loadImage))
    .then(([c, d, b]) => {
      build(pixels(c, true), pixels(d, false), pixels(b, true));
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.DEPTH_TEST);
      resize();
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
      window.addEventListener("pointermove", (e) => {
        state.tmx = (e.clientX / window.innerWidth) * 2 - 1;
        state.tmy = -((e.clientY / window.innerHeight) * 2 - 1);
      }, { passive: true });
      running = true;
      requestAnimationFrame(frame);
      canvas.classList.add("is-live");
      document.documentElement.classList.add("world-live");
      // dust gathers into the photograph
      const start = performance.now(), DUR = 2600;
      (function grow(now) {
        state.assemble = Math.min(1, (now - start) / DUR);
        if (state.assemble < 1) requestAnimationFrame(grow);
      })(start);
      resolveReady(true);
    })
    .catch(() => resolveReady(false));
})();
