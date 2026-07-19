/* ============================================================
   Homepage hero — scroll-scrubbed leveraged recap build
   GSAP + ScrollTrigger (CDN). Scrubbed and reversible: the
   timeline is driven by scroll position, so scrolling up
   rewinds every stage. Falls back to a static end-state for
   prefers-reduced-motion / no GSAP, and to staged fade-ins
   on small screens.
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG — real figures from the Costco recap deck
   ("Costco ($COST): The Case for a Levered Recapitalization").
   ------------------------------------------------------------ */
const HERO_CONFIG = {
  newDebtBillions: 5.0,      // $5B IG notes, 5.5% coupon
  waccBeforePct: 7.79,
  waccAfterPct: 6.7,         // ≈, at the deck's illustrative 80/20 structure
  epsBefore: 18.25,          // $ per share
  epsAfter: 17.99,           // −1.43% — dilutive, not accretive
  takeaway: "The math supports it. The culture won't.",

  // Bar geometry. Dollar labels are actual ($444B equity, $7B existing
  // debt, $5B new); the equity segment is axis-break compressed so the
  // debt tranches are legible — the ⓘ tooltip on the axis explains it.
  newDebtBarPct: 18,
};

(function () {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const els = {
    captions: hero.querySelectorAll(".caption"),
    takeaway: hero.querySelector(".hero-takeaway"),
    newSeg: hero.querySelector(".seg-new"),
    callout: document.getElementById("callout"),
    stats: hero.querySelectorAll(".stat"),
    vDebt: document.getElementById("v-debt"),
    vWacc: document.getElementById("v-wacc"),
    vEps: document.getElementById("v-eps"),
    cue: hero.querySelector(".scroll-cue"),
    viz: hero.querySelector(".hero-viz"),
    copy: hero.querySelector(".hero-copy"),
  };

  els.takeaway.textContent = HERO_CONFIG.takeaway;

  const fmtDebt = (n) => "$" + n.toFixed(1) + "B";
  const waccBefore = HERO_CONFIG.waccBeforePct.toFixed(2) + "%";
  const fmtWacc = (n) => waccBefore + " → ≈" + n.toFixed(1) + "%";
  const epsBefore = "$" + HERO_CONFIG.epsBefore.toFixed(2);
  const fmtEps = (n) => epsBefore + " → $" + n.toFixed(2);
  const barPct = HERO_CONFIG.newDebtBarPct + "%";

  // The static HTML already carries the final values (for no-JS);
  // this just re-asserts them for the fallback modes.
  function setFinalNumbers() {
    els.vDebt.textContent = fmtDebt(HERO_CONFIG.newDebtBillions);
    els.vWacc.textContent = fmtWacc(HERO_CONFIG.waccAfterPct);
    els.vEps.textContent = fmtEps(HERO_CONFIG.epsAfter);
  }

  /* ---------- Fallback 1: static end-state ---------- */
  function staticMode() {
    hero.classList.add("hero-static");
    els.newSeg.style.height = barPct;
    setFinalNumbers();
  }

  /* ---------- Fallback 2: simplified mobile (staged fade-ins) ---------- */
  function simpleMode() {
    hero.classList.add("hero-simple");
    setFinalNumbers();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target === els.viz) {
            els.newSeg.style.height = barPct; // CSS-transitioned growth
          }
          io.unobserve(e.target);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(els.viz);
    io.observe(els.copy);
  }

  /* ---------- Full mode: pinned, scroll-scrubbed GSAP timeline ---------- */
  function scrubMode() {
    gsap.registerPlugin(ScrollTrigger);

    // Start the counters at their pre-recap values.
    const counters = {
      debt: 0,
      wacc: HERO_CONFIG.waccBeforePct,
      eps: HERO_CONFIG.epsBefore,
    };
    els.vDebt.textContent = fmtDebt(0);
    els.vWacc.textContent = waccBefore;
    els.vEps.textContent = epsBefore;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=150%",   // hero pins for ~150vh of scroll
        scrub: true,      // tied to scroll position → reversible
        pin: true,
      },
    });

    const caption = (i) => els.captions[i];
    const stat = (i) => els.stats[i];

    tl
      // Stage 1 → 2: swap caption; debt tranche grows from the baseline
      // while the $ counter ticks $0 → $5.0B.
      .to(caption(0), { opacity: 0, duration: 0.08 }, 0.1)
      .to(caption(1), { opacity: 1, duration: 0.08 }, 0.18)
      .to(els.newSeg, { height: barPct, duration: 0.3 }, 0.18)
      .to(stat(0), { opacity: 1, y: 0, duration: 0.1 }, 0.2)
      .to(
        counters,
        {
          debt: HERO_CONFIG.newDebtBillions,
          duration: 0.3,
          onUpdate: () => (els.vDebt.textContent = fmtDebt(counters.debt)),
        },
        0.18
      )
      // Annotation callout appears once the tranche is fully grown.
      .to(els.callout, { opacity: 1, duration: 0.08 }, 0.46)

      // Stage 3: WACC ticks down 7.79% → ≈6.7%.
      .to(caption(1), { opacity: 0, duration: 0.08 }, 0.5)
      .to(caption(2), { opacity: 1, duration: 0.08 }, 0.58)
      .to(stat(1), { opacity: 1, y: 0, duration: 0.1 }, 0.58)
      .to(
        counters,
        {
          wacc: HERO_CONFIG.waccAfterPct,
          duration: 0.12,
          onUpdate: () => (els.vWacc.textContent = fmtWacc(counters.wacc)),
        },
        0.58
      )

      // Stage 4: EPS ticks DOWN $18.25 → $17.99 — dilution, labeled as such.
      .to(caption(2), { opacity: 0, duration: 0.08 }, 0.7)
      .to(caption(3), { opacity: 1, duration: 0.08 }, 0.78)
      .to(stat(2), { opacity: 1, y: 0, duration: 0.1 }, 0.78)
      .to(
        counters,
        {
          eps: HERO_CONFIG.epsAfter,
          duration: 0.12,
          onUpdate: () => (els.vEps.textContent = fmtEps(counters.eps)),
        },
        0.78
      )

      // Stage 5: pinned resting state + takeaway.
      .to(els.takeaway, { opacity: 1, duration: 0.1 }, 0.92)
      .to(els.cue, { opacity: 0, duration: 0.1 }, 0.15);
  }

  /* ---------- Mode selection ---------- */
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const smallScreen = window.matchMedia("(max-width: 860px)").matches;
  const gsapReady = !!(window.gsap && window.ScrollTrigger);

  if (reducedMotion || !gsapReady) staticMode();
  else if (smallScreen) simpleMode();
  else scrubMode();
})();
