/* Home page: renders content from data.js, then wires up the scroll scenes. */
(function () {
  "use strict";

  const { S, esc, rich, pad2, icons, ext, motion } = DK;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const KINDS = ["wireframe", "flow", "ui"];
  const KIND_NAMES = { wireframe: "Wireframe", flow: "User flow", ui: "Final UI" };

  /* ======================================================================
     Render
     ====================================================================== */

  function bindText() {
    $$("[data-bind]").forEach((el) => {
      const val = el.dataset.bind.split(".").reduce((o, k) => (o ? o[k] : undefined), S);
      if (val != null) el.textContent = val;
    });
    $$(".js-resume").forEach((a) => (a.href = S.links.resume));
  }

  function renderStats() {
    $(".hero__stats").innerHTML = S.stats.map((s) => `
      <li class="hero__stat">
        <div class="hero__stat-num" aria-hidden="true" data-value="${s.value}" data-suffix="${esc(s.suffix)}">${s.value}${esc(s.suffix)}</div>
        <div class="mono hero__stat-label"><span class="sr-only">${s.value}${esc(s.suffix)} </span>${esc(s.label)}</div>
      </li>`).join("");
  }

  function renderAbout() {
    $(".about__story").innerHTML = S.about.paragraphs.map((p) => `<p class="reveal">${rich(p)}</p>`).join("");
    $(".spec").innerHTML = S.about.spec.map(([k, v]) =>
      `<div class="spec__row"><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  }

  function renderWork() {
    const total = S.projects.length;
    $(".work__scenes").innerHTML = S.projects.map((p, i) => {
      const m = p.metric;
      const figma = DK.isPlaceholderFigma(p.figma) ? "" :
        `<a class="btn" href="${esc(p.figma)}" ${ext}>View in Figma<span class="sr-only"> (opens in a new tab)</span></a>`;
      const layers = KINDS.map((k, li) => `
        <div class="layer layer--${k}" data-i="${li}">
          <div class="layer__plate">${DK.projectImg(p, k)}</div>
          <div class="layer__tag" style="top:${[72, 46, 20][li]}%">
            <span class="layer__lead"></span>
            <span class="mono layer__name">${pad2(li + 1)}<span class="layer__full"> ${KIND_NAMES[k]}</span></span>
          </div>
        </div>`).join("");
      return `
      <article class="scene" id="project-${p.slug}" aria-labelledby="pn-${p.slug}">
        <div class="wrap scene__inner">
          <div class="scene__text">
            <div class="scene__index"><span class="mono">${pad2(i + 1)} / ${pad2(total)}</span><span class="label">Fig. ${pad2(i + 3)}</span></div>
            <p class="label">${esc(p.category)} · ${esc(p.sector)}</p>
            <h3 class="display scene__name" id="pn-${p.slug}">${esc(p.name)}</h3>
            <p class="scene__summary">${esc(p.summary)}</p>
            <div class="scene__metric">
              <span class="scene__metric-num" data-prefix="${esc(m.prefix)}" data-value="${m.value}" data-suffix="${esc(m.suffix)}">${esc(m.prefix)}${m.value}${esc(m.suffix)}</span>
              <span class="label">${esc(m.label)}</span>
            </div>
            <div class="scene__actions">
              <a class="btn btn--solid" href="case-studies/${p.slug}.html">Read case study ${icons.arrow}</a>
              <button class="btn" type="button" data-lightbox="${i}">View screens</button>
              ${figma}
            </div>
          </div>
          <div class="scene__stage">
            <div class="stage" aria-hidden="false">
              <div class="stack">${layers}</div>
            </div>
            <p class="scene__fig mono">Fig. ${pad2(i + 3)} — ${esc(p.name)}, exploded view<span class="scene__legend"> · 01 Wireframe · 02 User flow · 03 Final UI</span></p>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  function renderProcess() {
    $(".process__track").innerHTML = S.process.map((s, i) => `
      <li class="step">
        <div class="step__top">
          <span class="step__num" aria-hidden="true">${pad2(i + 1)}</span>
          <span class="mono step__arrow" aria-hidden="true">${i < S.process.length - 1 ? "→ " + pad2(i + 2) : "End"}</span>
        </div>
        <h3 class="step__name"><span class="sr-only">Step ${i + 1}: </span>${esc(s.name)}</h3>
        <p class="step__text">${esc(s.text)}</p>
        <ul class="step__tools" aria-label="Tools">${s.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </li>`).join("");
  }

  function renderExperience() {
    $(".timeline__roles").innerHTML = S.experience.map((r) => `
      <li class="role">
        <span class="role__dot" aria-hidden="true"></span>
        <div class="role__when">
          <span class="mono">${esc(r.dates)}</span>
          <span class="label">${esc(r.company)}</span>
        </div>
        <div class="role__body">
          <h3 class="role__title">${esc(r.role)}</h3>
          <ul class="role__points">${r.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>
      </li>`).join("");
  }

  function renderToolkit() {
    $(".toolkit__list").innerHTML = S.skills.map(([group, items], i) => `
      <li class="toolkit__row">
        <span class="mono toolkit__code">T-${pad2(i + 1)}</span>
        <h3 class="toolkit__group">${esc(group)}</h3>
        <p class="toolkit__items">${items.split(/,\s*(?![^()]*\))/).map((t) => `<span>${esc(t)}</span>`).join("")}</p>
      </li>`).join("");
    $(".creds__certs").innerHTML = S.certifications.map((c, i) =>
      `<li><span class="label">C-${pad2(i + 1)}</span><span>${esc(c)}</span></li>`).join("");
    const e = S.education;
    $(".creds__edu").innerHTML = `
      <p class="edu__degree">${esc(e.degree)}</p>
      <p class="edu__school">${esc(e.school)}</p>
      <p class="label">${esc(e.years)}</p>`;
  }

  function renderContact() {
    const L = S.links;
    const sr = '<span class="sr-only"> (opens in a new tab)</span>';
    const row = (kind, value, href, icon, external, extra = "", cls = "") => `
      <li class="contact__row ${cls}">
        <a class="contact__link" href="${esc(href)}" ${external ? ext : ""}>
          <span class="contact__icon">${icons[icon]}</span>
          <span class="mono contact__kind">${kind}</span>
          <span class="contact__value">${value}${external ? sr : ""}</span>
          ${icons.arrowUpRight}
        </a>${extra}
      </li>`;
    $(".contact__rows").innerHTML = [
      row("Email", esc(L.email), "mailto:" + L.email, "mail", false,
        `<button class="contact__copy" type="button" data-copy="${esc(L.email)}" aria-label="Copy email address">Copy</button>`, "contact__row--email"),
      row("Phone", esc(L.phone), L.phoneHref, "phone", false),
      row("WhatsApp", "Message me on WhatsApp", L.whatsapp, "whatsapp", true),
      row("LinkedIn", esc(L.linkedinLabel), L.linkedin, "linkedin", true),
      row("Resume", "Resume on Google Drive", L.resume, "doc", true)
    ].join("") + '<li class="sr-only" aria-live="polite" id="copy-status"></li>';
  }

  /* ======================================================================
     Interactions that work with or without motion
     ====================================================================== */

  function initCopy() {
    $$("[data-copy]").forEach((btn) => {
      let t;
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (_) {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.append(ta);
          ta.select();
          try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
          ta.remove();
        }
        btn.textContent = ok ? "Copied" : "Press Ctrl+C";
        btn.classList.toggle("is-copied", ok);
        $("#copy-status").textContent = ok ? "Email address copied to clipboard" : "Copy failed. The address is " + text;
        clearTimeout(t);
        t = setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("is-copied");
          $("#copy-status").textContent = "";
        }, 2200);
      });
    });
  }

  function initLightbox() {
    const dlg = $(".lightbox");
    const panel = $("#lb-panel");
    const tabs = $$(".tab", dlg);
    const count = $(".lightbox__count", dlg);
    let project = null;
    let opener = null;

    const select = (kind, focus) => {
      tabs.forEach((t) => {
        const on = t.dataset.kind === kind;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) {
          panel.setAttribute("aria-labelledby", t.id);
          if (focus) t.focus();
        }
      });
      panel.innerHTML = DK.projectImg(project, kind, { eager: true });
      count.textContent = `${KINDS.indexOf(kind) + 1} / 3 · ${KIND_NAMES[kind]}`;
    };

    const open = (i, btn) => {
      project = S.projects[i];
      opener = btn;
      $("#lb-title").textContent = `${project.name} · Screens`;
      select("wireframe");
      dlg.showModal();
      DK.lenis && DK.lenis.stop();
      tabs[0].focus();
    };

    const close = () => dlg.open && dlg.close();

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lightbox]");
      if (b) open(+b.dataset.lightbox, b);
    });
    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.kind, true)));
    $(".lightbox__close", dlg).addEventListener("click", close);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener("close", () => {
      DK.lenis && DK.lenis.start();
      opener && opener.focus();
    });
    dlg.addEventListener("keydown", (e) => {
      const cur = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      let next = null;
      if (e.key === "ArrowRight") next = (cur + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (cur - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        select(tabs[next].dataset.kind, true);
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      DK.trapFocus(dlg, e);
    });
  }

  function initHeaderState() {
    const header = $(".site-header");
    const about = $("#about");
    const update = () => {
      const solid = about.getBoundingClientRect().top <= header.offsetHeight + 1;
      header.dataset.state = solid ? "solid" : "over";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ======================================================================
     Hero — frame sequence
     ====================================================================== */

  function initHero() {
    const hero = $(".hero");
    const canvas = $(".hero__canvas");
    const ctx = canvas.getContext("2d");
    const poster = $(".hero__poster");
    const frameLabel = $(".hero__frame");
    const heroBar = $(".hero__progress span");
    const loader = $(".loader");
    const pctEl = $(".loader__pct");
    const loaderBar = $(".loader__bar span");

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const COUNT = mobile ? 120 : 240;
    const DIR = mobile ? "mobile" : "desktop";
    const FIRST = Math.min(40, COUNT);
    const src = (i) => `assets/frames/${DIR}/${String(i + 1).padStart(4, "0")}.webp`;

    const frames = new Array(COUNT);
    const ready = new Uint8Array(COUNT);
    let current = 0;
    let drawn = -1;
    let firstDrawn = false;
    let raf = 0;

    /* --- drawing --- */
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawn = -1;
      schedule();
    }

    function nearest(i) {
      if (ready[i]) return i;
      for (let d = 1; d < COUNT; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < COUNT && ready[i + d]) return i + d;
      }
      return -1;
    }

    function schedule() { if (!raf) raf = requestAnimationFrame(render); }

    function render() {
      raf = 0;
      const k = nearest(current);
      if (k < 0 || k === drawn) return;
      const img = frames[k];
      const cw = canvas.width, ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw, dh;
      if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      drawn = k;
      frameLabel.textContent = `Fr. ${String(k + 1).padStart(3, "0")} / ${COUNT}`;
      if (!firstDrawn && k === 0) {
        firstDrawn = true;
        poster.classList.add("is-hidden");
      }
    }

    /* --- loading --- */
    function load(i) {
      return new Promise((resolve) => {
        if (frames[i]) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          ready[i] = 1;
          if (Math.abs(i - current) < 3 || !firstDrawn) { drawn = -1; schedule(); }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src(i);
        frames[i] = img;
      });
    }

    async function loadList(list, concurrency, onEach) {
      let k = 0;
      const worker = async () => {
        while (k < list.length) {
          const i = list[k++];
          await load(i);
          onEach && onEach();
        }
      };
      await Promise.all(Array.from({ length: concurrency }, worker));
    }

    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));

    /* --- scroll timeline --- */
    const state = { frame: 0 };
    const counters = $$(".hero__stat-num");
    const count = { v: 0 };
    const b1 = $('[data-block="1"]'), b2 = $('[data-block="2"]'), b3 = $('[data-block="3"]'), b4 = $('[data-block="4"]');

    const setCounters = () => counters.forEach((el) => {
      el.textContent = Math.round(+el.dataset.value * count.v) + el.dataset.suffix;
    });
    setCounters();

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: () => "+=" + window.innerHeight * (mobile ? 2 : 4),
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          heroBar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
          b4.classList.toggle("is-live", self.progress > 0.86);
        }
      }
    });

    tl.to(state, {
      frame: COUNT - 1, duration: 1,
      onUpdate: () => {
        const f = Math.round(state.frame);
        if (f !== current) { current = f; schedule(); }
      }
    }, 0);

    // 0–15%: name
    tl.to(b1, { opacity: 0, y: -48, duration: 0.05, ease: "power1.in" }, 0.15);
    // 30–45%: stats
    tl.fromTo(b2, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.04, ease: "power1.out" }, 0.27);
    tl.to(count, { v: 1, duration: 0.1, ease: "power1.out", onUpdate: setCounters }, 0.3);
    tl.to(b2, { opacity: 0, y: -40, duration: 0.04, ease: "power1.in" }, 0.46);
    // 60–75%: civil engineer line
    tl.fromTo(b3, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.04, ease: "power1.out" }, 0.57);
    tl.to(b3, { opacity: 0, y: -40, duration: 0.04, ease: "power1.in" }, 0.76);
    // 90–100%: calls to action
    tl.fromTo(b4, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.04, ease: "power1.out" }, 0.87);

    // If a keyboard user tabs into the final buttons early, jump to them.
    b4.addEventListener("focusin", () => {
      const st = tl.scrollTrigger;
      if (st.progress < 0.9) {
        const y = st.end - 2;
        DK.lenis ? DK.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
      }
    });

    window.addEventListener("resize", size);
    size();

    /* --- loader → reveal → background loading --- */
    DK.lenis && DK.lenis.stop();
    let n = 0;
    const firstList = Array.from({ length: FIRST }, (_, i) => i);
    const timeout = new Promise((r) => setTimeout(r, 9000));

    Promise.race([
      loadList(firstList, 6, () => {
        n++;
        const pct = Math.round((n / FIRST) * 100);
        pctEl.textContent = pct + "%";
        loaderBar.style.transform = `scaleX(${n / FIRST})`;
      }),
      timeout
    ]).then(() => {
      loader.classList.add("is-done");
      document.documentElement.classList.add("loaded");
      DK.lenis && DK.lenis.start();
      ScrollTrigger.refresh();
      DK.scrollToHash && DK.scrollToHash();

      gsap.from($$(".hero__label, .hero__name, .hero__line", b1), {
        y: 36, autoAlpha: 0, duration: 1.2, ease: "power3.out", stagger: 0.12, delay: 0.15
      });

      const rest = [];
      for (let i = FIRST; i < COUNT; i++) rest.push(i);
      idle(() => loadList(rest, 4));
    });
  }

  /* ======================================================================
     Section animations (motion only)
     ====================================================================== */

  function initAbout() {
    const frame = $(".about__frame");
    const img = $("img", frame);
    gsap.timeline({
      scrollTrigger: { trigger: frame, start: "top 88%", end: "center 50%", scrub: 0.6 }
    })
      .fromTo(frame, { clipPath: "inset(22% 30% 22% 30%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
      .fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none" }, 0);
  }

  function initWork() {
    const desktop = window.matchMedia("(min-width: 900px)").matches;
    const GAP = desktop ? 120 : 60;

    $$(".scene").forEach((scene) => {
      const stack = $(".stack", scene);
      const layers = $$(".layer", scene);
      const plates = $$(".layer__plate", scene);
      const tags = $$(".layer__tag", scene);

      // p: 0 → 1 across the pinned scroll.
      // 0–.45 layers pull apart along Z; .58–1 the stack rotates flat.
      const render = (p) => {
        const a = easeInOut(clamp01(p / 0.45));
        const b = easeInOut(clamp01((p - 0.58) / 0.42));
        const rx = 55 * (1 - b);
        const rz = -35 * (1 - b);
        const s = 0.9 + 0.1 * b;
        // the exploded stack rises on screen; push it down to stay centred
        const lift = a * GAP * 0.85 * (1 - b);
        stack.style.transform = `translateY(${lift.toFixed(1)}px) rotateZ(${rz.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        layers.forEach((L, i) => {
          const z = (i * 1.5 + a * GAP * i) * (1 - b);
          L.style.transform = `translateZ(${z.toFixed(1)}px)`;
        });
        // fade the plates, not the layers: opacity on a layer would flatten its 3D children
        plates.forEach((P, i) => { P.style.opacity = i < 2 ? (1 - b).toFixed(3) : "1"; });
        const tagAlpha = clamp01(a * 1.4 - 0.2) * (1 - clamp01(b * 1.6));
        const inv = `scale(${(1 / s).toFixed(3)}) rotateX(${(-rx).toFixed(2)}deg) rotateZ(${(-rz).toFixed(2)}deg)`;
        tags.forEach((t) => {
          t.style.opacity = tagAlpha.toFixed(3);
          t.style.transform = inv;
        });
      };
      render(0);

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: () => render(proxy.p),
        scrollTrigger: desktop
          ? { trigger: scene, start: "top top", end: "+=130%", pin: true, scrub: 0.6, anticipatePin: 1 }
          : { trigger: $(".stage", scene), start: "top 85%", end: "bottom 30%", scrub: 0.6 }
      });

      const num = $(".scene__metric-num", scene);
      DK.countUp(num, +num.dataset.value, { prefix: num.dataset.prefix, suffix: num.dataset.suffix });
    });
  }

  function initProcess() {
    const section = $(".process");
    const viewport = $(".process__viewport");
    const track = $(".process__track");
    const cards = $$(".step", track);

    const tilt = () => {
      const vw = window.innerWidth;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.max(-1.6, Math.min(1.6, (r.left + r.width / 2 - vw / 2) / (vw / 2)));
        c.style.transform = `translateZ(${(-Math.abs(d) * 80).toFixed(1)}px) rotateY(${(-d * 26).toFixed(2)}deg)`;
      });
    };

    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      section.classList.add("is-pinned");
      const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: tilt,
          onRefresh: tilt
        }
      });
      tilt();
      return () => section.classList.remove("is-pinned");
    });
    mm.add("(max-width: 899px)", () => {
      viewport.addEventListener("scroll", tilt, { passive: true });
      tilt();
      return () => viewport.removeEventListener("scroll", tilt);
    });
  }

  function initTimeline() {
    const tlEl = $(".timeline");
    gsap.fromTo($(".timeline__line"), { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: tlEl, start: "top 70%", end: "bottom 70%", scrub: 0.4 }
    });
    $$(".role").forEach((role) => {
      ScrollTrigger.create({
        trigger: role,
        start: "top 70%",
        onEnter: () => role.classList.add("is-active"),
        onLeaveBack: () => role.classList.remove("is-active")
      });
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */

  bindText();
  renderStats();
  renderAbout();
  renderWork();
  renderProcess();
  renderExperience();
  renderToolkit();
  renderContact();
  DK.renderFooter();

  initCopy();
  initLightbox();
  initHeaderState();

  if (motion) {
    initHero();
    initAbout();
    initWork();
    initProcess();
    initTimeline();
    DK.initReveals();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => ScrollTrigger.refresh());
  } else {
    DK.scrollToHash && DK.scrollToHash();
  }
})();
