/* Case-study pages: one template, filled from data.js by body[data-project]. */
(function () {
  "use strict";

  const { S, esc, rich, pad2, icons, motion } = DK;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const slug = document.body.dataset.project;
  const index = S.projects.findIndex((p) => p.slug === slug);
  const p = S.projects[index];
  const cs = p.caseStudy;
  const next = S.projects[(index + 1) % S.projects.length];
  const total = S.projects.length;

  const paras = (list) => list.map((t) => `<p>${rich(t)}</p>`).join("");

  const section = (no, id, title, inner, cls = "") => `
    <section class="cs-sec ${cls}" id="${id}" aria-labelledby="${id}-h">
      <div class="wrap grid">
        <header class="cs-sec__head">
          <span class="mono cs-sec__no">${no}</span>
          <h2 class="cs-sec__title" id="${id}-h">${esc(title)}</h2>
        </header>
        ${inner}
      </div>
    </section>`;

  const metaRow = [
    ["Role", cs.meta.role],
    ["Platform", cs.meta.platform],
    ["Timeline", cs.meta.timeline],
    ["Team", cs.meta.team],
    ["Tools", cs.meta.tools]
  ].map(([k, v]) => `<div class="cs-meta__item"><dt class="label">${k}</dt><dd>${rich(v)}</dd></div>`).join("");

  const results = cs.results.map((r) => {
    let value;
    if (r.todo) value = `<span class="cs-result__todo">${rich(r.todo)}</span>`;
    else if (r.text) value = `<span class="cs-result__num">${esc(r.text)}</span>`;
    else value = `<span class="cs-result__num" data-count="${r.value}" data-prefix="${esc(r.prefix || "")}" data-suffix="${esc(r.suffix || "")}">${esc(r.prefix || "")}${r.value}${esc(r.suffix || "")}</span>`;
    return `<li class="cs-result">${value}<span class="mono cs-result__label">${rich(r.label)}</span></li>`;
  }).join("");

  const figma = DK.isPlaceholderFigma(p.figma) ? "" :
    `<a class="btn" href="${esc(p.figma)}" ${DK.ext}>View in Figma<span class="sr-only"> (opens in a new tab)</span></a>`;

  $("#main").innerHTML = `
    <section class="cs-cover" id="top" aria-labelledby="cs-title">
      <div class="wrap">
        <div class="sheet__meta">
          <span class="mono sheet__no"><i class="sheet__tick" aria-hidden="true"></i>Case study ${pad2(index + 1)} / ${pad2(total)}</span>
          <span class="label">${esc(p.company)}</span>
          <span class="label">Sheet C-${pad2(index + 1)}</span>
        </div>
        <div class="grid cs-cover__grid">
          <div class="cs-cover__text">
            <p class="label">${esc(p.category)} · ${esc(p.sector)}</p>
            <h1 class="display cs-title" id="cs-title">${esc(p.name)}</h1>
            <p class="lead cs-summary">${esc(p.summary)}</p>
            <div class="cs-cover__metric">
              <span class="cs-cover__num">${esc(p.metric.prefix)}${p.metric.value}${esc(p.metric.suffix)}</span>
              <span class="label">${esc(p.metric.label)}</span>
            </div>
            ${figma ? `<div class="cs-cover__actions">${figma}</div>` : ""}
          </div>
        </div>
        <div class="cs-cover__stage">
          <div class="cs-cover__img">${DK.projectImg(p, "ui", { eager: true, alt: `${p.name} final interface` })}</div>
        </div>
        <dl class="cs-meta">${metaRow}</dl>
      </div>
    </section>

    ${section("01", "overview", "Overview", `<div class="cs-sec__body lead">${paras(cs.overview)}
      <ul class="cs-points">${p.points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`)}

    ${section("02", "problem", "The problem", `<div class="cs-sec__body">${paras(cs.problem)}</div>`)}

    ${section("03", "research", "Research & insights", `<div class="cs-sec__body">${paras(cs.research)}</div>`)}

    ${section("04", "flow", "User flow", `
      <div class="cs-flow">
        <div class="cs-flow__text cs-sec__body">${paras(cs.flow)}</div>
        <figure class="cs-flow__fig">
          <div class="cs-flow__sticky">
            ${DK.projectImg(p, "flow")}
            <figcaption class="figcap mono"><span>Fig. ${pad2(index + 1)}.1 — ${esc(p.name)} user flow</span><button class="text-link cs-zoom" type="button" data-open="flow">Open full size</button></figcaption>
          </div>
        </figure>
      </div>`, "cs-sec--flow")}

    ${section("05", "wireframes", "Wireframes", `
      <div class="cs-sec__body">${paras(cs.wireframes)}</div>
      <figure class="cs-wide">
        ${DK.projectImg(p, "wireframe")}
        <figcaption class="figcap mono"><span>Fig. ${pad2(index + 1)}.2 — Low-fidelity wireframes</span><button class="text-link cs-zoom" type="button" data-open="wireframe">Open full size</button></figcaption>
      </figure>`)}

    ${section("06", "final-ui", "Final UI", `
      <div class="cs-sec__body">${paras(cs.finalUI)}</div>
      <figure class="cs-wide">
        <div class="compare" style="--pos:50%">
          ${DK.projectImg(p, "ui", { cls: "compare__img", alt: `${p.name} final UI` })}
          <div class="compare__over">${DK.projectImg(p, "wireframe", { cls: "compare__img", alt: `${p.name} wireframe` })}</div>
          <span class="compare__tag compare__tag--l mono" aria-hidden="true">Wireframe</span>
          <span class="compare__tag compare__tag--r mono" aria-hidden="true">Final UI</span>
          <div class="compare__handle" role="slider" tabindex="0"
               aria-label="Compare wireframe and final UI" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
               aria-valuetext="50% wireframe, 50% final UI">
            <span class="compare__knob" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="m9 7-5 5 5 5M15 7l5 5-5 5"/></svg>
            </span>
          </div>
        </div>
        <figcaption class="figcap mono"><span>Fig. ${pad2(index + 1)}.3 — Wireframe ↔ final UI</span><span>Drag, or use ← → keys</span></figcaption>
      </figure>`)}

    ${section("07", "results", "Results", `<ul class="cs-results">${results}</ul>`)}

    ${section("08", "learned", "What I learned", `<div class="cs-sec__body lead">${paras(cs.learned)}</div>`)}

    <nav class="cs-next" aria-label="More work">
      <div class="wrap">
        <a class="cs-next__link" href="${next.slug}.html">
          <span class="label">Next project · ${pad2(((index + 1) % total) + 1)} / ${pad2(total)}</span>
          <span class="display cs-next__name">${esc(next.name)} ${icons.arrow}</span>
          <span class="label">${esc(next.category)} · ${esc(next.sector)}</span>
          <span class="cs-next__preview" aria-hidden="true">${DK.projectImg(next, "ui", { alt: "" })}</span>
        </a>
        <div class="cs-next__back">
          <a class="text-link" href="../index.html#work">← Back to all work</a>
          <a class="text-link" href="../index.html#contact">Get in touch</a>
        </div>
      </div>
    </nav>`;

  DK.renderFooter();

  /* ---------- full-size viewer for flow / wireframe ---------- */

  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-labelledby", "cs-lb-title");
  dlg.innerHTML = `
    <div class="lightbox__bar">
      <h2 class="lightbox__title" id="cs-lb-title"></h2>
      <button class="lightbox__close" type="button" aria-label="Close" style="margin-left:auto">${icons.close}</button>
    </div>
    <div class="lightbox__panel" tabindex="0"></div>
    <div class="lightbox__foot mono"><span class="label">Esc closes</span></div>`;
  document.body.append(dlg);
  let opener = null;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    opener = b;
    const kind = b.dataset.open;
    $("#cs-lb-title", dlg).textContent = `${p.name} · ${kind === "flow" ? "User flow" : "Wireframes"}`;
    $(".lightbox__panel", dlg).innerHTML = DK.projectImg(p, kind, { eager: true });
    dlg.showModal();
    DK.lenis && DK.lenis.stop();
    $(".lightbox__close", dlg).focus();
  });
  $(".lightbox__close", dlg).addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => DK.trapFocus(dlg, e));
  dlg.addEventListener("close", () => { DK.lenis && DK.lenis.start(); opener && opener.focus(); });

  /* ---------- before / after slider ---------- */

  function initCompare(root) {
    const handle = $(".compare__handle", root);
    let pos = 50;
    const set = (v) => {
      pos = Math.max(0, Math.min(100, v));
      root.style.setProperty("--pos", pos + "%");
      const r = Math.round(pos);
      handle.setAttribute("aria-valuenow", String(r));
      handle.setAttribute("aria-valuetext", `${r}% wireframe, ${100 - r}% final UI`);
    };
    const fromX = (x) => {
      const b = root.getBoundingClientRect();
      set(((x - b.left) / b.width) * 100);
    };
    let dragging = false;
    root.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      root.setPointerCapture(e.pointerId);
      root.classList.add("is-dragging");
      // On touch, wait for horizontal movement so a vertical swipe still scrolls the page.
      if (e.pointerType !== "touch") fromX(e.clientX);
      handle.focus({ preventScroll: true });
    });
    root.addEventListener("pointermove", (e) => { if (dragging) fromX(e.clientX); });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-dragging");
      if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    };
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);
    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 10 : 2;
      const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -10, PageUp: 10 };
      if (e.key in map) { e.preventDefault(); set(pos + map[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); set(0); }
      else if (e.key === "End") { e.preventDefault(); set(100); }
    });
    set(50);
  }
  $$(".compare").forEach(initCompare);

  /* ---------- next-project hover preview ---------- */

  const nextLink = $(".cs-next__link");
  nextLink.addEventListener("pointermove", (e) => {
    const b = nextLink.getBoundingClientRect();
    nextLink.style.setProperty("--mx", ((e.clientX - b.left) / b.width).toFixed(3));
    nextLink.style.setProperty("--my", ((e.clientY - b.top) / b.height).toFixed(3));
  });

  /* ---------- counters & motion ---------- */

  $$("[data-count]").forEach((el) =>
    DK.countUp(el, +el.dataset.count, { prefix: el.dataset.prefix, suffix: el.dataset.suffix }));

  if (motion) {
    gsap.fromTo(".cs-cover__img",
      { rotateX: 32, rotateZ: -7, scale: 0.9, y: 40, transformPerspective: 1600 },
      {
        rotateX: 0, rotateZ: 0, scale: 1, y: 0, ease: "none",
        scrollTrigger: { trigger: ".cs-cover__stage", start: "top 95%", end: "center 55%", scrub: 0.6 }
      });
    gsap.from(".cs-cover__text > *", { y: 32, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.08, delay: 0.1 });
    $$(".cs-sec__head, .cs-sec__body, .cs-wide, .cs-results").forEach((el) => el.classList.add("reveal"));
    DK.initReveals();

    // Images without fixed boxes change height when they load.
    let t;
    $$("main img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); }, { once: true });
    });
  }

  DK.scrollToHash();
})();
