/* Shared by every page: header, menus, smooth scroll, footer, helpers. */
(function () {
  "use strict";

  const S = window.SITE;
  const doc = document.documentElement;
  const body = document.body;
  const ROOT = body.dataset.root || "";
  const IS_HOME = body.dataset.page === "home";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasLibs = !!(window.gsap && window.ScrollTrigger);
  const motion = !reduced && hasLibs;

  doc.classList.toggle("motion", motion);
  doc.classList.toggle("static", !motion);

  if (hasLibs) gsap.registerPlugin(ScrollTrigger);

  /* ---------- helpers ---------- */

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Escape text, then wrap any [TODO: …] in a visible placeholder span.
  const rich = (s) => esc(s).replace(/\[TODO:[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);

  const asset = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith("data:") ? p : ROOT + p);

  const pad2 = (n) => String(n).padStart(2, "0");

  const isPlaceholderFigma = (url) => !url || /^https:\/\/(www\.)?figma\.com\/?$/.test(url.trim());

  const ext = 'target="_blank" rel="noopener"';

  const icons = {
    arrow: '<svg class="icon arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"/></svg>',
    arrowUpRight: '<svg class="contact__arrow" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M8 20 20 8M10 8h10v10"/></svg>',
    chevron: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="m1.5 3.5 3.5 3.5 3.5-3.5"/></svg>',
    close: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="m4 4 12 12M16 4 4 16"/></svg>',
    mail: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx=".5"/><path d="m3 5 7 6 7-6"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M6.5 2.5h-2a1 1 0 0 0-1 1.1C4 10.6 9.4 16 16.4 16.5a1 1 0 0 0 1.1-1v-2l-3.6-1.4-1.8 1.8A9.5 9.5 0 0 1 6.1 7.9L7.9 6.1Z"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M3.2 16.8 4.3 13A7.3 7.3 0 1 1 7 15.7Z"/><path d="M7.6 6.6c.3-.4.8-.4 1 0l.6 1.3c.1.3 0 .6-.2.8l-.4.4c.4.9 1.2 1.7 2.1 2.1l.4-.4c.2-.2.5-.3.8-.2l1.3.6c.4.2.4.7 0 1-.6.6-1.5.9-2.4.5a7 7 0 0 1-3.6-3.6c-.4-.9-.1-1.8.4-2.5Z"/></svg>',
    linkedin: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="2.5" y="2.5" width="15" height="15" rx=".5"/><path d="M6.5 8.5v5M6.5 6v.01M9.5 13.5v-5m0 2.2c0-1.3.9-2.2 2-2.2s2 .9 2 2.2v2.8"/></svg>',
    doc: '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M5 2.5h6.5L15 6v11.5H5Z"/><path d="M11.5 2.5V6H15M7.5 10h5M7.5 13h5"/></svg>'
  };

  // Neutral labelled placeholder used when a project image fails to load.
  function placeholderSrc(label) {
    const t = esc(label || "Image unavailable");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">` +
      `<rect width="1600" height="1000" fill="#C9C6C0"/>` +
      `<g stroke="#14191D" stroke-opacity=".12" stroke-width="1">` +
      Array.from({ length: 15 }, (_, i) => `<line x1="${(i + 1) * 100}" y1="0" x2="${(i + 1) * 100}" y2="1000"/>`).join("") +
      Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${(i + 1) * 100}" x2="1600" y2="${(i + 1) * 100}"/>`).join("") +
      `</g><g stroke="#14191D" stroke-opacity=".35" fill="none"><rect x="560" y="390" width="480" height="220"/><line x1="560" y1="390" x2="1040" y2="610"/><line x1="1040" y1="390" x2="560" y2="610"/></g>` +
      `<text x="800" y="680" text-anchor="middle" font-family="JetBrains Mono, Menlo, monospace" font-size="30" letter-spacing="3" fill="#14191D">${t.toUpperCase()}</text>` +
      `<text x="800" y="726" text-anchor="middle" font-family="JetBrains Mono, Menlo, monospace" font-size="22" letter-spacing="2" fill="#3F4950">IMAGE NOT AVAILABLE</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // Called from onerror="DK.imgFallback(this)"
  function imgFallback(img) {
    img.onerror = null;
    img.removeAttribute("srcset");
    img.src = placeholderSrc(img.dataset.label || img.alt);
    img.classList.add("is-placeholder");
  }

  function projectImg(p, kind, opts = {}) {
    const names = { wireframe: "Wireframe", flow: "User flow", ui: "Final UI" };
    const label = `${p.name} · ${names[kind]}`;
    const alt = opts.alt != null ? opts.alt : `${p.name}, ${names[kind].toLowerCase()}`;
    return `<img src="${esc(asset(p.images[kind]))}" alt="${esc(alt)}" data-label="${esc(label)}"` +
      ` loading="${opts.eager ? "eager" : "lazy"}" decoding="async" width="1600" height="1000"` +
      `${opts.cls ? ` class="${opts.cls}"` : ""} onerror="DK.imgFallback(this)">`;
  }

  /* ---------- focus trap ---------- */

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== "Tab") return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- header ---------- */

  function navHref(hash) { return IS_HOME ? hash : `${ROOT}index.html${hash}`; }

  function renderHeader() {
    const cases = S.projects.map((p, i) =>
      `<li><a href="${ROOT}case-studies/${p.slug}.html"><span class="mono">${pad2(i + 1)}</span><span>${esc(p.name)}</span><span class="mono">${esc(p.category)}</span></a></li>`
    ).join("");

    const header = document.createElement("div");
    header.innerHTML = `
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="page-progress" aria-hidden="true"><span></span></div>
      <header class="site-header" data-state="${IS_HOME ? "over" : "solid"}">
        <div class="wrap site-header__inner">
          <a class="monogram" href="#top" aria-label="Dinesh Kumar, back to top">DK</a>
          <nav class="nav" aria-label="Primary">
            <ul>
              <li><a href="${navHref("#work")}">Work</a></li>
              <li class="nav__cases">
                <button class="nav__cases-btn" type="button" aria-expanded="false" aria-controls="cases-menu">Case studies ${icons.chevron}</button>
                <ul class="nav__cases-menu" id="cases-menu" hidden>${cases}</ul>
              </li>
              <li><a href="${navHref("#about")}">About</a></li>
              <li><a href="${navHref("#experience")}">Experience</a></li>
              <li><a href="${navHref("#contact")}">Contact</a></li>
            </ul>
          </nav>
          <a class="btn btn--solid btn--sm btn--resume" href="${esc(S.links.resume)}" ${ext}>Resume<span class="sr-only"> (opens in a new tab)</span></a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
            <span>Menu</span><span class="menu-toggle__bars" aria-hidden="true"></span>
          </button>
        </div>
      </header>
      <div class="mobile-menu on-dark" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
        <div class="mobile-menu__top">
          <a class="monogram" href="#top" aria-label="Dinesh Kumar, back to top">DK</a>
          <button class="mobile-menu__close" type="button">Close ${icons.close}</button>
        </div>
        <ul class="mobile-menu__list">
          <li><a href="${navHref("#work")}"><span class="mono">01</span>Work</a></li>
          <li>
            <a href="${navHref("#work")}" aria-describedby="mm-cases"><span class="mono">02</span>Case studies</a>
            <ul class="mobile-menu__sub" id="mm-cases">
              ${S.projects.map((p) => `<li><a href="${ROOT}case-studies/${p.slug}.html">${esc(p.name)}</a></li>`).join("")}
            </ul>
          </li>
          <li><a href="${navHref("#about")}"><span class="mono">03</span>About</a></li>
          <li><a href="${navHref("#experience")}"><span class="mono">04</span>Experience</a></li>
          <li><a href="${navHref("#contact")}"><span class="mono">05</span>Contact</a></li>
        </ul>
        <div class="mobile-menu__foot">
          <a class="btn btn--solid" href="${esc(S.links.resume)}" ${ext}>Resume<span class="sr-only"> (opens in a new tab)</span></a>
          <a class="btn" href="mailto:${esc(S.links.email)}">Email</a>
        </div>
      </div>`;
    body.prepend(...header.childNodes);
    initMenus();
  }

  function initMenus() {
    // Case studies dropdown (desktop)
    const btn = document.querySelector(".nav__cases-btn");
    const menu = document.getElementById("cases-menu");
    const setOpen = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    };
    btn.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav__cases")) setOpen(false); });
    document.querySelector(".nav__cases").addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); btn.focus(); }
    });
    document.querySelector(".nav__cases").addEventListener("focusout", (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    });

    // Full-screen mobile menu
    const toggle = document.querySelector(".menu-toggle");
    const panel = document.getElementById("mobile-menu");
    const close = panel.querySelector(".mobile-menu__close");
    const open = () => {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      DK.lenis && DK.lenis.stop();
      body.style.overflow = "hidden";
      close.focus();
    };
    const shut = (restore = true) => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      DK.lenis && DK.lenis.start();
      body.style.overflow = "";
      if (restore) toggle.focus();
    };
    toggle.addEventListener("click", open);
    close.addEventListener("click", () => shut());
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") shut();
      trapFocus(panel, e);
    });
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) shut(false); });
    window.addEventListener("resize", () => { if (!panel.hidden && window.innerWidth >= 960) shut(false); });
  }

  /* ---------- footer ---------- */

  function renderFooter() {
    const L = S.links;
    const f = document.createElement("footer");
    f.className = "footer";
    f.innerHTML = `
      <div class="wrap">
        <dl class="titleblock">
          <div class="titleblock__cell"><dt class="label">Drawn by</dt><dd>${esc(S.person.name)}</dd></div>
          <div class="titleblock__cell"><dt class="label">Discipline</dt><dd>UI/UX &amp; Product Design</dd></div>
          <div class="titleblock__cell"><dt class="label">Location</dt><dd>${esc(S.person.location)}</dd></div>
          <div class="titleblock__cell"><dt class="label">Revision</dt><dd>Rev. 2026</dd></div>
        </dl>
        <ul class="footer__links">
          <li><a class="text-link" href="mailto:${esc(L.email)}">Email</a></li>
          <li><a class="text-link" href="${esc(L.phoneHref)}">Phone</a></li>
          <li><a class="text-link" href="${esc(L.whatsapp)}" ${ext}>WhatsApp<span class="sr-only"> (opens in a new tab)</span></a></li>
          <li><a class="text-link" href="${esc(L.linkedin)}" ${ext}>LinkedIn<span class="sr-only"> (opens in a new tab)</span></a></li>
          <li><a class="text-link" href="${esc(L.resume)}" ${ext}>Resume<span class="sr-only"> (opens in a new tab)</span></a></li>
        </ul>
        <div class="footer__base">
          <span class="label">© 2026 ${esc(S.person.name)}</span>
          <span class="label">${esc(S.person.coords)}</span>
        </div>
      </div>`;
    body.append(f);
  }

  /* ---------- smooth scroll ---------- */

  function initScroll() {
    if (motion && window.Lenis) {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      DK.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // In-page anchors
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id === "#") return;
      const target = id === "#top" ? document.getElementById("top") : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToEl(target, id === "#top");
      history.replaceState(null, "", id === "#top" ? location.pathname : id);
    });


    // Progress hairline + scrolled flag
    const bar = document.querySelector(".page-progress span");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      doc.classList.toggle("has-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Pages call this once their layout is final (after the loader on home).
  function scrollToHash() {
    if (!location.hash || location.hash.length < 2) return;
    let target = null;
    try { target = document.querySelector(location.hash); } catch (_) { return; }
    if (target) requestAnimationFrame(() => scrollToEl(target, false, true));
  }

  function scrollToEl(target, top, immediate) {
    const offset = top ? 0 : -(document.querySelector(".site-header")?.offsetHeight || 0) + 1;
    const focusTarget = () => {
      if (top) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    if (DK.lenis) {
      DK.lenis.scrollTo(top ? 0 : target, { offset, immediate: !!immediate, duration: 1.4, onComplete: focusTarget });
    } else {
      const y = top ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: "auto" });
      focusTarget();
    }
  }

  /* ---------- small shared animation ---------- */

  // Fade-up for elements marked .reveal (once). No-op without motion.
  function initReveals(scope = document) {
    if (!motion) return;
    scope.querySelectorAll(".reveal").forEach((el) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  // Animate a number from 0 to its final value once it scrolls into view.
  function countUp(el, value, { prefix = "", suffix = "" } = {}) {
    el.textContent = prefix + value + suffix;
    if (!motion) return;
    const o = { v: 0 };
    el.textContent = prefix + "0" + suffix;
    gsap.to(o, {
      v: value, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => { el.textContent = prefix + Math.round(o.v) + suffix; }
    });
  }

  /* ---------- export ---------- */

  window.DK = {
    S, ROOT, IS_HOME, motion, reduced, hasLibs,
    esc, rich, asset, pad2, icons, ext,
    isPlaceholderFigma, placeholderSrc, imgFallback, projectImg,
    trapFocus, scrollToEl, scrollToHash, initReveals, countUp,
    lenis: null
  };

  renderHeader();
  initScroll();
  // Footer goes after <main>, so render it once the page script has filled main.
  DK.renderFooter = renderFooter;
})();
